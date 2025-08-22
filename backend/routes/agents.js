const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  createAgent,
  getAllAgents,
  updateAgent,
  deleteAgent,
  getAgentsStats
} = require('../controllers/agentController');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Apply authentication and admin role check to all routes
router.use(authenticate);
router.use(requireAdmin);

const createAgentValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),

  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  body('mobile')
    .matches(/^\+[1-9]\d{10,14}$/)
    .withMessage('Mobile number must include country code (e.g., +1234567890)'),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

router.get('/stats', getAgentsStats);
router.post('/', createAgentValidation, createAgent);
router.get('/', getAllAgents);
router.put('/:id', updateAgent);
router.delete('/:id', deleteAgent);

module.exports = router;