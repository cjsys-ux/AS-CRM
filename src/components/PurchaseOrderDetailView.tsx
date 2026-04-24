import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, X, Calendar, MapPin, User, Mail, Phone, Building2,
  Clock, CheckCircle2, AlertCircle, Truck, FileText, MessageSquare,
  Upload, Download, Printer, MoreVertical, Plus, Edit, Trash2, Send,
  Loader2, CheckCircle, Paperclip, Eye, EyeOff, ShieldAlert,
  Image, Palette, RotateCcw, Sparkles, Lock, MessageCircle
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { ContactSelector } from './ContactSelector';
import { ModernCalendar } from './ModernCalendar';
import { ShippingMethodSelector } from './ShippingMethodSelector';
import { EditableLineItemsTable } from './EditableLineItemsTable';
import { ModernDropdown } from './ModernDropdown';
import { ConfirmPOModal } from './ConfirmPOModal';
import { CreateShipmentFromPOModal } from './CreateShipmentFromPOModal';
import { SendPOModal } from './SendPOModal';
import { SubmitPOModal } from './SubmitPOModal';
import { VendorSelector } from './VendorSelector';
import { ShipToEditor } from './ShipToEditor';
import { MissedInHandsDialog } from './MissedInHandsDialog';
import { getProjectBadgeStaticClasses } from './projectNumberUtils';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

interface PurchaseOrder {
  id: string;
  poNumber: string;
  poDate: string;
  project: string;
  projectNumber?: string;
  vendor: string;
  customer: string;
  status: string;
  shipDate: string | null;
  inHandsDate: string;
  total: number;
  priority: string;
  contact: string;
  contacts?: Array<{
    name: string;
    role?: string;
    address?: string;
    fullAddress?: string;
  }>;
  shipToAddresses?: Array<{
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    contact?: string;
  }>;
  destinations?: any[];
  createdAt?: string;
  isSample: boolean;
  sampleType?: 'competitor' | 'pre-production' | string;
}

interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  user: string;
  type: 'created' | 'updated' | 'status_change';
}

interface Note {
  id: string;
  text: string;
  user: string;
  date: string;
}

interface ShipToAddress {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  contact?: string;
}

interface PurchaseOrderDetailViewProps {
  order: PurchaseOrder;
  onBack: () => void;
  onEdit: () => void;
  onStatusChange?: (orderId: string, newStatus: string, extra?: { carrier?: string; trackingNumber?: string }) => void;
  onOrderUpdate?: () => void;
}

export function PurchaseOrderDetailView({ order, onBack, onEdit, onStatusChange, onOrderUpdate }: PurchaseOrderDetailViewProps) {
  const { user } = useAuth();
  const artworkFileInputRef = useRef<HTMLInputElement>(null);
  const [showTimeline, setShowTimeline] = useState(false);
  const [internalNote, setInternalNote] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [status, setStatus] = useState(order.status);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [showSendPOModal, setShowSendPOModal] = useState(false);
  const [isEditingItems, setIsEditingItems] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showShipmentModal, setShowShipmentModal] = useState(false);
  const [showArtworkDetails, setShowArtworkDetails] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isDeletingNote, setIsDeletingNote] = useState<string | null>(null);
  const [artworkFiles, setArtworkFiles] = useState<{ id: string; name: string; fileUrl: string; uploadedAt: string }[]>([]);
  const [isUploadingArtwork, setIsUploadingArtwork] = useState(false);
  const [isSavingField, setIsSavingField] = useState(false);
  const [includeArtworkOnPO, setIncludeArtworkOnPO] = useState(true);
  const [artworkNeeded, setArtworkNeeded] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Artwork workflow states
  const [artworkMode, setArtworkMode] = useState<'prompt' | 'new' | 'past' | 'applied'>('prompt');
  const [selectedPastPO, setSelectedPastPO] = useState<string | null>(null);
  const [appliedPastPO, setAppliedPastPO] = useState<{ po: string; desc: string; date: string; logo: string } | null>(null);
  const [showArtworkLightbox, setShowArtworkLightbox] = useState(false);
  const [artworkForm, setArtworkForm] = useState({
    proofRequired: 'None' as string,
    logoName: '',
    repeatLogo: false,
    logoLocation: '',
    logoSize: '',
    colorOfLogo: '',
    imprintType: 'Screen Print' as string,
    decorationNotes: '',
  });
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [artworkPreviewUrl, setArtworkPreviewUrl] = useState<string | null>(null);

  // Missed in-hands date states
  const [missedInHandsDate, setMissedInHandsDate] = useState<boolean>((order as any).missedInHandsDate || false);
  const [missedInHandsReason, setMissedInHandsReason] = useState<string>((order as any).missedInHandsReason || '');
  const [showMissedInHandsDialog, setShowMissedInHandsDialog] = useState(false);
  const [pendingShipDate, setPendingShipDate] = useState<string | null>(null);

  // PDF ref
  const poContentRef = useRef<HTMLDivElement>(null);

  // Modal states
  const [showContactSelector, setShowContactSelector] = useState(false);
  const [showShipDateCalendar, setShowShipDateCalendar] = useState(false);
  const [showInHandsCalendar, setShowInHandsCalendar] = useState(false);
  const [showShippingSelector, setShowShippingSelector] = useState(false);
  const [showVendorSelector, setShowVendorSelector] = useState(false);
  const [showShipToEditor, setShowShipToEditor] = useState(false);
  const [shipToEditorMode, setShipToEditorMode] = useState<'add' | 'edit'>('add');
  const [editingShipToIndex, setEditingShipToIndex] = useState<number | null>(null);

  // Data states
  const initialContact = (() => {
    if (order.contact && order.contact !== 'Select...') {
      return order.contact;
    }
    if (order.contacts && order.contacts.length > 0) {
      return order.contacts[0].name;
    }
    return 'Select...';
  })();
  const initialContactDetails = (() => {
    if ((order as any).contactDetails) {
      return (order as any).contactDetails;
    }
    if (order.contacts && order.contacts.length > 0) {
      return {
        email: '',
        phone: '',
        role: order.contacts[0].role || '',
      };
    }
    return {};
  })();

  const [contact, setContact] = useState(initialContact);
  const [contactDetails, setContactDetails] = useState<{ email?: string; phone?: string; role?: string }>(initialContactDetails);
  const [allContacts, setAllContacts] = useState<Array<{ name: string; role?: string; address?: string; fullAddress?: string }>>(
    order.contacts || []
  );
  const [vendor, setVendor] = useState(order.vendor || 'No Vendor Selected');
  const [vendorAddress, setVendorAddress] = useState<{ label?: string; customLabel?: string; contactPerson?: string; name?: string; street1?: string; street2?: string; city?: string; state?: string; zip?: string; country?: string } | null>((order as any).vendorAddress || null);
  const [vendorContactPerson, setVendorContactPerson] = useState<string>((order as any).vendorContactPerson || '');
  const [vendorAllAddresses, setVendorAllAddresses] = useState<any[]>([]);
  const [showVendorAddressEditor, setShowVendorAddressEditor] = useState(false);
  const [shipDate, setShipDate] = useState(order.shipDate);
  const [inHandsDate, setInHandsDate] = useState(order.inHandsDate);
  const [shippingMethod, setShippingMethod] = useState((order as any).shippingMethod || 'Ground');
  const [paymentTerms, setPaymentTerms] = useState((order as any).paymentTerms || '');
  const [showPaymentTermsDropdown, setShowPaymentTermsDropdown] = useState(false);
  const [carrierAccount, setCarrierAccount] = useState((order as any).carrierAccount || 'No carrier account');
  const [isManualAccount, setIsManualAccount] = useState(false);
  const [manualAccountNumber, setManualAccountNumber] = useState('');
  const [isBlindShip, setIsBlindShip] = useState((order as any).isBlindShip || false);

  // Editable company info state
  const [companyInfo, setCompanyInfo] = useState({
    name: 'Activate Swag',
    address: '2726 NW 72nd Avenue',
    cityStateZip: 'Miami, FL 33122',
    phone: '(305) 555-0123',
    website: 'www.activateswag.com',
  });
  const [isEditingCompanyInfo, setIsEditingCompanyInfo] = useState(false);

  // Editable footer contact info state
  const [footerContact, setFooterContact] = useState({
    firstName: 'Liz',
    email: 'orders@activateswag.com',
    phone: '(305) 555-0123',
  });
  const [isEditingFooterContact, setIsEditingFooterContact] = useState(false);

  // Confirmed PO edit protection
  const isConfirmedOrBeyond = ['Confirmed', 'In Production', 'Shipped', 'Delivered'].includes(status);
  const [showConfirmedEditWarning, setShowConfirmedEditWarning] = useState(false);
  const [confirmedEditCallback, setConfirmedEditCallback] = useState<(() => void) | null>(null);
  const [editWarningDismissedForSession, setEditWarningDismissedForSession] = useState(false);

  const guardConfirmedEdit = (callback: () => void) => {
    if (isConfirmedOrBeyond && !editWarningDismissedForSession) {
      setConfirmedEditCallback(() => callback);
      setShowConfirmedEditWarning(true);
    } else {
      callback();
    }
  };

  // Initialize ship-to from order's shipToAddresses or default
  const initialShipTo = (() => {
    if (order.shipToAddresses && order.shipToAddresses.length > 0) {
      const first = order.shipToAddresses[0];
      return {
        name: first.name,
        address: first.address,
        city: first.city,
        state: first.state,
        zip: first.zip,
        country: first.country || 'United States',
        contact: first.contact,
      };
    }
    return {
      name: 'Activate Swag Warehouse',
      address: '2726 NW 72nd Avenue',
      city: 'Miami',
      state: 'FL',
      zip: '33122',
      country: 'United States',
    };
  })();

  const [shipToAddress, setShipToAddress] = useState<ShipToAddress>(initialShipTo);
  const [additionalShipToAddresses, setAdditionalShipToAddresses] = useState<ShipToAddress[]>(
    order.shipToAddresses && order.shipToAddresses.length > 1
      ? order.shipToAddresses.slice(1).map(a => ({
          name: a.name,
          address: a.address,
          city: a.city,
          state: a.state,
          zip: a.zip,
          country: a.country || 'United States',
          contact: a.contact,
        }))
      : []
  );

  // Line items state - initialize from order data if available
  const [lineItems, setLineItems] = useState(() => {
    if ((order as any).lineItems && Array.isArray((order as any).lineItems) && (order as any).lineItems.length > 0) {
      return (order as any).lineItems.map((item: any, idx: number) => ({
        id: item.id || String(idx + 1),
        description: item.description || '',
        sku: item.sku || '',
        vendor: item.vendor || order.vendor || '',
        size: item.size || '',
        color: item.color || '',
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice || 0,
      }));
    }
    if ((order as any).variants && Array.isArray((order as any).variants) && (order as any).variants.length > 0) {
      return (order as any).variants.map((v: any, idx: number) => ({
        id: v.id || String(idx + 1),
        description: v.description || v.name || '',
        sku: v.sku || '',
        vendor: order.vendor || '',
        size: v.size || '',
        color: v.color || '',
        quantity: typeof v.qty === 'number' ? v.qty : (v.quantity || 1),
        unitPrice: typeof v.costPerUnit === 'number' ? v.costPerUnit : (v.unitPrice || 0),
      }));
    }
    return [{
      id: '1',
      description: '',
      sku: '',
      vendor: order.vendor || '',
      size: '',
      color: '',
      quantity: 1,
      unitPrice: 0,
    }];
  });

  // Custom line items state (shipping, setup fee, etc.)
  const [customLineItems, setCustomLineItems] = useState<{ id: string; name: string; amount: number; quantity: number }[]>(() => {
    if ((order as any).customLineItems && Array.isArray((order as any).customLineItems)) {
      return (order as any).customLineItems;
    }
    return [];
  });

  const [salesTaxRate, setSalesTaxRate] = useState(() => {
    return typeof (order as any).salesTaxRate === 'number' ? (order as any).salesTaxRate : 0.07;
  });
  const [taxStatus, setTaxStatus] = useState<'standard' | 'oos' | 'exempt'>(() => {
    return (order as any).taxStatus || 'standard';
  });
  const [shippingCost, setShippingCost] = useState(() => {
    return typeof (order as any).shippingCost === 'number' ? (order as any).shippingCost : 0;
  });

  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => {
    const itemTotal = item.quantity * item.unitPrice;
    const subItemsTotal = ((item as any).subItems || []).reduce((s: number, si: any) => s + (si.amount * (si.quantity || 1)), 0);
    return sum + itemTotal + subItemsTotal;
  }, 0);
  const customItemsTotal = customLineItems
    .filter((item: any) => item.name !== 'Shipping Fee')
    .reduce((sum, item) => sum + (item.amount * (item.quantity || 1)), 0);
  const shippingFromItems = [
    ...lineItems.flatMap((item: any) => ((item as any).subItems || []).filter((sub: any) => sub.type === 'shipping')),
    ...customLineItems.filter((item: any) => item.name === 'Shipping Fee').map((item: any) => ({ ...item, quantity: item.quantity || 1 }))
  ].reduce((sum: number, item: any) => sum + ((item.amount || 0) * (item.quantity || 1)), 0);
  const subtotalWithCustom = subtotal + customItemsTotal;
  const allShipping = shippingFromItems + shippingCost;
  const effectiveTaxRate = taxStatus === 'standard' ? salesTaxRate : 0;
  const salesTax = (subtotalWithCustom + allShipping) * effectiveTaxRate;
  const total = subtotalWithCustom + allShipping + salesTax;

  // Initialize timeline with creation event
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([
    {
      id: '1',
      date: order.createdAt || order.poDate,
      title: 'Purchase Order Created',
      description: `PO #${order.poNumber} was created`,
      user: 'Patrick Lowenthal',
      type: 'created'
    }
  ]);

  // Load full PO data (notes + artwork files) from the API on mount
  useEffect(() => {
    const loadPoData = async () => {
      try {
        // Load notes and timeline from MongoDB record
        const poRes = await fetch(`/api/purchasing/get?id=${encodeURIComponent(order.id)}`);
        if (poRes.ok) {
          const data = await poRes.json();
          const po = data.purchaseOrder;
          if (Array.isArray(po.notes)) setNotes(po.notes);
          if (Array.isArray(po.timelineEvents) && po.timelineEvents.length > 0) {
            setTimelineEvents(po.timelineEvents);
          }
          if (po.shippingMethod) setShippingMethod(po.shippingMethod);
          if (po.carrierAccount) setCarrierAccount(po.carrierAccount);
          if (po.shipToAddress) setShipToAddress(po.shipToAddress);
          if (po.shipDate !== undefined) setShipDate(po.shipDate);
          if (po.inHandsDate) setInHandsDate(po.inHandsDate);
          if (po.contact) { setContact(po.contact); }
          if (po.contactDetails) setContactDetails(po.contactDetails);
          if (po.vendor) setVendor(po.vendor);
          if (po.vendorAddress) setVendorAddress(po.vendorAddress);
          if (po.vendorContactPerson) setVendorContactPerson(po.vendorContactPerson);
          if (po.paymentTerms) setPaymentTerms(po.paymentTerms);
          if (po.isBlindShip !== undefined) setIsBlindShip(po.isBlindShip);
          if (Array.isArray(po.lineItems) && po.lineItems.length > 0) setLineItems(po.lineItems);
          if (Array.isArray(po.customLineItems)) setCustomLineItems(po.customLineItems);
          if (typeof po.salesTaxRate === 'number') setSalesTaxRate(po.salesTaxRate);
          if (po.taxStatus) setTaxStatus(po.taxStatus);
          if (typeof po.shippingCost === 'number') setShippingCost(po.shippingCost);
          if (po.missedInHandsDate !== undefined) setMissedInHandsDate(po.missedInHandsDate);
          if (po.missedInHandsReason) setMissedInHandsReason(po.missedInHandsReason);
        }

        // Load artwork files from uploads collection
        const filesRes = await fetch(
          `/api/files/list?entityType=purchase-order-artwork&entityId=${encodeURIComponent(order.id)}`
        );
        if (filesRes.ok) {
          const filesData = await filesRes.json();
          setArtworkFiles(
            (filesData.uploads ?? []).map((u: any) => ({
              id: u.id ?? u._id,
              name: u.fileName ?? 'Unknown',
              fileUrl: u.fileUrl ?? '',
              uploadedAt: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '',
            }))
          );
        }
      } catch {
        // Non-blocking -- UI still works if data can't be loaded
      }
    };
    loadPoData();
  }, [order.id]);

  // Helper: persist a field change to MongoDB
  const persistField = async (fields: Record<string, unknown>) => {
    setIsSavingField(true);
    try {
      const res = await fetch('/api/purchasing/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: order.id, ...fields }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Failed to save');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setIsSavingField(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Created':
        return 'bg-slate-500';
      case 'Submitted':
        return 'bg-yellow-500';
      case 'Sent':
        return 'bg-blue-500';
      case 'Confirmed':
        return 'bg-indigo-500';
      case 'In Production':
        return 'bg-purple-500';
      case 'Shipped':
        return 'bg-cyan-500';
      case 'Delivered':
        return 'bg-green-500';
      case 'Issue':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    const oldStatus = status;

    // Handle special status changes that need confirmation
    if (newStatus === 'Confirmed') {
      setShowConfirmModal(true);
      return;
    }

    // Submitted status should prompt user to confirm how it was submitted
    if (newStatus === 'Submitted') {
      setShowSubmitModal(true);
      return;
    }

    if (newStatus === 'Shipped') {
      setShowShipmentModal(true);
      return;
    }

    setStatus(newStatus);

    // Add timeline event for status change
    const newEvent: TimelineEvent = {
      id: String(timelineEvents.length + 1),
      date: new Date().toISOString(),
      title: 'Status Updated',
      description: `Status changed from ${oldStatus} to ${newStatus}`,
      user: user?.name ?? 'User',
      type: 'status_change'
    };
    const updatedTimeline = [...timelineEvents, newEvent];
    setTimelineEvents(updatedTimeline);

    // Persist status + timeline to MongoDB
    await persistField({ status: newStatus, timelineEvents: updatedTimeline });

    // Call the onStatusChange callback if provided
    if (onStatusChange) {
      onStatusChange(order.id, newStatus);
    }
  };

  const handleAddNote = async () => {
    if (!internalNote.trim()) return;

    setIsAddingNote(true);
    try {
      const res = await fetch('/api/purchasing/notes/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purchaseOrderId: order.id,
          text: internalNote.trim(),
          user: user?.name ?? 'User',
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Failed to add note');
      }
      const data = await res.json();
      setNotes((prev) => [...prev, data.note]);
      setInternalNote('');
      setShowNoteInput(false);
      toast.success('Note added');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add note');
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    setIsDeletingNote(noteId);
    try {
      const res = await fetch('/api/purchasing/notes/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purchaseOrderId: order.id, noteId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Failed to delete note');
      }
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      toast.success('Note deleted');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete note');
    } finally {
      setIsDeletingNote(null);
    }
  };

  // Handle artwork file upload -> S3 presign -> upload -> record in MongoDB
  const handleArtworkUpload = async (file: File) => {
    // Validate file type
    const ALLOWED_ARTWORK_TYPES = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'application/illustrator', 'image/svg+xml',
    ];
    const MAX_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

    if (!ALLOWED_ARTWORK_TYPES.includes(file.type) && !file.name.endsWith('.ai') && !file.name.endsWith('.eps')) {
      toast.error('Unsupported file type. Please upload an image or PDF.');
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      toast.error('File is too large. Maximum size is 25 MB.');
      return;
    }

    setIsUploadingArtwork(true);
    try {
      // 1. Get presigned URL
      const presignRes = await fetch('/api/files/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          entityType: 'purchase-order-artwork',
          entityId: order.id,
        }),
      });
      if (!presignRes.ok) throw new Error('Failed to get upload URL');
      const { uploadUrl, key, fileUrl } = await presignRes.json();

      // 2. Upload to S3
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });
      if (!uploadRes.ok) throw new Error('S3 upload failed');

      // 3. Record file metadata in MongoDB
      const completeRes = await fetch('/api/files/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key,
          fileName: file.name,
          fileType: file.type,
          size: file.size,
          entityType: 'purchase-order-artwork',
          entityId: order.id,
          uploadedBy: user?.sub ?? user?.email ?? 'User',
        }),
      });
      if (!completeRes.ok) throw new Error('Failed to record file metadata');
      const completeData = await completeRes.json();

      // 4. Update local artwork file list
      setArtworkFiles((prev) => [
        ...prev,
        {
          id: completeData.upload?.id ?? key,
          name: file.name,
          fileUrl,
          uploadedAt: new Date().toLocaleDateString(),
        },
      ]);

      // 5. Record artwork file reference in the PO document
      await persistField({
        artworkDetails: {
          hasArtworkFile: true,
          lastArtworkUploadAt: new Date().toISOString(),
        },
      });

      toast.success(`Artwork file "${file.name}" uploaded successfully`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Artwork upload failed');
    } finally {
      setIsUploadingArtwork(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format date from yyyy-mm-dd to mm-dd-yyyy for display
  const formatDateDisplay = (dateString: string | null) => {
    if (!dateString) return 'Select';
    const parts = dateString.split('-');
    if (parts.length === 3) {
      return `${parts[1]}-${parts[2]}-${parts[0]}`;
    }
    return dateString;
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Top Navigation */}
      <div className="bg-white border-b border-slate-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to All POs
            </motion.button>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">Purchase Order #{order.id}</h1>
              {order.isSample && (
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  order.sampleType === 'competitor'
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-purple-100 text-purple-700'
                }`}>
                  {order.sampleType === 'competitor' ? 'Competitor Sample' : 'Sample'}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSendPOModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Send className="w-4 h-4" />
              Send PO
            </motion.button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-8">
        <div className="max-w-[1400px] mx-auto space-y-6">
          {/* Main PO Details Card */}
          <motion.div
            ref={poContentRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600 rounded-3xl border-2 border-blue-400 shadow-2xl overflow-hidden relative"
          >
            {/* Blind Ship Badge - Top Left */}
            <AnimatePresence>
              {isBlindShip && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                  className="absolute top-4 left-4 z-20 flex items-center gap-2 px-4 py-2 bg-amber-500 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg border-2 border-amber-400"
                >
                  <ShieldAlert className="w-4 h-4" />
                  Blind Ship
                </motion.div>
              )}
            </AnimatePresence>

            {/* Header with Company Info */}
            <div className="relative px-8 py-10 overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-400/20 rounded-full blur-3xl" />

              <div className="relative flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-2xl"
                  >
                    <span className="text-3xl font-bold text-blue-600">AS</span>
                  </div>
                  <div>
                    {isEditingCompanyInfo ? (
                      <div className="space-y-1.5">
                        <input value={companyInfo.name} onChange={e => setCompanyInfo({...companyInfo, name: e.target.value})} className="bg-white/20 backdrop-blur-sm text-white text-xl font-bold rounded-lg px-2 py-1 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 w-64 placeholder:text-blue-200" placeholder="Company Name" />
                        <input value={companyInfo.address} onChange={e => setCompanyInfo({...companyInfo, address: e.target.value})} className="bg-white/20 backdrop-blur-sm text-blue-100 text-sm rounded-lg px-2 py-1 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 w-64 placeholder:text-blue-200" placeholder="Address" />
                        <input value={companyInfo.cityStateZip} onChange={e => setCompanyInfo({...companyInfo, cityStateZip: e.target.value})} className="bg-white/20 backdrop-blur-sm text-blue-100 text-sm rounded-lg px-2 py-1 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 w-64 placeholder:text-blue-200" placeholder="City, State ZIP" />
                        <div className="flex items-center gap-2">
                          <input value={companyInfo.phone} onChange={e => setCompanyInfo({...companyInfo, phone: e.target.value})} className="bg-white/20 backdrop-blur-sm text-blue-100 text-sm rounded-lg px-2 py-1 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 w-36 placeholder:text-blue-200" placeholder="(xxx) xxx-xxxx" />
                          <input value={companyInfo.website} onChange={e => setCompanyInfo({...companyInfo, website: e.target.value})} className="bg-white/20 backdrop-blur-sm text-blue-100 text-sm rounded-lg px-2 py-1 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 w-48 placeholder:text-blue-200" placeholder="website.com" />
                        </div>
                        <button onClick={() => { setIsEditingCompanyInfo(false); toast.success('Company info updated!'); }} className="mt-1 px-3 py-1 bg-white/30 text-white text-xs font-semibold rounded-lg hover:bg-white/40">Save</button>
                      </div>
                    ) : (
                      <div className="group relative">
                        <h2 className="text-2xl font-bold text-white mb-1">{companyInfo.name}</h2>
                        <p className="text-blue-100 text-sm">{companyInfo.address}</p>
                        <p className="text-blue-100 text-sm">{companyInfo.cityStateZip}</p>
                        <p className="text-blue-100 text-sm">{companyInfo.phone} &bull; {companyInfo.website}</p>
                        <button onClick={() => guardConfirmedEdit(() => setIsEditingCompanyInfo(true))} className="absolute -top-1 -right-8 p-1 bg-white/20 rounded-lg transition-opacity hover:bg-white/30 opacity-0 group-hover:opacity-100">
                          <Edit className="w-3.5 h-3.5 text-white" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-6 py-4 text-right shadow-xl">
                  <p className="text-xs font-semibold text-blue-600 mb-1">PURCHASE ORDER</p>
                  <p className="text-2xl font-bold text-slate-900">#{order.poNumber}</p>
                  {order.projectNumber && (
                    <div className="mt-1 flex justify-end">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${getProjectBadgeStaticClasses(order.projectNumber)}`}>
                        {order.projectNumber}
                      </span>
                    </div>
                  )}
                  <div className="mt-2 pt-2 border-t border-slate-200">
                    <p className="text-xs text-slate-600 mb-2">Date: <span className="font-semibold text-slate-900">{formatDateDisplay(order.poDate)}</span></p>
                    {/* Status Dropdown */}
                    <ModernDropdown
                      value={status}
                      onChange={handleStatusChange}
                      options={
                        order.isSample && order.sampleType === 'competitor'
                          ? ['Created', 'Submitted', 'Confirmed', 'Shipped', 'Delivered']
                          : ['Created', 'Submitted', 'Confirmed', 'In Production', 'Shipped', 'Delivered', 'Issue']
                      }
                    />
                    {missedInHandsDate && (
                      <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold shadow-lg shadow-red-200">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Missed In-Hands Date
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="bg-white p-8">
              <div className="grid grid-cols-2 gap-8 mb-8">
                {/* Vendor Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Vendor/Supplier</h3>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => guardConfirmedEdit(() => setShowVendorSelector(true))}
                      className="ml-auto p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Change vendor"
                    >
                      <Edit className="w-4 h-4 text-slate-400" />
                    </motion.button>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 group/vendor">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 text-lg mb-1">{vendor}</p>
                        {vendorAddress && (vendorAddress.street1 || vendorAddress.city) ? (
                          <>
                            {vendorAddress.street1 && <p className="text-sm text-slate-600">{vendorAddress.street1}{vendorAddress.street2 ? `, ${vendorAddress.street2}` : ''}</p>}
                            {vendorAddress.city && (
                              <p className="text-sm text-slate-600">{[vendorAddress.city, vendorAddress.state].filter(Boolean).join(', ')} {vendorAddress.zip}{vendorAddress.country ? `, ${vendorAddress.country}` : ''}</p>
                            )}
                          </>
                        ) : (
                          vendor !== 'No Vendor Selected' && <p className="text-xs text-slate-400 italic mt-1">No address on file</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        {vendorContactPerson && (
                          <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-lg border border-purple-200 flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {vendorContactPerson}
                          </span>
                        )}
                        {vendor !== 'No Vendor Selected' && vendorAllAddresses.length > 0 && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowVendorAddressEditor(true)}
                            className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors opacity-0 group-hover/vendor:opacity-100"
                            title="Change vendor address or contact"
                          >
                            <Edit className="w-3.5 h-3.5 text-slate-400" />
                          </motion.button>
                        )}
                      </div>
                    </div>
                    {vendorAddress?.label && (
                      <div className="mt-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-700">
                          {vendorAddress.label === 'Other' && vendorAddress.customLabel ? vendorAddress.customLabel : vendorAddress.label}
                        </span>
                        {vendorAddress.name && <span className="text-xs text-slate-500 ml-2">{vendorAddress.name}</span>}
                      </div>
                    )}
                  </div>
                </div>

                {/* Ship To Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Ship To</h3>
                    {additionalShipToAddresses.length > 0 && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                        {1 + additionalShipToAddresses.length} locations
                      </span>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => guardConfirmedEdit(() => {
                        setShipToEditorMode('add');
                        setEditingShipToIndex(null);
                        setShowShipToEditor(true);
                      })}
                      className="ml-auto px-3 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      + Add
                    </motion.button>
                  </div>
                  <div className="space-y-2">
                    {/* Primary address */}
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 group/addr">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-900 text-lg mb-1">{shipToAddress.name}</p>
                          <p className="text-sm text-slate-600">{shipToAddress.address}</p>
                          <p className="text-sm text-slate-600">{shipToAddress.city}, {shipToAddress.state} {shipToAddress.zip}, {shipToAddress.country}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          {shipToAddress.contact && (
                            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-lg border border-blue-200 flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {shipToAddress.contact}
                            </span>
                          )}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => guardConfirmedEdit(() => {
                              setShipToEditorMode('edit');
                              setEditingShipToIndex(null);
                              setShowShipToEditor(true);
                            })}
                            className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors opacity-0 group-hover/addr:opacity-100"
                          >
                            <Edit className="w-3.5 h-3.5 text-slate-400" />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                    {/* Additional addresses */}
                    {additionalShipToAddresses.map((addr, idx) => (
                      <div key={idx} className="bg-slate-50 rounded-xl p-4 border border-slate-200 group/addr">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-900 text-lg mb-1">{addr.name}</p>
                            {addr.address && <p className="text-sm text-slate-600">{addr.address}</p>}
                            {addr.city && (
                              <p className="text-sm text-slate-600">{addr.city}, {addr.state} {addr.zip}, {addr.country}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-2">
                            {addr.contact && (
                              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-lg border border-blue-200 flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {addr.contact}
                              </span>
                            )}
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => guardConfirmedEdit(() => {
                                setShipToEditorMode('edit');
                                setEditingShipToIndex(idx);
                                setShowShipToEditor(true);
                              })}
                              className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors opacity-0 group-hover/addr:opacity-100"
                            >
                              <Edit className="w-3.5 h-3.5 text-slate-400" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                const updated = additionalShipToAddresses.filter((_, i) => i !== idx);
                                setAdditionalShipToAddresses(updated);
                                persistField({
                                  shipToAddresses: [shipToAddress, ...updated],
                                });
                                toast.success('Address removed');
                              }}
                              className="p-1.5 hover:bg-red-100 rounded-lg transition-colors opacity-0 group-hover/addr:opacity-100"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-400" />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Additional Details Grid */}
              <div className="grid grid-cols-5 gap-6 mb-8">
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <p className="text-xs font-semibold text-blue-700">Contact{allContacts.length > 1 ? 's' : ''}</p>
                  </div>
                  {contact && contact !== 'Select...' ? (
                    <div>
                      <p className="text-sm font-medium text-slate-900 mb-0.5">{contact}</p>
                      {contactDetails.role && (
                        <p className="text-[11px] text-blue-600 font-medium">{contactDetails.role}</p>
                      )}
                      {contactDetails.email && (
                        <p className="text-xs text-slate-600">{contactDetails.email}</p>
                      )}
                      {contactDetails.phone && (
                        <p className="text-xs text-slate-600">{contactDetails.phone}</p>
                      )}
                      {/* Show additional contacts */}
                      {allContacts.length > 1 && allContacts.slice(1).map((c, idx) => (
                        <div key={idx} className="mt-2 pt-2 border-t border-blue-200">
                          <p className="text-sm font-medium text-slate-900">{c.name}</p>
                          {c.role && <p className="text-[11px] text-blue-600 font-medium">{c.role}</p>}
                          {c.address && <p className="text-[11px] text-slate-500">{c.address}</p>}
                        </div>
                      ))}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => guardConfirmedEdit(() => setShowContactSelector(true))}
                        className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-700"
                      >
                        + Edit
                      </motion.button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-slate-900">{contact}</p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => guardConfirmedEdit(() => setShowContactSelector(true))}
                        className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-700"
                      >
                        + Add
                      </motion.button>
                    </div>
                  )}
                </div>

                <div className={`rounded-xl p-4 border ${missedInHandsDate ? 'bg-red-50 border-red-300' : 'bg-amber-50 border-amber-200'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className={`w-4 h-4 ${missedInHandsDate ? 'text-red-600' : 'text-amber-600'}`} />
                    <p className={`text-xs font-semibold ${missedInHandsDate ? 'text-red-700' : 'text-amber-700'}`}>Ship Date</p>
                    {missedInHandsDate && (
                      <span className="ml-auto inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white animate-pulse">
                        LATE
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-slate-900">{formatDateDisplay(shipDate)}</p>
                  {missedInHandsDate && missedInHandsReason && (
                    <p className="text-[10px] text-red-600 mt-1 italic">Reason: {missedInHandsReason}</p>
                  )}
                  {(() => {
                    const isConfirmedOrBeyondLocal = ['Confirmed', 'In Production', 'Shipped', 'Delivered'].includes(status);
                    if (!isConfirmedOrBeyondLocal) {
                      return (
                        <p className="mt-2 text-[10px] font-medium text-slate-400 italic">
                          Confirm PO to set ship date
                        </p>
                      );
                    }
                    return (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowShipDateCalendar(true)}
                        className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-700"
                      >
                        {shipDate ? '+ Edit' : '+ Add'}
                      </motion.button>
                    );
                  })()}
                </div>

                <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-red-600" />
                    <p className="text-xs font-semibold text-red-700">In-Hands *</p>
                  </div>
                  <p className="text-sm font-medium text-slate-900">{formatDateDisplay(inHandsDate)}</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowInHandsCalendar(true)}
                    className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    {inHandsDate ? '+ Edit' : '+ Add'}
                  </motion.button>
                </div>

                <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="w-4 h-4 text-purple-600" />
                    <p className="text-xs font-semibold text-purple-700">Shipping</p>
                  </div>
                  <p className="text-sm font-medium text-slate-900">{shippingMethod}</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowShippingSelector(true)}
                    className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    {shippingMethod && shippingMethod !== 'Ground' && shippingMethod !== 'Not Set' ? '+ Edit' : '+ Add'}
                  </motion.button>
                </div>

                <div className="relative bg-green-50 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-green-600" />
                    <p className="text-xs font-semibold text-green-700">Payment Terms</p>
                  </div>
                  <p className="text-sm font-medium text-slate-900">{paymentTerms || 'Not set'}</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowPaymentTermsDropdown(!showPaymentTermsDropdown)}
                    className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    {paymentTerms ? '+ Edit' : '+ Add'}
                  </motion.button>
                  <AnimatePresence>
                    {showPaymentTermsDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="absolute z-20 top-full left-0 mt-1 w-56 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden"
                      >
                        {['Net 15', 'Net 30', 'Net 45', 'Net 60', 'Due on Receipt', 'Prepaid', 'COD', '50% Deposit'].map(term => (
                          <button
                            key={term}
                            onClick={async () => {
                              setPaymentTerms(term);
                              setShowPaymentTermsDropdown(false);
                              await persistField({ paymentTerms: term });
                            }}
                            className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                              paymentTerms === term ? 'bg-green-50 text-green-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {term}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Blind Ship & Carrier Account */}
              <div className={`rounded-xl p-4 border mb-8 transition-colors ${isBlindShip ? 'bg-amber-50 border-amber-300' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={isBlindShip}
                    onChange={(e) => {
                      setIsBlindShip(e.target.checked);
                      persistField({ isBlindShip: e.target.checked });
                    }}
                    className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                  />
                  <div className="flex items-center gap-2">
                    {isBlindShip && <ShieldAlert className="w-4 h-4 text-amber-600" />}
                    <span className={`text-sm font-semibold ${isBlindShip ? 'text-amber-800' : 'text-slate-700'}`}>Blind Ship</span>
                  </div>
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-sm text-slate-600">Carrier Account:</span>
                    {!isManualAccount ? (
                      <select
                        value={carrierAccount}
                        onChange={(e) => {
                          if (e.target.value === 'manual') {
                            setIsManualAccount(true);
                          } else {
                            setCarrierAccount(e.target.value);
                            persistField({ carrierAccount: e.target.value });
                          }
                        }}
                        className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="No carrier account">No carrier account</option>
                        <option value="Supplier's Account">Supplier's Account</option>
                        <option value="UPS-123456">UPS - 123456</option>
                        <option value="FedEx-789012">FedEx - 789012</option>
                        <option value="USPS-345678">USPS - 345678</option>
                        <option value="DHL-901234">DHL - 901234</option>
                        <option value="manual">Enter Manually...</option>
                      </select>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={manualAccountNumber}
                          onChange={(e) => setManualAccountNumber(e.target.value)}
                          placeholder="Enter account number"
                          className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => {
                            if (manualAccountNumber.trim()) {
                              const account = manualAccountNumber.trim();
                              setCarrierAccount(account);
                              setIsManualAccount(false);
                              setManualAccountNumber('');
                              persistField({ carrierAccount: account });
                              toast.success('Carrier account saved successfully!');
                            }
                          }}
                          className="px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setIsManualAccount(false);
                            setManualAccountNumber('');
                          }}
                          className="text-xs text-slate-600 hover:text-slate-900"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Line Items - Using EditableLineItemsTable Component */}
              <EditableLineItemsTable
                lineItems={lineItems}
                customLineItems={customLineItems}
                salesTaxRate={salesTaxRate}
                taxStatus={taxStatus}
                shippingCost={shippingCost}
                isEditingItems={isEditingItems}
                onLineItemsChange={(items) => {
                  setLineItems(items);
                  const sub = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
                  const cust = customLineItems.reduce((s, i) => s + (i.amount * (i.quantity || 1)), 0);
                  const newTotal = (sub + cust) * (1 + salesTaxRate);
                  persistField({ lineItems: items, total: newTotal });
                }}
                onCustomLineItemsChange={(items) => {
                  setCustomLineItems(items);
                  const sub = lineItems.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
                  const cust = items.reduce((s, i) => s + (i.amount * (i.quantity || 1)), 0);
                  const newTotal = (sub + cust) * (1 + salesTaxRate);
                  persistField({ customLineItems: items, total: newTotal });
                }}
                onSalesTaxRateChange={(rate) => {
                  setSalesTaxRate(rate);
                  persistField({ salesTaxRate: rate });
                }}
                onTaxStatusChange={(ts) => {
                  setTaxStatus(ts);
                  persistField({ taxStatus: ts });
                }}
                onShippingCostChange={(cost) => {
                  setShippingCost(cost);
                  persistField({ shippingCost: cost });
                }}
                onEditToggle={(editing: boolean) => {
                  if (editing) {
                    guardConfirmedEdit(() => setIsEditingItems(true));
                  } else {
                    setIsEditingItems(false);
                  }
                }}
              />

              {/* Artwork Details Section - Collapsible with Include Toggle */}
              <div className="mt-8 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                <div className="w-full px-6 py-4 flex items-center justify-between">
                  {/* Left side: Title + Expand toggle */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      onClick={() => artworkNeeded && setShowArtworkDetails(!showArtworkDetails)}
                      className={`flex items-center gap-2 ${!artworkNeeded ? 'opacity-50 cursor-default' : ''}`}
                    >
                      <FileText className={`w-5 h-5 ${artworkNeeded ? 'text-blue-600' : 'text-slate-400'}`} />
                      <h4 className={`text-sm font-bold ${artworkNeeded ? 'text-slate-900' : 'text-slate-400'}`}>Artwork Details</h4>
                      {artworkNeeded && (
                        <motion.div
                          animate={{ rotate: showArtworkDetails ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="ml-1"
                        >
                          <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </motion.div>
                      )}
                    </motion.button>

                    {!artworkNeeded && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-slate-200 text-slate-500 whitespace-nowrap"
                      >
                        No Artwork Required
                      </motion.span>
                    )}
                  </div>

                  {/* Right side: Controls */}
                  <div className="flex items-center gap-4 ml-4 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium whitespace-nowrap ${artworkNeeded ? 'text-blue-700' : 'text-slate-400'}`}>
                        {artworkNeeded ? 'Artwork Needed' : 'Not Needed'}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const next = !artworkNeeded;
                          setArtworkNeeded(next);
                          if (!next) {
                            setShowArtworkDetails(false);
                          } else {
                            setShowArtworkDetails(true);
                          }
                          toast.success(next
                            ? 'Artwork is required for this PO'
                            : 'Artwork marked as not required -- no decoration on this order'
                          );
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          artworkNeeded ? 'bg-blue-500' : 'bg-slate-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                            artworkNeeded ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {artworkNeeded && showArtworkDetails && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-slate-200"
                    >
                      <div className="p-6 space-y-4">
                        {/* Hidden file input for artwork upload */}
                        <input
                          ref={artworkFileInputRef}
                          type="file"
                          accept="image/*,.pdf,.ai,.eps,.svg"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setArtworkFile(file);
                              if (file.type.startsWith('image/')) {
                                const url = URL.createObjectURL(file);
                                setArtworkPreviewUrl(url);
                              } else {
                                setArtworkPreviewUrl(null);
                              }
                              // Also upload to S3
                              handleArtworkUpload(file);
                            }
                          }}
                        />

                        {/* === PROMPT MODE: Choose New or Past === */}
                        {artworkMode === 'prompt' && (
                          <div className="space-y-4">
                            <div className="text-center py-2">
                              <Palette className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                              <p className="text-sm font-semibold text-slate-700">How would you like to set up artwork?</p>
                              <p className="text-xs text-slate-500 mt-1">Create new decoration details or reuse from a past order</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <button
                                onClick={() => setArtworkMode('new')}
                                className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-cyan-400 hover:bg-cyan-50/50 transition-all group"
                              >
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                                  <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-sm font-semibold text-slate-800">New Artwork</span>
                                <span className="text-[11px] text-slate-500 text-center">Set up fresh decoration details &amp; upload files</span>
                              </button>
                              <button
                                onClick={() => setArtworkMode('past')}
                                className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/50 transition-all group"
                              >
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                                  <RotateCcw className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-sm font-semibold text-slate-800">From Past PO</span>
                                <span className="text-[11px] text-slate-500 text-center">Reuse artwork from a related project order</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {/* === PAST PO MODE: Select from related POs === */}
                        {artworkMode === 'past' && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-semibold text-slate-800">Select Past Purchase Order</p>
                              <button onClick={() => { setArtworkMode('prompt'); setSelectedPastPO(null); }} className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1">
                                <ArrowLeft className="w-3 h-3" /> Back
                              </button>
                            </div>
                            <p className="text-xs text-slate-500">Related POs from {order.project || 'this project'}</p>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                              {[
                                { po: 'PO-12402', desc: '8ft Table Throws -- Sublimation Print', date: '2025-01-15', logo: '14823 UM 8ft_table-throws_ver_jan_2025_art.pdf' },
                                { po: 'PO-12714', desc: '6ft Table Throws -- Sublimation Print', date: '2025-03-02', logo: '14823 UM 6ft_table-throws_mar_2025_art.pdf' },
                                { po: 'PO-11980', desc: 'Banner Stands -- Full Color Digital', date: '2024-11-20', logo: '14823 UM banner_stand_nov_2024_art.ai' },
                              ].map((item) => (
                                <button
                                  key={item.po}
                                  onClick={() => {
                                    setSelectedPastPO(item.po);
                                    setArtworkForm({
                                      proofRequired: 'None',
                                      logoName: item.logo,
                                      repeatLogo: true,
                                      logoLocation: 'Edge to Edge Sublimation Print',
                                      logoSize: 'as shown on template',
                                      colorOfLogo: 'full color',
                                      imprintType: 'Sublimation',
                                      decorationNotes: `Reorder From ${item.po}`,
                                    });
                                  }}
                                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                                    selectedPastPO === item.po
                                      ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500/20'
                                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                        selectedPastPO === item.po ? 'border-blue-500' : 'border-slate-300'
                                      }`}>
                                        {selectedPastPO === item.po && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                                      </div>
                                      <div>
                                        <p className="text-xs font-bold text-slate-800">{item.po}</p>
                                        <p className="text-[11px] text-slate-600">{item.desc}</p>
                                      </div>
                                    </div>
                                    <span className="text-[10px] text-slate-400">{item.date}</span>
                                  </div>
                                </button>
                              ))}
                            </div>
                            {selectedPastPO && (
                              <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-3"
                              >
                                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                                  <p className="text-xs font-semibold text-blue-900">
                                    <RotateCcw className="w-3 h-3 inline mr-1" />
                                    Decoration Notes: Reorder From {selectedPastPO}
                                  </p>
                                </div>
                                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                                  {[
                                    ['PROOF REQUIRED', artworkForm.proofRequired],
                                    ['LOGO NAME', artworkForm.logoName],
                                    ['REPEAT LOGO', artworkForm.repeatLogo ? 'YES' : 'NO'],
                                    ['LOGO LOCATION', artworkForm.logoLocation],
                                    ['LOGO SIZE', artworkForm.logoSize],
                                    ['COLOR OF LOGO', artworkForm.colorOfLogo],
                                    ['IMPRINT TYPE', artworkForm.imprintType],
                                  ].map(([label, value]) => (
                                    <div key={label as string} className="flex items-start">
                                      <span className="text-[11px] font-bold text-slate-600 w-32 flex-shrink-0">{label}</span>
                                      <span className="text-[11px] text-slate-700">{value}</span>
                                    </div>
                                  ))}
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      className="sr-only"
                                      checked={includeArtworkOnPO}
                                      onChange={(e) => setIncludeArtworkOnPO(e.target.checked)}
                                    />
                                    <div className={`w-8 h-[18px] rounded-full transition-colors relative ${includeArtworkOnPO ? 'bg-cyan-500' : 'bg-slate-300'}`}>
                                      <div className={`absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white shadow transition-transform ${includeArtworkOnPO ? 'translate-x-[17px]' : 'translate-x-[2px]'}`} />
                                    </div>
                                    <span className="text-xs text-slate-700 font-medium">Include on PO to vendor</span>
                                  </label>
                                  <button
                                    onClick={() => {
                                      const pastPOs = [
                                        { po: 'PO-12402', desc: '8ft Table Throws -- Sublimation Print', date: '2025-01-15', logo: '14823 UM 8ft_table-throws_ver_jan_2025_art.pdf' },
                                        { po: 'PO-12714', desc: '6ft Table Throws -- Sublimation Print', date: '2025-03-02', logo: '14823 UM 6ft_table-throws_mar_2025_art.pdf' },
                                        { po: 'PO-11980', desc: 'Banner Stands -- Full Color Digital', date: '2024-11-20', logo: '14823 UM banner_stand_nov_2024_art.ai' },
                                      ];
                                      const matched = pastPOs.find(p => p.po === selectedPastPO);
                                      if (matched) {
                                        setAppliedPastPO(matched);
                                        setArtworkMode('applied');
                                        toast.success(`Artwork applied from ${selectedPastPO}`);
                                      }
                                    }}
                                    className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs font-semibold rounded-lg hover:from-blue-700 hover:to-blue-600 shadow-sm transition-all"
                                  >
                                    Apply Artwork
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </div>
                        )}

                        {/* === APPLIED ARTWORK MODE: Saved view === */}
                        {artworkMode === 'applied' && appliedPastPO && (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                <p className="text-sm font-bold text-slate-900">Artwork Applied</p>
                                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-green-100 text-green-700 uppercase tracking-wide">Saved</span>
                              </div>
                              <button
                                onClick={() => {
                                  setArtworkMode('past');
                                  setSelectedPastPO(appliedPastPO.po);
                                }}
                                className="text-xs text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
                              >
                                <Edit className="w-3 h-3" /> Change
                              </button>
                            </div>

                            {/* Source PO Card */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <RotateCcw className="w-4 h-4 text-blue-600" />
                                  <span className="text-xs font-bold text-blue-900">Source: {appliedPastPO.po}</span>
                                </div>
                                <span className="text-[10px] text-blue-500 font-medium">{appliedPastPO.date}</span>
                              </div>
                              <p className="text-xs text-blue-800 font-medium">{appliedPastPO.desc}</p>
                            </div>

                            {/* Applied Artwork Details Grid */}
                            <div className="bg-white rounded-xl border border-slate-200 p-4">
                              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-3">Decoration Details</p>
                              <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                                {[
                                  ['Proof Required', artworkForm.proofRequired],
                                  ['Logo Name', artworkForm.logoName],
                                  ['Repeat Logo', artworkForm.repeatLogo ? 'Yes' : 'No'],
                                  ['Logo Location', artworkForm.logoLocation],
                                  ['Logo Size', artworkForm.logoSize],
                                  ['Color of Logo', artworkForm.colorOfLogo],
                                  ['Imprint Type', artworkForm.imprintType],
                                ].map(([label, value]) => (
                                  <div key={label as string} className="flex flex-col">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
                                    <span className="text-xs text-slate-800 font-medium mt-0.5">{value || '\u2014'}</span>
                                  </div>
                                ))}
                              </div>
                              {artworkForm.decorationNotes && (
                                <div className="mt-3 pt-3 border-t border-slate-100">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Decoration Notes</span>
                                  <p className="text-xs text-slate-800 font-medium mt-0.5">{artworkForm.decorationNotes}</p>
                                </div>
                              )}
                            </div>

                            {/* Include on PO toggle */}
                            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="sr-only"
                                  checked={includeArtworkOnPO}
                                  onChange={(e) => setIncludeArtworkOnPO(e.target.checked)}
                                />
                                <div className={`w-8 h-[18px] rounded-full transition-colors relative ${includeArtworkOnPO ? 'bg-cyan-500' : 'bg-slate-300'}`}>
                                  <div className={`absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white shadow transition-transform ${includeArtworkOnPO ? 'translate-x-[17px]' : 'translate-x-[2px]'}`} />
                                </div>
                                <span className="text-xs text-slate-700 font-medium">Include on PO to vendor</span>
                              </label>
                              <span className="text-[10px] text-green-600 font-semibold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Applied from {appliedPastPO.po}
                              </span>
                            </div>
                          </motion.div>
                        )}

                        {/* === NEW ARTWORK MODE: Full form === */}
                        {artworkMode === 'new' && (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                                <Sparkles className="w-4 h-4 text-cyan-500" />
                                New Artwork Details
                              </p>
                              <button onClick={() => { setArtworkMode('prompt'); setArtworkFile(null); setArtworkPreviewUrl(null); }} className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1">
                                <ArrowLeft className="w-3 h-3" /> Back
                              </button>
                            </div>

                            {/* Decoration Notes */}
                            <div>
                              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Decoration Notes</label>
                              <input
                                type="text"
                                value={artworkForm.decorationNotes}
                                onChange={(e) => setArtworkForm({ ...artworkForm, decorationNotes: e.target.value })}
                                placeholder="e.g. Match PMS colors exactly, bleed to edges..."
                                className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all"
                              />
                            </div>

                            {/* Form Grid */}
                            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                              <div>
                                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Proof Required</label>
                                <select
                                  value={artworkForm.proofRequired}
                                  onChange={(e) => setArtworkForm({ ...artworkForm, proofRequired: e.target.value })}
                                  className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all"
                                >
                                  <option value="None">None</option>
                                  <option value="Digital Proof">Digital Proof</option>
                                  <option value="Physical Proof">Physical Proof</option>
                                  <option value="Pre-Production Sample">Pre-Production Sample</option>
                                </select>
                              </div>

                              <div>
                                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Logo Name</label>
                                <input
                                  type="text"
                                  value={artworkForm.logoName}
                                  onChange={(e) => setArtworkForm({ ...artworkForm, logoName: e.target.value })}
                                  placeholder="Enter logo file name"
                                  className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all"
                                />
                              </div>

                              <div>
                                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Repeat Logo</label>
                                <div className="mt-1.5 flex items-center gap-2">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      className="sr-only"
                                      checked={artworkForm.repeatLogo}
                                      onChange={(e) => setArtworkForm({ ...artworkForm, repeatLogo: e.target.checked })}
                                    />
                                    <div className={`w-8 h-[18px] rounded-full transition-colors relative ${artworkForm.repeatLogo ? 'bg-cyan-500' : 'bg-slate-300'}`}>
                                      <div className={`absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white shadow transition-transform ${artworkForm.repeatLogo ? 'translate-x-[17px]' : 'translate-x-[2px]'}`} />
                                    </div>
                                    <span className="text-xs text-slate-700">{artworkForm.repeatLogo ? 'Yes' : 'No'}</span>
                                  </label>
                                </div>
                              </div>

                              <div>
                                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Logo Location</label>
                                <select
                                  value={artworkForm.logoLocation}
                                  onChange={(e) => setArtworkForm({ ...artworkForm, logoLocation: e.target.value })}
                                  className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all"
                                >
                                  <option value="">Select location...</option>
                                  <option value="Front Center">Front Center</option>
                                  <option value="Left Chest">Left Chest</option>
                                  <option value="Back Center">Back Center</option>
                                  <option value="Full Front">Full Front</option>
                                  <option value="Edge to Edge Sublimation Print">Edge to Edge Sublimation Print</option>
                                  <option value="Wrap Around">Wrap Around</option>
                                  <option value="Custom (see notes)">Custom (see notes)</option>
                                </select>
                              </div>

                              <div>
                                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Logo Size</label>
                                <input
                                  type="text"
                                  value={artworkForm.logoSize}
                                  onChange={(e) => setArtworkForm({ ...artworkForm, logoSize: e.target.value })}
                                  placeholder='e.g. 3.5" x 2.5" or as shown on template'
                                  className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all"
                                />
                              </div>

                              <div>
                                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Color of Logo</label>
                                <input
                                  type="text"
                                  value={artworkForm.colorOfLogo}
                                  onChange={(e) => setArtworkForm({ ...artworkForm, colorOfLogo: e.target.value })}
                                  placeholder="e.g. PMS 286C, full color, white"
                                  className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all"
                                />
                              </div>

                              <div className="col-span-2">
                                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Imprint Type</label>
                                <select
                                  value={artworkForm.imprintType}
                                  onChange={(e) => setArtworkForm({ ...artworkForm, imprintType: e.target.value })}
                                  className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all"
                                >
                                  <option value="Screen Print">Screen Print</option>
                                  <option value="Embroidery">Embroidery</option>
                                  <option value="Sublimation">Sublimation</option>
                                  <option value="Heat Transfer">Heat Transfer</option>
                                  <option value="Laser Engrave">Laser Engrave</option>
                                  <option value="Pad Print">Pad Print</option>
                                  <option value="Deboss">Deboss</option>
                                  <option value="UV Print">UV Print</option>
                                  <option value="Direct to Garment (DTG)">Direct to Garment (DTG)</option>
                                  <option value="Full Color Digital">Full Color Digital</option>
                                </select>
                              </div>
                            </div>

                            {/* Artwork File Upload */}
                            <div className="pt-2 border-t border-slate-200">
                              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-2 block">Artwork File</label>
                              {!artworkFile ? (
                                <button
                                  onClick={() => artworkFileInputRef.current?.click()}
                                  disabled={isUploadingArtwork}
                                  className="w-full p-6 border-2 border-dashed border-slate-300 rounded-xl hover:border-cyan-400 hover:bg-cyan-50/30 transition-all group flex flex-col items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-cyan-100 flex items-center justify-center transition-colors">
                                    {isUploadingArtwork ? (
                                      <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
                                    ) : (
                                      <Upload className="w-5 h-5 text-slate-400 group-hover:text-cyan-500 transition-colors" />
                                    )}
                                  </div>
                                  <span className="text-xs font-semibold text-slate-600 group-hover:text-cyan-700">
                                    {isUploadingArtwork ? 'Uploading...' : 'Click to upload artwork file'}
                                  </span>
                                  <span className="text-[10px] text-slate-400">PNG, JPG, PDF, AI, EPS, SVG accepted</span>
                                </button>
                              ) : (
                                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                                  {artworkPreviewUrl && (
                                    <div className="relative bg-[repeating-conic-gradient(#f1f5f9_0%_25%,#ffffff_0%_50%)] bg-[length:16px_16px] p-4 flex items-center justify-center border-b border-slate-200">
                                      <img
                                        src={artworkPreviewUrl}
                                        alt="Artwork preview"
                                        className="max-h-40 max-w-full object-contain rounded-md shadow-sm"
                                      />
                                    </div>
                                  )}
                                  <div className="p-3 flex items-center justify-between">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                                        {artworkPreviewUrl ? <Image className="w-4 h-4 text-white" /> : <FileText className="w-4 h-4 text-white" />}
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-xs font-semibold text-slate-800 truncate">{artworkFile.name}</p>
                                        <p className="text-[10px] text-slate-500">{(artworkFile.size / 1024).toFixed(1)} KB</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <button
                                        onClick={() => artworkFileInputRef.current?.click()}
                                        className="p-1.5 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-md transition-colors"
                                        title="Replace file"
                                      >
                                        <RotateCcw className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => { setArtworkFile(null); setArtworkPreviewUrl(null); }}
                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                        title="Remove file"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Artwork Files from S3 */}
                            {artworkFiles.length > 0 && (
                              <div className="pt-2 border-t border-slate-200">
                                <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-2">Uploaded Files</p>
                                <div className="space-y-2">
                                  {artworkFiles.map((af) => (
                                    <div key={af.id} className="flex items-center gap-2 text-xs text-slate-700">
                                      <Paperclip className="w-3 h-3 text-blue-500 flex-shrink-0" />
                                      <a
                                        href={af.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-medium text-blue-600 hover:underline truncate max-w-xs"
                                      >
                                        {af.name}
                                      </a>
                                      <span className="text-slate-400 ml-auto flex-shrink-0">{af.uploadedAt}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Include on PO toggle + Save */}
                            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="sr-only"
                                  checked={includeArtworkOnPO}
                                  onChange={(e) => setIncludeArtworkOnPO(e.target.checked)}
                                />
                                <div className={`w-8 h-[18px] rounded-full transition-colors relative ${includeArtworkOnPO ? 'bg-cyan-500' : 'bg-slate-300'}`}>
                                  <div className={`absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white shadow transition-transform ${includeArtworkOnPO ? 'translate-x-[17px]' : 'translate-x-[2px]'}`} />
                                </div>
                                <span className="text-xs text-slate-700 font-medium flex items-center gap-1">
                                  <Paperclip className="w-3 h-3" /> Include on PO email to vendor
                                </span>
                              </label>
                              <button
                                onClick={() => {
                                  persistField({ artworkForm, includeArtworkOnPO, artworkNeeded: true });
                                  toast.success('Artwork details saved');
                                }}
                                className="px-4 py-1.5 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white text-xs font-semibold rounded-lg hover:from-cyan-700 hover:to-cyan-600 shadow-sm transition-all"
                              >
                                Save Artwork
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Internal Notes Section */}
              <div className="mt-8 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 flex items-center justify-between border-b border-slate-200 bg-white">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    <h4 className="text-sm font-bold text-slate-900">Internal Notes</h4>
                    {notes.length > 0 && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                        {notes.length}
                      </span>
                    )}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowNoteInput(!showNoteInput)}
                    className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Note
                  </motion.button>
                </div>

                <div className="p-6">
                  {/* Note input */}
                  <AnimatePresence>
                    {showNoteInput && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mb-4 overflow-hidden"
                      >
                        <textarea
                          value={internalNote}
                          onChange={(e) => setInternalNote(e.target.value)}
                          placeholder="Write an internal note..."
                          rows={3}
                          className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-none"
                        />
                        <div className="flex items-center gap-2 mt-2">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleAddNote}
                            disabled={isAddingNote || !internalNote.trim()}
                            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {isAddingNote ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Send className="w-3 h-3" />
                                Save Note
                              </>
                            )}
                          </motion.button>
                          <button
                            onClick={() => { setShowNoteInput(false); setInternalNote(''); }}
                            className="text-xs text-slate-500 hover:text-slate-700 font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Notes list */}
                  {notes.length === 0 ? (
                    <p className="text-sm text-slate-400 italic text-center py-4">No internal notes yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {notes.map((note) => (
                        <div key={note.id} className="bg-white rounded-lg p-4 border border-slate-200 group">
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-sm text-slate-700 flex-1">{note.text}</p>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDeleteNote(note.id)}
                              disabled={isDeletingNote === note.id}
                              className="p-1 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0 disabled:opacity-50"
                            >
                              {isDeletingNote === note.id ? (
                                <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-red-500" />
                              )}
                            </motion.button>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs font-medium text-slate-600">{note.user}</span>
                            <span className="text-xs text-slate-400">{formatDate(note.date)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Questions Section */}
              <div className="mt-8 bg-slate-50 rounded-xl p-6 border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-slate-900">Questions about this purchase order?</h4>
                  {!isEditingFooterContact && (
                    <button onClick={() => guardConfirmedEdit(() => setIsEditingFooterContact(true))} className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors">
                      <Edit className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  )}
                </div>
                {isEditingFooterContact ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-1">First Name</label>
                        <input value={footerContact.firstName} onChange={e => setFooterContact({...footerContact, firstName: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="First Name" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-1">Email</label>
                        <input type="email" value={footerContact.email} onChange={e => setFooterContact({...footerContact, email: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="email@company.com" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-1">Phone (xxx) xxx-xxxx</label>
                        <input value={footerContact.phone} onChange={e => setFooterContact({...footerContact, phone: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="(305) 555-0123" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setIsEditingFooterContact(false); toast.success('Contact info updated!'); }} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700">Save</button>
                      <button onClick={() => setIsEditingFooterContact(false)} className="px-3 py-1.5 bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-300">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1 text-xs text-slate-700">
                    <p className="font-semibold">{footerContact.firstName}</p>
                    <p>{footerContact.email}</p>
                    <p>{footerContact.phone}</p>
                    <div className="mt-3 pt-3 border-t border-slate-300">
                      <p className="font-semibold">{companyInfo.name}</p>
                      <p>{companyInfo.address}</p>
                      <p>{companyInfo.cityStateZip}</p>
                      <p>United States</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modals */}
      <ContactSelector
        isOpen={showContactSelector}
        onClose={() => setShowContactSelector(false)}
        onSelectContact={(selectedContact) => {
          setContact(selectedContact.name);
          setContactDetails({ email: selectedContact.email, phone: selectedContact.phone });
          persistField({
            contact: selectedContact.name,
            contactDetails: { email: selectedContact.email, phone: selectedContact.phone },
          });
          // Also add to allContacts if not already present
          const alreadyExists = allContacts.some(c => c.name.trim().toLowerCase() === selectedContact.name.trim().toLowerCase());
          if (!alreadyExists) {
            const updated = [...allContacts, { name: selectedContact.name, role: (selectedContact as any).role || '', address: (selectedContact as any).address || '', fullAddress: (selectedContact as any).fullAddress || '' }];
            setAllContacts(updated);
            persistField({ contacts: updated });
          }
        }}
      />

      <ModernCalendar
        isOpen={showShipDateCalendar}
        onClose={() => setShowShipDateCalendar(false)}
        selectedDate={shipDate}
        onSelectDate={(date) => {
          // Check if ship date exceeds in-hands date -- prompt reason dialog instead of blocking
          if (inHandsDate) {
            const shipD = new Date(date);
            const inhD = new Date(inHandsDate);
            if (shipD.getTime() > inhD.getTime()) {
              setPendingShipDate(date);
              setShowShipDateCalendar(false);
              setShowMissedInHandsDialog(true);
              return;
            }
          }
          // If ship date is on or before in-hands, clear any previous missed flag
          setMissedInHandsDate(false);
          setMissedInHandsReason('');
          persistField({ missedInHandsDate: false, missedInHandsReason: '' });
          setShipDate(date);
          setShowShipDateCalendar(false);
          persistField({ shipDate: date });
        }}
        label="Select Ship Date"
      />

      <ModernCalendar
        isOpen={showInHandsCalendar}
        onClose={() => setShowInHandsCalendar(false)}
        selectedDate={inHandsDate}
        onSelectDate={(date) => {
          // Validate that In-Hands date is not before Ship Date
          if (shipDate) {
            const inhD = new Date(date);
            const shipD = new Date(shipDate);
            if (inhD.getTime() < shipD.getTime()) {
              toast.error('Error: In-Hands date cannot be earlier than Ship Date. Please select a later date.');
              return;
            }
          }
          setInHandsDate(date);
          setShowInHandsCalendar(false);
          persistField({ inHandsDate: date });
        }}
        label="Select In-Hands Date"
      />

      <ShippingMethodSelector
        isOpen={showShippingSelector}
        onClose={() => setShowShippingSelector(false)}
        selectedMethod={shippingMethod}
        onSelectMethod={(method) => {
          setShippingMethod(method.name);
          persistField({ shippingMethod: method.name });
        }}
      />

      {/* Vendor Selector Modal */}
      <VendorSelector
        isOpen={showVendorSelector}
        onClose={() => setShowVendorSelector(false)}
        selectedVendor={vendor}
        onSelectVendor={(selectedVendor) => {
          setVendor(selectedVendor.name);
          setVendorAddress(null);
          setVendorContactPerson('');
          persistField({ vendor: selectedVendor.name, vendorAddress: null, vendorContactPerson: '' });
          toast.success(`Vendor changed to ${selectedVendor.name}`);
        }}
      />

      {/* Vendor Address/Contact Editor Modal */}
      <AnimatePresence>
        {showVendorAddressEditor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowVendorAddressEditor(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Vendor Address & Contact</h3>
                  <p className="text-purple-200 text-sm">{vendor}</p>
                </div>
                <button onClick={() => setShowVendorAddressEditor(false)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
              <div className="p-6 space-y-5">
                {/* Address Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Select Address</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {vendorAllAddresses.length === 0 ? (
                      <p className="text-sm text-slate-400 italic py-3 text-center">No addresses on vendor profile</p>
                    ) : (
                      vendorAllAddresses.map((addr: any, idx: number) => {
                        const isSelected = vendorAddress?.street1 === addr.street1 && vendorAddress?.city === addr.city;
                        return (
                          <button
                            key={idx}
                            onClick={() => {
                              setVendorAddress(addr);
                              setVendorContactPerson(addr.contactPerson || vendorContactPerson);
                            }}
                            className={`w-full text-left p-3 rounded-xl border-2 transition-all ${isSelected ? 'bg-purple-50 border-purple-300 ring-1 ring-purple-200' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${isSelected ? 'bg-purple-100 text-purple-700' : 'bg-slate-200 text-slate-600'}`}>
                                {addr.label === 'Other' && addr.customLabel ? addr.customLabel : addr.label}
                              </span>
                              {addr.isPrimary && <span className="px-1.5 py-0.5 rounded-md text-xs font-bold bg-amber-100 text-amber-700">Primary</span>}
                              {addr.name && <span className="text-xs text-slate-500">{addr.name}</span>}
                              {isSelected && <CheckCircle2 className="w-4 h-4 text-purple-600 ml-auto" />}
                            </div>
                            <p className="text-sm text-slate-700">{[addr.street1, addr.street2].filter(Boolean).join(', ')}</p>
                            <p className="text-sm text-slate-500">{[addr.city, addr.state].filter(Boolean).join(', ')} {addr.zip}</p>
                            {addr.contactPerson && (
                              <p className="text-xs text-purple-600 mt-1 flex items-center gap-1"><User className="w-3 h-3" />{addr.contactPerson}</p>
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
                {/* Contact Person Override */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Contact Person</label>
                  <input
                    type="text"
                    value={vendorContactPerson}
                    onChange={e => setVendorContactPerson(e.target.value)}
                    placeholder="Enter contact person name"
                    className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all"
                  />
                  <p className="text-xs text-slate-400 mt-1">Override the contact person for this PO if different from the address default</p>
                </div>
              </div>
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowVendorAddressEditor(false);
                    persistField({ vendorAddress, vendorContactPerson });
                    toast.success('Vendor address updated');
                  }}
                  className="px-5 py-2.5 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors text-sm"
                >
                  Done
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Send PO Modal */}
      <SendPOModal
        isOpen={showSendPOModal}
        onClose={() => setShowSendPOModal(false)}
        onConfirm={(method, details) => {
          setShowSendPOModal(false);
          // Update status to "Submitted"
          const oldStatus = status;
          setStatus('Submitted');
          const newEvent: TimelineEvent = {
            id: String(timelineEvents.length + 1),
            date: new Date().toISOString(),
            title: 'PO Sent to Vendor',
            description: `Purchase Order sent via ${method}: ${details}`,
            user: user?.name ?? 'User',
            type: 'status_change'
          };
          const updatedTimeline = [...timelineEvents, newEvent];
          setTimelineEvents(updatedTimeline);
          persistField({ status: 'Submitted', timelineEvents: updatedTimeline });
          if (onStatusChange) {
            onStatusChange(order.id, 'Submitted');
          }
          toast.success('Purchase Order sent successfully!');
        }}
        poNumber={order.poNumber}
        vendorName={vendor}
        contactName={contact !== 'Select...' ? contact : ''}
        contactEmail={contactDetails.email || ''}
      />

      {/* Confirm PO Modal */}
      <ConfirmPOModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={(method, details) => {
          setShowConfirmModal(false);
          setStatus('Confirmed');
          const newEvent: TimelineEvent = {
            id: String(timelineEvents.length + 1),
            date: new Date().toISOString(),
            title: 'PO Confirmed',
            description: `Confirmed via ${method}: ${details}`,
            user: user?.name ?? 'User',
            type: 'status_change'
          };
          const updatedTimeline = [...timelineEvents, newEvent];
          setTimelineEvents(updatedTimeline);
          persistField({ status: 'Confirmed', timelineEvents: updatedTimeline });
          if (onStatusChange) {
            onStatusChange(order.id, 'Confirmed');
          }
          // Auto-prompt ship date picker after confirming PO
          if (!shipDate) {
            setTimeout(() => {
              setShowShipDateCalendar(true);
              toast.info('PO confirmed! Please select a ship date.');
            }, 400);
          }
        }}
        poNumber={order.poNumber}
      />

      {/* Create Shipment from PO Modal */}
      <CreateShipmentFromPOModal
        isOpen={showShipmentModal}
        onClose={() => {
          setShowShipmentModal(false);
        }}
        onConfirm={(shipments) => {
          setShowShipmentModal(false);
          setStatus('Shipped');
          const newEvents: TimelineEvent[] = (Array.isArray(shipments) ? shipments : [shipments]).map((s: any, idx: number) => ({
            id: String(timelineEvents.length + 1 + idx),
            date: new Date().toISOString(),
            title: 'Shipment Created',
            description: `${s.carrier || 'Carrier'} tracking: ${s.trackingNumber || s.masterTracking || s.proNumber || s.bolNumber || s.awbNumber || 'N/A'}${s.address?.name ? ` \u2192 ${s.address.name}` : ''}`,
            user: user?.name ?? 'User',
            type: 'status_change' as const,
          }));
          const updatedTimeline = [...timelineEvents, ...newEvents];
          setTimelineEvents(updatedTimeline);
          persistField({ status: 'Shipped', timelineEvents: updatedTimeline });
          if (onStatusChange) {
            const shipmentsArr = Array.isArray(shipments) ? shipments : [shipments];
            const trackingNumbers = shipmentsArr.map((s: any) => s.trackingNumber || s.masterTracking || s.proNumber || s.bolNumber || s.awbNumber || '').filter(Boolean);
            const carriers = shipmentsArr.map((s: any) => s.carrier).filter(Boolean);
            onStatusChange(order.id, 'Shipped', {
              carrier: carriers[0] || '',
              trackingNumber: trackingNumbers.join(', '),
            });
          }
          toast.success('Shipment created successfully!');
        }}
        poNumber={order.poNumber}
        shipToAddresses={[shipToAddress, ...additionalShipToAddresses]}
        vendor={vendor}
        customer={order.customer}
        poId={order.id}
        lineItems={lineItems}
        projectName={order.project || ''}
        projectNumber={(order as any).projectNumber || ''}
        shippingMethod={shippingMethod || ''}
        carrierAccount={carrierAccount || ''}
        sourceOrderNumber={(order as any).sourceOrderNumber || (order as any).linkedOrderNumber || ''}
      />

      {/* Submit PO Modal */}
      <SubmitPOModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        onConfirm={(method, details) => {
          setShowSubmitModal(false);
          setStatus('Submitted');
          const newEvent: TimelineEvent = {
            id: String(timelineEvents.length + 1),
            date: new Date().toISOString(),
            title: 'PO Submitted',
            description: `Submitted via ${method}: ${details}`,
            user: user?.name ?? 'User',
            type: 'status_change'
          };
          const updatedTimeline = [...timelineEvents, newEvent];
          setTimelineEvents(updatedTimeline);
          persistField({ status: 'Submitted', timelineEvents: updatedTimeline });
          if (onStatusChange) {
            onStatusChange(order.id, 'Submitted');
          }
        }}
        onSubmitAndConfirm={(submitMethod, submitDetails, confirmationNumber) => {
          setShowSubmitModal(false);
          setStatus('Confirmed');
          const submitEvent: TimelineEvent = {
            id: String(timelineEvents.length + 1),
            date: new Date().toISOString(),
            title: 'PO Submitted',
            description: `Submitted via ${submitMethod}: ${submitDetails}`,
            user: user?.name ?? 'User',
            type: 'status_change'
          };
          const confirmEvent: TimelineEvent = {
            id: String(timelineEvents.length + 2),
            date: new Date().toISOString(),
            title: 'PO Confirmed',
            description: `Confirmed via Online Order - Confirmation #: ${confirmationNumber}`,
            user: user?.name ?? 'User',
            type: 'status_change'
          };
          const updatedTimeline = [...timelineEvents, submitEvent, confirmEvent];
          setTimelineEvents(updatedTimeline);
          persistField({ status: 'Confirmed', timelineEvents: updatedTimeline });
          if (onStatusChange) {
            onStatusChange(order.id, 'Confirmed');
          }
          if (!shipDate) {
            setTimeout(() => {
              setShowShipDateCalendar(true);
              toast.info('PO submitted & confirmed! Please select a ship date.');
            }, 400);
          }
        }}
        poNumber={order.poNumber}
      />

      {/* Ship To Editor Modal */}
      <ShipToEditor
        isOpen={showShipToEditor}
        onClose={() => setShowShipToEditor(false)}
        mode={shipToEditorMode}
        currentAddress={
          shipToEditorMode === 'edit'
            ? (editingShipToIndex === null ? shipToAddress : additionalShipToAddresses[editingShipToIndex!])
            : undefined
        }
        onSave={(savedAddress) => {
          if (shipToEditorMode === 'add') {
            const newAdditional = [...additionalShipToAddresses, savedAddress];
            setAdditionalShipToAddresses(newAdditional);
            persistField({
              shipToAddresses: [shipToAddress, ...newAdditional],
            });
            toast.success(`Address "${savedAddress.name}" added`);
          } else {
            if (editingShipToIndex === null) {
              setShipToAddress(savedAddress);
              persistField({
                shipToAddresses: [savedAddress, ...additionalShipToAddresses],
              });
              toast.success('Primary address updated');
            } else {
              const updatedAdditional = [...additionalShipToAddresses];
              updatedAdditional[editingShipToIndex!] = savedAddress;
              setAdditionalShipToAddresses(updatedAdditional);
              persistField({
                shipToAddresses: [shipToAddress, ...updatedAdditional],
              });
              toast.success(`Address "${savedAddress.name}" updated`);
            }
          }
        }}
      />

      {/* Missed In-Hands Date Reason Dialog */}
      <MissedInHandsDialog
        isOpen={showMissedInHandsDialog}
        onClose={() => {
          setShowMissedInHandsDialog(false);
          setPendingShipDate(null);
        }}
        onConfirm={(reason) => {
          setShowMissedInHandsDialog(false);
          setMissedInHandsDate(true);
          setMissedInHandsReason(reason);
          if (pendingShipDate) {
            setShipDate(pendingShipDate);
            persistField({ shipDate: pendingShipDate });
            setPendingShipDate(null);
          }
          persistField({ missedInHandsDate: true, missedInHandsReason: reason });
          toast.warning('Ship date set -- PO flagged as Missed In-Hands Date.');
          const newEvent: TimelineEvent = {
            id: String(timelineEvents.length + 1),
            date: new Date().toISOString(),
            title: 'Missed In-Hands Date Flagged',
            description: `Ship date exceeds in-hands date. Reason: ${reason}`,
            user: user?.name ?? 'User',
            type: 'status_change'
          };
          const updatedTimeline = [...timelineEvents, newEvent];
          setTimelineEvents(updatedTimeline);
          persistField({ timelineEvents: updatedTimeline });
        }}
        shipDate={pendingShipDate || ''}
        inHandsDate={inHandsDate}
        poNumber={order.poNumber}
      />

      {/* Confirmed PO Edit Warning */}
      <AnimatePresence>
        {showConfirmedEditWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowConfirmedEditWarning(false);
              setConfirmedEditCallback(null);
            }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-5 flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">PO Has Been Confirmed</h3>
                  <p className="text-amber-100 text-sm">PO #{order.poNumber} -- Status: {status}</p>
                </div>
              </div>
              <div className="p-6">
                <p className="text-slate-700 text-sm mb-4">
                  This purchase order has already been confirmed with the vendor. Editing confirmed PO details may cause discrepancies with the vendor's records and the linked order.
                </p>
                <p className="text-slate-600 text-sm font-medium">Are you sure you want to make changes?</p>
              </div>
              <div className="bg-slate-50 px-6 py-4 flex items-center gap-3 border-t border-slate-200">
                <button
                  onClick={() => {
                    setShowConfirmedEditWarning(false);
                    setConfirmedEditCallback(null);
                  }}
                  className="flex-1 px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowConfirmedEditWarning(false);
                    setEditWarningDismissedForSession(true);
                    if (confirmedEditCallback) {
                      confirmedEditCallback();
                    }
                    setConfirmedEditCallback(null);
                  }}
                  className="flex-1 px-4 py-2.5 bg-amber-500 text-white rounded-lg text-sm font-semibold hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Yes, Edit Anyway
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
