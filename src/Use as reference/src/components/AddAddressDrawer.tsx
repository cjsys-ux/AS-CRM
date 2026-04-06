import { motion, AnimatePresence } from 'motion/react';
import { X, MapPin, Home, Building2, Save, Star, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner@2.0.3';

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
  'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
  'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
  'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
  'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
  'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
  'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
  'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
  'West Virginia', 'Wisconsin', 'Wyoming',
];

interface AddAddressDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (address: any) => void;
  addressData?: any | null;
  contacts?: any[];
}

export function AddAddressDrawer({ isOpen, onClose, onSuccess, addressData, contacts = [] }: AddAddressDrawerProps) {
  const [formData, setFormData] = useState({
    type: 'Shipping',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'United States',
    isPrimary: false,
    contactId: '',
  });

  useEffect(() => {
    if (addressData) {
      setFormData({
        type: addressData.type || 'Shipping',
        street: addressData.street || '',
        city: addressData.city || '',
        state: addressData.state || '',
        zip: addressData.zip || '',
        country: addressData.country || 'United States',
        isPrimary: addressData.isPrimary || false,
        contactId: addressData.contactId || '',
      });
    } else {
      setFormData({
        type: 'Shipping',
        street: '',
        city: '',
        state: '',
        zip: '',
        country: 'United States',
        isPrimary: false,
        contactId: '',
      });
    }
  }, [addressData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.street || !formData.city || !formData.state || !formData.zip) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newAddress = {
      id: addressData?.id || Date.now().toString(),
      ...formData,
    };

    onSuccess(newAddress);
    toast.success(addressData ? 'Address updated successfully' : 'Address added successfully');
    onClose();
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="bg-slate-800 px-8 py-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {addressData ? 'Edit Address' : 'Add New Address'}
                  </h2>
                  <p className="text-blue-100 text-sm">Customer address information</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </motion.button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-8 py-8 drawer-scroll">
              <div className="space-y-6">
                {/* Address Type */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Address Type <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setFormData({ ...formData, type: 'Shipping' })}
                      className={`flex items-center justify-center gap-3 px-6 py-4 rounded-2xl border-2 font-semibold transition-all ${
                        formData.type === 'Shipping'
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <Home className="w-5 h-5" />
                      Shipping
                    </motion.button>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setFormData({ ...formData, type: 'Billing' })}
                      className={`flex items-center justify-center gap-3 px-6 py-4 rounded-2xl border-2 font-semibold transition-all ${
                        formData.type === 'Billing'
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <Building2 className="w-5 h-5" />
                      Billing
                    </motion.button>
                  </div>
                </div>

                {/* Primary Address Toggle */}
                <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5">
                  <div 
                    className="flex items-center gap-4 cursor-pointer group"
                    onClick={() => setFormData({ ...formData, isPrimary: !formData.isPrimary })}
                  >
                    <div className="relative">
                      <div
                        className={`relative w-14 h-8 rounded-full transition-all ${
                          formData.isPrimary ? 'bg-amber-500' : 'bg-slate-300'
                        }`}
                      >
                        <motion.div
                          animate={{ x: formData.isPrimary ? 26 : 2 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center"
                        >
                          {formData.isPrimary && <Star className="w-3 h-3 text-amber-500" />}
                        </motion.div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900">Set as Primary Address</p>
                      <p className="text-sm text-slate-600">This will be the default address for this customer</p>
                    </div>
                  </div>
                </div>

                {/* Street Address */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                    placeholder="123 Main Street"
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="San Francisco"
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                  />
                </div>

                {/* State & ZIP */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      State <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                    >
                      <option value="">Select a state</option>
                      {US_STATES.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      ZIP Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.zip}
                      onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                      placeholder="94102"
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Country
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                  >
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="Mexico">Mexico</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Point of Contact */}
                {contacts && contacts.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      Point of Contact (POC)
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                      <select
                        value={formData.contactId}
                        onChange={(e) => setFormData({ ...formData, contactId: e.target.value })}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all appearance-none"
                      >
                        <option value="">No contact selected</option>
                        {contacts.map((contact) => (
                          <option key={contact.id} value={contact.id}>
                            {contact.firstName} {contact.lastName} {contact.email ? `(${contact.email})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      Select a contact person associated with this address
                    </p>
                  </div>
                )}
              </div>
            </form>

            {/* Footer */}
            <div className="border-t-2 border-slate-200 px-8 py-6 bg-slate-50">
              <div className="flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-4 bg-white border-2 border-slate-300 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 transition-all"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: '0 20px 40px rgba(59, 130, 246, 0.3)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2 hover:shadow-xl transition-all"
                >
                  <Save className="w-5 h-5" />
                  {addressData ? 'Update Address' : 'Add Address'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}