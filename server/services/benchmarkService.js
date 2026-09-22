import { performance } from 'node:perf_hooks';

const parseNumber = (value) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const cleaned = String(value)
    .replace(/₹/g, '')
    .replace(/,/g, '')
    .replace(/[^\d.-]/g, '');

  const number = Number(cleaned);

  return Number.isFinite(number)
    ? number
    : null;
};

const processRow = (row, headers) => {
  let numericTotal = 0;
  let numericFields = 0;
  let textLength = 0;

  for (const header of headers) {
    const value = row?.[header];

    const number = parseNumber(value);

    if (number != null) {
      numericTotal += number;
      numericFields += 1;
    } else if (value != null) {
      textLength += String(value).length;
    }
  }

  return (
    numericTotal +
    numericFields * 0.001 +
    textLength * 0.000001
  );
};

const sequentialProcess = (rows, headers) => {
  let checksum = 0;

  for (const row of rows) {
    checksum += processRow(row, headers);
  }

  return checksum;
};

const parallelProcess = async (
  rows,
  headers
) => {
  const cpuCount =
    typeof navigator === 'undefined'
      ? 4
      : navigator.hardwareConcurrency || 4;

  const chunkCount = Math.min(
    Math.max(cpuCount, 2),
    8,
    Math.max(rows.length, 1)
  );

  const chunkSize = Math.ceil(
    rows.length / chunkCount
  );

  const chunks = [];

  for (
    let start = 0;
    start < rows.length;
    start += chunkSize
  ) {
    chunks.push(
      rows.slice(
        start,
        start + chunkSize
      )
    );
  }

  /*
   * Promise.all is intentionally used here because this is
   * the application's parallel-processing benchmark.
   *
   * The actual upload analysis itself is no longer repeated
   * inside this benchmark.
   */
  const results = await Promise.all(
    chunks.map(
      async (chunk) => {
        let checksum = 0;

        for (const row of chunk) {
          checksum += processRow(
            row,
            headers
          );
        }

        return checksum;
      }
    )
  );

  return results.reduce(
    (sum, value) => sum + value,
    0
  );
};

export const benchmarkRows = async (
  rows = [],
  headers = []
) => {
  const safeRows = Array.isArray(rows)
    ? rows
    : [];

  const safeHeaders = Array.isArray(headers)
    ? headers
    : [];

  /*
   * Do not benchmark enormous datasets with a
   * pointless duplicate full analysis.
   *
   * We still process every row, but the operation is
   * intentionally lightweight.
   */

  const sequentialStart =
    performance.now();

  const sequentialChecksum =
    sequentialProcess(
      safeRows,
      safeHeaders
    );

  const sequentialTime =
    performance.now() -
    sequentialStart;

  const parallelStart =
    performance.now();

  const parallelChecksum =
    await parallelProcess(
      safeRows,
      safeHeaders
    );

  const parallelTime =
    performance.now() -
    parallelStart;

  /*
   * Prevent the optimizer/runtime from treating the
   * calculations as irrelevant.
   */
  const checksumDifference = Math.abs(
    sequentialChecksum -
      parallelChecksum
  );

  return {
    sequentialTime: Number(
      Math.max(
        sequentialTime,
        0.01
      ).toFixed(2)
    ),

    parallelTime: Number(
      Math.max(
        parallelTime,
        0.01
      ).toFixed(2)
    ),

    benchmarkChecksum: Number(
      sequentialChecksum.toFixed(4)
    ),

    benchmarkVerified:
      checksumDifference < 0.01,
  };
};

export default benchmarkRows;