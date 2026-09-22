import {
  AlertTriangle,
  CheckCircle2,
  Fingerprint,
  FileText,
  Shield,
  X,
} from 'lucide-react';

import SHA256 from 'crypto-js/sha256';

const riskClass = (level) => {
  if (level === 'HIGH') return 'security-modal-badge security-modal-high';
  if (level === 'MEDIUM') return 'security-modal-badge security-modal-medium';
  return 'security-modal-badge security-modal-low';
};

const stableRow = (row) => {
  if (!row || typeof row !== 'object') return String(row ?? '');
  const ordered = {};
  Object.keys(row).sort().forEach((key) => {
    ordered[key] = row[key];
  });
  return JSON.stringify(ordered);
};

export default function SecurityModal({
  open,
  file,
  item,
  note,
  setNote,
  busy,
  caseBusy,
  onSafe,
  onFraud,
  onCase,
  onClose,
}) {
  if (!open || !file || !item) return null;

  const transactionHash = SHA256(
    stableRow(item.row)
  ).toString();

  const factors = item.factors || [];
  const related = item.relatedTransactions || [];

  return (
    <div
      className="security-modal-overlay"
      onMouseDown={onClose}
    >
      <div
        className="security-modal"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Transaction security review"
      >
        <div className="security-modal-header">
          <div>
            <p className="security-modal-kicker">
              TRANSACTION INVESTIGATION
            </p>
            <h2>
              Transaction #{item.transactionIndex + 1}
            </h2>
            <p>
              {file.name}
            </p>
          </div>

          <button
            type="button"
            className="security-modal-close"
            onClick={onClose}
            aria-label="Close transaction review"
          >
            <X size={17} />
          </button>
        </div>

        <div className="security-modal-scorebar">
          <div className="security-modal-score">
            <span>RISK SCORE</span>
            <strong>{item.riskScore}/100</strong>
          </div>

          <div className="security-modal-score">
            <span>ANOMALY</span>
            <strong>{item.anomalyScore}/100</strong>
          </div>

          <div className="security-modal-score">
            <span>CONFIDENCE</span>
            <strong>{item.riskConfidence ?? 0}%</strong>
          </div>

          <div className="security-modal-score-level">
            <span>CLASSIFICATION</span>
            <strong className={riskClass(item.riskLevel)}>
              {item.riskLevel}
            </strong>
          </div>
        </div>

        <div className="security-modal-body">
          <section className="security-modal-section">
            <div className="security-modal-section-title">
              <Shield size={15} />
              <h3>Why this record was flagged</h3>
            </div>

            <div className="security-modal-factors">
              {factors.length ? (
                factors.map((factor, index) => (
                  <div
                    key={`${factor.code || factor.label}-${index}`}
                    className={`security-modal-factor security-modal-factor-${factor.type || 'neutral'}`}
                  >
                    <span className="security-modal-factor-mark">
                      {factor.type === 'positive'
                        ? '+'
                        : factor.type === 'negative'
                        ? '!'
                        : '•'}
                    </span>
                    <div>
                      <strong>{factor.code || 'SIGNAL'}</strong>
                      <p>{factor.label}</p>
                    </div>
                    <span className="security-modal-factor-weight">
                      {factor.weight || 0}
                    </span>
                  </div>
                ))
              ) : (
                <div className="security-modal-empty">
                  No additional risk factors were recorded.
                </div>
              )}
            </div>
          </section>

          <div className="security-modal-two-column">
            <section className="security-modal-section">
              <div className="security-modal-section-title">
                <FileText size={15} />
                <h3>Transaction metrics</h3>
              </div>

              <div className="security-modal-metrics">
                <Metric
                  label="Amount"
                  value={
                    item.metrics?.amount == null
                      ? '—'
                      : item.metrics.amount.toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })
                  }
                />
                <Metric
                  label="Amount percentile"
                  value={
                    item.metrics?.amountPercentile == null
                      ? '—'
                      : `${item.metrics.amountPercentile}th`
                  }
                />
                <Metric
                  label="Entity median"
                  value={
                    item.metrics?.entityMedianAmount == null
                      ? '—'
                      : item.metrics.entityMedianAmount.toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })
                  }
                />
                <Metric
                  label="Robust Z"
                  value={
                    item.metrics?.robustZ == null
                      ? '—'
                      : item.metrics.robustZ
                  }
                />
                <Metric
                  label="Entity / hour"
                  value={item.metrics?.sameEntityHour ?? 0}
                />
                <Metric
                  label="Entity / day"
                  value={item.metrics?.sameEntityDay ?? 0}
                />
              </div>
            </section>

            <section className="security-modal-section">
              <div className="security-modal-section-title">
                <Fingerprint size={15} />
                <h3>Integrity evidence</h3>
              </div>

              <div className="security-modal-hashes">
                <HashLine
                  label="Transaction SHA-256"
                  value={transactionHash}
                />
                <HashLine
                  label={`${file.name} SHA-256`}
                  value={file.integrityHash || 'Not available'}
                />
              </div>
            </section>
          </div>

          <section className="security-modal-section">
            <div className="security-modal-section-title">
              <AlertTriangle size={15} />
              <h3>Related transactions</h3>
            </div>

            {related.length ? (
              <div className="security-modal-related">
                {related.map((index) => (
                  <span key={index}>
                    #{Number(index) + 1}
                  </span>
                ))}
              </div>
            ) : (
              <div className="security-modal-empty">
                No related transaction references were detected.
              </div>
            )}
          </section>

          <section className="security-modal-section">
            <div className="security-modal-section-title">
              <FileText size={15} />
              <h3>Investigation note</h3>
            </div>

            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Record why this transaction was marked safe or fraudulent..."
              className="security-modal-note"
              maxLength={500}
            />
          </section>
        </div>

        <div className="security-modal-footer">
          <button
            type="button"
            className="security-modal-case"
            onClick={onCase}
            disabled={caseBusy}
          >
            {caseBusy ? 'Creating case…' : 'Create investigation case'}
          </button>

          <div className="security-modal-decisions">
            <button
              type="button"
              className="security-modal-safe"
              onClick={onSafe}
              disabled={busy}
            >
              <CheckCircle2 size={15} />
              {busy ? 'Saving…' : 'Mark Safe'}
            </button>

            <button
              type="button"
              className="security-modal-fraud"
              onClick={onFraud}
              disabled={busy}
            >
              <AlertTriangle size={15} />
              {busy ? 'Saving…' : 'Confirm Fraud'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="security-modal-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function HashLine({ label, value }) {
  return (
    <div className="security-modal-hash">
      <span>{label}</span>
      <code>{value}</code>
    </div>
  );
}
