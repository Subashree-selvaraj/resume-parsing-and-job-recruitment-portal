const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/admin/users
// @desc    Get all users (Admin only)
// @access  Private/Admin
router.get('/users', protect, authorize('admin'), async (req, res) => {
  try {
    res.json({
      success: true,
      users: []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/admin/verify-recruiter/:id
// @desc    Verify a recruiter (Admin only)
// @access  Private/Admin
router.put('/verify-recruiter/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await require('../models/User').findById(req.params.id);
    if (!user || user.role !== 'recruiter') {
      return res.status(404).json({ success: false, message: 'Recruiter not found' });
    }
    user.recruiterProfile.isVerifiedRecruiter = true;
    user.isVerified = true;
    await user.save();
    res.json({ success: true, message: 'Recruiter verified successfully', user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;