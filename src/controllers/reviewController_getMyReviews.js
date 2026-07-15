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
