import { motion, AnimatePresence } from 'motion/react';
import { X, User, Plus, Search } from 'lucide-react';
import { useState } from 'react';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
}

interface ContactSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectContact: (contact: Contact) => void;
  existingContacts?: Contact[];
}

export function ContactSelector({ isOpen, onClose, onSelectContact, existingContacts = [] }: ContactSelectorProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newContact, setNewContact] = useState<Omit<Contact, 'id'>>({
    name: '',
    email: '',
    phone: '',
    company: ''
  });

  // Sample contacts (would come from API/database)
  const sampleContacts: Contact[] = existingContacts.length > 0 ? existingContacts : [
    { id: '1', name: 'John Smith', email: 'john@example.com', phone: '(305) 555-0100', company: 'Acme Corp' },
    { id: '2', name: 'Sarah Johnson', email: 'sarah@example.com', phone: '(305) 555-0101', company: 'Tech Solutions' },
    { id: '3', name: 'Michael Brown', email: 'michael@example.com', phone: '(305) 555-0102', company: 'Global Imports' },
    { id: '4', name: 'Emily Davis', email: 'emily@example.com', phone: '(305) 555-0103', company: 'Retail Plus' },
  ];

  const filteredContacts = sampleContacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectContact = (contact: Contact) => {
    onSelectContact(contact);
    onClose();
  };

  const handleAddContact = () => {
    if (!newContact.name || !newContact.email) return;
    
    const contact: Contact = {
      id: String(Date.now()),
      ...newContact
    };
    
    onSelectContact(contact);
    onClose();
  };

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

                {/* Contacts List */}
                <div className="space-y-2">
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
                          <p className="font-semibold text-slate-900">{contact.name}</p>
                          <p className="text-sm text-slate-600">{contact.email}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <p className="text-sm text-slate-500">{contact.phone}</p>
                            {contact.company && (
                              <>
                                <span className="text-slate-300">•</span>
                                <p className="text-sm text-slate-500">{contact.company}</p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  ))}

                  {filteredContacts.length === 0 && (
                    <div className="text-center py-12">
                      <User className="w-16 h-16 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-600 font-medium">No contacts found</p>
                      <p className="text-slate-500 text-sm mt-1">Try a different search or add a new contact</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Add New Contact Form
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    placeholder="John Smith"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    placeholder="(305) 555-0100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Company
                  </label>
                  <input
                    type="text"
                    value={newContact.company}
                    onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    placeholder="Acme Corp"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddContact}
                  disabled={!newContact.name || !newContact.email}
                  className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Contact
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
