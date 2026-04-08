import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  DollarSign, Plus, Trash2, Save, Loader2, Calendar,
  AlertTriangle, X, FileText, Scissors, Package, Paintbrush, Pen, Stamp,
  Copy, Check, Info, Settings, ChevronDown, Edit3, Upload
} from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-c0840c88`;

// ─── Types ───
interface PricingRow {
  id: string;
  label: string;
  prices: string[];
}

interface ChargeItem {
  id: string;
  name: string;
  price: string;
  description: string;
}

interface PricingSheet {
  vendorId: string;
  decorationType: string;
  year: string;
  pricingMatrix: PricingRow[];
  quantityBrackets: string[];
  additionalCharges: ChargeItem[];
  personalization: ChargeItem[];
  packagingShipping: ChargeItem[];
  termsAndConditions: string;
  notes: string;
  effectiveDate: string;
  updatedAt?: string;
}

// ─── All available decoration types ───
const ALL_DECORATION_TYPES = [
  { id: 'embroidery', label: 'Embroidery', icon: Scissors, color: 'indigo' },
  { id: 'screenprint', label: 'Screen Print', icon: Paintbrush, color: 'emerald' },
  { id: 'dtg', label: 'DTG Print', icon: Stamp, color: 'violet' },
  { id: 'dtf', label: 'DTF', icon: Pen, color: 'amber' },
  { id: 'heattransfer', label: 'Heat Transfer', icon: Pen, color: 'amber' },
  { id: 'sublimation', label: 'Sublimation', icon: Package, color: 'rose' },
];

const YEARS = ['2025', '2026'];

// ─── Predefined row-label options per decoration type ───
const ROW_LABEL_OPTIONS: Record<string, string[]> = {
  embroidery: [
    'up to 5000', 'up to 6000', 'up to 7000', 'up to 8000',
    'up to 9000', 'up to 10000', 'addtl. 1000',
  ],
  screenprint: [
    '1 Color', '2 Colors', '3 Colors', '4 Colors', '5 Colors',
    '6 Colors', '7 Colors', '8 Colors', '9 Colors', '10 Colors',
  ],
  dtg: [
    'Small (up to 5x5")', 'Medium (up to 10x10")', 'Large (up to 14x16")',
    'Oversized (16"+)', 'All-Over Front', 'All-Over Back',
  ],
  dtf: [
    'Small (up to 5x5")', 'Medium (up to 10x10")', 'Large (up to 14x16")',
    'Oversized (16"+)', 'Gang Sheet Small', 'Gang Sheet Large',
  ],
  heattransfer: [
    'Small Transfer', 'Medium Transfer', 'Large Transfer',
    'Full Front/Back', 'Sleeve Print', 'Multi-Location',
  ],
  sublimation: [
    'Partial Print', 'All-Over Print', 'Cut & Sew',
    'Mug / Drinkware', 'Flat Item',
  ],
};

// ─── Default quantity brackets per type ───
const DEFAULT_BRACKETS: Record<string, string[]> = {
  embroidery: ['Under 6', '7-14', '15-29', '30-74', '75-149', '150-299', '300-599', '600-999', 'addtl. 1000'],
  screenprint: ['12', '24', '36', '48', '72', '144', '288', '576', '1200', '2500', '5000', '10000'],
  dtg: ['1-11', '12-24', '25-49', '50-99', '100-249', '250-499', '500+'],
  dtf: ['1-11', '12-24', '25-49', '50-99', '100-249', '250-499', '500+'],
  heattransfer: ['1-11', '12-24', '25-49', '50-99', '100-249', '250-499', '500+'],
  sublimation: ['1-11', '12-24', '25-49', '50-99', '100-249', '250+'],
};

const DEFAULT_ADDITIONAL_CHARGES: ChargeItem[] = [
  { id: 'ac1', name: 'Digitizing', price: '', description: 'Minimum charge for new logo digitization' },
  { id: 'ac2', name: 'Digitizing Full Back', price: '', description: 'Large back design digitization' },
  { id: 'ac3', name: 'Tape Edits / Keyboard', price: '', description: 'Minimum charge for edits' },
  { id: 'ac4', name: 'Sewouts (3rd Party Files)', price: '', description: 'Minimum for third party files up to 10,000 stitches' },
  { id: 'ac5', name: 'Rush Charge', price: '', description: 'Minimum per rush order of less than 5 business days' },
];

const DEFAULT_PERSONALIZATION: ChargeItem[] = [
  { id: 'p1', name: 'One Line', price: '', description: 'Per piece' },
  { id: 'p2', name: 'Two Lines', price: '', description: 'Per piece' },
  { id: 'p3', name: 'Excessive Thread Color Changes', price: '', description: 'Per piece' },
  { id: 'p4', name: 'Hats / Bucket Hats / Visors', price: '', description: 'Front add per piece' },
  { id: 'p5', name: 'Embroidery on Towels / Robes / Sweaters', price: '', description: 'Add per piece' },
  { id: 'p6', name: 'Embroidery on Bags', price: '', description: 'Add per piece' },
  { id: 'p7', name: 'Metallic Thread', price: '', description: 'Add per piece' },
  { id: 'p8', name: 'Puff Embroidery', price: '', description: 'Add per location' },
  { id: 'p9', name: 'Large Designs (over 8x8 inch)', price: '', description: 'Add per piece' },
];

const DEFAULT_PACKAGING: ChargeItem[] = [
  { id: 'pk1', name: 'UPS and FedEx', price: '', description: 'Per box' },
  { id: 'pk2', name: 'Check-in / Sorting Fee', price: '', description: 'If multiple colors and styles, add per piece' },
  { id: 'pk3', name: 'Unbagging of Goods', price: '', description: 'Per piece' },
  { id: 'pk4', name: 'Size Stickers on Bags', price: '', description: 'Per piece' },
];

// ─── Screen Print Additional Charges (from pricing sheet) ───
const SCREENPRINT_ADDITIONAL_CHARGES: ChargeItem[] = [
  { id: 'sc1', name: 'Flash placement', price: '0.25', description: 'Per print' },
  { id: 'sc2', name: 'Pocket placement', price: '0.25', description: 'Per print' },
  { id: 'sc3', name: 'Sleeve prints on shorts/sweatpants', price: '0.25', description: 'Per print' },
  { id: 'sc4', name: 'Screen charges for new logos', price: '10.00', description: 'Per screen' },
  { id: 'sc5', name: 'Color changes', price: '10.00', description: 'Per change' },
  { id: 'sc6', name: 'Screen charges for reorders', price: '4.00', description: 'Per screen' },
];

// ─── Pre-populated Screen Print Pricing Data ───
const SCREENPRINT_DEFAULT_PRICING: Record<string, string[]> = {
  '1 Color': ['4.50', '3.00', '2.40', '2.00', '1.50', '1.25', '1.00', '0.85', '0.75', '0.65', '0.60', '0.55'],
  '2 Colors': ['5.25', '3.50', '2.80', '2.35', '1.75', '1.45', '1.20', '1.00', '0.90', '0.75', '0.70', '0.65'],
  '3 Colors': ['6.00', '4.00', '3.20', '2.70', '2.00', '1.65', '1.40', '1.15', '1.05', '0.85', '0.80', '0.75'],
  '4 Colors': ['6.75', '4.50', '3.60', '3.05', '2.25', '1.85', '1.60', '1.30', '1.20', '0.95', '0.90', '0.85'],
  '5 Colors': ['7.50', '5.00', '4.00', '3.40', '2.50', '2.05', '1.80', '1.45', '1.35', '1.05', '1.00', '0.95'],
  '6 Colors': ['8.25', '5.50', '4.40', '3.75', '2.75', '2.25', '2.00', '1.60', '1.50', '1.15', '1.10', '1.05'],
  '7 Colors': ['9.00', '6.00', '4.80', '4.10', '3.00', '2.45', '2.20', '1.75', '1.65', '1.25', '1.20', '1.15'],
  '8 Colors': ['9.75', '6.50', '5.20', '4.45', '3.25', '2.65', '2.40', '1.90', '1.80', '1.35', '1.30', '1.25'],
  '9 Colors': ['10.50', '7.00', '5.60', '4.80', '3.50', '2.85', '2.60', '2.05', '1.95', '1.45', '1.40', '1.35'],
  '10 Colors': ['11.25', '7.50', '6.00', '5.15', '3.75', '3.05', '2.80', '2.20', '2.10', '1.55', '1.50', '1.45'],
};

function getRowLabelForType(type: string): string {
  switch (type) {
    case 'embroidery': return 'STITCHES';
    case 'screenprint': return 'COLORS';
    case 'dtg': case 'dtf': return 'PRINT SIZE';
    case 'heattransfer': return 'TRANSFER SIZE';
    case 'sublimation': return 'PRINT TYPE';
    default: return 'ROW';
  }
}

function getDefaultRows(type: string): PricingRow[] {
  const labels = ROW_LABEL_OPTIONS[type] || ROW_LABEL_OPTIONS['embroidery'];
  const bracketCount = (DEFAULT_BRACKETS[type] || DEFAULT_BRACKETS['embroidery']).length;
  // Pick first few as defaults
  const defaultLabels = labels.slice(0, type === 'embroidery' ? 7 : 4);
  return defaultLabels.map((label, i) => ({
    id: `r${i + 1}`,
    label,
    prices: Array(bracketCount).fill(''),
  }));
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
}

// ─── Row Label Selector Component ───
function RowLabelSelector({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (val: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsEditing(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSelect = (opt: string) => {
    onChange(opt);
    setIsOpen(false);
    setIsEditing(false);
  };

  const handleEditSubmit = () => {
    if (editValue.trim()) {
      onChange(editValue.trim());
    }
    setIsEditing(false);
    setIsOpen(false);
  };

  const unusedOptions = options.filter(o => o !== value);

  return (
    <div ref={dropdownRef} className="relative">
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleEditSubmit();
            if (e.key === 'Escape') { setIsEditing(false); setEditValue(value); }
          }}
          onBlur={handleEditSubmit}
          className="w-full text-sm font-semibold text-slate-900 bg-white border border-indigo-400 rounded-lg py-1.5 px-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
        />
      ) : (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between gap-1 text-sm font-semibold text-slate-900 bg-transparent hover:bg-slate-100 rounded-lg py-1.5 px-2 transition-all text-left group"
        >
          <span className="truncate">{value || 'Select...'}</span>
          <ChevronDown className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
        </button>
      )}

      <AnimatePresence>
        {isOpen && !isEditing && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full z-50 mt-1 w-56 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden"
          >
            <div className="max-h-52 overflow-y-auto py-1">
              {unusedOptions.map(opt => (
                <button
                  key={opt}
                  onClick={() => handleSelect(opt)}
                  className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                >
                  {opt}
                </button>
              ))}
              {unusedOptions.length === 0 && (
                <p className="px-3 py-2 text-xs text-slate-400">All options used</p>
              )}
            </div>
            <div className="border-t border-slate-100 p-1">
              <button
                onClick={() => { setIsEditing(true); setIsOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Custom value...
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Editable Bracket Header ───
function EditableBracketHeader({
  value,
  onChange,
  onRemove,
  canRemove,
}: {
  value: string;
  onChange: (val: string) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setEditValue(value); }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSubmit = () => {
    if (editValue.trim()) {
      onChange(editValue.trim());
    } else {
      setEditValue(value);
    }
    setIsEditing(false);
  };

  return (
    <div className="flex items-center gap-0.5 group/col">
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit();
            if (e.key === 'Escape') { setEditValue(value); setIsEditing(false); }
          }}
          onBlur={handleSubmit}
          className="w-full text-center text-xs font-bold text-indigo-700 bg-white border border-indigo-400 rounded-lg py-1 px-1 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
        />
      ) : (
        <button
          onClick={() => setIsEditing(true)}
          className="w-full text-center text-xs font-bold text-slate-700 uppercase bg-transparent hover:bg-white hover:text-indigo-600 rounded-lg py-1 px-1 transition-all cursor-text"
          title="Click to edit"
        >
          {value || 'Qty'}
        </button>
      )}
      {canRemove && (
        <button
          onClick={onRemove}
          className="opacity-0 group-hover/col:opacity-100 p-0.5 text-red-400 hover:text-red-600 transition-all flex-shrink-0"
          title="Remove column"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}


// ─── Main Component ───
interface ContractPricingTabProps {
  vendorId: string;
  vendorName: string;
}

export function ContractPricingTab({ vendorId, vendorName }: ContractPricingTabProps) {
  // Vendor-specific enabled decoration types
  const [enabledDecTypes, setEnabledDecTypes] = useState<string[]>(['embroidery']);
  const [showAddTypeMenu, setShowAddTypeMenu] = useState(false);
  const addTypeRef = useRef<HTMLDivElement>(null);

  const [activeDecType, setActiveDecType] = useState('embroidery');
  const [activeYear, setActiveYear] = useState('2025');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [allSheets, setAllSheets] = useState<Record<string, PricingSheet>>({});
  const [copiedFromYear, setCopiedFromYear] = useState<string | null>(null);

  // Current sheet state
  const [pricingMatrix, setPricingMatrix] = useState<PricingRow[]>([]);
  const [quantityBrackets, setQuantityBrackets] = useState<string[]>([]);
  const [additionalCharges, setAdditionalCharges] = useState<ChargeItem[]>([]);
  const [personalization, setPersonalization] = useState<ChargeItem[]>([]);
  const [packagingShipping, setPackagingShipping] = useState<ChargeItem[]>([]);
  const [termsAndConditions, setTermsAndConditions] = useState('');
  const [notes, setNotes] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');

  const sheetKey = `${activeDecType}:${activeYear}`;

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [showUploadPreview, setShowUploadPreview] = useState(false);
  const [extractedData, setExtractedData] = useState<{ matrix: PricingRow[]; brackets: string[] } | null>(null);
  const fileUploadRef = useRef<HTMLInputElement>(null);

  // Close add-type menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (addTypeRef.current && !addTypeRef.current.contains(e.target as Node)) {
        setShowAddTypeMenu(false);
      }
    };
    if (showAddTypeMenu) {
      // Delay adding the listener to avoid capturing the same click that opened it
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 0);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAddTypeMenu]);

  // Fetch all sheets for vendor
  const fetchAllSheets = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/contractpricing/${vendorId}`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` },
      });
      const data = await res.json();
      if (data.success) {
        const sheetsMap: Record<string, PricingSheet> = {};
        const foundTypes = new Set<string>();
        (data.items || []).forEach((item: PricingSheet) => {
          sheetsMap[`${item.decorationType}:${item.year}`] = item;
          foundTypes.add(item.decorationType);
        });
        setAllSheets(sheetsMap);

        // Also load vendor dec type config
        try {
          const configRes = await fetch(`${API_URL}/contractpricing/${vendorId}/config`, {
            headers: { 'Authorization': `Bearer ${publicAnonKey}` },
          });
          const configData = await configRes.json();
          if (configData.success && configData.enabledTypes && configData.enabledTypes.length > 0) {
            setEnabledDecTypes(configData.enabledTypes);
            if (!configData.enabledTypes.includes(activeDecType)) {
              setActiveDecType(configData.enabledTypes[0]);
            }
          } else if (foundTypes.size > 0) {
            // Infer from existing data
            const inferred = ALL_DECORATION_TYPES.filter(dt => foundTypes.has(dt.id)).map(dt => dt.id);
            if (inferred.length > 0) {
              setEnabledDecTypes(inferred);
              if (!inferred.includes(activeDecType)) {
                setActiveDecType(inferred[0]);
              }
            }
          }
        } catch {
          // config endpoint may not exist yet, that's fine
        }
      } else {
        console.error('Error fetching contract pricing:', data.error);
      }
    } catch (err) {
      console.error('Error fetching contract pricing:', err);
    } finally {
      setLoading(false);
    }
  }, [vendorId]);

  useEffect(() => {
    fetchAllSheets();
  }, [fetchAllSheets]);

  // Load current sheet data when switching type/year
  useEffect(() => {
    const sheet = allSheets[sheetKey];
    if (sheet) {
      setPricingMatrix(sheet.pricingMatrix || []);
      setQuantityBrackets(sheet.quantityBrackets || []);
      setAdditionalCharges(sheet.additionalCharges || []);
      setPersonalization(sheet.personalization || []);
      setPackagingShipping(sheet.packagingShipping || []);
      setTermsAndConditions(sheet.termsAndConditions || '');
      setNotes(sheet.notes || '');
      setEffectiveDate(sheet.effectiveDate || '');
    } else {
      // Load defaults for this decoration type
      const brackets = DEFAULT_BRACKETS[activeDecType] || DEFAULT_BRACKETS['embroidery'];
      
      // For screenprint, load pre-populated pricing data
      if (activeDecType === 'screenprint') {
        const rows: PricingRow[] = Object.entries(SCREENPRINT_DEFAULT_PRICING).map(([label, prices], i) => ({
          id: `r${i + 1}`,
          label,
          prices: [...prices],
        }));
        setPricingMatrix(rows);
        setQuantityBrackets([...brackets]);
        setAdditionalCharges(SCREENPRINT_ADDITIONAL_CHARGES.map(c => ({ ...c })));
      } else {
        const rows = getDefaultRows(activeDecType);
        setPricingMatrix(rows.map(r => ({ ...r, prices: [...r.prices] })));
        setQuantityBrackets([...brackets]);
        
        if (activeDecType === 'embroidery') {
          setAdditionalCharges(DEFAULT_ADDITIONAL_CHARGES.map(c => ({ ...c })));
          setPersonalization(DEFAULT_PERSONALIZATION.map(c => ({ ...c })));
          setPackagingShipping(DEFAULT_PACKAGING.map(c => ({ ...c })));
        } else {
          setAdditionalCharges([]);
          setPersonalization([]);
          setPackagingShipping([]);
        }
      }
      setTermsAndConditions('');
      setNotes('');
      setEffectiveDate('');
    }
    setHasChanges(false);
  }, [sheetKey, allSheets, activeDecType]);

  const markChanged = () => setHasChanges(true);

  // Save enabled decoration types config
  const saveDecTypeConfig = async (types: string[]) => {
    try {
      await fetch(`${API_URL}/contractpricing/${vendorId}/config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ enabledTypes: types }),
      });
    } catch (err) {
      console.error('Error saving dec type config:', err);
    }
  };

  // Add a decoration type
  const addDecType = (typeId: string) => {
    const updated = [...enabledDecTypes, typeId];
    setEnabledDecTypes(updated);
    setActiveDecType(typeId);
    setShowAddTypeMenu(false);
    saveDecTypeConfig(updated);
    toast.success(`Added ${ALL_DECORATION_TYPES.find(d => d.id === typeId)?.label}`);
  };

  // Remove a decoration type
  const removeDecType = (typeId: string) => {
    if (enabledDecTypes.length <= 1) {
      toast.error('Must have at least one decoration type');
      return;
    }
    const updated = enabledDecTypes.filter(id => id !== typeId);
    setEnabledDecTypes(updated);
    if (activeDecType === typeId) {
      setActiveDecType(updated[0]);
    }
    saveDecTypeConfig(updated);
    toast.success(`Removed ${ALL_DECORATION_TYPES.find(d => d.id === typeId)?.label}`);
  };

  // Save current sheet
  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        pricingMatrix,
        quantityBrackets,
        additionalCharges,
        personalization,
        packagingShipping,
        termsAndConditions,
        notes,
        effectiveDate,
      };
      const res = await fetch(`${API_URL}/contractpricing/${vendorId}/${activeDecType}/${activeYear}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        const activeLabel = ALL_DECORATION_TYPES.find(d => d.id === activeDecType)?.label;
        toast.success(`${activeLabel} pricing for ${activeYear} saved`);
        setAllSheets(prev => ({ ...prev, [sheetKey]: data.item }));
        setHasChanges(false);
      } else {
        toast.error(`Failed to save: ${data.error}`);
      }
    } catch (err) {
      console.error('Error saving contract pricing:', err);
      toast.error('Error saving pricing');
    } finally {
      setSaving(false);
    }
  };

  // Copy from previous year
  const handleCopyFromYear = (fromYear: string) => {
    const sourceKey = `${activeDecType}:${fromYear}`;
    const source = allSheets[sourceKey];
    if (source) {
      setPricingMatrix(source.pricingMatrix.map(r => ({ ...r, prices: [...r.prices] })));
      setQuantityBrackets([...source.quantityBrackets]);
      setAdditionalCharges(source.additionalCharges.map(c => ({ ...c })));
      setPersonalization(source.personalization.map(c => ({ ...c })));
      setPackagingShipping(source.packagingShipping.map(c => ({ ...c })));
      setTermsAndConditions(source.termsAndConditions);
      setNotes(source.notes);
      setHasChanges(true);
      setCopiedFromYear(fromYear);
      setTimeout(() => setCopiedFromYear(null), 2000);
      toast.success(`Copied ${fromYear} pricing as starting point`);
    }
  };

  // Matrix cell update
  const updateCell = (rowIdx: number, colIdx: number, value: string) => {
    setPricingMatrix(prev =>
      prev.map((r, ri) => ri === rowIdx ? { ...r, prices: r.prices.map((p, ci) => ci === colIdx ? value : p) } : r)
    );
    markChanged();
  };

  // Update row label
  const updateRowLabel = (rowIdx: number, value: string) => {
    setPricingMatrix(prev => prev.map((r, i) => i === rowIdx ? { ...r, label: value } : r));
    markChanged();
  };

  // Update bracket label
  const updateBracket = (colIdx: number, value: string) => {
    setQuantityBrackets(prev => prev.map((b, i) => i === colIdx ? value : b));
    markChanged();
  };

  // Add row
  const addRow = () => {
    const options = ROW_LABEL_OPTIONS[activeDecType] || [];
    const usedLabels = pricingMatrix.map(r => r.label);
    const nextLabel = options.find(o => !usedLabels.includes(o)) || '';
    setPricingMatrix(prev => [...prev, { id: uid(), label: nextLabel, prices: Array(quantityBrackets.length).fill('') }]);
    markChanged();
  };

  // Remove row
  const removeRow = (idx: number) => {
    setPricingMatrix(prev => prev.filter((_, i) => i !== idx));
    markChanged();
  };

  // Add column
  const addColumn = () => {
    setQuantityBrackets(prev => [...prev, 'New']);
    setPricingMatrix(prev => prev.map(r => ({ ...r, prices: [...r.prices, ''] })));
    markChanged();
  };

  // Remove column
  const removeColumn = (colIdx: number) => {
    setQuantityBrackets(prev => prev.filter((_, i) => i !== colIdx));
    setPricingMatrix(prev => prev.map(r => ({ ...r, prices: r.prices.filter((_, i) => i !== colIdx) })));
    markChanged();
  };

  // Charge list helpers
  const updateChargeItem = (
    _list: ChargeItem[],
    setter: React.Dispatch<React.SetStateAction<ChargeItem[]>>,
    id: string,
    field: keyof ChargeItem,
    value: string
  ) => {
    setter(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
    markChanged();
  };

  const addChargeItem = (setter: React.Dispatch<React.SetStateAction<ChargeItem[]>>) => {
    setter(prev => [...prev, { id: uid(), name: '', price: '', description: '' }]);
    markChanged();
  };

  const removeChargeItem = (setter: React.Dispatch<React.SetStateAction<ChargeItem[]>>, id: string) => {
    setter(prev => prev.filter(c => c.id !== id));
    markChanged();
  };

  // Handle file upload for pricing table extraction
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a PDF or image file (PNG, JPG)');
      return;
    }

    setUploading(true);
    toast.info('Extracting pricing table from upload...');

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = async () => {
        const base64 = reader.result as string;
        
        // Call backend AI extraction endpoint
        const res = await fetch(`${API_URL}/ai/extract-pricing-table`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            file: base64,
            fileType: file.type,
            decorationType: activeDecType,
            currentBrackets: quantityBrackets,
          }),
        });

        const data = await res.json();
        
        if (data.success && data.extracted) {
          // Map extracted data to our format
          const extracted = data.extracted;
          const newBrackets = extracted.quantityBrackets || quantityBrackets;
          const newMatrix: PricingRow[] = extracted.rows?.map((row: any, i: number) => ({
            id: uid(),
            label: row.label || '',
            prices: row.prices || Array(newBrackets.length).fill(''),
          })) || [];

          setExtractedData({ matrix: newMatrix, brackets: newBrackets });
          setShowUploadPreview(true);
          toast.success('Pricing table extracted! Review and confirm below.');
        } else {
          toast.error(data.error || 'Failed to extract pricing table');
        }
      };
      
      reader.onerror = () => {
        toast.error('Failed to read file');
      };
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Error processing file');
    } finally {
      setUploading(false);
      // Reset file input
      if (fileUploadRef.current) {
        fileUploadRef.current.value = '';
      }
    }
  };

  // Apply extracted data
  const applyExtractedData = () => {
    if (extractedData) {
      setPricingMatrix(extractedData.matrix);
      setQuantityBrackets(extractedData.brackets);
      setExtractedData(null);
      setShowUploadPreview(false);
      markChanged();
      toast.success('Pricing table applied!');
    }
  };

  const activeDecConfig = ALL_DECORATION_TYPES.find(d => d.id === activeDecType);
  const rowLabel = getRowLabelForType(activeDecType);
  const rowOptions = ROW_LABEL_OPTIONS[activeDecType] || [];

  // Available types to add (not yet enabled)
  const availableToAdd = ALL_DECORATION_TYPES.filter(dt => !enabledDecTypes.includes(dt.id));

  // Years that have data for the active dec type
  const yearsWithData = YEARS.filter(y => allSheets[`${activeDecType}:${y}`]);
  const copyableYears = yearsWithData.filter(y => y !== activeYear);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
        <span className="ml-3 text-slate-500 font-medium">Loading pricing data...</span>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-visible">
        <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-violet-50 px-6 py-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Contract Pricing</h3>
              <p className="text-sm text-slate-500">Manage decoration pricing by type and year for {vendorName}</p>
            </div>
            <div className="flex items-center gap-2">
              {hasChanges && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 border border-amber-300 rounded-lg">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-xs font-bold text-amber-700">Unsaved changes</span>
                </motion.div>
              )}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={saving || !hasChanges}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save Pricing'}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Decoration Type Tabs */}
        <div className="px-6 pt-4 pb-0">
          <div className="flex items-center gap-2 overflow-x-auto pb-0">
            {enabledDecTypes.map(typeId => {
              const dt = ALL_DECORATION_TYPES.find(d => d.id === typeId);
              if (!dt) return null;
              const hasData = YEARS.some(y => allSheets[`${dt.id}:${y}`]);
              const Icon = dt.icon;
              return (
                <div key={dt.id} className="relative group/tab flex-shrink-0">
                  <button
                    onClick={() => setActiveDecType(dt.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-sm font-bold transition-all whitespace-nowrap border-b-2 ${
                      activeDecType === dt.id
                        ? 'bg-white border-indigo-600 text-indigo-700 shadow-sm'
                        : 'bg-transparent border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {dt.label}
                    {hasData && (
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                    )}
                  </button>
                  {enabledDecTypes.length > 1 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); removeDecType(dt.id); }}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/tab:opacity-100 transition-opacity shadow-md hover:bg-red-600 z-10"
                      title={`Remove ${dt.label}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}

            {/* Add Decoration Type Button */}
            {availableToAdd.length > 0 && (
              <div ref={addTypeRef} className="relative flex-shrink-0">
                <button
                  onClick={() => setShowAddTypeMenu(!showAddTypeMenu)}
                  className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-bold text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-t-xl transition-all border-b-2 border-transparent"
                >
                  <Plus className="w-4 h-4" />
                  Add Type
                </button>

                <AnimatePresence>
                  {showAddTypeMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 top-full z-[9999] mt-1 w-52 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden"
                    >
                      <div className="py-1">
                        {availableToAdd.map(dt => {
                          const Icon = dt.icon;
                          return (
                            <button
                              key={dt.id}
                              onClick={() => addDecType(dt.id)}
                              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                            >
                              <Icon className="w-4 h-4" />
                              {dt.label}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* Year Selector Row */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-bold text-slate-600">Pricing Year:</span>
              <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-200 p-1">
                {YEARS.map(y => {
                  const hasData = !!allSheets[`${activeDecType}:${y}`];
                  return (
                    <button
                      key={y}
                      onClick={() => { setActiveYear(y); setEffectiveDate(y); markChanged(); }}
                      className={`relative px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                        activeYear === y
                          ? 'bg-indigo-600 text-white shadow-md'
                          : hasData
                            ? 'text-indigo-600 hover:bg-indigo-50'
                            : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                      }`}
                    >
                      {y}
                      {hasData && activeYear !== y && (
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-green-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Copy from other year */}
            {copyableYears.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-400">Copy from:</span>
                {copyableYears.map(y => (
                  <motion.button
                    key={y}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCopyFromYear(y)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition-all"
                  >
                    {copiedFromYear === y ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                    {y}
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pricing Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900">{activeDecConfig?.label} Price Matrix — {activeYear}</h4>
              <p className="text-xs text-slate-500">{rowLabel} (rows) vs Quantity Brackets (columns) · All prices per piece</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={addRow}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-200 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Add Row
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={addColumn}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-200 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Add Column
            </motion.button>
            
            {/* Upload Pricing Table Button */}
            <motion.button 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }} 
              onClick={() => fileUploadRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-lg text-xs font-bold hover:shadow-lg transition-all disabled:opacity-50"
            >
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              Upload Pricing Table
            </motion.button>
            
            {/* Hidden file input */}
            <input
              ref={fileUploadRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider w-44 min-w-[176px]">
                  {rowLabel}
                </th>
                {quantityBrackets.map((bracket, colIdx) => (
                  <th key={colIdx} className="px-2 py-3 min-w-[90px]">
                    <EditableBracketHeader
                      value={bracket}
                      onChange={(val) => updateBracket(colIdx, val)}
                      onRemove={() => removeColumn(colIdx)}
                      canRemove={quantityBrackets.length > 1}
                    />
                  </th>
                ))}
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {pricingMatrix.map((row, rowIdx) => (
                <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors group/row">
                  <td className="px-4 py-2">
                    <RowLabelSelector
                      value={row.label}
                      options={rowOptions}
                      onChange={(val) => updateRowLabel(rowIdx, val)}
                    />
                  </td>
                  {row.prices.map((price, colIdx) => (
                    <td key={colIdx} className="px-2 py-2">
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-300 text-xs">$</span>
                        <input
                          type="text"
                          value={price}
                          onChange={(e) => updateCell(rowIdx, colIdx, e.target.value)}
                          className="w-full text-center text-sm font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-lg py-1.5 pl-5 pr-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 focus:bg-white transition-all hover:border-slate-300"
                          placeholder="0.00"
                        />
                      </div>
                    </td>
                  ))}
                  <td className="px-2 py-2">
                    {pricingMatrix.length > 1 && (
                      <button
                        onClick={() => removeRow(rowIdx)}
                        className="opacity-0 group-hover/row:opacity-100 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Remove row"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Effective date */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center gap-4">
          <span className="text-xs font-bold text-slate-500 uppercase">Effective Date:</span>
          <input
            type="date"
            value={effectiveDate || '2026-01-01'}
            onChange={(e) => { setEffectiveDate(e.target.value); markChanged(); }}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 w-40 cursor-pointer"
          />
        </div>
      </div>

      {/* Additional Charges Section */}
      <ChargesSection
        title="Additional Charges"
        subtitle="Digitizing, sewouts, rush charges, and other fees"
        icon={DollarSign}
        items={additionalCharges}
        onUpdate={(id, field, val) => updateChargeItem(additionalCharges, setAdditionalCharges, id, field, val)}
        onAdd={() => addChargeItem(setAdditionalCharges)}
        onRemove={(id) => removeChargeItem(setAdditionalCharges, id)}
        color="amber"
      />

      {/* Personalization Section */}
      {(activeDecType === 'embroidery' || personalization.length > 0) && (
        <ChargesSection
          title="Personalization"
          subtitle="Names, numbers, and other customization pricing"
          icon={Pen}
          items={personalization}
          onUpdate={(id, field, val) => updateChargeItem(personalization, setPersonalization, id, field, val)}
          onAdd={() => addChargeItem(setPersonalization)}
          onRemove={(id) => removeChargeItem(setPersonalization, id)}
          color="violet"
        />
      )}

      {/* Packaging & Shipping */}
      {(activeDecType === 'embroidery' || packagingShipping.length > 0) && (
        <ChargesSection
          title="Packaging / Shipping Services"
          subtitle="UPS, FedEx, sorting, and handling fees"
          icon={Package}
          items={packagingShipping}
          onUpdate={(id, field, val) => updateChargeItem(packagingShipping, setPackagingShipping, id, field, val)}
          onAdd={() => addChargeItem(setPackagingShipping)}
          onRemove={(id) => removeChargeItem(setPackagingShipping, id)}
          color="cyan"
        />
      )}

      {/* Terms & Conditions + Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-slate-600" />
            </div>
            <h4 className="font-bold text-slate-900">Terms & Conditions</h4>
          </div>
          <div className="p-6">
            <textarea
              value={termsAndConditions}
              onChange={(e) => { setTermsAndConditions(e.target.value); markChanged(); }}
              rows={8}
              placeholder={"Standard service: 5 to 7 working days after approval of digitized logo\nAll stitch counts rounded up to the nearest thousand\n3% damage allowance\n..."}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all resize-none"
            />
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
              <Info className="w-4 h-4 text-slate-600" />
            </div>
            <h4 className="font-bold text-slate-900">Internal Notes</h4>
          </div>
          <div className="p-6">
            <textarea
              value={notes}
              onChange={(e) => { setNotes(e.target.value); markChanged(); }}
              rows={8}
              placeholder="Internal notes about this vendor's pricing, negotiation history, etc..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all resize-none"
            />
          </div>
        </div>
      </div>

      {/* Bottom Save Bar */}
      <AnimatePresence>
        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="sticky bottom-4 z-30"
          >
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-4 shadow-2xl border-2 border-indigo-400/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-300" />
                <span className="text-white font-semibold">
                  You have unsaved changes to {activeDecConfig?.label} — {activeYear}
                </span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-white text-indigo-700 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Preview Modal */}
      <AnimatePresence>
        {showUploadPreview && extractedData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowUploadPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-violet-600 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Upload className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Review Extracted Pricing Data</h3>
                    <p className="text-sm text-purple-100">Review the AI-extracted data before applying</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowUploadPreview(false)}
                  className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Preview Table */}
              <div className="p-6 overflow-auto max-h-[60vh]">
                <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-200 border-b border-slate-300">
                        <th className="text-left px-4 py-3 text-xs font-bold text-slate-700 uppercase">
                          {rowLabel}
                        </th>
                        {extractedData.brackets.map((bracket, idx) => (
                          <th key={idx} className="px-2 py-3 text-center text-xs font-bold text-slate-700 uppercase min-w-[90px]">
                            {bracket}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {extractedData.matrix.map((row, rowIdx) => (
                        <tr key={row.id} className="border-b border-slate-200 hover:bg-slate-100/50 transition-colors">
                          <td className="px-4 py-2 text-sm font-semibold text-slate-900">
                            {row.label}
                          </td>
                          {row.prices.map((price, colIdx) => (
                            <td key={colIdx} className="px-2 py-2 text-center text-sm font-medium text-slate-900">
                              {price ? `$${price}` : '—'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-start gap-2">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900">AI Extraction Preview</p>
                      <p className="text-xs text-blue-700 mt-1">
                        This data was extracted using AI. Please review it carefully before applying. 
                        You can edit any values after applying.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowUploadPreview(false)}
                  className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={applyExtractedData}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
                >
                  <Check className="w-4 h-4" />
                  Apply to Pricing Table
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Reusable Charges Section ───
function ChargesSection({
  title,
  subtitle,
  icon: Icon,
  items,
  onUpdate,
  onAdd,
  onRemove,
  color,
}: {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  items: ChargeItem[];
  onUpdate: (id: string, field: keyof ChargeItem, value: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 bg-${color}-100 rounded-xl flex items-center justify-center`}>
            <Icon className={`w-5 h-5 text-${color}-600`} />
          </div>
          <div>
            <h4 className="font-bold text-slate-900">{title}</h4>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAdd}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-200 transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> Add Item
        </motion.button>
      </div>
      <div className="divide-y divide-slate-100">
        {items.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <p className="text-sm text-slate-400">No items yet. Click "Add Item" to get started.</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="px-6 py-3 flex items-center gap-3 group hover:bg-slate-50/50 transition-colors">
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => onUpdate(item.id, 'name', e.target.value)}
                  placeholder="Charge name..."
                  className="w-full text-sm font-semibold text-slate-900 bg-transparent border-0 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white rounded-lg py-1 px-2 transition-all"
                />
              </div>
              <div className="w-48">
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => onUpdate(item.id, 'description', e.target.value)}
                  placeholder="Description..."
                  className="w-full text-xs text-slate-500 bg-transparent border-0 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white rounded-lg py-1 px-2 transition-all"
                />
              </div>
              <div className="w-28 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-xs">$</span>
                <input
                  type="text"
                  value={item.price}
                  onChange={(e) => onUpdate(item.id, 'price', e.target.value)}
                  placeholder="0.00"
                  className="w-full text-sm font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg py-1.5 pl-6 pr-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all text-right"
                />
              </div>
              <button
                onClick={() => onRemove(item.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}