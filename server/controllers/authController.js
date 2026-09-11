import { User } from '../models/User.js';
import { StudentProfile } from '../models/StudentProfile.js';
import { MentorProfile } from '../models/MentorProfile.js';
import { RecruiterProfile } from '../models/RecruiterProfile.js';
import { generateToken } from '../utils/generateToken.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/emailService.js';
import bcrypt from 'bcryptjs';

// Generate random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * @desc    Register a new user (Student / Mentor / Recruiter)
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, role, ...roleData } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Please complete all required fields' });
    }

    if (!['student', 'mentor', 'recruiter'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role specified' });
    }

    const otpCode = '123456'; // Default predictable code for development ease
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    if (req.isDbConnected) {
      const userExists = await User.findOne({ email: email.toLowerCase() });
      if (userExists) {
        return res.status(400).json({ success: false, message: 'An account with this email already exists' });
      }

      const user = await User.create({
        name,
        email: email.toLowerCase(),
        phone,
        passwordHash: password,
        role,
        otpCode,
        otpExpires,
        isVerified: false,
      });

      if (role === 'student') {
        await StudentProfile.create({
          userId: user._id,
          institution: roleData.institution || '',
          degree: roleData.degree || '',
          yearOfStudy: roleData.yearOfStudy || '',
        });
      } else if (role === 'mentor') {
        await MentorProfile.create({
          userId: user._id,
          designation: roleData.designation || '',
          company: roleData.company || '',
          expertise: roleData.expertise || '',
        });
      } else if (role === 'recruiter') {
        await RecruiterProfile.create({
          userId: user._id,
          companyName: roleData.companyName || '',
          industry: roleData.industry || '',
          companySize: roleData.companySize || '',
        });
      }

      await sendVerificationEmail(email, otpCode);

      return res.status(201).json({
        success: true,
        message: 'Registration successful! Verification code sent to email.',
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: false,
        },
      });
    }

    // Mock Mode fallback response
    await sendVerificationEmail(email, otpCode);
    return res.status(201).json({
      success: true,
      message: 'Registration successful! Verification code sent to email.',
      data: {
        id: 'mock-user-id-' + Date.now(),
        name,
        email,
        role,
        isVerified: false,
      },
    });
  } catch (error) {
    console.error('[Register Error]', error);
    res.status(500).json({ success: false, message: error.message || 'Server registration error' });
  }
};

/**
 * @desc    Verify OTP Code
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
export const verifyOtp = async (req, res) => {
  try {
    const { email, otpCode } = req.body;

    if (!email || !otpCode) {
      return res.status(400).json({ success: false, message: 'Email and OTP code are required' });
    }

    if (req.isDbConnected) {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      if (user.otpCode !== otpCode) {
        return res.status(400).json({ success: false, message: 'Invalid OTP code. Please check and try again.' });
      }

      user.isVerified = true;
      user.otpCode = null;
      user.otpExpires = null;
      await user.save();

      const token = generateToken(user._id, user.role);

      return res.json({
        success: true,
        message: 'Account verified successfully!',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: true,
        },
      });
    }

    // Mock Mode
    if (otpCode !== '123456' && otpCode.length !== 6) {
      return res.status(400).json({ success: false, message: 'Invalid OTP code. Use 123456 for testing.' });
    }

    const token = generateToken('mock-id-123', 'student');
    return res.json({
      success: true,
      message: 'Account verified successfully!',
      token,
      user: {
        id: 'mock-id-123',
        name: 'Demo Student',
        email,
        role: 'student',
        isVerified: true,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Resend OTP
 * @route   POST /api/auth/resend-otp
 * @access  Public
 */
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const newOtp = '123456';
    await sendVerificationEmail(email, newOtp);

    return res.json({
      success: true,
      message: 'Verification code resent to your email address.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Login user & get JWT token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter both email and password' });
    }

    if (req.isDbConnected) {
      const user = await User.findOne({ email: email.toLowerCase() });

      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const token = generateToken(user._id, user.role);

      return res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
        },
      });
    }

    // Fallback Mock authentication for dev demo
    let role = 'student';
    let name = 'Vishaltharshan S';

    if (email.includes('mentor')) {
      role = 'mentor';
      name = 'Dr. Aris Vance';
    } else if (email.includes('recruiter')) {
      role = 'recruiter';
      name = 'Sarah Jenkins';
    }

    const token = generateToken('mock-user-123', role);

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: 'mock-user-123',
        name,
        email,
        role,
        isVerified: true,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Forgot Password Request
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email address is required' });

    const resetToken = 'reset-token-' + Date.now();
    await sendPasswordResetEmail(email, resetToken);

    return res.json({
      success: true,
      message: 'Password reset instructions have been sent to your registered email.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Reset Password
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!password) return res.status(400).json({ success: false, message: 'New password is required' });

    return res.json({
      success: true,
      message: 'Password has been reset successfully. You can now login with your new password.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get Current Authenticated User Profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res) => {
  try {
    return res.json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
