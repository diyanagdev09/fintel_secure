import { Router } from 'express';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';
const router = Router();
router.post('/upgrade', requireAuth, async (req, res, next) => { try { const user = await User.findByIdAndUpdate(req.user._id, { isPremium: true }, { new: true }).select('_id name email role isPremium'); if (!user) return res.status(404).json({ message: 'User account not found.' }); res.json({ user }); } catch (e) { next(e); } });
export default router;
