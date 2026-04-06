import { motion, AnimatePresence } from 'motion/react';
import { X, User, Mail, Phone, Building2, Briefcase, Globe, ChevronDown, Check } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

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

const CONTACT_TYPES = ['Customer', 'Vendor', 'Lead'];
const CONTACT_STATUSES = ['Active', 'Inactive', 'Prospect', 'Cold'];

// ─── Custom Dropdown (matching Vendor Drawer FormDropdown) ───
function FormDropdown({
  label,
  required,
  value,
  options,
  onChange,
  placeholder,
  accentColor = 'purple',
}: {
  label: string;
  required?: boolean;
  value: string;
  options: string[];
  onChange: (val: string) => void;
  placeholder?: string;
  accentColor?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const ringColor: Record<string, string> = {
    purple: 'ring-purple-500/30 border-purple-500',
    green: 'ring-green-500/30 border-green-500',
    orange: 'ring-orange-500/30 border-orange-500',
    teal: 'ring-teal-500/30 border-teal-500',
    blue: 'ring-blue-500/30 border-blue-500',
    pink: 'ring-pink-500/30 border-pink-500',
  };

  const checkColor: Record<string, string> = {
    purple: 'text-purple-600', green: 'text-green-600', orange: 'text-orange-600',
    teal: 'text-teal-600', blue: 'text-blue-600', pink: 'text-pink-600',
  };

  const hoverColor: Record<string, string> = {
    purple: 'bg-purple-50', green: 'bg-green-50', orange: 'bg-orange-50',
    teal: 'bg-teal-50', blue: 'bg-blue-50', pink: 'bg-pink-50',
  };

  const getStatusBadge = (opt: string) => {
    if (label !== 'Status') return null;
    const colors: Record<string, string> = {
      Active: 'bg-green-100 text-green-700',
      Inactive: 'bg-slate-100 text-slate-600',
      Prospect: 'bg-amber-100 text-amber-700',
      Cold: 'bg-blue-100 text-blue-700',
    };
    return colors[opt] || null;
  };

  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={`w-full flex items-center justify-between px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 transition-all ${open ? `ring-2 ${ringColor[accentColor] || ringColor.purple}` : ''}`}
        >
          <span className={value ? 'text-slate-900' : 'text-slate-400'}>
            {value || placeholder || `Select ${label.toLowerCase()}`}
          </span>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.12 }}
              className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl border border-slate-200 shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto"
            >
              <div className="py-1">
                {options.map((opt) => {
                  const badge = getStatusBadge(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => { onChange(opt); setOpen(false); }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium transition-colors ${
                        value === opt
                          ? `${hoverColor[accentColor] || hoverColor.purple} font-semibold`
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {badge ? (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${badge}`}>
                            {opt}
                          </span>
                        ) : (
                          opt
                        )}
                      </span>
                      {value === opt && <Check className={`w-4 h-4 ${checkColor[accentColor] || checkColor.purple}`} />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function ContactDrawer({ isOpen, onClose, contact, onSave }: ContactDrawerProps) {
  const isEditMode = !!contact;
  
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
    owner: '',
  });

  useEffect(() => {
    if (contact) {
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
        owner: (contact as any).owner || '',
      });
    } else {
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
        owner: '',
      });
    }
  }, [contact, isOpen]);

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    if (digits.length === 0) return '';
    if (digits.length <= 3) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)} - ${digits.slice(6)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData(prev => ({ ...prev, phone: formatted }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName.trim()) {
      return;
    }
    
    const contactData = {
      ...formData,
      name: `${formData.firstName} ${formData.lastName}`.trim(),
    };
    
    const { firstName, lastName, ...finalData } = contactData;
    
    onSave(finalData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
            className="fixed right-0 top-0 h-full w-full md:w-[520px] bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 px-5 py-4 flex items-center justify-between shadow-xl shrink-0">
              <div className="flex items-center gap-3">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center shadow-lg"
                >
                  <User className="w-5 h-5 text-white" />
                </motion.div>
                <div>
                  <h2 className="text-lg font-black text-white">
                    {isEditMode ? 'Edit Contact' : 'Add New Contact'}
                  </h2>
                  <p className="text-purple-100 text-xs">
                    {isEditMode ? 'Update contact information' : 'Add a new contact to your directory'}
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-all"
              >
                <X className="w-5 h-5 text-white" />
              </motion.button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4 drawer-scroll">
              <form id="contact-form" onSubmit={handleSubmit} className="space-y-5">
                {/* Basic Information */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          First Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.firstName}
                          onChange={(e) => handleChange('firstName', e.target.value)}
                          placeholder="John"
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Last Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.lastName}
                          onChange={(e) => handleChange('lastName', e.target.value)}
                          placeholder="Doe"
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all"
                        />
                      </div>
                    </div>

                    <FormDropdown
                      label="Status"
                      value={formData.status}
                      options={CONTACT_STATUSES}
                      onChange={(val) => handleChange('status', val)}
                      accentColor="purple"
                    />

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Owner</label>
                      <input
                        type="text"
                        value={formData.owner}
                        onChange={(e) => handleChange('owner', e.target.value)}
                        placeholder="e.g. Mitch Slater"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all"
                      />
                      <p className="text-[11px] text-slate-400 mt-0.5">Assigns visibility of this contact to a specific user</p>
                    </div>
                  </div>
                </motion.div>

                {/* Contact Information */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                          placeholder="contact@company.com"
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={handlePhoneChange}
                          placeholder="(555) 123 - 4567"
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Business Details */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name</label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => handleChange('company', e.target.value)}
                        placeholder="Acme Corporation"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Position / Title</label>
                      <input
                        type="text"
                        value={formData.position}
                        onChange={(e) => handleChange('position', e.target.value)}
                        placeholder="Sales Manager"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <FormDropdown
                        label="Contact Type"
                        value={formData.type}
                        options={CONTACT_TYPES}
                        onChange={(val) => handleChange('type', val)}
                        accentColor="orange"
                      />
                      <FormDropdown
                        label="Country"
                        value={formData.country}
                        options={countries.map(c => c.name)}
                        onChange={(val) => handleChange('country', val)}
                        accentColor="pink"
                      />
                    </div>
                  </div>
                </motion.div>
              </form>
            </div>

            {/* Fixed Footer Buttons */}
            <div className="shrink-0 px-5 py-3 bg-white border-t border-slate-200 flex gap-3">
              <motion.button
                type="button"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={onClose}
                className="flex-1 px-5 py-2.5 bg-slate-100 border border-slate-300 hover:bg-slate-200 rounded-xl text-sm font-bold text-slate-700 transition-all"
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                form="contact-form"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="flex-1 px-5 py-2.5 bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl text-sm font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {isEditMode ? 'Update Contact' : 'Create Contact'}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}