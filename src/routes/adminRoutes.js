const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getAdminDashboardStats } = require('../controllers/adminController');

router.use(protect, authorize('admin'));

router.route('/dashboard-stats').get(getAdminDashboardStats);

module.exports = router;
