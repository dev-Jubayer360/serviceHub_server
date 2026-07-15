const Service = require('../models/Service');
const Category = require('../models/Category');

// @desc    Get all services
// @route   GET /api/services
// @access  Public
const getServices = async (req, res, next) => {
  try {
    const { category, search, location, minPrice, maxPrice, providerId, minRating } = req.query;
    let query = { isActive: true };

    if (providerId) {
      query.provider = providerId;
    }

    if (category) {
      const cat = await Category.findOne({ slug: category });
      if (cat) query.category = cat._id;
    }

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    
    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }

    const services = await Service.find(query)
      .populate('provider', 'name image rating')
      .populate('category', 'name slug');

    res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Public
const getService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('provider', 'name image rating completedJobs')
      .populate('category', 'name slug');

    if (!service) {
      res.status(404);
      throw new Error('Service not found');
    }

    res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a service
// @route   POST /api/services
// @access  Private/Provider
const createService = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.provider = req.user._id;

    const service = await Service.create(req.body);

    res.status(201).json({
      success: true,
      data: service
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a service
// @route   PUT /api/services/:id
// @access  Private/Provider
const updateService = async (req, res, next) => {
  try {
    let service = await Service.findById(req.params.id);

    if (!service) {
      res.status(404);
      throw new Error('Service not found');
    }

    // Make sure user is service owner
    if (service.provider.toString() !== req.user.id && req.user.role !== 'admin') {
      res.status(401);
      throw new Error('Not authorized to update this service');
    }

    service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a service
// @route   DELETE /api/services/:id
// @access  Private/Provider
const deleteService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      res.status(404);
      throw new Error('Service not found');
    }

    // Make sure user is service owner
    if (service.provider.toString() !== req.user.id && req.user.role !== 'admin') {
      res.status(401);
      throw new Error('Not authorized to delete this service');
    }

    await service.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getServices,
  getService,
  createService,
  updateService,
  deleteService
};
