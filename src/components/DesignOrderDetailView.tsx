import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Upload, CheckCircle, Clock, AlertTriangle, Image as ImageIcon, FileText, Eye, X, RotateCcw, ThumbsUp, ThumbsDown, Package, User, Calendar, Hash, MessageSquare, History, ChevronDown, Download, Trash2, FolderOpen, FileImage, Building2, Paperclip } from 'lucide-react';
import { useState, useRef } from 'react';
import { toast } from 'sonner@2.0.3';
import type { DesignTask, RevisionEntry, DesignFile } from './DesignLabModule';


interface DesignOrderDetailViewProps {
  task: DesignTask;
  onBack: () => void;
  onTaskUpdated: () => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Design Approved':
    case 'Approved': return 'bg-green-100 text-green-700 border-green-200';
    case 'Design Ready':
    case 'In Review':
    case 'Art Uploaded': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'Pending Design':
    case 'Pending Art': return 'bg-slate-100 text-slate-600 border-slate-200';
    case 'Revision Requested':
    case 'Revision Needed': return 'bg-amber-100 text-amber-700 border-amber-200';
    default: return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Design Approved':
    case 'Approved': return <CheckCircle className="w-4 h-4" />;
    case 'Design Ready':
    case 'In Review':
    case 'Art Uploaded': return <Eye className="w-4 h-4" />;
    case 'Pending Design':
    case 'Pending Art': return <Clock className="w-4 h-4" />;
    case 'Revision Requested':
    case 'Revision Needed': return <AlertTriangle className="w-4 h-4" />;
    default: return <Clock className="w-4 h-4" />;
  }
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export function DesignOrderDetailView({ task: initialTask, onBack, onTaskUpdated }: DesignOrderDetailViewProps) {
  const [task, setTask] = useState<DesignTask>(initialTask);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'files' | 'history'>('upload');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [revisionFeedback, setRevisionFeedback] = useState('');
  const [artPreview, setArtPreview] = useState<string | null>(task.artFile);
  const [mockupPreview, setMockupPreview] = useState<string | null>(task.mockupFile);
  const [artFileName, setArtFileName] = useState<string>(task.artFileName || '');
  const [mockupFileName, setMockupFileName] = useState<string>(task.mockupFileName || '');
  const [notes, setNotes] = useState(task.notes || '');
  const [assignedTo, setAssignedTo] = useState(task.assignedTo || '');
  const [files, setFiles] = useState<DesignFile[]>(task.files || []);
  const artInputRef = useRef<HTMLInputElement>(null);
  const mockupInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateTask = async (updates: Partial<DesignTask>) => {
    setSaving(true);
    try {
      const updated = { ...task, ...updates };
      setTask(updated);
      onTaskUpdated();
      return updated;
    } catch (err) {
      console.error('Error updating design task:', err);
      toast.error('Failed to update task');
    } finally {
      setSaving(false);
    }
    return null;
  };

  const [pendingArtData, setPendingArtData] = useState<string | null>(null);
  const [pendingMockupData, setPendingMockupData] = useState<string | null>(null);

  const handleFileSelect = (type: 'art' | 'mockup', file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (type === 'art') {
        setArtPreview(dataUrl);
        setArtFileName(file.name);
        setPendingArtData(dataUrl);
      } else {
        setMockupPreview(dataUrl);
        setMockupFileName(file.name);
        setPendingMockupData(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const uploadFile = async (_type: 'art' | 'mockup', base64Data: string, _fileName: string): Promise<string | null> => {
    onTaskUpdated();
    return base64Data;
  };

  const handleAddFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const newFile: DesignFile = {
        id: `file-${Date.now()}`,
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size,
        url: reader.result as string,
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'Designer',
      };
      const updatedFiles = [...files, newFile];
      setFiles(updatedFiles);
      await updateTask({ files: updatedFiles } as any);
      toast.success(`File "${file.name}" added`);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = async (fileId: string) => {
    const updatedFiles = files.filter(f => f.id !== fileId);
    setFiles(updatedFiles);
    await updateTask({ files: updatedFiles } as any);
    toast.success('File removed');
  };

  const handleSaveFiles = async () => {
    setSaving(true);
    try {
      if (pendingArtData && artFileName) {
        const url = await uploadFile('art', pendingArtData, artFileName);
        if (url) { setArtPreview(url); setPendingArtData(null); }
      }
      if (pendingMockupData && mockupFileName) {
        const url = await uploadFile('mockup', pendingMockupData, mockupFileName);
        if (url) { setMockupPreview(url); setPendingMockupData(null); }
      }
      const updates: Partial<DesignTask> = { notes, assignedTo };
      const hasArt = !!(pendingArtData || task.artFile || artPreview);
      if (hasArt && (task.status === 'Pending Design' || task.status === 'Pending Art' || task.status === 'Revision Requested' || task.status === 'Revision Needed')) {
        updates.status = 'Design Ready';
      }
      await updateTask(updates);
      toast.success('Files saved successfully');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!task.artFile && !artPreview && !pendingArtData) {
      toast.error('Please upload art file before submitting for review');
      return;
    }
    setSaving(true);
    try {
      if (pendingArtData && artFileName) {
        const url = await uploadFile('art', pendingArtData, artFileName);
        if (url) { setArtPreview(url); setPendingArtData(null); }
      }
      if (pendingMockupData && mockupFileName) {
        const url = await uploadFile('mockup', pendingMockupData, mockupFileName);
        if (url) { setMockupPreview(url); setPendingMockupData(null); }
      }
      const updates: Partial<DesignTask> = { status: 'Design Ready' };
      if (notes !== task.notes) updates.notes = notes;
      if (assignedTo !== task.assignedTo) updates.assignedTo = assignedTo;
      const updated = await updateTask(updates);
      if (updated) toast.success('Submitted — Design Ready');
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async () => {
    const updated = await updateTask({ status: 'Design Approved' });
    if (updated) {
      toast.success('Design approved!');
      setShowApprovalModal(false);
    }
  };

  const handleRequestRevision = async () => {
    if (!revisionFeedback.trim()) {
      toast.error('Please provide feedback for the revision');
      return;
    }
    const revisionEntry: RevisionEntry = {
      version: (task.currentRevision || 0) + 1,
      artFile: task.artFile,
      artFileName: task.artFileName,
      mockupFile: task.mockupFile,
      mockupFileName: task.mockupFileName,
      date: new Date().toISOString(),
      feedback: revisionFeedback,
      status: 'Revision Requested',
    };
    const updatedRevisions = [...(task.revisions || []), revisionEntry];
    const updated = await updateTask({
      status: 'Revision Requested',
      currentRevision: (task.currentRevision || 0) + 1,
      revisions: updatedRevisions,
    });
    if (updated) {
      toast.success('Revision requested');
      setShowApprovalModal(false);
      setRevisionFeedback('');
    }
  };

  const isFileUploaded = !!(task.artFile || artPreview);
  const canSubmitForReview = isFileUploaded && task.status !== 'Design Ready' && task.status !== 'Design Approved' && task.status !== 'In Review' && task.status !== 'Approved';

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <FileImage className="w-4 h-4 text-blue-500" />;
    return <FileText className="w-4 h-4 text-slate-500" />;
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-5">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex items-center justify-between mb-4">
            <motion.button
              whileHover={{ scale: 1.05, x: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Design Lab
            </motion.button>
            <div className="flex items-center gap-3">
              {task.currentRevision > 0 && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-sm font-semibold">
                  <RotateCcw className="w-3.5 h-3.5" />
                  Rev {task.currentRevision}
                </span>
              )}
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border ${getStatusColor(task.status)}`}>
                {getStatusIcon(task.status)}
                {task.status}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-200">
              {task.imageUrl ? (
                <img src={task.imageUrl} alt={task.itemName} className="w-full h-full object-cover" />
              ) : (
                <Package className="w-7 h-7 text-slate-400" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold text-slate-900 truncate">{task.itemName || 'Unnamed Item'}</h1>
              <div className="flex items-center gap-4 text-slate-500 text-sm mt-0.5 flex-wrap">
                <span className="flex items-center gap-1 whitespace-nowrap"><Hash className="w-3.5 h-3.5" />{task.id}</span>
                <span className="flex items-center gap-1 whitespace-nowrap"><FileText className="w-3.5 h-3.5" />{task.orderId}</span>
                <span className="flex items-center gap-1 whitespace-nowrap"><User className="w-3.5 h-3.5" />{task.customer}</span>
                {(task.vendor || task.supplier) && <span className="flex items-center gap-1 whitespace-nowrap"><Building2 className="w-3.5 h-3.5" />{task.vendor || task.supplier}</span>}
                {task.dueDate && <span className="flex items-center gap-1 whitespace-nowrap"><Calendar className="w-3.5 h-3.5" />{task.dueDate}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-[1600px] mx-auto">
          <div className="grid grid-cols-12 gap-6">
            {/* Left sidebar - Item Details, Designer, Notes */}
            <div className="col-span-3 space-y-5">
              {/* Item Details */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">Item Details</h3>
                <div className="space-y-2.5">
                  {[
                    { label: 'Product', value: task.itemName },
                    { label: 'SKU', value: task.sku || '—' },
                    { label: 'Quantity', value: task.quantity?.toString() || '—' },
                    { label: 'Variant', value: task.variant || '—' },
                    { label: 'Vendor', value: task.vendor || task.supplier || '—' },
                    { label: 'Order', value: `${task.orderName || ''} (${task.orderId})` },
                    { label: 'Customer', value: task.customer || '—' },
                    { label: 'Due Date', value: task.dueDate || '—' },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between items-center py-1.5 border-b border-slate-50 last:border-0">
                      <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{item.label}</span>
                      <span className="text-sm font-semibold text-slate-900 text-right max-w-[55%] truncate">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assigned Designer */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">Assigned Designer</h3>
                <input
                  type="text"
                  value={assignedTo}
                  onChange={e => setAssignedTo(e.target.value)}
                  placeholder="Enter designer name..."
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400"
                />
              </div>

              {/* Art Template from Product DB */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">Art Template</h3>
                {task.artTemplate ? (
                  <div className="space-y-3">
                    <div className="w-full h-32 bg-slate-50 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center">
                      {task.artTemplate.startsWith('data:image') || task.artTemplate.startsWith('http') ? (
                        <img src={task.artTemplate} alt="Art template" className="w-full h-full object-contain" />
                      ) : (
                        <FileImage className="w-10 h-10 text-slate-300" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <FileImage className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                      <span className="text-xs font-medium text-slate-700 truncate">{task.artTemplateName || 'Template'}</span>
                    </div>
                    <a
                      href={task.artTemplate}
                      download={task.artTemplateName || 'template'}
                      className="flex items-center justify-center gap-2 w-full py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download Template
                    </a>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-6 text-center">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-2">
                      <FileImage className="w-6 h-6 text-slate-300" />
                    </div>
                    <p className="text-xs text-slate-400">No art template assigned</p>
                    <p className="text-xs text-slate-400 mt-0.5">Templates are set in Product Database</p>
                  </div>
                )}
              </div>

              {/* Latest Revision Feedback */}
              {task.revisions && task.revisions.length > 0 && (
                <div className="bg-amber-50 rounded-2xl border-2 border-amber-200 p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <h3 className="text-sm font-bold text-amber-800 uppercase tracking-wider">Revision Feedback</h3>
                  </div>
                  <p className="text-sm text-amber-900 leading-relaxed">
                    {task.revisions[task.revisions.length - 1].feedback}
                  </p>
                  <div className="mt-2 text-xs text-amber-600">
                    Rev {task.revisions[task.revisions.length - 1].version} · {new Date(task.revisions[task.revisions.length - 1].date).toLocaleDateString()}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">Notes</h3>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Add notes about this design task..."
                  rows={4}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400 resize-none"
                />
              </div>
            </div>

            {/* Main content area */}
            <div className="col-span-9 space-y-5">
              {/* Tabs */}
              <div className="flex gap-1 bg-white rounded-xl border border-slate-200 p-1.5 shadow-sm">
                {[
                  { key: 'upload' as const, label: 'Art & Mockup', icon: <Upload className="w-4 h-4" /> },
                  { key: 'files' as const, label: `Files (${files.length})`, icon: <FolderOpen className="w-4 h-4" /> },
                  { key: 'history' as const, label: `Revision History (${task.revisions?.length || 0})`, icon: <History className="w-4 h-4" /> },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                      activeTab === tab.key
                        ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Upload Tab */}
              {activeTab === 'upload' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-5">
                    {/* Art File Upload */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <ImageIcon className="w-5 h-5 text-blue-500" />
                          Art File
                        </h3>
                        {artPreview && (
                          <button onClick={() => { setArtPreview(null); setArtFileName(''); setPendingArtData(null); }} className="text-xs text-red-500 hover:text-red-700 font-medium">
                            Remove
                          </button>
                        )}
                      </div>
                      <input ref={artInputRef} type="file" accept="image/*,.ai,.eps,.pdf,.svg" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileSelect('art', file); }} />
                      {artPreview ? (
                        <div className="space-y-3">
                          <div className="relative w-full h-44 bg-slate-100 rounded-xl overflow-hidden border-2 border-blue-200">
                            {artPreview.startsWith('data:image') || artPreview.startsWith('http') ? (
                              <img src={artPreview} alt="Art preview" className="w-full h-full object-contain" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center"><FileText className="w-12 h-12 text-blue-400" /></div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                            <span className="text-sm font-medium text-slate-700 truncate">{artFileName}</span>
                          </div>
                          <button onClick={() => artInputRef.current?.click()} className="w-full py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors">
                            Replace File
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => artInputRef.current?.click()} className="w-full h-44 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer">
                          <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center"><Upload className="w-7 h-7 text-blue-500" /></div>
                          <div className="text-center">
                            <p className="text-sm font-semibold text-slate-700">Upload Art File</p>
                            <p className="text-xs text-slate-400 mt-0.5">PNG, JPG, AI, EPS, PDF, SVG</p>
                          </div>
                        </button>
                      )}
                    </div>

                    {/* Mockup Upload */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <ImageIcon className="w-5 h-5 text-purple-500" />
                          Mockup
                        </h3>
                        {mockupPreview && (
                          <button onClick={() => { setMockupPreview(null); setMockupFileName(''); setPendingMockupData(null); }} className="text-xs text-red-500 hover:text-red-700 font-medium">
                            Remove
                          </button>
                        )}
                      </div>
                      <input ref={mockupInputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileSelect('mockup', file); }} />
                      {mockupPreview ? (
                        <div className="space-y-3">
                          <div className="relative w-full h-44 bg-slate-100 rounded-xl overflow-hidden border-2 border-purple-200">
                            {mockupPreview.startsWith('data:image') || mockupPreview.startsWith('http') ? (
                              <img src={mockupPreview} alt="Mockup preview" className="w-full h-full object-contain" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center"><FileText className="w-12 h-12 text-purple-400" /></div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-purple-500 flex-shrink-0" />
                            <span className="text-sm font-medium text-slate-700 truncate">{mockupFileName}</span>
                          </div>
                          <button onClick={() => mockupInputRef.current?.click()} className="w-full py-2 text-sm font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 transition-colors">
                            Replace File
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => mockupInputRef.current?.click()} className="w-full h-44 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-purple-400 hover:bg-purple-50/30 transition-all cursor-pointer">
                          <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center"><Upload className="w-7 h-7 text-purple-500" /></div>
                          <div className="text-center">
                            <p className="text-sm font-semibold text-slate-700">Upload Mockup</p>
                            <p className="text-xs text-slate-400 mt-0.5">PNG, JPG, PDF</p>
                          </div>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-3">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSaveFiles} disabled={saving} className="px-6 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors shadow-lg disabled:opacity-50 flex items-center gap-2">
                      {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                      Save Files
                    </motion.button>
                    {canSubmitForReview && (
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSubmitForReview} disabled={saving} className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg disabled:opacity-50 flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        Submit for Review
                      </motion.button>
                    )}
                    {(task.status === 'Design Ready' || task.status === 'In Review') && (
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowApprovalModal(true)} className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Review & Approve
                      </motion.button>
                    )}
                  </div>
                </div>
              )}

              {/* Files Tab */}
              {activeTab === 'files' && (
                <div className="space-y-5">
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <FolderOpen className="w-5 h-5 text-slate-500" />
                        Project Files
                      </h3>
                      <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(e) => { if (e.target.files) Array.from(e.target.files).forEach(handleAddFile); e.target.value = ''; }} />
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors">
                        <Paperclip className="w-4 h-4" />
                        Add Files
                      </motion.button>
                    </div>

                    {files.length === 0 ? (
                      <div className="flex flex-col items-center py-12 text-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                          <FolderOpen className="w-8 h-8 text-slate-300" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mb-1">No Files Yet</h4>
                        <p className="text-xs text-slate-500 max-w-xs">Upload project files such as brand guidelines, reference images, or source files.</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {files.map(file => (
                          <div key={file.id} className="flex items-center gap-4 py-3 group">
                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                              {file.type.startsWith('image/') && file.url ? (
                                <img src={file.url} alt={file.name} className="w-full h-full object-cover rounded-xl" />
                              ) : (
                                getFileIcon(file.type)
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-slate-900 truncate">{file.name}</p>
                              <p className="text-xs text-slate-400">{formatFileSize(file.size)} · {new Date(file.uploadedAt).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {file.url && (
                                <a href={file.url} download={file.name} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                                  <Download className="w-4 h-4" />
                                </a>
                              )}
                              <button onClick={() => handleRemoveFile(file.id)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* History Tab */}
              {activeTab === 'history' && (
                <div className="space-y-4">
                  {(!task.revisions || task.revisions.length === 0) ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-12 shadow-sm text-center">
                      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <History className="w-8 h-8 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">No Revisions Yet</h3>
                      <p className="text-sm text-slate-500">Revision history will appear here when changes are requested.</p>
                    </div>
                  ) : (
                    [...task.revisions].reverse().map((rev, idx) => (
                      <motion.div
                        key={rev.version}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                              <RotateCcw className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">Revision {rev.version}</p>
                              <p className="text-xs text-slate-500">{new Date(rev.date).toLocaleDateString()} at {new Date(rev.date).toLocaleTimeString()}</p>
                            </div>
                          </div>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold border ${
                            rev.status === 'Approved' || rev.status === 'Design Approved' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-amber-100 text-amber-700 border-amber-200'
                          }`}>
                            {rev.status}
                          </span>
                        </div>
                        <div className="bg-amber-50 rounded-xl p-4 mb-4 border border-amber-100">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Feedback</span>
                          </div>
                          <p className="text-sm text-amber-900">{rev.feedback}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Art File (v{rev.version})</p>
                            {rev.artFile && (rev.artFile.startsWith('data:image') || rev.artFile.startsWith('http')) ? (
                              <div className="w-full h-32 bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                                <img src={rev.artFile} alt={`Art v${rev.version}`} className="w-full h-full object-contain" />
                              </div>
                            ) : rev.artFileName ? (
                              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
                                <FileText className="w-4 h-4 text-blue-500" />
                                <span className="text-xs text-slate-700 truncate">{rev.artFileName}</span>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 italic">No art file</span>
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Mockup (v{rev.version})</p>
                            {rev.mockupFile && (rev.mockupFile.startsWith('data:image') || rev.mockupFile.startsWith('http')) ? (
                              <div className="w-full h-32 bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                                <img src={rev.mockupFile} alt={`Mockup v${rev.version}`} className="w-full h-full object-contain" />
                              </div>
                            ) : rev.mockupFileName ? (
                              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
                                <FileText className="w-4 h-4 text-purple-500" />
                                <span className="text-xs text-slate-700 truncate">{rev.mockupFileName}</span>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 italic">No mockup</span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Approval Modal */}
      <AnimatePresence>
        {showApprovalModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowApprovalModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Review Design
                  </h3>
                  <button onClick={() => setShowApprovalModal(false)} className="text-white/70 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-green-100 text-sm mt-1">Approve the design or request revisions</p>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Art File</p>
                    {(artPreview || task.artFile) ? (
                      <div className="w-full h-28 bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                        {(artPreview || task.artFile)?.startsWith('data:image') || (artPreview || task.artFile)?.startsWith('http') ? (
                          <img src={artPreview || task.artFile || ''} alt="Art" className="w-full h-full object-contain" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><FileText className="w-8 h-8 text-blue-400" /></div>
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-28 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-200">
                        <span className="text-xs text-slate-400">No art</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Mockup</p>
                    {(mockupPreview || task.mockupFile) ? (
                      <div className="w-full h-28 bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                        {(mockupPreview || task.mockupFile)?.startsWith('data:image') || (mockupPreview || task.mockupFile)?.startsWith('http') ? (
                          <img src={mockupPreview || task.mockupFile || ''} alt="Mockup" className="w-full h-full object-contain" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><FileText className="w-8 h-8 text-purple-400" /></div>
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-28 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-200">
                        <span className="text-xs text-slate-400">No mockup</span>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                    Feedback (required for revisions)
                  </label>
                  <textarea
                    value={revisionFeedback}
                    onChange={e => setRevisionFeedback(e.target.value)}
                    placeholder="Describe what changes are needed..."
                    rows={3}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 resize-none"
                  />
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleApprove} disabled={saving} className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg disabled:opacity-50">
                    <ThumbsUp className="w-4 h-4" />
                    Approve
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleRequestRevision} disabled={saving || !revisionFeedback.trim()} className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg disabled:opacity-50">
                    <ThumbsDown className="w-4 h-4" />
                    Request Revision
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
