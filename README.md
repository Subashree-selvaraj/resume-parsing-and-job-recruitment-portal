# 🚀 JobPortal Pro - Full Stack MERN Recruitment Platform

A comprehensive, professional-grade job recruitment platform built with the MERN stack, featuring an advanced Applicant Tracking System (ATS), intelligent resume parsing, and real-time notifications.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/React-18.2.0-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-brightgreen.svg)
![Python](https://img.shields.io/badge/Python-3.8+-yellow.svg)

## 🌟 Key Features

### 🎯 **Multi-Role Authentication System**
- **Job Seekers**: Profile creation, job search, application tracking
- **Recruiters**: Job posting, candidate management, ATS dashboard
- **Administrators**: Platform oversight, analytics, user management

### 🤖 **AI-Powered Resume Parsing**
- Intelligent resume extraction from PDF, DOC, DOCX formats
- Skills matching and candidate ranking algorithms
- Automated profile completion from resume data

### 📊 **Advanced Applicant Tracking System (ATS)**
- Real-time application status tracking
- Automated candidate ranking and filtering
- Interview scheduling and feedback management
- Comprehensive analytics and reporting

### ⚡ **Real-Time Features**
- Live notifications for applications and updates
- Instant messaging between recruiters and candidates
- Real-time dashboard updates via Socket.io

### 🎨 **Professional UI/UX**
- Modern, responsive design with Tailwind CSS
- Smooth animations and transitions with Framer Motion
- Mobile-first approach with accessibility standards
- Dark/Light theme support

## 🏗️ Project Architecture

```
capstoneproject/
├── backend/                 # Node.js Express API Server
│   ├── config/             # Database and environment configuration
│   ├── controllers/        # Route controllers and business logic
│   ├── middleware/         # Authentication and validation middleware
│   ├── models/            # MongoDB data models (User, Job, Application)
│   ├── routes/            # API routes and endpoints
│   ├── utils/             # Helper functions and utilities
│   └── server.js          # Main application entry point
├── frontend/              # React.js Client Application
│   ├── public/           # Static assets and HTML template
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Route-based page components
│   │   ├── contexts/     # React context providers
│   │   ├── hooks/        # Custom React hooks
│   │   ├── services/     # API communication services
│   │   └── utils/        # Frontend utility functions
│   └── package.json      # Frontend dependencies
├── resume_parser/         # Python Microservice
│   ├── services/         # Core parsing and analysis services
│   ├── utils/            # File handling and data processing
│   └── app.py           # Flask application server
└── docs/                 # Documentation and guides
```

## 🛠️ Technology Stack

### **Backend**
- **Runtime**: Node.js 18+ with Express.js 4.18.2
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with bcrypt password hashing
- **Real-time**: Socket.io for live updates
- **File Upload**: Multer for resume and document handling

### **Frontend**
- **Framework**: React 18.2.0 with React Router Dom
- **State Management**: React Context API with React Query
- **Styling**: Tailwind CSS with custom component library
- **Animations**: Framer Motion for smooth transitions
- **HTTP Client**: Axios with request interceptors

### **Resume Parser Service**
- **Framework**: Flask (Python 3.8+)
- **NLP Engine**: spaCy with pre-trained models
- **Document Processing**: PyResparser, docx2txt, pdfminer.six
- **Machine Learning**: Scikit-learn for skill matching algorithms

### **DevOps & Tools**
- **Process Management**: PM2 for production deployment
- **Environment**: dotenv for configuration management
- **CORS**: Configured for cross-origin resource sharing
- **Logging**: Winston for structured application logging

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18+ and npm/yarn
- Python 3.8+ with pip
- MongoDB 6.0+ (local or cloud instance)
- Git for version control

### 1. Clone and Setup
```bash
# Clone the repository
git clone <repository-url>
cd capstoneproject

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Setup Python resume parser
cd ../resume_parser
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

### 2. Environment Configuration
Create `.env` files in both backend and resume_parser directories:

**Backend (.env)**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/jobportal
JWT_SECRET=your_super_secure_jwt_secret_key_here
JWT_EXPIRE=30d
RESUME_PARSER_URL=http://localhost:5001

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Cloud Storage (Optional)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Resume Parser (.env)**
```env
FLASK_ENV=development
FLASK_PORT=5001
UPLOAD_FOLDER=./uploads
MAX_CONTENT_LENGTH=16777216  # 16MB
```

### 3. Start Development Servers

**Terminal 1: Backend Server**
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2: Resume Parser Service**
```bash
cd resume_parser
python app.py
# Service runs on http://localhost:5001
```

**Terminal 3: Frontend Development**
```bash
cd frontend
npm start
# Client runs on http://localhost:3000
```

## 📋 API Documentation

### Authentication Endpoints
```http
POST /api/auth/register     # User registration
POST /api/auth/login        # User authentication
GET  /api/auth/profile      # Get current user profile
PUT  /api/auth/profile      # Update user profile
```

### Job Management
```http
GET    /api/jobs            # Search and filter jobs
POST   /api/jobs            # Create new job posting (Recruiter)
GET    /api/jobs/:id        # Get job details
PUT    /api/jobs/:id        # Update job posting
DELETE /api/jobs/:id        # Delete job posting
```

### Application Tracking
```http
GET  /api/applications           # Get user applications
POST /api/applications/:jobId    # Apply to job
PUT  /api/applications/:id       # Update application status
GET  /api/applications/job/:jobId # Get job applications (Recruiter)
```

### Resume Parser Service
```http
POST /parse                      # Parse resume file
POST /match                      # Match resume to job
GET  /skills                     # Extract skills from text
```

## 🎨 UI Components & Features

### **Landing Page**
- Hero section with animated call-to-action
- Feature highlights with smooth scroll animations
- Statistics counter with number animations
- Responsive testimonial carousel

### **Job Seeker Dashboard**
- Personalized job recommendations
- Application status tracking with visual indicators
- Profile completion progress with animations
- Saved jobs and application history

### **Recruiter Dashboard**
- Job posting management with rich text editor
- Candidate pipeline with drag-and-drop functionality
- Advanced filtering and search capabilities
- Analytics dashboard with interactive charts

### **Admin Panel**
- User management with role-based permissions
- Platform analytics and reporting
- System configuration and settings
- Audit logs and activity monitoring

## 🔧 Advanced Configuration

### MongoDB Indexes
```javascript
// Recommended database indexes for optimal performance
db.jobs.createIndex({ "title": "text", "description": "text", "skills": "text" })
db.jobs.createIndex({ "location": 1, "jobType": 1, "createdAt": -1 })
db.users.createIndex({ "email": 1 }, { unique: true })
db.applications.createIndex({ "jobId": 1, "applicantId": 1, "status": 1 })
```

### Production Deployment
```bash
# Build frontend for production
cd frontend
npm run build

# Start backend with PM2
cd backend
pm2 start ecosystem.config.js --env production

# Deploy resume parser service
cd resume_parser
gunicorn --bind 0.0.0.0:5001 app:app
```

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test                    # Run all tests
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests
npm run test:coverage      # Generate coverage report
```

### Frontend Testing
```bash
cd frontend
npm test                   # Run React tests
npm run test:coverage     # Coverage report
npm run test:e2e          # End-to-end tests
```

## 📊 Performance Optimization

### Backend Optimizations
- MongoDB connection pooling and query optimization
- Redis caching for frequently accessed data
- Request rate limiting and API throttling
- Gzip compression and response caching
- Database indexing for search operations

### Frontend Optimizations
- React.memo and useMemo for component optimization
- Lazy loading for routes and components
- Image optimization and WebP format support
- Bundle splitting and code chunking
- Service Worker for offline functionality

## 🚀 Deployment Options

### **Docker Deployment**
```yaml
# docker-compose.yml
version: '3.8'
services:
  mongodb:
    image: mongo:6.0
    ports:
      - "27017:27017"
  
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    depends_on:
      - mongodb
  
  resume-parser:
    build: ./resume_parser
    ports:
      - "5001:5001"
  
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
```

### **Cloud Platforms**
- **Heroku**: Easy deployment with Git integration
- **AWS**: EC2 instances with Load Balancer and RDS
- **Vercel**: Frontend hosting with serverless functions
- **DigitalOcean**: Droplets with managed MongoDB

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style Guidelines
- Use ESLint and Prettier for JavaScript/React code
- Follow PEP 8 standards for Python code
- Write meaningful commit messages
- Add unit tests for new features
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React team for the amazing frontend framework
- Express.js community for the robust backend framework
- MongoDB team for the flexible database solution
- spaCy team for the powerful NLP capabilities
- Framer Motion for beautiful animations
- Tailwind CSS for the utility-first CSS framework

## 📞 Support

For support, email support@jobportal-pro.com or join our Slack channel.

---

**Built with ❤️ by Professional Full Stack Developers**

*Creating the next generation of recruitment technology*