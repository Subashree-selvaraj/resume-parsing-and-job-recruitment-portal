const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  // Basic Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
  },
  
  // Role and Status
  role: {
    type: String,
    enum: ['job_seeker', 'recruiter', 'admin'],
    default: 'job_seeker'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  
  // Profile Information
  profilePicture: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  location: {
    city: String,
    state: String,
    country: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  // Job Seeker Specific Fields
  jobSeekerProfile: {
    // Resume Information
    resumeUrl: String,
    resumeParsedData: {
      skills: [String],
      experience: [{
        company: String,
        position: String,
        startDate: Date,
        endDate: Date,
        description: String,
        isCurrent: Boolean
      }],
      education: [{
        institution: String,
        degree: String,
        fieldOfStudy: String,
        startDate: Date,
        endDate: Date,
        grade: String
      }],
      certifications: [{
        name: String,
        issuer: String,
        issueDate: Date,
        expiryDate: Date,
        credentialId: String
      }],
      languages: [{
        language: String,
        proficiency: {
          type: String,
          enum: ['beginner', 'intermediate', 'advanced', 'native']
        }
      }],
      summary: String,
      totalExperience: Number // in years
    },
    
    // Preferences
    jobPreferences: {
      jobTypes: [{
        type: String,
        enum: ['full-time', 'part-time', 'contract', 'freelance', 'internship']
      }],
      preferredLocations: [String],
      remoteWork: Boolean,
      salaryRange: {
        min: Number,
        max: Number,
        currency: {
          type: String,
          default: 'USD'
        }
      },
      availabilityDate: Date,
      noticePeriod: Number // in days
    },
    
    // Social Links
    socialLinks: {
      linkedin: String,
      github: String,
      portfolio: String,
      twitter: String
    }
  },
  
  // Recruiter Specific Fields
  recruiterProfile: {
    company: {
      name: {
        type: String,
        required: function() { return this.role === 'recruiter'; }
      },
      website: String,
      size: {
        type: String,
        enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']
      },
      industry: String,
      description: String,
      logo: String,
      headquarters: String
    },
    position: String,
    department: String,
    isVerifiedRecruiter: {
      type: Boolean,
      default: false
    },
    verificationDocuments: [String],
    recruiterRating: {
      average: {
        type: Number,
        default: 0
      },
      count: {
        type: Number,
        default: 0
      }
    }
  },
  
  // Notifications and Preferences
  notificationSettings: {
    email: {
      jobAlerts: { type: Boolean, default: true },
      applicationUpdates: { type: Boolean, default: true },
      messages: { type: Boolean, default: true },
      newsletter: { type: Boolean, default: false }
    },
    push: {
      jobAlerts: { type: Boolean, default: true },
      applicationUpdates: { type: Boolean, default: true },
      messages: { type: Boolean, default: true }
    }
  },
  
  // Security and Session Management
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  lastLogin: Date,
  
  // Analytics
  profileViews: {
    type: Number,
    default: 0
  },
  searchAppearances: {
    type: Number,
    default: 0
  },

  // Saved Jobs (for job seekers)
  savedJobs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'jobSeekerProfile.resumeParsedData.skills': 1 });
userSchema.index({ 'recruiterProfile.company.name': 1 });
userSchema.index({ createdAt: -1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only run this function if password was modified
  if (!this.isModified('password')) return next();
  
  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to generate JWT token
userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { 
      id: this._id, 
      role: this.role,
      email: this.email 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Instance method to generate and hash password token
userSchema.methods.getResetPasswordToken = function() {
  // Generate token
  const resetToken = require('crypto').randomBytes(20).toString('hex');
  
  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = require('crypto')
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  // Set expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};

// Handle account locking
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: {
        lockUntil: 1
      },
      $set: {
        loginAttempts: 1
      }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // If we have reached max attempts and it's not locked already, lock the account
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = {
      lockUntil: Date.now() + 2 * 60 * 60 * 1000 // 2 hours
    };
  }
  
  return this.updateOne(updates);
};

// Static method to find by credentials
userSchema.statics.getAuthenticated = function(email, password, cb) {
  this.findOne({ email }).select('+password').exec((err, user) => {
    if (err) return cb(err);
    
    // Make sure the user exists
    if (!user) {
      return cb(null, null, { message: 'Invalid credentials' });
    }
    
    // Check if the account is currently locked
    if (user.isLocked) {
      return user.incLoginAttempts((err) => {
        if (err) return cb(err);
        return cb(null, null, { message: 'Account temporarily locked' });
      });
    }
    
    // Test for a matching password
    user.comparePassword(password, (err, isMatch) => {
      if (err) return cb(err);
      
      // Check if password was a match
      if (isMatch) {
        // If there's no lock or failed attempts, just return the user
        if (!user.loginAttempts && !user.lockUntil) return cb(null, user);
        
        // Reset attempts and lock info
        const updates = {
          $unset: {
            loginAttempts: 1,
            lockUntil: 1
          }
        };
        
        return user.updateOne(updates, (err) => {
          if (err) return cb(err);
          return cb(null, user);
        });
      }
      
      // Password is incorrect, so increment login attempts before responding
      user.incLoginAttempts((err) => {
        if (err) return cb(err);
        return cb(null, null, { message: 'Invalid credentials' });
      });
    });
  });
};

module.exports = mongoose.model('User', userSchema);