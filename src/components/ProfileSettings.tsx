import { motion, AnimatePresence } from 'motion/react';
import { User, Mail, Phone, Briefcase, Building2, Camera, Save, Edit3, Key, X, Check, Shield, Monitor, Smartphone, MapPin, Clock, QrCode, AlertCircle } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { TimezonePicker } from './TimezonePicker';
import { Toast } from './Toast';
import { UserProfile } from '../App';
import { SetupAuthenticatorModal } from './SetupAuthenticatorModal';
import { SetupSMSModal } from './SetupSMSModal';
import { useAuth } from '../context/AuthContext';

interface ProfileSettingsProps {
  userProfile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
}

interface AuthStatus {
  created_at: string | null;
  last_login: string | null;
  email_verified: boolean | null;
  blocked: boolean;
  profile_image_key: string | null;
}

function formatRelativeDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return 'Last week';
  if (diffDays < 365) return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatCreatedDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export function ProfileSettings({ userProfile, onUpdate }: ProfileSettingsProps) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [activeSection, setActiveSection] = useState<'profile' | 'twoFactor' | 'sessions' | 'password' | 'passwordSuccess'>('profile');
  const [formData, setFormData] = useState<UserProfile>(userProfile);
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAuthenticatorModalOpen, setIsAuthenticatorModalOpen] = useState(false);
  const [isSMSModalOpen, setIsSMSModalOpen] = useState(false);
  const [authStatus, setAuthStatus] = useState<AuthStatus | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [toastMessage, setToastMessage] = useState('Profile updated successfully!');
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (!user?.sub || user.sub.startsWith('local|')) return;
    fetch(`/api/users/me?userId=${encodeURIComponent(user.sub)}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data: AuthStatus | null) => {
        if (!data) return;
        setAuthStatus(data);
        // Restore the profile image stored in Auth0 user_metadata on page load
        if (data.profile_image_key) {
          setFormData((prev) => ({ ...prev, profileImage: data.profile_image_key! }));
          onUpdate({ ...userProfile, profileImage: data.profile_image_key! });
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.sub]);

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

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({ current: '', new: '', confirm: '' });

  const showError = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handlePasswordChange = async () => {
    if (passwordData.new !== passwordData.confirm) {
      setPasswordErrors(e => ({ ...e, confirm: 'Passwords do not match.' }));
      return;
    }
    const strengthRe = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
    if (!strengthRe.test(passwordData.new)) {
      setPasswordErrors(e => ({ ...e, new: 'Must be ≥8 chars with uppercase, lowercase, number & special character.' }));
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.sub,
          email: user?.email,
          currentPassword: passwordData.current,
          newPassword: passwordData.new,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          setPasswordErrors(e => ({ ...e, current: 'Current password is incorrect.' }));
        } else {
          showError(data.error || 'Failed to update password.');
        }
        return;
      }
      setPasswordErrors({ current: '', new: '', confirm: '' });
      setPasswordData({ current: '', new: '', confirm: '' });
      setActiveSection('passwordSuccess');
    } catch {
      showError('Failed to update password. Please try again.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Selecting a file only creates a local preview — no upload happens yet.
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      showError('Only JPG and PNG images are supported.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showError('Image must be under 2 MB.');
      return;
    }

    // Revoke any previous preview URL to free memory
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setPendingImageFile(file);
    setImageError(false);
    setFormData((prev) => ({ ...prev, profileImage: url }));
  };

  const handleSave = async () => {
    let savedProfile = { ...formData };

    if (pendingImageFile && user?.sub) {
      setIsUploadingImage(true);
      try {
        // 1. Convert file to base64 and upload server-side (avoids S3 CORS)
        const fileData = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string).split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(pendingImageFile);
        });

        const uploadRes = await fetch('/api/files/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: pendingImageFile.name,
            fileType: pendingImageFile.type,
            entityType: 'profile',
            entityId: user.sub,
            fileData,
          }),
        });
        if (!uploadRes.ok) {
          const errBody = await uploadRes.json().catch(() => ({}));
          throw new Error(errBody?.error ?? `Upload failed (${uploadRes.status}).`);
        }
        const { key, fileUrl } = await uploadRes.json();

        // 3. Record upload metadata in MongoDB (fire-and-forget)
        fetch('/api/files/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            key,
            fileName: pendingImageFile.name,
            fileType: pendingImageFile.type,
            size: pendingImageFile.size,
            entityType: 'profile',
            entityId: user.sub,
            uploadedBy: user.sub,
          }),
        }).catch(() => {});

        // 4. Persist URL in Auth0 and delete old S3 image
        if (!user.sub.startsWith('local|')) {
          const updateRes = await fetch('/api/users/update', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.sub,
              profileImage: fileUrl,
              oldProfileImage: userProfile.profileImage,
            }),
          });
          if (!updateRes.ok) {
            const errBody = await updateRes.json().catch(() => ({}));
            throw new Error(errBody?.error ?? `Profile save failed (${updateRes.status}).`);
          }
        }

        // Swap preview URL for the real S3 URL
        URL.revokeObjectURL(previewUrl!);
        setPreviewUrl(null);
        setPendingImageFile(null);
        savedProfile = { ...savedProfile, profileImage: fileUrl };
        setFormData(savedProfile);
      } catch (err) {
        setIsUploadingImage(false);
        showError(err instanceof Error ? err.message : 'Image upload failed.');
        return; // keep editing so user can retry
      }
      setIsUploadingImage(false);
    }

    // Persist text field changes (phone, name, etc.) to Auth0 / database
    if (user?.sub && !user.sub.startsWith('local|')) {
      try {
        const fieldsRes = await fetch('/api/users/update', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.sub,
            firstName: savedProfile.firstName,
            lastName: savedProfile.lastName,
            phone: savedProfile.phone,
          }),
        });
        if (!fieldsRes.ok) {
          const errBody = await fieldsRes.json().catch(() => ({}));
          throw new Error(errBody?.error ?? `Profile save failed (${fieldsRes.status}).`);
        }
      } catch (err) {
        showError(err instanceof Error ? err.message : 'Failed to save profile.');
        return;
      }
    }

    onUpdate(savedProfile);
    setIsEditing(false);
    setToastMessage('Profile updated successfully!');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleCancel = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setPendingImageFile(null);
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
            className="bg-white rounded-3xl shadow-lg p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Two-Factor Authentication</h3>
                <p className="text-sm text-slate-600 mt-1">Add an extra layer of security to your account</p>
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
            <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 mb-1">Two-Factor Authentication is Disabled</h4>
                  <p className="text-sm text-slate-600">
                    Protect your account by enabling two-factor authentication. You'll need to enter a code from your phone in addition to your password when signing in.
                  </p>
                </div>
              </div>
            </div>

            {/* Setup Options */}
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900">Choose Authentication Method</h4>
              
              {/* Authenticator App */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="p-6 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer hover:border-blue-400 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
                    <QrCode className="w-6 h-6 text-slate-700" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-bold text-slate-900 mb-1">Authenticator App (Recommended)</h5>
                    <p className="text-sm text-slate-600 mb-3">
                      Use an authentication app like Google Authenticator or Authy to generate verification codes.
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsAuthenticatorModalOpen(true)}
                      className="px-5 py-2.5 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 transition-all"
                    >
                      Set Up Authenticator
                    </motion.button>
                  </div>
                </div>
              </motion.div>

              {/* SMS */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="p-6 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer hover:border-blue-400 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
                    <Smartphone className="w-6 h-6 text-slate-700" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-bold text-slate-900 mb-1">SMS Text Message</h5>
                    <p className="text-sm text-slate-600 mb-3">
                      Receive verification codes via SMS to your registered phone number.
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsSMSModalOpen(true)}
                      className="px-5 py-2.5 bg-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-300 transition-all"
                    >
                      Set Up SMS
                    </motion.button>
                  </div>
                </div>
              </motion.div>

              {/* Backup Codes Notice */}
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-900">Don't forget backup codes</p>
                  <p className="text-sm text-amber-700 mt-1">
                    After enabling 2FA, make sure to save your backup codes in a safe place. You'll need them if you lose access to your authentication method.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'sessions':
        return (
          <motion.div
            key="sessions"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-3xl shadow-lg p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Active Sessions</h3>
                <p className="text-sm text-slate-600 mt-1">Manage devices where you're signed in</p>
              </div>
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="text-sm font-semibold text-red-600 hover:text-red-700 transition-colors"
                >
                  End All Sessions
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveSection('profile')}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </motion.button>
              </div>
            </div>

            <div className="space-y-4">
              {/* MacBook Pro - Current */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="p-5 bg-green-50 border border-green-200 rounded-2xl"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Monitor className="w-6 h-6 text-slate-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-bold text-slate-900">MacBook Pro</h4>
                      <span className="px-2.5 py-0.5 bg-green-500 text-white text-xs font-semibold rounded-full">
                        Current
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-slate-600">
                      <p className="flex items-center gap-2">
                        <Monitor className="w-3.5 h-3.5" />
                        Chrome 120.0 on macOS 14.2
                      </p>
                      <p className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5" />
                        San Francisco, CA • 192.168.1.45
                      </p>
                      <p className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" />
                        Signed in 2 min ago
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* iPhone 15 Pro */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="p-5 bg-slate-50 border border-slate-200 rounded-2xl relative group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Smartphone className="w-6 h-6 text-slate-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 mb-2">iPhone 15 Pro</h4>
                    <div className="space-y-1 text-sm text-slate-600">
                      <p className="flex items-center gap-2">
                        <Smartphone className="w-3.5 h-3.5" />
                        Safari 17.1 on iOS 17.2
                      </p>
                      <p className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5" />
                        San Francisco, CA • 192.168.1.45
                      </p>
                      <p className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" />
                        Signed in 3 hours ago
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-medium rounded-lg text-sm"
                  >
                    End Session
                  </motion.button>
                </div>
              </motion.div>

              {/* iPad Air */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="p-5 bg-slate-50 border border-slate-200 rounded-2xl relative group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Monitor className="w-6 h-6 text-slate-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 mb-2">iPad Air</h4>
                    <div className="space-y-1 text-sm text-slate-600">
                      <p className="flex items-center gap-2">
                        <Monitor className="w-3.5 h-3.5" />
                        Safari 17.1 on iPadOS 17.2
                      </p>
                      <p className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5" />
                        Miami, FL • 10.0.0.25
                      </p>
                      <p className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" />
                        Signed in 1 day ago
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-medium rounded-lg text-sm"
                  >
                    End Session
                  </motion.button>
                </div>
              </motion.div>
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
            className="bg-white rounded-3xl shadow-lg p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Reset Password</h3>
                <p className="text-sm text-slate-600 mt-1">Update your password to keep your account secure</p>
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

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.current}
                  onChange={(e) => {
                    setPasswordErrors(err => ({ ...err, current: '' }));
                    setPasswordData({ ...passwordData, current: e.target.value });
                  }}
                  placeholder="Enter current password"
                  className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                    passwordErrors.current
                      ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500'
                      : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'
                  }`}
                />
                {passwordErrors.current && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {passwordErrors.current}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.new}
                  onChange={(e) => {
                    setPasswordErrors(err => ({ ...err, new: '' }));
                    setPasswordData({ ...passwordData, new: e.target.value });
                  }}
                  placeholder="Enter new password"
                  className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                    passwordErrors.new
                      ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500'
                      : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'
                  }`}
                />
                {passwordErrors.new ? (
                  <p className="mt-1.5 flex items-center gap-1.5 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {passwordErrors.new}
                  </p>
                ) : (
                  <p className="mt-2 text-xs text-slate-500">
                    Password must be at least 8 characters with uppercase, lowercase, number, and special character.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirm}
                  onChange={(e) => {
                    setPasswordErrors(err => ({ ...err, confirm: '' }));
                    setPasswordData({ ...passwordData, confirm: e.target.value });
                  }}
                  placeholder="Confirm new password"
                  className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                    passwordErrors.confirm
                      ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500'
                      : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'
                  }`}
                />
                {passwordErrors.confirm && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {passwordErrors.confirm}
                  </p>
                )}
              </div>

              <div className="pt-4 flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveSection('profile')}
                  className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-all"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: isChangingPassword ? 1 : 1.02 }}
                  whileTap={{ scale: isChangingPassword ? 1 : 0.98 }}
                  onClick={handlePasswordChange}
                  disabled={isChangingPassword}
                  className="flex-1 px-6 py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-all shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isChangingPassword ? 'Updating…' : 'Update Password'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        );

      case 'passwordSuccess':
        return (
          <motion.div
            key="passwordSuccess"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-3xl shadow-lg p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center"
            >
              <Check className="w-10 h-10 text-white" />
            </motion.div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Password Updated!</h3>
            <p className="text-slate-600 mb-8">
              Your password has been changed successfully. Use your new password next time you sign in.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveSection('profile')}
              className="w-full py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-all shadow-lg"
            >
              Back to Profile
            </motion.button>
          </motion.div>
        );

      default: // profile
        return (
          <motion.div
            key="profile"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-3xl shadow-lg p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">Profile Information</h3>
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
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 transition-all"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </motion.button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Email - Full Width */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-2 text-slate-400" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-400 cursor-not-allowed opacity-60"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  disabled={!isEditing}
                  placeholder="Not set"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 disabled:opacity-60 disabled:cursor-not-allowed placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Job Title */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Job Title
                </label>
                <input
                  type="text"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Not set"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 disabled:opacity-60 disabled:cursor-not-allowed placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Department - Full Width */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Department
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Not set"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 disabled:opacity-60 disabled:cursor-not-allowed placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Timezone - Full Width */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
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
    <div className="flex-1 bg-slate-50 p-4 md:p-8 overflow-auto">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-lg overflow-hidden"
            >
              {/* Gradient Header */}
              <div className="h-24 bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 relative">
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                  <div className="relative group">
                    {formData.profileImage && !imageError ? (
                      <img
                        src={formData.profileImage}
                        alt="Profile"
                        onError={() => setImageError(true)}
                        className="w-24 h-24 rounded-full border-4 border-white shadow-xl object-cover"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full border-4 border-white shadow-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                        <span className="text-3xl font-bold text-white">{getInitials()}</span>
                      </div>
                    )}
                    {(isEditing || isUploadingImage) && (
                      <motion.button
                        whileHover={{ scale: isUploadingImage ? 1 : 1.1 }}
                        whileTap={{ scale: isUploadingImage ? 1 : 0.95 }}
                        onClick={() => !isUploadingImage && fileInputRef.current?.click()}
                        disabled={isUploadingImage}
                        className="absolute bottom-0 right-0 p-2 bg-blue-500 rounded-full shadow-lg hover:bg-blue-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                        title={isUploadingImage ? 'Uploading…' : 'Change photo'}
                      >
                        {isUploadingImage ? (
                          <svg className="w-4 h-4 text-white animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                        ) : (
                          <Camera className="w-4 h-4 text-white" />
                        )}
                      </motion.button>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Profile Info */}
              <div className="pt-16 pb-6 px-6 text-center">
                <h2 className="text-xl font-bold text-slate-900 mb-1">
                  {formData.firstName} {formData.lastName}
                </h2>
                <p className="text-sm text-slate-600 mb-1">{formData.jobTitle || 'Administrator'}</p>
                <p className="text-xs text-slate-500 mb-6">
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
              className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl shadow-lg p-6 text-white"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <span className="text-2xl font-bold">A</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg">Account Status</h3>
                  <p className="text-sm text-purple-100">
                    {authStatus?.blocked
                      ? 'Inactive'
                      : (authStatus?.email_verified ?? user?.email_verified) === false
                        ? 'Active & Unverified'
                        : 'Active & Verified'}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-purple-100">Created Date</span>
                  <span className="font-semibold">
                    {authStatus?.created_at ? formatCreatedDate(authStatus.created_at) : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-purple-100">Last Login</span>
                  <span className="font-semibold">
                    {authStatus?.last_login ? formatRelativeDate(authStatus.last_login) : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-purple-100">Email Status</span>
                  <span className="flex items-center gap-1.5 font-semibold">
                    <Check className="w-4 h-4" />
                    {(authStatus?.email_verified ?? user?.email_verified) ? 'Verified' : 'Not Verified'}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl shadow-lg p-6"
            >
              <h3 className="font-bold text-slate-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <motion.button
                  whileHover={{ x: 4 }}
                  onClick={() => setActiveSection('twoFactor')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors text-left group ${
                    activeSection === 'twoFactor' ? 'bg-blue-50 border-2 border-blue-200' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                      activeSection === 'twoFactor' ? 'bg-blue-200' : 'bg-blue-100 group-hover:bg-blue-200'
                    }`}>
                      <Shield className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="font-medium text-slate-700">Two-Factor Auth</span>
                  </div>
                  <span className="text-slate-400">›</span>
                </motion.button>

                <motion.button
                  whileHover={{ x: 4 }}
                  onClick={() => setActiveSection('password')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors text-left group ${
                    activeSection === 'password' ? 'bg-orange-50 border-2 border-orange-200' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                      activeSection === 'password' ? 'bg-orange-200' : 'bg-orange-100 group-hover:bg-orange-200'
                    }`}>
                      <Key className="w-5 h-5 text-orange-600" />
                    </div>
                    <span className="font-medium text-slate-700">Reset Password</span>
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
          <Toast message={toastMessage} onClose={() => setShowToast(false)} />
        )}
      </AnimatePresence>

      {/* Modals */}
      <SetupAuthenticatorModal
        isOpen={isAuthenticatorModalOpen}
        onClose={() => setIsAuthenticatorModalOpen(false)}
        userId={user?.sub ?? ''}
        email={user?.email ?? ''}
      />
      <SetupSMSModal
        isOpen={isSMSModalOpen}
        onClose={() => setIsSMSModalOpen(false)}
      />
    </div>
  );
}