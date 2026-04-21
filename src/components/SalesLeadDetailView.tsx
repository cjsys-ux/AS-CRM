import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, DollarSign, Calendar, User, Clock, Phone, Mail, Edit, Trash2,
  Building2, Target, FileText, MessageSquare, Plus, Send, CheckCircle2,
  AlertTriangle, Zap, TrendingUp, ExternalLink, Paperclip, ChevronDown,
  Tag, Hash, MapPin, Globe, Briefcase, Activity, Star, MoreHorizontal,
  ClipboardList, CircleDot, ChevronRight, Check, X, NotepadText
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const PIPELINE_STAGES = [
  { id: 'lead-received', label: 'Lead Received', color: '#3b82f6', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', weight: 0.10 },
  { id: 'qualified-buyer', label: 'Qualified Buyer', color: '#06b6d4', bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', weight: 0.25 },
  { id: 'order-request', label: 'Order Request', color: '#f59e0b', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', weight: 0.50 },
  { id: 'design-ready', label: 'Design Ready', color: '#8b5cf6', bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', weight: 0.60 },
  { id: 'pending-payment', label: 'Pending Payment', color: '#10b981', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', weight: 0.90 },
  { id: 'closed-won', label: 'Closed Won', color: '#16a34a', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', weight: 1.0 },
  { id: 'closed-lost', label: 'Closed Lost', color: '#ef4444', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', weight: 0 },
];

interface SalesLead {
  id: string;
  title: string;
  company: string;
  companyId?: string;
  contactName: string;
  contactFirstName?: string;
  contactLastName?: string;
  contactEmail: string;
  contactPhone: string;
  amount: number;
  stage: string;
  source: string;
  productType: string;
  inHandsDate: string;
  createdAt: string;
  lastActivity: string;
  owner: string;
  ownerInitials: string;
  notes: string;
  probability: number;
  quantity: number;
  tags: string[];
  documents?: { name: string; size: number; type: string; dataUrl?: string }[];
}

interface ActivityItem {
  id: string;
  type: 'note' | 'stage-change' | 'email' | 'call' | 'task' | 'created';
  content: string;
  user: string;
  userInitials: string;
  timestamp: string;
  details?: string;
  fromStage?: string;
  toStage?: string;
  completed?: boolean;
}

function generateMockActivities(lead: SalesLead): ActivityItem[] {
  const now = new Date();
  const activities: ActivityItem[] = [];
  const stage = PIPELINE_STAGES.find(s => s.id === lead.stage);

  activities.push({
    id: 'act-1',
    type: 'created',
    content: `Deal "${lead.title}" was created`,
    user: lead.owner || 'System',
    userInitials: lead.ownerInitials || 'SY',
    timestamp: lead.createdAt || new Date(now.getTime() - 14 * 86400000).toISOString(),
  });

  if (lead.stage !== 'lead-received') {
    activities.push({
      id: 'act-2',
      type: 'stage-change',
      content: `moved deal from Lead Received to ${stage?.label || lead.stage}`,
      user: lead.owner || 'System',
      userInitials: lead.ownerInitials || 'SY',
      timestamp: new Date(now.getTime() - 10 * 86400000).toISOString(),
      fromStage: 'lead-received',
      toStage: lead.stage,
    });
  }

  activities.push({
    id: 'act-3',
    type: 'email',
    content: `Sent introduction email to ${lead.contactName}`,
    user: lead.owner || 'System',
    userInitials: lead.ownerInitials || 'SY',
    timestamp: new Date(now.getTime() - 8 * 86400000).toISOString(),
    details: `Hi ${lead.contactFirstName || lead.contactName.split(' ')[0]},\n\nThank you for your interest. I wanted to follow up regarding the ${lead.productType || 'promotional'} items for your upcoming project.\n\nLooking forward to connecting.`,
  });

  activities.push({
    id: 'act-4',
    type: 'call',
    content: `Phone call with ${lead.contactName}`,
    user: lead.owner || 'System',
    userInitials: lead.ownerInitials || 'SY',
    timestamp: new Date(now.getTime() - 5 * 86400000).toISOString(),
    details: 'Discussed project requirements, timeline, and budget. Client is interested in proceeding with a sample order.',
  });

  if (lead.notes) {
    activities.push({
      id: 'act-5',
      type: 'note',
      content: lead.notes,
      user: lead.owner || 'System',
      userInitials: lead.ownerInitials || 'SY',
      timestamp: new Date(now.getTime() - 3 * 86400000).toISOString(),
    });
  }

  activities.push({
    id: 'act-6',
    type: 'task',
    content: 'Send product samples to client',
    user: lead.owner || 'System',
    userInitials: lead.ownerInitials || 'SY',
    timestamp: new Date(now.getTime() - 2 * 86400000).toISOString(),
    completed: true,
  });

  activities.push({
    id: 'act-7',
    type: 'task',
    content: 'Follow up on pricing approval',
    user: lead.owner || 'System',
    userInitials: lead.ownerInitials || 'SY',
    timestamp: new Date(now.getTime() - 1 * 86400000).toISOString(),
    completed: false,
  });

  return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

function formatDate(dateStr: string) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateTime(dateStr: string) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' at ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

const activityIcons: Record<string, { icon: any; bg: string; text: string }> = {
  'note': { icon: NotepadText, bg: 'bg-amber-100', text: 'text-amber-600' },
  'stage-change': { icon: Activity, bg: 'bg-indigo-100', text: 'text-indigo-600' },
  'email': { icon: Mail, bg: 'bg-blue-100', text: 'text-blue-600' },
  'call': { icon: Phone, bg: 'bg-green-100', text: 'text-green-600' },
  'task': { icon: ClipboardList, bg: 'bg-purple-100', text: 'text-purple-600' },
  'created': { icon: Zap, bg: 'bg-emerald-100', text: 'text-emerald-600' },
};

export function SalesLeadDetailView({ lead, onBack, onEdit, onDelete, onStageChange }: {
  lead: SalesLead;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onStageChange: (lead: SalesLead, newStage: string) => void;
}) {
  const stage = PIPELINE_STAGES.find(s => s.id === lead.stage) || PIPELINE_STAGES[0];
  const [activeTab, setActiveTab] = useState<'activity' | 'notes' | 'tasks' | 'documents'>('activity');
  const [newNote, setNewNote] = useState('');
  const [activities] = useState<ActivityItem[]>(() => generateMockActivities(lead));
  const [localNotes, setLocalNotes] = useState<{ id: string; content: string; timestamp: string; user: string }[]>([]);
  const [localTasks, setLocalTasks] = useState<{ id: string; content: string; completed: boolean; dueDate: string }[]>([
    { id: 't1', content: 'Send product samples to client', completed: true, dueDate: new Date(Date.now() - 2 * 86400000).toISOString() },
    { id: 't2', content: 'Follow up on pricing approval', completed: false, dueDate: new Date(Date.now() + 3 * 86400000).toISOString() },
    { id: 't3', content: 'Schedule design review meeting', completed: false, dueDate: new Date(Date.now() + 7 * 86400000).toISOString() },
  ]);
  const [newTask, setNewTask] = useState('');
  const [expandedActivities, setExpandedActivities] = useState<Set<string>>(new Set());
  const [stageDropdownOpen, setStageDropdownOpen] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (stageRef.current && !stageRef.current.contains(e.target as Node)) setStageDropdownOpen(false); };
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h);
  }, []);

  const toggleExpanded = (id: string) => {
    setExpandedActivities(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const addNote = () => {
    if (!newNote.trim()) return;
    setLocalNotes(prev => [{
      id: `note-${Date.now()}`, content: newNote.trim(),
      timestamp: new Date().toISOString(), user: lead.owner || 'You'
    }, ...prev]);
    setNewNote('');
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    setLocalTasks(prev => [...prev, {
      id: `task-${Date.now()}`, content: newTask.trim(), completed: false,
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString()
    }]);
    setNewTask('');
  };

  const toggleTask = (id: string) => {
    setLocalTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const daysSinceActivity = lead.lastActivity ? Math.floor((Date.now() - new Date(lead.lastActivity).getTime()) / 86400000) : 0;
  const currentStageIdx = PIPELINE_STAGES.findIndex(s => s.id === lead.stage);

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-50 via-slate-50 to-indigo-50/30 overflow-hidden h-full">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>Sales Leads</span>
            </button>
            <ChevronRight className="w-4 h-4 text-slate-300" />
            <span className="text-sm font-semibold text-slate-900 truncate max-w-[300px]">{lead.title}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onEdit} className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
              <Edit className="w-3.5 h-3.5" /> Edit
            </button>
            <button onClick={onDelete} className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-red-600 bg-white border border-red-200 rounded-xl hover:bg-red-50 transition-colors">
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        </div>
      </div>

      {/* Pipeline Stage Progress */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex items-center gap-1">
            {PIPELINE_STAGES.map((s, idx) => {
              const isActive = s.id === lead.stage;
              const isPast = idx < currentStageIdx;
              const isClosed = s.id === 'closed-won' || s.id === 'closed-lost';
              return (
                <button
                  key={s.id}
                  onClick={() => onStageChange(lead, s.id)}
                  className={`flex-1 relative py-2 px-2 text-[11px] font-semibold uppercase tracking-wider rounded-lg transition-all text-center truncate ${
                    isActive
                      ? 'text-white shadow-md'
                      : isPast
                        ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                  }`}
                  style={isActive ? { backgroundColor: s.color } : undefined}
                  title={s.label}
                >
                  {isPast && <Check className="w-3 h-3 inline mr-0.5 -mt-0.5" />}
                  <span className="hidden sm:inline">{s.label}</span>
                  <span className="sm:hidden">{s.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* ──── Left Column: Deal Info ──── */}
            <div className="lg:col-span-3 space-y-5">
              {/* Deal Header Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
                <div className="h-1.5 w-full" style={{ backgroundColor: stage.color }} />
                <div className="p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shrink-0">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-semibold text-slate-900 truncate">{lead.title}</h2>
                      <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3.5 h-3.5 shrink-0" />
                        {lead.company}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 bg-slate-50 rounded-xl px-4 py-3 text-center">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Amount</p>
                      <p className="text-lg font-semibold text-slate-900">${lead.amount.toLocaleString()}</p>
                    </div>
                    <div className="flex-1 bg-slate-50 rounded-xl px-4 py-3 text-center">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Probability</p>
                      <p className="text-lg font-semibold text-slate-900">{lead.probability}%</p>
                    </div>
                  </div>

                  {/* Stage badge */}
                  <div className="relative mb-4" ref={stageRef}>
                    <button
                      onClick={() => setStageDropdownOpen(!stageDropdownOpen)}
                      className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border ${stage.bg} ${stage.text} ${stage.border} hover:opacity-90 transition-opacity`}
                    >
                      <CircleDot className="w-3.5 h-3.5" />
                      {stage.label}
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${stageDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {stageDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                          className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl border border-slate-200 shadow-2xl z-50 py-1 overflow-hidden"
                        >
                          {PIPELINE_STAGES.map(s => (
                            <button
                              key={s.id}
                              onClick={() => { onStageChange(lead, s.id); setStageDropdownOpen(false); }}
                              className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2.5 transition-colors ${lead.stage === s.id ? 'bg-indigo-50 font-semibold text-indigo-700' : 'text-slate-700 hover:bg-slate-50'}`}
                            >
                              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                              {s.label}
                              {lead.stage === s.id && <Check className="w-3.5 h-3.5 ml-auto text-indigo-500" />}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {daysSinceActivity > 7 && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 rounded-xl border border-amber-200 mb-4">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="text-[11px] font-semibold text-amber-700">Stale — {daysSinceActivity} days inactive</span>
                    </div>
                  )}
                </div>
              </div>

              {/* About This Deal */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400" />
                    About This Deal
                  </h3>
                </div>
                <div className="p-5 space-y-3.5">
                  <InfoRow label="Deal Owner" value={lead.owner} icon={User} />
                  <InfoRow label="Lead Source" value={lead.source} icon={Zap} />
                  <InfoRow label="Product Type" value={lead.productType || '—'} icon={Tag} />
                  <InfoRow label="Quantity" value={lead.quantity > 0 ? `${lead.quantity.toLocaleString()} units` : '—'} icon={Hash} />
                  <InfoRow label="In-Hands Date" value={lead.inHandsDate ? formatDate(lead.inHandsDate) : '—'} icon={Calendar} />
                  <InfoRow label="Created" value={lead.createdAt ? formatDate(lead.createdAt) : '—'} icon={Clock} />
                  <InfoRow label="Last Activity" value={lead.lastActivity ? timeAgo(lead.lastActivity) : '—'} icon={Activity} />
                  <InfoRow label="Deal ID" value={lead.id} icon={Hash} mono />
                </div>
              </div>

              {/* Tags */}
              {lead.tags && lead.tags.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100">
                    <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                      <Tag className="w-4 h-4 text-slate-400" />
                      Tags
                    </h3>
                  </div>
                  <div className="p-5 flex flex-wrap gap-2">
                    {lead.tags.map(tag => (
                      <span key={tag} className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ──── Center Column: Activity Feed ──── */}
            <div className="lg:col-span-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
                {/* Tabs */}
                <div className="border-b border-slate-200">
                  <div className="flex">
                    {(['activity', 'notes', 'tasks', 'documents'] as const).map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-5 py-3.5 text-sm font-semibold capitalize transition-colors relative ${
                          activeTab === tab
                            ? 'text-indigo-600'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        {tab}
                        {activeTab === tab && (
                          <motion.div layoutId="detailTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-5">
                  {/* Activity Tab */}
                  {activeTab === 'activity' && (
                    <div className="space-y-0">
                      {activities.map((act, idx) => {
                        const iconInfo = activityIcons[act.type] || activityIcons['note'];
                        const Icon = iconInfo.icon;
                        const isExpanded = expandedActivities.has(act.id);
                        const isLast = idx === activities.length - 1;
                        return (
                          <div key={act.id} className="flex gap-3 relative">
                            {/* Timeline line */}
                            {!isLast && <div className="absolute left-[15px] top-9 bottom-0 w-px bg-slate-200" />}
                            {/* Icon */}
                            <div className={`w-8 h-8 ${iconInfo.bg} rounded-lg flex items-center justify-center shrink-0 z-10 mt-0.5`}>
                              <Icon className={`w-4 h-4 ${iconInfo.text}`} />
                            </div>
                            {/* Content */}
                            <div className="flex-1 pb-5 min-w-0">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  {act.type === 'stage-change' ? (
                                    <p className="text-sm text-slate-700">
                                      <span className="font-semibold text-slate-900">{act.user}</span> {act.content}
                                    </p>
                                  ) : act.type === 'created' ? (
                                    <p className="text-sm text-slate-700">{act.content}</p>
                                  ) : act.type === 'task' ? (
                                    <p className="text-sm text-slate-700">
                                      <span className={`font-semibold ${act.completed ? 'text-green-600' : 'text-slate-900'}`}>
                                        {act.completed ? '✓ ' : '○ '}
                                      </span>
                                      {act.content}
                                    </p>
                                  ) : (
                                    <p className="text-sm text-slate-700">
                                      <span className="font-semibold text-slate-900">{act.user}</span>
                                      {act.type === 'email' ? ' — ' : ' — '}
                                      {act.content}
                                    </p>
                                  )}
                                </div>
                                <span className="text-[11px] text-slate-400 whitespace-nowrap shrink-0 mt-0.5">{timeAgo(act.timestamp)}</span>
                              </div>
                              {act.details && (
                                <div className="mt-2">
                                  <button
                                    onClick={() => toggleExpanded(act.id)}
                                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                                  >
                                    {isExpanded ? 'Hide details' : 'View details'}
                                    <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                  </button>
                                  <AnimatePresence>
                                    {isExpanded && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                      >
                                        <div className="mt-2 p-3 bg-slate-50 rounded-xl text-sm text-slate-600 whitespace-pre-wrap border border-slate-200">
                                          {act.details}
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Notes Tab */}
                  {activeTab === 'notes' && (
                    <div className="space-y-4">
                      {/* Add Note */}
                      <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <textarea
                          value={newNote}
                          onChange={e => setNewNote(e.target.value)}
                          placeholder="Add a note..."
                          rows={3}
                          className="w-full px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none resize-none"
                        />
                        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-t border-slate-200">
                          <div className="flex items-center gap-2">
                            <button className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors"><Paperclip className="w-3.5 h-3.5 text-slate-400" /></button>
                          </div>
                          <button onClick={addNote} disabled={!newNote.trim()} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            <Send className="w-3 h-3" /> Save Note
                          </button>
                        </div>
                      </div>

                      {/* Notes List */}
                      {localNotes.length === 0 && !lead.notes ? (
                        <div className="text-center py-10">
                          <NotepadText className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                          <p className="text-sm text-slate-400">No notes yet. Add your first note above.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {localNotes.map(note => (
                            <div key={note.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 bg-gradient-to-br from-indigo-400 to-violet-500 rounded-full flex items-center justify-center">
                                    <span className="text-[9px] font-bold text-white">{note.user.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}</span>
                                  </div>
                                  <span className="text-xs font-semibold text-slate-700">{note.user}</span>
                                </div>
                                <span className="text-[11px] text-slate-400">{formatDateTime(note.timestamp)}</span>
                              </div>
                              <p className="text-sm text-slate-700 whitespace-pre-wrap">{note.content}</p>
                            </div>
                          ))}
                          {lead.notes && (
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 bg-gradient-to-br from-indigo-400 to-violet-500 rounded-full flex items-center justify-center">
                                    <span className="text-[9px] font-bold text-white">{lead.ownerInitials}</span>
                                  </div>
                                  <span className="text-xs font-semibold text-slate-700">{lead.owner}</span>
                                </div>
                                <span className="text-[11px] text-slate-400">Original notes</span>
                              </div>
                              <p className="text-sm text-slate-700 whitespace-pre-wrap">{lead.notes}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tasks Tab */}
                  {activeTab === 'tasks' && (
                    <div className="space-y-4">
                      {/* Add Task */}
                      <div className="flex items-center gap-2">
                        <input
                          value={newTask}
                          onChange={e => setNewTask(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') addTask(); }}
                          placeholder="Add a new task..."
                          className="flex-1 px-4 py-2.5 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                        />
                        <button onClick={addTask} disabled={!newTask.trim()} className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50">
                          <Plus className="w-4 h-4" /> Add
                        </button>
                      </div>

                      {/* Task List */}
                      <div className="space-y-2">
                        {localTasks.map(task => (
                          <div key={task.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${task.completed ? 'bg-slate-50/50 border-slate-100' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                            <button
                              onClick={() => toggleTask(task.id)}
                              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${task.completed ? 'bg-green-500 border-green-500' : 'border-slate-300 hover:border-indigo-400'}`}
                            >
                              {task.completed && <Check className="w-3 h-3 text-white" />}
                            </button>
                            <span className={`flex-1 text-sm ${task.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>{task.content}</span>
                            <span className="text-[11px] text-slate-400 shrink-0">{formatDate(task.dueDate)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Documents Tab */}
                  {activeTab === 'documents' && (
                    <div>
                      {(!lead.documents || lead.documents.length === 0) ? (
                        <div className="text-center py-10">
                          <Paperclip className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                          <p className="text-sm text-slate-400">No documents attached to this deal.</p>
                          <button className="mt-3 flex items-center gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-600 text-sm font-semibold rounded-xl hover:bg-indigo-100 transition-colors mx-auto">
                            <Plus className="w-4 h-4" /> Upload Document
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {lead.documents.map((doc, idx) => (
                            <div key={idx} className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
                              <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                                <FileText className="w-4 h-4 text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-900 truncate">{doc.name}</p>
                                <p className="text-[11px] text-slate-400">{(doc.size / 1024).toFixed(1)} KB · {doc.type}</p>
                              </div>
                              <button className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
                                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ──── Right Column: Contact & Company ──── */}
            <div className="lg:col-span-3 space-y-5">
              {/* Contact Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    Contact
                  </h3>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-md shrink-0">
                      <span className="text-sm font-bold text-white">
                        {lead.contactName ? lead.contactName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '??'}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{lead.contactName || '—'}</p>
                      <p className="text-xs text-slate-500">{lead.company}</p>
                    </div>
                  </div>

                  {lead.contactEmail && (
                    <a href={`mailto:${lead.contactEmail}`} className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-slate-50 rounded-xl transition-colors group mb-1">
                      <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                      <span className="text-sm text-slate-700 group-hover:text-indigo-600 truncate">{lead.contactEmail}</span>
                    </a>
                  )}
                  {lead.contactPhone && (
                    <a href={`tel:${lead.contactPhone}`} className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-slate-50 rounded-xl transition-colors group">
                      <Phone className="w-4 h-4 text-green-500 shrink-0" />
                      <span className="text-sm text-slate-700 group-hover:text-indigo-600">{lead.contactPhone}</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Company Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    Company
                  </h3>
                  {lead.companyId && (
                    <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{lead.companyId}</span>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-md shrink-0">
                      <span className="text-sm font-bold text-white">{lead.company.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{lead.company}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Deal Owner Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-slate-400" />
                    Deal Owner
                  </h3>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-violet-500 rounded-full flex items-center justify-center shadow-md shrink-0">
                      <span className="text-xs font-bold text-white">{lead.ownerInitials}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{lead.owner || '—'}</p>
                      <p className="text-xs text-slate-500">Sales Representative</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-slate-400" />
                    Deal Metrics
                  </h3>
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Weighted Value</span>
                    <span className="text-sm font-semibold text-slate-900">${Math.round(lead.amount * (lead.probability / 100)).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Days in Pipeline</span>
                    <span className="text-sm font-semibold text-slate-900">
                      {lead.createdAt ? Math.floor((Date.now() - new Date(lead.createdAt).getTime()) / 86400000) : '—'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Days Since Activity</span>
                    <span className={`text-sm font-semibold ${daysSinceActivity > 7 ? 'text-amber-600' : 'text-slate-900'}`}>
                      {daysSinceActivity}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-slate-500">Close Probability</span>
                      <span className="text-xs font-semibold text-slate-700">{lead.probability}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all" style={{ width: `${lead.probability}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, icon: Icon, mono }: { label: string; value: string; icon: any; mono?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">{label}</p>
        <p className={`text-sm text-slate-900 truncate ${mono ? 'font-mono text-xs' : ''}`}>{value}</p>
      </div>
    </div>
  );
}
