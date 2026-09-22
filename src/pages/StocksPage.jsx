import { useEffect, useMemo, useState } from 'react';

import {
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  RefreshCw,
  Search,
  SlidersHorizontal,
  TrendingUp,
} from 'lucide-react';

import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

import { marketApi } from '../api/client.js';

export default function StocksPage() {
  const [params, setParams] = useSearchParams();

  const [query, setQuery] = useState(
    params.get('q') || ''
  );

  const [sector, setSector] = useState('All');
  const [rows, setRows] = useState([]);
  const [sectors, setSectors] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadedOnce, setLoadedOnce] = useState(false);

  const activeQuery = params.get('q') || '';

  /* ----------------------------------------------------------
     KEEP SEARCH INPUT IN SYNC WITH URL
  ---------------------------------------------------------- */

  useEffect(() => {
    setQuery(activeQuery);
  }, [activeQuery]);

  /* ----------------------------------------------------------
     LOAD SECTORS
  ---------------------------------------------------------- */

  useEffect(() => {
    let cancelled = false;

    const loadSectors = async () => {
      try {
        const result = await marketApi.overview();

        if (!cancelled) {
          setSectors(
            Array.isArray(result?.sectors)
              ? result.sectors
              : []
          );
        }
      } catch (error) {
        console.error(
          'Unable to load sectors:',
          error
        );
      }
    };

    loadSectors();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ----------------------------------------------------------
     LOAD STOCKS
  ---------------------------------------------------------- */

  const loadStocks = async () => {
    setLoading(true);

    try {
      const result = await marketApi.stocks(
        activeQuery,
        sector
      );

      const stocks = Array.isArray(result?.stocks)
        ? result.stocks
        : [];

      setRows(stocks);
      setLoadedOnce(true);
    } catch (error) {
      console.error(
        'Unable to load stocks:',
        error
      );

      setRows([]);
      setLoadedOnce(true);

      toast.error(
        error?.message ||
          'Unable to load stock data.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStocks();

    // loadStocks intentionally follows the URL/sector.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeQuery, sector]);

  /* ----------------------------------------------------------
     SEARCH
  ---------------------------------------------------------- */

  const submitSearch = (event) => {
    event.preventDefault();

    const cleanQuery = query.trim();

    if (cleanQuery) {
      setParams({
        q: cleanQuery,
      });
    } else {
      setParams({});
    }
  };

  const clearSearch = () => {
    setQuery('');
    setParams({});
  };

  /* ----------------------------------------------------------
     STATISTICS
  ---------------------------------------------------------- */

  const stats = useMemo(() => {
    const companies = rows.length;

    const gainers = rows.filter(
      (row) =>
        Number(row.changePct) > 0
    ).length;

    const losers = rows.filter(
      (row) =>
        Number(row.changePct) < 0
    ).length;

    const uniqueSectors = new Set(
      rows
        .map((row) => row.sector)
        .filter(Boolean)
    );

    return {
      companies,
      gainers,
      losers,
      sectors: uniqueSectors.size,
    };
  }, [rows]);

  /* ----------------------------------------------------------
     FORMATTERS
  ---------------------------------------------------------- */

  const formatPrice = (value) => {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return '—';
    }

    return `₹${number.toLocaleString(
      'en-IN',
      {
        maximumFractionDigits: 2,
      }
    )}`;
  };

  const formatNumber = (value, digits = 1) => {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return '—';
    }

    return number.toFixed(digits);
  };

  const formatPercent = (
    value,
    digits = 1
  ) => {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return '—';
    }

    return `${number.toFixed(digits)}%`;
  };

  const formatMarketCap = (value) => {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return '—';
    }

    return `${number.toLocaleString(
      'en-IN'
    )} Cr`;
  };

  /* ----------------------------------------------------------
     RENDER
  ---------------------------------------------------------- */

  return (
    <section className="fintel-stocks-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="fintel-stocks-heading">

        <div className="fintel-stocks-heading-copy">
          <p className="fintel-stocks-kicker">
            COMPANY RESEARCH
          </p>

          <h1>
            Stocks
          </h1>

          <p className="fintel-stocks-description">
            Search companies and symbols, compare
            market fundamentals, and open a full
            technical research view.
          </p>
        </div>

        <Link
          to="/screener"
          className="fintel-stocks-screener"
        >
          <SlidersHorizontal size={14} />
          <span>Open Screener</span>
        </Link>

      </header>

      {/* =====================================================
          SEARCH
      ===================================================== */}

      <form
        onSubmit={submitSearch}
        className="fintel-stocks-search"
      >

        <div className="fintel-stocks-search-input">

          <Search size={17} />

          <input
            type="text"
            value={query}
            onChange={(event) =>
              setQuery(event.target.value)
            }
            placeholder="Search company or ticker — e.g. Reliance, TCS, HDFCBANK"
            aria-label="Search company or ticker"
          />

          {query && (
            <button
              type="button"
              className="fintel-stocks-clear"
              onClick={clearSearch}
              aria-label="Clear search"
            >
              ×
            </button>
          )}

        </div>

        <select
          value={sector}
          onChange={(event) =>
            setSector(event.target.value)
          }
          className="fintel-stocks-select"
          aria-label="Filter by sector"
        >
          <option value="All">
            All sectors
          </option>

          {sectors.map((item) => (
            <option
              key={item}
              value={item}
            >
              {item}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="fintel-stocks-search-btn"
          disabled={loading}
        >
          <Search size={14} />
          <span>Search</span>
        </button>

      </form>

      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <div className="fintel-stock-stats">

        <StockStat
          icon={<Building2 size={17} />}
          label="Companies"
          value={
            loading
              ? '—'
              : stats.companies
          }
        />

        <StockStat
          icon={<TrendingUp size={17} />}
          label="Positive today"
          value={
            loading
              ? '—'
              : stats.gainers
          }
          tone="positive"
        />

        <StockStat
          icon={<ArrowDownRight size={17} />}
          label="Negative today"
          value={
            loading
              ? '—'
              : stats.losers
          }
          tone="negative"
        />

        <StockStat
          icon={<SlidersHorizontal size={17} />}
          label="Sectors"
          value={
            loading
              ? '—'
              : stats.sectors
          }
        />

      </div>

      {/* =====================================================
          RESEARCH TABLE
      ===================================================== */}

      <article className="fintel-stocks-table-card">

        <div className="fintel-stocks-table-head">

          <div>

            <p>
              RESEARCH UNIVERSE
            </p>

            <h2>
              Companies
            </h2>

            <span>
              {loading
                ? 'Refreshing market data…'
                : activeQuery
                  ? `${rows.length} result${
                      rows.length === 1
                        ? ''
                        : 's'
                    } for “${activeQuery}”`
                  : `${rows.length} companies in the reference universe`}
            </span>

          </div>

          <button
            type="button"
            className="fintel-stocks-refresh"
            onClick={loadStocks}
            disabled={loading}
          >

            <RefreshCw
              size={13}
              className={
                loading
                  ? 'fintel-refresh-spin'
                  : ''
              }
            />

            {loading
              ? 'Refreshing…'
              : 'Refresh'}

          </button>

        </div>

        {/* LOADING */}

        {loading && (
          <div className="fintel-stocks-loading">

            <div className="fintel-loading-spinner" />

            <strong>
              Loading stock universe
            </strong>

            <span>
              Retrieving company prices and
              reference fundamentals…
            </span>

          </div>
        )}

        {/* EMPTY */}

        {!loading &&
          !rows.length && (
            <div className="fintel-stocks-empty">

              <Building2 size={28} />

              <strong>
                {loadedOnce
                  ? 'No matching companies'
                  : 'No stock data available'}
              </strong>

              <span>
                {loadedOnce
                  ? 'Try a ticker such as RELIANCE, TCS or HDFCBANK.'
                  : 'The stock service did not return a company universe.'}
              </span>

            </div>
          )}

        {/* TABLE */}

        {!loading &&
          rows.length > 0 && (
            <div className="fintel-stocks-table-wrap">

              <table className="fintel-stocks-table">

                <thead>
                  <tr>
                    <th>COMPANY</th>
                    <th>PRICE</th>
                    <th>TODAY</th>
                    <th>P/E</th>
                    <th>ROE</th>
                    <th>GROWTH</th>
                    <th>DIVIDEND</th>
                    <th>MARKET CAP</th>
                    <th>RESEARCH</th>
                  </tr>
                </thead>

                <tbody>

                  {rows.map((stock) => {
                    const change =
                      Number(
                        stock.changePct
                      );

                    const hasChange =
                      Number.isFinite(
                        change
                      );

                    const positive =
                      change >= 0;

                    const symbol =
                      stock.display ||
                      stock.symbol;

                    return (
                      <tr
                        key={
                          stock.symbol ||
                          stock.display
                        }
                      >

                        {/* COMPANY */}

                        <td>
                          <Link
                            to={`/stocks/${encodeURIComponent(
                              symbol
                            )}`}
                            className="fintel-company-link"
                          >
                            <span className="fintel-company-name">
                              {stock.company ||
                                symbol}
                            </span>

                            <span className="fintel-company-meta">
                              {stock.display ||
                                stock.symbol}

                              {stock.sector
                                ? ` · ${stock.sector}`
                                : ''}
                            </span>
                          </Link>
                        </td>

                        {/* PRICE */}

                        <td className="fintel-price-cell">
                          {formatPrice(
                            stock.price
                          )}
                        </td>

                        {/* TODAY */}

                        <td>

                          {!hasChange ? (
                            <span className="fintel-neutral-value">
                              —
                            </span>
                          ) : (
                            <span
                              className={
                                positive
                                  ? 'fintel-change-positive'
                                  : 'fintel-change-negative'
                              }
                            >
                              {positive ? (
                                <ArrowUpRight
                                  size={13}
                                />
                              ) : (
                                <ArrowDownRight
                                  size={13}
                                />
                              )}

                              {positive
                                ? '+'
                                : ''}
                              {change.toFixed(
                                2
                              )}
                              %
                            </span>
                          )}

                        </td>

                        {/* PE */}

                        <td>
                          {formatNumber(
                            stock.pe,
                            1
                          )}
                        </td>

                        {/* ROE */}

                        <td>
                          {formatPercent(
                            stock.roe,
                            1
                          )}
                        </td>

                        {/* GROWTH */}

                        <td>
                          {formatPercent(
                            stock.revenueGrowth,
                            1
                          )}
                        </td>

                        {/* DIVIDEND */}

                        <td>
                          {formatPercent(
                            stock.dividendYield,
                            2
                          )}
                        </td>

                        {/* MARKET CAP */}

                        <td className="fintel-market-cap">
                          {formatMarketCap(
                            stock.marketCapCr
                          )}
                        </td>

                        {/* RESEARCH */}

                        <td>

                          <Link
                            to={`/stocks/${encodeURIComponent(
                              symbol
                            )}`}
                            className="fintel-view-stock"
                          >
                            View research
                          </Link>

                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>
          )}

      </article>

      {/* =====================================================
          FOOTER NOTE
      ===================================================== */}

      <div className="fintel-stocks-footer">

        <span>
          Market data and fundamentals are provided by
          the configured Fintel market service.
        </span>

        <span>
          Select a company to open its detailed
          technical research view.
        </span>

      </div>

    </section>
  );
}

/* ============================================================
   STAT CARD
============================================================ */

function StockStat({
  icon,
  label,
  value,
  tone = 'neutral',
}) {
  return (
    <div className="fintel-stock-stat">

      <div
        className={`fintel-stock-stat-icon ${tone}`}
      >
        {icon}
      </div>

      <div className="fintel-stock-stat-copy">

        <span>
          {label}
        </span>

        <strong>
          {value}
        </strong>

      </div>

    </div>
  );
}