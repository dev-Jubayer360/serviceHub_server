const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getSettings, updateSettings } = require('../controllers/settingController');

// Public route to get settings
router.get('/', getSettings);

// Admin route to update settings
router.patch('/', protect, authorize('admin'), updateSettings);

module.exports = router;
