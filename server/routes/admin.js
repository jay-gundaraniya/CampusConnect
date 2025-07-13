const express = require('express');
const authenticateToken = require('../middleware/authenticateToken');
const requireAdmin = require('../middleware/requireAdmin');

const router = express.Router();

// Example protected admin route
router.get('/secret', authenticateToken, requireAdmin, (req, res) => {
  res.json({ message: 'This is a protected admin route!' });
});

module.exports = router; 