import { motion } from 'motion/react';
import { useState } from 'react';
import { Plus, Calendar, Eye, Trash2, Image as ImageIcon } from 'lucide-react';

interface AmazonOrder {
  id: string;
  image?: string;
  activateSwagInvoice: string;
  orderDate: string;
  deliveryDate: string;
  productName: string;
  amazonPO: string;
  sizes: {
    xs: number;
    s: number;
    m: number;
    l: number;
    xl: number;
    xxl: number;
    xxxl: number;
    xxxxl: number;
    xxxxxl: number;
  };
  totalQty: number;
  amazonPPU: number;
  amazonProductRevenue: number;
  amazonShippingRevenue: number;
  totalAmazonRevenue: number;
  productCostPPU: number;
  totalProductCost: number;
  shippingCost: number;
  totalCost: number;
  totalProfit: number;
  gpMargin: number;
  ipfProfit: number;
  activateProfit: number;
  activateProductRev: number;
  activateShippingRev: number;
  payoutDate: string;
  amazonPaid: boolean;
}

export function AmazonDistributionModule() {
  const [activeTab, setActiveTab] = useState<'orders' | 'analytics'>('orders');
  const [selectedProduct, setSelectedProduct] = useState('all');
  const [timeFilter, setTimeFilter] = useState<'year' | 'month' | 'custom'>('year');
  const [selectedYear, setSelectedYear] = useState('all');

  // Sample data
  const [orders] = useState<AmazonOrder[]>([
    {
      id: '1',
      activateSwagInvoice: '14248',
      orderDate: '09/29/2024',
      deliveryDate: '09/29/2024',
      productName: 'Thermal Blankets',
      amazonPO: '2D-14H08671',
      sizes: { xs: 0, s: 0, m: 0, l: 0, xl: 0, xxl: 0, xxxl: 0, xxxxl: 0, xxxxxl: 0 },
      totalQty: 0,
      amazonPPU: 9.90,
      amazonProductRevenue: 990.00,
      amazonShippingRevenue: 830.30,
      totalAmazonRevenue: 1820.30,
      productCostPPU: 206.83,
      totalProductCost: 206.83,
      shippingCost: 998.37,
      totalCost: 1205.00,
      totalProfit: 579.92,
      gpMargin: 31.86,
      ipfProfit: 289.96,
      activateProfit: 289.96,
      activateProductRev: 206.61,
      activateShippingRev: 1248.35,
      payoutDate: '2024-12-28',
      amazonPaid: true,
    },
    {
      id: '2',
      activateSwagInvoice: '14248',
      orderDate: '09/29/2024',
      deliveryDate: '09/29/2024',
      productName: 'Thermal Blankets',
      amazonPO: '2D-14H08192',
      sizes: { xs: 0, s: 0, m: 0, l: 0, xl: 0, xxl: 0, xxxl: 0, xxxxl: 0, xxxxxl: 0 },
      totalQty: 0,
      amazonPPU: 9.90,
      amazonProductRevenue: 891.00,
      amazonShippingRevenue: 830.30,
      totalAmazonRevenue: 1721.30,
      productCostPPU: 186.03,
      totalProductCost: 186.03,
      shippingCost: 891,
      totalCost: 1077.03,
      totalProfit: 509.76,
      gpMargin: 29.61,
      ipfProfit: 254.88,
      activateProfit: 254.88,
      activateProductRev: 238.47,
      activateShippingRev: 1093.44,
      payoutDate: '2024-12-28',
      amazonPaid: false,
    },
    {
      id: '3',
      activateSwagInvoice: '14248',
      orderDate: '09/29/2024',
      deliveryDate: '09/29/2024',
      productName: 'Thermal Blankets',
      amazonPO: '2D-14548570',
      sizes: { xs: 0, s: 0, m: 0, l: 0, xl: 0, xxl: 0, xxxl: 0, xxxxl: 0, xxxxxl: 0 },
      totalQty: 0,
      amazonPPU: 9.90,
      amazonProductRevenue: 11325.60,
      amazonShippingRevenue: 6881.30,
      totalAmazonRevenue: 18206.90,
      productCostPPU: 1193.11,
      totalProductCost: 1193.11,
      shippingCost: 11331.60,
      totalCost: 12524.71,
      totalProfit: 5557.01,
      gpMargin: 30.52,
      ipfProfit: 2778.51,
      activateProfit: 2778.51,
      activateProductRev: 1587.03,
      activateShippingRev: 13636.18,
      payoutDate: '2024-12-28',
      amazonPaid: true,
    },
  ]);

  return (
    <div className="h-full flex flex-col bg-slate-100">
      {/* Header */}
      {/* ui-qa-fixer: UI-2026-020 - responsive padding + flex-wrap for mobile header */}
      <div className="bg-white border-b border-slate-200 px-4 md:px-8 py-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">Amazon Distribution</h1>
            <p className="text-sm text-slate-500">Track Amazon orders, inventory, and profitability across all products</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Time Filter Buttons */}
            <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setTimeFilter('year')}
                className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                  timeFilter === 'year'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Year
              </button>
              <button
                onClick={() => setTimeFilter('month')}
                className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                  timeFilter === 'month'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setTimeFilter('custom')}
                className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                  timeFilter === 'custom'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Custom
              </button>
            </div>

            {/* Year Selector */}
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg">
              <Calendar className="w-4 h-4 text-slate-500" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-transparent text-sm font-medium text-slate-700 focus:outline-none"
              >
                <option value="all">All Years</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
              </select>
            </div>

            {/* Add Product Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </motion.button>
          </div>
        </div>

        {/* Product Filter */}
        <div className="mt-6 flex items-center gap-3">
          <label className="text-sm font-semibold text-slate-700">Select Product:</label>
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Products</option>
            <option value="thermal-blankets">Thermal Blankets</option>
            <option value="hoodies">Hoodies</option>
            <option value="tshirts">T-Shirts</option>
          </select>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex items-center gap-1 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-3 text-sm font-semibold transition-colors relative ${
              activeTab === 'orders'
                ? 'text-slate-900'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Orders
            {activeTab === 'orders' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-6 py-3 text-sm font-semibold transition-colors relative ${
              activeTab === 'analytics'
                ? 'text-slate-900'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Analytics
            {activeTab === 'analytics' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
              />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      {/* ui-qa-fixer: UI-2026-020 - responsive padding */}
      <div className="flex-1 overflow-auto px-4 md:px-8 py-6">
        {activeTab === 'orders' && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap sticky left-0 bg-slate-900 z-10">
                      <input type="checkbox" className="rounded" />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap sticky left-12 bg-slate-900 z-10">Image</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap">Activate Swag Invoice</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap">Order Date</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap">Delivery Date</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap">Product Name</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap">Amazon PO</th>
                    <th className="px-4 py-3 text-center text-xs font-bold uppercase whitespace-nowrap bg-slate-800">XS</th>
                    <th className="px-4 py-3 text-center text-xs font-bold uppercase whitespace-nowrap bg-slate-700">S</th>
                    <th className="px-4 py-3 text-center text-xs font-bold uppercase whitespace-nowrap bg-slate-600">M</th>
                    <th className="px-4 py-3 text-center text-xs font-bold uppercase whitespace-nowrap bg-slate-700">L</th>
                    <th className="px-4 py-3 text-center text-xs font-bold uppercase whitespace-nowrap bg-slate-800">XL</th>
                    <th className="px-4 py-3 text-center text-xs font-bold uppercase whitespace-nowrap bg-slate-900">2XL</th>
                    <th className="px-4 py-3 text-center text-xs font-bold uppercase whitespace-nowrap bg-slate-800">3XL</th>
                    <th className="px-4 py-3 text-center text-xs font-bold uppercase whitespace-nowrap bg-slate-700">4XL</th>
                    <th className="px-4 py-3 text-center text-xs font-bold uppercase whitespace-nowrap bg-slate-600">5XL</th>
                    <th className="px-4 py-3 text-center text-xs font-bold uppercase whitespace-nowrap bg-blue-700">Total Qty</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap bg-green-700">Amazon PPU</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap bg-green-600">Amazon Product Revenue</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap bg-green-700">Amazon Shipping Revenue</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap bg-green-800">Total Amazon Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, index) => (
                    <tr
                      key={order.id}
                      className={`border-b border-slate-200 hover:bg-slate-50 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                      }`}
                    >
                      <td className="px-4 py-4 sticky left-0 bg-inherit z-10">
                        <input type="checkbox" className="rounded" />
                      </td>
                      <td className="px-4 py-4 sticky left-12 bg-inherit z-10">
                        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-slate-400" />
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-medium text-slate-900">{order.activateSwagInvoice}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-slate-700">{order.orderDate}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-slate-700">{order.deliveryDate}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-medium text-slate-900">{order.productName}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-slate-700">{order.amazonPO}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-sm text-slate-700">{order.sizes.xs}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-sm text-slate-700">{order.sizes.s}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-sm text-slate-700">{order.sizes.m}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-sm text-slate-700">{order.sizes.l}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-sm text-slate-700">{order.sizes.xl}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-sm text-slate-700">{order.sizes.xxl}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-sm text-slate-700">{order.sizes.xxxl}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-sm text-slate-700">{order.sizes.xxxxl}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-sm text-slate-700">{order.sizes.xxxxxl}</span>
                      </td>
                      <td className="px-4 py-4 text-center bg-blue-50">
                        <span className="text-sm font-bold text-blue-700">{order.totalQty}</span>
                      </td>
                      <td className="px-4 py-4 bg-green-50">
                        <span className="text-sm font-semibold text-green-700">${order.amazonPPU.toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-4 bg-green-50">
                        <span className="text-sm font-semibold text-green-700">${order.amazonProductRevenue.toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-4 bg-green-50">
                        <span className="text-sm font-semibold text-green-700">${order.amazonShippingRevenue.toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-4 bg-green-50">
                        <span className="text-sm font-bold text-green-800">${order.totalAmazonRevenue.toFixed(2)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap">Product Cost PPU</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap">Total Product Cost</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap">Shipping Cost</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap">Total Cost</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap">Total Profit</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap">GP Margin %</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap">IPF Profit</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap">Activate Profit</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap">Activate Product Rev</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap">Activate Shipping Rev</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap">Payout Date</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase whitespace-nowrap">Amazon Paid</th>
                    <th className="px-4 py-3 text-center text-xs font-bold uppercase whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, index) => (
                    <tr
                      key={order.id}
                      className={`border-b border-slate-200 hover:bg-slate-50 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                      }`}
                    >
                      <td className="px-4 py-4">
                        <span className="text-sm font-semibold text-red-600">${order.productCostPPU.toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-semibold text-red-600">${order.shippingCost.toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-semibold text-red-600">${order.totalCost.toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-semibold text-blue-600">${order.totalProfit.toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-semibold text-slate-700">{order.gpMargin.toFixed(2)}%</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-semibold text-purple-600">${order.ipfProfit.toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-semibold text-purple-600">${order.activateProfit.toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-semibold text-orange-600">${order.activateProductRev.toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-semibold text-orange-600">${order.activateShippingRev.toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-slate-700">{order.payoutDate}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={order.amazonPaid}
                            readOnly
                            className="rounded"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4 text-blue-600" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </motion.button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}