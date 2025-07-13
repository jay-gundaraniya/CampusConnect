const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/campusconnect',
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
}; 