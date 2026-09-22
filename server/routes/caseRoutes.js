import { Router } from 'express';
import crypto from 'node:crypto';
import Case from '../models/Case.js';
import Upload from '../models/Upload.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { scoreTransactions } from '../services/riskEngine.js';

const router = Router();
const safeCase = (c) => ({ ...c.toObject(), id: c._id, _id: undefined });

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { owner: req.user._id };
    const rows = await Case.find(filter).sort({ updatedAt: -1 }).limit(200);
    res.json({ cases: rows.map(safeCase) });
  } catch (e) { next(e); }
});

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { title, priority = 'medium', uploadId, transactionIndices = [], notes = '' } = req.body || {};
    if (!title?.trim()) return res.status(400).json({ message: 'Case title is required.' });
    const validPriorities = ['low', 'medium', 'high', 'critical'];
    const uploadIds = [...new Set((Array.isArray(uploadId) ? uploadId : [uploadId]).filter(Boolean))];
    const transactionRefs = [];
    const evidence = [];
    for (const id of uploadIds) {
      const upload = await Upload.findOne(req.user.role === 'admin' ? { _id: id } : { _id: id, owner: req.user._id });
      if (!upload) continue;
      const analysis = scoreTransactions(upload.rows, upload.headers);
      for (const idx of (Array.isArray(transactionIndices) ? transactionIndices : [])) {
        const n = Number(idx);
        const found = analysis.transactions.find((t) => t.transactionIndex === n);
        if (found) {
          transactionRefs.push({ uploadId: upload._id, transactionIndex: n, riskScore: found.riskScore, anomalyScore: found.anomalyScore });
          evidence.push({ label: `Transaction #${n + 1} SHA-256`, value: crypto.createHash('sha256').update(JSON.stringify(upload.rows[n], Object.keys(upload.rows[n]).sort())).digest('hex') });
        }
      }
      evidence.push({ label: `${upload.filename} SHA-256`, value: upload.integrityHash });
    }
    const c = await Case.create({
      owner: req.user._id,
      title: title.trim(),
      priority: validPriorities.includes(priority) ? priority : 'medium',
      notes: String(notes).trim().slice(0, 5000),
      transactions: transactionRefs,
      evidence,
      timeline: [{ type: 'created', text: 'Investigation case created', actor: req.user._id }],
    });
    res.status(201).json({ case: safeCase(c) });
  } catch (e) { next(e); }
});

router.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin' ? { _id: req.params.id } : { _id: req.params.id, owner: req.user._id };
    const c = await Case.findOne(filter);
    if (!c) return res.status(404).json({ message: 'Case not found.' });
    const { status, priority, assignedTo, notes } = req.body || {};
    if (['open', 'investigating', 'escalated', 'resolved'].includes(status) && status !== c.status) {
      c.status = status; c.timeline.push({ type: 'status', text: `Status changed to ${status}`, actor: req.user._id });
    }
    if (['low', 'medium', 'high', 'critical'].includes(priority) && priority !== c.priority) {
      c.priority = priority; c.timeline.push({ type: 'priority', text: `Priority changed to ${priority}`, actor: req.user._id });
    }
    if (typeof assignedTo === 'string') c.assignedTo = assignedTo.trim().slice(0, 120);
    if (typeof notes === 'string') c.notes = notes.slice(0, 5000);
    await c.save();
    res.json({ case: safeCase(c) });
  } catch (e) { next(e); }
});

router.post('/:id/timeline', requireAuth, async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin' ? { _id: req.params.id } : { _id: req.params.id, owner: req.user._id };
    const c = await Case.findOne(filter);
    if (!c) return res.status(404).json({ message: 'Case not found.' });
    if (!req.body?.text?.trim()) return res.status(400).json({ message: 'Timeline note is required.' });
    c.timeline.push({ type: 'note', text: req.body.text.trim().slice(0, 500), actor: req.user._id });
    await c.save();
    res.json({ case: safeCase(c) });
  } catch (e) { next(e); }
});

export default router;
