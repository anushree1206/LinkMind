import User from '../models/User.js';
import { generateAuthTokens } from '../utils/jwtUtils.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * Authentication Controller
 * Handles user registration, login, and authentication
 */

/**
 * Register a new user
 * POST /api/auth/register
 */
export const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, password, jobTitle, company, avatarUrl, location } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User with this email already exists',
      error: 'EMAIL_ALREADY_EXISTS'
    });
  }

  // Create new user
  const user = new User({
    fullName,
    email,
    password,
    jobTitle,
    company,
    avatarUrl,
    location
  });

  // Save user to database
  await user.save();

  // Generate authentication tokens
  const tokens = generateAuthTokens(user);

  // Return success response with user data and tokens
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        jobTitle: user.jobTitle,
        company: user.company,
        avatarUrl: user.avatarUrl,
        location: user.location,
        initials: user.initials,
        createdAt: user.createdAt
      },
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
        refreshExpiresIn: tokens.refreshExpiresIn
      }
    }
  });
});

/**
 * Login user
 * POST /api/auth/login
 */
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user by email and include password for comparison
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
      error: 'INVALID_CREDENTIALS'
    });
  }

  // Check if user account is active
  if (!user.isActive) {
    return res.status(401).json({
      success: false,
      message: 'Account is deactivated. Please contact support.',
      error: 'ACCOUNT_DEACTIVATED'
    });
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
      error: 'INVALID_CREDENTIALS'
    });
  }

  // Update last login time
  user.lastLogin = new Date();
  await user.save();

  // Generate authentication tokens
  const tokens = generateAuthTokens(user);

  // Return success response with user data and tokens
  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        jobTitle: user.jobTitle,
        company: user.company,
        avatarUrl: user.avatarUrl,
        location: user.location,
        initials: user.initials,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      },
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
        refreshExpiresIn: tokens.refreshExpiresIn
      }
    }
  });
});

/**
 * Get current user profile
 * GET /api/auth/profile
 * Requires authentication
 */
export const getCurrentUser = asyncHandler(async (req, res) => {
  // User is already attached to req.user by auth middleware
  const user = req.user;

  res.status(200).json({
    success: true,
    message: 'Profile retrieved successfully',
    data: {
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        jobTitle: user.jobTitle,
        company: user.company,
        avatarUrl: user.avatarUrl,
        location: user.location,
        initials: user.initials,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    }
  });
});

/**
 * Update user profile
 * PUT /api/auth/profile
 * Requires authentication
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { fullName, jobTitle, company, avatarUrl, location } = req.body;
  const user = req.user;

  // Update allowed fields
  if (fullName !== undefined) user.fullName = fullName;
  if (jobTitle !== undefined) user.jobTitle = jobTitle;
  if (company !== undefined) user.company = company;
  if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
  if (location !== undefined) user.location = location;

  // Save updated user
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        jobTitle: user.jobTitle,
        company: user.company,
        avatarUrl: user.avatarUrl,
        location: user.location,
        initials: user.initials,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    }
  });
});

/**
 * Change user password
 * PUT /api/auth/change-password
 * Requires authentication
 */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = req.user;

  // Verify current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect',
      error: 'INVALID_CURRENT_PASSWORD'
    });
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password changed successfully'
  });
});

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      message: 'Refresh token is required',
      error: 'REFRESH_TOKEN_REQUIRED'
    });
  }

  try {
    // Verify refresh token
    const { verifyToken } = await import('../utils/jwtUtils.js');
    const decoded = verifyToken(refreshToken);

    // Check if it's a refresh token
    if (decoded.type !== 'refresh') {
      return res.status(400).json({
        success: false,
        message: 'Invalid token type',
        error: 'INVALID_TOKEN_TYPE'
      });
    }

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive',
        error: 'USER_NOT_FOUND'
      });
    }

    // Generate new access token
    const { generateAccessToken } = await import('../utils/jwtUtils.js');
    const newAccessToken = generateAccessToken(user._id, user.email, user.fullName);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: newAccessToken,
        expiresIn: '15m'
      }
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid refresh token',
      error: 'INVALID_REFRESH_TOKEN'
    });
  }
});

/**
 * Logout user (invalidate token on client side)
 * POST /api/auth/logout
 * Requires authentication
 */
export const logoutUser = asyncHandler(async (req, res) => {
  // In a real application, you might want to add the token to a blacklist
  // For now, we'll just return success and let the client handle token removal
  
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

/**
 * Delete user account
 * DELETE /api/auth/account
 * Requires authentication
 */
export const deleteAccount = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const user = req.user;

  // Verify password before deletion
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return res.status(400).json({
      success: false,
      message: 'Password is incorrect',
      error: 'INVALID_PASSWORD'
    });
  }

  // Deactivate user account instead of deleting
  user.isActive = false;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Account deactivated successfully'
  });
});

export default {
  registerUser,
  loginUser,
  getCurrentUser,
  updateProfile,
  changePassword,
  refreshToken,
  logoutUser,
  deleteAccount
};
