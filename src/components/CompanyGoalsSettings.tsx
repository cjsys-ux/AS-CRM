import { motion } from 'motion/react';
import { Target, DollarSign, Save, Loader2, Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const headers_json = { 'Content-Type': 'application/json' };

export function CompanyGoalsSettings() {
  const [monthlyGoal, setMonthlyGoal] = useState<string>('');
  const [initialGoal, setInitialGoal] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/settings/company-goals/get', { headers: headers_json });
        const data = await res.json();
        if (cancelled) return;
        const v = Number(data?.goals?.monthlyRevenueGoal) || 0;
        setInitialGoal(v);
        setMonthlyGoal(v ? String(v) : '');
      } catch {
        if (!cancelled) toast.error('Could not load company goals');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const parsedGoal = Number(String(monthlyGoal).replace(/[^0-9.]/g, '')) || 0;
  const dirty = parsedGoal !== initialGoal;

  const handleSave = async () => {
    if (!dirty || saving) return;
    setSaving(true);
    try {
      const res = await fetch('/api/settings/company-goals/save', {
        method: 'POST',
        headers: headers_json,
        body: JSON.stringify({ goals: { monthlyRevenueGoal: parsedGoal } }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Save failed');
      setInitialGoal(parsedGoal);
      setSavedAt(new Date());
      toast.success('Monthly revenue goal saved');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const formattedPreview = parsedGoal > 0
    ? `$${parsedGoal.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
    : '—';

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Company Goals</h2>
            <p className="text-sm text-slate-500">Set company-wide targets that show up across the app.</p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
        >
          <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Monthly Revenue Goal</h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Drives the progress ring on the Sales board. Counts revenue from deals closed‑won in the current calendar month.
            </p>
          </div>

          <div className="px-6 py-6">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Monthly target
            </label>
            <div className="flex items-stretch gap-3">
              <div className="relative flex-1 max-w-sm">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={monthlyGoal}
                  onChange={(e) => setMonthlyGoal(e.target.value.replace(/[^0-9.]/g, ''))}
                  placeholder="100000"
                  disabled={loading}
                  className="w-full pl-7 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg text-base font-semibold text-slate-900 placeholder:text-slate-300 tabular-nums focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 disabled:opacity-60"
                />
              </div>
              <button
                onClick={handleSave}
                disabled={!dirty || saving || loading}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow-md hover:shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-sm"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : savedAt && !dirty ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving…' : savedAt && !dirty ? 'Saved' : 'Save'}
              </button>
            </div>
            <div className="mt-3 flex items-baseline gap-2 text-xs text-slate-500">
              <span>Preview:</span>
              <span className="text-sm font-semibold text-slate-900 tabular-nums">{formattedPreview}</span>
              <span>per month</span>
            </div>
          </div>
        </motion.div>

        <div className="text-[11px] text-slate-400 text-center">
          More goal types (quarterly, per‑owner, per‑product) coming soon.
        </div>
      </div>
    </div>
  );
}
