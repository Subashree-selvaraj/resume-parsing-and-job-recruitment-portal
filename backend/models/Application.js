const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  // Basic Application Information
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Applicant is required']
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: [true, 'Job is required']
  },
  recruiter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Recruiter is required']
  },
  
  // Application Status Tracking
  status: {
    type: String,
    enum: [
      'applied',
      'under_review',
      'screening',
      'shortlisted',
      'interview_scheduled',
      'interview_completed',
      'reference_check',
      'offer_extended',
      'hired',
      'rejected',
      'withdrawn',
      'on_hold'
    ],
    default: 'applied'
  },
  
  // Status History for ATS tracking
  statusHistory: [{
    status: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String,
    automated: {
      type: Boolean,
      default: false
    }
  }],
  
  // Application Documents and Data
  resumeUrl: {
    type: String,
    required: [true, 'Resume is required']
  },
  coverLetter: {
    type: String,
    maxlength: [2000, 'Cover letter cannot exceed 2000 characters']
  },
  additionalDocuments: [{
    name: String,
    url: String,
    type: {
      type: String,
      enum: ['portfolio', 'certificate', 'transcript', 'reference', 'other']
    }
  }],
  
  // Screening Questions Responses
  screeningResponses: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    question: String,
    response: String,
    fileUrl: String // For file upload responses
  }],
  
  // ATS Scoring and Ranking
  atsScore: {
    overall: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    breakdown: {
      skills: { type: Number, default: 0 },
      experience: { type: Number, default: 0 },
      education: { type: Number, default: 0 },
      location: { type: Number, default: 0 }
    },
    lastCalculated: Date
  },
  
  // Interview Information
  interviews: [{
    type: {
      type: String,
      enum: ['phone', 'video', 'in-person', 'technical', 'panel', 'final'],
      required: true
    },
    scheduledDate: Date,
    duration: Number, // in minutes
    interviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    interviewers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    meetingLink: String,
    location: String,
    notes: String,
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 10
      },
      strengths: [String],
      weaknesses: [String],
      recommendation: {
        type: String,
        enum: ['strongly_recommend', 'recommend', 'maybe', 'not_recommend', 'strongly_not_recommend']
      },
      detailedFeedback: String
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'no_show'],
      default: 'scheduled'
    },
    completedAt: Date
  }],
  
  // Communication History
  communications: [{
    type: {
      type: String,
      enum: ['email', 'call', 'message', 'note'],
      required: true
    },
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    to: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    subject: String,
    message: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    read: {
      type: Boolean,
      default: false
    },
    important: {
      type: Boolean,
      default: false
    }
  }],
  
  // References
  references: [{
    name: {
      type: String,
      required: true
    },
    position: String,
    company: String,
    email: String,
    phone: String,
    relationship: {
      type: String,
      enum: ['manager', 'colleague', 'client', 'mentor', 'other']
    },
    contacted: {
      type: Boolean,
      default: false
    },
    contactedDate: Date,
    feedback: String,
    rating: {
      type: Number,
      min: 1,
      max: 10
    }
  }],
  
  // Offer Information
  offer: {
    extended: {
      type: Boolean,
      default: false
    },
    extendedDate: Date,
    salary: {
      amount: Number,
      currency: { type: String, default: 'USD' },
      period: { type: String, enum: ['hourly', 'monthly', 'yearly'], default: 'yearly' }
    },
    benefits: [String],
    startDate: Date,
    negotiable: {
      type: Boolean,
      default: true
    },
    expiryDate: Date,
    response: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'negotiating']
    },
    responseDate: Date,
    responseNotes: String
  },
  
  // Application Analytics
  analytics: {
    viewedAt: Date,
    timeSpentOnProfile: Number, // in seconds
    profileViews: {
      type: Number,
      default: 0
    },
    lastViewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  
  // Flags and Tags
  flags: [{
    type: {
      type: String,
      enum: ['star', 'urgent', 'follow_up', 'concern', 'excellent']
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedDate: {
      type: Date,
      default: Date.now
    },
    notes: String
  }],
  
  tags: [String],
  
  // Privacy and Consent
  consent: {
    dataProcessing: {
      type: Boolean,
      required: true,
      default: true
    },
    backgroundCheck: {
      type: Boolean,
      default: false
    },
    marketingEmails: {
      type: Boolean,
      default: false
    }
  },
  
  // Withdrawal Information
  withdrawal: {
    reason: {
      type: String,
      enum: [
        'accepted_other_offer',
        'salary_expectations',
        'location_issues',
        'company_culture',
        'job_responsibilities',
        'personal_reasons',
        'other'
      ]
    },
    feedback: String,
    withdrawnAt: Date
  },
  
  // Source Tracking
  source: {
    type: String,
    enum: ['direct', 'job_board', 'referral', 'social_media', 'career_fair', 'agency', 'other'],
    default: 'direct'
  },
  sourceDetails: String,
  
  // Application Metrics
  applicationMetrics: {
    timeToApply: Number, // time from job view to application submission (minutes)
    completionTime: Number, // time taken to complete application (minutes)
    resumeParsingTime: Number, // time taken for resume parsing (seconds)
    matchingScore: Number // initial matching score when applied
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for better performance
applicationSchema.index({ applicant: 1, job: 1 }, { unique: true });
applicationSchema.index({ job: 1, status: 1 });
applicationSchema.index({ recruiter: 1, status: 1 });
applicationSchema.index({ applicant: 1, status: 1 });
applicationSchema.index({ 'atsScore.overall': -1 });
applicationSchema.index({ createdAt: -1 });

// Virtual for time since application
applicationSchema.virtual('timeElapsed').get(function() {
  const now = new Date();
  const applied = this.createdAt;
  const diffTime = Math.abs(now - applied);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays >= 1) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else {
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  }
});

// Virtual for next interview
applicationSchema.virtual('nextInterview').get(function() {
  const upcomingInterviews = this.interviews
    .filter(interview => interview.status === 'scheduled' && interview.scheduledDate > new Date())
    .sort((a, b) => a.scheduledDate - b.scheduledDate);
  
  return upcomingInterviews[0] || null;
});

// Virtual for current status duration
applicationSchema.virtual('statusDuration').get(function() {
  const currentStatusEntry = this.statusHistory
    .filter(entry => entry.status === this.status)
    .sort((a, b) => b.timestamp - a.timestamp)[0];
  
  if (currentStatusEntry) {
    const now = new Date();
    const statusTime = currentStatusEntry.timestamp;
    const diffDays = Math.floor((now - statusTime) / (1000 * 60 * 60 * 24));
    return diffDays;
  }
  return 0;
});

// Pre-save middleware to update status history
applicationSchema.pre('save', function(next) {
  // If status is modified, add to status history
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
      changedBy: this.lastModifiedBy || this.recruiter,
      automated: this.statusChangeAutomated || false
    });
  }
  
  // If new application, add initial status
  if (this.isNew) {
    this.statusHistory.push({
      status: 'applied',
      timestamp: new Date(),
      automated: true
    });
  }
  
  next();
});

// Post-save middleware for notifications
applicationSchema.post('save', function(doc) {
  // Emit socket event for real-time updates
  if (doc.populated('applicant') || doc.populated('recruiter')) {
    // Socket notification logic would go here
    // This would be handled in the route/controller
  }
});

// Static method to get application pipeline analytics
applicationSchema.statics.getPipelineAnalytics = function(recruiterId, jobId = null) {
  const matchStage = { recruiter: recruiterId };
  if (jobId) matchStage.job = jobId;

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        applications: { $push: '$$ROOT' }
      }
    },
    {
      $group: {
        _id: null,
        totalApplications: { $sum: '$count' },
        statusBreakdown: {
          $push: {
            status: '$_id',
            count: '$count'
          }
        }
      }
    }
  ]);
};

// Static method to get top candidates by ATS score
applicationSchema.statics.getTopCandidates = function(jobId, limit = 10) {
  return this.find({ job: jobId })
    .sort({ 'atsScore.overall': -1 })
    .limit(limit)
    .populate('applicant', 'firstName lastName email jobSeekerProfile.resumeParsedData')
    .populate('job', 'title company');
};

// Instance method to calculate days in current status
applicationSchema.methods.getDaysInCurrentStatus = function() {
  const currentStatusEntry = this.statusHistory
    .filter(entry => entry.status === this.status)
    .sort((a, b) => b.timestamp - a.timestamp)[0];
  
  if (currentStatusEntry) {
    const now = new Date();
    const statusTime = currentStatusEntry.timestamp;
    return Math.floor((now - statusTime) / (1000 * 60 * 60 * 24));
  }
  return 0;
};

// Instance method to add communication
applicationSchema.methods.addCommunication = function(communicationData) {
  this.communications.push({
    ...communicationData,
    timestamp: new Date()
  });
  return this.save();
};

// Instance method to schedule interview
applicationSchema.methods.scheduleInterview = function(interviewData) {
  this.interviews.push({
    ...interviewData,
    status: 'scheduled'
  });
  
  // Update application status if not already in interview phase
  if (!['interview_scheduled', 'interview_completed'].includes(this.status)) {
    this.status = 'interview_scheduled';
  }
  
  return this.save();
};

// Instance method to update ATS score
applicationSchema.methods.updateATSScore = function(scoreBreakdown) {
  this.atsScore.breakdown = scoreBreakdown;
  this.atsScore.overall = Math.round(
    (scoreBreakdown.skills + scoreBreakdown.experience + 
     scoreBreakdown.education + scoreBreakdown.location) / 4
  );
  this.atsScore.lastCalculated = new Date();
  return this.save();
};

module.exports = mongoose.model('Application', applicationSchema);