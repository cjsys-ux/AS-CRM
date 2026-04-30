import { motion, useMotionValue, useTransform, animate, AnimatePresence } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { Trophy, TrendingUp, Sparkles, Target, DollarSign } from 'lucide-react';

export type TimeRange = 'all' | '7d' | '30d' | 'this-month' | 'last-quarter';

export const TIME_RANGE_OPTIONS: { value: TimeRange; label: string; short: string }[] = [
  { value: 'all', label: 'All time', short: 'All' },
  { value: '7d', label: 'Last 7 days', short: '7d' },
  { value: '30d', label: 'Last 30 days', short: '30d' },
  { value: 'this-month', label: 'This month', short: 'Month' },
  { value: 'last-quarter', label: 'Last quarter', short: 'Quarter' },
];

interface SalesLead {
  id: string;
  amount: number;
  stage: string;
  createdAt: string;
  orderLinkedAt?: string | null;
}

interface RevenueHeaderProps {
  rangeLeads: SalesLead[];
  monthLeads: SalesLead[];
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
  monthlyGoal: number;
  goalLoaded: boolean;
}

function AnimatedCurrency({ value, className = '' }: { value: number; className?: string }) {
  const motionVal = useMotionValue(0);
  const rounded = useTransform(motionVal, (latest) => Math.round(latest));
  const [display, setDisplay] = useState('$0');

  useEffect(() => {
    const controls = animate(motionVal, value, {
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1],
    });
    const unsub = rounded.on('change', (v) => {
      setDisplay(`$${(v as number).toLocaleString('en-US')}`);
    });
    return () => {
      controls.stop();
      unsub();
    };
  }, [value, motionVal, rounded]);

  return <span className={`tabular-nums ${className}`}>{display}</span>;
}

function AnimatedNumber({ value, className = '' }: { value: number; className?: string }) {
  const motionVal = useMotionValue(0);
  const rounded = useTransform(motionVal, (latest) => Math.round(latest));
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    const controls = animate(motionVal, value, {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    });
    const unsub = rounded.on('change', (v) => {
      setDisplay((v as number).toLocaleString('en-US'));
    });
    return () => {
      controls.stop();
      unsub();
    };
  }, [value, motionVal, rounded]);

  return <span className={`tabular-nums ${className}`}>{display}</span>;
}

function GoalProgressRing({
  monthRevenue,
  goal,
  loaded,
}: {
  monthRevenue: number;
  goal: number;
  loaded: boolean;
}) {
  const pct = goal > 0 ? Math.min(monthRevenue / goal, 1) : 0;
  const overflowPct = goal > 0 && monthRevenue > goal ? Math.min(monthRevenue / goal - 1, 1) : 0;
  const size = 88;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  const progress = useMotionValue(0);
  const dashOffset = useTransform(progress, (p) => circumference * (1 - p));

  useEffect(() => {
    const controls = animate(progress, pct, { duration: 1.0, ease: [0.22, 1, 0.36, 1] });
    return () => controls.stop();
  }, [pct, progress]);

  const reached = pct >= 1;

  if (!loaded || goal <= 0) {
    return (
      <div className="flex items-center gap-3">
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="-rotate-90">
            <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(148,163,184,0.18)" strokeWidth={stroke} />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <Target className="w-5 h-5 text-slate-300" />
          </div>
        </div>
        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Monthly goal</p>
          <p className="text-xs text-slate-500 mt-0.5">Set in Settings → Company Goals</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <defs>
            <linearGradient id="goalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={reached ? '#10b981' : '#6366f1'} />
              <stop offset="100%" stopColor={reached ? '#34d399' : '#a855f7'} />
            </linearGradient>
          </defs>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(148,163,184,0.18)" strokeWidth={stroke} />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#goalGradient)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            style={{ strokeDashoffset: dashOffset }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {reached ? (
              <motion.div
                key="reached"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 360, damping: 22 }}
              >
                <Trophy className="w-6 h-6 text-emerald-500" />
              </motion.div>
            ) : (
              <motion.span
                key="pct"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-base font-bold text-slate-900 tabular-nums"
              >
                {Math.round(pct * 100)}%
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
          {reached ? (
            <span className="inline-flex items-center gap-1 text-emerald-600">
              <Sparkles className="w-3 h-3" /> Goal hit
            </span>
          ) : (
            'Monthly goal'
          )}
        </p>
        <p className="text-sm font-bold text-slate-900 tabular-nums leading-tight mt-0.5">
          <AnimatedCurrency value={monthRevenue} /> <span className="text-slate-400 font-semibold">of ${goal.toLocaleString()}</span>
        </p>
        {reached && overflowPct > 0 && (
          <p className="text-[11px] font-semibold text-emerald-600 mt-0.5">
            +{Math.round((monthRevenue - goal) / 1000).toLocaleString()}k over target
          </p>
        )}
      </div>
    </div>
  );
}

export function SalesRevenueHeader({
  rangeLeads,
  monthLeads,
  timeRange,
  onTimeRangeChange,
  monthlyGoal,
  goalLoaded,
}: RevenueHeaderProps) {
  const stats = useMemo(() => {
    const wonInRange = rangeLeads.filter((l) => l.stage === 'closed-won');
    const wonRevenue = wonInRange.reduce((s, l) => s + (l.amount || 0), 0);
    const wonCount = wonInRange.length;
    const avgDeal = wonCount > 0 ? wonRevenue / wonCount : 0;
    const activeInRange = rangeLeads.filter((l) => l.stage !== 'closed-won' && l.stage !== 'closed-lost');
    const activePipeline = activeInRange.reduce((s, l) => s + (l.amount || 0), 0);
    const monthRevenue = monthLeads
      .filter((l) => l.stage === 'closed-won')
      .reduce((s, l) => s + (l.amount || 0), 0);
    return { wonRevenue, wonCount, avgDeal, activePipeline, activeCount: activeInRange.length, monthRevenue };
  }, [rangeLeads, monthLeads]);

  const activeRangeLabel = TIME_RANGE_OPTIONS.find((o) => o.value === timeRange)?.label ?? 'All time';

  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-4 bg-white border-b border-slate-200">
      <div className="max-w-[2200px] mx-auto">
        {/* Filter chips */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1 shrink-0">Range</span>
          {TIME_RANGE_OPTIONS.map((opt) => {
            const active = opt.value === timeRange;
            return (
              <button
                key={opt.value}
                onClick={() => onTimeRangeChange(opt.value)}
                className={`relative px-3 py-1.5 text-[12px] font-semibold rounded-full transition-colors shrink-0 ${
                  active
                    ? 'text-white'
                    : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="time-range-pill"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 shadow-sm shadow-indigo-500/30"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative z-10 hidden sm:inline">{opt.label}</span>
                <span className="relative z-10 sm:hidden">{opt.short}</span>
              </button>
            );
          })}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {/* Hero: revenue in range */}
          <motion.div
            layout
            className="md:col-span-2 xl:col-span-2 relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-5 shadow-lg shadow-indigo-500/20"
          >
            <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute right-12 bottom-0 w-32 h-32 rounded-full bg-fuchsia-300/20 blur-2xl" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white/15 backdrop-blur flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-white/70 uppercase tracking-wider">Closed‑won revenue</p>
                    <p className="text-[10px] text-white/60">{activeRangeLabel}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/15 backdrop-blur">
                  <TrendingUp className="w-3 h-3 text-white" />
                  <span className="text-[10px] font-bold text-white tabular-nums">
                    {stats.wonCount} {stats.wonCount === 1 ? 'deal' : 'deals'}
                  </span>
                </div>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${timeRange}-${stats.wonRevenue}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  className="text-3xl sm:text-4xl font-black text-white leading-none drop-shadow-sm"
                >
                  <AnimatedCurrency value={stats.wonRevenue} />
                </motion.div>
              </AnimatePresence>
              <div className="mt-3 flex items-center gap-3 text-[11px] text-white/80">
                <span>
                  Avg deal{' '}
                  <strong className="font-bold text-white tabular-nums">
                    ${Math.round(stats.avgDeal).toLocaleString()}
                  </strong>
                </span>
                <span className="text-white/40">·</span>
                <span>
                  Pipeline{' '}
                  <strong className="font-bold text-white tabular-nums">
                    ${stats.activePipeline.toLocaleString()}
                  </strong>
                </span>
              </div>
            </div>
          </motion.div>

          {/* Goal ring */}
          <motion.div
            layout
            className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <GoalProgressRing
              monthRevenue={stats.monthRevenue}
              goal={monthlyGoal}
              loaded={goalLoaded}
            />
          </motion.div>

          {/* Active pipeline */}
          <motion.div
            layout
            className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active pipeline</p>
                <p className="text-2xl font-black text-slate-900 mt-1 leading-none">
                  <AnimatedCurrency value={stats.activePipeline} />
                </p>
                <p className="text-[11px] text-slate-500 mt-1.5 tabular-nums">
                  <AnimatedNumber value={stats.activeCount} className="font-bold text-slate-700" /> open {stats.activeCount === 1 ? 'deal' : 'deals'}
                </p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
