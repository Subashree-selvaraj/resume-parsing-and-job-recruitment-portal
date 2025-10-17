const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/applications/:jobId
// @desc    Apply to a job
// @access  Private (Job Seeker only)
router.post('/:jobId', protect, authorize('job_seeker'), async (req, res) => {
  try {
    const Application = require('../models/Application');
    const Job = require('../models/Job');
    const jobId = req.params.jobId;
    const applicantId = req.user._id;
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    // Simulate resume parsing (replace with real parser)
    const resumeParsedData = req.body.resumeParsedData || {};
    // Calculate ATS score using job method
    const atsScore = job.calculateMatchingScore({ resumeParsedData, location: req.body.location });

    // Create application
    const application = new Application({
      applicant: applicantId,
      job: jobId,
      recruiter: job.postedBy,
      resumeUrl: req.body.resumeUrl,
      coverLetter: req.body.coverLetter,
      screeningResponses: req.body.screeningResponses || [],
      atsScore: {
        overall: atsScore,
        breakdown: {
          skills: resumeParsedData.skillsScore || 0,
          experience: resumeParsedData.experienceScore || 0,
          education: resumeParsedData.educationScore || 0,
          location: resumeParsedData.locationScore || 0
        },
        lastCalculated: new Date()
      }
    });
    await application.save();
    res.json({
      success: true,
      message: 'Application submitted successfully',
      data: { applicationId: application._id, atsScore: application.atsScore }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/applications
// @desc    Get user applications
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    res.json({
      success: true,
      applications: []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/applications/recent
// @desc    Get recent applications for recruiter dashboard
// @access  Private (Recruiter only)
router.get('/recent', protect, authorize('recruiter'), async (req, res) => {
  try {
    const recruiterId = req.user._id;
    const limit = parseInt(req.query.limit) || 5;
    // Find jobs posted by this recruiter
    const jobs = await require('../models/Job').find({ postedBy: recruiterId }).select('_id title');
    const jobIds = jobs.map(j => j._id);
    // Find recent applications for these jobs
    const applications = await require('../models/Application').find({ job: { $in: jobIds } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('applicant', 'firstName lastName email')
      .populate('job', 'title')
      .select('applicant job createdAt status');

    // Format for dashboard
    const formatted = applications.map(app => ({
      _id: app._id,
      candidateName: app.applicant ? `${app.applicant.firstName} ${app.applicant.lastName}` : 'Anonymous',
      jobTitle: app.job ? app.job.title : '',
      appliedAt: app.createdAt,
      status: app.status
    }));
    res.json({
      success: true,
      data: { applications: formatted }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;