import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import multer from 'multer';

import { connectDatabase } from './db.js';
import { env } from './config/env.js';

import authRoutes from './routes/authRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import userRoutes from './routes/userRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import marketRoutes from './routes/marketRoutes.js';
import caseRoutes from './routes/caseRoutes.js';
import ruleRoutes from './routes/ruleRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

import { requireAuth } from './middleware/auth.js';

const app = express();

const allowedOrigins = new Set([
  env.clientOrigin,
  'http://localhost:5174',
  'http://127.0.0.1:5174',
]);

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use(
  cors({
    origin(origin, callback) {
      if (
        !origin ||
        allowedOrigins.has(origin)
      ) {
        return callback(null, true);
      }

      return callback(
        new Error(
          `CORS origin not allowed: ${origin}`
        )
      );
    },
    credentials: false,
  })
);

app.use(
  express.json({
    limit: '200kb',
  })
);


/* =========================================================
   HEALTH
========================================================= */

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    product: 'Fintel Secure',
    version: '2.0.0',
    api: 'online',
  });
});


/* =========================================================
   ROUTES
========================================================= */

app.use(
  '/api/auth',
  authRoutes
);

app.use(
  '/api/uploads/history',
  requireAuth,
  historyRoutes
);

app.use(
  '/api/uploads',
  uploadRoutes
);

app.use(
  '/api/user',
  userRoutes
);

app.use(
  '/api/complaints',
  complaintRoutes
);

app.use(
  '/api/market',
  marketRoutes
);

app.use(
  '/api/cases',
  caseRoutes
);

app.use(
  '/api/rules',
  ruleRoutes
);

app.use(
  '/api/admin',
  adminRoutes
);


/* =========================================================
   ERROR HANDLER
========================================================= */

app.use(
  (
    error,
    _req,
    res,
    _next
  ) => {
    if (
      error instanceof multer.MulterError
    ) {
      return res.status(400).json({
        message:
          error.code ===
          'LIMIT_FILE_SIZE'
            ? 'CSV exceeds the configured upload size.'
            : error.message,
      });
    }

    if (
      error?.message ===
      'Only CSV files are accepted.'
    ) {
      return res.status(400).json({
        message: error.message,
      });
    }

    console.error(
      '[Fintel API Error]',
      error
    );

    return res.status(
      error?.status || 500
    ).json({
      message:
        error?.message ||
        'Internal server error.',
    });
  }
);


/* =========================================================
   START SERVER
========================================================= */

const startServer = async () => {
  try {
    console.log(
      '[Fintel] Connecting to MongoDB...'
    );

    await connectDatabase();

    console.log(
      '[Fintel] MongoDB connected.'
    );

    app.listen(
      env.port,
      () => {
        console.log(
          `[Fintel] API running at http://localhost:${env.port}`
        );
      }
    );
  } catch (error) {
    console.error(
      '[Fintel] MongoDB connection failed.'
    );

    console.error(
      error?.message || error
    );

    console.error(
      '[Fintel] Server was not started because database connection is unavailable.'
    );

    process.exit(1);
  }
};

startServer();

export default app;