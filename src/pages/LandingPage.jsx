import { useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  Check,
  Crown,
  Database,
  Search,
  ShieldCheck,
  UploadCloud,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../logo.png';

const ticks = [
  ['NIFTY 50', '23,346.40', '+0.33%'],
  ['SENSEX', '74,314.59', '-0.03%'],
  ['BANK NIFTY', '56,055.75', '-0.42%'],
  ['NIFTY IT', '29,155.60', '+0.23%'],
];

const popular = [
  'HDFC BANK',
  'RELIANCE',
  'TCS',
  'INFOSYS',
  'ICICI BANK',
  'TATA MOTORS',
];

const freeFeatures = [
  '5 dataset uploads',
  '10 MB maximum file size',
  '10 AI financial analyses / month',
  '5 stock research reports / month',
  '5 portfolio holdings',
  '30 days historical market data',
  'Basic risk analysis',
];

const plusFeatures = [
  '50 dataset uploads',
  '100 MB maximum file size',
  '100 AI financial analyses / month',
  'Unlimited stock research reports',
  '50 portfolio holdings',
  '5 years historical market data',
  '20–30% lower Fintel platform fee',
];

export default function LandingPage() {
  const navigate = useNavigate();

  const [q, setQ] = useState('');

  const submit = (e) => {
    e.preventDefault();

    if (!q.trim()) return;

    navigate(
      `/stocks?q=${encodeURIComponent(q.trim())}`
    );
  };

  const scrollToFintelPlus = () => {
    const section = document.getElementById(
      'fintelplus-section'
    );

    if (section) {
      section.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  return (
    <div className="landing-shell">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <header className="landing-nav">
        <div className="landing-nav-inner">

          <Link
            to="/"
            className="brand"
          >
            <img
              src={logo}
              alt="Fintel Secure"
            />

            <div>
              <div className="brand-name">
                Fintel Secure
              </div>

              <div className="brand-sub">
                MARKET RESEARCH · DATA ANALYTICS
              </div>
            </div>
          </Link>


          <div
            className="landing-nav-actions"
            style={{
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '8px',
            }}
          >

            {/* =================================================
                FINTELPLUS NAV BUTTON
            ================================================= */}

            <button
              type="button"
              className="landing-plus-btn"
              onClick={scrollToFintelPlus}
            >
              <Crown size={14} />
              <span>FintelPlus</span>
            </button>


            <Link
              className="btn"
              to="/login"
            >
              Sign in
            </Link>


            <Link
              className="btn btn-primary"
              to="/signup"
            >
              Get started
              <ArrowRight size={13} />
            </Link>

          </div>

        </div>
      </header>


      {/* =====================================================
          MARKET TICKER
      ===================================================== */}

      <div className="ticker-bar">

        {ticks.map(
          ([name, value, change]) => (
            <div
              className="ticker-item"
              key={name}
            >
              <span>
                {name}
              </span>

              <strong>
                {value}
              </strong>

              <em
                className={
                  change.startsWith('-')
                    ? 'down'
                    : 'up'
                }
              >
                {change}
              </em>
            </div>
          )
        )}

      </div>


      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="landing-hero">

        <div className="landing-hero-inner">

          <div className="landing-kicker">
            MARKET RESEARCH · FINANCIAL INTELLIGENCE
          </div>


          <h1 className="landing-title">
            Search any company. Analyse the numbers. Trade with context.
          </h1>


          <p className="landing-copy">
            Search a company, brand or market symbol to open
            its financial research page. Analyse price history,
            financial metrics, trends and trading context — or
            upload your own CSV for transaction analysis.
          </p>


          <form
            className="landing-search"
            onSubmit={submit}
          >

            <Search
              size={20}
              color="#6384a0"
            />

            <input
              className="input"
              value={q}
              onChange={(e) =>
                setQ(e.target.value)
              }
              placeholder="Search company, brand or stock symbol"
            />

            <button
              className="btn btn-primary"
              type="submit"
            >
              Search
              <ArrowRight size={13} />
            </button>

          </form>


          <div
            className="section-copy"
            style={{
              textAlign: 'center',
              marginTop: '10px',
            }}
          >
            Search works with company names and stock symbols.
          </div>


          <div className="landing-tags">

            <span className="section-copy">
              Popular research
            </span>

            {popular.map((stock) => (
              <button
                className="tag"
                key={stock}
                type="button"
                onClick={() =>
                  navigate(
                    `/stocks?q=${encodeURIComponent(stock)}`
                  )
                }
              >
                {stock}
              </button>
            ))}

          </div>

        </div>

      </section>


      {/* =====================================================
          PLATFORM
      ===================================================== */}

      <section
        id="platform"
        className="landing-sections"
      >

        <div className="landing-section">

          <p className="page-kicker">
            ONE PLATFORM
          </p>

          <h2
            className="page-title"
            style={{
              fontSize: '24px',
              marginTop: '6px',
            }}
          >
            Research, analysis and security in one workflow.
          </h2>

          <p className="page-subtitle">
            Move between market research, transaction analysis
            and security investigation without mixing the
            workflows together.
          </p>


          <div
            className="landing-grid3"
            style={{
              marginTop: '20px',
            }}
          >

            {/* MARKET RESEARCH */}

            <article className="landing-card">

              <BarChart3
                size={18}
                color="#5e82a1"
              />

              <p
                className="page-kicker"
                style={{
                  marginTop: '14px',
                }}
              >
                MARKET RESEARCH
              </p>

              <h3>
                Research Stocks
              </h3>

              <p>
                Search companies, inspect price history and
                open a dedicated research page.
              </p>

              <Link
                className="btn"
                to="/stocks"
              >
                Open
                <ArrowRight size={12} />
              </Link>

            </article>


            {/* FINANCIAL ANALYSIS */}

            <article className="landing-card">

              <Database
                size={18}
                color="#5e82a1"
              />

              <p
                className="page-kicker"
                style={{
                  marginTop: '14px',
                }}
              >
                FINANCIAL ANALYSIS
              </p>

              <h3>
                Analyse Financial Data
              </h3>

              <p>
                Upload transaction data, process records and
                inspect findings from your own files.
              </p>

              <Link
                className="btn"
                to="/upload"
              >
                Open
                <ArrowRight size={12} />
              </Link>

            </article>


            {/* SECURITY */}

            <article className="landing-card">

              <ShieldCheck
                size={18}
                color="#5e82a1"
              />

              <p
                className="page-kicker"
                style={{
                  marginTop: '14px',
                }}
              >
                SECURITY
              </p>

              <h3>
                Investigate Transactions
              </h3>

              <p>
                Review model-flagged transactions and inspect
                explainable risk factors.
              </p>

              <Link
                className="btn"
                to="/security"
              >
                Open
                <ArrowRight size={12} />
              </Link>

            </article>

          </div>

        </div>


        {/* =====================================================
            YOUR DATA
        ===================================================== */}

        <div
          id="analysis"
          className="landing-section"
        >

          <div className="landing-byodata">

            <div>

              <p className="page-kicker">
                YOUR DATA
              </p>

              <h2
                className="page-title"
                style={{
                  fontSize: '24px',
                  marginTop: '6px',
                }}
              >
                Bring your own financial data.
              </h2>

              <p className="page-subtitle">
                Upload a CSV and Fintel Secure validates,
                processes and routes it through transaction
                intelligence and security workflows.
              </p>

            </div>


            <div
              className="panel"
              style={{
                padding: '25px',
              }}
            >

              <UploadCloud
                size={19}
                color="#5f86a6"
              />

              <div
                className="section-title"
                style={{
                  marginTop: '12px',
                }}
              >
                CSV transaction analysis
              </div>

              <div className="section-copy">
                Data quality · processing metrics ·
                explainable risk · evidence
              </div>

              <Link
                className="btn btn-primary"
                to="/signup"
                style={{
                  marginTop: '18px',
                }}
              >
                Get started
                <ArrowRight size={12} />
              </Link>

            </div>

          </div>

        </div>


        {/* =====================================================
            FINTELPLUS
        ===================================================== */}

        <div
          id="fintelplus-section"
          className="landing-section fintelplus-section"
        >

          {/* HEADER */}

          <div
            style={{
              textAlign: 'center',
              marginBottom: '22px',
            }}
          >

            <div
              className="page-kicker plus"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Crown size={13} />
              FINTELPLUS
            </div>


            <h2
              className="page-title"
              style={{
                fontSize: '26px',
                marginTop: '7px',
              }}
            >
              More data. More analysis. Lower platform fees.
            </h2>


            <p
              className="page-subtitle"
              style={{
                maxWidth: '650px',
                marginLeft: 'auto',
                marginRight: 'auto',
              }}
            >
              Unlock higher limits and deeper financial intelligence
              for active researchers and traders.
            </p>

          </div>


          {/* =================================================
              PRICING + FEATURES
          ================================================= */}

          <div
            className="fintelplus-pricing-grid"
            style={{
              display: 'grid',
              gridTemplateColumns:
                '0.72fr 1.15fr 0.72fr',
              gap: '14px',
              alignItems: 'stretch',
            }}
          >

            {/* =================================================
                FREE
            ================================================= */}

            <div
              className="fintelplus-plan free"
              style={{
                padding: '19px',
                borderRadius: '8px',
                border:
                  '1px solid rgba(255,255,255,0.08)',
                background:
                  'rgba(255,255,255,0.025)',
              }}
            >

              <div
                style={{
                  fontSize: '10px',
                  fontWeight: 750,
                  letterSpacing: '0.12em',
                  color: '#8194a5',
                }}
              >
                FREE
              </div>


              <div
                style={{
                  marginTop: '8px',
                  fontSize: '27px',
                  fontWeight: 700,
                  color: '#f1f5f7',
                }}
              >
                ₹0
              </div>


              <div
                style={{
                  marginTop: '3px',
                  fontSize: '10px',
                  color: '#718496',
                }}
              >
                Forever
              </div>


              <div
                style={{
                  marginTop: '17px',
                  paddingTop: '14px',
                  borderTop:
                    '1px solid rgba(255,255,255,0.06)',
                }}
              >

                {freeFeatures.map(
                  (feature) => (
                    <div
                      key={feature}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                        marginBottom: '10px',
                        fontSize: '10px',
                        lineHeight: 1.35,
                        color: '#9caeba',
                      }}
                    >

                      <Check
                        size={13}
                        style={{
                          flexShrink: 0,
                          marginTop: '1px',
                          color: '#708596',
                        }}
                      />

                      <span>
                        {feature}
                      </span>

                    </div>
                  )
                )}

              </div>


              <div
                style={{
                  marginTop: '14px',
                  paddingTop: '11px',
                  borderTop:
                    '1px solid rgba(255,255,255,0.06)',
                  color: '#617789',
                  fontSize: '9px',
                }}
              >
                Essential access for getting started
              </div>

            </div>


            {/* =================================================
                FINTELPLUS FEATURED
            ================================================= */}

            <div
              className="fintelplus-plan featured"
              style={{
                position: 'relative',
                padding: '19px',
                borderRadius: '8px',
                border:
                  '1px solid rgba(214,174,66,0.58)',
                background:
                  'linear-gradient(145deg, rgba(214,174,66,0.09), rgba(255,255,255,0.025))',
                boxShadow:
                  '0 12px 45px rgba(214,174,66,0.06)',
              }}
            >

              {/* POPULAR BADGE */}

              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  padding: '4px 7px',
                  borderRadius: '4px',
                  background: '#d6ae42',
                  color: '#101820',
                  fontSize: '7px',
                  fontWeight: 800,
                  letterSpacing: '0.05em',
                }}
              >
                MOST POPULAR
              </div>


              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '10px',
                  fontWeight: 750,
                  letterSpacing: '0.12em',
                  color: '#e2bd58',
                }}
              >
                <Crown size={13} />
                FINTELPLUS
              </div>


              <div
                style={{
                  marginTop: '8px',
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '5px',
                }}
              >

                <span
                  style={{
                    fontSize: '27px',
                    fontWeight: 700,
                    color: '#f1f5f7',
                  }}
                >
                  ₹199
                </span>

                <span
                  style={{
                    fontSize: '10px',
                    color: '#8194a5',
                  }}
                >
                  /month
                </span>

              </div>


              <div
                style={{
                  marginTop: '3px',
                  fontSize: '10px',
                  color: '#718496',
                }}
              >
                Built for active research & trading
              </div>


              <div
                style={{
                  marginTop: '17px',
                  paddingTop: '14px',
                  borderTop:
                    '1px solid rgba(214,174,66,0.13)',
                }}
              >

                {plusFeatures.map(
                  (feature) => (
                    <div
                      key={feature}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                        marginBottom: '10px',
                        fontSize: '10px',
                        lineHeight: 1.35,
                        color: '#d3dde3',
                      }}
                    >

                      <Check
                        size={13}
                        style={{
                          flexShrink: 0,
                          marginTop: '1px',
                          color: '#e2bd58',
                        }}
                      />

                      <span>
                        {feature}
                      </span>

                    </div>
                  )
                )}

              </div>


              <button
                type="button"
                className="btn btn-primary"
                style={{
                  width: '100%',
                  marginTop: '6px',
                  justifyContent: 'center',
                }}
                onClick={() => {
                  alert(
                    'FintelPlus Monthly selected. Payment integration can be connected here.'
                  );
                }}
              >
                Get FintelPlus
                <ArrowRight size={12} />
              </button>

            </div>


            {/* =================================================
                ANNUAL
            ================================================= */}

            <div
              className="fintelplus-plan annual"
              style={{
                padding: '19px',
                borderRadius: '8px',
                border:
                  '1px solid rgba(95,134,166,0.30)',
                background:
                  'rgba(95,134,166,0.04)',
              }}
            >

              <div
                style={{
                  fontSize: '10px',
                  fontWeight: 750,
                  letterSpacing: '0.12em',
                  color: '#8fb0c9',
                }}
              >
                ANNUAL
              </div>


              <div
                style={{
                  marginTop: '8px',
                  fontSize: '27px',
                  fontWeight: 700,
                  color: '#f1f5f7',
                }}
              >
                ₹1,999
              </div>


              <div
                style={{
                  marginTop: '3px',
                  fontSize: '10px',
                  color: '#718496',
                }}
              >
                ₹166.58/month equivalent
              </div>


              <div
                style={{
                  display: 'inline-block',
                  marginTop: '9px',
                  padding: '4px 7px',
                  borderRadius: '4px',
                  background:
                    'rgba(67,178,121,0.12)',
                  color: '#63c890',
                  fontSize: '8px',
                  fontWeight: 750,
                }}
              >
                SAVE ₹389 / YEAR
              </div>


              <div
                style={{
                  marginTop: '18px',
                  paddingTop: '14px',
                  borderTop:
                    '1px solid rgba(255,255,255,0.06)',
                }}
              >

                <div
                  style={{
                    fontSize: '10px',
                    color: '#aab9c4',
                    lineHeight: 1.55,
                  }}
                >
                  Get the complete FintelPlus
                  experience with the lower
                  effective monthly price.
                </div>


                <div
                  style={{
                    marginTop: '13px',
                    fontSize: '10px',
                    lineHeight: 1.7,
                    color: '#8397a8',
                  }}
                >
                  ✓ 50 uploads
                  <br />
                  ✓ 100 AI analyses/month
                  <br />
                  ✓ Unlimited research
                  <br />
                  ✓ 50 portfolio holdings
                  <br />
                  ✓ 5 years historical data
                  <br />
                  ✓ 20–30% lower platform fee
                </div>

              </div>


              <button
                type="button"
                className="btn"
                style={{
                  width: '100%',
                  marginTop: '17px',
                  justifyContent: 'center',
                }}
                onClick={() => {
                  alert(
                    'FintelPlus Annual selected. Payment integration can be connected here.'
                  );
                }}
              >
                Choose Annual
                <ArrowRight size={12} />
              </button>

            </div>

          </div>


          {/* SMALL NOTE */}

          <div
            style={{
              marginTop: '12px',
              textAlign: 'center',
              color: '#53697b',
              fontSize: '8px',
              lineHeight: 1.5,
            }}
          >
            FintelPlus pricing is configurable for this
            application. Brokerage, exchange, tax and statutory
            charges are separate.
          </div>

        </div>

      </section>

    </div>
  );
}