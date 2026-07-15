const Setting = require('../models/Setting');

// @desc    Get global settings
// @route   GET /api/settings
// @access  Public
const getSettings = async (req, res, next) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({}); // Create default settings if not exists
    }
    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update settings
// @route   PATCH /api/admin/settings
// @access  Private/Admin
const updateSettings = async (req, res, next) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({});
    }

    if (req.body.heroBanner) {
      settings.heroBanner = {
        ...settings.heroBanner,
        ...req.body.heroBanner
      };
    }

    if (req.body.socialLinks) {
      settings.socialLinks = {
        ...settings.socialLinks,
        ...req.body.socialLinks
      };
    }

    if (req.body.general) {
      settings.general = {
        ...settings.general,
        ...req.body.general
      };
    }

    if (req.body.seo) {
      settings.seo = {
        ...settings.seo,
        ...req.body.seo
      };
    }

    const updatedSettings = await settings.save();
    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: updatedSettings,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings,
};
