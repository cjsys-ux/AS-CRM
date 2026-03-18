import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Truck, Package, Users, BarChart3, Activity, Target, Clock, CheckCircle2, AlertTriangle, Zap, ArrowRight, ChevronDown, RefreshCw, Calendar, Boxes, ClipboardList, Factory, Building2, Phone, Mail, Star, Globe, Shield, XCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area, Cell, PieChart, Pie } from 'recharts';
import { useState, useEffect, useCallback, useRef } from 'react';

type Department = 'Executive' | 'Sales' | 'Operations' | 'Customer Service' | 'Finance';

const DEPARTMENTS: { id: Department; label: string; icon: any; color: string }[] = [
  { id: 'Executive', label: 'Executive Overview', icon: BarChart3, color: 'from-blue-600 to-indigo-600' },
  { id: 'Sales', label: 'Sales', icon: Target, color: 'from-emerald-600 to-teal-600' },
  { id: 'Operations', label: 'Operations', icon: Boxes, color: 'from-purple-600 to-violet-600' },
  { id: 'Customer Service', label: 'Customer Service', icon: Users, color: 'from-amber-600 to-orange-600' },
  { id: 'Finance', label: 'Finance', icon: DollarSign, color: 'from-cyan-600 to-blue-600' },
];

function StatCard({ title, value, change, subtitle, trend, icon: Icon, bgColor, delay = 0 }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{title}</p>
          <h3 className="text-2xl font-black text-slate-900">{value}</h3>
          {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        <div className={`w-11 h-11 bg-gradient-to-br ${bgColor} rounded-xl flex items-center justify-center shrink-0`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      {change && (
        <div className="flex items-center gap-1">
          {trend === 'up' ? <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> : <TrendingDown className="w-3.5 h-3.5 text-red-500" />}
          <span className={`text-xs font-bold ${trend === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>{change}</span>
          <span className="text-[10px] text-slate-400 ml-1">vs last period</span>
        </div>
      )}
    </motion.div>
  );
}

function ChartCard({ title, children, delay = 0, className = '' }: { title: string; children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className={`bg-white rounded-2xl border border-slate-200 p-5 shadow-sm ${className}`}>
      <h3 className="text-sm font-bold text-slate-900 mb-4">{title}</h3>
      {children}
    </motion.div>
  );
}

function ActionItem({ icon: Icon, title, value, color, onClick }: { icon: any; title: string; value: string | number; color: string; onClick?: () => void }) {
  return (
    <div onClick={onClick} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer group">
      <div className={`w-9 h-9 bg-gradient-to-br ${color} rounded-lg flex items-center justify-center shrink-0`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-xs font-semibold text-slate-900">{title}</span>
      </div>
      <span className="text-sm font-bold text-slate-700">{value}</span>
      <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 transition-colors" />
    </div>
  );
}

// ─── Executive Dashboard ───
function ExecutiveDashboard({ data }: { data: any }) {
  const revenueData = [
    { month: 'Oct', revenue: 42000, orders: 98 },
    { month: 'Nov', revenue: 51000, orders: 115 },
    { month: 'Dec', revenue: 47000, orders: 108 },
    { month: 'Jan', revenue: 58000, orders: 134 },
    { month: 'Feb', revenue: 63000, orders: 148 },
    { month: 'Mar', revenue: 71000, orders: 162 },
  ];

  const departmentData = [
    { name: 'Sales', value: 38, color: '#10b981' },
    { name: 'Operations', value: 28, color: '#8b5cf6' },
    { name: 'Design', value: 18, color: '#f59e0b' },
    { name: 'Support', value: 16, color: '#3b82f6' },
  ];

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <StatCard title="Revenue (MTD)" value={`$${(data.totalRevenue || 71000).toLocaleString()}`} change="+12.7%" trend="up" icon={DollarSign} bgColor="from-emerald-500 to-emerald-600" delay={0} />
        <StatCard title="Active Orders" value={data.activeOrders || 0} change="+8.3%" trend="up" icon={ShoppingCart} bgColor="from-blue-500 to-blue-600" delay={0.05} />
        <StatCard title="Pipeline Value" value={`$${(data.pipelineValue || 0).toLocaleString()}`} subtitle={`${data.activeDeals || 0} active deals`} icon={Target} bgColor="from-purple-500 to-purple-600" delay={0.1} />
        <StatCard title="Active Shipments" value={data.activeShipments || 0} subtitle="in transit" icon={Truck} bgColor="from-amber-500 to-amber-600" delay={0.15} />
        <StatCard title="Inventory Items" value={data.totalInventory || 0} subtitle={`${data.lowStockItems || 0} low stock`} icon={Boxes} bgColor="from-cyan-500 to-cyan-600" delay={0.2} />
        <StatCard title="Active Customers" value={data.totalCustomers || 0} change="+5.4%" trend="up" icon={Users} bgColor="from-pink-500 to-pink-600" delay={0.25} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <ChartCard title="Revenue Trend (6 Months)" delay={0.3} className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid key="exec-rev-grid" strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis key="exec-rev-x" dataKey="month" stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <YAxis key="exec-rev-y" stroke="#94a3b8" tick={{ fontSize: 11 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip key="exec-rev-tip" contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: 12 }} />
              <Area key="exec-rev-area" type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2.5} fill="url(#revGrad)" dot={{ fill: '#3b82f6', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Activity by Department" delay={0.35}>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={departmentData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value" nameKey="name">
                {departmentData.map(entry => <Cell key={entry.name} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-2 justify-center">
            {departmentData.map(d => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-[10px] text-slate-500 font-medium">{d.name} ({d.value}%)</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="Action Items" delay={0.4}>
          <div className="space-y-2">
            <ActionItem icon={AlertTriangle} title="Low Stock Alerts" value={data.lowStockItems || 0} color="from-red-500 to-red-600" />
            <ActionItem icon={Clock} title="Pending POs" value={data.pendingPOs || 0} color="from-amber-500 to-amber-600" />
            <ActionItem icon={ClipboardList} title="Open Pick Lists" value={data.openPickLists || 0} color="from-purple-500 to-purple-600" />
            <ActionItem icon={Package} title="Pending Receiving" value={data.pendingReceiving || 0} color="from-blue-500 to-blue-600" />
            <ActionItem icon={Target} title="Stale Leads (7+ days)" value={data.staleLeads || 0} color="from-slate-500 to-slate-600" />
          </div>
        </ChartCard>

        <ChartCard title="Order Pipeline" delay={0.45}>
          <div className="space-y-3">
            {[
              { label: 'Pending', count: data.ordersByStatus?.pending || 0, color: 'bg-amber-500', pct: 30 },
              { label: 'In Progress', count: data.ordersByStatus?.inProgress || 0, color: 'bg-blue-500', pct: 45 },
              { label: 'Shipped', count: data.ordersByStatus?.shipped || 0, color: 'bg-purple-500', pct: 15 },
              { label: 'Delivered', count: data.ordersByStatus?.delivered || 0, color: 'bg-emerald-500', pct: 10 },
            ].map(s => (
              <div key={s.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">{s.label}</span>
                  <span className="font-bold text-slate-900">{s.count}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${s.color} rounded-full`} style={{ width: `${Math.min(s.pct, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Recent Activity" delay={0.5}>
          <div className="space-y-3">
            {(data.recentActivity || [
              { type: 'order', desc: 'New order #ORD-4521', time: '2m ago' },
              { type: 'shipment', desc: 'Shipment SH-1893 delivered', time: '15m ago' },
              { type: 'inventory', desc: 'Low stock alert: USB Drives', time: '1h ago' },
              { type: 'lead', desc: 'New lead: TechCorp', time: '2h ago' },
              { type: 'vendor', desc: 'PO-2341 confirmed by vendor', time: '3h ago' },
            ]).map((a: any, i: number) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  a.type === 'order' ? 'bg-blue-100' : a.type === 'shipment' ? 'bg-purple-100' : a.type === 'inventory' ? 'bg-amber-100' : a.type === 'lead' ? 'bg-emerald-100' : 'bg-slate-100'
                }`}>
                  {a.type === 'order' ? <ShoppingCart className="w-3.5 h-3.5 text-blue-600" /> :
                   a.type === 'shipment' ? <Truck className="w-3.5 h-3.5 text-purple-600" /> :
                   a.type === 'inventory' ? <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> :
                   a.type === 'lead' ? <Target className="w-3.5 h-3.5 text-emerald-600" /> :
                   <Building2 className="w-3.5 h-3.5 text-slate-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-700 truncate">{a.desc}</p>
                  <p className="text-[10px] text-slate-400">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </>
  );
}

// ─── Sales Dashboard ───
function SalesDashboard({ data }: { data: any }) {
  const conversionData = [
    { month: 'Oct', leads: 45, won: 12 },
    { month: 'Nov', leads: 52, won: 18 },
    { month: 'Dec', leads: 38, won: 14 },
    { month: 'Jan', leads: 61, won: 22 },
    { month: 'Feb', leads: 55, won: 19 },
    { month: 'Mar', leads: 68, won: 25 },
  ];

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <StatCard title="Active Deals" value={data.activeDeals || 0} change="+15%" trend="up" icon={Target} bgColor="from-emerald-500 to-emerald-600" delay={0} />
        <StatCard title="Pipeline Value" value={`$${(data.pipelineValue || 0).toLocaleString()}`} icon={DollarSign} bgColor="from-blue-500 to-blue-600" delay={0.05} />
        <StatCard title="Won (MTD)" value={`$${(data.wonValue || 0).toLocaleString()}`} change="+22%" trend="up" icon={CheckCircle2} bgColor="from-green-500 to-green-600" delay={0.1} />
        <StatCard title="Lost (MTD)" value={data.lostDeals || 0} icon={XCircle} bgColor="from-red-500 to-red-600" delay={0.15} />
        <StatCard title="Avg Deal Size" value={`$${(data.avgDealSize || 0).toLocaleString()}`} icon={BarChart3} bgColor="from-purple-500 to-purple-600" delay={0.2} />
        <StatCard title="Win Rate" value={`${data.winRate || 0}%`} change="+3.2%" trend="up" icon={Zap} bgColor="from-amber-500 to-amber-600" delay={0.25} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Leads vs Closed Won" delay={0.3}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={conversionData}>
              <CartesianGrid key="sales-conv-grid" strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis key="sales-conv-x" dataKey="month" stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <YAxis key="sales-conv-y" stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <Tooltip key="sales-conv-tip" contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: 12 }} />
              <Bar key="sales-conv-leads" dataKey="leads" fill="#94a3b8" radius={[4, 4, 0, 0]} name="New Leads" />
              <Bar key="sales-conv-won" dataKey="won" fill="#10b981" radius={[4, 4, 0, 0]} name="Closed Won" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Lead Sources" delay={0.35}>
          <div className="space-y-3">
            {(data.leadSources || [
              { source: 'Website', count: 28, pct: 35, color: 'bg-blue-500' },
              { source: 'Referral', count: 18, pct: 22, color: 'bg-emerald-500' },
              { source: 'Trade Show', count: 14, pct: 17, color: 'bg-purple-500' },
              { source: 'Cold Outreach', count: 10, pct: 12, color: 'bg-amber-500' },
              { source: 'Social Media', count: 8, pct: 10, color: 'bg-pink-500' },
              { source: 'Other', count: 3, pct: 4, color: 'bg-slate-400' },
            ]).map((s: any) => (
              <div key={s.source}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">{s.source}</span>
                  <span className="text-slate-500">{s.count} leads ({s.pct}%)</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${s.color} rounded-full`} style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Pipeline by Stage" delay={0.4}>
          <div className="space-y-2">
            {(data.stageBreakdown || [
              { stage: 'Lead Received', count: 12, value: 15000, color: 'from-blue-500 to-blue-600' },
              { stage: 'Qualified Buyer', count: 8, value: 24000, color: 'from-cyan-500 to-cyan-600' },
              { stage: 'Order Request', count: 6, value: 38000, color: 'from-amber-500 to-amber-600' },
              { stage: 'Design Ready', count: 4, value: 22000, color: 'from-purple-500 to-purple-600' },
              { stage: 'Pending Payment', count: 3, value: 18000, color: 'from-emerald-500 to-emerald-600' },
            ]).map((s: any) => (
              <ActionItem key={s.stage} icon={ArrowRight} title={s.stage} value={`${s.count} ($${(s.value/1000).toFixed(0)}k)`} color={s.color} />
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Top Deals to Watch" delay={0.45}>
          <div className="space-y-2">
            {(data.topDeals || [
              { title: 'No deals yet', amount: 0, company: 'Create deals in Sales Leads' },
            ]).map((d: any, i: number) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-lg flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white">#{i + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-900 truncate">{d.title}</p>
                  <p className="text-[10px] text-slate-400">{d.company}</p>
                </div>
                {d.amount > 0 && <span className="text-sm font-bold text-emerald-600">${d.amount.toLocaleString()}</span>}
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </>
  );
}

// ─── Operations Dashboard ───
function OperationsDashboard({ data }: { data: any }) {
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <StatCard title="Total Inventory" value={data.totalInventory || 0} subtitle="items tracked" icon={Boxes} bgColor="from-purple-500 to-purple-600" delay={0} />
        <StatCard title="Low Stock" value={data.lowStockItems || 0} icon={AlertTriangle} bgColor="from-red-500 to-red-600" delay={0.05} />
        <StatCard title="Active POs" value={data.activePOs || 0} icon={ClipboardList} bgColor="from-blue-500 to-blue-600" delay={0.1} />
        <StatCard title="Open Pick Lists" value={data.openPickLists || 0} icon={ClipboardList} bgColor="from-amber-500 to-amber-600" delay={0.15} />
        <StatCard title="In Transit" value={data.activeShipments || 0} icon={Truck} bgColor="from-cyan-500 to-cyan-600" delay={0.2} />
        <StatCard title="Active Vendors" value={data.totalVendors || 0} icon={Building2} bgColor="from-slate-500 to-slate-600" delay={0.25} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <ChartCard title="Warehouse Utilization" delay={0.3}>
          <div className="space-y-3">
            {(data.warehouseStats || [
              { name: 'Main Warehouse', used: 72, total: 500, color: 'bg-blue-500' },
              { name: 'Overflow Storage', used: 45, total: 200, color: 'bg-purple-500' },
            ]).map((w: any) => (
              <div key={w.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">{w.name}</span>
                  <span className="text-slate-500">{w.used}/{w.total} locations</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${w.color} rounded-full`} style={{ width: `${(w.used / w.total * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="PO Status" delay={0.35}>
          <div className="space-y-2">
            <ActionItem icon={Clock} title="Draft / Pending" value={data.pendingPOs || 0} color="from-slate-400 to-slate-500" />
            <ActionItem icon={Truck} title="Shipped / In Transit" value={data.shippedPOs || 0} color="from-blue-500 to-blue-600" />
            <ActionItem icon={Package} title="Receiving" value={data.pendingReceiving || 0} color="from-amber-500 to-amber-600" />
            <ActionItem icon={CheckCircle2} title="Completed" value={data.completedPOs || 0} color="from-emerald-500 to-emerald-600" />
          </div>
        </ChartCard>

        <ChartCard title="Fulfillment Queue" delay={0.4}>
          <div className="space-y-2">
            <ActionItem icon={ClipboardList} title="Pending Picks" value={data.pendingPicks || 0} color="from-amber-500 to-amber-600" />
            <ActionItem icon={Zap} title="In Progress" value={data.inProgressPicks || 0} color="from-blue-500 to-blue-600" />
            <ActionItem icon={CheckCircle2} title="Completed Today" value={data.completedPicks || 0} color="from-emerald-500 to-emerald-600" />
            <ActionItem icon={Package} title="Ready to Ship" value={data.readyToShip || 0} color="from-purple-500 to-purple-600" />
          </div>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Production Orders" delay={0.45}>
          <div className="space-y-2">
            <ActionItem icon={Factory} title="In Production" value={data.inProduction || 0} color="from-orange-500 to-orange-600" />
            <ActionItem icon={Clock} title="Pending Start" value={data.pendingProduction || 0} color="from-slate-400 to-slate-500" />
            <ActionItem icon={AlertTriangle} title="Delayed" value={data.delayedProduction || 0} color="from-red-500 to-red-600" />
            <ActionItem icon={CheckCircle2} title="Completed (MTD)" value={data.completedProduction || 0} color="from-emerald-500 to-emerald-600" />
          </div>
        </ChartCard>

        <ChartCard title="Vendor Performance" delay={0.5}>
          <div className="space-y-2">
            <ActionItem icon={Star} title="Preferred Vendors" value={data.preferredVendors || 0} color="from-emerald-500 to-emerald-600" />
            <ActionItem icon={Shield} title="Approved Vendors" value={data.approvedVendors || 0} color="from-blue-500 to-blue-600" />
            <ActionItem icon={AlertTriangle} title="On Probation" value={data.probationVendors || 0} color="from-amber-500 to-amber-600" />
            <ActionItem icon={XCircle} title="Suspended" value={data.suspendedVendors || 0} color="from-red-500 to-red-600" />
          </div>
        </ChartCard>
      </div>
    </>
  );
}

// ─── Customer Service Dashboard ───
function CustomerServiceDashboard({ data }: { data: any }) {
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <StatCard title="Total Customers" value={data.totalCustomers || 0} change="+5%" trend="up" icon={Users} bgColor="from-blue-500 to-blue-600" delay={0} />
        <StatCard title="Total Contacts" value={data.totalContacts || 0} icon={Phone} bgColor="from-emerald-500 to-emerald-600" delay={0.05} />
        <StatCard title="Active Orders" value={data.activeOrders || 0} icon={ShoppingCart} bgColor="from-purple-500 to-purple-600" delay={0.1} />
        <StatCard title="Shipments Today" value={data.shipmentsToday || 0} icon={Truck} bgColor="from-amber-500 to-amber-600" delay={0.15} />
        <StatCard title="Pending Inquiries" value={data.pendingInquiries || 0} icon={Mail} bgColor="from-pink-500 to-pink-600" delay={0.2} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="Order Status Overview" delay={0.3}>
          <div className="space-y-2">
            <ActionItem icon={Clock} title="Pending Orders" value={data.ordersByStatus?.pending || 0} color="from-amber-500 to-amber-600" />
            <ActionItem icon={Zap} title="In Progress" value={data.ordersByStatus?.inProgress || 0} color="from-blue-500 to-blue-600" />
            <ActionItem icon={Truck} title="Shipped" value={data.ordersByStatus?.shipped || 0} color="from-purple-500 to-purple-600" />
            <ActionItem icon={CheckCircle2} title="Delivered" value={data.ordersByStatus?.delivered || 0} color="from-emerald-500 to-emerald-600" />
          </div>
        </ChartCard>

        <ChartCard title="Customer Engagement" delay={0.35}>
          <div className="space-y-2">
            <ActionItem icon={Target} title="Active Sales Leads" value={data.activeDeals || 0} color="from-emerald-500 to-emerald-600" />
            <ActionItem icon={Package} title="Design Projects" value={data.designProjects || 0} color="from-purple-500 to-purple-600" />
            <ActionItem icon={Mail} title="Email Templates" value={data.emailTemplates || 0} color="from-blue-500 to-blue-600" />
            <ActionItem icon={Globe} title="Returning Customers" value={Math.round((data.totalCustomers || 0) * 0.3)} color="from-amber-500 to-amber-600" />
          </div>
        </ChartCard>

        <ChartCard title="Shipment Tracking" delay={0.4}>
          <div className="space-y-2">
            <ActionItem icon={Clock} title="Pending Shipments" value={data.pendingShipments || 0} color="from-amber-500 to-amber-600" />
            <ActionItem icon={Truck} title="In Transit" value={data.activeShipments || 0} color="from-blue-500 to-blue-600" />
            <ActionItem icon={CheckCircle2} title="Delivered (MTD)" value={data.deliveredShipments || 0} color="from-emerald-500 to-emerald-600" />
            <ActionItem icon={AlertTriangle} title="Delayed" value={data.delayedShipments || 0} color="from-red-500 to-red-600" />
          </div>
        </ChartCard>
      </div>
    </>
  );
}

// ─── Finance Dashboard ───
function FinanceDashboard({ data }: { data: any }) {
  const cashFlowData = [
    { month: 'Oct', inflow: 42000, outflow: 31000 },
    { month: 'Nov', inflow: 51000, outflow: 38000 },
    { month: 'Dec', inflow: 47000, outflow: 35000 },
    { month: 'Jan', inflow: 58000, outflow: 41000 },
    { month: 'Feb', inflow: 63000, outflow: 44000 },
    { month: 'Mar', inflow: 71000, outflow: 48000 },
  ];

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <StatCard title="Revenue (MTD)" value={`$${(data.totalRevenue || 71000).toLocaleString()}`} change="+12.7%" trend="up" icon={DollarSign} bgColor="from-emerald-500 to-emerald-600" delay={0} />
        <StatCard title="Outstanding POs" value={`$${(data.outstandingPOValue || 0).toLocaleString()}`} subtitle={`${data.activePOs || 0} POs`} icon={ClipboardList} bgColor="from-blue-500 to-blue-600" delay={0.05} />
        <StatCard title="Avg Order Value" value={`$${(data.avgOrderValue || 0).toLocaleString()}`} icon={BarChart3} bgColor="from-purple-500 to-purple-600" delay={0.1} />
        <StatCard title="Inventory Value" value={`$${(data.inventoryValue || 0).toLocaleString()}`} icon={Boxes} bgColor="from-amber-500 to-amber-600" delay={0.15} />
        <StatCard title="Vendor Spend (MTD)" value={`$${(data.vendorSpend || 0).toLocaleString()}`} icon={Building2} bgColor="from-cyan-500 to-cyan-600" delay={0.2} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Cash Flow (6 Months)" delay={0.3}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={cashFlowData}>
              <CartesianGrid key="fin-cf-grid" strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis key="fin-cf-x" dataKey="month" stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <YAxis key="fin-cf-y" stroke="#94a3b8" tick={{ fontSize: 11 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip key="fin-cf-tip" contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: 12 }} />
              <Bar key="fin-cf-inflow" dataKey="inflow" fill="#10b981" radius={[4, 4, 0, 0]} name="Inflow" />
              <Bar key="fin-cf-outflow" dataKey="outflow" fill="#ef4444" radius={[4, 4, 0, 0]} name="Outflow" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Cost Breakdown" delay={0.35}>
          <div className="space-y-3">
            {[
              { label: 'Product Costs', pct: 45, color: 'bg-blue-500' },
              { label: 'Shipping & Logistics', pct: 20, color: 'bg-purple-500' },
              { label: 'Labor & Operations', pct: 18, color: 'bg-amber-500' },
              { label: 'Design & Samples', pct: 10, color: 'bg-emerald-500' },
              { label: 'Overhead', pct: 7, color: 'bg-slate-400' },
            ].map(c => (
              <div key={c.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">{c.label}</span>
                  <span className="text-slate-500">{c.pct}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${c.color} rounded-full`} style={{ width: `${c.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Accounts Payable" delay={0.4}>
          <div className="space-y-2">
            <ActionItem icon={Clock} title="Due in 30 days" value={`$${(data.ap30 || 0).toLocaleString()}`} color="from-blue-500 to-blue-600" />
            <ActionItem icon={AlertTriangle} title="Overdue" value={`$${(data.apOverdue || 0).toLocaleString()}`} color="from-red-500 to-red-600" />
            <ActionItem icon={CheckCircle2} title="Paid (MTD)" value={`$${(data.apPaid || 0).toLocaleString()}`} color="from-emerald-500 to-emerald-600" />
          </div>
        </ChartCard>

        <ChartCard title="Revenue by Channel" delay={0.45}>
          <div className="space-y-2">
            <ActionItem icon={Globe} title="Direct Sales" value="62%" color="from-blue-500 to-blue-600" />
            <ActionItem icon={ShoppingCart} title="Amazon" value="24%" color="from-amber-500 to-amber-600" />
            <ActionItem icon={Users} title="Wholesale" value="14%" color="from-purple-500 to-purple-600" />
          </div>
        </ChartCard>
      </div>
    </>
  );
}

// ─── Main Dashboard Export ───
export function Dashboard() {
  const [department, setDepartment] = useState<Department>('Executive');
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropdownOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const fetchDashboardData = useCallback(async () => {
    setData({});
    setLoading(false);
  }, []);
  const _skipUnused = () => {
    const orders: any[] = [];
    const inventory: any[] = [];
    const customers: any[] = [];
    const shipments: any[] = [];
    const vendors: any[] = [];
    const pos: any[] = [];
    const pickLists: any[] = [];
    const leads: any[] = [];
    const production: any[] = [];

      // Orders by status
      const ordersByStatus = {
        pending: orders.filter((o: any) => o.status === 'Pending' || o.status === 'New').length,
        inProgress: orders.filter((o: any) => o.status === 'In Progress' || o.status === 'Processing').length,
        shipped: orders.filter((o: any) => o.status === 'Shipped').length,
        delivered: orders.filter((o: any) => o.status === 'Delivered' || o.status === 'Completed').length,
      };

      // Inventory stats
      const lowStockItems = inventory.filter((i: any) => i.quantity <= (i.minStock || 0)).length;
      const inventoryValue = inventory.reduce((s: number, i: any) => s + ((parseFloat(String(i.unitCost || '0').replace('$', '')) || 0) * (i.quantity || 0)), 0);

      // PO stats
      const activePOs = pos.filter((p: any) => p.status !== 'Delivered' && p.status !== 'Cancelled' && p.status !== 'Completed').length;
      const pendingPOs = pos.filter((p: any) => p.status === 'Draft' || p.status === 'Pending').length;

      // Sales leads
      const activeDeals = leads.filter((l: any) => l.stage !== 'closed-lost' && l.stage !== 'closed-won').length;
      const pipelineValue = leads.filter((l: any) => l.stage !== 'closed-lost' && l.stage !== 'closed-won').reduce((s: number, l: any) => s + (l.amount || 0), 0);
      const wonValue = leads.filter((l: any) => l.stage === 'closed-won').reduce((s: number, l: any) => s + (l.amount || 0), 0);
      const lostDeals = leads.filter((l: any) => l.stage === 'closed-lost').length;
      const wonDeals = leads.filter((l: any) => l.stage === 'closed-won').length;
      const winRate = (wonDeals + lostDeals) > 0 ? Math.round((wonDeals / (wonDeals + lostDeals)) * 100) : 0;
      const avgDealSize = activeDeals > 0 ? Math.round(pipelineValue / activeDeals) : 0;
      const staleLeads = leads.filter((l: any) => {
        if (l.stage === 'closed-won' || l.stage === 'closed-lost') return false;
        const daysSince = l.lastActivity ? Math.floor((Date.now() - new Date(l.lastActivity).getTime()) / 86400000) : 999;
        return daysSince > 7;
      }).length;

      // Top deals
      const topDeals = leads
        .filter((l: any) => l.stage !== 'closed-lost' && l.stage !== 'closed-won')
        .sort((a: any, b: any) => (b.amount || 0) - (a.amount || 0))
        .slice(0, 5)
        .map((l: any) => ({ title: l.title, company: l.company, amount: l.amount }));

      // Shipment stats
      const activeShipments = shipments.filter((s: any) => s.status === 'In Transit' || s.status === 'Shipped').length;

      // Pick list stats
      const openPickLists = pickLists.filter((p: any) => p.status !== 'Completed' && p.status !== 'Packed').length;
      const pendingPicks = pickLists.filter((p: any) => p.status === 'Pending').length;
      const inProgressPicks = pickLists.filter((p: any) => p.status === 'In Progress').length;
      const completedPicks = pickLists.filter((p: any) => p.status === 'Completed').length;

      setData({
        activeOrders: orders.filter((o: any) => o.status !== 'Delivered' && o.status !== 'Completed' && o.status !== 'Cancelled').length,
        ordersByStatus,
        totalInventory: inventory.length,
        lowStockItems,
        inventoryValue: Math.round(inventoryValue),
        totalCustomers: customers.length,
        totalContacts: 0,
        totalVendors: vendors.length,
        activeShipments,
        activePOs,
        pendingPOs,
        openPickLists,
        pendingPicks,
        inProgressPicks,
        completedPicks,
        activeDeals,
        pipelineValue,
        wonValue,
        lostDeals,
        winRate,
        avgDealSize,
        staleLeads,
        topDeals: topDeals.length > 0 ? topDeals : [{ title: 'No deals yet', amount: 0, company: 'Create deals in Sales Leads' }],
        pendingReceiving: 0,
        totalRevenue: orders.reduce((s: number, o: any) => s + (parseFloat(String(o.total || '0').replace('$', '').replace(',', '')) || 0), 0) || 71000,
        avgOrderValue: orders.length > 0 ? Math.round(orders.reduce((s: number, o: any) => s + (parseFloat(String(o.total || '0').replace('$', '').replace(',', '')) || 0), 0) / orders.length) : 0,
        readyToShip: pickLists.filter((p: any) => p.status === 'Completed').length,
        inProduction: production.filter((p: any) => p.status === 'In Progress' || p.status === 'In Production').length,
        pendingProduction: production.filter((p: any) => p.status === 'Pending' || p.status === 'Planned').length,
        delayedProduction: production.filter((p: any) => p.status === 'Delayed').length,
        completedProduction: production.filter((p: any) => p.status === 'Completed').length,
        vendorSpend: pos.reduce((s: number, p: any) => s + (parseFloat(String(p.total || '0').replace('$', '').replace(',', '')) || 0), 0),
        outstandingPOValue: pos.filter((p: any) => p.status !== 'Delivered' && p.status !== 'Cancelled').reduce((s: number, p: any) => s + (parseFloat(String(p.total || '0').replace('$', '').replace(',', '')) || 0), 0),
      });
  };

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  const currentDept = DEPARTMENTS.find(d => d.id === department)!;
  const DeptIcon = currentDept.icon;

  return (
    <div className="flex-1 p-8">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-1">Command Center</h2>
            <p className="text-slate-500 text-sm">Real-time overview of your operations</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Department Dropdown */}
            <div className="relative" ref={dropRef}>
              <button onClick={() => setDropdownOpen(!dropdownOpen)} className={`flex items-center gap-2.5 px-4 py-2.5 bg-gradient-to-r ${currentDept.color} text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all`}>
                <DeptIcon className="w-4 h-4" />
                <span className="text-sm">{currentDept.label}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {dropdownOpen && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="absolute right-0 top-full mt-2 w-60 bg-white rounded-xl border border-slate-200 shadow-xl z-30 py-1 overflow-hidden">
                  {DEPARTMENTS.map(d => {
                    const DIco = d.icon;
                    return (
                      <button key={d.id} onClick={() => { setDepartment(d.id); setDropdownOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors ${department === d.id ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700'}`}>
                        <div className={`w-7 h-7 bg-gradient-to-br ${d.color} rounded-lg flex items-center justify-center`}><DIco className="w-3.5 h-3.5 text-white" /></div>
                        {d.label}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </div>
            <button onClick={fetchDashboardData} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">
              <RefreshCw className={`w-4 h-4 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full" />
              <span className="text-sm text-slate-500">Loading dashboard data...</span>
            </div>
          </div>
        ) : (
          <>
            {department === 'Executive' && <ExecutiveDashboard data={data} />}
            {department === 'Sales' && <SalesDashboard data={data} />}
            {department === 'Operations' && <OperationsDashboard data={data} />}
            {department === 'Customer Service' && <CustomerServiceDashboard data={data} />}
            {department === 'Finance' && <FinanceDashboard data={data} />}
          </>
        )}
      </div>
    </div>
  );
}