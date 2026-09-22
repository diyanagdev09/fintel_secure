import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { env } from '../config/env.js';

export const requireAuth = async (request, response, next) => {
  try {
    const header = request.get('authorization');
    const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return response.status(401).json({ message: 'Authentication required.' });
    const payload = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(payload.sub).select('_id name email role isPremium');
    if (!user) return response.status(401).json({ message: 'Session is no longer valid.' });
    request.user = user;
    next();
  } catch {
    return response.status(401).json({ message: 'Invalid or expired session.' });
  }
};

export const requireAdmin = (request, response, next) => {
  if (request.user?.role !== 'admin') return response.status(403).json({ message: 'Administrator access required.' });
  next();
};
