const universe = [
  { symbol: 'RELIANCE.NS', display: 'RELIANCE', company: 'Reliance Industries', sector: 'Energy', price: 2954.4, changePct: 0.72, pe: 24.1, roe: 9.8, revenueGrowth: 8.6, dividendYield: 0.34, marketCapCr: 2004000, volume: 5234000, high52: 3217.6, low52: 2220.3 },
  { symbol: 'TCS.NS', display: 'TCS', company: 'Tata Consultancy Services', sector: 'IT', price: 3220.1, changePct: -0.42, pe: 27.3, roe: 49.7, revenueGrowth: 6.5, dividendYield: 1.46, marketCapCr: 1168000, volume: 1723000, high52: 4592.3, low52: 2967.0 },
  { symbol: 'HDFCBANK.NS', display: 'HDFCBANK', company: 'HDFC Bank', sector: 'Financials', price: 914.2, changePct: 1.16, pe: 20.4, roe: 16.8, revenueGrowth: 13.4, dividendYield: 1.14, marketCapCr: 1398000, volume: 8142000, high52: 1015.8, low52: 664.4 },
  { symbol: 'INFY.NS', display: 'INFY', company: 'Infosys', sector: 'IT', price: 1510.5, changePct: -0.18, pe: 24.7, roe: 31.2, revenueGrowth: 7.8, dividendYield: 2.24, marketCapCr: 625000, volume: 2680000, high52: 2006.8, low52: 1358.3 },
  { symbol: 'ICICIBANK.NS', display: 'ICICIBANK', company: 'ICICI Bank', sector: 'Financials', price: 1415.8, changePct: 0.96, pe: 20.1, roe: 17.4, revenueGrowth: 17.2, dividendYield: 0.57, marketCapCr: 990000, volume: 4540000, high52: 1519.0, low52: 1034.0 },
  { symbol: 'SBIN.NS', display: 'SBIN', company: 'State Bank of India', sector: 'Financials', price: 894.9, changePct: 1.84, pe: 10.8, roe: 17.9, revenueGrowth: 10.2, dividendYield: 1.62, marketCapCr: 798000, volume: 9310000, high52: 932.0, low52: 555.0 },
  { symbol: 'BHARTIARTL.NS', display: 'BHARTIARTL', company: 'Bharti Airtel', sector: 'Telecom', price: 1928.4, changePct: 1.28, pe: 33.1, roe: 16.1, revenueGrowth: 11.5, dividendYield: 0.27, marketCapCr: 1201000, volume: 1980000, high52: 2038.0, low52: 1226.1 },
  { symbol: 'ITC.NS', display: 'ITC', company: 'ITC', sector: 'Consumer', price: 451.7, changePct: -0.09, pe: 26.8, roe: 28.4, revenueGrowth: 7.1, dividendYield: 2.98, marketCapCr: 562000, volume: 8410000, high52: 528.5, low52: 399.3 },
  { symbol: 'LT.NS', display: 'LT', company: 'Larsen & Toubro', sector: 'Industrials', price: 3921.3, changePct: 0.64, pe: 31.7, roe: 15.8, revenueGrowth: 17.9, dividendYield: 0.62, marketCapCr: 537000, volume: 1040000, high52: 4250.0, low52: 2617.0 },
  { symbol: 'MARUTI.NS', display: 'MARUTI', company: 'Maruti Suzuki India', sector: 'Auto', price: 14682.2, changePct: -0.74, pe: 28.4, roe: 13.7, revenueGrowth: 10.9, dividendYield: 0.95, marketCapCr: 442000, volume: 246000, high52: 16330.0, low52: 10737.0 },
  { symbol: 'SUNPHARMA.NS', display: 'SUNPHARMA', company: 'Sun Pharmaceutical Industries', sector: 'Healthcare', price: 1682.7, changePct: 1.03, pe: 40.6, roe: 13.1, revenueGrowth: 11.7, dividendYield: 0.74, marketCapCr: 405000, volume: 1110000, high52: 1800.0, low52: 1378.5 },
  { symbol: 'AXISBANK.NS', display: 'AXISBANK', company: 'Axis Bank', sector: 'Financials', price: 1186.7, changePct: -0.52, pe: 16.9, roe: 16.0, revenueGrowth: 16.4, dividendYield: 0.08, marketCapCr: 367000, volume: 3690000, high52: 1339.6, low52: 933.5 },
  { symbol: 'WIPRO.NS', display: 'WIPRO', company: 'Wipro', sector: 'IT', price: 271.2, changePct: 0.21, pe: 23.9, roe: 15.8, revenueGrowth: 2.6, dividendYield: 0.64, marketCapCr: 283000, volume: 3920000, high52: 325.8, low52: 207.1 },
  { symbol: 'HINDUNILVR.NS', display: 'HINDUNILVR', company: 'Hindustan Unilever', sector: 'Consumer', price: 2814.3, changePct: -0.31, pe: 54.2, roe: 20.5, revenueGrowth: 5.3, dividendYield: 1.41, marketCapCr: 662000, volume: 772000, high52: 3035.0, low52: 2166.0 },
  { symbol: 'ZOMATO.NS', display: 'ETERNAL', company: 'Eternal', sector: 'Consumer Tech', price: 298.4, changePct: 2.11, pe: 89.4, roe: 3.4, revenueGrowth: 42.5, dividendYield: 0, marketCapCr: 281000, volume: 10900000, high52: 344.0, low52: 174.0 },
  { symbol: 'BAJFINANCE.NS', display: 'BAJFINANCE', company: 'Bajaj Finance', sector: 'Financials', price: 1023.5, changePct: -1.08, pe: 27.0, roe: 20.1, revenueGrowth: 26.4, dividendYield: 0.12, marketCapCr: 632000, volume: 2250000, high52: 1308.0, low52: 780.0 },
  { symbol: 'TATAMOTORS.NS', display: 'TATAMOTORS', company: 'Tata Motors', sector: 'Auto', price: 693.7, changePct: 1.37, pe: 8.7, roe: 31.0, revenueGrowth: 14.2, dividendYield: 0.43, marketCapCr: 254000, volume: 12500000, high52: 1179.0, low52: 571.0 },
  { symbol: 'ADANIENT.NS', display: 'ADANIENT', company: 'Adani Enterprises', sector: 'Conglomerate', price: 2430.8, changePct: -1.41, pe: 69.5, roe: 5.7, revenueGrowth: 18.9, dividendYield: 0.04, marketCapCr: 280000, volume: 1810000, high52: 3518.0, low52: 1968.0 },
];

const indices = [
  { symbol: '^NSEI', label: 'NIFTY 50', value: 23346.4, change: 75.8, changePct: 0.33 },
  { symbol: '^BSESN', label: 'SENSEX', value: 74314.59, change: -21.86, changePct: -0.03 },
  { symbol: '^NSEBANK', label: 'BANK NIFTY', value: 56055.75, change: -236.7, changePct: -0.42 },
  { symbol: '^NSEIT', label: 'NIFTY IT', value: 29155.6, change: 67.95, changePct: 0.23 },
];

const ipoBoard = [
  { name: 'A-One Steels India', symbol: 'AONE', status: 'upcoming', priceBand: '₹285–405', open: '2026-09-24', close: '2026-09-28', issueSize: '₹405 Cr', issueType: 'Book Built', listingDate: '2026-10-01', exchange: 'NSE/BSE' },
  { name: 'Elevate Campuses', symbol: 'ELEVATE', status: 'upcoming', priceBand: '₹343–362', open: '2026-09-23', close: '2026-09-25', issueSize: '₹2,100 Cr', issueType: 'Book Built', listingDate: '2026-09-30', exchange: 'NSE/BSE' },
  { name: 'Swastika Infra', symbol: 'SWASTIKA', status: 'upcoming', priceBand: '₹175–185', open: '2026-09-23', close: '2026-09-25', issueSize: '₹161 Cr', issueType: 'Book Built', listingDate: '2026-09-30', exchange: 'NSE/BSE' },
  { name: 'Sona Selection India', symbol: 'SONA', status: 'live', priceBand: '₹1,055–1,071', open: '2026-09-17', close: '2026-09-19', issueSize: '₹320 Cr', issueType: 'Book Built', listingDate: '2026-09-25', exchange: 'NSE/BSE' },
  { name: 'Hero Motors', symbol: 'HERO', status: 'live', priceBand: '₹1,750–1,850', open: '2026-09-16', close: '2026-09-18', issueSize: '₹900 Cr', issueType: 'Book Built', listingDate: '2026-09-24', exchange: 'NSE/BSE' },
  { name: 'Orchid Warehousing', symbol: 'ORCHID', status: 'recent', priceBand: '₹512–540', open: '2026-09-01', close: '2026-09-03', issueSize: '₹275 Cr', issueType: 'Book Built', listingDate: '2026-09-08', exchange: 'NSE/BSE' },
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));

const average = (values) =>
  values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;

const sma = (values, period) =>
  values.map((_, index) => {
    if (index + 1 < period) return null;
    const slice = values.slice(index + 1 - period, index + 1);
    return slice.reduce((sum, value) => sum + value, 0) / period;
  });

const ema = (values, period) => {
  if (!values.length) return [];
  const multiplier = 2 / (period + 1);
  const output = new Array(values.length).fill(null);
  let previous = values[0];
  output[0] = previous;

  for (let i = 1; i < values.length; i += 1) {
    previous = (values[i] - previous) * multiplier + previous;
    output[i] = previous;
  }
  return output;
};

const calculateRsi = (values, period = 14) => {
  const output = new Array(values.length).fill(null);
  if (values.length <= period) return output;

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i += 1) {
    const difference = values[i] - values[i - 1];
    if (difference >= 0) gains += difference;
    else losses -= difference;
  }

  let averageGain = gains / period;
  let averageLoss = losses / period;

  output[period] = averageLoss === 0 ? 100 : 100 - 100 / (1 + averageGain / averageLoss);

  for (let i = period + 1; i < values.length; i += 1) {
    const difference = values[i] - values[i - 1];
    const gain = Math.max(difference, 0);
    const loss = Math.max(-difference, 0);

    averageGain = (averageGain * (period - 1) + gain) / period;
    averageLoss = (averageLoss * (period - 1) + loss) / period;

    output[i] = averageLoss === 0 ? 100 : 100 - 100 / (1 + averageGain / averageLoss);
  }

  return output;
};

const calculateMacd = (values) => {
  const fast = ema(values, 12);
  const slow = ema(values, 26);
  const macd = values.map((_, index) => (fast[index] == null || slow[index] == null ? null : fast[index] - slow[index]));
  const usable = macd.filter((value) => value != null);
  const signalValues = ema(usable, 9);
  const signal = new Array(values.length).fill(null);
  let pointer = 0;

  macd.forEach((value, index) => {
    if (value != null) {
      signal[index] = signalValues[pointer];
      pointer += 1;
    }
  });

  return { macd, signal };
};

const periodConfig = {
  '1D': { range: '1d', interval: '5m' },
  '1W': { range: '5d', interval: '15m' },
  '1M': { range: '1mo', interval: '1d' },
  '3M': { range: '3mo', interval: '1d' },
  '6M': { range: '6mo', interval: '1d' },
  '1Y': { range: '1y', interval: '1d' },
  '5Y': { range: '5y', interval: '1wk' },
};

const yahooSearch = async (query) => {
  try {
    const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=12&newsCount=0`;
    const response = await fetch(url, {
      signal: AbortSignal.timeout(6500),
      headers: { 'User-Agent': 'Mozilla/5.0 FintelSecure/2.0' },
    });

    if (!response.ok) return [];
    const json = await response.json();

    return Array.isArray(json?.quotes)
      ? json.quotes.filter((quote) => quote?.quoteType === 'EQUITY' && quote?.symbol)
      : [];
  } catch {
    return [];
  }
};

const chooseYahooEquity = (quotes) => {
  if (!quotes.length) return null;

  const indianNse = quotes.find((quote) => /\.NS$/i.test(quote.symbol));
  if (indianNse) return indianNse;

  const indianBse = quotes.find((quote) => /\.BO$/i.test(quote.symbol));
  if (indianBse) return indianBse;

  return quotes[0];
};

const resolveUniverseStock = async (query) => {
  const cleaned = String(query || '').trim();
  if (!cleaned) return null;

  const normalized = cleaned.toLowerCase();
  const direct = universe.find(
    (stock) =>
      stock.symbol.toLowerCase() === normalized ||
      stock.display.toLowerCase() === normalized ||
      stock.company.toLowerCase() === normalized
  );

  if (direct) return direct;

  const guesses = [
    cleaned,
    cleaned.replace(/\.(ns|bo)$/i, ''),
  ];

  for (const guess of guesses) {
    const result = chooseYahooEquity(await yahooSearch(guess));
    if (!result) continue;

    return {
      symbol: result.symbol,
      display: result.symbol.replace(/\.(NS|BO)$/i, ''),
      company: result.longname || result.shortname || result.symbol,
      sector: 'Market equity',
      price: Number(result.regularMarketPrice) || 0,
      changePct: Number(result.regularMarketChangePercent) || 0,
      pe: null,
      roe: null,
      revenueGrowth: null,
      dividendYield: null,
      marketCapCr: Number(result.marketCap) ? result.marketCap / 10000000 : null,
      volume: Number(result.regularMarketVolume) || 0,
      high52: Number(result.fiftyTwoWeekHigh) || null,
      low52: Number(result.fiftyTwoWeekLow) || null,
      dynamic: true,
    };
  }

  return null;
};

const yahooChart = async (
  symbol,
  period = '1Y',
  timeoutMs = 8500
) => {  try {
    const config = periodConfig[period] || periodConfig['1Y'];
    const url =
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}` +
      `?range=${config.range}&interval=${config.interval}`;

    const response = await fetch(url, {
      signal: AbortSignal.timeout(timeoutMs),
      headers: { 'User-Agent': 'Mozilla/5.0 FintelSecure/2.0' },
    });

    if (!response.ok) throw new Error(`Yahoo ${response.status}`);

    const json = await response.json();
    const result = json?.chart?.result?.[0];
    if (!result) throw new Error('No chart result');

    const timestamps = result.timestamp || [];
    const quote = result.indicators?.quote?.[0] || {};
    const opens = quote.open || [];
    const highs = quote.high || [];
    const lows = quote.low || [];
    const closes = quote.close || [];
    const volumes = quote.volume || [];

    const history = timestamps
      .map((timestamp, index) => {
        const close = Number(closes[index]);
        if (!Number.isFinite(close)) return null;

        const date = new Date(timestamp * 1000);
        return {
          timestamp,
          date: date.toISOString().slice(0, 10),
          label: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
          time: date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          open: Number.isFinite(Number(opens[index])) ? Number(opens[index]) : close,
          high: Number.isFinite(Number(highs[index])) ? Number(highs[index]) : close,
          low: Number.isFinite(Number(lows[index])) ? Number(lows[index]) : close,
          close,
          volume: Number.isFinite(Number(volumes[index])) ? Number(volumes[index]) : 0,
        };
      })
      .filter(Boolean);

    return {
      history,
      meta: result.meta || {},
      source: 'Yahoo Finance',
      isLive: history.length > 0,
    };
  } catch {
    return null;
  }
};

const createReferenceHistory = (stock, period = '1Y') => {
  const pointsByPeriod = {
    '1D': 78,
    '1W': 40,
    '1M': 24,
    '3M': 66,
    '6M': 132,
    '1Y': 250,
    '5Y': 260,
  };

  const points = pointsByPeriod[period] || 250;
  const basePrice = Number(stock.price) || 100;
  const baseVolume = Number(stock.volume) || 0;

  return Array.from({ length: points }, (_, index) => {
    const progress = points <= 1 ? 0 : index / (points - 1);
    const trend = (progress - 0.5) * 0.16;
    const wave = Math.sin(index * 0.37) * 0.013 + Math.cos(index * 0.13) * 0.008;
    const close = basePrice * (1 + trend + wave);
    const timestamp = Date.now() - (points - 1 - index) * 86400000;
    const date = new Date(timestamp);

    return {
      timestamp,
      date: date.toISOString().slice(0, 10),
      label: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      time: '',
      open: Number((close * 0.998).toFixed(2)),
      high: Number((close * 1.008).toFixed(2)),
      low: Number((close * 0.992).toFixed(2)),
      close: Number(close.toFixed(2)),
      volume: baseVolume,
    };
  });
};

const addTechnicalData = (history) => {
  const closes = history.map((point) => point.close);
  const sma20 = sma(closes, 20);
  const sma50 = sma(closes, 50);
  const sma200 = sma(closes, 200);
  const rsi = calculateRsi(closes, 14);
  const { macd, signal: macdSignal } = calculateMacd(closes);

  const recentVolumes = history
    .slice(-20)
    .map((point) => point.volume)
    .filter(Number.isFinite);

  const avgVolume = average(recentVolumes);
  const latestVolume = history.at(-1)?.volume;
  const volumeRatio = avgVolume && Number.isFinite(latestVolume) ? latestVolume / avgVolume : null;

  const enriched = history.map((point, index) => {
    const previous20 = sma20[index - 1];
    const previous50 = sma50[index - 1];
    const current20 = sma20[index];
    const current50 = sma50[index];

    let marker = null;

    const bullishCross =
      current20 != null && current50 != null && previous20 != null && previous50 != null &&
      current20 > current50 && previous20 <= previous50;

    const bearishCross =
      current20 != null && current50 != null && previous20 != null && previous50 != null &&
      current20 < current50 && previous20 >= previous50;

    if (bullishCross) marker = 'BUY';
    if (bearishCross) marker = 'SELL';

    return {
      ...point,
      sma20: sma20[index] == null ? null : Number(sma20[index].toFixed(2)),
      sma50: sma50[index] == null ? null : Number(sma50[index].toFixed(2)),
      sma200: sma200[index] == null ? null : Number(sma200[index].toFixed(2)),
      rsi14: rsi[index] == null ? null : Number(rsi[index].toFixed(2)),
      macd: macd[index] == null ? null : Number(macd[index].toFixed(4)),
      macdSignal: macdSignal[index] == null ? null : Number(macdSignal[index].toFixed(4)),
      marker,
    };
  });

  return { enriched, volumeRatio };
};

const buildResearchSignal = ({ price, sma20, sma50, sma200, rsi, macd, macdSignal, volumeRatio }) => {
  let score = 50;
  const factors = [];

  if (sma20 != null) {
    if (price > sma20) {
      score += 10;
      factors.push({ type: 'positive', label: 'Price is above the 20-period moving average.' });
    } else {
      score -= 8;
      factors.push({ type: 'negative', label: 'Price is below the 20-period moving average.' });
    }
  }

  if (sma20 != null && sma50 != null) {
    if (sma20 > sma50) {
      score += 10;
      factors.push({ type: 'positive', label: 'Short-term trend is above the medium-term trend.' });
    } else {
      score -= 10;
      factors.push({ type: 'negative', label: 'Short-term trend is below the medium-term trend.' });
    }
  }

  if (sma50 != null && sma200 != null) {
    if (sma50 > sma200) {
      score += 10;
      factors.push({ type: 'positive', label: 'Medium-term trend is above the long-term trend.' });
    } else {
      score -= 10;
      factors.push({ type: 'negative', label: 'Medium-term trend is below the long-term trend.' });
    }
  }

  if (rsi != null) {
    if (rsi >= 50 && rsi <= 68) {
      score += 10;
      factors.push({ type: 'positive', label: `RSI is ${rsi.toFixed(1)}, indicating positive momentum without an extreme reading.` });
    } else if (rsi > 70) {
      score -= 4;
      factors.push({ type: 'warning', label: `RSI is ${rsi.toFixed(1)}, indicating an elevated momentum reading.` });
    } else if (rsi < 35) {
      score -= 4;
      factors.push({ type: 'warning', label: `RSI is ${rsi.toFixed(1)}, indicating weak momentum.` });
    } else {
      factors.push({ type: 'neutral', label: `RSI is ${rsi.toFixed(1)}, giving a mixed momentum reading.` });
    }
  }

  if (macd != null && macdSignal != null) {
    if (macd > macdSignal) {
      score += 8;
      factors.push({ type: 'positive', label: 'MACD is above its signal line.' });
    } else {
      score -= 8;
      factors.push({ type: 'negative', label: 'MACD is below its signal line.' });
    }
  }

  if (volumeRatio != null) {
    if (volumeRatio > 1.15) {
      score += 5;
      factors.push({ type: 'positive', label: `Volume is ${volumeRatio.toFixed(2)}x its recent baseline.` });
    } else if (volumeRatio < 0.70) {
      score -= 3;
      factors.push({ type: 'warning', label: `Volume is ${volumeRatio.toFixed(2)}x its recent baseline.` });
    }
  }

  score = Math.round(clamp(score));

  let label = 'NEUTRAL';
  if (score >= 72) label = 'BUY WATCH';
  else if (score >= 58) label = 'POSITIVE SETUP';
  else if (score <= 32) label = 'SELL WATCH';
  else if (score <= 45) label = 'CAUTION';

  return {
    score,
    label,
    factors,
    disclaimer: 'Rule-based research signal from historical technical indicators. It is not a guarantee or personalized financial advice.',
  };
};

export const listStocks = async ({ query = '', sector = 'All' } = {}) => {
  const q = String(query || '').trim().toLowerCase();

  const local = universe.filter((stock) => {
    const matches =
      !q ||
      [stock.display, stock.company, stock.symbol, stock.sector].some((value) =>
        value.toLowerCase().includes(q)
      );

    return matches && (sector === 'All' || stock.sector === sector);
  });

  if (local.length || !q) {
    return local;
  }

  const dynamic = await resolveUniverseStock(query);

  return dynamic ? [dynamic] : [];
};

export const getStock =
  async (symbolOrQuery) => {

    const cleaned =
      String(
        symbolOrQuery || ''
      )
        .trim()
        .toLowerCase();

    const local =
      universe.find(
        (item) =>
          [
            item.symbol,
            item.display,
            item.company,
          ].some(
            (value) =>
              String(
                value
              ).toLowerCase() ===
              cleaned
          )
      );

    /*
     * Known companies already exist
     * in our reference universe.
     *
     * Do not wait 8.5 seconds for Yahoo
     * just to return the same company.
     */

    if (local) {

      return {
        ...local,

        source:
          'Fintel reference snapshot',

        isLive:
          false,
      };
    }

    const stock =
      await resolveUniverseStock(
        symbolOrQuery
      );

    if (!stock) {
      return null;
    }

    const quote =
      await yahooChart(
        stock.symbol,
        '1D'
      );

    const meta =
      quote?.meta;

    const latest =
      quote?.history?.at(-1);

    const previous =
      quote?.history?.at(-2);

    const price =
      Number(
        meta?.regularMarketPrice
      ) ||
      Number(
        latest?.close
      ) ||
      Number(
        stock.price
      ) ||
      0;

    const previousPrice =
      Number(
        meta?.chartPreviousClose
      ) ||
      Number(
        meta?.previousClose
      ) ||
      Number(
        previous?.close
      ) ||
      price;

    const change =
      price -
      previousPrice;

    const changePct =
      previousPrice
        ? (
            change /
            previousPrice
          ) * 100
        : Number(
            stock.changePct
          ) || 0;

    return {

      ...stock,

      price,

      change,

      changePct,

      high:
        Number(
          meta?.regularMarketDayHigh
        ) ||
        stock.high52 ||
        price,

      low:
        Number(
          meta?.regularMarketDayLow
        ) ||
        stock.low52 ||
        price,

      volume:
        Number(
          meta?.regularMarketVolume
        ) ||
        stock.volume ||
        0,

      currency:
        meta?.currency ||
        'INR',

      source:
        quote?.source ||
        'Fintel reference feed',

      isLive:
        Boolean(
          quote?.isLive
        ),
    };
  };

export const getStockHistory = async (symbolOrQuery, period = '1Y') => {
  const stock = await resolveUniverseStock(symbolOrQuery);
  if (!stock) return null;

  const requestedPeriod = periodConfig[period] ? period : '1Y';
  const live = await yahooChart(stock.symbol, requestedPeriod);

  let history = live?.history || [];
  let source = live?.source || 'Fintel reference feed';
  let isLive = Boolean(live?.isLive && history.length >= 5);

  if (!isLive) {
    history = createReferenceHistory(stock, requestedPeriod);
    source = 'Fintel reference feed';
  }

  const technical = addTechnicalData(history);
  history = technical.enriched;

  const latest = history.at(-1);
  const first = history[0];
  const high = Math.max(...history.map((point) => point.high));
  const low = Math.min(...history.map((point) => point.low));

  const signal = buildResearchSignal({
    price: latest?.close ?? stock.price ?? 0,
    sma20: latest?.sma20,
    sma50: latest?.sma50,
    sma200: latest?.sma200,
    rsi: latest?.rsi14,
    macd: latest?.macd,
    macdSignal: latest?.macdSignal,
    volumeRatio: technical.volumeRatio,
  });

  return {
    symbol: stock.display,
    yahooSymbol: stock.symbol,
    company: stock.company,
    period: requestedPeriod,
    source,
    isLive,
    history,
    summary: {
      start: first?.close ?? null,
      end: latest?.close ?? null,
      periodReturn: first?.close
        ? Number((((latest.close - first.close) / first.close) * 100).toFixed(2))
        : 0,
      periodHigh: high,
      periodLow: low,
      rsi: latest?.rsi14 ?? null,
      sma20: latest?.sma20 ?? null,
      sma50: latest?.sma50 ?? null,
      sma200: latest?.sma200 ?? null,
      volumeRatio:
        technical.volumeRatio == null
          ? null
          : Number(technical.volumeRatio.toFixed(2)),
    },
    signal,
    recentMarkers: history
      .filter((point) => point.marker)
      .slice(-8)
      .map((point) => ({
        date: point.date,
        type: point.marker,
        price: point.close,
      })),
  };
};

export const getIndices = async ({
  live = true,
} = {}) => {
  /*
   * Fintel has a local reference universe.
   *
   * For the Market dashboard we don't want the entire page
   * to depend on Yahoo Finance being reachable.
   *
   * `live: false` therefore returns the reference values
   * immediately.
   */

  if (!live) {
    return indices.map((index) => ({
      ...index,
      source: 'Fintel reference feed',
      isLive: false,
    }));
  }

  /*
   * Live mode is best-effort.
   *
   * Each Yahoo request already has its own timeout inside
   * yahooChart(), so one failed index does not break the
   * entire response.
   */

  const results =
    await Promise.all(
      indices.map(
        async (index) => {
          try {
            const quote =
              await yahooChart(
                index.symbol,
                '1D'
              );

            const latest =
              quote?.history?.at(-1);

            const previous =
              quote?.history?.at(-2);

            if (
              quote?.isLive &&
              latest
            ) {
              const previousPrice =
                previous?.close ||
                latest.close;

              const change =
                latest.close -
                previousPrice;

              return {
                ...index,

                value:
                  latest.close,

                change,

                changePct:
                  previousPrice
                    ? (change /
                        previousPrice) *
                      100
                    : 0,

                source:
                  quote.source,

                isLive: true,
              };
            }
          } catch (error) {
            console.warn(
              `[Market] Live index lookup failed for ${index.symbol}:`,
              error?.message
            );
          }

          /*
           * Never fail the entire market page because
           * one external quote failed.
           */
          return {
            ...index,

            source:
              'Fintel reference feed',

            isLive: false,
          };
        }
      )
    );

  return results;
};


export const getMarketOverview =
  async () => {
    /*
     * IMPORTANT:
     *
     * The Market dashboard must load from our local
     * reference universe immediately.
     *
     * Previously this function called getIndices()
     * with Yahoo Finance enabled. That meant the entire
     * /market/overview endpoint could sit waiting for
     * external requests.
     */

    const stocks =
      await listStocks();

    const topGainers =
      [...stocks]
        .sort(
          (a, b) =>
            Number(
              b.changePct || 0
            ) -
            Number(
              a.changePct || 0
            )
        )
        .slice(0, 5);

    const topLosers =
      [...stocks]
        .sort(
          (a, b) =>
            Number(
              a.changePct || 0
            ) -
            Number(
              b.changePct || 0
            )
        )
        .slice(0, 5);

    const mostActive =
      [...stocks]
        .sort(
          (a, b) =>
            Number(
              b.volume || 0
            ) -
            Number(
              a.volume || 0
            )
        )
        .slice(0, 10);

    const sectors =
      [
        ...new Set(
          stocks.map(
            (stock) =>
              stock.sector
          )
        ),
      ].sort();

    /*
     * Use the local index reference data here.
     *
     * This makes /market/overview respond immediately
     * even if Yahoo Finance is down.
     */
    const marketIndices =
      await getIndices({
        live: false,
      });

    return {
      indices:
        marketIndices,

      topGainers,

      topLosers,

      mostActive,

      sectors,

      source:
        'Fintel reference feed',

      isLive: false,

      updatedAt:
        new Date().toISOString(),
    };
  };

export const getIpos = async (status = 'all') => {
  await sleep(40);
  return status === 'all'
    ? ipoBoard
    : ipoBoard.filter((ipo) => ipo.status === status);
};

export const screenStocks = async (filters = {}) => {
  const {
    query = '',
    sector = 'All',
    minPe,
    maxPe,
    minRoe,
    minGrowth,
    minDividend,
    maxPrice,
  } = filters;

  const stocks = await listStocks({ query, sector });

  return stocks.filter((stock) =>
    (minPe === '' || minPe == null || stock.pe == null || stock.pe >= Number(minPe)) &&
    (maxPe === '' || maxPe == null || stock.pe == null || stock.pe <= Number(maxPe)) &&
    (minRoe === '' || minRoe == null || stock.roe == null || stock.roe >= Number(minRoe)) &&
    (minGrowth === '' || minGrowth == null || stock.revenueGrowth == null || stock.revenueGrowth >= Number(minGrowth)) &&
    (minDividend === '' || minDividend == null || stock.dividendYield == null || stock.dividendYield >= Number(minDividend)) &&
    (maxPrice === '' || maxPrice == null || stock.price == null || stock.price <= Number(maxPrice))
  );
};
