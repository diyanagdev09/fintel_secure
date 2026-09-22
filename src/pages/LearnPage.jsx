import {
  BarChart3,
  BookOpen,
  Database,
  Filter,
  LineChart,
  ShieldCheck,
} from 'lucide-react';

import { Link } from 'react-router-dom';

const guides = [
  {
    icon: Database,
    kicker: 'TRANSACTION ANALYSIS',
    title: 'Read your dataset',
    description:
      'Understand records, fields, amounts, categories and data quality before investigating individual transactions.',
    to: '/visualization',
    action: 'Open Insights',
  },
  {
    icon: ShieldCheck,
    kicker: 'RISK & SECURITY',
    title: 'Understand risk signals',
    description:
      'Learn how Fintel combines amount anomalies, velocity, duplicates, timing and other signals into review priorities.',
    to: '/security',
    action: 'Open Security',
  },
  {
    icon: LineChart,
    kicker: 'MARKET RESEARCH',
    title: 'Read a stock chart',
    description:
      'Use historical price movement, moving averages, RSI, MACD and volume to understand a company’s technical setup.',
    to: '/stocks',
    action: 'Explore Stocks',
  },
  {
    icon: Filter,
    kicker: 'STOCK DISCOVERY',
    title: 'Build a stock screen',
    description:
      'Filter companies by P/E, ROE, growth, dividend yield and price to create repeatable research screens.',
    to: '/screener',
    action: 'Open Screener',
  },
  {
    icon: BarChart3,
    kicker: 'MARKET CONTEXT',
    title: 'Understand market movement',
    description:
      'Compare major indices, gainers, losers and trading activity before opening an individual company research page.',
    to: '/stocks',
    action: 'Open Market Research',
  },
  {
    icon: BookOpen,
    kicker: 'PAPER TRADING',
    title: 'Practice without real orders',
    description:
      'Use simulated positions to understand quantity, entry price, market value and unrealized profit or loss.',
    to: '/portfolio',
    action: 'Open Portfolio',
  },
];

export default function LearnPage() {
  return (
    <section className="page learn-page">

      <header className="page-header">

        <div>
          <p className="page-kicker">
            RESEARCH EDUCATION
          </p>

          <h1 className="page-title">
            Learn
          </h1>

          <p className="page-subtitle">
            Practical guides for transaction analysis,
            risk review and market research.
          </p>
        </div>

      </header>

      <div className="learn-grid">

        {guides.map(
          ({
            icon: Icon,
            kicker,
            title,
            description,
            to,
            action,
          }) => (
            <article
              className="learn-card"
              key={title}
            >

              <div className="learn-card-icon">
                <Icon size={18} />
              </div>

              <p className="learn-card-kicker">
                {kicker}
              </p>

              <h2>
                {title}
              </h2>

              <p className="learn-card-description">
                {description}
              </p>

              <Link
                className="learn-card-link"
                to={to}
              >
                {action}
                <span>→</span>
              </Link>

            </article>
          )
        )}

      </div>

      <div className="learn-note panel">

        <div className="learn-note-icon">
          <BookOpen size={16} />
        </div>

        <div>
          <strong>
            Research note
          </strong>

          <p>
            Fintel provides analytical tools and
            research context. Market indicators,
            technical signals and risk scores do
            not guarantee future returns or outcomes.
          </p>
        </div>

      </div>

    </section>
  );
}