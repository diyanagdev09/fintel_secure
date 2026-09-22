const numeric = (value) => {
  const n = Number(String(value ?? '').replace(/[₹$€£,\s]/g, ''));
  return Number.isFinite(n) ? n : null;
};

export const compare = (actual, operator, expected) => {
  const aNum = numeric(actual);
  const eNum = numeric(expected);
  const numericMode = aNum !== null && eNum !== null;
  const a = numericMode ? aNum : String(actual ?? '').toLowerCase();
  const e = numericMode ? eNum : String(expected ?? '').toLowerCase();
  if (operator === 'gt') return a > e;
  if (operator === 'gte') return a >= e;
  if (operator === 'lt') return a < e;
  if (operator === 'lte') return a <= e;
  if (operator === 'eq') return a === e;
  if (operator === 'neq') return a !== e;
  if (operator === 'contains') return String(a).includes(String(e));
  return false;
};

export const evaluateRule = (rows = [], rule = {}) => rows.reduce((acc, row, index) => {
  if (compare(row[rule.field], rule.operator, rule.value)) acc.push({ index, row });
  return acc;
}, []);
