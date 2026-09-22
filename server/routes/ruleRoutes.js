import { Router } from 'express';
import Rule from '../models/Rule.js';
import Upload from '../models/Upload.js';
import { requireAuth } from '../middleware/auth.js';
import { evaluateRule } from '../services/ruleService.js';

const router = Router();
router.get('/', requireAuth, async (req, res, next) => {
  try { res.json({ rules: await Rule.find({ owner: req.user._id }).sort({ createdAt: -1 }) }); } catch (e) { next(e); }
});
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { name, description = '', field, operator, value, action = 'flag', enabled = false } = req.body || {};
    if (!name?.trim() || !field?.trim() || !['gt', 'gte', 'lt', 'lte', 'eq', 'neq', 'contains'].includes(operator)) return res.status(400).json({ message: 'Complete rule fields are required.' });
    const rule = await Rule.create({ owner: req.user._id, name: name.trim(), description: description.trim(), field: field.trim(), operator, value, action, enabled });
    res.status(201).json({ rule });
  } catch (e) { next(e); }
});
router.patch('/:id', requireAuth, async (req, res, next) => {
  try { const rule = await Rule.findOneAndUpdate({ _id: req.params.id, owner: req.user._id }, req.body, { new: true, runValidators: true }); if (!rule) return res.status(404).json({ message: 'Rule not found.' }); res.json({ rule }); } catch (e) { next(e); }
});
router.post('/test', requireAuth, async (req, res, next) => {
  try {
    const upload = await Upload.findOne({ _id: req.body?.uploadId, owner: req.user._id });
    if (!upload) return res.status(404).json({ message: 'Dataset not found.' });
    const matches = evaluateRule(upload.rows, req.body || {});
    res.json({ matchedCount: matches.length, total: upload.rows.length, matches: matches.slice(0, 100) });
  } catch (e) { next(e); }
});
export default router;
