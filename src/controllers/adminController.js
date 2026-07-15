const User = require('../models/User');
const Booking = require('../models/Booking');
const Service = require('../models/Service');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard-stats
// @access  Private/Admin
const getAdminDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'customer' });
    const totalProviders = await User.countDocuments({ role: 'provider' });
    const totalServices = await Service.countDocuments({});
    const totalBookings = await Booking.countDocuments({});

    const completedBookings = await Booking.find({ status: 'completed' });
    const totalRevenue = completedBookings.reduce((sum, booking) => sum + booking.totalAmount, 0);

    const recentBookings = await Booking.find()
      .populate('customer', 'name email')
      .populate('provider', 'name email')
      .populate('service', 'title price')
      .sort({ createdAt: -1 })
      .limit(5);
      
    const recentActivities = [
       { title: 'System checked', time: new Date().toISOString(), color: 'bg-primary' }
    ];

    const topProviders = await User.find({ role: 'provider' })
      .sort({ rating: -1, completedJobs: -1 })
      .limit(5)
      .select('name image rating completedJobs');

    res.json({
      success: true,
      data: {
        totalUsers,
        totalProviders,
        totalServices,
        totalBookings,
        totalRevenue,
        recentBookings,
        recentActivities,
        topProviders
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminDashboardStats,
};
