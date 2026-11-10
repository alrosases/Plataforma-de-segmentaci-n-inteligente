import React from 'react';
import { ElbowPoint } from '../../services/validationService';

interface ElbowChartProps {
  elbowCurve: ElbowPoint[];
  currentK: number;
  onSelectK?: (k: number) => void;
}

export const ElbowChart: React.FC<ElbowChartProps> = ({ elbowCurve, currentK, onSelectK }) => {
  if (!elbowCurve || elbowCurve.length === 0) return null;

  const width = 500;
  const height = 260;
  const padding = 45;

  const minWcss = Math.min(...elbowCurve.map((p) => p.wcss));
  const maxWcss = Math.max(...elbowCurve.map((p) => p.wcss));
  const rangeWcss = maxWcss - minWcss || 1;

  const minK = elbowCurve[0].k;
  const maxK = elbowCurve[elbowCurve.length - 1].k;

  const scaleX = (k: number) => padding + ((k - minK) / (maxK - minK)) * (width - 2 * padding);
  const scaleY = (wcss: number) => height - padding - ((wcss - minWcss) / rangeWcss) * (height - 2 * padding);

  const pointsString = elbowCurve.map((p) => `${scaleX(p.k)},${scaleY(p.wcss)}`).join(' ');

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-xs font-bold text-slate-900 tracking-tight">
            Curva de Inercia (Método del Codo - WCSS)
          </h4>
          <p className="text-[11px] text-slate-500">
            Suma de cuadrados intra-cluster en función de K. El codo marca la disminución de ganancia marginal.
          </p>
        </div>
      </div>

      <div className="relative w-full h-[240px] flex items-center justify-center">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full select-none">
          {/* Horizontal Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const yVal = minWcss + ratio * rangeWcss;
            const yPos = scaleY(yVal);
            return (
              <g key={ratio}>
                <line
                  x1={padding}
                  y1={yPos}
                  x2={width - padding}
                  y2={yPos}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                />
                <text x={padding - 6} y={yPos + 3} textAnchor="end" fill="#94a3b8" fontSize="9">
                  {Math.round(yVal).toLocaleString()}
                </text>
              </g>
            );
          })}

          {/* Polyline */}
          <polyline
            fill="none"
            stroke="#2563eb"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={pointsString}
          />

          {/* Points */}
          {elbowCurve.map((pt) => {
            const cx = scaleX(pt.k);
            const cy = scaleY(pt.wcss);
            const isSelected = pt.k === currentK;
            const isInflection = pt.isElbowInflection;

            return (
              <g
                key={pt.k}
                className="cursor-pointer group"
                onClick={() => onSelectK && onSelectK(pt.k)}
              >
                {/* Glow ring for inflection point */}
                {isInflection && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={12}
                    fill="#3b82f6"
                    fillOpacity="0.15"
                    className="animate-pulse"
                  />
                )}

                <circle
                  cx={cx}
                  cy={cy}
                  r={isSelected ? 6 : 4.5}
                  fill={isSelected ? '#1d4ed8' : isInflection ? '#059669' : '#2563eb'}
                  stroke="#ffffff"
                  strokeWidth="2"
                />

                <text
                  x={cx}
                  y={height - padding + 16}
                  textAnchor="middle"
                  fill={isSelected ? '#1e293b' : '#64748b'}
                  fontSize="11"
                  fontWeight={isSelected ? 'bold' : 'normal'}
                >
                  K={pt.k}
                </text>

                {isInflection && (
                  <text
                    x={cx}
                    y={cy - 10}
                    textAnchor="middle"
                    fill="#059669"
                    fontSize="9"
                    fontWeight="bold"
                  >
                    ★ Codo Óptimo
                  </text>
                )}
              </g>
            );
          })}

          {/* X Axis Label */}
          <text
            x={width / 2}
            y={height - 8}
            textAnchor="middle"
            fill="#64748b"
            fontSize="10"
            fontWeight="600"
          >
            Número de Segmentos (K)
          </text>
        </svg>
      </div>
    </div>
  );
};
