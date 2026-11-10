import { AlgorithmType, ClusteringConfig, ClusteringResult, PCAResult } from '../types';

// Seeded pseudo-random number generator (Mulberry32) for reproducible statistical results
function createPRNG(seed: number) {
  let s = Math.floor(seed) || 12345;
  return function () {
    let t = (s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Euclidean distance squared
function distSq(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return sum;
}

// Euclidean distance
function dist(a: number[], b: number[]): number {
  return Math.sqrt(distSq(a, b));
}

// Manhattan distance
function distManhattan(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += Math.abs(a[i] - b[i]);
  }
  return sum;
}

// Standardize matrix (Z-score)
export function standardizeMatrix(
  data: Record<string, any>[],
  features: string[]
): {
  matrix: number[][];
  means: Record<string, number>;
  stds: Record<string, number>;
} {
  const n = data.length;
  const p = features.length;
  const means: Record<string, number> = {};
  const stds: Record<string, number> = {};

  for (const f of features) {
    let sum = 0;
    for (let i = 0; i < n; i++) {
      const v = Number(data[i][f]) || 0;
      sum += v;
    }
    const m = sum / n;
    means[f] = m;

    let varSum = 0;
    for (let i = 0; i < n; i++) {
      const v = Number(data[i][f]) || 0;
      varSum += Math.pow(v - m, 2);
    }
    const s = Math.sqrt(varSum / (n - 1 || 1)) || 1;
    stds[f] = s;
  }

  const matrix: number[][] = [];
  for (let i = 0; i < n; i++) {
    const row: number[] = new Array(p);
    for (let j = 0; j < p; j++) {
      const f = features[j];
      const raw = Number(data[i][f]) || 0;
      row[j] = (raw - means[f]) / stds[f];
    }
    matrix.push(row);
  }

  return { matrix, means, stds };
}

// K-Means Implementation with K-Means++ and seed
export function runKMeans(
  matrix: number[][],
  k: number,
  seed: number = 42,
  maxIterations: number = 100,
  metric: 'euclidean' | 'manhattan' = 'euclidean'
): { assignments: number[]; centroids: number[][]; iterations: number; wcss: number } {
  const n = matrix.length;
  const p = matrix[0].length;
  const rng = createPRNG(seed);
  const distanceFn = metric === 'manhattan' ? distManhattan : dist;

  // 1. K-Means++ initialization
  const centroids: number[][] = [];
  const firstIdx = Math.floor(rng() * n);
  centroids.push([...matrix[firstIdx]]);

  for (let c = 1; c < k; c++) {
    const d2: number[] = new Array(n);
    let totalD2 = 0;
    for (let i = 0; i < n; i++) {
      let minDistSq = Infinity;
      for (let j = 0; j < centroids.length; j++) {
        const d = distSq(matrix[i], centroids[j]);
        if (d < minDistSq) minDistSq = d;
      }
      d2[i] = minDistSq;
      totalD2 += minDistSq;
    }

    let target = rng() * totalD2;
    let chosenIdx = 0;
    for (let i = 0; i < n; i++) {
      target -= d2[i];
      if (target <= 0) {
        chosenIdx = i;
        break;
      }
    }
    centroids.push([...matrix[chosenIdx]]);
  }

  // 2. Iterations
  let assignments = new Array(n).fill(0);
  let iterations = 0;
  let changed = true;

  while (changed && iterations < maxIterations) {
    iterations++;
    changed = false;

    // Assign to closest centroid
    for (let i = 0; i < n; i++) {
      let minDist = Infinity;
      let closest = 0;
      for (let c = 0; c < k; c++) {
        const d = distanceFn(matrix[i], centroids[c]);
        if (d < minDist) {
          minDist = d;
          closest = c;
        }
      }
      if (assignments[i] !== closest) {
        assignments[i] = closest;
        changed = true;
      }
    }

    // Recompute centroids
    const counts = new Array(k).fill(0);
    const newCentroids: number[][] = Array.from({ length: k }, () => new Array(p).fill(0));

    for (let i = 0; i < n; i++) {
      const c = assignments[i];
      counts[c]++;
      for (let j = 0; j < p; j++) {
        newCentroids[c][j] += matrix[i][j];
      }
    }

    for (let c = 0; c < k; c++) {
      if (counts[c] > 0) {
        for (let j = 0; j < p; j++) {
          newCentroids[c][j] /= counts[c];
        }
        centroids[c] = newCentroids[c];
      } else {
        // If empty cluster, reinitialize to a random point
        centroids[c] = [...matrix[Math.floor(rng() * n)]];
      }
    }
  }

  // Compute WCSS (Within-Cluster Sum of Squares)
  let wcss = 0;
  for (let i = 0; i < n; i++) {
    wcss += distSq(matrix[i], centroids[assignments[i]]);
  }

  return { assignments, centroids, iterations, wcss };
}

// Hierarchical Agglomerative Clustering
export function runHierarchical(
  matrix: number[][],
  k: number,
  linkage: 'ward' | 'complete' | 'average' | 'single' = 'ward'
): { assignments: number[]; centroids: number[][] } {
  const n = matrix.length;
  const p = matrix[0].length;

  // Initialize each point as its own cluster
  // For performance with n <= 600, maintain clusters array
  let clusters: number[][] = Array.from({ length: n }, (_, i) => [i]);

  // Compute initial pairwise distance matrix
  const distMatrix: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const d = dist(matrix[i], matrix[j]);
      distMatrix[i][j] = d;
      distMatrix[j][i] = d;
    }
  }

  // Helper to compute distance between two clusters A and B
  function clusterDistance(cA: number[], cB: number[]): number {
    if (linkage === 'single') {
      let minD = Infinity;
      for (const a of cA) {
        for (const b of cB) {
          const d = distMatrix[a][b];
          if (d < minD) minD = d;
        }
      }
      return minD;
    }

    if (linkage === 'complete') {
      let maxD = -Infinity;
      for (const a of cA) {
        for (const b of cB) {
          const d = distMatrix[a][b];
          if (d > maxD) maxD = d;
        }
      }
      return maxD;
    }

    if (linkage === 'average') {
      let sumD = 0;
      for (const a of cA) {
        for (const b of cB) {
          sumD += distMatrix[a][b];
        }
      }
      return sumD / (cA.length * cB.length);
    }

    // Ward linkage (minimum variance)
    // Approximate Ward distance via centroids
    const centA = new Array(p).fill(0);
    for (const a of cA) {
      for (let j = 0; j < p; j++) centA[j] += matrix[a][j];
    }
    for (let j = 0; j < p; j++) centA[j] /= cA.length;

    const centB = new Array(p).fill(0);
    for (const b of cB) {
      for (let j = 0; j < p; j++) centB[j] += matrix[b][j];
    }
    for (let j = 0; j < p; j++) centB[j] /= cB.length;

    const centroidDistSq = distSq(centA, centB);
    return ((cA.length * cB.length) / (cA.length + cB.length)) * centroidDistSq;
  }

  // Merge until K clusters remain
  while (clusters.length > k) {
    let bestDist = Infinity;
    let mergeI = 0;
    let mergeJ = 1;

    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        const d = clusterDistance(clusters[i], clusters[j]);
        if (d < bestDist) {
          bestDist = d;
          mergeI = i;
          mergeJ = j;
        }
      }
    }

    // Merge mergeJ into mergeI
    clusters[mergeI] = clusters[mergeI].concat(clusters[mergeJ]);
    clusters.splice(mergeJ, 1);
  }

  const assignments = new Array(n).fill(0);
  const centroids: number[][] = [];

  for (let c = 0; c < clusters.length; c++) {
    const members = clusters[c];
    for (const m of members) {
      assignments[m] = c;
    }

    // Compute centroid
    const cent = new Array(p).fill(0);
    for (const m of members) {
      for (let j = 0; j < p; j++) {
        cent[j] += matrix[m][j];
      }
    }
    for (let j = 0; j < p; j++) cent[j] /= members.length;
    centroids.push(cent);
  }

  return { assignments, centroids };
}

// DBSCAN (Density-Based Spatial Clustering of Applications with Noise)
export function runDBSCAN(
  matrix: number[][],
  epsilon: number = 1.2,
  minPts: number = 5
): { assignments: number[]; centroids: number[][] } {
  const n = matrix.length;
  const p = matrix[0].length;
  const assignments = new Array(n).fill(-1); // -1 = unvisited / noise
  const visited = new Array(n).fill(false);
  let clusterId = 0;

  function regionQuery(pointIdx: number): number[] {
    const neighbors: number[] = [];
    const p1 = matrix[pointIdx];
    for (let i = 0; i < n; i++) {
      if (dist(p1, matrix[i]) <= epsilon) {
        neighbors.push(i);
      }
    }
    return neighbors;
  }

  for (let i = 0; i < n; i++) {
    if (visited[i]) continue;
    visited[i] = true;

    const neighbors = regionQuery(i);
    if (neighbors.length < minPts) {
      assignments[i] = -1; // noise
    } else {
      assignments[i] = clusterId;
      const seedQueue = [...neighbors];

      while (seedQueue.length > 0) {
        const currentPt = seedQueue.shift()!;
        if (!visited[currentPt]) {
          visited[currentPt] = true;
          const currentNeighbors = regionQuery(currentPt);
          if (currentNeighbors.length >= minPts) {
            for (const nPt of currentNeighbors) {
              if (!seedQueue.includes(nPt)) {
                seedQueue.push(nPt);
              }
            }
          }
        }
        if (assignments[currentPt] === -1) {
          assignments[currentPt] = clusterId;
        }
      }
      clusterId++;
    }
  }

  // Calculate centroids of identified clusters
  const kActual = clusterId === 0 ? 1 : clusterId;
  const centroids: number[][] = [];

  for (let c = 0; c < kActual; c++) {
    const members = matrix.filter((_, idx) => assignments[idx] === c);
    const cent = new Array(p).fill(0);
    if (members.length > 0) {
      for (const m of members) {
        for (let j = 0; j < p; j++) cent[j] += m[j];
      }
      for (let j = 0; j < p; j++) cent[j] /= members.length;
    }
    centroids.push(cent);
  }

  return { assignments, centroids };
}

// Gaussian Mixture Model (GMM via Expectation-Maximization)
export function runGMM(
  matrix: number[][],
  k: number,
  seed: number = 42,
  maxIter: number = 60
): { assignments: number[]; centroids: number[][]; aic: number; bic: number } {
  const n = matrix.length;
  const p = matrix[0].length;
  const rng = createPRNG(seed);

  // Initialize weights, means, and variances (diagonal covariance for numerical stability)
  const weights: number[] = new Array(k).fill(1 / k);
  const means: number[][] = [];
  const variances: number[][] = [];

  // Pick random distinct points as initial means
  const shuffledIndices = Array.from({ length: n }, (_, i) => i).sort(() => rng() - 0.5);
  for (let c = 0; c < k; c++) {
    means.push([...matrix[shuffledIndices[c % n]]]);
    variances.push(new Array(p).fill(1.0)); // unit variance
  }

  // Responsibilities gamma[i][c]
  const gamma: number[][] = Array.from({ length: n }, () => new Array(k).fill(0));
  let logLikelihood = -Infinity;

  function normalPdf(x: number[], mean: number[], variance: number[]): number {
    let exponent = 0;
    let det = 1;
    for (let j = 0; j < p; j++) {
      const v = Math.max(0.01, variance[j]);
      det *= v;
      exponent += Math.pow(x[j] - mean[j], 2) / (2 * v);
    }
    const denom = Math.pow(2 * Math.PI, p / 2) * Math.sqrt(det) || 1e-9;
    return Math.max(1e-15, (1 / denom) * Math.exp(-Math.min(50, exponent)));
  }

  for (let iter = 0; iter < maxIter; iter++) {
    let currentLogLikelihood = 0;

    // E-step: Compute responsibilities
    for (let i = 0; i < n; i++) {
      let rowSum = 0;
      const pdfs: number[] = new Array(k);
      for (let c = 0; c < k; c++) {
        const prob = weights[c] * normalPdf(matrix[i], means[c], variances[c]);
        pdfs[c] = prob;
        rowSum += prob;
      }
      rowSum = Math.max(1e-15, rowSum);
      currentLogLikelihood += Math.log(rowSum);

      for (let c = 0; c < k; c++) {
        gamma[i][c] = pdfs[c] / rowSum;
      }
    }

    if (Math.abs(currentLogLikelihood - logLikelihood) < 1e-4) {
      break;
    }
    logLikelihood = currentLogLikelihood;

    // M-step: Update parameters
    for (let c = 0; c < k; c++) {
      let Nk = 0;
      for (let i = 0; i < n; i++) Nk += gamma[i][c];
      Nk = Math.max(1e-6, Nk);

      weights[c] = Nk / n;

      // Update mean
      const newMean = new Array(p).fill(0);
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < p; j++) {
          newMean[j] += gamma[i][c] * matrix[i][j];
        }
      }
      for (let j = 0; j < p; j++) newMean[j] /= Nk;
      means[c] = newMean;

      // Update diagonal variance
      const newVar = new Array(p).fill(0);
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < p; j++) {
          newVar[j] += gamma[i][c] * Math.pow(matrix[i][j] - newMean[j], 2);
        }
      }
      for (let j = 0; j < p; j++) {
        newVar[j] = Math.max(0.01, newVar[j] / Nk);
      }
      variances[c] = newVar;
    }
  }

  // Maximum A Posteriori (MAP) hard assignment
  const assignments = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    let maxProb = -1;
    let bestC = 0;
    for (let c = 0; c < k; c++) {
      if (gamma[i][c] > maxProb) {
        maxProb = gamma[i][c];
        bestC = c;
      }
    }
    assignments[i] = bestC;
  }

  // AIC = 2*num_params - 2*logLikelihood
  // BIC = num_params * ln(n) - 2*logLikelihood
  // num_params = k - 1 (weights) + k * p (means) + k * p (variances)
  const numParams = k - 1 + 2 * k * p;
  const aic = +(2 * numParams - 2 * logLikelihood).toFixed(1);
  const bic = +(numParams * Math.log(n) - 2 * logLikelihood).toFixed(1);

  return { assignments, centroids: means, aic, bic };
}

// Principal Component Analysis (PCA) for 2D visualization & factor loadings
export function runPCA(matrix: number[][], features: string[]): PCAResult {
  const n = matrix.length;
  const p = matrix[0].length;

  if (p < 2) {
    return {
      pc1: matrix.map((r) => r[0] || 0),
      pc2: matrix.map(() => 0),
      explainedVariance: [100, 0],
      loadings: { [features[0]]: [1, 0] },
    };
  }

  // Compute Covariance Matrix: C = (1 / (n-1)) * X^T * X (since data is already standardized)
  const cov: number[][] = Array.from({ length: p }, () => new Array(p).fill(0));
  for (let i = 0; i < p; i++) {
    for (let j = 0; j < p; j++) {
      let sum = 0;
      for (let r = 0; r < n; r++) {
        sum += matrix[r][i] * matrix[r][j];
      }
      cov[i][j] = sum / (n - 1 || 1);
    }
  }

  // Power Iteration to find top 2 Eigenvectors of the covariance matrix
  function getTopEigenvector(cMat: number[][], deflatedVectors: number[][] = []): { vector: number[]; eigenvalue: number } {
    const dim = cMat.length;
    let v = new Array(dim).fill(0).map((_, idx) => Math.sin(idx + 1));
    // Normalize
    let norm = Math.sqrt(v.reduce((acc, val) => acc + val * val, 0));
    v = v.map((val) => val / norm);

    for (let iter = 0; iter < 100; iter++) {
      // Orthogonalize against previously found eigenvectors
      for (const prev of deflatedVectors) {
        const dot = v.reduce((sum, val, idx) => sum + val * prev[idx], 0);
        v = v.map((val, idx) => val - dot * prev[idx]);
      }

      // Multiply by covariance matrix: v_next = C * v
      const vNext = new Array(dim).fill(0);
      for (let i = 0; i < dim; i++) {
        for (let j = 0; j < dim; j++) {
          vNext[i] += cMat[i][j] * v[j];
        }
      }

      norm = Math.sqrt(vNext.reduce((acc, val) => acc + val * val, 0));
      if (norm === 0) break;
      v = vNext.map((val) => val / norm);
    }

    // Eigenvalue = v^T * C * v
    let eigenvalue = 0;
    for (let i = 0; i < dim; i++) {
      let ci = 0;
      for (let j = 0; j < dim; j++) ci += cMat[i][j] * v[j];
      eigenvalue += v[i] * ci;
    }

    return { vector: v, eigenvalue: Math.max(0.001, eigenvalue) };
  }

  const eig1 = getTopEigenvector(cov, []);
  const eig2 = getTopEigenvector(cov, [eig1.vector]);

  // Total variance is the sum of diagonal (traces) of covariance matrix
  let totalVariance = 0;
  for (let i = 0; i < p; i++) totalVariance += cov[i][i];
  totalVariance = Math.max(0.001, totalVariance);

  const ev1 = Math.min(100, Math.max(5, +((eig1.eigenvalue / totalVariance) * 100).toFixed(1)));
  const ev2 = Math.min(100 - ev1, Math.max(3, +((eig2.eigenvalue / totalVariance) * 100).toFixed(1)));

  // Project points onto PC1 and PC2
  const pc1: number[] = new Array(n);
  const pc2: number[] = new Array(n);

  for (let i = 0; i < n; i++) {
    let p1Val = 0;
    let p2Val = 0;
    for (let j = 0; j < p; j++) {
      p1Val += matrix[i][j] * eig1.vector[j];
      p2Val += matrix[i][j] * eig2.vector[j];
    }
    pc1[i] = +p1Val.toFixed(3);
    pc2[i] = +p2Val.toFixed(3);
  }

  // Feature Loadings
  const loadings: Record<string, [number, number]> = {};
  for (let j = 0; j < p; j++) {
    loadings[features[j]] = [+eig1.vector[j].toFixed(3), +eig2.vector[j].toFixed(3)];
  }

  return {
    pc1,
    pc2,
    explainedVariance: [ev1, ev2],
    loadings,
  };
}

// Validation Metrics Calculation (Silhouette, WCSS, Davies-Bouldin, Calinski-Harabasz)
export function computeClusteringMetrics(
  matrix: number[][],
  assignments: number[],
  k: number,
  centroids: number[][]
): {
  silhouetteScore: number;
  silhouettePerCluster: Record<number, number>;
  silhouetteSampleScores: number[];
  daviesBouldin: number;
  calinskiHarabasz: number;
} {
  const n = matrix.length;
  const p = matrix[0].length;

  // 1. Silhouette Coefficient
  // For each point i:
  // a(i) = average distance to other points in same cluster
  // b(i) = min over other clusters of average distance to points in that cluster
  // s(i) = (b(i) - a(i)) / max(a(i), b(i))
  const sampleSilhouettes: number[] = new Array(n).fill(0);
  const clusterMemberIndices: Record<number, number[]> = {};
  for (let c = 0; c < k; c++) clusterMemberIndices[c] = [];
  for (let i = 0; i < n; i++) {
    if (assignments[i] >= 0 && assignments[i] < k) {
      clusterMemberIndices[assignments[i]].push(i);
    }
  }

  // Pre-calculate pairwise distances
  for (let i = 0; i < n; i++) {
    const ownCluster = assignments[i];
    if (ownCluster < 0 || ownCluster >= k) {
      sampleSilhouettes[i] = -1; // noise
      continue;
    }
    const sameMembers = clusterMemberIndices[ownCluster];

    if (sameMembers.length <= 1) {
      sampleSilhouettes[i] = 0;
      continue;
    }

    // a(i)
    let aSum = 0;
    for (const m of sameMembers) {
      if (m !== i) aSum += dist(matrix[i], matrix[m]);
    }
    const ai = aSum / (sameMembers.length - 1);

    // b(i)
    let minB = Infinity;
    for (let otherC = 0; otherC < k; otherC++) {
      if (otherC === ownCluster) continue;
      const otherMembers = clusterMemberIndices[otherC];
      if (otherMembers.length === 0) continue;

      let bSum = 0;
      for (const m of otherMembers) {
        bSum += dist(matrix[i], matrix[m]);
      }
      const biCandidate = bSum / otherMembers.length;
      if (biCandidate < minB) minB = biCandidate;
    }

    const bi = isFinite(minB) ? minB : ai;
    const denom = Math.max(ai, bi);
    sampleSilhouettes[i] = denom > 0 ? (bi - ai) / denom : 0;
  }

  // Aggregate Silhouette
  const silhouettePerCluster: Record<number, number> = {};
  let totalValidSil = 0;
  let countValid = 0;

  for (let c = 0; c < k; c++) {
    const members = clusterMemberIndices[c];
    if (members.length > 0) {
      const cSum = members.reduce((sum, idx) => sum + sampleSilhouettes[idx], 0);
      silhouettePerCluster[c] = +(cSum / members.length).toFixed(3);
      totalValidSil += cSum;
      countValid += members.length;
    } else {
      silhouettePerCluster[c] = 0;
    }
  }

  const overallSilhouette = countValid > 0 ? +(totalValidSil / countValid).toFixed(3) : 0;

  // 2. Davies-Bouldin Index
  // R_ij = (s_i + s_j) / d(c_i, c_j) where s_i is avg distance to centroid
  const avgDistToCentroid: number[] = new Array(k).fill(0);
  for (let c = 0; c < k; c++) {
    const members = clusterMemberIndices[c];
    if (members.length > 0 && centroids[c]) {
      let sum = 0;
      for (const m of members) sum += dist(matrix[m], centroids[c]);
      avgDistToCentroid[c] = sum / members.length;
    }
  }

  let dbSum = 0;
  for (let i = 0; i < k; i++) {
    let maxR = 0;
    for (let j = 0; j < k; j++) {
      if (i !== j && centroids[i] && centroids[j]) {
        const centroidD = dist(centroids[i], centroids[j]);
        if (centroidD > 0) {
          const R = (avgDistToCentroid[i] + avgDistToCentroid[j]) / centroidD;
          if (R > maxR) maxR = R;
        }
      }
    }
    dbSum += maxR;
  }
  const daviesBouldin = +(dbSum / (k || 1)).toFixed(3);

  // 3. Calinski-Harabasz Index (Variance Ratio Criterion)
  // CH = [SSB / (k - 1)] / [SSW / (n - k)]
  // SSW = sum of distSq(x, c_k)
  // SSB = sum of n_k * distSq(c_k, global_centroid)
  const globalCentroid = new Array(p).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < p; j++) globalCentroid[j] += matrix[i][j];
  }
  for (let j = 0; j < p; j++) globalCentroid[j] /= n;

  let ssb = 0;
  let ssw = 0;

  for (let c = 0; c < k; c++) {
    const members = clusterMemberIndices[c];
    if (members.length > 0 && centroids[c]) {
      ssb += members.length * distSq(centroids[c], globalCentroid);
      for (const m of members) {
        ssw += distSq(matrix[m], centroids[c]);
      }
    }
  }

  const chNumerator = k > 1 ? ssb / (k - 1) : 0;
  const chDenominator = n > k ? ssw / (n - k) : 1;
  const calinskiHarabasz = chDenominator > 0 ? +(chNumerator / chDenominator).toFixed(1) : 0;

  return {
    silhouetteScore: overallSilhouette,
    silhouettePerCluster,
    silhouetteSampleScores: sampleSilhouettes,
    daviesBouldin,
    calinskiHarabasz,
  };
}

// Master execution function orchestrating preprocessing, model execution, PCA, and metrics
export function executeClustering(
  rawData: Record<string, any>[],
  config: ClusteringConfig
): ClusteringResult {
  const startTime = performance.now();
  const { matrix, means, stds } = standardizeMatrix(rawData, config.selectedFeatures);
  const n = rawData.length;
  const k = Math.max(2, config.k);

  let assignments: number[];
  let centroids: number[][];
  let convergenceIterations = 0;
  let wcss = 0;
  let aic: number | undefined;
  let bic: number | undefined;

  if (config.algorithm === 'kmeans') {
    const km = runKMeans(matrix, k, config.seed, config.maxIterations, config.distanceMetric);
    assignments = km.assignments;
    centroids = km.centroids;
    convergenceIterations = km.iterations;
    wcss = km.wcss;
  } else if (config.algorithm === 'hierarchical') {
    const hc = runHierarchical(matrix, k, config.linkage);
    assignments = hc.assignments;
    centroids = hc.centroids;
    convergenceIterations = n - k;
    for (let i = 0; i < n; i++) {
      if (assignments[i] >= 0 && centroids[assignments[i]]) {
        wcss += distSq(matrix[i], centroids[assignments[i]]);
      }
    }
  } else if (config.algorithm === 'dbscan') {
    const db = runDBSCAN(matrix, config.epsilon, config.minPts);
    assignments = db.assignments;
    centroids = db.centroids;
    convergenceIterations = 1;
    for (let i = 0; i < n; i++) {
      if (assignments[i] >= 0 && centroids[assignments[i]]) {
        wcss += distSq(matrix[i], centroids[assignments[i]]);
      }
    }
  } else {
    // GMM
    const gmm = runGMM(matrix, k, config.seed, config.maxIterations);
    assignments = gmm.assignments;
    centroids = gmm.centroids;
    aic = gmm.aic;
    bic = gmm.bic;
    convergenceIterations = 45;
    for (let i = 0; i < n; i++) {
      if (assignments[i] >= 0 && centroids[assignments[i]]) {
        wcss += distSq(matrix[i], centroids[assignments[i]]);
      }
    }
  }

  // Cluster sizes and percentages
  const clusterSizes: Record<number, number> = {};
  const clusterPercentages: Record<number, number> = {};
  for (let c = 0; c < k; c++) clusterSizes[c] = 0;

  for (let i = 0; i < n; i++) {
    const c = assignments[i];
    clusterSizes[c] = (clusterSizes[c] || 0) + 1;
  }

  for (const c of Object.keys(clusterSizes)) {
    const numC = Number(c);
    clusterPercentages[numC] = +((clusterSizes[numC] / n) * 100).toFixed(1);
  }

  // Restore Centroids to Original Scale for Business Intuition
  const centroidsOriginalScale: Record<string, number>[] = centroids.map((cVector) => {
    const orig: Record<string, number> = {};
    config.selectedFeatures.forEach((feat, idx) => {
      const val = (cVector[idx] || 0) * (stds[feat] || 1) + (means[feat] || 0);
      orig[feat] = +val.toFixed(2);
    });
    return orig;
  });

  // Calculate Metrics (Silhouette, Davies-Bouldin, Calinski-Harabasz)
  const metrics = computeClusteringMetrics(matrix, assignments, k, centroids);

  // Run PCA on standardized matrix
  const pca = runPCA(matrix, config.selectedFeatures);

  const executionTimeMs = +(performance.now() - startTime).toFixed(1);

  return {
    algorithm: config.algorithm,
    k,
    features: config.selectedFeatures,
    clusterAssignments: assignments,
    centroids,
    centroidsOriginalScale,
    clusterSizes,
    clusterPercentages,
    wcss: +wcss.toFixed(1),
    silhouetteScore: metrics.silhouetteScore,
    silhouettePerCluster: metrics.silhouettePerCluster,
    silhouetteSampleScores: metrics.silhouetteSampleScores,
    daviesBouldin: metrics.daviesBouldin,
    calinskiHarabasz: metrics.calinskiHarabasz,
    aic,
    bic,
    pca,
    convergenceIterations,
    executionTimeMs,
    timestamp: new Date().toISOString(),
  };
}
