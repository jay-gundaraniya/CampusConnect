const express = require('express');
const authenticateToken = require('../middleware/authenticateToken');
const Event = require('../models/Event');
const Certificate = require('../models/Certificate');
const User = require('../models/User');

const router = express.Router();

// Get student dashboard data
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    console.log('Dashboard request received for user:', req.user.userId);
    
    // Fetch user from database to get current roles
    const user = await User.findById(req.user.userId);
    if (!user) {
      console.log('User not found:', req.user.userId);
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('User found:', user.name, 'Roles:', user.roles);
    
    // Allow access if user has student role (even if they have other roles too)
    if (!user.roles || !user.roles.includes('student')) {
      console.log('User does not have student role');
      return res.status(403).json({ message: 'Only students can access this route' });
    }

    const studentId = req.user.userId;
    console.log('Processing dashboard for student:', studentId);

    // Get upcoming events (approved events with future dates)
    // Use start of today to avoid timezone issues
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    console.log('Looking for events after:', today);
    
    const upcomingEvents = await Event.find({
      status: 'approved',
      date: { $gte: today }
    })
    .populate('coordinator', 'name email')
    .sort({ date: 1 })
    .limit(4);
    
    console.log('Found upcoming events:', upcomingEvents.length);

    // Get student's registered events
    const myEvents = await Event.find({
      'participants.student': studentId
    })
    .populate('coordinator', 'name email')
    .sort({ date: 1 });

    // Get student's certificates
    const certificates = await Certificate.find({ student: studentId })
      .populate('event', 'title date')
      .sort({ issuedDate: -1 });

    // Get recent activities (last 3 registered events)
    const recentActivities = await Event.find({
      'participants.student': studentId
    })
    .populate('coordinator', 'name email')
    .sort({ 'participants.registeredAt': -1 })
    .limit(3);

    // Count statistics
    const upcomingEventsCount = await Event.countDocuments({
      status: 'approved',
      date: { $gte: today }
    });
    
    console.log('Upcoming events count:', upcomingEventsCount);

    const myEventsCount = myEvents.length;
    const certificatesCount = certificates.length;
    
    console.log('My events count:', myEventsCount);
    console.log('Certificates count:', certificatesCount);
    console.log('Recent activities count:', recentActivities.length);

    // Format recent activities
    const formattedActivities = recentActivities.map(event => {
      const participant = event.participants.find(p => p.student.toString() === studentId);
      return {
        id: event._id,
        title: `Registered for "${event.title}"`,
        date: participant.registeredAt,
        type: 'registration'
      };
    });

    // Format upcoming events for timeline
    const formattedUpcomingEvents = upcomingEvents.map(event => {
      const isRegistered = event.participants.some(p => p.student.toString() === studentId);
      return {
        id: event._id,
        title: event.title,
        date: event.date,
        time: event.time,
        location: event.location,
        status: isRegistered ? 'Registered' : 'Register'
      };
    });

    const responseData = {
      stats: {
        upcomingEvents: upcomingEventsCount,
        myEvents: myEventsCount,
        certificates: certificatesCount
      },
      recentActivities: formattedActivities,
      upcomingEvents: formattedUpcomingEvents,
      certificates: certificates.slice(0, 3) // Latest 3 certificates
    };
    
    console.log('Sending response:', JSON.stringify(responseData, null, 2));
    
    res.json(responseData);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
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