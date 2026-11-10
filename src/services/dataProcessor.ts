import { ColumnMetadata, UnivariateStats, VariableType } from '../types';

export function inferVariableType(values: any[], colName: string): VariableType {
  const lower = colName.toLowerCase();
  if (
    lower.includes('id') ||
    lower.includes('codigo') ||
    lower.includes('key') ||
    lower.includes('rut') ||
    lower.includes('dni') ||
    lower.includes('cedula') ||
    lower.includes('uuid')
  ) {
    return 'identifier';
  }

  const validValues = values.filter((v) => v !== null && v !== undefined && v !== '');
  if (validValues.length === 0) return 'categorical_nominal';

  // Check if dates
  const isDate = validValues.slice(0, 30).every((v) => {
    if (typeof v === 'string' && (v.includes('-') || v.includes('/'))) {
      const parsed = Date.parse(v);
      return !isNaN(parsed);
    }
    return false;
  });
  if (isDate) return 'date';

  // Check if numbers
  const numericCount = validValues.filter((v) => {
    if (typeof v === 'number') return !isNaN(v);
    if (typeof v === 'string') {
      const clean = v.replace(/[$€,\s]/g, '');
      return clean.length > 0 && !isNaN(Number(clean));
    }
    return false;
  }).length;

  const isNumeric = numericCount / validValues.length > 0.85;

  if (isNumeric) {
    const numbers = validValues.map((v) => (typeof v === 'number' ? v : Number(String(v).replace(/[$€,\s]/g, ''))));
    const uniqueCount = new Set(numbers).size;
    const allIntegers = numbers.every((n) => Number.isInteger(n));

    if (allIntegers && uniqueCount <= 10 && numbers.every((n) => n >= 0 && n <= 10)) {
      return 'categorical_ordinal';
    }

    if (allIntegers && uniqueCount <= 25) {
      return 'numeric_discrete';
    }
    return 'numeric_continuous';
  }

  const uniqueStrings = new Set(validValues.map((v) => String(v).trim())).size;
  if (uniqueStrings <= 12) {
    return 'categorical_nominal';
  }

  // If high cardinality string, could be identifier
  if (uniqueStrings / validValues.length > 0.8) {
    return 'identifier';
  }

  return 'categorical_nominal';
}

export function analyzeColumns(data: Record<string, any>[]): ColumnMetadata[] {
  if (!data || data.length === 0) return [];

  const colNames = Object.keys(data[0]);
  const totalRows = data.length;

  return colNames.map((colName) => {
    const rawValues = data.map((row) => row[colName]);
    const validValues = rawValues.filter((v) => v !== null && v !== undefined && v !== '');
    const missingCount = totalRows - validValues.length;
    const missingPercentage = +((missingCount / totalRows) * 100).toFixed(1);
    const uniqueValues = Array.from(new Set(validValues.map((v) => String(v))));
    const uniqueCount = uniqueValues.length;
    const sampleValues = validValues.slice(0, 5);

    const type = inferVariableType(rawValues, colName);
    const isExcludedFromModeling = type === 'identifier' || type === 'date';

    const metadata: ColumnMetadata = {
      name: colName,
      type,
      missingCount,
      missingPercentage,
      uniqueCount,
      sampleValues,
      isExcludedFromModeling,
    };

    if (type === 'numeric_continuous' || type === 'numeric_discrete') {
      const nums = validValues
        .map((v) => (typeof v === 'number' ? v : Number(String(v).replace(/[$€,\s]/g, ''))))
        .filter((n) => !isNaN(n));

      if (nums.length > 0) {
        nums.sort((a, b) => a - b);
        const sum = nums.reduce((a, b) => a + b, 0);
        const mean = sum / nums.length;
        const min = nums[0];
        const max = nums[nums.length - 1];
        const mid = Math.floor(nums.length / 2);
        const median = nums.length % 2 === 0 ? (nums[mid - 1] + nums[mid]) / 2 : nums[mid];

        const variance = nums.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (nums.length - 1 || 1);
        const stdDev = Math.sqrt(variance);

        metadata.min = +min.toFixed(2);
        metadata.max = +max.toFixed(2);
        metadata.mean = +mean.toFixed(2);
        metadata.median = +median.toFixed(2);
        metadata.stdDev = +stdDev.toFixed(2);
      }
    }

    return metadata;
  });
}

export function computeUnivariateStats(values: number[], colName: string): UnivariateStats {
  const nums = values.filter((n) => typeof n === 'number' && !isNaN(n)).sort((a, b) => a - b);
  const n = nums.length;

  if (n === 0) {
    return {
      column: colName,
      n: 0,
      mean: 0,
      median: 0,
      mode: 0,
      min: 0,
      max: 0,
      range: 0,
      variance: 0,
      stdDev: 0,
      q1: 0,
      q3: 0,
      iqr: 0,
      p10: 0,
      p90: 0,
      cv: 0,
      skewness: 0,
      kurtosis: 0,
      histogram: [],
      outlierCount: 0,
    };
  }

  const sum = nums.reduce((a, b) => a + b, 0);
  const mean = sum / n;
  const min = nums[0];
  const max = nums[n - 1];
  const range = max - min;

  // Median
  const mid = Math.floor(n / 2);
  const median = n % 2 === 0 ? (nums[mid - 1] + nums[mid]) / 2 : nums[mid];

  // Mode
  const frequencyMap: Record<number, number> = {};
  let maxFreq = 0;
  let mode: number = nums[0];
  for (const num of nums) {
    frequencyMap[num] = (frequencyMap[num] || 0) + 1;
    if (frequencyMap[num] > maxFreq) {
      maxFreq = frequencyMap[num];
      mode = num;
    }
  }

  // Quantiles
  const getPercentile = (p: number) => {
    const index = (n - 1) * p;
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    return nums[lower] * (1 - weight) + nums[upper] * weight;
  };

  const q1 = getPercentile(0.25);
  const q3 = getPercentile(0.75);
  const iqr = q3 - q1;
  const p10 = getPercentile(0.1);
  const p90 = getPercentile(0.9);

  // Variance & Standard Deviation
  const variance = nums.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (n > 1 ? n - 1 : 1);
  const stdDev = Math.sqrt(variance);
  const cv = mean !== 0 ? (stdDev / Math.abs(mean)) * 100 : 0;

  // Skewness (Fisher-Pearson)
  let skewness = 0;
  if (stdDev > 0 && n > 2) {
    const m3 = nums.reduce((acc, v) => acc + Math.pow(v - mean, 3), 0) / n;
    skewness = (m3 / Math.pow(stdDev, 3)) * (Math.sqrt(n * (n - 1)) / (n - 2));
  }

  // Kurtosis (Fisher excess kurtosis)
  let kurtosis = 0;
  if (stdDev > 0 && n > 3) {
    const m4 = nums.reduce((acc, v) => acc + Math.pow(v - mean, 4), 0) / n;
    kurtosis = m4 / Math.pow(stdDev, 4) - 3;
  }

  // Outliers using Tukey's fences: [Q1 - 1.5*IQR, Q3 + 1.5*IQR]
  const lowerFence = q1 - 1.5 * iqr;
  const upperFence = q3 + 1.5 * iqr;
  const outlierCount = nums.filter((v) => v < lowerFence || v > upperFence).length;

  // Histogram (10 bins)
  const binCount = Math.min(12, Math.max(6, Math.round(Math.sqrt(n))));
  const binWidth = range > 0 ? range / binCount : 1;
  const histogram: { binStart: number; binEnd: number; count: number }[] = [];

  for (let i = 0; i < binCount; i++) {
    const binStart = min + i * binWidth;
    const binEnd = i === binCount - 1 ? max + 0.0001 : binStart + binWidth;
    const count = nums.filter((v) => v >= binStart && v < binEnd).length;
    histogram.push({
      binStart: +binStart.toFixed(2),
      binEnd: +binEnd.toFixed(2),
      count,
    });
  }

  return {
    column: colName,
    n,
    mean: +mean.toFixed(2),
    median: +median.toFixed(2),
    mode: +mode.toFixed(2),
    min: +min.toFixed(2),
    max: +max.toFixed(2),
    range: +range.toFixed(2),
    variance: +variance.toFixed(2),
    stdDev: +stdDev.toFixed(2),
    q1: +q1.toFixed(2),
    q3: +q3.toFixed(2),
    iqr: +iqr.toFixed(2),
    p10: +p10.toFixed(2),
    p90: +p90.toFixed(2),
    cv: +cv.toFixed(1),
    skewness: +skewness.toFixed(3),
    kurtosis: +kurtosis.toFixed(3),
    histogram,
    outlierCount,
  };
}

export function computeCorrelationMatrix(data: Record<string, any>[], featureCols: string[]) {
  const n = data.length;
  const matrix: { [colA: string]: { [colB: string]: number } } = {};

  // Extract clean number vectors
  const vectors: Record<string, number[]> = {};
  for (const col of featureCols) {
    vectors[col] = data.map((row) => {
      const v = row[col];
      return typeof v === 'number' ? v : Number(String(v).replace(/[$€,\s]/g, '')) || 0;
    });
  }

  // Calculate means and stdDevs
  const means: Record<string, number> = {};
  const stds: Record<string, number> = {};
  for (const col of featureCols) {
    const vec = vectors[col];
    const mean = vec.reduce((a, b) => a + b, 0) / n;
    const std = Math.sqrt(vec.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (n - 1 || 1));
    means[col] = mean;
    stds[col] = std;
    matrix[col] = {};
  }

  // Pearson correlation r = sum((xi - x_bar)(yi - y_bar)) / ((n-1) * sx * sy)
  for (let i = 0; i < featureCols.length; i++) {
    const colA = featureCols[i];
    matrix[colA][colA] = 1.0;

    for (let j = i + 1; j < featureCols.length; j++) {
      const colB = featureCols[j];
      const vecA = vectors[colA];
      const vecB = vectors[colB];
      const stdA = stds[colA];
      const stdB = stds[colB];

      if (stdA === 0 || stdB === 0) {
        matrix[colA][colB] = 0;
        matrix[colB][colA] = 0;
        continue;
      }

      let covarianceSum = 0;
      for (let k = 0; k < n; k++) {
        covarianceSum += (vecA[k] - means[colA]) * (vecB[k] - means[colB]);
      }
      const r = covarianceSum / ((n - 1) * stdA * stdB);
      const clampedR = Math.max(-1, Math.min(1, +r.toFixed(3)));

      matrix[colA][colB] = clampedR;
      if (!matrix[colB]) matrix[colB] = {};
      matrix[colB][colA] = clampedR;
    }
  }

  return matrix;
}

export interface AnalyticalFourFoldInsight {
  variableOrPair: string;
  observedResult: string;
  statisticalInterpretation: string;
  businessImplication: string;
  recommendedAction: string;
}

export function generateFourFoldInsights(stats: UnivariateStats[], correlations: { [colA: string]: { [colB: string]: number } }): AnalyticalFourFoldInsight[] {
  const insights: AnalyticalFourFoldInsight[] = [];

  // Univariate insights for top skewed or high CV variables
  for (const s of stats) {
    if (Math.abs(s.skewness) > 0.8) {
      insights.push({
        variableOrPair: s.column,
        observedResult: `Media = ${s.mean.toLocaleString()}, Mediana = ${s.median.toLocaleString()}, Asimetría = ${s.skewness > 0 ? '+' : ''}${s.skewness} (IQR: ${s.iqr.toLocaleString()}) con ${s.outlierCount} valores atípicos.`,
        statisticalInterpretation: `Distribución marcadamente ${s.skewness > 0 ? 'asimétrica a la derecha (sesgo positivo)' : 'asimétrica a la izquierda'}. La media está traccionada por la cola extrema superior, por lo que la mediana representa mejor el centro de masa.`,
        businessImplication: `Existe una minoría selecta de clientes con cifras extraordinarias que distorsionan el promedio general, mientras la mayoría opera a niveles sustancialmente más moderados.`,
        recommendedAction: `Aplicar transformación logarítmica o estandarización robusta previo a la distancia euclidiana en el clustering para evitar que este campo domine todos los centroides.`,
      });
    } else if (s.cv > 60) {
      insights.push({
        variableOrPair: s.column,
        observedResult: `Coeficiente de Variación del ${s.cv}% (Desviación Estándar = ${s.stdDev.toLocaleString()} vs Media = ${s.mean.toLocaleString()}).`,
        statisticalInterpretation: `Alta heterogeneidad muestral relativa. La dispersión supera ampliamente el 50% de la media, indicando una dispersión amplia ideal para discriminar grupos.`,
        businessImplication: `Esta variable posee un altísimo poder discriminante natural para diferenciar segmentos de clientes con comportamientos polarizados.`,
        recommendedAction: `Priorizar como variable de segmentación central e incluirla en los radares de perfiles comerciales.`,
      });
    }
  }

  // Correlation insights
  const pairs: { a: string; b: string; r: number }[] = [];
  const cols = Object.keys(correlations);
  for (let i = 0; i < cols.length; i++) {
    for (let j = i + 1; j < cols.length; j++) {
      const r = correlations[cols[i]][cols[j]];
      pairs.push({ a: cols[i], b: cols[j], r });
    }
  }

  pairs.sort((x, y) => Math.abs(y.r) - Math.abs(x.r));

  for (const pair of pairs.slice(0, 3)) {
    const absR = Math.abs(pair.r);
    if (absR >= 0.45) {
      insights.push({
        variableOrPair: `${pair.a} ↔ ${pair.b}`,
        observedResult: `Coeficiente de correlación de Pearson r = ${pair.r > 0 ? '+' : ''}${pair.r}.`,
        statisticalInterpretation: `Asociación lineal ${absR > 0.7 ? 'fuerte' : 'moderada'} entre ambas variables (${pair.r > 0 ? 'positiva directa' : 'negativa inversa'}).`,
        businessImplication:
          pair.r > 0
            ? `A medida que ${pair.a} se incrementa, ${pair.b} tiende a crecer de manera consistente, sugiriendo sinergia conductual.`
            : `Existe un efecto sustitutivo o de compensación entre ${pair.a} y ${pair.b}.`,
        recommendedAction: `Considerar reducción de dimensionalidad con PCA para consolidar ambas variables en un componente ortogonal y evitar sobreponderación de una misma dimensión.`,
      });
    }
  }

  return insights;
}
