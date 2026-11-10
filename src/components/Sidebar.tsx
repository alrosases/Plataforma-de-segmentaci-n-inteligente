import React from 'react';
import { useData } from '../context/DataContext';
import {
  LayoutDashboard,
  UploadCloud,
  Stethoscope,
  BarChart3,
  SlidersHorizontal,
  PieChart,
  CheckCircle,
  Users2,
  Compass,
  Sparkles,
  FileDown,
  Info,
} from 'lucide-react';

interface NavItem {
  id: string;
  name: string;
  icon: React.ElementType;
  badge?: string;
  category: 'overview' | 'data' | 'analysis' | 'strategy';
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', name: 'Dashboard ejecutivo', icon: LayoutDashboard, category: 'overview' },
  { id: 'upload', name: 'Cargar datos', icon: UploadCloud, category: 'data' },
  { id: 'diagnosis', name: 'Diagnóstico de datos', icon: Stethoscope, category: 'data' },
  { id: 'exploratory', name: 'Análisis exploratorio', icon: BarChart3, category: 'data' },
  { id: 'preparation', name: 'Preparación de variables', icon: SlidersHorizontal, category: 'data' },
  { id: 'clustering', name: 'Segmentación inteligente', icon: PieChart, category: 'analysis' },
  { id: 'validation', name: 'Validación de modelos', icon: CheckCircle, category: 'analysis' },
  { id: 'profiling', name: 'Perfilamiento de clientes', icon: Users2, category: 'analysis' },
  { id: 'strategy', name: 'Inteligencia estratégica', icon: Compass, category: 'strategy' },
  { id: 'gemini', name: 'Asistente Gemini AI', icon: Sparkles, badge: 'Pro', category: 'strategy' },
  { id: 'reports', name: 'Informes y exportaciones', icon: FileDown, category: 'strategy' },
];

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, transformationHistory, clusteringResult } = useData();

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 select-none text-slate-300">
      <div className="p-3 space-y-6 overflow-y-auto">
        {/* Navigation Categories */}
        <div className="space-y-4">
          <div>
            <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Visión General
            </div>
            <nav className="space-y-0.5">
              {NAV_ITEMS.filter((item) => item.category === 'overview').map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white font-semibold shadow-xs'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">{item.name}</span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          <div>
            <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Datos & Preparación
            </div>
            <nav className="space-y-0.5">
              {NAV_ITEMS.filter((item) => item.category === 'data').map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                const badge =
                  item.id === 'preparation' && transformationHistory.length > 0
                    ? `${transformationHistory.length}`
                    : undefined;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white font-semibold shadow-xs'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">{item.name}</span>
                    </div>
                    {badge && (
                      <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded font-mono">
                        {badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div>
            <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Modelado & Validación
            </div>
            <nav className="space-y-0.5">
              {NAV_ITEMS.filter((item) => item.category === 'analysis').map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                const badge =
                  item.id === 'clustering' && clusteringResult
                    ? `K=${clusteringResult.k}`
                    : undefined;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white font-semibold shadow-xs'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">{item.name}</span>
                    </div>
                    {badge && (
                      <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800/80 px-1.5 py-0.5 rounded font-mono font-semibold">
                        {badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div>
            <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Estrategia & Resultados
            </div>
            <nav className="space-y-0.5">
              {NAV_ITEMS.filter((item) => item.category === 'strategy').map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white font-semibold shadow-xs'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] bg-linear-to-r from-blue-500 to-indigo-500 text-white px-1.5 py-0.5 rounded font-semibold">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Footer Info Card */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/50">
        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400 space-y-1">
          <div className="flex items-center justify-between text-slate-300 font-medium">
            <span className="flex items-center space-x-1.5">
              <Info className="w-3.5 h-3.5 text-blue-400" />
              <span>Gobernanza de Datos</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">100% Local</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            Identificadores aislados. Datos procesados en memoria segura sin transferencias no autorizadas.
          </p>
        </div>
      </div>
    </aside>
  );
};
