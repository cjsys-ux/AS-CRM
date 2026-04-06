import { motion } from 'motion/react';
import { DollarSign, Landmark, Users, Filter, Settings, Package, Megaphone, Wrench, Star, Clock, Calendar, Search, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface ReportsHubProps {
  onNavigate: (category: string) => void;
}

const categories = [
  {
    id: 'revenue',
    title: 'Revenue Reports',
    description: 'Revenue history, YoY/MoM trends, class breakdown, client revenue analysis',
    count: 7,
    icon: DollarSign,
    color: '#10B981',
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-600',
    borderColor: 'border-emerald-500',
    links: ['10-Year Revenue History', 'Monthly Revenue (YoY)', 'Revenue by Client'],
  },
  {
    id: 'financial',
    title: 'Financial Reports',
    description: 'P&L statements, margin analysis, expense breakdown, cash flow detail',
    count: 8,
    icon: Landmark,
    color: '#1B2A4A',
    bgColor: 'bg-slate-100',
    textColor: 'text-slate-700',
    borderColor: 'border-slate-700',
    links: ['P&L by Class', 'Expense Breakdown', 'Cash Flow Detail'],
  },
  {
    id: 'clients',
    title: 'Client Reports',
    description: 'Client lifetime value, spend trajectory, retention, dormant analysis, concentration',
    count: 6,
    icon: Users,
    color: '#14B8A6',
    bgColor: 'bg-teal-100',
    textColor: 'text-teal-600',
    borderColor: 'border-teal-500',
    links: ['Client Lifetime Value', 'Concentration Analysis', 'Dormant Clients'],
  },
  {
    id: 'pipeline',
    title: 'Pipeline & Sales',
    description: 'Pipeline velocity, win/loss analysis, deal aging, team performance, forecasting',
    count: 7,
    icon: Filter,
    color: '#3B82F6',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-500',
    links: ['Pipeline Velocity', 'Win/Loss Analysis', 'Sales Team Scorecard'],
  },
  {
    id: 'operations',
    title: 'Operations Reports',
    description: 'Order fulfillment metrics, vendor scorecards, shipping costs, production timelines',
    count: 6,
    icon: Settings,
    color: '#7C3AED',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-600',
    borderColor: 'border-purple-500',
    links: ['Vendor Scorecard', 'Shipping Cost Analysis', 'Fulfillment Metrics'],
  },
  {
    id: 'amazon',
    title: 'Amazon / PPE Reports',
    description: 'SKU performance, deployment history, DC distribution, IPF billing reconciliation',
    count: 6,
    icon: Package,
    color: '#3B82F6',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-500',
    links: ['SKU Performance', 'Deployment History', 'IPF Reconciliation'],
  },
  {
    id: 'marketing',
    title: 'Marketing Reports',
    description: 'Channel ROI, lead attribution, campaign performance, content analytics',
    count: 5,
    icon: Megaphone,
    color: '#F97066',
    bgColor: 'bg-red-100',
    textColor: 'text-red-500',
    borderColor: 'border-red-400',
    links: ['Channel ROI', 'Lead Attribution', 'Content Performance'],
  },
  {
    id: 'custom',
    title: 'Custom Reports',
    description: 'Build your own reports with custom filters, metrics, and visualizations',
    count: 0,
    icon: Wrench,
    color: '#94A3B8',
    bgColor: 'bg-slate-100',
    textColor: 'text-slate-500',
    borderColor: 'border-slate-400',
    links: [],
    isCustom: true,
  },
];

const recentReports = [
  { name: '10-Year Revenue History', category: 'revenue', date: 'Apr 3, 2026' },
  { name: 'P&L by Class', category: 'financial', date: 'Apr 2, 2026' },
  { name: 'Client Lifetime Value', category: 'clients', date: 'Apr 1, 2026' },
  { name: 'Pipeline Velocity', category: 'pipeline', date: 'Mar 31, 2026' },
  { name: 'IPF Reconciliation', category: 'amazon', date: 'Mar 30, 2026' },
];

export function ReportsHub({ onNavigate }: ReportsHubProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFavorites, setShowFavorites] = useState(false);

  const filteredCategories = categories.filter(c =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.links.some(l => l.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex-1 overflow-auto bg-[#F8FAFC]">
      <div className="max-w-[1400px] mx-auto px-8 py-8">
        {/* Title Area */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
            <p className="text-sm text-slate-500 mt-1">Detailed analytics and reporting across every dimension of your business</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFavorites(!showFavorites)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                showFavorites ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Star className="w-4 h-4" />
              Favorites
            </button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
          {filteredCategories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => onNavigate(cat.id)}
              className={`group bg-white rounded-xl border border-slate-200 shadow-sm p-5 cursor-pointer hover:shadow-md transition-all hover:border-t-[3px] hover:${cat.borderColor}`}
              style={{ '--hover-border': cat.color } as any}
            >
              <div className="flex items-start gap-4">
                <div className={`w-11 h-11 rounded-xl ${cat.bgColor} flex items-center justify-center flex-shrink-0`}>
                  <cat.icon className={`w-5 h-5 ${cat.textColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-[15px] font-bold text-slate-900">{cat.title}</h3>
                    {!cat.isCustom && (
                      <span className="text-xs text-slate-400 font-medium">{cat.count} reports</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mb-3 leading-relaxed">{cat.description}</p>
                  {cat.isCustom ? (
                    <button className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                      Create New Report
                    </button>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {cat.links.map(link => (
                        <span
                          key={link}
                          className="text-[11px] font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md hover:bg-blue-100 transition-colors"
                        >
                          {link}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors mt-1 flex-shrink-0" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Recently Viewed */}
        <div className="mb-8">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            Recently Viewed
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {recentReports.map((r, i) => (
              <motion.div
                key={r.name}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                onClick={() => onNavigate(r.category)}
                className="flex-shrink-0 bg-white rounded-lg border border-slate-200 px-4 py-3 cursor-pointer hover:shadow-sm hover:border-slate-300 transition-all min-w-[200px]"
              >
                <p className="text-sm font-semibold text-slate-800 truncate">{r.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{r.date}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Scheduled Reports */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm font-semibold text-blue-800">Scheduled Reports</p>
              <p className="text-xs text-blue-600">3 reports scheduled for email delivery</p>
            </div>
          </div>
          <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
            Manage Schedules →
          </button>
        </div>
      </div>
    </div>
  );
}
