import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import {
  FileDown,
  FileSpreadsheet,
  FileText,
  Printer,
  CheckCircle2,
  Layers,
  Sparkles,
  Download,
  Calendar,
  Building2,
} from 'lucide-react';

export const ReportsExportModule: React.FC = () => {
  const {
    datasetName,
    rawData,
    processedData,
    columns,
    clusteringResult,
    clusterProfiles,
    strategicMatrix,
    transformationHistory,
    businessContext,
  } = useData();

  const [downloadSuccess, setDownloadSuccess] = useState<string>('');

  if (!clusteringResult || clusterProfiles.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-lg border border-slate-200">
        <p className="text-xs text-slate-500">Ejecuta la segmentación para generar informes y exportaciones.</p>
      </div>
    );
  }

  // Create enriched dataset with Segment ID and Commercial Name
  const enrichedData = processedData.map((row, idx) => {
    const clusterId = clusteringResult.clusterAssignments[idx];
    const profile = clusterProfiles.find((p) => p.clusterId === clusterId);

    return {
      ...row,
      SEGMENTA360_Cluster_ID: clusterId !== undefined && clusterId >= 0 ? clusterId + 1 : 'Ruido/Outlier',
      SEGMENTA360_Nombre_Segmento: profile ? profile.name : 'No Asignado',
      SEGMENTA360_Algoritmo: clusteringResult.algorithm.toUpperCase(),
      SEGMENTA360_Silueta_Muestra: +(clusteringResult.silhouetteSampleScores[idx] || 0).toFixed(3),
    };
  });

  // Export to Excel XLSX with multiple sheets
  function exportEnrichedXLSX() {
    try {
      const wb = XLSX.utils.book_new();

      // Sheet 1: Base Segmentada
      const wsData = XLSX.utils.json_to_sheet(enrichedData);
      XLSX.utils.book_append_sheet(wb, wsData, 'Clientes_Segmentados');

      // Sheet 2: Fichas de Segmentos
      const profilesSummary = clusterProfiles.map((p) => ({
        Cluster_ID: p.clusterId + 1,
        Nombre_Comercial: p.name,
        Total_Clientes: p.size,
        Porcentaje_Cartera: `${p.percentage}%`,
        Comportamiento: p.behaviorDescription,
        Oportunidad_Clave: p.opportunities[0] || '',
        Riesgo_Principal: p.risks[0] || '',
      }));
      const wsProfiles = XLSX.utils.json_to_sheet(profilesSummary);
      XLSX.utils.book_append_sheet(wb, wsProfiles, 'Perfiles_Comerciales');

      // Sheet 3: Matriz Estratégica 8D
      const wsMatrix = XLSX.utils.json_to_sheet(
        strategicMatrix.map((m) => ({
          Segmento: m.clusterName,
          Clientes: m.size,
          Perfil: m.profile,
          Valor_Economico: m.economicValue,
          Riesgo: m.churnRisk,
          Oportunidad: m.opportunity,
          Marketing: m.marketingAction,
          Retencion: m.retentionAction,
          Crecimiento: m.growthStrategy,
        }))
      );
      XLSX.utils.book_append_sheet(wb, wsMatrix, 'Estrategia_Acciones');

      // Sheet 4: Diccionario de Datos
      const wsDict = XLSX.utils.json_to_sheet(
        columns.map((c) => ({
          Variable: c.name,
          Tipo: c.type,
          Faltantes: c.missingCount,
          Porcentaje_Faltantes: `${c.missingPercentage}%`,
          Valores_Unicos: c.uniqueCount,
          Incluida_En_Clustering: !c.isExcludedFromModeling ? 'SÍ' : 'NO',
        }))
      );
      XLSX.utils.book_append_sheet(wb, wsDict, 'Diccionario_Variables');

      const fileName = `SEGMENTA360_Base_Segmentada_${datasetName.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`;
      XLSX.writeFile(wb, fileName);

      setDownloadSuccess(`Archivo Excel descargado con éxito: ${fileName}`);
      setTimeout(() => setDownloadSuccess(''), 4000);
    } catch (err: any) {
      console.error('Error exportando Excel:', err);
    }
  }

  // Export to CSV
  function exportEnrichedCSV() {
    try {
      const csv = Papa.unparse(enrichedData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `SEGMENTA360_Base_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadSuccess('Archivo CSV descargado con éxito.');
      setTimeout(() => setDownloadSuccess(''), 4000);
    } catch (err) {
      console.error('Error exportando CSV:', err);
    }
  }

  // Print Executive Report (A4 presentation style)
  function handlePrintReport() {
    window.print();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileDown className="w-5 h-5 text-blue-600" />
            <span>Informes Ejecutivos & Exportaciones de Datos</span>
          </h2>
          <p className="text-xs text-slate-500">
            Descarga de bases enriquecidas con etiquetas de cluster e informe metodológico auditable listo para alta dirección.
          </p>
        </div>

        <button
          onClick={handlePrintReport}
          className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
        >
          <Printer className="w-4 h-4" />
          <span>Imprimir / Guardar Informe PDF</span>
        </button>
      </div>

      {downloadSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {/* Export Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: XLSX */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-tight">
              Libro Completo Excel (.XLSX)
            </h3>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Incluye 4 hojas: Base segmentada completa, fichas de perfiles comerciales, matriz estratégica 8D y diccionario de datos.
            </p>
          </div>
          <button
            onClick={exportEnrichedXLSX}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-bold shadow-xs flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar Libro XLSX</span>
          </button>
        </div>

        {/* Card 2: CSV */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-2">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-tight">
              Base Segmentada Plana (.CSV)
            </h3>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Compatible con CRM, Salesforce, HubSpot, PowerBI, Tableau o bases de datos relacionales SQL.
            </p>
          </div>
          <button
            onClick={exportEnrichedCSV}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-bold shadow-xs flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar CSV Delimitado</span>
          </button>
        </div>

        {/* Card 3: Executive PDF Print */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center mb-2">
              <Printer className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-tight">
              Dossier Ejecutivo de Auditoría
            </h3>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Documento formal metodológico en formato corporativo listo para imprimir o exportar a PDF para el Comité de Dirección.
            </p>
          </div>
          <button
            onClick={handlePrintReport}
            className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-bold shadow-xs flex items-center justify-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Generar Vista de Impresión PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Executive Dossier Preview Container */}
      <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-xs space-y-6 printable-dossier">
        {/* Cover / Header Section */}
        <div className="border-b-2 border-slate-900 pb-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-extrabold uppercase tracking-widest text-blue-600 mb-1">
              <span>SEGMENTA360 • INFORME METODOLÓGICO Y ESTRATÉGICO</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Auditoría Ejecutiva de Segmentación de Clientes
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Sector: <strong>{businessContext.sector}</strong> | Unidad de Análisis:{' '}
              <strong>{businessContext.analysisUnit}</strong> | Periodo: <strong>{businessContext.period}</strong>
            </p>
          </div>

          <div className="text-right text-xs font-mono text-slate-400">
            <div>Fecha: {new Date().toLocaleDateString()}</div>
            <div>Metodología: CRISP-DM v1.4</div>
          </div>
        </div>

        {/* Executive Summary Section */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-1 border-b border-slate-100">
            1. Resumen Ejecutivo & Hallazgo Central
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed">
            Se procesó exitosamente la base de clientes **"{datasetName}"** compuesta por{' '}
            <strong>{processedData.length.toLocaleString()} observaciones</strong> y{' '}
            <strong>{clusteringResult.features.length} variables discriminantes</strong>. Mediante el algoritmo{' '}
            <strong>{clusteringResult.algorithm.toUpperCase()} (K = {clusteringResult.k})</strong>, se obtuvo un coeficiente de
            silueta global de <strong>{clusteringResult.silhouetteScore.toFixed(3)}</strong> y una inercia WCSS de{' '}
            <strong>{clusteringResult.wcss.toLocaleString()}</strong>, con una varianza explicada en 2D (PCA) de{' '}
            <strong>
              {(
                clusteringResult.pca.explainedVariance[0] + clusteringResult.pca.explainedVariance[1]
              ).toFixed(1)}
              %
            </strong>
            .
          </p>
        </div>

        {/* Data & Transformations Audit */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-1 border-b border-slate-100">
            2. Trazabilidad de Datos & Preprocesamiento
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Registros Fuente:</span>
              <span className="font-mono font-bold text-slate-800">{rawData.length}</span>
            </div>
            <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Registros Válidos:</span>
              <span className="font-mono font-bold text-blue-700">{processedData.length}</span>
            </div>
            <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Transformaciones:</span>
              <span className="font-mono font-bold text-slate-800">{transformationHistory.length} registradas</span>
            </div>
            <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Semilla de Reproducibilidad:</span>
              <span className="font-mono font-bold text-emerald-700">Seed #{clusteringResult.convergenceIterations}</span>
            </div>
          </div>
        </div>

        {/* Segments Summary Table */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-1 border-b border-slate-100">
            3. Fichas de Segmentos Identificados
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-100/70 text-slate-700">
                <tr>
                  <th className="px-3 py-2 text-left font-bold">Segmento Comercial</th>
                  <th className="px-3 py-2 text-center font-bold">Clientes</th>
                  <th className="px-3 py-2 text-center font-bold">% Cartera</th>
                  <th className="px-3 py-2 text-left font-bold">Rasgo Diferenciador Predominante</th>
                  <th className="px-3 py-2 text-left font-bold">Acción Estratégica Inmediata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clusterProfiles.map((p) => {
                  const topDiff = p.differentiatingFeatures[0];
                  const matrixRow = strategicMatrix.find((m) => m.clusterId === p.clusterId);

                  return (
                    <tr key={p.clusterId} className="hover:bg-slate-50">
                      <td className="px-3 py-2 font-bold text-slate-900 flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                        <span>{p.name}</span>
                      </td>
                      <td className="px-3 py-2 text-center font-mono">{p.size}</td>
                      <td className="px-3 py-2 text-center font-mono font-bold text-blue-700">{p.percentage}%</td>
                      <td className="px-3 py-2 text-slate-600 text-[11px]">
                        {topDiff ? `${topDiff.feature} (${topDiff.direction === 'higher' ? '+' : ''}${topDiff.relativeDifferencePercent}%)` : '—'}
                      </td>
                      <td className="px-3 py-2 text-slate-600 text-[11px]">
                        {matrixRow?.marketingAction || p.opportunities[0] || 'Optimización'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Methodological Caveats */}
        <div className="pt-4 border-t border-slate-200 text-[11px] text-slate-500 leading-relaxed space-y-1">
          <span className="font-bold text-slate-700 block">Declaración de Limitaciones Metodológicas:</span>
          <p>
            Los modelos de segmentación no supervisada revelan patrones matemáticos de asociación y similitud geométrica, no relaciones de causalidad directa. Las proyecciones de comportamiento futuro asumen estabilidad en las condiciones de mercado del sector {businessContext.sector}. Cualquier reasignación de recursos comerciales debe someterse a pruebas controladas (A/B testing) con seguimiento de KPIs.
          </p>
        </div>
      </div>
    </div>
  );
};
