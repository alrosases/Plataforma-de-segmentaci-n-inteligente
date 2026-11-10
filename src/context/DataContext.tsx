import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  BusinessContext,
  ClusteringConfig,
  ClusteringResult,
  ClusterProfile,
  ColumnMetadata,
  StrategicMatrixRow,
  TransformationStep,
  UnivariateStats,
} from '../types';
import { analyzeColumns, computeCorrelationMatrix, computeUnivariateStats } from '../services/dataProcessor';
import { executeClustering } from '../services/clusteringEngine';
import { runModelValidationSuite, ValidationSuiteResult } from '../services/validationService';
import { buildClusterProfiles, generateStrategicMatrix } from '../services/profilingEngine';
import { SAMPLE_DATASETS } from '../services/sampleDatasets';

interface DataContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  datasetName: string;
  rawData: Record<string, any>[];
  processedData: Record<string, any>[];
  columns: ColumnMetadata[];
  businessContext: BusinessContext;
  setBusinessContext: React.Dispatch<React.SetStateAction<BusinessContext>>;
  transformationHistory: TransformationStep[];
  univariateStats: UnivariateStats[];
  correlationMatrix: { [colA: string]: { [colB: string]: number } };
  clusteringConfig: ClusteringConfig;
  setClusteringConfig: React.Dispatch<React.SetStateAction<ClusteringConfig>>;
  clusteringResult: ClusteringResult | null;
  validationSuite: ValidationSuiteResult | null;
  clusterProfiles: ClusterProfile[];
  strategicMatrix: StrategicMatrixRow[];
  isProcessing: boolean;
  loadDataset: (name: string, data: Record<string, any>[], context?: Partial<BusinessContext>) => void;
  loadSampleDataset: (id: string) => void;
  updateColumnType: (colName: string, type: ColumnMetadata['type']) => void;
  toggleExcludeColumn: (colName: string) => void;
  applyTransformation: (type: TransformationStep['type'], targetCol?: string, params?: Record<string, any>) => void;
  undoTransformation: (id: string) => void;
  resetTransformations: () => void;
  runClustering: () => void;
  runValidation: () => void;
  selectedSegmentFilter: number | null;
  setSelectedSegmentFilter: (id: number | null) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [datasetName, setDatasetName] = useState<string>('Retail & E-commerce Omnicanal');
  const [rawData, setRawData] = useState<Record<string, any>[]>([]);
  const [processedData, setProcessedData] = useState<Record<string, any>[]>([]);
  const [columns, setColumns] = useState<ColumnMetadata[]>([]);
  const [transformationHistory, setTransformationHistory] = useState<TransformationStep[]>([]);
  const [univariateStats, setUnivariateStats] = useState<UnivariateStats[]>([]);
  const [correlationMatrix, setCorrelationMatrix] = useState<{ [colA: string]: { [colB: string]: number } }>({});

  const [businessContext, setBusinessContext] = useState<BusinessContext>({
    sector: 'Retail & E-Commerce Omnicanal',
    objective: 'Maximizar el valor de vida del cliente (CLV), fidelizar campeones y reactivar clientes en riesgo',
    analysisUnit: 'Cliente Individual (B2C)',
    clientIdColumn: 'ID_Cliente',
    period: 'Últimos 12 meses',
  });

  const [clusteringConfig, setClusteringConfig] = useState<ClusteringConfig>({
    algorithm: 'kmeans',
    k: 4,
    distanceMetric: 'euclidean',
    linkage: 'ward',
    epsilon: 1.2,
    minPts: 5,
    seed: 42,
    maxIterations: 100,
    selectedFeatures: [],
  });

  const [clusteringResult, setClusteringResult] = useState<ClusteringResult | null>(null);
  const [validationSuite, setValidationSuite] = useState<ValidationSuiteResult | null>(null);
  const [clusterProfiles, setClusterProfiles] = useState<ClusterProfile[]>([]);
  const [strategicMatrix, setStrategicMatrix] = useState<StrategicMatrixRow[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [selectedSegmentFilter, setSelectedSegmentFilter] = useState<number | null>(null);

  // Initialize with the first sample dataset on mount
  useEffect(() => {
    loadSampleDataset('retail_ecommerce');
  }, []);

  function loadDataset(name: string, data: Record<string, any>[], context?: Partial<BusinessContext>) {
    if (!data || data.length === 0) return;
    setIsProcessing(true);

    const cols = analyzeColumns(data);
    const numericCols = cols
      .filter((c) => (c.type === 'numeric_continuous' || c.type === 'numeric_discrete') && !c.isExcludedFromModeling)
      .map((c) => c.name);

    // Compute stats
    const stats = numericCols.map((cName) => {
      const vals = data.map((r) => Number(r[cName]) || 0);
      return computeUnivariateStats(vals, cName);
    });

    const corr = computeCorrelationMatrix(data, numericCols);

    setDatasetName(name);
    setRawData(data);
    setProcessedData([...data]);
    setColumns(cols);
    setUnivariateStats(stats);
    setCorrelationMatrix(corr);
    setTransformationHistory([]);

    const newContext: BusinessContext = {
      sector: context?.sector || 'Comercial / Servicios',
      objective: context?.objective || 'Segmentación conductual y optimización de cartera',
      analysisUnit: context?.analysisUnit || 'Cliente',
      clientIdColumn: context?.clientIdColumn || cols.find((c) => c.type === 'identifier')?.name || cols[0]?.name || 'ID',
      period: context?.period || 'Periodo Anual',
    };
    setBusinessContext(newContext);

    // Pick top numeric features for clustering
    const defaultFeatures = numericCols.slice(0, 6);
    const initialConfig: ClusteringConfig = {
      algorithm: 'kmeans',
      k: 4,
      distanceMetric: 'euclidean',
      linkage: 'ward',
      epsilon: 1.2,
      minPts: 5,
      seed: 42,
      maxIterations: 100,
      selectedFeatures: defaultFeatures,
    };
    setClusteringConfig(initialConfig);

    // Run initial clustering & profiling
    if (defaultFeatures.length >= 2) {
      try {
        const result = executeClustering(data, initialConfig);
        const profiles = buildClusterProfiles(data, result, newContext);
        const matrix = generateStrategicMatrix(profiles);
        const valSuite = runModelValidationSuite(data, defaultFeatures, initialConfig.seed);

        setClusteringResult(result);
        setClusterProfiles(profiles);
        setStrategicMatrix(matrix);
        setValidationSuite(valSuite);
      } catch (err) {
        console.error('Initial clustering error:', err);
      }
    }

    setIsProcessing(false);
  }

  function loadSampleDataset(id: string) {
    const sample = SAMPLE_DATASETS.find((s) => s.id === id) || SAMPLE_DATASETS[0];
    loadDataset(sample.title, sample.data, sample.context);
  }

  function updateColumnType(colName: string, type: ColumnMetadata['type']) {
    setColumns((prev) =>
      prev.map((c) => {
        if (c.name === colName) {
          const isExcluded = type === 'identifier' || type === 'date';
          return { ...c, type, isExcludedFromModeling: isExcluded };
        }
        return c;
      })
    );
  }

  function toggleExcludeColumn(colName: string) {
    setColumns((prev) =>
      prev.map((c) => (c.name === colName ? { ...c, isExcludedFromModeling: !c.isExcludedFromModeling } : c))
    );
    setClusteringConfig((prev) => {
      const isCurrentlySelected = prev.selectedFeatures.includes(colName);
      return {
        ...prev,
        selectedFeatures: isCurrentlySelected
          ? prev.selectedFeatures.filter((f) => f !== colName)
          : [...prev.selectedFeatures, colName],
      };
    });
  }

  function applyTransformation(type: TransformationStep['type'], targetCol?: string, params?: Record<string, any>) {
    let newData = [...processedData];
    let desc = '';
    const stepId = 'step_' + Date.now();

    if (type === 'remove_duplicates') {
      const seen = new Set<string>();
      const initialCount = newData.length;
      newData = newData.filter((row) => {
        const key = JSON.stringify(row);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      desc = `Eliminación de duplicados exactos (${initialCount - newData.length} filas removidas).`;
    } else if (type === 'impute_missing' && targetCol) {
      const method = params?.method || 'mean';
      const values = newData.map((r) => r[targetCol]).filter((v) => v !== null && v !== undefined && v !== '');
      let fillVal = 0;
      if (method === 'mean') {
        const sum = values.reduce((a, b) => a + Number(b), 0);
        fillVal = +(sum / values.length).toFixed(2);
      } else if (method === 'median') {
        const sorted = [...values].map(Number).sort((a, b) => a - b);
        fillVal = sorted[Math.floor(sorted.length / 2)] || 0;
      }
      newData = newData.map((row) => {
        if (row[targetCol] === null || row[targetCol] === undefined || row[targetCol] === '') {
          return { ...row, [targetCol]: fillVal };
        }
        return row;
      });
      desc = `Imputación de valores faltantes en '${targetCol}' por ${method} (${fillVal}).`;
    } else if (type === 'log_transform' && targetCol) {
      newData = newData.map((row) => {
        const v = Number(row[targetCol]) || 0;
        return {
          ...row,
          [targetCol]: +(Math.log(Math.max(0, v) + 1)).toFixed(3),
        };
      });
      desc = `Transformación logarítmica log(x + 1) aplicada a '${targetCol}'.`;
    } else if (type === 'filter_outliers' && targetCol) {
      const nums = newData.map((r) => Number(r[targetCol]) || 0).sort((a, b) => a - b);
      const q1 = nums[Math.floor(nums.length * 0.25)];
      const q3 = nums[Math.floor(nums.length * 0.75)];
      const iqr = q3 - q1;
      const lower = q1 - 1.5 * iqr;
      const upper = q3 + 1.5 * iqr;
      const initialCount = newData.length;

      if (params?.action === 'cap') {
        newData = newData.map((row) => {
          const v = Number(row[targetCol]) || 0;
          const capped = Math.max(lower, Math.min(upper, v));
          return { ...row, [targetCol]: +capped.toFixed(2) };
        });
        desc = `Winsorización / Acotado de outliers en '${targetCol}' al intervalo [${lower.toFixed(1)}, ${upper.toFixed(1)}].`;
      } else {
        newData = newData.filter((row) => {
          const v = Number(row[targetCol]) || 0;
          return v >= lower && v <= upper;
        });
        desc = `Filtrado de outliers en '${targetCol}': ${initialCount - newData.length} registros excluidos.`;
      }
    } else if (type === 'zscore_standardize' && targetCol) {
      const vals = newData.map((r) => Number(r[targetCol]) || 0);
      const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
      const std = Math.sqrt(vals.reduce((a, v) => a + Math.pow(v - mean, 2), 0) / vals.length) || 1;
      newData = newData.map((row) => ({
        ...row,
        [targetCol]: +((Number(row[targetCol]) - mean) / std).toFixed(3),
      }));
      desc = `Estandarización Z-Score de '${targetCol}' (Media=0, Desv=1).`;
    } else if (type === 'minmax_normalize' && targetCol) {
      const vals = newData.map((r) => Number(r[targetCol]) || 0);
      const min = Math.min(...vals);
      const max = Math.max(...vals);
      const range = max - min || 1;
      newData = newData.map((row) => ({
        ...row,
        [targetCol]: +((Number(row[targetCol]) - min) / range).toFixed(3),
      }));
      desc = `Normalización Min-Max de '${targetCol}' al rango [0, 1].`;
    }

    const step: TransformationStep = {
      id: stepId,
      timestamp: new Date().toLocaleTimeString(),
      type,
      description: desc || 'Transformación de datos',
      targetColumn: targetCol,
      params,
    };

    setTransformationHistory((prev) => [...prev, step]);
    setProcessedData(newData);

    // Recompute stats and clustering on processed data
    const numericCols = columns
      .filter((c) => (c.type === 'numeric_continuous' || c.type === 'numeric_discrete') && !c.isExcludedFromModeling)
      .map((c) => c.name);
    const stats = numericCols.map((cName) => {
      const vals = newData.map((r) => Number(r[cName]) || 0);
      return computeUnivariateStats(vals, cName);
    });
    setUnivariateStats(stats);
  }

  function undoTransformation(id: string) {
    const idx = transformationHistory.findIndex((t) => t.id === id);
    if (idx === -1) return;
    const remaining = transformationHistory.slice(0, idx);
    setTransformationHistory(remaining);

    // Replay remaining from rawData
    let current = [...rawData];
    // Simple reset to raw data
    setProcessedData(current);
  }

  function resetTransformations() {
    setProcessedData([...rawData]);
    setTransformationHistory([]);
  }

  function runClustering() {
    if (clusteringConfig.selectedFeatures.length < 2) return;
    setIsProcessing(true);

    setTimeout(() => {
      try {
        const result = executeClustering(processedData, clusteringConfig);
        const profiles = buildClusterProfiles(processedData, result, businessContext);
        const matrix = generateStrategicMatrix(profiles);
        setClusteringResult(result);
        setClusterProfiles(profiles);
        setStrategicMatrix(matrix);
      } catch (err) {
        console.error('Clustering run error:', err);
      } finally {
        setIsProcessing(false);
      }
    }, 50);
  }

  function runValidation() {
    if (clusteringConfig.selectedFeatures.length < 2) return;
    setIsProcessing(true);
    setTimeout(() => {
      try {
        const valSuite = runModelValidationSuite(
          processedData,
          clusteringConfig.selectedFeatures,
          clusteringConfig.seed
        );
        setValidationSuite(valSuite);
      } catch (err) {
        console.error('Validation suite error:', err);
      } finally {
        setIsProcessing(false);
      }
    }, 50);
  }

  return (
    <DataContext.Provider
      value={{
        activeTab,
        setActiveTab,
        datasetName,
        rawData,
        processedData,
        columns,
        businessContext,
        setBusinessContext,
        transformationHistory,
        univariateStats,
        correlationMatrix,
        clusteringConfig,
        setClusteringConfig,
        clusteringResult,
        validationSuite,
        clusterProfiles,
        strategicMatrix,
        isProcessing,
        loadDataset,
        loadSampleDataset,
        updateColumnType,
        toggleExcludeColumn,
        applyTransformation,
        undoTransformation,
        resetTransformations,
        runClustering,
        runValidation,
        selectedSegmentFilter,
        setSelectedSegmentFilter,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export function useData(): DataContextType {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error('useData must be used within a DataProvider');
  }
  return ctx;
}
