import { motion, AnimatePresence } from 'motion/react';
import { Plus, Upload, Package, FileText, Image as ImageIcon, MessageSquare, Truck, ChevronRight, RefreshCw, Pencil, Download, Trash2 } from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { ChecklistWidget, ChecklistItem } from './ChecklistWidget';
import { AddSampleDrawer } from './AddSampleDrawer';
import { OrderSampleDrawer } from './OrderSampleDrawer';
import { CategoryTagDropdown, categoryColor } from './CategoryTagDropdown';
import { DeleteDocumentModal } from './DeleteDocumentModal';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-c0840c88`;

interface SampleOrder {
  id: string;
  poNumber: string;
  poDate: string;
  project: string;
  vendor: string;
  customer: string;
  status: string;
  sampleType: string;
  total: number;
  inHandsDate: string;
  createdAt: string;
  variants?: Array<{
    id: string;
    sku: string;
    size: string;
    color: string;
    qty: number;
    costPerUnit: number;
  }>;
  destinations?: Array<{
    id: string;
    name: string;
    location: string;
  }>;
  additionalNotes?: string;
}

interface SamplesTabProps {
  productId?: string;
  refreshKey?: number;
  onChecklistChanged?: (allChecklists: Record<string, ChecklistItem[]>) => void;
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

export function SamplesTab({ productId, refreshKey, onChecklistChanged, onActivityDetected }: SamplesTabProps) {
  const [samples, setSamples] = useState<SampleOrder[]>([]);
  const [samplesLoading, setSamplesLoading] = useState(true);
  const [feedbackSamples] = useState<any[]>([]);
  const [isAddSampleDrawerOpen, setIsAddSampleDrawerOpen] = useState(false);
  const [isOrderSampleDrawerOpen, setIsOrderSampleDrawerOpen] = useState(false);
  const [expandedSample, setExpandedSample] = useState<string | null>(null);
  const [sampleFiles, setSampleFiles] = useState<{file: File; displayName: string; category: string; uploadedBy: string; uploadedAt: string}[]>([]);
  const [renamingIndex, setRenamingIndex] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const renameInputRef = useRef<HTMLInputElement>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<{ file: File; index: number } | null>(null);

  const fetchSamples = useCallback(async () => {
    if (!productId) {
      setSamplesLoading(false);
      return;
    }
    setSamplesLoading(true);
    try {
      const res = await fetch(`${API_URL}/products/${productId}/samples`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` },
      });
      const data = await res.json();
      if (data.success && data.samples) {
        setSamples(data.samples);
      } else {
        setSamples([]);
      }
    } catch (err) {
      console.error('Error fetching samples:', err);
      setSamples([]);
    } finally {
      setSamplesLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchSamples();
  }, [fetchSamples, refreshKey]);

  const getStatusStyle = (status: string) => {
    return STATUS_CONFIG[status] || STATUS_CONFIG['Pending'];
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const totalVariants = (sample: SampleOrder) => {
    return sample.variants?.reduce((sum, v) => sum + v.qty, 0) || 0;
  };

  const handleSampleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files;
    if (uploadedFiles && uploadedFiles.length > 0) {
      const newFiles = Array.from(uploadedFiles).map(f => ({
        file: f,
        displayName: f.name,
        category: '',
        uploadedBy: 'User',
        uploadedAt: new Date().toISOString(),
      }));
      setSampleFiles(prev => [...prev, ...newFiles]);
      toast.success(`${uploadedFiles.length} file${uploadedFiles.length > 1 ? 's' : ''} uploaded successfully`);
    }
  };

  const handleDownloadSampleFile = (uf: { file: File; displayName: string }) => {
    const url = URL.createObjectURL(uf.file);
    const a = document.createElement('a');
    a.href = url;
    a.download = uf.displayName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const startRename = (index: number) => {
    const name = sampleFiles[index].displayName;
    const lastDot = name.lastIndexOf('.');
    setRenameValue(lastDot > 0 ? name.substring(0, lastDot) : name);
    setRenamingIndex(index);
    setTimeout(() => renameInputRef.current?.focus(), 50);
  };

  const confirmRename = (index: number) => {
    if (renameValue.trim()) {
      const origName = sampleFiles[index].file.name;
      const lastDot = origName.lastIndexOf('.');
      const ext = lastDot > 0 ? origName.substring(lastDot) : '';
      const newName = renameValue.trim() + ext;
      setSampleFiles(prev => prev.map((f, i) => i === index ? { ...f, displayName: newName } : f));
      toast.success('File renamed', { description: `Renamed to "${newName}"`, duration: 2000 });
    }
    setRenamingIndex(null);
    setRenameValue('');
  };

  const updateFileCategory = (index: number, category: string) => {
    setSampleFiles(prev => prev.map((f, i) => i === index ? { ...f, category } : f));
  };

  return (
    <div className="space-y-6">
      {/* Sample Tracking */}
      <div className="bg-white rounded-xl border-2 border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-slate-700" />
            <h3 className="font-bold text-slate-900">Sample Tracking</h3>
            {samples.length > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                {samples.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={fetchSamples}
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

        {samplesLoading ? (
          <div className="px-6 py-12 text-center">
            <div className="text-sm text-slate-400">Loading sample orders...</div>
          </div>
        ) : samples.length === 0 ? (
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
              {samples.map((sample) => {
                const statusStyle = getStatusStyle(sample.status);
                const isExpanded = expandedSample === sample.id;

                return (
                  <motion.div
                    key={sample.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group"
                  >
                    <div
                      className="px-6 py-4 flex items-center gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                      onClick={() => setExpandedSample(isExpanded ? null : sample.id)}
                    >
                      {/* Status indicator */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${statusStyle.bg} ${statusStyle.border} border`}>
                        <div className={`w-3 h-3 rounded-full ${statusStyle.dot}`} />
                      </div>

                      {/* Main info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-bold text-sm text-slate-900">{sample.poNumber}</span>
                          <div className="h-4 w-px bg-slate-200" />
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border ${statusStyle.bg} ${statusStyle.color} ${statusStyle.border}`}>
                            {sample.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Truck className="w-3 h-3" />
                            {sample.vendor}
                          </span>
                          <span>·</span>
                          <span>{totalVariants(sample)} unit{totalVariants(sample) !== 1 ? 's' : ''}</span>
                          <span>·</span>
                          <span>${(sample.total || 0).toFixed(2)}</span>
                          {sample.sampleType && (
                            <>
                              <span>·</span>
                              <span className={`font-medium ${
                                sample.sampleType === 'competitor' ? 'text-orange-600' : 'text-blue-600'
                              }`}>
                                {sample.sampleType === 'competitor' ? 'Competitor' : 'Pre-Production'}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Date & action */}
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs text-slate-500 mb-0.5">
                          {formatDate(sample.createdAt)}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          In-hands: {formatDate(sample.inHandsDate)}
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
                              {sample.variants && sample.variants.length > 0 && (
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
                                        {sample.variants.map((v, i) => (
                                          <tr key={v.id || i} className="border-b border-slate-100 last:border-0">
                                            <td className="px-3 py-2 font-medium text-slate-900">{v.sku || '—'}</td>
                                            <td className="px-3 py-2 text-slate-600">{v.size || '—'}</td>
                                            <td className="px-3 py-2 text-slate-600">{v.color || '—'}</td>
                                            <td className="px-3 py-2 text-right font-semibold text-slate-900">{v.qty}</td>
                                            <td className="px-3 py-2 text-right text-green-600 font-medium">${(v.costPerUnit || 0).toFixed(2)}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              )}

                              {/* Destinations */}
                              {sample.destinations && sample.destinations.length > 0 && (
                                <div>
                                  <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Destinations</h5>
                                  <div className="flex flex-wrap gap-2">
                                    {sample.destinations.map((d) => (
                                      <span key={d.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700">
                                        <Truck className="w-3 h-3 text-slate-400" />
                                        {d.location}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Notes */}
                              {sample.additionalNotes && (
                                <div>
                                  <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Notes</h5>
                                  <p className="text-sm text-slate-600">{sample.additionalNotes}</p>
                                </div>
                              )}

                              {/* Status timeline */}
                              <div>
                                <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status Pipeline</h5>
                                {(() => {
                                  const isCompetitor = sample.sampleType === 'competitor';
                                  const steps = isCompetitor
                                    ? ['Created', 'Submitted', 'Confirmed', 'Shipped', 'Delivered']
                                    : ['Created', 'Submitted', 'Confirmed', 'In Production', 'Shipped', 'Delivered'];
                                  const currentIndex = steps.indexOf(sample.status);
                                  const isIssue = sample.status === 'Issue';
                                  return (
                                    <>
                                      <div className="flex items-center gap-1">
                                        {steps.map((step, i) => {
                                          const isActive = !isIssue && i <= currentIndex;
                                          const isCurrent = step === sample.status;
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
                                            step === sample.status ? 'font-bold text-blue-600'
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

        {feedbackSamples.length === 0 && (
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
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              Upload File
            </motion.div>
          </label>
          <input
            id="sample-file-upload"
            type="file"
            multiple
            accept="*/*"
            onChange={handleSampleFileUpload}
            className="hidden"
          />
        </div>
        <div className="p-6">
          {sampleFiles.length > 0 ? (
            <div className="space-y-2">
              <AnimatePresence>
                {sampleFiles.map((uf, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileText className="w-5 h-5 text-purple-600 shrink-0" />
                      <div className="min-w-0 flex-1">
                        {renamingIndex === index ? (
                          <input
                            ref={renameInputRef}
                            type="text"
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onBlur={() => confirmRename(index)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') confirmRename(index);
                              if (e.key === 'Escape') { setRenamingIndex(null); setRenameValue(''); }
                            }}
                            className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          />
                        ) : (
                          <p className="text-sm font-medium text-slate-900 truncate">{uf.displayName}</p>
                        )}
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-slate-500">{(uf.file.size / 1024).toFixed(2)} KB</p>
                          {uf.category && (
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${categoryColor(uf.category)}`}>
                              {uf.category}
                            </span>
                          )}
                          <span className="text-xs text-slate-400">·</span>
                          <span className="text-xs text-slate-500">{uf.uploadedBy}</span>
                          <span className="text-xs text-slate-400">·</span>
                          <span className="text-xs text-slate-500">{new Date(uf.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <CategoryTagDropdown
                        value={uf.category}
                        onChange={(cat) => updateFileCategory(index, cat)}
                      />
                      <button
                        onClick={() => startRename(index)}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                        title="Rename"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDownloadSampleFile(uf)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setFileToDelete({ file: uf.file, index });
                          setDeleteModalOpen(true);
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-2xl flex items-center justify-center">
                <FileText className="w-8 h-8 text-slate-400" />
              </div>
              <h4 className="font-bold text-slate-900 mb-2">No sample files uploaded</h4>
              <p className="text-sm text-slate-600 mb-4">
                Upload documents, images, specs, or certificates for your samples
              </p>
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
        onSuccess={() => {}}
      />

      {/* Order Sample Drawer */}
      <OrderSampleDrawer
        isOpen={isOrderSampleDrawerOpen}
        onClose={() => setIsOrderSampleDrawerOpen(false)}
        productId={productId}
        onSuccess={() => {
          fetchSamples();
        }}
      />

      {/* Delete Document Modal */}
      <DeleteDocumentModal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setFileToDelete(null); }}
        onConfirm={() => {
          if (fileToDelete) {
            setSampleFiles(prev => prev.filter((_, i) => i !== fileToDelete.index));
            toast.success('File deleted successfully');
          }
          setDeleteModalOpen(false);
          setFileToDelete(null);
        }}
        fileName={fileToDelete ? sampleFiles[fileToDelete.index]?.displayName || '' : ''}
      />
    </div>
  );
}