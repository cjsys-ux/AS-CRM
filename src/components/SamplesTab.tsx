import { motion, AnimatePresence } from 'motion/react';
import { Plus, Upload, Package, FileText, MessageSquare, Truck, ChevronRight, RefreshCw, Trash2, Download } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { ChecklistWidget, ChecklistItem } from './ChecklistWidget';
import { AddSampleDrawer } from './AddSampleDrawer';
import { OrderSampleDrawer } from './OrderSampleDrawer';
import { DeleteDocumentModal } from './DeleteDocumentModal';
import { ImagePopupModal } from './ImagePopupModal';
import { CategoryTagDropdown, categoryColor } from './CategoryTagDropdown';
import { downloadSavedFile } from '../lib/downloadFile';
import { uploadFileViaApi, recordUpload } from '../utils/uploadViaApi';

const isImageFile = (fileName: string) => {
  const ext = fileName?.split('.').pop()?.toLowerCase() ?? '';
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext);
};

interface SampleOrder {
  id: string;
  poNumber?: string;
  poDate?: string;
  project?: string;
  productName?: string;
  clientName?: string;
  vendor?: string;
  customer?: string;
  status?: string;
  sampleType?: string;
  total?: number;
  totalCost?: number;
  inHandsDate?: string;
  createdAt?: string;
  variants?: Array<{
    id?: string;
    sku?: string;
    size?: string;
    color?: string;
    qty?: number;
    costPerUnit?: number;
  }>;
  destinations?: Array<{
    id?: string;
    name?: string;
    location?: string;
  }>;
  additionalNotes?: string;
}

interface FeedbackSample {
  id: string;
  sampleName?: string;
  sampleType?: string;
  version?: string;
  vendorName?: string;
  receivedDate?: string;
}

interface UploadedFile {
  id: string;
  fileName: string;
  fileType?: string;
  size?: number;
  key?: string;
  fileUrl?: string;
  createdAt?: string;
  category?: string;
}

interface SamplesTabProps {
  productId?: string;
  refreshKey?: number;
  onChecklistChanged?: (all: Record<string, ChecklistItem[]>) => void;
  onActivityDetected?: () => void;
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; border: string; dot: string }> = {
  'Created': { color: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-200', dot: 'bg-slate-400' },
  'Submitted': { color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', dot: 'bg-blue-500' },
  'Confirmed': { color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200', dot: 'bg-indigo-500' },
  'In Production': { color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200', dot: 'bg-purple-500' },
  'Shipped': { color: 'text-cyan-700', bg: 'bg-cyan-50', border: 'border-cyan-200', dot: 'bg-cyan-500' },
  'Delivered': { color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200', dot: 'bg-green-500' },
  'Issue': { color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-500' },
  // Legacy statuses for backward compatibility
  'Pending': { color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-500' },
  'Approved': { color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', dot: 'bg-blue-500' },
  'Ordered': { color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200', dot: 'bg-indigo-500' },
  'In Transit': { color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200', dot: 'bg-purple-500' },
  'Cancelled': { color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-500' },
};

function formatSize(bytes: number): string {
  if (bytes > 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

export function SamplesTab({ productId = '', refreshKey, onChecklistChanged, onActivityDetected }: SamplesTabProps) {
  const [orders, setOrders] = useState<SampleOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [feedbackSamples, setFeedbackSamples] = useState<FeedbackSample[]>([]);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isAddSampleDrawerOpen, setIsAddSampleDrawerOpen] = useState(false);
  const [isOrderSampleDrawerOpen, setIsOrderSampleDrawerOpen] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<UploadedFile | null>(null);
  const [previewImage, setPreviewImage] = useState<UploadedFile | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!productId) {
      setOrdersLoading(false);
      return;
    }
    setOrdersLoading(true);
    try {
      const res = await fetch(`/api/pipeline/sample-orders/list?productId=${encodeURIComponent(productId)}`);
      if (!res.ok) {
        setOrders([]);
        return;
      }
      const data = await res.json();
      setOrders(data.orders ?? []);
    } catch {
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  }, [productId]);

  const fetchFeedbackSamples = useCallback(async () => {
    if (!productId) return;
    try {
      const res = await fetch(`/api/pipeline/samples/list?productId=${encodeURIComponent(productId)}`);
      if (!res.ok) return;
      const data = await res.json();
      setFeedbackSamples(data.samples ?? []);
    } catch {
      setFeedbackSamples([]);
    }
  }, [productId]);

  const fetchFiles = useCallback(async () => {
    if (!productId) return;
    // Pull from every sample-related entity type so legacy document+image
    // splits keep showing up after the UI unifies into one section.
    const fetchType = async (entityType: string) => {
      const res = await fetch(`/api/files/list?entityType=${entityType}&entityId=${encodeURIComponent(productId)}`);
      if (!res.ok) return [];
      const { uploads } = await res.json();
      return uploads ?? [];
    };
    const [combined, legacyDoc, legacyImg] = await Promise.all([
      fetchType('pipeline-sample-file'),
      fetchType('pipeline-sample-document'),
      fetchType('pipeline-sample-image'),
    ]);
    setFiles([...combined, ...legacyDoc, ...legacyImg]);
  }, [productId]);

  useEffect(() => {
    fetchOrders();
    fetchFeedbackSamples();
    fetchFiles();
  }, [fetchOrders, fetchFeedbackSamples, fetchFiles, refreshKey]);

  const getStatusStyle = (status?: string) => {
    return STATUS_CONFIG[status ?? 'Pending'] || STATUS_CONFIG['Pending'];
  };

  const formatDate = (dateStr?: string | Date | null) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return String(dateStr);
    }
  };

  const totalVariants = (order: SampleOrder) => {
    return order.variants?.reduce((sum, v) => sum + (v.qty ?? 0), 0) ?? 0;
  };

  const orderTitle = (order: SampleOrder) => {
    return order.poNumber || `SO-${order.id.slice(-6).toUpperCase()}`;
  };

  const orderTotal = (order: SampleOrder) => {
    return typeof order.total === 'number' ? order.total : (order.totalCost ?? 0);
  };

  const handleDeleteFeedbackSample = async (id: string) => {
    try {
      const res = await fetch('/api/pipeline/samples/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Failed to delete sample');
      toast.success('Sample deleted');
      setFeedbackSamples((prev) => prev.filter((s) => s.id !== id));
    } catch {
      toast.error('Failed to delete sample');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = event.target.files;
    if (!uploaded || uploaded.length === 0) return;
    if (!productId) return;
    setIsUploading(true);
    try {
      for (const file of Array.from(uploaded)) {
        const { key } = await uploadFileViaApi(file, 'pipeline-sample-file', productId);
        await recordUpload({
          key,
          fileName: file.name,
          fileType: file.type,
          size: file.size,
          entityType: 'pipeline-sample-file',
          entityId: productId,
        });
      }
      toast.success(`${uploaded.length} file${uploaded.length > 1 ? 's' : ''} uploaded`, { duration: 3000 });
      await fetchFiles();
      onActivityDetected?.();
    } catch (err) {
      console.error('Sample file upload error:', err);
      toast.error('Upload failed');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const handleFileDelete = async (id: string) => {
    try {
      const res = await fetch('/api/files/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('File deleted');
      await fetchFiles();
      onActivityDetected?.();
    } catch {
      toast.error('Failed to delete file');
    }
  };

  const updateFileCategory = async (file: UploadedFile, category: string) => {
    const previous = files;
    setFiles(prev => prev.map(f => f.id === file.id ? { ...f, category } : f));
    try {
      const res = await fetch('/api/files/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: file.id, category }),
      });
      if (!res.ok) {
        setFiles(previous);
        toast.error('Failed to update category');
        return;
      }
      toast.success(category ? `Category set to "${category}"` : 'Category removed', { duration: 2000 });
      onActivityDetected?.();
    } catch {
      setFiles(previous);
      toast.error('Failed to update category');
    }
  };

  return (
    <div className="space-y-6">
      {/* Sample Tracking */}
      <div className="bg-white rounded-xl border-2 border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-slate-700" />
            <h3 className="font-bold text-slate-900">Sample Tracking</h3>
            {orders.length > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                {orders.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={fetchOrders}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsOrderSampleDrawerOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Order Sample
            </motion.button>
          </div>
        </div>

        {ordersLoading ? (
          <div className="px-6 py-12 text-center">
            <div className="text-sm text-slate-400">Loading sample orders...</div>
          </div>
        ) : orders.length === 0 ? (
          <div className="px-6 py-16">
            <div className="max-w-md mx-auto text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-2xl flex items-center justify-center">
                <Package className="w-8 h-8 text-slate-400" />
              </div>
              <h4 className="font-bold text-slate-900 mb-2">No Samples Yet</h4>
              <p className="text-sm text-slate-600">
                Start tracking samples from competitors and factories to monitor quality improvements
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            <AnimatePresence>
              {orders.map((order) => {
                const statusStyle = getStatusStyle(order.status);
                const isExpanded = expandedOrder === order.id;
                const total = orderTotal(order);
                const qty = totalVariants(order);

                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group"
                  >
                    <div
                      className="px-6 py-4 flex items-center gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                      onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                    >
                      {/* Status indicator */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${statusStyle.bg} ${statusStyle.border} border`}>
                        <div className={`w-3 h-3 rounded-full ${statusStyle.dot}`} />
                      </div>

                      {/* Main info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-bold text-sm text-slate-900">{orderTitle(order)}</span>
                          <div className="h-4 w-px bg-slate-200" />
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border ${statusStyle.bg} ${statusStyle.color} ${statusStyle.border}`}>
                            {order.status ?? 'Pending'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                          {order.vendor && (
                            <>
                              <span className="flex items-center gap-1">
                                <Truck className="w-3 h-3" />
                                {order.vendor}
                              </span>
                              <span>·</span>
                            </>
                          )}
                          <span>{qty} unit{qty !== 1 ? 's' : ''}</span>
                          <span>·</span>
                          <span>${total.toFixed(2)}</span>
                          {order.sampleType && (
                            <>
                              <span>·</span>
                              <span className={`font-medium ${
                                order.sampleType === 'competitor' ? 'text-orange-600' : 'text-blue-600'
                              }`}>
                                {order.sampleType === 'competitor' ? 'Competitor' : 'Pre-Production'}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Date & action */}
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs text-slate-500 mb-0.5">
                          {formatDate(order.createdAt)}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          In-hands: {formatDate(order.inHandsDate)}
                        </div>
                      </div>

                      <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </div>

                    {/* Expanded details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-4 pt-1">
                            <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                              {/* Variants table */}
                              {order.variants && order.variants.length > 0 && (
                                <div>
                                  <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Variants</h5>
                                  <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                                    <table className="w-full text-sm">
                                      <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200">
                                          <th className="text-left px-3 py-2 text-[11px] font-bold text-slate-500 uppercase">SKU</th>
                                          <th className="text-left px-3 py-2 text-[11px] font-bold text-slate-500 uppercase">Size</th>
                                          <th className="text-left px-3 py-2 text-[11px] font-bold text-slate-500 uppercase">Color</th>
                                          <th className="text-right px-3 py-2 text-[11px] font-bold text-slate-500 uppercase">Qty</th>
                                          <th className="text-right px-3 py-2 text-[11px] font-bold text-slate-500 uppercase">Cost/Unit</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {order.variants.map((v, i) => (
                                          <tr key={v.id || i} className="border-b border-slate-100 last:border-0">
                                            <td className="px-3 py-2 font-medium text-slate-900">{v.sku || '—'}</td>
                                            <td className="px-3 py-2 text-slate-600">{v.size || '—'}</td>
                                            <td className="px-3 py-2 text-slate-600">{v.color || '—'}</td>
                                            <td className="px-3 py-2 text-right font-semibold text-slate-900">{v.qty ?? 0}</td>
                                            <td className="px-3 py-2 text-right text-green-600 font-medium">${(v.costPerUnit ?? 0).toFixed(2)}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              )}

                              {/* Destinations */}
                              {order.destinations && order.destinations.length > 0 && (
                                <div>
                                  <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Destinations</h5>
                                  <div className="flex flex-wrap gap-2">
                                    {order.destinations.map((d, i) => (
                                      <span key={d.id || i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700">
                                        <Truck className="w-3 h-3 text-slate-400" />
                                        {d.location || d.name || '—'}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Notes */}
                              {order.additionalNotes && (
                                <div>
                                  <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Notes</h5>
                                  <p className="text-sm text-slate-600">{order.additionalNotes}</p>
                                </div>
                              )}

                              {/* Status timeline */}
                              <div>
                                <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status Pipeline</h5>
                                {(() => {
                                  const isCompetitor = order.sampleType === 'competitor';
                                  const steps = isCompetitor
                                    ? ['Created', 'Submitted', 'Confirmed', 'Shipped', 'Delivered']
                                    : ['Created', 'Submitted', 'Confirmed', 'In Production', 'Shipped', 'Delivered'];
                                  const currentIndex = steps.indexOf(order.status ?? '');
                                  const isIssue = order.status === 'Issue';
                                  return (
                                    <>
                                      <div className="flex items-center gap-1">
                                        {steps.map((step, i) => {
                                          const isActive = !isIssue && i <= currentIndex;
                                          const isCurrent = step === order.status;
                                          return (
                                            <div key={step} className="flex items-center gap-1 flex-1">
                                              <div className={`flex-1 h-2 rounded-full transition-colors ${
                                                isIssue
                                                  ? 'bg-red-300'
                                                  : isActive
                                                    ? isCurrent ? 'bg-blue-500' : 'bg-green-400'
                                                    : 'bg-slate-200'
                                              }`} />
                                              {i < steps.length - 1 && <div className="w-0.5" />}
                                            </div>
                                          );
                                        })}
                                      </div>
                                      <div className="flex justify-between mt-1">
                                        {steps.map((step) => (
                                          <span key={step} className={`text-[10px] ${
                                            step === order.status ? 'font-bold text-blue-600'
                                            : isIssue ? 'text-red-400'
                                            : 'text-slate-400'
                                          }`}>
                                            {step}
                                          </span>
                                        ))}
                                      </div>
                                      {isIssue && (
                                        <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 border border-red-200 text-red-700 text-[11px] font-bold">
                                          Issue Reported
                                        </div>
                                      )}
                                    </>
                                  );
                                })()}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Sample Feedback */}
      <div className="bg-white rounded-xl border-2 border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-slate-700" />
            <h3 className="font-bold text-slate-900">Sample Feedback</h3>
            {feedbackSamples.length > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                {feedbackSamples.length}
              </span>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsAddSampleDrawerOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Sample
          </motion.button>
        </div>

        {feedbackSamples.length === 0 ? (
          <div className="px-6 py-16">
            <div className="max-w-md mx-auto text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-2xl flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-slate-400" />
              </div>
              <h4 className="font-bold text-slate-900 mb-2">No Feedback Yet</h4>
              <p className="text-sm text-slate-600">
                Start collecting feedback on samples to improve product quality
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {feedbackSamples.map((sample) => (
              <div key={sample.id} className="px-6 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                    <Package className="w-5 h-5 text-slate-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-900">{sample.sampleName || 'Untitled sample'}</p>
                    <p className="text-xs text-slate-500">
                      {sample.sampleType || '—'}
                      {sample.version ? ` · ${sample.version}` : ''}
                      {sample.vendorName ? ` · ${sample.vendorName}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {sample.receivedDate ? (
                    <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-lg">Received</span>
                  ) : (
                    <span className="px-2.5 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-lg">Pending</span>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDeleteFeedbackSample(sample.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sample Documents & Files */}
      <div className="bg-white rounded-xl border-2 border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-slate-900">Sample Documents & Files</h3>
          </div>
          <label htmlFor="sample-file-upload">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Upload className="w-4 h-4" />
              {isUploading ? 'Uploading...' : 'Upload File'}
            </motion.div>
          </label>
          <input
            id="sample-file-upload"
            type="file"
            multiple
            accept="*/*"
            onChange={handleFileUpload}
            className="hidden"
            disabled={isUploading}
          />
        </div>
        <div className="p-6">
          {files.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-2xl flex items-center justify-center">
                <FileText className="w-8 h-8 text-slate-400" />
              </div>
              <h4 className="font-bold text-slate-900 mb-2">No sample files uploaded</h4>
              <p className="text-sm text-slate-600 mb-4">
                Upload documents, images, specs, or certificates for your samples
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {files.map((f) => (
                  <motion.div
                    key={f.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {isImageFile(f.fileName) && f.key ? (
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setPreviewImage(f)}
                          title="Click to preview"
                          className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200 cursor-pointer hover:ring-2 hover:ring-blue-400 hover:border-blue-400 transition-all"
                        >
                          <img src={`/api/files/image?key=${encodeURIComponent(f.key)}`} alt={f.fileName} className="w-full h-full object-cover" />
                        </motion.button>
                      ) : (
                        <FileText className="w-5 h-5 text-purple-600 shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900 truncate">{f.fileName}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <p className="text-xs text-slate-500">
                            {typeof f.size === 'number' ? formatSize(f.size) : ''}
                            {f.createdAt ? ` · ${new Date(f.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : ''}
                          </p>
                          {f.category && (
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${categoryColor(f.category)}`}>
                              {f.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <CategoryTagDropdown
                        value={f.category ?? ''}
                        onChange={(cat) => updateFileCategory(f, cat)}
                      />
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={async () => {
                          try {
                            await downloadSavedFile(f);
                          } catch {
                            toast.error('Failed to download file');
                          }
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => { setFileToDelete(f); setDeleteModalOpen(true); }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Checklist */}
      <ChecklistWidget
        productId={productId}
        tabId="samples"
        onChecklistChanged={onChecklistChanged}
        onActivityDetected={onActivityDetected}
      />

      {/* Add Sample Drawer */}
      <AddSampleDrawer
        isOpen={isAddSampleDrawerOpen}
        onClose={() => setIsAddSampleDrawerOpen(false)}
        productId={productId}
        onSuccess={() => { fetchFeedbackSamples(); onActivityDetected?.(); }}
      />

      {/* Order Sample Drawer */}
      <OrderSampleDrawer
        isOpen={isOrderSampleDrawerOpen}
        onClose={() => setIsOrderSampleDrawerOpen(false)}
        productId={productId}
        onSuccess={() => { fetchOrders(); onActivityDetected?.(); }}
      />

      {/* Delete Document Modal */}
      <DeleteDocumentModal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setFileToDelete(null); }}
        onConfirm={() => {
          if (fileToDelete) {
            handleFileDelete(fileToDelete.id);
          }
          setDeleteModalOpen(false);
          setFileToDelete(null);
        }}
        fileName={fileToDelete?.fileName || ''}
      />

      {/* Image Preview Modal */}
      <ImagePopupModal
        isOpen={!!previewImage}
        onClose={() => setPreviewImage(null)}
        imageUrl={previewImage?.key ? `/api/files/image?key=${encodeURIComponent(previewImage.key)}` : ''}
        productName={previewImage?.fileName || 'Image'}
      />
    </div>
  );
}
