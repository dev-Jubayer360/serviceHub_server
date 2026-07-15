const Booking = require('../models/Booking');
const Service = require('../models/Service');

// @desc    Create a booking
// @route   POST /api/bookings
// @access  Private/Customer
const createBooking = async (req, res, next) => {
  try {
    const { serviceId, date, timeSlot, address, transactionId } = req.body;

    const service = await Service.findById(serviceId);

    if (!service) {
      res.status(404);
      throw new Error('Service not found');
    }

    const booking = await Booking.create({
      service: serviceId,
      customer: req.user.id,
      provider: service.provider,
      date,
      timeSlot,
      totalAmount: service.price,
      address,
      paymentMethod: 'bKash',
      paymentStatus: 'pending',
      transactionId: transactionId || '',
    });

    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get customer bookings
// @route   GET /api/bookings/my-bookings
// @access  Private/Customer
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ customer: req.user.id })
      .populate('service', 'title image')
      .populate('provider', 'name email phone')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get provider bookings
// @route   GET /api/bookings/provider-bookings
// @access  Private/Provider
const getProviderBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ provider: req.user.id })
      .populate('service', 'title image')
      .populate('customer', 'name email phone image')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('service', 'title image price')
      .populate('provider', 'name email phone image')
      .populate('customer', 'name email phone');

    if (!booking) {
      res.status(404);
      throw new Error('Booking not found');
    }

    // Ensure user is authorized to view this booking (customer, provider, or admin)
    if (
      booking.customer._id.toString() !== req.user.id &&
      booking.provider._id.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      res.status(403);
      throw new Error('Not authorized to access this booking');
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private/Provider/Admin
const updateBookingStatus = async (req, res, next) => {
  try {
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      res.status(404);
      throw new Error('Booking not found');
    }

    // Make sure user is provider or admin
    if (booking.provider.toString() !== req.user.id && req.user.role !== 'admin') {
      res.status(401);
      throw new Error('Not authorized to update this booking');
    }

    const { status, paymentStatus } = req.body;

    if (status) {
      booking.status = status;
    }
    if (paymentStatus) {
      booking.paymentStatus = paymentStatus;
    }

    await booking.save();

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings (Admin)
// @route   GET /api/bookings
// @access  Private/Admin
const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('service', 'title price image')
      .populate('customer', 'name email phone')
      .populate('provider', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getProviderBookings,
  getBookingById,
  updateBookingStatus,
  getAllBookings
};
