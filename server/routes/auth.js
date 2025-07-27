const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Coordinator = require('../models/Coordinator');
const Admin = require('../models/Admin');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const config = require('../config');
const CoordinatorRequest = require('../models/CoordinatorRequest');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Register route
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    // Check if user already exists in any collection or as a pending request
    const [student, coordinator, admin, pendingRequest] = await Promise.all([
      Student.findOne({ email }),
      Coordinator.findOne({ email }),
      Admin.findOne({ email }),
      CoordinatorRequest.findOne({ email, status: 'pending' })
    ]);
    if (student || coordinator || admin) {
      return res.status(400).json({ message: 'A user with this email already exists.' });
    }
    if (pendingRequest) {
      return res.status(400).json({ message: 'There is already a pending coordinator request for this email.' });
    }
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    if (role === 'cordinator') {
      // Create a pending coordinator request
      const request = new CoordinatorRequest({ name, email, password: hashedPassword });
      await request.save();
      return res.status(201).json({
        message: 'Your request has been sent to admin for approval. You will be notified once approved.'
      });
    }
    let Model, userRole;
    if (role === 'admin') {
      Model = Admin;
      userRole = 'admin';
    } else {
      Model = Student;
      userRole = 'student';
    }
    const user = new Model({ name, email, password: hashedPassword });
    await user.save();
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: userRole },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: userRole,
      createdAt: user.createdAt
    };
    res.status(201).json({
      message: 'User registered successfully',
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await Admin.findOne({ email });
    let userRole = 'admin';
    if (!user) {
      user = await Coordinator.findOne({ email });
      userRole = 'cordinator';
    }
    if (!user) {
      user = await Student.findOne({ email });
      userRole = 'student';
    }
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: userRole },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: userRole,
      avatar: user.avatar,
      createdAt: user.createdAt
    };
    res.json({
      message: 'Login successful',
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Google OAuth route
router.post('/google', async (req, res) => {
  try {
    const { googleId, name, email, avatar, role } = req.body;
    let Model, userRole;
    if (role === 'cordinator') {
      Model = Coordinator;
      userRole = 'cordinator';
    } else if (role === 'admin') {
      Model = Admin;
      userRole = 'admin';
    } else {
      Model = Student;
      userRole = 'student';
    }
    let user = await Model.findOne({ googleId });
    if (!user) {
      user = await Model.findOne({ email });
      if (user) {
        user.googleId = googleId;
        user.avatar = avatar;
        await user.save();
      } else {
        user = new Model({
          name,
          email,
          googleId,
          avatar,
          password: 'google-auth-' + Math.random().toString(36).substr(2, 9),
          isEmailVerified: true
        });
        await user.save();
      }
    }
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: userRole },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: userRole,
      avatar: user.avatar,
      createdAt: user.createdAt
    };
    res.json({
      message: 'Google authentication successful',
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ message: 'Internal server error: ' + error.message });
  }
});

// Profile route (admin only for now)
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await Admin.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update profile (admin only for now)
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, role } = req.body;
    const user = await Admin.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (name) user.name = name;
    if (role) user.role = role;
    await user.save();
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      createdAt: user.createdAt
    };
    res.json({
      message: 'Profile updated successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Forgot password (all roles)
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    let user = await Admin.findOne({ email });
    let userRole = 'admin';
    if (!user) {
      user = await Coordinator.findOne({ email });
      userRole = 'cordinator';
    }
    if (!user) {
      user = await Student.findOne({ email });
      userRole = 'student';
    }
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 1000 * 60 * 60; // 1 hour
    await user.save();

    // Send email with nodemailer
    const resetLink = `http://localhost:5173/reset-password/${token}`;
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    await transporter.sendMail({
      to: email,
      subject: 'CampusConnect Password Reset',
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password. This link will expire in 1 hour.</p>`
    });

    res.json({ message: 'Password reset link sent to your email (if registered).' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Reset password (all roles)
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    let user = await Admin.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
    let userRole = 'admin';
    if (!user) {
      user = await Coordinator.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
      userRole = 'cordinator';
    }
    if (!user) {
      user = await Student.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
      userRole = 'student';
    }
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// List all pending coordinator requests (admin only)
router.get('/pending-coordinator-requests', authenticateToken, async (req, res) => {
  try {
    // Only allow admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const requests = await CoordinatorRequest.find({ status: 'pending' }).select('-password'); // don't send password hash to frontend
    res.json({ requests });
  } catch (error) {
    console.error('Error fetching coordinator requests:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Approve or decline a coordinator request (admin only)
router.post('/handle-coordinator-request', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const { requestId, action } = req.body; // action: 'approve' or 'decline'
    const request = await CoordinatorRequest.findById(requestId);
    if (!request || request.status !== 'pending') {
      return res.status(404).json({ message: 'Request not found or already handled' });
    }
    if (action === 'approve') {
      // Create Coordinator account
      const Coordinator = require('../models/Coordinator');
      const exists = await Coordinator.findOne({ email: request.email });
      if (exists) {
        return res.status(400).json({ message: 'A coordinator with this email already exists.' });
      }
      const newCoordinator = new Coordinator({
        name: request.name,
        email: request.email,
        password: request.password // already hashed
      });
      await newCoordinator.save();
      request.status = 'approved';
      await request.save();
      await CoordinatorRequest.findByIdAndDelete(requestId); // remove after approval
      // Send approval email
      try {
        const transporter = nodemailer.createTransport({
          service: 'Gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });
        await transporter.sendMail({
          to: request.email,
          subject: 'Coordinator Request Approved',
          html: `<p>Your request is accepted and you are now a Event coordinator.</p>`
        });
      } catch (emailError) {
        // Optionally, you can log or handle the error here if needed
      }
      return res.json({ message: 'Coordinator request approved and account created.' });
    } else if (action === 'decline') {
      request.status = 'rejected';
      await request.save();
      await CoordinatorRequest.findByIdAndDelete(requestId);
      // Send rejection email
      try {
        const transporter = nodemailer.createTransport({
          service: 'Gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });
        await transporter.sendMail({
          to: request.email,
          subject: 'Coordinator Request Denied',
          html: `<p>Your request is denied for event coordinator.</p>`
        });
      } catch (emailError) {
        // Optionally, you can log or handle the error here if needed
      }
      return res.json({ message: 'Coordinator request declined.' });
    } else {
      return res.status(400).json({ message: 'Invalid action.' });
    }
  } catch (error) {
    console.error('Error handling coordinator request:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get total number of coordinators (admin only)
router.get('/coordinator-count', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const Coordinator = require('../models/Coordinator');
    const count = await Coordinator.countDocuments();
    res.json({ count });
  } catch (error) {
    console.error('Error fetching coordinator count:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Get total number of students (admin only)
router.get('/student-count', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const Student = require('../models/Student');
    const count = await Student.countDocuments();
    res.json({ count });
  } catch (error) {
    console.error('Error fetching student count:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Get all coordinators (admin only)
router.get('/coordinators', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const Coordinator = require('../models/Coordinator');
    const coordinators = await Coordinator.find({}, '-password'); // exclude password
    res.json({ coordinators });
  } catch (error) {
    console.error('Error fetching coordinators:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Delete a coordinator (admin only)
router.delete('/coordinator/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const Coordinator = require('../models/Coordinator');
    const deleted = await Coordinator.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Coordinator not found' });
    }
    res.json({ message: 'Coordinator deleted successfully' });
  } catch (error) {
    console.error('Error deleting coordinator:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

module.exports = router; 