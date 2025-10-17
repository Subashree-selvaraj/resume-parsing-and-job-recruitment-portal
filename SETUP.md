# Setup Guide for Development

This repository contains a complete MERN stack job recruitment portal with ML resume parsing capabilities.

## Prerequisites

- **Node.js** (v14 or higher)
- **Python** (v3.8 or higher)
- **MongoDB** (local installation or MongoDB Atlas)
- **Git**

## Quick Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Subashree-selvaraj/resume-parsing-and-job-recruitment-portal.git
cd resume-parsing-and-job-recruitment-portal
```

### 2. Backend Setup (Express.js + MongoDB)
```bash
cd backend
npm install
```

**Environment Variables:** Create a `.env` file in the backend directory:
```
MONGODB_URI=mongodb://localhost:27017/job-portal
JWT_SECRET=your-jwt-secret-key
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
PORT=5000
```

**Start Backend:**
```bash
npm start
# or for development with hot reload
npm run dev
```

### 3. Frontend Setup (React)
```bash
cd frontend
npm install
```

**Start Frontend:**
```bash
npm start
```
The React app will run on http://localhost:3000

### 4. Resume Parser Service Setup (Python + Flask)
```bash
cd resume-parser-service
pip install -r requirements.txt
```

**Start ML Service:**
```bash
python app.py
```
The ML service will run on http://localhost:5001

## Project Structure

```
├── backend/                 # Express.js API server
│   ├── models/             # MongoDB/Mongoose models
│   ├── routes/             # API routes
│   ├── middleware/         # Express middleware
│   ├── controllers/        # Business logic
│   ├── utils/              # Utility functions
│   └── package.json        # Node.js dependencies
├── frontend/               # React application
│   ├── src/                # React source code
│   ├── public/             # Static assets
│   ├── package.json        # React dependencies
│   └── tailwind.config.js  # Tailwind CSS config
├── resume-parser-service/  # Python ML service
│   ├── parsers/           # Resume parsing modules
│   ├── utils/             # Python utilities
│   ├── app.py             # Flask application
│   └── requirements.txt   # Python dependencies
└── docs/                  # Documentation
```

## Development Workflow

1. **Start MongoDB** (if using local installation)
2. **Start Backend**: `cd backend && npm start`
3. **Start Frontend**: `cd frontend && npm start` 
4. **Start ML Service**: `cd resume-parser-service && python app.py`
5. **Access Application**: http://localhost:3000

## Features

- **User Authentication** (Job seekers & Recruiters)
- **Job Search & Filtering**
- **Resume Upload & Parsing** (AI/ML powered)
- **Job Application Management**
- **Admin Dashboard**
- **Email Notifications**
- **Responsive Design**

## Technologies Used

- **Frontend**: React, Tailwind CSS
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **ML Service**: Python, Flask, NLP libraries
- **Authentication**: JWT tokens
- **File Handling**: Multer, File uploads

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.