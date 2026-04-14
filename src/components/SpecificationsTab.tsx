import { motion, AnimatePresence } from 'motion/react';
import { Ruler, Weight, Package, Layers, FileText, Upload, Download, Trash2, Plus, X, ChevronDown, Save, Pencil } from 'lucide-react';
import { ChecklistWidget } from './ChecklistWidget';
import { DeleteDocumentModal } from './DeleteDocumentModal';
import { UnitDropdown } from './UnitDropdown';
import { downloadSavedFile } from '../lib/downloadFile';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

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

export function SpecificationsTab({ productId = '', sizeVariants = [] }: SpecsTabProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [savedFiles, setSavedFiles] = useState<any[]>([]);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
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
      if (spec.variantSpecs && typeof spec.variantSpecs === 'object') {
        setVariantSpecs(spec.variantSpecs);
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
      // Upload to S3 and record in MongoDB
      for (const file of fileArray) {
        try {
          const presignRes = await fetch('/api/files/presign', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileName: file.name,
              fileType: file.type,
              entityType: 'pipeline-compliance',
              entityId: productId,
            }),
          });
          if (!presignRes.ok) throw new Error('presign failed');
          const { uploadUrl, key } = await presignRes.json();
          await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
          await fetch('/api/files/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key, fileName: file.name, fileType: file.type, size: file.size, entityType: 'pipeline-compliance', entityId: productId, uploadedBy: 'User' }),
          });
        } catch {
          // silent per-file error; still add to local list
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
      {/* Edit / Save buttons */}
      <div className="flex justify-end gap-3">
        {isEditing ? (
          <>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsEditing(false)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all"
            >
              <X className="w-4 h-4" />
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSaveSpecs}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Specifications'}
            </motion.button>
          </>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-all shadow-lg"
          >
            <Pencil className="w-4 h-4" />
            Edit Specifications
          </motion.button>
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
        <div className="bg-white rounded-xl border-2 border-slate-200 overflow-visible">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-3">
            <Package className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900">Size Variants</h3>
            <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full">
              {sizeVariants.length} size{sizeVariants.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="p-4 space-y-2">
            {/* Column headers */}
            <div className="grid grid-cols-[60px_1fr_180px] gap-4 px-3 pb-1">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Size</p>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Dimensions (L × W × H)</p>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Weight</p>
            </div>
            <AnimatePresence initial={false}>
              {sizeVariants.map((size) => {
                const vs = variantSpecs[size] ?? emptyVariantSpec();
                return (
                  <motion.div
                    key={size}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="grid grid-cols-[60px_1fr_180px] gap-4 items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-3"
                  >
                    {/* Size */}
                    <span className="text-sm font-bold text-indigo-600">{size}</span>

                    {/* Dimensions: 3 inputs + unit */}
                    <div>
                      <div className="grid grid-cols-3 gap-2">
                        <input type="number" placeholder="0.00" value={vs.length}
                          onChange={(e) => updateVariantField(size, 'length', e.target.value)}
                          disabled={!isEditing}
                          className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full disabled:opacity-60 disabled:cursor-not-allowed" />
                        <input type="number" placeholder="0.00" value={vs.width}
                          onChange={(e) => updateVariantField(size, 'width', e.target.value)}
                          disabled={!isEditing}
                          className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full disabled:opacity-60 disabled:cursor-not-allowed" />
                        <input type="number" placeholder="0.00" value={vs.height}
                          onChange={(e) => updateVariantField(size, 'height', e.target.value)}
                          disabled={!isEditing}
                          className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full disabled:opacity-60 disabled:cursor-not-allowed" />
                      </div>
                      <div className="mt-1.5">
                        <UnitDropdown options={['in', 'cm', 'mm']} defaultOption="in"
                          value={vs.lengthUnit}
                          disabled={!isEditing}
                          onChange={(v) => {
                            updateVariantField(size, 'lengthUnit', v);
                            updateVariantField(size, 'widthUnit', v);
                            updateVariantField(size, 'heightUnit', v);
                          }} />
                      </div>
                    </div>

                    {/* Weight: input + unit */}
                    <div className="flex items-center gap-2">
                      <input type="number" placeholder="0.00" value={vs.productWeight}
                        onChange={(e) => updateVariantField(size, 'productWeight', e.target.value)}
                        disabled={!isEditing}
                        className="flex-1 min-w-0 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 disabled:opacity-60 disabled:cursor-not-allowed" />
                      <UnitDropdown options={['lbs', 'kg', 'oz', 'g']} defaultOption="lbs"
                        value={vs.productWeightUnit}
                        disabled={!isEditing}
                        onChange={(v) => updateVariantField(size, 'productWeightUnit', v)} />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Material Specifications */}
      <div className="bg-white rounded-xl border-2 border-slate-200 overflow-visible">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Layers className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-slate-900">Material Specifications</h3>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={addMaterialComposition}
            className="flex items-center gap-2 px-3 py-2 bg-purple-50 text-purple-600 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Material
          </motion.button>
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
                    <div className="relative">
                      <input
                        type="text"
                        value={composition.material || ''}
                        onChange={(e) => {
                          updateMaterialComposition(composition.id, 'material', e.target.value);
                          setOpenDropdownId(composition.id);
                        }}
                        onFocus={() => setOpenDropdownId(composition.id)}
                        onBlur={() => setTimeout(() => setOpenDropdownId(null), 150)}
                        placeholder="Type or select material..."
                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all font-medium"
                      />
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />

                      <AnimatePresence>
                        {openDropdownId === composition.id && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute left-0 right-0 top-full mt-2 bg-white border-2 border-slate-200 rounded-2xl shadow-xl z-[200] overflow-y-auto"
                            style={{ maxHeight: '220px' }}
                          >
                            {MATERIAL_OPTIONS.filter(m =>
                              !composition.material || m.toLowerCase().includes(composition.material.toLowerCase())
                            ).map((material) => (
                              <div
                                key={material}
                                className={`px-5 py-3 cursor-pointer border-b border-slate-100 last:border-b-0 transition-all ${
                                  composition.material === material
                                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold'
                                    : 'hover:bg-purple-50 text-slate-900'
                                }`}
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  updateMaterialComposition(composition.id, 'material', material);
                                  setOpenDropdownId(null);
                                }}
                              >
                                <span className="text-sm font-medium">{material}</span>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
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
                        placeholder="0"
                        className="flex-1 px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all font-medium"
                      />
                      <span className="text-slate-600 font-bold text-lg">%</span>
                    </div>
                  </div>
                </div>
                {materialCompositions.length > 1 && (
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
              <span className={`text-lg font-bold ${
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
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
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