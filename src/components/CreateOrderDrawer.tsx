import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingCart, User, Mail, Package, DollarSign, Truck, Calendar, ChevronDown, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

interface CreateOrderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  order?: any | null;
  onSave: (order: any) => void;
}

const ORDER_STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const PAYMENT_STATUSES = ['Pending', 'Paid', 'Refunded'];
const SHIPPING_METHODS = ['Standard', 'Express', 'Overnight', 'Ground', 'Freight', 'Pickup'];

export function CreateOrderDrawer({ isOpen, onClose, order, onSave }: CreateOrderDrawerProps) {
  const isEditMode = !!order;
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    customer: '',
    email: '',
    status: 'Pending',
    paymentStatus: 'Pending',
    items: 1,
    total: '',
    shipping: 'Standard',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showPaymentDropdown, setShowPaymentDropdown] = useState(false);
  const [showShippingDropdown, setShowShippingDropdown] = useState(false);

  useEffect(() => {
    if (order) {
      setFormData({
        customer: order.customer ?? '',
        email: order.email ?? '',
        status: order.status ?? 'Pending',
        paymentStatus: order.paymentStatus ?? 'Pending',
        items: order.items ?? 1,
        total: order.total ?? '',
        shipping: order.shipping ?? 'Standard',
        date: order.date ?? new Date().toISOString().split('T')[0],
        notes: order.notes ?? '',
      });
    } else {
      setFormData({
        customer: '',
        email: '',
        status: 'Pending',
        paymentStatus: 'Pending',
        items: 1,
        total: '',
        shipping: 'Standard',
        date: new Date().toISOString().split('T')[0],
        notes: '',
      });
    }
  }, [order, isOpen]);

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    if (!formData.customer.trim() || !formData.email.trim()) {
      toast.error('Customer name and email are required.');
      return;
    }

    setIsSaving(true);
    try {
      if (isEditMode && order?.id) {
        const res = await fetch('/api/orders/update', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: order.id, ...formData }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? 'Failed to update order');
        }
        toast.success('Order updated');
        onSave({ ...order, ...formData });
      } else {
        const res = await fetch('/api/orders/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            createdBy: user?.sub ?? null,
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? 'Failed to create order');
        }
        const data = await res.json();
        toast.success('Order created');
        onSave(data.order);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save order');
    } finally {
      setIsSaving(false);
    }
  };

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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 35, stiffness: 350 }}
            className="fixed right-0 top-0 h-full w-full max-w-2xl bg-slate-50 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-8 flex items-center justify-between shadow-xl">
              <div className="flex items-center gap-5">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center shadow-2xl"
                >
                  <ShoppingCart className="w-8 h-8 text-white" />
                </motion.div>
                <div>
                  <motion.h2
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl font-black text-white mb-1"
                  >
                    {isEditMode ? 'Edit Order' : 'New Order'}
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-blue-50 font-medium"
                  >
                    {isEditMode ? 'Update order details' : 'Create a new customer order'}
                  </motion.p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-3 hover:bg-white/20 rounded-2xl transition-all"
              >
                <X className="w-7 h-7 text-white" />
              </motion.button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-8">
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Customer Information */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-3xl p-8 shadow-xl border-2 border-slate-200"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900">Customer Information</h3>
                  </div>
                  <div className="space-y-5">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                        <User className="w-4 h-4 text-blue-600" />
                        Customer Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.customer}
                        onChange={(e) => handleChange('customer', e.target.value)}
                        placeholder="e.g. Acme Corporation"
                        className="w-full px-5 py-4 border-2 border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base font-medium bg-slate-50/50"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                        <Mail className="w-4 h-4 text-blue-600" />
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="orders@acmecorp.com"
                        className="w-full px-5 py-4 border-2 border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base font-medium bg-slate-50/50"
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Order Details */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="bg-white rounded-3xl p-8 shadow-xl border-2 border-slate-200"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Package className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900">Order Details</h3>
                  </div>
                  <div className="space-y-5">

                    {/* Status */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                        Order Status
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => {
                            setShowStatusDropdown(!showStatusDropdown);
                            setShowPaymentDropdown(false);
                            setShowShippingDropdown(false);
                          }}
                          className="w-full px-5 py-4 border-2 border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-slate-50/50 text-base font-medium text-slate-700 flex items-center justify-between"
                        >
                          <span>{formData.status}</span>
                          <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${showStatusDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                          {showStatusDropdown && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute z-10 w-full mt-2 bg-white border-2 border-slate-300 rounded-2xl shadow-2xl overflow-hidden"
                            >
                              {ORDER_STATUSES.map((s) => (
                                <button
                                  key={s}
                                  type="button"
                                  onClick={() => { handleChange('status', s); setShowStatusDropdown(false); }}
                                  className="w-full px-5 py-4 text-left text-slate-700 font-medium hover:bg-blue-50 transition-colors"
                                >
                                  {s}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Payment Status */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                        <DollarSign className="w-4 h-4 text-blue-600" />
                        Payment Status
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => {
                            setShowPaymentDropdown(!showPaymentDropdown);
                            setShowStatusDropdown(false);
                            setShowShippingDropdown(false);
                          }}
                          className="w-full px-5 py-4 border-2 border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-slate-50/50 text-base font-medium text-slate-700 flex items-center justify-between"
                        >
                          <span>{formData.paymentStatus}</span>
                          <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${showPaymentDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                          {showPaymentDropdown && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute z-10 w-full mt-2 bg-white border-2 border-slate-300 rounded-2xl shadow-2xl overflow-hidden"
                            >
                              {PAYMENT_STATUSES.map((s) => (
                                <button
                                  key={s}
                                  type="button"
                                  onClick={() => { handleChange('paymentStatus', s); setShowPaymentDropdown(false); }}
                                  className="w-full px-5 py-4 text-left text-slate-700 font-medium hover:bg-blue-50 transition-colors"
                                >
                                  {s}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Items and Total */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                          <Package className="w-4 h-4 text-blue-600" />
                          Number of Items
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={formData.items}
                          onChange={(e) => handleChange('items', parseInt(e.target.value, 10) || 1)}
                          className="w-full px-5 py-4 border-2 border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base font-medium bg-slate-50/50"
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                          <DollarSign className="w-4 h-4 text-blue-600" />
                          Order Total
                        </label>
                        <input
                          type="text"
                          value={formData.total}
                          onChange={(e) => handleChange('total', e.target.value)}
                          placeholder="$0.00"
                          className="w-full px-5 py-4 border-2 border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base font-medium bg-slate-50/50"
                        />
                      </div>
                    </div>

                    {/* Order Date */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        Order Date
                      </label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => handleChange('date', e.target.value)}
                        className="w-full px-5 py-4 border-2 border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base font-medium bg-slate-50/50"
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Shipping */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-3xl p-8 shadow-xl border-2 border-slate-200"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Truck className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900">Shipping</h3>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                      Shipping Method
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          setShowShippingDropdown(!showShippingDropdown);
                          setShowStatusDropdown(false);
                          setShowPaymentDropdown(false);
                        }}
                        className="w-full px-5 py-4 border-2 border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-slate-50/50 text-base font-medium text-slate-700 flex items-center justify-between"
                      >
                        <span>{formData.shipping}</span>
                        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${showShippingDropdown ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {showShippingDropdown && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute z-10 w-full mt-2 bg-white border-2 border-slate-300 rounded-2xl shadow-2xl overflow-hidden"
                          >
                            {SHIPPING_METHODS.map((m) => (
                              <button
                                key={m}
                                type="button"
                                onClick={() => { handleChange('shipping', m); setShowShippingDropdown(false); }}
                                className="w-full px-5 py-4 text-left text-slate-700 font-medium hover:bg-blue-50 transition-colors"
                              >
                                {m}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>

                {/* Notes */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="bg-white rounded-3xl p-8 shadow-xl border-2 border-slate-200"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-slate-400 to-slate-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <ShoppingCart className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900">Notes</h3>
                  </div>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    placeholder="Optional order notes..."
                    rows={4}
                    className="w-full px-5 py-4 border-2 border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base font-medium bg-slate-50/50 resize-none"
                  />
                </motion.div>

              </form>
            </div>

            {/* Footer Actions */}
            <div className="border-t-2 border-slate-200 bg-white px-8 py-6 flex items-center justify-between shadow-xl">
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onClose}
                className="px-8 py-4 text-slate-700 font-bold text-base bg-slate-100 border-2 border-slate-300 rounded-2xl hover:bg-slate-200 transition-all shadow-lg"
              >
                Cancel
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ scale: isSaving ? 1 : 1.03 }}
                whileTap={{ scale: isSaving ? 1 : 0.97 }}
                onClick={handleSubmit}
                disabled={isSaving}
                className={`px-8 py-4 text-white font-bold text-base bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl hover:shadow-2xl transition-all shadow-lg flex items-center gap-2 ${isSaving ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShoppingCart className="w-5 h-5" />}
                {isSaving ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Create Order')}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
