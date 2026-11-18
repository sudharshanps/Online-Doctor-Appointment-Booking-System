import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import DoctorProfile from '../models/DoctorProfile.js';
import { sendTokenResponse } from '../middleware/authMiddleware.js';

/**
 * @desc   Register a new patient
 * @route  POST /api/auth/register
 * @access Public
 */
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Only allow 'patient' or 'doctor' role
    const assignedRole = role === 'doctor' ? 'doctor' : 'patient';

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: assignedRole,
      phone: phone ? phone.trim() : ''
    });

    sendTokenResponse(user, 201, res, 'Registration successful.');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Authenticate user & log in (patient or doctor)
 * @route  POST /api/auth/login
 * @access Public
 */
export const loginUser = async (req, res, next) => {
  try {
    const { email, password, requiredRole } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please enter both email and password.'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Role check if the login screen is specifically for doctors or patients
    if (requiredRole && user.role !== requiredRole) {
      return res.status(403).json({
        success: false,
        message: `This portal is for ${requiredRole}s. Your account is registered as a ${user.role}.`
      });
    }

    sendTokenResponse(user, 200, res, 'Login successful.');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Log out user & clear HTTP-only cookie
 * @route  POST /api/auth/logout
 * @access Public
 */
export const logoutUser = (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('token', '', {
    expires: new Date(0),
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax'
  });

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.'
  });
};

/**
 * @desc   Get current logged-in user profile
 * @route  GET /api/auth/me
 * @access Private
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    let doctorProfile = null;
    if (user.role === 'doctor') {
      doctorProfile = await DoctorProfile.findOne({ userId: user._id });
    }

    return res.status(200).json({
      success: true,
      user,
      doctorProfile
    });
  } catch (error) {
    next(error);
  }
};
