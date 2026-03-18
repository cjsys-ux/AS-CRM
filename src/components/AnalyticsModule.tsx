import { motion } from 'motion/react';
import { BarChart3, TrendingUp, DollarSign, ShoppingBag, Users, Package, ArrowUpRight, ArrowDownRight, Download, Calendar } from 'lucide-react';
import { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

// Sample data for charts
const revenueData = [
  { month: 'Jan', revenue: 45000, orders: 120, profit: 18000 },
  { month: 'Feb', revenue: 52000, orders: 145, profit: 21000 },
  { month: 'Mar', revenue: 48000, orders: 130, profit: 19500 },
  { month: 'Apr', revenue: 61000, orders: 168, profit: 25000 },
  { month: 'May', revenue: 55000, orders: 152, profit: 22500 },
  { month: 'Jun', revenue: 67000, orders: 185, profit: 28000 },
  { month: 'Jul', revenue: 72000, orders: 198, profit: 30000 },
  { month: 'Aug', revenue: 68000, orders: 182, profit: 28500 },
  { month: 'Sep', revenue: 78000, orders: 215, profit: 33000 },
  { month: 'Oct', revenue: 82000, orders: 228, profit: 35000 },
  { month: 'Nov', revenue: 88000, orders: 242, profit: 37500 },
  { month: 'Dec', revenue: 95000, orders: 265, profit: 41000 },
];

const categoryData = [
  { category: 'Apparel', sales: 125000, orders: 450 },
  { category: 'Drinkware', sales: 98000, orders: 380 },
  { category: 'Tech', sales: 145000, orders: 290 },
  { category: 'Bags', sales: 87000, orders: 320 },
  { category: 'Office', sales: 76000, orders: 410 },
];

const topProductsData = [
  { product: 'Premium T-Shirt', revenue: 45000, units: 1250 },
  { product: 'Steel Bottle', revenue: 38000, units: 890 },
  { product: 'Wireless Charger', revenue: 35000, units: 620 },
  { product: 'Canvas Tote', revenue: 28000, units: 980 },
  { product: 'Bluetooth Speaker', revenue: 32000, units: 550 },
];

const orderStatusData = [
  { name: 'Completed', value: 65, color: '#10b981' },
  { name: 'In Progress', value: 25, color: '#3b82f6' },
  { name: 'Pending', value: 7, color: '#f59e0b' },
  { name: 'Cancelled', value: 3, color: '#ef4444' },
];

const customerAcquisitionData = [
  { month: 'Jan', customers: 45 },
  { month: 'Feb', customers: 52 },
  { month: 'Mar', customers: 48 },
  { month: 'Apr', customers: 61 },
  { month: 'May', customers: 58 },
  { month: 'Jun', customers: 72 },
  { month: 'Jul', customers: 78 },
  { month: 'Aug', customers: 68 },
  { month: 'Sep', customers: 85 },
  { month: 'Oct', customers: 92 },
  { month: 'Nov', customers: 88 },
  { month: 'Dec', customers: 105 },
];

const regionalData = [
  { region: 'North America', revenue: 285000 },
  { region: 'Europe', revenue: 198000 },
  { region: 'Asia Pacific', revenue: 145000 },
  { region: 'Latin America', revenue: 87000 },
  { region: 'Middle East', revenue: 56000 },
];

export function AnalyticsModule() {
  const [timeRange, setTimeRange] = useState('12M');

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl p-3 shadow-xl">
          <p className="text-sm font-semibold text-slate-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs text-slate-600">
              <span className="font-medium" style={{ color: entry.color }}>
                {entry.name}:
              </span>{' '}
              {entry.name.includes('Revenue') || entry.name.includes('Profit')
                ? `$${entry.value.toLocaleString()}`
                : entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50/50 overflow-hidden">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 px-8 py-8">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-slate-700 rounded-2xl flex items-center justify-center">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-1">Analytics Dashboard</h1>
                <p className="text-slate-500 text-sm">Performance Metrics & Business Insights</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-xl px-4 py-2">
                <Calendar className="w-5 h-5 text-slate-500" />
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="bg-transparent text-slate-700 text-sm font-medium focus:outline-none cursor-pointer"
                >
                  <option value="7D">Last 7 Days</option>
                  <option value="1M">Last Month</option>
                  <option value="3M">Last 3 Months</option>
                  <option value="6M">Last 6 Months</option>
                  <option value="12M">Last 12 Months</option>
                  <option value="YTD">Year to Date</option>
                </select>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-5 py-3 bg-white text-slate-700 font-semibold rounded-xl border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all"
              >
                <Download className="w-5 h-5" />
                Export Report
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="px-8 mt-6 mb-6">
        <div className="max-w-[1800px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-1 text-green-600 text-sm font-semibold">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>12.5%</span>
                </div>
              </div>
              <div className="text-sm text-slate-500 mb-1">Total Revenue</div>
              <div className="text-3xl font-bold text-slate-900 mb-1">$811,000</div>
              <div className="text-xs text-slate-500">+$89,000 from last period</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-1 text-green-600 text-sm font-semibold">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>8.2%</span>
                </div>
              </div>
              <div className="text-sm text-slate-500 mb-1">Total Orders</div>
              <div className="text-3xl font-bold text-slate-900 mb-1">2,280</div>
              <div className="text-xs text-slate-500">+172 from last period</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-1 text-green-600 text-sm font-semibold">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>15.3%</span>
                </div>
              </div>
              <div className="text-sm text-slate-500 mb-1">New Customers</div>
              <div className="text-3xl font-bold text-slate-900 mb-1">852</div>
              <div className="text-xs text-slate-500">+113 from last period</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-1 text-red-600 text-sm font-semibold">
                  <ArrowDownRight className="w-4 h-4" />
                  <span>2.1%</span>
                </div>
              </div>
              <div className="text-sm text-slate-500 mb-1">Avg Order Value</div>
              <div className="text-3xl font-bold text-slate-900 mb-1">$356</div>
              <div className="text-xs text-slate-500">-$8 from last period</div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="flex-1 px-8 pb-8 overflow-auto">
        <div className="max-w-[1800px] mx-auto space-y-6">
          {/* Revenue & Orders Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Revenue & Profit Trend</h3>
                <p className="text-sm text-slate-500">Monthly performance over the last year</p>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-violet-500"></div>
                  <span className="text-sm text-slate-600">Revenue</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm text-slate-600">Profit</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid key="ana-rev-grid" strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis key="ana-rev-x" dataKey="month" stroke="#64748b" style={{ fontSize: '12px' }} />
                <YAxis key="ana-rev-y" stroke="#64748b" style={{ fontSize: '12px' }} />
                <Tooltip key="ana-rev-tip" content={<CustomTooltip />} />
                <Area key="ana-rev-fill" type="monotone" dataKey="revenue" name="Revenue Fill" stroke="transparent" fill="url(#revenueGradient)" legendType="none" />
                <Area key="ana-profit-fill" type="monotone" dataKey="profit" name="Profit Fill" stroke="transparent" fill="url(#profitGradient)" legendType="none" />
                <Line key="ana-rev-line" type="monotone" dataKey="revenue" name="Revenue" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', r: 4 }} />
                <Line key="ana-profit-line" type="monotone" dataKey="profit" name="Profit" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Sales by Category & Top Products */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg"
            >
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900 mb-1">Sales by Category</h3>
                <p className="text-sm text-slate-500">Revenue breakdown by product category</p>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                  <defs>
                    <linearGradient id="categoryBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.9} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid key="ana-cat-grid" strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis key="ana-cat-x" dataKey="category" stroke="#64748b" style={{ fontSize: '12px' }} />
                  <YAxis key="ana-cat-y" stroke="#64748b" style={{ fontSize: '12px' }} />
                  <Tooltip key="ana-cat-tip" content={<CustomTooltip />} />
                  <Bar key="ana-cat-bar" dataKey="sales" fill="url(#categoryBar)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg"
            >
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900 mb-1">Top Products</h3>
                <p className="text-sm text-slate-500">Best performing products by revenue</p>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topProductsData} layout="vertical">
                  <defs>
                    <linearGradient id="productBar" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.9} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid key="ana-prod-grid" strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis key="ana-prod-x" type="number" stroke="#64748b" style={{ fontSize: '12px' }} />
                  <YAxis key="ana-prod-y" dataKey="product" type="category" stroke="#64748b" style={{ fontSize: '12px' }} width={120} />
                  <Tooltip key="ana-prod-tip" content={<CustomTooltip />} />
                  <Bar key="ana-prod-bar" dataKey="revenue" fill="url(#productBar)" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Order Status & Customer Acquisition */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg"
            >
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900 mb-1">Order Status Distribution</h3>
                <p className="text-sm text-slate-500">Current order status breakdown</p>
              </div>
              <div className="flex items-center justify-between">
                <ResponsiveContainer width="50%" height={250}>
                  <PieChart>
                    <Pie
                      data={orderStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {orderStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-3">
                  {orderStatusData.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{item.name}</div>
                        <div className="text-xs text-slate-500">{item.value}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg"
            >
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900 mb-1">Customer Acquisition</h3>
                <p className="text-sm text-slate-500">New customers added each month</p>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={customerAcquisitionData}>
                  <defs>
                    <linearGradient id="customerGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid key="ana-cust-grid" strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis key="ana-cust-x" dataKey="month" stroke="#64748b" style={{ fontSize: '12px' }} />
                  <YAxis key="ana-cust-y" stroke="#64748b" style={{ fontSize: '12px' }} />
                  <Tooltip key="ana-cust-tip" content={<CustomTooltip />} />
                  <Area
                    key="ana-cust-area"
                    type="monotone"
                    dataKey="customers"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    fill="url(#customerGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Regional Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg"
          >
            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-900 mb-1">Regional Performance</h3>
              <p className="text-sm text-slate-500">Revenue by geographic region</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={regionalData}>
                <defs>
                  <linearGradient id="regionalBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.9} />
                  </linearGradient>
                </defs>
                <CartesianGrid key="ana-reg-grid" strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis key="ana-reg-x" dataKey="region" stroke="#64748b" style={{ fontSize: '12px' }} />
                <YAxis key="ana-reg-y" stroke="#64748b" style={{ fontSize: '12px' }} />
                <Tooltip key="ana-reg-tip" content={<CustomTooltip />} />
                <Bar key="ana-reg-bar" dataKey="revenue" fill="url(#regionalBar)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </div>
    </div>
  );
}