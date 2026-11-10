import React from 'react';
import { DataProvider, useData } from './context/DataContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardModule } from './components/DashboardModule';
import { DataUploadModule } from './components/DataUploadModule';
import { DataDiagnosisModule } from './components/DataDiagnosisModule';
import { ExploratoryModule } from './components/ExploratoryModule';
import { DataPreparationModule } from './components/DataPreparationModule';
import { ClusteringModule } from './components/ClusteringModule';
import { ValidationModule } from './components/ValidationModule';
import { ProfilingModule } from './components/ProfilingModule';
import { StrategyModule } from './components/StrategyModule';
import { GeminiAssistantModule } from './components/GeminiAssistantModule';
import { ReportsExportModule } from './components/ReportsExportModule';

const AppContent: React.FC = () => {
  const { activeTab } = useData();

  function renderModule() {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardModule />;
      case 'upload':
        return <DataUploadModule />;
      case 'diagnosis':
        return <DataDiagnosisModule />;
      case 'exploratory':
        return <ExploratoryModule />;
      case 'preparation':
        return <DataPreparationModule />;
      case 'clustering':
        return <ClusteringModule />;
      case 'validation':
        return <ValidationModule />;
      case 'profiling':
        return <ProfilingModule />;
      case 'strategy':
        return <StrategyModule />;
      case 'gemini':
        return <GeminiAssistantModule />;
      case 'reports':
        return <ReportsExportModule />;
      default:
        return <DashboardModule />;
    }
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans text-slate-800">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex flex-col flex-1 h-full min-w-0 overflow-hidden">
        {/* Sticky Executive Header */}
        <Header />

        {/* Scrollable Module Canvas */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto">{renderModule()}</div>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
}
