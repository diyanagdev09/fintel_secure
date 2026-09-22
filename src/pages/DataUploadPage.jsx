import { useRef, useState } from 'react';

import {
  CheckCircle2,
  Database,
  FileText,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';

import toast from 'react-hot-toast';

import { useData } from '../context/DataContext.jsx';

export default function DataUploadPage() {
  const {
    files = [],
    addFiles,
    deleteFile,
    loading,
  } = useData();

  const ref = useRef(null);

  const [selected, setSelected] = useState([]);
  const [busy, setBusy] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [active, setActive] = useState(null);

  const upload = async () => {
    if (!selected.length) {
      toast.error('Choose one or more CSV files.');
      return;
    }

    setBusy(true);

    try {
      await addFiles(selected);

      toast.success(
        `${selected.length} dataset${
          selected.length > 1 ? 's' : ''
        } processed successfully.`
      );

      setSelected([]);

      if (ref.current) {
        ref.current.value = '';
      }
    } catch (error) {
      toast.error(
        error?.message ||
          'Unable to process files.'
      );
    } finally {
      setBusy(false);
    }
  };

  const removeDataset = async (event, file) => {
    event.stopPropagation();

    const confirmed = window.confirm(
      `Delete "${file.name}"?\n\nThis removes the dataset, transaction analysis, review decisions and linked investigation cases from the workspace.`
    );

    if (!confirmed) return;

    const id = String(file.id);

    setDeletingId(id);

    try {
      await deleteFile(id);

      if (
        active &&
        String(active.id) === id
      ) {
        setActive(null);
      }

      toast.success(
        `${file.name} deleted.`
      );
    } catch (error) {
      toast.error(
        error?.message ||
          'Unable to delete dataset.'
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="page data-upload-shell">

      {/* HEADER */}
      <header className="data-upload-heading">

        <div>

          <p className="page-kicker">
            TRANSACTION WORKSPACE
          </p>

          <h1 className="page-title">
            Data Upload
          </h1>

          <p className="page-subtitle">
            Import CSV transaction data. Fintel validates
            the file, stores its integrity fingerprint and
            runs the analysis pipeline.
          </p>

        </div>

      </header>

      {/* IMPORT + LIBRARY */}
      <div className="data-upload-grid">

        {/* IMPORT */}
        <article className="panel data-upload-import">

          <div className="data-upload-card-head">

            <div className="data-upload-head-icon">
              <UploadCloud size={18} />
            </div>

            <div>

              <h2>
                Import data
              </h2>

              <p>
                CSV files only · multiple files supported
              </p>

            </div>

          </div>

          <label className="data-upload-dropzone">

            <input
              ref={ref}
              type="file"
              accept=".csv,text/csv"
              multiple
              hidden
              onChange={(event) => {
                setSelected(
                  Array.from(
                    event.target.files || []
                  )
                );
              }}
            />

            <UploadCloud size={28} />

            <strong>
              Choose CSV files
            </strong>

            <span>
              Select one or more files for processing
            </span>

            <small>
              Click anywhere in this area to browse
            </small>

          </label>

          {selected.length > 0 && (
            <div className="data-upload-selected">

              <div className="data-upload-selected-head">
                <span>
                  Files ready for processing
                </span>

                <strong>
                  {selected.length}
                </strong>
              </div>

              {selected.map((file) => (
                <div
                  key={`${file.name}-${file.size}`}
                  className="data-upload-selected-row"
                >

                  <div className="data-upload-file-icon">
                    <FileText size={14} />
                  </div>

                  <span>
                    {file.name}
                  </span>

                  <small>
                    {(file.size / 1024).toFixed(0)} KB
                  </small>

                </div>
              ))}

            </div>
          )}

          <button
            type="button"
            className="button-primary data-upload-process-button"
            disabled={
              busy ||
              loading ||
              !selected.length
            }
            onClick={upload}
          >
            {busy
              ? 'Processing files…'
              : 'Process selected files'}
          </button>

        </article>

        {/* DATASET LIBRARY */}
        <article className="panel data-upload-library">

          <div className="data-upload-library-head">

            <div>

              <p className="page-kicker">
                DATA REGISTER
              </p>

              <h2>
                Dataset library
              </h2>

              <p>
                Select a dataset to inspect its
                profile and transaction preview.
              </p>

            </div>

            <span className="data-upload-count">
              {files.length}
              <small>
                {files.length === 1
                  ? '    dataset'
                  : '    datasets'}
              </small>
            </span>

          </div>

          {!files.length ? (
            <div className="data-upload-empty">

              <div className="data-upload-empty-icon">
                <Database size={23} />
              </div>

              <strong>
                No datasets yet
              </strong>

              <p>
                Process a CSV file to create your
                first persistent dataset record.
              </p>

            </div>
          ) : (
            <div className="data-upload-list">

              {files.map((file) => {

                const id = String(file.id);

                const isActive =
                  String(active?.id) === id;

                const isDeleting =
                  String(deletingId || '') === id;

                return (
                  <div
                    key={id}
                    className={`data-upload-row ${
                      isActive
                        ? 'data-upload-row-active'
                        : ''
                    }`}
                    onClick={() =>
                      !isDeleting &&
                      setActive(file)
                    }
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (
                        event.key === 'Enter' ||
                        event.key === ' '
                      ) {
                        event.preventDefault();
                        setActive(file);
                      }
                    }}
                  >

                    <div className="data-upload-row-icon">
                      <FileText size={16} />
                    </div>

                    <div className="data-upload-row-copy">

                      <strong>
                        {file.name}
                      </strong>

                      <span>
                        {Number(
                          file.totalTransactions || 0
                        ).toLocaleString()}{' '}
                        records
                        <i />
                        {file.headers?.length || 0}{' '}
                        fields
                      </span>

                    </div>

                    <div className="data-upload-row-date">

                      {file.createdAt
                        ? new Date(
                            file.createdAt
                          ).toLocaleDateString(
                            'en-IN',
                            {
                              day: '2-digit',
                              month: 'short',
                            }
                          )
                        : '—'}

                    </div>

                    <button
                      type="button"
                      className="data-upload-delete"
                      title={`Delete ${file.name}`}
                      aria-label={`Delete ${file.name}`}
                      disabled={isDeleting}
                      onClick={(event) =>
                        removeDataset(
                          event,
                          file
                        )
                      }
                    >
                      {isDeleting ? (
                        <span className="delete-spinner" />
                      ) : (
                        <Trash2 size={15} />
                      )}
                    </button>

                  </div>
                );
              })}

            </div>
          )}

        </article>

      </div>

      {/* DETAIL */}
      {active && (
        <DatasetDetail
          file={active}
          onClose={() =>
            setActive(null)
          }
        />
      )}

    </section>
  );
}

function DatasetDetail({
  file,
  onClose,
}) {
  const headers =
    file.headers || [];

  const rows =
    file.rows || [];

  return (
    <article className="panel data-upload-detail">

      <div className="data-upload-detail-head">

        <div>

          <p className="page-kicker">
            DATASET DETAIL
          </p>

          <h2>
            {file.name}
          </h2>

          <p>
            Dataset profile and transaction preview
          </p>

        </div>

        <button
          type="button"
          className="button-secondary"
          onClick={onClose}
        >
          <X size={14} />
          Close
        </button>

      </div>

      <div className="data-upload-detail-stats">

        <DetailStat
          label="Records"
          value={Number(
            file.totalTransactions || 0
          ).toLocaleString()}
        />

        <DetailStat
          label="Fields"
          value={headers.length}
        />

        <DetailStat
          label="Amount field"
          value={
            file.numericField ||
            'Not detected'
          }
        />

        <DetailStat
          label="Integrity"
          value="SHA-256 stored"
          positive
        />

      </div>

      <div className="data-upload-preview">

        <div className="data-upload-preview-title">

          <div>
            <h3>
              Record preview
            </h3>

            <p>
              First 8 records · first 10 fields
            </p>
          </div>

        </div>

        <div className="data-upload-preview-table">

          <table className="data-table">

            <thead>

              <tr>

                {headers
                  .slice(0, 10)
                  .map((header) => (
                    <th key={header}>
                      {header}
                    </th>
                  ))}

              </tr>

            </thead>

            <tbody>

              {rows
                .slice(0, 8)
                .map((row, index) => (
                  <tr key={index}>

                    {headers
                      .slice(0, 10)
                      .map((header) => (
                        <td key={header}>
                          {String(
                            row[header] ?? ''
                          )}
                        </td>
                      ))}

                  </tr>
                ))}

            </tbody>

          </table>

        </div>

      </div>

    </article>
  );
}

function DetailStat({
  label,
  value,
  positive = false,
}) {
  return (
    <div className="data-upload-detail-stat">

      <span>
        {label}
      </span>

      <strong
        className={
          positive
            ? 'value-positive'
            : ''
        }
      >

        {positive && (
          <CheckCircle2 size={14} />
        )}

        {value}

      </strong>

    </div>
  );
}