import { motion } from 'motion/react';
import { ArrowLeft, Star, Upload, Plus, X, ExternalLink, FileText, Package, Box, Ruler, Weight, Archive, ChevronDown, GripVertical, Trash2, Zap, Truck, User, Sparkles, Loader2 } from 'lucide-react';
import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

interface ProductDetailViewProps {
  product: any;
  onBack: () => void;
  onSave?: () => void;
}

export function ProductDetailView({ product, onBack, onSave }: ProductDetailViewProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [productImages, setProductImages] = useState<string[]>(
    product.productImages || (product.image ? [product.image] : [])
  );
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const [decorationMethods, setDecorationMethods] = useState<string[]>(product.decorationMethods || []);
  const [imprintLocations, setImprintLocations] = useState<string[]>(product.imprintLocations || []);
  const [customLocation, setCustomLocation] = useState('');
  const [decorationDropdownOpen, setDecorationDropdownOpen] = useState(false);
  const [imprintDropdownOpen, setImprintDropdownOpen] = useState(false);
  const [catalogDisplays, setCatalogDisplays] = useState(product.catalogDisplays || {
    bulkSwag: false,
    buildABox: false,
  });
  const [documents, setDocuments] = useState<{ id: number; name: string; date: string }[]>(product.documents || []);
  
  // Parse leadTime string into productionTimeRange array
  const parseLeadTime = (leadTime: string | undefined): [number, number] => {
    if (!leadTime) return [3, 15];
    // Handle new format: "14-21 Business Days" or "14-21 Total Days"
    const match = leadTime.match(/(\d+)-(\d+)/);
    if (match) {
      return [parseInt(match[1]), parseInt(match[2])];
    }
    // Handle single number format: "14 Business Days"
    const singleMatch = leadTime.match(/(\d+)/);
    if (singleMatch) {
      const val = parseInt(singleMatch[1]);
      return [val, val];
    }
    return [3, 15];
  };
  
  const [productionTimeRange, setProductionTimeRange] = useState<[number, number]>(
    product.productionTimeRange || parseLeadTime(product.leadTime)
  );
  const [qualifiesForRush, setQualifiesForRush] = useState(product.qualifiesForRush || false);
  const [origin, setOrigin] = useState(product.origin || product.countryOfOrigin || '');
  const [nextDocId, setNextDocId] = useState((product.documents || []).length + 1);
  const KNOWN_VENDOR_TYPES = ['Product Distributor', 'Apparel Distributor', 'Decorator', 'Promo Supplier', 'Product Manufacturer'];
  // Initialize vendorType: check vendorType field first, then fall back to category if it's a known vendor type
  const resolvedVendorType = product.vendorType || 
    (KNOWN_VENDOR_TYPES.includes(product.category) ? product.category : '') ||
    (product.vendor ? 'Promo Supplier' : '');
  const [vendorType, setVendorType] = useState(resolvedVendorType);
  // Initialize category: use productCategory first, then category only if it's NOT a vendor type
  const resolvedCategory = product.productCategory || 
    (product.category && !KNOWN_VENDOR_TYPES.includes(product.category) ? product.category : 'Apparel');
  const [category, setCategory] = useState(resolvedCategory);
  const productCategoryIsDistributor = resolvedVendorType === 'Product Distributor' || resolvedVendorType === 'Apparel Distributor';
  const [showDecorationMethods, setShowDecorationMethods] = useState(
    product.showDecorationMethods !== undefined ? product.showDecorationMethods : !productCategoryIsDistributor
  );
  const [showImprintLocations, setShowImprintLocations] = useState(
    product.showImprintLocations !== undefined ? product.showImprintLocations : !productCategoryIsDistributor
  );
  const [subcategory, setSubcategory] = useState(product.subcategory || '');
  const [showPricingStructure, setShowPricingStructure] = useState(
    product.showPricingStructure !== undefined ? product.showPricingStructure : true
  );
  const [decorationVendors, setDecorationVendors] = useState<{ id: string; name: string; type: string }[]>([]);
  const [selectedDecorationVendor, setSelectedDecorationVendor] = useState<string>(product.decorationVendor || '');
  const [showDecoVendorDropdown, setShowDecoVendorDropdown] = useState(false);
  const [dimensionUnit, setDimensionUnit] = useState<'in' | 'cm'>(product.dimensionUnit || 'in');
  const [weightUnit, setWeightUnit] = useState<'lb' | 'kg' | 'oz' | 'g'>(product.weightUnit || 'lb');
  const [lifestyleImageIndex, setLifestyleImageIndex] = useState<number | null>(product.lifestyleImageIndex ?? null);

  // Form fields as controlled state for persistence
  const [productName, setProductName] = useState(product.name || '');
  const [productSku, setProductSku] = useState(product.sku || '');
  const [productBrand, setProductBrand] = useState(product.brand || '');
  const [productLink, setProductLink] = useState(product.productLink || '');
  const [productDescription, setProductDescription] = useState(product.description || '');
  const [dims, setDims] = useState(product.dims || { l: '', w: '', h: '' });
  const [caseWeight, setCaseWeight] = useState(product.caseWeight || '');
  const [storageSize, setStorageSize] = useState(product.storageSize || 'Small');
  const [productStatus, setProductStatus] = useState(product.status || 'Active');
  const [productWeight, setProductWeight] = useState(product.productWeight || '');
  const [productWeightUnit, setProductWeightUnit] = useState<'lb' | 'kg' | 'oz' | 'g'>(product.productWeightUnit || 'lb');

  // Custom dropdown open states
  const [vendorTypeOpen, setVendorTypeOpen] = useState(false);
  const [shipmentTimeOpen, setShipmentTimeOpen] = useState(false);
  const [originOpen, setOriginOpen] = useState(false);
  const [storageSizeOpen, setStorageSizeOpen] = useState(false);

  // Variant Builder State
  const [baseSku, setBaseSku] = useState(product.baseSku || product.sku || '');
  const [basePrice, setBasePrice] = useState(
    parseFloat(String(product.basePrice || '0').replace('$', '')) || 0
  );
  const [colorGroups, setColorGroups] = useState<{ id: number; color: string; code: string; sizes: string[] }[]>(
    (product.colorGroups || []).map((g: any) => ({ ...g, sizes: g.sizes || [] }))
  );
  const [sizePriceOverrides, setSizePriceOverrides] = useState<Record<string, number>>(product.sizePriceOverrides || {});
  const [skuPriceOverrides, setSkuPriceOverrides] = useState<Record<string, number>>(product.skuPriceOverrides || {});
  const [variantImageMap, setVariantImageMap] = useState<Record<string, number>>(product.variantImageMap || {});
  const [imagePickerSku, setImagePickerSku] = useState<string | null>(null);
  const [newColorInput, setNewColorInput] = useState('');
  const [nextColorId, setNextColorId] = useState((product.colorGroups || []).length > 0 ? Math.max(...(product.colorGroups || []).map((g: any) => g.id)) + 1 : 1);
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [customSizeInputs, setCustomSizeInputs] = useState<Record<number, string>>({});
  const [expandedColorId, setExpandedColorId] = useState<number | null>(null);
  const [aiSuggesting, setAiSuggesting] = useState(false);
  // Track uploaded image filenames for AI color detection
  const [imageFileNames, setImageFileNames] = useState<string[]>(product.imageFileNames || []);

  const standardSizes = ['XXS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL'];

  // Tiered Pricing Edit State
  const [isEditingTieredPricing, setIsEditingTieredPricing] = useState(false);
  const [editedTieredPricing, setEditedTieredPricing] = useState<any[]>([]);
  const [editedQuantities, setEditedQuantities] = useState<(number | string)[]>([250, 500, 750, 1125, 1500]);

  const sortSizes = (sizes: string[]): string[] => {
    return [...sizes].sort((a, b) => {
      const idxA = standardSizes.indexOf(a);
      const idxB = standardSizes.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });
  };
  
  const generateColorCode = (color: string): string => {
    const codeMap: Record<string, string> = {
      'black': 'BLK', 'white': 'WHT', 'red': 'RED', 'blue': 'BLU', 'green': 'GRN',
      'gray': 'GRY', 'grey': 'GRY', 'navy': 'NVY', 'pink': 'PNK', 'purple': 'PUR',
      'orange': 'ORG', 'yellow': 'YLW', 'brown': 'BRN', 'tan': 'TAN', 'teal': 'TEL',
      'maroon': 'MRN', 'gold': 'GLD', 'silver': 'SLV', 'charcoal': 'CHR', 'heather gray': 'HTG',
      'royal blue': 'RBL', 'forest green': 'FGR', 'sky blue': 'SKB', 'light blue': 'LBL',
      'dark green': 'DGR', 'light gray': 'LGR', 'coral': 'CRL', 'olive': 'OLV',
    };
    const lower = color.toLowerCase().trim();
    if (codeMap[lower]) return codeMap[lower];
    return color.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase();
  };

  const addColor = () => {
    const trimmed = newColorInput.trim();
    if (!trimmed) return;
    if (colorGroups.some(g => g.color.toLowerCase() === trimmed.toLowerCase())) return;
    const code = generateColorCode(trimmed);
    setColorGroups(prev => [...prev, { id: nextColorId, color: trimmed, code, sizes: [] }]);
    setNextColorId(prev => prev + 1);
    setNewColorInput('');
  };

  const removeColor = (id: number) => {
    setColorGroups(prev => prev.filter(g => g.id !== id));
  };

  const toggleSize = (colorId: number, size: string) => {
    setColorGroups(prev => prev.map(g => {
      if (g.id !== colorId) return g;
      const hasSz = g.sizes.includes(size);
      const newSizes = hasSz ? g.sizes.filter(s => s !== size) : sortSizes([...g.sizes, size]);
      return { ...g, sizes: newSizes };
    }));
  };

  // Tiered Pricing Edit Functions
  const startEditingTieredPricing = () => {
    setEditedTieredPricing(JSON.parse(JSON.stringify(product.tieredPricing || [])));
    const existingQtys = product.tieredPricing && product.tieredPricing.length > 0 
      ? Object.keys(product.tieredPricing[0].prices || {}).map(key => {
          const num = Number(key);
          return isNaN(num) ? key : num;
        }).sort((a, b) => {
          // Sort numbers numerically, strings by size order
          if (typeof a === 'number' && typeof b === 'number') return a - b;
          if (typeof a === 'string' && typeof b === 'string') {
            const idxA = standardSizes.indexOf(a);
            const idxB = standardSizes.indexOf(b);
            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            if (idxA !== -1) return -1;
            if (idxB !== -1) return 1;
            return a.localeCompare(b);
          }
          return typeof a === 'number' ? -1 : 1;
        })
      : [250, 500, 750, 1125, 1500];
    setEditedQuantities(existingQtys as any);
    setIsEditingTieredPricing(true);
  };

  const cancelEditingTieredPricing = () => {
    setIsEditingTieredPricing(false);
    setEditedTieredPricing([]);
    // Reset to original quantities/sizes from product
    const existingQtys = product.tieredPricing && product.tieredPricing.length > 0 
      ? Object.keys(product.tieredPricing[0].prices || {}).map(key => {
          const num = Number(key);
          return isNaN(num) ? key : num;
        }).sort((a, b) => {
          // Sort numbers numerically, strings by size order
          if (typeof a === 'number' && typeof b === 'number') return a - b;
          if (typeof a === 'string' && typeof b === 'string') {
            const idxA = standardSizes.indexOf(a);
            const idxB = standardSizes.indexOf(b);
            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            if (idxA !== -1) return -1;
            if (idxB !== -1) return 1;
            return a.localeCompare(b);
          }
          return typeof a === 'number' ? -1 : 1;
        })
      : [250, 500, 750, 1125, 1500];
    setEditedQuantities(existingQtys as any);
  };

  const saveTieredPricing = () => {
    product.tieredPricing = editedTieredPricing;
    setIsEditingTieredPricing(false);
    toast.success('Tiered pricing updated');
  };

  const addTieredPricingRow = () => {
    const newRow = {
      imprintMethod: '',
      decorationMethod: '',
      prices: editedQuantities.reduce((acc, qty) => ({ ...acc, [qty]: '' }), {})
    };
    setEditedTieredPricing([...editedTieredPricing, newRow]);
  };

  const removeTieredPricingRow = (index: number) => {
    setEditedTieredPricing(editedTieredPricing.filter((_, i) => i !== index));
  };

  const updateTieredPricingMethod = (index: number, method: string) => {
    const updated = [...editedTieredPricing];
    updated[index].imprintMethod = method;
    updated[index].decorationMethod = method;
    setEditedTieredPricing(updated);
  };

  const updateTieredPrice = (rowIndex: number, qty: number | string, value: string) => {
    const updated = [...editedTieredPricing];
    updated[rowIndex].prices[qty] = value;
    setEditedTieredPricing(updated);
  };

  const addQuantityColumn = () => {
    const newQty = prompt('Enter new quantity:');
    if (newQty && !isNaN(Number(newQty))) {
      const qty = Number(newQty);
      if (!editedQuantities.includes(qty)) {
        const newQtys = [...editedQuantities, qty].sort((a, b) => a - b);
        setEditedQuantities(newQtys);
        // Add this quantity to all rows
        const updated = editedTieredPricing.map(row => ({
          ...row,
          prices: { ...row.prices, [qty]: '' }
        }));
        setEditedTieredPricing(updated);
      }
    }
  };

  const removeQuantityColumn = (qty: number | string) => {
    setEditedQuantities(editedQuantities.filter(q => q !== qty));
    // Remove this quantity from all rows
    const updated = editedTieredPricing.map(row => {
      const { [qty]: removed, ...rest } = row.prices;
      return { ...row, prices: rest };
    });
    setEditedTieredPricing(updated);
  };

  const addCustomSize = (colorId: number) => {
    const val = (customSizeInputs[colorId] || '').trim();
    if (!val) return;
    setColorGroups(prev => prev.map(g => {
      if (g.id !== colorId || g.sizes.includes(val)) return g;
      return { ...g, sizes: sortSizes([...g.sizes, val]) };
    }));
    setCustomSizeInputs(prev => ({ ...prev, [colorId]: '' }));
  };

  const addAllSizes = (colorId: number) => {
    setColorGroups(prev => prev.map(g => {
      if (g.id !== colorId) return g;
      const newSizes = sortSizes([...new Set([...g.sizes, ...standardSizes])]);
      return { ...g, sizes: newSizes };
    }));
  };

  const getVariantPrice = (sku: string, size: string): number => {
    if (skuPriceOverrides[sku] !== undefined) return skuPriceOverrides[sku];
    if (sizePriceOverrides[size] !== undefined) return sizePriceOverrides[size];
    return basePrice;
  };

  const allVariants = colorGroups.flatMap(g =>
    (g.sizes || []).map(size => {
      const skuKey = `${baseSku}-${g.code}-${size}`;
      return {
        sku: skuKey,
        color: g.color,
        colorCode: g.code,
        colorId: g.id,
        size,
        price: getVariantPrice(skuKey, size),
        imageIndex: variantImageMap[skuKey] ?? 0,
      };
    })
  );

  const updateVariantPrice = (sku: string, size: string, price: number) => {
    // Apply price to ALL variants with this size
    if (Math.abs(price - basePrice) < 0.001) {
      // Reset to base price - remove size override
      setSizePriceOverrides(prev => {
        const next = { ...prev };
        delete next[size];
        return next;
      });
      // Also clean up any individual SKU overrides for this size
      setSkuPriceOverrides(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(k => {
          if (k.endsWith(`-${size}`)) delete next[k];
        });
        return next;
      });
    } else {
      setSizePriceOverrides(prev => ({ ...prev, [size]: price }));
      // Clear individual SKU overrides for this size since size-level now handles it
      setSkuPriceOverrides(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(k => {
          if (k.endsWith(`-${size}`)) delete next[k];
        });
        return next;
      });
    }
  };

  const resetAllPrices = () => {
    setSizePriceOverrides({});
    setSkuPriceOverrides({});
  };

  const assignImageToSku = (sku: string, imageIndex: number) => {
    setVariantImageMap(prev => ({ ...prev, [sku]: imageIndex }));
    setImagePickerSku(null);
  };

  const assignImageToColor = (colorCode: string, imageIndex: number) => {
    setVariantImageMap(prev => {
      const next = { ...prev };
      allVariants.filter(v => v.colorCode === colorCode).forEach(v => {
        next[v.sku] = imageIndex;
      });
      return next;
    });
    setImagePickerSku(null);
  };

  const categorySubcategories: Record<string, string[]> = {
    'Apparel': ['T-Shirts', 'Hoodies', 'Polos', 'Jackets', 'Hats', 'Socks', 'Activewear'],
    'Drinkware': ['Mugs', 'Tumblers', 'Water Bottles', 'Wine Glasses', 'Can Coolers', 'Shot Glasses'],
    'Tech Accessories': ['Phone Cases', 'Chargers', 'USB Drives', 'Earbuds', 'Power Banks', 'Webcam Covers'],
    'Bags': ['Tote Bags', 'Backpacks', 'Drawstring Bags', 'Duffel Bags', 'Laptop Sleeves', 'Fanny Packs'],
    'Writing': ['Pens', 'Pencils', 'Markers', 'Highlighters', 'Stylus Pens', 'Pen Sets'],
    'Office': ['Notebooks', 'Sticky Notes', 'Desk Accessories', 'Mousepads', 'Calendars', 'Lanyards'],
    'Outdoor': ['Sunglasses', 'Umbrellas', 'Blankets', 'Thermal Blankets', 'Coolers', 'Chairs', 'Sports Bottles'],
    'Wellness': ['Hand Sanitizer', 'Lip Balm', 'First Aid Kits', 'Stress Balls', 'Fitness Bands', 'Towels'],
    'PPE': ['Hard Hats', 'Safety Glasses', 'Gloves', 'High-Vis Vests', 'Face Shields', 'Ear Protection', 'Respirators', 'Safety Boots'],
  };

  // Build production day options including current values if they're custom
  const baseProductionDayOptions = [3, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];
  const productionDayOptions = Array.from(
    new Set([...baseProductionDayOptions, productionTimeRange[0], productionTimeRange[1]])
  ).sort((a, b) => a - b);

  // Determine if this is a distributor-type product (no decoration/imprint needed by default)
  const isDistributorProduct = vendorType === 'Product Distributor' || vendorType === 'Apparel Distributor' || 
    (product.category || '').toLowerCase().includes('distributor');

  const decorationMethodsList = [
    'Screen Print', 'Pad Print', 'Full Color', 
    'Laser Engrave', 'Embroidery', 'Heat Transfer',
    'Sublimation', 'Deboss', 'UV Print', 'DTF'
  ];

  const imprintLocationsList = [
    'Front', 'Back', 'Bottom', 'Top', 
    'Screen', 'Back Panel', 'Back Neck', 'Side',
    'Left Chest', 'Right Chest', 'Left Sleeve', 'Right Sleeve', 'Collar', 'Hem'
  ];

  // Editable pricing structure
  const defaultMarginPct = parseFloat(String(product.margin || '50').replace('%', '')) || 50;
  
  // Helper function to sort apparel sizes in order
  const getSizeSortOrder = (sizeStr: string): number => {
    // Extract size from "Size XS" or just "XS" format
    const size = sizeStr.replace(/^Size\s+/i, '').trim();
    const sizeOrder: Record<string, number> = {
      'XS': 1, 'S': 2, 'M': 3, 'L': 4, 'XL': 5,
      '2XL': 6, '3XL': 7, '4XL': 8, '5XL': 9
    };
    return sizeOrder[size] || 999; // Unknown sizes go to end
  };
  
  // Helper function to convert apparel size-based pricing to pricing rows
  const convertApparelPricingToRows = () => {
    if (!product.tieredPricing || product.tieredPricing.length === 0) return [];
    
    // Check if this is apparel size-based pricing
    const apparelPricingRow = product.tieredPricing.find((row: any) => 
      row.decorationType === 'Apparel Size' || row.decorationMethod === 'Price'
    );
    
    if (!apparelPricingRow || !apparelPricingRow.prices) return [];
    
    // Convert each size to a pricing row
    const rows: { id: number; qty: string; blankCost: number; decorationCost: number; margin: number }[] = [];
    let id = 1;
    
    Object.entries(apparelPricingRow.prices).forEach(([size, price]: [string, any]) => {
      if (price && price !== '') {
        rows.push({
          id: id++,
          qty: `Size ${size}`,
          blankCost: parseFloat(price) || 0,
          decorationCost: 0,
          margin: defaultMarginPct,
        });
      }
    });
    
    // Sort by size order (XS -> 5XL)
    rows.sort((a, b) => getSizeSortOrder(a.qty) - getSizeSortOrder(b.qty));
    
    // Reassign IDs after sorting to maintain sequential order
    rows.forEach((row, index) => {
      row.id = index + 1;
    });
    
    return rows;
  };
  
  // Decoration method-aware pricing state
  const [selectedDecorationMethod, setSelectedDecorationMethod] = useState<string>('Embroidery');
  
  // Imprint method-aware pricing state
  const [selectedImprintMethod, setSelectedImprintMethod] = useState<'Embroidery' | 'Screen Print' | 'DTG' | ''>('');
  const [selectedQuantityTier, setSelectedQuantityTier] = useState<string>('Under 6');
  const [embroideryStitchCount, setEmbroideryStitchCount] = useState<string>(product.embroideryStitchCount || 'up to 5000');
  const [screenPrintColors, setScreenPrintColors] = useState<number>(product.screenPrintColors || 1);
  const [dtgFlatRate, setDtgFlatRate] = useState<number>(product.dtgFlatRate || 0);
  
  // Screen Print Contract Pricing Integration
  const [screenPrintVendors, setScreenPrintVendors] = useState<{ id: string; name: string }[]>([]);
  const [selectedScreenPrintVendor, setSelectedScreenPrintVendor] = useState<string>(product.selectedScreenPrintVendor || '');
  const [contractPricingData, setContractPricingData] = useState<any>(null);
  const [loadingContractPricing, setLoadingContractPricing] = useState(false);
  const [showScreenPrintVendorDropdown, setShowScreenPrintVendorDropdown] = useState(false);
  
  // Embroidery rate lookup: stitch count -> quantity tier -> rate
  const [embroideryRates, setEmbroideryRates] = useState<Record<string, Record<string, number>>>(
    product.embroideryRates || {
      'up to 5000': { 'Under 6': 8.50, '7–14': 7.00, '15–29': 6.00, '30–74': 5.00, '75–149': 4.50, '150–299': 4.00, '300–599': 3.75, '600–999': 3.50 },
      '6000': { 'Under 6': 9.50, '7–14': 8.00, '15–29': 7.00, '30–74': 6.00, '75–149': 5.50, '150–299': 5.00, '300–599': 4.75, '600–999': 4.50 },
      '7000': { 'Under 6': 10.50, '7–14': 9.00, '15–29': 8.00, '30–74': 7.00, '75–149': 6.50, '150–299': 6.00, '300–599': 5.75, '600–999': 5.50 },
      '8000': { 'Under 6': 11.50, '7–14': 10.00, '15–29': 9.00, '30–74': 8.00, '75–149': 7.50, '150–299': 7.00, '300–599': 6.75, '600–999': 6.50 },
      '9000': { 'Under 6': 12.50, '7–14': 11.00, '15–29': 10.00, '30–74': 9.00, '75–149': 8.50, '150–299': 8.00, '300–599': 7.75, '600–999': 7.50 },
      '10000': { 'Under 6': 13.50, '7–14': 12.00, '15–29': 11.00, '30–74': 10.00, '75–149': 9.50, '150–299': 9.00, '300–599': 8.75, '600–999': 8.50 },
      '12000': { 'Under 6': 15.50, '7–14': 14.00, '15–29': 13.00, '30–74': 12.00, '75–149': 11.50, '150–299': 11.00, '300–599': 10.75, '600–999': 10.50 },
    }
  );
  
  // Screen print rate lookup: color count -> quantity tier -> rate
  const [screenPrintRates, setScreenPrintRates] = useState<Record<number, Record<string, number>>>(
    product.screenPrintRates || {
      1: { 'Under 6': 6.00, '7–14': 5.00, '15–29': 4.50, '30–74': 4.00, '75–149': 3.50, '150–299': 3.00, '300–599': 2.75, '600–999': 2.50 },
      2: { 'Under 6': 7.50, '7–14': 6.50, '15–29': 6.00, '30–74': 5.50, '75–149': 5.00, '150–299': 4.50, '300–599': 4.25, '600–999': 4.00 },
      3: { 'Under 6': 9.00, '7–14': 8.00, '15–29': 7.50, '30–74': 7.00, '75–149': 6.50, '150–299': 6.00, '300–599': 5.75, '600–999': 5.50 },
      4: { 'Under 6': 10.50, '7–14': 9.50, '15–29': 9.00, '30–74': 8.50, '75–149': 8.00, '150–299': 7.50, '300–599': 7.25, '600–999': 7.00 },
    }
  );
  
  // Helper: Extract apparel size pricing from tieredPricing
  const extractApparelSizePricing = (): Record<string, number> => {
    // First check if we have saved sizeBlankCosts
    if (product.sizeBlankCosts) {
      return product.sizeBlankCosts;
    }
    
    // Otherwise, extract from tieredPricing
    if (product.tieredPricing && product.tieredPricing.length > 0) {
      const apparelPricingRow = product.tieredPricing.find((row: any) => 
        row.decorationType === 'Apparel Size' || row.decorationMethod === 'Price'
      );
      
      if (apparelPricingRow && apparelPricingRow.prices) {
        const sizePricing: Record<string, number> = {};
        const sizes = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'];
        
        sizes.forEach(size => {
          const price = apparelPricingRow.prices[size];
          if (price !== undefined && price !== '') {
            sizePricing[size] = parseFloat(price) || 0;
          } else {
            // Fallback to basePrice with upcharge for 2XL+
            const upcharge = ['2XL', '3XL', '4XL'].includes(size) 
              ? parseInt(size.replace('XL', '')) 
              : 0;
            sizePricing[size] = (basePrice || 0) + upcharge;
          }
        });
        
        return sizePricing;
      }
    }
    
    // Final fallback to basePrice with upcharges
    return {
      'XS': basePrice || 0,
      'S': basePrice || 0,
      'M': basePrice || 0,
      'L': basePrice || 0,
      'XL': basePrice || 0,
      '2XL': (basePrice || 0) + 2,
      '3XL': (basePrice || 0) + 3,
      '4XL': (basePrice || 0) + 4,
    };
  };
  
  // Size-based blank costs
  const [sizeBlankCosts, setSizeBlankCosts] = useState<Record<string, number>>(extractApparelSizePricing());
  
  // Helper: Get decoration rate based on current method and config
  const getDecorationRate = (size: string): number | null => {
    if (selectedImprintMethod === 'Embroidery') {
      return embroideryRates[embroideryStitchCount]?.[selectedQuantityTier] || null;
    } else if (selectedImprintMethod === 'Screen Print') {
      // Use contract pricing data if available
      if (contractPricingData && selectedScreenPrintVendor) {
        const colorRow = contractPricingData.pricingMatrix?.find((row: any) => 
          row.label === `${screenPrintColors} Color${screenPrintColors > 1 ? 's' : ''}`
        );
        if (colorRow && contractPricingData.quantityBrackets) {
          const tierIndex = contractPricingData.quantityBrackets.indexOf(selectedQuantityTier);
          if (tierIndex >= 0 && colorRow.prices[tierIndex]) {
            return parseFloat(colorRow.prices[tierIndex]);
          }
        }
      }
      // Fallback to screenPrintRates if contract pricing not available
      return screenPrintRates[screenPrintColors]?.[selectedQuantityTier] || null;
    } else if (selectedImprintMethod === 'DTG') {
      return dtgFlatRate;
    }
    return null;
  };
  
  // Helper: Calculate row values
  const calculateRowValues = (size: string) => {
    const blankCost = sizeBlankCosts[size] || 0;
    const decoCost = getDecorationRate(size);
    if (decoCost === null) {
      return { blankCost, decoCost: null, totalCost: null, margin: null, sellPrice: null };
    }
    const totalCost = blankCost + decoCost;
    const marginDecimal = defaultMarginPct / 100;
    const sellPrice = marginDecimal >= 1 ? totalCost : totalCost / (1 - marginDecimal);
    const margin = defaultMarginPct;
    return { blankCost, decoCost, totalCost, margin, sellPrice };
  };
  
  // Helper: Calculate summary averages
  const calculateSummaryAverages = () => {
    const sizes = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'];
    let totalBlank = 0, totalDeco = 0, totalCost = 0, totalSell = 0, count = 0;
    
    sizes.forEach(size => {
      const row = calculateRowValues(size);
      if (row.decoCost !== null && row.totalCost !== null && row.sellPrice !== null) {
        totalBlank += row.blankCost;
        totalDeco += row.decoCost;
        totalCost += row.totalCost;
        totalSell += row.sellPrice;
        count++;
      }
    });
    
    if (count === 0) return { avgBlank: 0, avgDeco: 0, avgTotalCost: 0, avgSellPrice: 0, margin: 0 };
    
    const avgBlank = totalBlank / count;
    const avgDeco = totalDeco / count;
    const avgTotalCost = totalCost / count;
    const avgSellPrice = totalSell / count;
    const margin = avgTotalCost > 0 ? ((avgSellPrice - avgTotalCost) / avgSellPrice * 100) : 0;
    
    return { avgBlank, avgDeco, avgTotalCost, avgSellPrice, margin };
  };
  
  // Quantity tiers based on method
  const getQuantityTiersForMethod = (method: 'Embroidery' | 'Screen Print' | 'DTG'): string[] => {
    if (method === 'DTG') return [];
    return ['Under 6', '7–14', '15–29', '30–74', '75–149', '150–299', '300–599', '600–999'];
  };
  
  // Method-specific pricing structure
  type MethodPricingRows = Record<string, { id: number; qty: string; blankCost: number; decorationCost: number; margin: number }[]>;
  
  const initializeMethodPricing = (): MethodPricingRows => {
    const methods = ['Embroidery', 'Screen Print', 'DTG', 'Heat Transfer', 'Sublimation'];
    const methodPricing: MethodPricingRows = {};
    
    // Check if we have method-specific pricing already saved
    if (product.methodPricingRows) {
      return product.methodPricingRows;
    }
    
    // Otherwise, initialize empty arrays for each method
    methods.forEach(method => {
      methodPricing[method] = [];
    });
    
    // If we have apparel pricing, populate it for all methods
    const apparelRows = convertApparelPricingToRows();
    if (apparelRows.length > 0) {
      methods.forEach(method => {
        methodPricing[method] = JSON.parse(JSON.stringify(apparelRows));
      });
    }
    
    return methodPricing;
  };
  
  const [methodPricingRows, setMethodPricingRows] = useState<MethodPricingRows>(initializeMethodPricing());
  const [methodStitchCount, setMethodStitchCount] = useState<Record<string, string>>(
    product.methodStitchCount || { 'Embroidery': '5000', 'Screen Print': '', 'DTG': '', 'Heat Transfer': '', 'Sublimation': '' }
  );
  const [methodPoQuantity, setMethodPoQuantity] = useState<Record<string, string>>(
    product.methodPoQuantity || { 'Embroidery': '', 'Screen Print': '', 'DTG': '', 'Heat Transfer': '', 'Sublimation': '' }
  );
  
  // Initialize pricing rows - use existing pricingRows or convert from apparel pricing
  const initialPricingRows = product.pricingRows && product.pricingRows.length > 0
    ? product.pricingRows
    : convertApparelPricingToRows();
  
  const [pricingRows, setPricingRows] = useState<{ id: number; qty: string; blankCost: number; decorationCost: number; margin: number }[]>(
    initialPricingRows
  );
  const [nextPricingId, setNextPricingId] = useState(
    initialPricingRows.length > 0 ? Math.max(...initialPricingRows.map((r: any) => r.id)) + 1 : 1
  );

  const addPricingRow = () => {
    const method = selectedDecorationMethod;
    const currentRows = methodPricingRows[method] || [];
    const newId = currentRows.length > 0 ? Math.max(...currentRows.map(r => r.id)) + 1 : 1;
    
    setMethodPricingRows(prev => ({
      ...prev,
      [method]: [...currentRows, {
        id: newId,
        qty: '',
        blankCost: basePrice || 0,
        decorationCost: 0,
        margin: defaultMarginPct,
      }]
    }));
  };

  const updatePricingRow = (id: number, field: string, value: string | number) => {
    const method = selectedDecorationMethod;
    setMethodPricingRows(prev => ({
      ...prev,
      [method]: (prev[method] || []).map(row => row.id === id ? { ...row, [field]: value } : row)
    }));
  };

  const removePricingRow = (id: number) => {
    const method = selectedDecorationMethod;
    setMethodPricingRows(prev => ({
      ...prev,
      [method]: (prev[method] || []).filter(row => row.id !== id)
    }));
  };

  const calcRowTotalCost = (row: { blankCost: number; decorationCost: number }) => {
    return row.blankCost + row.decorationCost;
  };

  const calcRowSellingPrice = (row: { blankCost: number; decorationCost: number; margin: number }) => {
    const total = calcRowTotalCost(row);
    const marginDecimal = row.margin / 100;
    return marginDecimal >= 1 ? total : +(total / (1 - marginDecimal)).toFixed(2);
  };

  const toggleDecorationMethod = (method: string) => {
    setDecorationMethods(prev => 
      prev.includes(method) 
        ? prev.filter(m => m !== method)
        : [...prev, method]
    );
  };

  // Fetch decorator vendors when embroidery (or similar decoration method) is selected
  const needsDecorationVendor = decorationMethods.some(m => 
    ['Embroidery', 'Screen Print', 'Heat Transfer', 'DTF', 'Sublimation'].includes(m)
  );
  useEffect(() => {
    if (!needsDecorationVendor) {
      setDecorationVendors([]);
      return;
    }
    fetch('/api/vendors/list')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.vendors) {
          const decorators = data.vendors
            .map((v: any) => ({
              id: v.id || '',
              name: v.name || v.vendorName || v.companyName || 'Unknown',
              type: v.type || v.vendorType || 'Vendor',
            }))
            .filter((v: { type: string }) => v.type === 'Decorator');
          setDecorationVendors(decorators);
        }
      })
      .catch(err => console.error('Error fetching decorator vendors:', err));
  }, [needsDecorationVendor]);

  // Reset imprint method when decoration methods change
  useEffect(() => {
    if (decorationMethods.length === 0) {
      setSelectedImprintMethod('');
    } else if (selectedImprintMethod && !decorationMethods.includes(selectedImprintMethod)) {
      // Clear if the currently selected method was removed
      setSelectedImprintMethod('');
    }
  }, [decorationMethods, selectedImprintMethod]);

  // Fetch screen print vendors (vendors tagged with screenprint decoration type)
  useEffect(() => {
    if (selectedImprintMethod !== 'Screen Print') return;
    
    fetch('/api/vendors/list')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.vendors) {
          // Filter vendors that have screenprint in their decoration types
          const screenPrintVendorsList = data.vendors
            .filter((v: any) => {
              const decorationTypes = v.decorationTypes || v.decorationType || [];
              const decorationTypesArray = Array.isArray(decorationTypes) ? decorationTypes : [decorationTypes];
              
              // Check if vendor has screen print decoration type
              const hasScreenPrint = decorationTypesArray.some((dt: string) => {
                const dtLower = (dt || '').toLowerCase();
                return dtLower.includes('screen') && dtLower.includes('print');
              });
              
              // Also check if vendor type is Decorator and name/id suggests screen printing
              const isDecorator = (v.type || v.vendorType || '').toLowerCase() === 'decorator';
              const nameIndicatesScreenPrint = (v.name || v.vendorName || v.companyName || '').toLowerCase().includes('screen');
              
              return hasScreenPrint || (isDecorator && nameIndicatesScreenPrint);
            })
            .map((v: any) => ({
              id: v.id || '',
              name: v.name || v.vendorName || v.companyName || 'Unknown',
            }));
          
          console.log('Screen Print Vendors Found:', screenPrintVendorsList);
          setScreenPrintVendors(screenPrintVendorsList);
          
          // Auto-select if product already has a saved vendor
          if (product.selectedScreenPrintVendor && screenPrintVendorsList.some(v => v.id === product.selectedScreenPrintVendor)) {
            setSelectedScreenPrintVendor(product.selectedScreenPrintVendor);
          }
        }
      })
      .catch(err => console.error('Error fetching screen print vendors:', err));
  }, [selectedImprintMethod]);

  // Fetch contract pricing when screen print vendor is selected
  useEffect(() => {
    if (selectedImprintMethod !== 'Screen Print' || !selectedScreenPrintVendor) {
      setContractPricingData(null);
      return;
    }
    
    setLoadingContractPricing(true);
    fetch(`/api/contractpricing/${selectedScreenPrintVendor}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.items) {
          // Find screenprint pricing for 2026 (or latest year)
          const screenPrintSheet = data.items.find((item: any) => 
            item.decorationType === 'screenprint' && item.year === '2026'
          ) || data.items.find((item: any) => 
            item.decorationType === 'screenprint'
          );
          
          if (screenPrintSheet) {
            setContractPricingData(screenPrintSheet);
          } else {
            setContractPricingData(null);
          }
        }
      })
      .catch(err => {
        console.error('Error fetching contract pricing:', err);
        setContractPricingData(null);
      })
      .finally(() => setLoadingContractPricing(false));
  }, [selectedScreenPrintVendor, selectedImprintMethod]);

  const toggleImprintLocation = (location: string) => {
    setImprintLocations(prev => 
      prev.includes(location) 
        ? prev.filter(l => l !== location)
        : [...prev, location]
    );
  };

  const addCustomLocation = () => {
    if (customLocation.trim()) {
      setImprintLocations(prev => [...prev, customLocation.trim()]);
      setCustomLocation('');
    }
  };

  // Upload a base64 image to Supabase Storage and return a URL
  const uploadImageFile = async (file: File): Promise<string> => {
    try {
      const presignRes = await fetch('/api/files/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          entityType: 'product',
          entityId: product.id,
        }),
      });
      const presignData = await presignRes.json();
      if (!presignData.url || !presignData.key) {
        throw new Error('Failed to get presigned URL');
      }
      await fetch(presignData.url, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      const completeRes = await fetch('/api/files/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: presignData.key,
          fileName: file.name,
          fileType: file.type,
          entityType: 'product',
          entityId: product.id,
        }),
      });
      const completeData = await completeRes.json();
      if (completeData.url) return completeData.url;
      return presignData.key;
    } catch (err) {
      console.warn('Product image upload error:', err);
      return URL.createObjectURL(file);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const remaining = 10 - productImages.length;
    const filesToProcess = Array.from(files).slice(0, remaining);
    filesToProcess.forEach(async (file) => {
      const url = await uploadImageFile(file);
      setProductImages(prev => [...prev, url]);
      setImageFileNames(prev => [...prev, file.name]);
    });
    e.target.value = '';
  };

  const handleDeleteImage = (idx: number) => {
    setProductImages(prev => prev.filter((_, i) => i !== idx));
    setImageFileNames(prev => prev.filter((_, i) => i !== idx));
    // Update lifestyle image index when deleting
    setLifestyleImageIndex(prev => {
      if (prev === null) return null;
      if (prev === idx) return null;
      if (idx < prev) return prev - 1;
      return prev;
    });
    setSelectedImage(prev => {
      if (idx === prev) return 0;
      if (idx < prev) return prev - 1;
      return prev;
    });
  };

  const handleDragStart = (idx: number) => {
    setDraggedIndex(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setDragOverIndex(idx);
  };

  const handleDrop = (idx: number) => {
    if (draggedIndex === null || draggedIndex === idx) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }
    setProductImages(prev => {
      const updated = [...prev];
      const [moved] = updated.splice(draggedIndex, 1);
      updated.splice(idx, 0, moved);
      return updated;
    });
    // Update selected image index to follow the image
    if (selectedImage === draggedIndex) {
      setSelectedImage(idx);
    } else if (draggedIndex < selectedImage && idx >= selectedImage) {
      setSelectedImage(selectedImage - 1);
    } else if (draggedIndex > selectedImage && idx <= selectedImage) {
      setSelectedImage(selectedImage + 1);
    }
    // Update lifestyle image index to follow the image
    if (lifestyleImageIndex !== null) {
      if (lifestyleImageIndex === draggedIndex) {
        setLifestyleImageIndex(idx);
      } else if (draggedIndex < lifestyleImageIndex && idx >= lifestyleImageIndex) {
        setLifestyleImageIndex(lifestyleImageIndex - 1);
      } else if (draggedIndex > lifestyleImageIndex && idx <= lifestyleImageIndex) {
        setLifestyleImageIndex(lifestyleImageIndex + 1);
      }
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // ========= SAVE ALL PRODUCT DATA =========
  const handleSaveProduct = async () => {
    if (isSaving) return;

    // Validate product name is required
    if (!productName.trim()) {
      toast.error('Product name is required');
      return;
    }

    setIsSaving(true);
    try {
      // Upload any remaining base64 images to Supabase Storage before saving
      // This prevents oversized KV store entries which can cause data loss
      const uploadedImages = await Promise.all(
        productImages.map(img => uploadImageToStorage(img))
      );

      // For pipeline-sourced products, preserve the real pipeline status.
      // ProductDatabaseModule transforms 'Live' → 'Active' for display,
      // so we must restore 'Live' when writing back to the pipeline store.
      const statusToSave = product._source === 'pipeline' ? 'Live' : productStatus;

      const productData = {
        ...product,
        name: productName.trim(),
        sku: productSku,
        brand: productBrand,
        productLink,
        description: productDescription,
        status: statusToSave,
        productImages: uploadedImages,
        imageFileNames,
        lifestyleImageIndex,
        image: uploadedImages[0] || product.image || '',
        decorationMethods,
        imprintLocations,
        showDecorationMethods,
        showImprintLocations,
        showPricingStructure,
        decorationVendor: selectedDecorationVendor,
        catalogDisplays,
        documents,
        productionTimeRange,
        qualifiesForRush,
        origin,
        vendorType,
        productCategory: category,
        subcategory,
        dimensionUnit,
        weightUnit,
        dims,
        caseWeight,
        storageSize,
        productWeight,
        productWeightUnit,
        baseSku,
        basePrice,
        colorGroups,
        sizePriceOverrides,
        skuPriceOverrides,
        variantImageMap,
        pricingRows,
        methodPricingRows,
        methodStitchCount,
        methodPoQuantity,
        // Imprint-method aware pricing
        embroideryStitchCount,
        screenPrintColors,
        dtgFlatRate,
        embroideryRates,
        screenPrintRates,
        sizeBlankCosts,
        selectedScreenPrintVendor,
      };

      const response = await fetch('/api/projects/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: product.id, ...productData }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Product saved successfully!');
        if (onSave) onSave();
      } else {
        toast.error(`Failed to save: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Error saving product');
    } finally {
      setIsSaving(false);
    }
  };

  // ========= AI COLOR SUGGESTION FROM IMAGE FILENAMES =========
  const knownColors: Record<string, string> = {
    'black': 'BLK', 'white': 'WHT', 'red': 'RED', 'blue': 'BLU', 'green': 'GRN',
    'gray': 'GRY', 'grey': 'GRY', 'navy': 'NVY', 'pink': 'PNK', 'purple': 'PUR',
    'orange': 'ORG', 'yellow': 'YLW', 'brown': 'BRN', 'tan': 'TAN', 'teal': 'TEL',
    'maroon': 'MRN', 'gold': 'GLD', 'silver': 'SLV', 'charcoal': 'CHR',
    'heather gray': 'HTG', 'heather grey': 'HTG', 'royal blue': 'RBL', 'royal': 'RBL',
    'forest green': 'FGR', 'forest': 'FGR', 'sky blue': 'SKB', 'light blue': 'LBL',
    'dark green': 'DGR', 'light gray': 'LGR', 'coral': 'CRL', 'olive': 'OLV',
    'burgundy': 'BRG', 'cream': 'CRM', 'ivory': 'IVR', 'khaki': 'KHK',
    'mint': 'MNT', 'lavender': 'LAV', 'sage': 'SAG', 'rust': 'RST',
    'wine': 'WIN', 'slate': 'SLT', 'stone': 'STN', 'sand': 'SND',
    'berry': 'BRY', 'plum': 'PLM', 'indigo': 'IND', 'cobalt': 'CBL',
    'aqua': 'AQU', 'seafoam': 'SFM', 'mauve': 'MVE', 'taupe': 'TPE',
    'camo': 'CMO', 'camouflage': 'CMO', 'neon': 'NEO', 'hot pink': 'HPK',
    'light pink': 'LPK', 'dark navy': 'DNV', 'ash': 'ASH', 'oatmeal': 'OTM',
    'natural': 'NAT', 'bone': 'BNE', 'glacier': 'GLC', 'denim': 'DNM',
    'cardinal': 'CRD', 'kelly green': 'KGR', 'kelly': 'KGR',
    'carolina blue': 'CRB', 'carolina': 'CRB', 'athletic heather': 'ATH',
  };

  // Multi-word colors sorted longest first for greedy matching
  const sortedColorNames = Object.keys(knownColors).sort((a, b) => b.length - a.length);

  const aiSuggestColorsFromImages = () => {
    setAiSuggesting(true);
    
    // Simulate AI processing with a brief delay for UX
    setTimeout(() => {
      const detectedColors: { color: string; code: string; imageIndex: number }[] = [];
      const existingColorNames = colorGroups.map(g => g.color.toLowerCase());
      
      // Scan all image filenames and product name for color keywords
      const sources = [
        ...imageFileNames.map((name, idx) => ({ text: name, imageIdx: idx })),
        { text: productName, imageIdx: 0 },
      ];
      
      for (const source of sources) {
        const textLower = source.text.toLowerCase().replace(/[_\-\.]/g, ' ');
        // Check multi-word colors first, then single-word
        for (const colorName of sortedColorNames) {
          // Use word boundary matching
          const regex = new RegExp(`(?:^|\\s|[_\\-])${colorName.replace(/\s+/g, '[\\s_\\-]+')}(?:\\s|[_\\-\\.]|$)`, 'i');
          if (regex.test(textLower) || textLower.includes(colorName)) {
            if (!existingColorNames.includes(colorName) && !detectedColors.some(d => d.color.toLowerCase() === colorName)) {
              const properCase = colorName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
              detectedColors.push({
                color: properCase,
                code: knownColors[colorName],
                imageIndex: source.imageIdx,
              });
            }
          }
        }
      }

      if (detectedColors.length > 0) {
        let currentMaxId = nextColorId;
        const newGroups = detectedColors.map(dc => {
          const group = {
            id: currentMaxId,
            color: dc.color,
            code: dc.code,
            sizes: [] as string[],
          };
          currentMaxId++;
          return { group, imageIndex: dc.imageIndex };
        });

        setColorGroups(prev => [...prev, ...newGroups.map(ng => ng.group)]);
        setNextColorId(currentMaxId);

        // Auto-assign images to their detected colors
        const newVariantMap = { ...variantImageMap };
        newGroups.forEach(ng => {
          // We'll set the variant image mapping once sizes are added
          // For now store a hint in the color-level mapping
        });

        toast.success(`AI detected ${detectedColors.length} color${detectedColors.length > 1 ? 's' : ''}: ${detectedColors.map(d => d.color).join(', ')}`, {
          duration: 5000,
        });
      } else {
        toast.info('No new colors detected. Try uploading images with color names in the filename (e.g., "product-navy.jpg", "tshirt_heather_gray.png")', {
          duration: 5000,
        });
      }
      
      setAiSuggesting(false);
    }, 800);
  };

  // AI: Auto-suggest standard sizes based on product category
  const aiSuggestSizes = () => {
    if (colorGroups.length === 0) {
      toast.info('Add at least one color first, then AI can suggest sizes');
      return;
    }
    const apparelCategories = ['Apparel', 'T-Shirts', 'Hoodies', 'Polos', 'Jackets'];
    const isApparel = apparelCategories.some(c => 
      category.toLowerCase().includes(c.toLowerCase()) || 
      subcategory.toLowerCase().includes(c.toLowerCase()) ||
      productName.toLowerCase().includes(c.toLowerCase())
    );
    
    const suggestedSizes = isApparel 
      ? ['S', 'M', 'L', 'XL', '2XL']
      : ['One Size'];

    setColorGroups(prev => prev.map(g => ({
      ...g,
      sizes: g.sizes.length > 0 ? g.sizes : sortSizes([...new Set([...g.sizes, ...suggestedSizes])]),
    })));
    
    toast.success(`AI added ${suggestedSizes.join(', ')} sizes to all color groups`);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm">
        <motion.button
          whileHover={{ x: -4 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="flex items-center gap-2 text-slate-700 hover:text-slate-900 font-semibold transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Products
        </motion.button>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onBack}
            className="px-6 py-2.5 border-2 border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all"
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSaveProduct}
            disabled={isSaving}
            className="px-6 py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-all shadow-lg disabled:opacity-60 flex items-center gap-2"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </motion.button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-8 py-4 bg-white border-b border-slate-200">
        <div className="max-w-[1800px] mx-auto grid grid-cols-4 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 border-2 border-blue-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center">
                <Package className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-xs font-semibold text-blue-700">Total Variants</div>
                <div className="text-xl font-black text-blue-900">{allVariants.length}</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 border-2 border-purple-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-purple-500 rounded-xl flex items-center justify-center">
                <Box className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-xs font-semibold text-purple-700">Color Options</div>
                <div className="text-xl font-black text-purple-900">{colorGroups.length}</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 border-2 border-green-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-green-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-base">$</span>
              </div>
              <div>
                <div className="text-xs font-semibold text-green-700">Base Price</div>
                <div className="text-xl font-black text-green-900">${basePrice.toFixed(2)}</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-4 border-2 border-orange-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center">
                <Star className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-xs font-semibold text-orange-700">Starting At</div>
                <div className="text-xl font-black text-orange-900">${allVariants.length > 0 ? Math.min(...allVariants.map(v => v.price)).toFixed(2) : basePrice.toFixed(2)}</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1800px] mx-auto p-6">
          <div className="grid grid-cols-3 gap-5">
            {/* Left Column */}
            <div className="space-y-5">
              {/* Product Gallery */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-5 shadow-lg border border-slate-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-black text-slate-900">Product Gallery</h3>
                  <span className="px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full">Featured</span>
                </div>
                
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                />

                {/* Main Image */}
                <div className="relative bg-slate-100 rounded-2xl overflow-hidden mb-4 aspect-square flex items-center justify-center">
                  {productImages.length > 0 ? (
                    <>
                      <img 
                        src={productImages[selectedImage]} 
                        alt="Product" 
                        className="w-full h-full object-contain p-3"
                      />
                      {/* Image type badge */}
                      {lifestyleImageIndex === selectedImage && (
                        <span className="absolute top-2 left-2 px-2.5 py-1 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center gap-1 shadow-md">
                          <User className="w-3 h-3" /> Lifestyle
                        </span>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Upload className="w-10 h-10" />
                      <span className="text-sm font-medium">No images yet</span>
                    </div>
                  )}
                </div>

                {/* Thumbnails with drag-to-reorder and delete */}
                {productImages.length > 0 && (
                  <div className="flex gap-2 mb-4 flex-wrap">
                    {productImages.map((img, idx) => (
                      <div
                        key={idx}
                        className={`relative group w-20 h-20 rounded-xl overflow-hidden border-3 transition-all cursor-grab active:cursor-grabbing ${
                          selectedImage === idx 
                            ? 'border-cyan-500 shadow-lg scale-105' 
                            : 'border-slate-200 opacity-70 hover:opacity-100'
                        } ${dragOverIndex === idx && draggedIndex !== idx ? 'ring-2 ring-cyan-400 ring-offset-2' : ''} ${draggedIndex === idx ? 'opacity-40 scale-95' : ''}`}
                        draggable
                        onDragStart={() => handleDragStart(idx)}
                        onDragOver={(e) => handleDragOver(e, idx)}
                        onDrop={() => handleDrop(idx)}
                        onDragEnd={handleDragEnd}
                        onClick={() => setSelectedImage(idx)}
                      >
                        <img src={img} alt={`Image ${idx + 1}`} className="w-full h-full object-contain p-1 bg-slate-50" />
                        {/* Lifestyle badge on thumbnail */}
                        {lifestyleImageIndex === idx && (
                          <span className="absolute top-0.5 left-0.5 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center shadow-sm">
                            <User className="w-2.5 h-2.5 text-white" />
                          </span>
                        )}
                        {/* Delete button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteImage(idx);
                          }}
                          className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                        {/* Lifestyle / Drag handle row */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent h-6 flex items-end justify-between px-1 pb-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setLifestyleImageIndex(prev => prev === idx ? null : idx);
                            }}
                            title={lifestyleImageIndex === idx ? 'Remove lifestyle tag' : 'Mark as lifestyle/fit image'}
                            className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${lifestyleImageIndex === idx ? 'bg-emerald-500' : 'bg-white/60 hover:bg-emerald-400'}`}
                          >
                            <User className={`w-2.5 h-2.5 ${lifestyleImageIndex === idx ? 'text-white' : 'text-slate-700'}`} />
                          </button>
                          <GripVertical className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={productImages.length >= 10}
                  className="w-full py-3 border-2 border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 hover:border-cyan-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                  Add Image
                </button>
                <p className="text-xs text-slate-500 text-center mt-2">
                  Drag & drop or click to add up to 10 images ({productImages.length}/10)
                </p>
              </motion.div>

              {/* Documents & Spec Sheets */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-3xl p-5 shadow-lg border border-slate-200"
              >
                <h3 className="text-base font-black text-slate-900 mb-3">Documents & Spec Sheets</h3>
                
                {/* Hidden document file input */}
                <input
                  ref={docInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.png,.jpg,.jpeg"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = e.target.files;
                    if (!files) return;
                    Array.from(files).forEach(file => {
                      const today = new Date();
                      const dateStr = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;
                      setDocuments(prev => [...prev, { id: nextDocId, name: file.name, date: dateStr }]);
                      setNextDocId(prev => prev + 1);
                    });
                    e.target.value = '';
                  }}
                />

                <div className="space-y-2 mb-4">
                  {documents.length === 0 && (
                    <div className="text-center py-6 text-slate-400">
                      <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm font-medium">No documents yet</p>
                    </div>
                  )}
                  {documents.map(doc => (
                    <div key={doc.id} className="group flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-slate-900 truncate">{doc.name}</div>
                        <div className="text-xs text-slate-500">{doc.date}</div>
                      </div>
                      <button
                        onClick={() => setDocuments(prev => prev.filter(d => d.id !== doc.id))}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                        title="Delete document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => docInputRef.current?.click()}
                  className="w-full py-3 border-2 border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 hover:border-cyan-500 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Document
                </button>
                <p className="text-xs text-slate-500 text-center mt-2">
                  Upload spec sheets, certifications, and documents
                </p>
              </motion.div>
            </div>

            {/* Middle Column */}
            <div className="space-y-5">
              {/* General Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-5 shadow-lg border border-slate-200"
              >
                <h3 className="text-base font-black text-slate-900 mb-3">General Information</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2">Product Name</label>
                    <input 
                      type="text" 
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-2">Base SKU</label>
                      <input 
                        type="text" 
                        value={productSku}
                        onChange={(e) => { setProductSku(e.target.value); setBaseSku(e.target.value); }}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-2">Brand</label>
                      <input 
                        type="text" 
                        value={productBrand}
                        onChange={(e) => setProductBrand(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2">Product Link</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={productLink}
                        onChange={(e) => setProductLink(e.target.value)}
                        placeholder="www.example.com"
                        className="w-full px-4 py-2.5 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                      />
                      <ExternalLink className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2">Description</label>
                    <textarea 
                      value={productDescription}
                      onChange={(e) => setProductDescription(e.target.value)}
                      rows={4}
                      style={{ resize: 'vertical', minHeight: '80px', maxHeight: '400px' }}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-colors"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Drag bottom edge to resize</p>
                  </div>
                </div>
              </motion.div>

              {/* Categorization */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-white rounded-3xl p-5 shadow-lg border border-slate-200"
              >
                <h3 className="text-base font-black text-slate-900 mb-3">Categorization</h3>
                
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-2">Category</label>
                      <select 
                        value={category}
                        onChange={(e) => {
                          const newCat = e.target.value;
                          setCategory(newCat);
                          setSubcategory((categorySubcategories[newCat] || [])[0] || '');
                        }}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all appearance-none"
                      >
                        {Object.keys(categorySubcategories).map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-2">Subcategory</label>
                      <select 
                        value={subcategory}
                        onChange={(e) => setSubcategory(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all appearance-none"
                      >
                        {(categorySubcategories[category] || []).map(subcat => (
                          <option key={subcat} value={subcat}>{subcat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2">Status</label>
                    <select value={productStatus} onChange={(e) => setProductStatus(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all appearance-none">
                      <option value="Active">Active</option>
                      <option value="Low Stock">Low Stock</option>
                      <option value="Out of Stock">Out of Stock</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Discontinued">Discontinued</option>
                      <option value="Coming Soon">Coming Soon</option>
                      <option value="Live">Live</option>
                    </select>
                  </div>
                </div>
              </motion.div>

              {/* Catalog Display Settings */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-3xl p-5 shadow-lg border border-slate-200"
              >
                <h3 className="text-base font-black text-slate-900 mb-3">Catalog Display Settings</h3>
                
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-3">Where should this product display?</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-all">
                      <input 
                        type="checkbox" 
                        checked={catalogDisplays.bulkSwag}
                        onChange={(e) => setCatalogDisplays({...catalogDisplays, bulkSwag: e.target.checked})}
                        className="w-5 h-5 rounded border-2 border-slate-300 text-cyan-600 focus:ring-2 focus:ring-cyan-500/20"
                      />
                      <span className="text-sm font-semibold text-slate-900">Bulk Swag Catalog</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-all">
                      <input 
                        type="checkbox" 
                        checked={catalogDisplays.buildABox}
                        onChange={(e) => setCatalogDisplays({...catalogDisplays, buildABox: e.target.checked})}
                        className="w-5 h-5 rounded border-2 border-slate-300 text-cyan-600 focus:ring-2 focus:ring-cyan-500/20"
                      />
                      <span className="text-sm font-semibold text-slate-900">Build a Box Catalog</span>
                    </label>
                  </div>
                </div>
              </motion.div>

              {/* Decoration Methods - hidden for Distributors, toggleable for all */}
              {showDecorationMethods && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="bg-white rounded-3xl p-5 shadow-lg border border-slate-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-black text-slate-900">Decoration Methods</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase">From Settings</span>
                      <button
                        onClick={() => setShowDecorationMethods(false)}
                        className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all"
                        title="Hide section"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  
                  {isDistributorProduct && (
                    <div className="mb-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl">
                      <p className="text-[11px] text-amber-700 font-medium">Distributor product — decoration typically not applicable for blanks.</p>
                    </div>
                  )}
                  
                  <div className="relative mb-3">
                    <button
                      onClick={() => { setDecorationDropdownOpen(!decorationDropdownOpen); setImprintDropdownOpen(false); }}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-left text-sm font-medium text-slate-500 hover:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all flex items-center justify-between"
                    >
                      <span>Select decoration method...</span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${decorationDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {decorationDropdownOpen && (
                      <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                        {decorationMethodsList.filter(m => !decorationMethods.includes(m)).map(method => (
                          <button
                            key={method}
                            onClick={() => { toggleDecorationMethod(method); setDecorationDropdownOpen(false); }}
                            className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-cyan-50 hover:text-cyan-700 transition-all first:rounded-t-xl last:rounded-b-xl"
                          >
                            {method}
                          </button>
                        ))}
                        {decorationMethodsList.filter(m => !decorationMethods.includes(m)).length === 0 && (
                          <div className="px-4 py-3 text-xs text-slate-400 text-center">All methods selected</div>
                        )}
                      </div>
                    )}
                  </div>

                  {decorationMethods.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {decorationMethods.map(method => (
                        <span 
                          key={method}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 text-white text-xs font-semibold rounded-lg"
                        >
                          {method}
                          <button 
                            onClick={() => toggleDecorationMethod(method)}
                            className="hover:bg-white/20 rounded-full p-0.5 transition-all"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-2">No methods selected</p>
                  )}
                  {/* Decoration Vendor Selector - shows when embroidery or similar method selected */}
                  {needsDecorationVendor && (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                      <label className="block text-xs font-bold text-amber-800 uppercase mb-2">
                        Decoration Vendor {decorationMethods.filter(m => ['Embroidery', 'Screen Print', 'Heat Transfer', 'DTF', 'Sublimation'].includes(m)).join(', ')}
                      </label>
                      <p className="text-[11px] text-amber-600 mb-2">
                        Select which vendor to base decoration pricing from
                      </p>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowDecoVendorDropdown(!showDecoVendorDropdown)}
                          className="w-full px-4 py-2.5 bg-white border-2 border-amber-300 rounded-xl text-left flex items-center justify-between hover:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all font-medium text-slate-900"
                        >
                          <span className={selectedDecorationVendor ? 'text-slate-900' : 'text-slate-400'}>
                            {selectedDecorationVendor || 'Select decoration vendor...'}
                          </span>
                          <ChevronDown className={`w-4 h-4 text-amber-500 transition-transform ${showDecoVendorDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        {showDecoVendorDropdown && (
                          <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                            {decorationVendors.length > 0 ? decorationVendors.map(v => (
                              <button
                                key={v.id}
                                onClick={() => { setSelectedDecorationVendor(v.name); setShowDecoVendorDropdown(false); }}
                                className={`w-full px-4 py-2.5 text-left text-sm font-medium flex items-center justify-between hover:bg-amber-50 transition-all first:rounded-t-xl last:rounded-b-xl ${selectedDecorationVendor === v.name ? 'text-amber-700 bg-amber-50' : 'text-slate-700'}`}
                              >
                                <div>
                                  <span className="block">{v.name}</span>
                                  <span className="text-[10px] text-slate-400">{v.type}</span>
                                </div>
                                {selectedDecorationVendor === v.name && (
                                  <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                )}
                              </button>
                            )) : (
                              <div className="px-4 py-3 text-xs text-slate-400 text-center">
                                No decorator vendors found. Add a vendor with type "Decorator" in the Vendor module.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      {selectedDecorationVendor && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white text-xs font-semibold rounded-lg">
                            {selectedDecorationVendor}
                            <button onClick={() => setSelectedDecorationVendor('')} className="hover:bg-white/20 rounded-full p-0.5 transition-all"><X className="w-3 h-3" /></button>
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Hidden sections restore buttons */}
              {(!showDecorationMethods || !showImprintLocations) ? (
                <div className="flex flex-wrap gap-2">
                  {!showDecorationMethods && (
                    <button
                      onClick={() => setShowDecorationMethods(true)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-white border border-dashed border-slate-300 rounded-xl text-xs font-semibold text-slate-500 hover:border-cyan-400 hover:text-cyan-600 transition-all"
                    >
                      <Plus className="w-3 h-3" /> Show Decoration Methods
                    </button>
                  )}
                  {!showImprintLocations && (
                    <button
                      onClick={() => setShowImprintLocations(true)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-white border border-dashed border-slate-300 rounded-xl text-xs font-semibold text-slate-500 hover:border-cyan-400 hover:text-cyan-600 transition-all"
                    >
                      <Plus className="w-3 h-3" /> Show Imprint Locations
                    </button>
                  )}
                </div>
              ) : null}
            </div>

            {/* Right Column */}
            <div className="space-y-5">
              {/* Production */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-5 shadow-lg border border-slate-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-black text-slate-900">Production</h3>
                  {(vendorType === 'Product Distributor' || vendorType === 'Apparel Distributor') && (
                    <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-full uppercase flex items-center gap-1">
                      <Truck className="w-3 h-3" />
                      Dropship
                    </span>
                  )}
                </div>
                
                <div className="space-y-3">
                  <div className="relative">
                    <label className="block text-xs font-bold text-slate-600 mb-2">Vendor Type</label>
                    <button
                      type="button"
                      onClick={() => { setVendorTypeOpen(!vendorTypeOpen); setShipmentTimeOpen(false); setOriginOpen(false); setStorageSizeOpen(false); }}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium text-left flex items-center justify-between hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                    >
                      <span>{vendorType || 'Select type'}</span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${vendorTypeOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {vendorTypeOpen && (
                      <div className="absolute z-30 mt-1 w-full bg-white rounded-xl border border-slate-200 shadow-xl py-1 max-h-60 overflow-y-auto">
                        {['Product Distributor', 'Apparel Distributor', 'Decorator', 'Promo Supplier', 'Product Manufacturer'].map(opt => (
                          <button
                            key={opt}
                            onClick={() => {
                              setVendorType(opt);
                              setVendorTypeOpen(false);
                              if (opt === 'Product Distributor' || opt === 'Apparel Distributor') {
                                setShowDecorationMethods(false);
                                setShowImprintLocations(false);
                              } else {
                                setShowDecorationMethods(true);
                                setShowImprintLocations(true);
                              }
                            }}
                            className={`w-full px-4 py-2.5 text-left text-sm font-medium flex items-center justify-between hover:bg-slate-50 transition-colors ${vendorType === opt ? 'text-cyan-600 bg-cyan-50/50' : 'text-slate-700'}`}
                          >
                            <span>{opt}</span>
                            {vendorType === opt && (
                              <svg className="w-4 h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2">
                      {(vendorType === 'Product Distributor' || vendorType === 'Apparel Distributor') ? 'Drop Shipment Time' : 'Production Time Range'}
                    </label>
                    {(vendorType === 'Product Distributor' || vendorType === 'Apparel Distributor') ? (
                      <>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => { setShipmentTimeOpen(!shipmentTimeOpen); setVendorTypeOpen(false); setOriginOpen(false); setStorageSizeOpen(false); }}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium text-left flex items-center justify-between hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                          >
                            <span>{productionTimeRange[0]} {productionTimeRange[0] === 1 ? 'Day' : 'Days'}</span>
                            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${shipmentTimeOpen ? 'rotate-180' : ''}`} />
                          </button>
                          {shipmentTimeOpen && (
                            <div className="absolute z-30 mt-1 w-full bg-white rounded-xl border border-slate-200 shadow-xl py-1 max-h-60 overflow-y-auto">
                              {[1, 2, 3, 5, 7, 10, 14, 21, 30].map(d => (
                                <button
                                  key={d}
                                  onClick={() => { setProductionTimeRange([d, d]); setShipmentTimeOpen(false); }}
                                  className={`w-full px-4 py-2.5 text-left text-sm font-medium flex items-center justify-between hover:bg-slate-50 transition-colors ${productionTimeRange[0] === d ? 'text-cyan-600 bg-cyan-50/50' : 'text-slate-700'}`}
                                >
                                  <span>{d} {d === 1 ? 'Day' : 'Days'}</span>
                                  {productionTimeRange[0] === d && (
                                    <svg className="w-4 h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="mt-2 px-3 py-2 bg-indigo-50 rounded-lg border border-indigo-100">
                          <span className="text-xs font-semibold text-indigo-600 flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5" />
                            Ships within <span className="text-indigo-900 font-bold">{productionTimeRange[0]} {productionTimeRange[0] === 1 ? 'Day' : 'Days'}</span>
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Min Days</label>
                            <select 
                              value={productionTimeRange[0]}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setProductionTimeRange(prev => [val, Math.max(val, prev[1])]);
                              }}
                              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all appearance-none"
                            >
                              {productionDayOptions.map(d => (
                                <option key={d} value={d}>{d} Days</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">Max Days</label>
                            <select 
                              value={productionTimeRange[1]}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setProductionTimeRange(prev => [Math.min(prev[0], val), val]);
                              }}
                              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all appearance-none"
                            >
                              {productionDayOptions.filter(d => d >= productionTimeRange[0]).map(d => (
                                <option key={d} value={d}>{d} Days</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="mt-2 px-3 py-2 bg-slate-50 rounded-lg">
                          <span className="text-xs font-semibold text-slate-600">
                            Estimated: <span className="text-slate-900">{productionTimeRange[0]}–{productionTimeRange[1]} Days</span>
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* 24 Hour Rush - only for non-distributor types */}
                  {vendorType !== 'Product Distributor' && vendorType !== 'Apparel Distributor' && (
                    <div>
                      <label 
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                          qualifiesForRush 
                            ? 'bg-amber-50 border-2 border-amber-300' 
                            : 'bg-slate-50 border-2 border-transparent hover:bg-slate-100'
                        }`}
                        onClick={() => setQualifiesForRush(!qualifiesForRush)}
                      >
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          qualifiesForRush ? 'bg-amber-500' : 'bg-slate-200'
                        }`}>
                          <Zap className={`w-4 h-4 ${qualifiesForRush ? 'text-white' : 'text-slate-500'}`} />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-bold text-slate-900">24 Hour Rush</div>
                          <div className="text-xs text-slate-500">Product qualifies for rush production</div>
                        </div>
                        <div className={`w-10 h-6 rounded-full transition-all relative ${
                          qualifiesForRush ? 'bg-amber-500' : 'bg-slate-300'
                        }`}>
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
                            qualifiesForRush ? 'left-5' : 'left-1'
                          }`} />
                        </div>
                      </label>
                    </div>
                  )}

                  <div className="relative">
                    <label className="block text-xs font-bold text-slate-600 mb-2">Origin</label>
                    <button
                      type="button"
                      onClick={() => { setOriginOpen(!originOpen); setVendorTypeOpen(false); setShipmentTimeOpen(false); setStorageSizeOpen(false); }}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium text-left flex items-center justify-between hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                    >
                      <span>{origin || 'Select origin'}</span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${originOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {originOpen && (
                      <div className="absolute z-30 mt-1 w-full bg-white rounded-xl border border-slate-200 shadow-xl py-1 max-h-60 overflow-y-auto">
                        {['United States', 'China', 'India', 'Vietnam', 'Mexico', 'Bangladesh', 'Taiwan', 'South Korea', 'Japan', 'Thailand', 'Indonesia', 'Turkey', 'Pakistan', 'Cambodia'].map(opt => (
                          <button
                            key={opt}
                            onClick={() => { setOrigin(opt); setOriginOpen(false); }}
                            className={`w-full px-4 py-2.5 text-left text-sm font-medium flex items-center justify-between hover:bg-slate-50 transition-colors ${origin === opt ? 'text-cyan-600 bg-cyan-50/50' : 'text-slate-700'}`}
                          >
                            <span>{opt}</span>
                            {origin === opt && (
                              <svg className="w-4 h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Packaging Specs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-white rounded-3xl p-5 shadow-lg border border-slate-200"
              >
                <h3 className="text-base font-black text-slate-900 mb-3">Packaging Specs</h3>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-slate-600">Dimensions</label>
                      <div className="flex bg-slate-100 rounded-lg p-0.5">
                        {(['in', 'cm'] as const).map(unit => (
                          <button
                            key={unit}
                            onClick={() => setDimensionUnit(unit)}
                            className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${
                              dimensionUnit === unit
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                          >
                            {unit}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {(['l', 'w', 'h'] as const).map((key, i) => (
                        <div key={key} className="relative">
                          <input 
                            type="number" 
                            placeholder={i === 0 ? '25' : '10'}
                            value={dims[key] || ''}
                            onChange={(e) => setDims((prev: any) => ({ ...prev, [key]: e.target.value }))}
                            className="w-full px-3 py-2.5 pr-12 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-semibold">{key.toUpperCase()} ({dimensionUnit})</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-slate-600">Case Weight</label>
                      <div className="flex bg-slate-100 rounded-lg p-0.5">
                        {(['lb', 'kg', 'oz', 'g'] as const).map(unit => (
                          <button
                            key={unit}
                            onClick={() => setWeightUnit(unit)}
                            className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${
                              weightUnit === unit
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                          >
                            {unit}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="relative">
                      <input 
                        type="number" 
                        placeholder="30"
                        value={caseWeight}
                        onChange={(e) => setCaseWeight(e.target.value)}
                        className="w-full px-4 py-2.5 pr-12 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500 font-semibold">{weightUnit}</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-slate-600">Product Weight</label>
                      <div className="flex bg-slate-100 rounded-lg p-0.5">
                        {(['lb', 'kg', 'oz', 'g'] as const).map(unit => (
                          <button
                            key={unit}
                            onClick={() => setProductWeightUnit(unit)}
                            className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${
                              productWeightUnit === unit
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                          >
                            {unit}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="relative">
                      <input 
                        type="number" 
                        placeholder="0"
                        value={productWeight}
                        onChange={(e) => setProductWeight(e.target.value)}
                        className="w-full px-4 py-2.5 pr-12 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500 font-semibold">{productWeightUnit}</span>
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-xs font-bold text-slate-600 mb-2">Storage Size</label>
                    <button
                      type="button"
                      onClick={() => { setStorageSizeOpen(!storageSizeOpen); setVendorTypeOpen(false); setShipmentTimeOpen(false); setOriginOpen(false); }}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium text-left flex items-center justify-between hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                    >
                      <span>{storageSize}</span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${storageSizeOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {storageSizeOpen && (
                      <div className="absolute z-30 mt-1 w-full bg-white rounded-xl border border-slate-200 shadow-xl py-1">
                        {['Small', 'Medium', 'Large', 'X-Large'].map(opt => (
                          <button
                            key={opt}
                            onClick={() => { setStorageSize(opt); setStorageSizeOpen(false); }}
                            className={`w-full px-4 py-2.5 text-left text-sm font-medium flex items-center justify-between hover:bg-slate-50 transition-colors ${storageSize === opt ? 'text-cyan-600 bg-cyan-50/50' : 'text-slate-700'}`}
                          >
                            <span>{opt}</span>
                            {storageSize === opt && (
                              <svg className="w-4 h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Imprint Locations - moved to right column, toggleable */}
              {showImprintLocations && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-3xl p-5 shadow-lg border border-slate-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-black text-slate-900">Imprint Locations</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase">From Settings</span>
                      <button
                        onClick={() => setShowImprintLocations(false)}
                        className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all"
                        title="Hide section"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  
                  {isDistributorProduct && (
                    <div className="mb-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl">
                      <p className="text-[11px] text-amber-700 font-medium">Distributor product — imprint locations may not apply for blanks.</p>
                    </div>
                  )}
                  
                  <div className="relative mb-3">
                    <button
                      onClick={() => { setImprintDropdownOpen(!imprintDropdownOpen); setDecorationDropdownOpen(false); }}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-left text-sm font-medium text-slate-500 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all flex items-center justify-between"
                    >
                      <span>Select imprint location...</span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${imprintDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {imprintDropdownOpen && (
                      <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                        {imprintLocationsList.filter(l => !imprintLocations.includes(l)).map(location => (
                          <button
                            key={location}
                            onClick={() => { toggleImprintLocation(location); setImprintDropdownOpen(false); }}
                            className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all first:rounded-t-xl last:rounded-b-xl"
                          >
                            {location}
                          </button>
                        ))}
                        {imprintLocationsList.filter(l => !imprintLocations.includes(l)).length === 0 && (
                          <div className="px-4 py-3 text-xs text-slate-400 text-center">All locations selected</div>
                        )}
                      </div>
                    )}
                  </div>

                  {imprintLocations.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {imprintLocations.map(location => (
                        <span 
                          key={location}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg"
                        >
                          {location}
                          <button 
                            onClick={() => toggleImprintLocation(location)}
                            className="hover:bg-white/20 rounded-full p-0.5 transition-all"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-2">No locations selected</p>
                  )}
                </motion.div>
              )}

            </div>
          </div>

          {/* Product Options & Variants - Full Width */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-5 bg-white rounded-3xl p-5 shadow-lg border border-slate-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-black text-slate-900">Product Options & Variants</h3>
                <p className="text-xs text-slate-500 mt-0.5">{allVariants.length} SKUs across {colorGroups.length} colors</p>
              </div>
              <div className="flex items-center gap-3">
                {/* AI Buttons */}
                <button
                  onClick={aiSuggestColorsFromImages}
                  disabled={aiSuggesting || productImages.length === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs font-bold rounded-lg hover:from-violet-600 hover:to-purple-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {aiSuggesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  AI Detect Colors
                </button>
                <button
                  onClick={aiSuggestSizes}
                  disabled={colorGroups.length === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Add Sizes
                </button>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-600">Base SKU</label>
                  <input
                    type="text"
                    value={baseSku}
                    onChange={(e) => setBaseSku(e.target.value)}
                    className="w-36 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-600">Base Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500 font-semibold">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={basePrice}
                      onChange={(e) => setBasePrice(parseFloat(e.target.value) || 0)}
                      className="w-24 pl-7 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              {/* Left: Color & Size Builder */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-slate-700">Colors & Sizes</h4>
                  <span className="text-[10px] text-slate-400 font-medium">Click a color to manage sizes</span>
                </div>

                {/* Add Color */}
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newColorInput}
                    onChange={(e) => setNewColorInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addColor()}
                    placeholder="Add a color (e.g., Navy, Forest Green)"
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                  />
                  <button
                    onClick={addColor}
                    className="px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </button>
                </div>

                {/* Color List */}
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                  {colorGroups.map(group => (
                    <div
                      key={group.id}
                      className={`border rounded-2xl transition-all ${
                        expandedColorId === group.id
                          ? 'border-cyan-300 bg-cyan-50/30 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      {/* Color Header */}
                      <div
                        className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                        onClick={() => setExpandedColorId(expandedColorId === group.id ? null : group.id)}
                      >
                        <div className="w-6 h-6 rounded-full border-2 border-slate-300 shadow-inner" style={{
                          backgroundColor: group.color.toLowerCase() === 'white' ? '#f8fafc' : group.color.toLowerCase(),
                        }} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900">{group.color}</span>
                            <span className="text-[10px] font-mono font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{group.code}</span>
                          </div>
                          <div className="text-[11px] text-slate-500">{group.sizes.length} size{group.sizes.length !== 1 ? 's' : ''}</div>
                        </div>
                        {group.sizes.length > 0 && (
                          <div className="flex gap-1 flex-wrap max-w-[180px]">
                            {group.sizes.slice(0, 5).map(s => (
                              <span key={s} className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{s}</span>
                            ))}
                            {group.sizes.length > 5 && (
                              <span className="text-[10px] font-semibold text-slate-400">+{group.sizes.length - 5}</span>
                            )}
                          </div>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); removeColor(group.id); }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${expandedColorId === group.id ? 'rotate-180' : ''}`} />
                      </div>

                      {/* Expanded Size Picker */}
                      {expandedColorId === group.id && (
                        <div className="px-4 pb-3 border-t border-slate-100">
                          <div className="flex items-center justify-between mt-3 mb-2">
                            <span className="text-[11px] font-bold text-slate-500 uppercase">Quick Add Sizes</span>
                            <button
                              onClick={() => addAllSizes(group.id)}
                              className="text-[11px] font-semibold text-cyan-600 hover:text-cyan-700 transition-colors"
                            >
                              Select All Standard
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {standardSizes.map(size => (
                              <button
                                key={size}
                                onClick={() => toggleSize(group.id, size)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                  group.sizes.includes(size)
                                    ? 'bg-cyan-600 text-white shadow-sm'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                {size}
                              </button>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={customSizeInputs[group.id] || ''}
                              onChange={(e) => setCustomSizeInputs(prev => ({ ...prev, [group.id]: e.target.value }))}
                              onKeyDown={(e) => e.key === 'Enter' && addCustomSize(group.id)}
                              placeholder="Custom size (e.g., OS, 6XL)"
                              className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                            />
                            <button
                              onClick={() => addCustomSize(group.id)}
                              className="px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-all"
                            >
                              Add
                            </button>
                          </div>
                          {/* Show non-standard selected sizes */}
                          {group.sizes.filter(s => !standardSizes.includes(s)).length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {group.sizes.filter(s => !standardSizes.includes(s)).map(size => (
                                <span key={size} className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg">
                                  {size}
                                  <button onClick={() => toggleSize(group.id, size)} className="hover:text-red-500 transition-colors">
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  {colorGroups.length === 0 && (
                    <div className="text-center py-8 text-slate-400">
                      <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm font-medium">No colors added yet</p>
                      <p className="text-xs mt-1">Add a color above to start building variants</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Generated SKU Table */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-slate-700">Generated SKU Variants ({allVariants.length})</h4>
                  {(Object.keys(sizePriceOverrides).length > 0 || Object.keys(skuPriceOverrides).length > 0) && (
                    <button
                      onClick={resetAllPrices}
                      className="text-[11px] font-semibold text-amber-600 hover:text-amber-700 transition-colors"
                    >
                      Reset All to Base Price
                    </button>
                  )}
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  {/* Table Header */}
                  <div className="bg-slate-50 px-3 py-2.5 flex items-center gap-2 border-b border-slate-200">
                    <div className="w-10 text-[10px] font-bold text-slate-500 uppercase shrink-0">Image</div>
                    <div className="flex-[4] text-[10px] font-bold text-slate-500 uppercase">SKU</div>
                    <div className="flex-[2.5] text-[10px] font-bold text-slate-500 uppercase">Color / Size</div>
                    <div className="flex-[2] text-[10px] font-bold text-slate-500 uppercase text-right">Price</div>
                    <div className="w-7 shrink-0"></div>
                  </div>

                  {/* Table Body */}
                  <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-50">
                    {allVariants.length === 0 && (
                      <div className="px-4 py-8 text-center text-slate-400">
                        <p className="text-sm font-medium">No variants yet</p>
                        <p className="text-xs mt-1">Add colors and sizes to auto-generate SKUs</p>
                      </div>
                    )}
                    {allVariants.map(variant => {
                      const isOverridden = sizePriceOverrides[variant.size] !== undefined || skuPriceOverrides[variant.sku] !== undefined;
                      const isSizeOverridden = sizePriceOverrides[variant.size] !== undefined;
                      return (
                        <div key={variant.sku} className="px-3 py-1.5 flex items-center gap-2 hover:bg-slate-50/50 transition-all group relative">
                          {/* Image */}
                          <div className="w-10 shrink-0">
                            <div 
                              className="w-9 h-9 rounded-lg overflow-hidden border border-slate-200 cursor-pointer hover:border-cyan-400 transition-all relative"
                              onClick={() => setImagePickerSku(imagePickerSku === variant.sku ? null : variant.sku)}
                            >
                              <img 
                                src={productImages[variant.imageIndex] || productImages[0]} 
                                alt="" 
                                className="w-full h-full object-contain bg-slate-50"
                              />
                            </div>
                            {/* Image Picker Dropdown */}
                            {imagePickerSku === variant.sku && (
                              <>
                              <div className="fixed inset-0 z-40" onClick={() => setImagePickerSku(null)} />
                              <div className="absolute left-2 top-full mt-1 z-50 bg-white border border-slate-200 rounded-xl shadow-xl p-2 min-w-[200px]">
                                <div className="text-[10px] font-bold text-slate-500 uppercase mb-1.5 px-1">Select Image</div>
                                <div className="grid grid-cols-4 gap-1.5 mb-2">
                                  {productImages.map((img, idx) => (
                                    <button
                                      key={idx}
                                      onClick={() => assignImageToSku(variant.sku, idx)}
                                      className={`w-10 h-10 rounded-lg overflow-hidden border-2 transition-all ${
                                        variant.imageIndex === idx ? 'border-cyan-500 ring-2 ring-cyan-200' : 'border-slate-200 hover:border-slate-300'
                                      }`}
                                    >
                                      <img src={img} alt="" className="w-full h-full object-contain bg-slate-50" />
                                    </button>
                                  ))}
                                </div>
                                <button
                                  onClick={() => assignImageToColor(variant.colorCode, variantImageMap[variant.sku] ?? 0)}
                                  className="w-full text-[10px] font-semibold text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50 py-1.5 rounded-lg transition-colors text-center"
                                  title={`Apply to all ${variant.color} variants`}
                                >
                                  Apply to all {variant.color} SKUs
                                </button>
                              </div>
                              </>
                            )}
                          </div>
                          {/* SKU */}
                          <div className="flex-[4] min-w-0">
                            <span className="text-xs font-mono font-semibold text-slate-900 truncate block">{variant.sku}</span>
                          </div>
                          {/* Color / Size */}
                          <div className="flex-[2.5]">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-medium text-slate-600">{variant.color}</span>
                              <span className="text-slate-300">·</span>
                              <span className="text-xs font-semibold text-slate-800">{variant.size}</span>
                            </div>
                          </div>
                          {/* Price */}
                          <div className="flex-[2] flex justify-end items-center gap-1">
                            {editingPrice === variant.sku ? (
                              <div className="flex items-center gap-1.5">
                                <div className="relative">
                                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-slate-500">$</span>
                                  <input
                                    type="number"
                                    step="0.01"
                                    defaultValue={variant.price.toFixed(2)}
                                    autoFocus
                                    onBlur={(e) => {
                                      const val = parseFloat(e.target.value);
                                      if (!isNaN(val)) {
                                        updateVariantPrice(variant.sku, variant.size, val);
                                      }
                                      setEditingPrice(null);
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                                      if (e.key === 'Escape') setEditingPrice(null);
                                    }}
                                    className="w-20 pl-5 pr-2 py-1 bg-white border border-cyan-400 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                                  />
                                </div>
                                <span className="text-[9px] text-slate-400 whitespace-nowrap">all {variant.size}</span>
                              </div>
                            ) : (
                              <button
                                onClick={() => setEditingPrice(variant.sku)}
                                className={`text-xs font-bold px-2 py-1 rounded-lg transition-all ${
                                  isOverridden
                                    ? 'text-amber-700 bg-amber-50 hover:bg-amber-100'
                                    : 'text-slate-900 hover:bg-slate-100'
                                }`}
                                title={`Click to edit price for all ${variant.size} variants`}
                              >
                                ${variant.price.toFixed(2)}
                                {isSizeOverridden && <span className="ml-1 text-[9px] text-amber-500">✎ {variant.size}</span>}
                              </button>
                            )}
                          </div>
                          {/* Delete */}
                          <div className="w-7 shrink-0 flex justify-end">
                            <button
                              onClick={() => toggleSize(variant.colorId, variant.size)}
                              className="w-6 h-6 rounded-md flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* PCNA Tiered Pricing Display - Full Width */}
          {product.tieredPricing && product.tieredPricing.length > 0 && (() => {
            // Detect if this is apparel pricing (has string keys like 'XS', 'S', etc.)
            const firstTier = product.tieredPricing[0];
            const priceKeys = firstTier?.prices ? Object.keys(firstTier.prices) : [];
            const isApparelPricing = priceKeys.length > 0 && isNaN(Number(priceKeys[0]));
            const columns = isApparelPricing ? sortSizes(priceKeys) : [250, 500, 750, 1125, 1500];
            
            return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-5 bg-white rounded-3xl p-5 shadow-lg border border-slate-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow">
                    <span className="text-white font-bold text-lg">$</span>
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      {isApparelPricing ? 'Apparel Size-Based Pricing' : 'PCNA Tiered Pricing'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {isApparelPricing ? 'Size-based pricing' : 'Quantity-based pricing with decoration methods'}
                    </p>
                  </div>
                </div>
                
                {!isEditingTieredPricing ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startEditingTieredPricing}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-50 text-cyan-700 text-xs font-bold rounded-lg hover:bg-cyan-100 transition-all border border-cyan-200"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Pricing
                  </motion.button>
                ) : (
                  <div className="flex items-center gap-2">
                    {!isApparelPricing && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={addQuantityColumn}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg hover:bg-blue-100 transition-all border border-blue-200"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Qty Column
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={addTieredPricingRow}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg hover:bg-emerald-100 transition-all border border-emerald-200"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Row
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={cancelEditingTieredPricing}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-200 transition-all border border-slate-300"
                    >
                      <X className="w-3.5 h-3.5" />
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={saveTieredPricing}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 text-white text-xs font-bold rounded-lg hover:bg-cyan-700 transition-all"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Save
                    </motion.button>
                  </div>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="px-3 py-2 text-left text-xs font-bold text-slate-700 border border-slate-300">
                        {isApparelPricing ? 'Attribute' : 'Decoration Method'}
                      </th>
                      {(isEditingTieredPricing ? editedQuantities : columns).map((col) => (
                        <th key={col} className="px-3 py-2 text-center text-xs font-bold text-slate-700 border border-slate-300 relative group">
                          {typeof col === 'number' ? col.toLocaleString() : col}
                          {isEditingTieredPricing && !isApparelPricing && editedQuantities.length > 1 && (
                            <button
                              onClick={() => removeQuantityColumn(col as number)}
                              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                              title="Remove column"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </th>
                      ))}
                      {isEditingTieredPricing && (
                        <th className="px-3 py-2 text-center text-xs font-bold text-slate-700 border border-slate-300">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const sizeOrder = ['XXS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL'];
                      const tiersToDisplay = isEditingTieredPricing ? editedTieredPricing : product.tieredPricing;
                      
                      // For apparel pricing, show a single "Price" row with prices for each size
                      if (isApparelPricing) {
                        // Create a map of size -> price from the tiered pricing data
                        const sizePriceMap: any = {};
                        tiersToDisplay.forEach((tier: any) => {
                          const size = tier.imprintMethod || tier.decorationMethod || '';
                          if (size && tier.prices) {
                            // Get the first price value for this size (there should only be one for apparel)
                            const priceValue = Object.values(tier.prices)[0];
                            sizePriceMap[size] = priceValue;
                          }
                        });
                        
                        return (
                          <tr className="hover:bg-slate-50 transition-colors">
                            <td className="px-3 py-2.5 font-semibold text-sm text-slate-900 border border-slate-300">
                              Price
                            </td>
                            {(isEditingTieredPricing ? editedQuantities : columns).map((col) => {
                              const currentPrice = sizePriceMap[col] || basePrice;
                              return (
                                <td key={col} className="px-3 py-2.5 text-center text-sm font-medium text-slate-700 border border-slate-300">
                                  {isEditingTieredPricing ? (
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={currentPrice !== undefined && currentPrice !== '' ? currentPrice : basePrice}
                                      onChange={(e) => {
                                        // Find the tier for this size and update it
                                        const tierIndex = editedTieredPricing.findIndex((t: any) => 
                                          (t.imprintMethod || t.decorationMethod) === col
                                        );
                                        if (tierIndex !== -1) {
                                          updateTieredPrice(tierIndex, col, e.target.value);
                                        }
                                      }}
                                      placeholder={basePrice.toFixed(2)}
                                      className="w-full px-2 py-1 border border-slate-300 rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    />
                                  ) : (
                                    currentPrice ? `$${parseFloat(currentPrice).toFixed(2)}` : '—'
                                  )}
                                </td>
                              );
                            })}
                            {isEditingTieredPricing && (
                              <td className="px-3 py-2.5 text-center border border-slate-300">
                                {/* No delete action for the single Price row */}
                              </td>
                            )}
                          </tr>
                        );
                      }
                      
                      // For non-apparel pricing, show multiple rows for different decoration methods
                      const sortedTiers = tiersToDisplay;
                      
                      return sortedTiers.map((tier: any, index: number) => (
                        <tr key={index} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-3 py-2.5 font-semibold text-sm text-slate-900 border border-slate-300">
                            {isEditingTieredPricing ? (
                              <input
                                type="text"
                                value={tier.imprintMethod || tier.decorationMethod || ''}
                                onChange={(e) => updateTieredPricingMethod(index, e.target.value)}
                                placeholder="Enter decoration method..."
                                className="w-full px-2 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                              />
                            ) : (
                              tier.decorationMethod || tier.imprintMethod || `${tier.decorationType || 'N/A'}`
                            )}
                          </td>
                          {(isEditingTieredPricing ? editedQuantities : columns).map((col) => (
                            <td key={col} className="px-3 py-2.5 text-center text-sm font-medium text-slate-700 border border-slate-300">
                              {isEditingTieredPricing ? (
                                <input
                                  type="number"
                                  step="0.01"
                                  value={tier.prices[col] !== undefined && tier.prices[col] !== '' ? tier.prices[col] : basePrice}
                                  onChange={(e) => updateTieredPrice(index, typeof col === 'number' ? col : col, e.target.value)}
                                  placeholder={basePrice.toFixed(2)}
                                  className="w-full px-2 py-1 border border-slate-300 rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                />
                              ) : (
                                tier.prices[col] ? (
                                  `$${parseFloat(tier.prices[col]).toFixed(2)}`
                                ) : '—'
                              )}
                            </td>
                          ))}
                          {isEditingTieredPricing && (
                            <td className="px-3 py-2.5 text-center border border-slate-300">
                              <button
                                onClick={() => removeTieredPricingRow(index)}
                                className="w-6 h-6 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors flex items-center justify-center mx-auto"
                                title="Delete row"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          )}
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </motion.div>
            );
          })()}

          {/* Pricing Structure - Full Width (hideable) */}
          {showPricingStructure && decorationMethods.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-5 bg-white rounded-2xl border border-slate-200 overflow-hidden"
          >
            {/* Header Controls */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-black text-slate-900">{productName || 'Product Name'}</h3>
                {productSku && (
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-bold rounded border border-slate-200">
                    {productSku}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {decorationMethods.length > 0 ? (
                  decorationMethods
                    .filter((m): m is 'Embroidery' | 'Screen Print' | 'DTG' => 
                      ['Embroidery', 'Screen Print', 'DTG'].includes(m)
                    )
                    .map(method => (
                      <button
                        key={method}
                        onClick={() => setSelectedImprintMethod(method)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all border ${
                          selectedImprintMethod === method
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {method}
                      </button>
                    ))
                ) : (
                  <span className="text-xs text-slate-400 italic">No decoration methods selected</span>
                )}
              </div>
            </div>

            {/* Show prompt if no imprint method selected */}
            {!selectedImprintMethod ? (
              <div className="px-6 py-12 bg-slate-50">
                <div className="max-w-md mx-auto text-center">
                  <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="w-6 h-6 text-slate-500" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">Select an Imprint Method</h4>
                  <p className="text-xs text-slate-600">Choose an imprint method above to view pricing details</p>
                </div>
              </div>
            ) : (
              <>
            {/* Method-Specific Config Bar */}
            <div className={`px-6 py-3 border-b border-slate-200 ${
              selectedImprintMethod === 'Embroidery' ? 'bg-blue-50/50' :
              selectedImprintMethod === 'Screen Print' ? 'bg-amber-50/50' : 'bg-emerald-50/50'
            }`}>
              <div className="flex items-center gap-4">
                {selectedImprintMethod === 'Screen Print' && contractPricingData && (
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Using Contract Pricing</label>
                    <div className="px-3 py-1.5 text-xs font-bold text-green-700 bg-green-50 border border-green-200 rounded-lg flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      {contractPricingData.effectiveDate || '2026'}
                    </div>
                  </div>
                )}
                {selectedImprintMethod === 'DTG' && (
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Flat Rate ($/pc)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={dtgFlatRate}
                      onChange={(e) => setDtgFlatRate(parseFloat(e.target.value) || 0)}
                      className="px-3 py-1.5 text-sm font-semibold text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 w-32"
                      placeholder="0.00"
                    />
                  </div>
                )}
              </div>
            </div>
            
            {/* Screen Print Vendor Selection (Required Before Viewing Pricing) */}
            {selectedImprintMethod === 'Screen Print' && screenPrintVendors.length === 0 && (
              <div className="px-6 py-8 bg-slate-50 border-b border-slate-200">
                <div className="max-w-md mx-auto text-center">
                  <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-3">
                    <User className="w-6 h-6 text-slate-500" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">No Screen Print Vendors Found</h4>
                  <p className="text-xs text-slate-600">Add vendors with screen print decoration types in the Vendor module</p>
                </div>
              </div>
            )}
            {selectedImprintMethod === 'Screen Print' && screenPrintVendors.length > 0 && !selectedScreenPrintVendor && (
              <div className="px-6 py-8 bg-amber-50/30 border-b border-slate-200">
                <div className="max-w-md mx-auto text-center">
                  <div className="mb-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <User className="w-6 h-6 text-amber-600" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">Select Contract Vendor</h4>
                    <p className="text-xs text-slate-600">Choose a vendor to view their contract pricing</p>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setShowScreenPrintVendorDropdown(!showScreenPrintVendorDropdown)}
                      className="w-full px-4 py-3 text-sm font-semibold text-slate-900 bg-white border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 flex items-center gap-2 justify-between hover:border-amber-400 transition-all"
                    >
                      <span className="truncate">Select Vendor...</span>
                      <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    </button>
                    {showScreenPrintVendorDropdown && (
                      <div className="absolute left-0 top-full z-50 mt-2 w-full bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden">
                        {screenPrintVendors.map(vendor => (
                          <button
                            key={vendor.id}
                            onClick={() => {
                              setSelectedScreenPrintVendor(vendor.id);
                              setShowScreenPrintVendorDropdown(false);
                            }}
                            className="w-full text-left px-4 py-3 text-sm transition-colors text-slate-700 hover:bg-amber-50 font-medium border-b border-slate-100 last:border-0"
                          >
                            {vendor.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Selected Vendor Badge (when vendor is chosen) */}
            {selectedImprintMethod === 'Screen Print' && selectedScreenPrintVendor && screenPrintVendors.length > 0 && (
              <div className="px-6 py-3 bg-amber-50/50 border-b border-amber-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-bold text-slate-700">Viewing pricing for:</span>
                  <span className="text-xs font-black text-amber-700">
                    {screenPrintVendors.find(v => v.id === selectedScreenPrintVendor)?.name}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedScreenPrintVendor('')}
                  className="text-xs font-semibold text-amber-600 hover:text-amber-700 underline"
                >
                  Change Vendor
                </button>
              </div>
            )}

            {/* Pricing Table */}
            {selectedImprintMethod && decorationMethods.length > 0 && (selectedImprintMethod === 'Screen Print' && !selectedScreenPrintVendor ? null : (
            <div className="overflow-x-auto">
              {loadingContractPricing ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
                  <span className="ml-2 text-sm text-slate-500">Loading contract pricing...</span>
                </div>
              ) : selectedImprintMethod === 'Screen Print' && contractPricingData && selectedScreenPrintVendor ? (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="text-left px-4 py-2.5 text-[10px] font-bold text-slate-600 uppercase tracking-wide">Colors</th>
                      {(contractPricingData.quantityBrackets || []).map((bracket: string) => (
                        <th key={bracket} className="text-center px-4 py-2.5 text-[10px] font-bold text-slate-600 uppercase tracking-wide">
                          <div className="flex flex-col items-center gap-0.5">
                            <span>{bracket}</span>
                            <span className="text-[9px] font-normal text-slate-400">(Deco Cost)</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(contractPricingData.pricingMatrix || []).map((row: any) => (
                      <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 bg-amber-50 text-amber-900 text-xs font-bold rounded border border-amber-200">
                              {row.label}
                            </span>
                          </div>
                        </td>
                        {(row.prices || []).map((price: string, idx: number) => (
                          <td key={idx} className="px-4 py-2 text-center">
                            <span className="text-sm font-bold text-amber-600">
                              {price ? `$${parseFloat(price).toFixed(2)}` : '—'}
                            </span>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : selectedImprintMethod === 'Embroidery' ? (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left px-4 py-2.5 text-[10px] font-bold text-slate-600 uppercase tracking-wide">Stitch Count</th>
                    {getQuantityTiersForMethod(selectedImprintMethod).map(tier => (
                      <th key={tier} className="text-center px-4 py-2.5 text-[10px] font-bold text-slate-600 uppercase tracking-wide">
                        {tier}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(embroideryRates).sort((a, b) => {
                    // Extract numeric value from stitch count strings
                    const numA = parseInt(a.replace(/[^\d]/g, ''));
                    const numB = parseInt(b.replace(/[^\d]/g, ''));
                    return numA - numB;
                  }).map(stitchCount => {
                    return (
                      <tr key={stitchCount} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-900 text-xs font-bold rounded border border-blue-200">
                              {stitchCount.replace('up to ', '≤')}
                            </span>
                          </div>
                        </td>
                        {getQuantityTiersForMethod(selectedImprintMethod).map(tier => {
                          const rate = embroideryRates[stitchCount]?.[tier];
                          return (
                            <td key={tier} className="px-4 py-2 text-center">
                              <span className="text-sm font-bold text-blue-600">
                                {rate !== undefined ? `$${rate.toFixed(2)}` : '—'}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              ) : selectedImprintMethod === 'Screen Print' && selectedScreenPrintVendor && !contractPricingData ? (
                <div className="py-12 text-center">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-6 h-6 text-amber-600" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700 mb-1">No Contract Pricing Found</p>
                  <p className="text-xs text-slate-500">
                    {screenPrintVendors.find(v => v.id === selectedScreenPrintVendor)?.name} doesn't have contract pricing set up yet
                  </p>
                </div>
              ) : (
                <div className="py-12 text-center text-sm text-slate-500">
                  No pricing data available for {selectedImprintMethod}
                </div>
              )}

              {/* Summary Footer Bar */}
              {selectedImprintMethod === 'Screen Print' && contractPricingData && selectedScreenPrintVendor && (
                <div className="px-6 py-3 bg-slate-50 border-t border-slate-200">
                  <div className="flex items-center gap-6 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-500 uppercase">Avg Blank:</span>
                      <span className="font-bold text-slate-900">${calculateSummaryAverages().avgBlank.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-500 uppercase">Avg Deco:</span>
                      <span className="font-bold text-blue-600">${calculateSummaryAverages().avgDeco.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-500 uppercase">Avg Total Cost:</span>
                      <span className="font-bold text-slate-900">${calculateSummaryAverages().avgTotalCost.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-500 uppercase">Avg Sell Price:</span>
                      <span className="font-bold text-green-600">${calculateSummaryAverages().avgSellPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-500 uppercase">Margin:</span>
                      <span className="font-bold text-slate-900">{calculateSummaryAverages().margin.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            ))}
            </>
            )}
          </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-5"
            >
              <button
                onClick={() => setShowPricingStructure(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-200 transition-all border border-slate-200"
              >
                <Plus className="w-3.5 h-3.5" />
                Show Pricing Structure
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}