import { motion } from 'motion/react';
import { ArrowLeft, Building2, Mail, Phone, MapPin, Globe, DollarSign, FileText, ShoppingCart, Calendar, Edit, Trash2, Package, TrendingUp, Download, Upload, File } from 'lucide-react';

interface Vendor {
  id: string;
  name: string;
  contact: string;
  logo: string;
  status: string;
  type: string;
  location: { city: string; region: string } | null;
  products: string;
  netTerms: string;
  totalSpend: string;
}

interface VendorDetailViewProps {
  vendor: Vendor;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function VendorDetailView({ vendor, onBack, onEdit, onDelete }: VendorDetailViewProps) {
  // Sample data for vendor-related records
  const purchaseOrders = [
    { id: 'PO-5678', date: '2026-02-14', amount: 12500.00, status: 'In Production', items: 8 },
    { id: 'PO-5623', date: '2026-02-08', amount: 8900.00, status: 'Shipped', items: 5 },
    { id: 'PO-5589', date: '2026-01-25', amount: 15200.00, status: 'Delivered', items: 12 },
    { id: 'PO-5534', date: '2026-01-15', amount: 6750.00, status: 'Delivered', items: 4 },
  ];

  const invoices = [
    { id: 'INV-3456', date: '2026-02-15', amount: 12500.00, dueDate: '2026-03-15', status: 'Pending' },
    { id: 'INV-3398', date: '2026-02-09', amount: 8900.00, dueDate: '2026-03-09', status: 'Paid' },
    { id: 'INV-3340', date: '2026-01-26', amount: 15200.00, dueDate: '2026-02-26', status: 'Paid' },
    { id: 'INV-3287', date: '2026-01-16', amount: 6750.00, dueDate: '2026-02-16', status: 'Paid' },
  ];

  const files = [
    { id: 'F-001', name: 'Vendor Agreement 2026.pdf', type: 'Contract', size: '2.4 MB', uploadDate: '2026-01-05' },
    { id: 'F-002', name: 'Product Catalog.pdf', type: 'Catalog', size: '15.8 MB', uploadDate: '2026-01-12' },
    { id: 'F-003', name: 'Quality Certifications.pdf', type: 'Certificate', size: '1.2 MB', uploadDate: '2026-01-20' },
    { id: 'F-004', name: 'Insurance Certificate.pdf', type: 'Insurance', size: '890 KB', uploadDate: '2026-02-01' },
    { id: 'F-005', name: 'W9 Form.pdf', type: 'Tax Document', size: '456 KB', uploadDate: '2026-01-05' },
  ];

  const recentActivity = [
    { date: '2026-02-15', type: 'Invoice', description: 'Invoice INV-3456 generated for PO-5678', amount: 12500 },
    { date: '2026-02-14', type: 'Purchase Order', description: 'PO-5678 created - 8 items ordered', amount: 12500 },
    { date: '2026-02-09', type: 'Payment', description: 'Payment received for INV-3398', amount: 8900 },
    { date: '2026-02-08', type: 'Shipment', description: 'PO-5623 shipped - tracking updated', amount: null },
    { date: '2026-01-26', type: 'Payment', description: 'Payment received for INV-3340', amount: 15200 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
      case 'Delivered':
      case 'Paid':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'In Production':
      case 'Shipped':
      case 'Pending':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Inactive':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getFileIcon = (type: string) => {
    return <File className="w-5 h-5" />;
  };

  const totalPOValue = purchaseOrders.reduce((sum, po) => sum + po.amount, 0);
  const totalInvoiceValue = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const paidInvoices = invoices.filter(inv => inv.status === 'Paid').length;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 px-8 py-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05, x: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={onBack}
                className="flex items-center gap-2 text-white/90 hover:text-white font-medium transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Vendors
              </motion.button>
            </div>
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onEdit}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit Vendor
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onDelete}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-500/20 backdrop-blur-sm border border-red-300/30 text-white font-semibold rounded-xl hover:bg-red-500/30 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-8">
        <div className="max-w-[1400px] mx-auto space-y-6">
          {/* Vendor Header Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg overflow-hidden"
          >
            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 px-8 py-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-xl text-5xl">
                    {vendor.logo}
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{vendor.name}</h1>
                    <p className="text-purple-100 text-lg mb-3">{vendor.contact}</p>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold border-2 ${getStatusColor(vendor.status)} bg-white`}>
                        {vendor.status}
                      </span>
                      <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold border-2 bg-blue-100 text-blue-700 border-blue-200">
                        {vendor.type}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase">Location</p>
                      <p className="text-sm font-medium text-slate-900">
                        {vendor.location ? `${vendor.location.city}, ${vendor.location.region}` : 'Not specified'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase">Products</p>
                      <p className="text-sm font-medium text-slate-900">{vendor.products}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase">Net Terms</p>
                      <p className="text-sm font-medium text-slate-900">{vendor.netTerms}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase">Total Spend</p>
                      <p className="text-sm font-medium text-slate-900">{vendor.totalSpend}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                      <FileText className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase">Vendor ID</p>
                      <p className="text-sm font-medium text-slate-900">{vendor.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase">Total POs</p>
                      <p className="text-sm font-medium text-slate-900">{purchaseOrders.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">${totalPOValue.toLocaleString()}</div>
              <div className="text-sm text-slate-500">Total PO Value</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">{paidInvoices}/{invoices.length}</div>
              <div className="text-sm text-slate-500">Invoices Paid</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">{files.length}</div>
              <div className="text-sm text-slate-500">Documents</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-amber-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">${totalInvoiceValue.toLocaleString()}</div>
              <div className="text-sm text-slate-500">Total Invoiced</div>
            </motion.div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-3 gap-6">
            {/* Left Column - Main Content */}
            <div className="col-span-2 space-y-6">
              {/* Purchase Orders */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden"
              >
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                        <ShoppingCart className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">Purchase Orders</h3>
                        <p className="text-sm text-slate-500">{purchaseOrders.length} orders placed</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">PO ID</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Items</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {purchaseOrders.map((po) => (
                        <tr key={po.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <span className="font-semibold text-slate-900">{po.id}</span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">{po.date}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{po.items} items</td>
                          <td className="px-6 py-4">
                            <span className="font-semibold text-green-600">${po.amount.toLocaleString()}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${getStatusColor(po.status)}`}>
                              {po.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>

              {/* Invoices */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden"
              >
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">Invoices</h3>
                        <p className="text-sm text-slate-500">{invoices.length} invoices generated</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Invoice ID</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Due Date</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {invoices.map((invoice) => (
                        <tr key={invoice.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <span className="font-semibold text-slate-900">{invoice.id}</span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">{invoice.date}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{invoice.dueDate}</td>
                          <td className="px-6 py-4">
                            <span className="font-semibold text-green-600">${invoice.amount.toLocaleString()}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${getStatusColor(invoice.status)}`}>
                              {invoice.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>

              {/* Files & Documents */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden"
              >
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">Files & Documents</h3>
                        <p className="text-sm text-slate-500">{files.length} documents on file</p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      Upload
                    </motion.button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {files.map((file) => (
                      <div key={file.id} className="flex items-center justify-between bg-slate-50 rounded-xl p-4 border border-slate-200 hover:border-purple-300 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            {getFileIcon(file.type)}
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-900">{file.name}</h4>
                            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                              <span>{file.type}</span>
                              <span>•</span>
                              <span>{file.size}</span>
                              <span>•</span>
                              <span>Uploaded {file.uploadDate}</span>
                            </div>
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                          <Download className="w-5 h-5 text-slate-600" />
                        </motion.button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Activity Timeline */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden"
              >
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
                  <h3 className="text-lg font-bold text-slate-900">Recent Activity</h3>
                  <p className="text-sm text-slate-500">Transaction history</p>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            activity.type === 'Invoice' ? 'bg-green-100 text-green-600' :
                            activity.type === 'Purchase Order' ? 'bg-blue-100 text-blue-600' :
                            activity.type === 'Payment' ? 'bg-purple-100 text-purple-600' :
                            'bg-amber-100 text-amber-600'
                          }`}>
                            {activity.type === 'Invoice' || activity.type === 'Payment' ? (
                              <DollarSign className="w-4 h-4" />
                            ) : activity.type === 'Purchase Order' ? (
                              <ShoppingCart className="w-4 h-4" />
                            ) : (
                              <Package className="w-4 h-4" />
                            )}
                          </div>
                          {index < recentActivity.length - 1 && (
                            <div className="w-0.5 h-full bg-slate-200 mt-2" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-slate-500">{activity.type}</span>
                            <span className="text-xs text-slate-400">{activity.date}</span>
                          </div>
                          <p className="text-sm text-slate-900 mb-1">{activity.description}</p>
                          {activity.amount && (
                            <p className="text-xs font-semibold text-green-600">${activity.amount.toLocaleString()}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
