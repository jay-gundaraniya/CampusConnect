const express = require('express');
const authenticateToken = require('../middleware/authenticateToken');
const User = require('../models/User');

const router = express.Router();

// Example protected coordinator route
router.get('/dashboard', authenticateToken, (req, res) => {
  if (!req.user.roles || !req.user.roles.includes('coordinator')) {
    return res.status(403).json({ message: 'Coordinator access required' });
  }
  res.json({ message: 'This is a protected coordinator dashboard route!' });
});

// Get all students (for coordinator to manage)
router.get('/students', authenticateToken, async (req, res) => {
  try {
    if (!req.user.roles || !req.user.roles.includes('coordinator')) {
      return res.status(403).json({ message: 'Coordinator access required' });
    }

    const students = await User.find({ roles: 'student' }, '-password');
    res.json({ students });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Promote student to coordinator
router.post('/promote-student', authenticateToken, async (req, res) => {
  try {
    if (!req.user.roles || !req.user.roles.includes('coordinator')) {
      return res.status(403).json({ message: 'Coordinator access required' });
    }

    const { studentId } = req.body;
    
    if (!studentId) {
      return res.status(400).json({ message: 'Student ID is required' });
    }

    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if student already has coordinator role
    if (student.roles.includes('coordinator')) {
      return res.status(400).json({ message: 'Student is already a coordinator' });
    }

    // Add coordinator role to student
    await student.addRole('coordinator');
    
    // Fetch updated student data
    const updatedStudent = await User.findById(studentId, '-password');

    res.json({ 
      message: 'Student promoted to coordinator successfully',
      student: updatedStudent
    });
  } catch (error) {
    console.error('Error promoting student:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Remove coordinator role from user
router.post('/demote-coordinator', authenticateToken, async (req, res) => {
  try {
    if (!req.user.roles || !req.user.roles.includes('coordinator')) {
      return res.status(403).json({ message: 'Coordinator access required' });
    }

    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has coordinator role
    if (!user.roles.includes('coordinator')) {
      return res.status(400).json({ message: 'User is not a coordinator' });
    }

    // Don't allow demoting yourself
    if (user._id.toString() === req.user.userId) {
      return res.status(400).json({ message: 'Cannot demote yourself' });
    }

    // Remove coordinator role
    await user.removeRole('coordinator');
    
    // Fetch updated user data
    const updatedUser = await User.findById(userId, '-password');

    res.json({ 
      message: 'Coordinator role removed successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error demoting coordinator:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router; 