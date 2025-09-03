import jwt from 'jsonwebtoken';

/**
 * Generate JWT token for user authentication
 * @param {Object} payload - Token payload (usually user ID and basic info)
 * @param {string} secret - JWT secret key
 * @param {string} expiresIn - Token expiration time (default: 7 days)
 * @returns {string} JWT token
 */
export const generateToken = (payload, secret = process.env.JWT_SECRET, expiresIn = process.env.JWT_EXPIRES_IN || '7d') => {
  try {
    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }
    
    if (!payload || typeof payload !== 'object') {
      throw new Error('Invalid payload for JWT token');
    }
    
    // Ensure payload has required fields
    if (!payload.userId) {
      throw new Error('Payload must include userId');
    }
    
    const token = jwt.sign(payload, secret, {
      expiresIn,
      issuer: 'relationship-manager-api',
      audience: 'relationship-manager-frontend'
    });
    
    return token;
  } catch (error) {
    console.error('Error generating JWT token:', error);
    throw new Error('Failed to generate authentication token');
  }
};

/**
 * Verify JWT token and return decoded payload
 * @param {string} token - JWT token to verify
 * @param {string} secret - JWT secret key
 * @returns {Object} Decoded token payload
 */
export const verifyToken = (token, secret = process.env.JWT_SECRET) => {
  try {
    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }
    
    if (!token) {
      throw new Error('No token provided');
    }
    
    // Remove 'Bearer ' prefix if present
    const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;
    
    const decoded = jwt.verify(cleanToken, secret, {
      issuer: 'relationship-manager-api',
      audience: 'relationship-manager-frontend'
    });
    
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    } else if (error.name === 'NotBeforeError') {
      throw new Error('Token not active yet');
    } else {
      console.error('Error verifying JWT token:', error);
      throw new Error('Token verification failed');
    }
  }
};

/**
 * Generate access token for user (short-lived, for API access)
 * @param {string} userId - User ID
 * @param {string} email - User email
 * @param {string} fullName - User full name
 * @returns {string} Access token
 */
export const generateAccessToken = (userId, email, fullName) => {
  const payload = {
    userId,
    email,
    fullName,
    type: 'access'
  };
  
  return generateToken(payload, process.env.JWT_SECRET, '15m'); // 15 minutes
};

/**
 * Generate refresh token for user (long-lived, for getting new access tokens)
 * @param {string} userId - User ID
 * @returns {string} Refresh token
 */
export const generateRefreshToken = (userId) => {
  const payload = {
    userId,
    type: 'refresh'
  };
  
  return generateToken(payload, process.env.JWT_SECRET, '7d'); // 7 days
};

/**
 * Generate user authentication token (combines access and refresh)
 * @param {Object} user - User object
 * @returns {Object} Object containing access and refresh tokens
 */
export const generateAuthTokens = (user) => {
  const accessToken = generateAccessToken(user._id, user.email, user.fullName);
  const refreshToken = generateRefreshToken(user._id);
  
  return {
    accessToken,
    refreshToken,
    expiresIn: '15m',
    refreshExpiresIn: '7d'
  };
};

/**
 * Decode JWT token without verification (for debugging/logging only)
 * @param {string} token - JWT token to decode
 * @returns {Object} Decoded token payload (unverified)
 */
export const decodeToken = (token) => {
  try {
    // Remove 'Bearer ' prefix if present
    const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;
    
    // Decode without verification (for debugging only)
    const decoded = jwt.decode(cleanToken);
    return decoded;
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
};

/**
 * Check if token is expired
 * @param {string} token - JWT token to check
 * @returns {boolean} True if token is expired, false otherwise
 */
export const isTokenExpired = (token) => {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) {
      return true;
    }
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

/**
 * Get token expiration time
 * @param {string} token - JWT token
 * @returns {Date|null} Token expiration date or null if invalid
 */
export const getTokenExpiration = (token) => {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) {
      return null;
    }
    
    return new Date(decoded.exp * 1000);
  } catch (error) {
    return null;
  }
};

/**
 * Extract user ID from token
 * @param {string} token - JWT token
 * @returns {string|null} User ID or null if invalid
 */
export const getUserIdFromToken = (token) => {
  try {
    const decoded = decodeToken(token);
    return decoded?.userId || null;
  } catch (error) {
    return null;
  }
};

export default {
  generateToken,
  verifyToken,
  generateAccessToken,
  generateRefreshToken,
  generateAuthTokens,
  decodeToken,
  isTokenExpired,
  getTokenExpiration,
  getUserIdFromToken
};
