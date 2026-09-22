import crypto from 'node:crypto';
import Papa from 'papaparse';

export const parseCsvUpload = (file) => {
  const parsed = Papa.parse(file.buffer.toString('utf8'), { header: true, skipEmptyLines: true, dynamicTyping: true });
  if (parsed.errors?.length) throw new Error(`CSV parsing failed: ${parsed.errors[0].message || 'invalid row'}`);
  if (!parsed.meta.fields?.length || !parsed.data?.length) throw new Error('CSV must contain headers and at least one data row.');
  return {
    integrityHash: crypto.createHash('sha256').update(file.buffer).digest('hex'),
    headers: parsed.meta.fields.map((f) => String(f).trim()),
    rows: parsed.data,
  };
};
