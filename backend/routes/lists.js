const express = require('express');
const router = express.Router();

const {
  uploadAndDistributeCSV,
  getAllLists,
  getListById,
  deleteList,
  getListsStats
} = require('../controllers/listController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// Apply authentication and admin role check to all routes
router.use(authenticate);
router.use(requireAdmin);

router.get('/stats', getListsStats);
router.post('/upload', upload.single('csvFile'), uploadAndDistributeCSV);
router.get('/', getAllLists);
router.get('/:id', getListById);
router.delete('/:id', deleteList);

module.exports = router;