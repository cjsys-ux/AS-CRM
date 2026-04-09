import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingCart, Package, Plus, Link as LinkIcon, MapPin, ChevronDown, Check, Trash2, Calendar, Search, Building2, Loader2, User, Truck, AlertTriangle, SplitSquareVertical } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { DatePicker } from './DatePicker';
import { ModernDropdown } from './ModernDropdown';

type OrderSampleDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  productId?: string;
  productName?: string;
  projectNumber?: string;
  clientName?: string;
  competitorLink?: string;
  onSuccess?: () => void;
};

export function OrderSampleDrawer({ 
  isOpen, 
  onClose, 
  productId,
  productName = 'Scan Sling Padded Harness',
  projectNumber,
  clientName = 'Amazon',
  competitorLink = '',
  onSuccess 
}: OrderSampleDrawerProps) {
  const [sampleType, setSampleType] = useState<'competitor' | 'pre-production'>('competitor');
  const [variants, setVariants] = useState([
    { id: '1', sku: '', size: '', color: '', qty: 1, costPerUnit: 0 }
  ]);
  const [vendor, setVendor] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [isVendorDropdownOpen, setIsVendorDropdownOpen] = useState(false);
  const [vendorSearch, setVendorSearch] = useState('');
  const [availableVendors, setAvailableVendors] = useState<Array<{ id: string; name: string; type: string; logo: string; priority?: string }>>([]);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const vendorDropdownRef = useRef<HTMLDivElement>(null);
  const vendorSearchRef = useRef<HTMLInputElement>(null);

  // Warehouse data from DB
  const [warehouseOptions, setWarehouseOptions] = useState<Array<{
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    manager?: string;
    phone?: string;
  }>>([]);

  const [destinations, setDestinations] = useState<Array<{
    id: string;
    name: string;
    allocations: { [variantId: string]: number };
    location: string;
    warehouseId?: string;
    contactId?: string;
    customAddress?: {
      name: string;
      street: string;
      city: string;
      state: string;
      zip: string;
      type: string;
      contactName: string;
    };
  }>>([
    { id: '1', name: 'Destination #1', allocations: {}, location: '' }
  ]);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [inHandsDate, setInHandsDate] = useState('');
  const [vendorDropShip, setVendorDropShip] = useState<boolean | null>(null);
  const [loadingVendorInfo, setLoadingVendorInfo] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [openShipToDropdown, setOpenShipToDropdown] = useState<string | null>(null);
  const shipToButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const shipToMenuRef = useRef<HTMLDivElement>(null);

  // Contact address search state
  const [contactAddressSearch, setContactAddressSearch] = useState<Record<string, string>>({});
  const [contactAddressResults, setContactAddressResults] = useState<Array<{
    contactId: string;
    contactName: string;
    company: string;
    addressId: string;
    label: string;
    street1: string;
    street2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  }>>([]);
  const [loadingContactAddresses, setLoadingContactAddresses] = useState(false);
  const [activeAddressDropdown, setActiveAddressDropdown] = useState<string | null>(null);
  const addressDropdownRef = useRef<HTMLDivElement>(null);

  const fetchContactAddresses = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setContactAddressResults([]);
      return;
    }
    setLoadingContactAddresses(true);
    try {
      const response = await fetch(`/api/contacts/list`);
      const data = await response.json();
      if (data.success) {
        const results: typeof contactAddressResults = [];
        const query = searchQuery.toLowerCase();
        (data.contacts || []).forEach((contact: any) => {
          const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
          const company = contact.company || '';
          const nameMatch = fullName.toLowerCase().includes(query) || company.toLowerCase().includes(query);
          if (contact.addresses && Array.isArray(contact.addresses)) {
            contact.addresses.forEach((addr: any) => {
              const addrString = `${addr.street1 || ''} ${addr.city || ''} ${addr.state || ''} ${addr.zip || ''} ${addr.label || ''}`.toLowerCase();
              if (nameMatch || addrString.includes(query)) {
                results.push({
                  contactId: contact.id,
                  contactName: fullName,
                  company,
                  addressId: addr.id || '',
                  label: addr.label || 'Address',
                  street1: addr.street1 || '',
                  street2: addr.street2 || '',
                  city: addr.city || '',
                  state: addr.state || '',
                  zip: addr.zip || '',
                  country: addr.country || 'United States',
                });
              }
            });
          }
        });
        setContactAddressResults(results);
      }
    } catch (error) {
      console.error('Error fetching contact addresses:', error);
    } finally {
      setLoadingContactAddresses(false);
    }
  };

  // Debounced contact address search
  useEffect(() => {
    const activeDestId = activeAddressDropdown;
    if (!activeDestId) return;
    const query = contactAddressSearch[activeDestId] || '';
    const timer = setTimeout(() => {
      fetchContactAddresses(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [contactAddressSearch, activeAddressDropdown]);

  // Close address dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (addressDropdownRef.current && !addressDropdownRef.current.contains(event.target as Node)) {
        setActiveAddressDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close ship-to dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openShipToDropdown) {
        const btn = shipToButtonRefs.current[openShipToDropdown];
        if (
          shipToMenuRef.current && !shipToMenuRef.current.contains(event.target as Node) &&
          (!btn || !btn.contains(event.target as Node))
        ) {
          setOpenShipToDropdown(null);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openShipToDropdown]);

  const getShipToLabel = useCallback((dest: typeof destinations[0]) => {
    if (!dest.location) return 'Select a location...';
    if (dest.location === 'Other Location') return 'Other Location (Custom Address)';
    const wh = warehouseOptions.find(w => `warehouse:${w.id}` === dest.location);
    if (wh) return `${wh.name}${wh.city ? ` — ${wh.city}, ${wh.state}` : ''}`;
    return dest.location;
  }, [warehouseOptions]);

  const handleSelectShipTo = useCallback((destId: string, newLocation: string) => {
    const selectedWarehouse = warehouseOptions.find(w => `warehouse:${w.id}` === newLocation);
    setDestinations(prev => prev.map(d =>
      d.id === destId ? {
        ...d,
        location: newLocation,
        warehouseId: selectedWarehouse ? selectedWarehouse.id : undefined,
        contactId: selectedWarehouse ? undefined : d.contactId,
        customAddress: newLocation === 'Other Location' && !d.customAddress ? {
          name: '', street: '', city: '', state: '', zip: '', type: 'Commercial', contactName: ''
        } : (newLocation !== 'Other Location' ? undefined : d.customAddress)
      } : d
    ));
    setOpenShipToDropdown(null);
  }, [warehouseOptions]);

  const handleAddVariant = () => {
    setVariants([
      ...variants,
      { id: Date.now().toString(), sku: '', size: '', color: '', qty: 1, costPerUnit: 0 }
    ]);
  };

  const handleUpdateVariant = (id: string, field: string, value: any) => {
    setVariants(variants.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  const handleRemoveVariant = (id: string) => {
    if (variants.length > 1) {
      setVariants(variants.filter(v => v.id !== id));
    }
  };

  const handleAddDestination = () => {
    // When adding a new destination, auto-allocate variant quantities
    const newDestinationId = Date.now().toString();
    const newAllocations: { [variantId: string]: number } = {};
    
    // If this is the first destination being added (going from 1 to 2), split quantities
    if (destinations.length === 1) {
      // Clear existing allocations and split evenly
      variants.forEach(variant => {
        newAllocations[variant.id] = 0;
      });
      setDestinations([
        { ...destinations[0], allocations: {} },
        { id: newDestinationId, name: `Destination #${destinations.length + 1}`, allocations: newAllocations, location: '' }
      ]);
    } else {
      // Just add empty destination
      variants.forEach(variant => {
        newAllocations[variant.id] = 0;
      });
      setDestinations([
        ...destinations,
        { id: newDestinationId, name: `Destination #${destinations.length + 1}`, allocations: newAllocations, location: '' }
      ]);
    }
  };

  const handleRemoveDestination = (id: string) => {
    if (destinations.length > 1) {
      setDestinations(destinations.filter(d => d.id !== id));
    }
  };

  const handleUpdateDestinationAllocation = (destId: string, variantId: string, quantity: number) => {
    setDestinations(destinations.map(dest => 
      dest.id === destId 
        ? { ...dest, allocations: { ...dest.allocations, [variantId]: quantity } }
        : dest
    ));
  };

  const getVariantTotalAllocated = (variantId: string) => {
    return destinations.reduce((sum, dest) => sum + (dest.allocations[variantId] || 0), 0);
  };

  const getDestinationTotalAllocated = (destId: string) => {
    const dest = destinations.find(d => d.id === destId);
    if (!dest) return 0;
    return Object.values(dest.allocations).reduce((sum: number, qty: number) => sum + qty, 0);
  };

  const totalQuantity = variants.reduce((sum, v) => sum + (typeof v.qty === 'number' ? v.qty : (parseInt(String(v.qty)) || 0)), 0);
  const totalCost = variants.reduce((sum, v) => {
    const qty = typeof v.qty === 'number' ? v.qty : (parseInt(String(v.qty)) || 0);
    const cost = typeof v.costPerUnit === 'number' ? v.costPerUnit : (parseFloat(String(v.costPerUnit)) || 0);
    return sum + (qty * cost);
  }, 0);

  // ─── Validation ───
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  const getValidationErrors = (): string[] => {
    const errors: string[] = [];
    variants.forEach((v, idx) => {
      const label = variants.length > 1 ? ` (Variant ${idx + 1})` : '';
      if (!v.sku || !v.sku.trim()) errors.push(`SKU is required${label}`);
      if (!v.color || !v.color.trim()) errors.push(`Color is required${label}`);
      if (!v.size || !v.size.trim()) errors.push(`Size is required${label}`);
      const qty = typeof v.qty === 'number' ? v.qty : (parseInt(String(v.qty)) || 0);
      if (qty <= 0) errors.push(`Quantity must be greater than 0${label}`);
      const cost = typeof v.costPerUnit === 'number' ? v.costPerUnit : (parseFloat(String(v.costPerUnit)) || 0);
      if (cost <= 0) errors.push(`Price must be greater than 0${label}`);
    });
    if (!vendor || !vendor.trim()) {
      errors.push('A vendor must be selected');
    }
    destinations.forEach((dest, idx) => {
      const hasAddress = !!dest.warehouseId || !!dest.customAddress || !!dest.contactId;
      if (!hasAddress) {
        const label = destinations.length > 1 ? ` (Destination ${idx + 1})` : '';
        errors.push(`Ship-to address is required${label}`);
      }
    });
    return errors;
  };

  const validationErrors = getValidationErrors();
  const isFormValid = validationErrors.length === 0;

  // ─── Helpers for building PO data from destinations ───
  // Find warehouse data by ID from fetched warehouses
  const getWarehouseById = (warehouseId?: string) => {
    if (!warehouseId) return null;
    return warehouseOptions.find(w => w.id === warehouseId) || null;
  };

  const buildContactForDest = (dest: typeof destinations[0]) => {
    // Warehouse from DB
    if (dest.warehouseId) {
      const wh = getWarehouseById(dest.warehouseId);
      if (wh) {
        const fullAddress = [wh.address, wh.city, wh.state, wh.zip].filter(Boolean).join(', ');
        return {
          name: wh.manager || wh.name,
          role: 'Warehouse',
          address: wh.name,
          fullAddress,
          contactId: dest.contactId || undefined,
        };
      }
    }
    // Custom address (from contact search or manual entry)
    if (dest.customAddress) {
      const addrParts = [dest.customAddress.street, dest.customAddress.city, dest.customAddress.state, dest.customAddress.zip].filter(Boolean).join(', ');
      return {
        name: dest.customAddress.contactName || dest.customAddress.name || 'Unknown Contact',
        role: dest.customAddress.type || 'Recipient',
        address: dest.customAddress.name || 'Custom Address',
        fullAddress: addrParts,
        contactId: dest.contactId || undefined,
      };
    }
    return { name: 'Unknown Contact', role: 'Recipient', address: dest.location, fullAddress: '' };
  };

  const buildShipToForDest = (dest: typeof destinations[0]) => {
    // Warehouse from DB
    if (dest.warehouseId) {
      const wh = getWarehouseById(dest.warehouseId);
      if (wh) {
        return {
          name: wh.name,
          address: wh.address,
          city: wh.city,
          state: wh.state,
          zip: wh.zip,
          country: wh.country || 'United States',
          contact: wh.manager || '',
        };
      }
    }
    // Custom address
    if (dest.customAddress) {
      return {
        name: dest.customAddress.name || 'Custom Address',
        address: dest.customAddress.street || '',
        city: dest.customAddress.city || '',
        state: dest.customAddress.state || '',
        zip: dest.customAddress.zip || '',
        country: 'United States',
        contact: dest.customAddress.contactName || dest.customAddress.name || '',
      };
    }
    return { name: dest.location, address: '', city: '', state: '', zip: '', country: 'United States', contact: '' };
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const derivedContacts = destinations.map(buildContactForDest);
      const shipToAddresses = destinations.map(buildShipToForDest);
      const primaryContact = derivedContacts[0]?.name || '';

      const allVariants = variants.map(v => ({
        ...v,
        qty: parseInt(String(v.qty)) || 1,
        costPerUnit: parseFloat(String(v.costPerUnit)) || 0,
      }));

      const allLineItems = variants.map((v, idx) => ({
        id: v.id || String(idx + 1),
        description: productName || '',
        sku: v.sku || '',
        vendor: vendor,
        size: v.size || '',
        color: v.color || '',
        quantity: parseInt(String(v.qty)) || 1,
        unitPrice: parseFloat(String(v.costPerUnit)) || 0,
      }));

      // ─── CASE: Multiple destinations with quantity allocations → split by allocated quantities ───
      if (destinations.length > 1) {
        // Build per-destination POs using allocated quantities
        const destsWithAllocations = destinations.filter(dest => {
          const destTotal = variants.reduce((sum, v) => {
            const defaultAlloc = destinations.length === 1 ? (parseInt(String(v.qty)) || 1) : 0;
            return sum + (dest.allocations[v.id] !== undefined ? dest.allocations[v.id] : defaultAlloc);
          }, 0);
          return destTotal > 0;
        });

        if (destsWithAllocations.length > 1) {
          console.log('Creating split POs based on quantity allocations');
          const results: boolean[] = [];
          const splitGroup = `split-${Date.now()}`;

          for (const dest of destsWithAllocations) {
            const destVariants = allVariants.map((v, idx) => {
              const allocQty = dest.allocations[v.id] !== undefined ? dest.allocations[v.id] : 0;
              return { ...v, qty: allocQty };
            }).filter(v => v.qty > 0);

            const destLines = allLineItems.map((li, idx) => {
              const variant = variants[idx];
              const allocQty = dest.allocations[variant.id] !== undefined ? dest.allocations[variant.id] : 0;
              return { ...li, quantity: allocQty };
            }).filter(li => li.quantity > 0);

            if (destVariants.length === 0) continue;

            const destTotal = destVariants.reduce((sum, v) => sum + (v.qty * v.costPerUnit), 0);
            const destContact = buildContactForDest(dest);
            const destShipTo = buildShipToForDest(dest);
            const destLabel = dest.location === 'Other Location'
              ? (dest.customAddress?.name || dest.name)
              : dest.warehouseId
                ? (getWarehouseById(dest.warehouseId)?.name || dest.name)
                : dest.name;

            const splitPO = {
              poNumber: '',
              poDate: new Date().toISOString().split('T')[0],
              productId: productId || null,
              projectNumber: projectNumber || null,
              project: productName,
              vendor: vendor,
              vendorId: vendorId || null,
              customer: clientName,
              status: 'Created',
              shipDate: null,
              inHandsDate: inHandsDate || new Date().toISOString().split('T')[0],
              total: destTotal,
              priority: '2nd Choice',
              contact: destContact.name,
              contactId: (destContact as any).contactId || dest.contactId || null,
              contacts: [destContact],
              shipToAddresses: [destShipTo],
              sampleType: sampleType,
              variants: destVariants,
              lineItems: destLines,
              destinations: [dest],
              additionalNotes: `${additionalNotes ? additionalNotes + '\n' : ''}[Split shipment → ${destLabel}]`,
              competitorLink: competitorLink,
              isSample: true,
              splitFromGroup: splitGroup,
            };

            const response = await fetch(`/api/purchasing/create`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(splitPO),
            });
            const data = await response.json();
            results.push(data.success);
            if (!data.success) {
              console.error(`Failed to create split PO for ${destLabel}:`, data.error);
            }
          }

          if (results.every(Boolean)) {
            console.log(`Successfully created ${results.length} split POs by quantity allocation`);
            onSuccess?.();
            onClose();
          } else {
            const failed = results.filter(r => !r).length;
            alert(`${results.length - failed} of ${results.length} POs created. ${failed} failed.`);
          }
          return;
        }
        // If only 1 destination has allocations, fall through to single PO creation
      }

      // ─── DEFAULT: Single PO (vendor supports drop ship, or single destination) ───
      const primaryDest = destinations[0];
      const primaryContactId = (derivedContacts[0] as any)?.contactId || primaryDest?.contactId || null;
      const purchaseOrder = {
        poNumber: '',
        poDate: new Date().toISOString().split('T')[0],
        productId: productId || null,
        projectNumber: projectNumber || null,
        project: productName,
        vendor: vendor,
        vendorId: vendorId || null,
        customer: clientName,
        status: 'Created',
        shipDate: null,
        inHandsDate: inHandsDate || new Date().toISOString().split('T')[0],
        total: totalCost,
        priority: '2nd Choice',
        contact: primaryContact,
        contactId: primaryContactId,
        contacts: derivedContacts,
        shipToAddresses: shipToAddresses,
        sampleType: sampleType,
        variants: allVariants,
        lineItems: allLineItems,
        destinations: destinations,
        additionalNotes: additionalNotes,
        competitorLink: competitorLink,
        isSample: true,
      };

      console.log('Creating purchase order from sample order:', purchaseOrder);

      const response = await fetch(`/api/purchasing/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(purchaseOrder),
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('Purchase order created successfully:', data.order);
        onSuccess?.();
        onClose();
      } else {
        console.error('Failed to create purchase order:', data.error);
        alert('Failed to create purchase order. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting sample order:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const fetchVendors = async () => {
    setLoadingVendors(true);
    try {
      // If we have a productId, fetch only the product's vendor network
      if (productId) {
        const response = await fetch(`/api/pipeline/vendors/list?productId=${productId}`);
        const data = await response.json();
        if (data.success && data.vendors && data.vendors.length > 0) {
          setAvailableVendors(
            (data.vendors || []).map((v: any) => ({
              id: v.id || v.vendorId || '',
              name: v.name || '',
              type: v.type || '',
              logo: v.logo || v.image || '',
              priority: v.priority || '',
            }))
          );
          setLoadingVendors(false);
          return;
        }
        // If no product vendors found, show empty state
        console.log('No vendors in product vendor network for product:', productId);
        setAvailableVendors([]);
      } else {
        // No productId — fetch all vendors as fallback
        const response = await fetch(`/api/vendors/list`);
        const data = await response.json();
        if (data.success) {
          setAvailableVendors(
            (data.vendors || []).map((v: any) => ({
              id: v.vendorId || v.id || '',
              name: v.name || '',
              type: v.type || '',
              logo: v.logo || v.image || '',
              priority: '',
            }))
          );
        } else {
          console.error('Failed to fetch vendors for sample drawer:', data.error);
        }
      }
    } catch (error) {
      console.error('Error fetching vendors for sample drawer:', error);
    } finally {
      setLoadingVendors(false);
    }
  };

  // Fetch vendor drop-ship capability when vendor changes
  const fetchVendorDropShipInfo = async (vendorName: string) => {
    if (!vendorName) { setVendorDropShip(null); return; }
    setLoadingVendorInfo(true);
    try {
      const response = await fetch(`/api/vendors/list`);
      const data = await response.json();
      if (data.success) {
        const found = (data.vendors || []).find((v: any) =>
          (v.name || '').toLowerCase().trim() === vendorName.toLowerCase().trim()
        );
        if (found) {
          setVendorDropShip(found.supportsDropShipping !== false);
        } else {
          setVendorDropShip(true); // default to true if vendor not found
        }
      }
    } catch (error) {
      console.error('Error fetching vendor drop ship info:', error);
      setVendorDropShip(true);
    } finally {
      setLoadingVendorInfo(false);
    }
  };

  useEffect(() => {
    if (vendor) {
      fetchVendorDropShipInfo(vendor);
    } else {
      setVendorDropShip(null);
    }
  }, [vendor]);

  // Fetch warehouses from DB
  const fetchWarehouses = async () => {
    try {
      const response = await fetch(`/api/wms/list`);
      const data = await response.json();
      if (data.success && data.warehouses) {
        setWarehouseOptions(
          (data.warehouses as any[])
            .filter((w: any) => w.status === 'Active')
            .map((w: any) => ({
              id: w.id,
              name: w.name,
              address: w.address || '',
              city: w.city || '',
              state: w.state || '',
              zip: w.zip || '',
              country: w.country || 'US',
              manager: w.manager || '',
              phone: w.phone || '',
            }))
        );
      }
    } catch (error) {
      console.error('Error fetching warehouses:', error);
    }
  };

  // Fetch vendors and warehouses when drawer opens
  useEffect(() => {
    if (isOpen) {
      fetchVendors();
      fetchWarehouses();
      // Clear vendor selection when product changes
      setVendor('');
      setVendorId('');
      setVendorDropShip(null);
      setShowValidationErrors(false);
    }
  }, [isOpen, productId]);

  useEffect(() => {
    if (isVendorDropdownOpen && vendorSearchRef.current) {
      vendorSearchRef.current.focus();
    }
  }, [isVendorDropdownOpen]);

  // Filter vendors client-side based on search
  const filteredVendors = availableVendors.filter(v =>
    v.name.toLowerCase().includes(vendorSearch.toLowerCase())
  );

  useEffect(() => {
    const currentRef = vendorDropdownRef.current;
    const currentSearchRef = vendorSearchRef.current;
    const handleClickOutside = (event: MouseEvent) => {
      if (currentRef && !currentRef.contains(event.target as Node) && currentSearchRef && !currentSearchRef.contains(event.target as Node)) {
        setIsVendorDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-200 bg-white">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">Order Sample</h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Request samples for analysis</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 drawer-scroll">
              <div className="space-y-5">
                {/* Product Details */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">Product Information</label>
                  <div className="space-y-2">
                    <p className="text-sm text-slate-700">
                      <span className="font-medium">Product:</span> {productName}
                    </p>
                    <p className="text-sm text-slate-700">
                      <span className="font-medium">Client:</span> {clientName}
                    </p>
                  </div>
                  {competitorLink && (
                    <button className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium mt-2">
                      <LinkIcon className="w-4 h-4" />
                      View Competitor Product
                    </button>
                  )}
                </div>

                {/* Sample Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Sample Type <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setSampleType('competitor')}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        sampleType === 'competitor'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${
                          sampleType === 'competitor' ? 'border-blue-500' : 'border-slate-300'
                        }`}>
                          {sampleType === 'competitor' && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 text-sm">Competitor Sample</p>
                          <p className="text-xs text-slate-600 mt-0.5">For product analysis</p>
                        </div>
                      </div>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setSampleType('pre-production')}
                      className={`p-3 rounded-lg border text-left transition-all relative overflow-hidden ${
                        sampleType === 'pre-production'
                          ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500/20'
                          : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      {sampleType === 'pre-production' && (
                        <div className="absolute top-0 right-0 bg-gradient-to-l from-blue-600 to-blue-500 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-bl-md shadow-sm">
                          Pre-Production
                        </div>
                      )}
                      <div className="flex items-start gap-2">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${
                          sampleType === 'pre-production' ? 'border-blue-500' : 'border-slate-300'
                        }`}>
                          {sampleType === 'pre-production' && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 text-sm">Pre-Production Sample</p>
                          <p className="text-xs text-slate-600 mt-0.5">For quality verification before full run</p>
                        </div>
                      </div>
                    </motion.button>
                  </div>
                </div>

                {/* Sample Variants */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-slate-900">Sample Variants</label>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleAddVariant}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Variants
                    </motion.button>
                  </div>

                  {variants.map((variant, index) => (
                    <div key={variant.id} className="mb-4 p-4 bg-white border border-slate-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-slate-900">SKU #{index + 1}</h4>
                        {variants.length > 1 && (
                          <button
                            onClick={() => handleRemoveVariant(variant.id)}
                            className="text-xs text-red-600 hover:text-red-700 font-medium"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">SKU <span className="text-red-400">*</span></label>
                          <input
                            type="text"
                            placeholder="e.g., 3132"
                            value={variant.sku}
                            onChange={(e) => handleUpdateVariant(variant.id, 'sku', e.target.value)}
                            className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${showValidationErrors && !variant.sku?.trim() ? 'border-red-400 bg-red-50/50' : 'border-slate-200'}`}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Color <span className="text-red-400">*</span></label>
                          <input
                            type="text"
                            placeholder="e.g., Black"
                            value={variant.color}
                            onChange={(e) => handleUpdateVariant(variant.id, 'color', e.target.value)}
                            className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${showValidationErrors && !variant.color?.trim() ? 'border-red-400 bg-red-50/50' : 'border-slate-200'}`}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Size <span className="text-red-400">*</span></label>
                          <input
                            type="text"
                            placeholder="e.g., Medium"
                            value={variant.size}
                            onChange={(e) => handleUpdateVariant(variant.id, 'size', e.target.value)}
                            className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${showValidationErrors && !variant.size?.trim() ? 'border-red-400 bg-red-50/50' : 'border-slate-200'}`}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Qty <span className="text-red-400">*</span></label>
                          <input
                            type="text"
                            placeholder="1"
                            value={variant.qty}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => {
                              const value = e.target.value;
                              // Allow empty or valid numbers
                              if (value === '') {
                                handleUpdateVariant(variant.id, 'qty', '');
                              } else {
                                const num = parseInt(value);
                                if (!isNaN(num) && num >= 1) {
                                  handleUpdateVariant(variant.id, 'qty', num);
                                }
                              }
                            }}
                            onBlur={(e) => {
                              // Reset to 1 if empty or invalid on blur
                              if (e.target.value === '' || parseInt(e.target.value) < 1) {
                                handleUpdateVariant(variant.id, 'qty', 1);
                              }
                            }}
                            className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${showValidationErrors && (typeof variant.qty === 'number' ? variant.qty : (parseInt(String(variant.qty)) || 0)) <= 0 ? 'border-red-400 bg-red-50/50' : 'border-slate-200'}`}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Cost/Unit <span className="text-red-400">*</span></label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">$</span>
                            <input
                              type="text"
                              placeholder="0.00"
                              value={variant.costPerUnit === 0 ? '' : (typeof variant.costPerUnit === 'number' ? variant.costPerUnit.toFixed(2) : variant.costPerUnit)}
                              onFocus={(e) => {
                                if (variant.costPerUnit === 0) {
                                  e.target.value = '';
                                } else {
                                  const raw = parseFloat(String(variant.costPerUnit));
                                  if (!isNaN(raw)) e.target.value = String(raw);
                                  e.target.select();
                                }
                              }}
                              onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9.]/g, '');
                                if (value === '' || value === '.') {
                                  handleUpdateVariant(variant.id, 'costPerUnit', '');
                                } else {
                                  const num = parseFloat(value);
                                  if (!isNaN(num) && num >= 0) {
                                    handleUpdateVariant(variant.id, 'costPerUnit', value);
                                  }
                                }
                              }}
                              onBlur={(e) => {
                                const value = e.target.value.replace(/[^0-9.]/g, '');
                                if (value === '' || value === '.' || isNaN(parseFloat(value))) {
                                  handleUpdateVariant(variant.id, 'costPerUnit', 0);
                                } else {
                                  handleUpdateVariant(variant.id, 'costPerUnit', parseFloat(parseFloat(value).toFixed(2)));
                                }
                              }}
                              className={`w-full pl-7 pr-3 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${showValidationErrors && (typeof variant.costPerUnit === 'number' ? variant.costPerUnit : (parseFloat(String(variant.costPerUnit)) || 0)) <= 0 ? 'border-red-400 bg-red-50/50' : 'border-slate-200'}`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Vendor */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Vendor <span className="text-red-500">*</span>
                  </label>
                  <div className="relative" ref={vendorDropdownRef}>
                    <button
                      onClick={() => setIsVendorDropdownOpen(!isVendorDropdownOpen)}
                      className={`w-full px-4 py-2.5 bg-slate-50 border rounded-lg text-sm text-left focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 flex items-center justify-between ${showValidationErrors && !vendor?.trim() ? 'border-red-400 bg-red-50/50' : 'border-slate-200'}`}
                    >
                      {vendor ? (
                        <span className="text-slate-900">{vendor}</span>
                      ) : (
                        <span className={showValidationErrors ? 'text-red-400' : 'text-slate-400'}>Select a vendor...</span>
                      )}
                      <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isVendorDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <AnimatePresence>
                      {isVendorDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-xl z-10 overflow-hidden"
                        >
                          <div className="p-2">
                            <input
                              type="text"
                              placeholder="Search vendors..."
                              value={vendorSearch}
                              onChange={(e) => setVendorSearch(e.target.value)}
                              ref={vendorSearchRef}
                              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                          </div>
                          {loadingVendors ? (
                            <div className="px-4 py-6 flex flex-col items-center justify-center">
                              <Loader2 className="w-5 h-5 animate-spin text-blue-500 mb-2" />
                              <span className="text-xs text-slate-500">Loading vendors...</span>
                            </div>
                          ) : filteredVendors.length > 0 ? (
                            <div className="max-h-[200px] overflow-y-auto">
                              {productId && (
                                <div className="px-4 py-2 border-b border-slate-100">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Product Vendor Network</span>
                                </div>
                              )}
                              {filteredVendors.map((vendorOption) => (
                                <button
                                  key={vendorOption.id}
                                  onClick={() => {
                                    setVendor(vendorOption.name);
                                    setVendorId(vendorOption.id);
                                    setVendorSearch('');
                                    setIsVendorDropdownOpen(false);
                                  }}
                                  className="w-full px-4 py-2.5 text-sm text-left hover:bg-slate-50 transition-colors flex items-center gap-3"
                                >
                                  <Check 
                                    className={`w-4 h-4 flex-shrink-0 ${vendor === vendorOption.name ? 'text-blue-600' : 'text-transparent'}`} 
                                  />
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <Building2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                    <span className={`truncate ${vendor === vendorOption.name ? 'text-slate-900 font-semibold' : 'text-slate-700'}`}>
                                      {vendorOption.name}
                                    </span>
                                    {vendorOption.priority && (
                                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${
                                        vendorOption.priority === 'Primary' ? 'bg-purple-100 text-purple-600' :
                                        vendorOption.priority === 'Secondary' ? 'bg-blue-100 text-blue-600' :
                                        'bg-slate-100 text-slate-500'
                                      }`}>
                                        {vendorOption.priority}
                                      </span>
                                    )}
                                    {vendorOption.type && (
                                      <span className="ml-auto text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 flex-shrink-0">
                                        {vendorOption.type}
                                      </span>
                                    )}
                                  </div>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="px-4 py-6 text-center">
                              <Building2 className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                              {productId && availableVendors.length === 0 ? (
                                <>
                                  <p className="text-sm font-medium text-slate-600">No vendors in network</p>
                                  <p className="text-xs text-slate-400 mt-1">Link vendors to this product in the Pipeline first</p>
                                </>
                              ) : (
                                <>
                                  <p className="text-sm text-slate-500">No vendors found</p>
                                  <p className="text-xs text-slate-400 mt-1">Try a different search term</p>
                                </>
                              )}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* ─── Drop Shipping Status Indicator ─── */}
                {vendor && vendorDropShip !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl border-2 ${
                      vendorDropShip
                        ? 'bg-emerald-50/50 border-emerald-200'
                        : 'bg-amber-50/50 border-amber-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        vendorDropShip ? 'bg-emerald-100' : 'bg-amber-100'
                      }`}>
                        {vendorDropShip ? (
                          <Truck className="w-4.5 h-4.5 text-emerald-600" />
                        ) : (
                          <SplitSquareVertical className="w-4.5 h-4.5 text-amber-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-bold ${vendorDropShip ? 'text-emerald-800' : 'text-amber-800'}`}>
                            {vendorDropShip ? 'Drop Shipping Supported' : 'No Drop Shipping'}
                          </p>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                            vendorDropShip
                              ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                              : 'bg-amber-100 text-amber-700 border-amber-300'
                          }`}>
                            {vendorDropShip ? 'ENABLED' : 'DISABLED'}
                          </span>
                        </div>
                        <p className={`text-xs mt-1 ${vendorDropShip ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {vendorDropShip
                            ? 'This vendor ships directly to multiple destinations. Split quantities across destinations below.'
                            : 'This vendor cannot drop ship. Split quantities across destinations below — each destination with allocated items will generate a separate PO.'}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
                {vendor && loadingVendorInfo && (
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Checking vendor capabilities...</span>
                  </div>
                )}

                {/* Shipment Destinations */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide text-slate-600">
                      Shipment Destinations
                    </h3>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleAddDestination}
                      className="flex items-center gap-2 px-3 py-1.5 border border-slate-300 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Split Shipment
                    </motion.button>
                  </div>

                  {/* Allocation summary bar (multi-destination only) */}
                  {destinations.length > 1 && (
                    <div className="mb-4">
                      {(() => {
                        const totalAlloc = variants.reduce((sum, v) => sum + getVariantTotalAllocated(v.id), 0);
                        const isOver = totalAlloc > totalQuantity;
                        const isUnder = totalAlloc < totalQuantity && totalAlloc > 0;
                        const destsWithItems = destinations.filter(d => getDestinationTotalAllocated(d.id) > 0).length;
                        return (
                          <div className={`p-3 rounded-xl border-2 ${isOver ? 'border-red-200 bg-red-50' : isUnder ? 'border-amber-200 bg-amber-50' : totalAlloc === totalQuantity ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <SplitSquareVertical className={`w-4 h-4 ${isOver ? 'text-red-600' : isUnder ? 'text-amber-600' : totalAlloc === totalQuantity ? 'text-emerald-600' : 'text-slate-400'}`} />
                                <span className={`text-xs font-bold ${isOver ? 'text-red-700' : isUnder ? 'text-amber-700' : totalAlloc === totalQuantity ? 'text-emerald-700' : 'text-slate-600'}`}>
                                  {totalAlloc} / {totalQuantity} units allocated
                                  {isOver && ' — over-allocated!'}
                                  {isUnder && ` — ${totalQuantity - totalAlloc} remaining`}
                                </span>
                              </div>
                              {destsWithItems > 1 && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 border border-blue-200">
                                  {destsWithItems} POs will be created
                                </span>
                              )}
                            </div>
                            {/* Per-variant allocation progress */}
                            <div className="mt-2 space-y-1">
                              {variants.map((v, idx) => {
                                const allocated = getVariantTotalAllocated(v.id);
                                const qty = parseInt(String(v.qty)) || 1;
                                const pct = qty > 0 ? Math.min((allocated / qty) * 100, 100) : 0;
                                const itemLabel = [v.sku, v.color, v.size].filter(Boolean).join(' · ') || `Item ${idx + 1}`;
                                return (
                                  <div key={v.id} className="flex items-center gap-2">
                                    <span className="text-[10px] text-slate-500 w-24 truncate">{itemLabel}</span>
                                    <div className="flex-1 h-1.5 bg-white/60 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full rounded-full transition-all ${allocated > qty ? 'bg-red-500' : allocated === qty ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                        style={{ width: `${pct}%` }}
                                      />
                                    </div>
                                    <span className={`text-[10px] font-medium ${allocated > qty ? 'text-red-600' : allocated === qty ? 'text-emerald-600' : 'text-slate-500'}`}>
                                      {allocated}/{qty}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {destinations.map((dest, destIndex) => {
                    const destAllocatedTotal = getDestinationTotalAllocated(dest.id);
                    const destLabel = dest.location === 'Other Location'
                      ? (dest.customAddress?.name || dest.customAddress?.city || dest.name)
                      : dest.location;
                    
                    return (
                      <div key={dest.id} className="mb-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                              destAllocatedTotal > 0
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-slate-100 text-slate-400'
                            }`}>
                              {destIndex + 1}
                            </div>
                            <div>
                              <h4 className="font-semibold text-slate-900 text-sm">
                                {destinations.length === 1 ? 'Ship To' : dest.name}
                              </h4>
                              {destinations.length > 1 && (
                                <p className="text-[11px] text-slate-500">{destAllocatedTotal} unit{destAllocatedTotal !== 1 ? 's' : ''} allocated</p>
                              )}
                            </div>
                          </div>
                          {destinations.length > 1 && (
                            <button
                              onClick={() => handleRemoveDestination(dest.id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        
                        {/* Variant quantity allocation (only show when multiple destinations) */}
                        {destinations.length > 1 && (
                          <div className="mb-3">
                            <div className="space-y-1.5">
                              {variants.map((variant, varIndex) => {
                                const allocated = dest.allocations[variant.id] !== undefined ? dest.allocations[variant.id] : 0;
                                const totalAllocated = getVariantTotalAllocated(variant.id);
                                const isOverAllocated = totalAllocated > (parseInt(String(variant.qty)) || 1);
                                const itemLabel = [variant.sku, variant.color, variant.size].filter(Boolean).join(' · ') || `Item ${varIndex + 1}`;
                                const varQty = parseInt(String(variant.qty)) || 1;
                                
                                return (
                                  <div key={variant.id} className={`flex items-center gap-3 bg-white px-3 py-2 rounded-lg border ${isOverAllocated ? 'border-red-300' : 'border-slate-200'}`}>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-semibold text-slate-800 truncate">{itemLabel}</p>
                                      <p className="text-[10px] text-slate-400">
                                        {totalAllocated}/{varQty} allocated
                                        {isOverAllocated && (
                                          <span className="text-red-600 font-medium"> — over!</span>
                                        )}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <button
                                        type="button"
                                        onClick={() => handleUpdateDestinationAllocation(dest.id, variant.id, Math.max(0, allocated - 1))}
                                        className="w-7 h-7 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 text-sm font-bold transition-colors"
                                        disabled={allocated <= 0}
                                      >
                                        −
                                      </button>
                                      <input
                                        type="text"
                                        placeholder="0"
                                        value={allocated === 0 ? '' : allocated}
                                        onFocus={(e) => {
                                          if (allocated === 0) e.target.value = '';
                                          else e.target.select();
                                        }}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          if (value === '') {
                                            handleUpdateDestinationAllocation(dest.id, variant.id, 0);
                                          } else {
                                            const num = parseInt(value);
                                            if (!isNaN(num) && num >= 0) {
                                              handleUpdateDestinationAllocation(dest.id, variant.id, num);
                                            }
                                          }
                                        }}
                                        onBlur={(e) => {
                                          if (e.target.value === '') handleUpdateDestinationAllocation(dest.id, variant.id, 0);
                                        }}
                                        className={`w-14 px-2 py-1.5 bg-white border-2 rounded-lg text-sm text-center font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                                          isOverAllocated ? 'border-red-400 text-red-700' : allocated > 0 ? 'border-blue-400 text-blue-700' : 'border-slate-200 text-slate-400'
                                        }`}
                                      />
                                      <button
                                        type="button"
                                        onClick={() => handleUpdateDestinationAllocation(dest.id, variant.id, allocated + 1)}
                                        className="w-7 h-7 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 text-sm font-bold transition-colors"
                                      >
                                        +
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        <div className="mb-3">
                          <label className="block text-xs font-medium text-slate-700 mb-2">Ship To Location</label>
                          <div className="relative">
                            <motion.button
                              ref={(el) => { shipToButtonRefs.current[dest.id] = el; }}
                              type="button"
                              onClick={() => setOpenShipToDropdown(openShipToDropdown === dest.id ? null : dest.id)}
                              whileHover={{ scale: 1.005 }}
                              whileTap={{ scale: 0.995 }}
                              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all flex items-center justify-between ${
                                openShipToDropdown === dest.id
                                  ? 'border-blue-500 ring-2 ring-blue-500/20 bg-white'
                                  : showValidationErrors && !dest.warehouseId && !dest.customAddress && !dest.contactId
                                    ? 'border-red-400 bg-red-50/50'
                                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <MapPin className={`w-4 h-4 flex-shrink-0 ${dest.location ? 'text-blue-500' : 'text-slate-400'}`} />
                                <span className={`text-sm truncate ${dest.location ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>
                                  {getShipToLabel(dest)}
                                </span>
                              </div>
                              <motion.div
                                animate={{ rotate: openShipToDropdown === dest.id ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                              </motion.div>
                            </motion.button>

                            {/* Ship To Dropdown Menu via Portal */}
                            {createPortal(
                              <AnimatePresence>
                                {openShipToDropdown === dest.id && (() => {
                                  const btn = shipToButtonRefs.current[dest.id];
                                  const rect = btn?.getBoundingClientRect();
                                  if (!rect) return null;
                                  return (
                                    <motion.div
                                      ref={shipToMenuRef}
                                      initial={{ opacity: 0, y: -8 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -8 }}
                                      transition={{ duration: 0.15 }}
                                      style={{
                                        position: 'fixed',
                                        top: rect.bottom + 6,
                                        left: rect.left,
                                        width: rect.width,
                                        zIndex: 99999,
                                      }}
                                      className="bg-white border-2 border-slate-200 rounded-xl shadow-2xl overflow-hidden"
                                    >
                                      <div className="max-h-[280px] overflow-y-auto">
                                        {warehouseOptions.length > 0 && (
                                          <>
                                            <div className="px-3 py-2 bg-slate-50 border-b border-slate-100">
                                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Warehouses</span>
                                            </div>
                                            {warehouseOptions.map((wh) => {
                                              const val = `warehouse:${wh.id}`;
                                              const isSelected = dest.location === val;
                                              return (
                                                <motion.button
                                                  key={wh.id}
                                                  type="button"
                                                  onClick={() => handleSelectShipTo(dest.id, val)}
                                                  whileHover={{ backgroundColor: 'rgba(239, 246, 255, 0.7)' }}
                                                  className={`w-full px-4 py-3 text-left transition-colors flex items-center justify-between border-b border-slate-50 ${
                                                    isSelected ? 'bg-blue-50' : ''
                                                  }`}
                                                >
                                                  <div className="flex items-center gap-2.5 min-w-0">
                                                    <Building2 className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                                                    <div className="min-w-0">
                                                      <div className={`text-sm font-medium truncate ${isSelected ? 'text-blue-700' : 'text-slate-900'}`}>
                                                        {wh.name}
                                                      </div>
                                                      {wh.city && (
                                                        <div className="text-[11px] text-slate-400 truncate">{wh.city}, {wh.state}</div>
                                                      )}
                                                    </div>
                                                  </div>
                                                  {isSelected && (
                                                    <motion.div
                                                      initial={{ scale: 0 }}
                                                      animate={{ scale: 1 }}
                                                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                                    >
                                                      <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                                    </motion.div>
                                                  )}
                                                </motion.button>
                                              );
                                            })}
                                          </>
                                        )}
                                        {/* Other Location option */}
                                        <motion.button
                                          type="button"
                                          onClick={() => handleSelectShipTo(dest.id, 'Other Location')}
                                          whileHover={{ backgroundColor: 'rgba(239, 246, 255, 0.7)' }}
                                          className={`w-full px-4 py-3 text-left transition-colors flex items-center justify-between ${
                                            dest.location === 'Other Location' ? 'bg-blue-50' : ''
                                          }`}
                                        >
                                          <div className="flex items-center gap-2.5">
                                            <MapPin className={`w-4 h-4 flex-shrink-0 ${dest.location === 'Other Location' ? 'text-blue-600' : 'text-slate-400'}`} />
                                            <div>
                                              <div className={`text-sm font-medium ${dest.location === 'Other Location' ? 'text-blue-700' : 'text-slate-900'}`}>
                                                Other Location
                                              </div>
                                              <div className="text-[11px] text-slate-400">Custom address or contact lookup</div>
                                            </div>
                                          </div>
                                          {dest.location === 'Other Location' && (
                                            <motion.div
                                              initial={{ scale: 0 }}
                                              animate={{ scale: 1 }}
                                              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                            >
                                              <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                            </motion.div>
                                          )}
                                        </motion.button>
                                      </div>
                                    </motion.div>
                                  );
                                })()}
                              </AnimatePresence>,
                              document.body
                            )}
                          </div>
                        </div>

                        {dest.location === 'Other Location' ? (
                          <div className="space-y-3">
                            {/* Search Contact Addresses */}
                            <div className="relative" ref={activeAddressDropdown === dest.id ? addressDropdownRef : undefined}>
                              <label className="block text-xs font-medium text-slate-700 mb-2">Search Contact Addresses</label>
                              <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                  type="text"
                                  placeholder="Search by contact name, company, or address..."
                                  value={contactAddressSearch[dest.id] || ''}
                                  onFocus={() => {
                                    setActiveAddressDropdown(dest.id);
                                    if (contactAddressSearch[dest.id]?.trim()) {
                                      fetchContactAddresses(contactAddressSearch[dest.id]);
                                    }
                                  }}
                                  onChange={(e) => {
                                    setContactAddressSearch(prev => ({ ...prev, [dest.id]: e.target.value }));
                                    setActiveAddressDropdown(dest.id);
                                  }}
                                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                />
                                {loadingContactAddresses && activeAddressDropdown === dest.id && (
                                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 animate-spin" />
                                )}
                              </div>
                              <AnimatePresence>
                                {activeAddressDropdown === dest.id && (contactAddressSearch[dest.id] || '').trim().length > 0 && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-20 max-h-[240px] overflow-y-auto"
                                  >
                                    {loadingContactAddresses ? (
                                      <div className="px-4 py-6 flex flex-col items-center">
                                        <Loader2 className="w-5 h-5 animate-spin text-blue-500 mb-2" />
                                        <span className="text-xs text-slate-500">Searching contacts...</span>
                                      </div>
                                    ) : contactAddressResults.length > 0 ? (
                                      contactAddressResults.map((result, idx) => (
                                        <button
                                          key={`${result.contactId}-${result.addressId}-${idx}`}
                                          onClick={() => {
                                            setDestinations(destinations.map(d =>
                                              d.id === dest.id ? {
                                                ...d,
                                                contactId: result.contactId,
                                                customAddress: {
                                                  name: result.label || 'Address',
                                                  street: result.street1 + (result.street2 ? `, ${result.street2}` : ''),
                                                  city: result.city,
                                                  state: result.state,
                                                  zip: result.zip,
                                                  type: 'Commercial',
                                                  contactName: result.contactName,
                                                }
                                              } : d
                                            ));
                                            setActiveAddressDropdown(null);
                                            setContactAddressSearch(prev => ({ ...prev, [dest.id]: '' }));
                                          }}
                                          className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0"
                                        >
                                          <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                              <User className="w-4 h-4 text-indigo-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <div className="flex items-center gap-2 mb-0.5">
                                                <span className="text-sm font-semibold text-slate-900 truncate">{result.contactName}</span>
                                                {result.company && (
                                                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 flex-shrink-0">
                                                    {result.company}
                                                  </span>
                                                )}
                                              </div>
                                              <div className="flex items-center gap-1.5">
                                                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">{result.label}</span>
                                              </div>
                                              <p className="text-xs text-slate-500 mt-1 truncate">
                                                {result.street1}
                                                {result.city && `, ${result.city}`}
                                                {result.state && `, ${result.state}`}
                                                {result.zip && ` ${result.zip}`}
                                              </p>
                                            </div>
                                          </div>
                                        </button>
                                      ))
                                    ) : (
                                      <div className="px-4 py-6 text-center">
                                        <MapPin className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                                        <p className="text-sm text-slate-500">No matching addresses found</p>
                                        <p className="text-xs text-slate-400 mt-1">Try searching by name, company, or address</p>
                                      </div>
                                    )}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>

                            <div className="relative flex items-center my-1">
                              <div className="flex-1 border-t border-slate-200"></div>
                              <span className="px-3 text-[10px] font-medium text-slate-400 uppercase tracking-wider">or enter manually</span>
                              <div className="flex-1 border-t border-slate-200"></div>
                            </div>

                            {/* Custom Address Input Fields */}
                            <div>
                              <label className="block text-xs font-medium text-slate-700 mb-2">Address Name</label>
                              <input
                                type="text"
                                placeholder="e.g., Client Office"
                                value={dest.customAddress?.name || ''}
                                onChange={(e) => {
                                  setDestinations(destinations.map(d => 
                                    d.id === dest.id ? {
                                      ...d,
                                      customAddress: {
                                        ...d.customAddress!,
                                        name: e.target.value
                                      }
                                    } : d
                                  ));
                                }}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-slate-700 mb-2">Contact Name</label>
                              <input
                                type="text"
                                placeholder="e.g., John Doe"
                                value={dest.customAddress?.contactName || ''}
                                onChange={(e) => {
                                  setDestinations(destinations.map(d => 
                                    d.id === dest.id ? {
                                      ...d,
                                      customAddress: {
                                        ...d.customAddress!,
                                        contactName: e.target.value
                                      }
                                    } : d
                                  ));
                                }}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-slate-700 mb-2">Street Address</label>
                              <input
                                type="text"
                                placeholder="e.g., 123 Main Street"
                                value={dest.customAddress?.street || ''}
                                onChange={(e) => {
                                  setDestinations(destinations.map(d => 
                                    d.id === dest.id ? {
                                      ...d,
                                      customAddress: {
                                        ...d.customAddress!,
                                        street: e.target.value
                                      }
                                    } : d
                                  ));
                                }}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div className="sm:col-span-1">
                                <label className="block text-xs font-medium text-slate-700 mb-2">City</label>
                                <input
                                  type="text"
                                  placeholder="City"
                                  value={dest.customAddress?.city || ''}
                                  onChange={(e) => {
                                    setDestinations(destinations.map(d => 
                                      d.id === dest.id ? {
                                        ...d,
                                        customAddress: {
                                          ...d.customAddress!,
                                          city: e.target.value
                                        }
                                      } : d
                                    ));
                                  }}
                                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                />
                              </div>

                              <div className="col-span-1">
                                <label className="block text-xs font-medium text-slate-700 mb-2">State</label>
                                <input
                                  type="text"
                                  placeholder="ST"
                                  value={dest.customAddress?.state || ''}
                                  onChange={(e) => {
                                    setDestinations(destinations.map(d => 
                                      d.id === dest.id ? {
                                        ...d,
                                        customAddress: {
                                          ...d.customAddress!,
                                          state: e.target.value
                                        }
                                      } : d
                                    ));
                                  }}
                                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                />
                              </div>

                              <div className="col-span-1">
                                <label className="block text-xs font-medium text-slate-700 mb-2">ZIP</label>
                                <input
                                  type="text"
                                  placeholder="12345"
                                  value={dest.customAddress?.zip || ''}
                                  onChange={(e) => {
                                    setDestinations(destinations.map(d => 
                                      d.id === dest.id ? {
                                        ...d,
                                        customAddress: {
                                          ...d.customAddress!,
                                          zip: e.target.value
                                        }
                                      } : d
                                    ));
                                  }}
                                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                />
                              </div>
                            </div>

                            <div>
                              <ModernDropdown
                                label="Address Type"
                                value={dest.customAddress?.type || 'Commercial'}
                                onChange={(val) => {
                                  setDestinations(destinations.map(d => 
                                    d.id === dest.id ? {
                                      ...d,
                                      customAddress: {
                                        ...d.customAddress!,
                                        type: val
                                      }
                                    } : d
                                  ));
                                }}
                                options={['Commercial', 'Residential']}
                              />
                            </div>

                            {/* Display the entered address */}
                            {dest.customAddress && (dest.customAddress.name || dest.customAddress.street) && (
                              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                {dest.customAddress.name && (
                                  <p className="font-semibold text-slate-900 text-sm mb-1">{dest.customAddress.name}</p>
                                )}
                                {dest.customAddress.street && (
                                  <p className="text-xs text-slate-600">
                                    {dest.customAddress.street}
                                    {dest.customAddress.city && `, ${dest.customAddress.city}`}
                                    {dest.customAddress.state && `, ${dest.customAddress.state}`}
                                    {dest.customAddress.zip && ` ${dest.customAddress.zip}`}
                                  </p>
                                )}
                                <p className="text-xs text-blue-600 font-medium mt-1">{dest.customAddress.type}</p>
                                {dest.customAddress.contactName && (
                                  <p className="text-xs text-slate-600 mt-1">
                                    <User className="w-4 h-4 inline-block mr-1" />
                                    {dest.customAddress.contactName}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        ) : dest.warehouseId ? (() => {
                          const wh = getWarehouseById(dest.warehouseId);
                          if (!wh) return null;
                          const fullAddr = [wh.address, wh.city, wh.state, wh.zip].filter(Boolean).join(', ');
                          return (
                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                              <p className="font-semibold text-slate-900 text-sm mb-1">{wh.name}</p>
                              <p className="text-xs text-slate-600">{fullAddr}</p>
                              {wh.manager && (
                                <p className="text-xs text-slate-500 mt-1">
                                  <User className="w-3.5 h-3.5 inline-block mr-1" />
                                  {wh.manager}
                                </p>
                              )}
                              <p className="text-xs text-blue-600 font-medium mt-1">Warehouse</p>
                            </div>
                          );
                        })() : null}
                      </div>
                    );
                  })}
                </div>

                {/* Summary */}
                <div className="bg-slate-100 rounded-xl p-4 border border-slate-200">
                  <div className="grid grid-cols-3 gap-2 sm:gap-4">
                    <div>
                      <p className="text-xs font-medium text-slate-600 mb-1">Total SKUs</p>
                      <p className="text-xl font-bold text-slate-900">{variants.length}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-600 mb-1">Total Quantity</p>
                      <p className="text-xl font-bold text-slate-900">{totalQuantity}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-600 mb-1">Total Cost</p>
                      <p className="text-xl font-bold text-green-600">${totalCost.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    placeholder="Any special instructions or notes for this sample order..."
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                  />
                </div>

                {/* In-Hands Date */}
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">
                    In-Hands Date (Optional)
                  </label>
                  <DatePicker
                    value={inHandsDate}
                    onChange={(date) => setInHandsDate(date)}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 sm:px-8 py-4 sm:py-6 border-t border-slate-200 bg-white">
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: (submitting || !isFormValid) ? 1 : 1.02 }}
                  whileTap={{ scale: (submitting || !isFormValid) ? 1 : 0.98 }}
                  onClick={() => {
                    if (!isFormValid) {
                      setShowValidationErrors(true);
                      return;
                    }
                    setShowValidationErrors(false);
                    handleSubmit();
                  }}
                  disabled={submitting}
                  className={`flex-1 px-6 py-3 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 ${
                    !isFormValid && !submitting
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed'
                  }`}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      {(() => {
                        if (destinations.length > 1) {
                          const destsWithItems = destinations.filter(d => getDestinationTotalAllocated(d.id) > 0).length;
                          if (destsWithItems > 1) return `Create ${destsWithItems} Split POs`;
                        }
                        return 'Submit Sample Order';
                      })()}
                    </>
                  )}
                </motion.button>
              </div>

              {/* Validation errors panel */}
              <AnimatePresence>
                {showValidationErrors && validationErrors.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mx-6 mb-4 overflow-hidden"
                  >
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                        <p className="text-sm font-bold text-red-700">Please fix the following before submitting:</p>
                      </div>
                      <ul className="space-y-1 ml-6">
                        {validationErrors.map((err, idx) => (
                          <li key={idx} className="text-xs text-red-600 list-disc">{err}</li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}