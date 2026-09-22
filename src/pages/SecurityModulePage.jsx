import {
  useMemo,
  useState,
} from 'react';

import {
  AlertTriangle,
  CheckCircle2,
  FilePlus2,
  Search,
  Shield,
  X,
} from 'lucide-react';

import toast from 'react-hot-toast';

import SHA256 from 'crypto-js/sha256';

import { useData } from '../context/DataContext.jsx';

import { caseApi } from '../api/client.js';

const parseNumber = (value) => {
  if (
    typeof value === 'number' &&
    Number.isFinite(value)
  ) {
    return value;
  }

  if (value == null) {
    return null;
  }

  const cleaned = String(value)
    .replace(/[₹$€£,\s]/g, '')
    .trim();

  if (
    !cleaned ||
    !/^-?(\d+(\.\d+)?|\.\d+)$/.test(
      cleaned
    )
  ) {
    return null;
  }

  const number = Number(cleaned);

  return Number.isFinite(number)
    ? number
    : null;
};

const money = (value) =>
  value == null ||
  !Number.isFinite(Number(value))
    ? '—'
    : `₹${Number(value).toLocaleString(
        'en-IN',
        {
          maximumFractionDigits: 2,
        }
      )}`;

const formatDate = (value) => {
  if (!value) {
    return '—';
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.valueOf()
    )
  ) {
    return String(value);
  }

  return date.toLocaleString(
    'en-IN',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }
  );
};

export default function SecurityModulePage() {
  const {
    files = [],
    updateReview,
  } = useData();

  const [
    datasetId,
    setDatasetId,
  ] = useState(
    files[0]?.id || ''
  );

  const file =
    files.find(
      (f) =>
        String(f.id) ===
        String(datasetId)
    ) || files[0];

  const [
    filter,
    setFilter,
  ] = useState('ALL');

  const [q, setQ] =
    useState('');

  const [
    selected,
    setSelected,
  ] = useState(null);

  const [
    busy,
    setBusy,
  ] = useState(false);

  const queue = useMemo(() => {
    const transactions =
      file?.riskAnalysis
        ?.transactions || [];

    const rows =
      file?.rows || [];

    const reviews =
      file?.riskReviews || [];

    return transactions
      .map((transaction) => {
        const row =
          rows[
            transaction
              .transactionIndex
          ];

        const review =
          reviews.find(
            (item) =>
              Number(
                item.transactionIndex
              ) ===
              Number(
                transaction.transactionIndex
              )
          );

        const amount =
          transaction.metrics
            ?.amount ??
          (
            file?.numericField
              ? parseNumber(
                  row?.[
                    file.numericField
                  ]
                )
              : null
          );

        const entity =
          file?.entityField
            ? String(
                row?.[
                  file.entityField
                ] ?? ''
              ).trim()
            : '';

        const category =
          file?.categoryField
            ? String(
                row?.[
                  file.categoryField
                ] ?? ''
              ).trim()
            : '';

        const date =
          file?.dateField
            ? row?.[
                file.dateField
              ]
            : '';

        return {
          ...transaction,
          row,
          review,
          amount,
          entity,
          category,
          date,
        };
      })

      .filter(
        (transaction) =>
          filter === 'ALL' ||
          transaction.riskLevel ===
            filter
      )

      .filter(
        (transaction) => {
          const searchable =
            [
              transaction
                .transactionIndex +
                1,

              transaction.entity,

              transaction.category,

              transaction.date,

              transaction.reviewReason,

              JSON.stringify(
                transaction.row ||
                  {}
              ),
            ]
              .join(' ')
              .toLowerCase();

          return searchable.includes(
            q.toLowerCase()
          );
        }
      )

      .sort(
        (a, b) =>
          Number(
            b.riskScore || 0
          ) -
          Number(
            a.riskScore || 0
          )
      );
  }, [
    file,
    filter,
    q,
  ]);

  const counts = useMemo(() => {
    const transactions =
      file?.riskAnalysis
        ?.transactions || [];

    return transactions.reduce(
      (result, item) => {
        if (
          item.riskLevel ===
          'HIGH'
        ) {
          result.HIGH += 1;
        }

        if (
          item.riskLevel ===
          'MEDIUM'
        ) {
          result.MEDIUM += 1;
        }

        if (
          item.riskLevel ===
          'LOW'
        ) {
          result.LOW += 1;
        }

        return result;
      },
      {
        HIGH: 0,
        MEDIUM: 0,
        LOW: 0,
      }
    );
  }, [file]);

  const act = async (
    verdict
  ) => {
    if (
      !file ||
      !selected
    ) {
      return;
    }

    setBusy(true);

    try {
      await updateReview(
        file.id,
        selected.transactionIndex,
        verdict,
        ''
      );

      toast.success(
        verdict === 'fraud'
          ? 'Transaction marked as fraud.'
          : 'Transaction marked safe.'
      );

      setSelected(null);
    } catch (e) {
      toast.error(
        e.message ||
          'Unable to update review.'
      );
    } finally {
      setBusy(false);
    }
  };

  const createCase =
    async () => {
      if (
        !file ||
        !selected
      ) {
        return;
      }

      try {
        await caseApi.create({
          title: `Review transaction #${
            selected.transactionIndex +
            1
          }`,

          priority:
            selected.riskLevel ===
            'HIGH'
              ? 'high'
              : selected.riskLevel ===
                'MEDIUM'
              ? 'medium'
              : 'low',

          uploadId:
            file.id,

          transactionIndices: [
            selected.transactionIndex,
          ],

          notes:
            selected.reviewReason ||
            'Opened from Security.',
        });

        toast.success(
          'Investigation case created.'
        );
      } catch (e) {
        toast.error(
          e.message ||
            'Unable to create case.'
        );
      }
    };

  return (
    <section className="page">

      <div className="page-header">

        <div>
          <p className="page-kicker">
            FRAUD / ANOMALY REVIEW
          </p>

          <h1 className="page-title">
            Security
          </h1>

          <p className="page-subtitle">
            Investigate flagged records
            using transaction-specific
            risk factors, entity
            baselines and anomaly
            evidence.
          </p>
        </div>

      </div>

      {!file ? (
        <div className="panel empty-panel">

          <Shield size={25} />

          <h2
            style={{
              fontSize: 15,
            }}
          >
            Upload a transaction
            dataset
          </h2>

          <p className="muted">
            Security review becomes
            available after processing
            a CSV.
          </p>

        </div>
      ) : (
        <>
          {/* CONTROL BAR */}

          <div className="panel selector-bar">

            <div
              className="selector-copy"
              style={{
                minWidth: 260,
              }}
            >
              <p className="page-kicker">
                DATASET
              </p>

              <select
                className="select mt-2"
                value={file.id}
                onChange={(e) => {
                  setDatasetId(
                    e.target.value
                  );

                  setSelected(
                    null
                  );
                }}
              >
                {files.map(
                  (f) => (
                    <option
                      key={f.id}
                      value={f.id}
                    >
                      {f.name}
                    </option>
                  )
                )}
              </select>
            </div>

            <div
              style={{
                flex: 1,
              }}
            >
              <p className="page-kicker">
                FILTER
              </p>

              <div
                className="row gap-2 mt-2"
                style={{
                  flexWrap:
                    'wrap',
                }}
              >

                {[
                  'ALL',
                  'HIGH',
                  'MEDIUM',
                  'LOW',
                ].map((x) => (
                  <button
                    key={x}
                    className={
                      `btn ${
                        filter === x
                          ? 'btn-primary'
                          : ''
                      }`
                    }
                    onClick={() =>
                      setFilter(x)
                    }
                  >
                    {x}
                    {x !==
                      'ALL' &&
                      ` ${
                        counts[x]
                      }`}
                  </button>
                ))}

                <div
                  className="searchbox"
                  style={{
                    flex: 1,
                    minWidth: 220,
                  }}
                >
                  <Search size={14} />

                  <input
                    value={q}
                    onChange={(e) =>
                      setQ(
                        e.target.value
                      )
                    }
                    placeholder="Search transaction, entity, category or field value"
                  />
                </div>

              </div>
            </div>

          </div>

          {/* MAIN SECURITY AREA */}

          <div className="security-grid">

            {/* QUEUE */}

            <article className="panel">

              <div className="panel-head">

                <div>
                  <h2 className="section-title">
                    Review queue
                  </h2>

                  <p className="section-copy">
                    {queue.length.toLocaleString()}
                    {' '}
                    records matching
                    the current filter.
                  </p>
                </div>

                <span className="tag">
                  {counts.HIGH}
                  {' '}
                  high
                </span>

              </div>

              <div className="security-queue">

                {queue.length ? (
                  queue.map(
                    (item) => (
                      <SecurityRow
                        key={
                          item.transactionIndex
                        }
                        item={item}
                        selected={
                          selected?.transactionIndex ===
                          item.transactionIndex
                        }
                        onClick={() =>
                          setSelected(
                            item
                          )
                        }
                      />
                    )
                  )
                ) : (
                  <div className="empty-state">
                    No matching flagged
                    transactions.
                  </div>
                )}

              </div>

            </article>

            {/* DETAIL */}

            <article className="panel security-detail">

              {selected ? (
                <>
                  <div className="security-detail-top">

                    <div>
                      <p className="page-kicker">
                        TRANSACTION #
                        {selected.transactionIndex +
                          1}
                      </p>

                      <div
                        className="section-title"
                        style={{
                          fontSize: 17,
                          marginTop: 4,
                        }}
                      >
                        Detailed review
                      </div>
                    </div>

                    <button
                      className="icon-btn"
                      onClick={() =>
                        setSelected(
                          null
                        )
                      }
                    >
                      <X size={14} />
                    </button>

                  </div>

                  {/* SCORE SUMMARY */}

                  <div className="security-detail-grid">

                    <Metric
                      label="Risk score"
                      value={`${selected.riskScore}/100`}
                    />

                    <Metric
                      label="Anomaly"
                      value={`${selected.anomalyScore}/100`}
                    />

                    <Metric
                      label="Confidence"
                      value={`${selected.riskConfidence || 0}%`}
                    />

                    <Metric
                      label="Status"
                      value={
                        selected.review
                          ?.status ||
                        'Open'
                      }
                    />

                  </div>

                  {/* TRANSACTION SNAPSHOT */}

                  <div
                    className="panel-body"
                    style={{
                      paddingTop: 18,
                    }}
                  >

                    <div className="page-kicker">
                      TRANSACTION SNAPSHOT
                    </div>

                    <div
                      className="security-detail-grid"
                      style={{
                        marginTop: 12,
                      }}
                    >

                      <Metric
                        label="Amount"
                        value={money(
                          selected.amount
                        )}
                      />

                      <Metric
                        label="Entity"
                        value={
                          selected.entity ||
                          '—'
                        }
                      />

                      <Metric
                        label="Category"
                        value={
                          selected.category ||
                          '—'
                        }
                      />

                      <Metric
                        label="Date"
                        value={formatDate(
                          selected.date
                        )}
                      />

                    </div>

                    {/* FACTORS */}

                    <div className="page-kicker mt-4">
                      RISK FACTORS
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gap: 8,
                        marginTop: 10,
                      }}
                    >

                      {(selected.factors ||
                        []).map(
                        (
                          factor,
                          index
                        ) => (
                          <div
                            className="risk-factor"
                            key={
                              factor.code ||
                              index
                            }
                          >

                            <div>
                              <span>
                                {
                                  factor.label ||
                                  factor.name ||
                                  `Factor ${
                                    index +
                                    1
                                  }`
                                }
                              </span>

                              {factor.code && (
                                <small
                                  style={{
                                    display:
                                      'block',
                                    marginTop: 3,
                                    color:
                                      '#60778c',
                                    fontSize: 9,
                                  }}
                                >
                                  {
                                    factor.code
                                  }
                                </small>
                              )}
                            </div>

                            <strong>
                              {factor.weight ??
                                factor.score ??
                                'Observed'}
                            </strong>

                          </div>
                        )
                      )}

                    </div>

                    {/* METRICS */}

                    <div className="page-kicker mt-4">
                      ANALYTICAL METRICS
                    </div>

                    <div
                      className="stat-list"
                      style={{
                        marginTop: 8,
                      }}
                    >

                      <Row
                        label="Amount percentile"
                        value={
                          selected.metrics
                            ?.amountPercentile !=
                          null
                            ? `${selected.metrics.amountPercentile}th`
                            : '—'
                        }
                      />

                      <Row
                        label="Entity median"
                        value={money(
                          selected.metrics
                            ?.entityMedianAmount
                        )}
                      />

                      <Row
                        label="Entity frequency"
                        value={
                          selected.metrics
                            ?.entityFrequency ??
                          '—'
                        }
                      />

                      <Row
                        label="Same entity / hour"
                        value={
                          selected.metrics
                            ?.sameEntityHour ??
                          0
                        }
                      />

                      <Row
                        label="Duplicate count"
                        value={
                          selected.metrics
                            ?.duplicateCount ??
                          1
                        }
                      />

                      <Row
                        label="Concentration"
                        value={
                          selected.metrics
                            ?.concentrationRatio !=
                          null
                            ? `${(
                                Number(
                                  selected
                                    .metrics
                                    .concentrationRatio
                                ) *
                                100
                              ).toFixed(
                                1
                              )}%`
                            : '—'
                        }
                      />

                    </div>

                    {/* SOURCE RECORD */}

                    <div className="page-kicker mt-4">
                      SOURCE RECORD
                    </div>

                    <div
                      className="hash mt-2"
                      style={{
                        maxHeight: 260,
                        overflowY:
                          'auto',
                      }}
                    >
                      {Object.entries(
                        selected.row ||
                          {}
                      ).map(
                        ([key, value]) => (
                          <div
                            className="stat-row"
                            key={key}
                          >
                            <span>
                              {key}
                            </span>

                            <strong>
                              {String(
                                value ??
                                  ''
                              )}
                            </strong>
                          </div>
                        )
                      )}
                    </div>

                    {/* INTEGRITY */}

                    <div className="page-kicker mt-4">
                      INTEGRITY
                    </div>

                    <div className="hash mt-2">

                      <span className="hash-label">
                        Transaction fingerprint
                      </span>

                      <code>
                        {SHA256(
                          JSON.stringify(
                            selected.row ||
                              {}
                          )
                        ).toString()}
                      </code>

                    </div>

                    {/* ACTIONS */}

                    <div className="action-row">

                      <button
                        className="btn"
                        disabled={busy}
                        onClick={() =>
                          act(
                            'safe'
                          )
                        }
                      >
                        <CheckCircle2
                          size={14}
                        />
                        Mark Safe
                      </button>

                      <button
                        className="btn btn-danger"
                        disabled={busy}
                        onClick={() =>
                          act(
                            'fraud'
                          )
                        }
                      >
                        <AlertTriangle
                          size={14}
                        />
                        Confirm Fraud
                      </button>

                      <button
                        className="btn"
                        onClick={
                          createCase
                        }
                      >
                        <FilePlus2
                          size={14}
                        />
                        Open Case
                      </button>

                    </div>

                  </div>
                </>
              ) : (
                <div className="empty-panel">

                  <Shield size={25} />

                  <h2
                    style={{
                      fontSize: 15,
                    }}
                  >
                    Select a transaction
                  </h2>

                  <p className="muted">
                    Choose a flagged
                    record from the
                    review queue to
                    inspect its evidence.
                  </p>

                </div>
              )}

            </article>

          </div>
        </>
      )}

    </section>
  );
}

function SecurityRow({
  item,
  selected,
  onClick,
}) {
  const riskClass =
    item.riskLevel ===
    'HIGH'
      ? 'risk-high'
      : item.riskLevel ===
        'MEDIUM'
      ? 'risk-medium'
      : 'risk-low';

  return (
    <div
      className={
        `security-row ${
          selected
            ? 'selected'
            : ''
        }`
      }
      onClick={onClick}
    >

      <div className="security-row-top">

        <strong
          style={{
            fontSize: 11,
          }}
        >
          #{item.transactionIndex + 1}
        </strong>

        <span
          className={
            `risk-badge ${riskClass}`
          }
        >
          {item.riskLevel}
        </span>

      </div>

      <div
        style={{
          display: 'flex',
          justifyContent:
            'space-between',
          gap: 12,
          alignItems: 'center',
          marginTop: 8,
        }}
      >

        <strong
          style={{
            color: '#dbe6ed',
            fontSize: 14,
          }}
        >
          {money(item.amount)}
        </strong>

        <span
          style={{
            color: '#8398aa',
            fontSize: 10,
          }}
        >
          Risk {item.riskScore}/100
        </span>

      </div>

      <div
        className="case-meta"
        style={{
          marginTop: 8,
        }}
      >
        {item.entity && (
          <span>
            {item.entity}
          </span>
        )}

        {item.category && (
          <span>
            {item.category}
          </span>
        )}

        {item.date && (
          <span>
            {formatDate(
              item.date
            )}
          </span>
        )}
      </div>

      <div
        className="muted"
        style={{
          marginTop: 8,
          lineHeight: 1.5,
        }}
      >
        {item.reviewReason}
      </div>

      <div
        style={{
          display: 'flex',
          gap: 7,
          marginTop: 9,
          flexWrap: 'wrap',
        }}
      >

        <span className="tag">
          Anomaly {item.anomalyScore}
        </span>

        <span className="tag">
          {(item.factors || []).length}
          {' '}
          signal
          {(item.factors || [])
            .length === 1
            ? ''
            : 's'}
        </span>

      </div>

    </div>
  );
}

function Metric({
  label,
  value,
}) {
  return (
    <div className="metric-cell">

      <div className="profile-label">
        {label}
      </div>

      <div className="profile-value">
        {value}
      </div>

    </div>
  );
}

function Row({
  label,
  value,
}) {
  return (
    <div className="stat-row">

      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>

    </div>
  );
}