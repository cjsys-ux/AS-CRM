import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  DollarSign, FileText, AlertTriangle, Clock, TrendingUp, TrendingDown,
  Search, Filter, ChevronDown, ChevronUp, Download, Send, Plus, Eye,
  CheckCircle2, XCircle, Calendar, Package, Truck, Building2, Sparkles,
  ArrowRight, BarChart3, RefreshCw, Loader2, CreditCard, Receipt,
  ArrowUpRight, ArrowDownRight, Layers, PieChart, Activity, Zap,
  ChevronLeft, ChevronRight, MoreHorizontal, Mail, Printer, X
} from 'lucide-react';
import { toast } from 'sonner';


// ── Types ──
interface AmazonOrder {
  id: string;
  productName: string;
  orderType?: string;
  totalQty: number;
  amazonProductRevenue: number;
  amazonShippingRevenue: number;
  totalAmazonRevenue: number;
  totalProductCost: number;
  shippingCost: number;
  totalCost: number;
  totalProfit: number;
  ipfProfit: number;
  activateProfit: number;
  deliveryDate: string;
  payoutDate: string;
  amazonPaid: boolean;
  activateShippingRev: number;
  activateProductRev: number;
}

interface CorporateInvoice {
  id: string;
  invoiceNumber: string;
  customer: string;
  salesRep: string;
  amount: number;
  amountPaid: number;
  issueDate: string;
  dueDate: string;
  status: 'open' | 'paid' | 'past_due' | 'partial';
  items: string;
  notes?: string;
}

interface ProductSummary {
  productName: string;
  quantitySold: number;
  amazonProductRevenue: number;
  amazonShippingRevenue: number;
  totalAmazonRevenue: number;
  productCost: number;
  shippingCost: number;
  totalCost: number;
  productProfit: number;
  shippingProfit: number;
  totalProfit: number;
  ipfProfit: number;
  activateSwagProfit: number;
}

// ── Helpers ──
const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtInt = (n: number) => n.toLocaleString('en-US');
const today = new Date();

function getStatusColor(status: string) {
  switch (status) {
    case 'paid': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'open': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'past_due': return 'bg-red-100 text-red-700 border-red-200';
    case 'partial': return 'bg-amber-100 text-amber-700 border-amber-200';
    default: return 'bg-slate-100 text-slate-600 border-slate-200';
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'paid': return 'Paid';
    case 'open': return 'Open';
    case 'past_due': return 'Past Due';
    case 'partial': return 'Partial';
    default: return status;
  }
}

function daysUntil(dateStr: string) {
  const d = new Date(dateStr);
  return Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

// ── KPI Card ──
function KPICard({ label, value, icon: Icon, color, sub, trend, delay = 0 }: {
  label: string; value: string; icon: any; color: string; sub?: string; trend?: 'up' | 'down'; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`relative overflow-hidden rounded-2xl border p-5 ${color} backdrop-blur-sm`}
    >
      <div className="absolute -top-4 -right-4 opacity-[0.07]">
        <Icon className="w-24 h-24" />
      </div>
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-1">{label}</p>
          <p className="text-2xl font-black">{value}</p>
          {sub && <p className="text-xs mt-1 opacity-60">{sub}</p>}
        </div>
        {trend && (
          <div className={`flex items-center gap-0.5 text-xs font-bold ${trend === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
            {trend === 'up' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Animated Counter ──
function AnimatedNumber({ value, prefix = '$' }: { value: number; prefix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const dur = 800;
    const start = performance.now();
    const startVal = display;
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / dur, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(startVal + (value - startVal) * eased);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value]);
  return <span>{prefix}{fmt(display)}</span>;
}

// ── Main Billing Module ──
export function BillingModule() {
  const [activeSection, setActiveSection] = useState<'corporate' | 'amazon'>('amazon');
  const [amazonOrders, setAmazonOrders] = useState<AmazonOrder[]>([]);
  const [corporateInvoices, setCorporateInvoices] = useState<CorporateInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortCol, setSortCol] = useState<string>('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [corpPage, setCorpPage] = useState(1);
  const [showStatementModal, setShowStatementModal] = useState(false);
  const [selectedRep, setSelectedRep] = useState('');
  const corpPerPage = 15;

  // Customer logo map: lowercased customer name → logo URL
  const [customerLogoMap, setCustomerLogoMap] = useState<Record<string, string>>({});
  const [dbCustomerNames, setDbCustomerNames] = useState<string[]>([]);

  // Fetch amazon orders
  const fetchAmazonOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/billing/amazon-orders', {
        headers: {  }
      });
      if (res.ok) {
        const data = await res.json();
        setAmazonOrders(Array.isArray(data) ? data : data.orders || []);
      }
    } catch (e) {
      console.error('Error fetching amazon orders:', e);
    }
  }, []);

  // Fetch customer logos — same pattern as OrdersPage / PurchasingModule / InventoryModule
  const fetchCustomerLogos = useCallback(async () => {
    try {
      const res = await fetch('/api/customers/list', {
        headers: {  },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.customers)) {
          const map: Record<string, string> = {};
          const names: string[] = [];
          data.customers.forEach((c: any) => {
            if (c.name) {
              names.push(c.name);
              if (c.logo) map[c.name.trim().toLowerCase()] = c.logo;
            }
          });
          setCustomerLogoMap(map);
          setDbCustomerNames(names);
          return names;
        }
      }
    } catch (e) {
      console.log('Failed to fetch customer logos:', e);
    }
    return [];
  }, []);

  // Fetch corporate invoices (mock/seed data)
  const fetchCorporateInvoices = useCallback(async () => {
    try {
      const res = await fetch('/api/billing-invoices', {
        headers: {  }
      });
      if (res.ok) {
        const data = await res.json();
        setCorporateInvoices(Array.isArray(data) ? data : data.invoices || []);
      } else {
        // seed demo data
        seedCorporateInvoices();
      }
    } catch {
      seedCorporateInvoices();
    }
  }, []);

  const seedCorporateInvoices = (liveNames?: string[]) => {
    const reps = ['Sarah Johnson', 'Mike Chen', 'Emily Rodriguez', 'David Kim', 'Jessica Park'];
    // Prefer real DB customer names so logos show; fall back to demo names
    const customers = (liveNames && liveNames.length > 0)
      ? liveNames
      : ['Coca-Cola', 'Nike', 'Google', 'Amazon AWS', 'Microsoft', 'Meta', 'Apple', 'Tesla', 'Spotify', 'Netflix',
        'Uber', 'Airbnb', 'Stripe', 'Shopify', 'Salesforce', 'Adobe', 'Intel', 'Oracle', 'Dell', 'HP Inc'];
    const items = ['Custom T-Shirts', 'Branded Hoodies', 'Logo Caps', 'Promo Mugs', 'Tote Bags', 'Lanyards', 'Pens Set', 'Notebooks', 'Water Bottles', 'Backpacks'];

    const invoices: CorporateInvoice[] = [];
    for (let i = 0; i < 45; i++) {
      const daysAgo = Math.floor(Math.random() * 120) - 30;
      const issueDate = new Date(today.getTime() - daysAgo * 86400000);
      const dueDate = new Date(issueDate.getTime() + (30 + Math.floor(Math.random() * 30)) * 86400000);
      const amount = Math.round((500 + Math.random() * 25000) * 100) / 100;
      const isPastDue = dueDate < today;
      const isPaid = Math.random() < 0.3;
      const isPartial = !isPaid && Math.random() < 0.2;
      const status = isPaid ? 'paid' : isPastDue ? 'past_due' : isPartial ? 'partial' : 'open';
      const amountPaid = isPaid ? amount : isPartial ? Math.round(amount * (0.2 + Math.random() * 0.6) * 100) / 100 : 0;

      invoices.push({
        id: `inv-${i}`,
        invoiceNumber: `INV-${2026000 + i}`,
        customer: customers[i % customers.length],
        salesRep: reps[i % reps.length],
        amount,
        amountPaid,
        issueDate: issueDate.toISOString().split('T')[0],
        dueDate: dueDate.toISOString().split('T')[0],
        status: status as any,
        items: items[Math.floor(Math.random() * items.length)],
      });
    }
    setCorporateInvoices(invoices);
  };

  useEffect(() => {
    setLoading(true);
    // Fetch customer logos first so that if invoices need to be seeded,
    // we can use real customer names and the logos will resolve immediately.
    fetchCustomerLogos().then((liveNames) => {
      Promise.all([fetchAmazonOrders(), fetchCorporateInvoices()]).finally(() => setLoading(false));
    });
  }, []);

  // ── Amazon Distribution Summary ──
  const amazonSummary = useMemo(() => {
    const byProduct: Record<string, ProductSummary> = {};
    amazonOrders.forEach(o => {
      const key = o.productName || 'Unknown';
      if (!byProduct[key]) {
        byProduct[key] = {
          productName: key,
          quantitySold: 0,
          amazonProductRevenue: 0,
          amazonShippingRevenue: 0,
          totalAmazonRevenue: 0,
          productCost: 0,
          shippingCost: 0,
          totalCost: 0,
          productProfit: 0,
          shippingProfit: 0,
          totalProfit: 0,
          ipfProfit: 0,
          activateSwagProfit: 0,
        };
      }
      const p = byProduct[key];
      p.quantitySold += o.totalQty || 0;
      p.amazonProductRevenue += o.amazonProductRevenue || 0;
      p.amazonShippingRevenue += o.amazonShippingRevenue || 0;
      p.totalAmazonRevenue += o.totalAmazonRevenue || 0;
      p.productCost += o.totalProductCost || 0;
      p.shippingCost += o.shippingCost || 0;
      p.totalCost += o.totalCost || 0;
      p.productProfit += (o.amazonProductRevenue || 0) - (o.totalProductCost || 0);
      p.shippingProfit += (o.amazonShippingRevenue || 0) - (o.shippingCost || 0);
      p.totalProfit += o.totalProfit || 0;
      p.ipfProfit += o.ipfProfit || 0;
      p.activateSwagProfit += o.activateProfit || 0;
    });
    return Object.values(byProduct).sort((a, b) => b.totalAmazonRevenue - a.totalAmazonRevenue);
  }, [amazonOrders]);

  const amazonTotals = useMemo(() => {
    const t = {
      quantitySold: 0, amazonProductRevenue: 0, amazonShippingRevenue: 0, totalAmazonRevenue: 0,
      productCost: 0, shippingCost: 0, totalCost: 0, productProfit: 0, shippingProfit: 0,
      totalProfit: 0, ipfProfit: 0, activateSwagProfit: 0,
    };
    amazonSummary.forEach(p => {
      t.quantitySold += p.quantitySold;
      t.amazonProductRevenue += p.amazonProductRevenue;
      t.amazonShippingRevenue += p.amazonShippingRevenue;
      t.totalAmazonRevenue += p.totalAmazonRevenue;
      t.productCost += p.productCost;
      t.shippingCost += p.shippingCost;
      t.totalCost += p.totalCost;
      t.productProfit += p.productProfit;
      t.shippingProfit += p.shippingProfit;
      t.totalProfit += p.totalProfit;
      t.ipfProfit += p.ipfProfit;
      t.activateSwagProfit += p.activateSwagProfit;
    });
    return t;
  }, [amazonSummary]);

  // Amount Due calculations
  const amountDue = useMemo(() => {
    const productCostAmount = amazonTotals.productCost;
    const shippingCostAmount = amazonTotals.shippingCost;
    const totalCostOnly = productCostAmount + shippingCostAmount;
    const asProfit = amazonTotals.activateSwagProfit;
    const patrickProfit = amazonTotals.ipfProfit;
    const costAndProfit = totalCostOnly + asProfit + patrickProfit;
    
    // Payments = orders marked as amazon paid
    const paidOrders = amazonOrders.filter(o => o.amazonPaid);
    const payments = paidOrders.reduce((sum, o) => sum + (o.totalAmazonRevenue || 0), 0);
    
    const balanceDue = costAndProfit - payments;
    const totalBalanceWithProfit = balanceDue;
    const totalCostOnlyDue = totalCostOnly - payments;

    return {
      productCost: productCostAmount,
      shippingCost: shippingCostAmount,
      totalCostOnly,
      asProfit,
      patrickProfit,
      costAndProfit,
      payments,
      balanceDueProduct: Math.max(0, productCostAmount - payments * (productCostAmount / (totalCostOnly || 1))),
      balanceDueShipping: Math.max(0, shippingCostAmount - payments * (shippingCostAmount / (totalCostOnly || 1))),
      balanceDueAS: asProfit,
      balanceDuePatrick: patrickProfit > 0 ? patrickProfit - (paidOrders.reduce((s, o) => s + (o.ipfProfit || 0), 0) > 0 ? paidOrders.reduce((s, o) => s + (o.ipfProfit || 0), 0) * 0.1 : 0) : 0,
      totalBalanceWithProfit,
      totalCostOnlyDue,
    };
  }, [amazonOrders, amazonTotals]);

  // ── Corporate Filtering ──
  const filteredInvoices = useMemo(() => {
    let list = corporateInvoices;
    if (statusFilter !== 'all') list = list.filter(i => i.status === statusFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(i =>
        i.invoiceNumber.toLowerCase().includes(q) ||
        i.customer.toLowerCase().includes(q) ||
        i.salesRep.toLowerCase().includes(q)
      );
    }
    if (sortCol) {
      list = [...list].sort((a: any, b: any) => {
        const va = a[sortCol], vb = b[sortCol];
        if (typeof va === 'number') return sortDir === 'asc' ? va - vb : vb - va;
        return sortDir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
      });
    }
    return list;
  }, [corporateInvoices, statusFilter, searchQuery, sortCol, sortDir]);

  const corpTotalPages = Math.ceil(filteredInvoices.length / corpPerPage);
  const corpPageData = filteredInvoices.slice((corpPage - 1) * corpPerPage, corpPage * corpPerPage);

  const corpKPIs = useMemo(() => {
    const open = corporateInvoices.filter(i => i.status === 'open');
    const pastDue = corporateInvoices.filter(i => i.status === 'past_due');
    const paid = corporateInvoices.filter(i => i.status === 'paid');
    return {
      totalOutstanding: [...open, ...pastDue, ...corporateInvoices.filter(i => i.status === 'partial')]
        .reduce((s, i) => s + (i.amount - i.amountPaid), 0),
      openCount: open.length,
      openAmount: open.reduce((s, i) => s + i.amount, 0),
      pastDueCount: pastDue.length,
      pastDueAmount: pastDue.reduce((s, i) => s + (i.amount - i.amountPaid), 0),
      paidAmount: paid.reduce((s, i) => s + i.amount, 0),
      collectionRate: paid.length / (corporateInvoices.length || 1) * 100,
    };
  }, [corporateInvoices]);

  const salesReps = useMemo(() => {
    const reps = new Set(corporateInvoices.map(i => i.salesRep));
    return Array.from(reps).sort();
  }, [corporateInvoices]);

  const handleSort = (col: string) => {
    if (sortCol === col) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ col }: { col: string }) => {
    if (sortCol !== col) return <ChevronsUpDown className="w-3 h-3 opacity-30" />;
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />;
  };

  // ChevronsUpDown import workaround
  const ChevronsUpDown = ({ className }: { className?: string }) => (
    <span className={className} style={{ display: 'inline-flex', flexDirection: 'column', lineHeight: 0 }}>
      <ChevronUp className="w-2.5 h-2.5 -mb-0.5" />
      <ChevronDown className="w-2.5 h-2.5 -mt-0.5" />
    </span>
  );

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center">
              <Receipt className="w-8 h-8 text-white animate-pulse" />
            </div>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="absolute -inset-2 rounded-2xl border-2 border-slate-300 border-t-transparent" />
          </div>
          <p className="text-sm font-semibold text-slate-500">Loading Billing Module…</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-full">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shadow-sm">
              <Receipt className="w-5 h-5 text-white" />
            </div>
            Billing & Collections
            <span
              className="ml-1 px-2 py-0.5 bg-slate-200 rounded-full text-[10px] font-bold text-slate-600 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> AI-Powered
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage invoices, track payments, and generate collection statements</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setLoading(true); Promise.all([fetchAmazonOrders(), fetchCorporateInvoices()]).finally(() => setLoading(false)); }}
            className="px-3 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 flex items-center gap-2 transition-all">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </motion.div>

      {/* Section Tabs */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="flex bg-slate-100 rounded-2xl p-1.5 w-fit">
        {[
          { id: 'amazon' as const, label: 'Amazon Distribution', icon: Package, count: amazonOrders.length },
          { id: 'corporate' as const, label: 'Corporate Branding', icon: Building2, count: corporateInvoices.length },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveSection(tab.id)}
            className={`relative px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all duration-300 ${
              activeSection === tab.id ? 'text-white shadow-lg' : 'text-slate-500 hover:text-slate-700'
            }`}>
            {activeSection === tab.id && (
              <motion.div layoutId="billing-tab" className="absolute inset-0 bg-slate-800 rounded-xl" />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <tab.icon className="w-4 h-4" />
              {tab.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                activeSection === tab.id ? 'bg-white/20' : 'bg-slate-200 text-slate-500'
              }`}>{tab.count}</span>
            </span>
          </button>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        {activeSection === 'amazon' ? (
          <motion.div key="amazon" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }} className="space-y-6">
            <AmazonBillingSection
              orders={amazonOrders}
              summary={amazonSummary}
              totals={amazonTotals}
              amountDue={amountDue}
            />
          </motion.div>
        ) : (
          <motion.div key="corporate" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }} className="space-y-6">
            <CorporateBillingSection
              invoices={corporateInvoices}
              filtered={corpPageData}
              totalFiltered={filteredInvoices.length}
              kpis={corpKPIs}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              handleSort={handleSort}
              SortIcon={SortIcon}
              sortCol={sortCol}
              page={corpPage}
              setPage={setCorpPage}
              totalPages={corpTotalPages}
              salesReps={salesReps}
              showStatementModal={showStatementModal}
              setShowStatementModal={setShowStatementModal}
              selectedRep={selectedRep}
              setSelectedRep={setSelectedRep}
              allInvoices={corporateInvoices}
              customerLogoMap={customerLogoMap}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// AMAZON BILLING SECTION
// ══════════════════════════════════════════════════════════
function AmazonBillingSection({ orders, summary, totals, amountDue }: {
  orders: AmazonOrder[];
  summary: ProductSummary[];
  totals: any;
  amountDue: any;
}) {
  const [selectedDate, setSelectedDate] = useState(today.toISOString().split('T')[0]);
  const displayDate = new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // Orders due soon (within 7 days)
  const dueSoon = orders.filter(o => {
    const days = daysUntil(o.payoutDate);
    return days >= 0 && days <= 7 && !o.amazonPaid;
  });

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total Amazon Revenue" value={`$${fmt(totals.totalAmazonRevenue)}`}
          icon={DollarSign} color="bg-white border-slate-200 text-slate-800" delay={0} trend="up" />
        <KPICard label="Total Cost" value={`$${fmt(totals.totalCost)}`}
          icon={CreditCard} color="bg-white border-slate-200 text-slate-800" delay={0.05} />
        <KPICard label="Total Profit" value={`$${fmt(totals.totalProfit)}`}
          icon={TrendingUp} color="bg-white border-slate-200 text-slate-800" delay={0.1} trend="up" />
        <KPICard label="Balance Due" value={`$${fmt(amountDue.totalBalanceWithProfit)}`}
          icon={AlertTriangle} color="bg-white border-slate-200 text-slate-800" delay={0.15}
          sub={`${dueSoon.length} order${dueSoon.length !== 1 ? 's' : ''} due within 7 days`} />
      </div>

      {/* Total Amount Due Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {/* Header bar */}
        <div className="bg-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Total Amount Due on</h2>
              <p className="text-slate-400 text-xs">Cost & profit breakdown</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-white text-slate-900 px-4 py-2 rounded-xl text-base font-bold shadow-sm">
              {displayDate}
            </div>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="px-3 py-2 rounded-xl text-sm bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 cursor-pointer"
              style={{ colorScheme: 'dark' }}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-5 py-3 font-bold text-slate-600 text-xs uppercase tracking-wider whitespace-nowrap"></th>
                <th className="text-right px-5 py-3 font-bold text-slate-600 text-xs uppercase tracking-wider whitespace-nowrap">Amount</th>
                <th className="text-right px-5 py-3 font-bold text-slate-600 text-xs uppercase tracking-wider whitespace-nowrap">Total Cost</th>
                <th className="text-right px-5 py-3 font-bold text-slate-600 text-xs uppercase tracking-wider whitespace-nowrap">Cost & Profit</th>
                <th className="text-right px-5 py-3 font-bold text-slate-600 text-xs uppercase tracking-wider whitespace-nowrap">Payments</th>
                <th className="text-right px-5 py-3 font-bold text-slate-600 text-xs uppercase tracking-wider whitespace-nowrap">Balance Due</th>
                <th className="text-right px-5 py-3 font-bold text-slate-600 text-xs uppercase tracking-wider whitespace-nowrap min-w-[180px]">Total Balance Due w/ Profit</th>
                <th className="text-right px-5 py-3 font-bold text-slate-600 text-xs uppercase tracking-wider whitespace-nowrap min-w-[170px]">Total Cost Only Due</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  label: 'Product Cost',
                  amount: amountDue.productCost,
                  totalCost: amountDue.totalCostOnly,
                  costProfit: amountDue.costAndProfit,
                  payments: amountDue.payments,
                  balanceDue: amountDue.balanceDueProduct,
                  showTotalBalance: true,
                  showCostOnly: true,
                  isFirst: true,
                },
                {
                  label: 'Shipping Cost',
                  amount: amountDue.shippingCost,
                  totalCost: null,
                  costProfit: null,
                  payments: null,
                  balanceDue: amountDue.balanceDueShipping,
                  showTotalBalance: false,
                  showCostOnly: false,
                },
                {
                  label: 'AS Profit',
                  amount: amountDue.asProfit,
                  totalCost: amountDue.asProfit,
                  costProfit: null,
                  payments: null,
                  balanceDue: amountDue.balanceDueAS,
                  showTotalBalance: false,
                  showCostOnly: false,
                },
                {
                  label: 'Patrick Profit',
                  amount: amountDue.patrickProfit,
                  totalCost: amountDue.patrickProfit,
                  costProfit: amountDue.patrickProfit,
                  payments: 0,
                  balanceDue: amountDue.balanceDuePatrick,
                  showTotalBalance: false,
                  showCostOnly: false,
                },
              ].map((row, idx) => (
                <tr key={row.label}
                  className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3 font-semibold text-slate-700 whitespace-nowrap">{row.label}</td>
                  <td className="px-5 py-3 text-right font-mono font-semibold text-slate-800 whitespace-nowrap">$ {fmt(row.amount)}</td>
                  <td className="px-5 py-3 text-right font-mono font-semibold text-slate-800 whitespace-nowrap">
                    {row.totalCost !== null ? `$${fmt(row.totalCost)}` : ''}
                  </td>
                  <td className="px-5 py-3 text-right font-mono font-semibold text-slate-800 whitespace-nowrap">
                    {row.costProfit !== null ? `$${fmt(row.costProfit)}` : ''}
                  </td>
                  <td className="px-5 py-3 text-right font-mono font-semibold text-emerald-700 whitespace-nowrap">
                    {row.payments !== null ? `$ ${fmt(row.payments)}` : ''}
                  </td>
                  <td className="px-5 py-3 text-right font-mono font-semibold text-red-600 whitespace-nowrap">
                    $ {fmt(row.balanceDue)}
                  </td>
                  {row.isFirst ? (
                    <>
                      <td rowSpan={4} className="px-5 py-3 text-center align-middle">
                        <div className="inline-flex flex-col items-center bg-slate-50 border border-slate-200 rounded-xl px-6 py-4">
                          <span className="text-xs font-bold text-slate-500 mb-1">TOTAL DUE</span>
                          <span className="text-2xl font-black text-slate-900">$ {fmt(amountDue.totalBalanceWithProfit)}</span>
                        </div>
                      </td>
                      <td rowSpan={4} className="px-5 py-3 text-center align-middle">
                        <div className="inline-flex flex-col items-center gap-2">
                          <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-500 font-semibold whitespace-nowrap">
                            Product & Shipping Cost Only
                          </div>
                          <div className={`text-xl font-black ${amountDue.totalCostOnlyDue < 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            $ ({fmt(Math.abs(amountDue.totalCostOnlyDue))})
                          </div>
                          <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-500 font-semibold whitespace-nowrap">
                            Less: Payments
                          </div>
                        </div>
                      </td>
                    </>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Product Summary Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm bg-white">
        <div className="bg-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-base font-bold text-white">Amazon Product Revenue Summary</h3>
            <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full font-semibold">{summary.length} products</span>
          </div>
          <button className="text-xs text-white/70 hover:text-white flex items-center gap-1.5 transition-colors">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-2.5 font-bold text-slate-600 uppercase tracking-wider sticky left-0 bg-slate-50 z-10 min-w-[200px] whitespace-nowrap">Product Name</th>
                <th className="text-right px-3 py-2.5 font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Qty Sold</th>
                <th className="text-right px-3 py-2.5 font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Amazon Product Rev</th>
                <th className="text-right px-3 py-2.5 font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Amazon Shipping Rev</th>
                <th className="text-right px-3 py-2.5 font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Total Amazon Rev</th>
                <th className="text-right px-3 py-2.5 font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Product Cost</th>
                <th className="text-right px-3 py-2.5 font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Shipping Cost</th>
                <th className="text-right px-3 py-2.5 font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Total Cost</th>
                <th className="text-right px-3 py-2.5 font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Product Profit</th>
                <th className="text-right px-3 py-2.5 font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Shipping Profit</th>
                <th className="text-right px-3 py-2.5 font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Total Profit</th>
                <th className="text-right px-3 py-2.5 font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">IPF Profit</th>
                <th className="text-right px-3 py-2.5 font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">AS Profit</th>
              </tr>
            </thead>
            <tbody>
              {summary.map((p, idx) => (
                <tr key={p.productName}
                  className={`border-b border-slate-100 hover:bg-slate-50/50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                  <td className="px-4 py-2 font-semibold text-slate-800 sticky left-0 z-10 whitespace-nowrap" style={{ backgroundColor: idx % 2 === 0 ? '#fff' : '#f8fafc' }}>{p.productName}</td>
                  <td className="px-3 py-2 text-right font-mono text-slate-700 whitespace-nowrap">{fmtInt(p.quantitySold)}</td>
                  <td className="px-3 py-2 text-right font-mono text-slate-700 whitespace-nowrap">$ {fmt(p.amazonProductRevenue)}</td>
                  <td className="px-3 py-2 text-right font-mono text-slate-700 whitespace-nowrap">$ {fmt(p.amazonShippingRevenue)}</td>
                  <td className="px-3 py-2 text-right font-mono font-bold text-slate-800 whitespace-nowrap">$ {fmt(p.totalAmazonRevenue)}</td>
                  <td className="px-3 py-2 text-right font-mono text-slate-700 whitespace-nowrap">$ {fmt(p.productCost)}</td>
                  <td className="px-3 py-2 text-right font-mono text-slate-700 whitespace-nowrap">$ {fmt(p.shippingCost)}</td>
                  <td className="px-3 py-2 text-right font-mono font-bold text-slate-800 whitespace-nowrap">$ {fmt(p.totalCost)}</td>
                  <td className={`px-3 py-2 text-right font-mono whitespace-nowrap ${p.productProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {p.productProfit < 0 ? `(${fmt(Math.abs(p.productProfit))})` : `$ ${fmt(p.productProfit)}`}
                  </td>
                  <td className={`px-3 py-2 text-right font-mono whitespace-nowrap ${p.shippingProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {p.shippingProfit < 0 ? `(${fmt(Math.abs(p.shippingProfit))})` : `$ ${fmt(p.shippingProfit)}`}
                  </td>
                  <td className={`px-3 py-2 text-right font-mono font-bold whitespace-nowrap ${p.totalProfit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                    $ {fmt(p.totalProfit)}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-slate-700 whitespace-nowrap">$ {fmt(p.ipfProfit)}</td>
                  <td className="px-3 py-2 text-right font-mono text-slate-700 whitespace-nowrap">$ {fmt(p.activateSwagProfit)}</td>
                </tr>
              ))}
            </tbody>
            {/* Totals row */}
            <tfoot>
              <tr className="bg-slate-800 text-white font-bold">
                <td className="px-4 py-3 sticky left-0 z-10 font-black uppercase text-xs tracking-wider whitespace-nowrap" style={{ backgroundColor: '#1e293b' }}>Totals</td>
                <td className="px-3 py-3 text-right font-mono whitespace-nowrap">{fmtInt(totals.quantitySold)}</td>
                <td className="px-3 py-3 text-right font-mono whitespace-nowrap">$ {fmt(totals.amazonProductRevenue)}</td>
                <td className="px-3 py-3 text-right font-mono whitespace-nowrap">$ {fmt(totals.amazonShippingRevenue)}</td>
                <td className="px-3 py-3 text-right font-mono whitespace-nowrap">$ {fmt(totals.totalAmazonRevenue)}</td>
                <td className="px-3 py-3 text-right font-mono whitespace-nowrap">$ {fmt(totals.productCost)}</td>
                <td className="px-3 py-3 text-right font-mono whitespace-nowrap">$ {fmt(totals.shippingCost)}</td>
                <td className="px-3 py-3 text-right font-mono whitespace-nowrap">$ {fmt(totals.totalCost)}</td>
                <td className="px-3 py-3 text-right font-mono whitespace-nowrap">$ {fmt(totals.productProfit)}</td>
                <td className="px-3 py-3 text-right font-mono whitespace-nowrap">$ {fmt(totals.shippingProfit)}</td>
                <td className="px-3 py-3 text-right font-mono whitespace-nowrap">$ {fmt(totals.totalProfit)}</td>
                <td className="px-3 py-3 text-right font-mono whitespace-nowrap">$ {fmt(totals.ipfProfit)}</td>
                <td className="px-3 py-3 text-right font-mono whitespace-nowrap">$ {fmt(totals.activateSwagProfit)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </motion.div>

      {/* Payout Timeline */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Upcoming Payouts</h3>
          <span className="text-xs text-slate-400">Profit due 90 days after delivery</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Due This Week', range: [0, 7], color: 'red' },
            { label: 'Due in 30 Days', range: [0, 30], color: 'amber' },
            { label: 'Due in 90 Days', range: [0, 90], color: 'slate' },
          ].map(bucket => {
            const matching = orders.filter(o => {
              if (o.amazonPaid) return false;
              const d = daysUntil(o.payoutDate);
              return d >= bucket.range[0] && d <= bucket.range[1];
            });
            const total = matching.reduce((s, o) => s + (o.totalProfit || 0), 0);
            return (
              <div key={bucket.label}
                className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{bucket.label}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    bucket.color === 'red' ? 'bg-red-100 text-red-700' :
                    bucket.color === 'amber' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>{matching.length} orders</span>
                </div>
                <p className="text-xl font-black text-slate-900">${fmt(total)}</p>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// CORPORATE BRANDING BILLING SECTION
// ══════════════════════════════════════════════════════════
function CorporateBillingSection({ invoices, filtered, totalFiltered, kpis, searchQuery, setSearchQuery,
  statusFilter, setStatusFilter, handleSort, SortIcon, sortCol, page, setPage, totalPages, salesReps,
  showStatementModal, setShowStatementModal, selectedRep, setSelectedRep, allInvoices, customerLogoMap = {} }: any) {

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total Outstanding" value={`$${fmt(kpis.totalOutstanding)}`}
          icon={DollarSign} color="bg-white border-slate-200 text-slate-800" delay={0} />
        <KPICard label="Open Invoices" value={`${kpis.openCount}`}
          icon={FileText} color="bg-white border-slate-200 text-slate-800" delay={0.05}
          sub={`$${fmt(kpis.openAmount)}`} />
        <KPICard label="Past Due" value={`${kpis.pastDueCount}`}
          icon={AlertTriangle} color="bg-white border-slate-200 text-slate-800" delay={0.1}
          sub={`$${fmt(kpis.pastDueAmount)}`} trend="down" />
        <KPICard label="Collection Rate" value={`${kpis.collectionRate.toFixed(1)}%`}
          icon={TrendingUp} color="bg-white border-slate-200 text-slate-800" delay={0.15}
          sub={`$${fmt(kpis.paidAmount)} collected`} trend="up" />
      </div>

      {/* AI Insights */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-slate-800 mb-1.5">AI Collection Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {kpis.pastDueCount > 0 && (
                <div className="flex items-start gap-2 bg-white rounded-xl p-3 border border-slate-200">
                  <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-slate-700"><strong>{kpis.pastDueCount} invoices</strong> are past due totaling <strong>${fmt(kpis.pastDueAmount)}</strong>. Consider sending collection statements.</p>
                </div>
              )}
              <div className="flex items-start gap-2 bg-white rounded-xl p-3 border border-slate-200">
                <Zap className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-xs text-slate-700">Collection rate is at <strong>{kpis.collectionRate.toFixed(1)}%</strong>. {kpis.collectionRate > 50 ? 'Good progress!' : 'Needs attention.'}</p>
              </div>
              <div className="flex items-start gap-2 bg-white rounded-xl p-3 border border-slate-200">
                <Mail className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                <p className="text-xs text-slate-700">Generate statements for your sales reps to accelerate collections across all accounts.</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Toolbar */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
        className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
            placeholder="Search invoices, customers, reps…"
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-200 focus:border-slate-400 outline-none transition-all" />
        </div>
        <div className="flex gap-1.5 bg-slate-100 rounded-xl p-1">
          {['all', 'open', 'past_due', 'partial', 'paid'].map(s => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                statusFilter === s ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
              }`}>
              {s === 'all' ? 'All' : getStatusLabel(s)}
            </button>
          ))}
        </div>
        <button onClick={() => setShowStatementModal(true)}
          className="px-4 py-2.5 text-sm font-bold bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-all flex items-center gap-2">
          <Send className="w-4 h-4" /> Generate Statement
        </button>
      </motion.div>

      {/* Invoice Table */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {[
                  { key: 'invoiceNumber', label: 'Invoice #' },
                  { key: 'customer', label: 'Customer' },
                  { key: 'salesRep', label: 'Sales Rep' },
                  { key: 'items', label: 'Items' },
                  { key: 'amount', label: 'Amount' },
                  { key: 'amountPaid', label: 'Paid' },
                  { key: 'issueDate', label: 'Issue Date' },
                  { key: 'dueDate', label: 'Due Date' },
                  { key: 'status', label: 'Status' },
                ].map(col => (
                  <th key={col.key} onClick={() => handleSort(col.key)}
                    className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider cursor-pointer hover:text-slate-900 select-none whitespace-nowrap">
                    <span className="flex items-center gap-1">
                      {col.label}
                      <SortIcon col={col.key} />
                    </span>
                  </th>
                ))}
                <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv: CorporateInvoice, idx: number) => {
                const overdueDays = inv.status === 'past_due' ? Math.abs(daysUntil(inv.dueDate)) : 0;
                return (
                  <motion.tr key={inv.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.02 }}
                    className={`border-b border-slate-100 hover:bg-slate-50/50 transition-colors ${idx % 2 === 0 ? '' : 'bg-slate-50/30'}`}>
                    <td className="px-4 py-2.5 font-mono font-semibold text-slate-700 whitespace-nowrap">{inv.invoiceNumber}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                       <div className="flex items-center gap-2 min-w-0">
                         {customerLogoMap[(inv.customer || '').trim().toLowerCase()] ? (
                           <div className="w-8 h-7 rounded-md flex items-center justify-center overflow-hidden border border-slate-200 bg-white shrink-0">
                             <img
                               src={customerLogoMap[(inv.customer || '').trim().toLowerCase()]}
                               alt={inv.customer}
                               className="max-w-full max-h-full object-contain p-0.5"
                             />
                           </div>
                         ) : (
                           <div className="w-8 h-7 rounded-md bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center shrink-0">
                             <span className="text-[10px] font-bold text-white">
                               {(inv.customer || '?').charAt(0).toUpperCase()}
                             </span>
                           </div>
                         )}
                         <span className="font-semibold text-slate-800 truncate">{inv.customer}</span>
                       </div>
                     </td>
                    <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap">{inv.salesRep}</td>
                    <td className="px-4 py-2.5 text-slate-500 text-xs whitespace-nowrap">{inv.items}</td>
                    <td className="px-4 py-2.5 font-mono font-bold text-slate-800 whitespace-nowrap">${fmt(inv.amount)}</td>
                    <td className="px-4 py-2.5 font-mono text-emerald-600 whitespace-nowrap">${fmt(inv.amountPaid)}</td>
                    <td className="px-4 py-2.5 text-slate-500 text-xs whitespace-nowrap">{inv.issueDate}</td>
                    <td className="px-4 py-2.5 text-xs whitespace-nowrap">
                      <span className={overdueDays > 0 ? 'text-red-600 font-bold' : 'text-slate-500'}>
                        {inv.dueDate}
                        {overdueDays > 0 && <span className="ml-1 text-[10px]">({overdueDays}d late)</span>}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${getStatusColor(inv.status)}`}>
                        {inv.status === 'paid' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                        {inv.status === 'past_due' && <AlertTriangle className="w-3 h-3 mr-1" />}
                        {inv.status === 'open' && <Clock className="w-3 h-3 mr-1" />}
                        {getStatusLabel(inv.status)}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all" title="View">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all" title="Send Reminder">
                          <Mail className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all" title="Download">
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-slate-400">
                    <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="font-semibold">No invoices found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/50">
            <p className="text-xs text-slate-500">
              Showing {(page - 1) * 15 + 1}–{Math.min(page * 15, totalFiltered)} of {totalFiltered}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white disabled:opacity-30 transition-all">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = page <= 3 ? i + 1 : page + i - 2;
                if (p < 1 || p > totalPages) return null;
                return (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-8 h-8 text-xs font-bold rounded-lg transition-all ${
                      p === page ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:bg-white hover:text-slate-800'
                    }`}>{p}</button>
                );
              })}
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white disabled:opacity-30 transition-all">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Statement Generator Modal */}
      <AnimatePresence>
        {showStatementModal && (
          <StatementModal
            salesReps={salesReps}
            selectedRep={selectedRep}
            setSelectedRep={setSelectedRep}
            invoices={allInvoices}
            onClose={() => setShowStatementModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// STATEMENT GENERATOR MODAL
// ══════════════════════════════════════════════════════════
function StatementModal({ salesReps, selectedRep, setSelectedRep, invoices, onClose }: {
  salesReps: string[]; selectedRep: string; setSelectedRep: (r: string) => void;
  invoices: CorporateInvoice[]; onClose: () => void;
}) {
  const repInvoices = invoices.filter(i => (!selectedRep || i.salesRep === selectedRep) && i.status !== 'paid');
  const totalOwed = repInvoices.reduce((s, i) => s + (i.amount - i.amountPaid), 0);
  const pastDueCount = repInvoices.filter(i => i.status === 'past_due').length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Send className="w-5 h-5 text-white" />
            <h2 className="text-lg font-bold text-white">Generate Collection Statement</h2>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 block">Sales Rep / Account Manager</label>
            <select value={selectedRep} onChange={e => setSelectedRep(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-200 focus:border-slate-400 outline-none">
              <option value="">All Reps</option>
              {salesReps.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
              <p className="text-[10px] font-bold text-slate-500 uppercase">Outstanding</p>
              <p className="text-lg font-black text-slate-800">${fmt(totalOwed)}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
              <p className="text-[10px] font-bold text-slate-500 uppercase">Invoices</p>
              <p className="text-lg font-black text-slate-800">{repInvoices.length}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
              <p className="text-[10px] font-bold text-slate-500 uppercase">Past Due</p>
              <p className="text-lg font-black text-slate-800">{pastDueCount}</p>
            </div>
          </div>

          {repInvoices.length > 0 && (
            <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left font-bold text-slate-600">Invoice</th>
                    <th className="px-3 py-2 text-left font-bold text-slate-600">Customer</th>
                    <th className="px-3 py-2 text-right font-bold text-slate-600">Balance</th>
                    <th className="px-3 py-2 text-left font-bold text-slate-600">Due</th>
                    <th className="px-3 py-2 text-left font-bold text-slate-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {repInvoices.map(inv => (
                    <tr key={inv.id} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="px-3 py-2 font-mono font-semibold text-slate-700">{inv.invoiceNumber}</td>
                      <td className="px-3 py-2 text-slate-700">{inv.customer}</td>
                      <td className="px-3 py-2 text-right font-mono font-bold text-slate-800">${fmt(inv.amount - inv.amountPaid)}</td>
                      <td className="px-3 py-2 text-slate-500">{inv.dueDate}</td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(inv.status)}`}>
                          {getStatusLabel(inv.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={onClose}
              className="px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all">
              Cancel
            </button>
            <button onClick={() => { toast.success('Statement generated and ready to send!'); onClose(); }}
              className="px-6 py-2.5 text-sm font-bold bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-all flex items-center gap-2">
              <Printer className="w-4 h-4" /> Generate & Send
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
