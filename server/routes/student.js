const express = require('express');
const authenticateToken = require('../middleware/authenticateToken');
const Event = require('../models/Event');
const Certificate = require('../models/Certificate');
const User = require('../models/User');

const router = express.Router();

// Example protected student route
router.get('/dashboard', authenticateToken, (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ message: 'Student access required' });
  }
  res.json({ message: 'This is a protected student dashboard route!' });
});

// Get student activity summary
router.get('/activity-summary', authenticateToken, async (req, res) => {
  try {
    // Fetch user from database to get current roles
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!user.roles || !user.roles.includes('student')) {
      return res.status(403).json({ message: 'Only students can access this route' });
    }

    const studentId = req.user.userId;

    // Count events attended (where student is a participant)
    const eventsAttended = await Event.countDocuments({
      'participants.student': studentId,
      status: 'approved'
    });

    // Count events organized (where student is coordinator and has coordinator role)
    const eventsOrganized = await Event.countDocuments({
      coordinator: studentId,
      status: { $in: ['approved', 'completed'] }
    });

    // Count certificates earned
    const certificatesEarned = await Certificate.countDocuments({
      student: studentId
    });

    // Get member since year
    const memberSince = user.createdAt ? new Date(user.createdAt).getFullYear().toString() : '';

    res.json({
      eventsAttended,
      eventsOrganized,
      certificatesEarned,
      memberSince
    });
  } catch (error) {
    console.error('Error fetching activity summary:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router; 