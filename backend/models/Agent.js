const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const agentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Agent name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  mobile: {
    type: String,
    required: [true, 'Mobile number is required'],
    match: [/^\+[1-9]\d{10,14}$/, 'Please provide a valid mobile number with country code (e.g., +1234567890)']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  assignedLists: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'List'
  }],
  totalAssignedItems: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Hash password before saving
agentSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
agentSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
agentSchema.methods.toJSON = function() {
  const agentObject = this.toObject();
  delete agentObject.password;
  return agentObject;
};

module.exports = mongoose.model('Agent', agentSchema);