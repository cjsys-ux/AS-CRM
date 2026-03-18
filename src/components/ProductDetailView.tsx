import { motion } from 'motion/react';
import { ArrowLeft, Star, Upload, Plus, X, ExternalLink, FileText, Package, Box, Ruler, Weight, Archive, ChevronDown, GripVertical, Trash2, Zap, Truck, User, Sparkles, Loader2 } from 'lucide-react';
import { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner@2.0.3';


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
  const [productionTimeRange, setProductionTimeRange] = useState<[number, number]>(product.productionTimeRange || [3, 15]);
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

  const standardSizes = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];

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

  const productionDayOptions = [3, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];

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
  const [pricingRows, setPricingRows] = useState<{ id: number; qty: string; blankCost: number; decorationCost: number; margin: number }[]>(
    product.pricingRows || []
  );
  const [nextPricingId, setNextPricingId] = useState(
    (product.pricingRows || []).length > 0 ? Math.max(...(product.pricingRows || []).map((r: any) => r.id)) + 1 : 1
  );

  const addPricingRow = () => {
    setPricingRows(prev => [...prev, {
      id: nextPricingId,
      qty: '',
      blankCost: basePrice || 0,
      decorationCost: 0,
      margin: defaultMarginPct,
    }]);
    setNextPricingId(prev => prev + 1);
  };

  const updatePricingRow = (id: number, field: string, value: string | number) => {
    setPricingRows(prev => prev.map(row => row.id === id ? { ...row, [field]: value } : row));
  };

  const removePricingRow = (id: number) => {
    setPricingRows(prev => prev.filter(row => row.id !== id));
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const remaining = 10 - productImages.length;
    const filesToProcess = Array.from(files).slice(0, remaining);
    filesToProcess.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        if (result) {
          setProductImages(prev => [...prev, result]);
          setImageFileNames(prev => [...prev, file.name]);
        }
      };
      reader.readAsDataURL(file);
    });
    // Reset input so same file can be re-selected
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
    setIsSaving(true);
    try {
      const productData = {
        ...product,
        name: productName,
        sku: productSku,
        brand: productBrand,
        productLink,
        description: productDescription,
        status: productStatus,
        productImages,
        imageFileNames,
        lifestyleImageIndex,
        image: productImages[0] || product.image || '',
        decorationMethods,
        imprintLocations,
        showDecorationMethods,
        showImprintLocations,
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
      };

      toast.success('Product saved successfully!');
      if (onSave) onSave();
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

          {/* Pricing Structure - Full Width */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-5 bg-white rounded-3xl p-5 shadow-lg border border-slate-200"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-black text-slate-900">Pricing Structure</h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-600">Default Margin:</span>
                  <span className="text-lg font-black text-slate-900">{defaultMarginPct}%</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={addPricingRow}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg hover:bg-emerald-100 transition-all border border-emerald-200"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Tier
                </motion.button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Quantity</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Blank Cost</th>
                    {showDecorationMethods && (
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Decoration Cost</th>
                    )}
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Total Cost</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Margin %</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Selling Price</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pricingRows.length === 0 ? (
                    <tr>
                      <td colSpan={showDecorationMethods ? 7 : 6} className="px-4 py-8 text-center text-sm text-slate-400">
                        <div className="flex flex-col items-center gap-2">
                          <span>No pricing tiers yet</span>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={addPricingRow}
                            className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-200 transition-all"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Add First Pricing Tier
                          </motion.button>
                        </div>
                      </td>
                    </tr>
                  ) : pricingRows.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50 transition-all group">
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={row.qty}
                          onChange={(e) => updatePricingRow(row.id, 'qty', e.target.value)}
                          placeholder="e.g. 100+"
                          className="w-20 px-2 py-1.5 text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-slate-400">$</span>
                          <input
                            type="number"
                            step="0.01"
                            value={row.blankCost || ''}
                            onChange={(e) => updatePricingRow(row.id, 'blankCost', parseFloat(e.target.value) || 0)}
                            className="w-24 pl-5 pr-2 py-1.5 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                          />
                        </div>
                      </td>
                      {showDecorationMethods && (
                        <td className="px-3 py-2">
                          <div className="relative">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-slate-400">$</span>
                            <input
                              type="number"
                              step="0.01"
                              value={row.decorationCost || ''}
                              onChange={(e) => updatePricingRow(row.id, 'decorationCost', parseFloat(e.target.value) || 0)}
                              className="w-24 pl-5 pr-2 py-1.5 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                            />
                          </div>
                        </td>
                      )}
                      <td className="px-4 py-2 text-sm font-semibold text-slate-900">${calcRowTotalCost(row).toFixed(2)}</td>
                      <td className="px-3 py-2">
                        <div className="relative">
                          <input
                            type="number"
                            step="1"
                            value={row.margin || ''}
                            onChange={(e) => updatePricingRow(row.id, 'margin', parseFloat(e.target.value) || 0)}
                            className="w-16 px-2 py-1.5 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-slate-400">%</span>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-sm font-bold text-green-600">${calcRowSellingPrice(row).toFixed(2)}</td>
                      <td className="px-2 py-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => removePricingRow(row.id)}
                          className="p-1 text-slate-300 hover:text-red-500 rounded transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </motion.button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}