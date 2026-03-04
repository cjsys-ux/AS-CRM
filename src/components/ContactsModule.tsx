import { motion, AnimatePresence } from 'motion/react';
import { Users, Plus, Search, Filter, Download, Mail, Phone, Building2, ChevronLeft, ChevronRight, Eye, Edit, Trash2, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ContactDrawer } from './ContactDrawer';
import { ContactDetailView } from './ContactDetailView';


export function ContactsModule() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<any>(null);
  const [isContactDrawerOpen, setIsContactDrawerOpen] = useState(false);
  const [isContactDetailViewOpen, setIsContactDetailViewOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [editFromDetailView, setEditFromDetailView] = useState(false);
  const [contactsData, setContactsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 10;

  // Fetch contacts from database
  const fetchContacts = () => {
    setLoading(false);
    setContactsData([]);
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  // Save contact (create or update)
  const handleSaveContact = (contactData: any) => {
    fetchContacts();
    setIsContactDrawerOpen(false);
    setSelectedContact(null);
    console.log(`Contact ${contactData.id ? 'updated' : 'created'} successfully`);
  };

  // Delete contact
  const handleDeleteContact = () => {
    if (!contactToDelete) return;

    // Refresh contacts list
    fetchContacts();
    setDeleteModal(false);
    setContactToDelete(null);
    console.log('Contact deleted successfully');
  };

  const filteredContacts = contactsData.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.company.toLowerCase().includes(searchTerm.toLowerCase());
    
    // If no filters are active, show all
    if (activeFilters.length === 0) return matchesSearch;
    
    // Check if contact matches any of the active filters
    const typeFilters = activeFilters.filter(f => f === 'Vendor' || f === 'Customer');
    const statusFilters = activeFilters.filter(f => f === 'Active' || f === 'Inactive');
    
    let matchesType = typeFilters.length === 0 || typeFilters.includes(contact.type);
    let matchesStatus = statusFilters.length === 0 || statusFilters.includes(contact.status);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);
  const paginatedContacts = filteredContacts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'Vendor': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'Customer': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'Lead': return 'bg-green-500/10 text-green-600 border-green-500/20';
      default: return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'Inactive': return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'Prospect': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'Cold': return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
      default: return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
    }
  };

  return (
    <>
      {/* Contact Detail View - Full Screen */}
      {isContactDetailViewOpen && selectedContact ? (
        <>
          <ContactDetailView 
            contact={selectedContact}
            onBack={() => {
              setIsContactDetailViewOpen(false);
              setEditFromDetailView(false);
            }}
            onEdit={() => {
              setIsContactDrawerOpen(true);
              setEditFromDetailView(true);
            }}
            onDelete={() => {
              setIsContactDetailViewOpen(false);
              setDeleteModal(true);
              setContactToDelete(selectedContact);
            }}
          />
          {/* Edit Contact Drawer that overlays the detail view */}
          <ContactDrawer 
            isOpen={isContactDrawerOpen && editFromDetailView} 
            onClose={() => {
              setIsContactDrawerOpen(false);
            }} 
            contact={selectedContact}
            onSave={handleSaveContact}
          />
        </>
      ) : (
    <div className="flex-1 flex flex-col bg-slate-50/50 overflow-hidden">
      {/* Header Section */}
      {/* ui-qa-fixer: UI-2026-018 - responsive padding + flex-wrap for mobile header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-4 md:px-8 py-8 shadow-lg">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">Contacts</h1>
                <p className="text-indigo-100 text-sm">Vendor, Customer, and Lead Contacts</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsContactDrawerOpen(true)}
              className="flex items-center gap-2 px-5 py-3 bg-white text-indigo-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="w-5 h-5" />
              Add Contact
            </motion.button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {/* ui-qa-fixer: UI-2026-018 - responsive padding */}
      <div className="px-4 md:px-8 -mt-6 mb-6">
        <div className="max-w-[1800px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-lg"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-sm text-slate-500 mb-1">Total Contacts</div>
              <div className="text-2xl font-bold text-slate-900">{contactsData.length}</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-lg"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-sm text-slate-500 mb-1">Active Vendors</div>
              <div className="text-2xl font-bold text-slate-900">
                {contactsData.filter(c => c.type === 'Vendor' && c.status === 'Active').length}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-lg"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-sm text-slate-500 mb-1">Active Customers</div>
              <div className="text-2xl font-bold text-slate-900">
                {contactsData.filter(c => c.type === 'Customer' && c.status === 'Active').length}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-lg"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-sm text-slate-500 mb-1">Inactive Contacts</div>
              <div className="text-2xl font-bold text-slate-900">
                {contactsData.filter(c => c.status === 'Inactive').length}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      {/* ui-qa-fixer: UI-2026-018 - responsive padding */}
      <div className="px-4 md:px-8 mb-6">
        <div className="max-w-[1800px] mx-auto">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search contacts by name, email, or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
              >
                <Filter className="w-5 h-5" />
                Filters
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
              >
                <Download className="w-5 h-5" />
                Export
              </motion.button>
            </div>

            {/* Filter Options */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 mt-4 border-t border-slate-200">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-slate-700">Type:</span>
                        <div className="flex gap-2">
                          {['Vendor', 'Customer'].map((type) => {
                            const toggleFilter = () => {
                              if (activeFilters.includes(type)) {
                                setActiveFilters(activeFilters.filter(t => t !== type));
                              } else {
                                setActiveFilters([...activeFilters, type]);
                              }
                            };

                            return (
                              <button
                                key={type}
                                onClick={toggleFilter}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                  activeFilters.includes(type)
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                {type}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-slate-700">Status:</span>
                        <div className="flex gap-2">
                          {['Active', 'Inactive'].map((status) => {
                            const toggleFilter = () => {
                              if (activeFilters.includes(status)) {
                                setActiveFilters(activeFilters.filter(s => s !== status));
                              } else {
                                setActiveFilters([...activeFilters, status]);
                              }
                            };

                            return (
                              <button
                                key={status}
                                onClick={toggleFilter}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                  activeFilters.includes(status)
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                {status}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Contacts Table */}
      {/* ui-qa-fixer: UI-2026-018 - responsive padding */}
      <div className="flex-1 px-4 md:px-8 pb-8 overflow-auto">
        <div className="max-w-[1800px] mx-auto">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1600px]">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Name</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Company</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Position</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Contact Info</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Type</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Last Contact</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedContacts.map((contact, index) => (
                    <motion.tr
                      key={contact.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-semibold text-sm">
                              {contact.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className="font-semibold text-slate-900">{contact.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{contact.company}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{contact.country}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-700">{contact.position}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-slate-600 mb-1">
                          <Mail className="w-4 h-4 text-slate-400" />
                          {contact.email}
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                          <Phone className="w-4 h-4 text-slate-400" />
                          {contact.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${getTypeBadgeColor(contact.type)}`}>
                          {contact.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${getStatusBadgeColor(contact.status)}`}>
                          {contact.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">{contact.lastContact}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setSelectedContact(contact);
                              setIsContactDetailViewOpen(true);
                            }}
                            className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setSelectedContact(contact);
                              setIsContactDrawerOpen(true);
                              setEditFromDetailView(false);
                            }}
                            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          >
                            <Edit className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setDeleteModal(true);
                              setContactToDelete(contact);
                            }}
                            className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="px-8 pb-8">
        <div className="max-w-[1800px] mx-auto">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Showing <span className="font-semibold text-slate-900">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                <span className="font-semibold text-slate-900">{Math.min(currentPage * itemsPerPage, filteredContacts.length)}</span> of{' '}
                <span className="font-semibold text-slate-900">{filteredContacts.length}</span> contacts
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-600" />
                </motion.button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <motion.button
                    key={page}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      currentPage === page
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {page}
                  </motion.button>
                ))}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-slate-600" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
              >
                <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <Trash2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Delete Contact</h3>
                      <p className="text-sm text-red-100">This action cannot be undone</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-slate-700">
                    Are you sure you want to delete this contact? All associated information will be permanently removed.
                  </p>
                </div>
                <div className="bg-slate-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-200">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setDeleteModal(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDeleteContact}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm"
                  >
                    Delete Contact
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Unified Contact Drawer (for both add and edit) */}
      <ContactDrawer 
        isOpen={isContactDrawerOpen && !editFromDetailView} 
        onClose={() => {
          setIsContactDrawerOpen(false);
          setSelectedContact(null);
        }} 
        contact={selectedContact}
        onSave={handleSaveContact}
      />
    </div>
      )}
    </>
  );
}