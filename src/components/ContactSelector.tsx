import { motion, AnimatePresence } from 'motion/react';
import { X, User, Plus, Search, MapPin, Loader2, BookUser, Building2, Mail, Phone } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  role?: string;
  address?: string;
  fullAddress?: string;
  jobTitle?: string;
  contactType?: string;
}

interface ContactSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectContact: (contact: Contact) => void;
  existingContacts?: Contact[];
  /** When true, fetches contacts from the global Contacts module instead of using existingContacts */
  fetchFromModule?: boolean;
}

export function ContactSelector({ isOpen, onClose, onSelectContact, existingContacts = [], fetchFromModule = false }: ContactSelectorProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [newContact, setNewContact] = useState<Omit<Contact, 'id' | 'name'>>({
    email: '',
    phone: '',
    company: '',
    role: '',
  });
  const [addToContactsModule, setAddToContactsModule] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Module contacts state (fetched from API)
  const [moduleContacts, setModuleContacts] = useState<Contact[]>([]);
  const [isLoadingModuleContacts, setIsLoadingModuleContacts] = useState(false);
  const [hasLoadedModule, setHasLoadedModule] = useState(false);

  const formatPhoneNumber = (value: string): string => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    if (digits.length === 0) return '';
    if (digits.length <= 3) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setNewContact({ ...newContact, phone: formatted });
  };

  // Fetch contacts from global Contacts module when the selector opens
  useEffect(() => {
    if (isOpen && fetchFromModule && !hasLoadedModule) {
      fetchModuleContacts();
    }
  }, [isOpen, fetchFromModule]);

  // Also re-fetch when switching to the Select Existing tab
  useEffect(() => {
    if (isOpen && fetchFromModule && !showAddForm) {
      fetchModuleContacts();
    }
  }, [showAddForm]);

  const fetchModuleContacts = async () => {
    setIsLoadingModuleContacts(true);
    try {
      const res = await fetch('/api/contacts/list');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      const rows = data.contacts ?? [];
      const mapped: Contact[] = rows.map((c: any) => {
        const nameParts = (c.name || '').trim().split(/\s+/);
        const firstName = c.firstName || nameParts[0] || '';
        const lastName = c.lastName || nameParts.slice(1).join(' ') || '';
        const primaryAddress = Array.isArray(c.addresses)
          ? c.addresses.find((a: any) => a.isPrimary) || c.addresses[0]
          : null;
        return {
          id: c.id || String(Math.random()),
          name: c.name || [firstName, lastName].filter(Boolean).join(' ') || 'Unknown',
          email: c.email || '',
          phone: c.phone || '',
          company: c.company || '',
          role: c.jobTitle || c.position || c.role || '',
          jobTitle: c.jobTitle || c.position || '',
          contactType: c.contactType || c.type || '',
          address: primaryAddress ? [primaryAddress.city, primaryAddress.state].filter(Boolean).join(', ') : '',
          fullAddress: primaryAddress
            ? [primaryAddress.line1, primaryAddress.line2, primaryAddress.city, primaryAddress.state, primaryAddress.zipCode, primaryAddress.country].filter(Boolean).join(', ')
            : '',
        };
      });
      setModuleContacts(mapped);
      setHasLoadedModule(true);
    } catch (err) {
      console.error('Error fetching contacts from module:', err);
      toast.error('Failed to load contacts');
    } finally {
      setIsLoadingModuleContacts(false);
    }
  };

  // Use module contacts when fetchFromModule is true, otherwise use existingContacts
  const contactSource = fetchFromModule ? moduleContacts : existingContacts;

  const filteredContacts = contactSource.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectContact = (contact: Contact) => {
    onSelectContact(contact);
    onClose();
  };

  const handleAddContact = async () => {
    if (!firstName.trim()) return;
    
    const fullName = lastName.trim() ? `${firstName.trim()} ${lastName.trim()}` : firstName.trim();
    
    const contact: Contact = {
      id: String(Date.now()),
      name: fullName,
      ...newContact
    };

    // If checkbox is checked, also create in the global Contacts module
    if (addToContactsModule) {
      setIsSaving(true);
      try {
        const contactPayload = {
          name: fullName,
          email: newContact.email || `${firstName.trim().toLowerCase()}@unknown.local`,
          phone: newContact.phone,
          company: newContact.company,
          position: newContact.role,
          type: 'Vendor',
          status: 'Active',
        };
        const res = await fetch('/api/contacts/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(contactPayload),
        });
        if (!res.ok) throw new Error('Failed to save contact');
        const data = await res.json();
        toast.success(`${fullName} added to Contacts module`);
        contact.id = data.contact?.id || contact.id;
      } catch (err) {
        console.error('Error saving contact to Contacts module:', err);
        toast.error('Contact created locally but failed to save to Contacts module');
      } finally {
        setIsSaving(false);
      }
    }
    
    onSelectContact(contact);
    setFirstName('');
    setLastName('');
    setNewContact({ email: '', phone: '', company: '', role: '' });
    setAddToContactsModule(true);
    onClose();
  };

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setShowAddForm(false);
      setHasLoadedModule(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">Select Contact</h3>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </motion.button>
            </div>
          </div>

          {/* Toggle View */}
          <div className="px-6 pt-4 pb-2 bg-slate-50 border-b border-slate-200">
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAddForm(false)}
                className={`flex-1 px-4 py-2.5 rounded-lg font-semibold transition-all ${
                  !showAddForm
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:bg-white/50'
                }`}
              >
                <BookUser className="w-4 h-4 inline mr-1.5" />
                Select Existing
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAddForm(true)}
                className={`flex-1 px-4 py-2.5 rounded-lg font-semibold transition-all ${
                  showAddForm
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:bg-white/50'
                }`}
              >
                <Plus className="w-4 h-4 inline mr-1" />
                Add New
              </motion.button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {!showAddForm ? (
              <div className="p-6">
                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search contacts..."
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                {/* Loading State */}
                {fetchFromModule && isLoadingModuleContacts ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-10 h-10 text-blue-500 mx-auto mb-3 animate-spin" />
                    <p className="text-slate-600 font-medium">Loading contacts...</p>
                  </div>
                ) : contactSource.length === 0 ? (
                  <div className="text-center py-12">
                    <User className="w-16 h-16 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600 font-medium">No contacts available</p>
                    <p className="text-slate-500 text-sm mt-1">Add a new contact using the "Add New" tab</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {fetchFromModule && (
                      <div className="flex items-center gap-2 mb-3 px-1">
                        <BookUser className="w-4 h-4 text-blue-500" />
                        <p className="text-xs font-medium text-blue-600">
                          Showing {filteredContacts.length} contact{filteredContacts.length !== 1 ? 's' : ''} from Contacts module
                        </p>
                      </div>
                    )}
                    {filteredContacts.map((contact) => (
                      <motion.button
                        key={contact.id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => handleSelectContact(contact)}
                        className="w-full p-4 bg-slate-50 hover:bg-blue-50 border-2 border-slate-200 hover:border-blue-300 rounded-xl transition-all text-left"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-slate-900">{contact.name}</p>
                              {contact.contactType && (
                                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-600">
                                  {contact.contactType}
                                </span>
                              )}
                            </div>
                            {(contact.role || contact.jobTitle) && (
                              <p className="text-xs text-blue-600 font-medium">{contact.role || contact.jobTitle}</p>
                            )}
                            {contact.company && (
                              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                <Building2 className="w-3 h-3" />
                                {contact.company}
                              </p>
                            )}
                            <div className="flex items-center gap-3 mt-1 flex-wrap">
                              {contact.email && (
                                <p className="text-sm text-slate-600 flex items-center gap-1">
                                  <Mail className="w-3 h-3 text-slate-400" />
                                  {contact.email}
                                </p>
                              )}
                              {contact.phone && (
                                <>
                                  {contact.email && <span className="text-slate-300">•</span>}
                                  <p className="text-sm text-slate-500 flex items-center gap-1">
                                    <Phone className="w-3 h-3 text-slate-400" />
                                    {contact.phone}
                                  </p>
                                </>
                              )}
                              {contact.address && (
                                <>
                                  {(contact.phone || contact.email) && <span className="text-slate-300">•</span>}
                                  <p className="text-sm text-slate-500 flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {contact.address}
                                  </p>
                                </>
                              )}
                            </div>
                            {contact.fullAddress && (
                              <p className="text-xs text-slate-400 mt-0.5">{contact.fullAddress}</p>
                            )}
                          </div>
                        </div>
                      </motion.button>
                    ))}

                    {filteredContacts.length === 0 && searchQuery && (
                      <div className="text-center py-12">
                        <User className="w-16 h-16 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-600 font-medium">No contacts found</p>
                        <p className="text-slate-500 text-sm mt-1">Try a different search or add a new contact</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              // Add New Contact Form
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      placeholder="e.g., Patrick"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      placeholder="e.g., Lowenthal"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={newContact.phone}
                    onChange={handlePhoneChange}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    placeholder="(305) 555-0100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Company / Role
                  </label>
                  <input
                    type="text"
                    value={newContact.company}
                    onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    placeholder="Activate Swag"
                  />
                </div>

                {/* Add to Contacts Module checkbox */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative mt-0.5">
                      <input
                        type="checkbox"
                        checked={addToContactsModule}
                        onChange={(e) => setAddToContactsModule(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-5 h-5 rounded-md border-2 border-blue-300 bg-white peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all flex items-center justify-center">
                        {addToContactsModule && (
                          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-blue-900">Also save to Contacts module</p>
                      <p className="text-xs text-blue-600 mt-0.5">
                        This contact will be added to the global Contacts directory so it's available across all modules
                      </p>
                    </div>
                    <BookUser className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  </label>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddContact}
                  disabled={!firstName.trim() || isSaving}
                  className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Add Contact'
                  )}
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
