import jwt from 'jsonwebtoken';

/**
 * Generate a signed JWT for a user
 * @param {Object} user 
 * @returns {string} token
 */
export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      email: user.email,
    },
    process.env.JWT_SECRET || 'civicsetu_super_secret_jwt_key_2026_dev',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};
