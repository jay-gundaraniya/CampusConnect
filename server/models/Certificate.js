const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  issuedAt: {
    type: Date,
    default: Date.now
  },
  certificateId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'issued', 'expired'],
    default: 'issued'
  }
}, {
  timestamps: true
});

// Generate unique certificate ID
certificateSchema.pre('save', function(next) {
  if (!this.certificateId) {
    this.certificateId = new mongoose.Types.ObjectId().toString();
  }
  next();
});

module.exports = mongoose.model('Certificate', certificateSchema);