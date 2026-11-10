import React from 'react';
import { useData } from '../context/DataContext';
import { PCAScatterPlot } from './charts/PCAScatterPlot';
import { AlgorithmType } from '../types';
import {
  PieChart,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Layers,
  Cpu,
  Clock,
  CheckCircle,
} from 'lucide-react';

export const ClusteringModule: React.FC = () => {
  const {
    clusteringConfig,
    setClusteringConfig,
    clusteringResult,
    runClustering,
    isProcessing,
    processedData,
    clusterProfiles,
    setActiveTab,
    selectedSegmentFilter,
    setSelectedSegmentFilter,
    businessContext,
  } = useData();

  const clusterColors = clusterProfiles.map((p) => p.color);
  const clusterNames = clusterProfiles.map((p) => p.name);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <PieChart className="w-5 h-5 text-blue-600" />
            <span>Motor de Segmentación Inteligente</span>
          </h2>
          <p className="text-xs text-slate-500">
            Ejecución multivariada de algoritmos de Machine Learning (K-Means, Jerárquico, DBSCAN y GMM) con reducción de dimensionalidad PCA.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('validation')}
          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
        >
          <span>Ir a Validación de Modelos</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Control Configuration Panel */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Parámetros de Configuración del Modelo
            </h3>
            <span className="text-[11px] text-slate-500">
              Modifica los hiperparámetros y ejecuta para re-segmentar en tiempo real.
            </span>
          </div>

          <button
            onClick={runClustering}
            disabled={isProcessing || clusteringConfig.selectedFeatures.length < 2}
            className="flex items-center space-x-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-bold shadow-xs transition-all disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Calculando...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Ejecutar Segmentación</span>
              </>
            )}
          </button>
        </div>

        {/* Algorithm Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(
            [
              { id: 'kmeans', name: 'K-Means', badge: 'Particional' },
              { id: 'hierarchical', name: 'Jerárquico (Ward)', badge: 'Aglomerativo' },
              { id: 'dbscan', name: 'DBSCAN', badge: 'Densidad' },
              { id: 'gmm', name: 'GMM (EM)', badge: 'Probabilístico' },
            ] as const
          ).map((algo) => {
            const isSelected = clusteringConfig.algorithm === algo.id;
            return (
              <button
                key={algo.id}
                onClick={() =>
                  setClusteringConfig((prev) => ({ ...prev, algorithm: algo.id as AlgorithmType }))
                }
                className={`p-3 rounded-lg border text-left transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-bold text-slate-900">{algo.name}</span>
                  <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    {algo.badge}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500">
                  {algo.id === 'kmeans' && 'Minimiza la inercia WCSS euclidiana.'}
                  {algo.id === 'hierarchical' && 'Árbol dendrograma paso a paso.'}
                  {algo.id === 'dbscan' && 'Detección de ruido y densidad.'}
                  {algo.id === 'gmm' && 'Mixturas Gaussianas suaves con AIC/BIC.'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Hyperparameters Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {/* K slider (for KMeans, Hierarchical, GMM) */}
          {clusteringConfig.algorithm !== 'dbscan' && (
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Número de Segmentos (K):</span>
                <span className="text-blue-600 font-mono text-sm">{clusteringConfig.k}</span>
              </div>
              <input
                type="range"
                min={2}
                max={8}
                value={clusteringConfig.k}
                onChange={(e) =>
                  setClusteringConfig((prev) => ({ ...prev, k: Number(e.target.value) }))
                }
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                <span>K=2</span>
                <span>K=5</span>
                <span>K=8</span>
              </div>
            </div>
          )}

          {/* DBSCAN parameters */}
          {clusteringConfig.algorithm === 'dbscan' && (
            <>
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Radio Epsilon (ε):</span>
                  <span className="text-blue-600 font-mono">{clusteringConfig.epsilon}</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={3.0}
                  step={0.1}
                  value={clusteringConfig.epsilon}
                  onChange={(e) =>
                    setClusteringConfig((prev) => ({ ...prev, epsilon: Number(e.target.value) }))
                  }
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Mínimo Puntos (MinPts):</span>
                  <span className="text-blue-600 font-mono">{clusteringConfig.minPts}</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={15}
                  value={clusteringConfig.minPts}
                  onChange={(e) =>
                    setClusteringConfig((prev) => ({ ...prev, minPts: Number(e.target.value) }))
                  }
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>
            </>
          )}

          {/* Seed */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Semilla Aleatoria (Seed):
            </label>
            <input
              type="number"
              value={clusteringConfig.seed}
              onChange={(e) =>
                setClusteringConfig((prev) => ({ ...prev, seed: Number(e.target.value) }))
              }
              className="w-full text-xs border border-slate-300 rounded px-3 py-1.5 bg-slate-50 font-mono"
            />
            <span className="text-[10px] text-slate-400">Garantiza reproducibilidad exacta.</span>
          </div>

          {/* Distance Metric */}
          {clusteringConfig.algorithm === 'kmeans' && (
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Métrica de Distancia:
              </label>
              <select
                value={clusteringConfig.distanceMetric}
                onChange={(e) =>
                  setClusteringConfig((prev) => ({ ...prev, distanceMetric: e.target.value as any }))
                }
                className="w-full text-xs border border-slate-300 rounded px-3 py-1.5 bg-slate-50 font-medium"
              >
                <option value="euclidean">Distancia Euclidiana</option>
                <option value="manhattan">Distancia Manhattan (L1)</option>
              </select>
            </div>
          )}

          {/* Linkage for Hierarchical */}
          {clusteringConfig.algorithm === 'hierarchical' && (
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Criterio de Enlace (Linkage):
              </label>
              <select
                value={clusteringConfig.linkage}
                onChange={(e) =>
                  setClusteringConfig((prev) => ({ ...prev, linkage: e.target.value as any }))
                }
                className="w-full text-xs border border-slate-300 rounded px-3 py-1.5 bg-slate-50 font-medium"
              >
                <option value="ward">Ward (Mínima Varianza)</option>
                <option value="complete">Complete (Máxima Distancia)</option>
                <option value="average">Average (Distancia Media)</option>
                <option value="single">Single (Mínima Distancia)</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Results View */}
      {clusteringResult && (
        <div className="space-y-6">
          {/* Execution Telemetry KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Silueta Promedio
                </span>
                <span className="text-base font-bold text-slate-900 font-mono">
                  {clusteringResult.silhouetteScore.toFixed(3)}
                </span>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Inercia WCSS
                </span>
                <span className="text-base font-bold text-slate-900 font-mono">
                  {clusteringResult.wcss.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Convergencia
                </span>
                <span className="text-base font-bold text-slate-900 font-mono">
                  {clusteringResult.convergenceIterations} iteraciones
                </span>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Tiempo de Cómputo
                </span>
                <span className="text-base font-bold text-slate-900 font-mono">
                  {clusteringResult.executionTimeMs} ms
                </span>
              </div>
            </div>
          </div>

          {/* PCA 2D Scatter Projection */}
          <PCAScatterPlot
            pca={clusteringResult.pca}
            clusterAssignments={clusteringResult.clusterAssignments}
            clusterColors={clusterColors}
            clusterNames={clusterNames}
            rawData={processedData}
            idColumn={businessContext.clientIdColumn}
            selectedCluster={selectedSegmentFilter}
            onSelectCluster={(c) => setSelectedSegmentFilter(c)}
          />

          {/* Centroids Table in Real Business Scale */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900 tracking-tight uppercase">
                  Centroides en Escala Real de Negocio (Medias de Cada Variable)
                </h4>
                <p className="text-[11px] text-slate-500">
                  Des-estandarizados a las unidades de medida originales de la base de datos.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-100/70 text-slate-700">
                  <tr>
                    <th className="px-3.5 py-2.5 text-left font-bold">Segmento</th>
                    <th className="px-3.5 py-2.5 text-center font-bold">Clientes</th>
                    <th className="px-3.5 py-2.5 text-center font-bold">% Cartera</th>
                    {clusteringResult.features.map((feat) => (
                      <th key={feat} className="px-3.5 py-2.5 text-right font-bold truncate max-w-[140px]">
                        {feat}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {clusterProfiles.map((p) => {
                    const origCentroid = clusteringResult.centroidsOriginalScale[p.clusterId] || {};

                    return (
                      <tr key={p.clusterId} className="hover:bg-slate-50">
                        <td className="px-3.5 py-2.5 font-bold text-slate-800 flex items-center space-x-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                          <span>{p.name}</span>
                        </td>
                        <td className="px-3.5 py-2.5 text-center font-mono text-slate-700">{p.size}</td>
                        <td className="px-3.5 py-2.5 text-center font-mono font-bold text-blue-700">
                          {p.percentage}%
                        </td>
                        {clusteringResult.features.map((feat) => (
                          <td key={feat} className="px-3.5 py-2.5 text-right font-mono text-slate-700">
                            {origCentroid[feat] !== undefined ? origCentroid[feat].toLocaleString() : '—'}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
