import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, DollarSign, Calendar, User, Clock, Phone, Mail, Edit, Trash2,
  Building2, Target, FileText, MessageSquare, Plus, Send, CheckCircle2,
  AlertTriangle, Zap, TrendingUp, ExternalLink, Paperclip, ChevronDown,
  Tag, Hash, Globe, Activity, Star, ClipboardList, ChevronRight, Check, X,
  NotepadText, Pencil, ArrowRight, Sparkles, MoreHorizontal,
} from 'lucide-react';
import { useState, useRef, useEffect, useCallback, KeyboardEvent } from 'react';
import { toast } from 'sonner';

const headers_json = { 'Content-Type': 'application/json' };

const PIPELINE_STAGES = [
  { id: 'lead-received', label: 'Lead Received', color: '#3b82f6', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', weight: 0.10 },
  { id: 'qualified-buyer', label: 'Qualified Buyer', color: '#06b6d4', bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', weight: 0.25 },
  { id: 'order-request', label: 'Order Request', color: '#f59e0b', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', weight: 0.50 },
  { id: 'design-ready', label: 'Design Ready', color: '#8b5cf6', bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', weight: 0.60 },
  { id: 'pending-payment', label: 'Pending Payment', color: '#10b981', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', weight: 0.90 },
  { id: 'closed-won', label: 'Closed Won', color: '#16a34a', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', weight: 1.0 },
  { id: 'closed-lost', label: 'Closed Lost', color: '#ef4444', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', weight: 0 },
];

const SOURCE_CATEGORY_OPTIONS = [
  { value: '', label: '— None —' },
  { value: 'organic', label: 'Organic' },
  { value: 'paid', label: 'Paid Ads' },
  { value: 'referral', label: 'Referral' },
  { value: 'direct', label: 'Direct' },
  { value: 'email', label: 'Email' },
  { value: 'social', label: 'Social' },
  { value: 'outbound', label: 'Outbound' },
];

const LEAD_SOURCE_OPTIONS = [
  'Website', 'Referral', 'Trade Show', 'Cold Outreach', 'Social Media',
  'Google Ads', 'Email Campaign', 'LinkedIn', 'Partner', 'Inbound Call', 'RFQ Portal',
];

const PRODUCT_TYPE_OPTIONS = [
  'Apparel', 'Drinkware', 'Bags', 'Tech', 'Office', 'Outdoor', 'Stickers', 'Hats', 'Pens', 'Custom',
];

const DISQUALIFIED_REASON_LABELS: Record<string, string> = {
  'bad-fit': 'Bad Fit',
  budget: 'No Budget',
  timing: 'Bad Timing',
  competitor: 'Went with Competitor',
  'no-response': 'No Response',
  spam: 'Spam / Invalid',
  duplicate: 'Duplicate',
};

interface ScoreBreakdown {
  source: number;
  email: number;
  phone: number;
  amount: number;
  existingCustomer: number;
  disposablePenalty: number;
  disqualifiedPenalty: number;
}

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
  sourceCategory?: string | null;
  sourceDetail?: string | null;
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
  score?: number;
  scoreBreakdown?: ScoreBreakdown;
  scoreUpdatedAt?: string;
  disqualifiedReason?: string | null;
  emailType?: 'business' | 'personal' | 'disposable' | 'unknown' | null;
  isExistingCustomer?: boolean;
  enrichedCompany?: string | null;
  utm?: { source?: string; medium?: string; campaign?: string; term?: string; content?: string } | null;
  referrer?: string | null;
  landingPage?: string | null;
  gclid?: string | null;
  fbclid?: string | null;
  capturedAt?: string | null;
  captureFormId?: string | null;
  formSubmitCount?: number;
  sourceOrderId?: string | null;
  sourceOrderNumber?: string | null;
  orderLinkedAt?: string | null;
}

type ActivityType = 'created' | 'stage-change' | 'edit' | 'file-upload' | 'note' | 'task' | 'call' | 'email' | 'order-linked' | 'system';

interface ActivityItem {
  id: string;
  leadId: string;
  type: ActivityType;
  content: string;
  details?: string;
  user: string;
  userInitials: string;
  timestamp: string;
  fromStage?: string | null;
  toStage?: string | null;
  taskCompleted?: boolean;
  taskDueDate?: string | null;
  orderId?: string | null;
  orderNumber?: string | null;
}

const ACTIVITY_TYPE_META: Record<ActivityType, { icon: any; chip: string; label: string }> = {
  'created':       { icon: Sparkles,    chip: 'bg-emerald-100 text-emerald-700', label: 'Created' },
  'stage-change':  { icon: Activity,    chip: 'bg-indigo-100 text-indigo-700',   label: 'Stage' },
  'edit':          { icon: Pencil,      chip: 'bg-slate-100 text-slate-700',     label: 'Edit' },
  'file-upload':   { icon: Paperclip,   chip: 'bg-fuchsia-100 text-fuchsia-700', label: 'File' },
  'note':          { icon: NotepadText, chip: 'bg-amber-100 text-amber-700',     label: 'Note' },
  'task':          { icon: ClipboardList, chip: 'bg-violet-100 text-violet-700', label: 'Task' },
  'call':          { icon: Phone,       chip: 'bg-cyan-100 text-cyan-700',       label: 'Call' },
  'email':         { icon: Mail,        chip: 'bg-blue-100 text-blue-700',       label: 'Email' },
  'order-linked':  { icon: CheckCircle2, chip: 'bg-green-100 text-green-700',    label: 'Order' },
  'system':        { icon: Zap,         chip: 'bg-slate-100 text-slate-600',     label: 'System' },
};

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function timeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

function stageLabel(stageId?: string | null): string {
  if (!stageId) return '—';
  return PIPELINE_STAGES.find(s => s.id === stageId)?.label ?? stageId;
}

// ────── EditableField — click any value to inline-edit ──────
type EditableType = 'text' | 'select' | 'date' | 'number' | 'currency' | 'textarea' | 'email';

interface EditableFieldProps {
  label: string;
  value: string | number | null | undefined;
  type?: EditableType;
  options?: { value: string; label: string }[];
  onSave: (newValue: any) => Promise<void>;
  formatter?: (v: any) => string;
  placeholder?: string;
  readOnly?: boolean;
}

function EditableField({ label, value, type = 'text', options, onSave, formatter, placeholder, readOnly }: EditableFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<string>(value === null || value === undefined ? '' : String(value));
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null>(null);

  useEffect(() => {
    if (!editing) setDraft(value === null || value === undefined ? '' : String(value));
  }, [value, editing]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      if ('select' in inputRef.current && type !== 'select') {
        try { (inputRef.current as HTMLInputElement).select(); } catch { /* noop */ }
      }
    }
  }, [editing, type]);

  const startEdit = () => { if (!readOnly) setEditing(true); };
  const cancel = () => { setEditing(false); setDraft(value === null || value === undefined ? '' : String(value)); };

  const commit = async () => {
    const original = value === null || value === undefined ? '' : String(value);
    if (draft === original) { setEditing(false); return; }
    setSaving(true);
    try {
      let payload: any = draft;
      if (type === 'number' || type === 'currency') {
        const n = Number(draft.replace(/[^0-9.\-]/g, ''));
        payload = Number.isFinite(n) ? n : 0;
      }
      if (type === 'select') payload = draft || null;
      await onSave(payload);
      setEditing(false);
    } catch (err) {
      // Stay in edit mode on error so the user can retry; toast already shown by parent.
    } finally {
      setSaving(false);
    }
  };

  const handleKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') { e.preventDefault(); cancel(); return; }
    if (e.key === 'Enter' && type !== 'textarea') { e.preventDefault(); commit(); return; }
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && type === 'textarea') { e.preventDefault(); commit(); }
  };

  const display = formatter
    ? formatter(value)
    : (value === null || value === undefined || value === '' ? '—' : String(value));

  if (editing) {
    return (
      <div className="grid grid-cols-[100px_1fr] gap-3 items-start py-1.5 px-3 bg-slate-50 rounded">
        <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider pt-1.5">{label}</label>
        <div className="flex items-center gap-1.5">
          {type === 'textarea' ? (
            <textarea
              ref={inputRef as any}
              rows={3}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={handleKey}
              className="flex-1 px-2 py-1 bg-white border border-slate-300 rounded text-[13px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 resize-none"
            />
          ) : type === 'select' ? (
            <select
              ref={inputRef as any}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={handleKey}
              className="flex-1 px-2 py-1 bg-white border border-slate-300 rounded text-[13px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
            >
              {options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          ) : (
            <input
              ref={inputRef as any}
              type={type === 'date' ? 'date' : type === 'email' ? 'email' : type === 'number' || type === 'currency' ? 'text' : 'text'}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={handleKey}
              placeholder={placeholder}
              className="flex-1 px-2 py-1 bg-white border border-slate-300 rounded text-[13px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
            />
          )}
          {saving && <span className="text-[10px] text-slate-400">saving…</span>}
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={startEdit}
      disabled={readOnly}
      className={`group w-full text-left grid grid-cols-[100px_1fr] gap-3 items-start py-1.5 px-3 -mx-3 rounded transition-colors ${
        readOnly ? 'cursor-default' : 'hover:bg-slate-50 cursor-pointer'
      }`}
    >
      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider pt-0.5">{label}</span>
      <span className="text-[13px] text-slate-900 break-words flex items-center justify-between gap-2 min-w-0">
        <span className={`truncate ${value === null || value === undefined || value === '' ? 'text-slate-400' : ''}`}>
          {display}
        </span>
        {!readOnly && <Pencil className="w-3 h-3 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />}
      </span>
    </button>
  );
}

// ────── ActivityComposer — quick-add note/task/call ──────
function ActivityComposer({ onAdd }: { onAdd: (a: { type: 'note' | 'task' | 'call'; content: string; details?: string; taskDueDate?: string }) => Promise<void> }) {
  const [active, setActive] = useState<'note' | 'task' | 'call' | null>(null);
  const [content, setContent] = useState('');
  const [details, setDetails] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reset = () => { setContent(''); setDetails(''); setDueDate(''); setActive(null); };

  const submit = async () => {
    if (!content.trim()) {
      toast.error(active === 'task' ? 'Task description is required.' : active === 'call' ? 'Call summary is required.' : 'Note is required.');
      return;
    }
    setSubmitting(true);
    try {
      await onAdd({
        type: active!,
        content: content.trim(),
        details: details.trim() || undefined,
        taskDueDate: active === 'task' && dueDate ? dueDate : undefined,
      });
      reset();
    } finally {
      setSubmitting(false);
    }
  };

  const tabBtn = (kind: 'note' | 'task' | 'call', Icon: any, label: string) => (
    <button
      key={kind}
      type="button"
      onClick={() => setActive(active === kind ? null : kind)}
      className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold rounded-md transition-colors ${
        active === kind
          ? 'bg-slate-900 text-white'
          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
      }`}
    >
      <Icon className="w-3.5 h-3.5" /> {label}
    </button>
  );

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3">
      <div className="flex items-center gap-2">
        {tabBtn('note', NotepadText, 'Note')}
        {tabBtn('task', ClipboardList, 'Task')}
        {tabBtn('call', Phone, 'Log call')}
      </div>

      <AnimatePresence initial={false}>
        {active && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-2">
              <input
                autoFocus
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={
                  active === 'note' ? 'Write a note…'
                    : active === 'task' ? 'Task description…'
                      : 'Who did you talk to and what came of it?'
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-300 focus:ring-2 focus:ring-indigo-500/15"
              />
              {active === 'task' && (
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-[12px] text-slate-700 focus:outline-none focus:bg-white focus:border-slate-300"
                />
              )}
              {active !== 'task' && (
                <textarea
                  rows={2}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Optional detail…"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-300 focus:ring-2 focus:ring-indigo-500/15 resize-none"
                />
              )}
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={reset}
                  disabled={submitting}
                  className="px-3 py-1.5 text-[12px] font-medium text-slate-600 hover:bg-slate-50 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submit}
                  disabled={submitting || !content.trim()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-[12px] font-semibold rounded-md hover:shadow-md hover:shadow-indigo-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send className="w-3 h-3" />
                  {submitting ? 'Saving…' : `Save ${active}`}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ────── ActivityCard — one row in the feed ──────
function ActivityCard({
  activity,
  onDelete,
  onToggleTask,
  onOpenOrder,
}: {
  activity: ActivityItem;
  onDelete: (id: string) => Promise<void>;
  onToggleTask: (id: string, completed: boolean) => Promise<void>;
  onOpenOrder?: (orderId: string) => void;
}) {
  const meta = ACTIVITY_TYPE_META[activity.type] ?? ACTIVITY_TYPE_META['system'];
  const Icon = meta.icon;
  const userOwned = activity.type === 'note' || activity.type === 'task' || activity.type === 'call';
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="group relative bg-white border border-slate-200 rounded-lg p-3 hover:border-slate-300 transition-colors">
      <div className="flex items-start gap-2.5">
        <div className={`shrink-0 w-7 h-7 rounded-md flex items-center justify-center ${meta.chip}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            {activity.type === 'task' && (
              <button
                onClick={() => onToggleTask(activity.id, !activity.taskCompleted)}
                className={`shrink-0 w-3.5 h-3.5 rounded-sm border flex items-center justify-center transition-colors ${
                  activity.taskCompleted
                    ? 'bg-emerald-600 border-emerald-600'
                    : 'border-slate-300 hover:border-emerald-400'
                }`}
                title={activity.taskCompleted ? 'Mark incomplete' : 'Mark complete'}
              >
                {activity.taskCompleted && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
              </button>
            )}
            <span
              className={`text-[13px] text-slate-900 leading-snug ${activity.taskCompleted ? 'line-through text-slate-400' : ''}`}
            >
              {activity.type === 'stage-change' && activity.fromStage && activity.toStage ? (
                <>
                  Moved <span className="font-semibold">{stageLabel(activity.fromStage)}</span>
                  <ArrowRight className="inline w-3 h-3 mx-1 text-slate-400" />
                  <span className="font-semibold">{stageLabel(activity.toStage)}</span>
                </>
              ) : (
                activity.content
              )}
            </span>
          </div>

          {activity.type === 'order-linked' && activity.orderNumber && (
            <button
              onClick={() => activity.orderId && onOpenOrder?.(activity.orderId)}
              className="mt-1 inline-flex items-center gap-1 text-[12px] font-medium text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              {activity.orderNumber}
              <ExternalLink className="w-3 h-3" />
            </button>
          )}

          {activity.details && (
            <div className="mt-1">
              <p className={`text-[12px] text-slate-600 leading-relaxed whitespace-pre-wrap ${expanded ? '' : 'line-clamp-2'}`}>
                {activity.details}
              </p>
              {activity.details.length > 120 && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="mt-0.5 text-[11px] text-indigo-600 hover:underline"
                >
                  {expanded ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>
          )}

          {activity.type === 'task' && activity.taskDueDate && (
            <p className="mt-1 text-[11px] text-slate-500">
              Due {formatDate(activity.taskDueDate)}
            </p>
          )}

          <div className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 rounded-full bg-slate-700 text-white text-[8px] font-semibold flex items-center justify-center">
                {activity.userInitials || '·'}
              </span>
              {activity.user}
            </span>
            <span title={new Date(activity.timestamp).toLocaleString()}>{timeAgo(activity.timestamp)}</span>
          </div>
        </div>

        {userOwned && (
          <button
            onClick={() => onDelete(activity.id)}
            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-all shrink-0"
            title="Delete"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}

// ────── Main Detail View ──────
export function SalesLeadDetailView({ lead, onBack, onEdit, onDelete, onStageChange }: {
  lead: SalesLead;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onStageChange: (lead: SalesLead, newStage: string) => void;
}) {
  const stage = PIPELINE_STAGES.find(s => s.id === lead.stage) || PIPELINE_STAGES[0];
  const currentStageIdx = PIPELINE_STAGES.findIndex(s => s.id === lead.stage);

  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [filter, setFilter] = useState<ActivityType | 'all'>('all');

  // Fetch activity for this lead.
  const fetchActivity = useCallback(async () => {
    try {
      setLoadingActivity(true);
      const res = await fetch(`/api/sales-leads/activities/list?leadId=${encodeURIComponent(lead.id)}`, { headers: headers_json });
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && Array.isArray(data.activities)) {
        setActivities(data.activities);
      }
    } catch {
      /* soft-fail */
    } finally {
      setLoadingActivity(false);
    }
  }, [lead.id]);

  useEffect(() => { fetchActivity(); }, [fetchActivity]);

  // Save a single field via PATCH /api/sales-leads/update.
  const saveField = useCallback(async (patch: Record<string, any>) => {
    const res = await fetch('/api/sales-leads/update', {
      method: 'PATCH',
      headers: headers_json,
      body: JSON.stringify({ id: lead.id, ...patch }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const msg = data.error || 'Save failed';
      toast.error(msg);
      throw new Error(msg);
    }
    toast.success('Saved');
    // Stage changes are auto-logged server-side; refresh activity to reflect.
    if ('stage' in patch) fetchActivity();
  }, [lead.id, fetchActivity]);

  const addActivity = useCallback(async (a: { type: 'note' | 'task' | 'call'; content: string; details?: string; taskDueDate?: string }) => {
    try {
      const res = await fetch('/api/sales-leads/activities/create', {
        method: 'POST',
        headers: headers_json,
        body: JSON.stringify({
          leadId: lead.id,
          type: a.type,
          content: a.content,
          details: a.details,
          taskDueDate: a.taskDueDate,
          taskCompleted: a.type === 'task' ? false : undefined,
          user: lead.owner || 'You',
          userInitials: lead.ownerInitials || 'YO',
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || 'Could not save');
        return;
      }
      const data = await res.json();
      if (data.activity) {
        setActivities(prev => [data.activity, ...prev]);
      } else {
        fetchActivity();
      }
      toast.success(`${a.type === 'task' ? 'Task' : a.type === 'call' ? 'Call' : 'Note'} added`);
    } catch {
      toast.error('Could not save');
    }
  }, [lead.id, lead.owner, lead.ownerInitials, fetchActivity]);

  const deleteActivity = useCallback(async (id: string) => {
    setActivities(prev => prev.filter(a => a.id !== id));
    try {
      const res = await fetch('/api/sales-leads/activities/delete', {
        method: 'DELETE',
        headers: headers_json,
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        toast.error('Could not delete');
        fetchActivity();
      }
    } catch {
      fetchActivity();
    }
  }, [fetchActivity]);

  const toggleTask = useCallback(async (id: string, completed: boolean) => {
    setActivities(prev => prev.map(a => a.id === id ? { ...a, taskCompleted: completed } : a));
    try {
      const res = await fetch('/api/sales-leads/activities/update', {
        method: 'PATCH',
        headers: headers_json,
        body: JSON.stringify({ id, taskCompleted: completed }),
      });
      if (!res.ok) {
        toast.error('Could not update task');
        fetchActivity();
      }
    } catch {
      fetchActivity();
    }
  }, [fetchActivity]);

  const filteredActivities = filter === 'all' ? activities : activities.filter(a => a.type === filter);
  const taskCount = activities.filter(a => a.type === 'task' && !a.taskCompleted).length;
  const daysSinceActivity = lead.lastActivity ? Math.floor((Date.now() - new Date(lead.lastActivity).getTime()) / 86400000) : 0;

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50/30 overflow-hidden h-full">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <button onClick={onBack} className="flex items-center gap-1 text-[13px] font-semibold text-slate-600 hover:text-slate-900 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>Deals</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-[13px] font-semibold text-slate-900 truncate max-w-[420px]">{lead.title}</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={onEdit} className="flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-semibold text-slate-700 hover:bg-slate-50 rounded-md transition-colors">
              <Edit className="w-3.5 h-3.5" /> Edit
            </button>
            <button onClick={onDelete} className="flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-semibold text-red-600 hover:bg-red-50 rounded-md transition-colors">
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        </div>
      </div>

      {/* Stage Progress */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="max-w-[1800px] mx-auto flex items-center gap-1">
          {PIPELINE_STAGES.map((s, idx) => {
            const isActive = s.id === lead.stage;
            const isPast = idx < currentStageIdx;
            return (
              <button
                key={s.id}
                onClick={() => onStageChange(lead, s.id)}
                className={`flex-1 relative py-1.5 px-2 text-[10.5px] font-semibold uppercase tracking-wider rounded transition-all text-center truncate ${
                  isActive ? 'text-white shadow-sm' : isPast ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'text-slate-400 hover:bg-slate-50'
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

      {/* Body — two columns */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-5 grid grid-cols-1 lg:grid-cols-12 gap-5">

          {/* Left rail — spec sheet */}
          <aside className="lg:col-span-4 space-y-4">

            {/* Header card */}
            <section className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <h2 className="text-[15px] font-semibold text-slate-900 leading-tight truncate">{lead.title}</h2>
                  <p className="text-[12px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                    <Building2 className="w-3 h-3" /> {lead.company || '—'}
                  </p>
                </div>
                {typeof lead.score === 'number' && (
                  <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-bold ${
                    lead.score >= 71 ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : lead.score >= 41 ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    <Star className="w-2.5 h-2.5" /> {lead.score}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="px-3 py-2 bg-slate-50 rounded">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Amount</p>
                  <p className="text-[15px] font-semibold text-slate-900 tabular-nums">${lead.amount.toLocaleString()}</p>
                </div>
                <div className="px-3 py-2 bg-slate-50 rounded">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Probability</p>
                  <p className="text-[15px] font-semibold text-slate-900 tabular-nums">{lead.probability}%</p>
                </div>
              </div>

              <div className="mt-3 inline-flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-semibold border" style={{ backgroundColor: stage.color + '15', color: stage.color, borderColor: stage.color + '40' }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: stage.color }} />
                {stage.label}
              </div>

              {lead.stage === 'closed-lost' && lead.disqualifiedReason && (
                <div className="mt-3 flex items-center gap-2 px-2.5 py-1.5 bg-red-50 border border-red-200 rounded text-[11px] text-red-700">
                  <X className="w-3 h-3 shrink-0" />
                  <span className="font-semibold">Lost: {DISQUALIFIED_REASON_LABELS[lead.disqualifiedReason] || lead.disqualifiedReason}</span>
                </div>
              )}

              {daysSinceActivity > 7 && (
                <div className="mt-3 flex items-center gap-2 px-2.5 py-1.5 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-700">
                  <AlertTriangle className="w-3 h-3 shrink-0" />
                  Stale — {daysSinceActivity} days inactive
                </div>
              )}
            </section>

            {/* Properties — click any row to edit */}
            <section className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Properties</h3>
                <span className="text-[10px] text-slate-400">Click to edit</span>
              </div>
              <div className="divide-y divide-slate-100 px-1.5 py-1.5">
                <EditableField label="Title" value={lead.title} type="text" onSave={(v) => saveField({ title: v })} />
                <EditableField label="Owner" value={lead.owner} type="text" onSave={(v) => saveField({ owner: v, ownerInitials: String(v).split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) })} />
                <EditableField label="Amount" value={lead.amount} type="currency" formatter={(v) => v ? `$${Number(v).toLocaleString()}` : '—'} onSave={(v) => saveField({ amount: v })} />
                <EditableField label="Quantity" value={lead.quantity} type="number" onSave={(v) => saveField({ quantity: v })} />
                <EditableField label="Product" value={lead.productType} type="select" options={PRODUCT_TYPE_OPTIONS.map(p => ({ value: p, label: p }))} onSave={(v) => saveField({ productType: v })} />
                <EditableField label="In-Hands" value={lead.inHandsDate ? lead.inHandsDate.slice(0, 10) : ''} type="date" formatter={(v) => v ? formatDate(v) : '—'} onSave={(v) => saveField({ inHandsDate: v })} />
                <EditableField label="Lead Source" value={lead.source} type="select" options={LEAD_SOURCE_OPTIONS.map(s => ({ value: s, label: s }))} onSave={(v) => saveField({ source: v })} />
                <EditableField label="Source Cat." value={lead.sourceCategory ?? ''} type="select" options={SOURCE_CATEGORY_OPTIONS} formatter={(v) => v ? String(v).charAt(0).toUpperCase() + String(v).slice(1) : '—'} onSave={(v) => saveField({ sourceCategory: v })} />
                <EditableField label="Source Detail" value={lead.sourceDetail ?? ''} type="text" placeholder="e.g. google-ads" onSave={(v) => saveField({ sourceDetail: v })} />
                <EditableField label="Notes" value={lead.notes} type="textarea" onSave={(v) => saveField({ notes: v })} />
                <EditableField label="Created" value={formatDate(lead.createdAt)} readOnly onSave={async () => { /* read-only */ }} />
              </div>
            </section>

            {/* Contact */}
            <section className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Contact</h3>
              </div>
              <div className="divide-y divide-slate-100 px-1.5 py-1.5">
                <EditableField label="Name" value={lead.contactName} type="text" onSave={(v) => {
                  const parts = String(v).trim().split(/\s+/);
                  const first = parts[0] ?? '';
                  const last = parts.slice(1).join(' ');
                  return saveField({ contactName: v, contactFirstName: first, contactLastName: last });
                }} />
                <EditableField label="Email" value={lead.contactEmail} type="email" onSave={(v) => saveField({ contactEmail: v })} />
                <EditableField label="Phone" value={lead.contactPhone} type="text" onSave={(v) => saveField({ contactPhone: v })} />
              </div>
            </section>

            {/* Linked order */}
            {lead.sourceOrderId && (
              <section className="bg-emerald-50/40 border border-emerald-200 rounded-lg p-4">
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 mb-2">Linked Order</h3>
                <button
                  onClick={() => { window.location.hash = `#orders/${lead.sourceOrderId}`; }}
                  className="flex items-center justify-between w-full text-left bg-white border border-emerald-200 rounded-md px-3 py-2 hover:border-emerald-300 transition-colors"
                >
                  <div>
                    <p className="text-[13px] font-semibold text-slate-900">{lead.sourceOrderNumber || 'Order'}</p>
                    {lead.orderLinkedAt && (
                      <p className="text-[11px] text-slate-500">Linked {formatDate(lead.orderLinkedAt)}</p>
                    )}
                  </div>
                  <ExternalLink className="w-4 h-4 text-emerald-600" />
                </button>
              </section>
            )}

            {/* Attribution */}
            {(lead.utm || lead.referrer || lead.landingPage || lead.capturedAt || lead.gclid || lead.fbclid || (lead.formSubmitCount ?? 0) > 0) && (
              <section className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Globe className="w-3 h-3" /> Attribution
                  </h3>
                </div>
                <div className="px-4 py-3 space-y-2 text-[12px]">
                  {lead.capturedAt && <p><span className="text-slate-400">Captured:</span> <span className="text-slate-700">{new Date(lead.capturedAt).toLocaleString()}</span></p>}
                  {(lead.formSubmitCount ?? 0) > 0 && <p><span className="text-slate-400">Submissions:</span> <span className="text-slate-700 font-semibold tabular-nums">{lead.formSubmitCount}</span></p>}
                  {lead.landingPage && <p><span className="text-slate-400">Landing:</span> <span className="text-slate-700 break-all">{lead.landingPage}</span></p>}
                  {lead.referrer && <p><span className="text-slate-400">Referrer:</span> <span className="text-slate-700 break-all">{lead.referrer}</span></p>}
                  {lead.utm && (lead.utm.source || lead.utm.medium || lead.utm.campaign) && (
                    <div className="pt-1 mt-1 border-t border-slate-100 grid grid-cols-2 gap-x-2 gap-y-0.5">
                      {lead.utm.source && <span className="text-slate-700"><span className="text-slate-400">source:</span> {lead.utm.source}</span>}
                      {lead.utm.medium && <span className="text-slate-700"><span className="text-slate-400">medium:</span> {lead.utm.medium}</span>}
                      {lead.utm.campaign && <span className="col-span-2 text-slate-700"><span className="text-slate-400">campaign:</span> {lead.utm.campaign}</span>}
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Score breakdown */}
            {lead.scoreBreakdown && (
              <section className="bg-white border border-slate-200 rounded-lg p-4">
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">Score Breakdown</h3>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11.5px]">
                  <div className="flex justify-between"><span className="text-slate-500">Source</span><span className="font-semibold text-slate-700 tabular-nums">{lead.scoreBreakdown.source}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Email</span><span className="font-semibold text-slate-700 tabular-nums">{lead.scoreBreakdown.email}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Phone</span><span className="font-semibold text-slate-700 tabular-nums">{lead.scoreBreakdown.phone}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Amount</span><span className="font-semibold text-slate-700 tabular-nums">{lead.scoreBreakdown.amount}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Existing</span><span className="font-semibold text-slate-700 tabular-nums">{lead.scoreBreakdown.existingCustomer}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Penalty</span><span className="font-semibold text-slate-700 tabular-nums">{lead.scoreBreakdown.disposablePenalty + lead.scoreBreakdown.disqualifiedPenalty}</span></div>
                </div>
              </section>
            )}

            {/* Tags */}
            {lead.tags && lead.tags.length > 0 && (
              <section className="bg-white border border-slate-200 rounded-lg p-4">
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-1.5">
                  {lead.tags.map(t => (
                    <span key={t} className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">{t}</span>
                  ))}
                </div>
              </section>
            )}
          </aside>

          {/* Right rail — activity */}
          <main className="lg:col-span-8 space-y-3">
            <ActivityComposer onAdd={addActivity} />

            {/* Filter chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              {(['all', 'note', 'task', 'call', 'email', 'stage-change', 'edit', 'file-upload', 'order-linked', 'created'] as const).map((f) => {
                const count = f === 'all' ? activities.length : activities.filter(a => a.type === f).length;
                if (f !== 'all' && count === 0) return null;
                const label = f === 'all' ? 'All'
                  : f === 'stage-change' ? 'Stage'
                  : f === 'order-linked' ? 'Order'
                  : f === 'created' ? 'Created'
                  : f === 'file-upload' ? 'File'
                  : f === 'edit' ? 'Edit'
                  : ACTIVITY_TYPE_META[f as ActivityType].label;
                const active = filter === f;
                return (
                  <button
                    key={f}
                    onClick={() => setFilter(f as any)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11.5px] font-medium transition-colors ${
                      active
                        ? 'bg-slate-900 text-white'
                        : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {label}
                    <span className={`tabular-nums ${active ? 'text-white/80' : 'text-slate-400'}`}>{count}</span>
                  </button>
                );
              })}
              {taskCount > 0 && filter === 'all' && (
                <span className="ml-auto text-[11.5px] text-slate-500">
                  <strong className="text-slate-900 tabular-nums">{taskCount}</strong> open {taskCount === 1 ? 'task' : 'tasks'}
                </span>
              )}
            </div>

            {/* Activity list */}
            <div className="space-y-2">
              {loadingActivity ? (
                <div className="bg-white border border-slate-200 rounded-lg p-8 text-center">
                  <p className="text-[12px] text-slate-400">Loading activity…</p>
                </div>
              ) : filteredActivities.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-lg p-8 text-center">
                  <MessageSquare className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                  <p className="text-[13px] font-semibold text-slate-700">
                    {filter === 'all' ? 'No activity yet' : `No ${filter} activity yet`}
                  </p>
                  <p className="text-[12px] text-slate-500 mt-1">
                    {filter === 'all' ? 'Notes, calls, stage changes — everything lives here.' : ''}
                  </p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {filteredActivities.map(a => (
                    <motion.div
                      key={a.id}
                      layout
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                    >
                      <ActivityCard
                        activity={a}
                        onDelete={deleteActivity}
                        onToggleTask={toggleTask}
                        onOpenOrder={(orderId) => { window.location.hash = `#orders/${orderId}`; }}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </main>

        </div>
      </div>
    </div>
  );
}
