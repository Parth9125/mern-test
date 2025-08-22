const { validationResult } = require('express-validator');
const Agent = require('../models/Agent');

// @desc    Create a new agent
// @route   POST /api/agents
// @access  Private (Admin only)
const createAgent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, mobile, password } = req.body;

    // Check if agent with email already exists
    const existingAgent = await Agent.findOne({ 
      email: email.toLowerCase() 
    });

    if (existingAgent) {
      return res.status(400).json({
        message: 'Agent with this email already exists'
      });
    }

    // Create new agent
    const agent = new Agent({
      name: name.trim(),
      email: email.toLowerCase(),
      mobile: mobile.trim(),
      password
    });

    await agent.save();

    res.status(201).json({
      message: 'Agent created successfully',
      agent: {
        id: agent._id,
        name: agent.name,
        email: agent.email,
        mobile: agent.mobile,
        isActive: agent.isActive,
        totalAssignedItems: agent.totalAssignedItems,
        createdAt: agent.createdAt
      }
    });

  } catch (error) {
    console.error('Create agent error:', error);

    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    res.status(500).json({
      message: 'Server error while creating agent'
    });
  }
};

// @desc    Get all agents
// @route   GET /api/agents
// @access  Private (Admin only)
const getAllAgents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (req.query.status === 'active') {
      filter.isActive = true;
    } else if (req.query.status === 'inactive') {
      filter.isActive = false;
    }

    // Search functionality
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { mobile: searchRegex }
      ];
    }

    const agents = await Agent.find(filter)
      .select('-password')
      .populate('assignedLists', 'originalName totalItems createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Agent.countDocuments(filter);

    res.json({
      agents,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalAgents: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Get all agents error:', error);
    res.status(500).json({
      message: 'Server error while fetching agents'
    });
  }
};

// @desc    Get agent by ID
// @route   GET /api/agents/:id
// @access  Private (Admin only)
const getAgentById = async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id)
      .select('-password')
      .populate('assignedLists', 'originalName totalItems createdAt distributionComplete');

    if (!agent) {
      return res.status(404).json({
        message: 'Agent not found'
      });
    }

    res.json({
      agent
    });

  } catch (error) {
    console.error('Get agent by ID error:', error);

    if (error.name === 'CastError') {
      return res.status(404).json({
        message: 'Agent not found'
      });
    }

    res.status(500).json({
      message: 'Server error while fetching agent'
    });
  }
};

// @desc    Update agent
// @route   PUT /api/agents/:id
// @access  Private (Admin only)
const updateAgent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, mobile, isActive } = req.body;
    const updates = {};

    if (name) updates.name = name.trim();
    if (email) updates.email = email.toLowerCase();
    if (mobile) updates.mobile = mobile.trim();
    if (typeof isActive === 'boolean') updates.isActive = isActive;

    // Check if email is being changed and if it's already in use
    if (email) {
      const existingAgent = await Agent.findOne({
        email: email.toLowerCase(),
        _id: { $ne: req.params.id }
      });

      if (existingAgent) {
        return res.status(400).json({
          message: 'Agent with this email already exists'
        });
      }
    }

    const agent = await Agent.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!agent) {
      return res.status(404).json({
        message: 'Agent not found'
      });
    }

    res.json({
      message: 'Agent updated successfully',
      agent
    });

  } catch (error) {
    console.error('Update agent error:', error);

    if (error.name === 'CastError') {
      return res.status(404).json({
        message: 'Agent not found'
      });
    }

    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    res.status(500).json({
      message: 'Server error while updating agent'
    });
  }
};

// @desc    Delete agent
// @route   DELETE /api/agents/:id
// @access  Private (Admin only)
const deleteAgent = async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id);

    if (!agent) {
      return res.status(404).json({
        message: 'Agent not found'
      });
    }

    // Check if agent has assigned lists
    if (agent.assignedLists.length > 0) {
      return res.status(400).json({
        message: 'Cannot delete agent with assigned lists. Please reassign or remove lists first.'
      });
    }

    await Agent.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Agent deleted successfully'
    });

  } catch (error) {
    console.error('Delete agent error:', error);

    if (error.name === 'CastError') {
      return res.status(404).json({
        message: 'Agent not found'
      });
    }

    res.status(500).json({
      message: 'Server error while deleting agent'
    });
  }
};

// @desc    Get agents summary/stats
// @route   GET /api/agents/stats
// @access  Private (Admin only)
const getAgentsStats = async (req, res) => {
  try {
    const totalAgents = await Agent.countDocuments();
    const activeAgents = await Agent.countDocuments({ isActive: true });
    const inactiveAgents = await Agent.countDocuments({ isActive: false });

    // Get top agents by assigned items
    const topAgents = await Agent.find({ isActive: true })
      .select('name email totalAssignedItems')
      .sort({ totalAssignedItems: -1 })
      .limit(5);

    res.json({
      stats: {
        total: totalAgents,
        active: activeAgents,
        inactive: inactiveAgents
      },
      topAgents
    });

  } catch (error) {
    console.error('Get agents stats error:', error);
    res.status(500).json({
      message: 'Server error while fetching agent statistics'
    });
  }
};

module.exports = {
  createAgent,
  getAllAgents,
  getAgentById,
  updateAgent,
  deleteAgent,
  getAgentsStats
};