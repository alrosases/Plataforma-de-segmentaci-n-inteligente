export type VariableType =
  | 'numeric_continuous'
  | 'numeric_discrete'
  | 'categorical_nominal'
  | 'categorical_ordinal'
  | 'identifier'
  | 'date';

export interface ColumnMetadata {
  name: string;
  type: VariableType;
  missingCount: number;
  missingPercentage: number;
  uniqueCount: number;
  sampleValues: (string | number)[];
  description?: string;
  isExcludedFromModeling?: boolean;
  min?: number;
  max?: number;
  mean?: number;
  median?: number;
  stdDev?: number;
  q1?: number;
  q3?: number;
  skewness?: number;
  kurtosis?: number;
}

export interface BusinessContext {
  sector: string;
  objective: string;
  analysisUnit: string;
  clientIdColumn: string;
  period: string;
}

export interface TransformationStep {
  id: string;
  timestamp: string;
  type:
    | 'impute_missing'
    | 'remove_duplicates'
    | 'filter_outliers'
    | 'log_transform'
    | 'zscore_standardize'
    | 'minmax_normalize'
    | 'one_hot_encode'
    | 'select_features';
  description: string;
  targetColumn?: string;
  params?: Record<string, any>;
  beforeSummary?: string;
  afterSummary?: string;
}

export type AlgorithmType = 'kmeans' | 'hierarchical' | 'dbscan' | 'gmm';

export interface ClusteringConfig {
  algorithm: AlgorithmType;
  k: number;
  distanceMetric: 'euclidean' | 'manhattan';
  linkage: 'ward' | 'complete' | 'average' | 'single';
  epsilon: number;
  minPts: number;
  seed: number;
  maxIterations: number;
  selectedFeatures: string[];
}

export interface PCAResult {
  pc1: number[];
  pc2: number[];
  explainedVariance: [number, number]; // [ratio1, ratio2]
  loadings: Record<string, [number, number]>;
}

export interface ClusteringResult {
  algorithm: AlgorithmType;
  k: number;
  features: string[];
  clusterAssignments: number[]; // cluster index for each sample (-1 for noise in DBSCAN)
  centroids: number[][]; // [k][featureCount] normalized
  centroidsOriginalScale: Record<string, number>[];
  clusterSizes: Record<number, number>;
  clusterPercentages: Record<number, number>;
  wcss: number;
  silhouetteScore: number;
  silhouettePerCluster: Record<number, number>;
  silhouetteSampleScores: number[];
  daviesBouldin: number;
  calinskiHarabasz: number;
  aic?: number;
  bic?: number;
  pca: PCAResult;
  convergenceIterations: number;
  executionTimeMs: number;
  timestamp: string;
}

export interface DifferentiatingFeature {
  feature: string;
  clusterMean: number;
  globalMean: number;
  zScore: number;
  relativeDifferencePercent: number;
  direction: 'higher' | 'lower';
}

export interface ClusterProfile {
  clusterId: number;
  name: string;
  color: string;
  size: number;
  percentage: number;
  means: Record<string, number>;
  medians: Record<string, number>;
  differentiatingFeatures: DifferentiatingFeature[];
  behaviorDescription: string;
  opportunities: string[];
  risks: string[];
  priorityRank: number;
}

export interface StrategicMatrixRow {
  clusterId: number;
  clusterName: string;
  color: string;
  size: number;
  percentage: number;
  profile: string;
  economicValue: string;
  churnRisk: string;
  opportunity: string;
  marketingAction: string;
  retentionAction: string;
  growthStrategy: string;
  recommendedKpis: string[];
}

export interface ModelComparisonRow {
  k: number;
  algorithm: string;
  wcss: number;
  silhouette: number;
  daviesBouldin: number;
  calinskiHarabasz: number;
  isRecommended?: boolean;
  notes: string;
}

export interface UnivariateStats {
  column: string;
  n: number;
  mean: number;
  median: number;
  mode: number | string;
  min: number;
  max: number;
  range: number;
  variance: number;
  stdDev: number;
  q1: number;
  q3: number;
  iqr: number;
  p10: number;
  p90: number;
  cv: number; // Coefficient of variation %
  skewness: number;
  kurtosis: number;
  histogram: { binStart: number; binEnd: number; count: number }[];
  outlierCount: number;
}
