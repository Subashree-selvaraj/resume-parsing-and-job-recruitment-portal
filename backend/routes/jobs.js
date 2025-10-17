const express = require('express');
const { body } = require('express-validator');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { protect, authorize, requireRecruiterVerification } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// @desc    Get all jobs (public with filters)
// @route   GET /api/jobs
// @access  Public
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.searchJobs(req.query);

    // Use same visibility rules as searchJobs for totals (deadline-aware)
    const now = new Date();
    const visibilityFilter = {
      visibility: 'public',
      $or: [
        { applicationDeadline: { $exists: false } },
        { applicationDeadline: { $gt: now } }
      ]
    };

    // Get total count for pagination
    const totalJobs = await Job.countDocuments(visibilityFilter);

    res.json({
      success: true,
      data: {
        jobs,
        totalJobs,
        currentPage: parseInt(req.query.page) || 1,
        totalPages: Math.ceil(totalJobs / (parseInt(req.query.limit) || 10))
      }
    });
  } catch (error) {
    logger.error(`Get jobs error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error fetching jobs'
    });
  }
});

// @desc    Get jobs by recruiter (alternative endpoint)
// @route   GET /api/jobs/my
// @access  Private (Recruiter only)
router.get('/my', 
  protect,
  authorize('recruiter'),
  async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const jobs = await Job.find({ postedBy: req.user._id })
        .sort({ createdAt: -1 })
        .limit(limit);

      // Debugging: log current user id and returned jobs' postedBy values
      logger.info(`Recruiter dashboard request by user ${req.user._id}. Returning ${jobs.length} jobs.`);
      jobs.forEach(j => logger.debug(`Job ${j._id} postedBy=${j.postedBy}`));
      res.json({
        success: true,
        data: { jobs }
      });
    } catch (error) {
      logger.error(`Get recruiter jobs error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Error fetching jobs'
      });
    }
  }
);

// @desc    Get jobs by recruiter
// @route   GET /api/jobs/recruiter/mine
// @access  Private (Recruiter only)
router.get('/recruiter/mine', 
  protect,
  authorize('recruiter'),
  async (req, res) => {
    try {
      const jobs = await Job.find({ postedBy: req.user._id })
        .sort({ createdAt: -1 });

      logger.info(`Recruiter 'recruiter/mine' request by user ${req.user._id}. Returning ${jobs.length} jobs.`);
      jobs.forEach(j => logger.debug(`Job ${j._id} postedBy=${j.postedBy}`));
      res.json({
        success: true,
        data: { jobs }
      });
    } catch (error) {
      logger.error(`Get recruiter jobs error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Error fetching jobs'
      });
    }
  }
);

// @desc    Get job categories (alternative endpoint)
// @route   GET /api/jobs/categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = [
      'Software Development',
      'Data Science',
      'Design',
      'Marketing',
      'Sales',
      'Finance',
      'Human Resources',
      'Operations',
      'Customer Service',
      'Healthcare',
      'Education',
      'Engineering',
      'Legal',
      'Consulting',
      'Other'
    ];

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching categories'
    });
  }
});

// @desc    Get job categories
// @route   GET /api/jobs/meta/categories
// @access  Public
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = [
      'Software Development',
      'Data Science',
      'Design',
      'Marketing',
      'Sales',
      'Finance',
      'Human Resources',
      'Operations',
      'Customer Service',
      'Healthcare',
      'Education',
      'Engineering',
      'Legal',
      'Consulting',
      'Other'
    ];

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching categories'
    });
  }
});

// @desc    Get job statistics (alternative endpoint)
// @route   GET /api/jobs/stats
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    // Use deadline-aware visibility rules for stats
    const now = new Date();
    const visibilityMatch = {
      visibility: 'public',
      $or: [
        { applicationDeadline: { $exists: false } },
        { applicationDeadline: { $gt: now } }
      ]
    };

    const totalJobs = await Job.countDocuments(visibilityMatch);
    const totalCompaniesArray = await Job.distinct('postedBy', visibilityMatch);
    const totalCompanies = totalCompaniesArray.length;
    const jobsByCategory = await Job.aggregate([
      { $match: visibilityMatch },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        totalJobs,
        totalCompanies,
        jobsByCategory
      }
    });
  } catch (error) {
    logger.error(`Get job stats error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error fetching job statistics'
    });
  }
});

// @desc    Get job statistics
// @route   GET /api/jobs/meta/stats
// @access  Public
router.get('/meta/stats', async (req, res) => {
  try {
    // Use deadline-aware visibility rules for stats
    const now = new Date();
    const visibilityMatch = {
      visibility: 'public',
      $or: [
        { applicationDeadline: { $exists: false } },
        { applicationDeadline: { $gt: now } }
      ]
    };

    const totalJobs = await Job.countDocuments(visibilityMatch);
    const totalCompaniesArray = await Job.distinct('postedBy', visibilityMatch);
    const totalCompanies = totalCompaniesArray.length;
    const jobsByCategory = await Job.aggregate([
      { $match: visibilityMatch },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        totalJobs,
        totalCompanies,
        jobsByCategory
      }
    });
  } catch (error) {
    logger.error(`Get job stats error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error fetching job statistics'
    });
  }
});

// @desc    Get saved jobs for current user
// @route   GET /api/jobs/saved
// @access  Private (Job seekers only)
router.get('/saved', protect, authorize('job_seeker'), async (req, res) => {
  try {
    const User = require('../models/User');
    const userId = req.user._id;

    const user = await User.findById(userId).populate({
      path: 'savedJobs',
      match: { status: 'active', visibility: 'public' }, // Only show active public jobs
      select: 'title company location salary createdAt applicationDeadline'
    });

    res.json({
      success: true,
      data: { savedJobs: user.savedJobs || [] }
    });
  } catch (error) {
    logger.error(`Get saved jobs error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error fetching saved jobs'
    });
  }
});

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'firstName lastName recruiterProfile.company');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Increment view count
    job.viewsCount += 1;
    job.analytics.totalViews += 1;
    await job.save();

    res.json({
      success: true,
      data: { job }
    });
  } catch (error) {
    logger.error(`Get job error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error fetching job'
    });
  }
});

// @desc    Create new job
// @route   POST /api/jobs
// @access  Private (Recruiter only)
router.post('/', 
  protect,
  authorize('recruiter'),
  requireRecruiterVerification,
  [
    body('title').notEmpty().withMessage('Job title is required'),
    body('description').notEmpty().withMessage('Job description is required')
  ],
  async (req, res) => {
    try {
      const jobData = {
        ...req.body,
        postedBy: req.user._id,
        company: req.user.recruiterProfile?.company?.name || req.body.company,
        status: 'active' // Set jobs as active by default so they are visible to job seekers
      };

        // Convert applicationDeadline to Date if present
        if (jobData.applicationDeadline) {
          jobData.applicationDeadline = new Date(jobData.applicationDeadline);
        }

      // Handle location object - convert to string format
      if (req.body.location && typeof req.body.location === 'object') {
        const { city, state, country, isRemote, remoteType } = req.body.location;
        let locationString = '';
        
        if (isRemote && remoteType === 'fully-remote') {
          locationString = 'Remote';
        } else if (isRemote && remoteType === 'hybrid') {
          locationString = `${city || ''}, ${state || ''}, ${country || ''} (Hybrid)`.replace(/^,\s*|,\s*$|,\s*,/g, '').trim();
        } else {
          locationString = `${city || ''}, ${state || ''}, ${country || ''}`.replace(/^,\s*|,\s*$|,\s*,/g, '').trim();
        }
        
        jobData.location = locationString || 'Not specified';
      }

      // Ensure company is set
      if (!jobData.company) {
        jobData.company = req.user.recruiterProfile?.company?.name || 'Company Name Not Set';
      }

      // Handle salary range
      if (req.body.salaryRange) {
        jobData.salary = {
          min: req.body.salaryRange.min || 0,
          max: req.body.salaryRange.max || 0,
          currency: 'USD',
          period: 'yearly'
        };
        delete jobData.salaryRange;
      }

      // Handle skills array
      if (req.body.skills && Array.isArray(req.body.skills)) {
        jobData.requiredSkills = req.body.skills.map(skill => ({
          skill: skill.trim(),
          level: 'intermediate',
          mandatory: true
        }));
        delete jobData.skills;
      }

      // Set default values for required fields
      if (!jobData.experienceLevel) {
        jobData.experienceLevel = 'mid';
      }

      const job = await Job.create(jobData);

      logger.info(`Job created: ${job.title} by ${req.user.email}`);

      res.status(201).json({
        success: true,
        message: 'Job posted successfully',
        data: { job }
      });
    } catch (error) {
      logger.error(`Create job error: ${error.message}`);
      
      // Handle validation errors
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validationErrors
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error creating job'
      });
    }
  }
);

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private (Recruiter only - own jobs)
router.put('/:id', 
  protect,
  authorize('recruiter'),
  async (req, res) => {
    try {
      const job = await Job.findById(req.params.id);

      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job not found'
        });
      }

      // Check if user owns this job
      if (job.postedBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this job'
        });
      }

      const updatedJob = await Job.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      logger.info(`Job updated: ${updatedJob.title} by ${req.user.email}`);

      res.json({
        success: true,
        message: 'Job updated successfully',
        data: { job: updatedJob }
      });
    } catch (error) {
      logger.error(`Update job error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Error updating job'
      });
    }
  }
);

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private (Recruiter only - own jobs)
router.delete('/:id', 
  protect,
  authorize('recruiter'),
  async (req, res) => {
    try {
      const job = await Job.findById(req.params.id);

      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job not found'
        });
      }

      // Check if user owns this job
      if (job.postedBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete this job'
        });
      }

      await Job.findByIdAndDelete(req.params.id);

      logger.info(`Job deleted: ${job.title} by ${req.user.email}`);

      res.json({
        success: true,
        message: 'Job deleted successfully'
      });
    } catch (error) {
      logger.error(`Delete job error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Error deleting job'
      });
    }
  }
);

// @desc    Get job applications
// @route   GET /api/jobs/:id/applications
// @access  Private (Recruiter only - own jobs)
router.get('/:id/applications', 
  protect,
  authorize('recruiter'),
  async (req, res) => {
    try {
      const job = await Job.findById(req.params.id);

      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job not found'
        });
      }

      // Check if user owns this job
      if (job.postedBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view these applications'
        });
      }

      const applications = await Application.find({ job: req.params.id })
        .populate('applicant', 'firstName lastName email jobSeekerProfile')
        .sort({ 'atsScore.overall': -1, createdAt: -1 });

      res.json({
        success: true,
        data: { applications }
      });
    } catch (error) {
      logger.error(`Get job applications error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Error fetching applications'
      });
    }
  }
);

// @desc    Toggle job status (active/paused)
// @route   PATCH /api/jobs/:id/toggle-status
// @access  Private (Recruiter only - own jobs)
// @desc    Update job status
// @route   PATCH /api/jobs/:id/status
// @access  Private (Recruiter only - own jobs)
router.patch('/:id/status', 
  protect,
  authorize('recruiter'),
  async (req, res) => {
    try {
      const job = await Job.findById(req.params.id);

      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job not found'
        });
      }

      // Check if user owns this job
      if (job.postedBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this job'
        });
      }

      const { status } = req.body;
      if (!['draft', 'active', 'paused', 'closed', 'expired'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status'
        });
      }

      job.status = status;
      await job.save();

      logger.info(`Job status changed to ${status}: ${job.title} by ${req.user.email}`);

      res.json({
        success: true,
        message: `Job ${status} successfully`,
        data: { job }
      });
    } catch (error) {
      logger.error(`Update job status error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Error updating job status'
      });
    }
  }
);

router.patch('/:id/toggle-status', 
  protect,
  authorize('recruiter'),
  async (req, res) => {
    try {
      const job = await Job.findById(req.params.id);

      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job not found'
        });
      }

      // Check if user owns this job
      if (job.postedBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this job'
        });
      }

      const newStatus = job.status === 'active' ? 'paused' : 'active';
      job.status = newStatus;
      await job.save();

      logger.info(`Job status changed to ${newStatus}: ${job.title} by ${req.user.email}`);

      res.json({
        success: true,
        message: `Job ${newStatus} successfully`,
        data: { job }
      });
    } catch (error) {
      logger.error(`Toggle job status error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Error updating job status'
      });
    }
  }
);

// @desc    Save/Unsave a job
// @route   POST /api/jobs/:id/save
// @access  Private (Job seekers only)
router.post('/:id/save', protect, authorize('job_seeker'), async (req, res) => {
  try {
    const User = require('../models/User');
    const jobId = req.params.id;
    const userId = req.user._id;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Get user and check if job is already saved
    const user = await User.findById(userId);
    const isJobSaved = user.savedJobs.includes(jobId);

    if (isJobSaved) {
      // Unsave the job
      user.savedJobs = user.savedJobs.filter(id => id.toString() !== jobId);
      await user.save();
      
      res.json({
        success: true,
        message: 'Job removed from saved jobs',
        data: { saved: false }
      });
    } else {
      // Save the job
      user.savedJobs.push(jobId);
      await user.save();
      
      res.json({
        success: true,
        message: 'Job saved successfully',
        data: { saved: true }
      });
    }
  } catch (error) {
    logger.error(`Save job error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error saving job'
    });
  }
});

// @desc    Activate all draft jobs (test endpoint)
// @route   POST /api/jobs/activate-all-drafts
// @access  Public (for testing only)
router.post('/activate-all-drafts', async (req, res) => {
  try {
    const result = await Job.updateMany(
      { status: 'draft' },
      { status: 'active' }
    );
    
    res.json({
      success: true,
      message: `Activated ${result.modifiedCount} draft jobs`,
      data: { modifiedCount: result.modifiedCount }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error activating jobs'
    });
  }
});

module.exports = router;