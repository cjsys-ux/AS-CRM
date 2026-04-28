import { motion, useReducedMotion, useScroll, useTransform, useMotionValue, animate, useInView, useSpring, AnimatePresence } from 'motion/react';
import { useState, useRef, useEffect } from 'react';
import { ResponsiveContainer, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, Line, AreaChart, Area, ReferenceLine } from 'recharts';
import { ArrowUpRight, Calendar, Sparkles, ChevronDown } from 'lucide-react';
import {
  healthIndicators,
  revPacingData,
  concentrationData,
  cashSparkline,
  revSparkline,
  actionItems,
  keyDates,
  scorecardItems,
  topMetrics,
} from './dashboardData';

/* ----------------------------- helpers / hooks ------------------------------ */

const easeOutExpo: [number, number, number, number] = [0.16, 1, 0.3, 1];
const springSoft = { type: 'spring' as const, stiffness: 200, damping: 22, mass: 0.9 };
const springSnappy = { type: 'spring' as const, stiffness: 320, damping: 26 };

function CountUp({
  to,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
}: { to: number; prefix?: string; suffix?: string; decimals?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const value = useMotionValue(0);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      if (ref.current) ref.current.textContent = `${prefix}${to.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`;
      return;
    }
    const controls = animate(value, to, {
      duration: 1.4,
      ease: easeOutExpo,
      onUpdate: (v) => {
        if (ref.current) {
          ref.current.textContent = `${prefix}${v.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`;
        }
      },
    });
    return () => controls.stop();
  }, [inView, to, prefix, suffix, decimals, value, reduce]);

  return <span ref={ref} className={className}>{`${prefix}0${suffix}`}</span>;
}

function useTilt() {
  const reduce = useReducedMotion();
  const rx = useSpring(0, springSnappy);
  const ry = useSpring(0, springSnappy);
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduce) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rx.set(-py * 4);
    ry.set(px * 5);
  };
  const onLeave = () => { rx.set(0); ry.set(0); };
  return { rx, ry, onMove, onLeave };
}

const statusInk: Record<string, string> = {
  green: 'var(--good)',
  yellow: 'var(--warn)',
  orange: 'var(--bad)',
  red: 'var(--bad)',
};

/* ------------------------------- decorations -------------------------------- */

function Blob({
  className = '',
  fill = 'var(--coral-soft)',
  parallax = 0,
  scrollY,
}: {
  className?: string;
  fill?: string;
  parallax?: number;
  scrollY: ReturnType<typeof useScroll>['scrollY'];
}) {
  const y = useTransform(scrollY, [0, 1500], [0, parallax]);
  return (
    <motion.svg
      style={{ y }}
      className={`absolute pointer-events-none ${className}`}
      viewBox="0 0 200 200"
      preserveAspectRatio="none"
      aria-hidden
    >
      <motion.path
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.6, ease: easeOutExpo }}
        d="M40,90 C50,30 140,20 170,70 C195,115 165,180 110,175 C55,170 25,150 40,90 Z"
        fill={fill}
        stroke="none"
      />
    </motion.svg>
  );
}

/* ------------------------------------ view ---------------------------------- */

export function ExecutiveOverviewKinetic() {
  const [revToggle, setRevToggle] = useState<'Total' | 'Promo' | 'PPE'>('Total');
  const [openItem, setOpenItem] = useState<number | null>(null);
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();

  return (
    <div className="dashboard-kinetic min-h-full relative overflow-hidden">
      {/* Ambient drifters (purely decorative, parallax) */}
      <Blob className="-top-20 -right-32 w-[420px] h-[420px]" fill="var(--coral-soft)" parallax={reduce ? 0 : -120} scrollY={scrollY} />
      <Blob className="top-[700px] -left-32 w-[360px] h-[360px]" fill="var(--olive-soft)" parallax={reduce ? 0 : -200} scrollY={scrollY} />
      <Blob className="top-[1500px] -right-24 w-[300px] h-[300px]" fill="var(--coral-soft)" parallax={reduce ? 0 : -260} scrollY={scrollY} />

      <div className="relative max-w-[1280px] mx-auto px-6 sm:px-10 pt-10 pb-24">

        {/* ───────────── HERO ───────────── */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: easeOutExpo }}
          className="mb-12"
        >
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <p className="kn-label mb-3" style={{ color: 'var(--coral)' }}>
                <Sparkles className="inline w-3.5 h-3.5 mr-1.5 -mt-0.5" />
                Mar 31 · Q2 in flight
              </p>
              <h1 className="kn-display text-[clamp(40px,5vw,72px)] mb-3 max-w-[18ch]">
                Good morning, Patrick.
              </h1>
              <p className="text-[16px] leading-[1.55] max-w-[52ch]" style={{ color: 'var(--ink-soft)' }}>
                Revenue is pacing <span className="kn-num" style={{ color: 'var(--good)' }}>+41%</span> against last March, cash is healthy, and there are <span style={{ color: 'var(--bad)', fontWeight: 600 }}>3 urgent items</span> waiting on you.
              </p>
            </div>

            {/* Pulse strip */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ ...springSoft, delay: 0.1 }}
              className="kn-card px-5 py-4 grid grid-cols-5 gap-5"
            >
              {healthIndicators.map((h, i) => (
                <motion.div
                  key={h.label}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: easeOutExpo, delay: 0.3 + i * 0.07 }}
                  className="flex flex-col items-center gap-2"
                  title={`${h.title} — ${h.detail}`}
                >
                  <span className="kn-pulse-dot" style={{ background: statusInk[h.status], color: statusInk[h.status] }} />
                  <p className="kn-label leading-tight text-center text-[10px]">{h.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* ───────────── KPI CARDS ───────────── */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <KpiCard delay={0} label="Cash on hand" accent="var(--good)" scrollY={scrollY}>
            <p className="kn-display kn-num text-[40px] mb-2"><CountUp to={topMetrics.cash.value} prefix="$" /></p>
            <p className="text-[13px] flex items-center gap-1.5 mb-3" style={{ color: 'var(--good)' }}>
              <ArrowUpRight className="w-3.5 h-3.5" /> +$18K this week
            </p>
            <div className="h-12 -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cashSparkline}>
                  <defs>
                    <linearGradient id="kn-cash" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--good)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="var(--good)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="v" stroke="var(--good)" strokeWidth={2} fill="url(#kn-cash)" dot={false} isAnimationActive={!reduce} animationDuration={1300} animationEasing="ease-out" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[11px] mt-1" style={{ color: 'var(--ink-mute)' }}>
              AR <span className="kn-num">$487K</span> · AP <span className="kn-num">$216K</span> · NWC <span className="kn-num">$497K</span>
            </p>
          </KpiCard>

          <KpiCard delay={0.08} label="Revenue, MTD" accent="var(--coral)" scrollY={scrollY}>
            <p className="kn-display kn-num text-[40px] mb-2">
              <CountUp to={topMetrics.revenue.mtd / 1000} prefix="$" suffix="K" />
            </p>
            <p className="text-[13px] mb-3" style={{ color: 'var(--good)' }}>+41% vs Mar '25</p>
            <div className="flex h-2 rounded-full overflow-hidden mb-1.5" style={{ background: 'oklch(0.92 0.012 60)' }}>
              <motion.div initial={{ width: 0 }} whileInView={{ width: '77%' }} viewport={{ once: true }} transition={{ duration: 1.2, ease: easeOutExpo, delay: 0.3 }} style={{ background: 'var(--coral)' }} />
              <motion.div initial={{ width: 0 }} whileInView={{ width: '23%' }} viewport={{ once: true }} transition={{ duration: 1.2, ease: easeOutExpo, delay: 0.5 }} style={{ background: 'var(--olive)' }} />
            </div>
            <p className="text-[11px] kn-num" style={{ color: 'var(--ink-mute)' }}>PPE $448K · Promo $135K</p>
            <p className="text-[11px] mt-2" style={{ color: 'var(--ink-soft)' }}>YTD <span className="kn-num">$1.82M</span> (87% of target)</p>
          </KpiCard>

          <KpiCard delay={0.16} label="Orders in flight" accent="var(--aubergine)" scrollY={scrollY}>
            <p className="kn-display kn-num text-[40px] mb-2"><CountUp to={topMetrics.orders.active} /></p>
            <ul className="space-y-1.5 text-[13px]">
              <Bullet color="var(--good)" left="In production" right={`${topMetrics.orders.production}`} />
              <Bullet color="var(--olive)" left="In transit" right={`${topMetrics.orders.transit}`} />
              <Bullet color="var(--ink-mute)" left="Ready to ship" right={`${topMetrics.orders.ready}`} />
              <Bullet color="var(--bad)" left="Behind schedule" right={`${topMetrics.orders.behind}`} bold />
            </ul>
          </KpiCard>

          <KpiCard delay={0.24} label="Open issues" accent="var(--bad)" scrollY={scrollY}>
            <p className="kn-display kn-num text-[40px] mb-2"><CountUp to={topMetrics.issues.open} /></p>
            <ul className="space-y-1.5 text-[13px]">
              <Bullet color="var(--bad)" left="Urgent" right={`${topMetrics.issues.urgent}`} bold />
              <Bullet color="var(--coral)" left="Amazon-related" right={`${topMetrics.issues.amazonRelated}`} />
              <Bullet color="var(--warn)" left="SLA compliance" right={`${topMetrics.issues.slaPct}%`} />
              <Bullet color="var(--ink-mute)" left="Avg resolution" right={`${topMetrics.issues.avgResDays}d`} />
            </ul>
          </KpiCard>
        </section>

        {/* ───────────── REVENUE + CONCENTRATION ───────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-8% 0px' }}
            transition={springSoft}
            className="kn-card lg:col-span-8 p-7 relative overflow-hidden"
          >
            <Blob className="-bottom-24 -right-16 w-72 h-72 opacity-50" fill="var(--coral-soft)" parallax={-40} scrollY={scrollY} />
            <div className="flex items-end justify-between mb-5 relative">
              <div>
                <p className="kn-label mb-1.5">2026 vs 2025 · monthly pacing</p>
                <h3 className="kn-display text-[22px]">Revenue keeps climbing.</h3>
              </div>
              <div className="flex gap-1 p-1 rounded-full" style={{ background: 'var(--cream-deep)' }}>
                {(['Total', 'Promo', 'PPE'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setRevToggle(t)}
                    className="kn-num text-[10px] px-3 py-1 rounded-full transition-colors"
                    style={{
                      background: revToggle === t ? 'var(--ink)' : 'transparent',
                      color: revToggle === t ? 'var(--cream)' : 'var(--ink-soft)',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-[300px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={revPacingData} barGap={3} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
                  <CartesianGrid strokeDasharray="3 6" stroke="oklch(0.86 0.012 60)" vertical={false} />
                  <XAxis dataKey="month" stroke="var(--ink-mute)" tick={{ fontSize: 11, fontFamily: 'Geist Mono' }} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--ink-mute)" tick={{ fontSize: 11, fontFamily: 'Geist Mono' }} tickLine={false} axisLine={false} tickFormatter={(v: number) => `$${v}K`} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--cream)',
                      border: '1px solid oklch(0.86 0.012 60)',
                      borderRadius: 12,
                      fontFamily: 'Geist Mono',
                      fontSize: 11,
                    }}
                    cursor={{ fill: 'oklch(0.22 0.05 320 / 0.04)' }}
                    formatter={(v: number | null) => (v ? [`$${v}K`, ''] : ['—', ''])}
                  />
                  <Bar dataKey="2025" fill="var(--olive-soft)" radius={[6, 6, 0, 0]} barSize={14} name="2025 Actual" isAnimationActive={!reduce} animationDuration={1100} animationEasing="ease-out" />
                  <Bar dataKey="current" fill="var(--coral)" radius={[6, 6, 0, 0]} barSize={14} name="2026 Actual" isAnimationActive={!reduce} animationDuration={1100} animationEasing="ease-out" />
                  <Line type="monotone" dataKey="target" stroke="var(--aubergine)" strokeWidth={2} strokeDasharray="6 6" dot={false} name="2026 Target" isAnimationActive={!reduce} animationDuration={1500} animationEasing="ease-out" />
                  <ReferenceLine x="Mar" stroke="var(--coral)" strokeDasharray="3 3" strokeOpacity={0.35} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-5 mt-3 text-[10px] kn-num" style={{ color: 'var(--ink-mute)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              <Legend swatch="var(--olive-soft)">2025</Legend>
              <Legend swatch="var(--coral)">2026</Legend>
              <Legend dashed>Target</Legend>
              <span className="ml-auto">YTD <span style={{ color: 'var(--ink)', fontWeight: 600 }}>$1.82M</span> · Growth <span style={{ color: 'var(--good)', fontWeight: 600 }}>+36%</span></span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-8% 0px' }}
            transition={{ ...springSoft, delay: 0.08 }}
            className="kn-card lg:col-span-4 p-7 relative overflow-hidden"
          >
            <p className="kn-label mb-1.5">Concentration</p>
            <h3 className="kn-display text-[22px] mb-1">
              <span className="kn-num">77%</span> from one channel.
            </h3>
            <p className="text-[12px] mb-4" style={{ color: 'var(--ink-soft)' }}>Promo must grow $1.87M → $5M+ to hit a 50/50 balance.</p>
            <div className="h-[200px] -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={concentrationData}>
                  <CartesianGrid strokeDasharray="3 6" stroke="oklch(0.86 0.012 60)" vertical={false} />
                  <XAxis dataKey="month" stroke="var(--ink-mute)" tick={{ fontSize: 9, fontFamily: 'Geist Mono' }} tickLine={false} axisLine={false} />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip contentStyle={{ background: 'var(--cream)', border: '1px solid oklch(0.86 0.012 60)', borderRadius: 12, fontFamily: 'Geist Mono', fontSize: 11 }} formatter={(v: number) => [`${v}%`, '']} />
                  <Area type="monotone" dataKey="ppe" stackId="1" stroke="var(--coral)" fill="var(--coral)" fillOpacity={0.35} isAnimationActive={!reduce} animationDuration={1400} />
                  <Area type="monotone" dataKey="promo" stackId="1" stroke="var(--olive)" fill="var(--olive)" fillOpacity={0.35} isAnimationActive={!reduce} animationDuration={1400} />
                  <ReferenceLine y={50} stroke="var(--bad)" strokeDasharray="4 4" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-between mt-3 text-[10px] kn-num" style={{ color: 'var(--ink-mute)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              <Legend swatch="var(--coral)">Amazon / IPF</Legend>
              <Legend swatch="var(--olive)">Promo</Legend>
            </div>
          </motion.div>
        </section>

        {/* ───────────── DOMAIN PILL CARDS ───────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-12">
          <DomainCard
            title="Finance"
            accent="var(--aubergine)"
            stats={[
              { dot: 'var(--good)', label: 'Cash', value: '$142,350' },
              { dot: 'var(--good)', label: '30-day forecast', value: '+$94,750' },
              { dot: 'var(--ink-mute)', label: 'Equipment debt', value: '$179K · 25% paid' },
              { dot: 'var(--warn)', label: 'DSO', value: '52d (target 45)' },
            ]}
            notes={[
              { kind: 'info', text: 'IPF $210K expected April 15.' },
              { kind: 'warn', text: '3 promo invoices over 60 days ($22K).' },
            ]}
            footer={['Revenue $583K', 'GP 24.2%', 'Net 11.7%']}
            delay={0}
          />
          <DomainCard
            title="Sales"
            accent="var(--coral)"
            stats={[
              { dot: 'var(--good)', label: 'Won MTD', value: '$318K · 12 deals' },
              { dot: 'var(--good)', label: 'Pipeline', value: '$847K · 34 deals' },
              { dot: 'var(--warn)', label: 'Win rate', value: '42% (target 50%)' },
              { dot: 'var(--warn)', label: 'New clients', value: '2 of 4' },
            ]}
            notes={[
              { kind: 'warn', text: '5 deals stalled 7+ days ($54K).' },
              { kind: 'info', text: '$615K sitting in Design Ready.' },
              { kind: 'critical', text: 'One Percent Media: 1 lead, $2K spend.' },
            ]}
            footer={['Tina: 3 closed', 'Melody: 6 leads']}
            delay={0.08}
          />
          <DomainCard
            title="Operations"
            accent="var(--olive)"
            stats={[
              { dot: 'var(--good)', label: 'In production', value: '18 orders' },
              { dot: 'var(--good)', label: 'In transit', value: '11 · $284K' },
              { dot: 'var(--warn)', label: 'On-time', value: '91% (target 95%)' },
              { dot: 'var(--warn)', label: 'Warehouse', value: '68% capacity' },
            ]}
            notes={[
              { kind: 'critical', text: '3 orders behind schedule.' },
              { kind: 'info', text: 'PO#4510 awaiting Amazon DC schedule.' },
              { kind: 'warn', text: 'SC Promo on-time at 75%.' },
            ]}
            footer={['Next 7d: 2 deploys', 'Next 30d: 4 deploys']}
            delay={0.16}
          />
        </section>

        {/* ───────────── ACTION ITEMS + UPCOMING ───────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-5% 0px' }}
            transition={springSoft}
            className="kn-card lg:col-span-3 p-7 relative overflow-hidden"
          >
            <Blob className="-top-20 -left-16 w-64 h-64 opacity-40" fill="var(--coral-soft)" parallax={-50} scrollY={scrollY} />
            <p className="kn-label mb-1.5" style={{ color: 'var(--bad)' }}>Requires your attention</p>
            <h3 className="kn-display text-[24px] mb-1">{actionItems.length} items waiting on you.</h3>
            <p className="text-[12px] mb-5" style={{ color: 'var(--ink-soft)' }}>
              <span style={{ color: 'var(--bad)', fontWeight: 600 }}>1 critical</span> · <span style={{ color: 'var(--warn)', fontWeight: 600 }}>3 high</span> · <span style={{ color: 'var(--coral)', fontWeight: 600 }}>2 normal</span>
            </p>
            <div className="space-y-3 relative">
              {actionItems.map((item, idx) => (
                <ActionItem
                  key={idx}
                  item={item}
                  isOpen={openItem === idx}
                  onToggle={() => setOpenItem(openItem === idx ? null : idx)}
                  delay={idx * 0.05}
                />
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-5% 0px' }}
            transition={{ ...springSoft, delay: 0.08 }}
            className="kn-card lg:col-span-2 p-7"
          >
            <div className="flex items-baseline justify-between mb-5">
              <h3 className="kn-display text-[24px]">Upcoming</h3>
              <p className="kn-label">Next 30 days</p>
            </div>
            <div className="space-y-6 max-h-[520px] overflow-y-auto pr-2 -mr-2">
              {keyDates.map((group, gi) => (
                <motion.div
                  key={group.group}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, ease: easeOutExpo, delay: gi * 0.06 }}
                >
                  <p className="kn-label mb-2.5 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" style={{ color: 'var(--coral)' }} />{group.group}</p>
                  <ul className="space-y-2 pl-1">
                    {group.items.map((item, i) => {
                      const tint =
                        item.kind === 'good' ? 'var(--good)' :
                        item.kind === 'warn' ? 'var(--warn)' :
                        item.kind === 'critical' ? 'var(--bad)' :
                        item.kind === 'info' ? 'var(--coral)' :
                        'var(--ink-soft)';
                      return (
                        <li key={i} className="flex items-baseline gap-2.5 text-[12px]">
                          <span className="kn-num font-semibold w-12 shrink-0" style={{ color: 'var(--ink)' }}>{item.date}</span>
                          <span className="flex-1 leading-snug" style={{ color: tint }}>{item.text}</span>
                          {item.value && <span className="kn-num font-semibold shrink-0" style={{ color: 'var(--ink)' }}>{item.value}</span>}
                        </li>
                      );
                    })}
                  </ul>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ───────────── SCORECARD ───────────── */}
        <motion.section
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-5% 0px' }}
          transition={springSoft}
          className="kn-card p-7"
        >
          <div className="flex items-baseline justify-between mb-6">
            <h3 className="kn-display text-[24px]">Goals</h3>
            <p className="kn-label">Q2 scorecard</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
            {scorecardItems.map((s, i) => {
              const ink = s.status === 'green' ? 'var(--good)' : s.status === 'yellow' ? 'var(--warn)' : 'var(--bad)';
              return (
                <motion.div
                  key={s.goal}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ ...springSoft, delay: i * 0.05 }}
                >
                  <p className="kn-label mb-2 text-[10px]">{s.goal}</p>
                  <p className="kn-display kn-num text-[26px] mb-1" style={{ color: ink }}>{s.actual}</p>
                  <p className="text-[10px] mb-2 kn-num" style={{ color: 'var(--ink-mute)' }}>Target {s.target}</p>
                  {s.goal !== 'Concentration' ? (
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'oklch(0.92 0.012 60)' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${Math.min(s.pct, 100)}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, ease: easeOutExpo, delay: i * 0.05 + 0.15 }}
                        className="h-full rounded-full"
                        style={{ background: ink }}
                      />
                    </div>
                  ) : (
                    <p className="text-[10px] font-semibold" style={{ color: 'var(--bad)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Above target</p>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.section>
      </div>
    </div>
  );
}

/* -------------------------------- subviews ---------------------------------- */

function KpiCard({
  children,
  label,
  accent,
  delay,
  scrollY,
}: {
  children: React.ReactNode;
  label: string;
  accent: string;
  delay: number;
  scrollY: ReturnType<typeof useScroll>['scrollY'];
}) {
  const tilt = useTilt();
  const blobY = useTransform(scrollY, [0, 800], [0, -40]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-8% 0px' }}
      transition={{ ...springSoft, delay }}
      onMouseMove={tilt.onMove}
      onMouseLeave={tilt.onLeave}
      style={{ rotateX: tilt.rx, rotateY: tilt.ry, transformPerspective: 800 }}
      className="kn-card p-6 relative overflow-hidden"
    >
      <motion.div
        style={{ y: blobY }}
        className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
        aria-hidden
      >
        <div
          className="w-full h-full rounded-full"
          style={{ background: accent, filter: 'blur(36px)', opacity: 0.18 }}
        />
      </motion.div>
      <p className="kn-label mb-3 relative">{label}</p>
      <div className="relative">{children}</div>
    </motion.div>
  );
}

function Bullet({ color, left, right, bold = false }: { color: string; left: string; right: string; bold?: boolean }) {
  return (
    <li className="flex items-center justify-between" style={{ color: 'var(--ink-soft)', fontWeight: bold ? 600 : 400 }}>
      <span className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
        {left}
      </span>
      <span className="kn-num" style={{ color: bold ? color : 'var(--ink)' }}>{right}</span>
    </li>
  );
}

function Legend({ swatch, dashed, children }: { swatch?: string; dashed?: boolean; children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1.5">
      {dashed ? (
        <span className="inline-block w-4 border-t border-dashed" style={{ borderColor: 'var(--aubergine)' }} />
      ) : (
        <span className="inline-block w-3 h-1.5 rounded-sm" style={{ background: swatch }} />
      )}
      {children}
    </span>
  );
}

function DomainCard({
  title,
  accent,
  stats,
  notes,
  footer,
  delay,
}: {
  title: string;
  accent: string;
  stats: Array<{ dot: string; label: string; value: string }>;
  notes: Array<{ kind: 'info' | 'warn' | 'critical'; text: string }>;
  footer: string[];
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-5% 0px' }}
      transition={{ ...springSoft, delay }}
      className="kn-card p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="w-2 h-2 rounded-full" style={{ background: accent }} />
        <h3 className="kn-display text-[20px]">{title}</h3>
      </div>
      <ul className="space-y-2 mb-4">
        {stats.map((s) => (
          <li key={s.label} className="flex items-center justify-between text-[12px]" style={{ color: 'var(--ink-soft)' }}>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
              {s.label}
            </span>
            <span className="kn-num" style={{ color: 'var(--ink)' }}>{s.value}</span>
          </li>
        ))}
      </ul>
      <div className="space-y-2 mb-4">
        {notes.map((n, i) => {
          const noteInk = n.kind === 'info' ? 'var(--coral)' : n.kind === 'warn' ? 'var(--warn)' : 'var(--bad)';
          const noteBg =
            n.kind === 'info' ? 'oklch(0.68 0.16 25 / 0.08)' :
            n.kind === 'warn' ? 'oklch(0.7 0.13 70 / 0.1)' :
            'oklch(0.6 0.18 22 / 0.08)';
          return (
            <div key={i} className="rounded-xl px-3 py-2 text-[11px] leading-snug" style={{ background: noteBg, color: noteInk }}>
              {n.text}
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 pt-3 border-t" style={{ borderColor: 'oklch(0.86 0.012 60)' }}>
        {footer.map((f) => (
          <span key={f} className="kn-num text-[10px]" style={{ color: 'var(--ink-mute)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{f}</span>
        ))}
      </div>
    </motion.div>
  );
}

function ActionItem({
  item,
  isOpen,
  onToggle,
  delay,
}: {
  item: typeof actionItems[number];
  isOpen: boolean;
  onToggle: () => void;
  delay: number;
}) {
  const tilt = useTilt();
  const tagInk = item.priority === 'critical' ? 'var(--bad)' : item.priority === 'high' ? 'var(--warn)' : 'var(--coral)';
  const tagBg =
    item.priority === 'critical' ? 'oklch(0.6 0.18 22 / 0.1)' :
    item.priority === 'high' ? 'oklch(0.7 0.13 70 / 0.12)' :
    'oklch(0.68 0.16 25 / 0.1)';

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, ease: easeOutExpo, delay }}
      onMouseMove={tilt.onMove}
      onMouseLeave={tilt.onLeave}
      style={{ rotateX: tilt.rx, rotateY: tilt.ry, transformPerspective: 1000 }}
      className="rounded-2xl px-4 py-3.5 cursor-pointer relative"
      onClick={onToggle}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="absolute inset-0 rounded-2xl" style={{ background: 'oklch(1 0 0 / 0.5)', boxShadow: 'inset 0 0 0 1px oklch(0.86 0.012 60)' }} />
      <div className="relative">
        <div className="flex items-center gap-3">
          <span
            className="kn-num text-[10px] px-2 py-0.5 rounded-full shrink-0"
            style={{ background: tagBg, color: tagInk, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}
          >
            {item.priority}
          </span>
          <p className="text-[13px] flex-1 leading-snug" style={{ color: 'var(--ink)', fontWeight: 500 }}>{item.title}</p>
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3, ease: easeOutExpo }}>
            <ChevronDown className="w-4 h-4" style={{ color: 'var(--ink-mute)' }} />
          </motion.div>
        </div>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="body"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: easeOutExpo }}
              className="overflow-hidden"
            >
              <p className="text-[12.5px] leading-[1.55] pt-3 pb-3" style={{ color: 'var(--ink-soft)' }}>{item.detail}</p>
              <div className="flex flex-wrap gap-2">
                {item.actions.map((a) => (
                  <button
                    key={a}
                    onClick={(e) => e.stopPropagation()}
                    className="text-[11px] px-3.5 py-1.5 rounded-full"
                    style={{ background: 'var(--ink)', color: 'var(--cream)', fontWeight: 500 }}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
