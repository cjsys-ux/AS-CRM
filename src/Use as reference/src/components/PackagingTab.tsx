import { motion, AnimatePresence } from 'motion/react';
import { Package, Upload, FileText, Download, Box, Trash2, Save, Edit, Pencil, ChevronDown, Check } from 'lucide-react';
import { ChecklistWidget, ChecklistItem } from './ChecklistWidget';
import { UnitDropdown } from './UnitDropdown';
import { DeleteDocumentModal } from './DeleteDocumentModal';
import { CategoryTagDropdown, categoryColor } from './CategoryTagDropdown';
import { toast } from 'sonner@2.0.3';
import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface PackagingData {
  length: string;
  lengthUnit: string;
  width: string;
  widthUnit: string;
  height: string;
  heightUnit: string;
  primaryPackaging: string;
  packagingMaterial: string;
  specialRequirements: string;
}

interface UploadedFile {
  file: File;
  displayName: string;
  category: string;
  uploadedBy: string;
  uploadedAt: string;
}

// Portal-based dropdown matching specs tab style
function PortalDropdown({ value, onChange, options, placeholder, disabled }: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });

  const updatePos = useCallback(() => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 4, left: r.left, width: r.width });
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePos();
    const onScroll = () => updatePos();
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll, true); window.removeEventListener('resize', onScroll); };
  }, [open, updatePos]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (btnRef.current?.contains(e.target as Node)) return;
      if (menuRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className={`w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-left hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        <span className={`text-sm ${value ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>
          {value || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && createPortal(
        <div
          ref={menuRef}
          style={{ position: 'fixed', top: pos.top, left: pos.left, width: pos.width, zIndex: 99999 }}
          className="bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden"
        >
          <div className="max-h-64 overflow-y-auto py-1">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => { onChange(option); setOpen(false); }}
                className={`w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center justify-between ${
                  value === option
                    ? 'bg-green-50 text-green-700 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{option}</span>
                {value === option && <Check className="w-3.5 h-3.5 text-green-600" />}
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

interface PackagingTabProps {
  productId?: string;
  onChecklistChanged?: (allChecklists: Record<string, ChecklistItem[]>) => void;
  onActivityDetected?: () => void;
}

const PACKAGING_TYPES = ['Poly Bag', 'Box', 'Blister Pack', 'Clamshell', 'Shrink Wrap', 'Envelope', 'Tube', 'Custom'];
const PACKAGING_MATERIALS = ['Cardboard', 'Corrugated', 'Plastic', 'Biodegradable', 'Metal', 'Glass', 'Kraft Paper', 'Foam', 'Other'];

const getStorageKey = (productId?: string) => `packaging:${productId || 'default'}`;

const defaultData: PackagingData = {
  length: '', lengthUnit: 'in',
  width: '', widthUnit: 'in',
  height: '', heightUnit: 'in',
  primaryPackaging: '',
  packagingMaterial: '',
  specialRequirements: '',
};

export function PackagingTab({ productId, onChecklistChanged, onActivityDetected }: PackagingTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [data, setData] = useState<PackagingData>(defaultData);
  const [savedData, setSavedData] = useState<PackagingData>(defaultData);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [renamingIndex, setRenamingIndex] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const renameInputRef = useRef<HTMLInputElement>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<{ file: UploadedFile; index: number } | null>(null);

  useEffect(() => {
    const key = getStorageKey(productId);
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setData(parsed);
        setSavedData(parsed);
      } catch {}
    }
  }, [productId]);

  const updateField = (field: keyof PackagingData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    const key = getStorageKey(productId);
    localStorage.setItem(key, JSON.stringify(data));
    setSavedData({ ...data });
    setIsEditing(false);
    onActivityDetected?.();
    toast.success('Packaging specifications saved successfully');
  };

  const handleCancel = () => {
    setData({ ...savedData });
    setIsEditing(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files;
    if (uploadedFiles && uploadedFiles.length > 0) {
      const newFiles: UploadedFile[] = Array.from(uploadedFiles).map(f => ({
        file: f,
        displayName: f.name,
        category: '',
        uploadedBy: 'User', // Placeholder for the actual user
        uploadedAt: new Date().toISOString(), // Current timestamp
      }));
      setFiles(prev => [...prev, ...newFiles]);
      toast.success(`${uploadedFiles.length} file${uploadedFiles.length > 1 ? 's' : ''} uploaded successfully`);
    }
  };

  const handleDownloadFile = (uf: UploadedFile) => {
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
    const name = files[index].displayName;
    const lastDot = name.lastIndexOf('.');
    setRenameValue(lastDot > 0 ? name.substring(0, lastDot) : name);
    setRenamingIndex(index);
    setTimeout(() => renameInputRef.current?.focus(), 50);
  };

  const confirmRename = (index: number) => {
    if (renameValue.trim()) {
      const origName = files[index].file.name;
      const lastDot = origName.lastIndexOf('.');
      const ext = lastDot > 0 ? origName.substring(lastDot) : '';
      const newName = renameValue.trim() + ext;
      setFiles(prev => prev.map((f, i) => i === index ? { ...f, displayName: newName } : f));
      toast.success('File renamed', { description: `Renamed to "${newName}"`, duration: 2000 });
    }
    setRenamingIndex(null);
    setRenameValue('');
  };

  const updateFileCategory = (index: number, category: string) => {
    setFiles(prev => prev.map((f, i) => i === index ? { ...f, category } : f));
  };

  return (
    <div className="space-y-6">
      {/* Edit / Save controls */}
      <div className="flex items-center justify-end gap-2">
        {isEditing ? (
          <>
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm"
          >
            <Edit className="w-4 h-4" />
            Edit Packaging
          </button>
        )}
      </div>

      {/* Packaging Dimensions */}
      <div className="bg-white rounded-xl border-2 border-slate-200 overflow-visible">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-3">
          <Box className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-slate-900">Packaging Dimensions</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {(['length', 'width', 'height'] as const).map((dim) => (
              <div key={dim}>
                <label className="block text-sm font-medium text-slate-700 mb-2 capitalize">{dim}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="0.00"
                    value={data[dim]}
                    onChange={(e) => updateField(dim, e.target.value)}
                    disabled={!isEditing}
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                  <UnitDropdown
                    options={['in', 'cm', 'mm']}
                    defaultOption="in"
                    value={data[`${dim}Unit`]}
                    onChange={(v) => updateField(`${dim}Unit`, v)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Packaging Type */}
      <div className="bg-white rounded-xl border-2 border-slate-200 overflow-visible">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-3">
          <Package className="w-5 h-5 text-green-600" />
          <h3 className="font-bold text-slate-900">Packaging Type</h3>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Primary Packaging</label>
            {isEditing ? (
              <PortalDropdown
                value={data.primaryPackaging}
                onChange={(v) => updateField('primaryPackaging', v)}
                options={PACKAGING_TYPES}
                placeholder="Select packaging type..."
              />
            ) : (
              <div className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900">
                {data.primaryPackaging || <span className="text-slate-400">Not set</span>}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Material</label>
            {isEditing ? (
              <PortalDropdown
                value={data.packagingMaterial}
                onChange={(v) => updateField('packagingMaterial', v)}
                options={PACKAGING_MATERIALS}
                placeholder="Select material..."
              />
            ) : (
              <div className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900">
                {data.packagingMaterial || <span className="text-slate-400">Not set</span>}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Special Requirements</label>
            <textarea
              rows={3}
              placeholder="Enter any special packaging requirements..."
              value={data.specialRequirements}
              onChange={(e) => updateField('specialRequirements', e.target.value)}
              disabled={!isEditing}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Packaging Documents & Files */}
      <div className="bg-white rounded-xl border-2 border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-slate-900">Packaging Documents & Files</h3>
          </div>
          <label htmlFor="packaging-file-upload">
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
            id="packaging-file-upload"
            type="file"
            multiple
            accept="*/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
        <div className="p-6">
          {files.length > 0 ? (
            <div className="space-y-2">
              <AnimatePresence>
                {files.map((uf, index) => (
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
                        onClick={() => handleDownloadFile(uf)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setFileToDelete({ file: uf, index });
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
              <h4 className="font-bold text-slate-900 mb-2">No packaging files uploaded</h4>
              <p className="text-sm text-slate-600 mb-4">
                Upload mockups, dielines, CAD files, spec sheets, or any packaging documents
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Checklist */}
      <ChecklistWidget
        productId={productId}
        tabId="packaging"
        onChecklistChanged={onChecklistChanged}
        onActivityDetected={onActivityDetected}
      />

      {/* Delete Document Modal */}
      <DeleteDocumentModal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setFileToDelete(null); }}
        onConfirm={() => {
          if (fileToDelete) {
            setFiles(prev => prev.filter((_, i) => i !== fileToDelete.index));
            toast.success('File deleted successfully');
          }
          setDeleteModalOpen(false);
          setFileToDelete(null);
        }}
        fileName={fileToDelete?.file.displayName || ''}
      />
    </div>
  );
}