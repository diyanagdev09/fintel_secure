import { Router } from 'express';
import Upload from '../models/Upload.js';
import { analyzeUpload } from '../services/uploadAnalysis.js';

const router = Router();
router.get('/', async (req, res, next) => {
  try {
    const uploads = await Upload.find({ owner: req.user._id }).sort({ createdAt: -1 }).limit(200);
    res.json({ uploads: uploads.map(analyzeUpload) });
  } catch (error) { next(error); }
});
export default router;
