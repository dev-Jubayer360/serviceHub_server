const express = require('express');
const router = express.Router({ mergeParams: true });
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createReview,
  getServiceReviews,
  addReviewReply,
  getReviews,
  updateReviewStatus,
  deleteReview,
  getMyReviews,
  getProviderReviews,
  getPublicProviderReviews
} = require('../controllers/reviewController');

router.route('/')
  .post(protect, authorize('customer'), createReview)
  .get(getServiceReviews);

// Public route for provider reviews
router.get('/provider/:providerId/public', getPublicProviderReviews);

router.get('/my-reviews', protect, authorize('customer'), getMyReviews);
router.get('/provider-reviews', protect, authorize('provider'), getProviderReviews);
router.get('/all', protect, authorize('admin'), getReviews);
router.patch('/:id/reply', protect, authorize('provider', 'admin'), addReviewReply);
router.patch('/:id/status', protect, authorize('admin'), updateReviewStatus);
router.delete('/:id', protect, authorize('admin'), deleteReview);

module.exports = router;
