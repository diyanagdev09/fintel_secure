export const generateInsights = ({ rows = [], headers = [], riskAnalysis = null }) => {
  const insights = [];
  const amountField = riskAnalysis?.amountField;
  const categoryField = riskAnalysis?.categoryField;
  const dateField = riskAnalysis?.dateField;

  if (amountField) {
    const amounts = rows.map((r) => Number(String(r[amountField] ?? '').replace(/[₹$€£,\s]/g, ''))).filter(Number.isFinite);
    if (amounts.length) {
      const total = amounts.reduce((a, b) => a + b, 0);
      const average = total / amounts.length;
      insights.push({ title: 'Transaction value', detail: `Average ${average.toFixed(2)} across ${amounts.length.toLocaleString()} numeric records.`, type: 'metric' });
    }
  }

  if (categoryField) {
    const counts = {};
    rows.forEach((r) => { const key = String(r[categoryField] ?? 'Unknown'); counts[key] = (counts[key] || 0) + 1; });
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    if (top) insights.push({ title: 'Leading category', detail: `${top[0]} accounts for ${top[1].toLocaleString()} records.`, type: 'pattern' });
  }

  if (riskAnalysis) {
    insights.push({ title: 'Risk distribution', detail: `${riskAnalysis.counts.HIGH} high, ${riskAnalysis.counts.MEDIUM} medium and ${riskAnalysis.counts.LOW} low-risk records.`, type: 'risk' });
  }

  if (dateField) {
    const dates = rows.map((r) => new Date(r[dateField])).filter((d) => !Number.isNaN(d.valueOf()));
    if (dates.length) {
      dates.sort((a, b) => a - b);
      insights.push({ title: 'Observed period', detail: `${dates[0].toLocaleDateString()} to ${dates[dates.length - 1].toLocaleDateString()}.`, type: 'period' });
    }
  }

  return insights.slice(0, 5);
};
