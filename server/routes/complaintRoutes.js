import { Router } from 'express';
import Complaint from '../models/complaints.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();
const present = (c) => ({ id: c._id, userId: c.user, subject: c.subject, description: c.description, message: c.description, priority: c.priority, status: c.status, reply: c.reply, createdAt: c.createdAt, updatedAt: c.updatedAt });

router.get('/mine', requireAuth, async (req, res, next) => {
  try { const rows = await Complaint.find({ user: req.user._id }).sort({ createdAt: -1 }); res.json({ complaints: rows.map(present) }); } catch (e) { next(e); }
});
router.get('/admin/all', requireAuth, requireAdmin, async (_req, res, next) => {
  try { const rows = await Complaint.find({}).populate('user', 'name email').sort({ createdAt: -1 }); res.json({ complaints: rows.map((c) => ({ ...present(c), user: c.user ? { name: c.user.name, email: c.user.email } : null })) }); } catch (e) { next(e); }
});
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { subject, description } = req.body || {};
    if (!subject?.trim() || !description?.trim()) return res.status(400).json({ message: 'Subject and description are required.' });
    const c = await Complaint.create({ user: req.user._id, subject: subject.trim(), description: description.trim() });
    res.status(201).json({ complaint: present(c) });
  } catch (e) { next(e); }
});
router.patch('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const updates = {};
    if (['low', 'medium', 'high'].includes(req.body?.priority)) updates.priority = req.body.priority;
    if (['pending', 'in-progress', 'resolved'].includes(req.body?.status)) updates.status = req.body.status;
    if (typeof req.body?.reply === 'string') updates.reply = req.body.reply.trim().slice(0, 2000);
    const c = await Complaint.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!c) return res.status(404).json({ message: 'Complaint not found.' });
    res.json({ complaint: present(c) });
  } catch (e) { next(e); }
});
export default router;
