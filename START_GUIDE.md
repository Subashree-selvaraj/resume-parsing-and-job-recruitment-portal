# 🚀 Quick Start Guide - JobPortal Pro

## How to Start Your Application

Follow these steps in order to get your JobPortal Pro running:

### Step 1: Start MongoDB Database 🗄️

**First, make sure MongoDB is running:**

```powershell
# Check if MongoDB is running
tasklist | findstr mongod

# If not running, start MongoDB service (as Administrator)
net start MongoDB

# Alternative: Start MongoDB manually
mongod --dbpath "C:\data\db"
```

### Step 2: Start Resume Parser Service 🐍

**Terminal 1 - Resume Parser:**

```powershell
# Navigate to resume parser directory
cd D:\projects\capstoneproject\resume-parser-service

# Create virtual environment (first time only)
python -m venv venv

# Activate virtual environment
venv\Scripts\activate

# Install dependencies (first time only)
pip install -r requirements.txt

# Download spaCy model (first time only)
python -m spacy download en_core_web_sm

# Start the resume parser service
python app.py
```

**Expected Output:**
```
 * Running on http://127.0.0.1:5001
 * Debug mode: on
```

### Step 3: Start Backend API Server 🔧

**Terminal 2 - Backend:**

```powershell
# Navigate to backend directory
cd D:\projects\capstoneproject\backend

# Install dependencies (first time only - if not already done)
npm install

# Start the backend server
npm start
```

**Expected Output:**
```
Server running on port 5000
Connected to MongoDB: job-recruitment-portal
Resume parser service connected at http://localhost:5001
```

### Step 4: Start Frontend React App ⚛️

**Terminal 3 - Frontend:**

```powershell
# Navigate to frontend directory
cd D:\projects\capstoneproject\frontend

# Install dependencies (first time only - if not already done)
npm install

# Start the React development server
npm start
```

**Expected Output:**
```
Local:            http://localhost:3000
Network:          http://192.168.1.x:3000
webpack compiled with 0 errors
```

### Step 5: Access Your Application 🌐

Once all three services are running:

- **Frontend (Main App)**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Resume Parser**: http://localhost:5001

## ⚡ Quick Commands Summary

Run these in **3 separate terminals**:

**Terminal 1 (Resume Parser):**
```powershell
cd D:\projects\capstoneproject\resume-parser-service
venv\Scripts\activate
python app.py
```

**Terminal 2 (Backend):**
```powershell
cd D:\projects\capstoneproject\backend
npm start
```

**Terminal 3 (Frontend):**
```powershell
cd D:\projects\capstoneproject\frontend
npm start
```

## 🛠️ Troubleshooting Common Issues

### Issue 1: MongoDB Connection Error
```
Error: connect ECONNREFUSED ::1:27017
```
**Solution:**
- Start MongoDB service: `net start MongoDB` (as Administrator)
- Or install MongoDB Community Server if not installed

### Issue 2: Python Dependencies Error
```
ModuleNotFoundError: No module named 'flask'
```
**Solution:**
- Activate virtual environment: `venv\Scripts\activate`
- Install dependencies: `pip install -r requirements.txt`

### Issue 3: Node.js Dependencies Error
```
Cannot find module 'express'
```
**Solution:**
- Install dependencies: `npm install`

### Issue 4: Port Already in Use
```
Error: listen EADDRINUSE :::5000
```
**Solution:**
- Check what's using the port: `netstat -ano | findstr :5000`
- Kill the process: `taskkill /PID <process_id> /F`

### Issue 5: spaCy Model Not Found
```
OSError: [E050] Can't find model 'en_core_web_sm'
```
**Solution:**
- Download spaCy model: `python -m spacy download en_core_web_sm`

## ✅ Verification Checklist

Before using the application, verify:

- [ ] MongoDB is running (check Task Manager)
- [ ] Resume Parser shows "Running on http://127.0.0.1:5001"
- [ ] Backend shows "Server running on port 5000"
- [ ] Frontend opens in browser at http://localhost:3000
- [ ] No error messages in any terminal

## 🎯 First Time Setup Only

Run these commands **only on first setup**:

```powershell
# Backend setup
cd backend
npm install

# Frontend setup  
cd ../frontend
npm install

# Resume Parser setup
cd ../resume-parser-service
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

## 🔄 Daily Development Workflow

**Every time you want to develop:**

1. **Start MongoDB** (if not auto-starting)
2. **Open 3 terminals** and run the quick commands above
3. **Wait for all services** to show "ready" messages
4. **Open browser** to http://localhost:3000
5. **Start coding!** 🚀

---

**🎉 Your JobPortal Pro should now be running successfully!**

Visit http://localhost:3000 to see your beautiful, animated recruitment platform in action!