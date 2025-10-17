import os
import docx2txt
import PyPDF2
from pdfminer.high_level import extract_text
from pdfminer.pdfinterp import PDFResourceManager, PDFPageInterpreter
from pdfminer.converter import TextConverter
from pdfminer.layout import LAParams
from pdfminer.pdfpage import PDFPage
from io import StringIO
import logging

logger = logging.getLogger(__name__)

class FileHandler:
    """Handle file operations and text extraction from various file formats"""
    
    def __init__(self):
        self.supported_formats = ['pdf', 'docx', 'doc', 'txt']
    
    def extract_text(self, file_path: str) -> str:
        """
        Extract text from various file formats
        
        Args:
            file_path: Path to the file
            
        Returns:
            Extracted text content
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")
        
        # Get file extension
        _, extension = os.path.splitext(file_path)
        extension = extension.lower().lstrip('.')
        
        try:
            if extension == 'pdf':
                return self._extract_from_pdf(file_path)
            elif extension in ['docx', 'doc']:
                return self._extract_from_docx(file_path)
            elif extension == 'txt':
                return self._extract_from_txt(file_path)
            else:
                raise ValueError(f"Unsupported file format: {extension}")
                
        except Exception as e:
            logger.error(f"Error extracting text from {file_path}: {str(e)}")
            raise e
    
    def _extract_from_pdf(self, file_path: str) -> str:
        """Extract text from PDF files using multiple methods"""
        text = ""
        
        try:
            # Method 1: Use pdfminer (most reliable)
            text = extract_text(file_path)
            
            # If pdfminer doesn't work well, try PyPDF2 as backup
            if len(text.strip()) < 100:  # If extracted text is too short
                logger.warning(f"pdfminer extracted minimal text from {file_path}, trying PyPDF2")
                text = self._extract_pdf_pypdf2(file_path)
                
        except Exception as e:
            logger.warning(f"pdfminer failed for {file_path}: {str(e)}, trying PyPDF2")
            try:
                text = self._extract_pdf_pypdf2(file_path)
            except Exception as e2:
                logger.error(f"Both PDF extraction methods failed for {file_path}: {str(e2)}")
                raise e2
        
        return text.strip()
    
    def _extract_pdf_pypdf2(self, file_path: str) -> str:
        """Extract text from PDF using PyPDF2"""
        text = ""
        
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                
                # Extract text from all pages
                for page_num in range(len(pdf_reader.pages)):
                    page = pdf_reader.pages[page_num]
                    page_text = page.extract_text()
                    text += page_text + "\n"
                    
        except Exception as e:
            logger.error(f"PyPDF2 extraction failed for {file_path}: {str(e)}")
            raise e
        
        return text.strip()
    
    def _extract_from_docx(self, file_path: str) -> str:
        """Extract text from DOCX/DOC files"""
        try:
            text = docx2txt.process(file_path)
            return text.strip()
            
        except Exception as e:
            logger.error(f"Error extracting text from DOCX file {file_path}: {str(e)}")
            raise e
    
    def _extract_from_txt(self, file_path: str) -> str:
        """Extract text from plain text files"""
        try:
            # Try different encodings
            encodings = ['utf-8', 'latin-1', 'cp1252', 'iso-8859-1']
            
            for encoding in encodings:
                try:
                    with open(file_path, 'r', encoding=encoding) as file:
                        text = file.read()
                        return text.strip()
                except UnicodeDecodeError:
                    continue
            
            # If all encodings fail, read as binary and decode with errors='ignore'
            with open(file_path, 'rb') as file:
                text = file.read().decode('utf-8', errors='ignore')
                return text.strip()
                
        except Exception as e:
            logger.error(f"Error reading text file {file_path}: {str(e)}")
            raise e
    
    def get_file_info(self, file_path: str) -> dict:
        """
        Get basic information about the file
        
        Args:
            file_path: Path to the file
            
        Returns:
            Dictionary with file information
        """
        try:
            stat = os.stat(file_path)
            _, extension = os.path.splitext(file_path)
            
            return {
                'filename': os.path.basename(file_path),
                'extension': extension.lower().lstrip('.'),
                'size_bytes': stat.st_size,
                'size_mb': round(stat.st_size / (1024 * 1024), 2),
                'modified_time': stat.st_mtime,
                'is_supported': extension.lower().lstrip('.') in self.supported_formats
            }
            
        except Exception as e:
            logger.error(f"Error getting file info for {file_path}: {str(e)}")
            return {}
    
    def validate_file(self, file_path: str, max_size_mb: int = 10) -> tuple:
        """
        Validate if file can be processed
        
        Args:
            file_path: Path to the file
            max_size_mb: Maximum file size in MB
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        try:
            if not os.path.exists(file_path):
                return False, "File does not exist"
            
            file_info = self.get_file_info(file_path)
            
            if not file_info.get('is_supported', False):
                return False, f"Unsupported file format: {file_info.get('extension', 'unknown')}"
            
            if file_info.get('size_mb', 0) > max_size_mb:
                return False, f"File too large: {file_info.get('size_mb', 0)}MB (max: {max_size_mb}MB)"
            
            # Try to extract a small sample to check if file is readable
            try:
                sample_text = self.extract_text(file_path)
                if len(sample_text.strip()) < 10:
                    return False, "File appears to be empty or unreadable"
            except Exception as e:
                return False, f"Cannot read file content: {str(e)}"
            
            return True, "File is valid"
            
        except Exception as e:
            return False, f"Validation error: {str(e)}"