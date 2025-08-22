const { validationResult } = require('express-validator');
const List = require('../models/List');
const Agent = require('../models/Agent');
const { parseCSVFile, distributeItems, cleanupFile } = require('../utils/csvParser');
const path = require('path');

// @desc    Upload and distribute CSV file
// @route   POST /api/lists/upload
// @access  Private (Admin only)
const uploadAndDistributeCSV = async (req, res) => {
  let filePath = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        message: 'Please upload a CSV, XLSX, or XLS file'
      });
    }

    filePath = req.file.path;

    // Parse the uploaded file
    const parsedData = await parseCSVFile(filePath);

    if (!parsedData || parsedData.length === 0) {
      await cleanupFile(filePath);
      return res.status(400).json({
        message: 'The uploaded file contains no valid data'
      });
    }

    // Get all active agents
    const activeAgents = await Agent.find({ isActive: true }).select('_id');

    if (activeAgents.length === 0) {
      await cleanupFile(filePath);
      return res.status(400).json({
        message: 'No active agents found. Please create at least one active agent before uploading lists.'
      });
    }

    // For now, we'll use the first 5 agents or all available if less than 5
    const agentsToUse = activeAgents.slice(0, Math.min(5, activeAgents.length));
    const agentIds = agentsToUse.map(agent => agent._id);

    // Distribute items among agents
    const distribution = distributeItems(parsedData, agentIds);

    // Create new list document
    const list = new List({
      filename: req.file.filename,
      originalName: req.file.originalname,
      totalItems: parsedData.length,
      uploadedBy: req.user.id,
      distributionComplete: true,
      agents: distribution.map(item => ({
        agent: item.agent,
        items: item.items,
        assignedCount: item.items.length
      }))
    });

    await list.save();

    // Update agents' assigned lists and total assigned items
    await Promise.all(
      distribution.map(async (item) => {
        await Agent.findByIdAndUpdate(item.agent, {
          $push: { assignedLists: list._id },
          $inc: { totalAssignedItems: item.items.length }
        });
      })
    );

    // Clean up uploaded file
    await cleanupFile(filePath);

    // Populate the response with agent details
    await list.populate('agents.agent', 'name email');
    await list.populate('uploadedBy', 'name email');

    res.status(201).json({
      message: 'File uploaded and distributed successfully',
      list: {
        id: list._id,
        filename: list.originalName,
        totalItems: list.totalItems,
        distributionComplete: list.distributionComplete,
        uploadedBy: list.uploadedBy,
        agents: list.agents.map(agentData => ({
          agent: {
            id: agentData.agent._id,
            name: agentData.agent.name,
            email: agentData.agent.email
          },
          assignedCount: agentData.assignedCount,
          items: agentData.items
        })),
        createdAt: list.createdAt
      }
    });

  } catch (error) {
    console.error('Upload and distribute CSV error:', error);

    // Clean up file on error
    if (filePath) {
      await cleanupFile(filePath);
    }

    res.status(500).json({
      message: error.message || 'Server error while processing file'
    });
  }
};

// @desc    Get all distributed lists
// @route   GET /api/lists
// @access  Private (Admin only)
const getAllLists = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const lists = await List.find()
      .populate('uploadedBy', 'name email')
      .populate('agents.agent', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await List.countDocuments();

    const formattedLists = lists.map(list => ({
      id: list._id,
      filename: list.originalName,
      totalItems: list.totalItems,
      distributionComplete: list.distributionComplete,
      uploadedBy: list.uploadedBy,
      agentCount: list.agents.length,
      createdAt: list.createdAt
    }));

    res.json({
      lists: formattedLists,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalLists: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Get all lists error:', error);
    res.status(500).json({
      message: 'Server error while fetching lists'
    });
  }
};

// @desc    Get list by ID with full distribution details
// @route   GET /api/lists/:id
// @access  Private (Admin only)
const getListById = async (req, res) => {
  try {
    const list = await List.findById(req.params.id)
      .populate('uploadedBy', 'name email')
      .populate('agents.agent', 'name email mobile');

    if (!list) {
      return res.status(404).json({
        message: 'List not found'
      });
    }

    const formattedList = {
      id: list._id,
      filename: list.originalName,
      totalItems: list.totalItems,
      distributionComplete: list.distributionComplete,
      uploadedBy: list.uploadedBy,
      agents: list.agents.map(agentData => ({
        agent: {
          id: agentData.agent._id,
          name: agentData.agent.name,
          email: agentData.agent.email,
          mobile: agentData.agent.mobile
        },
        assignedCount: agentData.assignedCount,
        items: agentData.items
      })),
      createdAt: list.createdAt
    };

    res.json({
      list: formattedList
    });

  } catch (error) {
    console.error('Get list by ID error:', error);

    if (error.name === 'CastError') {
      return res.status(404).json({
        message: 'List not found'
      });
    }

    res.status(500).json({
      message: 'Server error while fetching list'
    });
  }
};

// @desc    Get items assigned to a specific agent in a list
// @route   GET /api/lists/:listId/agents/:agentId
// @access  Private (Admin only)
const getAgentItemsFromList = async (req, res) => {
  try {
    const { listId, agentId } = req.params;

    const list = await List.findById(listId)
      .populate('uploadedBy', 'name email')
      .populate('agents.agent', 'name email mobile');

    if (!list) {
      return res.status(404).json({
        message: 'List not found'
      });
    }

    const agentData = list.agents.find(
      item => item.agent._id.toString() === agentId
    );

    if (!agentData) {
      return res.status(404).json({
        message: 'Agent not found in this list'
      });
    }

    res.json({
      list: {
        id: list._id,
        filename: list.originalName,
        totalItems: list.totalItems,
        createdAt: list.createdAt
      },
      agent: {
        id: agentData.agent._id,
        name: agentData.agent.name,
        email: agentData.agent.email,
        mobile: agentData.agent.mobile
      },
      assignedCount: agentData.assignedCount,
      items: agentData.items
    });

  } catch (error) {
    console.error('Get agent items from list error:', error);

    if (error.name === 'CastError') {
      return res.status(404).json({
        message: 'Invalid list or agent ID'
      });
    }

    res.status(500).json({
      message: 'Server error while fetching agent items'
    });
  }
};

// @desc    Delete list and update agent assignments
// @route   DELETE /api/lists/:id
// @access  Private (Admin only)
const deleteList = async (req, res) => {
  try {
    const list = await List.findById(req.params.id);

    if (!list) {
      return res.status(404).json({
        message: 'List not found'
      });
    }

    // Update agents: remove list from assignedLists and decrease totalAssignedItems
    await Promise.all(
      list.agents.map(async (agentData) => {
        await Agent.findByIdAndUpdate(agentData.agent, {
          $pull: { assignedLists: list._id },
          $inc: { totalAssignedItems: -agentData.assignedCount }
        });
      })
    );

    await List.findByIdAndDelete(req.params.id);

    res.json({
      message: 'List deleted successfully'
    });

  } catch (error) {
    console.error('Delete list error:', error);

    if (error.name === 'CastError') {
      return res.status(404).json({
        message: 'List not found'
      });
    }

    res.status(500).json({
      message: 'Server error while deleting list'
    });
  }
};

// @desc    Get lists statistics
// @route   GET /api/lists/stats
// @access  Private (Admin only)
const getListsStats = async (req, res) => {
  try {
    const totalLists = await List.countDocuments();
    const totalItems = await List.aggregate([
      {
        $group: {
          _id: null,
          totalItems: { $sum: '$totalItems' }
        }
      }
    ]);

    const recentLists = await List.find()
      .populate('uploadedBy', 'name')
      .select('originalName totalItems createdAt uploadedBy')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      stats: {
        totalLists,
        totalItems: totalItems.length > 0 ? totalItems[0].totalItems : 0
      },
      recentLists
    });

  } catch (error) {
    console.error('Get lists stats error:', error);
    res.status(500).json({
      message: 'Server error while fetching list statistics'
    });
  }
};

module.exports = {
  uploadAndDistributeCSV,
  getAllLists,
  getListById,
  getAgentItemsFromList,
  deleteList,
  getListsStats
};