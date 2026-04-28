import { motion, useReducedMotion, useScroll, useTransform, useMotionValue, animate, useInView } from 'motion/react';
import { useState, useRef, useEffect } from 'react';
import { ResponsiveContainer, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, Line, AreaChart, Area, ReferenceLine } from 'recharts';
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

/* --------------------------- shared little helpers ---------------------------- */

const easeOutExpo: [number, number, number, number] = [0.16, 1, 0.3, 1];

function CountUp({
  to,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 1.4,
  className = '',
}: { to: number; prefix?: string; suffix?: string; decimals?: number; duration?: number; className?: string }) {
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
      duration,
      ease: easeOutExpo,
      onUpdate: (v) => {
        if (ref.current) {
          ref.current.textContent = `${prefix}${v.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`;
        }
      },
    });
    return () => controls.stop();
  }, [inView, to, prefix, suffix, decimals, duration, value, reduce]);

  return <span ref={ref} className={className}>{`${prefix}0${suffix}`}</span>;
}

const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-8% 0px' },
  transition: { duration: 0.85, ease: easeOutExpo, delay },
});

const statusInk: Record<string, string> = {
  green: 'var(--good)',
  yellow: 'var(--warn)',
  orange: 'var(--bad)',
  red: 'var(--bad)',
};

const priorityLabel: Record<string, string> = {
  critical: 'CRITICAL',
  high: 'HIGH',
  normal: 'NORMAL',
};

/* ------------------------------------ view ------------------------------------ */

export function ExecutiveOverviewEditorial() {
  const [revToggle, setRevToggle] = useState<'Total' | 'Promo' | 'PPE'>('Total');
  const [openItem, setOpenItem] = useState<number | null>(null);
  const reduce = useReducedMotion();

  const headerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const mastheadShift = useTransform(scrollY, [0, 400], [0, reduce ? 0 : -22]);

  return (
    <div className="dashboard-editorial min-h-full">
      <div className="max-w-[1320px] mx-auto px-6 sm:px-10 pt-10 pb-24">

        {/* ─────────────── MASTHEAD ─────────────── */}
        <motion.header
          ref={headerRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: easeOutExpo }}
          className="mb-10"
        >
          <motion.div style={{ y: mastheadShift }} className="flex items-end justify-between gap-8 pb-5 border-b ed-rule" >
            <div className="flex items-baseline gap-4">
              <span className="ed-masthead-mark text-[44px] sm:text-[56px]">ActivateSwag</span>
              <span className="ed-kicker hidden sm:inline">Executive&nbsp;Overview · Q2&nbsp;2026</span>
            </div>
            <div className="text-right hidden md:block">
              <p className="ed-kicker mb-1">Issue</p>
              <p className="ed-num text-[13px]" style={{ color: 'var(--ink-soft)' }}>Vol. 11 · No. 31 · Mar 31</p>
            </div>
          </motion.div>

          {/* Health bar — typographic */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-8 gap-y-3">
            {healthIndicators.map((h, i) => (
              <motion.div
                key={h.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: easeOutExpo, delay: 0.1 + i * 0.06 }}
                className="flex items-start gap-2.5"
              >
                <span
                  className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                  style={{ background: statusInk[h.status] }}
                />
                <div className="min-w-0">
                  <p className="ed-kicker leading-tight mb-0.5">{h.label}</p>
                  <p className="text-[13px] leading-snug" style={{ fontFamily: 'var(--font-body)', color: 'var(--ink)' }}>{h.title}</p>
                  <p className="text-[11px]" style={{ color: 'var(--ink-mute)' }}>{h.detail}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.header>

        {/* ─────────────── KPI STRIP ─────────────── */}
        <motion.section {...reveal(0)} className="mb-14">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-8 border-y ed-rule py-7">
            {/* Cash */}
            <div>
              <p className="ed-kicker mb-2">Cash on hand</p>
              <p className="ed-display text-[40px] mb-2 ed-num">
                <CountUp to={topMetrics.cash.value} prefix="$" />
              </p>
              <p className="text-[12px] mb-1" style={{ color: 'var(--ink-soft)' }}>+$18K vs prior week</p>
              <div className="h-7 -ml-1">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cashSparkline}>
                    <defs>
                      <linearGradient id="ed-cash" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="oklch(0.55 0.13 150)" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="oklch(0.55 0.13 150)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="v" stroke="oklch(0.55 0.13 150)" strokeWidth={1.25} fill="url(#ed-cash)" dot={false} isAnimationActive={!reduce} animationDuration={1200} animationEasing="ease-out" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Revenue MTD */}
            <div>
              <p className="ed-kicker mb-2">Revenue, MTD</p>
              <p className="ed-display text-[40px] mb-2 ed-num">
                <CountUp to={topMetrics.revenue.mtd / 1000} prefix="$" suffix="K" />
              </p>
              <p className="text-[12px] mb-2" style={{ color: 'var(--ink-soft)' }}>
                vs Mar&nbsp;25 <span className="ed-num">$412K</span> · <span style={{ color: 'var(--good)' }}>+41%</span>
              </p>
              <div className="flex items-center gap-1 text-[10px] ed-num" style={{ color: 'var(--ink-mute)' }}>
                <div className="flex h-1 w-full rounded-full overflow-hidden" style={{ background: 'oklch(0.92 0.005 250)' }}>
                  <div style={{ width: '77%', background: 'var(--accent)' }} />
                  <div style={{ width: '23%', background: 'var(--good)' }} />
                </div>
              </div>
              <p className="text-[10px] mt-1.5 ed-num" style={{ color: 'var(--ink-mute)' }}>PPE 77% · Promo 23%</p>
            </div>

            {/* Orders */}
            <div>
              <p className="ed-kicker mb-2">Orders, in flight</p>
              <p className="ed-display text-[40px] mb-2 ed-num"><CountUp to={topMetrics.orders.active} /></p>
              <ul className="text-[12px] space-y-0.5" style={{ color: 'var(--ink-soft)' }}>
                <li className="flex justify-between"><span>In production</span><span className="ed-num">{topMetrics.orders.production}</span></li>
                <li className="flex justify-between"><span>In transit</span><span className="ed-num">{topMetrics.orders.transit}</span></li>
                <li className="flex justify-between" style={{ color: 'var(--bad)' }}><span>Behind schedule</span><span className="ed-num">{topMetrics.orders.behind}</span></li>
              </ul>
            </div>

            {/* Issues */}
            <div>
              <p className="ed-kicker mb-2">Open issues</p>
              <p className="ed-display text-[40px] mb-2 ed-num"><CountUp to={topMetrics.issues.open} /></p>
              <ul className="text-[12px] space-y-0.5" style={{ color: 'var(--ink-soft)' }}>
                <li className="flex justify-between" style={{ color: 'var(--bad)' }}><span>Urgent</span><span className="ed-num">{topMetrics.issues.urgent}</span></li>
                <li className="flex justify-between"><span>Amazon-related</span><span className="ed-num">{topMetrics.issues.amazonRelated}</span></li>
                <li className="flex justify-between"><span>SLA compliance</span><span className="ed-num">{topMetrics.issues.slaPct}%</span></li>
              </ul>
            </div>
          </div>
        </motion.section>

        {/* ─────────────── LEAD STORY ─────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-16">
          <motion.article {...reveal(0)} className="lg:col-span-8">
            <p className="ed-kicker mb-3">The lead</p>
            <h2 className="ed-display text-[clamp(34px,4.6vw,68px)] mb-4">
              March closes ahead of pace.
            </h2>
            <p className="text-[15px] leading-[1.55] mb-7 ed-dropcap" style={{ color: 'var(--ink-soft)', maxWidth: '60ch' }}>
              Revenue clears <span className="ed-num">$583K</span> for the month — the third
              consecutive period above the prior-year mark. PPE through Amazon
              continues to do most of the heavy lifting; promo holds steady but
              has not yet stepped up to absorb the planned diversification.
            </p>

            <div className="border-t ed-rule pt-6">
              <div className="flex items-end justify-between mb-3">
                <div>
                  <p className="ed-kicker mb-1">Monthly pacing</p>
                  <p className="text-[13px]" style={{ color: 'var(--ink-soft)' }}>Bars: 2026 actual vs 2025 actual. Dashed: 2026 target.</p>
                </div>
                <div className="flex gap-1.5">
                  {(['Total', 'Promo', 'PPE'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setRevToggle(t)}
                      className="ed-num text-[10px] px-2.5 py-1 transition-colors"
                      style={{
                        background: revToggle === t ? 'var(--ink)' : 'transparent',
                        color: revToggle === t ? 'var(--paper)' : 'var(--ink-soft)',
                        border: `1px solid ${revToggle === t ? 'var(--ink)' : 'var(--rule)'}`,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={revPacingData} barGap={3} margin={{ top: 8, right: 12, bottom: 0, left: -10 }}>
                    <CartesianGrid strokeDasharray="2 4" stroke="oklch(0.86 0.005 250)" vertical={false} />
                    <XAxis dataKey="month" stroke="oklch(0.55 0.012 250)" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={{ stroke: 'oklch(0.86 0.005 250)' }} />
                    <YAxis stroke="oklch(0.55 0.012 250)" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} tickFormatter={(v: number) => `$${v}K`} />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--paper)',
                        border: '1px solid var(--rule)',
                        borderRadius: 0,
                        fontFamily: 'JetBrains Mono',
                        fontSize: 11,
                        color: 'var(--ink)',
                      }}
                      cursor={{ fill: 'oklch(0.16 0.02 250 / 0.04)' }}
                      formatter={(v: number | null) => (v ? [`$${v}K`, ''] : ['—', ''])}
                    />
                    <Bar dataKey="2025" fill="oklch(0.7 0.005 250)" radius={[1, 1, 0, 0]} barSize={11} name="2025 Actual" isAnimationActive={!reduce} animationDuration={900} animationEasing="ease-out" />
                    <Bar dataKey="current" fill="var(--ink)" radius={[1, 1, 0, 0]} barSize={11} name="2026 Actual" isAnimationActive={!reduce} animationDuration={900} animationEasing="ease-out" />
                    <Line type="monotone" dataKey="target" stroke="var(--accent)" strokeWidth={1.5} strokeDasharray="5 4" dot={false} name="2026 Target" isAnimationActive={!reduce} animationDuration={1200} animationEasing="ease-out" />
                    <ReferenceLine x="Mar" stroke="var(--accent)" strokeDasharray="3 3" strokeOpacity={0.3} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center gap-6 mt-3 text-[10px] ed-num" style={{ color: 'var(--ink-mute)', letterSpacing: '0.05em' }}>
                <span className="flex items-center gap-1.5"><div className="w-3 h-1" style={{ background: 'oklch(0.7 0.005 250)' }} />2025 ACTUAL</span>
                <span className="flex items-center gap-1.5"><div className="w-3 h-1" style={{ background: 'var(--ink)' }} />2026 ACTUAL</span>
                <span className="flex items-center gap-1.5"><div className="w-5 border-t border-dashed" style={{ borderColor: 'var(--accent)' }} />2026 TARGET</span>
              </div>
            </div>
          </motion.article>

          {/* Pull-quote sidebar */}
          <motion.aside {...reveal(0.12)} className="lg:col-span-4 lg:pl-8 lg:border-l ed-rule">
            <p className="ed-kicker mb-3">By the numbers</p>

            <div className="mb-7">
              <p className="ed-pull text-[clamp(34px,3.2vw,56px)] leading-[0.95]">
                +<CountUp to={36} suffix="%" />
              </p>
              <p className="text-[13px] mt-1" style={{ color: 'var(--ink-soft)' }}>
                Year-to-date revenue growth. <span className="ed-num">$1.82M</span> against <span className="ed-num">$1.34M</span> a year ago.
              </p>
            </div>

            <div className="mb-7 pt-6 border-t ed-rule">
              <p className="ed-pull text-[clamp(34px,3.2vw,56px)] leading-[0.95]">
                <CountUp to={77} suffix="%" />
              </p>
              <p className="text-[13px] mt-1" style={{ color: 'var(--ink-soft)' }}>
                Of MTD revenue from Amazon / IPF. Goal stands at less than 50% by year-end.
              </p>
            </div>

            <div className="pt-6 border-t ed-rule">
              <p className="ed-kicker mb-3">Concentration</p>
              <div className="h-[140px] -ml-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={concentrationData}>
                    <CartesianGrid strokeDasharray="2 4" stroke="oklch(0.86 0.005 250)" vertical={false} />
                    <XAxis dataKey="month" stroke="oklch(0.55 0.012 250)" tick={{ fontSize: 9, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} />
                    <YAxis hide domain={[0, 100]} />
                    <Tooltip contentStyle={{ background: 'var(--paper)', border: '1px solid var(--rule)', borderRadius: 0, fontFamily: 'JetBrains Mono', fontSize: 11 }} formatter={(v: number) => [`${v}%`, '']} />
                    <Area type="monotone" dataKey="ppe" stackId="1" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.18} isAnimationActive={!reduce} animationDuration={1200} />
                    <Area type="monotone" dataKey="promo" stackId="1" stroke="var(--good)" fill="var(--good)" fillOpacity={0.18} isAnimationActive={!reduce} animationDuration={1200} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.aside>
        </section>

        {/* ─────────────── DAILY DISPATCH + UPCOMING ─────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-16">
          <motion.div {...reveal(0)} className="lg:col-span-7">
            <div className="flex items-end justify-between mb-5 pb-3 border-b ed-rule">
              <h3 className="ed-display text-[28px]">Daily Dispatch</h3>
              <p className="ed-kicker">Items requiring Patrick</p>
            </div>
            <ol className="divide-y ed-rule">
              {actionItems.map((item, idx) => {
                const isOpen = openItem === idx;
                const num = String(idx + 1).padStart(2, '0');
                const tagColor = item.priority === 'critical' ? 'var(--bad)' : item.priority === 'high' ? 'var(--warn)' : 'var(--accent)';
                return (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-5% 0px' }}
                    transition={{ duration: 0.55, ease: easeOutExpo, delay: idx * 0.05 }}
                    className="py-5 cursor-pointer group"
                    onClick={() => setOpenItem(isOpen ? null : idx)}
                  >
                    <div className="grid grid-cols-[44px_minmax(0,1fr)_auto] gap-5 items-baseline">
                      <span className="ed-num text-[18px] tabular-nums" style={{ color: 'var(--ink-mute)' }}>{num}</span>
                      <div>
                        <div className="flex flex-wrap items-baseline gap-3 mb-1">
                          <span
                            className="ed-num text-[10px] px-1.5 py-0.5"
                            style={{
                              background: tagColor,
                              color: 'var(--paper)',
                              letterSpacing: '0.12em',
                            }}
                          >
                            {priorityLabel[item.priority]}
                          </span>
                          <h4 className="text-[17px] leading-snug" style={{ fontFamily: 'var(--font-body)', fontWeight: 500 }}>{item.title}</h4>
                        </div>
                        <motion.div
                          initial={false}
                          animate={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                          transition={{ duration: 0.45, ease: easeOutExpo }}
                          className="grid"
                        >
                          <div className="overflow-hidden">
                            <p className="text-[14px] leading-[1.55] pt-2 pb-3" style={{ color: 'var(--ink-soft)', maxWidth: '62ch' }}>
                              {item.detail}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {item.actions.map((a) => (
                                <button
                                  key={a}
                                  onClick={(e) => e.stopPropagation()}
                                  className="ed-num text-[11px] px-3 py-1.5 transition-colors"
                                  style={{
                                    background: 'transparent',
                                    color: 'var(--ink)',
                                    border: '1px solid var(--ink)',
                                    letterSpacing: '0.06em',
                                    textTransform: 'uppercase',
                                  }}
                                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--ink)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--paper)'; }}
                                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--ink)'; }}
                                >
                                  {a}
                                </button>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      </div>
                      <span className="ed-num text-[11px] self-start mt-1.5" style={{ color: 'var(--ink-mute)', letterSpacing: '0.08em' }}>
                        {isOpen ? 'CLOSE' : 'READ'}
                      </span>
                    </div>
                  </motion.li>
                );
              })}
            </ol>
          </motion.div>

          <motion.div {...reveal(0.1)} className="lg:col-span-5">
            <div className="flex items-end justify-between mb-5 pb-3 border-b ed-rule">
              <h3 className="ed-display text-[28px]">Calendar</h3>
              <p className="ed-kicker">Next 30 days</p>
            </div>
            <div className="space-y-7">
              {keyDates.map((group) => (
                <div key={group.group}>
                  <p className="ed-kicker mb-3">{group.group}</p>
                  <ul>
                    {group.items.map((item, i) => {
                      const tint =
                        item.kind === 'good' ? 'var(--good)' :
                        item.kind === 'warn' ? 'var(--warn)' :
                        item.kind === 'critical' ? 'var(--bad)' :
                        item.kind === 'info' ? 'var(--accent)' :
                        'var(--ink)';
                      return (
                        <li key={i} className="grid grid-cols-[60px_minmax(0,1fr)_auto] gap-3 py-2 border-t ed-rule items-baseline first:border-t-0 first:pt-0">
                          <span className="ed-num text-[11px]" style={{ color: 'var(--ink-mute)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{item.date}</span>
                          <span className="text-[13px] leading-snug" style={{ color: tint, fontFamily: 'var(--font-body)' }}>{item.text}</span>
                          {item.value && <span className="ed-num text-[12px]" style={{ color: 'var(--ink)' }}>{item.value}</span>}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ─────────────── BOX SCORE ─────────────── */}
        <motion.section {...reveal(0)} className="mb-16">
          <div className="flex items-end justify-between mb-5 pb-3 border-b ed-rule">
            <h3 className="ed-display text-[28px]">Box Score</h3>
            <p className="ed-kicker">Goals at a glance</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-x divide-y lg:divide-y-0 ed-rule" style={{ borderColor: 'var(--rule)' }}>
            {scorecardItems.map((s, i) => {
              const ink =
                s.status === 'green' ? 'var(--good)' :
                s.status === 'yellow' ? 'var(--warn)' :
                'var(--bad)';
              return (
                <motion.div
                  key={s.goal}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-5% 0px' }}
                  transition={{ duration: 0.55, ease: easeOutExpo, delay: i * 0.05 }}
                  className="px-4 py-5 first:pl-0"
                >
                  <p className="ed-kicker mb-3">{s.goal}</p>
                  <p className="ed-num ed-display text-[26px] mb-1" style={{ color: ink }}>{s.actual}</p>
                  <p className="ed-num text-[11px]" style={{ color: 'var(--ink-mute)', letterSpacing: '0.04em' }}>
                    Target {s.target}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* ─────────────── DOMAIN BRIEF ─────────────── */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-8 pt-10 border-t ed-rule">
          <DomainBrief
            section="Finance"
            lede="$210K from IPF expected April 15."
            body="Cash sits at $142,350 with a positive 30-day forecast. Equipment debt is on schedule — nine months to payoff at $20K monthly. DSO has slipped to 52 days against a 45-day target; three promo invoices over 60 days account for $22K of the drag."
            metrics={['Revenue $583K', 'GP 24.2%', 'Net 11.7%']}
          />
          <DomainBrief
            section="Sales"
            lede="$847K pipeline, 34 deals open."
            body="Twelve deals closed for $318K MTD. Win rate is 42% versus a 50% target; new clients at two of four. $615K is parked in Design Ready and five deals have stalled seven days or more for a combined $54K. The One Percent Media spend continues to underperform."
            metrics={['Won $318K', 'Pipeline $847K', 'Win 42%']}
            delay={0.08}
          />
          <DomainBrief
            section="Operations"
            lede="91% on-time. 3 orders behind."
            body="Eighteen orders in production, eleven shipments in transit worth $284K. Warehouse holds at 68% capacity. Two Amazon deployments land in the next seven days at $117K; four more in the next thirty totaling $423K. SC Promo on-time has dipped to 75% and bears watching."
            metrics={['Active 34', 'OTD 91%', 'Cap 68%']}
            delay={0.16}
          />
        </section>

        {/* ─────────────── COLOPHON ─────────────── */}
        <footer className="mt-20 pt-6 border-t ed-rule flex items-baseline justify-between">
          <p className="ed-kicker">Compiled Mar 31 · ActivateSwag Command Center</p>
          <p className="ed-num text-[10px]" style={{ color: 'var(--ink-mute)' }}>— end —</p>
        </footer>
      </div>
    </div>
  );
}

function DomainBrief({
  section,
  lede,
  body,
  metrics,
  delay = 0,
}: { section: string; lede: string; body: string; metrics: string[]; delay?: number }) {
  return (
    <motion.article {...reveal(delay)}>
      <p className="ed-kicker mb-3">{section}</p>
      <h4 className="ed-display text-[22px] leading-[1.05] mb-3">{lede}</h4>
      <p className="text-[14px] leading-[1.6] mb-4" style={{ color: 'var(--ink-soft)', maxWidth: '50ch' }}>{body}</p>
      <ul className="ed-num text-[11px] flex flex-wrap gap-x-5 gap-y-1" style={{ color: 'var(--ink-mute)', letterSpacing: '0.05em' }}>
        {metrics.map((m) => (
          <li key={m}>{m.toUpperCase()}</li>
        ))}
      </ul>
    </motion.article>
  );
}
