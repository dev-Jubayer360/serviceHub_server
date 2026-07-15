const crypto = require('crypto');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { OAuth2Client } = require('google-auth-library');
const sendEmail = require('../utils/sendEmail');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    // Default role to customer if not specified or invalid
    const assignedRole = role === 'provider' ? 'provider' : 'customer';

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: assignedRole,
      provider: 'credentials',
    });

    if (user) {
      // Generate email verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      user.emailVerificationToken = verificationToken;
      user.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
      await user.save({ validateBeforeSave: false });

      const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
      const verifyUrl = `${clientUrl}/verify-email?token=${verificationToken}`;

      const message = `You are receiving this email because you (or someone else) requested an account registration at Nexli Gadget.\n\nPlease click on the following link to verify your email:\n\n${verifyUrl}`;
      const html = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #e2136e;">Verify Your Email Address</h2>
        <p>Thank you for registering at Nexli Gadget! Please click the button below to verify your email address and activate your account:</p>
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
          subject: 'Nexli Gadget - Verify Your Email',
          message,
          html
        });
      } catch (error) {
        console.error('Error sending verification email:', error);
      }

      res.status(201).json({
        success: true,
        message: 'Registration successful! Please check your email to verify your account.',
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      // Check if email is verified
      if (!user.isEmailVerified) {
        res.status(401);
        throw new Error('Please verify your email before logging in. Check your inbox.');
      }

      // Check if OTP was verified within the last 7 days
      if (user.lastOtpVerifiedAt && Date.now() - user.lastOtpVerifiedAt.getTime() < 7 * 24 * 60 * 60 * 1000) {
        // Skip OTP and login directly
        res.json({
          success: true,
          message: 'Logged in successfully',
          data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            provider: user.provider,
            image: user.image,
            token: generateToken(user._id),
          },
        });
        return;
      }

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Set expire to 5 minutes from now
      user.otp = otp;
      user.otpExpire = Date.now() + 5 * 60 * 1000;
      await user.save({ validateBeforeSave: false });

      // Send Email
      const message = `Your login OTP is: ${otp}\nIt is valid for 5 minutes.`;
      const html = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #e2136e;">Login Verification</h2>
        <p>Your One-Time Password (OTP) for login is:</p>
        <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
          ${otp}
        </div>
        <p>This OTP is valid for <strong>5 minutes</strong>. Do not share it with anyone.</p>
      </div>`;

      try {
        await sendEmail({
          email: user.email,
          subject: 'Nexli Gadget - Login Verification OTP',
          message,
          html
        });

        res.json({
          success: true,
          message: 'OTP sent to your email',
          data: {
            email: user.email,
            requireOtp: true
          },
        });
      } catch (error) {
        user.otp = undefined;
        user.otpExpire = undefined;
        await user.save({ validateBeforeSave: false });
        
        res.status(500);
        throw new Error('Email could not be sent');
      }
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Google login
// @route   POST /api/auth/google
// @access  Public
const googleLogin = async (req, res, next) => {
  try {
    const { tokenId, role } = req.body;

    if (!tokenId) {
      res.status(400);
      throw new Error('No Google token provided');
    }

    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email_verified, name, email, picture } = ticket.getPayload();

    if (email_verified) {
      let user = await User.findOne({ email });

      if (user) {
        res.json({
          success: true,
          message: 'Google login successful',
          data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            provider: user.provider,
            image: user.image,
            token: generateToken(user._id),
          },
        });
      } else {
        const assignedRole = (role === 'provider' || role === 'customer') ? role : 'customer';
        user = await User.create({
          name,
          email,
          image: picture,
          provider: 'google',
          role: assignedRole,
          isEmailVerified: true, // Google emails are already verified
        });

        res.status(201).json({
          success: true,
          message: 'Google registration successful',
          data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            provider: user.provider,
            image: user.image,
            token: generateToken(user._id),
          },
        });
      }
    } else {
      res.status(400);
      throw new Error('Google login failed: email not verified');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user (since we use JWT, logout can be handled client-side by destroying token, but we return a success response)
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
};

// @desc    Verify OTP for login
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      res.status(400);
      throw new Error('Please provide email and OTP');
    }

    const user = await User.findOne({
      email,
      otp,
      otpExpire: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400);
      throw new Error('Invalid or expired OTP');
    }

    // Clear OTP fields
    user.otp = undefined;
    user.otpExpire = undefined;
    user.lastOtpVerifiedAt = Date.now();
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        provider: user.provider,
        image: user.image,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Email
// @route   POST /api/auth/verify-email
// @access  Public
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400);
      throw new Error('No verification token provided');
    }

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpire: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400);
      throw new Error('Invalid or expired verification token');
    }

    // Set user to verified and clear tokens
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: 'Email verified successfully! You can now log in.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  verifyEmail,
  verifyOtp,
  googleLogin,
  logoutUser,
};
