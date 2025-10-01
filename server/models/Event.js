const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true, 
    trim: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  date: { 
    type: Date, 
    required: true 
  },
  // Optional end date for multi-day events
  endDate: {
    type: Date,
    default: null
  },
  time: { 
    type: String, 
    required: true 
  },
  location: { 
    type: String, 
    required: true 
  },
  category: { 
    type: String, 
    required: true,
    enum: ['technology', 'business', 'arts', 'sports', 'academic', 'social', 'other']
  },
  eventType: { 
    type: String, 
    required: true,
    enum: ['workshop', 'seminar', 'conference', 'competition', 'cultural', 'sports', 'other']
  },
  maxParticipants: { 
    type: Number, 
    default: null 
  },
  currentParticipants: { 
    type: Number, 
    default: 0 
  },
  status: { 
    type: String, 
    enum: ['draft', 'pending', 'approved', 'rejected', 'cancelled', 'completed'],
    default: 'pending'
  },
  coordinator: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  participants: [{
    student: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    registeredAt: { 
      type: Date, 
      default: Date.now 
    },
    status: { 
      type: String, 
      enum: ['registered', 'attended', 'no-show'],
      default: 'registered'
    }
  }],
  requirements: { 
    type: String 
  },
  contactEmail: { 
    type: String 
  },
  contactPhone: { 
    type: String 
  },
  image: { 
    type: String 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Update the updatedAt field before saving
eventSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event; 