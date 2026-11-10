import React, { useState } from 'react';
import { PCAResult } from '../../types';

interface PCAScatterPlotProps {
  pca: PCAResult;
  clusterAssignments: number[];
  clusterColors: string[];
  clusterNames: string[];
  rawData: Record<string, any>[];
  idColumn: string;
  selectedCluster: number | null;
  onSelectCluster?: (clusterId: number | null) => void;
}

export const PCAScatterPlot: React.FC<PCAScatterPlotProps> = ({
  pca,
  clusterAssignments,
  clusterColors,
  clusterNames,
  rawData,
  idColumn,
  selectedCluster,
  onSelectCluster,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<{
    id: string;
    cluster: number;
    pc1: number;
    pc2: number;
    row: Record<string, any>;
  } | null>(null);

  const n = pca.pc1.length;
  if (n === 0) return <div className="text-slate-400 p-8 text-center">Sin datos de PCA</div>;

  // Viewbox bounding box
  const minX = Math.min(...pca.pc1);
  const maxX = Math.max(...pca.pc1);
  const minY = Math.min(...pca.pc2);
  const maxY = Math.max(...pca.pc2);

  const spanX = maxX - minX || 1;
  const spanY = maxY - minY || 1;
  const padX = spanX * 0.1;
  const padY = spanY * 0.1;

  const width = 600;
  const height = 400;
  const padding = 50;

  const scaleX = (x: number) => padding + ((x - (minX - padX)) / (spanX + 2 * padX)) * (width - 2 * padding);
  const scaleY = (y: number) => height - padding - ((y - (minY - padY)) / (spanY + 2 * padY)) * (height - 2 * padding);

  // Group centroids in PCA space
  const centroidsPCA: { c: number; x: number; y: number; count: number }[] = [];
  const uniqueClusters = Array.from(new Set(clusterAssignments)).filter((c) => c >= 0);

  uniqueClusters.forEach((c) => {
    let sumX = 0;
    let sumY = 0;
    let count = 0;
    for (let i = 0; i < n; i++) {
      if (clusterAssignments[i] === c) {
        sumX += pca.pc1[i];
        sumY += pca.pc2[i];
        count++;
      }
    }
    if (count > 0) {
      centroidsPCA.push({ c, x: sumX / count, y: sumY / count, count });
    }
  });

  return (
    <div className="relative bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-100">
        <div>
          <h4 className="text-xs font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
            <span>Mapa Multivariado 2D (PCA)</span>
            <span className="text-[10px] font-normal text-slate-500">
              Varianza explicada: {(pca.explainedVariance[0] + pca.explainedVariance[1]).toFixed(1)}% (PC1: {pca.explainedVariance[0]}%, PC2: {pca.explainedVariance[1]}%)
            </span>
          </h4>
          <p className="text-[11px] text-slate-500">
            Proyección ortogonal de máxima separación dimensional. Cada punto representa un cliente.
          </p>
        </div>

        {/* Legend buttons */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={() => onSelectCluster && onSelectCluster(null)}
            className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-all ${
              selectedCluster === null
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
            }`}
          >
            Todos
          </button>
          {uniqueClusters.map((c) => {
            const isSelected = selectedCluster === c;
            const color = clusterColors[c % clusterColors.length];
            return (
              <button
                key={c}
                onClick={() => onSelectCluster && onSelectCluster(isSelected ? null : c)}
                className={`flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium border transition-all ${
                  isSelected
                    ? 'ring-2 ring-blue-500 bg-white font-bold text-slate-900 border-slate-400'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                <span>{clusterNames[c] || `Cluster ${c + 1}`}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative overflow-hidden w-full h-[360px] flex items-center justify-center bg-slate-50/50 rounded border border-slate-100">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full select-none">
          {/* Grid lines */}
          <line
            x1={padding}
            y1={scaleY(0)}
            x2={width - padding}
            y2={scaleY(0)}
            stroke="#cbd5e1"
            strokeDasharray="4 4"
            strokeWidth="1"
          />
          <line
            x1={scaleX(0)}
            y1={padding}
            x2={scaleX(0)}
            y2={height - padding}
            stroke="#cbd5e1"
            strokeDasharray="4 4"
            strokeWidth="1"
          />

          {/* Points */}
          {pca.pc1.map((x, i) => {
            const y = pca.pc2[i];
            const cluster = clusterAssignments[i];
            const isDimmed = selectedCluster !== null && selectedCluster !== cluster;
            const color = cluster >= 0 ? clusterColors[cluster % clusterColors.length] : '#94a3b8';
            const cx = scaleX(x);
            const cy = scaleY(y);

            return (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={isDimmed ? 3 : 4.5}
                fill={color}
                fillOpacity={isDimmed ? 0.2 : 0.85}
                stroke={isDimmed ? 'transparent' : '#ffffff'}
                strokeWidth={1.2}
                className="cursor-pointer transition-all hover:scale-150"
                onMouseEnter={() => {
                  setHoveredPoint({
                    id: String(rawData[i]?.[idColumn] || `ID-${i + 1}`),
                    cluster,
                    pc1: x,
                    pc2: y,
                    row: rawData[i] || {},
                  });
                }}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            );
          })}

          {/* Centroid Labels */}
          {centroidsPCA.map((cent) => {
            const cx = scaleX(cent.x);
            const cy = scaleY(cent.y);
            const color = clusterColors[cent.c % clusterColors.length];
            const isDimmed = selectedCluster !== null && selectedCluster !== cent.c;

            if (isDimmed) return null;

            return (
              <g key={`cent-${cent.c}`}>
                <circle cx={cx} cy={cy} r={9} fill={color} stroke="#ffffff" strokeWidth="2.5" />
                <text
                  x={cx}
                  y={cy + 3.5}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="9"
                  fontWeight="bold"
                >
                  {cent.c + 1}
                </text>
              </g>
            );
          })}

          {/* Axes Titles */}
          <text
            x={width / 2}
            y={height - 12}
            textAnchor="middle"
            fill="#64748b"
            fontSize="11"
            fontWeight="600"
          >
            Componente Principal 1 (PC1 - {pca.explainedVariance[0]}% varianza)
          </text>
          <text
            x={16}
            y={height / 2}
            textAnchor="middle"
            fill="#64748b"
            fontSize="11"
            fontWeight="600"
            transform={`rotate(-90, 16, ${height / 2})`}
          >
            Componente Principal 2 (PC2 - {pca.explainedVariance[1]}% varianza)
          </text>
        </svg>

        {/* Hover Tooltip */}
        {hoveredPoint && (
          <div className="absolute top-3 right-3 bg-slate-900/95 text-white p-2.5 rounded-lg shadow-lg border border-slate-700 text-xs max-w-xs pointer-events-none z-10 backdrop-blur-xs">
            <div className="flex items-center justify-between border-b border-slate-700 pb-1.5 mb-1.5">
              <span className="font-bold text-blue-300">{hoveredPoint.id}</span>
              <span
                className="px-1.5 py-0.5 rounded text-[10px] font-semibold"
                style={{
                  backgroundColor:
                    hoveredPoint.cluster >= 0
                      ? clusterColors[hoveredPoint.cluster % clusterColors.length]
                      : '#64748b',
                }}
              >
                {clusterNames[hoveredPoint.cluster] || `Cluster ${hoveredPoint.cluster + 1}`}
              </span>
            </div>
            <div className="text-[11px] space-y-0.5 text-slate-300">
              <div>PC1: {hoveredPoint.pc1.toFixed(2)} | PC2: {hoveredPoint.pc2.toFixed(2)}</div>
              {Object.entries(hoveredPoint.row)
                .slice(1, 5)
                .map(([key, val]) => (
                  <div key={key} className="flex justify-between text-slate-400">
                    <span className="truncate max-w-[120px]">{key}:</span>
                    <span className="font-mono text-slate-200">
                      {typeof val === 'number' ? val.toLocaleString() : String(val)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
