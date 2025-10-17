# Deployment Guide - JobPortal Pro

## Overview

This guide provides comprehensive instructions for deploying JobPortal Pro in various environments, from development to production. The application consists of three main components that need to be deployed:

- **Frontend**: React application
- **Backend**: Node.js/Express API server
- **Resume Parser**: Python Flask microservice

## Deployment Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │ Resume Parser   │
│   (React)       │───▶│  (Node.js)      │───▶│   (Python)      │
│   Port: 3000    │    │   Port: 5000    │    │   Port: 5001    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └──────────────▶│    Database     │◀─────────────┘
                        │   (MongoDB)     │
                        │   Port: 27017   │
                        └─────────────────┘
```

## Environment Setup

### Development Environment

#### Prerequisites
- Node.js 18+ and npm
- Python 3.8+ and pip
- MongoDB 6.0+
- Git

#### Quick Development Setup
```bash
# Clone repository
git clone <repository-url>
cd capstoneproject

# Install dependencies
cd backend && npm install && cd ../frontend && npm install && cd ../resume_parser && pip install -r requirements.txt

# Start all services
npm run dev:all  # If script is configured
```

### Production Environment Requirements

#### System Requirements
- **CPU**: 4+ cores for production workload
- **RAM**: 8GB minimum (16GB recommended)
- **Storage**: 50GB SSD minimum
- **Network**: Static IP and domain name
- **OS**: Ubuntu 20.04 LTS or CentOS 8 (recommended)

#### Software Requirements
- **Reverse Proxy**: Nginx or Apache
- **Process Manager**: PM2 for Node.js processes
- **Database**: MongoDB 6.0+ (local or cloud)
- **SSL Certificate**: Let's Encrypt or commercial certificate
- **Monitoring**: Optional but recommended

## Docker Deployment

### Using Docker Compose (Recommended)

#### 1. Create Docker Configuration

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6.0
    restart: unless-stopped
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
      MONGO_INITDB_DATABASE: jobportal
    volumes:
      - mongodb_data:/data/db
      - ./mongo-init:/docker-entrypoint-initdb.d:ro
    networks:
      - jobportal-network

  backend:
    build: 
      context: ./backend
      dockerfile: Dockerfile
    restart: unless-stopped
    ports:
      - "5000:5000"
    environment:
      NODE_ENV: production
      MONGODB_URI: mongodb://admin:${MONGO_PASSWORD}@mongodb:27017/jobportal?authSource=admin
      JWT_SECRET: ${JWT_SECRET}
      RESUME_PARSER_URL: http://resume-parser:5001
    depends_on:
      - mongodb
    volumes:
      - backend_uploads:/app/uploads
    networks:
      - jobportal-network

  resume-parser:
    build:
      context: ./resume_parser
      dockerfile: Dockerfile
    restart: unless-stopped
    ports:
      - "5001:5001"
    environment:
      FLASK_ENV: production
    volumes:
      - parser_uploads:/app/uploads
    networks:
      - jobportal-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        REACT_APP_API_URL: http://localhost:5000/api
        REACT_APP_SOCKET_URL: http://localhost:5000
    restart: unless-stopped
    ports:
      - "3000:80"
    depends_on:
      - backend
    networks:
      - jobportal-network

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
      - resume-parser
    networks:
      - jobportal-network

volumes:
  mongodb_data:
  backend_uploads:
  parser_uploads:

networks:
  jobportal-network:
    driver: bridge
```

#### 2. Create Environment File

Create `.env` file:
```env
# Database
MONGO_PASSWORD=your_secure_mongo_password

# Application
JWT_SECRET=your_super_secure_jwt_secret_minimum_32_characters
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

#### 3. Create Dockerfiles

**Backend Dockerfile** (`backend/Dockerfile`):
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 5000

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

# Start application
CMD ["npm", "start"]
```

**Frontend Dockerfile** (`frontend/Dockerfile`):
```dockerfile
# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build arguments
ARG REACT_APP_API_URL
ARG REACT_APP_SOCKET_URL

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built application
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

**Resume Parser Dockerfile** (`resume_parser/Dockerfile`):
```dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Download spaCy model
RUN python -m spacy download en_core_web_sm

# Copy source code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Create non-root user
RUN useradd -m -u 1001 appuser
RUN chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 5001

# Start application
CMD ["python", "app.py"]
```

#### 4. Deploy with Docker

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Update services
docker-compose pull && docker-compose up -d
```

## Cloud Platform Deployment

### AWS Deployment

#### 1. Using AWS Elastic Beanstalk

**Prepare Application**:
```bash
# Install EB CLI
pip install awsebcli

# Initialize Elastic Beanstalk
eb init jobportal-pro

# Create environment
eb create production

# Deploy application
eb deploy
```

**Configuration** (`.ebextensions/01_nodejs.config`):
```yaml
option_settings:
  aws:elasticbeanstalk:container:nodejs:
    NodeCommand: "npm start"
    NodeVersion: 18.x
  aws:elasticbeanstalk:application:environment:
    NODE_ENV: production
    MONGODB_URI: your_mongodb_atlas_url
    JWT_SECRET: your_jwt_secret
```

#### 2. Using AWS EC2 with Load Balancer

**Launch EC2 Instances**:
```bash
# Create security group
aws ec2 create-security-group --group-name jobportal-sg --description "JobPortal Security Group"

# Add rules
aws ec2 authorize-security-group-ingress --group-name jobportal-sg --protocol tcp --port 22 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-name jobportal-sg --protocol tcp --port 80 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-name jobportal-sg --protocol tcp --port 443 --cidr 0.0.0.0/0

# Launch instance
aws ec2 run-instances --image-id ami-0abcdef1234567890 --count 1 --instance-type t3.medium --key-name your-key --security-groups jobportal-sg
```

**Setup Application on EC2**:
```bash
# Connect to instance
ssh -i your-key.pem ubuntu@your-instance-ip

# Install dependencies
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs python3 python3-pip nginx

# Clone and setup application
git clone <your-repo-url>
cd capstoneproject
# ... setup steps from installation guide

# Configure nginx
sudo cp nginx/production.conf /etc/nginx/sites-available/jobportal
sudo ln -s /etc/nginx/sites-available/jobportal /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Setup SSL with Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### Heroku Deployment

#### 1. Backend Deployment

```bash
# Install Heroku CLI and login
heroku login

# Create Heroku app
heroku create jobportal-backend

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_mongodb_atlas_url
heroku config:set JWT_SECRET=your_jwt_secret

# Deploy
git subtree push --prefix backend heroku main
```

**Procfile** (`backend/Procfile`):
```
web: npm start
```

#### 2. Frontend Deployment

```bash
# Create frontend app
heroku create jobportal-frontend

# Set build variables
heroku config:set REACT_APP_API_URL=https://jobportal-backend.herokuapp.com/api

# Add buildpack
heroku buildpacks:set mars/create-react-app

# Deploy
git subtree push --prefix frontend heroku main
```

### DigitalOcean Deployment

#### 1. Using DigitalOcean App Platform

Create `app.yaml`:
```yaml
name: jobportal-pro
services:
- name: backend
  source_dir: /backend
  github:
    repo: your-username/jobportal-pro
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: NODE_ENV
    value: production
  - key: MONGODB_URI
    value: ${MONGODB_URI}
  - key: JWT_SECRET
    value: ${JWT_SECRET}

- name: frontend
  source_dir: /frontend
  github:
    repo: your-username/jobportal-pro
    branch: main
  build_command: npm run build
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: REACT_APP_API_URL
    value: ${backend.RENDERED_URL}/api

- name: resume-parser
  source_dir: /resume_parser
  github:
    repo: your-username/jobportal-pro
    branch: main
  run_command: python app.py
  environment_slug: python
  instance_count: 1
  instance_size_slug: basic-xxs

databases:
- name: jobportal-db
  engine: MONGODB
  version: "5"
```

#### 2. Using DigitalOcean Droplet

```bash
# Create droplet
doctl compute droplet create jobportal-prod \
  --size s-2vcpu-4gb \
  --image ubuntu-20-04-x64 \
  --region nyc1 \
  --ssh-keys your-ssh-key-id

# Setup application (same as EC2 setup above)
```

## Production Configuration

### Nginx Configuration

**Main Configuration** (`/etc/nginx/sites-available/jobportal`):
```nginx
upstream backend {
    server localhost:5000;
}

upstream resume_parser {
    server localhost:5001;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Frontend
    location / {
        root /var/www/jobportal/frontend/build;
        try_files $uri $uri/ /index.html;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API Routes
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Resume Parser Routes
    location /parse/ {
        proxy_pass http://resume_parser/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Increase timeout for file processing
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
    }

    # File uploads
    location /uploads/ {
        alias /var/www/jobportal/uploads/;
        expires 1y;
        add_header Cache-Control "public";
    }

    # Health checks
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

### Process Management with PM2

**PM2 Configuration** (`ecosystem.config.js`):
```javascript
module.exports = {
  apps: [
    {
      name: 'jobportal-backend',
      script: './backend/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 5000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true
    },
    {
      name: 'resume-parser',
      script: './resume_parser/app.py',
      interpreter: 'python3',
      instances: 2,
      env: {
        FLASK_ENV: 'development'
      },
      env_production: {
        FLASK_ENV: 'production'
      },
      error_file: './logs/parser-error.log',
      out_file: './logs/parser-out.log',
      log_file: './logs/parser-combined.log',
      time: true
    }
  ]
};
```

**Deploy with PM2**:
```bash
# Install PM2
npm install -g pm2

# Start applications
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 startup
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME

# Monitor applications
pm2 monit

# View logs
pm2 logs

# Restart applications
pm2 restart all

# Update application
git pull
npm install --production
pm2 restart all
```

### Database Configuration

#### MongoDB Production Setup

**Replica Set Configuration**:
```javascript
// mongo shell
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "localhost:27017" }
  ]
});

// Create indexes for performance
use jobportal;

db.jobs.createIndex({ "title": "text", "description": "text", "skills": "text" });
db.jobs.createIndex({ "location": 1, "jobType": 1, "createdAt": -1 });
db.jobs.createIndex({ "isActive": 1, "applicationDeadline": 1 });
db.jobs.createIndex({ "postedBy": 1, "createdAt": -1 });

db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "role": 1, "isActive": 1 });

db.applications.createIndex({ "jobId": 1, "applicantId": 1, "status": 1 });
db.applications.createIndex({ "jobId": 1, "createdAt": -1 });
db.applications.createIndex({ "applicantId": 1, "createdAt": -1 });
```

#### MongoDB Atlas (Cloud)

1. **Create Atlas Account**: Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. **Create Cluster**: Choose appropriate tier for your needs
3. **Configure Security**:
   - Add your server IP to whitelist
   - Create database user with appropriate permissions
4. **Get Connection String**: Use in your environment variables

### SSL Certificate Setup

#### Using Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal (already configured by certbot)
sudo crontab -l | grep certbot
```

#### Using Commercial Certificate

```bash
# Generate CSR
openssl req -new -newkey rsa:2048 -nodes -keyout yourdomain.com.key -out yourdomain.com.csr

# Install certificate (after receiving from CA)
sudo cp yourdomain.com.crt /etc/ssl/certs/
sudo cp yourdomain.com.key /etc/ssl/private/
sudo chmod 600 /etc/ssl/private/yourdomain.com.key

# Update nginx configuration with certificate paths
```

## Monitoring and Logging

### Application Monitoring

#### PM2 Monitoring
```bash
# Install PM2 monitoring
pm2 install pm2-server-monit

# Web monitoring interface
pm2 web
```

#### Log Management
```bash
# Rotate logs
pm2 install pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

### System Monitoring

#### Using htop and iostat
```bash
# Install monitoring tools
sudo apt install htop iotop

# Monitor system resources
htop
iostat -x 1
```

#### Log Aggregation with rsyslog
```bash
# Configure centralized logging
sudo nano /etc/rsyslog.d/jobportal.conf

# Add configuration
$template JobPortalFormat,"%timegenerated% %HOSTNAME% %syslogtag% %msg%\n"
if $programname == 'jobportal' then /var/log/jobportal.log;JobPortalFormat
& stop
```

## Backup and Recovery

### Database Backup

```bash
# Create backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/mongodb"
mkdir -p $BACKUP_DIR

# Create backup
mongodump --host localhost:27017 --db jobportal --out $BACKUP_DIR/backup_$DATE

# Compress backup
tar -czf $BACKUP_DIR/backup_$DATE.tar.gz -C $BACKUP_DIR backup_$DATE
rm -rf $BACKUP_DIR/backup_$DATE

# Keep only last 7 days of backups
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +7 -delete

# Add to crontab
# 0 2 * * * /path/to/backup-script.sh
```

### Application Backup

```bash
# Backup application files
rsync -av --exclude node_modules --exclude .git /path/to/jobportal /backups/application/

# Backup uploaded files
rsync -av /var/www/jobportal/uploads /backups/uploads/
```

## Security Considerations

### Server Security

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Configure firewall
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Fail2ban for SSH protection
sudo apt install fail2ban
sudo systemctl enable fail2ban
```

### Application Security

1. **Environment Variables**: Never commit secrets to version control
2. **HTTPS Only**: Redirect all HTTP traffic to HTTPS
3. **CORS Configuration**: Configure appropriate CORS policies
4. **Rate Limiting**: Implement rate limiting for API endpoints
5. **Input Validation**: Validate and sanitize all user inputs
6. **Database Security**: Use MongoDB authentication and encryption

## Performance Optimization

### Frontend Optimization

```bash
# Build for production with optimizations
cd frontend
npm run build

# Serve with compression
serve -s build -p 3000
```

### Backend Optimization

```javascript
// Add to server.js
const compression = require('compression');
const helmet = require('helmet');

app.use(compression());
app.use(helmet());

// Cache static assets
app.use('/uploads', express.static('uploads', {
  maxAge: '1y',
  etag: false
}));
```

### Database Optimization

```javascript
// Connection pooling
mongoose.connect(mongoURI, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});

// Enable query optimization
mongoose.set('debug', false); // Disable in production
```

## Troubleshooting

### Common Issues

1. **Port Conflicts**: Check if ports are already in use
2. **Permission Errors**: Ensure proper file permissions
3. **Memory Issues**: Monitor memory usage and adjust instance sizes
4. **SSL Certificate Issues**: Verify certificate validity and configuration
5. **Database Connection**: Check MongoDB connection string and network access

### Health Check Endpoints

```bash
# Backend health check
curl http://localhost:5000/api/health

# Resume parser health check  
curl http://localhost:5001/health

# Database health check
mongo --eval "db.adminCommand('ping')"
```

---

**Deployment Complete! 🎉**

Your JobPortal Pro application is now running in production. Monitor the logs and system resources to ensure optimal performance.