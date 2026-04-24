import { motion, AnimatePresence } from 'motion/react';
import { Ruler, Weight, Package, Layers, FileText, Upload, Download, Trash2, Plus, X, ChevronDown, Save, Edit, Check } from 'lucide-react';
import { ChecklistWidget } from './ChecklistWidget';
import { DeleteDocumentModal } from './DeleteDocumentModal';
import { UnitDropdown } from './UnitDropdown';
import { downloadSavedFile } from '../lib/downloadFile';
import { uploadFileViaApi, recordUpload } from '../utils/uploadViaApi';
import { toast } from 'sonner';
import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface MaterialComposition {
  id: string;
  material: string;
  percentage: number;
  customMaterial?: string;
}

type VariantSpec = {
  length: string;
  lengthUnit: string;
  width: string;
  widthUnit: string;
  height: string;
  heightUnit: string;
  productWeight: string;
  productWeightUnit: string;
  shippingWeight: string;
  shippingWeightUnit: string;
};

const emptyVariantSpec = (): VariantSpec => ({
  length: '',
  lengthUnit: 'in',
  width: '',
  widthUnit: 'in',
  height: '',
  heightUnit: 'in',
  productWeight: '',
  productWeightUnit: 'lbs',
  shippingWeight: '',
  shippingWeightUnit: 'lbs',
});

interface SpecsTabProps {
  productId?: string;
  sizeVariants?: string[];
}

const MATERIAL_OPTIONS = [
  'Cotton',
  'Polyester',
  'Nylon',
  'Spandex',
  'Wool',
  'Silk',
  'Linen',
  'Rayon',
  'Acrylic',
  'Stainless Steel',
  'Aluminum',
  'Plastic',
  'Glass',
  'Ceramic',
  'Wood',
  'Leather',
  'Rubber',
  'Other'
];

function MaterialDropdown({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled?: boolean }) {
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
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-left hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <span className={`text-sm ${value ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>
          {value || 'Select material...'}
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
            {MATERIAL_OPTIONS.map((material) => (
              <button
                key={material}
                type="button"
                onClick={() => { onChange(material); setOpen(false); }}
                className={`w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center justify-between ${
                  value === material
                    ? 'bg-purple-50 text-purple-700 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{material}</span>
                {value === material && <Check className="w-3.5 h-3.5 text-purple-600" />}
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

export function SpecificationsTab({ productId = '', sizeVariants = [] }: SpecsTabProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [savedFiles, setSavedFiles] = useState<any[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<{ file: File; index: number } | null>(null);
  const [materialCompositions, setMaterialCompositions] = useState<MaterialComposition[]>([
    { id: '1', material: '', percentage: 0 }
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Dimensions
  const [length, setLength] = useState('');
  const [lengthUnit, setLengthUnit] = useState('in');
  const [width, setWidth] = useState('');
  const [widthUnit, setWidthUnit] = useState('in');
  const [height, setHeight] = useState('');
  const [heightUnit, setHeightUnit] = useState('in');

  // Weights
  const [productWeight, setProductWeight] = useState('');
  const [productWeightUnit, setProductWeightUnit] = useState('lbs');
  const [shippingWeight, setShippingWeight] = useState('');
  const [shippingWeightUnit, setShippingWeightUnit] = useState('lbs');

  // Care
  const [careInstructions, setCareInstructions] = useState('');

  // Per-size variant specifications
  const [variantSpecs, setVariantSpecs] = useState<Record<string, VariantSpec>>({});

  useEffect(() => {
    if (productId) {
      fetchSpecs();
      fetchComplianceFiles();
    }
  }, [productId]);

  const fetchSpecs = async () => {
    // Reset to defaults so switching products doesn't bleed the previous
    // product's values into the new one when the new one has no saved spec.
    setLength(''); setLengthUnit('in');
    setWidth(''); setWidthUnit('in');
    setHeight(''); setHeightUnit('in');
    setProductWeight(''); setProductWeightUnit('lbs');
    setShippingWeight(''); setShippingWeightUnit('lbs');
    setCareInstructions('');
    setMaterialCompositions([{ id: '1', material: '', percentage: 0 }]);

    try {
      const res = await fetch(`/api/pipeline/specs/get?productId=${encodeURIComponent(productId)}`);
      if (!res.ok) return;
      const { spec } = await res.json();
      if (!spec) return;
      setLength(spec.length ?? '');
      setLengthUnit(spec.lengthUnit ?? 'in');
      setWidth(spec.width ?? '');
      setWidthUnit(spec.widthUnit ?? 'in');
      setHeight(spec.height ?? '');
      setHeightUnit(spec.heightUnit ?? 'in');
      setProductWeight(spec.productWeight ?? '');
      setProductWeightUnit(spec.productWeightUnit ?? 'lbs');
      setShippingWeight(spec.shippingWeight ?? '');
      setShippingWeightUnit(spec.shippingWeightUnit ?? 'lbs');
      setCareInstructions(spec.careInstructions ?? '');
      if (spec.materialCompositions?.length > 0) {
        setMaterialCompositions(spec.materialCompositions);
      }
      // Merge, don't replace: the sizeVariants reconcile effect may have
      // already seeded empty placeholders for the current size set, and
      // saved `variantSpecs` can be `{}` if the product was saved before
      // size variants were defined.
      if (spec.variantSpecs && typeof spec.variantSpecs === 'object') {
        setVariantSpecs(prev => ({ ...prev, ...spec.variantSpecs }));
      }
    } catch {
      // silent
    }
  };

  // Reconcile per-size specs whenever sizeVariants changes.
  // Adds defaults for new sizes, drops removed sizes, preserves existing data.
  const sizeVariantsKey = sizeVariants.join('|');
  useEffect(() => {
    setVariantSpecs(prev => {
      const prevKeys = Object.keys(prev);
      const sameKeys =
        prevKeys.length === sizeVariants.length &&
        sizeVariants.every(s => s in prev);
      if (sameKeys) return prev;
      const next: Record<string, VariantSpec> = {};
      for (const size of sizeVariants) {
        next[size] = prev[size] ?? emptyVariantSpec();
      }
      return next;
    });
  }, [sizeVariantsKey]);

  const updateVariantField = (size: string, field: keyof VariantSpec, value: string) => {
    setVariantSpecs(prev => ({
      ...prev,
      [size]: { ...(prev[size] ?? emptyVariantSpec()), [field]: value },
    }));
  };

  const fetchComplianceFiles = async () => {
    try {
      const res = await fetch(`/api/files/list?entityType=pipeline-compliance&entityId=${encodeURIComponent(productId)}`);
      if (!res.ok) return;
      const { uploads } = await res.json();
      setSavedFiles(uploads ?? []);
    } catch {
      // silent
    }
  };

  const handleSaveSpecs = async () => {
    if (!productId) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/pipeline/specs/save', {
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
          productWeight: productWeight ? parseFloat(productWeight) : null,
          productWeightUnit,
          shippingWeight: shippingWeight ? parseFloat(shippingWeight) : null,
          shippingWeightUnit,
          materialCompositions,
          careInstructions,
          variantSpecs,
        }),
      });
      if (!res.ok) throw new Error('Failed to save');
      toast.success('Specifications saved successfully');
      setIsEditing(false);
    } catch {
      toast.error('Failed to save specifications');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files;
    if (!uploadedFiles || uploadedFiles.length === 0) return;

    const fileArray = Array.from(uploadedFiles);

    if (productId) {
      for (const file of fileArray) {
        try {
          const { key } = await uploadFileViaApi(file, 'pipeline-compliance', productId);
          await recordUpload({
            key,
            fileName: file.name,
            fileType: file.type,
            size: file.size,
            entityType: 'pipeline-compliance',
            entityId: productId,
          });
        } catch (err) {
          console.error('Compliance upload error:', err);
        }
      }
      await fetchComplianceFiles();
    } else {
      setFiles([...files, ...fileArray]);
    }

    toast.success(`${uploadedFiles.length} document${uploadedFiles.length > 1 ? 's' : ''} uploaded successfully`, {
      description: 'Your compliance documents have been added.',
      duration: 3000,
    });
  };

  const handleDownloadFile = (file: File) => {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDeleteSavedFile = async (fileId: string) => {
    try {
      const res = await fetch('/api/files/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: fileId }),
      });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Document deleted');
      await fetchComplianceFiles();
    } catch {
      toast.error('Failed to delete document');
    }
  };

  const addMaterialComposition = () => {
    setMaterialCompositions(prev => [
      ...prev,
      { id: Date.now().toString(), material: '', percentage: 0 }
    ]);
  };

  const removeMaterialComposition = (id: string) => {
    setMaterialCompositions(prev =>
      prev.length > 1 ? prev.filter(m => m.id !== id) : prev
    );
  };

  const updateMaterialComposition = (id: string, field: 'material' | 'percentage' | 'customMaterial', value: string | number) => {
    setMaterialCompositions(prev => prev.map(m =>
      m.id === id ? { ...m, [field]: value } : m
    ));
  };

  const totalPercentage = materialCompositions.reduce((sum, m) => sum + m.percentage, 0);

  return (
    <div className="space-y-6">
      {/* Edit / Save controls */}
      <div className="flex items-center justify-end gap-2">
        {isEditing ? (
          <>
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveSpecs}
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
            Edit Specifications
          </button>
        )}
      </div>

      {/* Product Dimensions & Weight Specifications */}
      {(
        <>
          {/* Product Dimensions */}
          <div className="bg-white rounded-xl border-2 border-slate-200 overflow-visible">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-3">
              <Ruler className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900">Product Dimensions</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    <UnitDropdown
                      options={['in', 'cm', 'mm']}
                      defaultOption="in"
                      value={lengthUnit}
                      onChange={setLengthUnit}
                      disabled={!isEditing}
                    />
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
                    <UnitDropdown
                      options={['in', 'cm', 'mm']}
                      defaultOption="in"
                      value={widthUnit}
                      onChange={setWidthUnit}
                      disabled={!isEditing}
                    />
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
                    <UnitDropdown
                      options={['in', 'cm', 'mm']}
                      defaultOption="in"
                      value={heightUnit}
                      onChange={setHeightUnit}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Weight Specifications */}
          <div className="bg-white rounded-xl border-2 border-slate-200 overflow-visible">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-3">
              <Weight className="w-5 h-5 text-green-600" />
              <h3 className="font-bold text-slate-900">Weight Specifications</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Product Weight</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="0.00"
                      value={productWeight}
                      onChange={(e) => setProductWeight(e.target.value)}
                      disabled={!isEditing}
                      className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                    <UnitDropdown
                      options={['lbs', 'kg', 'oz', 'g']}
                      defaultOption="lbs"
                      value={productWeightUnit}
                      onChange={setProductWeightUnit}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Shipping Weight</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="0.00"
                      value={shippingWeight}
                      onChange={(e) => setShippingWeight(e.target.value)}
                      disabled={!isEditing}
                      className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                    <UnitDropdown
                      options={['lbs', 'kg', 'oz', 'g']}
                      defaultOption="lbs"
                      value={shippingWeightUnit}
                      onChange={setShippingWeightUnit}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Per-Size Variant Specifications */}
      {sizeVariants.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border-2 border-slate-200 overflow-visible"
        >
          <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-3">
            <Package className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900">Size Variants</h3>
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{sizeVariants.length} variant{sizeVariants.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="p-6 space-y-3">
            <AnimatePresence initial={false}>
              {sizeVariants.map((size) => {
                const vs = variantSpecs[size] ?? emptyVariantSpec();
                const hasDims = vs.length || vs.width || vs.height;
                const hasWeight = vs.productWeight;
                return (
                  <motion.div
                    key={size}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-4"
                  >
                    <div className="grid grid-cols-[120px_1fr_160px] gap-4 items-center">
                      {/* Size */}
                      <div>
                        <div className="text-[11px] font-medium text-slate-500 mb-1">Size</div>
                        <div className="text-sm font-semibold text-indigo-700">{size}</div>
                      </div>

                      {/* Dimensions */}
                      <div>
                        <div className="text-[11px] font-medium text-slate-500 mb-1">Dimensions (L × W × H)</div>
                        {isEditing ? (
                          <div className="flex items-center gap-1.5">
                            <input type="number" placeholder="L" value={vs.length}
                              onChange={(e) => updateVariantField(size, 'length', e.target.value)}
                              className="w-16 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                            <span className="text-slate-400 text-xs">×</span>
                            <input type="number" placeholder="W" value={vs.width}
                              onChange={(e) => updateVariantField(size, 'width', e.target.value)}
                              className="w-16 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                            <span className="text-slate-400 text-xs">×</span>
                            <input type="number" placeholder="H" value={vs.height}
                              onChange={(e) => updateVariantField(size, 'height', e.target.value)}
                              className="w-16 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                            <span className="text-xs text-slate-500 ml-1">{vs.lengthUnit || 'in'}</span>
                          </div>
                        ) : (
                          <div className="text-sm font-semibold text-slate-900">
                            {hasDims ? `${vs.length || '–'}${vs.lengthUnit || 'in'} × ${vs.width || '–'}${vs.lengthUnit || 'in'} × ${vs.height || '–'}${vs.lengthUnit || 'in'}` : <span className="text-slate-400 font-normal">Not set</span>}
                          </div>
                        )}
                      </div>

                      {/* Weight */}
                      <div>
                        <div className="text-[11px] font-medium text-slate-500 mb-1">Weight</div>
                        {isEditing ? (
                          <div className="flex items-center gap-1.5">
                            <input type="number" placeholder="0.0" value={vs.productWeight}
                              onChange={(e) => updateVariantField(size, 'productWeight', e.target.value)}
                              className="w-20 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                            <UnitDropdown options={['oz', 'lbs', 'g', 'kg']} defaultOption="oz"
                              value={vs.productWeightUnit}
                              onChange={(v) => updateVariantField(size, 'productWeightUnit', v)} />
                          </div>
                        ) : (
                          <div className="text-sm font-semibold text-slate-900">{hasWeight ? `${vs.productWeight} ${vs.productWeightUnit}` : <span className="text-slate-400 font-normal">Not set</span>}</div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Material Specifications */}
      <div className="bg-white rounded-xl border-2 border-slate-200 overflow-visible">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Layers className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-slate-900">Material Specifications</h3>
          </div>
          {isEditing && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={addMaterialComposition}
              className="flex items-center gap-2 px-3 py-2 bg-purple-50 text-purple-600 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Material
            </motion.button>
          )}
        </div>
        <div className="p-6 space-y-4">
          <AnimatePresence>
            {materialCompositions.map((composition, index) => (
              <motion.div
                key={composition.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-3"
              >
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Material {index + 1}
                    </label>
                    {isEditing ? (
                      <>
                        <MaterialDropdown
                          value={composition.material}
                          onChange={(v) => {
                            updateMaterialComposition(composition.id, 'material', v);
                            if (v !== 'Other') {
                              updateMaterialComposition(composition.id, 'customMaterial', '');
                            }
                          }}
                        />
                        {composition.material === 'Other' && (
                          <motion.input
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            type="text"
                            value={composition.customMaterial || ''}
                            onChange={(e) => updateMaterialComposition(composition.id, 'customMaterial', e.target.value)}
                            placeholder="Enter custom material name..."
                            className="mt-2 w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm"
                          />
                        )}
                      </>
                    ) : (
                      <div className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900">
                        {composition.material === 'Other' && composition.customMaterial
                          ? composition.customMaterial
                          : composition.material || <span className="text-slate-400">Not set</span>}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Percentage
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={composition.percentage || ''}
                        onChange={(e) => updateMaterialComposition(composition.id, 'percentage', Number(e.target.value))}
                        disabled={!isEditing}
                        placeholder="0"
                        className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm disabled:opacity-60 disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <span className="text-slate-500 font-medium text-sm">%</span>
                    </div>
                  </div>
                </div>
                {isEditing && materialCompositions.length > 1 && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => removeMaterialComposition(composition.id)}
                    className="mt-5 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Total Percentage Indicator */}
          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Total Composition</span>
              <span className={`text-sm font-bold ${
                totalPercentage === 100
                  ? 'text-green-600'
                  : totalPercentage > 100
                    ? 'text-red-600'
                    : 'text-orange-600'
              }`}>
                {totalPercentage}%
              </span>
            </div>
            {totalPercentage !== 100 && (
              <p className="text-xs text-slate-500 mt-1">
                {totalPercentage > 100 
                  ? 'Total exceeds 100%. Please adjust percentages.' 
                  : 'Total should equal 100% for accurate composition.'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Care Instructions</label>
            <textarea
              rows={3}
              placeholder="Enter care instructions..."
              value={careInstructions}
              onChange={(e) => setCareInstructions(e.target.value)}
              disabled={!isEditing}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Compliance & Certifications */}
      <div className="bg-white rounded-xl border-2 border-slate-200 overflow-visible">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-orange-600" />
            <h3 className="font-bold text-slate-900">Compliance & Certifications</h3>
          </div>
          <label htmlFor="compliance-upload">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              Upload Document
            </motion.div>
          </label>
          <input
            id="compliance-upload"
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.jpg,.png"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
        <div className="p-6">
          {savedFiles.length > 0 || files.length > 0 ? (
            <div className="space-y-2">
              <AnimatePresence>
                {savedFiles.map((sf) => (
                  <motion.div
                    key={sf.id ?? sf._id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg group hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-orange-600" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">{sf.fileName}</p>
                        <p className="text-xs text-slate-500">{sf.size ? `${(sf.size / 1024).toFixed(2)} KB` : ''}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={async () => {
                          try {
                            await downloadSavedFile(sf);
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
                        onClick={() => handleDeleteSavedFile(sf.id ?? sf._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
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
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg group hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-orange-600" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">{file.name}</p>
                        <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDownloadFile(file)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          setFileToDelete({ file, index });
                          setDeleteModalOpen(true);
                        }}
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
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-2xl flex items-center justify-center">
                <FileText className="w-8 h-8 text-slate-400" />
              </div>
              <h4 className="font-bold text-slate-900 mb-2">No compliance documents uploaded</h4>
              <p className="text-sm text-slate-600 mb-4">
                Upload safety certifications, test reports, or compliance documents
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Checklist - Moved to Bottom */}
      <ChecklistWidget
        productId={productId}
        tabId="specifications"
      />

      {/* Delete Document Modal */}
      <DeleteDocumentModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setFileToDelete(null);
        }}
        fileName={fileToDelete?.file.name || ''}
        onConfirm={() => {
          if (fileToDelete) {
            setFiles(files.filter((_, i) => i !== fileToDelete.index));
            toast.success('Document deleted successfully', {
              description: 'The compliance document has been removed.',
              duration: 3000,
            });
          }
          setFileToDelete(null);
        }}
      />
    </div>
  );
}