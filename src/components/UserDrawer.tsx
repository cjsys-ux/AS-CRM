import { motion, AnimatePresence } from 'motion/react';
import { X, User, Mail, Phone, Shield, Calendar, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ModernDropdown } from './ModernDropdown';

interface UserDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'add' | 'edit';
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    created: string;
    phone?: string;
  };
  onSave?: (userData: any) => Promise<void>;
}

export function UserDrawer({ isOpen, onClose, mode, user, onSave }: UserDrawerProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'Sales Rep',
    status: 'Active',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [drawerError, setDrawerError] = useState('');

  // Reset form when user or open state changes
  useEffect(() => {
    setDrawerError('');
    setIsSubmitting(false);
    if (user) {
      setFormData({
        firstName: user.name.split(' ')[0] || '',
        lastName: user.name.split(' ').slice(1).join(' ') || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'Sales Rep',
        status: user.status || 'Active',
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: 'Sales Rep',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDrawerError('');
    setIsSubmitting(true);
    try {
      if (onSave) {
        await onSave(formData);
        // Parent is responsible for closing the drawer on success
      }
    } catch (err: unknown) {
      setDrawerError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
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
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 h-full w-[500px] bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header with gradient */}
            <div className="relative bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 px-8 py-6 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-400/20 rounded-full blur-2xl" />

              <div className="relative flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    {mode === 'add' ? 'Add New User' : 'Edit User'}
                  </h2>
                  <p className="text-blue-100 text-sm">
                    {mode === 'add'
                      ? 'Create a new user account'
                      : 'Update user information'}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors backdrop-blur-sm"
                >
                  <X className="w-6 h-6 text-white" />
                </motion.button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8">
              <div className="space-y-6">
                {/* Name field */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                    <User className="w-4 h-4" />
                    Full Name
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      placeholder="First Name"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      required
                    />
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      placeholder="Last Name"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                {/* Email field */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="user@company.com"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    required
                  />
                </div>

                {/* Phone field */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    placeholder="(123) 456 - 7890"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                {/* Role field */}
                <ModernDropdown
                  value={formData.role}
                  onChange={(value) => setFormData({ ...formData, role: value })}
                  options={['Sales Rep', 'Sales Manager', 'Super Admin']}
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
                  <div className="pt-4 border-t border-slate-200">
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">
                      Account Created
                    </label>
                    <p className="text-slate-600">{user.created}</p>
                  </div>
                )}

                {/* Error banner */}
                {drawerError && (
                  <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                    {drawerError}
                  </div>
                )}

                {/* Info box */}
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong>{' '}
                    {mode === 'add'
                      ? 'The user will receive an email invitation to set up their password.'
                      : 'Changes will take effect immediately.'}
                  </p>
                </div>
              </div>
            </form>

            {/* Footer */}
            <div className="px-8 py-6 border-t border-slate-200 bg-slate-50">
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-white border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                  whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {mode === 'add' ? 'Creating...' : 'Saving...'}
                    </>
                  ) : (
                    mode === 'add' ? 'Add User' : 'Save Changes'
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
