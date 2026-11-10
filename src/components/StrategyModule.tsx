import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import {
  Compass,
  DollarSign,
  ShieldAlert,
  Target,
  Megaphone,
  HeartHandshake,
  TrendingUp,
  BarChart,
  Sparkles,
  ArrowRight,
  Info,
} from 'lucide-react';

export const StrategyModule: React.FC = () => {
  const { strategicMatrix, clusterProfiles, setActiveTab, businessContext } = useData();
  const [selectedClusterFilter, setSelectedClusterFilter] = useState<number | null>(null);

  if (strategicMatrix.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-lg border border-slate-200">
        <p className="text-xs text-slate-500">No hay matriz estratégica disponible. Ejecuta primero la segmentación.</p>
      </div>
    );
  }

  const filteredMatrix =
    selectedClusterFilter !== null
      ? strategicMatrix.filter((row) => row.clusterId === selectedClusterFilter)
      : strategicMatrix;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Compass className="w-5 h-5 text-blue-600" />
            <span>Matriz Estratégica & Acciones de Negocio 360</span>
          </h2>
          <p className="text-xs text-slate-500">
            Conexión directa entre la evidencia estadística multivariada y las decisiones comerciales, de marketing y fidelización.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('gemini')}
          className="px-3.5 py-1.5 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
        >
          <Sparkles className="w-4 h-4 text-blue-200" />
          <span>Consultar Asistente Gemini AI</span>
        </button>
      </div>

      {/* Filter by Segment Buttons */}
      <div className="flex flex-wrap items-center gap-1.5 pb-2">
        <span className="text-xs font-bold text-slate-600 mr-2">Filtrar Segmento:</span>
        <button
          onClick={() => setSelectedClusterFilter(null)}
          className={`px-3 py-1 rounded text-xs font-semibold border transition-all ${
            selectedClusterFilter === null
              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          Todos ({strategicMatrix.length})
        </button>
        {strategicMatrix.map((r) => {
          const isSelected = selectedClusterFilter === r.clusterId;

          return (
            <button
              key={r.clusterId}
              onClick={() => setSelectedClusterFilter(isSelected ? null : r.clusterId)}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-semibold border transition-all ${
                isSelected
                  ? 'bg-white ring-2 ring-blue-500 font-bold text-slate-900 border-slate-400 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.color }} />
              <span>{r.clusterName}</span>
            </button>
          );
        })}
      </div>

      {/* Strategic Matrix Dimension Cards */}
      <div className="space-y-6">
        {filteredMatrix.map((row) => (
          <div
            key={row.clusterId}
            className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden"
          >
            {/* Segment Header Bar */}
            <div
              className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              style={{ backgroundColor: `${row.color}0a` }}
            >
              <div className="flex items-center space-x-3">
                <span
                  className="w-4 h-4 rounded-full shrink-0"
                  style={{ backgroundColor: row.color }}
                />
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    {row.clusterName}
                  </h3>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {row.size} clientes analizados ({row.percentage}% de la base activa)
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 shadow-2xs">
                  Cluster ID: #{row.clusterId + 1}
                </span>
              </div>
            </div>

            {/* 8 Strategic Dimensions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x border-b border-slate-100 divide-slate-100 text-xs">
              {/* Dim 1: Perfil */}
              <div className="p-4 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-blue-600" />
                  Perfil Conductual
                </span>
                <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
                  {row.profile}
                </p>
              </div>

              {/* Dim 2: Valor */}
              <div className="p-4 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  Potencial Económico
                </span>
                <p className="text-[11px] text-slate-700 leading-relaxed">
                  {row.economicValue}
                </p>
              </div>

              {/* Dim 3: Riesgo */}
              <div className="p-4 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                  Riesgo Identificable
                </span>
                <p className="text-[11px] text-slate-700 leading-relaxed">
                  {row.churnRisk}
                </p>
              </div>

              {/* Dim 4: Oportunidad */}
              <div className="p-4 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block flex items-center gap-1">
                  <Target className="w-3.5 h-3.5 text-cyan-600" />
                  Oportunidad Comercial
                </span>
                <p className="text-[11px] text-slate-700 leading-relaxed">
                  {row.opportunity}
                </p>
              </div>
            </div>

            {/* Second Row: Actions & KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100 text-xs bg-slate-50/50">
              {/* Dim 5: Marketing */}
              <div className="p-4 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block flex items-center gap-1">
                  <Megaphone className="w-3.5 h-3.5 text-indigo-600" />
                  Acción de Marketing
                </span>
                <p className="text-[11px] text-slate-800 leading-relaxed">
                  {row.marketingAction}
                </p>
              </div>

              {/* Dim 6: Retención */}
              <div className="p-4 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block flex items-center gap-1">
                  <HeartHandshake className="w-3.5 h-3.5 text-rose-600" />
                  Acción de Fidelización
                </span>
                <p className="text-[11px] text-slate-800 leading-relaxed">
                  {row.retentionAction}
                </p>
              </div>

              {/* Dim 7: Crecimiento */}
              <div className="p-4 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  Estrategia de Crecimiento
                </span>
                <p className="text-[11px] text-slate-800 leading-relaxed">
                  {row.growthStrategy}
                </p>
              </div>

              {/* Dim 8: KPIs */}
              <div className="p-4 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block flex items-center gap-1">
                  <BarChart className="w-3.5 h-3.5 text-blue-600" />
                  KPIs de Seguimiento
                </span>
                <div className="space-y-1">
                  {row.recommendedKpis.map((kpi, i) => (
                    <span
                      key={i}
                      className="inline-block text-[10px] font-semibold bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded mr-1 mb-1"
                    >
                      {kpi}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Methodological Transparency Note (Section 12 requirement) */}
      <div className="p-4 rounded-lg bg-blue-50/60 border border-blue-200 text-xs text-blue-900 flex items-start space-x-2.5">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold block">Transparencia Metodológica y Evidencia Cuantitativa:</span>
          Las recomendaciones anteriores se fundamentan exclusivamente en las variables analizadas en la base de datos ({businessContext.sector}). Cuando no existan variables directas de costo marginal unitario o tracking de deserción histórica, las proyecciones de rentabilidad y churn representan estimaciones heurísticas informadas que deberán validarse en pruebas A/B.
        </div>
      </div>
    </div>
  );
};
