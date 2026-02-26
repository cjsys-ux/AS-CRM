import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Edit, Phone, Globe, FileText, DollarSign, ShoppingCart, FileCheck, MapPin, Plus, Upload, X, Calendar, User, Mail, Building2, Trash2, Star, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';
import { AddContactDrawer } from './AddContactDrawer';
import { AddAddressDrawer } from './AddAddressDrawer';
import { AddFileDrawer } from './AddFileDrawer';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-c0840c88`;

interface CustomerDetailViewProps {
  customerId: string;
  onBack: () => void;
  onEdit: () => void;
}

interface Customer {
  id: string;
  name: string;
  logo: string;
  industry: string;
  size: string;
  status: string;
  resaleCert: string;
  website: string;
  phone?: string;
  paymentTerms?: string;
  spend: number;
}

interface Note {
  id: string;
  text: string;
  author: string;
  timestamp: string;
}

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
}

interface Address {
  id: string;
  type: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country?: string;
  isPrimary: boolean;
  contactId?: string;
  contactName?: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Active':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'Inactive':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    case 'Pending':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

export function CustomerDetailView({ customerId, onBack, onEdit }: CustomerDetailViewProps) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isAddContactDrawerOpen, setIsAddContactDrawerOpen] = useState(false);
  const [isAddAddressDrawerOpen, setIsAddAddressDrawerOpen] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isDeleteContactModalOpen, setIsDeleteContactModalOpen] = useState(false);
  const [isDeleteAddressModalOpen, setIsDeleteAddressModalOpen] = useState(false);
  const [isDeleteFileModalOpen, setIsDeleteFileModalOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);
  const [addressToDelete, setAddressToDelete] = useState<Address | null>(null);
  const [fileToDelete, setFileToDelete] = useState<any | null>(null);
  const [fileInputRef, setFileInputRef] = useState<HTMLInputElement | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [isAddFileDrawerOpen, setIsAddFileDrawerOpen] = useState(false);

  useEffect(() => {
    fetchCustomerDetails();
  }, [customerId]);

  const fetchCustomerDetails = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/customers/${customerId}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      const result = await response.json();
      
      if (result.success) {
        setCustomer(result.customer);
        
        // Load contacts
        if (result.customer.contacts) {
          setContacts(result.customer.contacts);
        }
        
        // Load addresses
        if (result.customer.addresses) {
          setAddresses(result.customer.addresses);
        }
        
        // Load documents
        if (result.customer.documents) {
          setDocuments(result.customer.documents);
        }
      } else {
        toast.error('Failed to load customer details');
      }
    } catch (error) {
      console.error('Error fetching customer:', error);
      toast.error('Error loading customer details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;

    const note: Note = {
      id: Date.now().toString(),
      text: newNote,
      author: 'Current User',
      timestamp: new Date().toISOString(),
    };

    setNotes([note, ...notes]);
    setNewNote('');
    toast.success('Note added successfully');
  };

  const handleAddContact = async (contact: Contact) => {
    try {
      const response = await fetch(`${API_URL}/customers/${customerId}/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(contact),
      });

      const result = await response.json();
      
      if (result.success) {
        setContacts([...contacts, result.contact]);
        toast.success('Contact added successfully');
      } else {
        toast.error('Failed to add contact');
      }
    } catch (error) {
      console.error('Error adding contact:', error);
      toast.error('Error adding contact');
    }
  };

  const handleDeleteContact = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/customers/${customerId}/contacts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      const result = await response.json();
      
      if (result.success) {
        setContacts(contacts.filter(c => c.id !== id));
        toast.success('Contact deleted successfully');
      } else {
        toast.error('Failed to delete contact');
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast.error('Error deleting contact');
    }
  };

  const handleAddAddress = async (address: Address) => {
    try {
      // If new address is primary, set all others to non-primary first
      if (address.isPrimary) {
        setAddresses(addresses.map(a => ({ ...a, isPrimary: false })));
      }

      const response = await fetch(`${API_URL}/customers/${customerId}/addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(address),
      });

      const result = await response.json();
      
      if (result.success) {
        setAddresses([...addresses.filter(a => !address.isPrimary || !a.isPrimary), result.address]);
        toast.success('Address added successfully');
      } else {
        toast.error('Failed to add address');
      }
    } catch (error) {
      console.error('Error adding address:', error);
      toast.error('Error adding address');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/customers/${customerId}/addresses/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      const result = await response.json();
      
      if (result.success) {
        setAddresses(addresses.filter(a => a.id !== id));
        toast.success('Address deleted successfully');
      } else {
        toast.error('Failed to delete address');
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error('Error deleting address');
    }
  };

  const handleSetPrimaryAddress = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/customers/${customerId}/addresses/${id}/primary`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      const result = await response.json();
      
      if (result.success) {
        setAddresses(addresses.map(a => ({ ...a, isPrimary: a.id === id })));
        toast.success('Primary address updated');
      } else {
        toast.error('Failed to update primary address');
      }
    } catch (error) {
      console.error('Error updating primary address:', error);
      toast.error('Error updating primary address');
    }
  };

  const handleFileUpload = async (file: File, fileName: string, fileType: string) => {
    setIsUploadingFile(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', fileName);
    formData.append('fileType', fileType);

    try {
      const response = await fetch(`${API_URL}/customers/${customerId}/files`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: formData,
      });

      const result = await response.json();
      
      if (result.success) {
        setDocuments([...documents, result.file]);
        toast.success('File uploaded successfully');
      } else {
        toast.error(`Failed to upload file: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(`Error uploading file: ${error}`);
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      const response = await fetch(`${API_URL}/customers/${customerId}/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      const result = await response.json();
      
      if (result.success) {
        setDocuments(documents.filter(d => d.id !== fileId));
        toast.success('File deleted successfully');
      } else {
        toast.error('Failed to delete file');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Error deleting file');
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading customer details...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">Customer not found</p>
          <button onClick={onBack} className="mt-4 text-blue-600 hover:text-blue-700">
            Back to Customers
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'orders', label: 'Orders' },
    { id: 'invoices', label: 'Invoices' },
    { id: 'contacts', label: 'Contacts' },
    { id: 'addresses', label: 'Addresses' },
    { id: 'files', label: 'Files' },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
      {/* Header with Back Button */}
      <div className="bg-white border-b-2 border-slate-200 px-8 py-4 flex-shrink-0">
        <div className="max-w-[1800px] mx-auto">
          <motion.button
            whileHover={{ x: -4 }}
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Customers
          </motion.button>
        </div>
      </div>

      {/* Customer Header */}
      <div className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 px-8 py-8 shadow-lg flex-shrink-0">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-6">
              {/* Logo */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="w-24 h-24 rounded-3xl bg-white shadow-2xl p-2 flex items-center justify-center overflow-hidden"
              >
                {customer.logo ? (
                  <img src={customer.logo} alt={customer.name} className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  <Building2 className="w-12 h-12 text-slate-400" />
                )}
              </motion.div>

              {/* Customer Info */}
              <div>
                <div className="flex items-center gap-4 mb-3">
                  <h1 className="text-4xl font-bold text-white">{customer.name}</h1>
                  <span className={`px-4 py-1.5 rounded-full text-sm font-bold border-2 ${getStatusColor(customer.status)}`}>
                    {customer.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  {/* Phone */}
                  {customer.phone && customer.phone !== '—' && (
                    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-3 rounded-xl">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <Phone className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-blue-100 font-medium">Phone</p>
                        <p className="text-sm text-white font-semibold">{customer.phone}</p>
                      </div>
                    </div>
                  )}

                  {/* Website */}
                  {customer.website && customer.website !== '—' && (
                    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-3 rounded-xl">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <Globe className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-blue-100 font-medium">Website</p>
                        <a
                          href={`https://${customer.website.replace(/^https?:\/\//, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-white font-semibold hover:underline"
                        >
                          {customer.website}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Payment Terms */}
                  {customer.paymentTerms && (
                    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-3 rounded-xl">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-blue-100 font-medium">Payment Terms</p>
                        <p className="text-sm text-white font-semibold">{customer.paymentTerms}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Edit Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onEdit}
              className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <Edit className="w-5 h-5" />
              Edit Customer
            </motion.button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="px-8 -mt-6 mb-6 relative z-10 flex-shrink-0">
        <div className="max-w-[1800px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Total Spend */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <DollarSign className="w-7 h-7 text-white" />
                </div>
                <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                  Total
                </div>
              </div>
              <p className="text-sm font-medium text-slate-600 mb-1">Total Spend</p>
              <h3 className="text-4xl font-bold text-slate-900">${(customer.spend / 1000).toFixed(0)}K</h3>
            </motion.div>

            {/* Orders */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <ShoppingCart className="w-7 h-7 text-white" />
                </div>
                <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                  Active
                </div>
              </div>
              <p className="text-sm font-medium text-slate-600 mb-1">Orders</p>
              <h3 className="text-4xl font-bold text-slate-900">0</h3>
            </motion.div>

            {/* Invoices */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <FileCheck className="w-7 h-7 text-white" />
                </div>
                <div className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
                  Paid
                </div>
              </div>
              <p className="text-sm font-medium text-slate-600 mb-1">Invoices</p>
              <h3 className="text-4xl font-bold text-slate-900">0</h3>
            </motion.div>

            {/* Contacts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <User className="w-7 h-7 text-white" />
                </div>
                <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                  Active
                </div>
              </div>
              <p className="text-sm font-medium text-slate-600 mb-1">Contacts</p>
              <h3 className="text-4xl font-bold text-slate-900">{contacts.length}</h3>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-8 bg-white border-b-2 border-slate-200 flex-shrink-0">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ y: -2 }}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-6 py-4 font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'text-blue-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-8 py-8">
          <div className="max-w-[1800px] mx-auto space-y-8 pb-8">
            {activeTab === 'overview' && (
              <>
                {/* Customer Details Card */}
                <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">Customer Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-semibold text-slate-600 mb-2">Industry</p>
                      <p className="text-lg text-slate-900">{customer.industry}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-600 mb-2">Company Size</p>
                      <p className="text-lg text-slate-900">{customer.size}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-600 mb-2">Resale Certificate</p>
                      <p className="text-lg text-slate-900">{customer.resaleCert}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-600 mb-2">Customer ID</p>
                      <p className="text-lg text-slate-900 font-mono">{customer.id}</p>
                    </div>
                  </div>
                </div>

                {/* Internal Notes */}
                <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-lg p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-slate-900">Internal Notes</h2>
                    <div className="text-sm text-slate-600">{notes.length} notes</div>
                  </div>

                  {/* Add Note */}
                  <div className="mb-6">
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add a note about this customer..."
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all resize-none"
                      rows={3}
                    />
                    <div className="flex justify-end mt-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleAddNote}
                        disabled={!newNote.trim()}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-4 h-4" />
                        Add Note
                      </motion.button>
                    </div>
                  </div>

                  {/* Notes List */}
                  <div className="space-y-4">
                    {notes.length === 0 ? (
                      <div className="text-center py-12">
                        <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500">No notes yet. Add your first note above.</p>
                      </div>
                    ) : (
                      notes.map((note) => (
                        <motion.div
                          key={note.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-slate-50 rounded-2xl p-5 border border-slate-200"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900">{note.author}</p>
                                <p className="text-xs text-slate-500">
                                  {new Date(note.timestamp).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                          <p className="text-slate-700 leading-relaxed">{note.text}</p>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>

                {/* Documents */}
                <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-lg p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-slate-900">Documents</h2>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                      <Upload className="w-5 h-5" />
                      Upload Document
                    </motion.button>
                  </div>
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">No documents uploaded yet.</p>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'orders' && (
              <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-lg p-8 text-center py-20">
                <ShoppingCart className="w-20 h-20 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">No Orders Yet</h3>
                <p className="text-slate-600">Orders from this customer will appear here.</p>
              </div>
            )}

            {activeTab === 'invoices' && (
              <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-lg p-8 text-center py-20">
                <FileCheck className="w-20 h-20 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">No Invoices Yet</h3>
                <p className="text-slate-600">Invoices for this customer will appear here.</p>
              </div>
            )}

            {activeTab === 'contacts' && (
              <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-lg">
                <div className="px-8 py-6 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-900">Contact Persons</h2>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsAddContactDrawerOpen(true)}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                      <Plus className="w-5 h-5" />
                      Add Contact
                    </motion.button>
                  </div>
                </div>

                {contacts.length === 0 ? (
                  <div className="text-center py-32 px-8">
                    <User className="w-20 h-20 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No Contacts Yet</h3>
                    <p className="text-slate-600">Add contact persons for this customer.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-b-3xl">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-slate-50 via-slate-100 to-slate-50">
                        <tr className="border-b-2 border-slate-200">
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 tracking-wider">Name</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 tracking-wider">Email</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 tracking-wider">Phone</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 tracking-wider">Role</th>
                          <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contacts.map((contact, index) => (
                          <motion.tr
                            key={contact.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                                  <User className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-sm font-semibold text-slate-900">{contact.firstName} {contact.lastName}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-slate-400" />
                                <a href={`mailto:${contact.email}`} className="text-sm text-blue-600 hover:text-blue-700 hover:underline">
                                  {contact.email}
                                </a>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-slate-400" />
                                <span className="text-sm text-slate-700">{contact.phone || '—'}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-slate-700">{contact.role || '—'}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-2">
                                <motion.button
                                  whileHover={{ scale: 1.15, backgroundColor: 'rgb(254 226 226)' }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => {
                                    setContactToDelete(contact);
                                    setIsDeleteContactModalOpen(true);
                                  }}
                                  className="p-2.5 hover:bg-red-50 rounded-xl transition-colors group/btn border-2 border-transparent hover:border-red-200"
                                >
                                  <Trash2 className="w-5 h-5 text-slate-400 group-hover/btn:text-red-600" />
                                </motion.button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-lg">
                <div className="px-8 py-6 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-900">Addresses</h2>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsAddAddressDrawerOpen(true)}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                      <Plus className="w-5 h-5" />
                      Add Address
                    </motion.button>
                  </div>
                </div>

                {addresses.length === 0 ? (
                  <div className="text-center py-32 px-8">
                    <MapPin className="w-20 h-20 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No Addresses Yet</h3>
                    <p className="text-slate-600">Add shipping or billing addresses for this customer.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-b-3xl">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-slate-50 via-slate-100 to-slate-50">
                        <tr className="border-b-2 border-slate-200">
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 tracking-wider">Type</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 tracking-wider">Address</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 tracking-wider">City</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 tracking-wider">State</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 tracking-wider">ZIP</th>
                          <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 tracking-wider">Primary</th>
                          <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {addresses.map((address, index) => (
                          <motion.tr
                            key={address.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border ${
                                address.type === 'Shipping' 
                                  ? 'bg-blue-100 text-blue-700 border-blue-200' 
                                  : 'bg-purple-100 text-purple-700 border-purple-200'
                              }`}>
                                {address.type === 'Shipping' ? <MapPin className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
                                {address.type}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-slate-900">{address.street}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-slate-700">{address.city}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-slate-700">{address.state}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-slate-700">{address.zip}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex justify-center">
                                {address.isPrimary ? (
                                  <span className="flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold border border-amber-200">
                                    <Star className="w-3 h-3 fill-amber-500" />
                                    Primary
                                  </span>
                                ) : (
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleSetPrimaryAddress(address.id)}
                                    className="text-xs text-slate-500 hover:text-amber-600 font-medium"
                                  >
                                    Set Primary
                                  </motion.button>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-2">
                                <motion.button
                                  whileHover={{ scale: 1.15, backgroundColor: 'rgb(254 226 226)' }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => {
                                    setAddressToDelete(address);
                                    setIsDeleteAddressModalOpen(true);
                                  }}
                                  className="p-2.5 hover:bg-red-50 rounded-xl transition-colors group/btn border-2 border-transparent hover:border-red-200"
                                >
                                  <Trash2 className="w-5 h-5 text-slate-400 group-hover/btn:text-red-600" />
                                </motion.button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'files' && (
              <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-lg">
                <div className="px-8 py-6 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-900">Files</h2>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsAddFileDrawerOpen(true)}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                      <Upload className="w-5 h-5" />
                      Upload File
                    </motion.button>
                  </div>
                </div>

                {documents.length === 0 ? (
                  <div className="text-center py-20">
                    <FileText className="w-20 h-20 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No Files Yet</h3>
                    <p className="text-slate-600">Upload files related to this customer.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-b-3xl">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-slate-50 via-slate-100 to-slate-50">
                        <tr className="border-b-2 border-slate-200">
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 tracking-wider">Name</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 tracking-wider">Type</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 tracking-wider">Size</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 tracking-wider">Uploaded By</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 tracking-wider">Uploaded On</th>
                          <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {documents.map((doc, index) => (
                          <motion.tr
                            key={doc.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                                  <FileText className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-sm font-semibold text-slate-900">{doc.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-slate-700">{doc.type}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-slate-700">{doc.size}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                                  <User className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-sm text-slate-700">{doc.uploadedBy || 'Admin User'}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-slate-700">{new Date(doc.uploadedOn).toLocaleString()}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-2">
                                <motion.button
                                  whileHover={{ scale: 1.15, backgroundColor: 'rgb(254 226 226)' }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => {
                                    setFileToDelete(doc);
                                    setIsDeleteFileModalOpen(true);
                                  }}
                                  className="p-2.5 hover:bg-red-50 rounded-xl transition-colors group/btn border-2 border-transparent hover:border-red-200"
                                >
                                  <Trash2 className="w-5 h-5 text-slate-400 group-hover/btn:text-red-600" />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.15, backgroundColor: 'rgb(236 246 255)' }}
                                  whileTap={{ scale: 0.95 }}
                                  className="p-2.5 hover:bg-blue-50 rounded-xl transition-colors group/btn border-2 border-transparent hover:border-blue-200"
                                >
                                  <Download className="w-5 h-5 text-slate-400 group-hover/btn:text-blue-600" />
                                </motion.button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Contact Drawer */}
      <AddContactDrawer
        isOpen={isAddContactDrawerOpen}
        onClose={() => setIsAddContactDrawerOpen(false)}
        onSuccess={handleAddContact}
      />

      {/* Add Address Drawer */}
      <AddAddressDrawer
        isOpen={isAddAddressDrawerOpen}
        onClose={() => setIsAddAddressDrawerOpen(false)}
        onSuccess={handleAddAddress}
        contacts={contacts}
      />

      {/* Add File Drawer */}
      <AddFileDrawer
        isOpen={isAddFileDrawerOpen}
        onClose={() => setIsAddFileDrawerOpen(false)}
        onSuccess={handleFileUpload}
      />

      {/* Delete Contact Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteContactModalOpen}
        onClose={() => setIsDeleteContactModalOpen(false)}
        onConfirm={() => {
          if (contactToDelete) {
            handleDeleteContact(contactToDelete.id);
          }
          setIsDeleteContactModalOpen(false);
        }}
        title="Delete Contact"
        message="Are you sure you want to delete this contact?"
        itemName={contactToDelete ? `${contactToDelete.firstName} ${contactToDelete.lastName}` : ''}
      />

      {/* Delete Address Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteAddressModalOpen}
        onClose={() => setIsDeleteAddressModalOpen(false)}
        onConfirm={() => {
          if (addressToDelete) {
            handleDeleteAddress(addressToDelete.id);
          }
          setIsDeleteAddressModalOpen(false);
        }}
        title="Delete Address"
        message="Are you sure you want to delete this address?"
        itemName={addressToDelete ? `${addressToDelete.street}, ${addressToDelete.city}, ${addressToDelete.state}` : ''}
      />

      {/* Delete File Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteFileModalOpen}
        onClose={() => setIsDeleteFileModalOpen(false)}
        onConfirm={() => {
          if (fileToDelete) {
            handleDeleteFile(fileToDelete.id);
          }
          setIsDeleteFileModalOpen(false);
        }}
        title="Delete File"
        message="Are you sure you want to delete this file?"
        itemName={fileToDelete ? fileToDelete.name : ''}
      />
    </div>
  );
}