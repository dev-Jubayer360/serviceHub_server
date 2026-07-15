const Favourite = require('../models/Favourite');

// @desc    Add service to favourites
// @route   POST /api/favourites
// @access  Private (Customer)
const addFavourite = async (req, res, next) => {
  try {
    const { serviceId } = req.body;
    if (!serviceId) {
      res.status(400);
      throw new Error('Service ID is required');
    }

    const favourite = await Favourite.create({
      user: req.user._id,
      service: serviceId,
    });

    res.status(201).json({
      success: true,
      message: 'Service added to favourites',
      data: favourite,
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400);
      next(new Error('Service is already in your favourites'));
    } else {
      next(error);
    }
  }
};

// @desc    Get user favourites
// @route   GET /api/favourites
// @access  Private (Customer)
const getFavourites = async (req, res, next) => {
  try {
    const favourites = await Favourite.find({ user: req.user._id }).populate({
      path: 'service',
      populate: { path: 'provider', select: 'name' }
    });

    res.json({
      success: true,
      count: favourites.length,
      data: favourites,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove service from favourites
// @route   DELETE /api/favourites/:serviceId
// @access  Private (Customer)
const removeFavourite = async (req, res, next) => {
  try {
    const { serviceId } = req.params;

    const favourite = await Favourite.findOneAndDelete({
      user: req.user._id,
      service: serviceId,
    });

    if (!favourite) {
      res.status(404);
      throw new Error('Favourite not found');
    }

    res.json({
      success: true,
      message: 'Service removed from favourites',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check if a service is favourited
// @route   GET /api/favourites/check/:serviceId
// @access  Private (Customer)
const checkFavourite = async (req, res, next) => {
  try {
    const { serviceId } = req.params;
    
    const favourite = await Favourite.findOne({
      user: req.user._id,
      service: serviceId,
    });

    res.json({
      success: true,
      isFavourited: !!favourite
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addFavourite,
  getFavourites,
  removeFavourite,
  checkFavourite
};
