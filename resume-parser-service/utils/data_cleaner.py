import re
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
import string

logger = logging.getLogger(__name__)

class DataCleaner:
    """Clean and validate parsed resume data"""
    
    def __init__(self):
        # Common words to remove from skills
        self.skill_stopwords = {
            'and', 'or', 'with', 'using', 'including', 'such', 'as', 'like',
            'also', 'plus', 'etc', 'other', 'various', 'multiple', 'several'
        }
        
        # Common job titles to help identify positions vs companies
        self.job_title_keywords = {
            'developer', 'engineer', 'manager', 'analyst', 'specialist', 'coordinator',
            'director', 'senior', 'junior', 'lead', 'principal', 'architect',
            'consultant', 'designer', 'administrator', 'officer', 'executive',
            'supervisor', 'assistant', 'associate', 'intern', 'trainee'
        }
        
        # Company suffixes to help identify companies
        self.company_suffixes = {
            'inc', 'corp', 'corporation', 'ltd', 'limited', 'llc', 'llp',
            'company', 'co', 'group', 'enterprises', 'solutions', 'services',
            'systems', 'technologies', 'tech', 'consulting', 'partners'
        }
    
    def clean_resume_data(self, parsed_data: Dict) -> Dict:
        """
        Clean and validate all parsed resume data
        
        Args:
            parsed_data: Raw parsed resume data
            
        Returns:
            Cleaned and validated resume data
        """
        try:
            cleaned_data = {
                'personal_info': self._clean_personal_info(parsed_data.get('personal_info', {})),
                'skills': self._clean_skills(parsed_data.get('skills', [])),
                'experience': self._clean_experience(parsed_data.get('experience', [])),
                'education': self._clean_education(parsed_data.get('education', [])),
                'certifications': self._clean_certifications(parsed_data.get('certifications', [])),
                'languages': self._clean_languages(parsed_data.get('languages', [])),
                'summary': self._clean_summary(parsed_data.get('summary', '')),
                'total_experience': self._validate_total_experience(parsed_data.get('total_experience', 0))
            }
            
            return cleaned_data
            
        except Exception as e:
            logger.error(f"Error cleaning resume data: {str(e)}")
            return parsed_data  # Return original data if cleaning fails
    
    def _clean_personal_info(self, personal_info: Dict) -> Dict:
        """Clean personal information"""
        cleaned = {}
        
        # Clean name
        if personal_info.get('name'):
            name = self._clean_text(personal_info['name'])
            # Remove common prefixes/suffixes
            name = re.sub(r'\b(mr|mrs|ms|dr|prof|sir|madam)\.?\s*', '', name, flags=re.IGNORECASE)
            name = re.sub(r'\s*(jr|sr|ii|iii|iv)\.?\s*$', '', name, flags=re.IGNORECASE)
            cleaned['name'] = name.title() if name else None
        
        # Clean and validate email
        if personal_info.get('email'):
            email = personal_info['email'].lower().strip()
            if self._is_valid_email(email):
                cleaned['email'] = email
        
        # Clean phone number
        if personal_info.get('phone'):
            phone = self._clean_phone_number(personal_info['phone'])
            cleaned['phone'] = phone
        
        # Clean URLs
        for url_field in ['linkedin', 'github']:
            if personal_info.get(url_field):
                url = self._clean_url(personal_info[url_field])
                if url:
                    cleaned[url_field] = url
        
        return cleaned
    
    def _clean_skills(self, skills: List[str]) -> List[str]:
        """Clean and deduplicate skills"""
        if not skills:
            return []
        
        cleaned_skills = []
        seen_skills = set()
        
        for skill in skills:
            if not isinstance(skill, str):
                continue
            
            # Clean the skill text
            clean_skill = self._clean_text(skill)
            
            # Skip if too short or contains only stopwords
            if len(clean_skill) < 2 or clean_skill.lower() in self.skill_stopwords:
                continue
            
            # Remove common prefixes/suffixes
            clean_skill = re.sub(r'^(experience\s+(?:with|in)\s+)', '', clean_skill, flags=re.IGNORECASE)
            clean_skill = re.sub(r'^(knowledge\s+of\s+)', '', clean_skill, flags=re.IGNORECASE)
            clean_skill = re.sub(r'^(proficient\s+in\s+)', '', clean_skill, flags=re.IGNORECASE)
            
            # Title case and trim
            clean_skill = clean_skill.strip().title()
            
            # Avoid duplicates (case-insensitive)
            if clean_skill and clean_skill.lower() not in seen_skills:
                cleaned_skills.append(clean_skill)
                seen_skills.add(clean_skill.lower())
        
        return sorted(cleaned_skills)
    
    def _clean_experience(self, experience: List[Dict]) -> List[Dict]:
        """Clean work experience entries"""
        if not experience:
            return []
        
        cleaned_experience = []
        
        for exp in experience:
            if not isinstance(exp, dict):
                continue
            
            cleaned_exp = {}
            
            # Clean company name
            if exp.get('company'):
                company = self._clean_text(exp['company'])
                # Remove common prefixes
                company = re.sub(r'^(at\s+)', '', company, flags=re.IGNORECASE)
                cleaned_exp['company'] = company.title() if company else ''
            
            # Clean position/title
            if exp.get('position'):
                position = self._clean_text(exp['position'])
                # Remove common prefixes
                position = re.sub(r'^(as\s+(?:a\s+)?)', '', position, flags=re.IGNORECASE)
                cleaned_exp['position'] = position.title() if position else ''
            
            # Validate and clean dates
            cleaned_exp['start_date'] = self._clean_date(exp.get('start_date'))
            cleaned_exp['end_date'] = self._clean_date(exp.get('end_date'))
            cleaned_exp['is_current'] = bool(exp.get('is_current', False))
            
            # Clean description
            if exp.get('description'):
                description = self._clean_text(exp['description'])
                cleaned_exp['description'] = description
            
            # Only add if we have meaningful data
            if cleaned_exp.get('company') or cleaned_exp.get('position'):
                cleaned_experience.append(cleaned_exp)
        
        # Sort by start date (most recent first)
        cleaned_experience.sort(key=lambda x: x.get('start_date', ''), reverse=True)
        
        return cleaned_experience
    
    def _clean_education(self, education: List[Dict]) -> List[Dict]:
        """Clean education entries"""
        if not education:
            return []
        
        cleaned_education = []
        
        for edu in education:
            if not isinstance(edu, dict):
                continue
            
            cleaned_edu = {}
            
            # Clean institution name
            if edu.get('institution'):
                institution = self._clean_text(edu['institution'])
                cleaned_edu['institution'] = institution.title() if institution else ''
            
            # Clean degree
            if edu.get('degree'):
                degree = self._clean_text(edu['degree'])
                cleaned_edu['degree'] = degree.title() if degree else ''
            
            # Clean field of study
            if edu.get('field_of_study'):
                field = self._clean_text(edu['field_of_study'])
                cleaned_edu['field_of_study'] = field.title() if field else ''
            
            # Validate dates
            cleaned_edu['start_date'] = self._clean_date(edu.get('start_date'))
            cleaned_edu['end_date'] = self._clean_date(edu.get('end_date'))
            
            # Clean grade
            if edu.get('grade'):
                grade = self._clean_text(edu['grade'])
                cleaned_edu['grade'] = grade
            
            # Only add if we have meaningful data
            if any([cleaned_edu.get('institution'), cleaned_edu.get('degree'), cleaned_edu.get('field_of_study')]):
                cleaned_education.append(cleaned_edu)
        
        # Sort by end date (most recent first)
        cleaned_education.sort(key=lambda x: x.get('end_date', ''), reverse=True)
        
        return cleaned_education
    
    def _clean_certifications(self, certifications: List[Dict]) -> List[Dict]:
        """Clean certifications"""
        if not certifications:
            return []
        
        cleaned_certs = []
        seen_certs = set()
        
        for cert in certifications:
            if not isinstance(cert, dict):
                continue
            
            cleaned_cert = {}
            
            # Clean certification name
            if cert.get('name'):
                name = self._clean_text(cert['name'])
                cleaned_cert['name'] = name.title() if name else ''
            
            # Clean issuer
            if cert.get('issuer'):
                issuer = self._clean_text(cert['issuer'])
                cleaned_cert['issuer'] = issuer.title() if issuer else ''
            
            # Validate dates
            cleaned_cert['issue_date'] = self._clean_date(cert.get('issue_date'))
            cleaned_cert['expiry_date'] = self._clean_date(cert.get('expiry_date'))
            
            # Clean credential ID
            if cert.get('credential_id'):
                credential_id = self._clean_text(cert['credential_id'])
                cleaned_cert['credential_id'] = credential_id
            
            # Avoid duplicates and only add if we have meaningful data
            cert_key = cleaned_cert.get('name', '').lower()
            if cert_key and cert_key not in seen_certs and cleaned_cert.get('name'):
                cleaned_certs.append(cleaned_cert)
                seen_certs.add(cert_key)
        
        return cleaned_certs
    
    def _clean_languages(self, languages: List[Dict]) -> List[Dict]:
        """Clean languages"""
        if not languages:
            return []
        
        cleaned_langs = []
        seen_langs = set()
        
        for lang in languages:
            if not isinstance(lang, dict):
                continue
            
            cleaned_lang = {}
            
            # Clean language name
            if lang.get('language'):
                language = self._clean_text(lang['language'])
                cleaned_lang['language'] = language.title() if language else ''
            
            # Validate proficiency level
            proficiency = lang.get('proficiency', 'intermediate').lower()
            valid_levels = ['beginner', 'intermediate', 'advanced', 'native']
            if proficiency in valid_levels:
                cleaned_lang['proficiency'] = proficiency
            else:
                cleaned_lang['proficiency'] = 'intermediate'  # default
            
            # Avoid duplicates
            lang_key = cleaned_lang.get('language', '').lower()
            if lang_key and lang_key not in seen_langs and cleaned_lang.get('language'):
                cleaned_langs.append(cleaned_lang)
                seen_langs.add(lang_key)
        
        return cleaned_langs
    
    def _clean_summary(self, summary: str) -> str:
        """Clean professional summary"""
        if not summary or not isinstance(summary, str):
            return ""
        
        # Clean the text
        cleaned_summary = self._clean_text(summary)
        
        # Remove common prefixes
        prefixes_to_remove = [
            r'^(summary|objective|profile|about\s+me|professional\s+summary)[:\-\s]*',
            r'^(i\s+am\s+(?:a\s+)?)',
            r'^(my\s+(?:name\s+is|background\s+is))'
        ]
        
        for prefix in prefixes_to_remove:
            cleaned_summary = re.sub(prefix, '', cleaned_summary, flags=re.IGNORECASE)
        
        # Capitalize first letter
        cleaned_summary = cleaned_summary.strip()
        if cleaned_summary:
            cleaned_summary = cleaned_summary[0].upper() + cleaned_summary[1:]
        
        return cleaned_summary
    
    def _clean_text(self, text: str) -> str:
        """General text cleaning"""
        if not text or not isinstance(text, str):
            return ""
        
        # Remove extra whitespace
        text = ' '.join(text.split())
        
        # Remove special characters but keep basic punctuation
        text = re.sub(r'[^\w\s\.\,\-\(\)\&\+\#]', ' ', text)
        
        # Remove multiple spaces
        text = re.sub(r'\s+', ' ', text)
        
        return text.strip()
    
    def _clean_phone_number(self, phone: str) -> Optional[str]:
        """Clean and format phone number"""
        if not phone:
            return None
        
        # Remove all non-digit characters except + at the beginning
        cleaned = re.sub(r'[^\d+]', '', phone)
        
        # Basic validation - should have at least 7 digits
        digits_only = re.sub(r'[^\d]', '', cleaned)
        if len(digits_only) < 7:
            return None
        
        return cleaned
    
    def _clean_url(self, url: str) -> Optional[str]:
        """Clean and validate URL"""
        if not url:
            return None
        
        # Add protocol if missing
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url
        
        # Basic URL validation
        url_pattern = r'^https?://[^\s/$.?#].[^\s]*$'
        if re.match(url_pattern, url):
            return url
        
        return None
    
    def _clean_date(self, date_str: str) -> Optional[str]:
        """Clean and validate date string"""
        if not date_str or not isinstance(date_str, str):
            return None
        
        # Basic date format validation (YYYY-MM-DD)
        date_pattern = r'^\d{4}-\d{2}-\d{2}$'
        if re.match(date_pattern, date_str):
            return date_str
        
        return None
    
    def _is_valid_email(self, email: str) -> bool:
        """Validate email format"""
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(email_pattern, email))
    
    def _validate_total_experience(self, experience: float) -> float:
        """Validate total experience value"""
        try:
            exp = float(experience)
            # Cap at reasonable maximum (50 years)
            return max(0, min(exp, 50))
        except (ValueError, TypeError):
            return 0.0
    
    def get_data_quality_score(self, cleaned_data: Dict) -> Dict:
        """
        Calculate a data quality score for the parsed resume
        
        Args:
            cleaned_data: Cleaned resume data
            
        Returns:
            Dictionary with quality scores and recommendations
        """
        scores = {
            'personal_info': 0,
            'skills': 0,
            'experience': 0,
            'education': 0,
            'overall': 0
        }
        
        recommendations = []
        
        # Score personal information (0-25 points)
        personal_info = cleaned_data.get('personal_info', {})
        if personal_info.get('name'): scores['personal_info'] += 10
        if personal_info.get('email'): scores['personal_info'] += 10
        if personal_info.get('phone'): scores['personal_info'] += 3
        if personal_info.get('linkedin'): scores['personal_info'] += 2
        
        if scores['personal_info'] < 20:
            recommendations.append("Add complete contact information including email and phone number")
        
        # Score skills (0-25 points)
        skills = cleaned_data.get('skills', [])
        skill_count = len(skills)
        if skill_count >= 10: scores['skills'] = 25
        elif skill_count >= 5: scores['skills'] = 20
        elif skill_count >= 3: scores['skills'] = 15
        elif skill_count >= 1: scores['skills'] = 10
        
        if skill_count < 5:
            recommendations.append("Add more relevant technical and professional skills")
        
        # Score experience (0-30 points)
        experience = cleaned_data.get('experience', [])
        exp_count = len(experience)
        total_exp = cleaned_data.get('total_experience', 0)
        
        if exp_count >= 3 and total_exp >= 2: scores['experience'] = 30
        elif exp_count >= 2 and total_exp >= 1: scores['experience'] = 25
        elif exp_count >= 1: scores['experience'] = 20
        elif total_exp > 0: scores['experience'] = 10
        
        if exp_count == 0:
            recommendations.append("Add work experience with detailed job descriptions")
        
        # Score education (0-20 points)
        education = cleaned_data.get('education', [])
        if len(education) >= 2: scores['education'] = 20
        elif len(education) >= 1: scores['education'] = 15
        
        if len(education) == 0:
            recommendations.append("Add educational background information")
        
        # Calculate overall score
        scores['overall'] = sum(scores.values()) - scores['overall']  # Exclude overall from sum
        
        # Quality level
        if scores['overall'] >= 80:
            quality_level = "Excellent"
        elif scores['overall'] >= 60:
            quality_level = "Good"
        elif scores['overall'] >= 40:
            quality_level = "Fair"
        else:
            quality_level = "Needs Improvement"
        
        return {
            'scores': scores,
            'quality_level': quality_level,
            'recommendations': recommendations,
            'completeness_percentage': scores['overall']
        }