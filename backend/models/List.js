const mongoose = require('mongoose');

const listItemSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'contacted', 'completed', 'failed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

const listSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: [true, 'Filename is required']
  },
  originalName: {
    type: String,
    required: [true, 'Original filename is required']
  },
  totalItems: {
    type: Number,
    required: [true, 'Total items count is required']
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  distributionComplete: {
    type: Boolean,
    default: false
  },
  agents: [{
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent',
      required: true
    },
    items: [listItemSchema],
    assignedCount: {
      type: Number,
      default: 0
    }
  }]
}, {
  timestamps: true
});

// Update agent's assigned count when items are modified
listSchema.pre('save', function(next) {
  this.agents.forEach(agentData => {
    agentData.assignedCount = agentData.items.length;
  });
  next();
});

module.exports = mongoose.model('List', listSchema);