const express = require('express');
const authenticateToken = require('../middleware/authenticateToken');

const router = express.Router();

// Example protected student route
router.get('/dashboard', authenticateToken, (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ message: 'Student access required' });
  }
  res.json({ message: 'This is a protected student dashboard route!' });
});

module.exports = router; 