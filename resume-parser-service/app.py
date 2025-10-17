from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import logging
from werkzeug.utils import secure_filename
from datetime import datetime
import tempfile
import shutil
from pathlib import Path

# Import parsing modules
from parsers.resume_parser import ResumeParser
from utils.file_handler import FileHandler
from utils.data_cleaner import DataCleaner

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/resume_parser.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10MB max file size
app.config['UPLOAD_FOLDER'] = 'temp_uploads'
app.config['ALLOWED_EXTENSIONS'] = {'pdf', 'doc', 'docx'}

# Create necessary directories
os.makedirs('logs', exist_ok=True)
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Initialize parsers and utilities
resume_parser = ResumeParser()
file_handler = FileHandler()
data_cleaner = DataCleaner()

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

@app.route('/', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Resume Parser Service',
        'version': '1.0.0',
        'timestamp': datetime.now().isoformat()
    }), 200

@app.route('/api/parse-resume', methods=['POST'])
def parse_resume():
    """
    Parse resume from uploaded file
    
    Expected form data:
    - file: Resume file (PDF, DOC, DOCX)
    - user_id: User ID (optional)
    - job_id: Job ID for matching (optional)
    
    Returns:
    - Parsed resume data in structured format
    """
    try:
        # Check if file is present
        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'message': 'No file provided'
            }), 400
        
        file = request.files['file']
        user_id = request.form.get('user_id')
        job_id = request.form.get('job_id')
        
        # Check if file is selected
        if file.filename == '':
            return jsonify({
                'success': False,
                'message': 'No file selected'
            }), 400
        
        # Check file extension
        if not allowed_file(file.filename):
            return jsonify({
                'success': False,
                'message': 'Invalid file format. Only PDF, DOC, and DOCX are allowed.'
            }), 400
        
        # Secure filename and save temporarily
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        temp_filename = f"{timestamp}_{filename}"
        temp_filepath = os.path.join(app.config['UPLOAD_FOLDER'], temp_filename)
        
        # Save uploaded file
        file.save(temp_filepath)
        logger.info(f"File uploaded: {temp_filename}")
        
        try:
            # Extract text from file
            extracted_text = file_handler.extract_text(temp_filepath)
            
            if not extracted_text or len(extracted_text.strip()) < 50:
                return jsonify({
                    'success': False,
                    'message': 'Could not extract sufficient text from the resume. Please ensure the file is not corrupted or password-protected.'
                }), 400
            
            # Parse resume data
            parsed_data = resume_parser.parse(extracted_text, temp_filepath)
            
            # Clean and validate data
            cleaned_data = data_cleaner.clean_resume_data(parsed_data)
            
            # Add metadata
            result = {
                'success': True,
                'message': 'Resume parsed successfully',
                'data': {
                    'parsed_data': cleaned_data,
                    'metadata': {
                        'filename': filename,
                        'file_size': os.path.getsize(temp_filepath),
                        'processed_at': datetime.now().isoformat(),
                        'text_length': len(extracted_text),
                        'user_id': user_id,
                        'job_id': job_id
                    },
                    'parsing_stats': {
                        'skills_found': len(cleaned_data.get('skills', [])),
                        'experience_entries': len(cleaned_data.get('experience', [])),
                        'education_entries': len(cleaned_data.get('education', [])),
                        'certifications_found': len(cleaned_data.get('certifications', [])),
                        'languages_found': len(cleaned_data.get('languages', []))
                    }
                }
            }
            
            logger.info(f"Resume parsed successfully for user: {user_id}, file: {filename}")
            return jsonify(result), 200
            
        except Exception as parsing_error:
            logger.error(f"Error parsing resume: {str(parsing_error)}")
            return jsonify({
                'success': False,
                'message': f'Error parsing resume: {str(parsing_error)}'
            }), 500
            
        finally:
            # Clean up temporary file
            try:
                os.remove(temp_filepath)
                logger.info(f"Temporary file removed: {temp_filename}")
            except:
                pass
                
    except Exception as error:
        logger.error(f"Unexpected error in parse_resume: {str(error)}")
        return jsonify({
            'success': False,
            'message': 'Internal server error during resume parsing'
        }), 500

@app.route('/api/match-job', methods=['POST'])
def match_job():
    """
    Match resume data with job requirements
    
    Expected JSON payload:
    - resume_data: Parsed resume data
    - job_requirements: Job requirements and skills
    
    Returns:
    - Matching score and detailed breakdown
    """
    try:
        data = request.get_json()
        
        if not data or 'resume_data' not in data or 'job_requirements' not in data:
            return jsonify({
                'success': False,
                'message': 'Missing resume_data or job_requirements in request'
            }), 400
        
        resume_data = data['resume_data']
        job_requirements = data['job_requirements']
        
        # Calculate matching score
        matching_result = resume_parser.calculate_job_match(resume_data, job_requirements)
        
        logger.info(f"Job matching calculated with score: {matching_result.get('overall_score', 0)}")
        
        return jsonify({
            'success': True,
            'message': 'Job matching completed',
            'data': matching_result
        }), 200
        
    except Exception as error:
        logger.error(f"Error in job matching: {str(error)}")
        return jsonify({
            'success': False,
            'message': f'Error calculating job match: {str(error)}'
        }), 500

@app.route('/api/extract-skills', methods=['POST'])
def extract_skills():
    """
    Extract skills from text
    
    Expected JSON payload:
    - text: Text to extract skills from
    
    Returns:
    - List of extracted skills
    """
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({
                'success': False,
                'message': 'Missing text in request'
            }), 400
        
        text = data['text']
        
        # Extract skills
        skills = resume_parser.extract_skills(text)
        
        return jsonify({
            'success': True,
            'message': 'Skills extracted successfully',
            'data': {
                'skills': skills,
                'count': len(skills)
            }
        }), 200
        
    except Exception as error:
        logger.error(f"Error extracting skills: {str(error)}")
        return jsonify({
            'success': False,
            'message': f'Error extracting skills: {str(error)}'
        }), 500

@app.route('/api/supported-formats', methods=['GET'])
def supported_formats():
    """Get supported file formats"""
    return jsonify({
        'success': True,
        'data': {
            'formats': list(app.config['ALLOWED_EXTENSIONS']),
            'max_size': '10MB',
            'recommendations': [
                'PDF files provide the best parsing accuracy',
                'Ensure text is selectable (not scanned images)',
                'Avoid password-protected files',
                'Use standard resume formats for better results'
            ]
        }
    }), 200

@app.errorhandler(413)
def file_too_large(error):
    """Handle file too large error"""
    return jsonify({
        'success': False,
        'message': 'File too large. Maximum size allowed is 10MB.'
    }), 413

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        'success': False,
        'message': 'Endpoint not found'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle internal server errors"""
    logger.error(f"Internal server error: {str(error)}")
    return jsonify({
        'success': False,
        'message': 'Internal server error'
    }), 500

if __name__ == '__main__':
    # Download required NLTK data and spaCy model on first run
    try:
        import nltk
        import spacy
        
        # Download NLTK data
        nltk.download('punkt', quiet=True)
        nltk.download('stopwords', quiet=True)
        nltk.download('wordnet', quiet=True)
        
        # Load spaCy model (install with: python -m spacy download en_core_web_sm)
        nlp = spacy.load("en_core_web_sm")
        logger.info("NLP models loaded successfully")
        
    except Exception as e:
        logger.warning(f"Error loading NLP models: {e}")
        logger.warning("Please install required models:")
        logger.warning("python -m spacy download en_core_web_sm")
    
    # Run the application
    port = int(os.environ.get('PORT', 8000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    
    logger.info(f"Starting Resume Parser Service on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)