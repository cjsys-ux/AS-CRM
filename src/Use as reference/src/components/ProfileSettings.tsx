import { motion, AnimatePresence } from 'motion/react';
import { User, Mail, Phone, Briefcase, Building2, Camera, Save, Edit3, Key, X, Check, Shield, Monitor, Smartphone, MapPin, Clock, QrCode, AlertCircle } from 'lucide-react';
import { useState, useRef } from 'react';
import { TimezonePicker } from './TimezonePicker';
import { Toast } from './Toast';
import { UserProfile } from '../App';
import { SetupAuthenticatorModal } from './SetupAuthenticatorModal';
import { SetupSMSModal } from './SetupSMSModal';

interface ProfileSettingsProps {
  userProfile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
}

export function ProfileSettings({ userProfile, onUpdate }: ProfileSettingsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [activeSection, setActiveSection] = useState<'profile' | 'twoFactor' | 'password'>('profile');
  const [formData, setFormData] = useState<UserProfile>(userProfile);
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAuthenticatorModalOpen, setIsAuthenticatorModalOpen] = useState(false);
  const [isSMSModalOpen, setIsSMSModalOpen] = useState(false);

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 6) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    } else {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData({ ...formData, phone: formatted });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profileImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onUpdate(formData);
    setIsEditing(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleCancel = () => {
    setFormData(userProfile);
    setIsEditing(false);
  };

  const getInitials = () => {
    return `${formData.firstName.charAt(0)}${formData.lastName.charAt(0)}`.toUpperCase();
  };

  const renderRightContent = () => {
    switch (activeSection) {
      case 'twoFactor':
        return (
          <motion.div
            key="twoFactor"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-xl shadow-sm p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Two-Factor Authentication</h3>
                <p className="text-xs text-slate-600 mt-0.5">Add an extra layer of security to your account</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveSection('profile')}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </motion.button>
            </div>

            {/* 2FA Status */}
            <div className="mb-5 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm text-slate-900 mb-0.5">Two-Factor Authentication is Disabled</h4>
                  <p className="text-xs text-slate-600">
                    Protect your account by enabling two-factor authentication. You'll need to enter a code from your phone in addition to your password when signing in.
                  </p>
                </div>
              </div>
            </div>

            {/* Setup Options */}
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-slate-900">Choose Authentication Method</h4>
              
              {/* Authenticator App */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="p-4 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:border-blue-400 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
                    <QrCode className="w-4 h-4 text-slate-700" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-bold text-sm text-slate-900 mb-0.5">Authenticator App (Recommended)</h5>
                    <p className="text-xs text-slate-600 mb-2">
                      Use an authentication app like Google Authenticator or Authy to generate verification codes.
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsAuthenticatorModalOpen(true)}
                      className="px-4 py-2 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-600 transition-all"
                    >
                      Set Up Authenticator
                    </motion.button>
                  </div>
                </div>
              </motion.div>

              {/* SMS */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="p-4 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:border-blue-400 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
                    <Smartphone className="w-4 h-4 text-slate-700" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-bold text-sm text-slate-900 mb-0.5">SMS Text Message</h5>
                    <p className="text-xs text-slate-600 mb-2">
                      Receive verification codes via SMS to your registered phone number.
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsSMSModalOpen(true)}
                      className="px-4 py-2 bg-slate-200 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-300 transition-all"
                    >
                      Set Up SMS
                    </motion.button>
                  </div>
                </div>
              </motion.div>

              {/* Backup Codes Notice */}
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-amber-900">Don't forget backup codes</p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    After enabling 2FA, make sure to save your backup codes in a safe place. You'll need them if you lose access to your authentication method.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'password':
        return (
          <motion.div
            key="password"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-xl shadow-sm p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Reset Password</h3>
                <p className="text-xs text-slate-600 mt-0.5">Update your password to keep your account secure</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveSection('profile')}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </motion.button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.current}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, current: e.target.value })
                  }
                  placeholder="Enter current password"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.new}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, new: e.target.value })
                  }
                  placeholder="Enter new password"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
                <p className="mt-1 text-[10px] text-slate-500">
                  Password must be at least 8 characters with uppercase, lowercase, number, and special character.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirm}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirm: e.target.value })
                  }
                  placeholder="Confirm new password"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveSection('profile')}
                  className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-all"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-4 py-2.5 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-all shadow-lg"
                >
                  Update Password
                </motion.button>
              </div>
            </div>
          </motion.div>
        );

      default: // profile
        return (
          <motion.div
            key="profile"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-xl shadow-sm p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Profile Information</h3>
              {isEditing && (
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCancel}
                    className="px-5 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-all"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </motion.button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Email - Full Width */}
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  <Mail className="w-3.5 h-3.5 inline mr-1.5 text-slate-400" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  disabled={!isEditing}
                  placeholder="Not set"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 disabled:opacity-60 disabled:cursor-not-allowed placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Job Title */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Job Title
                </label>
                <input
                  type="text"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Not set"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 disabled:opacity-60 disabled:cursor-not-allowed placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Department - Full Width */}
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Department
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Not set"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 disabled:opacity-60 disabled:cursor-not-allowed placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Timezone - Full Width */}
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Timezone
                </label>
                <TimezonePicker
                  value={formData.timezone}
                  onChange={(value) => setFormData({ ...formData, timezone: value })}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="flex-1 bg-slate-50 p-4 overflow-auto">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden"
            >
              {/* Gradient Header */}
              <div className="h-16 bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 relative">
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                  <div className="relative group">
                    {formData.profileImage ? (
                      <img
                        src={formData.profileImage}
                        alt="Profile"
                        className="w-20 h-20 rounded-full border-4 border-white shadow-xl object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full border-4 border-white shadow-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">{getInitials()}</span>
                      </div>
                    )}
                    {isEditing && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 p-2 bg-blue-500 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
                      >
                        <Camera className="w-4 h-4 text-white" />
                      </motion.button>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Profile Info */}
              <div className="pt-12 pb-4 px-4 text-center">
                <h2 className="text-base font-bold text-slate-900 mb-0.5">
                  {formData.firstName} {formData.lastName}
                </h2>
                <p className="text-xs text-slate-600 mb-0.5">{formData.jobTitle || 'Administrator'}</p>
                <p className="text-[10px] text-slate-500 mb-4">
                  Update profile picture (.JPG, .PNG, max 2MB)
                </p>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setIsEditing(!isEditing);
                    setActiveSection('profile');
                  }}
                  className="w-full px-6 py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-all shadow-lg"
                >
                  {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                </motion.button>
              </div>
            </motion.div>

            {/* Account Status Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-sm p-4 text-white"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <span className="text-lg font-bold">A</span>
                </div>
                <div>
                  <h3 className="font-bold text-sm">Account Status</h3>
                  <p className="text-[11px] text-purple-100">Active & Verified</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-purple-100">Created Date</span>
                  <span className="text-xs font-semibold">Jan, 2024</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-purple-100">Last Login</span>
                  <span className="text-xs font-semibold">Today</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-purple-100">Email Status</span>
                  <span className="flex items-center gap-1 text-xs font-semibold">
                    <Check className="w-3.5 h-3.5" />
                    Verified
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl shadow-lg p-4"
            >
              <h3 className="font-bold text-sm text-slate-900 mb-3">Quick Actions</h3>
              <div className="space-y-1.5">
                <motion.button
                  whileHover={{ x: 4 }}
                  onClick={() => setActiveSection('twoFactor')}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg transition-colors text-left group ${
                    activeSection === 'twoFactor' ? 'bg-blue-50 border border-blue-200' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      activeSection === 'twoFactor' ? 'bg-blue-200' : 'bg-blue-100 group-hover:bg-blue-200'
                    }`}>
                      <Shield className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-xs font-medium text-slate-700">Two-Factor Auth</span>
                  </div>
                  <span className="text-slate-400">›</span>
                </motion.button>

                <motion.button
                  whileHover={{ x: 4 }}
                  onClick={() => setActiveSection('password')}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg transition-colors text-left group ${
                    activeSection === 'password' ? 'bg-orange-50 border border-orange-200' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      activeSection === 'password' ? 'bg-orange-200' : 'bg-orange-100 group-hover:bg-orange-200'
                    }`}>
                      <Key className="w-4 h-4 text-orange-600" />
                    </div>
                    <span className="text-xs font-medium text-slate-700">Reset Password</span>
                  </div>
                  <span className="text-slate-400">›</span>
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* Right Content Area - Dynamic */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {renderRightContent()}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <Toast message="Profile updated successfully!" onClose={() => setShowToast(false)} />
        )}
      </AnimatePresence>

      {/* Modals */}
      <SetupAuthenticatorModal
        isOpen={isAuthenticatorModalOpen}
        onClose={() => setIsAuthenticatorModalOpen(false)}
      />
      <SetupSMSModal
        isOpen={isSMSModalOpen}
        onClose={() => setIsSMSModalOpen(false)}
      />
    </div>
  );
}