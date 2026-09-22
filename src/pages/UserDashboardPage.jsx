import {
  ArrowUpRight,
  BarChart3,
  Database,
  FileText,
  MessageSquare,
  Shield,
  Upload,
  X,
} from 'lucide-react';

import {
  Link,
} from 'react-router-dom';

import {
  useMemo,
  useState,
} from 'react';

import toast from 'react-hot-toast';

import {
  useAuth,
} from '../context/AuthContext.jsx';

import {
  useData,
} from '../context/DataContext.jsx';


function UserDashboardPage() {
  const {
    currentUser,
    complaints = [],
    addComplaint,
  } = useAuth();

  const {
    files = [],
  } = useData();

  const [
    supportOpen,
    setSupportOpen,
  ] = useState(false);

  const [
    complaintSubject,
    setComplaintSubject,
  ] = useState('');

  const [
    complaintMessage,
    setComplaintMessage,
  ] = useState('');

  const [
    complaintBusy,
    setComplaintBusy,
  ] = useState(false);


  const metrics = useMemo(() => {
    let transactions = 0;
    let high = 0;
    let medium = 0;
    let low = 0;

    files.forEach((file) => {
      transactions += Number(
        file.totalTransactions || 0
      );

      high += Number(
        file.riskAnalysis?.counts?.HIGH ||
          file.riskCounts?.HIGH ||
          0
      );

      medium += Number(
        file.riskAnalysis?.counts?.MEDIUM ||
          file.riskCounts?.MEDIUM ||
          0
      );

      low += Number(
        file.riskAnalysis?.counts?.LOW ||
          file.riskCounts?.LOW ||
          0
      );
    });

    const openSupport =
      complaints.filter(
        (item) =>
          item.status !== 'resolved' &&
          item.status !== 'closed'
      ).length;

    return {
      transactions,
      high,
      medium,
      low,
      openSupport,
      highRate:
        transactions > 0
          ? Math.round(
              (high / transactions) * 100
            )
          : 0,
    };
  }, [files, complaints]);


  const latestDataset =
    files[0] || null;


  const recentFiles =
    files.slice(0, 5);


  const highRiskFiles = useMemo(
    () =>
      files
        .map((file) => ({
          ...file,
          highCount:
            Number(
              file.riskAnalysis
                ?.counts
                ?.HIGH ||
                file.riskCounts?.HIGH ||
                0
            ),
        }))
        .filter(
          (file) =>
            file.highCount > 0
        )
        .sort(
          (a, b) =>
            b.highCount -
            a.highCount
        )
        .slice(0, 4),
    [files]
  );


  const handleSubmitComplaint =
    async (event) => {
      event.preventDefault();

      if (
        !complaintSubject.trim()
      ) {
        toast.error(
          'Enter a subject.'
        );
        return;
      }

      if (
        !complaintMessage.trim()
      ) {
        toast.error(
          'Describe the issue.'
        );
        return;
      }

      setComplaintBusy(true);

      try {
        /*
         * Works with the common AuthContext shape:
         * addComplaint({ subject, description })
         *
         * If your current AuthContext expects a string,
         * the fallback below handles that case too.
         */
        try {
          await addComplaint({
            subject:
              complaintSubject.trim(),
            description:
              complaintMessage.trim(),
          });
        } catch (
          firstError
        ) {
          await addComplaint(
            complaintMessage.trim()
          );
        }

        toast.success(
          'Support request submitted.'
        );

        setComplaintSubject('');
        setComplaintMessage('');
        setSupportOpen(false);

      } catch (error) {
        toast.error(
          error?.message ||
            'Unable to submit support request.'
        );
      } finally {
        setComplaintBusy(false);
      }
    };


  return (
    <section className="dashboard-shell">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="dashboard-heading">

        <div>

          <p className="page-kicker">
            ACCOUNT OVERVIEW
          </p>

          <h1 className="dashboard-title">
            Welcome back,
            <span>
              {' '}
              {currentUser?.name ||
                'User'}
            </span>
          </h1>

          <p className="dashboard-description">
            A focused view of your financial datasets,
            transaction risk and active investigations.
          </p>

        </div>


      </div>


      {/* ==================================================
          KPI STRIP
      ================================================== */}

      <div className="dashboard-kpi-strip">

        <Kpi
          label="Datasets"
          value={files.length}
          detail="Processed files"
        />

        <Kpi
          label="Transactions"
          value={metrics.transactions.toLocaleString()}
          detail="Across all datasets"
        />

        <Kpi
          label="High-risk records"
          value={metrics.high.toLocaleString()}
          detail={`${metrics.highRate}% of transactions`}
          tone={
            metrics.high > 0
              ? 'danger'
              : 'safe'
          }
        />

        <Kpi
          label="Open support"
          value={metrics.openSupport}
          detail="Requests requiring response"
          tone={
            metrics.openSupport > 0
              ? 'warning'
              : 'safe'
          }
        />

      </div>


      {/* ==================================================
          MAIN WORKSPACE
      ================================================== */}

      <div className="dashboard-main-grid">

        {/* DATASET REGISTER */}

        <section className="dashboard-register panel">

          <div className="dashboard-section-head">

            <div>
              <p className="section-overline">
                DATA REGISTER
              </p>

              <h2>
                Recent datasets
              </h2>

              <p>
                Files processed most recently in your workspace.
              </p>
            </div>

            <Link
              to="/upload"
              className="dashboard-text-link"
            >
              Open data upload
              <ArrowUpRight
                size={14}
              />
            </Link>

          </div>


          {!recentFiles.length ? (

            <EmptyState />

          ) : (

            <div className="dashboard-table-wrap">

              <table className="dashboard-table">

                <thead>
                  <tr>
                    <th>Dataset</th>
                    <th>Records</th>
                    <th>Risk</th>
                    <th>Average</th>
                    <th>Processed</th>
                  </tr>
                </thead>

                <tbody>

                  {recentFiles.map(
                    (file) => {

                      const highCount =
                        Number(
                          file.riskAnalysis
                            ?.counts
                            ?.HIGH ||
                            file.riskCounts
                              ?.HIGH ||
                            0
                        );

                      const total =
                        Number(
                          file.totalTransactions ||
                            0
                        );

                      const rate =
                        total > 0
                          ? Math.round(
                              (highCount /
                                total) *
                                100
                            )
                          : 0;

                      return (
                        <tr
                          key={
                            file.id ||
                            file._id ||
                            file.name
                          }
                        >

                          <td>
                            <div className="dataset-cell">

                              <div className="dataset-icon">
                                <FileText
                                  size={15}
                                />
                              </div>

                              <div>

                                <div className="dataset-name">
                                  {file.name}
                                </div>

                                <div className="dataset-meta">
                                  CSV transaction dataset
                                </div>

                              </div>

                            </div>
                          </td>

                          <td>
                            {total.toLocaleString()}
                          </td>

                          <td>
                            <span
                              className={
                                rate > 10
                                  ? 'dashboard-risk dashboard-risk-danger'
                                  : rate > 0
                                  ? 'dashboard-risk dashboard-risk-warning'
                                  : 'dashboard-risk dashboard-risk-safe'
                              }
                            >
                              {rate}%
                            </span>
                          </td>

                          <td>
                            {file.averageValue ??
                              '—'}
                          </td>

                          <td className="dashboard-muted">
                            {file.processedAt
                              ? new Date(
                                  file.processedAt
                                ).toLocaleDateString(
                                  undefined,
                                  {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                  }
                                )
                              : '—'}
                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>
          )}

        </section>


        {/* RIGHT RAIL */}

        <aside className="dashboard-right-rail">

          {/* CURRENT DATASET */}

          <section className="dashboard-rail-card panel">

            <div className="dashboard-rail-top">

              <div>
                <p className="section-overline">
                  LATEST RUN
                </p>

                <h3>
                  Current dataset
                </h3>
              </div>

              <Database
                size={17}
                className="dashboard-icon-muted"
              />

            </div>


            {latestDataset ? (

              <>
                <div className="latest-dataset-name">
                  {latestDataset.name}
                </div>

                <div className="latest-dataset-meta">

                  <span>
                    {Number(
                      latestDataset.totalTransactions ||
                        0
                    ).toLocaleString()}{' '}
                    records
                  </span>

                  <span>
                    {latestDataset.averageValue ??
                      '—'}{' '}
                    avg.
                  </span>

                </div>

                <div className="dashboard-rail-actions">

                  <Link
                    to="/visualization"
                    className="dashboard-rail-link"
                  >
                    Open insights
                    <ArrowUpRight
                      size={14}
                    />
                  </Link>

                  <Link
                    to="/security"
                    className="dashboard-rail-link"
                  >
                    Review risk
                    <ArrowUpRight
                      size={14}
                    />
                  </Link>

                </div>
              </>

            ) : (

              <div className="dashboard-rail-empty">
                No dataset has been processed yet.

                <Link
                  to="/upload"
                  className="dashboard-inline-link"
                >
                  Upload your first file
                </Link>
              </div>

            )}

          </section>


          {/* ATTENTION */}

          <section className="dashboard-rail-card panel">

            <div className="dashboard-rail-top">

              <div>
                <p className="section-overline">
                  ATTENTION
                </p>

                <h3>
                  Elevated activity
                </h3>
              </div>

              <Shield
                size={17}
                className="dashboard-icon-muted"
              />

            </div>


            {highRiskFiles.length ? (

              <div className="attention-list">

                {highRiskFiles.map(
                  (file) => (
                    <div
                      key={
                        file.id ||
                        file._id ||
                        file.name
                      }
                      className="attention-row"
                    >

                      <div className="attention-copy">

                        <span className="attention-file">
                          {file.name}
                        </span>

                        <span className="attention-detail">
                          {file.highCount.toLocaleString()}
                          {' '}
                          high-risk records
                        </span>

                      </div>

                      <span className="attention-count">
                        {file.highCount}
                      </span>

                    </div>
                  )
                )}

              </div>

            ) : (

              <div className="dashboard-rail-empty">
                No elevated activity has been detected.
              </div>

            )}

            <Link
              to="/security"
              className="dashboard-rail-link dashboard-rail-link-bottom"
            >
              Open security review
              <ArrowUpRight
                size={14}
              />
            </Link>

          </section>

        </aside>

      </div>


      {/* ==================================================
          LOWER ACTION BAR
      ================================================== */}

      <section className="dashboard-action-bar">

        <div className="dashboard-action-intro">

          <div className="dashboard-action-icon">
            <BarChart3 size={16} />
          </div>

          <div>
            <strong>
              Workspace actions
            </strong>

            <span>
              Jump directly into the part of Fintel you need.
            </span>
          </div>

        </div>


        <div className="dashboard-action-links">

          <Link to="/visualization">
            <span>Insights</span>
            <ArrowUpRight size={13} />
          </Link>

          <Link to="/history">
            <span>History</span>
            <ArrowUpRight size={13} />
          </Link>

          <Link to="/cases">
            <span>Cases</span>
            <ArrowUpRight size={13} />
          </Link>

          <button
            type="button"
            onClick={() =>
              setSupportOpen(true)
            }
          >
            <span>Support</span>
            <MessageSquare size={13} />
          </button>

        </div>

      </section>


      {/* ==================================================
          SUPPORT MODAL
      ================================================== */}

      {supportOpen && (

        <div
          className="support-overlay"
          onMouseDown={() =>
            setSupportOpen(false)
          }
        >

          <div
            className="support-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >

            <div className="support-modal-header">

              <div>

                <p className="section-overline">
                  SUPPORT
                </p>

                <h2>
                  Open a support request
                </h2>

                <p>
                  Send a request to the Fintel administration team.
                </p>

              </div>

              <button
                type="button"
                className="support-close"
                onClick={() =>
                  setSupportOpen(false)
                }
                aria-label="Close support"
              >
                <X size={17} />
              </button>

            </div>


            <form
              onSubmit={
                handleSubmitComplaint
              }
              className="support-form"
            >

              <label>
                Subject

                <input
                  value={
                    complaintSubject
                  }
                  onChange={(event) =>
                    setComplaintSubject(
                      event.target.value
                    )
                  }
                  placeholder="Example: Dataset upload issue"
                />
              </label>


              <label>
                Description

                <textarea
                  value={
                    complaintMessage
                  }
                  onChange={(event) =>
                    setComplaintMessage(
                      event.target.value
                    )
                  }
                  placeholder="Describe the issue in detail..."
                />
              </label>


              <div className="support-modal-footer">

                <button
                  type="button"
                  className="button-secondary"
                  onClick={() =>
                    setSupportOpen(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="button-primary"
                  disabled={complaintBusy}
                >
                  {complaintBusy
                    ? 'Submitting…'
                    : 'Submit request'}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </section>
  );
}


function Kpi({
  label,
  value,
  detail,
  tone,
}) {
  return (
    <div className="dashboard-kpi">

      <span className="dashboard-kpi-label">
        {label}
      </span>

      <strong
        className={
          tone === 'danger'
            ? 'dashboard-kpi-value dashboard-kpi-danger'
            : tone === 'warning'
            ? 'dashboard-kpi-value dashboard-kpi-warning'
            : tone === 'safe'
            ? 'dashboard-kpi-value dashboard-kpi-safe'
            : 'dashboard-kpi-value'
        }
      >
        {value}
      </strong>

      <span className="dashboard-kpi-detail">
        {detail}
      </span>

    </div>
  );
}


function EmptyState() {
  return (
    <div className="dashboard-empty-state">

      <div className="dashboard-empty-icon">
        <Database size={17} />
      </div>

      <div>

        <strong>
          No datasets yet
        </strong>

        <p>
          Upload a CSV file to start processing transaction data.
        </p>

      </div>

      <Link
        to="/upload"
        className="dashboard-primary-button"
      >
        Upload CSV
      </Link>

    </div>
  );
}


export default UserDashboardPage;