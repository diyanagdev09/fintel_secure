const clamp = (value, min = 0, max = 100) =>
  Math.max(min, Math.min(max, Number(value) || 0));

const parseNumber = (value) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const cleaned = String(value)
    .replace(/₹/g, '')
    .replace(/,/g, '')
    .replace(/[^\d.-]/g, '');

  const number = Number(cleaned);

  return Number.isFinite(number) ? number : null;
};

const parseDate = (value) => {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
};

const median = (values) => {
  if (!values.length) return null;

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
};

const percentile = (value, sorted) => {
  if (value == null || !sorted.length) {
    return 50;
  }

  let low = 0;
  let high = sorted.length;

  while (low < high) {
    const middle = (low + high) >> 1;

    if (sorted[middle] <= value) {
      low = middle + 1;
    } else {
      high = middle;
    }
  }

  return (low / sorted.length) * 100;
};

const level = (score) => {
  if (score >= 70) return 'HIGH';
  if (score >= 40) return 'MEDIUM';
  return 'LOW';
};

const normalise = (value) =>
  String(value ?? '')
    .trim()
    .toLowerCase();

const detectField = (headers, rows, type) => {
  if (!headers?.length) return null;

  const aliases = {
    amount: [
      'amount',
      'transaction_amount',
      'transaction amount',
      'value',
      'price',
      'total',
      'spend',
      'payment',
    ],

    date: [
      'date',
      'transaction_date',
      'transaction date',
      'timestamp',
      'time',
      'datetime',
    ],

    entity: [
      'entity',
      'customer',
      'customer_id',
      'customer id',
      'account',
      'account_id',
      'user',
      'user_id',
      'merchant',
      'merchant_id',
      'client',
    ],

    category: [
      'category',
      'transaction_type',
      'transaction type',
      'type',
      'merchant_category',
      'merchant category',
    ],
  };

  const lowerHeaders = headers.map((header) => ({
    original: header,
    lower: normalise(header),
  }));

  for (const alias of aliases[type] || []) {
    const exact = lowerHeaders.find(
      (header) => header.lower === alias
    );

    if (exact) {
      return exact.original;
    }
  }

  const fuzzy = lowerHeaders.find((header) =>
    aliases[type]?.some((alias) =>
      header.lower.includes(alias)
    )
  );

  if (fuzzy) {
    return fuzzy.original;
  }

  /*
   * Small fallback for datasets whose column names are unusual.
   */
  if (type === 'amount') {
    const numericCandidate = headers.find((header) => {
      const sample = rows
        .slice(0, 30)
        .map((row) => parseNumber(row[header]))
        .filter((value) => value != null);

      return sample.length >= Math.max(3, rows.length ? 3 : 0);
    });

    if (numericCandidate) return numericCandidate;
  }

  return null;
};

const signature = (row) => {
  const keys = Object.keys(row || {}).sort();

  return keys
    .map((key) => `${key}:${String(row[key] ?? '')}`)
    .join('|');
};

const roundAmount = (amount) => {
  if (amount == null || amount <= 0) {
    return false;
  }

  if (amount >= 10000) {
    return amount % 1000 === 0;
  }

  if (amount >= 1000) {
    return amount % 500 === 0;
  }

  if (amount >= 100) {
    return amount % 100 === 0;
  }

  return false;
};

export const scoreTransactions = (
  rows = [],
  headers = []
) => {
  const safeRows = Array.isArray(rows) ? rows : [];

  const amountField = detectField(
    headers,
    safeRows,
    'amount'
  );

  const dateField = detectField(
    headers,
    safeRows,
    'date'
  );

  const entityField = detectField(
    headers,
    safeRows,
    'entity'
  );

  const categoryField = detectField(
    headers,
    safeRows,
    'category'
  );

  /*
   * ---------------------------------------------------------
   * PASS 1
   * Parse reusable values ONCE.
   * ---------------------------------------------------------
   */

  const parsedRows = safeRows.map((row, index) => {
    const amount = amountField
      ? parseNumber(row[amountField])
      : null;

    const date = dateField
      ? parseDate(row[dateField])
      : null;

    const entity = entityField
      ? normalise(row[entityField])
      : null;

    const category = categoryField
      ? normalise(row[categoryField])
      : null;

    return {
      index,
      row,
      amount,
      date,
      entity,
      category,
    };
  });

  /*
   * ---------------------------------------------------------
   * GLOBAL AMOUNT STATISTICS
   * ---------------------------------------------------------
   */

  const amounts = parsedRows
    .map((item) => item.amount)
    .filter((value) => value != null);

  const sortedAmounts = [...amounts].sort(
    (a, b) => a - b
  );

  const datasetMedian = median(amounts) || 0;

  /*
   * ---------------------------------------------------------
   * ENTITY INDEXES
   *
   * The old engine searched the complete entity list for
   * every transaction.
   *
   * This implementation builds everything once.
   * ---------------------------------------------------------
   */

  const entityStats = new Map();

  for (const item of parsedRows) {
    if (!item.entity) continue;

    let stats = entityStats.get(item.entity);

    if (!stats) {
      stats = {
        count: 0,
        amounts: [],
        categories: new Map(),
        timestamps: [],
        total: 0,
      };

      entityStats.set(item.entity, stats);
    }

    stats.count += 1;

    if (item.amount != null) {
      stats.amounts.push(item.amount);
      stats.total += item.amount;
    }

    if (item.category) {
      stats.categories.set(
        item.category,
        (stats.categories.get(item.category) || 0) + 1
      );
    }

    if (item.date) {
      stats.timestamps.push(item.date.getTime());
    }
  }

  /*
   * Convert entity amount arrays into median/MAD only once.
   */

  for (const stats of entityStats.values()) {
    const entityMedian = median(stats.amounts) || 0;

    const deviations = stats.amounts.map((amount) =>
      Math.abs(amount - entityMedian)
    );

    stats.median = entityMedian;

    /*
     * MAD = median absolute deviation.
     *
     * Never use zero as denominator.
     */
    stats.mad = Math.max(
      median(deviations) || 1,
      1
    );

    stats.dominantCategory =
      [...stats.categories.entries()]
        .sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  }

  /*
   * ---------------------------------------------------------
   * ENTITY + HOUR/DAY INDEX
   *
   * Used for O(1) velocity lookup instead of repeatedly
   * scanning all same-entity transactions.
   * ---------------------------------------------------------
   */

  const entityHourCounts = new Map();
  const entityDayCounts = new Map();

  const makeTimeKey = (entity, date, unit) => {
    if (!entity || !date) return null;

    const d = new Date(date);

    if (unit === 'hour') {
      d.setMinutes(0, 0, 0);
    } else {
      d.setHours(0, 0, 0, 0);
    }

    return `${entity}|${d.getTime()}`;
  };

  for (const item of parsedRows) {
    if (!item.entity || !item.date) continue;

    const hourKey = makeTimeKey(
      item.entity,
      item.date,
      'hour'
    );

    const dayKey = makeTimeKey(
      item.entity,
      item.date,
      'day'
    );

    entityHourCounts.set(
      hourKey,
      (entityHourCounts.get(hourKey) || 0) + 1
    );

    entityDayCounts.set(
      dayKey,
      (entityDayCounts.get(dayKey) || 0) + 1
    );
  }

  /*
   * ---------------------------------------------------------
   * DUPLICATE INDEX
   * ---------------------------------------------------------
   */

  const duplicateCounts = new Map();

  for (const item of parsedRows) {
    const sig = signature(item.row);

    duplicateCounts.set(
      sig,
      (duplicateCounts.get(sig) || 0) + 1
    );
  }

  /*
   * ---------------------------------------------------------
   * CATEGORY COUNTS
   * ---------------------------------------------------------
   */

  const categoryCounts = new Map();

  for (const item of parsedRows) {
    if (!item.category) continue;

    categoryCounts.set(
      item.category,
      (categoryCounts.get(item.category) || 0) + 1
    );
  }

  /*
   * ---------------------------------------------------------
   * FINAL SCORING
   * ---------------------------------------------------------
   */

  const transactions = parsedRows.map((item) => {
    const {
      index,
      row,
      amount,
      date,
      entity,
      category,
    } = item;

    const entityInfo = entity
      ? entityStats.get(entity)
      : null;

    const entityFrequency =
      entityInfo?.count || 1;

    const categoryFrequency =
      categoryCounts.get(category) || 1;

    const duplicateCount =
      duplicateCounts.get(signature(row)) || 1;

    const amountPercentile = percentile(
      amount,
      sortedAmounts
    );

    /*
     * 1. Dataset amount anomaly
     */
    let datasetAmountScore = 0;

    if (
      amount != null &&
      datasetMedian > 0
    ) {
      const ratio =
        Math.abs(amount - datasetMedian) /
        Math.max(datasetMedian, 1);

      datasetAmountScore = clamp(
        ratio * 18,
        0,
        22
      );
    }

    /*
     * 2. Entity anomaly
     */
    let entityDeviationScore = 0;
    let entityMedianAmount = null;
    let entityMad = null;
    let robustZ = null;

    if (
      entityInfo &&
      amount != null
    ) {
      entityMedianAmount =
        entityInfo.median;

      entityMad =
        entityInfo.mad;

      robustZ =
        0.6745 *
        (amount - entityInfo.median) /
        Math.max(entityInfo.mad, 1);

      /*
       * Require a meaningful entity history.
       *
       * This prevents a one-off transaction from becoming
       * a massive anomaly merely because it differs from
       * its own "median".
       */
      if (entityFrequency >= 5) {
        if (Math.abs(robustZ) >= 5) {
          entityDeviationScore = 20;
        } else if (Math.abs(robustZ) >= 3.5) {
          entityDeviationScore = 15;
        } else if (Math.abs(robustZ) >= 2.5) {
          entityDeviationScore = 9;
        } else if (Math.abs(robustZ) >= 2) {
          entityDeviationScore = 5;
        }
      }
    }

    /*
     * 3. Velocity
     */
    let sameEntityHour = 0;
    let sameEntityDay = 0;

    if (entity && date) {
      const hourKey = makeTimeKey(
        entity,
        date,
        'hour'
      );

      const dayKey = makeTimeKey(
        entity,
        date,
        'day'
      );

      sameEntityHour = Math.max(
        0,
        (entityHourCounts.get(hourKey) || 1) - 1
      );

      sameEntityDay = Math.max(
        0,
        (entityDayCounts.get(dayKey) || 1) - 1
      );
    }

    const velocityScore = clamp(
      sameEntityHour * 4 +
        Math.max(
          0,
          sameEntityDay - sameEntityHour
        ) *
          0.8,
      0,
      18
    );

    /*
     * 4. Rare entity
     */
    const rarityScore =
      entity
        ? entityFrequency === 1
          ? 5
          : entityFrequency <= 3
          ? 3
          : entityFrequency <= 7
          ? 1
          : 0
        : 0;

    /*
     * 5. Duplicate
     */
    const duplicateScore =
      duplicateCount > 1
        ? clamp(
            10 +
              (duplicateCount - 2) * 4,
            10,
            20
          )
        : 0;

    /*
     * 6. Timing
     */
    const weekend = date
      ? [0, 6].includes(date.getDay())
      : false;

    const offHours = date
      ? date.getHours() < 6 ||
        date.getHours() >= 22
      : false;

    const timingScore =
      (weekend ? 4 : 0) +
      (offHours ? 6 : 0);

    /*
     * 7. Category shift
     */
    let categoryShiftScore = 0;

    if (
      entityInfo &&
      category &&
      entityInfo.dominantCategory &&
      entityInfo.dominantCategory !== category &&
      entityInfo.count >= 5
    ) {
      categoryShiftScore = 7;
    }

    /*
     * 8. Concentration
     */
    const entityTotal =
      entityInfo?.total || null;

    const concentrationRatio =
      entityTotal &&
      amount != null
        ? amount /
          Math.max(entityTotal, 1)
        : null;

    const concentrationScore =
      concentrationRatio != null
        ? clamp(
            concentrationRatio * 8,
            0,
            10
          )
        : 0;

    /*
     * 9. Round amount
     */
    const isRound =
      roundAmount(amount);

    const roundScore =
      isRound ? 2 : 0;

    /*
     * 10. Invalid amount
     */
    const invalidAmountScore =
      amount != null &&
      amount <= 0
        ? 25
        : 0;

    const factors = [];

    if (invalidAmountScore) {
      factors.push({
        code: 'INVALID_AMOUNT',
        label:
          'Amount is zero or negative.',
        weight: invalidAmountScore,
      });
    }

    if (entityDeviationScore >= 15) {
      factors.push({
        code: 'ENTITY_AMOUNT_ANOMALY',
        label:
          `Amount is significantly different from this entity's historical pattern. Entity median: ${
            entityMedianAmount == null
              ? 'N/A'
              : entityMedianAmount.toFixed(2)
          }.`,
        weight: entityDeviationScore,
      });
    } else if (entityDeviationScore >= 5) {
      factors.push({
        code: 'ENTITY_DEVIATION',
        label:
          'Transaction differs from the entity’s normal amount pattern.',
        weight: entityDeviationScore,
      });
    }

    if (datasetAmountScore >= 10) {
      factors.push({
        code: 'AMOUNT_ANOMALY',
        label:
          `Transaction is near the extreme end of the dataset amount distribution (${Math.round(
            amountPercentile
          )}th percentile).`,
        weight: Math.round(datasetAmountScore),
      });
    }

    if (velocityScore >= 8) {
      factors.push({
        code: 'VELOCITY',
        label:
          `${sameEntityHour} related transaction${
            sameEntityHour === 1 ? '' : 's'
          } occurred within the same hour.`,
        weight: Math.round(velocityScore),
      });
    }

    if (duplicateScore) {
      factors.push({
        code: 'DUPLICATE',
        label:
          `Duplicate transaction pattern detected across ${duplicateCount} matching records.`,
        weight: duplicateScore,
      });
    }

    if (rarityScore >= 3) {
      factors.push({
        code: 'RARITY',
        label:
          'Entity activity is relatively rare within the uploaded dataset.',
        weight: rarityScore,
      });
    }

    if (categoryShiftScore) {
      factors.push({
        code: 'CATEGORY_SHIFT',
        label:
          'Transaction category differs from the entity’s dominant historical category.',
        weight: categoryShiftScore,
      });
    }

    if (concentrationScore >= 6) {
      factors.push({
        code: 'CONCENTRATION',
        label:
          'Transaction represents a meaningful share of this entity’s observed transaction value.',
        weight: Math.round(concentrationScore),
      });
    }

    if (timingScore >= 4) {
      factors.push({
        code: 'TIMING',
        label:
          weekend && offHours
            ? 'Weekend and off-hours activity detected.'
            : weekend
            ? 'Weekend transaction detected.'
            : 'Off-hours transaction detected.',
        weight: timingScore,
      });
    }

    if (roundScore) {
      factors.push({
        code: 'ROUND_AMOUNT',
        label:
          'Transaction uses a highly rounded amount.',
        weight: roundScore,
      });
    }

    factors.sort(
      (a, b) => b.weight - a.weight
    );

    /*
     * Weighted final score.
     *
     * Notice that no single signal can dominate the
     * complete score anymore.
     */
    const rawRisk =
      8 +
      entityDeviationScore +
      datasetAmountScore +
      velocityScore +
      duplicateScore +
      rarityScore +
      categoryShiftScore +
      concentrationScore +
      timingScore +
      roundScore +
      invalidAmountScore;

    const riskScore = Math.round(
      clamp(rawRisk)
    );

    const anomalyScore = Math.round(
      clamp(
        entityDeviationScore * 1.05 +
          datasetAmountScore * 0.9 +
          velocityScore * 1.1 +
          duplicateScore * 1.05 +
          rarityScore +
          categoryShiftScore * 1.05 +
          concentrationScore +
          timingScore * 0.9 +
          invalidAmountScore * 1.15
      )
    );

    const availableSignals = [
      amount != null,
      date != null,
      entity != null,
      category != null,
      duplicateCount > 1,
      sameEntityDay > 0,
    ].filter(Boolean).length;

    const confidence = Math.round(
      clamp(40 + availableSignals * 9)
    );

    if (!factors.length) {
      factors.push({
        code: 'BASELINE',
        label:
          'Transaction broadly aligns with the observed dataset and entity pattern.',
        weight: 0,
      });
    }

    return {
      transactionIndex: index,
      riskScore,
      anomalyScore,
      riskLevel: level(riskScore),
      riskConfidence: confidence,
      reviewReason: factors[0].label,
      factors,

      relatedTransactions: [],

      metrics: {
        amount,

        amountPercentile:
          Math.round(amountPercentile),

        medianAmount:
          datasetMedian == null
            ? null
            : Number(
                datasetMedian.toFixed(2)
              ),

        entityMedianAmount:
          entityMedianAmount == null
            ? null
            : Number(
                entityMedianAmount.toFixed(2)
              ),

        entityMad:
          entityMad == null
            ? null
            : Number(
                entityMad.toFixed(2)
              ),

        robustZ:
          robustZ == null
            ? null
            : Number(
                robustZ.toFixed(2)
              ),

        entityFrequency,

        categoryFrequency,

        sameEntityHour,

        sameEntityDay,

        duplicateCount,

        weekend,

        offHours,

        categoryShift:
          Boolean(categoryShiftScore),

        roundAmount: isRound,

        concentrationRatio:
          concentrationRatio == null
            ? null
            : Number(
                concentrationRatio.toFixed(2)
              ),
      },
    };
  });

  const counts = transactions.reduce(
    (result, transaction) => {
      result[transaction.riskLevel] += 1;
      return result;
    },
    {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
    }
  );

  return {
    amountField,
    dateField,
    entityField,
    categoryField,

    transactions,

    counts,

    highRiskPercentage:
      safeRows.length
        ? Math.round(
            (counts.HIGH /
              safeRows.length) *
              100
          )
        : 0,

    mediumOrHighPercentage:
      safeRows.length
        ? Math.round(
            ((counts.HIGH +
              counts.MEDIUM) /
              safeRows.length) *
              100
          )
        : 0,

    intelligence: {
      datasetMedianAmount:
        datasetMedian,

      detectedSignals: [
        amountField &&
          'amount-baseline',
        dateField &&
          'temporal-behavior',
        entityField &&
          'entity-behavior',
        categoryField &&
          'category-shift',
        'duplicate-detection',
        'velocity-analysis',
      ].filter(Boolean),
    },
  };
};

export default scoreTransactions;