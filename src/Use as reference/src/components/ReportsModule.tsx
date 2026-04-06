import { useState } from 'react';
import { ChevronLeft, BarChart3 } from 'lucide-react';
import { ReportsHub } from './ReportsHub';
import { ReportsRevenue } from './ReportsRevenue';
import { ReportsFinancial } from './ReportsFinancial';
import { ReportsClients } from './ReportsClients';
import { ReportsPipeline } from './ReportsPipeline';
import { ReportsOperations } from './ReportsOperations';
import { ReportsAmazon } from './ReportsAmazon';
import { ReportsMarketing } from './ReportsMarketing';

const categoryTitles: Record<string, string> = {
  revenue: 'Revenue Reports',
  financial: 'Financial Reports',
  clients: 'Client Reports',
  pipeline: 'Pipeline & Sales',
  operations: 'Operations Reports',
  amazon: 'Amazon / PPE Reports',
  marketing: 'Marketing Reports',
  custom: 'Custom Reports',
};

const categoryColors: Record<string, string> = {
  revenue: 'bg-emerald-600',
  financial: 'bg-slate-800',
  clients: 'bg-teal-600',
  pipeline: 'bg-blue-600',
  operations: 'bg-purple-600',
  amazon: 'bg-blue-600',
  marketing: 'bg-red-500',
  custom: 'bg-slate-500',
};

export function ReportsModule() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const handleNavigate = (category: string) => {
    setActiveCategory(category);
  };

  const handleBack = () => {
    setActiveCategory(null);
  };

  if (!activeCategory) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <ReportsHub onNavigate={handleNavigate} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Category Header */}
      <div className={`${categoryColors[activeCategory] || 'bg-slate-700'} px-8 py-4`}>
        <div className="max-w-[1600px] mx-auto flex items-center gap-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Reports Hub
          </button>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-white/80" />
            <h1 className="text-lg font-bold text-white">{categoryTitles[activeCategory] || 'Reports'}</h1>
          </div>
        </div>
      </div>

      {/* Category Content */}
      {activeCategory === 'revenue' && <ReportsRevenue />}
      {activeCategory === 'financial' && <ReportsFinancial />}
      {activeCategory === 'clients' && <ReportsClients />}
      {activeCategory === 'pipeline' && <ReportsPipeline />}
      {activeCategory === 'operations' && <ReportsOperations />}
      {activeCategory === 'amazon' && <ReportsAmazon />}
      {activeCategory === 'marketing' && <ReportsMarketing />}
      {activeCategory === 'custom' && (
        <div className="flex-1 flex items-center justify-center bg-[#F8FAFC]">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-slate-700 mb-2">Custom Report Builder</h2>
            <p className="text-sm text-slate-500 max-w-md">Drag-and-drop interface for creating custom reports with your own filters, metrics, and visualizations. Coming soon.</p>
          </div>
        </div>
      )}
    </div>
  );
}
