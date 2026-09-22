import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { Router } from 'express';

import User from '../models/User.js';
import { env } from '../config/env.js';
import { requireAuth } from '../middleware/auth.js';

const router =
  Router();


/* =========================================================
   HELPERS
========================================================= */

const publicUser = (
  user
) => ({
  id: String(user._id),
  name: user.name,
  email: user.email,
  role: user.role,
  isPremium:
    Boolean(
      user.isPremium
    ),
});


const tokenFor = (
  user
) =>
  jwt.sign(
    {
      sub:
        user._id.toString(),

      role:
        user.role,
    },
    env.jwtSecret,
    {
      expiresIn:
        env.jwtExpiresIn,
    }
  );


const databaseReady =
  () =>
    mongoose.connection
      .readyState === 1;


/* =========================================================
   SIGN UP
========================================================= */

router.post(
  '/signup',
  async (
    req,
    res,
    next
  ) => {
    try {
      if (!databaseReady()) {
        return res
          .status(503)
          .json({
            message:
              'Database is not connected. Start MongoDB and try again.',
          });
      }

      const {
        name,
        email,
        password,
      } = req.body || {};

      if (
        !name?.trim() ||
        !email?.trim() ||
        typeof password !==
          'string' ||
        password.length < 8
      ) {
        return res
          .status(400)
          .json({
            message:
              'Name, email and a password of at least 8 characters are required.',
          });
      }

      const normalizedEmail =
        email
          .trim()
          .toLowerCase();

      const existing =
        await User.exists({
          email:
            normalizedEmail,
        });

      if (existing) {
        return res
          .status(409)
          .json({
            message:
              'An account with this email already exists.',
          });
      }

      const passwordHash =
        await bcrypt.hash(
          password,
          12
        );

      const user =
        await User.create({
          name:
            name.trim(),

          email:
            normalizedEmail,

          passwordHash,
        });

      return res
        .status(201)
        .json({
          token:
            tokenFor(user),

          user:
            publicUser(user),
        });
    } catch (error) {
      next(error);
    }
  }
);


/* =========================================================
   LOGIN
========================================================= */

router.post(
  '/login',
  async (
    req,
    res,
    next
  ) => {
    const started =
      Date.now();

    try {
      console.log(
        '[AUTH] Login request received'
      );

      /*
       * Critical:
       * Don't allow Mongoose to buffer a login
       * query while MongoDB is unavailable.
       */
      if (!databaseReady()) {
        console.error(
          '[AUTH] MongoDB is not connected'
        );

        return res
          .status(503)
          .json({
            message:
              'Fintel database is not connected. Check the backend terminal and MongoDB.',
          });
      }

      const normalizedEmail =
        req.body?.email
          ?.trim()
          .toLowerCase();

      const password =
        req.body?.password;

      if (
        !normalizedEmail ||
        typeof password !==
          'string'
      ) {
        return res
          .status(400)
          .json({
            message:
              'Email and password are required.',
          });
      }

      console.log(
        `[AUTH] Looking up user: ${normalizedEmail}`
      );

      const user =
        await User.findOne({
          email:
            normalizedEmail,
        }).select(
          '+passwordHash'
        );

      if (
        !user ||
        typeof user.passwordHash !==
          'string'
      ) {
        console.log(
          `[AUTH] Invalid credentials (${Date.now() - started}ms)`
        );

        return res
          .status(401)
          .json({
            message:
              'Invalid email or password.',
          });
      }

      console.log(
        '[AUTH] Verifying password'
      );

      const valid =
        await bcrypt.compare(
          password,
          user.passwordHash
        );

      if (!valid) {
        console.log(
          `[AUTH] Invalid password (${Date.now() - started}ms)`
        );

        return res
          .status(401)
          .json({
            message:
              'Invalid email or password.',
          });
      }

      const token =
        tokenFor(user);

      console.log(
        `[AUTH] Login successful in ${Date.now() - started}ms`
      );

      return res.json({
        token,

        user:
          publicUser(user),
      });
    } catch (error) {
      console.error(
        `[AUTH] Login error after ${Date.now() - started}ms`,
        error
      );

      next(error);
    }
  }
);


/* =========================================================
   VERIFY PASSWORD
========================================================= */

router.post(
  '/verify-password',
  requireAuth,
  async (
    req,
    res,
    next
  ) => {
    try {
      if (!databaseReady()) {
        return res
          .status(503)
          .json({
            verified: false,
            message:
              'Database is not connected.',
          });
      }

      const user =
        await User.findById(
          req.user._id
        ).select(
          '+passwordHash'
        );

      const valid =
        Boolean(
          user &&
            typeof req.body
              ?.password ===
              'string' &&
            await bcrypt.compare(
              req.body.password,
              user.passwordHash
            )
        );

      if (!valid) {
        return res
          .status(401)
          .json({
            verified: false,
            message:
              'Password verification failed.',
          });
      }

      return res.json({
        verified: true,
      });
    } catch (error) {
      next(error);
    }
  }
);


/* =========================================================
   CURRENT USER
========================================================= */

router.get(
  '/me',
  requireAuth,
  (
    req,
    res
  ) => {
    return res.json({
      user:
        publicUser(
          req.user
        ),
    });
  }
);


export default router;