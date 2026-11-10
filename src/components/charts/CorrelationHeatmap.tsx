import React, { useState } from 'react';

interface CorrelationHeatmapProps {
  matrix: { [colA: string]: { [colB: string]: number } };
  features: string[];
}

export const CorrelationHeatmap: React.FC<CorrelationHeatmapProps> = ({ matrix, features }) => {
  const [hoveredCell, setHoveredCell] = useState<{
    colA: string;
    colB: string;
    r: number;
  } | null>(null);

  if (!features || features.length === 0) {
    return <div className="text-slate-400 p-4 text-xs">Sin variables numéricas para correlación.</div>;
  }

  // Display max 8 features in heatmap to keep it pristine and legible
  const displayedCols = features.slice(0, 8);

  function getCellBg(r: number) {
    if (r === 1) return 'bg-blue-600 text-white font-bold';
    if (r >= 0.7) return 'bg-blue-500 text-white font-semibold';
    if (r >= 0.4) return 'bg-blue-200 text-blue-900';
    if (r >= 0.15) return 'bg-blue-100 text-blue-800';
    if (r <= -0.7) return 'bg-rose-600 text-white font-semibold';
    if (r <= -0.4) return 'bg-rose-200 text-rose-900';
    if (r <= -0.15) return 'bg-rose-100 text-rose-800';
    return 'bg-slate-50 text-slate-600';
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
        <div>
          <h4 className="text-xs font-bold text-slate-900 tracking-tight">
            Matriz de Correlación Lineal de Pearson (r)
          </h4>
          <p className="text-[11px] text-slate-500">
            Valores entre -1 y +1. Permite identificar multicolinealidad antes de segmentar.
          </p>
        </div>
        {hoveredCell && (
          <div className="text-xs bg-slate-900 text-white px-2.5 py-1 rounded shadow-xs font-mono">
            {hoveredCell.colA} ↔ {hoveredCell.colB}: <span className="font-bold text-blue-300">r = {hoveredCell.r > 0 ? '+' : ''}{hoveredCell.r}</span>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-[11px]">
          <thead>
            <tr>
              <th className="p-1.5 text-left text-slate-400 font-semibold max-w-[100px] truncate">
                Variable
              </th>
              {displayedCols.map((col) => (
                <th
                  key={col}
                  className="p-1.5 text-center text-slate-600 font-semibold max-w-[80px] truncate"
                  title={col}
                >
                  {col.replace(/_/g, ' ').slice(0, 8)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayedCols.map((rowCol) => (
              <tr key={rowCol} className="border-t border-slate-100">
                <td className="p-1.5 font-medium text-slate-700 truncate max-w-[110px]" title={rowCol}>
                  {rowCol.replace(/_/g, ' ')}
                </td>
                {displayedCols.map((colCol) => {
                  const r = matrix[rowCol]?.[colCol] ?? (rowCol === colCol ? 1 : 0);
                  const bgClass = getCellBg(r);

                  return (
                    <td
                      key={colCol}
                      onMouseEnter={() => setHoveredCell({ colA: rowCol, colB: colCol, r })}
                      onMouseLeave={() => setHoveredCell(null)}
                      className={`p-1.5 text-center font-mono cursor-pointer transition-colors ${bgClass}`}
                    >
                      {r.toFixed(2)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Color Legend */}
      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 bg-rose-500 rounded-xs inline-block" /> Inversa fuerte (-1.0)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 bg-slate-100 border border-slate-300 rounded-xs inline-block" /> Sin correlación (0.0)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 bg-blue-600 rounded-xs inline-block" /> Directa fuerte (+1.0)
        </span>
      </div>
    </div>
  );
};
