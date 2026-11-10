import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import {
  Users2,
  TrendingUp,
  TrendingDown,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Target,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react';

export const ProfilingModule: React.FC = () => {
  const { clusterProfiles, clusteringResult, setActiveTab, selectedSegmentFilter, setSelectedSegmentFilter } = useData();
  const [activeProfileTab, setActiveProfileTab] = useState<number>(0);

  if (!clusteringResult || clusterProfiles.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-lg border border-slate-200">
        <p className="text-xs text-slate-500">No hay segmentos perfilados aún.</p>
      </div>
    );
  }

  const currentProfile = clusterProfiles[activeProfileTab] || clusterProfiles[0];
  const features = clusteringResult.features;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users2 className="w-5 h-5 text-blue-600" />
            <span>Perfilamiento Multidimensional de Clientes</span>
          </h2>
          <p className="text-xs text-slate-500">
            Fichas arquetípicas construidas a partir de la evidencia estadística real de los centroides y z-scores.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('strategy')}
          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
        >
          <span>Ir a Inteligencia Estratégica</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Segment Selector Tabs */}
      <div className="flex flex-wrap gap-2">
        {clusterProfiles.map((p, idx) => {
          const isSelected = activeProfileTab === idx;

          return (
            <button
              key={p.clusterId}
              onClick={() => setActiveProfileTab(idx)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg border text-xs font-bold transition-all ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
              <span>{p.name}</span>
              <span className="font-mono text-[11px] font-normal opacity-80">
                ({p.percentage}%)
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Active Segment Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
        {/* Top Header of the Profile */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-start space-x-3.5">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-extrabold text-lg shadow-sm"
              style={{ backgroundColor: currentProfile.color }}
            >
              {currentProfile.clusterId + 1}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                  {currentProfile.name}
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  Cluster #{currentProfile.clusterId + 1}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed max-w-2xl">
                {currentProfile.behaviorDescription}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4 bg-slate-50 p-3 rounded-lg border border-slate-200/80 shrink-0">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Clientes</span>
              <span className="text-base font-extrabold text-slate-900 font-mono">
                {currentProfile.size.toLocaleString()}
              </span>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">% Cartera</span>
              <span className="text-base font-extrabold text-blue-600 font-mono">
                {currentProfile.percentage}%
              </span>
            </div>
          </div>
        </div>

        {/* Differentiating Features Highlights */}
        <div>
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
            Variables de Mayor Poder Diferenciador (Z-Score relativo vs promedio general)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {currentProfile.differentiatingFeatures.slice(0, 6).map((diff) => {
              const isHigher = diff.direction === 'higher';

              return (
                <div
                  key={diff.feature}
                  className="p-3 rounded-lg bg-slate-50/70 border border-slate-200 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 truncate max-w-[150px]">
                      {diff.feature}
                    </span>
                    <span
                      className={`inline-flex items-center gap-0.5 text-[11px] font-mono font-bold px-1.5 py-0.2 rounded ${
                        isHigher
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {isHigher ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {isHigher ? '+' : ''}
                      {diff.relativeDifferencePercent}%
                    </span>
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                    <span>Cluster: <strong className="text-slate-800">{diff.clusterMean.toLocaleString()}</strong></span>
                    <span>Global: {diff.globalMean.toLocaleString()}</span>
                  </div>

                  <div className="text-[10px] text-slate-400">
                    Z-Score estandarizado: <strong>{diff.zScore > 0 ? '+' : ''}{diff.zScore}σ</strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Opportunities vs Risks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-lg bg-emerald-50/50 border border-emerald-200/80 space-y-2">
            <span className="text-xs font-bold text-emerald-900 uppercase tracking-wide flex items-center gap-1.5">
              <Target className="w-4 h-4 text-emerald-600" />
              Oportunidades Comerciales Clave
            </span>
            <ul className="space-y-1.5 text-xs text-emerald-950">
              {currentProfile.opportunities.map((opp, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{opp}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-lg bg-rose-50/50 border border-rose-200/80 space-y-2">
            <span className="text-xs font-bold text-rose-900 uppercase tracking-wide flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              Riesgos & Puntos de Fricción Identificados
            </span>
            <ul className="space-y-1.5 text-xs text-rose-950">
              {currentProfile.risks.map((risk, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Comprehensive Cross-Cluster Comparison Matrix */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-900 tracking-tight uppercase">
            Matriz Comparativa de Variables entre Todos los Segmentos (Medias Reales)
          </h4>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-100/70 text-slate-700">
              <tr>
                <th className="px-3.5 py-2.5 text-left font-bold">Variable Analizada</th>
                {clusterProfiles.map((p) => (
                  <th key={p.clusterId} className="px-3.5 py-2.5 text-right font-bold">
                    <span className="flex items-center justify-end gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                      <span className="truncate max-w-[120px]">{p.name}</span>
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {features.map((feat) => (
                <tr key={feat} className="hover:bg-slate-50">
                  <td className="px-3.5 py-2 font-semibold text-slate-800">{feat}</td>
                  {clusterProfiles.map((p) => {
                    const val = p.means[feat] ?? 0;
                    const diff = p.differentiatingFeatures.find((d) => d.feature === feat);
                    const isHigh = diff && diff.zScore > 0.4;
                    const isLow = diff && diff.zScore < -0.4;

                    return (
                      <td
                        key={p.clusterId}
                        className={`px-3.5 py-2 text-right font-mono ${
                          isHigh
                            ? 'bg-blue-50/70 font-bold text-blue-900'
                            : isLow
                            ? 'text-slate-400'
                            : 'text-slate-700'
                        }`}
                      >
                        {val.toLocaleString()}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
