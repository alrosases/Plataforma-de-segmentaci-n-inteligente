import React from 'react';
import { useData } from '../context/DataContext';
import { PCAScatterPlot } from './charts/PCAScatterPlot';
import {
  Users,
  PieChart,
  Activity,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Crown,
  TrendingUp,
  FileSpreadsheet,
} from 'lucide-react';

export const DashboardModule: React.FC = () => {
  const {
    datasetName,
    processedData,
    clusteringResult,
    clusterProfiles,
    setActiveTab,
    selectedSegmentFilter,
    setSelectedSegmentFilter,
    businessContext,
  } = useData();

  if (!clusteringResult || clusterProfiles.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-lg border border-slate-200">
        <Layers className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <h3 className="text-sm font-bold text-slate-800">No hay modelo de segmentación activo</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
          Selecciona una base de datos o carga un archivo para ejecutar el análisis y visualizar los segmentos.
        </p>
        <button
          onClick={() => setActiveTab('upload')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-xs font-semibold hover:bg-blue-700"
        >
          Cargar o seleccionar datos
        </button>
      </div>
    );
  }

  // Identify prioritized champions and at-risk
  const championCluster =
    clusterProfiles.find((p) => p.name.includes('Champions') || p.name.includes('VIP')) ||
    clusterProfiles[0];
  const atRiskCluster = clusterProfiles.find(
    (p) => p.name.includes('Riesgo') || p.name.includes('Inactivos')
  );

  const clusterColors = clusterProfiles.map((p) => p.color);
  const clusterNames = clusterProfiles.map((p) => p.name);

  return (
    <div className="space-y-6">
      {/* Top Welcome & Context Banner */}
      <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-xl p-6 shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-blue-400 font-semibold tracking-wide uppercase mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span>Dashboard Ejecutivo • CRISP-DM Business Intelligence</span>
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">
            Segmentación Estratégica: {businessContext.sector}
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            {businessContext.objective}. Se han identificado {clusteringResult.k} agrupaciones con{' '}
            <strong className="text-white">algoritmo {clusteringResult.algorithm.toUpperCase()}</strong>{' '}
            y coeficiente de silueta global de{' '}
            <strong className="text-blue-300">{clusteringResult.silhouetteScore.toFixed(3)}</strong>.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => setActiveTab('gemini')}
            className="flex items-center space-x-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-all"
          >
            <Sparkles className="w-4 h-4 text-blue-200" />
            <span>Consultar con Gemini AI</span>
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className="flex items-center space-x-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold border border-slate-700 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Exportar Base</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Clientes</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-lg font-extrabold text-slate-900 font-mono">
            {processedData.length.toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5 truncate">{datasetName}</p>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Variables</span>
            <Activity className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-lg font-extrabold text-slate-900 font-mono">
            {clusteringResult.features.length}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Dimensiones activas</p>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Segmentos K</span>
            <PieChart className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-lg font-extrabold text-slate-900 font-mono">
            {clusteringResult.k}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5 uppercase font-medium text-emerald-700">
            {clusteringResult.algorithm}
          </p>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Silueta Global</span>
            <TrendingUp className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-lg font-extrabold text-slate-900 font-mono">
            {clusteringResult.silhouetteScore.toFixed(3)}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">
            {clusteringResult.silhouetteScore >= 0.4 ? 'Separación Sólida' : 'Separación Aceptable'}
          </p>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Grupo Líder</span>
            <Crown className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-lg font-extrabold text-slate-900 font-mono">
            {championCluster.percentage}%
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5 truncate">{championCluster.name}</p>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">PCA Varianza</span>
            <Layers className="w-4 h-4 text-violet-600" />
          </div>
          <div className="text-lg font-extrabold text-slate-900 font-mono">
            {(
              clusteringResult.pca.explainedVariance[0] + clusteringResult.pca.explainedVariance[1]
            ).toFixed(1)}
            %
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">PC1 + PC2 2D</p>
        </div>
      </div>

      {/* Main Grid: PCA Scatter Plot & Segment Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: PCA Projection Map (7 Cols) */}
        <div className="lg:col-span-7">
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
        </div>

        {/* Right Column: Strategic Segments Breakdown (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Distribución de Segmentos
            </h3>
            <button
              onClick={() => setActiveTab('profiling')}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
            >
              <span>Ver fichas completas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {clusterProfiles.map((p) => {
              const isSelected = selectedSegmentFilter === p.clusterId;
              const topDiff = p.differentiatingFeatures[0];

              return (
                <div
                  key={p.clusterId}
                  onClick={() =>
                    setSelectedSegmentFilter(isSelected ? null : p.clusterId)
                  }
                  className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-400 ring-2 ring-blue-500/30'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: p.color }}
                      />
                      <span className="font-bold text-xs text-slate-900">{p.name}</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-700">
                      {p.size} clientes ({p.percentage}%)
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed mb-2">
                    {p.behaviorDescription}
                  </p>

                  {topDiff && (
                    <div className="flex items-center justify-between text-[10px] bg-slate-50 px-2 py-1 rounded border border-slate-100">
                      <span className="text-slate-600 truncate max-w-[150px]">
                        Diferenciador: <strong>{topDiff.feature}</strong>
                      </span>
                      <span
                        className={`font-mono font-bold ${
                          topDiff.direction === 'higher' ? 'text-emerald-700' : 'text-slate-600'
                        }`}
                      >
                        {topDiff.direction === 'higher' ? '+' : ''}
                        {topDiff.relativeDifferencePercent}% vs media
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* At-Risk Warning Box */}
          {atRiskCluster && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 flex items-start space-x-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Alerta Estratégica de Abandono</span>
                <p className="text-[11px] text-amber-800 leading-relaxed mt-0.5">
                  El segmento <strong>{atRiskCluster.name}</strong> ({atRiskCluster.percentage}% de la cartera) requiere intervención inmediata para prevenir fuga de clientes.
                </p>
                <button
                  onClick={() => setActiveTab('strategy')}
                  className="mt-2 text-[11px] font-bold text-amber-900 underline hover:text-amber-950"
                >
                  Ver plan de retención en Matriz Estratégica →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
