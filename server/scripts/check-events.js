const mongoose = require('mongoose');
const Event = require('../models/Event');
const User = require('../models/User');
const config = require('../config');

async function checkEvents() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check all events
    const allEvents = await Event.find({}).populate('coordinator', 'name email');
    console.log(`\nTotal events in database: ${allEvents.length}`);
    
    allEvents.forEach((event, index) => {
      console.log(`\nEvent ${index + 1}:`);
      console.log(`  Title: ${event.title}`);
      console.log(`  Status: ${event.status}`);
      console.log(`  Date: ${event.date}`);
      console.log(`  Time: ${event.time}`);
      console.log(`  Location: ${event.location}`);
      console.log(`  Coordinator: ${event.coordinator?.name || 'N/A'}`);
    });

    // Check approved events
    const approvedEvents = await Event.find({ status: 'approved' });
    console.log(`\nApproved events: ${approvedEvents.length}`);

    // Check future events
    const now = new Date();
    const futureEvents = await Event.find({
      status: 'approved',
      date: { $gte: now }
    });
    console.log(`\nFuture approved events: ${futureEvents.length}`);

    // Check events with different statuses
    const statusCounts = await Event.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    console.log('\nEvents by status:');
    statusCounts.forEach(status => {
      console.log(`  ${status._id}: ${status.count}`);
    });

  } catch (error) {
    console.error('Error checking events:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the script
checkEvents();
