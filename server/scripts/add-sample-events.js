const mongoose = require('mongoose');
const Event = require('../models/Event');
const User = require('../models/User');
const config = require('../config');

async function addSampleEvents() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find a user to be the coordinator (or create one if none exists)
    let coordinator = await User.findOne({ roles: { $in: ['coordinator', 'admin'] } });
    
    if (!coordinator) {
      console.log('No coordinator found. Creating a sample coordinator...');
      coordinator = new User({
        name: 'Sample Coordinator',
        email: 'coordinator@example.com',
        password: 'hashedpassword', // In real app, this would be hashed
        roles: ['coordinator']
      });
      await coordinator.save();
    }

    // Check if events already exist
    const existingEvents = await Event.countDocuments();
    if (existingEvents > 0) {
      console.log(`Found ${existingEvents} existing events. Skipping sample data creation.`);
      return;
    }

    // Create sample events
    const sampleEvents = [
      {
        title: 'Tech Innovation Summit 2024',
        description: 'Join us for an exciting day of technology innovation and networking.',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        time: '10:00 AM - 4:00 PM',
        location: 'Main Auditorium',
        category: 'technology',
        eventType: 'conference',
        maxParticipants: 100,
        currentParticipants: 0,
        status: 'approved',
        coordinator: coordinator._id,
        requirements: 'Basic programming knowledge recommended',
        contactEmail: 'tech@campus.edu',
        contactPhone: '+1-555-0123'
      },
      {
        title: 'Web Development Workshop',
        description: 'Learn modern web development techniques and best practices.',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        time: '2:00 PM - 6:00 PM',
        location: 'Computer Lab 101',
        category: 'technology',
        eventType: 'workshop',
        maxParticipants: 30,
        currentParticipants: 0,
        status: 'approved',
        coordinator: coordinator._id,
        requirements: 'Laptop required',
        contactEmail: 'webdev@campus.edu',
        contactPhone: '+1-555-0124'
      },
      {
        title: 'AI & Machine Learning Seminar',
        description: 'Explore the latest trends in artificial intelligence and machine learning.',
        date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
        time: '11:00 AM - 3:00 PM',
        location: 'Science Building Room 205',
        category: 'technology',
        eventType: 'seminar',
        maxParticipants: 50,
        currentParticipants: 0,
        status: 'approved',
        coordinator: coordinator._id,
        requirements: 'Basic math and programming knowledge',
        contactEmail: 'ai@campus.edu',
        contactPhone: '+1-555-0125'
      },
      {
        title: 'Coding Competition Finals',
        description: 'Watch the final round of our annual coding competition.',
        date: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000), // 28 days from now
        time: '9:00 AM - 5:00 PM',
        location: 'Competition Hall',
        category: 'technology',
        eventType: 'competition',
        maxParticipants: 200,
        currentParticipants: 0,
        status: 'approved',
        coordinator: coordinator._id,
        requirements: 'Open to all students',
        contactEmail: 'competition@campus.edu',
        contactPhone: '+1-555-0126'
      }
    ];

    // Insert sample events
    const createdEvents = await Event.insertMany(sampleEvents);
    console.log(`Created ${createdEvents.length} sample events:`);
    createdEvents.forEach(event => {
      console.log(`- ${event.title} (${event.date.toLocaleDateString()})`);
    });

    console.log('Sample events created successfully!');
  } catch (error) {
    console.error('Error creating sample events:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
addSampleEvents();
