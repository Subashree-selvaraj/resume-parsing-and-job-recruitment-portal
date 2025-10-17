const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/analytics/dashboard
// @desc    Get analytics dashboard data
// @access  Private
router.get('/dashboard', protect, async (req, res) => {
  try {
    res.json({
      success: true,
      analytics: {
        totalJobs: 0,
        totalApplications: 0,
        totalUsers: 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;