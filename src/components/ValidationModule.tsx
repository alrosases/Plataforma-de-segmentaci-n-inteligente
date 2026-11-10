import React from 'react';
import { useData } from '../context/DataContext';
import { ElbowChart } from './charts/ElbowChart';
import { SilhouettePlot } from './charts/SilhouettePlot';
import {
  CheckCircle,
  HelpCircle,
  TrendingDown,
  Layers,
  ArrowRight,
  ShieldCheck,
  Award,
  BookOpen,
} from 'lucide-react';

export const ValidationModule: React.FC = () => {
  const {
    validationSuite,
    clusteringResult,
    clusterProfiles,
    clusteringConfig,
    setClusteringConfig,
    runClustering,
    setActiveTab,
  } = useData();

  if (!validationSuite || !clusteringResult) {
    return (
      <div className="p-8 text-center bg-white rounded-lg border border-slate-200">
        <p className="text-xs text-slate-500">Ejecuta el modelo para calcular las métricas de validación.</p>
      </div>
    );
  }

  const clusterColors = clusterProfiles.map((p) => p.color);
  const clusterNames = clusterProfiles.map((p) => p.name);

  function applyK(newK: number) {
    setClusteringConfig((prev) => ({ ...prev, k: newK }));
    setTimeout(() => {
      runClustering();
    }, 50);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            <span>Validación Estadística & Selección de Modelos</span>
          </h2>
          <p className="text-xs text-slate-500">
            Diagnóstico de bondad de ajuste con Método del Codo, Coeficiente de Silueta, Davies-Bouldin y Calinski-Harabasz.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('profiling')}
          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
        >
          <span>Ir a Perfilamiento de Clientes</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Grid: Elbow Chart + Silhouette Plot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <ElbowChart
            elbowCurve={validationSuite.elbowCurve}
            currentK={clusteringConfig.k}
            onSelectK={applyK}
          />
        </div>

        <div className="lg:col-span-6">
          <SilhouettePlot
            silhouetteScore={clusteringResult.silhouetteScore}
            silhouettePerCluster={clusteringResult.silhouettePerCluster}
            clusterColors={clusterColors}
            clusterNames={clusterNames}
          />
        </div>
      </div>

      {/* Model Comparison Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h4 className="text-xs font-bold text-slate-900 tracking-tight uppercase flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              Tabla Comparativa Multicriterio de Configuraciones (K=2 a K=7)
            </h4>
            <p className="text-[11px] text-slate-500">
              Evaluación simultánea de compacidad (WCSS), separación (Silueta) y densidad (Calinski-Harabasz).
            </p>
          </div>

          <span className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded font-semibold">
            K Óptimo Recomendado: K = {validationSuite.recommendedK}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-100/70 text-slate-700">
              <tr>
                <th className="px-3.5 py-2.5 text-left font-bold">Configuración</th>
                <th className="px-3.5 py-2.5 text-right font-bold">Inercia (WCSS)</th>
                <th className="px-3.5 py-2.5 text-right font-bold">Silueta Global</th>
                <th className="px-3.5 py-2.5 text-right font-bold">Davies-Bouldin (↓)</th>
                <th className="px-3.5 py-2.5 text-right font-bold">Calinski-Harabasz (↑)</th>
                <th className="px-3.5 py-2.5 text-left font-bold">Diagnóstico Metodológico</th>
                <th className="px-3.5 py-2.5 text-center font-bold">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {validationSuite.comparisonTable.map((row) => {
                const isCurrent = row.k === clusteringConfig.k;
                const isRec = row.isRecommended;

                return (
                  <tr
                    key={row.k}
                    className={`transition-colors ${
                      isCurrent
                        ? 'bg-blue-50/70 font-semibold'
                        : isRec
                        ? 'bg-emerald-50/40'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="px-3.5 py-2.5 text-slate-900 flex items-center space-x-2">
                      <span className="font-bold">{row.algorithm}</span>
                      {isRec && (
                        <span className="text-[9px] bg-amber-100 text-amber-800 border border-amber-300 px-1.5 py-0.2 rounded font-bold uppercase">
                          Óptimo
                        </span>
                      )}
                      {isCurrent && (
                        <span className="text-[9px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-bold uppercase">
                          Activo
                        </span>
                      )}
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-mono text-slate-700">
                      {row.wcss.toLocaleString()}
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-mono font-bold text-blue-700">
                      {row.silhouette.toFixed(3)}
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-mono text-slate-600">
                      {row.daviesBouldin}
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-mono text-slate-600">
                      {row.calinskiHarabasz.toLocaleString()}
                    </td>
                    <td className="px-3.5 py-2.5 text-[11px] text-slate-600">
                      {row.notes}
                    </td>
                    <td className="px-3.5 py-2.5 text-center">
                      <button
                        onClick={() => applyK(row.k)}
                        disabled={isCurrent}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                          isCurrent
                            ? 'bg-slate-200 text-slate-500 cursor-default'
                            : 'bg-slate-900 text-white hover:bg-slate-800 shadow-xs'
                        }`}
                      >
                        {isCurrent ? 'Seleccionado' : 'Elegir K=' + row.k}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Methodological Guidance Cards: Assumptions, Strengths, Limitations */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Supuestos Estadísticos, Ventajas y Limitaciones Metodológicas
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {validationSuite.methodologyNotes.map((m) => (
            <div key={m.algorithm} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <span className="font-bold text-slate-900 block pb-1 border-b border-slate-200">
                {m.algorithm}
              </span>

              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Supuestos:</span>
                <ul className="list-disc list-inside text-[11px] text-slate-600 space-y-0.5">
                  {m.assumptions.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="text-[10px] font-bold text-emerald-700 uppercase block">Fortalezas:</span>
                <ul className="list-disc list-inside text-[11px] text-slate-600 space-y-0.5">
                  {m.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="text-[10px] font-bold text-rose-700 uppercase block">Limitaciones:</span>
                <ul className="list-disc list-inside text-[11px] text-slate-600 space-y-0.5">
                  {m.limitations.map((l, i) => (
                    <li key={i}>{l}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
