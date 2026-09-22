import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Building2,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { marketApi } from '../api/client.js';
import toast from 'react-hot-toast';

export default function MarketPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMarket = useCallback(async () => {
    setLoading(true);

    try {
      const result = await marketApi.overview();

      if (!result) {
        throw new Error('Market service returned no data.');
      }

      setData(result);
    } catch (error) {
      console.error('Market load failed:', error);
      toast.error(error?.message || 'Unable to load market data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMarket();
  }, [loadMarket]);

  const indices = useMemo(() => {
    if (Array.isArray(data?.indices)) {
      return data.indices.slice(0, 4);
    }

    return [];
  }, [data]);

  const gainers = useMemo(() => {
    return Array.isArray(data?.gainers)
      ? data.gainers.slice(0, 5)
      : [];
  }, [data]);

  const losers = useMemo(() => {
    return Array.isArray(data?.losers)
      ? data.losers.slice(0, 5)
      : [];
  }, [data]);

  const active = useMemo(() => {
    return Array.isArray(data?.active)
      ? data.active.slice(0, 8)
      : Array.isArray(data?.mostActive)
        ? data.mostActive.slice(0, 8)
        : [];
  }, [data]);

  const sectors = Array.isArray(data?.sectors)
    ? data.sectors.length
    : 0;

  return (
    <section className="fintel-market-page">
      {/* =====================================================
          PAGE HEADER
          ===================================================== */}
      <header className="fintel-market-header">
        <div className="fintel-market-header-copy">
          <p className="fintel-market-kicker">
            MARKET INTELLIGENCE
          </p>

          <h1>Market</h1>

          <p className="fintel-market-subtitle">
            Indian market overview, index movement, gainers,
            losers and trading activity.
          </p>
        </div>

        <button
          type="button"
          className="fintel-market-refresh"
          onClick={loadMarket}
          disabled={loading}
        >
          <RefreshCw
            size={14}
            className={loading ? 'fintel-market-spin' : ''}
          />
          <span>{loading ? 'Refreshing' : 'Refresh'}</span>
        </button>
      </header>

      {/* =====================================================
          INDEX CARDS
          ===================================================== */}
      <section className="fintel-market-index-grid">
        {indices.length ? (
          indices.map((item, index) => (
            <IndexCard
              key={`${item.symbol || item.name || 'index'}-${index}`}
              item={item}
            />
          ))
        ) : (
          <>
            <IndexSkeleton />
            <IndexSkeleton />
            <IndexSkeleton />
            <IndexSkeleton />
          </>
        )}
      </section>

      {/* =====================================================
          MARKET SNAPSHOT
          ===================================================== */}
      <section className="fintel-market-snapshot">
        <SnapshotCard
          icon={<ArrowUpRight size={16} />}
          label="Positive movers"
          value={gainers.length}
          detail="Top gainers tracked"
          tone="positive"
        />

        <SnapshotCard
          icon={<ArrowDownRight size={16} />}
          label="Negative movers"
          value={losers.length}
          detail="Top losers tracked"
          tone="negative"
        />

        <SnapshotCard
          icon={<Activity size={16} />}
          label="Active stocks"
          value={active.length}
          detail="Highest reported activity"
        />

        <SnapshotCard
          icon={<BarChart3 size={16} />}
          label="Sectors"
          value={sectors}
          detail="Research universe"
        />
      </section>

      {/* =====================================================
          GAINERS / LOSERS
          ===================================================== */}
      <section className="fintel-market-movers-grid">
        <MoverPanel
          title="Top gainers"
          subtitle="Largest positive moves"
          tone="positive"
          icon={<TrendingUp size={16} />}
          rows={gainers}
        />

        <MoverPanel
          title="Top losers"
          subtitle="Largest negative moves"
          tone="negative"
          icon={<TrendingDown size={16} />}
          rows={losers}
        />
      </section>

      {/* =====================================================
          ACTIVE STOCKS
          ===================================================== */}
      <section className="fintel-market-active-panel">
        <div className="fintel-market-section-head">
          <div className="fintel-market-section-title">
            <span className="fintel-market-section-icon">
              <Activity size={16} />
            </span>

            <div>
              <p>TRADING ACTIVITY</p>
              <h2>Most active stocks</h2>
              <span>
                Companies ranked by reported trading activity.
              </span>
            </div>
          </div>

          <Link
            to="/stocks"
            className="fintel-market-view-link"
          >
            Stock research
            <ArrowUpRight size={13} />
          </Link>
        </div>

        {active.length ? (
          <div className="fintel-market-active-table-wrap">
            <table className="fintel-market-active-table">
              <thead>
                <tr>
                  <th>COMPANY</th>
                  <th>PRICE</th>
                  <th>CHANGE</th>
                  <th>VOLUME</th>
                  <th>RESEARCH</th>
                </tr>
              </thead>

              <tbody>
                {active.map((stock, index) => (
                  <ActiveRow
                    key={`${stock.symbol || stock.display || index}`}
                    stock={stock}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="fintel-market-empty">
            <Activity size={18} />
            <strong>No market activity available.</strong>
            <span>
              The market service did not return active-stock data.
            </span>
          </div>
        )}
      </section>

      {/* =====================================================
          RESEARCH LINKS
          ===================================================== */}
      <section className="fintel-market-research-strip">
        <Link to="/stocks">
          <Building2 size={16} />
          <span>
            <strong>Stock research</strong>
            Search companies and technical data
          </span>
          <ArrowUpRight size={14} />
        </Link>

        <Link to="/screener">
          <BarChart3 size={16} />
          <span>
            <strong>Stock screener</strong>
            Filter companies by fundamentals
          </span>
          <ArrowUpRight size={14} />
        </Link>

        <Link to="/portfolio">
          <Activity size={16} />
          <span>
            <strong>Paper portfolio</strong>
            Track simulated positions
          </span>
          <ArrowUpRight size={14} />
        </Link>
      </section>
    </section>
  );
}


/* ============================================================
   INDEX CARD
   ============================================================ */

function IndexCard({ item }) {
  const change = Number(
    item.changePct ??
    item.changePercent ??
    item.change ??
    0
  );

  const positive = change >= 0;

  const name =
    item.name ||
    item.display ||
    item.symbol ||
    'Market index';

  const symbol =
    item.symbol ||
    item.ticker ||
    name;

  const price =
    item.price ??
    item.value ??
    item.close;

  return (
    <article className="fintel-market-index-card">
      <div className="fintel-market-index-top">
        <div>
          <span className="fintel-market-index-symbol">
            {symbol}
          </span>

          <small>Indian benchmark</small>
        </div>

        <span
          className={
            positive
              ? 'fintel-market-direction positive'
              : 'fintel-market-direction negative'
          }
        >
          {positive ? (
            <ArrowUpRight size={15} />
          ) : (
            <ArrowDownRight size={15} />
          )}
        </span>
      </div>

      <strong className="fintel-market-index-value">
        {price == null
          ? '—'
          : `₹${Number(price).toLocaleString('en-IN', {
              maximumFractionDigits: 2,
            })}`}
      </strong>

      <span
        className={
          positive
            ? 'fintel-market-index-change positive'
            : 'fintel-market-index-change negative'
        }
      >
        {change >= 0 ? '+' : ''}
        {change.toFixed(2)}%
      </span>
    </article>
  );
}


/* ============================================================
   SNAPSHOT CARD
   ============================================================ */

function SnapshotCard({
  icon,
  label,
  value,
  detail,
  tone = '',
}) {
  return (
    <article className="fintel-market-snapshot-card">
      <span
        className={`fintel-market-snapshot-icon ${tone}`}
      >
        {icon}
      </span>

      <div className="fintel-market-snapshot-copy">
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
    </article>
  );
}


/* ============================================================
   MOVERS PANEL
   ============================================================ */

function MoverPanel({
  title,
  subtitle,
  icon,
  tone,
  rows,
}) {
  return (
    <article className="fintel-market-movers-panel">
      <header className="fintel-market-panel-head">
        <div
          className={`fintel-market-panel-icon ${tone}`}
        >
          {icon}
        </div>

        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
      </header>

      <div className="fintel-market-mover-list">
        {rows.length ? (
          rows.map((stock, index) => (
            <MoverRow
              key={`${stock.symbol || stock.display || index}`}
              stock={stock}
              tone={tone}
            />
          ))
        ) : (
          <div className="fintel-market-empty-small">
            No market data available.
          </div>
        )}
      </div>
    </article>
  );
}


/* ============================================================
   MOVER ROW
   ============================================================ */

function MoverRow({ stock, tone }) {
  const change = Number(
    stock.changePct ??
    stock.changePercent ??
    stock.change ??
    0
  );

  const symbol =
    stock.symbol ||
    stock.ticker ||
    stock.display ||
    '—';

  const company =
    stock.company ||
    stock.name ||
    stock.display ||
    symbol;

  const price =
    stock.price ??
    stock.value ??
    stock.close;

  return (
    <div className="fintel-market-mover-row">
      <div className="fintel-market-company">
        <span className="fintel-market-company-badge">
          {symbol.slice(0, 3).toUpperCase()}
        </span>

        <div>
          <strong>{company}</strong>
          <small>{symbol}</small>
        </div>
      </div>

      <div className="fintel-market-mover-value">
        <strong>
          {price == null
            ? '—'
            : `₹${Number(price).toLocaleString('en-IN', {
                maximumFractionDigits: 2,
              })}`}
        </strong>

        <span
          className={
            tone === 'positive'
              ? 'positive'
              : 'negative'
          }
        >
          {change >= 0 ? '+' : ''}
          {change.toFixed(2)}%
        </span>
      </div>
    </div>
  );
}


/* ============================================================
   ACTIVE ROW
   ============================================================ */

function ActiveRow({ stock }) {
  const change = Number(
    stock.changePct ??
    stock.changePercent ??
    stock.change ??
    0
  );

  const symbol =
    stock.symbol ||
    stock.ticker ||
    stock.display ||
    '—';

  const company =
    stock.company ||
    stock.name ||
    stock.display ||
    symbol;

  const price =
    stock.price ??
    stock.value ??
    stock.close;

  const volume =
    stock.volume ??
    stock.tradingVolume ??
    stock.activity ??
    null;

  return (
    <tr>
      <td>
        <div className="fintel-market-table-company">
          <span className="fintel-market-company-badge">
            {symbol.slice(0, 3).toUpperCase()}
          </span>

          <div>
            <strong>{company}</strong>
            <small>{symbol}</small>
          </div>
        </div>
      </td>

      <td className="fintel-market-table-number">
        {price == null
          ? '—'
          : `₹${Number(price).toLocaleString('en-IN', {
              maximumFractionDigits: 2,
            })}`}
      </td>

      <td>
        <span
          className={
            change >= 0
              ? 'fintel-market-change-positive'
              : 'fintel-market-change-negative'
          }
        >
          {change >= 0 ? '+' : ''}
          {change.toFixed(2)}%
        </span>
      </td>

      <td className="fintel-market-table-number">
        {volume == null
          ? '—'
          : Number(volume).toLocaleString('en-IN')}
      </td>

      <td>
        <Link
          to={`/stocks/${encodeURIComponent(
            symbol
          )}`}
          className="fintel-market-research-button"
        >
          Research
          <ArrowUpRight size={12} />
        </Link>
      </td>
    </tr>
  );
}


/* ============================================================
   LOADING CARD
   ============================================================ */

function IndexSkeleton() {
  return (
    <article className="fintel-market-index-card fintel-market-skeleton">
      <span />
      <strong />
      <small />
    </article>
  );
}