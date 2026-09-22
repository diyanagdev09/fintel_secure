import {
  Activity,
  Cpu,
  Gauge,
  TimerReset,
  Zap,
  Database,
  Clock3,
} from 'lucide-react';

import { useMemo } from 'react';
import { useData } from '../context/DataContext.jsx';

export default function ProcessingComparisonPage() {
  const { files = [] } = useData();

  const runs = useMemo(
    () =>
      files.filter(
        (file) =>
          Number(file.sequentialTime) > 0 ||
          Number(file.parallelTime) > 0
      ),
    [files]
  );

  const totals = useMemo(() => {
    const sequential = runs.reduce(
      (sum, file) =>
        sum + Number(file.sequentialTime || 0),
      0
    );

    const parallel = runs.reduce(
      (sum, file) =>
        sum + Number(file.parallelTime || 0),
      0
    );

    const transactions = files.reduce(
      (sum, file) =>
        sum + Number(file.totalTransactions || 0),
      0
    );

    const improvement =
      sequential > 0 && parallel > 0
        ? Math.max(
            0,
            Math.round(
              (1 - parallel / sequential) * 100
            )
          )
        : 0;

    return {
      sequential,
      parallel,
      transactions,
      improvement,
    };
  }, [files, runs]);

  const maxTime = Math.max(
    ...runs.map((file) =>
      Math.max(
        Number(file.sequentialTime || 0),
        Number(file.parallelTime || 0)
      )
    ),
    1
  );

  return (
    <section className="page processing-page">

      {/* HEADER */}
      <header className="page-header processing-header">
        <div>
          <p className="page-kicker">
            COMPUTE PERFORMANCE
          </p>

          <h1 className="page-title">
            Processing
          </h1>

          <p className="page-subtitle">
            Monitor how Fintel Secure processes uploaded
            datasets and compare measured execution paths.
          </p>
        </div>

        <div className="processing-run-status">
          <span />
          {runs.length
            ? `${runs.length} measured ${
                runs.length === 1 ? 'run' : 'runs'
              }`
            : 'No measured runs'}
        </div>
      </header>

      {/* KPI CARDS */}
      <div className="processing-kpis">

        <MetricCard
          icon={Database}
          label="Datasets processed"
          value={files.length}
          note="Uploaded datasets"
        />

        <MetricCard
          icon={Activity}
          label="Records processed"
          value={totals.transactions.toLocaleString()}
          note="Total transaction rows"
        />

        <MetricCard
          icon={TimerReset}
          label="Sequential runtime"
          value={`${totals.sequential.toFixed(2)} ms`}
          note="Measured baseline"
        />

        <MetricCard
          icon={Gauge}
          label="Parallel runtime"
          value={`${totals.parallel.toFixed(2)} ms`}
          note="Measured parallel path"
        />

      </div>

      {/* NO DATA */}
      {!runs.length ? (
        <div className="processing-empty panel">
          <Cpu size={28} />

          <h2>
            No benchmark runs yet
          </h2>

          <p>
            Upload and process a CSV dataset. Fintel will
            record the measured execution times here.
          </p>
        </div>
      ) : (
        <>
          {/* MAIN PROCESSING AREA */}
          <div className="processing-main-grid">

            {/* TABLE */}
            <article className="panel processing-table-panel">

              <div className="panel-head">
                <div>
                  <p className="page-kicker">
                    RUN REGISTER
                  </p>

                  <h2 className="section-title">
                    Measured processing times
                  </h2>

                  <p className="section-copy">
                    Each row maps directly to an uploaded
                    dataset and its stored benchmark values.
                  </p>
                </div>

                <Activity size={17} />
              </div>

              <div className="processing-table-wrap">

                <table className="processing-table">

                  <thead>
                    <tr>
                      <th>Dataset</th>
                      <th>Records</th>
                      <th>Sequential</th>
                      <th>Parallel</th>
                      <th>Difference</th>
                    </tr>
                  </thead>

                  <tbody>

                    {runs.map((file) => {

                      const sequential =
                        Number(
                          file.sequentialTime || 0
                        );

                      const parallel =
                        Number(
                          file.parallelTime || 0
                        );

                      const difference =
                        sequential - parallel;

                      return (
                        <tr key={file.id}>

                          <td>
                            <strong className="processing-file-name">
                              {file.name}
                            </strong>
                          </td>

                          <td>
                            {Number(
                              file.totalTransactions || 0
                            ).toLocaleString()}
                          </td>

                          <td>
                            {sequential.toFixed(2)} ms
                          </td>

                          <td className="processing-positive">
                            {parallel.toFixed(2)} ms
                          </td>

                          <td>
                            <span
                              className={
                                difference >= 0
                                  ? 'processing-positive'
                                  : 'processing-negative'
                              }
                            >
                              {difference >= 0
                                ? '-'
                                : '+'}
                              {Math.abs(
                                difference
                              ).toFixed(2)} ms
                            </span>
                          </td>

                        </tr>
                      );
                    })}

                  </tbody>

                </table>

              </div>

            </article>

            {/* RUNTIME PROFILE */}
            <article className="panel runtime-panel">

              <div className="panel-head">
                <div>
                  <p className="page-kicker">
                    EXECUTION PROFILE
                  </p>

                  <h2 className="section-title">
                    Runtime comparison
                  </h2>

                  <p className="section-copy">
                    Relative runtime across the stored
                    processing runs.
                  </p>
                </div>

                <Zap size={17} />
              </div>

              <div className="runtime-content">

                <RuntimeBar
                  icon={TimerReset}
                  label="Sequential"
                  value={totals.sequential}
                  max={maxTime}
                />

                <RuntimeBar
                  icon={Zap}
                  label="Parallel"
                  value={totals.parallel}
                  max={maxTime}
                />

                <div className="runtime-summary">

                  <div>
                    <span>
                      Runtime difference
                    </span>

                    <strong>
                      {Math.abs(
                        totals.sequential -
                          totals.parallel
                      ).toFixed(2)} ms
                    </strong>
                  </div>

                  <div>
                    <span>
                      Parallel relative change
                    </span>

                    <strong className="processing-positive">
                      {totals.improvement}%
                    </strong>
                  </div>

                </div>

              </div>

            </article>

          </div>

          {/* EXPLANATION */}
          <article className="panel processing-explanation">

            <div className="processing-explanation-icon">
              <Clock3 size={18} />
            </div>

            <div>
              <strong>
                How to read this
              </strong>

              <p>
                Sequential runtime represents the measured
                baseline path. Parallel runtime represents
                the stored parallel processing measurement.
                Lower runtime means the processing completed
                faster for that run.
              </p>
            </div>

          </article>

        </>
      )}

    </section>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  note,
}) {
  return (
    <article className="processing-kpi panel">

      <div className="processing-kpi-icon">
        <Icon size={17} />
      </div>

      <div className="processing-kpi-content">

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

function RuntimeBar({
  icon: Icon,
  label,
  value,
  max,
}) {
  const percentage =
    max > 0
      ? Math.max(
          5,
          Math.min(
            100,
            (value / max) * 100
          )
        )
      : 5;

  return (
    <div className="runtime-item">

      <div className="runtime-item-head">

        <div>
          <Icon size={14} />

          <span>
            {label}
          </span>
        </div>

        <strong>
          {value.toFixed(2)} ms
        </strong>

      </div>

      <div className="runtime-track">
        <span
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>

    </div>
  );
}