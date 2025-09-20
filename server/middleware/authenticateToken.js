const jwt = require('jsonwebtoken');
const config = require('../config');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  console.log('Auth header:', authHeader);
  console.log('Token:', token ? token.substring(0, 20) + '...' : 'No token');
  
  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }
  jwt.verify(token, config.JWT_SECRET, (err, user) => {
    if (err) {
      console.log('Token verification failed:', err.message);
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    console.log('Token verified for user:', user.userId);
    req.user = user;
    next();
  });
}

module.exports = authenticateToken;
