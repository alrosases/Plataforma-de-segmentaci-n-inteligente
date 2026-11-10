import React, { useState, useRef } from 'react';
import { useData } from '../context/DataContext';
import { SAMPLE_DATASETS } from '../services/sampleDatasets';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  FolderOpen,
  Settings2,
  Layers,
  ArrowRight,
  Database,
} from 'lucide-react';

export const DataUploadModule: React.FC = () => {
  const {
    loadDataset,
    loadSampleDataset,
    businessContext,
    setBusinessContext,
    columns,
    processedData,
    datasetName,
    setActiveTab,
  } = useData();

  const [isDragging, setIsDragging] = useState(false);
  const [selectedSampleId, setSelectedSampleId] = useState('retail_ecommerce');
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [currentWorkbook, setCurrentWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Business Context Local State
  const [sector, setSector] = useState(businessContext.sector);
  const [objective, setObjective] = useState(businessContext.objective);
  const [analysisUnit, setAnalysisUnit] = useState(businessContext.analysisUnit);
  const [clientIdColumn, setClientIdColumn] = useState(businessContext.clientIdColumn);
  const [period, setPeriod] = useState(businessContext.period);

  function saveBusinessContext() {
    setBusinessContext({
      sector,
      objective,
      analysisUnit,
      clientIdColumn,
      period,
    });
    setUploadStatus('Contexto empresarial guardado correctamente.');
    setTimeout(() => setUploadStatus(''), 3000);
  }

  function handleFileUpload(file: File) {
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();
    setUploadedFileName(file.name);

    if (ext === 'csv' || ext === 'txt') {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            const cleanData = results.data as Record<string, any>[];
            loadDataset(file.name, cleanData, {
              sector,
              objective,
              analysisUnit,
              clientIdColumn,
              period,
            });
            setUploadStatus(`Archivo CSV cargado: ${cleanData.length} registros y ${Object.keys(cleanData[0]).length} columnas.`);
          }
        },
        error: (err) => {
          setUploadStatus(`Error al parsear archivo: ${err.message}`);
        },
      });
    } else if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const buffer = e.target?.result;
        try {
          const workbook = XLSX.read(buffer, { type: 'binary' });
          setCurrentWorkbook(workbook);
          setSheetNames(workbook.SheetNames);

          // Auto-load first sheet
          const firstSheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);

          if (jsonData.length > 0) {
            loadDataset(file.name, jsonData, {
              sector,
              objective,
              analysisUnit,
              clientIdColumn,
              period,
            });
            setUploadStatus(`Archivo Excel cargado: Hoja '${firstSheetName}', ${jsonData.length} registros.`);
          }
        } catch (err: any) {
          setUploadStatus(`Error al leer archivo Excel: ${err?.message}`);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      setUploadStatus('Formato no soportado. Por favor sube archivos CSV, XLS, XLSX o TXT delimitados.');
    }
  }

  function handleSheetChange(sheetName: string) {
    if (!currentWorkbook) return;
    const sheet = currentWorkbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);
    if (jsonData.length > 0) {
      loadDataset(`${uploadedFileName} (${sheetName})`, jsonData, {
        sector,
        objective,
        analysisUnit,
        clientIdColumn,
        period,
      });
      setUploadStatus(`Hoja '${sheetName}' seleccionada: ${jsonData.length} registros.`);
    }
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          Carga de Datos & Configuración de Negocio
        </h2>
        <p className="text-xs text-slate-500">
          Módulo de ingesta multiformato. Sube tu propia base de clientes o explora bases empresariales precargadas.
        </p>
      </div>

      {uploadStatus && (
        <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg text-xs flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            {uploadStatus}
          </span>
          <button onClick={() => setUploadStatus('')} className="text-blue-500 hover:text-blue-700 font-bold">
            ×
          </button>
        </div>
      )}

      {/* Grid: Upload Zone + Sample Datasets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: File Ingestion (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileUpload(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-blue-600 bg-blue-50/50 scale-[1.01]'
                : 'border-slate-300 hover:border-blue-500 bg-white hover:bg-slate-50/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls,.txt"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Arrastra tu base de datos aquí o haz clic para examinar
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Formatos soportados: <strong>CSV, XLS, XLSX, TXT</strong> con delimitador por comas o tabuladores.
            </p>
            <div className="mt-4 flex items-center justify-center space-x-2 text-[11px] text-slate-400">
              <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">CSV</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">Excel XLSX</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">TXT</span>
            </div>
          </div>

          {/* Multiple Sheets Selector if Excel */}
          {sheetNames.length > 1 && (
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  Libro con Múltiples Hojas Detectadas:
                </span>
                <span className="text-[11px] text-slate-500">
                  Selecciona qué hoja deseas procesar para la segmentación.
                </span>
              </div>
              <select
                onChange={(e) => handleSheetChange(e.target.value)}
                className="text-xs border border-slate-300 rounded px-3 py-1.5 bg-slate-50 font-medium"
              >
                {sheetNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Sample Datasets Preset Cards */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Database className="w-4 h-4 text-blue-600" />
                O Carga un Dataset Empresarial de Prueba
              </span>
              <span className="text-[11px] text-slate-400 font-mono">1-Clic</span>
            </div>

            <div className="space-y-2">
              {SAMPLE_DATASETS.map((sample) => (
                <div
                  key={sample.id}
                  onClick={() => {
                    setSelectedSampleId(sample.id);
                    loadSampleDataset(sample.id);
                  }}
                  className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                    datasetName.includes(sample.title.split(' ')[0])
                      ? 'border-blue-500 bg-blue-50/60 ring-1 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-900">{sample.title}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded border border-slate-200">
                        {sample.sector}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      {sample.description}
                    </p>
                  </div>
                  <button className="px-2.5 py-1 text-xs font-semibold rounded bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 shrink-0">
                    Cargar
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Business Metadata Form (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
              <Settings2 className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Definición del Contexto de Negocio
              </h3>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Sector Económico / Industria
              </label>
              <input
                type="text"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                placeholder="Ej. Retail Omnicanal, B2B SaaS, Telecomunicaciones"
                className="w-full text-xs border border-slate-300 rounded px-3 py-2 bg-slate-50 focus:bg-white focus:outline-blue-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Objetivo Empresarial de la Segmentación
              </label>
              <textarea
                rows={2}
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                placeholder="Ej. Identificar grupos de alto valor, retención de clientes en riesgo..."
                className="w-full text-xs border border-slate-300 rounded px-3 py-2 bg-slate-50 focus:bg-white focus:outline-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Unidad de Análisis
                </label>
                <input
                  type="text"
                  value={analysisUnit}
                  onChange={(e) => setAnalysisUnit(e.target.value)}
                  placeholder="Ej. Cliente Individual, Cuenta, Tienda"
                  className="w-full text-xs border border-slate-300 rounded px-3 py-2 bg-slate-50 focus:bg-white focus:outline-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Periodo de Análisis
                </label>
                <input
                  type="text"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  placeholder="Ej. Últimos 12 meses"
                  className="w-full text-xs border border-slate-300 rounded px-3 py-2 bg-slate-50 focus:bg-white focus:outline-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Variable Identificadora del Cliente (ID)
              </label>
              <select
                value={clientIdColumn}
                onChange={(e) => setClientIdColumn(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded px-3 py-2 bg-slate-50 font-medium"
              >
                {columns.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name} ({c.type})
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-slate-500 block mt-1">
                Los identificadores nunca participarán en el cálculo de distancias de clustering.
              </span>
            </div>

            <button
              onClick={saveBusinessContext}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold shadow-xs"
            >
              Guardar Parámetros de Negocio
            </button>
          </div>

          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
            <div>
              <span className="font-bold block">Base cargada en memoria:</span>
              <span className="text-[11px] text-emerald-700">
                {processedData.length} registros y {columns.length} variables.
              </span>
            </div>
            <button
              onClick={() => setActiveTab('diagnosis')}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold flex items-center gap-1"
            >
              <span>Ir a Diagnóstico</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Dataset Preview Table */}
      {processedData.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>Previsualización de Registros (Primeras 8 filas)</span>
            <span className="text-slate-400 font-normal">
              Mostrando {Math.min(8, processedData.length)} de {processedData.length} registros
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-100/70">
                <tr>
                  {columns.map((c) => (
                    <th key={c.name} className="px-3 py-2 text-left font-bold text-slate-700 truncate max-w-[150px]">
                      {c.name}
                      <span className="block text-[9px] font-normal text-slate-500 uppercase tracking-wider">
                        {c.type.replace('_', ' ')}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {processedData.slice(0, 8).map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    {columns.map((c) => (
                      <td key={c.name} className="px-3 py-2 font-mono text-[11px] text-slate-600 truncate max-w-[150px]">
                        {row[c.name] !== null && row[c.name] !== undefined ? String(row[c.name]) : '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
