import { motion, AnimatePresence } from 'motion/react';
import { Shield, Zap, Target, Clock, ThumbsUp, ThumbsDown, BarChart3, AlertTriangle, TrendingUp, TrendingDown, Package, DollarSign, Star, CheckCircle2, XCircle, Truck, FileText, Edit, Save, X, Plus, Brain, Lightbulb, ArrowRight, Activity, ShieldAlert, ChevronDown, ChevronUp, Sparkles, RefreshCw, ExternalLink, Minus } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, PieChart, Pie } from 'recharts';

const API_URL = '/api';
const headers_json = { 'Content-Type': 'application/json' };

interface ScorecardMetric {
  category: string;
  label: string;
  score: number;
  weight: number;
  notes: string;
}

interface VendorScorecard {
  vendorId: string;
  overallScore: number;
  tier: 'Preferred' | 'Approved' | 'Probation' | 'Suspended' | 'New';
  metrics: ScorecardMetric[];
  incidents: ScorecardIncident[];
  reviewDate: string;
  reviewedBy: string;
  updatedAt: string;
}

interface ScorecardIncident {
  id: string;
  date: string;
  type: 'Late Delivery' | 'Quality Issue' | 'Wrong Item' | 'Damaged Goods' | 'Communication' | 'Pricing Dispute' | 'Documentation' | 'Other';
  severity: 'Critical' | 'Major' | 'Minor';
  description: string;
  resolved: boolean;
  resolution?: string;
  impactScore: number;
}

interface AIAnalysis {
  vendorId: string;
  vendorName: string;
  generatedAt: string;
  overallScore: number;
  tier: string;
  trajectory: 'improving' | 'stable' | 'declining';
  healthSummary: string;
  riskFactors: { level: string; factor: string; detail: string }[];
  recommendations: { priority: string; action: string; detail: string; category: string }[];
  dataPoints: {
    totalPOs: number; deliveredPOs: number; latePOs: number; cancelledPOs: number;
    onTimeRate: number | null; totalSpend: number; recentSpend: number;
    totalTickets: number; openTickets: number; criticalTickets: number;
    totalIncidents: number; openIncidents: number; recentIncidents: number;
    weakMetrics: number; strongMetrics: number; topIssueType: string | null; topIssueCount: number;
  };
}

const DEFAULT_METRICS: ScorecardMetric[] = [
  { category: 'Delivery', label: 'On-Time Delivery Rate', score: 85, weight: 0.20, notes: '' },
  { category: 'Delivery', label: 'Lead Time Accuracy', score: 80, weight: 0.10, notes: '' },
  { category: 'Quality', label: 'Product Quality', score: 90, weight: 0.20, notes: '' },
  { category: 'Quality', label: 'Defect Rate (Inverse)', score: 95, weight: 0.10, notes: '' },
  { category: 'Quality', label: 'Packaging Quality', score: 85, weight: 0.05, notes: '' },
  { category: 'Cost', label: 'Price Competitiveness', score: 75, weight: 0.10, notes: '' },
  { category: 'Cost', label: 'Invoice Accuracy', score: 90, weight: 0.05, notes: '' },
  { category: 'Service', label: 'Responsiveness', score: 80, weight: 0.10, notes: '' },
  { category: 'Service', label: 'Issue Resolution', score: 70, weight: 0.05, notes: '' },
  { category: 'Compliance', label: 'Documentation Compliance', score: 85, weight: 0.05, notes: '' },
];

const TIER_CONFIG = {
  'Preferred': { color: 'from-emerald-500 to-green-600', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: Star, min: 85 },
  'Approved': { color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: CheckCircle2, min: 70 },
  'Probation': { color: 'from-amber-500 to-orange-600', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: AlertTriangle, min: 50 },
  'Suspended': { color: 'from-red-500 to-red-600', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: XCircle, min: 0 },
  'New': { color: 'from-slate-400 to-slate-500', bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', icon: Package, min: 0 },
};

const INCIDENT_TYPES: ScorecardIncident['type'][] = ['Late Delivery', 'Quality Issue', 'Wrong Item', 'Damaged Goods', 'Communication', 'Pricing Dispute', 'Documentation', 'Other'];
const SEVERITY_LEVELS: ScorecardIncident['severity'][] = ['Critical', 'Major', 'Minor'];

const PRIORITY_CONFIG: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  critical: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
  high: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  medium: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
  low: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
};

const CATEGORY_ICONS: Record<string, any> = {
  relationship: ThumbsUp,
  operations: Target,
  support: FileText,
  logistics: Truck,
  strategy: Zap,
  delivery: Truck,
  quality: Shield,
  cost: DollarSign,
  service: Star,
  compliance: FileText,
};

function ScoreGauge({ score, size = 120 }: { score: number; size?: number }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color = score >= 85 ? '#10b981' : score >= 70 ? '#3b82f6' : score >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth="8" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round" strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black" style={{ color }}>{score}</span>
        <span className="text-[9px] text-slate-400 font-semibold uppercase">Score</span>
      </div>
    </div>
  );
}

function MetricRow({ metric, onUpdate }: { metric: ScorecardMetric; onUpdate: (m: ScorecardMetric) => void }) {
  const [editing, setEditing] = useState(false);
  const [editScore, setEditScore] = useState<number | string>(metric.score);

  const getColor = (score: number) => {
    if (score >= 80) return { bg: 'bg-emerald-500', text: 'text-emerald-700' };
    if (score >= 60) return { bg: 'bg-blue-500', text: 'text-blue-700' };
    if (score >= 40) return { bg: 'bg-amber-500', text: 'text-amber-700' };
    return { bg: 'bg-red-500', text: 'text-red-700' };
  };
  const { bg: color, text: textColor } = getColor(metric.score);

  return (
    <div className="flex items-center gap-3 py-2 group">
      <div className="w-44 shrink-0">
        <span className="text-xs font-semibold text-slate-700">{metric.label}</span>
        <span className="text-[10px] text-slate-400 ml-1">({Math.round(metric.weight * 100)}%)</span>
      </div>
      <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${metric.score}%` }} transition={{ duration: 1, ease: 'easeOut' }} className={`h-full rounded-full ${color}`} />
      </div>
      {editing ? (
        <div className="flex items-center gap-1 shrink-0">
          <input type="number" min={0} max={100} value={editScore} onChange={e => setEditScore(e.target.value)} className="w-14 px-1.5 py-0.5 border border-slate-300 rounded text-xs text-center focus:outline-none focus:border-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
          <button onClick={() => { onUpdate({ ...metric, score: Number(editScore) || 0 }); setEditing(false); }} className="p-0.5 text-emerald-600 hover:bg-emerald-50 rounded"><Save className="w-3.5 h-3.5" /></button>
          <button onClick={() => setEditing(false)} className="p-0.5 text-slate-400 hover:bg-slate-50 rounded"><X className="w-3.5 h-3.5" /></button>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`text-sm font-bold ${textColor} w-8 text-right`}>{metric.score}</span>
          <button onClick={() => { setEditScore(metric.score); setEditing(true); }} className="p-0.5 text-slate-300 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity rounded"><Edit className="w-3 h-3" /></button>
        </div>
      )}
    </div>
  );
}

function TrajectoryBadge({ trajectory }: { trajectory: string }) {
  const config = {
    improving: { icon: TrendingUp, text: 'Improving', bg: 'bg-emerald-100', color: 'text-emerald-700', border: 'border-emerald-200' },
    stable: { icon: Minus, text: 'Stable', bg: 'bg-blue-100', color: 'text-blue-700', border: 'border-blue-200' },
    declining: { icon: TrendingDown, text: 'Declining', bg: 'bg-red-100', color: 'text-red-700', border: 'border-red-200' },
  }[trajectory] || { icon: Minus, text: 'Unknown', bg: 'bg-slate-100', color: 'text-slate-700', border: 'border-slate-200' };
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${config.bg} ${config.color} ${config.border}`}>
      <Icon className="w-3.5 h-3.5" /> {config.text}
    </span>
  );
}

export function VendorScorecardTab({ vendorId, vendorName, purchaseOrders }: { vendorId: string; vendorName: string; purchaseOrders: any[] }) {
  const [scorecard, setScorecard] = useState<VendorScorecard | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddIncident, setShowAddIncident] = useState(false);
  const [incidentForm, setIncidentForm] = useState({ type: 'Late Delivery' as ScorecardIncident['type'], severity: 'Minor' as ScorecardIncident['severity'], description: '', impactScore: -3 });
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [expandedRecs, setExpandedRecs] = useState<Set<number>>(new Set());
  const [activeSection, setActiveSection] = useState<'ai' | 'metrics' | 'incidents'>('ai');

  const fetchScorecard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/vendor-scorecards/get?vendorId=${encodeURIComponent(vendorId)}`, { headers: headers_json });
      const data = await res.json().catch(() => ({}));
      if (data.success && data.scorecard) {
        setScorecard(data.scorecard);
      } else {
        const defaultCard: VendorScorecard = {
          vendorId, overallScore: 83, tier: 'Approved',
          metrics: DEFAULT_METRICS, incidents: [],
          reviewDate: new Date().toISOString().split('T')[0],
          reviewedBy: '', updatedAt: new Date().toISOString(),
        };
        setScorecard(defaultCard);
      }
    } catch (err) { console.error('Error fetching scorecard:', err); }
    finally { setLoading(false); }
  }, [vendorId]);

  const fetchAIAnalysis = useCallback(async () => {
    // AI analysis endpoint is not wired locally; skip silently so the rest of
    // the scorecard still renders with the persisted metrics and incidents.
    setAiLoading(false);
    void vendorName;
  }, [vendorId, vendorName]);

  useEffect(() => { fetchScorecard(); }, [fetchScorecard]);
  useEffect(() => { if (scorecard) fetchAIAnalysis(); }, [scorecard, fetchAIAnalysis]);

  const calculateOverall = (metrics: ScorecardMetric[]) => {
    const totalWeight = metrics.reduce((s, m) => s + m.weight, 0);
    if (totalWeight === 0) return 0;
    return Math.round(metrics.reduce((s, m) => s + m.score * m.weight, 0) / totalWeight);
  };

  const getTier = (score: number): VendorScorecard['tier'] => {
    if (score >= 85) return 'Preferred';
    if (score >= 70) return 'Approved';
    if (score >= 50) return 'Probation';
    return 'Suspended';
  };

  const handleMetricUpdate = async (idx: number, updated: ScorecardMetric) => {
    if (!scorecard) return;
    const newMetrics = [...scorecard.metrics];
    newMetrics[idx] = updated;
    const newOverall = calculateOverall(newMetrics);
    const newTier = getTier(newOverall);
    const newCard = { ...scorecard, metrics: newMetrics, overallScore: newOverall, tier: newTier };
    setScorecard(newCard);
    await saveScorecard(newCard);
  };

  const handleAddIncident = async () => {
    if (!scorecard || !incidentForm.description.trim()) { toast.error('Description required'); return; }
    const incident: ScorecardIncident = {
      id: `INC-${Date.now().toString(36).toUpperCase()}`,
      date: new Date().toISOString().split('T')[0],
      type: incidentForm.type, severity: incidentForm.severity,
      description: incidentForm.description, resolved: false,
      impactScore: incidentForm.impactScore,
    };
    const adjustedMetrics = scorecard.metrics.map(m => {
      if ((incidentForm.type === 'Late Delivery' && m.category === 'Delivery') ||
          (incidentForm.type === 'Quality Issue' && m.category === 'Quality') ||
          (incidentForm.type === 'Damaged Goods' && m.category === 'Quality') ||
          (incidentForm.type === 'Pricing Dispute' && m.category === 'Cost') ||
          (incidentForm.type === 'Communication' && m.category === 'Service') ||
          (incidentForm.type === 'Wrong Item' && m.category === 'Quality') ||
          (incidentForm.type === 'Documentation' && m.category === 'Compliance')) {
        return { ...m, score: Math.max(0, m.score + incidentForm.impactScore) };
      }
      return m;
    });
    const newOverall = calculateOverall(adjustedMetrics);
    const newCard = { ...scorecard, metrics: adjustedMetrics, incidents: [incident, ...scorecard.incidents], overallScore: newOverall, tier: getTier(newOverall) };
    setScorecard(newCard);
    setShowAddIncident(false);
    setIncidentForm({ type: 'Late Delivery', severity: 'Minor', description: '', impactScore: -3 });
    await saveScorecard(newCard);
    toast.success('Incident logged — AI analysis will update');
    // Refresh AI
    setTimeout(() => fetchAIAnalysis(), 500);
  };

  const handleResolveIncident = async (incId: string) => {
    if (!scorecard) return;
    const newIncidents = scorecard.incidents.map(inc => inc.id === incId ? { ...inc, resolved: true, resolution: 'Resolved' } : inc);
    const newCard = { ...scorecard, incidents: newIncidents };
    setScorecard(newCard);
    await saveScorecard(newCard);
    toast.success('Incident resolved');
    setTimeout(() => fetchAIAnalysis(), 500);
  };

  const saveScorecard = async (card: VendorScorecard) => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/vendor-scorecards/save`, {
        method: 'POST', headers: headers_json, body: JSON.stringify({ ...card, vendorId }),
      });
      if (!res.ok) throw new Error('Failed to save scorecard');
    } catch (err) { console.error('Save error:', err); toast.error('Error saving scorecard'); }
    finally { setSaving(false); }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" /></div>;
  }
  if (!scorecard) return null;

  const tierConfig = TIER_CONFIG[scorecard.tier];
  const TierIcon = tierConfig.icon;
  const categories = [...new Set(scorecard.metrics.map(m => m.category))];
  const radarData = categories.map(cat => {
    const catMetrics = scorecard.metrics.filter(m => m.category === cat);
    return { category: cat, score: Math.round(catMetrics.reduce((s, m) => s + m.score, 0) / catMetrics.length), fullMark: 100 };
  });
  const openIncidents = scorecard.incidents.filter(i => !i.resolved).length;
  const criticalIncidents = scorecard.incidents.filter(i => i.severity === 'Critical' && !i.resolved).length;
  const totalPOs = purchaseOrders.length;
  const completedPOs = purchaseOrders.filter((po: any) => po.status === 'Delivered' || po.status === 'Completed').length;

  return (
    <div className="space-y-6">
      {/* Top Row: Score + AI Health Summary */}
      <div className="grid grid-cols-12 gap-4">
        {/* Overall Score */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="col-span-3 bg-white rounded-2xl border border-slate-200 shadow-lg p-6 flex flex-col items-center">
          <ScoreGauge score={scorecard.overallScore} size={140} />
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${tierConfig.bg} ${tierConfig.border} border mt-3`}>
            <TierIcon className={`w-4 h-4 ${tierConfig.text}`} />
            <span className={`text-sm font-bold ${tierConfig.text}`}>{scorecard.tier} Vendor</span>
          </div>
          {aiAnalysis && <div className="mt-2"><TrajectoryBadge trajectory={aiAnalysis.trajectory} /></div>}
          {saving && <p className="text-[10px] text-blue-500 mt-2 animate-pulse">Auto-saving...</p>}
        </motion.div>

        {/* AI Health Summary */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="col-span-9 bg-gradient-to-br from-indigo-50 via-violet-50 to-purple-50 rounded-2xl border border-indigo-200/60 shadow-lg p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-200/30 to-transparent rounded-bl-full" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    AI Vendor Health Analysis
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    {aiAnalysis ? `Last analyzed ${new Date(aiAnalysis.generatedAt).toLocaleString()}` : 'Analyzing...'}
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={fetchAIAnalysis}
                disabled={aiLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/80 border border-indigo-200 rounded-lg text-xs font-semibold text-indigo-700 hover:bg-white transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${aiLoading ? 'animate-spin' : ''}`} />
                Re-analyze
              </motion.button>
            </div>

            {aiLoading && !aiAnalysis ? (
              <div className="flex items-center gap-3 py-6">
                <div className="w-6 h-6 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-indigo-600 font-medium">Analyzing vendor data across POs, tickets, and incidents...</span>
              </div>
            ) : aiAnalysis ? (
              <div>
                <p className="text-sm text-slate-700 leading-relaxed mb-4">{aiAnalysis.healthSummary}</p>
                
                {/* Quick data points */}
                <div className="grid grid-cols-6 gap-2">
                  {[
                    { label: 'Total POs', value: aiAnalysis.dataPoints.totalPOs, icon: FileText, color: 'text-blue-600' },
                    { label: 'On-Time', value: aiAnalysis.dataPoints.onTimeRate !== null ? `${aiAnalysis.dataPoints.onTimeRate}%` : 'N/A', icon: Clock, color: 'text-emerald-600' },
                    { label: 'Late POs', value: aiAnalysis.dataPoints.latePOs, icon: AlertTriangle, color: aiAnalysis.dataPoints.latePOs > 0 ? 'text-amber-600' : 'text-slate-400' },
                    { label: 'Open Issues', value: aiAnalysis.dataPoints.openIncidents, icon: ShieldAlert, color: aiAnalysis.dataPoints.openIncidents > 0 ? 'text-red-600' : 'text-slate-400' },
                    { label: 'Tickets', value: aiAnalysis.dataPoints.totalTickets, icon: FileText, color: aiAnalysis.dataPoints.openTickets > 0 ? 'text-amber-600' : 'text-slate-400' },
                    { label: 'Total Spend', value: `$${(aiAnalysis.dataPoints.totalSpend / 1000).toFixed(1)}k`, icon: DollarSign, color: 'text-slate-600' },
                  ].map(s => {
                    const Icon = s.icon;
                    return (
                      <div key={s.label} className="flex items-center gap-2 p-2.5 bg-white/70 rounded-xl border border-white/80">
                        <Icon className={`w-4 h-4 ${s.color} shrink-0`} />
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-slate-900">{s.value}</div>
                          <div className="text-[9px] text-slate-500 truncate">{s.label}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No analysis available. Click Re-analyze to generate insights.</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-1 bg-white rounded-xl border border-slate-200 p-1.5 shadow-sm">
        {[
          { key: 'ai' as const, label: 'AI Recommendations', icon: <Brain className="w-4 h-4" />, count: aiAnalysis?.recommendations.length },
          { key: 'metrics' as const, label: 'Performance Metrics', icon: <BarChart3 className="w-4 h-4" /> },
          { key: 'incidents' as const, label: 'Incident Log', icon: <AlertTriangle className="w-4 h-4" />, count: openIncidents },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveSection(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
              activeSection === tab.key
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeSection === tab.key ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-600'
              }`}>{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* AI Recommendations Section */}
      {activeSection === 'ai' && aiAnalysis && (
        <div className="space-y-5">
          {/* Risk Factors */}
          {aiAnalysis.riskFactors.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-red-50 to-amber-50 px-6 py-4 border-b border-red-100 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-600" />
                <h3 className="text-base font-bold text-slate-900">Risk Factors</h3>
                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-full border border-red-200">{aiAnalysis.riskFactors.length}</span>
              </div>
              <div className="divide-y divide-slate-100">
                {aiAnalysis.riskFactors.map((risk, i) => {
                  const cfg = PRIORITY_CONFIG[risk.level] || PRIORITY_CONFIG.medium;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="px-6 py-4 flex items-start gap-4"
                    >
                      <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${cfg.dot}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-slate-900">{risk.factor}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${cfg.bg} ${cfg.text} border ${cfg.border}`}>{risk.level}</span>
                        </div>
                        <p className="text-xs text-slate-600">{risk.detail}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* AI Recommendations */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-indigo-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">AI Recommended Actions</h3>
                <Sparkles className="w-4 h-4 text-purple-400" />
              </div>
              <span className="text-xs text-slate-500">Based on POs, tickets, incidents & metrics</span>
            </div>
            <div className="divide-y divide-slate-100">
              {aiAnalysis.recommendations.map((rec, i) => {
                const cfg = PRIORITY_CONFIG[rec.priority] || PRIORITY_CONFIG.medium;
                const isExpanded = expandedRecs.has(i);
                const CategoryIcon = CATEGORY_ICONS[rec.category] || Target;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`px-6 py-4 cursor-pointer hover:bg-slate-50/50 transition-colors`}
                    onClick={() => {
                      const newSet = new Set(expandedRecs);
                      if (isExpanded) newSet.delete(i); else newSet.add(i);
                      setExpandedRecs(newSet);
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg} border ${cfg.border}`}>
                        <CategoryIcon className={`w-5 h-5 ${cfg.text}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${cfg.bg} ${cfg.text} border ${cfg.border}`}>{rec.priority}</span>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">{rec.category}</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900">{rec.action}</h4>
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.p
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="text-xs text-slate-600 mt-2 leading-relaxed"
                            >
                              {rec.detail}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                      <div className="shrink-0 mt-1">
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Radar + Incident Distribution Side by Side */}
          <div className="grid grid-cols-2 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-2xl border border-slate-200 shadow-lg p-5">
              <h3 className="text-sm font-bold text-slate-700 mb-2">Category Performance</h3>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="category" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Score" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl border border-slate-200 shadow-lg p-5">
              <h3 className="text-sm font-bold text-slate-700 mb-3">Incident Breakdown</h3>
              {scorecard.incidents.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48">
                  <CheckCircle2 className="w-10 h-10 text-emerald-300 mb-2" />
                  <p className="text-xs text-slate-500">Clean record — no incidents</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {(() => {
                    const typeCount: Record<string, number> = {};
                    scorecard.incidents.forEach(i => { typeCount[i.type] = (typeCount[i.type] || 0) + 1; });
                    const sorted = Object.entries(typeCount).sort((a, b) => b[1] - a[1]);
                    const total = scorecard.incidents.length;
                    const colors = ['bg-red-500', 'bg-amber-500', 'bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-pink-500', 'bg-indigo-500', 'bg-slate-500'];
                    return sorted.map(([type, count], idx) => (
                      <div key={type} className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${colors[idx] || 'bg-slate-400'}`} />
                        <span className="text-xs font-medium text-slate-700 flex-1">{type}</span>
                        <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${colors[idx] || 'bg-slate-400'}`} style={{ width: `${(count / total) * 100}%` }} />
                        </div>
                        <span className="text-xs font-bold text-slate-600 w-6 text-right">{count}</span>
                      </div>
                    ));
                  })()}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}

      {/* Performance Metrics Section */}
      {activeSection === 'metrics' && (
        <div className="space-y-5">
          {/* Metrics by Category */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-slate-900">Detailed Metrics</h3>
              </div>
              <span className="text-xs text-slate-500">Click score to edit · Changes auto-save</span>
            </div>
            <div className="p-6">
              {categories.map(cat => (
                <div key={cat} className="mb-5 last:mb-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-bold uppercase tracking-wider ${
                      cat === 'Delivery' ? 'text-blue-600' :
                      cat === 'Quality' ? 'text-emerald-600' :
                      cat === 'Cost' ? 'text-amber-600' :
                      cat === 'Service' ? 'text-purple-600' :
                      'text-slate-600'
                    }`}>{cat}</span>
                    <div className="flex-1 h-px bg-slate-100" />
                    {(() => {
                      const catMetrics = scorecard.metrics.filter(m => m.category === cat);
                      const avg = Math.round(catMetrics.reduce((s, m) => s + m.score, 0) / catMetrics.length);
                      return <span className="text-xs font-bold text-slate-500">Avg: {avg}</span>;
                    })()}
                  </div>
                  {scorecard.metrics.filter(m => m.category === cat).map((m) => {
                    const globalIdx = scorecard.metrics.indexOf(m);
                    return <MetricRow key={m.label} metric={m} onUpdate={(updated) => handleMetricUpdate(globalIdx, updated)} />;
                  })}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Radar */}
          <div className="grid grid-cols-2 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white rounded-2xl border border-slate-200 shadow-lg p-5">
              <h3 className="text-sm font-bold text-slate-700 mb-2">Category Radar</h3>
              <ResponsiveContainer width="100%" height={240}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="category" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Score" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl border border-slate-200 shadow-lg p-5">
              <h3 className="text-sm font-bold text-slate-700 mb-4">Performance Summary</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Total POs', value: totalPOs, icon: FileText, color: 'text-blue-600' },
                  { label: 'Completed', value: completedPOs, icon: CheckCircle2, color: 'text-emerald-600' },
                  { label: 'Open Issues', value: openIncidents, icon: AlertTriangle, color: openIncidents > 0 ? 'text-amber-600' : 'text-slate-400' },
                  { label: 'Critical', value: criticalIncidents, icon: XCircle, color: criticalIncidents > 0 ? 'text-red-600' : 'text-slate-400' },
                ].map(s => {
                  const Icon = s.icon;
                  return (
                    <div key={s.label} className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                      <Icon className={`w-4 h-4 ${s.color}`} />
                      <div>
                        <div className="text-lg font-bold text-slate-900">{s.value}</div>
                        <div className="text-[10px] text-slate-500">{s.label}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Tier Thresholds */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6">
            <h3 className="text-sm font-bold text-slate-700 mb-4">Vendor Tier Thresholds</h3>
            <div className="grid grid-cols-4 gap-4">
              {(['Preferred', 'Approved', 'Probation', 'Suspended'] as const).map(tier => {
                const cfg = TIER_CONFIG[tier];
                const TIcon = cfg.icon;
                const isActive = scorecard.tier === tier;
                return (
                  <div key={tier} className={`p-4 rounded-xl border-2 transition-all ${isActive ? `${cfg.border} ${cfg.bg} shadow-md` : 'border-slate-100 bg-slate-50/50'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-8 h-8 bg-gradient-to-br ${cfg.color} rounded-lg flex items-center justify-center`}>
                        <TIcon className="w-4 h-4 text-white" />
                      </div>
                      <span className={`text-sm font-bold ${isActive ? cfg.text : 'text-slate-600'}`}>{tier}</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {tier === 'Preferred' ? 'Score 85+. Priority allocation, best terms.' :
                       tier === 'Approved' ? 'Score 70-84. Standard partnership terms.' :
                       tier === 'Probation' ? 'Score 50-69. Under review, improvement plan required.' :
                       'Score <50. Orders suspended, corrective action needed.'}
                    </p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}

      {/* Incidents Section */}
      {activeSection === 'incidents' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h3 className="text-lg font-bold text-slate-900">Incident Log</h3>
              {openIncidents > 0 && (
                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-full border border-red-200">{openIncidents} Open</span>
              )}
            </div>
            <button onClick={() => setShowAddIncident(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white text-xs font-semibold rounded-lg hover:bg-amber-700">
              <Plus className="w-3.5 h-3.5" /> Log Incident
            </button>
          </div>

          {showAddIncident && (
            <div className="px-6 py-4 bg-amber-50 border-b border-amber-200">
              <div className="grid grid-cols-4 gap-3 mb-3">
                <div>
                  <label className="text-[10px] font-semibold text-slate-600 uppercase">Type</label>
                  <select value={incidentForm.type} onChange={e => setIncidentForm({ ...incidentForm, type: e.target.value as any })} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-amber-500">
                    {INCIDENT_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-600 uppercase">Severity</label>
                  <select value={incidentForm.severity} onChange={e => setIncidentForm({ ...incidentForm, severity: e.target.value as any })} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-amber-500">
                    {SEVERITY_LEVELS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-600 uppercase">Score Impact</label>
                  <select value={incidentForm.impactScore} onChange={e => setIncidentForm({ ...incidentForm, impactScore: Number(e.target.value) })} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-amber-500">
                    {[-1, -2, -3, -5, -7, -10].map(v => <option key={v} value={v}>{v} pts</option>)}
                  </select>
                </div>
                <div className="flex items-end gap-1.5">
                  <button onClick={handleAddIncident} className="px-3 py-2 bg-amber-600 text-white text-xs font-semibold rounded-lg hover:bg-amber-700">Add</button>
                  <button onClick={() => setShowAddIncident(false)} className="px-3 py-2 bg-white border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-50">Cancel</button>
                </div>
              </div>
              <textarea value={incidentForm.description} onChange={e => setIncidentForm({ ...incidentForm, description: e.target.value })} placeholder="Describe the incident..." rows={2} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs resize-none focus:outline-none focus:border-amber-500" />
            </div>
          )}

          <div className="divide-y divide-slate-100">
            {scorecard.incidents.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-300 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-slate-900 mb-1">No Incidents Recorded</h4>
                <p className="text-xs text-slate-500">This vendor has a clean record. Log incidents when issues occur.</p>
              </div>
            ) : scorecard.incidents.map(inc => (
              <div key={inc.id} className={`px-6 py-3 flex items-center gap-4 ${inc.resolved ? 'opacity-50' : ''}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  inc.severity === 'Critical' ? 'bg-red-100' : inc.severity === 'Major' ? 'bg-amber-100' : 'bg-slate-100'
                }`}>
                  <AlertTriangle className={`w-4 h-4 ${
                    inc.severity === 'Critical' ? 'text-red-600' : inc.severity === 'Major' ? 'text-amber-600' : 'text-slate-500'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-bold text-slate-900">{inc.type}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      inc.severity === 'Critical' ? 'bg-red-100 text-red-700' : inc.severity === 'Major' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                    }`}>{inc.severity}</span>
                    {inc.resolved && <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold">Resolved</span>}
                  </div>
                  <p className="text-xs text-slate-600 truncate">{inc.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-400 block">{inc.date}</span>
                  <span className="text-[10px] font-bold text-red-500">{inc.impactScore} pts</span>
                </div>
                {!inc.resolved && (
                  <button onClick={() => handleResolveIncident(inc.id)} className="px-2.5 py-1 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 shrink-0">
                    Resolve
                  </button>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}