import { ModelComparisonRow } from '../types';
import { runKMeans, standardizeMatrix, computeClusteringMetrics } from './clusteringEngine';

export interface ElbowPoint {
  k: number;
  wcss: number;
  delta: number;
  isElbowInflection?: boolean;
}

export interface ValidationSuiteResult {
  elbowCurve: ElbowPoint[];
  recommendedK: number;
  comparisonTable: ModelComparisonRow[];
  methodologyNotes: {
    algorithm: string;
    assumptions: string[];
    strengths: string[];
    limitations: string[];
  }[];
}

export function runModelValidationSuite(
  rawData: Record<string, any>[],
  features: string[],
  seed: number = 42
): ValidationSuiteResult {
  const { matrix } = standardizeMatrix(rawData, features);
  const n = matrix.length;
  const kRange = [2, 3, 4, 5, 6, 7];

  const elbowCurve: ElbowPoint[] = [];
  const comparisonTable: ModelComparisonRow[] = [];

  let prevWcss = 0;
  const deltas: number[] = [];

  for (let idx = 0; idx < kRange.length; idx++) {
    const k = kRange[idx];
    const km = runKMeans(matrix, k, seed, 80, 'euclidean');
    const metrics = computeClusteringMetrics(matrix, km.assignments, k, km.centroids);

    const delta = idx === 0 ? 0 : +(prevWcss - km.wcss).toFixed(1);
    deltas.push(delta);
    prevWcss = km.wcss;

    elbowCurve.push({
      k,
      wcss: +km.wcss.toFixed(1),
      delta,
    });

    let note = '';
    if (metrics.silhouetteScore > 0.45) {
      note = 'Estructura de clusters bien definida y compacta.';
    } else if (metrics.silhouetteScore > 0.3) {
      note = 'Separación aceptable con solapamiento moderado.';
    } else {
      note = 'Separación débil; clusters dispersos o de densidad variable.';
    }

    comparisonTable.push({
      k,
      algorithm: `K-Means (K=${k})`,
      wcss: +km.wcss.toFixed(1),
      silhouette: metrics.silhouetteScore,
      daviesBouldin: metrics.daviesBouldin,
      calinskiHarabasz: metrics.calinskiHarabasz,
      notes: note,
    });
  }

  // Detect elbow inflection point using second difference
  let maxSecondDiff = -Infinity;
  let recommendedK = 3;

  for (let i = 1; i < elbowCurve.length - 1; i++) {
    const secondDiff = elbowCurve[i].delta - elbowCurve[i + 1].delta;
    if (secondDiff > maxSecondDiff && elbowCurve[i].k >= 3) {
      maxSecondDiff = secondDiff;
      recommendedK = elbowCurve[i].k;
    }
  }

  // Mark recommended in elbow curve and comparison table
  elbowCurve.forEach((pt) => {
    if (pt.k === recommendedK) pt.isElbowInflection = true;
  });

  // Find best combination of silhouette and Davies-Bouldin
  let bestScore = -Infinity;
  let bestK = recommendedK;

  comparisonTable.forEach((row) => {
    // Score combines silhouette (higher is better) and davies-bouldin (lower is better)
    const compositeScore = row.silhouette * 2 - (row.daviesBouldin * 0.3);
    if (compositeScore > bestScore) {
      bestScore = compositeScore;
      bestK = row.k;
    }
  });

  comparisonTable.forEach((row) => {
    if (row.k === bestK) {
      row.isRecommended = true;
      row.notes = '★ Configuración Óptima Recomendada por equilibrio de silueta e inercia.';
    }
  });

  const methodologyNotes = [
    {
      algorithm: 'K-Means',
      assumptions: [
        'Clusters esféricos / convexos en el espacio multivariado.',
        'Varianza similar y tamaños de grupo comparables.',
        'Sensible a escalas: requiere estandarización previa (Z-Score).',
      ],
      strengths: [
        'Alta velocidad computacional y escalabilidad a millones de registros.',
        'Centroides explícitos directamente interpretables como perfil arquetípico.',
        'Fácil asignación de nuevos clientes en producción en tiempo real.',
      ],
      limitations: [
        'Sensible a valores atípicos (outliers) que pueden desviar los centros.',
        'Dificultad para modelar formas geométricas alargadas o no convexas.',
      ],
    },
    {
      algorithm: 'Clustering Jerárquico Aglomerativo',
      assumptions: [
        'Estructura jerárquica subyacente o taxonomía natural de clientes.',
        'Métrica de distancia euclidiana representativa de similitud.',
      ],
      strengths: [
        'No requiere predefinir K a priori; permite inspeccionar el dendrograma.',
        'El método Ward minimiza la varianza interna de manera muy consistente.',
        'Determinístico y reproducible sin depender de semillas aleatorias.',
      ],
      limitations: [
        'Complejidad computacional O(N^2) a O(N^3); prohibitivo en bases masivas.',
        'No permite reasignación de observaciones una vez realizada la fusión.',
      ],
    },
    {
      algorithm: 'DBSCAN (Basado en Densidad)',
      assumptions: [
        'Las agrupaciones naturales se definen por zonas de alta densidad separadas por zonas de baja densidad.',
      ],
      strengths: [
        'Detecta clusters con cualquier forma geométrica arbitraria.',
        'Aísla automáticamente valores atípicos y ruido (clasificados como cluster -1).',
      ],
      limitations: [
        'Dificultad para parametrizar Epsilon (ε) y MinPts si las densidades difieren.',
        'No genera centroides matemáticos naturales para perfilamiento clásico.',
      ],
    },
    {
      algorithm: 'Gaussian Mixture Models (GMM)',
      assumptions: [
        'Los datos provienen de una mezcla finita de distribuciones normales multivariadas.',
      ],
      strengths: [
        'Clustering probabilístico blando (soft clustering con probabilidad posterior).',
        'Modelado de clusters elípticos de diversas orientaciones y varianzas.',
        'Criterios estadísticos formales de selección de modelos: AIC y BIC.',
      ],
      limitations: [
        'Puede converger a óptimos locales dependiendo de la inicialización EM.',
        'Requiere suficientes observaciones por variable para estimar covarianzas.',
      ],
    },
  ];

  return {
    elbowCurve,
    recommendedK: bestK,
    comparisonTable,
    methodologyNotes,
  };
}
