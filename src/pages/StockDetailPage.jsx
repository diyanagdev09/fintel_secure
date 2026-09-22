import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  Bookmark,
  BriefcaseBusiness,
  RefreshCw,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { marketApi } from '../api/client.js';
import '../styles/stock-detail-scoped.css';

const periods = ['1D', '1W', '1M', '3M', '6M', '1Y', '5Y'];
const portfolioKey = 'fintel-paper-portfolio';
const watchlistKey = 'fintel-watchlist';

export default function StockDetailPage() {
  const { symbol: routeSymbol } = useParams();
  const [queryParams] = useSearchParams();
  const symbol = queryParams.get('symbol') || decodeURIComponent(routeSymbol || '');

  const [stock, setStock] = useState(null);
  const [history, setHistory] = useState(null);
  const [period, setPeriod] = useState('1Y');
  const [busy, setBusy] = useState(true);
  const [historyBusy, setHistoryBusy] = useState(true);
  const [watchlisted, setWatchlisted] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(watchlistKey) || '[]').includes(symbol);
    } catch {
      return false;
    }
  });

  const loadStock = async () => {
    setBusy(true);
    try {
      const result = await marketApi.stock(symbol);
      setStock(result.stock);
    } catch (error) {
      toast.error(error?.message || 'Unable to load stock.');
    } finally {
      setBusy(false);
    }
  };

  const loadHistory = async (nextPeriod) => {
    setHistoryBusy(true);
    try {
      const result = await marketApi.history(symbol, nextPeriod);
      setHistory(result);
    } catch (error) {
      toast.error(error?.message || 'Unable to load price history.');
    } finally {
      setHistoryBusy(false);
    }
  };

  useEffect(() => {
    loadStock();
  }, [symbol]);

  useEffect(() => {
    loadHistory(period);
  }, [symbol, period]);

  const chartData = useMemo(() => {
    const points = Array.isArray(history?.history) ? history.history : [];
    if (!points.length) return null;

    return {
      points,
      labels: points.map((point) => point.label || point.date || ''),
      price: points.map((point) => Number(point.close)).filter(Number.isFinite),
    };
  }, [history]);

  const position = useMemo(() => {
    try {
      const holdings = JSON.parse(localStorage.getItem(portfolioKey) || '[]');
      return holdings.find((item) =>
        String(item.symbol || '').toLowerCase() === String(symbol || '').toLowerCase()
      ) || null;
    } catch {
      return null;
    }
  }, [symbol, stock?.price]);

  const toggleWatchlist = () => {
    let list = [];
    try {
      list = JSON.parse(localStorage.getItem(watchlistKey) || '[]');
    } catch {
      list = [];
    }

    const next = watchlisted
      ? list.filter((item) => item !== symbol)
      : [...new Set([...list, symbol])];

    localStorage.setItem(watchlistKey, JSON.stringify(next));
    setWatchlisted(!watchlisted);
    toast.success(watchlisted ? 'Removed from watchlist.' : 'Added to watchlist.');
  };

  const historicalOutcomes = useMemo(() => {
    const points = Array.isArray(history?.history) ? history.history : [];
    const horizon = 20;
    const result = {
      BUY: { wins: 0, losses: 0, total: 0, averageReturn: 0 },
      SELL: { wins: 0, losses: 0, total: 0, averageReturn: 0 },
    };

    points.forEach((point, index) => {
      const type = point?.marker;
      if (type !== 'BUY' && type !== 'SELL') return;

      const entry = Number(point?.close);
      const futureIndex = index + horizon;
      if (!Number.isFinite(entry) || futureIndex >= points.length) return;

      const exit = Number(points[futureIndex]?.close);
      if (!Number.isFinite(exit) || entry <= 0) return;

      const returnPct = ((exit - entry) / entry) * 100;
      const stats = result[type];
      stats.total += 1;
      stats.averageReturn += returnPct;

      if ((type === 'BUY' && returnPct > 0) || (type === 'SELL' && returnPct < 0)) {
        stats.wins += 1;
      } else {
        stats.losses += 1;
      }
    });

    Object.values(result).forEach((stats) => {
      if (stats.total) {
        stats.hitRate = (stats.wins / stats.total) * 100;
        stats.lossRate = (stats.losses / stats.total) * 100;
        stats.averageReturn /= stats.total;
      } else {
        stats.hitRate = null;
        stats.lossRate = null;
      }
    });

    return { ...result, horizon };
  }, [history]);
  if (!stock && busy) {
    return <div className="panel p-10 text-sm text-slate-600">Loading company research…</div>;
  }

  if (!stock) {
    return <div className="panel p-10 text-sm text-rose-300">Company not found.</div>;
  }

  const signal = history?.signal;



  const high52 = stock.high52 ?? history?.summary?.periodHigh;
  const low52 = stock.low52 ?? history?.summary?.periodLow;

  const positionPnl = position
    ? (Number(stock.price) - Number(position.average)) * Number(position.quantity)
    : 0;

  const positionPnlPct = position
    ? ((Number(stock.price) - Number(position.average)) / Number(position.average)) * 100
    : 0;

  return (
    <section className="stock-terminal">
      <div className="stock-topbar">
        <Link to="/stocks" className="stock-back-button">
          <ArrowLeft size={14} />
          Stocks
        </Link>

        <div className="stock-top-actions">
          <button type="button" className="stock-action-button" onClick={toggleWatchlist}>
            <Bookmark size={14} fill={watchlisted ? 'currentColor' : 'none'} />
            {watchlisted ? 'Watchlisted' : 'Watchlist'}
          </button>

          <button type="button" className="stock-action-button" onClick={loadStock} disabled={busy}>
            <RefreshCw size={14} className={busy ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      <header className="stock-company-header">
        <div>
          <p className="stock-symbol">
            {stock.display} · {stock.sector}
          </p>
          <h1>{stock.company}</h1>

          <div className="stock-price-row">
            <strong>
              ₹{Number(stock.price || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </strong>

            <span className={Number(stock.changePct) >= 0 ? 'stock-up' : 'stock-down'}>
              {Number(stock.changePct) >= 0 ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
              {Number(stock.changePct) >= 0 ? '+' : ''}
              {Number(stock.changePct || 0).toFixed(2)}%
            </span>
          </div>
        </div>

        <div className="stock-source-block">
          <span className={history?.isLive || stock.isLive ? 'stock-live-dot' : 'stock-reference-dot'} />
          <div>
            <strong>{history?.isLive || stock.isLive ? 'Market feed' : 'Reference feed'}</strong>
            <small>{history?.source || stock.source}</small>
          </div>
        </div>
      </header>

      <section className="stock-fundamentals">
        <Fundamental label="52W High" value={high52 == null ? '—' : `₹${Number(high52).toLocaleString()}`} />
        <Fundamental label="52W Low" value={low52 == null ? '—' : `₹${Number(low52).toLocaleString()}`} />
        <Fundamental label="P/E" value={stock.pe == null ? '—' : Number(stock.pe).toFixed(1)} />
        <Fundamental label="ROE" value={stock.roe == null ? '—' : `${Number(stock.roe).toFixed(1)}%`} />
        <Fundamental label="Growth" value={stock.revenueGrowth == null ? '—' : `${Number(stock.revenueGrowth).toFixed(1)}%`} />
        <Fundamental label="Dividend" value={stock.dividendYield == null ? '—' : `${Number(stock.dividendYield).toFixed(2)}%`} />
      </section>

      <div className="stock-analysis-grid">
        <article className="stock-chart-panel">
          <div className="stock-panel-header">
            <div>
              <p>PRICE & TREND</p>
              <h2>Historical price</h2>
            </div>
            <div className="stock-chart-legend">
              <span><i className="legend-price" />Price</span>
              <span><i className="legend-sma20" />SMA 20</span>
              <span><i className="legend-sma50" />SMA 50</span>
              <span><i className="legend-sma200" />SMA 200</span>
            </div>
          </div>

          <div className="stock-period-bar">
            {periods.map((item) => (
              <button
                type="button"
                key={item}
                className={period === item ? 'stock-period-active' : ''}
                onClick={() => setPeriod(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="stock-chart-wrap">
            {historyBusy || !chartData ? (
              <div className="stock-chart-loading">Loading {period} history…</div>
            ) : (
              <StockSvgChart points={chartData.points} />
            )}
          </div>

          <div className="stock-chart-foot">
            <span>Source: {history?.source || stock.source}</span>
            <span>Markers identify moving-average crossover events; they are not guarantees of future returns.</span>
          </div>
        </article>

        <aside className="stock-research-panel">
          <div className="stock-panel-header">
            <div>
              <p>RESEARCH ENGINE</p>
              <h2>Technical signal</h2>
            </div>
            <BarChart3 size={17} />
          </div>

          <div
            className={`stock-verdict-card ${
              signal?.label === 'SELL WATCH'
                ? 'stock-verdict-sell'
                : signal?.label === 'BUY WATCH'
                  ? 'stock-verdict-buy'
                  : signal?.label === 'CAUTION'
                    ? 'stock-verdict-caution'
                    : 'stock-verdict-neutral'
            }`}
          >
            <div className="stock-verdict-heading">
              <div>
                <span>FINTEL TECHNICAL ANALYSIS</span>
                <h3>
                  {signal?.label === 'SELL WATCH'
                    ? 'SELL / AVOID'
                    : signal?.label === 'BUY WATCH'
                      ? 'BUY WATCH'
                      : signal?.label === 'CAUTION'
                        ? 'WAIT / CAUTION'
                        : signal?.label === 'POSITIVE SETUP'
                          ? 'POSITIVE SETUP'
                          : 'HOLD / NEUTRAL'}
                </h3>
              </div>

              <div className="stock-verdict-score">
                <strong>{signal?.score ?? '—'}</strong>
                <span>/100</span>
              </div>
            </div>

            <p className="stock-verdict-summary">
              {signal?.label === 'SELL WATCH'
                ? 'Current technical conditions are weak and do not support a strong bullish entry.'
                : signal?.label === 'BUY WATCH'
                  ? 'Current technical conditions are supportive of a bullish setup, subject to market and company-specific risk.'
                  : signal?.label === 'CAUTION'
                    ? 'Current indicators are mixed or weakening. Waiting for stronger confirmation may provide a clearer setup.'
                    : signal?.label === 'POSITIVE SETUP'
                      ? 'Current indicators show a constructive technical setup, although confirmation from price and momentum remains important.'
                      : 'Current indicators do not provide a strong directional signal.'}
            </p>

            <div className="stock-verdict-status">
              <span
                className={
                  signal?.label === 'SELL WATCH'
                    ? 'stock-status-dot sell'
                    : signal?.label === 'BUY WATCH'
                      ? 'stock-status-dot buy'
                      : 'stock-status-dot neutral'
                }
              />
              <span>Based on the current technical indicators</span>
            </div>
          </div>

          <div className="stock-indicator-grid">
            <Indicator label="RSI 14" value={history?.summary?.rsi == null ? '—' : history.summary.rsi.toFixed(1)} />
            <Indicator label="SMA 20" value={history?.summary?.sma20 == null ? '—' : `₹${history.summary.sma20.toFixed(2)}`} />
            <Indicator label="SMA 50" value={history?.summary?.sma50 == null ? '—' : `₹${history.summary.sma50.toFixed(2)}`} />
            <Indicator label="Volume ratio" value={history?.summary?.volumeRatio == null ? '—' : `${history.summary.volumeRatio}x`} />
          </div>

          <div className="stock-scenario-grid">
            <ScenarioCard
              type="buy"
              title="BULLISH / BUY"
              stats={historicalOutcomes.BUY}
              horizon={historicalOutcomes.horizon}
            />
            <ScenarioCard
              type="sell"
              title="BEARISH / SELL"
              stats={historicalOutcomes.SELL}
              horizon={historicalOutcomes.horizon}
            />
          </div>

          <div className="stock-outcome-note">
            <ShieldCheck size={13} />
            <span>Percentages are historical signal hit rates from this chart period, not guaranteed future profit/loss probabilities.</span>
          </div>

          <div className="stock-analysis-reasons">
            <div className="stock-analysis-reasons-head">
              <span>WHY THIS RESULT</span>
              <small>Derived from current technical indicators</small>
            </div>

            <div className="stock-factor-list">
              {(signal?.factors || []).slice(0, 6).map((factor, index) => (
                <div key={`${factor.label}-${index}`} className={`stock-factor stock-factor-${factor.type || 'neutral'}`}>
                  <span>{factor.type === 'positive' ? '+' : factor.type === 'negative' ? '!' : '•'}</span>
                  <p>{factor.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="stock-disclaimer">
            <ShieldCheck size={14} />
            <span>{signal?.disclaimer}</span>
          </div>
        </aside>
      </div>

      <section className="stock-position-panel">
        <div className="stock-position-header">
          <div>
            <p>PAPER POSITION</p>
            <h2>Your simulated exposure</h2>
          </div>
          <BriefcaseBusiness size={17} />
        </div>

        {position ? (
          <div className="stock-position-grid">
            <PositionStat label="Quantity" value={position.quantity} />
            <PositionStat label="Average buy" value={`₹${Number(position.average).toFixed(2)}`} />
            <PositionStat label="Current" value={`₹${Number(stock.price).toFixed(2)}`} />
            <PositionStat label="Market value" value={`₹${(Number(stock.price) * Number(position.quantity)).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`} />
            <PositionStat label="Unrealized P/L" value={`₹${positionPnl.toFixed(2)}`} tone={positionPnl >= 0 ? 'positive' : 'negative'} />
            <PositionStat label="P/L %" value={`${positionPnlPct >= 0 ? '+' : ''}${positionPnlPct.toFixed(2)}%`} tone={positionPnlPct >= 0 ? 'positive' : 'negative'} />
          </div>
        ) : (
          <div className="stock-no-position">
            <div>
              <strong>No paper position in {stock.display}</strong>
              <p>Use Paper Portfolio to simulate a purchase or sale and track it here.</p>
            </div>
          </div>
        )}
      </section>

      <section className="stock-events-panel">
        <div className="stock-panel-header">
          <div>
            <p>SIGNAL HISTORY</p>
            <h2>Recent crossover events</h2>
          </div>
          <span>{history?.recentMarkers?.length || 0} events</span>
        </div>

        {!history?.recentMarkers?.length ? (
          <div className="stock-events-empty">No crossover events were detected for this period.</div>
        ) : (
          <div className="stock-events-grid">
            {history.recentMarkers.map((event, index) => (
              <div className="stock-event" key={`${event.date}-${event.type}-${index}`}>
                <div className={event.type === 'BUY' ? 'stock-event-icon stock-event-buy' : 'stock-event-icon stock-event-sell'}>
                  {event.type === 'BUY' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                </div>
                <div>
                  <strong>{event.type === 'BUY' ? 'Bullish crossover' : 'Bearish crossover'}</strong>
                  <span>{event.date} · ₹{Number(event.price).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}


function StockSvgChart({ points }) {
  const width = 1000;
  const height = 360;
  const pad = { left: 58, right: 22, top: 24, bottom: 42 };

  const finite = (key) => points
    .map((point, index) => ({ index, value: Number(point?.[key]) }))
    .filter((item) => Number.isFinite(item.value));

  const priceItems = finite('close');
  if (!priceItems.length) {
    return <div className="stock-chart-loading">No price history available.</div>;
  }

  const allValues = [
    ...priceItems.map((item) => item.value),
    ...finite('sma20').map((item) => item.value),
    ...finite('sma50').map((item) => item.value),
    ...finite('sma200').map((item) => item.value),
  ];

  let min = Math.min(...allValues);
  let max = Math.max(...allValues);
  if (!Number.isFinite(min) || !Number.isFinite(max)) return null;
  if (min === max) {
    const spread = Math.max(1, Math.abs(min) * 0.02);
    min -= spread;
    max += spread;
  }

  const range = max - min;
  const x = (index) => pad.left + (index / Math.max(points.length - 1, 1)) * (width - pad.left - pad.right);
  const y = (value) => pad.top + (1 - (value - min) / range) * (height - pad.top - pad.bottom);

  const pathFor = (key) => {
    let path = '';
    let started = false;
    points.forEach((point, index) => {
      const value = Number(point?.[key]);
      if (!Number.isFinite(value)) {
        started = false;
        return;
      }
      const command = started ? 'L' : 'M';
      path += `${command} ${x(index).toFixed(2)} ${y(value).toFixed(2)} `;
      started = true;
    });
    return path.trim();
  };

  const pricePath = pathFor('close');
  const areaPath = `${pricePath} L ${x(priceItems[priceItems.length - 1].index).toFixed(2)} ${height - pad.bottom} L ${x(priceItems[0].index).toFixed(2)} ${height - pad.bottom} Z`;
  const gridValues = [0, 0.25, 0.5, 0.75, 1].map((ratio) => max - range * ratio);
  const labelIndexes = [0, Math.floor((points.length - 1) * 0.25), Math.floor((points.length - 1) * 0.5), Math.floor((points.length - 1) * 0.75), points.length - 1]
    .filter((value, index, arr) => arr.indexOf(value) === index);

  return (
    <div className="stock-svg-chart" role="img" aria-label="Historical stock price chart">
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="stockPriceFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2d79aa" stopOpacity="0.34" />
            <stop offset="100%" stopColor="#2d79aa" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {gridValues.map((value) => (
          <g key={value}>
            <line x1={pad.left} x2={width - pad.right} y1={y(value)} y2={y(value)} className="stock-chart-grid-line" />
            <text x={pad.left - 10} y={y(value) + 4} textAnchor="end" className="stock-chart-axis-label">
              ₹{Number(value).toLocaleString('en-IN', { notation: 'compact', maximumFractionDigits: 1 })}
            </text>
          </g>
        ))}

        <path d={areaPath} fill="url(#stockPriceFill)" className="stock-chart-area" />
        <path d={pricePath} className="stock-svg-price" />
        <path d={pathFor('sma20')} className="stock-svg-sma20" />
        <path d={pathFor('sma50')} className="stock-svg-sma50" />
        <path d={pathFor('sma200')} className="stock-svg-sma200" />

        {points.map((point, index) => {
          const value = Number(point?.close);
          if (!Number.isFinite(value) || !point?.marker) return null;
          const isBuy = point.marker === 'BUY';
          const isSell = point.marker === 'SELL';
          if (!isBuy && !isSell) return null;
          return (
            <circle
              key={`${point.date || index}-${point.marker}`}
              cx={x(index)}
              cy={y(value)}
              r="4.5"
              className={isBuy ? 'stock-svg-buy' : 'stock-svg-sell'}
            />
          );
        })}

        {labelIndexes.map((index) => (
          <text key={index} x={x(index)} y={height - 13} textAnchor="middle" className="stock-chart-axis-label">
            {points[index]?.label || points[index]?.date || ''}
          </text>
        ))}
      </svg>
    </div>
  );
}

function Fundamental({ label, value }) {
  return (
    <div className="stock-fundamental">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Indicator({ label, value }) {
  return (
    <div className="stock-indicator">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ScenarioCard({ type, title, stats, horizon }) {
  const hasData = Number.isFinite(stats?.hitRate);

  return (
    <div className={`stock-scenario-card stock-scenario-${type}`}>
      <div className="stock-scenario-top">
        <div>
          <span>{type === 'buy' ? 'BULLISH CASE' : 'BEARISH CASE'}</span>
          <strong>{title}</strong>
        </div>
        <span className="stock-scenario-events">{stats?.total || 0} signals</span>
      </div>

      {hasData ? (
        <>
          <div className="stock-scenario-rate">
            <strong>{stats.hitRate.toFixed(0)}%</strong>
            <span>historical favorable outcome</span>
          </div>

          <div className="stock-scenario-bar">
            <span style={{ width: `${Math.max(0, Math.min(100, stats.hitRate))}%` }} />
          </div>

          <div className="stock-scenario-meta">
            <span>Unfavorable {stats.lossRate.toFixed(0)}%</span>
            <span>Avg. {stats.averageReturn >= 0 ? '+' : ''}{stats.averageReturn.toFixed(2)}%</span>
          </div>

          <small>Measured {horizon} chart observations after each historical signal.</small>
        </>
      ) : (
        <div className="stock-scenario-empty">Not enough completed historical signals to calculate a hit rate.</div>
      )}
    </div>
  );
}

function PositionStat({ label, value, tone }) {
  return (
    <div className="stock-position-stat">
      <span>{label}</span>
      <strong className={tone === 'positive' ? 'stock-up' : tone === 'negative' ? 'stock-down' : ''}>{value}</strong>
    </div>
  );
}
