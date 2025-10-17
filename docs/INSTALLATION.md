# Installation Guide

## System Requirements

### Hardware Requirements
- **CPU**: 2+ cores recommended (4+ for production)
- **RAM**: 4GB minimum (8GB+ recommended)
- **Storage**: 2GB available disk space
- **Network**: Stable internet connection for package downloads

### Software Requirements
- **Node.js**: Version 18.0.0 or higher
- **Python**: Version 3.8.0 or higher
- **MongoDB**: Version 6.0.0 or higher
- **Git**: Latest version for version control

## Step-by-Step Installation

### 1. Environment Setup

#### Windows Installation
```powershell
# Install Node.js (if not installed)
# Download from https://nodejs.org/

# Install Python (if not installed)
# Download from https://python.org/

# Install MongoDB Community Server
# Download from https://www.mongodb.com/try/download/community

# Verify installations
node --version
npm --version
python --version
mongod --version
```

#### macOS Installation
```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install required software
brew install node
brew install python
brew tap mongodb/brew
brew install mongodb-community

# Verify installations
node --version
npm --version
python3 --version
mongod --version
```

#### Linux (Ubuntu/Debian) Installation
```bash
# Update package list
sudo apt update

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Python
sudo apt install python3 python3-pip

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB service
sudo systemctl start mongod
sudo systemctl enable mongod
```

### 2. Project Setup

#### Clone Repository
```bash
git clone <your-repository-url>
cd capstoneproject
```

#### Backend Setup
```bash
cd backend
npm install

# Install additional development dependencies (optional)
npm install -D nodemon concurrently
```

#### Frontend Setup
```bash
cd ../frontend
npm install

# Install additional UI dependencies (if needed)
npm install @headlessui/react @heroicons/react
```

#### Resume Parser Setup
```bash
cd ../resume_parser

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Download spaCy English model
python -m spacy download en_core_web_sm
```

### 3. Database Configuration

#### Local MongoDB Setup
```bash
# Start MongoDB service
# Windows (as Administrator):
net start MongoDB

# macOS:
brew services start mongodb-community

# Linux:
sudo systemctl start mongod

# Create database (optional - will be created automatically)
mongo
use jobportal
exit
```

#### MongoDB Atlas Setup (Cloud)
1. Visit https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster
4. Add your IP address to whitelist
5. Create a database user
6. Get connection string for your application

### 4. Environment Configuration

#### Backend Environment (.env)
```bash
cd backend
touch .env  # Linux/macOS
# or create .env file manually on Windows
```

Add the following content to `backend/.env`:
```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/jobportal
# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/jobportal

# Authentication
JWT_SECRET=your_super_secure_jwt_secret_minimum_32_characters
JWT_EXPIRE=30d

# Resume Parser Service
RESUME_PARSER_URL=http://localhost:5001

# Email Configuration (Optional - for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# File Upload (Optional - for cloud storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Redis (Optional - for caching)
REDIS_URL=redis://localhost:6379
```

#### Resume Parser Environment (.env)
```bash
cd ../resume_parser
touch .env  # Linux/macOS
```

Add the following content to `resume_parser/.env`:
```env
# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True
FLASK_PORT=5001

# File Upload Configuration
UPLOAD_FOLDER=./uploads
MAX_CONTENT_LENGTH=16777216  # 16MB max file size
ALLOWED_EXTENSIONS=pdf,doc,docx,txt

# NLP Configuration
SPACY_MODEL=en_core_web_sm
CONFIDENCE_THRESHOLD=0.7
```

### 5. Development Server Setup

#### Start MongoDB (if not running)
```bash
# Windows:
net start MongoDB

# macOS:
brew services start mongodb-community

# Linux:
sudo systemctl start mongod
```

#### Start Backend Server
```bash
cd backend
npm run dev
# Server should start on http://localhost:5000
```

#### Start Resume Parser Service
```bash
cd resume_parser

# Activate virtual environment (if using)
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

python app.py
# Service should start on http://localhost:5001
```

#### Start Frontend Development Server
```bash
cd frontend
npm start
# Client should open at http://localhost:3000
```

### 6. Verification

#### Test Backend API
```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Expected response:
# {"status":"OK","message":"Server is running"}
```

#### Test Resume Parser Service
```bash
# Test health endpoint
curl http://localhost:5001/health

# Expected response:
# {"status":"healthy","message":"Resume parser service is running"}
```

#### Test Frontend
- Open http://localhost:3000 in your browser
- You should see the landing page with animations
- Navigation should be functional

### 7. Common Installation Issues

#### Node.js Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Use specific Node.js version (with nvm)
nvm install 18
nvm use 18
```

#### Python Issues
```bash
# Update pip
python -m pip install --upgrade pip

# Install specific spaCy version
pip install spacy==3.4.4

# Manual spaCy model download
python -c "import spacy; spacy.cli.download('en_core_web_sm')"
```

#### MongoDB Issues
```bash
# Check if MongoDB is running
# Windows:
tasklist | findstr mongod

# macOS/Linux:
ps aux | grep mongod

# Reset MongoDB (if needed)
# Windows:
net stop MongoDB
net start MongoDB

# Linux:
sudo systemctl restart mongod
```

#### Port Conflicts
```bash
# Check what's running on ports
# Windows:
netstat -ano | findstr :5000
netstat -ano | findstr :3000

# macOS/Linux:
lsof -i :5000
lsof -i :3000

# Kill processes if needed
# Windows:
taskkill /PID <process_id> /F

# macOS/Linux:
kill -9 <process_id>
```

### 8. Production Setup

#### Environment Variables
```bash
# Backend production .env
NODE_ENV=production
PORT=5000
MONGODB_URI=your_production_mongodb_url
JWT_SECRET=your_production_jwt_secret
```

#### Build Frontend
```bash
cd frontend
npm run build
```

#### Process Management with PM2
```bash
# Install PM2 globally
npm install -g pm2

# Start backend with PM2
cd backend
pm2 start server.js --name "jobportal-backend"

# Start resume parser with PM2
cd ../resume_parser
pm2 start app.py --name "resume-parser" --interpreter python3

# Save PM2 configuration
pm2 save
pm2 startup
```

## Next Steps

After successful installation:
1. Read the [API Documentation](./API_DOCUMENTATION.md)
2. Follow the [User Guide](./USER_GUIDE.md)
3. Check out [Development Guidelines](./DEVELOPMENT.md)
4. Review [Deployment Guide](./DEPLOYMENT.md)

## Support

If you encounter issues during installation:
1. Check the [Troubleshooting Guide](./TROUBLESHOOTING.md)
2. Search existing issues on GitHub
3. Create a new issue with detailed error information
4. Join our community Discord for help

---

**Installation Complete! 🎉**

Your JobPortal Pro development environment is now ready for use.