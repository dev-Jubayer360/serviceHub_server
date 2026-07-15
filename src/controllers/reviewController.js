const Review = require('../models/Review');
const Service = require('../models/Service');
const Booking = require('../models/Booking');

// @desc    Create new review
// @route   POST /api/services/:serviceId/reviews
// @access  Private/Customer
const createReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const serviceId = req.params.serviceId;

    const service = await Service.findById(serviceId);
    if (!service) {
      res.status(404);
      throw new Error('Service not found');
    }

    // Check if user has completed a booking for this service
    const hasCompletedBooking = await Booking.findOne({
      customer: req.user._id,
      service: serviceId,
      status: 'completed',
    });

    if (!hasCompletedBooking) {
      res.status(400);
      throw new Error('You can only review services after a completed booking');
    }

    const alreadyReviewed = await Review.findOne({
      userId: req.user._id,
      serviceId,
    });

    if (alreadyReviewed) {
      res.status(400);
      throw new Error('You have already reviewed this service');
    }

    const review = new Review({
      userId: req.user._id,
      serviceId,
      providerId: service.provider,
      rating: Number(rating),
      comment,
      status: 'Approved', // Auto approve for now, could be Pending
    });

    await review.save();

    // Update service rating
    const allReviews = await Review.find({ serviceId, status: 'Approved' });
    service.numOfReviews = allReviews.length;
    service.rating = allReviews.length > 0 ? allReviews.reduce((acc, item) => item.rating + acc, 0) / allReviews.length : 0;
    await service.save();

    // Update provider rating
    const User = require('../models/User');
    const providerReviews = await Review.find({ providerId: service.provider, status: 'Approved' });
    const provider = await User.findById(service.provider);
    if (provider) {
      provider.rating = providerReviews.length > 0 ? providerReviews.reduce((acc, item) => item.rating + acc, 0) / providerReviews.length : 0;
      await provider.save();
    }

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a service
// @route   GET /api/services/:serviceId/reviews
// @access  Public
const getServiceReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({
      serviceId: req.params.serviceId,
      status: 'Approved',
    }).populate('userId', 'name image');

    res.json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

// --- ADMIN ROUTES ---

// @desc    Get all reviews (Admin)
// @route   GET /api/reviews/all
// @access  Private/Admin
const getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find()
      .populate('userId', 'name email')
      .populate('serviceId', 'title')
      .populate('providerId', 'name email')
      .sort('-createdAt');

    res.json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get public reviews for a provider
// @route   GET /api/reviews/provider/:providerId/public
// @access  Public
const getPublicProviderReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ 
      providerId: req.params.providerId,
      status: 'Approved' 
    })
      .populate('userId', 'name image')
      .populate('serviceId', 'title')
      .sort('-createdAt');

    res.json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update review status (Approve/Reject)
// @route   PATCH /api/admin/reviews/:id/status
// @access  Private/Admin
const updateReviewStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const review = await Review.findById(req.params.id);

    if (review) {
      const oldStatus = review.status;
      review.status = status;
      await review.save();

      // If status changed to or from Approved, recalculate service rating
      if (oldStatus !== status && (oldStatus === 'Approved' || status === 'Approved')) {
        const service = await Service.findById(review.serviceId);
        if (service) {
          const approvedReviews = await Review.find({ serviceId: review.serviceId, status: 'Approved' });
          
          service.numOfReviews = approvedReviews.length;
          if (service.numOfReviews === 0) {
            service.rating = 0;
          } else {
            service.rating =
              approvedReviews.reduce((acc, item) => item.rating + acc, 0) /
              approvedReviews.length;
          }
          await service.save();

          // Update provider rating
          const User = require('../models/User');
          const providerReviews = await Review.find({ providerId: service.provider, status: 'Approved' });
          const provider = await User.findById(service.provider);
          if (provider) {
            provider.rating = providerReviews.length > 0 ? providerReviews.reduce((acc, item) => item.rating + acc, 0) / providerReviews.length : 0;
            await provider.save();
          }
        }
      }

      res.json({
        success: true,
        message: `Review status updated to ${status}`,
        data: review,
      });
    } else {
      res.status(404);
      throw new Error('Review not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Add provider reply to review
// @route   PATCH /api/reviews/:id/reply
// @access  Private/Provider
const addReviewReply = async (req, res, next) => {
  try {
    const { reply } = req.body;
    const review = await Review.findById(req.params.id);

    if (review) {
      // Must be the provider who owns the service
      if (review.providerId.toString() !== req.user.id && req.user.role !== 'admin') {
         res.status(401);
         throw new Error('Not authorized to reply to this review');
      }

      review.adminReply = reply; // Using existing adminReply field as provider reply
      const updatedReview = await review.save();

      res.json({
        success: true,
        message: 'Reply added successfully',
        data: updatedReview,
      });
    } else {
      res.status(404);
      throw new Error('Review not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete review
// @route   DELETE /api/admin/reviews/:id
// @access  Private/Admin
const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (review) {
      const serviceId = review.serviceId;
      const status = review.status;
      await review.deleteOne();

      if (status === 'Approved') {
        const service = await Service.findById(serviceId);
        if (service) {
          const approvedReviews = await Review.find({ serviceId, status: 'Approved' });
          
          service.numOfReviews = approvedReviews.length;
          if (service.numOfReviews === 0) {
            service.rating = 0;
          } else {
            service.rating =
              approvedReviews.reduce((acc, item) => item.rating + acc, 0) /
              approvedReviews.length;
          }
          await service.save();

          // Update provider rating
          const User = require('../models/User');
          const providerReviews = await Review.find({ providerId: service.provider, status: 'Approved' });
          const provider = await User.findById(service.provider);
          if (provider) {
            provider.rating = providerReviews.length > 0 ? providerReviews.reduce((acc, item) => item.rating + acc, 0) / providerReviews.length : 0;
            await provider.save();
          }
        }
      }

      res.json({
        success: true,
        message: 'Review deleted',
      });
    } else {
      res.status(404);
      throw new Error('Review not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's own reviews
// @route   GET /api/reviews/my-reviews
// @access  Private/Customer
const getMyReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ userId: req.user._id })
      .populate({
        path: 'serviceId',
        select: 'title provider',
        populate: { path: 'provider', select: 'name' }
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for provider
// @route   GET /api/reviews/provider-reviews
// @access  Private/Provider
const getProviderReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ providerId: req.user._id })
      .populate('userId', 'name image email')
      .populate('serviceId', 'title')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getServiceReviews,
  getReviews,
  updateReviewStatus,
  addReviewReply,
  deleteReview,
  getMyReviews,
  getProviderReviews,
  getPublicProviderReviews,
};
