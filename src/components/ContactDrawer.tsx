import { motion, AnimatePresence } from 'motion/react';
import { X, User, Mail, Phone, Building2, Briefcase, Globe, ChevronDown, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

interface ContactDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  contact?: any | null;
  onSave: (contact: any) => void;
}

// Country list with flags
const countries = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
];

export function ContactDrawer({ isOpen, onClose, contact, onSave }: ContactDrawerProps) {
  const isEditMode = !!contact;
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    type: 'Customer',
    country: 'United States',
    status: 'Active',
  });

  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  useEffect(() => {
    if (contact) {
      // Parse full name into first and last name
      const nameParts = contact.name?.split(' ') || ['', ''];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      setFormData({
        id: contact.id || '',
        firstName,
        lastName,
        email: contact.email || '',
        phone: contact.phone || '',
        company: contact.company || '',
        position: contact.position || '',
        type: contact.type || 'Customer',
        country: contact.country || 'United States',
        status: contact.status || 'Active',
      });
    } else {
      // Reset form for new contact
      setFormData({
        id: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        position: '',
        type: 'Customer',
        country: 'United States',
        status: 'Active',
      });
    }
  }, [contact, isOpen]);

  const formatPhoneNumber = (value: string) => {
    // Remove all non-numeric characters
    const phoneNumber = value.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX
    if (phoneNumber.length <= 3) {
      return phoneNumber;
    } else if (phoneNumber.length <= 6) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    } else {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
    }
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    setFormData(prev => ({ ...prev, phone: formatted }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    const name = `${formData.firstName} ${formData.lastName}`.trim();

    setIsSaving(true);
    try {
      if (isEditMode && formData.id) {
        // Update existing contact
        const res = await fetch('/api/contacts/update', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: formData.id,
            name,
            email: formData.email,
            phone: formData.phone,
            company: formData.company,
            position: formData.position,
            type: formData.type,
            country: formData.country,
            status: formData.status,
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? 'Failed to update contact');
        }
        toast.success('Contact updated');
        const { firstName: _f, lastName: _l, ...rest } = { ...formData, name };
        onSave({ ...rest, name });
      } else {
        // Create new contact
        const res = await fetch('/api/contacts/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            email: formData.email,
            phone: formData.phone,
            company: formData.company,
            position: formData.position,
            type: formData.type,
            country: formData.country,
            status: formData.status,
            createdBy: user?.sub ?? null,
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? 'Failed to create contact');
        }
        const data = await res.json();
        toast.success('Contact created');
        onSave(data.contact);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save contact');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getCountryFlag = (countryName: string) => {
    const country = countries.find(c => c.name === countryName);
    return country?.flag || '🌍';
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
            <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 px-8 py-8 flex items-center justify-between shadow-xl">
              <div className="flex items-center gap-5">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center shadow-2xl"
                >
                  <User className="w-8 h-8 text-white" />
                </motion.div>
                <div>
                  <motion.h2
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl font-black text-white mb-1"
                  >
                    {isEditMode ? 'Edit Contact' : 'New Contact'}
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-purple-50 font-medium"
                  >
                    Add a new contact to your directory
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
                {/* Basic Information Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-3xl p-8 shadow-xl border-2 border-slate-200"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900">Basic Information</h3>
                  </div>

                  <div className="space-y-6">
                    {/* First Name */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
                        <User className="w-4 h-4 text-indigo-600" />
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) => handleChange('firstName', e.target.value)}
                        placeholder="John"
                        className="w-full px-5 py-4 border-2 border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-base font-medium bg-slate-50/50"
                      />
                    </div>

                    {/* Last Name */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
                        <User className="w-4 h-4 text-indigo-600" />
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) => handleChange('lastName', e.target.value)}
                        placeholder="Smith"
                        className="w-full px-5 py-4 border-2 border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-base font-medium bg-slate-50/50"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
                        <Mail className="w-4 h-4 text-indigo-600" />
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="john.smith@company.com"
                        className="w-full px-5 py-4 border-2 border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-base font-medium bg-slate-50/50"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
                        <Phone className="w-4 h-4 text-indigo-600" />
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        placeholder="(407) 342-9035"
                        className="w-full px-5 py-4 border-2 border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-base font-medium bg-slate-50/50"
                      />
                    </div>

                    {/* Company Name */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
                        <Building2 className="w-4 h-4 text-indigo-600" />
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => handleChange('company', e.target.value)}
                        placeholder="Acme Corporation"
                        className="w-full px-5 py-4 border-2 border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-base font-medium bg-slate-50/50"
                      />
                    </div>

                    {/* Position / Title */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
                        <Briefcase className="w-4 h-4 text-indigo-600" />
                        Position / Title
                      </label>
                      <input
                        type="text"
                        value={formData.position}
                        onChange={(e) => handleChange('position', e.target.value)}
                        placeholder="Sales Manager"
                        className="w-full px-5 py-4 border-2 border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-base font-medium bg-slate-50/50"
                      />
                    </div>

                    {/* Country Dropdown with Flags */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
                        <Globe className="w-4 h-4 text-indigo-600" />
                        Country
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                          className="w-full px-5 py-4 border-2 border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-base font-medium bg-slate-50/50 flex items-center justify-between"
                        >
                          <span className="flex items-center gap-3">
                            <span className="text-2xl">{getCountryFlag(formData.country)}</span>
                            <span className="text-slate-700">{formData.country}</span>
                          </span>
                          <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${showCountryDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        
                        <AnimatePresence>
                          {showCountryDropdown && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute z-10 w-full mt-2 bg-white border-2 border-slate-300 rounded-2xl shadow-2xl max-h-64 overflow-y-auto"
                            >
                              {countries.map((country) => (
                                <button
                                  key={country.code}
                                  type="button"
                                  onClick={() => {
                                    handleChange('country', country.name);
                                    setShowCountryDropdown(false);
                                  }}
                                  className="w-full px-5 py-4 flex items-center gap-3 hover:bg-purple-50 transition-colors text-left font-medium"
                                >
                                  <span className="text-2xl">{country.flag}</span>
                                  <span className="text-slate-700">{country.name}</span>
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Contact Type - Only Customer and Vendor */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
                        <Building2 className="w-4 h-4 text-indigo-600" />
                        Contact Type
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                          className="w-full px-5 py-4 border-2 border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-slate-50/50 text-base font-medium text-slate-700 flex items-center justify-between"
                        >
                          <span className="text-slate-700">{formData.type}</span>
                          <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${showTypeDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        
                        <AnimatePresence>
                          {showTypeDropdown && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute z-10 w-full mt-2 bg-white border-2 border-slate-300 rounded-2xl shadow-2xl max-h-64 overflow-y-auto"
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  handleChange('type', 'Customer');
                                  setShowTypeDropdown(false);
                                }}
                                className="w-full px-5 py-4 flex items-center gap-3 hover:bg-purple-50 transition-colors text-left font-medium"
                              >
                                <span className="text-slate-700">Customer</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  handleChange('type', 'Vendor');
                                  setShowTypeDropdown(false);
                                }}
                                className="w-full px-5 py-4 flex items-center gap-3 hover:bg-purple-50 transition-colors text-left font-medium"
                              >
                                <span className="text-slate-700">Vendor</span>
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Status - Active or Inactive */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
                        <Briefcase className="w-4 h-4 text-indigo-600" />
                        Status
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                          className="w-full px-5 py-4 border-2 border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-slate-50/50 text-base font-medium text-slate-700 flex items-center justify-between"
                        >
                          <span className="text-slate-700">{formData.status}</span>
                          <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${showStatusDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        
                        <AnimatePresence>
                          {showStatusDropdown && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute z-10 w-full mt-2 bg-white border-2 border-slate-300 rounded-2xl shadow-2xl max-h-64 overflow-y-auto"
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  handleChange('status', 'Active');
                                  setShowStatusDropdown(false);
                                }}
                                className="w-full px-5 py-4 flex items-center gap-3 hover:bg-purple-50 transition-colors text-left font-medium"
                              >
                                <span className="text-slate-700">Active</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  handleChange('status', 'Inactive');
                                  setShowStatusDropdown(false);
                                }}
                                className="w-full px-5 py-4 flex items-center gap-3 hover:bg-purple-50 transition-colors text-left font-medium"
                              >
                                <span className="text-slate-700">Inactive</span>
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
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
                type="submit"
                whileHover={{ scale: isSaving ? 1 : 1.03 }}
                whileTap={{ scale: isSaving ? 1 : 0.97 }}
                onClick={handleSubmit}
                disabled={isSaving}
                className={`px-8 py-4 text-white font-bold text-base bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl hover:shadow-2xl transition-all shadow-lg flex items-center gap-2 ${isSaving ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <User className="w-5 h-5" />}
                {isSaving ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Add Contact')}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}