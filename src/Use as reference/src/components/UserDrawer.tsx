import { motion, AnimatePresence } from 'motion/react';
import { X, User, Mail, Phone, Shield, Calendar, Briefcase } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { ModernDropdown } from './ModernDropdown';

interface UserDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'add' | 'edit';
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
    status: string;
    created: string;
    phone?: string;
    title?: string;
  };
  onSave?: (userData: any) => void;
}

export function UserDrawer({ isOpen, onClose, mode, user, onSave }: UserDrawerProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    title: '',
    role: 'Standard',
    status: 'Active',
  });

  // Update form data when user prop changes
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.name.split(' ')[0] || '',
        lastName: user.name.split(' ').slice(1).join(' ') || '',
        email: user.email || '',
        phone: user.phone || '',
        title: (user as any).title || '',
        role: user.role || 'Standard',
        status: user.status || 'Active',
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        title: '',
        role: 'Standard',
        status: 'Active',
      });
    }
  }, [user, isOpen]);

  const formatPhoneNumber = (value: string) => {
    const phoneNumber = value.replace(/[^\d]/g, '');
    const phoneNumberLength = phoneNumber.length;
    
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)} - ${phoneNumber.slice(6, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData({ ...formData, phone: formatted });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Submitting:', formData);
    if (onSave) {
      onSave(formData);
    }
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
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 h-full w-[420px] bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-br from-slate-800 via-slate-800 to-slate-700 px-6 py-4 overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
              
              <div className="relative flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">
                    {mode === 'add' ? 'Add New User' : 'Edit User'}
                  </h2>
                  <p className="text-slate-400 text-xs">
                    {mode === 'add'
                      ? 'Create a new user account'
                      : 'Update user information'}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors backdrop-blur-sm"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 drawer-scroll">
              <div className="space-y-4">
                {/* Name field */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
                    <User className="w-3.5 h-3.5" />
                    Full Name
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      placeholder="First Name"
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      required
                    />
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      placeholder="Last Name"
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Email field */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="user@company.com"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    required
                  />
                </div>

                {/* Phone field */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
                    <Phone className="w-3.5 h-3.5" />
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    placeholder="(123) 456 - 7890"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                {/* Title/Position field */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
                    <Briefcase className="w-3.5 h-3.5" />
                    Title / Position
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Account Executive"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                {/* Role field */}
                <ModernDropdown
                  value={formData.role}
                  onChange={(value) => setFormData({ ...formData, role: value })}
                  options={(() => {
                    try {
                      const stored = localStorage.getItem('crm-user-roles');
                      if (stored) {
                        const parsed = JSON.parse(stored);
                        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
                      }
                    } catch {}
                    return ['Standard', 'Manager', 'Admin'];
                  })()}
                  icon={<Shield className="w-4 h-4" />}
                  label="Role"
                />

                {/* Status field */}
                <ModernDropdown
                  value={formData.status}
                  onChange={(value) => setFormData({ ...formData, status: value })}
                  options={['Active', 'Inactive']}
                  icon={<Calendar className="w-4 h-4" />}
                  label="Status"
                />

                {mode === 'edit' && user && (
                  <div className="pt-3 border-t border-slate-200">
                    <label className="text-xs font-semibold text-slate-700 mb-1 block">
                      Account Created
                    </label>
                    <p className="text-sm text-slate-600">{user.created}</p>
                  </div>
                )}

                {/* Info box */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                  <p className="text-xs text-blue-800">
                    <strong>Note:</strong> {mode === 'add' ? 'The user will receive an email invitation to set up their password.' : 'Changes will take effect immediately.'}
                  </p>
                </div>
              </div>
            </form>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-slate-200 bg-slate-50">
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 text-sm bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  onClick={handleSubmit}
                  className="flex-1 px-4 py-2.5 text-sm bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg shadow-sm shadow-blue-500/30 transition-all"
                >
                  {mode === 'add' ? 'Add User' : 'Save Changes'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}