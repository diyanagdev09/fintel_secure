import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Clock3,
  FileText,
  Plus,
  Save,
  Send,
  Shield,
  UserRound,
  X,
} from 'lucide-react';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import toast from 'react-hot-toast';

import {
  caseApi,
} from '../api/client.js';

import {
  useData,
} from '../context/DataContext.jsx';


const priorityClass = (
  value
) => {
  if (
    value ===
      'critical' ||
    value ===
      'high'
  ) {
    return 'badge badge-high';
  }

  if (
    value ===
    'medium'
  ) {
    return 'badge badge-medium';
  }

  return 'badge badge-low';
};


export default function CaseManagementPage() {
  const {
    files,
  } = useData();


  const [
    cases,
    setCases,
  ] = useState([]);


  const [
    selectedId,
    setSelectedId,
  ] = useState(null);


  const [
    search,
    setSearch,
  ] = useState('');


  const [
    statusFilter,
    setStatusFilter,
  ] = useState('all');


  const [
    newCaseOpen,
    setNewCaseOpen,
  ] = useState(false);


  const [
    draftNotes,
    setDraftNotes,
  ] = useState('');


  const [
    timelineText,
    setTimelineText,
  ] = useState('');


  const [
    savingNotes,
    setSavingNotes,
  ] = useState(false);


  const [
    creating,
    setCreating,
  ] = useState(false);


  const [
    form,
    setForm,
  ] = useState({
    title: '',
    priority: 'medium',
    uploadId:
      files[0]?.id ||
      '',
    transactionIndex:
      '',
    notes: '',
  });


  const load =
    async () => {
      try {
        const result =
          await caseApi.list();

        const list =
          result.cases ||
          [];

        setCases(list);

        if (
          !selectedId &&
          list[0]
        ) {
          setSelectedId(
            list[0].id ||
              list[0]._id
          );
        }
      } catch (
        error
      ) {
        toast.error(
          error?.message ||
            'Unable to load cases.'
        );
      }
    };


  useEffect(() => {
    load();
  }, []);


  useEffect(() => {
    if (
      files[0] &&
      !form.uploadId
    ) {
      setForm(
        (current) => ({
          ...current,
          uploadId:
            files[0].id,
        })
      );
    }
  }, [
    files,
    form.uploadId,
  ]);


  const filteredCases =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return cases.filter(
        (item) => {
          const matchesQuery =
            !query ||
            item.caseNumber
              ?.toLowerCase()
              .includes(query) ||
            item.title
              ?.toLowerCase()
              .includes(query);

          const matchesStatus =
            statusFilter ===
              'all' ||
            item.status ===
              statusFilter;

          return (
            matchesQuery &&
            matchesStatus
          );
        }
      );
    }, [
      cases,
      search,
      statusFilter,
    ]);


  const selected =
    cases.find(
      (item) =>
        (
          item.id ||
          item._id
        ) ===
        selectedId
    ) || null;


  useEffect(() => {
    setDraftNotes(
      selected?.notes ||
        ''
    );
  }, [
    selectedId,
    selected?.notes,
  ]);


  const totals =
    useMemo(
      () => ({
        total:
          cases.length,

        open:
          cases.filter(
            (item) =>
              item.status ===
              'open'
          ).length,

        investigating:
          cases.filter(
            (item) =>
              item.status ===
              'investigating'
          ).length,

        escalated:
          cases.filter(
            (item) =>
              item.status ===
              'escalated'
          ).length,
      }),
      [cases]
    );


  const createCase =
    async () => {
      if (
        !form.title.trim()
      ) {
        toast.error(
          'Enter a case title.'
        );

        return;
      }

      setCreating(true);

      try {
        const result =
          await caseApi.create({
            title:
              form.title.trim(),

            priority:
              form.priority,

            uploadId:
              form.uploadId,

            transactionIndices:
              form.transactionIndex ===
              ''
                ? []
                : [
                    Number(
                      form.transactionIndex
                    ) - 1,
                  ],

            notes:
              form.notes.trim(),
          });


        const created =
          result.case;

        setCases(
          (
            current
          ) => [
            created,
            ...current,
          ]
        );

        setSelectedId(
          created.id ||
            created._id
        );

        setNewCaseOpen(
          false
        );

        setForm({
          title: '',
          priority:
            'medium',
          uploadId:
            files[0]?.id ||
            '',
          transactionIndex:
            '',
          notes: '',
        });

        toast.success(
          'Case created.'
        );

      } catch (
        error
      ) {
        toast.error(
          error?.message ||
            'Unable to create case.'
        );
      } finally {
        setCreating(
          false
        );
      }
    };


  const updateCase =
    async (
      field,
      value
    ) => {
      if (!selected) {
        return;
      }

      try {
        const result =
          await caseApi.update(
            selected.id ||
              selected._id,
            {
              [field]:
                value,
            }
          );

        setCases(
          (
            current
          ) =>
            current.map(
              (item) =>
                (
                  item.id ||
                  item._id
                ) ===
                (
                  result.case
                    .id ||
                  result.case
                    ._id
                )
                  ? result.case
                  : item
            )
        );

        toast.success(
          'Case updated.'
        );

      } catch (
        error
      ) {
        toast.error(
          error?.message ||
            'Unable to update case.'
        );
      }
    };


  const saveNotes =
    async () => {
      if (!selected) {
        return;
      }

      setSavingNotes(
        true
      );

      try {
        const result =
          await caseApi.update(
            selected.id ||
              selected._id,
            {
              notes:
                draftNotes,
            }
          );

        setCases(
          (
            current
          ) =>
            current.map(
              (item) =>
                (
                  item.id ||
                  item._id
                ) ===
                (
                  result.case
                    .id ||
                  result.case
                    ._id
                )
                  ? result.case
                  : item
            )
        );

        toast.success(
          'Notes saved.'
        );

      } catch (
        error
      ) {
        toast.error(
          error?.message ||
            'Unable to save notes.'
        );
      } finally {
        setSavingNotes(
          false
        );
      }
    };


  const addTimeline =
    async () => {
      if (
        !selected ||
        !timelineText.trim()
      ) {
        return;
      }

      try {
        const result =
          await caseApi.timeline(
            selected.id ||
              selected._id,
            timelineText.trim()
          );

        setCases(
          (
            current
          ) =>
            current.map(
              (item) =>
                (
                  item.id ||
                  item._id
                ) ===
                (
                  result.case
                    .id ||
                  result.case
                    ._id
                )
                  ? result.case
                  : item
            )
        );

        setTimelineText('');

      } catch (
        error
      ) {
        toast.error(
          error?.message ||
            'Unable to add timeline entry.'
        );
      }
    };


  return (
    <section className="cases-page">

      <header className="workspace-page-heading cases-heading">

        <div>
          <p className="page-kicker">
            INVESTIGATION WORKSPACE
          </p>

          <h1 className="page-title">
            Cases
          </h1>

          <p className="page-subtitle">
            Track investigations from initial flag through
            analyst review and resolution.
          </p>
        </div>


        <button
          type="button"
          className="button-primary"
          onClick={() =>
            setNewCaseOpen(
              true
            )
          }
        >
          <Plus
            size={15}
          />
          New case
        </button>

      </header>


      <div className="cases-metrics">

        <CaseMetric
          label="All cases"
          value={
            totals.total
          }
          icon={ClipboardList}
        />

        <CaseMetric
          label="Open"
          value={
            totals.open
          }
          icon={Clock3}
        />

        <CaseMetric
          label="Investigating"
          value={
            totals.investigating
          }
          icon={Shield}
        />

        <CaseMetric
          label="Escalated"
          value={
            totals.escalated
          }
          icon={
            AlertTriangle
          }
        />

      </div>


      <div className="cases-toolbar panel">

        <div className="cases-search">
          <ClipboardList
            size={15}
          />

          <input
            value={
              search
            }
            onChange={(
              event
            ) =>
              setSearch(
                event.target
                  .value
              )
            }
            placeholder="Search case number or title"
          />
        </div>


        <div className="cases-filter-group">

          {[
            'all',
            'open',
            'investigating',
            'escalated',
            'resolved',
          ].map(
            (value) => (
              <button
                key={
                  value
                }
                type="button"
                className={
                  statusFilter ===
                  value
                    ? 'case-filter-active'
                    : ''
                }
                onClick={() =>
                  setStatusFilter(
                    value
                  )
                }
              >
                {value}
              </button>
            )
          )}

        </div>

      </div>


      <div className="cases-workspace">

        {/* QUEUE */}

        <section className="case-queue panel">

          <div className="case-queue-header">

            <div>
              <p className="section-overline">
                CASE REGISTER
              </p>

              <h2>
                Investigation queue
              </h2>
            </div>

            <span>
              {filteredCases.length}
            </span>

          </div>


          {!filteredCases.length ? (

            <div className="case-empty">
              <FileText
                size={23}
              />

              <strong>
                No matching cases
              </strong>

              <p>
                Create an investigation case from a flagged transaction.
              </p>
            </div>

          ) : (

            <div className="case-list">

              {filteredCases.map(
                (item) => {

                  const id =
                    item.id ||
                    item._id;

                  const active =
                    id ===
                    selectedId;

                  return (
                    <button
                      type="button"
                      key={
                        id
                      }
                      className={`case-list-item ${
                        active
                          ? 'case-list-active'
                          : ''
                      }`}
                      onClick={() =>
                        setSelectedId(
                          id
                        )
                      }
                    >

                      <div className="case-list-top">

                        <strong>
                          {
                            item.caseNumber
                          }
                        </strong>

                        <span
                          className={priorityClass(
                            item.priority
                          )}
                        >
                          {
                            item.priority
                          }
                        </span>

                      </div>


                      <div className="case-list-title">
                        {
                          item.title
                        }
                      </div>


                      <div className="case-list-meta">

                        <span>
                          {
                            item.status
                          }
                        </span>

                        <span>
                          {item.transactions
                            ?.length ||
                            0}{' '}
                          transactions
                        </span>

                        <span>
                          {item.updatedAt
                            ? new Date(
                                item.updatedAt
                              ).toLocaleDateString()
                            : '—'}
                        </span>

                      </div>

                    </button>
                  );
                }
              )}

            </div>
          )}

        </section>


        {/* DETAIL */}

        {selected ? (

          <section className="case-detail panel">

            <div className="case-detail-header">

              <div>

                <p className="section-overline">
                  {
                    selected.caseNumber
                  }
                </p>

                <h2>
                  {
                    selected.title
                  }
                </h2>

              </div>


              <span
                className={priorityClass(
                  selected.priority
                )}
              >
                {
                  selected.priority
                }
              </span>

            </div>


            <div className="case-control-grid">

              <CaseControl
                label="Status"
                value={
                  selected.status
                }
                options={[
                  'open',
                  'investigating',
                  'escalated',
                  'resolved',
                ]}
                onChange={(
                  value
                ) =>
                  updateCase(
                    'status',
                    value
                  )
                }
              />


              <CaseControl
                label="Priority"
                value={
                  selected.priority
                }
                options={[
                  'low',
                  'medium',
                  'high',
                  'critical',
                ]}
                onChange={(
                  value
                ) =>
                  updateCase(
                    'priority',
                    value
                  )
                }
              />


              <label className="case-control">
                <span>
                  Assigned analyst
                </span>

                <input
                  value={
                    selected.assignedTo ||
                    ''
                  }
                  onChange={(event) =>
                    setCases(
                      (
                        current
                      ) =>
                        current.map(
                          (
                            item
                          ) =>
                            (
                              item.id ||
                              item._id
                            ) ===
                            (
                              selected.id ||
                              selected._id
                            )
                              ? {
                                  ...item,
                                  assignedTo:
                                    event
                                      .target
                                      .value,
                                }
                              : item
                        )
                    )
                  }
                  onBlur={(
                    event
                  ) =>
                    updateCase(
                      'assignedTo',
                      event.target
                        .value
                    )
                  }
                  placeholder="Unassigned"
                />
              </label>

            </div>


            {/* NOTES */}

            <div className="case-detail-section">

              <div className="case-section-title">
                <div>
                  <p>
                    INVESTIGATION NOTES
                  </p>

                  <span>
                    Add analyst context without changing the event history.
                  </span>
                </div>

                <button
                  type="button"
                  className="button-secondary"
                  onClick={
                    saveNotes
                  }
                  disabled={
                    savingNotes
                  }
                >
                  <Save
                    size={13}
                  />

                  {savingNotes
                    ? 'Saving…'
                    : 'Save notes'}
                </button>
              </div>


              <textarea
                className="case-notes-editor"
                value={
                  draftNotes
                }
                onChange={(
                  event
                ) =>
                  setDraftNotes(
                    event.target
                      .value
                  )
                }
                placeholder="Record the investigation context..."
              />

            </div>


            {/* TRANSACTIONS */}

            <div className="case-detail-section">

              <div className="case-section-title">

                <div>
                  <p>
                    TRANSACTION REFERENCES
                  </p>

                  <span>
                    Records connected with this investigation.
                  </span>
                </div>

              </div>


              {selected.transactions
                ?.length ? (

                <div className="case-reference-list">

                  {selected.transactions.map(
                    (
                      transaction
                    ) => (
                      <div
                        className="case-reference"
                        key={`${transaction.uploadId}-${transaction.transactionIndex}`}
                      >

                        <div className="case-reference-number">
                          <FileText
                            size={14}
                          />

                          <strong>
                            Transaction #
                            {
                              transaction.transactionIndex +
                              1
                            }
                          </strong>
                        </div>

                        <div className="case-reference-risk">
                          Risk{' '}
                          {
                            transaction.riskScore
                          }
                          /100
                          <span />
                          Anomaly{' '}
                          {
                            transaction.anomalyScore
                          }
                          /100
                        </div>

                      </div>
                    )
                  )}

                </div>

              ) : (

                <div className="case-inline-empty">
                  No transaction references attached.
                </div>

              )}

            </div>


            {/* EVIDENCE */}

            <div className="case-detail-section">

              <div className="case-section-title">
                <div>
                  <p>
                    EVIDENCE
                  </p>

                  <span>
                    Integrity and investigation evidence attached to this case.
                  </span>
                </div>
              </div>


              {selected.evidence
                ?.length ? (

                <div className="case-evidence-grid">

                  {selected.evidence.map(
                    (
                      evidence,
                      index
                    ) => (
                      <div
                        className="case-evidence"
                        key={
                          index
                        }
                      >

                        <div className="case-evidence-label">
                          {
                            evidence.label
                          }
                        </div>

                        <code>
                          {
                            evidence.value
                          }
                        </code>

                      </div>
                    )
                  )}

                </div>

              ) : (

                <div className="case-inline-empty">
                  No evidence records attached.
                </div>

              )}

            </div>


            {/* TIMELINE */}

            <div className="case-detail-section">

              <div className="case-section-title">
                <div>
                  <p>
                    AUDIT TIMELINE
                  </p>

                  <span>
                    Chronological investigation activity.
                  </span>
                </div>
              </div>


              <div className="case-timeline">

                {selected.timeline
                  ?.length ? (

                  selected.timeline.map(
                    (
                      event,
                      index
                    ) => (
                      <div
                        className="case-timeline-item"
                        key={
                          index
                        }
                      >

                        <span className="case-timeline-marker" />

                        <div>
                          <strong>
                            {
                              event.text
                            }
                          </strong>

                          <small>
                            {event.at
                              ? new Date(
                                  event.at
                                ).toLocaleString()
                              : '—'}
                          </small>
                        </div>

                      </div>
                    )
                  )

                ) : (

                  <div className="case-inline-empty">
                    No timeline entries.
                  </div>

                )}

              </div>


              <div className="case-timeline-entry">

                <input
                  value={
                    timelineText
                  }
                  onChange={(
                    event
                  ) =>
                    setTimelineText(
                      event.target
                        .value
                    )
                  }
                  placeholder="Add an investigation event..."
                />

                <button
                  type="button"
                  className="button-secondary"
                  onClick={
                    addTimeline
                  }
                  disabled={
                    !timelineText.trim()
                  }
                >
                  <Send
                    size={14}
                  />
                </button>

              </div>

            </div>

          </section>

        ) : (

          <section className="case-detail-empty panel">

            <ClipboardList
              size={28}
            />

            <h2>
              Select an investigation
            </h2>

            <p>
              Choose a case from the register to inspect evidence, records and timeline activity.
            </p>

          </section>

        )}

      </div>


      {/* NEW CASE MODAL */}

      {newCaseOpen && (
        <div
          className="case-modal-backdrop"
          onMouseDown={() =>
            setNewCaseOpen(
              false
            )
          }
        >

          <div
            className="case-modal"
            onMouseDown={(
              event
            ) =>
              event.stopPropagation()
            }
          >

            <div className="case-modal-header">

              <div>
                <p className="page-kicker">
                  NEW INVESTIGATION
                </p>

                <h2>
                  Create case
                </h2>

                <p>
                  Connect the case to a dataset or flagged transaction.
                </p>
              </div>

              <button
                type="button"
                className="case-modal-close"
                onClick={() =>
                  setNewCaseOpen(
                    false
                  )
                }
              >
                <X
                  size={17}
                />
              </button>

            </div>


            <div className="case-modal-form">

              <label>
                Case title

                <input
                  value={
                    form.title
                  }
                  onChange={(
                    event
                  ) =>
                    setForm(
                      (current) => ({
                        ...current,
                        title:
                          event
                            .target
                            .value,
                      })
                    )
                  }
                  placeholder="Suspicious transaction cluster"
                />
              </label>


              <div className="case-modal-two">

                <label>
                  Priority

                  <select
                    value={
                      form.priority
                    }
                    onChange={(
                      event
                    ) =>
                      setForm(
                        (current) => ({
                          ...current,
                          priority:
                            event
                              .target
                              .value,
                        })
                      )
                    }
                  >
                    <option value="low">
                      Low
                    </option>

                    <option value="medium">
                      Medium
                    </option>

                    <option value="high">
                      High
                    </option>

                    <option value="critical">
                      Critical
                    </option>
                  </select>
                </label>


                <label>
                  Dataset

                  <select
                    value={
                      form.uploadId
                    }
                    onChange={(
                      event
                    ) =>
                      setForm(
                        (current) => ({
                          ...current,
                          uploadId:
                            event
                              .target
                              .value,
                        })
                      )
                    }
                  >
                    <option value="">
                      No dataset
                    </option>

                    {files.map(
                      (file) => (
                        <option
                          key={
                            file.id
                          }
                          value={
                            file.id
                          }
                        >
                          {
                            file.name
                          }
                        </option>
                      )
                    )}
                  </select>
                </label>

              </div>


              <label>
                Transaction number

                <input
                  type="number"
                  min="1"
                  value={
                    form.transactionIndex
                  }
                  onChange={(
                    event
                  ) =>
                    setForm(
                      (current) => ({
                        ...current,
                        transactionIndex:
                          event
                            .target
                            .value,
                      })
                    )
                  }
                  placeholder="Optional"
                />
              </label>


              <label>
                Initial notes

                <textarea
                  value={
                    form.notes
                  }
                  onChange={(
                    event
                  ) =>
                    setForm(
                      (current) => ({
                        ...current,
                        notes:
                          event
                            .target
                            .value,
                      })
                    )
                  }
                  placeholder="Describe why this case was opened..."
                />
              </label>

            </div>


            <div className="case-modal-footer">

              <button
                type="button"
                className="button-secondary"
                onClick={() =>
                  setNewCaseOpen(
                    false
                  )
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="button-primary"
                disabled={
                  creating
                }
                onClick={
                  createCase
                }
              >
                <Plus
                  size={14}
                />

                {creating
                  ? 'Creating…'
                  : 'Create case'}
              </button>

            </div>

          </div>

        </div>
      )}

    </section>
  );
}


function CaseMetric({
  label,
  value,
  icon: Icon,
}) {
  return (
    <div className="case-metric">

      <div className="case-metric-icon">
        <Icon
          size={15}
        />
      </div>

      <div>
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


function CaseControl({
  label,
  value,
  options,
  onChange,
}) {
  return (
    <label className="case-control">

      <span>
        {label}
      </span>

      <select
        value={
          value
        }
        onChange={(
          event
        ) =>
          onChange(
            event.target
              .value
          )
        }
      >
        {options.map(
          (option) => (
            <option
              key={
                option
              }
              value={
                option
              }
            >
              {option
                .charAt(
                  0
                )
                .toUpperCase() +
                option.slice(
                  1
                )}
            </option>
          )
        )}
      </select>

    </label>
  );
}