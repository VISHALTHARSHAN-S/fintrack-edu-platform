import jwt from 'jsonwebtoken';

export const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'fintrack_edu_jwt_secret_key_2026_super_secure_token',
    {
      expiresIn: process.env.JWT_EXPIRE || '30d',
    }
  );
};
