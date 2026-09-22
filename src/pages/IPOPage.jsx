import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  ChevronRight,
  Clock3,
  RefreshCw,
  Search,
  TrendingUp,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { marketApi } from '../api/client.js';

const filters = [
  { value: 'all', label: 'All' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'live', label: 'Open now' },
  { value: 'recent', label: 'Recently listed' },
];

export default function IPOPage() {
  const [status, setStatus] = useState('all');
  const [ipos, setIpos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  const loadIPOs = async (nextStatus = status) => {
    setLoading(true);

    try {
      const result = await marketApi.ipos(nextStatus);

      const rows =
        result?.ipos ||
        result?.data ||
        result?.results ||
        (Array.isArray(result) ? result : []);

      setIpos(Array.isArray(rows) ? rows : []);
    } catch (error) {
      console.error(error);

      setIpos([]);

      toast.error(
        error?.message ||
          'Unable to load IPO market data.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIPOs(status);
  }, [status]);

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();

    if (!search) return ipos;

    return ipos.filter((ipo) => {
      const text = [
        ipo.company,
        ipo.name,
        ipo.symbol,
        ipo.display,
        ipo.exchange,
        ipo.sector,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return text.includes(search);
    });
  }, [ipos, query]);

  const upcoming = filtered.filter(
    (ipo) =>
      normalizeStatus(ipo) === 'upcoming'
  );

  const live = filtered.filter(
    (ipo) =>
      normalizeStatus(ipo) === 'live'
  );

  const recent = filtered.filter(
    (ipo) =>
      normalizeStatus(ipo) === 'recent'
  );

  return (
    <section className="page ipo-page">

      {/* HEADER */}
      <header className="page-header ipo-page-header">

        <div>
          <p className="page-kicker">
            PRIMARY MARKETS
          </p>

          <h1 className="page-title">
            IPO Calendar
          </h1>

          <p className="page-subtitle">
            Track upcoming issues, currently open offerings
            and recently listed companies.
          </p>
        </div>

        <button
          type="button"
          className="btn"
          onClick={() => loadIPOs(status)}
          disabled={loading}
        >
          <RefreshCw
            size={13}
            className={
              loading
                ? 'ipo-spin'
                : ''
            }
          />

          {loading
            ? 'Refreshing…'
            : 'Refresh'}
        </button>

      </header>

      {/* SEARCH + FILTER */}
      <div className="ipo-toolbar panel">

        <div className="ipo-search">

          <Search size={14} />

          <input
            value={query}
            onChange={(event) =>
              setQuery(event.target.value)
            }
            placeholder="Search company or symbol"
          />

        </div>

        <div className="ipo-filter">

          {filters.map((item) => (
            <button
              key={item.value}
              type="button"
              className={`ipo-filter-btn ${
                status === item.value
                  ? 'active'
                  : ''
              }`}
              onClick={() =>
                setStatus(item.value)
              }
            >
              {item.label}
            </button>
          ))}

        </div>

      </div>

      {/* SUMMARY */}
      <div className="ipo-summary-grid">

        <SummaryCard
          icon={CalendarDays}
          label="Upcoming"
          value={upcoming.length}
          note="Scheduled issues"
        />

        <SummaryCard
          icon={TrendingUp}
          label="Open now"
          value={live.length}
          note="Currently accepting bids"
        />

        <SummaryCard
          icon={Clock3}
          label="Recently listed"
          value={recent.length}
          note="Latest completed issues"
        />

        <SummaryCard
          icon={Search}
          label="Research results"
          value={filtered.length}
          note={
            query
              ? `Matching "${query}"`
              : 'Current filter'
          }
        />

      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="ipo-loading panel">

          <RefreshCw
            size={20}
            className="ipo-spin"
          />

          <strong>
            Loading IPO calendar
          </strong>

          <span>
            Fetching the latest available market data.
          </span>

        </div>
      ) : filtered.length === 0 ? (
        <div className="ipo-empty panel">

          <CalendarDays size={25} />

          <strong>
            No IPO records found
          </strong>

          <p>
            There are no IPO records matching the
            current filter or search.
          </p>

          <button
            type="button"
            className="btn"
            onClick={() => {
              setQuery('');
              setStatus('all');
            }}
          >
            Clear filters
          </button>

        </div>
      ) : (
        <>

          {/* OPEN NOW */}
          {live.length > 0 && (
            <IPOSection
              title="Open now"
              description="Issues currently shown as open in the market data service."
              count={live.length}
              countClass="ipo-count-live"
              rows={live}
            />
          )}

          {/* UPCOMING */}
          {upcoming.length > 0 && (
            <IPOSection
              title="Upcoming issues"
              description="Companies with upcoming issue windows."
              count={upcoming.length}
              countClass="ipo-count-upcoming"
              rows={upcoming}
            />
          )}

          {/* RECENT */}
          {recent.length > 0 && (
            <IPOSection
              title="Recently listed"
              description="Recent IPO records returned by the market service."
              count={recent.length}
              rows={recent}
            />
          )}

          {/* UNKNOWN / OTHER */}
          {live.length === 0 &&
            upcoming.length === 0 &&
            recent.length === 0 && (
              <IPOSection
                title="IPO research"
                description="Available IPO records from the market service."
                count={filtered.length}
                rows={filtered}
              />
            )}

        </>
      )}

    </section>
  );
}

function IPOSection({
  title,
  description,
  count,
  countClass = '',
  rows,
}) {
  return (
    <section className="ipo-section">

      <div className="ipo-section-heading">

        <div>

          <div className="ipo-section-title-row">

            <h2>
              {title}
            </h2>

            <span
              className={`ipo-count ${countClass}`}
            >
              {count}
            </span>

          </div>

          <p>
            {description}
          </p>

        </div>

      </div>

      <div className="ipo-grid">

        {rows.map((ipo, index) => (
          <IPOCard
            key={
              ipo.id ||
              ipo._id ||
              ipo.symbol ||
              `${ipo.company}-${index}`
            }
            ipo={ipo}
          />
        ))}

      </div>

    </section>
  );
}

function IPOCard({ ipo }) {
  const state = normalizeStatus(ipo);

  const company =
    ipo.company ||
    ipo.name ||
    ipo.display ||
    'Unnamed company';

  const symbol =
    ipo.symbol ||
    ipo.ticker ||
    '—';

  const price =
    ipo.price ??
    ipo.issuePrice ??
    ipo.offerPrice;

  const priceLow =
    ipo.priceLow ??
    ipo.minPrice ??
    ipo.lowerPrice;

  const priceHigh =
    ipo.priceHigh ??
    ipo.maxPrice ??
    ipo.upperPrice;

  const priceText =
    priceLow != null &&
    priceHigh != null
      ? `₹${formatNumber(
          priceLow
        )} – ₹${formatNumber(
          priceHigh
        )}`
      : price != null
        ? `₹${formatNumber(price)}`
        : '—';

  const lot =
    ipo.lotSize ??
    ipo.lot ??
    ipo.minLot;

  const openDate =
    ipo.openDate ||
    ipo.startDate ||
    ipo.biddingStart;

  const closeDate =
    ipo.closeDate ||
    ipo.endDate ||
    ipo.biddingEnd;

  const listingDate =
    ipo.listingDate ||
    ipo.listedDate;

  const issueSize =
    ipo.issueSize ||
    ipo.issueAmount ||
    ipo.size;

  return (
    <article className="ipo-card">

      <div className="ipo-card-top">

        <div className="ipo-company-icon">
          <TrendingUp size={17} />
        </div>

        <span
          className={`ipo-status ipo-status-${state}`}
        >
          {statusLabel(state)}
        </span>

      </div>

      <div className="ipo-card-main">

        <h3>
          {company}
        </h3>

        <p className="ipo-symbol">
          {symbol}

          {ipo.exchange && (
            <>
              <span>·</span>
              <span>
                {ipo.exchange}
              </span>
            </>
          )}
        </p>

        <div className="ipo-price-box">

          <span>
            PRICE BAND
          </span>

          <strong>
            {priceText}
          </strong>

        </div>

        <div className="ipo-details">

          <IPOInfo
            label="OPEN"
            value={formatDate(openDate)}
          />

          <IPOInfo
            label="CLOSE"
            value={formatDate(closeDate)}
          />

          <IPOInfo
            label="LISTING"
            value={formatDate(listingDate)}
          />

          <IPOInfo
            label="LOT"
            value={
              lot != null
                ? formatNumber(lot)
                : '—'
            }
          />

        </div>

        {issueSize && (
          <div className="ipo-issue-size">

            <span>
              ISSUE SIZE
            </span>

            <strong>
              {formatIssueSize(issueSize)}
            </strong>

          </div>
        )}

        <div className="ipo-card-footer">

          <span>
            Market research
          </span>

          <ChevronRight size={14} />

        </div>

      </div>

    </article>
  );
}

function IPOInfo({
  label,
  value,
}) {
  return (
    <div className="ipo-info">

      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>

    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  note,
}) {
  return (
    <article className="ipo-summary-card">

      <div className="ipo-summary-icon">
        <Icon size={16} />
      </div>

      <div>

        <span>
          {label}
        </span>

        <strong>
          {value}
        </strong>

        <small>
          {note}
        </small>

      </div>

    </article>
  );
}

function normalizeStatus(ipo) {
  const value = String(
    ipo.status ||
      ipo.stage ||
      ipo.state ||
      ''
  )
    .toLowerCase()
    .trim();

  if (
    value.includes('live') ||
    value.includes('open') ||
    value.includes('ongoing')
  ) {
    return 'live';
  }

  if (
    value.includes('recent') ||
    value.includes('listed') ||
    value.includes('closed')
  ) {
    return 'recent';
  }

  if (
    value.includes('upcoming') ||
    value.includes('future') ||
    value.includes('pre')
  ) {
    return 'upcoming';
  }

  const today = new Date();

  const open = parseDate(
    ipo.openDate ||
      ipo.startDate ||
      ipo.biddingStart
  );

  const close = parseDate(
    ipo.closeDate ||
      ipo.endDate ||
      ipo.biddingEnd
  );

  const listing = parseDate(
    ipo.listingDate ||
      ipo.listedDate
  );

  if (
    open &&
    close &&
    today >= open &&
    today <= close
  ) {
    return 'live';
  }

  if (open && today < open) {
    return 'upcoming';
  }

  if (
    listing &&
    today >= listing
  ) {
    return 'recent';
  }

  if (close && today > close) {
    return 'recent';
  }

  return 'upcoming';
}

function statusLabel(status) {
  if (status === 'live') {
    return 'OPEN NOW';
  }

  if (status === 'recent') {
    return 'RECENT';
  }

  return 'UPCOMING';
}

function parseDate(value) {
  if (!value) return null;

  const date = new Date(value);

  return Number.isNaN(
    date.getTime()
  )
    ? null
    : date;
}

function formatDate(value) {
  const date = parseDate(value);

  if (!date) return '—';

  return date.toLocaleDateString(
    'en-IN',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }
  );
}

function formatNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return String(value);
  }

  return number.toLocaleString(
    'en-IN',
    {
      maximumFractionDigits: 2,
    }
  );
}

function formatIssueSize(value) {
  if (typeof value === 'string') {
    return value;
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return '—';
  }

  if (number >= 10000000) {
    return `₹${(
      number / 10000000
    ).toFixed(2)} Cr`;
  }

  if (number >= 100000) {
    return `₹${(
      number / 100000
    ).toFixed(2)} L`;
  }

  return `₹${formatNumber(number)}`;
}