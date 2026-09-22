import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ArrowDownRight,
  ArrowUpRight,
  BriefcaseBusiness,
  RefreshCw,
  Search,
  Trash2,
  TrendingDown,
  TrendingUp,
  WalletCards,
  X,
} from 'lucide-react';

import toast from 'react-hot-toast';
import { marketApi } from '../api/client.js';

const portfolioKey = 'fintel-paper-portfolio';

function readPortfolio() {
  try {
    const parsed = JSON.parse(
      localStorage.getItem(portfolioKey) || '[]'
    );

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function savePortfolio(positions) {
  localStorage.setItem(
    portfolioKey,
    JSON.stringify(positions)
  );
}

function money(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return '—';
  }

  return `₹${number.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function compactMoney(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return '₹0';
  }

  if (Math.abs(number) >= 10000000) {
    return `₹${(number / 10000000).toFixed(2)} Cr`;
  }

  if (Math.abs(number) >= 100000) {
    return `₹${(number / 100000).toFixed(2)} L`;
  }

  if (Math.abs(number) >= 1000) {
    return `₹${(number / 1000).toFixed(1)}K`;
  }

  return money(number);
}

export default function PortfolioPage() {
  const [positions, setPositions] = useState(readPortfolio);
  const [prices, setPrices] = useState({});
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);

  const [tradeType, setTradeType] = useState('BUY');
  const [quantity, setQuantity] = useState('');
  const [tradePrice, setTradePrice] = useState('');

  const [searching, setSearching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [trading, setTrading] = useState(false);
  const [error, setError] = useState('');

  const positionMap = useMemo(() => {
    const map = new Map();

    positions.forEach((position) => {
      map.set(
        String(position.symbol || '').toUpperCase(),
        position
      );
    });

    return map;
  }, [positions]);

  const getCurrentPrice = useCallback(
    (position) => {
      const symbol = String(
        position.symbol || ''
      ).toUpperCase();

      return Number(
        prices[symbol] ??
          position.lastPrice ??
          position.average ??
          0
      );
    },
    [prices]
  );

  const portfolioStats = useMemo(() => {
    let invested = 0;
    let marketValue = 0;
    let unrealized = 0;

    positions.forEach((position) => {
      const qty = Number(position.quantity) || 0;
      const average = Number(position.average) || 0;
      const current = getCurrentPrice(position);

      invested += qty * average;
      marketValue += qty * current;
      unrealized += qty * (current - average);
    });

    const pnlPct =
      invested > 0
        ? (unrealized / invested) * 100
        : 0;

    return {
      positions: positions.length,
      invested,
      marketValue,
      unrealized,
      pnlPct,
    };
  }, [positions, getCurrentPrice]);

  const refreshPrices = useCallback(
    async (showToast = true) => {
      if (!positions.length) {
        if (showToast) {
          toast('No positions to refresh.');
        }
        return;
      }

      setRefreshing(true);

      try {
        const results = await Promise.all(
          positions.map(async (position) => {
            try {
              const result = await marketApi.stock(
                position.symbol
              );

              return {
                symbol: String(
                  position.symbol
                ).toUpperCase(),
                price: Number(result?.stock?.price),
              };
            } catch {
              return {
                symbol: String(
                  position.symbol
                ).toUpperCase(),
                price: null,
              };
            }
          })
        );

        const nextPrices = {};

        results.forEach((item) => {
          if (
            item.price != null &&
            Number.isFinite(item.price)
          ) {
            nextPrices[item.symbol] = item.price;
          }
        });

        setPrices((current) => ({
          ...current,
          ...nextPrices,
        }));

        setPositions((current) =>
          current.map((position) => {
            const symbol = String(
              position.symbol
            ).toUpperCase();

            return nextPrices[symbol] != null
              ? {
                  ...position,
                  lastPrice: nextPrices[symbol],
                }
              : position;
          })
        );

        if (showToast) {
          toast.success('Portfolio prices refreshed.');
        }
      } finally {
        setRefreshing(false);
      }
    },
    [positions]
  );

  useEffect(() => {
    if (positions.length) {
      refreshPrices(false);
    }
  }, []);

  const runSearch = async () => {
    const query = search.trim();

    if (!query) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    setError('');

    try {
      const result = await marketApi.stocks(
        query,
        'All'
      );

      const stocks = Array.isArray(result)
        ? result
        : result?.stocks || [];

      setSearchResults(stocks.slice(0, 8));

      if (!stocks.length) {
        setError(
          `No company or ticker found for "${query}".`
        );
      }
    } catch (err) {
      console.error(err);
      setSearchResults([]);
      setError(
        err?.message ||
          'Unable to search the market.'
      );
    } finally {
      setSearching(false);
    }
  };

  const chooseStock = async (stock) => {
    const symbol =
      stock.symbol ||
      stock.display ||
      stock.company;

    if (!symbol) return;

    setSearch(symbol);
    setSearchResults([]);
    setError('');

    try {
      const result = await marketApi.stock(symbol);

      const latest =
        result?.stock || stock;

      setSelectedStock(latest);

      const latestPrice = Number(
        latest.price
      );

      if (Number.isFinite(latestPrice)) {
        setTradePrice(
          latestPrice.toFixed(2)
        );
      }
    } catch {
      setSelectedStock(stock);

      if (Number.isFinite(Number(stock.price))) {
        setTradePrice(
          Number(stock.price).toFixed(2)
        );
      }
    }
  };

  const clearSelectedStock = () => {
    setSelectedStock(null);
    setSearch('');
    setSearchResults([]);
    setQuantity('');
    setTradePrice('');
    setError('');
  };

  const submitTrade = () => {
    setError('');

    if (!selectedStock) {
      setError(
        'Search and select a company before recording a trade.'
      );
      return;
    }

    const symbol = String(
      selectedStock.symbol ||
        selectedStock.display ||
        ''
    ).toUpperCase();

    const company =
      selectedStock.company ||
      selectedStock.display ||
      symbol;

    const qty = Number(quantity);
    const price = Number(tradePrice);

    if (!Number.isFinite(qty) || qty <= 0) {
      setError('Enter a valid quantity greater than 0.');
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      setError('Enter a valid price greater than 0.');
      return;
    }

    const existing =
      positionMap.get(symbol);

    setTrading(true);

    try {
      let nextPositions = [...positions];

      if (tradeType === 'BUY') {
        if (existing) {
          const oldQty =
            Number(existing.quantity) || 0;

          const oldAverage =
            Number(existing.average) || 0;

          const newQuantity =
            oldQty + qty;

          const newAverage =
            ((oldQty * oldAverage) +
              qty * price) /
            newQuantity;

          nextPositions =
            nextPositions.map((position) =>
              String(position.symbol)
                .toUpperCase() === symbol
                ? {
                    ...position,
                    company,
                    quantity: newQuantity,
                    average: newAverage,
                    lastPrice: price,
                    updatedAt:
                      new Date().toISOString(),
                  }
                : position
            );
        } else {
          nextPositions.push({
            symbol,
            company,
            quantity: qty,
            average: price,
            lastPrice: price,
            updatedAt:
              new Date().toISOString(),
          });
        }

        toast.success(
          `${symbol} BUY recorded.`
        );
      } else {
        if (!existing) {
          setError(
            `You do not currently hold ${symbol}.`
          );
          return;
        }

        const oldQty =
          Number(existing.quantity) || 0;

        if (qty > oldQty) {
          setError(
            `You only hold ${oldQty} shares of ${symbol}.`
          );
          return;
        }

        const newQuantity =
          oldQty - qty;

        if (newQuantity === 0) {
          nextPositions =
            nextPositions.filter(
              (position) =>
                String(position.symbol)
                  .toUpperCase() !== symbol
            );
        } else {
          nextPositions =
            nextPositions.map((position) =>
              String(position.symbol)
                .toUpperCase() === symbol
                ? {
                    ...position,
                    quantity: newQuantity,
                    lastPrice: price,
                    updatedAt:
                      new Date().toISOString(),
                  }
                : position
            );
        }

        toast.success(
          `${symbol} SELL recorded.`
        );
      }

      savePortfolio(nextPositions);
      setPositions(nextPositions);

      setQuantity('');
      setSelectedStock(null);
      setSearch('');
      setSearchResults([]);
      setTradePrice('');
    } finally {
      setTrading(false);
    }
  };

  const deletePosition = (symbol) => {
    const nextPositions =
      positions.filter(
        (position) =>
          String(position.symbol)
            .toUpperCase() !==
          String(symbol).toUpperCase()
      );

    savePortfolio(nextPositions);
    setPositions(nextPositions);

    setPrices((current) => {
      const next = { ...current };
      delete next[String(symbol).toUpperCase()];
      return next;
    });

    toast.success(
      `${symbol} removed from portfolio.`
    );
  };

  return (
    <section className="paper-portfolio-page">
      {/* PAGE HEADER */}
      <header className="paper-portfolio-header">
        <div>
          <div className="paper-portfolio-eyebrow">
            SIMULATED TRADING
          </div>

          <h1 className="paper-portfolio-title">
            Paper Portfolio
          </h1>

          <p className="paper-portfolio-subtitle">
            Track simulated positions using market prices
            without placing real orders.
          </p>
        </div>

        <button
          type="button"
          className="paper-portfolio-refresh"
          onClick={() => refreshPrices(true)}
          disabled={refreshing}
        >
          <RefreshCw
            size={14}
            className={
              refreshing
                ? 'paper-portfolio-spin'
                : ''
            }
          />
          {refreshing
            ? 'Refreshing…'
            : 'Refresh prices'}
        </button>
      </header>

      {/* KPI STRIP */}
      <section className="paper-portfolio-kpis">
        <PortfolioKpi
          label="Positions"
          value={portfolioStats.positions}
          detail="Active holdings"
          icon={<BriefcaseBusiness size={17} />}
        />

        <PortfolioKpi
          label="Invested"
          value={compactMoney(
            portfolioStats.invested
          )}
          detail="Cost basis"
          icon={<WalletCards size={17} />}
        />

        <PortfolioKpi
          label="Market value"
          value={compactMoney(
            portfolioStats.marketValue
          )}
          detail="Current exposure"
          icon={<TrendingUp size={17} />}
        />

        <PortfolioKpi
          label="Unrealized P/L"
          value={compactMoney(
            portfolioStats.unrealized
          )}
          detail={`${
            portfolioStats.pnlPct >= 0
              ? '+'
              : ''
          }${portfolioStats.pnlPct.toFixed(2)}%`}
          positive={
            portfolioStats.unrealized >= 0
          }
          icon={
            portfolioStats.unrealized >= 0 ? (
              <ArrowUpRight size={17} />
            ) : (
              <ArrowDownRight size={17} />
            )
          }
        />
      </section>

      {/* MAIN GRID */}
      <div className="paper-portfolio-grid">
        {/* TRADE PANEL */}
        <section className="paper-portfolio-card paper-portfolio-trade-card">
          <div className="paper-portfolio-card-header">
            <div>
              <div className="paper-portfolio-card-kicker">
                PAPER TRADE
              </div>

              <h2>Add position</h2>

              <p>
                Select a company and record a simulated
                transaction.
              </p>
            </div>

            <div className="paper-portfolio-card-icon">
              <BriefcaseBusiness size={17} />
            </div>
          </div>

          <div className="paper-portfolio-trade-body">
            <label className="paper-portfolio-label">
              Search stock
            </label>

            <div className="paper-portfolio-search">
              <Search size={15} />

              <input
                value={search}
                placeholder="Search company or ticker"
                onChange={(event) => {
                  setSearch(event.target.value);
                  setError('');
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    runSearch();
                  }
                }}
              />

              {search && (
                <button
                  type="button"
                  className="paper-portfolio-search-clear"
                  onClick={clearSelectedStock}
                >
                  <X size={14} />
                </button>
              )}

              <button
                type="button"
                className="paper-portfolio-search-button"
                onClick={runSearch}
                disabled={searching}
              >
                {searching
                  ? 'Searching…'
                  : 'Search'}
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="paper-portfolio-results">
                {searchResults.map((stock) => (
                  <button
                    type="button"
                    key={
                      stock.symbol ||
                      stock.display
                    }
                    className="paper-portfolio-result"
                    onClick={() =>
                      chooseStock(stock)
                    }
                  >
                    <span>
                      <strong>
                        {stock.symbol ||
                          stock.display}
                      </strong>

                      <small>
                        {stock.company ||
                          stock.display ||
                          'Company'}
                      </small>
                    </span>

                    <span className="paper-portfolio-result-price">
                      {stock.price != null
                        ? money(stock.price)
                        : '—'}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {selectedStock && (
              <div className="paper-portfolio-selected">
                <div>
                  <span>SELECTED STOCK</span>

                  <strong>
                    {selectedStock.symbol ||
                      selectedStock.display}
                  </strong>

                  <small>
                    {selectedStock.company ||
                      selectedStock.display}
                  </small>
                </div>

                <div className="paper-portfolio-selected-price">
                  <span>MARKET PRICE</span>

                  <strong>
                    {selectedStock.price != null
                      ? money(
                          selectedStock.price
                        )
                      : '—'}
                  </strong>
                </div>
              </div>
            )}

            <div className="paper-portfolio-toggle">
              <button
                type="button"
                className={
                  tradeType === 'BUY'
                    ? 'active buy'
                    : ''
                }
                onClick={() =>
                  setTradeType('BUY')
                }
              >
                <ArrowUpRight size={14} />
                Buy
              </button>

              <button
                type="button"
                className={
                  tradeType === 'SELL'
                    ? 'active sell'
                    : ''
                }
                onClick={() =>
                  setTradeType('SELL')
                }
              >
                <ArrowDownRight size={14} />
                Sell
              </button>
            </div>

            <div className="paper-portfolio-form-grid">
              <label>
                <span>Quantity</span>

                <input
                  type="number"
                  min="0"
                  step="1"
                  value={quantity}
                  placeholder="e.g. 10"
                  onChange={(event) =>
                    setQuantity(
                      event.target.value
                    )
                  }
                />
              </label>

              <label>
                <span>Trade price</span>

                <div className="paper-portfolio-price-input">
                  <em>₹</em>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={tradePrice}
                    placeholder="Price"
                    onChange={(event) =>
                      setTradePrice(
                        event.target.value
                      )
                    }
                  />
                </div>
              </label>
            </div>

            {error && (
              <div className="paper-portfolio-error">
                {error}
              </div>
            )}

            <button
              type="button"
              className={
                tradeType === 'BUY'
                  ? 'paper-portfolio-submit buy'
                  : 'paper-portfolio-submit sell'
              }
              onClick={submitTrade}
              disabled={trading}
            >
              {trading
                ? 'Recording…'
                : tradeType === 'BUY'
                  ? 'Record BUY'
                  : 'Record SELL'}
            </button>

            <div className="paper-portfolio-note">
              <strong>SIMULATION ONLY</strong>

              <span>
                Paper trades do not place real orders or
                use real money.
              </span>
            </div>
          </div>
        </section>

        {/* HOLDINGS */}
        <section className="paper-portfolio-card paper-portfolio-holdings-card">
          <div className="paper-portfolio-card-header">
            <div>
              <div className="paper-portfolio-card-kicker">
                HOLDINGS
              </div>

              <div className="paper-portfolio-heading-row">
                <h2>Your positions</h2>

                <span className="paper-portfolio-count">
                  {positions.length}{' '}
                  {positions.length === 1
                    ? 'position'
                    : 'positions'}
                </span>
              </div>

              <p>
                Current simulated exposure and
                unrealized performance.
              </p>
            </div>

            <WalletCards
              size={18}
              className="paper-portfolio-muted-icon"
            />
          </div>

          {positions.length > 0 ? (
            <div className="paper-portfolio-table-wrap">
              <table className="paper-portfolio-table">
                <thead>
                  <tr>
                    <th>SYMBOL</th>
                    <th>QTY</th>
                    <th>AVG. BUY</th>
                    <th>CURRENT</th>
                    <th>MARKET VALUE</th>
                    <th>P/L</th>
                    <th />
                  </tr>
                </thead>

                <tbody>
                  {positions.map((position) => {
                    const symbol =
                      String(
                        position.symbol || ''
                      ).toUpperCase();

                    const qty =
                      Number(
                        position.quantity
                      ) || 0;

                    const average =
                      Number(
                        position.average
                      ) || 0;

                    const current =
                      getCurrentPrice(
                        position
                      );

                    const marketValue =
                      qty * current;

                    const pnl =
                      qty *
                      (current - average);

                    const pnlPct =
                      average > 0
                        ? ((current -
                            average) /
                            average) *
                          100
                        : 0;

                    return (
                      <tr key={symbol}>
                        <td>
                          <div className="paper-portfolio-company">
                            <strong>
                              {symbol}
                            </strong>

                            <span>
                              {position.company ||
                                symbol}
                            </span>
                          </div>
                        </td>

                        <td>
                          <strong>
                            {qty}
                          </strong>
                        </td>

                        <td>
                          {money(average)}
                        </td>

                        <td>
                          {money(current)}
                        </td>

                        <td>
                          <strong>
                            {money(
                              marketValue
                            )}
                          </strong>
                        </td>

                        <td>
                          <div
                            className={
                              pnl >= 0
                                ? 'paper-portfolio-pnl positive'
                                : 'paper-portfolio-pnl negative'
                            }
                          >
                            <strong>
                              {pnl >= 0
                                ? '+'
                                : ''}
                              {money(
                                pnl
                              )}
                            </strong>

                            <span>
                              {pnlPct >= 0
                                ? '+'
                                : ''}
                              {pnlPct.toFixed(
                                2
                              )}
                              %
                            </span>
                          </div>
                        </td>

                        <td>
                          <button
                            type="button"
                            className="paper-portfolio-delete"
                            title={`Remove ${symbol}`}
                            onClick={() =>
                              deletePosition(
                                symbol
                              )
                            }
                          >
                            <Trash2
                              size={14}
                            />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="paper-portfolio-empty">
              <div className="paper-portfolio-empty-icon">
                <BriefcaseBusiness size={22} />
              </div>

              <strong>
                Your portfolio is empty
              </strong>

              <p>
                Search for a company on the left and
                record a simulated BUY to create your
                first position.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* FOOTER INFO */}
      <div className="paper-portfolio-footer">
        <div>
          <span className="paper-portfolio-footer-dot" />
          Paper trading workspace
        </div>

        <span>
          Prices are retrieved from the configured market
          service. Paper positions are stored locally in
          this browser.
        </span>
      </div>
    </section>
  );
}

function PortfolioKpi({
  label,
  value,
  detail,
  icon,
  positive,
}) {
  return (
    <div className="paper-portfolio-kpi">
      <div className="paper-portfolio-kpi-top">
        <span>{label}</span>

        <div
          className={
            positive === false
              ? 'paper-portfolio-kpi-icon negative'
              : positive === true
                ? 'paper-portfolio-kpi-icon positive'
                : 'paper-portfolio-kpi-icon'
          }
        >
          {icon}
        </div>
      </div>

      <strong
        className={
          positive === false
            ? 'negative'
            : positive === true
              ? 'positive'
              : ''
        }
      >
        {value}
      </strong>

      <small>{detail}</small>
    </div>
  );
}