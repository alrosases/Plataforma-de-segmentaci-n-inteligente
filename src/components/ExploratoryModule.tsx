import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { CorrelationHeatmap } from './charts/CorrelationHeatmap';
import { generateFourFoldInsights } from '../services/dataProcessor';
import {
  BarChart3,
  TrendingUp,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  ArrowRight,
} from 'lucide-react';

export const ExploratoryModule: React.FC = () => {
  const { univariateStats, correlationMatrix, processedData, setActiveTab } = useData();
  const [selectedVarIndex, setSelectedVarIndex] = useState<number>(0);
  const [scatterX, setScatterX] = useState<string>(univariateStats[0]?.column || '');
  const [scatterY, setScatterY] = useState<string>(univariateStats[1]?.column || univariateStats[0]?.column || '');

  if (univariateStats.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-lg border border-slate-200">
        <p className="text-xs text-slate-500">No hay variables numéricas para análisis exploratorio.</p>
      </div>
    );
  }

  const currentStat = univariateStats[selectedVarIndex] || univariateStats[0];
  const fourFoldInsights = generateFourFoldInsights(univariateStats, correlationMatrix);

  // Scatter plot points for scatterX vs scatterY
  const scatterPoints = processedData.map((row) => ({
    x: Number(row[scatterX]) || 0,
    y: Number(row[scatterY]) || 0,
  }));

  const minX = Math.min(...scatterPoints.map((p) => p.x));
  const maxX = Math.max(...scatterPoints.map((p) => p.x));
  const minY = Math.min(...scatterPoints.map((p) => p.y));
  const maxY = Math.max(...scatterPoints.map((p) => p.y));

  const spanX = maxX - minX || 1;
  const spanY = maxY - minY || 1;

  const width = 500;
  const height = 280;
  const pad = 45;

  const scaleX = (x: number) => pad + ((x - minX) / spanX) * (width - 2 * pad);
  const scaleY = (y: number) => height - pad - ((y - minY) / spanY) * (height - 2 * pad);

  // Linear trendline slope & intercept (least squares)
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;
  const n = scatterPoints.length;

  scatterPoints.forEach((p) => {
    sumX += p.x;
    sumY += p.y;
    sumXY += p.x * p.y;
    sumX2 += p.x * p.x;
  });

  const slope = n * sumX2 - sumX * sumX !== 0 ? (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX) : 0;
  const intercept = (sumY - slope * sumX) / n;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span>Análisis Estadístico Exploratorio (EDA)</span>
          </h2>
          <p className="text-xs text-slate-500">
            Estadística descriptiva univariada, distribuciones, detección de outliers, correlaciones e interpretaciones de negocio.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('preparation')}
          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
        >
          <span>Ir a Preparación de Variables</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Univariate Summary Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            Estadísticos Descriptivos Univariados
          </span>
          <span className="text-[11px] text-slate-500">
            Haz clic en una fila para ver el histograma y boxplot detallado.
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-100/70 text-slate-700">
              <tr>
                <th className="px-3 py-2 text-left font-bold">Variable</th>
                <th className="px-3 py-2 text-right font-bold">Media</th>
                <th className="px-3 py-2 text-right font-bold">Mediana</th>
                <th className="px-3 py-2 text-right font-bold">Desv. Est.</th>
                <th className="px-3 py-2 text-right font-bold">CV (%)</th>
                <th className="px-3 py-2 text-right font-bold">Mín / Máx</th>
                <th className="px-3 py-2 text-right font-bold">Q1 / Q3</th>
                <th className="px-3 py-2 text-right font-bold">Asimetría</th>
                <th className="px-3 py-2 text-right font-bold">Curtosis</th>
                <th className="px-3 py-2 text-center font-bold">Outliers</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {univariateStats.map((st, idx) => {
                const isSelected = selectedVarIndex === idx;
                const isHighSkew = Math.abs(st.skewness) > 1.0;

                return (
                  <tr
                    key={st.column}
                    onClick={() => setSelectedVarIndex(idx)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50/80 font-medium' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="px-3 py-2 text-slate-900 font-semibold flex items-center space-x-1.5">
                      <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-blue-600' : 'bg-transparent'}`} />
                      <span>{st.column}</span>
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-slate-700">{st.mean.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right font-mono text-slate-700">{st.median.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right font-mono text-slate-600">{st.stdDev.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right font-mono text-slate-600">{st.cv}%</td>
                    <td className="px-3 py-2 text-right font-mono text-slate-500">
                      [{st.min.toLocaleString()} – {st.max.toLocaleString()}]
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-slate-500">
                      [{st.q1.toLocaleString()} – {st.q3.toLocaleString()}]
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      <span className={isHighSkew ? 'text-amber-600 font-bold' : 'text-slate-600'}>
                        {st.skewness > 0 ? '+' : ''}
                        {st.skewness}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-slate-600">{st.kurtosis}</td>
                    <td className="px-3 py-2 text-center font-mono">
                      {st.outlierCount > 0 ? (
                        <span className="text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded text-[10px]">
                          {st.outlierCount}
                        </span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid: Deep Dive on Selected Variable + Bivariate Scatter */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Distribution Histogram & Boxplot for currentStat (6 cols) */}
        <div className="lg:col-span-6 bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h4 className="text-xs font-bold text-slate-900 tracking-tight">
                Distribución e Histograma: {currentStat.column}
              </h4>
              <p className="text-[11px] text-slate-500">
                Frecuencias relativas y dispersión por intervalos.
              </p>
            </div>
            <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-semibold border border-blue-200">
              IQR: {currentStat.iqr.toLocaleString()}
            </span>
          </div>

          {/* Histogram SVG */}
          <div className="h-44 w-full flex items-end space-x-1.5 pt-4 px-2 pb-6 border-b border-slate-100 bg-slate-50/50 rounded">
            {currentStat.histogram.map((bin, i) => {
              const maxCount = Math.max(...currentStat.histogram.map((b) => b.count)) || 1;
              const heightPct = Math.max(8, Math.round((bin.count / maxCount) * 100));

              return (
                <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                  <div className="text-[10px] font-mono text-slate-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {bin.count}
                  </div>
                  <div
                    className="w-full bg-blue-600 group-hover:bg-blue-700 rounded-t transition-all"
                    style={{ height: `${heightPct}%` }}
                  />
                  <div className="text-[9px] font-mono text-slate-400 mt-1 truncate max-w-full">
                    {bin.binStart}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Boxplot Diagram */}
          <div className="pt-2 text-xs">
            <span className="text-[11px] font-bold text-slate-700 block mb-2">
              Diagrama de Caja (Boxplot de Tukey):
            </span>
            <div className="relative h-10 w-full flex items-center px-4">
              {/* Whiskers line */}
              <div className="absolute left-4 right-4 h-0.5 bg-slate-300" />
              {/* Box Q1 to Q3 */}
              <div
                className="absolute h-6 bg-blue-100 border border-blue-500 rounded-xs flex items-center justify-center text-[10px] text-blue-900 font-mono font-bold"
                style={{
                  left: `${Math.max(5, Math.min(85, ((currentStat.q1 - currentStat.min) / (currentStat.range || 1)) * 90))}%`,
                  width: `${Math.max(10, Math.min(80, (currentStat.iqr / (currentStat.range || 1)) * 90))}%`,
                }}
              >
                IQR
              </div>
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-500 px-4">
              <span>Mín: {currentStat.min}</span>
              <span>Q1: {currentStat.q1}</span>
              <span className="font-bold text-blue-700">Mediana: {currentStat.median}</span>
              <span>Q3: {currentStat.q3}</span>
              <span>Máx: {currentStat.max}</span>
            </div>
          </div>
        </div>

        {/* Right: Bivariate Scatter Plot with Trendline (6 cols) */}
        <div className="lg:col-span-6 bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <div>
              <h4 className="text-xs font-bold text-slate-900 tracking-tight">
                Diagrama de Dispersión Bivariada
              </h4>
              <p className="text-[11px] text-slate-500">
                Inspección de relaciones lineales y curvaturas no lineales.
              </p>
            </div>

            <div className="flex items-center space-x-1.5 text-xs">
              <select
                value={scatterX}
                onChange={(e) => setScatterX(e.target.value)}
                className="text-xs border border-slate-200 rounded px-2 py-1 bg-slate-50 font-medium max-w-[120px]"
              >
                {univariateStats.map((s) => (
                  <option key={s.column} value={s.column}>
                    X: {s.column}
                  </option>
                ))}
              </select>
              <span className="text-slate-400">vs</span>
              <select
                value={scatterY}
                onChange={(e) => setScatterY(e.target.value)}
                className="text-xs border border-slate-200 rounded px-2 py-1 bg-slate-50 font-medium max-w-[120px]"
              >
                {univariateStats.map((s) => (
                  <option key={s.column} value={s.column}>
                    Y: {s.column}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* SVG Bivariate Scatter */}
          <div className="relative w-full h-56 flex items-center justify-center bg-slate-50/50 rounded border border-slate-100">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full select-none">
              {/* Trendline */}
              <line
                x1={scaleX(minX)}
                y1={scaleY(slope * minX + intercept)}
                x2={scaleX(maxX)}
                y2={scaleY(slope * maxX + intercept)}
                stroke="#2563eb"
                strokeWidth="2"
                strokeDasharray="4 4"
              />

              {/* Points */}
              {scatterPoints.slice(0, 300).map((p, idx) => (
                <circle
                  key={idx}
                  cx={scaleX(p.x)}
                  cy={scaleY(p.y)}
                  r={3.5}
                  fill="#3b82f6"
                  fillOpacity="0.6"
                  stroke="#ffffff"
                  strokeWidth="0.8"
                />
              ))}

              <text x={width / 2} y={height - 10} textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="600">
                Eje X: {scatterX}
              </text>
              <text
                x={14}
                y={height / 2}
                textAnchor="middle"
                fill="#64748b"
                fontSize="10"
                fontWeight="600"
                transform={`rotate(-90, 14, ${height / 2})`}
              >
                Eje Y: {scatterY}
              </text>
            </svg>
          </div>
        </div>
      </div>

      {/* Pearson Correlation Heatmap */}
      <div>
        <CorrelationHeatmap matrix={correlationMatrix} features={univariateStats.map((s) => s.column)} />
      </div>

      {/* 4-Part Analytical Insights (Resultado observado, Interpretación, Implicación, Posible acción) */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Interpretaciones Analíticas de 4 Frentes (Metodología Empresarial)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fourFoldInsights.map((insight, idx) => (
            <div key={idx} className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                <span className="font-bold text-xs text-blue-900">{insight.variableOrPair}</span>
                <span className="text-[10px] font-semibold text-slate-500 uppercase">Hallazgo #{idx + 1}</span>
              </div>

              <div className="text-xs space-y-2">
                <div>
                  <span className="text-[11px] font-bold text-slate-700 block">1. Resultado Observado:</span>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-mono">{insight.observedResult}</p>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-700 block">2. Interpretación Estadística:</span>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{insight.statisticalInterpretation}</p>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-700 block">3. Implicación Empresarial:</span>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{insight.businessImplication}</p>
                </div>
                <div className="bg-blue-50/70 p-2 rounded border border-blue-100">
                  <span className="text-[11px] font-bold text-blue-900 block">4. Posible Acción Recomendada:</span>
                  <p className="text-[11px] text-blue-800 leading-relaxed font-medium">{insight.recommendedAction}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
