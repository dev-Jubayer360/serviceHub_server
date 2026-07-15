const User = require('../models/User');
const Booking = require('../models/Booking');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        success: true,
        data: user,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get public provider profile
// @route   GET /api/user/provider/:id
// @access  Public
const getProviderPublicProfile = async (req, res, next) => {
  try {
    const provider = await User.findById(req.params.id)
      .select('name email phone image rating completedJobs createdAt role');

    if (provider && provider.role === 'provider') {
      res.json({
        success: true,
        data: provider,
      });
    } else {
      res.status(404);
      throw new Error('Provider not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PATCH /api/user/profile
// @access  Private
const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      let emailChanged = false;

      user.name = req.body.name || user.name;
      user.phone = req.body.phone || user.phone;
      if (req.body.image) {
        user.image = req.body.image;
      }
      
      if (req.body.email && req.body.email !== user.email) {
        const emailExists = await User.findOne({ email: req.body.email });
        if (emailExists) {
          res.status(400);
          throw new Error('Email is already in use by another account');
        }
        user.email = req.body.email;
        user.isEmailVerified = false;
        emailChanged = true;
        
        // Generate email verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        user.emailVerificationToken = verificationToken;
        user.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
        
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
        const verifyUrl = `${clientUrl}/verify-email?token=${verificationToken}`;

        const message = `You requested an email change. Please click on the following link to verify your new email:\n\n${verifyUrl}`;
        const html = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #e2136e;">Verify Your New Email Address</h2>
          <p>Please click the button below to verify your new email address:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyUrl}" style="background-color: #e2136e; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px;">Verify Email Address</a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p><a href="${verifyUrl}">${verifyUrl}</a></p>
          <p>This link will expire in 24 hours.</p>
        </div>`;

        try {
          await sendEmail({
            email: user.email,
            subject: 'ServiceHub - Verify Your New Email',
            message,
            html
          });
        } catch (error) {
          console.error('Error sending verification email:', error);
        }
      }

      const updatedUser = await user.save();
      
      let resMessage = 'Profile updated successfully';
      if (emailChanged) {
        resMessage = 'Profile updated successfully. A verification link has been sent to your new email. Please verify it before your next login.';
      }

      res.json({
        success: true,
        message: resMessage,
        data: updatedUser,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Change user password
// @route   PATCH /api/user/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (user && user.provider === 'credentials') {
      if (await user.matchPassword(oldPassword)) {
        user.password = newPassword;
        await user.save();
        res.json({
          success: true,
          message: 'Password changed successfully',
        });
      } else {
        res.status(401);
        throw new Error('Incorrect old password');
      }
    } else {
      res.status(400);
      throw new Error('Cannot change password for social login users');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get user addresses
// @route   GET /api/user/addresses
// @access  Private
const getAddresses = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      data: user.addresses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add new address
// @route   POST /api/user/addresses
// @access  Private
const addAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (user.addresses.length === 0) {
      req.body.isDefault = true;
    }
    
    user.addresses.push(req.body);
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      data: user.addresses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update address
// @route   PATCH /api/user/addresses/:addressId
// @access  Private
const updateAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(req.params.addressId);

    if (address) {
      address.set(req.body);
      await user.save();
      res.json({
        success: true,
        message: 'Address updated successfully',
        data: user.addresses,
      });
    } else {
      res.status(404);
      throw new Error('Address not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete address
// @route   DELETE /api/user/addresses/:addressId
// @access  Private
const deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses.pull(req.params.addressId);
    await user.save();

    res.json({
      success: true,
      message: 'Address deleted successfully',
      data: user.addresses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Set default address
// @route   PATCH /api/user/addresses/:addressId/default
// @access  Private
const setDefaultAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    user.addresses.forEach((addr) => {
      addr.isDefault = addr._id.toString() === req.params.addressId;
    });

    await user.save();
    res.json({
      success: true,
      message: 'Default address updated',
      data: user.addresses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user dashboard stats
// @route   GET /api/user/dashboard-stats
// @access  Private
const getUserDashboardStats = async (req, res, next) => {
  try {
    const isProvider = req.user.role === 'provider';
    const query = isProvider ? { provider: req.user._id } : { customer: req.user._id };
    
    const bookings = await Booking.find(query).sort({ createdAt: -1 });

    let totalSpent = 0;
    let totalEarnings = 0;
    let pendingBookings = 0;
    let completedBookings = 0;
    let cancelledBookings = 0;

    bookings.forEach((booking) => {
      if (booking.status === 'completed') {
        if (isProvider) {
          totalEarnings += booking.totalAmount;
        } else {
          totalSpent += booking.totalAmount;
        }
        completedBookings++;
      } else if (booking.status === 'pending') {
        pendingBookings++;
      } else if (booking.status === 'cancelled') {
        cancelledBookings++;
      }
    });

    res.json({
      success: true,
      data: {
        totalBookings: bookings.length,
        pendingBookings,
        completedBookings,
        cancelledBookings,
        totalSpent,
        totalEarnings,
        recentBookings: bookings.slice(0, 5),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/user/all
// @access  Private/Admin
const getAllUsers = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.role) {
      query.role = req.query.role;
    }
    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role (Admin only)
// @route   PATCH /api/user/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    
    if (!['customer', 'provider', 'admin'].includes(role)) {
      res.status(400);
      throw new Error('Invalid role');
    }

    const user = await User.findById(req.params.id);

    if (user) {
      // Prevent demoting the last admin (optional but good practice)
      if (user.role === 'admin' && role !== 'admin') {
         const adminCount = await User.countDocuments({ role: 'admin' });
         if (adminCount <= 1) {
            res.status(400);
            throw new Error('Cannot demote the last admin');
         }
      }

      user.role = role;
      await user.save();

      res.json({
        success: true,
        message: 'User role updated successfully',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update provider verification status (Admin only)
// @route   PATCH /api/user/:id/verify-provider
// @access  Private/Admin
const updateProviderStatus = async (req, res, next) => {
  try {
    const { isVerifiedProvider } = req.body;
    
    const user = await User.findById(req.params.id);

    if (user) {
      if (user.role !== 'provider') {
        res.status(400);
        throw new Error('User is not a provider');
      }

      user.isVerifiedProvider = isVerifiedProvider;
      await user.save();

      res.json({
        success: true,
        message: 'Provider verification status updated successfully',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          isVerifiedProvider: user.isVerifiedProvider
        },
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get all active providers
// @route   GET /api/user/providers
// @access  Public
const getProviders = async (req, res, next) => {
  try {
    const providers = await User.find({ role: 'provider' })
      .select('name email phone image rating completedJobs address isEmailVerified createdAt')
      .sort('-rating');

    res.json({
      success: true,
      count: providers.length,
      data: providers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Request to become a provider
// @route   POST /api/user/request-provider
// @access  Private
const requestProvider = async (req, res, next) => {
  try {
    const Message = require('../models/Message');
    const admin = await User.findOne({ role: 'admin' });
    
    if (!admin) {
      res.status(404);
      throw new Error('Admin not found to receive request');
    }

    if (req.user.role === 'provider' || req.user.role === 'admin') {
      res.status(400);
      throw new Error('You are already a provider or admin');
    }

    const messageText = `Provider Request: User ${req.user.name} (${req.user.email}) has requested to become a provider. Please review their profile and update their role.`;
    
    const message = await Message.create({
      sender: req.user._id,
      receiver: admin._id,
      text: messageText,
    });

    res.status(200).json({
      success: true,
      message: 'Provider request sent successfully to admin',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
