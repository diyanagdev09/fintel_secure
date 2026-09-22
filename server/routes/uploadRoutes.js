import { Router } from 'express';

import Upload from '../models/Upload.js';
import Case from '../models/Case.js';

import {
  requireAuth,
  requireAdmin,
} from '../middleware/auth.js';

import { csvUpload } from '../middleware/uploadValidation.js';
import { parseCsvUpload } from '../services/csvService.js';
import { benchmarkRows } from '../services/benchmarkService.js';
import { analyzeUpload } from '../services/uploadAnalysis.js';

const router = Router();

/*
 * ============================================================
 * CREATE / UPLOAD DATASETS
 * ============================================================
 */

router.post(
  '/',
  requireAuth,
  csvUpload.array('files', 10),
  async (req, res, next) => {
    const startedAt = Date.now();

    try {
      if (!req.files?.length) {
        return res.status(400).json({
          message: 'Select at least one CSV file.',
        });
      }

      console.log(
        `[UPLOAD] Received ${req.files.length} file(s)`
      );

      const uploads = [];

      for (const file of req.files) {
        console.log(
          `[UPLOAD] Starting: ${file.originalname}`
        );

        // 1. Parse CSV
        const parsed = parseCsvUpload(file);

        console.log(
          `[UPLOAD] Parsed ${parsed.rows.length} rows`
        );

        // 2. Benchmark
        const benchmark = await benchmarkRows(
          parsed.rows,
          parsed.headers
        );

        console.log(
          `[UPLOAD] Benchmark complete`
        );

        // 3. Save dataset
        const upload = await Upload.create({
          owner: req.user._id,
          filename: file.originalname,
          size: file.size,
          ...parsed,
          ...benchmark,
        });

        console.log(
          `[UPLOAD] Dataset saved: ${upload._id}`
        );

        // 4. Analyse once
        const analyzed = analyzeUpload(upload);

        uploads.push(analyzed);

        console.log(
          `[UPLOAD] Analysis complete`
        );
      }

      console.log(
        `[UPLOAD] TOTAL: ${Date.now() - startedAt}ms`
      );

      return res.status(201).json({
        uploads,
      });
    } catch (error) {
      console.error(
        '[UPLOAD ERROR]',
        error
      );

      next(error);
    }
  }
);


router.get(
  '/',
  requireAuth,
  async (req, res, next) => {
    try {
      const filter =
        req.user.role === 'admin'
          ? {}
          : {
              owner: req.user._id,
            };

      const uploads = await Upload.find(filter)
        .sort({
          createdAt: -1,
        })
        .limit(100)
        .lean();

      res.json({
        uploads: uploads.map(analyzeUpload),
      });
    } catch (error) {
      next(error);
    }
  }
);

/*
 * ============================================================
 * ADMIN: ALL DATASETS
 * ============================================================
 */

router.get(
  '/admin/all',
  requireAuth,
  requireAdmin,
  async (_req, res, next) => {
    try {
      const uploads = await Upload.find({})
        .sort({
          createdAt: -1,
        })
        .limit(200)
        .lean();

      res.json({
        uploads: uploads.map(analyzeUpload),
      });
    } catch (error) {
      next(error);
    }
  }
);

/*
 * ============================================================
 * DELETE DATASET
 *
 * IMPORTANT:
 * We delete the Upload first.
 *
 * A failure while cleaning linked Cases must NOT prevent the
 * actual dataset from being deleted.
 * ============================================================
 */

router.delete(
  '/:uploadId',
  requireAuth,
  async (req, res, next) => {
    try {
      const uploadId = req.params.uploadId;

      if (!uploadId) {
        return res.status(400).json({
          message: 'Dataset ID is required.',
        });
      }

      /*
       * First find the dataset and verify ownership.
       */
      const filter =
        req.user.role === 'admin'
          ? {
              _id: uploadId,
            }
          : {
              _id: uploadId,
              owner: req.user._id,
            };

      const upload =
        await Upload.findOne(filter);

      if (!upload) {
        return res.status(404).json({
          message:
            'Dataset not found or you do not have permission to delete it.',
        });
      }

      const deletedId =
        String(upload._id);

      const deletedFilename =
        upload.filename;

      /*
       * ------------------------------------------------------
       * DELETE THE ACTUAL DATASET FIRST
       * ------------------------------------------------------
       */

      const deleteResult =
        await Upload.deleteOne({
          _id: upload._id,
        });

      if (
        !deleteResult.deletedCount
      ) {
        return res.status(500).json({
          message:
            'Dataset could not be deleted from the database.',
        });
      }


      await Upload.deleteOne({
        _id: upload._id,
      });

      // Case cleanup should never prevent dataset deletion.
      try {
        await Case.deleteMany({
          'transactions.uploadId': upload._id,
        });
      } catch (caseError) {
        console.error(
          'Case cleanup failed after dataset deletion:',
          caseError
        );
      }

      return res.json({
        deleted: true,
        uploadId: deletedId,
        filename: deletedFilename,
      });
    } catch (error) {
      console.error(
        'DELETE DATASET ERROR:',
        error
      );

      next(error);
    }
  }
);

/*
 * ============================================================
 * GET ONE DATASET
 * ============================================================
 */

router.get(
  '/:uploadId',
  requireAuth,
  async (req, res, next) => {
    try {
      const filter =
        req.user.role === 'admin'
          ? {
              _id: req.params.uploadId,
            }
          : {
              _id: req.params.uploadId,
              owner: req.user._id,
            };

      const upload =
        await Upload.findOne(filter);

      if (!upload) {
        return res.status(404).json({
          message: 'Dataset not found.',
        });
      }

      res.json({
        upload:
          analyzeUpload(upload),
      });
    } catch (error) {
      next(error);
    }
  }
);

/*
 * ============================================================
 * REVIEW TRANSACTION
 * ============================================================
 */

router.patch(
  '/:uploadId/transactions/:transactionIndex/review',
  requireAuth,
  async (req, res, next) => {
    try {
      const index = Number(
        req.params.transactionIndex
      );

      const status =
        req.body?.status;

      if (
        !Number.isInteger(index) ||
        index < 0 ||
        !['safe', 'fraud'].includes(
          status
        )
      ) {
        return res.status(400).json({
          message:
            'Valid transaction index and review status are required.',
        });
      }

      const filter =
        req.user.role === 'admin'
          ? {
              _id: req.params.uploadId,
            }
          : {
              _id: req.params.uploadId,
              owner: req.user._id,
            };

      const upload =
        await Upload.findOne(filter);

      if (
        !upload ||
        index >= upload.rows.length
      ) {
        return res.status(404).json({
          message:
            'Transaction not found.',
        });
      }

      const note = String(
        req.body?.note || ''
      )
        .trim()
        .slice(0, 500);

      const existing =
        upload.riskReviews.find(
          (review) =>
            review.transactionIndex ===
            index
        );

      if (existing) {
        Object.assign(existing, {
          status,
          note,
          reviewedAt: new Date(),
          reviewedBy:
            req.user._id,
        });
      } else {
        upload.riskReviews.push({
          transactionIndex:
            index,
          status,
          note,
          reviewedBy:
            req.user._id,
        });
      }

      await upload.save();

      res.json({
        upload:
          analyzeUpload(upload),
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;