import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import User from '../models/User.js';
import Upload from '../models/Upload.js';
import Case from '../models/Case.js';
import Complaint from '../models/complaints.js';
import { analyzeUpload } from '../services/uploadAnalysis.js';

const router = Router();
router.get('/risk', requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    const [uploads, users, cases, complaints] = await Promise.all([
      Upload.find({}).sort({ createdAt: -1 }).limit(200), User.countDocuments({ role: 'user' }), Case.find({}).sort({ updatedAt: -1 }).limit(50), Complaint.find({ status: { $ne: 'resolved' } }).sort({ createdAt: -1 }).limit(50),
    ]);
    const analyses = uploads.map(analyzeUpload);
    const tx = analyses.flatMap((u) => u.riskAnalysis.transactions.map((r) => ({ ...r, uploadId: u._id, filename: u.filename })));
    const counts = tx.reduce((a, r) => { a[r.riskLevel] += 1; return a; }, { LOW: 0, MEDIUM: 0, HIGH: 0 });
    res.json({ metrics: { users, datasets: uploads.length, transactions: tx.length, high: counts.HIGH, medium: counts.MEDIUM, low: counts.LOW, cases: cases.length, complaints: complaints.length }, priorityTransactions: tx.sort((a, b) => b.riskScore - a.riskScore).slice(0, 30), cases: cases.map((c) => ({ id: c._id, caseNumber: c.caseNumber, title: c.title, status: c.status, priority: c.priority, updatedAt: c.updatedAt })), complaints });
  } catch (e) { next(e); }
});
export default router;
