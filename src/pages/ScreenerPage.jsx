import { useMemo, useState } from 'react';
import {
  Filter,
  Play,
  RotateCcw,
  Search,
  SlidersHorizontal,
  TrendingUp,
  ShieldCheck,
  BarChart3,
  WalletCards,
} from 'lucide-react';
import { marketApi } from '../api/client.js';
import toast from 'react-hot-toast';

const DEFAULT_FILTERS = {
  query: '',
  sector: 'All',
  minPe: '',
  maxPe: '',
  minRoe: '',
  minGrowth: '',
  minDividend: '',
  maxPrice: '',
};

const PRESETS = [
  {
    name: 'Value',
    description: 'Lower valuation',
    icon: BarChart3,
    filters: {
      minRoe: '10',
      maxPe: '25',
    },
  },
  {
    name: 'Quality',
    description: 'Higher ROE',
    icon: ShieldCheck,
    filters: {
      minRoe: '15',
    },
  },
  {
    name: 'Growth',
    description: 'Faster growth',
    icon: TrendingUp,
    filters: {
      minGrowth: '12',
    },
  },
  {
    name: 'Income',
    description: 'Higher dividend',
    icon: WalletCards,
    filters: {
      minDividend: '2',
    },
  },
];

export default function ScreenerPage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [rows, setRows] = useState([]);
  const [busy, setBusy] = useState(false);

  const activeFilters = useMemo(() => {
    const items = [];

    if (filters.query) {
      items.push({
        key: 'query',
        label: `Company: ${filters.query}`,
      });
    }

    if (filters.sector && filters.sector !== 'All') {
      items.push({
        key: 'sector',
        label: `Sector: ${filters.sector}`,
      });
    }

    if (filters.minPe) {
      items.push({
        key: 'minPe',
        label: `P/E ≥ ${filters.minPe}`,
      });
    }

    if (filters.maxPe) {
      items.push({
        key: 'maxPe',
        label: `P/E ≤ ${filters.maxPe}`,
      });
    }

    if (filters.minRoe) {
      items.push({
        key: 'minRoe',
        label: `ROE ≥ ${filters.minRoe}%`,
      });
    }

    if (filters.minGrowth) {
      items.push({
        key: 'minGrowth',
        label: `Growth ≥ ${filters.minGrowth}%`,
      });
    }

    if (filters.minDividend) {
      items.push({
        key: 'minDividend',
        label: `Dividend ≥ ${filters.minDividend}%`,
      });
    }

    if (filters.maxPrice) {
      items.push({
        key: 'maxPrice',
        label: `Price ≤ ₹${filters.maxPrice}`,
      });
    }

    return items;
  }, [filters]);

  const updateFilter = (key, value) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const applyPreset = (presetFilters) => {
    setFilters((current) => ({
      ...current,
      ...presetFilters,
    }));
  };

  const removeFilter = (key) => {
    setFilters((current) => ({
      ...current,
      [key]: key === 'sector' ? 'All' : '',
    }));
  };

  const runScreen = async () => {
    setBusy(true);

    try {
      const result = await marketApi.screener(filters);
      const stocks = Array.isArray(result)
        ? result
        : result?.stocks || [];

      setRows(stocks);

      if (!stocks.length) {
        toast('No companies match the current conditions.', {
          icon: 'ℹ️',
        });
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error?.message || 'Unable to run the stock screener.'
      );
    } finally {
      setBusy(false);
    }
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setRows([]);
  };

  return (
    <section className="screener-page">
      {/* HEADER */}
      <header className="screener-page__header">
        <div>
          <div className="screener-page__eyebrow">
            RESEARCH FILTERS
          </div>

          <h1 className="screener-page__title">
            Stock Screener
          </h1>

          <p className="screener-page__subtitle">
            Screen the research universe using valuation,
            profitability, growth, income and price conditions.
          </p>
        </div>

        <div className="screener-page__header-status">
          <span className="screener-page__status-dot" />
          <span>Research universe</span>
        </div>
      </header>

      {/* PRESETS */}
      <section className="screener-page__preset-grid">
        {PRESETS.map((preset) => {
          const Icon = preset.icon;

          return (
            <button
              type="button"
              key={preset.name}
              className="screener-page__preset"
              onClick={() => applyPreset(preset.filters)}
            >
              <div className="screener-page__preset-icon">
                <Icon size={17} />
              </div>

              <div className="screener-page__preset-content">
                <span className="screener-page__preset-label">
                  {preset.name}
                </span>

                <span className="screener-page__preset-description">
                  {preset.description}
                </span>
              </div>

              <span className="screener-page__preset-action">
                <Filter size={12} />
                Apply
              </span>
            </button>
          );
        })}
      </section>

      {/* BUILDER */}
      <section className="screener-page__card">
        <div className="screener-page__card-header">
          <div className="screener-page__card-heading">
            <div className="screener-page__section-icon">
              <SlidersHorizontal size={16} />
            </div>

            <div>
              <h2>Screen builder</h2>
              <p>
                Combine multiple conditions to narrow the
                research universe.
              </p>
            </div>
          </div>

          <div className="screener-page__builder-actions">
            <span className="screener-page__active-count">
              {activeFilters.length} active{' '}
              {activeFilters.length === 1
                ? 'filter'
                : 'filters'}
            </span>

            <button
              type="button"
              className="screener-page__button screener-page__button--secondary"
              onClick={resetFilters}
            >
              <RotateCcw size={13} />
              Reset
            </button>

            <button
              type="button"
              className="screener-page__button screener-page__button--primary"
              onClick={runScreen}
              disabled={busy}
            >
              <Play size={13} />
              {busy ? 'Running…' : 'Run screen'}
            </button>
          </div>
        </div>

        <div className="screener-page__filters">
          <ScreenerField
            label="Company / symbol"
            value={filters.query}
            placeholder="e.g. HDFCBANK"
            icon={<Search size={14} />}
            onChange={(value) =>
              updateFilter('query', value)
            }
          />

          <ScreenerField
            label="Min P/E"
            value={filters.minPe}
            placeholder="10"
            onChange={(value) =>
              updateFilter('minPe', value)
            }
          />

          <ScreenerField
            label="Max P/E"
            value={filters.maxPe}
            placeholder="25"
            onChange={(value) =>
              updateFilter('maxPe', value)
            }
          />

          <ScreenerField
            label="Min ROE"
            value={filters.minRoe}
            placeholder="10"
            suffix="%"
            onChange={(value) =>
              updateFilter('minRoe', value)
            }
          />

          <ScreenerField
            label="Min growth"
            value={filters.minGrowth}
            placeholder="12"
            suffix="%"
            onChange={(value) =>
              updateFilter('minGrowth', value)
            }
          />

          <ScreenerField
            label="Min dividend"
            value={filters.minDividend}
            placeholder="2"
            suffix="%"
            onChange={(value) =>
              updateFilter('minDividend', value)
            }
          />

          <ScreenerField
            label="Max price"
            value={filters.maxPrice}
            placeholder="3000"
            prefix="₹"
            onChange={(value) =>
              updateFilter('maxPrice', value)
            }
          />
        </div>

        {activeFilters.length > 0 && (
          <div className="screener-page__active-area">
            <span className="screener-page__active-label">
              ACTIVE CONDITIONS
            </span>

            <div className="screener-page__chips">
              {activeFilters.map((item) => (
                <button
                  type="button"
                  key={item.key}
                  className="screener-page__chip"
                  onClick={() => removeFilter(item.key)}
                >
                  <span>{item.label}</span>
                  <span className="screener-page__chip-close">
                    ×
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* RESULTS */}
      <section className="screener-page__results">
        <div className="screener-page__results-header">
          <div>
            <div className="screener-page__results-kicker">
              RESEARCH OUTPUT
            </div>

            <div className="screener-page__results-title-row">
              <h2>Screen results</h2>

              <span className="screener-page__result-badge">
                {rows.length} MATCH
                {rows.length === 1 ? '' : 'ES'}
              </span>
            </div>

            <p>
              {rows.length
                ? `${rows.length} compan${
                    rows.length === 1 ? 'y' : 'ies'
                  } match the current conditions.`
                : 'Run a screen to return companies matching your criteria.'}
            </p>
          </div>
        </div>

        <div className="screener-page__table-wrap">
          <table className="screener-page__table">
            <thead>
              <tr>
                <th>COMPANY</th>
                <th>PRICE</th>
                <th>CHANGE</th>
                <th>P/E</th>
                <th>ROE</th>
                <th>GROWTH</th>
                <th>DIVIDEND</th>
              </tr>
            </thead>

            <tbody>
              {rows.length > 0 ? (
                rows.map((stock) => (
                  <tr key={stock.symbol}>
                    <td>
                      <div className="screener-page__company">
                        <strong>
                          {stock.company || stock.display}
                        </strong>

                        <span>
                          {stock.display || stock.symbol}
                          {stock.sector
                            ? ` · ${stock.sector}`
                            : ''}
                        </span>
                      </div>
                    </td>

                    <td>
                      {stock.price == null
                        ? '—'
                        : `₹${Number(
                            stock.price
                          ).toLocaleString('en-IN', {
                            maximumFractionDigits: 2,
                          })}`}
                    </td>

                    <td
                      className={
                        Number(stock.changePct || 0) >= 0
                          ? 'screener-page__positive'
                          : 'screener-page__negative'
                      }
                    >
                      {stock.changePct == null
                        ? '—'
                        : `${
                            Number(stock.changePct) >= 0
                              ? '+'
                              : ''
                          }${Number(
                            stock.changePct
                          ).toFixed(2)}%`}
                    </td>

                    <td>
                      {stock.pe == null
                        ? '—'
                        : Number(stock.pe).toFixed(1)}
                    </td>

                    <td>
                      {stock.roe == null
                        ? '—'
                        : `${Number(stock.roe).toFixed(1)}%`}
                    </td>

                    <td>
                      {stock.revenueGrowth == null
                        ? '—'
                        : `${Number(
                            stock.revenueGrowth
                          ).toFixed(1)}%`}
                    </td>

                    <td>
                      {stock.dividendYield == null
                        ? '—'
                        : `${Number(
                            stock.dividendYield
                          ).toFixed(2)}%`}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="screener-page__empty-cell"
                  >
                    <div className="screener-page__empty">
                      <div className="screener-page__empty-icon">
                        <SlidersHorizontal size={21} />
                      </div>

                      <strong>
                        No screening results yet
                      </strong>

                      <span>
                        Set your conditions above and select
                        <b> Run screen </b>
                        to search the market universe.
                      </span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}

function ScreenerField({
  label,
  value,
  placeholder,
  prefix,
  suffix,
  icon,
  onChange,
}) {
  return (
    <label className="screener-page__field">
      <span className="screener-page__field-label">
        {label}
      </span>

      <span className="screener-page__input-wrap">
        {icon && (
          <span className="screener-page__input-icon">
            {icon}
          </span>
        )}

        {prefix && (
          <span className="screener-page__input-affix">
            {prefix}
          </span>
        )}

        <input
          value={value}
          placeholder={placeholder}
          onChange={(event) =>
            onChange(event.target.value)
          }
        />

        {suffix && (
          <span className="screener-page__input-affix">
            {suffix}
          </span>
        )}
      </span>
    </label>
  );
}