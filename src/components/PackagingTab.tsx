import { motion, AnimatePresence } from 'motion/react';
import { Package, Upload, FileText, Download, Box, Trash2, Save, Edit, ChevronDown, Check } from 'lucide-react';
import { ChecklistWidget, ChecklistItem } from './ChecklistWidget';
import { UnitDropdown } from './UnitDropdown';
import { DeleteDocumentModal } from './DeleteDocumentModal';
import { ImagePopupModal } from './ImagePopupModal';
import { CategoryTagDropdown, categoryColor } from './CategoryTagDropdown';
import { downloadSavedFile } from '../lib/downloadFile';
import { uploadFileViaApi, recordUpload } from '../utils/uploadViaApi';
import { toast } from 'sonner';
import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

const isImageFile = (fileName: string) => {
  const ext = fileName?.split('.').pop()?.toLowerCase() ?? '';
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext);
};
const getProxyUrl = (f: any) => f.key ? `/api/files/image?key=${encodeURIComponent(f.key)}` : f.fileUrl;

// Portal-based dropdown (reference styling, green accent)
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

const handleDownloadSavedFile = async (f: any) => {
  try {
    await downloadSavedFile(f);
  } catch {
    toast.error('Failed to download file');
  }
};

interface PackagingTabProps {
  productId?: string;
  sizeVariants?: string[];
  onChecklistChanged?: (all: Record<string, ChecklistItem[]>) => void;
  onActivityDetected?: () => void;
}

type PackagingVariantSpec = {
  length: string;
  lengthUnit: string;
  width: string;
  widthUnit: string;
  height: string;
  heightUnit: string;
  weight: string;
  weightUnit: string;
  unitsPerCase: string;
};

const emptyPackagingVariantSpec = (): PackagingVariantSpec => ({
  length: '',
  lengthUnit: 'in',
  width: '',
  widthUnit: 'in',
  height: '',
  heightUnit: 'in',
  weight: '',
  weightUnit: 'lbs',
  unitsPerCase: '',
});

export function PackagingTab({ productId = '', sizeVariants = [], onChecklistChanged, onActivityDetected }: PackagingTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [savedFiles, setSavedFiles] = useState<any[]>([]);
  const [previewImage, setPreviewImage] = useState<any>(null);
  const [primaryPackaging, setPrimaryPackaging] = useState('');
  const [customPrimaryPackaging, setCustomPrimaryPackaging] = useState('');
  const [packagingMaterial, setPackagingMaterial] = useState('');
  const [customPackagingMaterial, setCustomPackagingMaterial] = useState('');
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<{ file: File; index: number } | null>(null);

  // Dimensions
  const [length, setLength] = useState('');
  const [lengthUnit, setLengthUnit] = useState('in');
  const [width, setWidth] = useState('');
  const [widthUnit, setWidthUnit] = useState('in');
  const [height, setHeight] = useState('');
  const [heightUnit, setHeightUnit] = useState('in');
  const [unitsPerCase, setUnitsPerCase] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Per-size packaging specs (mirrors variant dimensions in SpecificationsTab)
  const [packagingVariantSpecs, setPackagingVariantSpecs] = useState<Record<string, PackagingVariantSpec>>({});

  const sizeVariantsKey = sizeVariants.join('|');
  useEffect(() => {
    setPackagingVariantSpecs(prev => {
      const prevKeys = Object.keys(prev);
      const sameKeys =
        prevKeys.length === sizeVariants.length &&
        sizeVariants.every(s => s in prev);
      if (sameKeys) return prev;
      const next: Record<string, PackagingVariantSpec> = {};
      for (const size of sizeVariants) {
        next[size] = prev[size] ?? emptyPackagingVariantSpec();
      }
      return next;
    });
  }, [sizeVariantsKey]);

  const updatePackagingVariantField = (size: string, field: keyof PackagingVariantSpec, value: string) => {
    setPackagingVariantSpecs(prev => ({
      ...prev,
      [size]: { ...(prev[size] ?? emptyPackagingVariantSpec()), [field]: value },
    }));
  };

  useEffect(() => {
    if (productId) {
      fetchPackaging();
      fetchSavedFiles();
    }
  }, [productId]);

  const fetchPackaging = async () => {
    // Reset to defaults so switching products doesn't bleed previous values.
    setLength(''); setLengthUnit('in');
    setWidth(''); setWidthUnit('in');
    setHeight(''); setHeightUnit('in');
    setUnitsPerCase('');
    setPrimaryPackaging(''); setCustomPrimaryPackaging('');
    setPackagingMaterial(''); setCustomPackagingMaterial('');
    setSpecialRequirements('');

    try {
      const res = await fetch(`/api/pipeline/packaging/get?productId=${encodeURIComponent(productId)}`);
      if (!res.ok) return;
      const { packaging } = await res.json();
      if (!packaging) return;
      setLength(packaging.length ?? '');
      setLengthUnit(packaging.lengthUnit ?? 'in');
      setWidth(packaging.width ?? '');
      setWidthUnit(packaging.widthUnit ?? 'in');
      setHeight(packaging.height ?? '');
      setHeightUnit(packaging.heightUnit ?? 'in');
      setUnitsPerCase(
        packaging.unitsPerCase === null || packaging.unitsPerCase === undefined
          ? ''
          : String(packaging.unitsPerCase)
      );
      setPrimaryPackaging(packaging.primaryPackaging ?? '');
      setCustomPrimaryPackaging(packaging.customPrimaryPackaging ?? '');
      setPackagingMaterial(packaging.packagingMaterial ?? '');
      setCustomPackagingMaterial(packaging.customPackagingMaterial ?? '');
      setSpecialRequirements(packaging.specialRequirements ?? '');
      // Merge, don't replace: the reconcile effect may have seeded empty
      // placeholders for the current size set, and saved packagingVariantSpecs
      // can be `{}` for products saved before sizes were defined.
      if (packaging.packagingVariantSpecs && typeof packaging.packagingVariantSpecs === 'object') {
        setPackagingVariantSpecs(prev => ({ ...prev, ...packaging.packagingVariantSpecs }));
      }
    } catch {
      // silent
    }
  };

  const fetchSavedFiles = async () => {
    // Pull from every packaging-related entity type so files previously
    // uploaded to the legacy mockup/dieline/spec buckets keep showing up
    // after the UI is unified into one section.
    const fetchType = async (entityType: string) => {
      const res = await fetch(`/api/files/list?entityType=${entityType}&entityId=${encodeURIComponent(productId)}`);
      if (!res.ok) return [];
      const { uploads } = await res.json();
      return uploads ?? [];
    };
    const [combined, legacyMockup, legacyDieline, legacySpec] = await Promise.all([
      fetchType('pipeline-packaging'),
      fetchType('pipeline-packaging-mockup'),
      fetchType('pipeline-packaging-dieline'),
      fetchType('pipeline-packaging-spec'),
    ]);
    setSavedFiles([...combined, ...legacyMockup, ...legacyDieline, ...legacySpec]);
  };

  const handleSavePackaging = async () => {
    if (!productId) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/pipeline/packaging/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          length: length ? parseFloat(length) : null,
          lengthUnit,
          width: width ? parseFloat(width) : null,
          widthUnit,
          height: height ? parseFloat(height) : null,
          heightUnit,
          unitsPerCase: unitsPerCase ? parseInt(unitsPerCase, 10) : null,
          primaryPackaging,
          customPrimaryPackaging,
          packagingMaterial,
          customPackagingMaterial,
          specialRequirements,
          packagingVariantSpecs,
        }),
      });
      if (!res.ok) throw new Error('Failed to save');
      toast.success('Packaging saved successfully');
      setIsEditing(false);
      onActivityDetected?.();
    } catch {
      toast.error('Failed to save packaging');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (productId) fetchPackaging();
  };

  const uploadFileToS3 = async (file: File): Promise<void> => {
    const entityType = 'pipeline-packaging';
    const { key } = await uploadFileViaApi(file, entityType, productId);
    await recordUpload({
      key,
      fileName: file.name,
      fileType: file.type,
      size: file.size,
      entityType,
      entityId: productId,
    });
  };

  const handleDeleteSavedFile = async (fileId: string) => {
    try {
      const res = await fetch('/api/files/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: fileId }),
      });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('File deleted');
      await fetchSavedFiles();
      onActivityDetected?.();
    } catch {
      toast.error('Failed to delete file');
    }
  };

  const updateSavedFileCategory = async (file: any, category: string) => {
    const previous = savedFiles;
    setSavedFiles(prev => prev.map(f => f.id === file.id ? { ...f, category } : f));
    try {
      const res = await fetch('/api/files/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: file.id, category }),
      });
      if (!res.ok) {
        setSavedFiles(previous);
        toast.error('Failed to update category');
        return;
      }
      toast.success(category ? `Category set to "${category}"` : 'Category removed', { duration: 2000 });
      onActivityDetected?.();
    } catch {
      setSavedFiles(previous);
      toast.error('Failed to update category');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = event.target.files;
    if (!uploaded || uploaded.length === 0) return;
    const fileArray = Array.from(uploaded);
    if (productId) {
      for (const f of fileArray) { try { await uploadFileToS3(f); } catch {} }
      await fetchSavedFiles();
      onActivityDetected?.();
    } else {
      setFiles([...files, ...fileArray]);
    }
    toast.success(`${uploaded.length} file${uploaded.length > 1 ? 's' : ''} uploaded successfully`, { duration: 3000 });
  };

  const handleDeleteFile = () => {
    if (fileToDelete) {
      setFiles(files.filter((_, i) => i !== fileToDelete.index));
      setDeleteModalOpen(false);
      setFileToDelete(null);
    }
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
              onClick={handleSavePackaging}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save'}
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
          {sizeVariants.length === 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Length</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="0.00"
                      value={length}
                      onChange={(e) => setLength(e.target.value)}
                      disabled={!isEditing}
                      className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                    <UnitDropdown options={['in', 'cm', 'mm']} defaultOption="in" value={lengthUnit} onChange={setLengthUnit} disabled={!isEditing} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Width</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="0.00"
                      value={width}
                      onChange={(e) => setWidth(e.target.value)}
                      disabled={!isEditing}
                      className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                    <UnitDropdown options={['in', 'cm', 'mm']} defaultOption="in" value={widthUnit} onChange={setWidthUnit} disabled={!isEditing} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Height</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="0.00"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      disabled={!isEditing}
                      className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                    <UnitDropdown options={['in', 'cm', 'mm']} defaultOption="in" value={heightUnit} onChange={setHeightUnit} disabled={!isEditing} />
                  </div>
                </div>
              </div>

              <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Number of Units per Case</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={1}
                    placeholder="0"
                    value={unitsPerCase}
                    onKeyDown={(e) => {
                      if (['-', '+', 'e', 'E', '.', ','].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e) => {
                      const digitsOnly = e.target.value.replace(/[^0-9]/g, '');
                      setUnitsPerCase(digitsOnly);
                    }}
                    disabled={!isEditing}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">Packaging dimensions per size.</p>
              {sizeVariants.map((size) => {
                const vs = packagingVariantSpecs[size] ?? emptyPackagingVariantSpec();
                const hasDims = !!(vs.length || vs.width || vs.height);
                const hasWeight = !!vs.weight;
                const hasUnitsPerCase = !!vs.unitsPerCase;
                return (
                  <div
                    key={size}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-[100px_minmax(0,1fr)_160px_140px] gap-4 items-center">
                      <div>
                        <div className="text-[11px] font-medium text-slate-500 mb-1">Size</div>
                        <div className="text-sm font-semibold text-blue-700">{size}</div>
                      </div>

                      <div>
                        <div className="text-[11px] font-medium text-slate-500 mb-1">Packaging (L × W × H)</div>
                        {isEditing ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              placeholder="L"
                              value={vs.length}
                              onChange={(e) => updatePackagingVariantField(size, 'length', e.target.value)}
                              className="w-16 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                            <span className="text-slate-400 text-xs">×</span>
                            <input
                              type="number"
                              placeholder="W"
                              value={vs.width}
                              onChange={(e) => updatePackagingVariantField(size, 'width', e.target.value)}
                              className="w-16 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                            <span className="text-slate-400 text-xs">×</span>
                            <input
                              type="number"
                              placeholder="H"
                              value={vs.height}
                              onChange={(e) => updatePackagingVariantField(size, 'height', e.target.value)}
                              className="w-16 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                            <UnitDropdown
                              options={['in', 'cm', 'mm']}
                              defaultOption="in"
                              value={vs.lengthUnit || 'in'}
                              onChange={(u) => {
                                updatePackagingVariantField(size, 'lengthUnit', u);
                                updatePackagingVariantField(size, 'widthUnit', u);
                                updatePackagingVariantField(size, 'heightUnit', u);
                              }}
                              disabled={!isEditing}
                            />
                          </div>
                        ) : hasDims ? (
                          <div className="text-sm font-semibold text-slate-900">
                            {(vs.length || '–')} × {(vs.width || '–')} × {(vs.height || '–')} {vs.lengthUnit || 'in'}
                          </div>
                        ) : (
                          <div className="text-sm text-slate-400">Not set</div>
                        )}
                      </div>

                      <div>
                        <div className="text-[11px] font-medium text-slate-500 mb-1">Weight</div>
                        {isEditing ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              placeholder="0.0"
                              value={vs.weight}
                              onChange={(e) => updatePackagingVariantField(size, 'weight', e.target.value)}
                              className="w-20 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                            <UnitDropdown
                              options={['lbs', 'kg', 'oz', 'g']}
                              defaultOption="lbs"
                              value={vs.weightUnit || 'lbs'}
                              onChange={(u) => updatePackagingVariantField(size, 'weightUnit', u)}
                              disabled={!isEditing}
                            />
                          </div>
                        ) : hasWeight ? (
                          <div className="text-sm font-semibold text-slate-900">
                            {vs.weight} {vs.weightUnit || 'lbs'}
                          </div>
                        ) : (
                          <div className="text-sm text-slate-400">Not set</div>
                        )}
                      </div>

                      <div>
                        <div className="text-[11px] font-medium text-slate-500 mb-1">Units / Case</div>
                        {isEditing ? (
                          <input
                            type="number"
                            inputMode="numeric"
                            min={0}
                            step={1}
                            placeholder="0"
                            value={vs.unitsPerCase}
                            onKeyDown={(e) => {
                              if (['-', '+', 'e', 'E', '.', ','].includes(e.key)) {
                                e.preventDefault();
                              }
                            }}
                            onChange={(e) => {
                              const digitsOnly = e.target.value.replace(/[^0-9]/g, '');
                              updatePackagingVariantField(size, 'unitsPerCase', digitsOnly);
                            }}
                            className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          />
                        ) : hasUnitsPerCase ? (
                          <div className="text-sm font-semibold text-slate-900">{vs.unitsPerCase}</div>
                        ) : (
                          <div className="text-sm text-slate-400">Not set</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
              <>
                <PortalDropdown
                  value={primaryPackaging}
                  onChange={(v) => {
                    setPrimaryPackaging(v);
                    if (v !== 'Custom') setCustomPrimaryPackaging('');
                  }}
                  options={['Poly Bag', 'Box', 'Blister Pack', 'Clamshell', 'Shrink Wrap', 'Envelope', 'Tube', 'Custom']}
                  placeholder="Select packaging type..."
                />
                {primaryPackaging === 'Custom' && (
                  <motion.input
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    type="text"
                    value={customPrimaryPackaging}
                    onChange={(e) => setCustomPrimaryPackaging(e.target.value)}
                    placeholder="Enter custom packaging type..."
                    className="mt-2 w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm"
                  />
                )}
              </>
            ) : (
              <div className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900">
                {primaryPackaging === 'Custom' && customPrimaryPackaging
                  ? customPrimaryPackaging
                  : primaryPackaging || <span className="text-slate-400">Not set</span>}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Material</label>
            {isEditing ? (
              <>
                <PortalDropdown
                  value={packagingMaterial}
                  onChange={(v) => {
                    setPackagingMaterial(v);
                    if (v !== 'Other') setCustomPackagingMaterial('');
                  }}
                  options={['Cardboard', 'Corrugated', 'Plastic', 'Biodegradable', 'Metal', 'Glass', 'Kraft Paper', 'Foam', 'Other']}
                  placeholder="Select material..."
                />
                {packagingMaterial === 'Other' && (
                  <motion.input
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    type="text"
                    value={customPackagingMaterial}
                    onChange={(e) => setCustomPackagingMaterial(e.target.value)}
                    placeholder="Enter custom material..."
                    className="mt-2 w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm"
                  />
                )}
              </>
            ) : (
              <div className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900">
                {packagingMaterial === 'Other' && customPackagingMaterial
                  ? customPackagingMaterial
                  : packagingMaterial || <span className="text-slate-400">Not set</span>}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Special Requirements</label>
            <textarea
              rows={3}
              placeholder="Enter any special packaging requirements..."
              value={specialRequirements}
              onChange={(e) => setSpecialRequirements(e.target.value)}
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
          {savedFiles.length > 0 || files.length > 0 ? (
            <div className="space-y-2">
              <AnimatePresence>
                {savedFiles.map((f) => (
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
                          className="w-8 h-8 rounded overflow-hidden flex-shrink-0 border border-slate-200 cursor-pointer hover:ring-2 hover:ring-blue-400 hover:border-blue-400 transition-all"
                        >
                          <img src={getProxyUrl(f)} alt={f.fileName} className="w-full h-full object-cover" />
                        </motion.button>
                      ) : (
                        <FileText className="w-5 h-5 text-purple-600 shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900 truncate">{f.fileName}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <p className="text-xs text-slate-500">{f.size ? `${(f.size / 1024).toFixed(2)} KB` : ''}</p>
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
                        onChange={(cat) => updateSavedFileCategory(f, cat)}
                      />
                      {(f.key || f.fileUrl) && (
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleDownloadSavedFile(f)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Download">
                          <Download className="w-4 h-4" />
                        </motion.button>
                      )}
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleDeleteSavedFile(f.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
                {files.map((file, index) => (
                  <motion.div
                    key={`local-${index}`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileText className="w-5 h-5 text-purple-600 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                        <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => { const url = URL.createObjectURL(file); const a = document.createElement('a'); a.href = url; a.download = file.name; a.click(); URL.revokeObjectURL(url); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Download">
                        <Download className="w-4 h-4" />
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => { setFileToDelete({ file, index }); setDeleteModalOpen(true); }} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
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

      {/* Checklist - Moved to Bottom */}
      <ChecklistWidget
        productId={productId}
        tabId="packaging"
        onChecklistChanged={onChecklistChanged}
        onActivityDetected={onActivityDetected}
      />

      {/* Delete Document Modal */}
      <DeleteDocumentModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteFile}
        fileName={fileToDelete?.file.name || ''}
      />

      {/* Image Preview Modal */}
      <ImagePopupModal
        isOpen={!!previewImage}
        onClose={() => setPreviewImage(null)}
        imageUrl={previewImage ? getProxyUrl(previewImage) : ''}
        productName={previewImage?.fileName || 'Image'}
      />
    </div>
  );
}