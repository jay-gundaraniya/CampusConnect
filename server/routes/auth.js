const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const config = require('../config');
const CoordinatorRequest = require('../models/CoordinatorRequest');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/avatars';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `avatar-${req.user.userId}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

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
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email already exists.' });
    }

    // Check for pending coordinator request
    const pendingRequest = await CoordinatorRequest.findOne({ email, status: 'pending' });
    if (pendingRequest) {
      return res.status(400).json({ message: 'There is already a pending coordinator request for this email.' });
    }

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    if (role === 'coordinator') {
      // Create a pending coordinator request
      const request = new CoordinatorRequest({ name, email, password: hashedPassword });
      await request.save();
      return res.status(201).json({
        message: 'Your request has been sent to admin for approval. You will be notified once approved.'
      });
    }

    // Determine roles and default role
    let roles, defaultRole;
    if (role === 'admin') {
      roles = ['admin'];
      defaultRole = 'admin';
    } else {
      roles = ['student'];
      defaultRole = 'student';
    }

    const user = new User({ 
      name, 
      email, 
      password: hashedPassword,
      roles,
      defaultRole,
      currentRole: defaultRole
    });
    await user.save();

    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        role: user.currentRole,
        roles: user.roles,
        defaultRole: user.defaultRole
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.currentRole,
      roles: user.roles,
      defaultRole: user.defaultRole,
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
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Set current role to default role on login
    user.currentRole = user.defaultRole;
    await user.save();

    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        role: user.currentRole,
        roles: user.roles,
        defaultRole: user.defaultRole
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Convert avatar path to full URL if it exists
    const avatarUrl = user.avatar ? `${req.protocol}://${req.get('host')}/${user.avatar.replace(/\\/g, '/')}` : user.avatar;

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.currentRole,
      roles: user.roles,
      defaultRole: user.defaultRole,
      avatar: avatarUrl,
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
    
    let user = await User.findOne({ googleId });
    if (!user) {
      user = await User.findOne({ email });
      if (user) {
        // Update existing user with Google info
        user.googleId = googleId;
        user.avatar = avatar;
        await user.save();
      } else {
        // Create new user
        let roles, defaultRole;
        if (role === 'coordinator') {
          roles = ['coordinator', 'student'];
          defaultRole = 'coordinator';
        } else if (role === 'admin') {
          roles = ['admin'];
          defaultRole = 'admin';
        } else {
          roles = ['student'];
          defaultRole = 'student';
        }

        user = new User({
          name,
          email,
          googleId,
          avatar,
          password: 'google-auth-' + Math.random().toString(36).substr(2, 9),
          roles,
          defaultRole,
          currentRole: defaultRole,
          isEmailVerified: true
        });
        await user.save();
      }
    }

    // Set current role to default role
    user.currentRole = user.defaultRole;
    await user.save();

    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        role: user.currentRole,
        roles: user.roles,
        defaultRole: user.defaultRole
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Convert avatar path to full URL if it exists
    const avatarUrl = user.avatar ? `${req.protocol}://${req.get('host')}/${user.avatar.replace(/\\/g, '/')}` : user.avatar;

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.currentRole,
      roles: user.roles,
      defaultRole: user.defaultRole,
      avatar: avatarUrl,
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

// Profile route
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Convert avatar path to full URL if it exists
    const avatarUrl = user.avatar ? `${req.protocol}://${req.get('host')}/${user.avatar.replace(/\\/g, '/')}` : user.avatar;
    console.log('Profile - Original avatar path:', user.avatar);
    console.log('Profile - Generated avatar URL:', avatarUrl);
    
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.currentRole,
      roles: user.roles,
      defaultRole: user.defaultRole,
      avatar: avatarUrl,
      studentId: user.studentId,
      department: user.department,
      year: user.year,
      bio: user.bio,
      skills: user.skills,
      interests: user.interests,
      position: user.position,
      phone: user.phone,
      createdAt: user.createdAt
    };
    
    res.json({ user: userResponse });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    console.log('Profile update request received');
    console.log('User ID:', req.user.userId);
    console.log('Request body:', req.body);
    
    const { 
      name, 
      avatar, 
      studentId, 
      department, 
      year, 
      bio, 
      skills, 
      interests, 
      position, 
      phone 
    } = req.body;
    
    const user = await User.findById(req.user.userId);
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User found:', user.email);

    // Update basic fields
    if (name) user.name = name;
    if (avatar) user.avatar = avatar;
    if (phone) user.phone = phone;

    // Update student-specific fields
    if (studentId) user.studentId = studentId;
    if (department) user.department = department;
    if (year) user.year = year;
    if (bio) user.bio = bio;
    if (skills) user.skills = skills;
    if (interests) user.interests = interests;

    // Update coordinator-specific fields
    if (position) user.position = position;

    console.log('Saving user with updated data');
    await user.save();
    
    console.log('User saved successfully');
    
    // Convert avatar path to full URL if it exists
    const avatarUrl = user.avatar ? `${req.protocol}://${req.get('host')}/${user.avatar.replace(/\\/g, '/')}` : user.avatar;
    
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.currentRole,
      roles: user.roles,
      defaultRole: user.defaultRole,
      avatar: avatarUrl,
      studentId: user.studentId,
      department: user.department,
      year: user.year,
      bio: user.bio,
      skills: user.skills,
      interests: user.interests,
      position: user.position,
      phone: user.phone,
      createdAt: user.createdAt
    };
    
    console.log('Sending response:', userResponse);
    
    res.json({
      message: 'Profile updated successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Upload profile photo
router.post('/profile/photo', authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete old avatar if exists
    if (user.avatar && fs.existsSync(user.avatar)) {
      fs.unlinkSync(user.avatar);
    }

    // Update user avatar path
    user.avatar = req.file.path;
    await user.save();

    // Return full URL for the avatar
    const avatarUrl = `${req.protocol}://${req.get('host')}/${req.file.path.replace(/\\/g, '/')}`;
    console.log('Upload - File path:', req.file.path);
    console.log('Upload - Generated avatar URL:', avatarUrl);

    res.json({
      message: 'Profile photo uploaded successfully',
      avatar: avatarUrl
    });
  } catch (error) {
    console.error('Profile photo upload error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Switch role route
router.post('/switch-role', authenticateToken, async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.roles.includes(role)) {
      return res.status(400).json({ message: 'You do not have permission to switch to this role' });
    }

    user.currentRole = role;
    await user.save();

    // Generate new token with updated role
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        role: user.currentRole,
        roles: user.roles,
        defaultRole: user.defaultRole
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Convert avatar path to full URL if it exists
    const avatarUrl = user.avatar ? `${req.protocol}://${req.get('host')}/${user.avatar.replace(/\\/g, '/')}` : user.avatar;

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.currentRole,
      roles: user.roles,
      defaultRole: user.defaultRole,
      avatar: avatarUrl,
      createdAt: user.createdAt
    };

    res.json({
      message: 'Role switched successfully',
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('Role switch error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Forgot password (all roles)
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
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
    const user = await User.findOne({ 
      resetPasswordToken: token, 
      resetPasswordExpires: { $gt: Date.now() } 
    });
    
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
      // Check if user already exists
      let user = await User.findOne({ email: request.email });
      if (user) {
        // Update existing user to include coordinator role
        if (!user.roles.includes('coordinator')) {
          user.roles.push('coordinator');
          if (user.defaultRole === 'student') {
            user.defaultRole = 'coordinator';
            user.currentRole = 'coordinator';
          }
          await user.save();
        }
      } else {
        // Create new user with coordinator and student roles
        user = new User({
          name: request.name,
          email: request.email,
          password: request.password, // already hashed
          roles: ['coordinator', 'student'],
          defaultRole: 'coordinator',
          currentRole: 'coordinator'
        });
        await user.save();
      }
      
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
    const count = await User.countDocuments({ roles: 'coordinator' });
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
    const count = await User.countDocuments({ roles: 'student' });
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
    const coordinators = await User.find({ roles: 'coordinator' }, '-password'); // exclude password
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
    const user = await User.findById(req.params.id);
    if (!user || !user.roles.includes('coordinator')) {
      return res.status(404).json({ message: 'Coordinator not found' });
    }
    
    // Remove coordinator role
    user.roles = user.roles.filter(role => role !== 'coordinator');
    
    // If coordinator was the default role, set a new default
    if (user.defaultRole === 'coordinator') {
      user.defaultRole = user.roles[0] || 'student';
    }
    
    // If coordinator was the current role, switch to default
    if (user.currentRole === 'coordinator') {
      user.currentRole = user.defaultRole;
    }
    
    await user.save();
    res.json({ message: 'Coordinator role removed successfully' });
  } catch (error) {
    console.error('Error deleting coordinator:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

module.exports = router; 