import bcrypt from 'bcryptjs';
import User from './models/User.js';
import { connectDatabase } from './db.js';
import { env } from './config/env.js';

if (!env.adminEmail || !env.adminPassword) throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD before running npm run seed:admin.');
await connectDatabase();
const normalized = env.adminEmail.trim().toLowerCase();
const hash = await bcrypt.hash(env.adminPassword, 12);
await User.findOneAndUpdate({ email: normalized }, { name: env.adminName, email: normalized, passwordHash: hash, role: 'admin', isPremium: true }, { upsert: true, new: true, setDefaultsOnInsert: true });
console.log('Admin account seeded.');
process.exit(0);
