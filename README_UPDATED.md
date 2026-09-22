# Fintel Secure 2.0

## What was fixed

- Fixed the global application shell/header spacing.
- Removed the browser-default white button background from the Fintel Secure logo area.
- Fixed sidebar width, collapse behavior, scrolling and active navigation styling.
- Fixed page-title alignment so Dashboard, Market, Stocks, IPOs, Screener, Paper Portfolio and Learn no longer overlap the brand/toggle.
- Added the missing `/market` route.
- Connected `/ipos` to the existing `IPOPage`.
- Connected `/portfolio` to the existing `PortfolioPage`.
- Added a proper Learn page section.
- Improved Market loading/error states.
- Made the Express API start before MongoDB connects, so market/health endpoints can still come online when MongoDB is temporarily unavailable.
- Allowed both `localhost:5174` and `127.0.0.1:5174` in the API CORS configuration.
- Made Vite proxy to `127.0.0.1:5000` by default.

## Run

### 1. Install dependencies

PowerShell:

```powershell
cd C:\Users\Diya\fintel\capstone
npm install
```

### 2. Configure environment

Create `.env` from `.env.example` and keep your real MongoDB/JWT values.

### 3. Start backend

Terminal 1:

```powershell
npm run server
```

You should see:

```text
[Fintel] API running at http://localhost:5000
```

If MongoDB is unavailable, the API still starts and reports the database problem separately.

### 4. Start frontend

Terminal 2:

```powershell
npm run dev -- --host 127.0.0.1 --port 5174
```

Open:

```text
http://127.0.0.1:5174/
```

### 5. Verify the API

Open:

```text
http://127.0.0.1:5000/api/health
```

Expected response contains:

```json
{
  "status": "ok",
  "product": "Fintel Secure",
  "version": "2.0.0"
}
```

Then log in and test:

- Dashboard
- Data Upload
- Processing
- Insights
- Security
- Cases
- Rules Lab
- Market
- Stocks
- IPOs
- Screener
- Paper Portfolio
- Learn
