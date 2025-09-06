const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true, 
    lowercase: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  googleId: { 
    type: String, 
    sparse: true 
  },
  avatar: { 
    type: String 
  },
  roles: {
    type: [String],
    enum: ['student', 'coordinator', 'admin'],
    default: ['student'],
    required: true
  },
  defaultRole: {
    type: String,
    enum: ['student', 'coordinator', 'admin'],
    default: 'student',
    required: true
  },
  currentRole: {
    type: String,
    enum: ['student', 'coordinator', 'admin'],
    default: function() {
      return this.defaultRole;
    }
  },
  isEmailVerified: { 
    type: Boolean, 
    default: false 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
}, {
  timestamps: true
});

// Index for efficient queries
userSchema.index({ email: 1 });
userSchema.index({ roles: 1 });
userSchema.index({ defaultRole: 1 });

// Virtual to check if user has a specific role
userSchema.virtual('hasRole').get(function() {
  return (role) => this.roles.includes(role);
});

// Method to add a role
userSchema.methods.addRole = function(role) {
  if (!this.roles.includes(role)) {
    this.roles.push(role);
  }
  return this.save();
};

// Method to remove a role
userSchema.methods.removeRole = function(role) {
  this.roles = this.roles.filter(r => r !== role);
  // If removing the default role, set a new default
  if (this.defaultRole === role && this.roles.length > 0) {
    this.defaultRole = this.roles[0];
  }
  // If removing the current role, switch to default
  if (this.currentRole === role) {
    this.currentRole = this.defaultRole;
  }
  return this.save();
};

// Method to switch current role
userSchema.methods.switchRole = function(role) {
  if (this.roles.includes(role)) {
    this.currentRole = role;
    return this.save();
  }
  throw new Error('User does not have the specified role');
};

// Static method to find users by role
userSchema.statics.findByRole = function(role) {
  return this.find({ roles: role });
};

// Static method to find users by current role
userSchema.statics.findByCurrentRole = function(role) {
  return this.find({ currentRole: role });
};

const User = mongoose.model('User', userSchema);

module.exports = User;
