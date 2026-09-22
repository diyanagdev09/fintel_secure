import { useMemo, useState } from 'react';
import {
  BarChart3,
  CalendarDays,
  ChevronDown,
  Database,
  FileSearch,
  Hash,
  Tag,
  TrendingUp,
} from 'lucide-react';
import { useData } from '../context/DataContext.jsx';

const toNumber = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(String(value).replace(/[₹$€£,\s%]/g, ''));
  return Number.isFinite(n) ? n : null;
};

const money = (value) => {
  if (!Number.isFinite(value)) return '—';
  return `₹${value.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const compactMoney = (value) => {
  if (!Number.isFinite(value)) return '—';
  if (Math.abs(value) >= 10000000) return `₹${(value / 10000000).toFixed(2)}Cr`;
  if (Math.abs(value) >= 100000) return `₹${(value / 100000).toFixed(2)}L`;
  if (Math.abs(value) >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value.toFixed(2)}`;
};

const shortDate = (value) => {
  const d = new Date(value);
  if (Number.isNaN(d.valueOf())) return String(value);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
};

function aggregateSeries(labels = [], values = [], maxPoints = 60) {
  if (!labels.length) return [];
  if (labels.length <= maxPoints) {
    return labels.map((label, i) => ({ label, value: Number(values[i] || 0) }));
  }

  const bucketSize = Math.ceil(labels.length / maxPoints);
  const result = [];

  for (let start = 0; start < labels.length; start += bucketSize) {
    const end = Math.min(start + bucketSize, labels.length);
    let total = 0;
    for (let i = start; i < end; i += 1) total += Number(values[i] || 0);
    result.push({ label: labels[end - 1], value: total });
  }

  return result;
}

function pointCoordinates(points, width = 900, height = 270, padding = 28) {
  if (!points.length) return [];
  const vals = points.map((p) => p.value);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;

  return points.map((point, index) => ({
    ...point,
    x: padding + (index / Math.max(points.length - 1, 1)) * (width - padding * 2),
    y: height - padding - ((point.value - min) / range) * (height - padding * 2),
  }));
}

function linePath(points) {
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');
}

function areaPath(points, height = 270, padding = 28) {
  if (!points.length) return '';
  const first = points[0];
  const last = points[points.length - 1];
  return `${linePath(points)} L ${last.x.toFixed(2)} ${height - padding} L ${first.x.toFixed(2)} ${height - padding} Z`;
}

function MiniLineChart({ points, moneyAxis = false }) {
  const width = 900;
  const height = 270;
  const padding = 28;
  const coords = pointCoordinates(points, width, height, padding);

  if (!coords.length) {
    return (
      <div className="insights-no-chart">
        <BarChart3 size={24} />
        <strong>No usable date data</strong>
        <span>A valid date field is required for this visual.</span>
      </div>
    );
  }

  const values = points.map((p) => p.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const mid = (max + min) / 2;

  const yText = (v) => (moneyAxis ? compactMoney(v) : Math.round(v).toLocaleString('en-IN'));
  const labelIndexes = [0, Math.floor((points.length - 1) / 2), points.length - 1];

  return (
    <div className="insights-chart-inner">
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id={moneyAxis ? 'insightsValueFill' : 'insightsVolumeFill'} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#2c9bdf" stopOpacity="0.34" />
            <stop offset="100%" stopColor="#2c9bdf" stopOpacity="0.015" />
          </linearGradient>
        </defs>

        {[0, 1, 2, 3, 4].map((row) => {
          const y = padding + (row / 4) * (height - padding * 2);
          return <line key={row} x1={padding} x2={width - padding} y1={y} y2={y} className="insights-grid-line" />;
        })}

        <path d={areaPath(coords, height, padding)} className="insights-area" />
        <path d={linePath(coords)} className="insights-line" />

        {coords.map((p, i) => (
          <circle key={`${p.label}-${i}`} cx={p.x} cy={p.y} r={i % Math.max(1, Math.floor(coords.length / 18)) === 0 ? 2.8 : 0} className="insights-point" />
        ))}
      </svg>

      <div className="insights-y-labels">
        <span>{yText(max)}</span>
        <span>{yText(mid)}</span>
        <span>{yText(min)}</span>
      </div>

      <div className="insights-x-labels">
        {labelIndexes.map((index) => (
          <span key={index}>{shortDate(points[index].label)}</span>
        ))}
      </div>
    </div>
  );
}

function Metric({ icon, label, value, note }) {
  return (
    <div className="insights-metric">
      <div className="insights-metric-icon">{icon}</div>
      <div className="insights-metric-copy">
        <span>{label}</span>
        <strong>{value}</strong>
        {note ? <small>{note}</small> : null}
      </div>
    </div>
  );
}

function FieldRow({ icon, label, value }) {
  return (
    <div className="insights-field-row">
      <div className="insights-field-icon">{icon}</div>
      <span>{label}</span>
      <strong title={value}>{value || 'Not detected'}</strong>
    </div>
  );
}

function RiskBar({ label, count, total, type }) {
  const pct = total ? (count / total) * 100 : 0;
  return (
    <div className="insights-risk-row">
      <div className="insights-risk-head">
        <div className="insights-risk-name">
          <span className={`insights-risk-dot ${type}`} />
          {label}
        </div>
        <strong>{count.toLocaleString('en-IN')} <small>{pct.toFixed(1)}%</small></strong>
      </div>
      <div className="insights-risk-track">
        <span className={`insights-risk-fill ${type}`} style={{ width: `${Math.max(pct, count ? 1.5 : 0)}%` }} />
      </div>
    </div>
  );
}

export default function VisualizationPage() {
  const { files = [] } = useData();
  const [selectedId, setSelectedId] = useState(files[0]?.id || '');
  const file = files.find((item) => String(item.id) === String(selectedId)) || files[0];

  const profile = useMemo(() => {
    if (!file) return null;

    const rows = Array.isArray(file.rows) ? file.rows : [];
    const headers = Array.isArray(file.headers) ? file.headers : [];
    const amountField = file.numericField;
    const amounts = rows.map((r) => toNumber(amountField ? r[amountField] : null)).filter((v) => v !== null);
    const totalValue = amounts.reduce((a, b) => a + b, 0);

    const riskCounts = {
      HIGH: Number(file.riskAnalysis?.counts?.HIGH) || 0,
      MEDIUM: Number(file.riskAnalysis?.counts?.MEDIUM) || 0,
      LOW: Number(file.riskAnalysis?.counts?.LOW) || 0,
    };

    const volumeSeries = aggregateSeries(file.dateTrend?.labels || [], file.dateTrend?.values || [], 60);

    // Build a real value-over-time series from the actual rows, rather than repeating the record count.
    const valueByDate = {};
    if (file.dateField && amountField) {
      rows.forEach((row) => {
        const d = new Date(row[file.dateField]);
        const amount = toNumber(row[amountField]);
        if (Number.isNaN(d.valueOf()) || amount === null) return;
        const key = d.toISOString().slice(0, 10);
        valueByDate[key] = (valueByDate[key] || 0) + amount;
      });
    }

    const valueLabels = Object.keys(valueByDate).sort();
    const valueSeries = aggregateSeries(valueLabels, valueLabels.map((d) => valueByDate[d]), 60);

    const categoryRows = file.categoryCounts?.labels?.map((label, i) => ({
      label,
      count: Number(file.categoryCounts.values?.[i]) || 0,
    })).sort((a, b) => b.count - a.count).slice(0, 6) || [];

    const populated = rows.reduce((sum, row) => sum + headers.filter((h) => String(row?.[h] ?? '').trim() !== '').length, 0);
    const totalCells = rows.length * headers.length;

    return {
      rows: rows.length,
      fields: headers.length,
      totalValue,
      average: amounts.length ? totalValue / amounts.length : null,
      minimum: amounts.length ? Math.min(...amounts) : null,
      maximum: amounts.length ? Math.max(...amounts) : null,
      riskCounts,
      highRiskPercentage: rows.length ? (riskCounts.HIGH / rows.length) * 100 : 0,
      completeness: totalCells ? (populated / totalCells) * 100 : 0,
      volumeSeries,
      valueSeries,
      categoryRows,
      amountField,
      dateField: file.dateField,
      categoryField: file.categoryField,
      rowsPreview: rows.slice(0, 8),
      headers,
    };
  }, [file]);

  if (!file) {
    return (
      <section className="page insights-page">
        <style>{INSIGHTS_STYLES}</style>
        <div className="insights-empty">
          <div className="insights-empty-icon"><FileSearch size={26} /></div>
          <h1>No dataset selected</h1>
          <p>Upload a CSV dataset from Data Upload to open the Insights workspace.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="page insights-page">
      <style>{INSIGHTS_STYLES}</style>

      <header className="insights-header">
        <div className="insights-heading">
          <div className="insights-kicker">DATASET INTELLIGENCE</div>
          <h1>Insights</h1>
          <p>Analytical view of the selected transaction dataset.</p>
        </div>

        <div className="insights-selector">
          <label htmlFor="insights-dataset">Select dataset</label>
          <div className="insights-select-wrap">
            <Database size={16} />
            <select id="insights-dataset" value={file.id} onChange={(e) => setSelectedId(e.target.value)}>
              {files.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}
            </select>
            <ChevronDown size={15} />
          </div>
        </div>
      </header>

      <section className="insights-summary">
        <div className="insights-summary-title">Dataset summary</div>
        <div className="insights-summary-grid">
          <div className="insights-summary-file">
            <span>SELECTED DATASET</span>
            <strong title={file.name}>{file.name}</strong>
          </div>
          <Metric icon={<Database size={17} />} label="Records analysed" value={profile.rows.toLocaleString('en-IN')} />
          <Metric icon={<span>₹</span>} label="Total value" value={compactMoney(profile.totalValue)} note="Across detected amounts" />
          <Metric icon={<TrendingUp size={17} />} label="Average value" value={compactMoney(profile.average)} note="Average transaction" />
          <Metric icon={<Hash size={16} />} label="High risk" value={`${profile.highRiskPercentage.toFixed(1)}%`} note="Of records" />
          <Metric icon={<BarChart3 size={17} />} label="Completeness" value={`${profile.completeness.toFixed(0)}%`} note="Populated cells" />
        </div>
      </section>

      {/* VISUAL 1 — transaction volume */}
      <div className="insights-main-grid">
        <section className="insights-card insights-chart-card">
          <div className="insights-card-header">
            <div>
              <div className="insights-card-kicker">ACTIVITY</div>
              <h2>Transaction volume over time</h2>
              <p>Actual record count grouped by the detected date field.</p>
            </div>
            <div className="insights-chart-control"><BarChart3 size={15} /> Records <ChevronDown size={14} /></div>
          </div>
          <div className="insights-chart">
            {profile.volumeSeries.length ? <MiniLineChart points={profile.volumeSeries} /> : <div className="insights-no-chart"><BarChart3 size={24} /><strong>No usable date data</strong><span>A valid date field is required for the timeline.</span></div>}
          </div>
        </section>

        <section className="insights-card">
          <div className="insights-card-header">
            <div>
              <div className="insights-card-kicker">DATA FIELDS</div>
              <h2>Detected fields</h2>
              <p>Fields detected in the dataset.</p>
            </div>
          </div>
          <div className="insights-field-list">
            <FieldRow icon={<span>₹</span>} label="AMOUNT FIELD" value={profile.amountField} />
            <FieldRow icon={<CalendarDays size={16} />} label="DATE FIELD" value={profile.dateField} />
            <FieldRow icon={<Tag size={16} />} label="CATEGORY FIELD" value={profile.categoryField} />
            <FieldRow icon={<Database size={16} />} label="TRANSACTIONS" value={`${profile.rows.toLocaleString('en-IN')} records`} />
          </div>
        </section>
      </div>

      {/* VISUAL 2 — transaction value */}
      <section className="insights-card insights-wide-chart">
        <div className="insights-card-header">
          <div>
            <div className="insights-card-kicker">VALUE FLOW</div>
            <h2>Transaction value over time</h2>
            <p>Total transaction amount grouped by date. This uses the actual detected amount field.</p>
          </div>
          <div className="insights-value-total">{compactMoney(profile.totalValue)} <span>total</span></div>
        </div>
        <div className="insights-chart insights-chart-value">
          {profile.valueSeries.length ? <MiniLineChart points={profile.valueSeries} moneyAxis /> : <div className="insights-no-chart"><TrendingUp size={24} /><strong>No amount/date combination available</strong><span>The dataset needs both a numeric amount field and a valid date field.</span></div>}
        </div>
      </section>

      <div className="insights-lower-grid">
        {/* VISUAL 3 — risk */}
        <section className="insights-card">
          <div className="insights-card-header">
            <div>
              <div className="insights-card-kicker">RISK PROFILE</div>
              <h2>Risk distribution</h2>
              <p>Distribution of transaction risk levels.</p>
            </div>
          </div>
          <div className="insights-risk-list">
            <RiskBar label="Low Risk" count={profile.riskCounts.LOW} total={profile.rows} type="low" />
            <RiskBar label="Medium Risk" count={profile.riskCounts.MEDIUM} total={profile.rows} type="medium" />
            <RiskBar label="High Risk" count={profile.riskCounts.HIGH} total={profile.rows} type="high" />
          </div>
        </section>

        {/* VISUAL 4 — category mix */}
        <section className="insights-card">
          <div className="insights-card-header">
            <div>
              <div className="insights-card-kicker">COMPOSITION</div>
              <h2>Category mix</h2>
              <p>Most frequent values in the detected category field.</p>
            </div>
          </div>
          <div className="insights-category-list">
            {profile.categoryRows.length ? profile.categoryRows.map((item, index) => {
              const max = profile.categoryRows[0]?.count || 1;
              const width = (item.count / max) * 100;
              return (
                <div className="insights-category-row" key={item.label}>
                  <div className="insights-category-rank">{String(index + 1).padStart(2, '0')}</div>
                  <div className="insights-category-name">
                    <span title={item.label}>{item.label}</span>
                    <div className="insights-category-track"><span style={{ width: `${width}%` }} /></div>
                  </div>
                  <strong>{item.count.toLocaleString('en-IN')}</strong>
                </div>
              );
            }) : <div className="insights-no-category"><Tag size={19} /><span>No category field detected in this dataset.</span></div>}
          </div>
        </section>
      </div>

      {/* EXTRA DATA SUMMARY */}
      <section className="insights-card insights-bottom-card">
        <div className="insights-card-header">
          <div>
            <div className="insights-card-kicker">KEY METRICS</div>
            <h2>Dataset statistics</h2>
            <p>Useful reference values calculated directly from the selected file.</p>
          </div>
        </div>
        <div className="insights-stat-grid">
          <div><span>MINIMUM VALUE</span><strong>{money(profile.minimum)}</strong></div>
          <div><span>MAXIMUM VALUE</span><strong>{money(profile.maximum)}</strong></div>
          <div><span>FIELDS</span><strong>{profile.fields}</strong></div>
          <div><span>HIGH-RISK RECORDS</span><strong>{profile.riskCounts.HIGH}</strong></div>
        </div>
      </section>
    </section>
  );
}

const INSIGHTS_STYLES = `
.insights-page{width:100%;max-width:100%;box-sizing:border-box;padding:32px 36px 58px;color:#e8f0f5}.insights-page *,.insights-page *:before,.insights-page *:after{box-sizing:border-box}.insights-header{display:flex;align-items:flex-end;justify-content:space-between;gap:28px;padding-bottom:24px;border-bottom:1px solid #172733}.insights-kicker,.insights-card-kicker{color:#2999df;font-size:10px;font-weight:750;letter-spacing:.12em;line-height:1.2}.insights-heading h1{margin:8px 0 7px;color:#f2f6f8;font-size:35px;font-weight:700;line-height:1.05;letter-spacing:-.035em}.insights-heading p{margin:0;color:#6f8ca3;font-size:12px}.insights-selector{width:390px;flex:0 0 390px}.insights-selector label{display:block;margin-bottom:7px;color:#7190a7;font-size:10px;font-weight:600}.insights-select-wrap{position:relative;display:flex;align-items:center;height:42px;padding:0 12px;gap:9px;border:1px solid #203443;border-radius:6px;background:#0b131b;color:#86a9c1}.insights-select-wrap select{width:100%;height:100%;border:0;outline:0;appearance:none;background:transparent;color:#dce7ed;font-size:11px;cursor:pointer}.insights-select-wrap select option{background:#0c141c;color:#e5edf2}.insights-select-wrap>svg:last-child{pointer-events:none;color:#668399}.insights-summary{margin-top:21px;padding:17px 18px 18px;border:1px solid #1b2c3a;border-radius:8px;background:linear-gradient(135deg,rgba(20,43,57,.42),rgba(10,18,26,.92))}.insights-summary-title{margin-bottom:15px;color:#dce7ed;font-size:13px;font-weight:700}.insights-summary-grid{display:grid;grid-template-columns:minmax(175px,1.25fr) repeat(5,minmax(120px,1fr));min-width:0}.insights-summary-file,.insights-metric{min-width:0;min-height:72px;padding:8px 17px;border-left:1px solid #20303c}.insights-summary-file{border-left:0;padding-left:2px}.insights-summary-file span,.insights-metric-copy span{display:block;margin-bottom:7px;color:#65839a;font-size:9px;font-weight:650;letter-spacing:.07em;text-transform:uppercase}.insights-summary-file strong{display:block;max-width:200px;overflow:hidden;color:#e7eef2;font-size:12px;font-weight:650;text-overflow:ellipsis;white-space:nowrap}.insights-metric{display:flex;align-items:flex-start;gap:10px}.insights-metric-icon{display:grid;flex:0 0 31px;width:31px;height:31px;place-items:center;border:1px solid #203b4e;border-radius:5px;background:rgba(20,72,101,.18);color:#55aee2;font-size:15px}.insights-metric-copy{min-width:0}.insights-metric-copy strong{display:block;color:#f0f5f7;font-size:16px;font-weight:700;line-height:1.15}.insights-metric-copy small{display:block;margin-top:4px;color:#607c91;font-size:9px}.insights-main-grid{display:grid;grid-template-columns:minmax(0,1.75fr) minmax(310px,.85fr);gap:18px;margin-top:18px}.insights-lower-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:18px;margin-top:18px}.insights-card{min-width:0;overflow:hidden;border:1px solid #1b2c3a;border-radius:8px;background:#0b131b}.insights-card-header{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;padding:18px 20px 16px;border-bottom:1px solid #172733}.insights-card-header h2{margin:5px 0 5px;color:#eaf1f4;font-size:17px;font-weight:700;line-height:1.25}.insights-card-header p{margin:0;color:#69869b;font-size:10px;line-height:1.5}.insights-chart-control{display:flex;flex:0 0 auto;align-items:center;gap:7px;height:35px;padding:0 10px;border:1px solid #203443;border-radius:5px;background:#0d1821;color:#9ab0bf;font-size:10px}.insights-chart{position:relative;height:310px;padding:15px 20px 26px}.insights-chart-inner{position:relative;width:100%;height:100%}.insights-chart-inner svg{display:block;width:100%;height:270px;overflow:visible}.insights-grid-line{stroke:#172833;stroke-width:1}.insights-area{fill:url(#insightsVolumeFill)}.insights-chart-value .insights-area{fill:url(#insightsValueFill)}.insights-line{fill:none;stroke:#2c9bdf;stroke-width:2.4;vector-effect:non-scaling-stroke}.insights-point{fill:#a7dcf7}.insights-y-labels{position:absolute;top:18px;bottom:48px;left:0;display:flex;flex-direction:column;justify-content:space-between;color:#4e697d;font-size:8px}.insights-x-labels{position:absolute;right:0;bottom:1px;left:30px;display:flex;justify-content:space-between;color:#506b7e;font-size:8px}.insights-no-chart{display:flex;height:100%;flex-direction:column;align-items:center;justify-content:center;gap:8px;color:#527087;text-align:center}.insights-no-chart strong{color:#9eb2bf;font-size:12px}.insights-no-chart span{max-width:330px;font-size:10px;line-height:1.5}.insights-wide-chart{margin-top:18px}.insights-value-total{flex:0 0 auto;color:#dcebf2;font-size:17px;font-weight:700}.insights-value-total span{margin-left:5px;color:#5e7b8f;font-size:9px;font-weight:500}.insights-chart-value{height:295px}.insights-field-list{padding:7px 20px 14px}.insights-field-row{display:grid;grid-template-columns:32px minmax(90px,1fr) minmax(90px,1fr);align-items:center;gap:10px;min-height:55px;border-bottom:1px solid #162630}.insights-field-row:last-child{border-bottom:0}.insights-field-icon{display:grid;width:30px;height:30px;place-items:center;border:1px solid #203a4b;border-radius:5px;background:rgba(24,77,105,.16);color:#5baedf;font-size:15px}.insights-field-row>span{color:#7893a5;font-size:9px;font-weight:650;letter-spacing:.05em}.insights-field-row strong{overflow:hidden;color:#dbe5ea;font-size:10px;font-weight:600;text-align:right;text-overflow:ellipsis;white-space:nowrap}.insights-risk-list{padding:20px}.insights-risk-row{margin-bottom:19px}.insights-risk-row:last-child{margin-bottom:0}.insights-risk-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}.insights-risk-name{display:flex;align-items:center;gap:8px;color:#a9bbc6;font-size:10px}.insights-risk-dot{width:7px;height:7px;border-radius:50%}.insights-risk-dot.low{background:#36c98b}.insights-risk-dot.medium{background:#e8b94e}.insights-risk-dot.high{background:#e45d69}.insights-risk-head strong{color:#dce6eb;font-size:11px}.insights-risk-head small{margin-left:7px;color:#617d90;font-size:9px;font-weight:500}.insights-risk-track{width:100%;height:7px;overflow:hidden;border-radius:99px;background:#15232d}.insights-risk-fill{display:block;height:100%;border-radius:inherit}.insights-risk-fill.low{background:#2fc488}.insights-risk-fill.medium{background:#d8ac43}.insights-risk-fill.high{background:#d95562}.insights-category-list{padding:7px 20px 15px}.insights-category-row{display:grid;grid-template-columns:34px minmax(0,1fr) 55px;align-items:center;gap:10px;min-height:51px;border-bottom:1px solid #162630}.insights-category-row:last-child{border-bottom:0}.insights-category-rank{color:#4d697c;font-size:9px;font-weight:700}.insights-category-name{min-width:0}.insights-category-name>span{display:block;overflow:hidden;margin-bottom:7px;color:#a9bbc6;font-size:10px;text-overflow:ellipsis;white-space:nowrap}.insights-category-track{height:4px;overflow:hidden;border-radius:5px;background:#15232d}.insights-category-track span{display:block;height:100%;border-radius:inherit;background:#268ccc}.insights-category-row>strong{color:#dbe6eb;font-size:10px;text-align:right}.insights-no-category{display:flex;min-height:180px;align-items:center;justify-content:center;flex-direction:column;gap:8px;color:#527087;font-size:10px;text-align:center}.insights-bottom-card{margin-top:18px}.insights-stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;padding:20px}.insights-stat-grid>div{padding:15px;border:1px solid #1b303f;border-radius:6px;background:#0d1821}.insights-stat-grid span{display:block;margin-bottom:8px;color:#648197;font-size:8px;font-weight:700;letter-spacing:.07em}.insights-stat-grid strong{display:block;color:#e7eff3;font-size:14px;font-weight:700}.insights-empty{min-height:430px;display:flex;flex-direction:column;align-items:center;justify-content:center;border:1px solid #1b2c3a;border-radius:8px;background:#0b131b;text-align:center}.insights-empty-icon{display:grid;width:52px;height:52px;place-items:center;border:1px solid #204055;border-radius:8px;background:rgba(22,89,124,.15);color:#4aa8dc}.insights-empty h1{margin:16px 0 6px;color:#dfe9ee;font-size:17px}.insights-empty p{max-width:360px;margin:0;color:#648095;font-size:11px;line-height:1.6}@media(max-width:1180px){.insights-page{padding:28px 24px 50px}.insights-summary-grid{grid-template-columns:minmax(160px,1.2fr) repeat(3,minmax(130px,1fr))}.insights-main-grid,.insights-lower-grid{grid-template-columns:1fr}}@media(max-width:800px){.insights-page{padding:22px 16px 40px}.insights-header{align-items:stretch;flex-direction:column}.insights-selector{width:100%;flex-basis:auto}.insights-summary-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.insights-summary-file{grid-column:1/-1;border-left:0}.insights-summary-grid .insights-metric{border-left:0;padding-left:2px}.insights-chart-control{display:none}.insights-field-row{grid-template-columns:32px minmax(90px,1fr)}.insights-field-row strong{grid-column:2;text-align:left}.insights-stat-grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:520px){.insights-summary-grid,.insights-stat-grid{grid-template-columns:1fr}.insights-summary-file{grid-column:auto}.insights-heading h1{font-size:30px}}
`;
