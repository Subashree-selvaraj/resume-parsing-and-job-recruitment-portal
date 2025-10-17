# API Documentation

## Overview

The JobPortal Pro API provides comprehensive endpoints for managing job recruitment processes, user authentication, and resume parsing services. All endpoints return JSON responses and follow REST conventions.

## Base URLs

- **Backend API**: `http://localhost:5000/api`
- **Resume Parser**: `http://localhost:5001`

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## User Roles

- **job_seeker**: Can search jobs, apply, manage profile
- **recruiter**: Can post jobs, manage applications, access ATS
- **admin**: Full platform access and user management

## API Endpoints

### Authentication Routes

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe", 
  "email": "john.doe@example.com",
  "password": "securePassword123",
  "role": "job_seeker", // or "recruiter"
  "phoneNumber": "+1234567890",
  "location": "New York, NY"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "role": "job_seeker"
  }
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "securePassword123"
}
```

#### Get Current User Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Smith",
  "phoneNumber": "+1234567890",
  "location": "San Francisco, CA",
  "bio": "Experienced software developer...",
  "skills": ["JavaScript", "React", "Node.js"],
  "experience": [
    {
      "company": "Tech Corp",
      "position": "Senior Developer",
      "startDate": "2020-01-01",
      "endDate": "2023-12-31",
      "description": "Led development team..."
    }
  ]
}
```

### Job Management Routes

#### Search Jobs (Public)
```http
GET /api/jobs?search=developer&location=remote&jobType=full-time&page=1&limit=10
```

**Query Parameters:**
- `search`: Search in title, description, skills
- `location`: Filter by job location
- `jobType`: full-time, part-time, contract, internship
- `experienceLevel`: entry, mid, senior, lead
- `salaryMin`: Minimum salary filter
- `salaryMax`: Maximum salary filter
- `company`: Filter by company name
- `skills`: Comma-separated skills list
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 10)

**Response:**
```json
{
  "success": true,
  "jobs": [
    {
      "id": "job-id",
      "title": "Senior React Developer",
      "company": "Tech Innovations Inc.",
      "location": "Remote",
      "jobType": "full-time",
      "experienceLevel": "senior",
      "description": "We are looking for...",
      "requirements": ["5+ years React experience", "TypeScript"],
      "responsibilities": ["Lead frontend development", "Mentor junior developers"],
      "skills": ["React", "TypeScript", "Node.js"],
      "salary": {
        "min": 120000,
        "max": 150000,
        "currency": "USD"
      },
      "benefits": ["Health insurance", "Remote work", "401k matching"],
      "applicationDeadline": "2024-02-15T00:00:00Z",
      "createdAt": "2024-01-15T10:30:00Z",
      "postedBy": {
        "name": "Jane Recruiter",
        "company": "Tech Innovations Inc."
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  },
  "filters": {
    "locations": ["Remote", "New York", "San Francisco"],
    "companies": ["Tech Innovations Inc.", "StartupXYZ"],
    "skills": ["React", "JavaScript", "Python"]
  }
}
```

#### Get Single Job
```http
GET /api/jobs/:jobId
```

#### Create Job Posting (Recruiter Only)
```http
POST /api/jobs
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Senior React Developer",
  "company": "Tech Innovations Inc.",
  "location": "San Francisco, CA",
  "locationType": "hybrid", // remote, onsite, hybrid
  "jobType": "full-time",
  "experienceLevel": "senior",
  "description": "We are seeking a talented Senior React Developer...",
  "requirements": [
    "5+ years of React development experience",
    "Strong TypeScript skills",
    "Experience with modern state management"
  ],
  "responsibilities": [
    "Lead frontend development initiatives",
    "Mentor junior developers",
    "Collaborate with design and backend teams"
  ],
  "skills": ["React", "TypeScript", "Redux", "Node.js"],
  "salary": {
    "min": 120000,
    "max": 150000,
    "currency": "USD"
  },
  "benefits": ["Health insurance", "Remote work flexibility", "401k matching"],
  "applicationDeadline": "2024-02-15",
  "isActive": true
}
```

#### Update Job (Recruiter Only)
```http
PUT /api/jobs/:jobId
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Job Title",
  "description": "Updated description...",
  "isActive": false
}
```

#### Delete Job (Recruiter Only)
```http
DELETE /api/jobs/:jobId
Authorization: Bearer <token>
```

### Application Management Routes

#### Apply to Job (Job Seeker Only)
```http
POST /api/applications/:jobId
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "coverLetter": "I am excited to apply for this position...",
  "resume": <file>, // PDF, DOC, or DOCX file
  "customAnswers": {
    "question1": "My answer to custom question 1",
    "question2": "My answer to custom question 2"
  }
}
```

#### Get My Applications (Job Seeker)
```http
GET /api/applications?status=pending&page=1&limit=10
Authorization: Bearer <token>
```

**Query Parameters:**
- `status`: pending, reviewing, interviewed, offered, rejected, withdrawn
- `page`: Page number
- `limit`: Results per page

#### Get Job Applications (Recruiter)
```http
GET /api/applications/job/:jobId?status=pending&page=1&limit=10
Authorization: Bearer <token>
```

#### Update Application Status (Recruiter Only)
```http
PUT /api/applications/:applicationId
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "interviewed",
  "notes": "Great technical interview, moving to final round",
  "rating": 4,
  "feedback": {
    "technical": "Strong coding skills",
    "communication": "Excellent communication",
    "cultural": "Good culture fit"
  },
  "nextSteps": "Schedule final interview with CTO"
}
```

#### Withdraw Application (Job Seeker)
```http
DELETE /api/applications/:applicationId
Authorization: Bearer <token>
```

### Resume Parser Service

#### Parse Resume File
```http
POST /parse
Content-Type: multipart/form-data

{
  "file": <resume-file> // PDF, DOC, DOCX, or TXT
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "personalInfo": {
      "name": "John Doe",
      "email": "john.doe@email.com",
      "phone": "+1234567890",
      "location": "New York, NY"
    },
    "summary": "Experienced software developer with 5+ years...",
    "skills": [
      {"skill": "JavaScript", "proficiency": "expert"},
      {"skill": "React", "proficiency": "advanced"},
      {"skill": "Node.js", "proficiency": "intermediate"}
    ],
    "experience": [
      {
        "company": "Tech Corp",
        "position": "Senior Developer", 
        "startDate": "2020-01-01",
        "endDate": "2023-12-31",
        "description": "Led development of web applications..."
      }
    ],
    "education": [
      {
        "institution": "University of Technology",
        "degree": "Bachelor of Computer Science",
        "graduationYear": 2019,
        "gpa": "3.8"
      }
    ],
    "certifications": ["AWS Certified Developer", "Google Cloud Professional"],
    "languages": ["English (Native)", "Spanish (Conversational)"]
  }
}
```

#### Match Resume to Job
```http
POST /match
Content-Type: application/json

{
  "resumeText": "Full resume text content...",
  "jobDescription": "Job requirements and description...",
  "requiredSkills": ["JavaScript", "React", "Node.js"]
}
```

**Response:**
```json
{
  "success": true,
  "matchScore": 0.85,
  "analysis": {
    "skillsMatch": {
      "matched": ["JavaScript", "React"],
      "missing": ["Node.js"],
      "additional": ["Python", "TypeScript"]
    },
    "experienceMatch": {
      "requiredYears": 3,
      "candidateYears": 5,
      "match": true
    },
    "educationMatch": true,
    "recommendations": [
      "Candidate has strong React experience",
      "Consider highlighting Node.js projects",
      "Additional Python skills are valuable"
    ]
  }
}
```

#### Extract Skills from Text
```http
POST /skills
Content-Type: application/json

{
  "text": "I have 5 years of experience with JavaScript, React, and Node.js..."
}
```

### Analytics and Reporting Routes

#### Get Recruiter Dashboard Stats
```http
GET /api/analytics/recruiter/dashboard
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalJobs": 15,
    "activeJobs": 12,
    "totalApplications": 248,
    "newApplications": 23,
    "applicationsByStatus": {
      "pending": 45,
      "reviewing": 32,
      "interviewed": 18,
      "offered": 8,
      "hired": 12
    },
    "topPerformingJobs": [
      {
        "jobId": "job-id",
        "title": "Senior Developer",
        "applications": 45,
        "views": 234
      }
    ],
    "recentActivity": [
      {
        "type": "application",
        "message": "New application for Senior Developer position",
        "timestamp": "2024-01-20T10:30:00Z"
      }
    ]
  }
}
```

#### Get Application Analytics
```http
GET /api/analytics/applications/:jobId
Authorization: Bearer <token>
```

### Admin Routes

#### Get All Users (Admin Only)
```http
GET /api/admin/users?role=job_seeker&page=1&limit=20
Authorization: Bearer <token>
```

#### Update User Role (Admin Only)
```http
PUT /api/admin/users/:userId/role
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "recruiter"
}
```

#### Get Platform Statistics (Admin Only)
```http
GET /api/admin/statistics
Authorization: Bearer <token>
```

## Error Handling

All endpoints return errors in the following format:

```json
{
  "success": false,
  "error": {
    "message": "Validation error",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  }
}
```

## Common HTTP Status Codes

- `200`: Success
- `201`: Created successfully
- `400`: Bad request (validation errors)
- `401`: Unauthorized (missing or invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Resource not found
- `409`: Conflict (duplicate resource)
- `429`: Too many requests (rate limiting)
- `500`: Internal server error

## Rate Limiting

API endpoints are rate limited:
- Authentication: 5 requests per minute
- General API: 100 requests per minute
- File uploads: 10 requests per minute

## File Upload Limits

- Resume files: 16MB maximum
- Supported formats: PDF, DOC, DOCX, TXT
- Profile images: 5MB maximum
- Supported formats: JPG, PNG, WEBP

## WebSocket Events (Real-time)

Connect to `ws://localhost:5000` with authentication token.

### Events You Can Listen To:
- `application_received`: New job application
- `application_status_updated`: Application status changed
- `new_message`: New chat message
- `job_posted`: New job posted in your area

### Events You Can Emit:
- `join_room`: Join specific notification room
- `send_message`: Send chat message
- `typing`: Indicate typing status

## SDK and Client Libraries

### JavaScript/Node.js
```javascript
const JobPortalAPI = require('jobportal-sdk');
const client = new JobPortalAPI({
  baseURL: 'http://localhost:5000/api',
  token: 'your-jwt-token'
});

// Search jobs
const jobs = await client.jobs.search({
  search: 'developer',
  location: 'remote'
});

// Apply to job
await client.applications.apply(jobId, {
  coverLetter: 'My cover letter...',
  resume: fileBuffer
});
```

### Python
```python
import jobportal

client = jobportal.Client(
    base_url='http://localhost:5000/api',
    token='your-jwt-token'
)

# Search jobs
jobs = client.jobs.search(search='developer', location='remote')

# Parse resume
result = client.resume_parser.parse(file_path='resume.pdf')
```

## Postman Collection

Import our Postman collection for easy API testing:
[Download Collection](./JobPortal_API_Collection.json)

---

**Need Help?**
- Check our [Troubleshooting Guide](./TROUBLESHOOTING.md)
- Join our [Developer Community](https://discord.gg/jobportal)
- Submit issues on [GitHub](https://github.com/yourrepo/issues)