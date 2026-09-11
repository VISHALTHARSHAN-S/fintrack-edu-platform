import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'fintrack_edu_jwt_secret_key_2026_super_secure_token'
      );

      // Check if DB user exists (when DB connected) or fallback to decoded payload
      if (req.isDbConnected) {
        req.user = await User.findById(decoded.id).select('-passwordHash');
      } else {
        req.user = { id: decoded.id, role: decoded.role };
      }

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User account not found' });
      }

      return next();
    } catch (error) {
      console.error('[Auth Middleware Error]', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, invalid or expired token' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to [${allowedRoles.join(', ')}] roles. Your role is '${req.user?.role}'.`,
      });
    }
    next();
  };
};
