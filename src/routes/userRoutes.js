const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getUserProfile,
  getProviderPublicProfile,
  updateUserProfile,
  changePassword,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getUserDashboardStats,
  getAllUsers,
  updateUserRole,
  updateProviderStatus,
  getProviders,
  requestProvider,
} = require('../controllers/userController');

// Public routes
router.get('/providers', getProviders);
router.get('/provider/:id', getProviderPublicProfile);

router.use(protect);

router.post('/request-provider', requestProvider);

// Admin only routes
router.route('/all').get(authorize('admin'), getAllUsers);
router.route('/:id/role').patch(authorize('admin'), updateUserRole);
router.route('/:id/verify-provider').patch(authorize('admin'), updateProviderStatus);

router.route('/dashboard-stats').get(getUserDashboardStats);

router.route('/profile').get(getUserProfile).patch(updateUserProfile);
router.patch('/change-password', changePassword);

router.route('/addresses').get(getAddresses).post(addAddress);
router
  .route('/addresses/:addressId')
  .patch(updateAddress)
  .delete(deleteAddress);
router.patch('/addresses/:addressId/default', setDefaultAddress);

module.exports = router;
