import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { TransformationStep } from '../types';
import {
  SlidersHorizontal,
  RotateCcw,
  Trash2,
  CheckCircle2,
  Filter,
  ArrowRight,
  ShieldCheck,
  History,
  TrendingDown,
  Layers,
} from 'lucide-react';

export const DataPreparationModule: React.FC = () => {
  const {
    rawData,
    processedData,
    columns,
    transformationHistory,
    applyTransformation,
    undoTransformation,
    resetTransformations,
    toggleExcludeColumn,
    clusteringConfig,
    setActiveTab,
  } = useData();

  const [selectedColumn, setSelectedColumn] = useState<string>(
    columns.find((c) => c.type === 'numeric_continuous' || c.type === 'numeric_discrete')?.name || columns[0]?.name || ''
  );
  const [imputeMethod, setImputeMethod] = useState<'mean' | 'median'>('mean');
  const [outlierAction, setOutlierAction] = useState<'cap' | 'remove'>('cap');

  const numericColumns = columns.filter(
    (c) => c.type === 'numeric_continuous' || c.type === 'numeric_discrete'
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-blue-600" />
            <span>Preparación, Limpieza e Ingeniería de Variables</span>
          </h2>
          <p className="text-xs text-slate-500">
            Pipeline de transformaciones reproducibles con trazabilidad auditada y comparación antes vs después.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('clustering')}
          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
        >
          <span>Ir a Segmentación Inteligente</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Grid: Transformation Toolbox (8 cols) + History & Traceability (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Action Toolbox (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Target Column Selector */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div>
              <label className="text-xs font-bold text-slate-800 block">
                Variable Objetivo para Transformación:
              </label>
              <span className="text-[11px] text-slate-500">
                Aplica transformaciones individuales o a nivel de dataset.
              </span>
            </div>
            <select
              value={selectedColumn}
              onChange={(e) => setSelectedColumn(e.target.value)}
              className="text-xs font-semibold border border-slate-300 rounded px-3 py-1.5 bg-slate-50"
            >
              {numericColumns.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} ({c.type})
                </option>
              ))}
            </select>
          </div>

          {/* Transformation Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: Missing Values Imputation */}
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-3">
              <div>
                <h4 className="text-xs font-bold text-slate-900 tracking-tight">
                  1. Tratamiento de Valores Faltantes
                </h4>
                <p className="text-[11px] text-slate-500">
                  Rellena celdas vacías en la variable seleccionada.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <select
                  value={imputeMethod}
                  onChange={(e) => setImputeMethod(e.target.value as any)}
                  className="text-xs border border-slate-200 rounded px-2.5 py-1.5 bg-slate-50 font-medium"
                >
                  <option value="mean">Imputar por Media</option>
                  <option value="median">Imputar por Mediana</option>
                </select>
                <button
                  onClick={() => applyTransformation('impute_missing', selectedColumn, { method: imputeMethod })}
                  className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold"
                >
                  Aplicar Imputación
                </button>
              </div>
            </div>

            {/* Card 2: Outlier Handling */}
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-3">
              <div>
                <h4 className="text-xs font-bold text-slate-900 tracking-tight">
                  2. Tratamiento de Outliers (Tukey IQR)
                </h4>
                <p className="text-[11px] text-slate-500">
                  Winsoriza (acota al rango Q1-1.5IQR / Q3+1.5IQR) o filtra filas extremas.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <select
                  value={outlierAction}
                  onChange={(e) => setOutlierAction(e.target.value as any)}
                  className="text-xs border border-slate-200 rounded px-2.5 py-1.5 bg-slate-50 font-medium"
                >
                  <option value="cap">Winsorizar (Acotar)</option>
                  <option value="remove">Eliminar Registros</option>
                </select>
                <button
                  onClick={() => applyTransformation('filter_outliers', selectedColumn, { action: outlierAction })}
                  className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold"
                >
                  Tratar Outliers
                </button>
              </div>
            </div>

            {/* Card 3: Mathematical Scaling (Log, Z-Score, Min-Max) */}
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-3">
              <div>
                <h4 className="text-xs font-bold text-slate-900 tracking-tight">
                  3. Escalamiento & Normalización
                </h4>
                <p className="text-[11px] text-slate-500">
                  Modifica la escala para estabilizar varianzas.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => applyTransformation('log_transform', selectedColumn)}
                  className="py-1.5 bg-blue-50 text-blue-800 border border-blue-200 rounded text-xs font-semibold hover:bg-blue-100"
                >
                  Log(x + 1)
                </button>
                <button
                  onClick={() => applyTransformation('minmax_normalize', selectedColumn)}
                  className="py-1.5 bg-blue-50 text-blue-800 border border-blue-200 rounded text-xs font-semibold hover:bg-blue-100"
                >
                  Min-Max [0, 1]
                </button>
              </div>
            </div>

            {/* Card 4: Global Cleaning */}
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-3">
              <div>
                <h4 className="text-xs font-bold text-slate-900 tracking-tight">
                  4. Limpieza Global de Duplicados
                </h4>
                <p className="text-[11px] text-slate-500">
                  Remueve filas idénticas en todas sus columnas.
                </p>
              </div>

              <button
                onClick={() => applyTransformation('remove_duplicates')}
                className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5 text-slate-600" />
                <span>Eliminar Duplicados Exactos</span>
              </button>
            </div>
          </div>

          {/* Feature Selection for Clustering Table */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h4 className="text-xs font-bold text-slate-900 tracking-tight">
                  Selección de Variables Explicativas para Segmentación
                </h4>
                <p className="text-[11px] text-slate-500">
                  Marca qué dimensiones formarán el espacio euclidiano del algoritmo. Los identificadores están bloqueados por seguridad.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {clusteringConfig.selectedFeatures.length} Variables Seleccionadas
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {columns.map((col) => {
                const isSelected = clusteringConfig.selectedFeatures.includes(col.name);
                const isIdentifier = col.type === 'identifier';

                return (
                  <button
                    key={col.name}
                    disabled={isIdentifier}
                    onClick={() => toggleExcludeColumn(col.name)}
                    className={`p-2 rounded text-left border text-xs transition-all flex items-center justify-between ${
                      isIdentifier
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                        : isSelected
                        ? 'bg-blue-600 text-white font-semibold border-blue-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate max-w-[130px]">{col.name}</span>
                    {isIdentifier ? (
                      <span className="text-[9px] uppercase font-bold text-slate-400">ID</span>
                    ) : isSelected ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    ) : (
                      <span className="w-3.5 h-3.5 rounded border border-slate-300" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Traceability & History Log (4 cols) */}
        <div className="lg:col-span-4 bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                <History className="w-4 h-4 text-blue-600" />
                Historial de Transformaciones
              </span>
              <button
                onClick={resetTransformations}
                disabled={transformationHistory.length === 0}
                className="text-[10px] text-rose-600 hover:text-rose-800 font-semibold disabled:opacity-40"
              >
                Resetear Todo
              </button>
            </div>

            {/* Traceability List */}
            <div className="space-y-2 mt-3 max-h-[380px] overflow-y-auto">
              {transformationHistory.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">
                  Aún no has aplicado transformaciones. Los datos coinciden exactamente con la fuente original.
                </div>
              ) : (
                transformationHistory.map((step, idx) => (
                  <div
                    key={step.id}
                    className="p-2.5 rounded bg-slate-50 border border-slate-200 text-xs space-y-1 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-[11px]">
                        Paso {idx + 1}: {step.type.replace('_', ' ')}
                      </span>
                      <button
                        onClick={() => undoTransformation(step.id)}
                        className="text-[10px] text-slate-400 hover:text-rose-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Deshacer hasta este paso"
                      >
                        Deshacer
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug">{step.description}</p>
                    <span className="text-[9px] font-mono text-slate-400 block">{step.timestamp}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Metrics Comparison Before vs After */}
          <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1">
            <div className="flex justify-between">
              <span>Registros Originales:</span>
              <span className="font-mono font-bold text-slate-900">{rawData.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Registros Procesados:</span>
              <span className="font-mono font-bold text-blue-700">{processedData.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Variables para Clustering:</span>
              <span className="font-mono font-bold text-emerald-700">
                {clusteringConfig.selectedFeatures.length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
