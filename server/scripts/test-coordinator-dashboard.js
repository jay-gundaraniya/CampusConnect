const mongoose = require('mongoose');
const Event = require('../models/Event');
const User = require('../models/User');
const config = require('../config');

async function testCoordinatorDashboard() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find a coordinator user
    const coordinator = await User.findOne({ roles: 'coordinator' });
    if (!coordinator) {
      console.log('No coordinator found in database');
      return;
    }

    console.log('Testing dashboard for coordinator:', coordinator.name, coordinator._id);

    const coordinatorId = coordinator._id;

    // Get coordinator's events
    const myEvents = await Event.find({ coordinator: coordinatorId })
      .populate('participants.student', 'name email');

    console.log('Found events:', myEvents.length);

    // Calculate statistics
    const totalEvents = myEvents.length;
    
    // Active events (approved and upcoming)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const activeEvents = myEvents.filter(event => 
      event.status === 'approved' && new Date(event.date) >= today
    ).length;

    // Total participants across all events
    const totalParticipants = myEvents.reduce((sum, event) => 
      sum + (event.participants?.length || 0), 0
    );

    // Pending approvals (events with 'pending' status)
    const pendingApprovals = myEvents.filter(event => 
      event.status === 'pending'
    ).length;

    console.log('Dashboard stats:');
    console.log('- Total Events:', totalEvents);
    console.log('- Active Events:', activeEvents);
    console.log('- Total Participants:', totalParticipants);
    console.log('- Pending Approvals:', pendingApprovals);

    // Recent events (last 5 events)
    const recentEvents = myEvents
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(event => ({
        id: event._id,
        title: event.title,
        date: event.date,
        time: event.time,
        status: event.status,
        participantsCount: event.participants?.length || 0,
        createdAt: event.createdAt
      }));

    console.log('Recent events:', recentEvents.length);

  } catch (error) {
    console.error('Error testing coordinator dashboard:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testCoordinatorDashboard();
