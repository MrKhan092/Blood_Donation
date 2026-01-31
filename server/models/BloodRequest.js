const mongoose = require('mongoose');

const bloodRequestSchema = new mongoose.Schema({
  // Requester Info
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Request Details
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: [true, 'Blood type is required']
  },
  
  unitsNeeded: {
    type: Number,
    required: [true, 'Units needed is required'],
    min: 1,
    default: 1
  },
  
  urgency: {
    type: String,
    enum: ['critical', 'urgent', 'normal'],
    default: 'urgent'
  },
  
  // Location Info
  location: {
    address: String,
    city: String,
    state: String,
    pincode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  // Hospital/Patient Details
  hospitalName: String,
  patientName: {
    type: String,
    required: [true, 'Patient name is required']
  },
  contactNumber: {
    type: String,
    required: [true, 'Contact number is required']
  },
  
  // Additional Info
  reason: String,
  notes: String,
  
  // Status
  status: {
    type: String,
    enum: ['active', 'fulfilled', 'cancelled', 'expired'],
    default: 'active'
  },
  
  // Responses from donors
  responses: [{
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['accepted', 'declined', 'pending'],
      default: 'pending'
    },
    respondedAt: {
      type: Date,
      default: Date.now
    },
    message: String
  }],
  
  // Timestamps
  expiresAt: {
    type: Date,
    required: true,
    default: function() {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    }
  }
  
}, {
  timestamps: true
});

// Index for searching
bloodRequestSchema.index({ bloodType: 1, status: 1, createdAt: -1 });
bloodRequestSchema.index({ 'location.city': 1, status: 1 });

// Auto-expire old requests
bloodRequestSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('BloodRequest', bloodRequestSchema);