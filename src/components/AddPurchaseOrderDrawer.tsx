import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Calendar, Building2, User, DollarSign, Loader2, ShoppingCart, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

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
  isSample?: boolean;
}

interface AddPurchaseOrderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (order: PurchaseOrder) => void;
  createdBy?: string;
}

export function AddPurchaseOrderDrawer({
  isOpen,
  onClose,
  onSuccess,
  createdBy,
}: AddPurchaseOrderDrawerProps) {
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    poNumber: '',
    poDate: today,
    project: '',
    vendor: '',
    customer: '',
    status: 'Created',
    shipDate: '',
    inHandsDate: '',
    total: 0,
    priority: '1st Choice',
    contact: '',
    isSample: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingPoNumber, setIsLoadingPoNumber] = useState(false);

  const [vendors, setVendors] = useState<{ id: string; name: string }[]>([]);
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);
  const [vendorSearch, setVendorSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [vendorOpen, setVendorOpen] = useState(false);
  const [customerOpen, setCustomerOpen] = useState(false);

  const vendorRef = useRef<HTMLDivElement>(null);
  const customerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    setIsLoadingPoNumber(true);
    Promise.all([
      fetch('/api/purchasing/nextPoNumber').then((r) => r.json()),
      fetch('/api/vendors/list').then((r) => r.json()),
      fetch('/api/customers/list').then((r) => r.json()),
    ])
      .then(([poData, vendorData, customerData]) => {
        if (poData.poNumber) {
          setFormData((prev) => ({ ...prev, poNumber: poData.poNumber }));
        }
        if (Array.isArray(vendorData.vendors)) {
          setVendors(vendorData.vendors.map((v: { id: string; vendorName: string }) => ({ id: v.id, name: v.vendorName })));
        }
        if (Array.isArray(customerData.customers)) {
          setCustomers(customerData.customers.map((c: { id: string; name: string }) => ({ id: c.id, name: c.name })));
        }
      })
      .catch(() => toast.error('Failed to load form data'))
      .finally(() => setIsLoadingPoNumber(false));
  }, [isOpen]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (vendorRef.current && !vendorRef.current.contains(e.target as Node)) {
        setVendorOpen(false);
      }
      if (customerRef.current && !customerRef.current.contains(e.target as Node)) {
        setCustomerOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleClose = () => {
    setFormData({
      poNumber: '',
      poDate: today,
      project: '',
      vendor: '',
      customer: '',
      status: 'Created',
      shipDate: '',
      inHandsDate: '',
      total: 0,
      priority: '1st Choice',
      contact: '',
      isSample: false,
    });
    setVendorSearch('');
    setCustomerSearch('');
    setVendorOpen(false);
    setCustomerOpen(false);
    onClose();
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/purchasing/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          poNumber: formData.poNumber.trim(),
          shipDate: formData.shipDate || null,
          createdBy: createdBy ?? 'User',
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Failed to create purchase order');
      }

      const data = await res.json();
      const po = data.purchaseOrder;
      onSuccess({
        id: po.id ?? po._id?.toString(),
        poNumber: po.poNumber,
        poDate: po.poDate,
        project: po.project ?? '',
        vendor: po.vendor ?? '',
        customer: po.customer ?? '',
        status: po.status,
        shipDate: po.shipDate ?? null,
        inHandsDate: po.inHandsDate ?? '',
        total: po.total ?? 0,
        priority: po.priority ?? '1st Choice',
        contact: po.contact ?? '',
        isSample: po.isSample === true,
      });
      handleClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create purchase order');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredVendors = vendors.filter((v) =>
    v.name.toLowerCase().includes(vendorSearch.toLowerCase())
  );

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 h-full w-full md:w-[600px] bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-blue-500 via-sky-500 to-cyan-500 px-8 py-6 overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-400/20 rounded-full blur-2xl" />

              <div className="relative flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">New Purchase Order</h2>
                    <p className="text-blue-100 text-sm">Create a new purchase order</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleClose}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors backdrop-blur-sm"
                >
                  <X className="w-5 h-5 text-white" />
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8">
              <div className="space-y-6">
                {/* PO Number */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    PO Number
                  </label>
                  <div className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-mono flex items-center justify-between">
                    {isLoadingPoNumber ? (
                      <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                    ) : (
                      <span>{formData.poNumber || '—'}</span>
                    )}
                    <span className="text-xs text-slate-400">Auto-generated</span>
                  </div>
                </div>

                {/* PO Date */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    PO Date
                  </label>
                  <input
                    type="date"
                    value={formData.poDate}
                    onChange={(e) => setFormData({ ...formData, poDate: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Project */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Project</label>
                  <input
                    type="text"
                    value={formData.project}
                    onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                    placeholder="Project name"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Vendor */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    <Building2 className="w-4 h-4 inline mr-2" />
                    Vendor
                  </label>
                  <div className="relative" ref={vendorRef}>
                    <button
                      type="button"
                      onClick={() => { setVendorOpen(!vendorOpen); setVendorSearch(''); }}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-left flex items-center justify-between hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    >
                      <span className={formData.vendor ? 'text-slate-900' : 'text-slate-400'}>
                        {formData.vendor || 'Select vendor'}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${vendorOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {vendorOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-hidden flex flex-col">
                        <div className="p-2 border-b border-slate-100">
                          <input
                            autoFocus
                            value={vendorSearch}
                            onChange={(e) => setVendorSearch(e.target.value)}
                            placeholder="Search vendors..."
                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div className="overflow-y-auto">
                          {filteredVendors.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-slate-400">No vendors found</div>
                          ) : (
                            filteredVendors.map((v) => (
                              <button
                                key={v.id}
                                type="button"
                                onClick={() => { setFormData({ ...formData, vendor: v.name }); setVendorOpen(false); }}
                                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                              >
                                {v.name}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Customer */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Customer
                  </label>
                  <div className="relative" ref={customerRef}>
                    <button
                      type="button"
                      onClick={() => { setCustomerOpen(!customerOpen); setCustomerSearch(''); }}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-left flex items-center justify-between hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    >
                      <span className={formData.customer ? 'text-slate-900' : 'text-slate-400'}>
                        {formData.customer || 'Select customer'}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${customerOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {customerOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-hidden flex flex-col">
                        <div className="p-2 border-b border-slate-100">
                          <input
                            autoFocus
                            value={customerSearch}
                            onChange={(e) => setCustomerSearch(e.target.value)}
                            placeholder="Search customers..."
                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div className="overflow-y-auto">
                          {filteredCustomers.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-slate-400">No customers found</div>
                          ) : (
                            filteredCustomers.map((c) => (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => { setFormData({ ...formData, customer: c.name }); setCustomerOpen(false); }}
                                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                              >
                                {c.name}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Contact</label>
                  <input
                    type="text"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    placeholder="Contact name"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option>Created</option>
                    <option>Submitted</option>
                    <option>Confirmed</option>
                    <option>In Production</option>
                    <option>Shipped</option>
                    <option>Delivered</option>
                    <option>Issue</option>
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option>1st Choice</option>
                    <option>2nd Choice</option>
                    <option>3rd Choice</option>
                    <option>Backup</option>
                  </select>
                </div>

                {/* Ship Date */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Ship Date
                  </label>
                  <input
                    type="date"
                    value={formData.shipDate}
                    onChange={(e) => setFormData({ ...formData, shipDate: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* In-Hands Date */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    In-Hands Date
                  </label>
                  <input
                    type="date"
                    value={formData.inHandsDate}
                    onChange={(e) => setFormData({ ...formData, inHandsDate: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Total */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    <DollarSign className="w-4 h-4 inline mr-2" />
                    Total Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.total}
                    onChange={(e) => setFormData({ ...formData, total: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Is Sample */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isSample"
                    checked={formData.isSample}
                    onChange={(e) => setFormData({ ...formData, isSample: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="isSample" className="text-sm font-semibold text-slate-700 cursor-pointer">
                    This is a sample order
                  </label>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 p-6 bg-slate-50">
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleClose}
                  className="flex-1 px-6 py-3 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Create Purchase Order
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
