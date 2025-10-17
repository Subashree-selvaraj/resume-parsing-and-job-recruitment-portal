const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  // Basic Job Information
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [100, 'Job title cannot exceed 100 characters']
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    maxlength: [5000, 'Job description cannot exceed 5000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [500, 'Short description cannot exceed 500 characters']
  },
  
  // Job Details
  category: {
  type: String
  },
  subCategory: {
    type: String,
    trim: true
  },
  
  // Employment Details
  jobType: {
  type: String
  },
  experienceLevel: {
  type: String,
  required: [true, 'Experience level is required']
  },
  
  // Location
  location: {
    type: String,
    required: true,
    trim: true
  },
  
  // Compensation
  salary: {
    min: {
      type: Number,
      min: 0
    },
    max: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      default: 'INR'
    },
    period: {
      type: String,
      enum: ['hourly', 'monthly', 'yearly'],
      default: 'yearly'
    },
    negotiable: {
      type: Boolean,
      default: false
    }
  },
  
  // Requirements and Skills
  requiredSkills: [{
    skill: {
      type: String,
      required: true
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'intermediate'
    },
    mandatory: {
      type: Boolean,
      default: true
    }
  }],
  
  preferredSkills: [{
    skill: String,
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'intermediate'
    }
  }],
  
  requirements: {
    education: {
      level: {
        type: String,
        enum: ['high-school', 'associate', 'bachelor', 'master', 'phd', 'certification', 'not-specified'],
        default: 'not-specified'
      },
      field: String,
      required: {
        type: Boolean,
        default: false
      }
    },
    experience: {
      min: {
        type: Number,
        min: 0,
        default: 0
      },
      max: {
        type: Number,
        min: 0
      },
      unit: {
        type: String,
        enum: ['months', 'years'],
        default: 'years'
      }
    },
    certifications: [String],
    languages: [{
      language: String,
      proficiency: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'native']
      }
    }]
  },
  
  // Benefits and Perks
  benefits: [{
    type: String
  }],
  
  // Company Information
  companyInfo: {
    size: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']
    },
    industry: String,
    website: String,
    logo: String,
    description: String
  },
  
  // Job Posting Details
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Application Details
  applicationDeadline: {
    type: Date,
    validate: {
      validator: function(v) {
        return v > new Date();
      },
      message: 'Application deadline must be in the future'
    }
  },
  
  // Job Status and Visibility
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'closed', 'expired'],
    default: 'draft'
  },
  
  visibility: {
    type: String,
    enum: ['public', 'private', 'internal'],
    default: 'public'
  },
  
  // Application Management
  applicationsCount: {
    type: Number,
    default: 0
  },
  viewsCount: {
    type: Number,
    default: 0
  },
  
  // Screening Questions
  screeningQuestions: [{
    question: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['text', 'multiple-choice', 'yes-no', 'file-upload'],
      default: 'text'
    },
    required: {
      type: Boolean,
      default: false
    },
    options: [String] // For multiple-choice questions
  }],
  
  // Job Matching Score (for ATS)
  matchingCriteria: {
    skillsWeight: {
      type: Number,
      min: 0,
      max: 100,
      default: 40
    },
    experienceWeight: {
      type: Number,
      min: 0,
      max: 100,
      default: 30
    },
    educationWeight: {
      type: Number,
      min: 0,
      max: 100,
      default: 20
    },
    locationWeight: {
      type: Number,
      min: 0,
      max: 100,
      default: 10
    }
  },
  
  // SEO and Analytics
  tags: [String],
  slug: {
    type: String,
    unique: true
  },
  
  // Internal Notes (for recruiters)
  internalNotes: {
    type: String,
    maxlength: [2000, 'Internal notes cannot exceed 2000 characters']
  },
  
  // Featured Job
  isFeatured: {
    type: Boolean,
    default: false
  },
  featuredUntil: Date,
  
  // Job Analytics
  analytics: {
    totalViews: { type: Number, default: 0 },
    uniqueViews: { type: Number, default: 0 },
    applicationStarted: { type: Number, default: 0 },
    applicationCompleted: { type: Number, default: 0 },
    searchAppearances: { type: Number, default: 0 }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
jobSchema.index({ title: 'text', description: 'text', company: 'text' });
jobSchema.index({ status: 1, visibility: 1 });
jobSchema.index({ 'location.city': 1, 'location.state': 1, 'location.country': 1 });
jobSchema.index({ category: 1, subCategory: 1 });
jobSchema.index({ jobType: 1, experienceLevel: 1 });
jobSchema.index({ postedBy: 1 });
jobSchema.index({ createdAt: -1 });
jobSchema.index({ applicationDeadline: 1 });
jobSchema.index({ 'requiredSkills.skill': 1 });

// Virtual for formatted salary
jobSchema.virtual('formattedSalary').get(function() {
  if (!this.salary.min && !this.salary.max) {
    return 'Not specified';
  }
  
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };
  
  const currency = this.salary.currency || 'USD';
  const period = this.salary.period || 'yearly';
  
  if (this.salary.min && this.salary.max) {
    return `${currency} ${formatNumber(this.salary.min)} - ${formatNumber(this.salary.max)} per ${period}`;
  } else if (this.salary.min) {
    return `${currency} ${formatNumber(this.salary.min)}+ per ${period}`;
  } else {
    return `Up to ${currency} ${formatNumber(this.salary.max)} per ${period}`;
  }
});

// Virtual for time since posted
jobSchema.virtual('timePosted').get(function() {
  const now = new Date();
  const posted = this.createdAt;
  const diffTime = Math.abs(now - posted);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  
  if (diffDays >= 1) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else if (diffHours >= 1) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else {
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  }
});

// Virtual for application status
jobSchema.virtual('isExpired').get(function() {
  if (!this.applicationDeadline) return false;
  return new Date() > this.applicationDeadline;
});

// Pre-save middleware to generate slug
jobSchema.pre('save', function(next) {
  if (this.isModified('title') || this.isNew) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') + '-' + this._id.toString().substr(-6);
  }
  
  // Update status based on application deadline
  if (this.applicationDeadline && this.applicationDeadline < new Date() && this.status === 'active') {
    this.status = 'expired';
  }
  
  next();
});

// Static method to search jobs
jobSchema.statics.searchJobs = function(searchQuery) {
  const {
    keywords,
    location,
    category,
    jobType,
    experienceLevel,
    salaryMin,
    salaryMax,
    remoteOnly,
    skills,
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = searchQuery;

  // Show jobs that are public, active, and either have no application deadline or a future deadline.
  const now = new Date();
  let query = this.find({
    visibility: 'public',
    status: 'active',
    $or: [
      { applicationDeadline: { $exists: false } },
      { applicationDeadline: { $gt: now } }
    ]
  });

  // Text search
  if (keywords) {
    query = query.find({
      $or: [
        { title: { $regex: keywords, $options: 'i' } },
        { description: { $regex: keywords, $options: 'i' } },
        { company: { $regex: keywords, $options: 'i' } }
      ]
    });
  }

  // Location filter
  if (location && !remoteOnly) {
    query = query.find({
      $or: [
        { 'location.city': { $regex: location, $options: 'i' } },
        { 'location.state': { $regex: location, $options: 'i' } },
        { 'location.country': { $regex: location, $options: 'i' } }
      ]
    });
  }

  // Remote jobs only
  if (remoteOnly) {
    query = query.find({ 'location.isRemote': true });
  }

  // Category filter
  if (category) {
    query = query.find({ category });
  }

  // Job type filter
  if (jobType && Array.isArray(jobType)) {
    query = query.find({ jobType: { $in: jobType } });
  }

  // Experience level filter
  if (experienceLevel && Array.isArray(experienceLevel)) {
    query = query.find({ experienceLevel: { $in: experienceLevel } });
  }

  // Salary range filter
  if (salaryMin || salaryMax) {
    const salaryQuery = {};
    if (salaryMin) salaryQuery['salary.min'] = { $gte: Number(salaryMin) };
    if (salaryMax) salaryQuery['salary.max'] = { $lte: Number(salaryMax) };
    query = query.find(salaryQuery);
  }

  // Skills filter
  if (skills && Array.isArray(skills)) {
    query = query.find({
      'requiredSkills.skill': { $in: skills.map(skill => new RegExp(skill, 'i')) }
    });
  }

  // Sorting
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
  query = query.sort(sortOptions);

  // Pagination
  const skip = (page - 1) * limit;
  query = query.skip(skip).limit(Number(limit));

  return query.populate('postedBy', 'firstName lastName recruiterProfile.company.name recruiterProfile.company.logo');
};

// Instance method to calculate matching score for a candidate
jobSchema.methods.calculateMatchingScore = function(candidateProfile) {
  let totalScore = 0;
  const weights = this.matchingCriteria;

  // Skills matching
  if (candidateProfile.resumeParsedData && candidateProfile.resumeParsedData.skills) {
    const candidateSkills = candidateProfile.resumeParsedData.skills.map(skill => skill.toLowerCase());
    const requiredSkills = this.requiredSkills.map(rs => rs.skill.toLowerCase());
    const skillMatches = candidateSkills.filter(skill => 
      requiredSkills.some(reqSkill => reqSkill.includes(skill) || skill.includes(reqSkill))
    );
    const skillScore = (skillMatches.length / Math.max(requiredSkills.length, 1)) * 100;
    totalScore += (skillScore * weights.skillsWeight) / 100;
  }

  // Experience matching
  if (candidateProfile.resumeParsedData && candidateProfile.resumeParsedData.totalExperience !== undefined) {
    const candidateExp = candidateProfile.resumeParsedData.totalExperience;
    const requiredExp = this.requirements.experience.min || 0;
    const expScore = candidateExp >= requiredExp ? 100 : (candidateExp / requiredExp) * 100;
    totalScore += (expScore * weights.experienceWeight) / 100;
  }

  // Education matching (simplified)
  if (candidateProfile.resumeParsedData && candidateProfile.resumeParsedData.education) {
    const hasEducation = candidateProfile.resumeParsedData.education.length > 0;
    const eduScore = hasEducation ? 100 : 0;
    totalScore += (eduScore * weights.educationWeight) / 100;
  }

  // Location matching (simplified)
  if (candidateProfile.location) {
    const locationMatch = this.location.isRemote || 
      (candidateProfile.location.city === this.location.city);
    const locScore = locationMatch ? 100 : 50;
    totalScore += (locScore * weights.locationWeight) / 100;
  }

  return Math.min(Math.round(totalScore), 100);
};

module.exports = mongoose.model('Job', jobSchema);