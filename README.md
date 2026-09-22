# Fintel Secure 2.0

Fintel Secure is a full-stack financial intelligence capstone with two separate workspaces:

1. Transaction intelligence — CSV upload, data processing, explainable risk scoring, analyst review, investigation cases, evidence fingerprints and custom rules.
2. Market research — indices, stocks, IPO reference board, stock screener, paper portfolio and learning/reference pages.

## Requirements

- Node.js 18+
- MongoDB (local or hosted)

## Setup

1. Copy `.env.example` to `.env`.
2. Set `MONGODB_URI` and a long `JWT_SECRET`.
3. For an admin account, set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and optionally `ADMIN_NAME`, then run `npm run seed:admin` once.
4. Install dependencies: `npm install`
5. Start API: `npm run server`
6. In a second terminal start Vite: `npm run dev`
7. Open the URL printed by Vite (normally `http://localhost:5174`).

## Notes

- Paper Portfolio never places a real order. It uses browser local storage for simulation.
- Market quote endpoints attempt Yahoo Finance at request time. When that feed is unavailable, the UI clearly labels the deterministic Fintel reference universe.
- IPO records are a reference/demo board. Verify final issue dates and terms against the latest exchange/issuer notice before using them for a real decision.
- Never commit `.env` or expose database/JWT secrets in source control.
