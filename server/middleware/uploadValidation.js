import multer from 'multer';
import { env } from '../config/env.js';

export const csvUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.maxUploadSize, files: 10 },
  fileFilter: (_request, file, callback) => {
    const okay = file.mimetype === 'text/csv' || file.originalname.toLowerCase().endsWith('.csv');
    callback(okay ? null : new Error('Only CSV files are accepted.'), okay);
  },
});
