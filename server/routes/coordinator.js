const express = require('express');
const authenticateToken = require('../middleware/authenticateToken');

const router = express.Router();

// Example protected coordinator route
router.get('/dashboard', authenticateToken, (req, res) => {
  if (req.user.role !== 'cordinator') {
    return res.status(403).json({ message: 'Coordinator access required' });
  }
  res.json({ message: 'This is a protected coordinator dashboard route!' });
});

module.exports = router; 