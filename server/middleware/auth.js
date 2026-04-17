import jwt from 'jsonwebtoken';

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    console.warn('⚠️ Warning: JWT_SECRET environment variable is not set. Using insecure default. Do not use this in production!');
  }
  return process.env.JWT_SECRET || 'skillswap_dev_secret_key_2026';
};

export const generateToken = (userId) => {
  return jwt.sign({ userId }, getJwtSecret(), { expiresIn: '7d' });
};

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, getJwtSecret());
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

export default { generateToken, verifyToken };
