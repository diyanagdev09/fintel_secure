import { useEffect, useMemo, useState } from 'react';
import {
  FileClock,
  Plus,
  Search,
  ShieldAlert,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { caseApi } from '../api/client.js';

export default function CasesPage() {
  const [cases, setCases] = useState([]);
  const [selected, setSelected] = useState(null);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);

    try {
      const r = await caseApi.list();
      const c = r?.cases || [];

      setCases(c);

      if (!selected && c[0]) {
        setSelected(c[0]);
      }
    } catch (e) {
      toast.error(
        e?.message || 'Unable to load cases.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const visible = useMemo(() => {
    const search = q.toLowerCase().trim();

    return cases.filter((c) =>
      `${c.caseNumber || ''} ${c.title || ''}`
        .toLowerCase()
        .includes(search)
    );
  }, [cases, q]);

  const create = async () => {
    try {
      const r = await caseApi.create({
        title: 'New investigation',
        priority: 'medium',
        notes: 'Created from Cases workspace.',
      });

      toast.success('Case created.');

      await load();

      if (r?.case) {
        setSelected(r.case);
      }
    } catch (e) {
      toast.error(
        e?.message || 'Unable to create case.'
      );
    }
  };

  return (
    <section className="page cases-page">

      {/* PAGE HEADER */}
      <div className="page-header">
        <div>
          <p className="page-kicker">
            INVESTIGATION WORKSPACE
          </p>

          <h1 className="page-title">
            Cases
          </h1>

          <p className="page-subtitle">
            Track investigations from initial flag
            through analyst review and resolution.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary cases-new-btn"
          onClick={create}
        >
          <Plus size={14} />
          New case
        </button>
      </div>

      {/* SUMMARY */}
      <div className="case-summary">
        <Stat
          label="All cases"
          value={cases.length}
        />

        <Stat
          label="Open"
          value={
            cases.filter(
              (c) => c.status === 'open'
            ).length
          }
        />

        <Stat
          label="Investigating"
          value={
            cases.filter(
              (c) => c.status === 'investigating'
            ).length
          }
        />

        <Stat
          label="Escalated"
          value={
            cases.filter(
              (c) => c.status === 'escalated'
            ).length
          }
        />
      </div>

      {/* SEARCH */}
      <div className="case-toolbar">
        <div
          className="searchbox"
          style={{ flex: 1 }}
        >
          <Search size={14} />

          <input
            value={q}
            onChange={(e) =>
              setQ(e.target.value)
            }
            placeholder="Search case number or title"
          />
        </div>
      </div>

      {/* CASES */}
      <div className="cases-grid">

        {/* LEFT — QUEUE */}
        <article className="panel case-queue">

          <div className="panel-head">
            <div>
              <h2 className="section-title">
                Investigation queue
              </h2>

              <p className="section-copy">
                {visible.length}{' '}
                {visible.length === 1
                  ? 'case'
                  : 'cases'}
                .
              </p>
            </div>

            <FileClock
              size={15}
              color="#5e7489"
            />
          </div>

          <div className="case-list">

            {loading ? (
              <div className="empty-state">
                Loading cases…
              </div>
            ) : visible.length ? (
              visible.map((c) => (
                <div
                  className={`case-item ${
                    selected?.id === c.id
                      ? 'active'
                      : ''
                  }`}
                  key={c.id}
                  onClick={() =>
                    setSelected(c)
                  }
                >
                  <div className="case-item-main">

                    <div className="case-item-top">
                      <div className="case-title">
                        {c.caseNumber || c.id}
                      </div>

                      <SeverityBadge
                        priority={c.priority}
                      />
                    </div>

                    <div className="case-meta">
                      <span>
                        {c.title ||
                          'Untitled case'}
                      </span>

                      <span className="case-dot">
                        •
                      </span>

                      <span>
                        {c.status || 'open'}
                      </span>
                    </div>

                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <ShieldAlert size={23} />

                <div
                  style={{
                    marginTop: 9,
                  }}
                >
                  No matching cases.
                </div>

                <div className="muted">
                  Create a case from a flagged
                  transaction.
                </div>
              </div>
            )}

          </div>
        </article>

        {/* RIGHT — DETAIL */}
        <article className="panel case-detail">

          {selected ? (
            <>
              <div className="case-detail-header">

                <div className="case-detail-heading">
                  <p className="page-kicker">
                    {selected.caseNumber ||
                      selected.id}
                  </p>

                  <h2>
                    {selected.title ||
                      'Investigation case'}
                  </h2>
                </div>

                <SeverityBadge
                  priority={selected.priority}
                />

              </div>

              <div className="case-detail-content">

                <div className="case-detail-grid">

                  <label>
                    <span className="label">
                      Status
                    </span>

                    <select
                      className="select"
                      defaultValue={
                        selected.status ||
                        'open'
                      }
                    >
                      <option value="open">
                        Open
                      </option>

                      <option value="investigating">
                        Investigating
                      </option>

                      <option value="escalated">
                        Escalated
                      </option>

                      <option value="resolved">
                        Resolved
                      </option>
                    </select>
                  </label>

                  <label>
                    <span className="label">
                      Assigned analyst
                    </span>

                    <input
                      className="input"
                      value={
                        selected.assignedTo ||
                        'Unassigned'
                      }
                      readOnly
                    />
                  </label>

                </div>

                <div className="case-notes">

                  <div className="page-kicker">
                    INVESTIGATION NOTES
                  </div>

                  <div className="muted case-note-text">
                    {selected.notes ||
                      'No investigation notes yet.'}
                  </div>

                </div>

                <div className="timeline">

                  <div className="page-kicker">
                    TIMELINE
                  </div>

                  <div className="timeline-item">

                    <strong>
                      Case created
                    </strong>

                    <small>
                      {selected.createdAt
                        ? new Date(
                            selected.createdAt
                          ).toLocaleString(
                            'en-IN'
                          )
                        : '—'}
                    </small>

                  </div>

                </div>

              </div>
            </>
          ) : (
            <div className="empty-panel">
              <FileClock size={24} />

              <h2
                style={{
                  fontSize: 15,
                }}
              >
                Select an investigation
              </h2>

              <p className="muted">
                Choose a case from the register.
              </p>
            </div>
          )}

        </article>

      </div>
    </section>
  );
}


/* =========================================================
   SEVERITY BADGE
   ========================================================= */

function SeverityBadge({ priority }) {
  const level = String(
    priority || 'medium'
  ).toLowerCase();

  return (
    <span
      className={`case-severity case-severity-${level}`}
    >
      {level.toUpperCase()}
    </span>
  );
}


function Stat({ label, value }) {
  return (
    <div className="case-stat">
      <div className="kpi-label">
        {label}
      </div>

      <div className="case-count">
        {value}
      </div>
    </div>
  );
}