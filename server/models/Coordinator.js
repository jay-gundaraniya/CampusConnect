const mongoose = require('mongoose');

const coordinatorSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  googleId: { type: String, sparse: true },
  avatar: { type: String },
  isEmailVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
});

const Coordinator = mongoose.model('Coordinator', coordinatorSchema);

module.exports = Coordinator; 