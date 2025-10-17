import re
import spacy
import nltk
from datetime import datetime
from dateutil import parser as date_parser
import logging
from typing import Dict, List, Optional, Tuple
import json

logger = logging.getLogger(__name__)

class ResumeParser:
    def __init__(self):
        """Initialize the resume parser with NLP models and skill datasets"""
        try:
            # Load spaCy model
            self.nlp = spacy.load("en_core_web_sm")
            logger.info("spaCy model loaded successfully")
        except OSError:
            logger.error("spaCy model not found. Please install with: python -m spacy download en_core_web_sm")
            self.nlp = None
        
        # Initialize skill keywords (you can expand this list)
        self.skill_keywords = self._load_skill_keywords()
        
        # Initialize patterns
        self.email_pattern = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b')
        self.phone_pattern = re.compile(r'(\+\d{1,3}[-.\s]?)?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}')
        self.linkedin_pattern = re.compile(r'linkedin\.com/in/[\w-]+', re.IGNORECASE)
        self.github_pattern = re.compile(r'github\.com/[\w-]+', re.IGNORECASE)
        
    def _load_skill_keywords(self) -> List[str]:
        """Load programming languages, frameworks, and technical skills"""
        skills = [
            # Programming Languages
            'Python', 'JavaScript', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust',
            'Swift', 'Kotlin', 'TypeScript', 'Scala', 'R', 'MATLAB', 'Perl', 'Shell',
            'PowerShell', 'Bash', 'SQL', 'HTML', 'CSS', 'XML', 'JSON',
            
            # Web Technologies
            'React', 'Angular', 'Vue.js', 'Node.js', 'Express.js', 'Django', 'Flask',
            'Spring', 'Laravel', 'Bootstrap', 'jQuery', 'SASS', 'LESS', 'Webpack',
            'Babel', 'Next.js', 'Nuxt.js', 'Svelte', 'Gatsby',
            
            # Databases
            'MySQL', 'PostgreSQL', 'MongoDB', 'SQLite', 'Oracle', 'SQL Server',
            'Redis', 'Cassandra', 'DynamoDB', 'Neo4j', 'Elasticsearch',
            
            # Cloud & DevOps
            'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins',
            'GitLab CI/CD', 'GitHub Actions', 'Terraform', 'Ansible', 'Chef',
            'Puppet', 'Vagrant', 'CI/CD', 'DevOps',
            
            # Mobile Development
            'React Native', 'Flutter', 'Xamarin', 'Ionic', 'Cordova', 'PhoneGap',
            'Android Studio', 'Xcode', 'iOS Development', 'Android Development',
            
            # Data Science & AI
            'Machine Learning', 'Deep Learning', 'Neural Networks', 'TensorFlow',
            'PyTorch', 'Keras', 'Scikit-learn', 'Pandas', 'NumPy', 'Matplotlib',
            'Seaborn', 'Jupyter', 'Apache Spark', 'Hadoop', 'Tableau', 'Power BI',
            'Data Analysis', 'Data Science', 'Artificial Intelligence', 'NLP',
            'Computer Vision', 'OpenCV',
            
            # Other Technical Skills
            'Git', 'SVN', 'Mercurial', 'Agile', 'Scrum', 'JIRA', 'Confluence',
            'Slack', 'Teams', 'Zoom', 'RESTful APIs', 'GraphQL', 'Microservices',
            'SOA', 'Design Patterns', 'OOP', 'Functional Programming', 'TDD',
            'Unit Testing', 'Integration Testing', 'Selenium', 'Jest', 'Mocha',
            
            # Business & Soft Skills
            'Project Management', 'Team Leadership', 'Communication', 'Problem Solving',
            'Analytical Thinking', 'Customer Service', 'Sales', 'Marketing',
            'Business Analysis', 'Requirements Gathering', 'Stakeholder Management'
        ]
        
        # Convert to lowercase for case-insensitive matching
        return [skill.lower() for skill in skills]
    
    def parse(self, text: str, file_path: str = None) -> Dict:
        """
        Main parsing function that extracts all resume information
        
        Args:
            text: Extracted text from resume
            file_path: Path to the resume file
            
        Returns:
            Dictionary containing parsed resume data
        """
        try:
            # Basic information extraction
            personal_info = self._extract_personal_info(text)
            
            # Skills extraction
            skills = self._extract_skills(text)
            
            # Experience extraction
            experience = self._extract_experience(text)
            
            # Education extraction
            education = self._extract_education(text)
            
            # Certifications extraction
            certifications = self._extract_certifications(text)
            
            # Languages extraction
            languages = self._extract_languages(text)
            
            # Summary/Objective extraction
            summary = self._extract_summary(text)
            
            # Calculate total experience
            total_experience = self._calculate_total_experience(experience)
            
            return {
                'personal_info': personal_info,
                'skills': skills,
                'experience': experience,
                'education': education,
                'certifications': certifications,
                'languages': languages,
                'summary': summary,
                'total_experience': total_experience,
                'raw_text': text[:1000] if text else None  # First 1000 chars for reference
            }
            
        except Exception as error:
            logger.error(f"Error parsing resume: {str(error)}")
            raise error
    
    def _extract_personal_info(self, text: str) -> Dict:
        """Extract personal information like name, email, phone, etc."""
        info = {}
        
        try:
            # Extract email
            email_matches = self.email_pattern.findall(text)
            info['email'] = email_matches[0] if email_matches else None
            
            # Extract phone numbers
            phone_matches = self.phone_pattern.findall(text)
            info['phone'] = phone_matches[0] if phone_matches else None
            
            # Extract LinkedIn profile
            linkedin_matches = self.linkedin_pattern.findall(text)
            info['linkedin'] = f"https://{linkedin_matches[0]}" if linkedin_matches else None
            
            # Extract GitHub profile
            github_matches = self.github_pattern.findall(text)
            info['github'] = f"https://{github_matches[0]}" if github_matches else None
            
            # Extract name (first few words, excluding common resume keywords)
            lines = text.strip().split('\n')
            name_candidates = []
            
            for line in lines[:10]:  # Check first 10 lines
                line = line.strip()
                if len(line) > 2 and not any(keyword in line.lower() for keyword in 
                    ['resume', 'cv', 'curriculum vitae', 'email', 'phone', 'address', '@']):
                    # Check if it looks like a name (2-4 words, mostly alphabetic)
                    words = line.split()
                    if 2 <= len(words) <= 4 and all(word.replace('.', '').isalpha() for word in words):
                        name_candidates.append(line)
            
            info['name'] = name_candidates[0] if name_candidates else None
            
        except Exception as e:
            logger.error(f"Error extracting personal info: {str(e)}")
        
        return info
    
    def _extract_skills(self, text: str) -> List[str]:
        """Extract technical and professional skills"""
        skills_found = []
        text_lower = text.lower()
        
        try:
            # Find skills from predefined list
            for skill in self.skill_keywords:
                if skill in text_lower:
                    # Check for whole word match to avoid partial matches
                    pattern = r'\b' + re.escape(skill) + r'\b'
                    if re.search(pattern, text_lower):
                        skills_found.append(skill.title())
            
            # Look for skills in specific sections
            skills_section_patterns = [
                r'(?:skills?|technical skills?|core competencies)[:\-\s]*(.*?)(?:\n\s*\n|\n[A-Z])',
                r'(?:technologies?|tools?)[:\-\s]*(.*?)(?:\n\s*\n|\n[A-Z])',
                r'(?:programming languages?)[:\-\s]*(.*?)(?:\n\s*\n|\n[A-Z])'
            ]
            
            for pattern in skills_section_patterns:
                matches = re.finditer(pattern, text, re.IGNORECASE | re.DOTALL)
                for match in matches:
                    skills_text = match.group(1)
                    # Extract individual skills from the section
                    extracted_skills = self._parse_skills_from_text(skills_text)
                    skills_found.extend(extracted_skills)
            
            # Remove duplicates and return
            return list(set(skills_found))
            
        except Exception as e:
            logger.error(f"Error extracting skills: {str(e)}")
            return skills_found
    
    def _parse_skills_from_text(self, text: str) -> List[str]:
        """Parse skills from a specific text section"""
        skills = []
        
        # Split by common delimiters
        delimiters = [',', '•', '◦', '▪', '\n', '|', ';']
        
        for delimiter in delimiters:
            if delimiter in text:
                parts = text.split(delimiter)
                for part in parts:
                    skill = part.strip().strip('.,')
                    if len(skill) > 1 and len(skill) < 30:  # Reasonable skill length
                        skills.append(skill.title())
                break
        
        return skills
    
    def _extract_experience(self, text: str) -> List[Dict]:
        """Extract work experience information"""
        experience = []
        
        try:
            # Look for experience section
            exp_patterns = [
                r'(?:work\s+)?experience[:\-\s]*(.*?)(?=\n\s*(?:education|skills|projects|certifications)|$)',
                r'(?:professional\s+)?(?:work\s+)?(?:employment\s+)?history[:\-\s]*(.*?)(?=\n\s*(?:education|skills|projects|certifications)|$)',
                r'career\s+(?:summary|history)[:\-\s]*(.*?)(?=\n\s*(?:education|skills|projects|certifications)|$)'
            ]
            
            exp_text = ""
            for pattern in exp_patterns:
                match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
                if match:
                    exp_text = match.group(1)
                    break
            
            if exp_text:
                # Parse individual experience entries
                experience_entries = self._parse_experience_entries(exp_text)
                experience.extend(experience_entries)
            
        except Exception as e:
            logger.error(f"Error extracting experience: {str(e)}")
        
        return experience
    
    def _parse_experience_entries(self, text: str) -> List[Dict]:
        """Parse individual experience entries"""
        entries = []
        
        # Split text into potential job entries
        lines = text.strip().split('\n')
        current_entry = {}
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # Check if line contains dates (potential job duration)
            date_match = re.search(r'(\d{4})\s*[-–—]\s*(\d{4}|present|current)', line, re.IGNORECASE)
            if date_match:
                if current_entry:
                    entries.append(current_entry)
                
                current_entry = {
                    'company': '',
                    'position': '',
                    'start_date': None,
                    'end_date': None,
                    'is_current': False,
                    'description': ''
                }
                
                # Extract dates
                start_year = date_match.group(1)
                end_year = date_match.group(2)
                
                current_entry['start_date'] = f"{start_year}-01-01"
                if end_year.lower() in ['present', 'current']:
                    current_entry['is_current'] = True
                    current_entry['end_date'] = None
                else:
                    current_entry['end_date'] = f"{end_year}-12-31"
                
                # Try to extract company and position from the same line
                line_without_dates = re.sub(r'\d{4}\s*[-–—]\s*(?:\d{4}|present|current)', '', line, flags=re.IGNORECASE)
                parts = [part.strip() for part in line_without_dates.split('|') if part.strip()]
                
                if len(parts) >= 2:
                    current_entry['position'] = parts[0]
                    current_entry['company'] = parts[1]
                elif len(parts) == 1:
                    # Try to determine if it's company or position
                    if any(keyword in parts[0].lower() for keyword in ['inc', 'corp', 'ltd', 'llc', 'company']):
                        current_entry['company'] = parts[0]
                    else:
                        current_entry['position'] = parts[0]
            
            elif current_entry and line:
                # Add to description if we have a current entry
                if current_entry['description']:
                    current_entry['description'] += ' ' + line
                else:
                    current_entry['description'] = line
        
        # Don't forget the last entry
        if current_entry:
            entries.append(current_entry)
        
        return entries
    
    def _extract_education(self, text: str) -> List[Dict]:
        """Extract education information"""
        education = []
        
        try:
            # Look for education section
            edu_patterns = [
                r'education[:\-\s]*(.*?)(?=\n\s*(?:experience|skills|projects|certifications)|$)',
                r'academic\s+(?:background|qualifications?)[:\-\s]*(.*?)(?=\n\s*(?:experience|skills|projects|certifications)|$)',
                r'qualifications?[:\-\s]*(.*?)(?=\n\s*(?:experience|skills|projects|certifications)|$)'
            ]
            
            edu_text = ""
            for pattern in edu_patterns:
                match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
                if match:
                    edu_text = match.group(1)
                    break
            
            if edu_text:
                education_entries = self._parse_education_entries(edu_text)
                education.extend(education_entries)
                
        except Exception as e:
            logger.error(f"Error extracting education: {str(e)}")
        
        return education
    
    def _parse_education_entries(self, text: str) -> List[Dict]:
        """Parse individual education entries"""
        entries = []
        
        # Common degree patterns
        degree_patterns = [
            r'(?:bachelor|master|phd|doctorate|associate|diploma|certificate).*?(?:in|of)\s+([^,\n]+)',
            r'(b\.?s\.?|m\.?s\.?|m\.?a\.?|b\.?a\.?|ph\.?d\.?|m\.?b\.?a\.?)\s+(?:in\s+)?([^,\n]+)',
        ]
        
        lines = text.strip().split('\n')
        
        for line in lines:
            line = line.strip()
            if len(line) < 5:  # Skip very short lines
                continue
            
            entry = {
                'institution': '',
                'degree': '',
                'field_of_study': '',
                'start_date': None,
                'end_date': None,
                'grade': None
            }
            
            # Look for degree information
            for pattern in degree_patterns:
                match = re.search(pattern, line, re.IGNORECASE)
                if match:
                    if len(match.groups()) == 1:
                        entry['field_of_study'] = match.group(1).strip()
                    else:
                        entry['degree'] = match.group(1).strip()
                        entry['field_of_study'] = match.group(2).strip()
                    break
            
            # Extract year information
            year_matches = re.findall(r'\b(19|20)\d{2}\b', line)
            if year_matches:
                if len(year_matches) >= 2:
                    entry['start_date'] = f"{year_matches[0]}-01-01"
                    entry['end_date'] = f"{year_matches[-1]}-12-31"
                else:
                    entry['end_date'] = f"{year_matches[0]}-12-31"
            
            # Try to extract institution name
            # Remove degree and year information to get institution
            clean_line = line
            for pattern in degree_patterns:
                clean_line = re.sub(pattern, '', clean_line, flags=re.IGNORECASE)
            
            # Remove years
            clean_line = re.sub(r'\b(19|20)\d{2}\b', '', clean_line)
            
            # Clean up and extract institution
            institution_parts = [part.strip() for part in clean_line.split(',') if part.strip()]
            if institution_parts:
                entry['institution'] = institution_parts[0]
            
            if entry['institution'] or entry['degree'] or entry['field_of_study']:
                entries.append(entry)
        
        return entries
    
    def _extract_certifications(self, text: str) -> List[Dict]:
        """Extract certifications information"""
        certifications = []
        
        try:
            # Look for certifications section
            cert_patterns = [
                r'certifications?[:\-\s]*(.*?)(?=\n\s*(?:experience|education|skills|projects)|$)',
                r'licenses?\s+(?:and\s+)?certifications?[:\-\s]*(.*?)(?=\n\s*(?:experience|education|skills|projects)|$)',
                r'professional\s+certifications?[:\-\s]*(.*?)(?=\n\s*(?:experience|education|skills|projects)|$)'
            ]
            
            cert_text = ""
            for pattern in cert_patterns:
                match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
                if match:
                    cert_text = match.group(1)
                    break
            
            if cert_text:
                cert_entries = self._parse_certification_entries(cert_text)
                certifications.extend(cert_entries)
                
        except Exception as e:
            logger.error(f"Error extracting certifications: {str(e)}")
        
        return certifications
    
    def _parse_certification_entries(self, text: str) -> List[Dict]:
        """Parse individual certification entries"""
        entries = []
        
        lines = text.strip().split('\n')
        
        for line in lines:
            line = line.strip()
            if len(line) < 3:
                continue
            
            entry = {
                'name': '',
                'issuer': '',
                'issue_date': None,
                'expiry_date': None,
                'credential_id': None
            }
            
            # Extract year information
            year_matches = re.findall(r'\b(19|20)\d{2}\b', line)
            if year_matches:
                entry['issue_date'] = f"{year_matches[0]}-01-01"
            
            # Remove year and extract certification name and issuer
            clean_line = re.sub(r'\b(19|20)\d{2}\b', '', line)
            
            # Try to split by common delimiters to separate name and issuer
            for delimiter in [' - ', ' | ', ' from ', ' by ', ', ']:
                if delimiter in clean_line:
                    parts = clean_line.split(delimiter, 1)
                    if len(parts) == 2:
                        entry['name'] = parts[0].strip()
                        entry['issuer'] = parts[1].strip()
                        break
            
            if not entry['name']:
                entry['name'] = clean_line.strip()
            
            if entry['name']:
                entries.append(entry)
        
        return entries
    
    def _extract_languages(self, text: str) -> List[Dict]:
        """Extract languages information"""
        languages = []
        
        try:
            # Look for languages section
            lang_patterns = [
                r'languages?[:\-\s]*(.*?)(?=\n\s*(?:experience|education|skills|projects|certifications)|$)',
                r'linguistic?\s+(?:skills?|abilities?)[:\-\s]*(.*?)(?=\n\s*(?:experience|education|skills|projects|certifications)|$)'
            ]
            
            lang_text = ""
            for pattern in lang_patterns:
                match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
                if match:
                    lang_text = match.group(1)
                    break
            
            if lang_text:
                lang_entries = self._parse_language_entries(lang_text)
                languages.extend(lang_entries)
                
        except Exception as e:
            logger.error(f"Error extracting languages: {str(e)}")
        
        return languages
    
    def _parse_language_entries(self, text: str) -> List[Dict]:
        """Parse individual language entries"""
        entries = []
        
        # Common proficiency levels
        proficiency_keywords = {
            'native': 'native',
            'fluent': 'advanced',
            'advanced': 'advanced',
            'intermediate': 'intermediate',
            'basic': 'beginner',
            'beginner': 'beginner',
            'conversational': 'intermediate'
        }
        
        lines = text.strip().split('\n')
        
        for line in lines:
            line = line.strip()
            if len(line) < 2:
                continue
            
            entry = {
                'language': '',
                'proficiency': 'intermediate'  # default
            }
            
            # Check for proficiency indicators
            line_lower = line.lower()
            for keyword, level in proficiency_keywords.items():
                if keyword in line_lower:
                    entry['proficiency'] = level
                    # Remove proficiency keyword to get language name
                    line = re.sub(r'\b' + keyword + r'\b', '', line, flags=re.IGNORECASE).strip()
                    break
            
            # Clean up the language name
            language = re.sub(r'[^\w\s]', '', line).strip()
            if language:
                entry['language'] = language.title()
                entries.append(entry)
        
        return entries
    
    def _extract_summary(self, text: str) -> str:
        """Extract professional summary or objective"""
        summary = ""
        
        try:
            # Look for summary section
            summary_patterns = [
                r'(?:professional\s+)?summary[:\-\s]*(.*?)(?=\n\s*(?:experience|education|skills|projects)|$)',
                r'(?:career\s+)?objective[:\-\s]*(.*?)(?=\n\s*(?:experience|education|skills|projects)|$)',
                r'(?:professional\s+)?profile[:\-\s]*(.*?)(?=\n\s*(?:experience|education|skills|projects)|$)',
                r'about\s+(?:me|myself)[:\-\s]*(.*?)(?=\n\s*(?:experience|education|skills|projects)|$)'
            ]
            
            for pattern in summary_patterns:
                match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
                if match:
                    summary = match.group(1).strip()
                    # Clean up the summary
                    summary = ' '.join(summary.split())  # Remove extra whitespace
                    break
            
        except Exception as e:
            logger.error(f"Error extracting summary: {str(e)}")
        
        return summary
    
    def _calculate_total_experience(self, experience: List[Dict]) -> float:
        """Calculate total years of experience"""
        total_months = 0
        
        try:
            for exp in experience:
                if exp.get('start_date'):
                    start_date = date_parser.parse(exp['start_date'])
                    
                    if exp.get('is_current', False) or not exp.get('end_date'):
                        end_date = datetime.now()
                    else:
                        end_date = date_parser.parse(exp['end_date'])
                    
                    # Calculate months between dates
                    months = (end_date.year - start_date.year) * 12 + (end_date.month - start_date.month)
                    total_months += max(0, months)  # Ensure non-negative
            
        except Exception as e:
            logger.error(f"Error calculating total experience: {str(e)}")
        
        return round(total_months / 12, 1)  # Convert to years with 1 decimal place
    
    def extract_skills(self, text: str) -> List[str]:
        """Public method to extract skills from text"""
        return self._extract_skills(text)
    
    def calculate_job_match(self, resume_data: Dict, job_requirements: Dict) -> Dict:
        """
        Calculate matching score between resume and job requirements
        
        Args:
            resume_data: Parsed resume data
            job_requirements: Job requirements including skills, experience, etc.
            
        Returns:
            Dictionary with matching scores and breakdown
        """
        try:
            # Initialize scores
            skills_score = 0
            experience_score = 0
            education_score = 0
            overall_score = 0
            
            # Skills matching
            if 'skills' in resume_data and 'required_skills' in job_requirements:
                resume_skills = [skill.lower() for skill in resume_data['skills']]
                required_skills = [skill.lower() for skill in job_requirements['required_skills']]
                
                if required_skills:
                    matched_skills = [skill for skill in required_skills if any(
                        skill in resume_skill or resume_skill in skill 
                        for resume_skill in resume_skills
                    )]
                    skills_score = (len(matched_skills) / len(required_skills)) * 100
            
            # Experience matching
            if 'total_experience' in resume_data and 'min_experience' in job_requirements:
                candidate_exp = resume_data.get('total_experience', 0)
                required_exp = job_requirements.get('min_experience', 0)
                
                if required_exp == 0:
                    experience_score = 100
                elif candidate_exp >= required_exp:
                    experience_score = 100
                else:
                    experience_score = (candidate_exp / required_exp) * 100
            
            # Education matching (simplified)
            if 'education' in resume_data and job_requirements.get('education_required', False):
                if resume_data['education']:
                    education_score = 100
                else:
                    education_score = 0
            else:
                education_score = 100  # Not required
            
            # Calculate overall score (weighted average)
            weights = {
                'skills': 0.5,      # 50% weight
                'experience': 0.3,   # 30% weight
                'education': 0.2     # 20% weight
            }
            
            overall_score = (
                skills_score * weights['skills'] +
                experience_score * weights['experience'] +
                education_score * weights['education']
            )
            
            return {
                'overall_score': round(overall_score, 1),
                'breakdown': {
                    'skills': round(skills_score, 1),
                    'experience': round(experience_score, 1),
                    'education': round(education_score, 1)
                },
                'matched_skills': [skill for skill in job_requirements.get('required_skills', []) 
                                 if any(skill.lower() in resume_skill.lower() 
                                       for resume_skill in resume_data.get('skills', []))],
                'missing_skills': [skill for skill in job_requirements.get('required_skills', [])
                                 if not any(skill.lower() in resume_skill.lower() 
                                           for resume_skill in resume_data.get('skills', []))],
                'recommendation': self._get_match_recommendation(overall_score)
            }
            
        except Exception as e:
            logger.error(f"Error calculating job match: {str(e)}")
            return {
                'overall_score': 0,
                'breakdown': {'skills': 0, 'experience': 0, 'education': 0},
                'matched_skills': [],
                'missing_skills': [],
                'recommendation': 'Unable to calculate match'
            }
    
    def _get_match_recommendation(self, score: float) -> str:
        """Get recommendation based on matching score"""
        if score >= 80:
            return 'Excellent match - Highly recommended'
        elif score >= 60:
            return 'Good match - Recommended'
        elif score >= 40:
            return 'Moderate match - Consider with additional evaluation'
        elif score >= 20:
            return 'Low match - May require additional training'
        else:
            return 'Poor match - Not recommended'