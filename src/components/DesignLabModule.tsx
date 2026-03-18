import { motion, AnimatePresence } from 'motion/react';
import { Palette, Search, Eye, Trash2, ChevronLeft, ChevronRight, User, Image as ImageIcon, FileText, Filter, ChevronDown, X, RefreshCw, Upload, CheckCircle, Clock, AlertTriangle, Package, ExternalLink, Building2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { DesignOrderDetailView } from './DesignOrderDetailView';
import { toast } from 'sonner@2.0.3';
import { ColumnVisibilityDropdown, ColumnDef } from './ColumnVisibilityDropdown';


export type DesignTask = {
  id: string;
  orderId: string;
  orderName: string;
  customer: string;
  itemName: string;
  sku: string;
  imageUrl: string;
  quantity: number;
  variant: string;
  supplier: string;
  vendor: string;
  status: string;
  artFile: string | null;
  artFileName: string | null;
  mockupFile: string | null;
  mockupFileName: string | null;
  artTemplate: string | null;
  artTemplateName: string | null;
  currentRevision: number;
  revisions: RevisionEntry[];
  assignedTo: string;
  dueDate: string;
  createdAt: string;
  updatedAt?: string;
  notes: string;
  files?: DesignFile[];
};

export type DesignFile = {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
};

export type RevisionEntry = {
  version: number;
  artFile: string | null;
  artFileName: string | null;
  mockupFile: string | null;
  mockupFileName: string | null;
  date: string;
  feedback: string;
  status: string;
};

const DESIGN_STATUSES = ['Pending Design', 'Design Ready', 'Revision Requested', 'Design Approved'];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Design Approved': return 'bg-green-100 text-green-700 border-green-200';
    case 'Design Ready': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'Pending Design': return 'bg-slate-100 text-slate-600 border-slate-200';
    case 'Revision Requested': return 'bg-amber-100 text-amber-700 border-amber-200';
    // Legacy statuses
    case 'Approved': return 'bg-green-100 text-green-700 border-green-200';
    case 'In Review': return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'Art Uploaded': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'Pending Art': return 'bg-slate-100 text-slate-600 border-slate-200';
    case 'Revision Needed': return 'bg-amber-100 text-amber-700 border-amber-200';
    default: return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Design Approved':
    case 'Approved': return <CheckCircle className="w-3.5 h-3.5" />;
    case 'Design Ready':
    case 'In Review':
    case 'Art Uploaded': return <Eye className="w-3.5 h-3.5" />;
    case 'Pending Design':
    case 'Pending Art': return <Clock className="w-3.5 h-3.5" />;
    case 'Revision Requested':
    case 'Revision Needed': return <AlertTriangle className="w-3.5 h-3.5" />;
    default: return <Clock className="w-3.5 h-3.5" />;
  }
};

function DesignFilterDropdown({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (val: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const allLabel = options[0];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
          value !== allLabel
            ? 'bg-pink-50 border-pink-300 text-pink-700'
            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
        }`}
      >
        <span className="text-slate-500 font-medium">{label}:</span>
        <span>{value}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-xl z-30 overflow-hidden"
          >
            <div className="py-1.5">
              {options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => { onChange(opt); setOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                    value === opt ? 'bg-pink-50 text-pink-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {opt}
                  {value === opt && <span className="float-right text-pink-500 font-bold">&#10003;</span>}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function DesignLabModule() {
  const [tasks, setTasks] = useState<DesignTask[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<DesignTask | null>(null);

  const designColumns: ColumnDef[] = [
    { key: 'product', label: 'Product' },
    { key: 'taskId', label: 'Task ID' },
    { key: 'order', label: 'Order' },
    { key: 'customer', label: 'Customer' },
    { key: 'vendor', label: 'Vendor' },
    { key: 'status', label: 'Status' },
    { key: 'art', label: 'Art File' },
    { key: 'mockup', label: 'Mockup' },
    { key: 'revisions', label: 'Revisions' },
    { key: 'dueDate', label: 'Due Date' },
    { key: 'actions', label: 'Actions' },
  ];
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    designColumns.forEach(c => { init[c.key] = true; });
    return init;
  });
  const isColVisible = (key: string) => columnVisibility[key] !== false;

  const fetchTasks = async () => {
    setLoading(true);
    setTasks([]);
    setLoading(false);
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleDeleteTask = async (taskId: string) => {
    setTasks(prev => prev.filter(item => item.id !== taskId));
    toast.success('Design task deleted');
  };

  // KPIs
  const totalTasks = tasks.length;
  const pendingDesign = tasks.filter(t => t.status === 'Pending Design' || t.status === 'Pending Art').length;
  const designReady = tasks.filter(t => t.status === 'Design Ready' || t.status === 'Art Uploaded' || t.status === 'In Review').length;
  const revisionRequested = tasks.filter(t => t.status === 'Revision Requested' || t.status === 'Revision Needed').length;
  const approved = tasks.filter(t => t.status === 'Design Approved' || t.status === 'Approved').length;

  // Filter
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.vendor?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All Status' || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredTasks.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedTasks = filteredTasks.slice(startIndex, startIndex + rowsPerPage);

  const activeFilterCount = [statusFilter !== 'All Status'].filter(Boolean).length;

  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter]);

  const handleTaskUpdated = () => {
    fetchTasks();
  };

  if (selectedTask) {
    return (
      <DesignOrderDetailView
        task={selectedTask}
        onBack={() => { setSelectedTask(null); fetchTasks(); }}
        onTaskUpdated={handleTaskUpdated}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-50/50 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-8">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-slate-700 rounded-2xl flex items-center justify-center">
                <Palette className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-1">Design Lab</h1>
                <p className="text-slate-500 text-sm">Art & mockup workflow — items auto-populate from orders</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-8 mt-6 mb-6">
        <div className="max-w-[1800px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { label: 'Total Tasks', value: totalTasks, icon: <Palette className="w-6 h-6 text-white" />, gradient: 'from-blue-500 to-blue-600' },
              { label: 'Pending Design', value: pendingDesign, icon: <Clock className="w-6 h-6 text-white" />, gradient: 'from-slate-500 to-slate-600' },
              { label: 'Design Ready', value: designReady, icon: <Eye className="w-6 h-6 text-white" />, gradient: 'from-purple-500 to-purple-600' },
              { label: 'Revision Requested', value: revisionRequested, icon: <AlertTriangle className="w-6 h-6 text-white" />, gradient: 'from-amber-500 to-amber-600' },
              { label: 'Design Approved', value: approved, icon: <CheckCircle className="w-6 h-6 text-white" />, gradient: 'from-green-500 to-green-600' },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center`}>
                    {stat.icon}
                  </div>
                </div>
                <div className="text-sm text-slate-500 mb-1">{stat.label}</div>
                <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="px-8 pb-0 shrink-0 mb-6">
        <div className="max-w-[1800px] mx-auto">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by item, customer, order, vendor, or SKU..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchTasks}
                className="p-3 bg-slate-50 border-2 border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
                title="Refresh"
              >
                <RefreshCw className={`w-5 h-5 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
              </motion.button>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <Filter className="w-4 h-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 bg-pink-600 text-white rounded-full text-xs flex items-center justify-center font-bold">{activeFilterCount}</span>
                )}
              </div>
              <DesignFilterDropdown label="Status" value={statusFilter} options={['All Status', ...DESIGN_STATUSES]} onChange={setStatusFilter} />
              {activeFilterCount > 0 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setStatusFilter('All Status')}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-red-600 bg-red-50 border-2 border-red-200 rounded-xl hover:bg-red-100 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear
                </motion.button>
              )}
              <div className="ml-auto">
                <ColumnVisibilityDropdown
                  columns={designColumns}
                  visibleColumns={columnVisibility}
                  onChange={setColumnVisibility}
                  accentColor="rose"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        <div className="max-w-[1800px] mx-auto">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1300px]">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {designColumns.map(col => (
                      <th key={col.key} className={`text-left px-4 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap ${isColVisible(col.key) ? '' : 'hidden'}`}>
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={11} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-8 h-8 border-3 border-pink-500 border-t-transparent rounded-full animate-spin" />
                          <span className="text-sm text-slate-500">Loading design tasks...</span>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedTasks.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="px-8 py-20">
                        <div className="flex flex-col items-center justify-center text-center">
                          <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mb-4">
                            <Palette className="w-10 h-10 text-slate-400" />
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 mb-1">No Design Tasks</h3>
                          <p className="text-sm text-slate-500 max-w-md">Design tasks are auto-created when orders with line items are placed. Create an order to get started.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedTasks.map((task, index) => (
                      <motion.tr
                        key={task.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02 }}
                        onClick={() => setSelectedTask(task)}
                        className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                      >
                        {/* Product */}
                        {isColVisible('product') && (
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 border border-slate-200">
                                {task.imageUrl ? (
                                  <img src={task.imageUrl} alt={task.itemName} className="w-full h-full object-cover" />
                                ) : (
                                  <Package className="w-5 h-5 text-slate-400" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-semibold text-slate-900 truncate max-w-[220px]">{task.itemName || 'Unnamed Item'}</div>
                                {task.sku && <div className="text-xs text-slate-400">{task.sku}</div>}
                              </div>
                            </div>
                          </td>
                        )}
                        {/* Task ID */}
                        {isColVisible('taskId') && (
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span className="text-sm font-mono text-slate-700">{task.id}</span>
                          </td>
                        )}
                        {/* Order */}
                        {isColVisible('order') && (
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <div className="text-sm font-medium text-slate-900">{task.orderName || task.orderId}</div>
                            <div className="text-xs text-slate-400">{task.orderId}</div>
                          </td>
                        )}
                        {/* Customer */}
                        {isColVisible('customer') && (
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                <User className="w-3.5 h-3.5 text-white" />
                              </div>
                              <span className="text-sm font-medium text-slate-900 truncate max-w-[140px]">{task.customer || '—'}</span>
                            </div>
                          </td>
                        )}
                        {/* Vendor */}
                        {isColVisible('vendor') && (
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Building2 className="w-3.5 h-3.5 text-white" />
                              </div>
                              <span className="text-sm font-medium text-slate-900 truncate max-w-[140px]">{task.vendor || task.supplier || '—'}</span>
                            </div>
                          </td>
                        )}
                        {/* Status */}
                        {isColVisible('status') && (
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${getStatusColor(task.status)}`}>
                              {getStatusIcon(task.status)}
                              {task.status}
                            </span>
                          </td>
                        )}
                        {/* Art File */}
                        {isColVisible('art') && (
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            {task.artFileName ? (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                                <ImageIcon className="w-3 h-3" />
                                {task.artFileName.length > 20 ? task.artFileName.slice(0, 20) + '...' : task.artFileName}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Not uploaded</span>
                            )}
                          </td>
                        )}
                        {/* Mockup */}
                        {isColVisible('mockup') && (
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            {task.mockupFileName ? (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-md">
                                <ImageIcon className="w-3 h-3" />
                                {task.mockupFileName.length > 20 ? task.mockupFileName.slice(0, 20) + '...' : task.mockupFileName}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Not uploaded</span>
                            )}
                          </td>
                        )}
                        {/* Revisions */}
                        {isColVisible('revisions') && (
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span className={`text-sm font-bold ${task.currentRevision > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                              {task.currentRevision || 0}
                            </span>
                          </td>
                        )}
                        {/* Due Date */}
                        {isColVisible('dueDate') && (
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span className="text-sm text-slate-600">{task.dueDate || '—'}</span>
                          </td>
                        )}
                        {/* Actions */}
                        {isColVisible('actions') && (
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => { e.stopPropagation(); setSelectedTask(task); }}
                                className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                              >
                                <Eye className="w-4 h-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }}
                                className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </motion.button>
                            </div>
                          </td>
                        )}
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Page {currentPage} of {Math.max(1, totalPages)} · Showing {Math.min(startIndex + 1, filteredTasks.length)} to {Math.min(startIndex + rowsPerPage, filteredTasks.length)} of {filteredTasks.length}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">Rows per page:</span>
                <select
                  value={rowsPerPage}
                  onChange={e => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <div className="flex gap-1 ml-4">
                  <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50" disabled={currentPage <= 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>
                    <ChevronLeft className="w-5 h-5 text-slate-600" />
                  </button>
                  <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>
                    <ChevronRight className="w-5 h-5 text-slate-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
