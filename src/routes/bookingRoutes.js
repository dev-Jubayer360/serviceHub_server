const express = require('express');
const {
  createBooking,
  getMyBookings,
  getProviderBookings,
  getBookingById,
  updateBookingStatus,
  getAllBookings
} = require('../controllers/bookingController');

const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .post(protect, authorize('customer'), createBooking)
  .get(protect, authorize('admin'), getAllBookings);

router.get('/my-bookings', protect, authorize('customer'), getMyBookings);
router.get('/provider-bookings', protect, authorize('provider'), getProviderBookings);
router.get('/:id', protect, getBookingById);
router.put('/:id/status', protect, authorize('provider', 'admin'), updateBookingStatus);

module.exports = router;
