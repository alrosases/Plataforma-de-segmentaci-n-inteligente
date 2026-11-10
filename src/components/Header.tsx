import React from 'react';
import { useData } from '../context/DataContext';
import {
  Layers,
  Sparkles,
  TrendingUp,
  FileCheck2,
  Database,
  CheckCircle2,
} from 'lucide-react';

const CRISP_STAGES = [
  { id: 'business', name: '1. Business Understanding', tabs: ['upload', 'dashboard'] },
  { id: 'data_und', name: '2. Data Understanding', tabs: ['diagnosis', 'exploratory'] },
  { id: 'data_prep', name: '3. Data Preparation', tabs: ['preparation'] },
  { id: 'modeling', name: '4. Modeling', tabs: ['clustering'] },
  { id: 'evaluation', name: '5. Evaluation', tabs: ['validation', 'profiling'] },
  { id: 'deployment', name: '6. Deployment', tabs: ['strategy', 'gemini', 'reports'] },
];

export const Header: React.FC = () => {
  const { datasetName, processedData, clusteringResult, activeTab, setActiveTab } = useData();

  // Find active CRISP-DM stage
  const currentCrisp = CRISP_STAGES.find((s) => s.tabs.includes(activeTab)) || CRISP_STAGES[0];

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-6 shadow-xs">
      {/* Brand & Title */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-lg bg-linear-to-br from-blue-700 via-indigo-800 to-slate-900 flex items-center justify-center text-white shadow-sm ring-1 ring-blue-500/20">
            <Layers className="w-5 h-5 text-blue-300" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-tight text-slate-900">
                SEGMENTA<span className="text-blue-600">360</span>
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                Enterprise
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium leading-none">
              De los datos a la estrategia
            </p>
          </div>
        </div>

        <div className="hidden lg:block h-6 w-px bg-slate-200" />

        {/* Dataset context badge */}
        <div className="hidden lg:flex items-center space-x-2 text-xs text-slate-600 bg-slate-100/80 px-2.5 py-1.5 rounded-md border border-slate-200/80">
          <Database className="w-3.5 h-3.5 text-slate-500" />
          <span className="font-medium text-slate-700 truncate max-w-[200px]">{datasetName}</span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-500 font-mono font-medium">{processedData.length} registros</span>
        </div>
      </div>

      {/* CRISP-DM Methodology Progress Bar */}
      <div className="hidden xl:flex items-center space-x-1.5 text-xs">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 mr-2">
          CRISP-DM:
        </span>
        <div className="flex items-center space-x-1">
          {CRISP_STAGES.map((stage, idx) => {
            const isCurrent = stage.id === currentCrisp.id;
            const isCompleted = CRISP_STAGES.findIndex((s) => s.id === currentCrisp.id) > idx;

            return (
              <div
                key={stage.id}
                onClick={() => setActiveTab(stage.tabs[0])}
                className={`cursor-pointer px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center space-x-1 ${
                  isCurrent
                    ? 'bg-blue-600 text-white font-semibold shadow-xs ring-1 ring-blue-700'
                    : isCompleted
                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
                title={`Fase CRISP-DM: ${stage.name}`}
              >
                {isCompleted && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                <span>{stage.name.split('.')[1].trim()}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Action & Model Metric Status */}
      <div className="flex items-center space-x-3">
        {clusteringResult && (
          <div className="hidden sm:flex items-center space-x-2 text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-md">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold uppercase text-[10px] tracking-wider">
              {clusteringResult.algorithm.toUpperCase()} (K={clusteringResult.k})
            </span>
            <span className="text-emerald-400">•</span>
            <span className="font-mono text-emerald-900 font-medium">
              Silueta: {clusteringResult.silhouetteScore.toFixed(3)}
            </span>
          </div>
        )}

        <button
          onClick={() => setActiveTab('gemini')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold shadow-xs transition-all ${
            activeTab === 'gemini'
              ? 'bg-blue-700 text-white ring-2 ring-blue-500'
              : 'bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-200" />
          <span>Consultor AI</span>
        </button>
      </div>
    </header>
  );
};
