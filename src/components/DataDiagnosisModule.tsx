import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { VariableType } from '../types';
import {
  Stethoscope,
  AlertTriangle,
  CheckCircle,
  FileText,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  Hash,
  Binary,
} from 'lucide-react';

export const DataDiagnosisModule: React.FC = () => {
  const { columns, processedData, updateColumnType, toggleExcludeColumn, setActiveTab } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const totalRows = processedData.length;
  const totalCols = columns.length;

  // Compute quality indicators
  const totalCells = totalRows * totalCols;
  const totalMissing = columns.reduce((acc, c) => acc + c.missingCount, 0);
  const completenessPct = totalCells > 0 ? +(((totalCells - totalMissing) / totalCells) * 100).toFixed(1) : 100;

  // Check exact duplicate rows
  const seenStrings = new Set<string>();
  let duplicateRowCount = 0;
  for (const row of processedData) {
    const key = JSON.stringify(row);
    if (seenStrings.has(key)) duplicateRowCount++;
    else seenStrings.add(key);
  }

  const qualityScore = Math.max(
    0,
    Math.round(
      completenessPct * 0.7 +
        (duplicateRowCount === 0 ? 30 : Math.max(0, 30 - duplicateRowCount * 2))
    )
  );

  const filteredColumns = columns.filter((col) => {
    const matchesSearch = col.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || col.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-blue-600" />
            <span>Diagnóstico de Calidad & Diccionario de Datos</span>
          </h2>
          <p className="text-xs text-slate-500">
            Auditoría de integridad, detección de faltantes, duplicados y clasificación tipológica de variables.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('exploratory')}
          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
        >
          <span>Ir a Análisis Exploratorio</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Health Score KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex items-center space-x-3.5">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${
              qualityScore >= 90
                ? 'bg-emerald-100 text-emerald-800'
                : qualityScore >= 75
                ? 'bg-blue-100 text-blue-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {qualityScore}%
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Score de Calidad
            </span>
            <span className="text-sm font-bold text-slate-800">
              {qualityScore >= 90 ? 'Excelente Salud' : qualityScore >= 75 ? 'Buena Salud' : 'Requiere Limpieza'}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Completitud de Celdas
            </span>
            <span className="text-sm font-bold text-slate-800 font-mono">
              {completenessPct}% ({totalMissing} nulos)
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Binary className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Registros Duplicados
            </span>
            <span className="text-sm font-bold text-slate-800 font-mono">
              {duplicateRowCount} duplicados exactos
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Hash className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Variables Activas
            </span>
            <span className="text-sm font-bold text-slate-800 font-mono">
              {columns.filter((c) => !c.isExcludedFromModeling).length} de {columns.length} para modelado
            </span>
          </div>
        </div>
      </div>

      {/* Automated Data Dictionary Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Controls */}
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-slate-600" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Diccionario de Datos Automatizado
            </span>
            <span className="text-xs text-slate-400 font-mono">({columns.length} columnas)</span>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Buscar variable..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-300 rounded bg-white"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-xs border border-slate-300 rounded px-2.5 py-1.5 bg-white text-slate-700 font-medium"
            >
              <option value="all">Todos los tipos</option>
              <option value="numeric_continuous">Numérica Continua</option>
              <option value="numeric_discrete">Numérica Discreta</option>
              <option value="categorical_nominal">Categórica Nominal</option>
              <option value="categorical_ordinal">Categórica Ordinal</option>
              <option value="identifier">Identificador</option>
              <option value="date">Fecha</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-100/70 text-slate-700">
              <tr>
                <th className="px-3.5 py-2.5 text-left font-bold">Columna</th>
                <th className="px-3.5 py-2.5 text-left font-bold">Tipo Clasificado</th>
                <th className="px-3.5 py-2.5 text-center font-bold">Faltantes</th>
                <th className="px-3.5 py-2.5 text-center font-bold">Valores Únicos</th>
                <th className="px-3.5 py-2.5 text-left font-bold">Muestra de Valores</th>
                <th className="px-3.5 py-2.5 text-center font-bold">Rol en Modelo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredColumns.map((col) => {
                const isExcluded = col.isExcludedFromModeling;
                const hasMissing = col.missingCount > 0;

                return (
                  <tr key={col.name} className="hover:bg-slate-50/80">
                    <td className="px-3.5 py-2.5 font-semibold text-slate-800">
                      {col.name}
                      {col.type === 'identifier' && (
                        <span className="ml-2 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          ID
                        </span>
                      )}
                    </td>

                    {/* Type Selector Override */}
                    <td className="px-3.5 py-2.5">
                      <select
                        value={col.type}
                        onChange={(e) => updateColumnType(col.name, e.target.value as VariableType)}
                        className="text-xs font-medium border border-slate-200 rounded px-2 py-1 bg-slate-50 text-slate-800"
                      >
                        <option value="numeric_continuous">Numérica Continua</option>
                        <option value="numeric_discrete">Numérica Discreta</option>
                        <option value="categorical_nominal">Categórica Nominal</option>
                        <option value="categorical_ordinal">Categórica Ordinal</option>
                        <option value="identifier">Identificador</option>
                        <option value="date">Fecha</option>
                      </select>
                    </td>

                    {/* Missing count and % */}
                    <td className="px-3.5 py-2.5 text-center font-mono">
                      {hasMissing ? (
                        <span className="inline-flex items-center gap-1 text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded text-[11px]">
                          <AlertTriangle className="w-3 h-3" />
                          {col.missingCount} ({col.missingPercentage}%)
                        </span>
                      ) : (
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-medium">
                          0 (0%)
                        </span>
                      )}
                    </td>

                    {/* Cardinality */}
                    <td className="px-3.5 py-2.5 text-center font-mono text-slate-600">
                      {col.uniqueCount.toLocaleString()}
                    </td>

                    {/* Samples */}
                    <td className="px-3.5 py-2.5 text-[11px] text-slate-500 font-mono truncate max-w-[200px]">
                      {col.sampleValues.slice(0, 3).join(', ')}
                    </td>

                    {/* Model Role Checkbox */}
                    <td className="px-3.5 py-2.5 text-center">
                      <button
                        onClick={() => toggleExcludeColumn(col.name)}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition-all ${
                          !isExcluded
                            ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                            : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {!isExcluded ? '✓ Incluida' : 'Excluida'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
