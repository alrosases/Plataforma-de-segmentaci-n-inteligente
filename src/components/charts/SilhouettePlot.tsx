import React from 'react';

interface SilhouettePlotProps {
  silhouetteScore: number;
  silhouettePerCluster: Record<number, number>;
  clusterColors: string[];
  clusterNames: string[];
}

export const SilhouettePlot: React.FC<SilhouettePlotProps> = ({
  silhouetteScore,
  silhouettePerCluster,
  clusterColors,
  clusterNames,
}) => {
  const clusters = Object.keys(silhouettePerCluster).map(Number);

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-xs font-bold text-slate-900 tracking-tight">
            Coeficiente de Silueta por Segmento s(i)
          </h4>
          <p className="text-[11px] text-slate-500">
            Mide cohesión interna vs separación externa (Rango [-1, 1]). &gt; 0.5 indica estructura sólida.
          </p>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-semibold uppercase text-slate-400 block">Silueta Global</span>
          <span
            className={`font-mono text-sm font-bold ${
              silhouetteScore >= 0.5
                ? 'text-emerald-600'
                : silhouetteScore >= 0.35
                ? 'text-blue-600'
                : 'text-amber-600'
            }`}
          >
            {silhouetteScore.toFixed(3)}
          </span>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        {clusters.map((c) => {
          const score = silhouettePerCluster[c] ?? 0;
          const color = clusterColors[c % clusterColors.length];
          const name = clusterNames[c] || `Cluster ${c + 1}`;
          const widthPercent = Math.max(2, Math.min(100, Math.round(score * 100)));

          return (
            <div key={c} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700 truncate max-w-[220px]">
                  {name}
                </span>
                <span className="font-mono text-[11px] font-semibold text-slate-600">
                  {score.toFixed(3)}
                </span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded overflow-hidden flex items-center">
                <div
                  className="h-full rounded transition-all duration-500"
                  style={{
                    width: `${widthPercent}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
            </div>
          );
        })}

        {/* Reference Threshold */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
          <span>0.00 (Solapamiento)</span>
          <span className="text-blue-600 font-semibold">0.50 (Estructura Fuerte)</span>
          <span>1.00 (Separación Ideal)</span>
        </div>
      </div>
    </div>
  );
};
