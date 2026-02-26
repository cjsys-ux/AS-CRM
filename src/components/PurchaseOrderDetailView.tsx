import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, X, Calendar, MapPin, User, Mail, Phone, Building2, 
  Clock, CheckCircle2, AlertCircle, Truck, FileText, MessageSquare,
  Upload, Download, Printer, MoreVertical, Plus, Edit, Trash2, Send
} from 'lucide-react';
import { useState } from 'react';
import { ContactSelector } from './ContactSelector';
import { ModernCalendar } from './ModernCalendar';
import { ShippingMethodSelector } from './ShippingMethodSelector';
import { EditableLineItemsTable } from './EditableLineItemsTable';
import { ModernDropdown } from './ModernDropdown';
import { ConfirmPOModal } from './ConfirmPOModal';
import { CreateShipmentFromPOModal } from './CreateShipmentFromPOModal';
import { toast } from 'sonner@2.0.3';

interface PurchaseOrder {
  id: string;
  poNumber: string;
  poDate: string;
  project: string;
  vendor: string;
  customer: string;
  status: string;
  shipDate: string | null;
  inHandsDate: string;
  total: number;
  priority: string;
  contact: string;
  createdAt?: string;
  isSample: boolean;
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
}

interface PurchaseOrderDetailViewProps {
  order: PurchaseOrder;
  onBack: () => void;
  onEdit: () => void;
  onStatusChange?: (orderId: string, newStatus: string) => void;
}

export function PurchaseOrderDetailView({ order, onBack, onEdit, onStatusChange }: PurchaseOrderDetailViewProps) {
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
  
  // Modal states
  const [showContactSelector, setShowContactSelector] = useState(false);
  const [showShipDateCalendar, setShowShipDateCalendar] = useState(false);
  const [showInHandsCalendar, setShowInHandsCalendar] = useState(false);
  const [showShippingSelector, setShowShippingSelector] = useState(false);
  const [showVendorSelector, setShowVendorSelector] = useState(false);
  const [showShipToEditor, setShowShipToEditor] = useState(false);
  
  // Data states
  const [contact, setContact] = useState(order.contact || 'Select...');
  const [contactDetails, setContactDetails] = useState<{ email?: string; phone?: string }>({});
  const [vendor, setVendor] = useState(order.vendor || 'No Vendor Selected');
  const [shipDate, setShipDate] = useState(order.shipDate);
  const [inHandsDate, setInHandsDate] = useState(order.inHandsDate);
  const [shippingMethod, setShippingMethod] = useState('Ground');
  const [carrierAccount, setCarrierAccount] = useState('No carrier account');
  const [isManualAccount, setIsManualAccount] = useState(false);
  const [manualAccountNumber, setManualAccountNumber] = useState('');
  const [shipToAddress, setShipToAddress] = useState<ShipToAddress>({
    name: 'Activate Swag Warehouse',
    address: '2726 NW 72nd Avenue',
    city: 'Miami',
    state: 'FL',
    zip: '33122',
    country: 'United States'
  });

  // Line items state
  const [lineItems, setLineItems] = useState([
    {
      id: '1',
      sku: '80022',
      vendor: 'TEST',
      size: 'Medium',
      color: 'Black',
      quantity: 1,
      unitPrice: 15.55,
    },
  ]);

  // Custom line items state (shipping, setup fee, etc.) - Empty by default
  const [customLineItems, setCustomLineItems] = useState<{ id: string; name: string; amount: number }[]>([]);

  const [salesTaxRate, setSalesTaxRate] = useState(0.07); // 7% tax
  const [taxStatus, setTaxStatus] = useState<'standard' | 'oos' | 'exempt'>('standard'); // Tax status

  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const customItemsTotal = customLineItems.reduce((sum, item) => sum + item.amount, 0);
  const subtotalWithCustom = subtotal + customItemsTotal;
  const salesTax = subtotalWithCustom * salesTaxRate;
  const total = subtotalWithCustom + salesTax;

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

  const handleStatusChange = (newStatus: string) => {
    const oldStatus = status;
    
    // Handle special status changes that need confirmation
    if (newStatus === 'Confirmed') {
      setShowConfirmModal(true);
      return; // Don't update status yet, wait for modal confirmation
    }
    
    if (newStatus === 'Shipped') {
      setShowShipmentModal(true);
      setStatus(newStatus); // Update status and show shipment modal
      return;
    }
    
    setStatus(newStatus);
    
    // Add timeline event for status change
    const newEvent: TimelineEvent = {
      id: String(timelineEvents.length + 1),
      date: new Date().toISOString(),
      title: 'Status Updated',
      description: `Status changed from ${oldStatus} to ${newStatus}`,
      user: 'Patrick Lowenthal',
      type: 'status_change'
    };
    setTimelineEvents([...timelineEvents, newEvent]);

    // Call the onStatusChange callback if provided
    if (onStatusChange) {
      onStatusChange(order.id, newStatus);
    }
  };

  const handleAddNote = () => {
    if (!internalNote.trim()) return;
    
    const newNote: Note = {
      id: String(notes.length + 1),
      text: internalNote,
      user: 'Patrick Lowenthal',
      date: new Date().toISOString()
    };
    
    setNotes([...notes, newNote]);
    setInternalNote('');
    setShowNoteInput(false);
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes(notes.filter(note => note.id !== noteId));
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
                <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-semibold rounded-full">
                  Sample
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600 rounded-3xl border-2 border-blue-400 shadow-2xl overflow-hidden"
          >
            {/* Header with Company Info */}
            <div className="relative px-8 py-10 overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-400/20 rounded-full blur-3xl" />
              
              <div className="relative flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-2xl"
                  >
                    <span className="text-3xl font-bold text-blue-600">AS</span>
                  </motion.div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Activate Swag</h2>
                    <p className="text-blue-100 text-sm">2726 NW 72nd Avenue</p>
                    <p className="text-blue-100 text-sm">Miami, FL 33122</p>
                    <p className="text-blue-100 text-sm">(305) 555-0123 • www.activateswag.com</p>
                  </div>
                </div>
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-6 py-4 text-right shadow-xl">
                  <p className="text-xs font-semibold text-blue-600 mb-1">PURCHASE ORDER</p>
                  <p className="text-2xl font-bold text-slate-900">#{order.poNumber}</p>
                  <div className="mt-2 pt-2 border-t border-slate-200">
                    <p className="text-xs text-slate-600 mb-2">Date: <span className="font-semibold text-slate-900">{order.poDate}</span></p>
                    {/* Status Dropdown */}
                    <ModernDropdown
                      value={status}
                      onChange={handleStatusChange}
                      options={['Created', 'Submitted', 'Sent', 'Confirmed', 'In Production', 'Shipped', 'Delivered', 'Issue']}
                    />
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
                      onClick={() => setShowVendorSelector(true)}
                      className="ml-auto p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4 text-slate-400" />
                    </motion.button>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <p className="font-bold text-slate-900 text-lg mb-1">{vendor}</p>
                    <p className="text-sm text-slate-600">{contact}</p>
                  </div>
                </div>

                {/* Ship To Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Ship To</h3>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowShipToEditor(true)}
                      className="ml-auto px-3 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      + Add
                    </motion.button>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <p className="font-bold text-slate-900 text-lg mb-1">{shipToAddress.name}</p>
                    <p className="text-sm text-slate-600">{shipToAddress.address}</p>
                    <p className="text-sm text-slate-600">{shipToAddress.city}, {shipToAddress.state} {shipToAddress.zip}, {shipToAddress.country}</p>
                  </div>
                </div>
              </div>

              {/* Additional Details Grid */}
              <div className="grid grid-cols-4 gap-6 mb-8">
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <p className="text-xs font-semibold text-blue-700">Contact</p>
                  </div>
                  {contact && contact !== 'Select...' ? (
                    <div>
                      <p className="text-sm font-medium text-slate-900 mb-1">{contact}</p>
                      {contactDetails.email && (
                        <p className="text-xs text-slate-600">{contactDetails.email}</p>
                      )}
                      {contactDetails.phone && (
                        <p className="text-xs text-slate-600">{contactDetails.phone}</p>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowContactSelector(true)}
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
                        onClick={() => setShowContactSelector(true)}
                        className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-700"
                      >
                        + Add
                      </motion.button>
                    </div>
                  )}
                </div>

                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-amber-600" />
                    <p className="text-xs font-semibold text-amber-700">Ship Date</p>
                  </div>
                  <p className="text-sm font-medium text-slate-900">{shipDate || 'Select'}</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowShipDateCalendar(true)}
                    className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    {shipDate ? '+ Edit' : '+ Add'}
                  </motion.button>
                </div>

                <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-red-600" />
                    <p className="text-xs font-semibold text-red-700">In-Hands *</p>
                  </div>
                  <p className="text-sm font-medium text-slate-900">{inHandsDate}</p>
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
                    {shippingMethod && shippingMethod !== 'Ground' ? '+ Edit' : '+ Add'}
                  </motion.button>
                </div>
              </div>

              {/* Blind Ship Notice */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-8">
                <div className="flex items-center gap-4">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600" />
                  <span className="text-sm font-medium text-slate-700">Blind Ship</span>
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
                          }
                        }}
                        className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="No carrier account">No carrier account</option>
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
                              setCarrierAccount(manualAccountNumber);
                              setIsManualAccount(false);
                              setManualAccountNumber('');
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
                isEditingItems={isEditingItems}
                onLineItemsChange={setLineItems}
                onCustomLineItemsChange={setCustomLineItems}
                onSalesTaxRateChange={setSalesTaxRate}
                onTaxStatusChange={setTaxStatus}
                onEditToggle={setIsEditingItems}
              />

              {/* Artwork Details Section - Collapsible */}
              <div className="mt-8 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                <motion.button
                  whileHover={{ backgroundColor: 'rgb(248 250 252)' }}
                  onClick={() => setShowArtworkDetails(!showArtworkDetails)}
                  className="w-full px-6 py-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <h4 className="text-sm font-bold text-slate-900">Artwork Details</h4>
                  </div>
                  <motion.div
                    animate={{ rotate: showArtworkDetails ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </motion.div>
                </motion.button>
                
                <AnimatePresence>
                  {showArtworkDetails && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-slate-200"
                    >
                      <div className="p-6 space-y-4">
                        {/* Decoration Notes */}
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                          <p className="text-sm font-semibold text-blue-900 mb-2">Decoration Notes: Reorder From PO# 12402-12714</p>
                        </div>

                        {/* Artwork Details Grid */}
                        <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                          <div className="flex items-start">
                            <span className="text-xs font-bold text-slate-700 w-40">PROOF REQUIRED</span>
                            <span className="text-xs text-slate-600">None</span>
                          </div>
                          <div className="flex items-start">
                            <span className="text-xs font-bold text-slate-700 w-40">LOGO NAME</span>
                            <span className="text-xs text-slate-600">14823 UM 8ft_table-throws_ver_jan_2025_art.pdf</span>
                          </div>
                          <div className="flex items-start">
                            <span className="text-xs font-bold text-slate-700 w-40">REPEAT LOGO</span>
                            <span className="text-xs text-slate-600">YES</span>
                          </div>
                          <div className="flex items-start">
                            <span className="text-xs font-bold text-slate-700 w-40">LOGO LOCATION</span>
                            <span className="text-xs text-slate-600">Edge to Edge Sublimation Print</span>
                          </div>
                          <div className="flex items-start">
                            <span className="text-xs font-bold text-slate-700 w-40">LOGO SIZE</span>
                            <span className="text-xs text-slate-600">as shown on template</span>
                          </div>
                          <div className="flex items-start">
                            <span className="text-xs font-bold text-slate-700 w-40">COLOR OF LOGO</span>
                            <span className="text-xs text-slate-600">full color</span>
                          </div>
                          <div className="flex items-start">
                            <span className="text-xs font-bold text-slate-700 w-40">IMPRINT TYPE</span>
                            <span className="text-xs text-slate-600">Sublimation</span>
                          </div>
                        </div>

                        {/* Artwork Preview - Optional */}
                        <div className="mt-4 pt-4 border-t border-slate-200">
                          <button className="text-xs text-blue-600 hover:text-blue-700 font-semibold">
                            + Upload Artwork File
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Questions Section */}
              <div className="mt-8 bg-slate-50 rounded-xl p-6 border border-slate-200">
                <h4 className="text-sm font-bold text-slate-900 mb-4">Questions about this purchase order?</h4>
                <div className="space-y-1 text-xs text-slate-700">
                  <p className="font-semibold">Liz Talampas</p>
                  <p>orders@activateswag.com</p>
                  <div className="mt-3 pt-3 border-t border-slate-300">
                    <p className="font-semibold">Activate Swag</p>
                    <p>2726 NW 72nd Ave</p>
                    <p>Miami, FL 33122</p>
                    <p>United States</p>
                  </div>
                </div>
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
        }}
      />

      <ModernCalendar
        isOpen={showShipDateCalendar}
        onClose={() => setShowShipDateCalendar(false)}
        selectedDate={shipDate}
        onSelectDate={(date) => {
          setShipDate(date);
        }}
        label="Select Ship Date"
      />

      <ModernCalendar
        isOpen={showInHandsCalendar}
        onClose={() => setShowInHandsCalendar(false)}
        selectedDate={inHandsDate}
        onSelectDate={(date) => {
          // Validate that In-Hands date is not before Ship Date
          if (shipDate && date < shipDate) {
            toast.error('Error: In-Hands date cannot be earlier than Ship Date. Please select a later date.');
            return;
          }
          setInHandsDate(date);
        }}
        label="Select In-Hands Date"
      />

      <ShippingMethodSelector
        isOpen={showShippingSelector}
        onClose={() => setShowShippingSelector(false)}
        selectedMethod={shippingMethod}
        onSelectMethod={(method) => {
          setShippingMethod(method.name);
        }}
      />

      {/* Send PO Modal */}
      <ConfirmPOModal
        isOpen={showSendPOModal}
        onClose={() => setShowSendPOModal(false)}
        onConfirm={(method, details) => {
          setShowSendPOModal(false);
          // Update status to "Sent"
          handleStatusChange('Sent');
          // Add timeline event with confirmation details
          const newEvent: TimelineEvent = {
            id: String(timelineEvents.length + 1),
            date: new Date().toISOString(),
            title: 'PO Sent to Vendor',
            description: `Purchase Order sent via ${method}: ${details}`,
            user: 'Patrick Lowenthal',
            type: 'status_change'
          };
          setTimelineEvents([...timelineEvents, newEvent]);
        }}
        poNumber={order.poNumber}
      />

      {/* Confirm PO Modal */}
      <ConfirmPOModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={(method, details) => {
          setShowConfirmModal(false);
          handleStatusChange('Confirmed');
          // Add timeline event with confirmation details
          const newEvent: TimelineEvent = {
            id: String(timelineEvents.length + 1),
            date: new Date().toISOString(),
            title: 'PO Confirmed',
            description: `Confirmed via ${method}: ${details}`,
            user: 'Patrick Lowenthal',
            type: 'status_change'
          };
          setTimelineEvents([...timelineEvents, newEvent]);
        }}
        poNumber={order.poNumber}
      />

      {/* Create Shipment from PO Modal */}
      <CreateShipmentFromPOModal
        isOpen={showShipmentModal}
        onClose={() => {
          setShowShipmentModal(false);
          handleStatusChange('Delivered');
        }}
        onConfirm={(trackingNumber, carrier) => {
          setShowShipmentModal(false);
          // Create shipment and update status
          console.log('Creating shipment:', { trackingNumber, carrier, poNumber: order.poNumber });
          alert(`Shipment created with tracking number: ${trackingNumber}`);
          // Add timeline event
          const newEvent: TimelineEvent = {
            id: String(timelineEvents.length + 1),
            date: new Date().toISOString(),
            title: 'Shipment Created',
            description: `Shipment created with ${carrier} tracking: ${trackingNumber}`,
            user: 'Patrick Lowenthal',
            type: 'status_change'
          };
          setTimelineEvents([...timelineEvents, newEvent]);
        }}
        poNumber={order.poNumber}
      />

    </div>
  );
}