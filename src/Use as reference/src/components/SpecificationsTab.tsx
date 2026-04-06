import { motion, AnimatePresence } from 'motion/react';
import { Ruler, Weight, Package, Layers, FileText, Upload, Download, Trash2, Plus, X, ChevronDown, Save, Edit, Check, Pencil } from 'lucide-react';
import { ChecklistWidget, ChecklistItem } from './ChecklistWidget';
import { DeleteDocumentModal } from './DeleteDocumentModal';
import { UnitDropdown } from './UnitDropdown';
import { CategoryTagDropdown, categoryColor } from './CategoryTagDropdown';
import { toast } from 'sonner@2.0.3';
import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface MaterialComposition {
  id: string;
  material: string;
  percentage: number | string;
  customMaterial?: string;
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

interface SpecsData {
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
  materials: MaterialComposition[];
  careInstructions: string;
}

// Portal-based material dropdown
function MaterialDropdown({ value, onChange, compositions, currentId }: {
  value: string;
  onChange: (v: string) => void;
  compositions: MaterialComposition[];
  currentId: string;
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
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-left hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
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

interface SpecificationsTabProps {
  productId?: string;
  onChecklistChanged?: (allChecklists: Record<string, ChecklistItem[]>) => void;
  onActivityDetected?: () => void;
}

const getStorageKey = (productId?: string) => `specs:${productId || 'default'}`;

const defaultSpecs: SpecsData = {
  length: '', lengthUnit: 'in',
  width: '', widthUnit: 'in',
  height: '', heightUnit: 'in',
  productWeight: '', productWeightUnit: 'lbs',
  shippingWeight: '', shippingWeightUnit: 'lbs',
  materials: [{ id: '1', material: '', percentage: 0 }],
  careInstructions: '',
};

export function SpecificationsTab({ productId, onChecklistChanged, onActivityDetected }: SpecificationsTabProps) {
  const [files, setFiles] = useState<{file: File; displayName: string; category: string; uploadedBy: string; uploadedAt: string}[]>([]);
  const [renamingIndex, setRenamingIndex] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const renameInputRef = useRef<HTMLInputElement>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<{ file: File; index: number } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [specs, setSpecs] = useState<SpecsData>(defaultSpecs);
  const [savedSpecs, setSavedSpecs] = useState<SpecsData>(defaultSpecs);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const key = getStorageKey(productId);
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSpecs(parsed);
        setSavedSpecs(parsed);
      } catch {}
    }
    setHasLoaded(true);
  }, [productId]);

  const handleSave = () => {
    // Validate material composition if more than default empty row
    const hasAnyMaterial = materialCompositions.some(m => m.material !== '');
    if (hasAnyMaterial && totalPercentage !== 100) {
      toast.error('Material composition must equal 100%', {
        description: `Current total is ${totalPercentage}%. Please adjust percentages before saving.`,
        duration: 4000,
      });
      return;
    }
    const key = getStorageKey(productId);
    localStorage.setItem(key, JSON.stringify(specs));
    setSavedSpecs({ ...specs });
    setIsEditing(false);
    onActivityDetected?.();
    toast.success('Specifications saved successfully');
  };

  const handleCancel = () => {
    setSpecs({ ...savedSpecs });
    setIsEditing(false);
  };

  const updateSpec = (field: keyof SpecsData, value: any) => {
    setSpecs(prev => ({ ...prev, [field]: value }));
  };

  const materialCompositions = specs.materials;

  const addMaterialComposition = () => {
    updateSpec('materials', [
      ...materialCompositions,
      { id: Date.now().toString(), material: '', percentage: 0 }
    ]);
  };

  const removeMaterialComposition = (id: string) => {
    if (materialCompositions.length > 1) {
      updateSpec('materials', materialCompositions.filter(m => m.id !== id));
    }
  };

  const updateMaterialComposition = (id: string, updates: Partial<MaterialComposition>) => {
    setSpecs(prev => {
      const newMaterials = prev.materials.map(m =>
        m.id === id ? { ...m, ...updates } : m
      );
      // If updating percentage, clamp so total doesn't exceed 100
      if ('percentage' in updates) {
        const newVal = typeof updates.percentage === 'number' ? updates.percentage : 0;
        const othersTotal = newMaterials.reduce((sum, m) => {
          if (m.id === id) return sum;
          return sum + (typeof m.percentage === 'number' ? m.percentage : 0);
        }, 0);
        const maxAllowed = 100 - othersTotal;
        const clamped = Math.min(Math.max(0, newVal), maxAllowed);
        return {
          ...prev,
          materials: newMaterials.map(m =>
            m.id === id ? { ...m, ...updates, percentage: clamped } : m
          )
        };
      }
      return { ...prev, materials: newMaterials };
    });
  };

  const totalPercentage = materialCompositions.reduce((sum, m) => sum + (typeof m.percentage === 'number' ? m.percentage : 0), 0);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files;
    if (uploadedFiles && uploadedFiles.length > 0) {
      const newFiles = Array.from(uploadedFiles).map(f => ({
        file: f,
        displayName: f.name,
        category: '',
        uploadedBy: 'User',
        uploadedAt: new Date().toISOString(),
      }));
      setFiles(prev => [...prev, ...newFiles]);
      toast.success(`${uploadedFiles.length} document${uploadedFiles.length > 1 ? 's' : ''} uploaded successfully`, {
        description: 'Your compliance documents have been added.',
        duration: 3000,
      });
    }
  };

  const handleDownloadFile = (uf: {file: File; displayName: string}) => {
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
            Edit Specifications
          </button>
        )}
      </div>

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
                  value={specs.length}
                  onChange={(e) => updateSpec('length', e.target.value)}
                  disabled={!isEditing}
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                />
                <UnitDropdown
                  options={['in', 'cm', 'mm']}
                  defaultOption="in"
                  value={specs.lengthUnit}
                  onChange={(v) => updateSpec('lengthUnit', v)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Width</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="0.00"
                  value={specs.width}
                  onChange={(e) => updateSpec('width', e.target.value)}
                  disabled={!isEditing}
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                />
                <UnitDropdown
                  options={['in', 'cm', 'mm']}
                  defaultOption="in"
                  value={specs.widthUnit}
                  onChange={(v) => updateSpec('widthUnit', v)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Height</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="0.00"
                  value={specs.height}
                  onChange={(e) => updateSpec('height', e.target.value)}
                  disabled={!isEditing}
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                />
                <UnitDropdown
                  options={['in', 'cm', 'mm']}
                  defaultOption="in"
                  value={specs.heightUnit}
                  onChange={(v) => updateSpec('heightUnit', v)}
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
                  value={specs.productWeight}
                  onChange={(e) => updateSpec('productWeight', e.target.value)}
                  disabled={!isEditing}
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 disabled:opacity-60 disabled:cursor-not-allowed"
                />
                <UnitDropdown
                  options={['lbs', 'kg', 'oz', 'g']}
                  defaultOption="lbs"
                  value={specs.productWeightUnit}
                  onChange={(v) => updateSpec('productWeightUnit', v)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Shipping Weight</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="0.00"
                  value={specs.shippingWeight}
                  onChange={(e) => updateSpec('shippingWeight', e.target.value)}
                  disabled={!isEditing}
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 disabled:opacity-60 disabled:cursor-not-allowed"
                />
                <UnitDropdown
                  options={['lbs', 'kg', 'oz', 'g']}
                  defaultOption="lbs"
                  value={specs.shippingWeightUnit}
                  onChange={(v) => updateSpec('shippingWeightUnit', v)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

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
                      composition.material === 'Other' ? (
                        <input
                          type="text"
                          value={composition.customMaterial || ''}
                          onChange={(e) => updateMaterialComposition(composition.id, { customMaterial: e.target.value })}
                          placeholder="Enter custom material..."
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm"
                        />
                      ) : (
                        <MaterialDropdown
                          value={composition.material}
                          onChange={(v) => {
                            updateMaterialComposition(composition.id, {
                              material: v,
                              customMaterial: v !== 'Other' ? '' : composition.customMaterial,
                            });
                          }}
                          compositions={materialCompositions}
                          currentId={composition.id}
                        />
                      )
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
                        onChange={(e) => updateMaterialComposition(composition.id, { percentage: e.target.value === '' ? '' : Number(e.target.value) })}
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
              value={specs.careInstructions}
              onChange={(e) => updateSpec('careInstructions', e.target.value)}
              disabled={!isEditing}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Compliance & Certifications */}
      <div className="bg-white rounded-xl border-2 border-slate-200 overflow-hidden">
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
          {files.length > 0 ? (
            <div className="space-y-2">
              <AnimatePresence>
                {files.map((file, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg group hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-orange-600" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {renamingIndex === index ? (
                            <input
                              ref={renameInputRef}
                              type="text"
                              value={renameValue}
                              onChange={(e) => setRenameValue(e.target.value)}
                              onBlur={() => confirmRename(index)}
                              onKeyPress={(e) => e.key === 'Enter' && confirmRename(index)}
                              className="w-full px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                          ) : (
                            <span
                              className="cursor-pointer"
                              onClick={() => startRename(index)}
                            >
                              {file.displayName}
                            </span>
                          )}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-slate-500">{(file.file.size / 1024).toFixed(2)} KB</p>
                          {file.category && (
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${categoryColor(file.category)}`}>
                              {file.category}
                            </span>
                          )}
                          <span className="text-xs text-slate-400">·</span>
                          <span className="text-xs text-slate-500">{file.uploadedBy}</span>
                          <span className="text-xs text-slate-400">·</span>
                          <span className="text-xs text-slate-500">{new Date(file.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <CategoryTagDropdown
                        value={file.category}
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
                        onClick={() => handleDownloadFile(file)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setFileToDelete({ file: file.file, index });
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
        onChecklistChanged={onChecklistChanged}
        onActivityDetected={onActivityDetected}
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