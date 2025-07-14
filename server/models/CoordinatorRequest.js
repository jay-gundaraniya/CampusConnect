const mongoose = require('mongoose');

const coordinatorRequestSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true }, // hashed password
  createdAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
});

const CoordinatorRequest = mongoose.model('CoordinatorRequest', coordinatorRequestSchema);

module.exports = CoordinatorRequest; 