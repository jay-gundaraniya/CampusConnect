const mongoose = require('mongoose');
const User = require('../models/User');
const config = require('../config');

async function checkUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all users
    const users = await User.find({}, 'name email roles defaultRole');
    console.log('Total users found:', users.length);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. Name: ${user.name}, Email: ${user.email}, Roles: ${JSON.stringify(user.roles)}, Default: ${user.defaultRole}`);
    });

    // Check for coordinators specifically
    const coordinators = await User.find({ roles: 'coordinator' });
    console.log('\nCoordinators found:', coordinators.length);
    
    // Check for users with coordinator role
    const usersWithCoordinatorRole = await User.find({ roles: { $in: ['coordinator'] } });
    console.log('Users with coordinator role:', usersWithCoordinatorRole.length);

  } catch (error) {
    console.error('Error checking users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

checkUsers();