import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Truck, Package, Users, BarChart3, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';

const revenueData = [
  { month: 'Jan', value: 45000, orders: 120 },
  { month: 'Feb', value: 52000, orders: 145 },
  { month: 'Mar', value: 48000, orders: 132 },
  { month: 'Apr', value: 61000, orders: 168 },
  { month: 'May', value: 55000, orders: 152 },
  { month: 'Jun', value: 68000, orders: 189 },
];

const orderStatusData = [
  { name: 'Pending', value: 45, color: '#f59e0b' },
  { name: 'Processing', value: 32, color: '#3b82f6' },
  { name: 'Shipped', value: 28, color: '#8b5cf6' },
  { name: 'Delivered', value: 95, color: '#10b981' },
];

const activityData = [
  { time: '00:00', orders: 5 },
  { time: '04:00', orders: 8 },
  { time: '08:00', orders: 25 },
  { time: '12:00', orders: 42 },
  { time: '16:00', orders: 38 },
  { time: '20:00', orders: 18 },
  { time: '23:59', orders: 12 },
];

export function Dashboard() {
  const stats = [
    {
      title: 'Total Revenue',
      value: '$68,500',
      change: '+12.5%',
      subtitle: 'vs last month',
      trend: 'up',
      icon: DollarSign,
      bgColor: 'from-blue-500 to-blue-600',
      lightBg: 'bg-blue-50',
    },
    {
      title: 'Total Orders',
      value: '189',
      change: '+8.3%',
      subtitle: 'vs last month',
      trend: 'up',
      icon: ShoppingCart,
      bgColor: 'from-emerald-500 to-emerald-600',
      lightBg: 'bg-emerald-50',
    },
    {
      title: 'Active Shipments',
      value: '28',
      change: '+3.2%',
      subtitle: 'in transit',
      trend: 'up',
      icon: Truck,
      bgColor: 'from-purple-500 to-purple-600',
      lightBg: 'bg-purple-50',
    },
    {
      title: 'Products',
      value: '24',
      change: '+15.7%',
      subtitle: 'in pipeline',
      trend: 'up',
      icon: Package,
      bgColor: 'from-orange-500 to-orange-600',
      lightBg: 'bg-orange-50',
    },
    {
      title: 'Active Customers',
      value: '342',
      change: '+5.4%',
      subtitle: 'this month',
      trend: 'up',
      icon: Users,
      bgColor: 'from-pink-500 to-pink-600',
      lightBg: 'bg-pink-50',
    },
    {
      title: 'Avg Order Value',
      value: '$362',
      change: '-2.1%',
      subtitle: 'vs last month',
      trend: 'down',
      icon: BarChart3,
      bgColor: 'from-cyan-500 to-cyan-600',
      lightBg: 'bg-cyan-50',
    },
  ];

  return (
    <div className="flex-1 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h2>
            <p className="text-slate-600">
              Real-time overview of your supply chain operations
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
              <option>Last 30 days</option>
              <option>Last 7 days</option>
              <option>Last 90 days</option>
            </select>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`${stat.lightBg} rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-shadow`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">
                      {stat.title}
                    </p>
                    <h3 className="text-3xl font-bold text-slate-900">
                      {stat.value}
                    </h3>
                    {stat.subtitle && (
                      <p className="text-sm text-slate-600 mt-1">{stat.subtitle}</p>
                    )}
                  </div>
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                {stat.change && (
                  <div className="flex items-center gap-1">
                    {stat.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {stat.change}
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl border border-slate-200 p-6"
          >
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Revenue Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fill="url(#colorRevenue)"
                  dot={{ fill: '#3b82f6', r: 4 }}
                />
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Order Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl border border-slate-200 p-6"
          >
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Order Status
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={orderStatusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                  }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {orderStatusData.map((entry, index) => (
                    <rect key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl border border-slate-200 p-6"
          >
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Activity
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="orders"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fill="url(#colorActivity)"
                  dot={{ fill: '#3b82f6', r: 4 }}
                />
                <defs>
                  <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </div>
    </div>
  );
}