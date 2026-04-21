import { motion, AnimatePresence } from 'motion/react';
import { DatePicker } from './DatePicker';
import { X, User, Upload, Mail, Phone, Building2, MapPin, FileText, Tag, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';

interface AddContactDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (contact?: any) => void;
  customerId?: string;
  contactData?: {
    id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    wechatId?: string;
    jobTitle?: string;
    company?: string;
    department?: string;
    contactType?: string;
    tags?: string[];
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    isPrimary?: boolean;
    notes?: string;
    lastContacted?: string;
    profileImage?: string;
  } | null;
}

const JOB_TITLES = [
  'CEO',
  'President',
  'Vice President',
  'Director',
  'Manager',
  'Purchasing Manager',
  'Sales Manager',
  'Account Manager',
  'Coordinator',
  'Specialist',
  'Representative',
  'Other',
];

const CONTACT_TYPES = [
  'Vendor',
  'Customer',
  'Sales Lead',
  'Partner',
  'Supplier',
  'Contractor',
  'Other',
];

const AVAILABLE_TAGS = [
  'VIP',
  'Key Decision Maker',
  'Technical Contact',
  'Billing Contact',
  'Primary Contact',
  'Secondary Contact',
  'Emergency Contact',
  'After Hours',
];

const COUNTRIES = [
  'United States',
  'Canada',
  'Mexico',
  'United Kingdom',
  'Germany',
  'France',
  'Italy',
  'Spain',
  'Netherlands',
  'Belgium',
  'Switzerland',
  'Austria',
  'Sweden',
  'Norway',
  'Denmark',
  'Finland',
  'Ireland',
  'Portugal',
  'Poland',
  'Czech Republic',
  'Hungary',
  'Romania',
  'Greece',
  'Australia',
  'New Zealand',
  'Japan',
  'China',
  'South Korea',
  'Taiwan',
  'Hong Kong',
  'Singapore',
  'Malaysia',
  'Thailand',
  'Vietnam',
  'Indonesia',
  'Philippines',
  'India',
  'United Arab Emirates',
  'Saudi Arabia',
  'Israel',
  'Turkey',
  'South Africa',
  'Brazil',
  'Argentina',
  'Chile',
  'Colombia',
  'Peru',
  'Other',
];

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

const CONTACT_CHANNELS = [
  'WeChat',
  'WhatsApp',
  'Telegram',
  'Signal',
  'Slack',
  'Microsoft Teams',
  'Discord',
  'Line',
  'Viber',
  'Skype',
];

export function AddContactDrawer({ isOpen, onClose, contactData, onSuccess, customerId }: AddContactDrawerProps) {
  const [removeBackground, setRemoveBackground] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [companySearch, setCompanySearch] = useState('');

  const [formData, setFormData] = useState({
    image: contactData?.image || '',
    firstName: contactData?.firstName || '',
    lastName: contactData?.lastName || '',
    email: contactData?.email || '',
    phone: contactData?.phone || '',
    channelType: contactData?.channelType || '',
    channelId: contactData?.channelId || '',
    jobTitle: contactData?.jobTitle || '',
    company: contactData?.company || '',
    department: contactData?.department || '',
    contactType: contactData?.contactType || 'Other',
    tags: contactData?.tags || [],
    addressLine1: contactData?.addressLine1 || '',
    addressLine2: contactData?.addressLine2 || '',
    city: contactData?.city || '',
    state: contactData?.state || '',
    zipCode: contactData?.zipCode || '',
    country: contactData?.country || 'United States',
    notes: contactData?.notes || '',
  });

  // Update form when contactData changes (for edit mode)
  useEffect(() => {
    if (contactData) {
      setFormData({
        image: contactData.image || '',
        firstName: contactData.firstName || '',
        lastName: contactData.lastName || '',
        email: contactData.email || '',
        phone: contactData.phone || '',
        company: contactData.company || '',
        jobTitle: contactData.jobTitle || '',
        department: contactData.department || '',
        contactType: contactData.contactType || 'Other',
        tags: contactData.tags || [],
        addressLine1: contactData.addressLine1 || '',
        addressLine2: contactData.addressLine2 || '',
        city: contactData.city || '',
        state: contactData.state || '',
        zipCode: contactData.zipCode || '',
        country: contactData.country || 'United States',
        notes: contactData.notes || '',
      });
      setUploadedImage(contactData.image || null);
      setCompanySearch(contactData.company || '');
    } else {
      // Reset to empty for new contact
      setFormData({
        image: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        jobTitle: '',
        department: '',
        contactType: 'Other',
        tags: [],
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'United States',
        notes: '',
      });
      setUploadedImage(null);
      setCompanySearch('');
    }
  }, [contactData]);

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    setIsProcessingImage(true);
    
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        
        // Background removal service isn't wired locally; preview the
        // original image and let the save flow upload it to S3.
        setUploadedImage(base64String);
        setFormData({ ...formData, profileImage: base64String });
        if (removeBackground) {
          console.info('Background removal unavailable — using original image');
        }
        
        setIsProcessingImage(false);
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      setIsProcessingImage(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleAddTag = (tag: string) => {
    if (tag.trim() && !formData.tags.includes(tag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tag.trim()]
      });
    }
    setTagInput('');
    setShowTagDropdown(false);
  };

  const handleRemoveTag = (index: number) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((_, i) => i !== index)
    });
  };

  // Search for companies. We hit /api/customers/list (the company catalog we
  // maintain locally) and filter client-side — the reference's dedicated
  // search-companies endpoint isn't wired here.
  const handleCompanySearch = async (query: string) => {
    if (query.length < 3) {
      setCompanies([]);
      setShowCompanyDropdown(false);
      return;
    }
    try {
      const response = await fetch('/api/customers/list');
      if (!response.ok) throw new Error('Failed');
      const data = await response.json();
      const q = query.toLowerCase();
      const matched = (data.customers ?? [])
        .filter((c: any) => (c.name || '').toLowerCase().includes(q))
        .slice(0, 10);
      setCompanies(matched);
      setShowCompanyDropdown(matched.length > 0);
    } catch (error) {
      console.error('Error searching companies:', error);
    }
  };

  // Handle company selection
  const handleSelectCompany = (company: any) => {
    setFormData({ 
      ...formData, 
      company: company.name,
      // Optionally pre-fill address if company has one
      addressLine1: company.address?.line1 || formData.addressLine1,
      addressLine2: company.address?.line2 || formData.addressLine2,
      city: company.address?.city || formData.city,
      state: company.address?.state || formData.state,
      zipCode: company.address?.zipCode || formData.zipCode,
    });
    setCompanySearch(company.name);
    setShowCompanyDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const contact = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      channelType: formData.channelType,
      channelId: formData.channelId,
      jobTitle: formData.jobTitle,
      company: formData.company,
      department: formData.department,
      contactType: formData.contactType,
      tags: formData.tags,
      addressLine1: formData.addressLine1,
      addressLine2: formData.addressLine2,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
      country: formData.country,
      notes: formData.notes,
      lastContacted: formData.lastContacted,
      profileImage: formData.profileImage,
    };

    try {
      setIsSaving(true);
      // Map the drawer's firstName/lastName fields to the single `name`
      // column our contacts collection stores, and flatten the address
      // block into the embedded `addresses` array.
      const name = [formData.firstName, formData.lastName].filter(Boolean).join(' ').trim();
      const addressBlock = formData.addressLine1 || formData.city ? [{
        id: `addr-${Date.now()}`,
        line1: formData.addressLine1 || '',
        line2: formData.addressLine2 || '',
        city: formData.city || '',
        state: formData.state || '',
        zipCode: formData.zipCode || '',
        country: formData.country || '',
        isPrimary: true,
      }] : [];

      const basePayload: Record<string, any> = {
        name: name || formData.firstName || formData.email,
        email: formData.email,
        phone: formData.phone,
        company: formData.company || null,
        position: formData.jobTitle || null,
        type: formData.contactType || 'Customer',
        country: formData.country || 'United States',
        notes: formData.notes || '',
      };
      if (addressBlock.length) basePayload.addresses = addressBlock;

      if (contactData?.id) {
        // Update existing contact
        const response = await fetch('/api/contacts/update', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: contactData.id, ...basePayload }),
        });
        if (!response.ok) throw new Error('Failed to update contact');
        onSuccess?.({ ...contactData, ...basePayload, id: contactData.id });
        onClose();
      } else {
        // Create new contact
        const response = await fetch('/api/contacts/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(basePayload),
        });
        if (!response.ok) throw new Error('Failed to create contact');
        const data = await response.json();
        const saved = data.contact ?? { ...basePayload, ...contact };
        // If this drawer is scoped to a customer (used by CustomerDetailView),
        // mirror the row into customer_contacts so the customer's contacts
        // tab picks it up.
        if (customerId) {
          await fetch('/api/customers/contacts/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              customerId,
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
              phone: formData.phone,
              role: formData.jobTitle || null,
            }),
          }).catch(() => undefined);
        }
        onSuccess?.(saved);
        onClose();
        setFormData({
          image: '',
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          company: '',
          jobTitle: '',
          department: '',
          contactType: 'Other',
          tags: [],
          addressLine1: '',
          addressLine2: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'United States',
          notes: '',
        });
        setUploadedImage(null);
        setCompanySearch('');
      }
    } catch (error) {
      console.error('Error saving contact:', error);
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
            <div className="bg-slate-800 px-8 py-8 flex items-center justify-between shadow-xl">
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
                    {contactData?.id ? 'Edit Contact' : 'New Contact'}
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-blue-50 font-medium"
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
            <div className="flex-1 overflow-y-auto p-8 space-y-6 drawer-scroll">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Profile Image */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-3xl p-8 shadow-xl border-2 border-slate-200"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900">Profile Image</h3>
                  </div>

                  <div className="flex items-start gap-6">
                    {/* Image Preview */}
                    <input
                      type="file"
                      id="profile-upload"
                      accept="image/*"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                    <label htmlFor="profile-upload">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="w-32 h-32 border-3 border-dashed border-slate-300 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 shadow-inner cursor-pointer overflow-hidden"
                      >
                        {uploadedImage || formData.profileImage ? (
                          <img 
                            src={uploadedImage || formData.profileImage} 
                            alt="Profile preview" 
                            className="w-full h-full object-cover"
                          />
                        ) : isProcessingImage ? (
                          <div className="text-center">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"
                            />
                            <p className="text-xs text-slate-500 font-medium">Processing...</p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-2">
                              <User className="w-8 h-8 text-white" />
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </label>

                    <div className="flex-1">
                      <motion.button
                        type="button"
                        onClick={() => document.getElementById('profile-upload')?.click()}
                        whileHover={{ scale: 1.02, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isProcessingImage}
                        className="flex items-center gap-3 px-6 py-4 bg-slate-900 hover:bg-slate-800 rounded-2xl font-bold text-white transition-all mb-6 shadow-xl w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Upload className="w-5 h-5" />
                        {isProcessingImage ? 'Processing Image...' : 'Upload Image or drag and drop'}
                      </motion.button>
                      <p className="text-xs text-slate-500 text-center mb-4">JPG, PNG or WebP (max 5MB)</p>

                      <div className="p-5 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border-2 border-slate-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-slate-900 text-sm mb-1">Remove White Background</p>
                            <p className="text-xs text-slate-600">Automatically make white backgrounds transparent</p>
                          </div>
                          <motion.button
                            type="button"
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setRemoveBackground(!removeBackground)}
                            className={`relative w-14 h-7 rounded-full transition-all ${
                              removeBackground ? 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg' : 'bg-slate-300'
                            }`}
                          >
                            <motion.div
                              animate={{ x: removeBackground ? 28 : 2 }}
                              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                              className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-md"
                            />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Basic Information */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-3xl p-8 shadow-xl border-2 border-slate-200"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900">Basic Information</h3>
                  </div>

                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                          First Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="John"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all font-medium"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                          Last Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Smith"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all font-medium"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          placeholder="john.smith@company.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all font-medium"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                          Phone
                        </label>
                        <input
                          type="tel"
                          placeholder="+1 (555) 123-4567"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all font-medium"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Professional Information */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-3xl p-8 shadow-xl border-2 border-slate-200"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900">Professional Information</h3>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Job Title <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.jobTitle}
                        onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all font-medium appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23475569%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3c%2Fpolyline%3E%3c%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat pr-12 cursor-pointer"
                        required
                      >
                        <option value="">Select job title</option>
                        {JOB_TITLES.map((title) => (
                          <option key={title} value={title}>
                            {title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Department
                      </label>
                      <input
                        type="text"
                        placeholder="Purchasing"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Contact Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.contactType}
                        onChange={(e) => setFormData({ ...formData, contactType: e.target.value })}
                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all font-medium appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23475569%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3c%2Fpolyline%3E%3c%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat pr-12 cursor-pointer"
                        required
                      >
                        {CONTACT_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                          Contact Channel
                        </label>
                        <select
                          value={formData.channelType}
                          onChange={(e) => setFormData({ ...formData, channelType: e.target.value, channelId: '' })}
                          className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all font-medium appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23475569%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3c%2Fpolyline%3E%3c%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat pr-12 cursor-pointer"
                        >
                          <option value="">None</option>
                          {CONTACT_CHANNELS.map((channel) => (
                            <option key={channel} value={channel}>
                              {channel}
                            </option>
                          ))}
                        </select>
                      </div>

                      {formData.channelType && (
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">
                            {formData.channelType} ID/Username
                          </label>
                          <input
                            type="text"
                            placeholder={`Enter ${formData.channelType} ID`}
                            value={formData.channelId}
                            onChange={(e) => setFormData({ ...formData, channelId: e.target.value })}
                            className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all font-medium"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* Tags */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white rounded-3xl p-8 shadow-xl border-2 border-slate-200"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Tag className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900">Tags</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Select tags..."
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onFocus={() => setShowTagDropdown(true)}
                        onBlur={() => setTimeout(() => setShowTagDropdown(false), 200)}
                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all font-medium"
                      />
                      <AnimatePresence>
                        {showTagDropdown && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute left-0 right-0 top-full mt-2 bg-white border-2 border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden max-h-60 overflow-y-auto"
                          >
                            {AVAILABLE_TAGS.filter(tag => 
                              tag.toLowerCase().includes(tagInput.toLowerCase()) && 
                              !formData.tags.includes(tag)
                            ).map((tag, index) => (
                              <motion.div
                                key={tag}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="px-5 py-3 cursor-pointer hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-50 border-b border-slate-100 last:border-b-0 transition-all"
                                onMouseDown={() => handleAddTag(tag)}
                              >
                                <span className="text-sm font-semibold text-slate-900">{tag}</span>
                              </motion.div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <p className="text-xs text-slate-500">Select from dropdown or click badges to remove</p>

                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.map((tag, index) => (
                          <motion.div
                            key={index}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-xl font-semibold border-2 border-orange-200"
                          >
                            <Tag className="w-3 h-3" />
                            <span className="text-sm">{tag}</span>
                            <motion.button
                              type="button"
                              onClick={() => handleRemoveTag(index)}
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                              className="text-orange-500 hover:text-orange-700"
                            >
                              <X className="w-4 h-4" />
                            </motion.button>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Address Information */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white rounded-3xl p-8 shadow-xl border-2 border-slate-200"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900">Address Information</h3>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Address Line 1
                      </label>
                      <input
                        type="text"
                        placeholder="123 Business St"
                        value={formData.addressLine1}
                        onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500 transition-all font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Address Line 2
                      </label>
                      <input
                        type="text"
                        placeholder="Suite 456"
                        value={formData.addressLine2}
                        onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500 transition-all font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                          City
                        </label>
                        <input
                          type="text"
                          placeholder="City"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500 transition-all font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                          State
                        </label>
                        <select
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500 transition-all font-medium appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23475569%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3c%2Fpolyline%3E%3c%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat pr-12 cursor-pointer"
                        >
                          <option value="">Select state</option>
                          {US_STATES.map((state) => (
                            <option key={state} value={state}>
                              {state}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                          ZIP Code
                        </label>
                        <input
                          type="text"
                          placeholder="ZIP Code"
                          value={formData.zipCode}
                          onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                          className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500 transition-all font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                          Country
                        </label>
                        <select
                          value={formData.country}
                          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                          className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500 transition-all font-medium appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23475569%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3c%2Fpolyline%3E%3c%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat pr-12 cursor-pointer"
                        >
                          <option value="">Select country</option>
                          {COUNTRIES.map((country) => (
                            <option key={country} value={country}>
                              {country}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Additional Information */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-white rounded-3xl p-8 shadow-xl border-2 border-slate-200"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900">Additional Information</h3>
                  </div>

                  <div className="space-y-5">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="isPrimary"
                        checked={formData.isPrimary}
                        onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
                        className="w-5 h-5 rounded border-slate-300 text-teal-600 focus:ring-2 focus:ring-teal-500/30"
                      />
                      <label htmlFor="isPrimary" className="text-sm font-bold text-slate-700 cursor-pointer">
                        Set as primary contact
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Notes
                      </label>
                      <textarea
                        placeholder="Additional notes about this contact..."
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={4}
                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all resize-none font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Last Contacted
                      </label>
                      <DatePicker
                        value={formData.lastContacted || ''}
                        onChange={(date) => setFormData({ ...formData, lastContacted: date })}
                      />
                      <p className="text-xs text-slate-500 mt-2">When did you last contact this person?</p>
                    </div>
                  </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="flex gap-4 sticky bottom-0 bg-slate-50 py-6 -mx-8 px-8 border-t-2 border-slate-200"
                >
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    className="flex-1 px-8 py-5 bg-white border-2 border-slate-300 hover:bg-slate-100 rounded-2xl font-black text-slate-700 text-lg transition-all shadow-lg"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-8 py-5 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-2xl font-black text-white text-lg shadow-2xl transition-all"
                  >
                    {contactData?.id ? 'Update Contact' : 'Add Contact'}
                  </motion.button>
                </motion.div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}