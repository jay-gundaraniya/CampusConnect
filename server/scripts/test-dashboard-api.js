const mongoose = require('mongoose');
const Event = require('../models/Event');
const User = require('../models/User');
const config = require('../config');

async function testDashboardAPI() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Simulate the dashboard API logic
    const studentId = '507f1f77bcf86cd799439011'; // Dummy student ID for testing

    // Get upcoming events (approved events with future dates)
    const upcomingEvents = await Event.find({
      status: 'approved',
      date: { $gte: new Date() }
    })
    .populate('coordinator', 'name email')
    .sort({ date: 1 })
    .limit(4);

    console.log(`\nUpcoming events found: ${upcomingEvents.length}`);
    upcomingEvents.forEach((event, index) => {
      console.log(`\nEvent ${index + 1}:`);
      console.log(`  Title: ${event.title}`);
      console.log(`  Date: ${event.date}`);
      console.log(`  Time: ${event.time}`);
      console.log(`  Location: ${event.location}`);
      console.log(`  Coordinator: ${event.coordinator?.name || 'N/A'}`);
    });

    // Get student's registered events
    const myEvents = await Event.find({
      'participants.student': studentId
    })
    .populate('coordinator', 'name email')
    .sort({ date: 1 });

    console.log(`\nMy events found: ${myEvents.length}`);

    // Count statistics
    const upcomingEventsCount = await Event.countDocuments({
      status: 'approved',
      date: { $gte: new Date() }
    });

    const myEventsCount = myEvents.length;

    console.log(`\nStatistics:`);
    console.log(`  Upcoming Events Count: ${upcomingEventsCount}`);
    console.log(`  My Events Count: ${myEventsCount}`);

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

    console.log(`\nFormatted upcoming events:`);
    formattedUpcomingEvents.forEach((event, index) => {
      console.log(`\nEvent ${index + 1}:`);
      console.log(`  ID: ${event.id}`);
      console.log(`  Title: ${event.title}`);
      console.log(`  Date: ${event.date}`);
      console.log(`  Time: ${event.time}`);
      console.log(`  Location: ${event.location}`);
      console.log(`  Status: ${event.status}`);
    });

  } catch (error) {
    console.error('Error testing dashboard API:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the script
testDashboardAPI();
