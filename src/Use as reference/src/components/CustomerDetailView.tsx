import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Edit, Phone, Globe, FileText, DollarSign, ShoppingCart, FileCheck, MapPin, Plus, Upload, X, Calendar, User, Mail, Building2, Trash2, Star, Download, ChevronLeft, ChevronRight, Pencil, Save, Check, Loader2, AlertTriangle, Hash, CreditCard, Clock, Receipt, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';
import { AddContactDrawer } from './AddContactDrawer';
import { AddAddressDrawer } from './AddAddressDrawer';
import { AddFileDrawer } from './AddFileDrawer';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { DatePicker } from './DatePicker';
import { ImageWithFallback } from './figma/ImageWithFallback';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-c0840c88`;

interface CustomerDetailViewProps {
  customerId: string;
  onBack: () => void;
  onCustomerUpdated?: (customer: Customer) => void;
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

export function CustomerDetailView({ customerId, onBack, onCustomerUpdated }: CustomerDetailViewProps) {
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

  // ─── Activity, Notes, Billing state ───
  const [activities, setActivities] = useState<any[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [billingInvoices, setBillingInvoices] = useState<any[]>([]);
  const [loadingBilling, setLoadingBilling] = useState(false);
  const [showAddInvoice, setShowAddInvoice] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({ invoiceNumber: '', amount: '', dueDate: '', description: '', status: 'Open' });
  const [persistedNotes, setPersistedNotes] = useState<any[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);

  // ─── Inline editing state ───
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // ─── Inline edit handlers ───
  const handleEditSection = (section: string) => {
    if (section === 'details' && customer) {
      setEditForm({
        name: customer.name || '',
        industry: customer.industry || '',
        size: customer.size || '',
        status: customer.status || 'Active',
        resaleCert: customer.resaleCert || '',
        website: customer.website || '',
        phone: customer.phone || '',
        paymentTerms: customer.paymentTerms || '',
      });
    }
    setEditingSection(section);
  };

  const handleSaveEdit = async () => {
    if (!customer) return;
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/customers/${customerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(editForm),
      });
      const result = await response.json();
      if (result.success) {
        const updated = { ...customer, ...editForm };
        setCustomer(updated);
        onCustomerUpdated?.(updated);
        setSaveSuccess('details');
        setTimeout(() => setSaveSuccess(null), 2000);
        toast.success('Customer updated successfully');
      } else {
        toast.error('Failed to update customer');
      }
    } catch (error) {
      console.error('Error updating customer:', error);
      toast.error('Error updating customer');
    } finally {
      setSaving(false);
      setEditingSection(null);
    }
  };

  useEffect(() => {
    fetchCustomerDetails();
    fetchActivities();
    fetchNotes();
    fetchBilling();
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
        if (result.customer.contacts) setContacts(result.customer.contacts);
        if (result.customer.addresses) setAddresses(result.customer.addresses);
        if (result.customer.documents) setDocuments(result.customer.documents);
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

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    try {
      const response = await fetch(`${API_URL}/customers/${customerId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` },
        body: JSON.stringify({ text: newNote }),
      });
      const result = await response.json();
      if (result.success) {
        setPersistedNotes([result.note, ...persistedNotes]);
        setNewNote('');
        toast.success('Note added successfully');
        fetchActivities();
      } else { toast.error('Failed to add note'); }
    } catch (error) { console.error('Error adding note:', error); toast.error('Error adding note'); }
  };

  const fetchActivities = async () => {
    setLoadingActivity(true);
    try {
      const res = await fetch(`${API_URL}/customers/${customerId}/activity`, { headers: { 'Authorization': `Bearer ${publicAnonKey}` } });
      const data = await res.json();
      if (data.success) setActivities(data.activities || []);
    } catch (e) { console.error('Error fetching activities:', e); }
    finally { setLoadingActivity(false); }
  };

  const fetchNotes = async () => {
    setLoadingNotes(true);
    try {
      const res = await fetch(`${API_URL}/customers/${customerId}/notes`, { headers: { 'Authorization': `Bearer ${publicAnonKey}` } });
      const data = await res.json();
      if (data.success) setPersistedNotes(data.notes || []);
    } catch (e) { console.error('Error fetching notes:', e); }
    finally { setLoadingNotes(false); }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const res = await fetch(`${API_URL}/customers/${customerId}/notes/${noteId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${publicAnonKey}` } });
      const data = await res.json();
      if (data.success) { setPersistedNotes(persistedNotes.filter(n => n.id !== noteId)); toast.success('Note deleted'); }
      else { toast.error('Failed to delete note'); }
    } catch (e) { console.error('Error deleting note:', e); toast.error('Error deleting note'); }
  };

  const fetchBilling = async () => {
    setLoadingBilling(true);
    try {
      const res = await fetch(`${API_URL}/customers/${customerId}/billing`, { headers: { 'Authorization': `Bearer ${publicAnonKey}` } });
      const data = await res.json();
      if (data.success) setBillingInvoices(data.invoices || []);
    } catch (e) { console.error('Error fetching billing:', e); }
    finally { setLoadingBilling(false); }
  };

  const handleCreateInvoice = async () => {
    try {
      const res = await fetch(`${API_URL}/customers/${customerId}/billing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` },
        body: JSON.stringify({ ...invoiceForm, amount: parseFloat(invoiceForm.amount) || 0 }),
      });
      const data = await res.json();
      if (data.success) { setBillingInvoices([data.invoice, ...billingInvoices]); setShowAddInvoice(false); setInvoiceForm({ invoiceNumber: '', amount: '', dueDate: '', description: '', status: 'Open' }); toast.success('Invoice created'); fetchActivities(); }
      else { toast.error('Failed to create invoice'); }
    } catch (e) { console.error('Error creating invoice:', e); toast.error('Error creating invoice'); }
  };

  const handleUpdateInvoiceStatus = async (invoiceId: string, status: string) => {
    try {
      const res = await fetch(`${API_URL}/customers/${customerId}/billing/${invoiceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) { setBillingInvoices(billingInvoices.map(inv => inv.id === invoiceId ? data.invoice : inv)); toast.success(`Invoice marked as ${status}`); fetchActivities(); }
      else { toast.error('Failed to update invoice'); }
    } catch (e) { console.error('Error updating invoice:', e); toast.error('Error updating invoice'); }
  };

  const handleAddContact = async (contact: Contact) => {
    try {
      const response = await fetch(`${API_URL}/customers/${customerId}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` },
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
        headers: { 'Authorization': `Bearer ${publicAnonKey}` },
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
      if (address.isPrimary) {
        setAddresses(addresses.map(a => ({ ...a, isPrimary: false })));
      }
      const response = await fetch(`${API_URL}/customers/${customerId}/addresses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` },
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
        headers: { 'Authorization': `Bearer ${publicAnonKey}` },
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
        headers: { 'Authorization': `Bearer ${publicAnonKey}` },
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
        headers: { 'Authorization': `Bearer ${publicAnonKey}` },
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
        headers: { 'Authorization': `Bearer ${publicAnonKey}` },
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
    { id: 'billing', label: 'Billing' },
    { id: 'orders', label: 'Orders' },
    { id: 'contacts', label: `Contacts (${contacts.length})` },
    { id: 'addresses', label: `Addresses (${addresses.length})` },
    { id: 'files', label: `Files (${documents.length})` },
    { id: 'notes', label: 'Notes' },
    { id: 'activity', label: 'Activity' },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
      {/* ─── Header ─── */}
      <div className="bg-slate-800 px-8 py-5">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center justify-between mb-4">
            <motion.button
              whileHover={{ scale: 1.05, x: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="flex items-center gap-2 text-white/90 hover:text-white font-medium transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Customers
            </motion.button>
          </div>
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl overflow-hidden">
              {customer.logo ? (
                <ImageWithFallback src={customer.logo} alt={customer.name} className="w-full h-full object-contain" />
              ) : (
                <span className="text-xl font-black text-blue-600">
                  {customer.name?.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{customer.name}</h1>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${getStatusColor(customer.status)} bg-white`}>
                  {customer.status}
                </span>
                {customer.industry && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-white/20 text-white border border-white/30">
                    {customer.industry}
                  </span>
                )}
                {customer.size && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-white/10 text-white/80 border border-white/20">
                    {customer.size}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 mt-5 -mb-5">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-t-xl text-sm font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-slate-50 text-blue-700 shadow-sm'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Content ─── */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-[1400px] mx-auto">

          {/* ════════════ OVERVIEW TAB ════════════ */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Row */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Total Spend', value: `$${(customer.spend / 1000).toFixed(0)}K`, icon: DollarSign, bgColor: 'bg-green-100', textColor: 'text-green-600' },
                  { label: 'Orders', value: '0', icon: ShoppingCart, bgColor: 'bg-blue-100', textColor: 'text-blue-600' },
                  { label: 'Invoices', value: '0', icon: FileCheck, bgColor: 'bg-orange-100', textColor: 'text-orange-600' },
                  { label: 'Contacts', value: String(contacts.length), icon: User, bgColor: 'bg-purple-100', textColor: 'text-purple-600' },
                ].map((stat, idx) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm"
                  >
                    <div className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center mb-2`}>
                      <stat.icon className={`w-5 h-5 ${stat.textColor}`} />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                    <div className="text-sm text-slate-500">{stat.label}</div>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-6">
                {/* ─── Customer Information (editable) ─── */}
                <div className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden"
                  >
                    <div className="bg-gradient-to-r from-cyan-50 to-blue-50 px-6 py-4 border-b border-slate-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-slate-900">Customer Details</h3>
                            <p className="text-sm text-slate-500">Company information & settings</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {saveSuccess && (
                            <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">
                              <Check className="w-3.5 h-3.5 inline mr-1" /> Saved
                            </motion.span>
                          )}
                          {editingSection === 'details' ? (
                            <div className="flex items-center gap-2">
                              <button onClick={() => { setEditingSection(null); setEditForm({}); }} className="px-3 py-1.5 text-sm font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">Cancel</button>
                              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSaveEdit} disabled={saving} className="px-4 py-1.5 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-1.5">
                                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save
                              </motion.button>
                            </div>
                          ) : (
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleEditSection('details')} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                              <Pencil className="w-3.5 h-3.5" /> Edit
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      {editingSection === 'details' ? (
                        <div className="space-y-5">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Company Name</label>
                              <input type="text" value={editForm.name || ''} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all" />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Industry</label>
                              <input type="text" value={editForm.industry || ''} onChange={e => setEditForm({ ...editForm, industry: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all" />
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Company Size</label>
                              <select value={editForm.size || ''} onChange={e => setEditForm({ ...editForm, size: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all">
                                <option value="1-100 (Small)">1-100 (Small)</option>
                                <option value="100-500 (Medium)">100-500 (Medium)</option>
                                <option value="500+ (Enterprise)">500+ (Enterprise)</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Status</label>
                              <select value={editForm.status || 'Active'} onChange={e => setEditForm({ ...editForm, status: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all">
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                                <option value="Pending">Pending</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Payment Terms</label>
                              <select value={editForm.paymentTerms || ''} onChange={e => setEditForm({ ...editForm, paymentTerms: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all">
                                <option value="">Select...</option>
                                <option value="Net 30">Net 30</option>
                                <option value="Net 60">Net 60</option>
                                <option value="Net 90">Net 90</option>
                                <option value="Prepaid">Prepaid</option>
                                <option value="COD">COD</option>
                              </select>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Phone</label>
                              <input type="text" value={editForm.phone || ''} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all" />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Website</label>
                              <input type="text" value={editForm.website || ''} onChange={e => setEditForm({ ...editForm, website: e.target.value })} placeholder="www.company.com" className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all" />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Resale Certificate</label>
                            <input type="text" value={editForm.resaleCert || ''} onChange={e => setEditForm({ ...editForm, resaleCert: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all" />
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-6">
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center shrink-0 mt-0.5"><Building2 className="w-4 h-4 text-blue-600" /></div>
                            <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Industry</p><p className="text-sm font-medium text-slate-900">{customer.industry || '—'}</p></div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center shrink-0 mt-0.5"><User className="w-4 h-4 text-purple-600" /></div>
                            <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Company Size</p><p className="text-sm font-medium text-slate-900">{customer.size || '—'}</p></div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center shrink-0 mt-0.5"><FileCheck className="w-4 h-4 text-green-600" /></div>
                            <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Resale Certificate</p><p className="text-sm font-medium text-slate-900">{customer.resaleCert || '—'}</p></div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center shrink-0 mt-0.5"><Hash className="w-4 h-4 text-slate-600" /></div>
                            <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Customer ID</p><p className="text-sm font-medium text-slate-900 font-mono">{customer.id}</p></div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center shrink-0 mt-0.5"><CreditCard className="w-4 h-4 text-amber-600" /></div>
                            <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Payment Terms</p><p className="text-sm font-medium text-slate-900">{customer.paymentTerms || '—'}</p></div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 bg-cyan-100 rounded-xl flex items-center justify-center shrink-0 mt-0.5"><Phone className="w-4 h-4 text-cyan-600" /></div>
                            <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone</p><p className="text-sm font-medium text-slate-900">{customer.phone || '—'}</p></div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0 mt-0.5"><Globe className="w-4 h-4 text-indigo-600" /></div>
                            <div>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Website</p>
                              {customer.website && customer.website !== '—' ? (
                                <a href={`https://${customer.website.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 hover:underline">{customer.website}</a>
                              ) : (
                                <p className="text-sm font-medium text-slate-900">—</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* Addresses Summary Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden"
                  >
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4 border-b border-slate-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-slate-900">Addresses</h3>
                            <p className="text-sm text-slate-500">{addresses.length} locations on file</p>
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setIsAddAddressDrawerOpen(true)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Address
                        </motion.button>
                      </div>
                    </div>
                    <div className="p-6">
                      {addresses.length === 0 ? (
                        <div className="text-center py-8">
                          <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                          <p className="text-sm text-slate-500">No addresses on file yet.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {addresses.map((address) => (
                            <div key={address.id} className="flex items-start justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                              <div className="flex items-start gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${address.type === 'Shipping' ? 'bg-blue-100' : 'bg-purple-100'}`}>
                                  {address.type === 'Shipping' ? <MapPin className="w-4 h-4 text-blue-600" /> : <Building2 className="w-4 h-4 text-purple-600" />}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-bold text-slate-900">{address.type}</span>
                                    {address.isPrimary && (
                                      <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-bold border border-amber-200">
                                        <Star className="w-3 h-3 fill-amber-500" /> Primary
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-slate-600">{address.street}, {address.city}, {address.state} {address.zip}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                {!address.isPrimary && (
                                  <button onClick={() => handleSetPrimaryAddress(address.id)} className="text-xs text-slate-500 hover:text-amber-600 font-medium px-2 py-1">Set Primary</button>
                                )}
                                <button onClick={() => { setAddressToDelete(address); setIsDeleteAddressModalOpen(true); }} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                                  <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-600" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          )}

          {/* ════════════ ORDERS TAB ════════════ */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-8 text-center py-20">
              <ShoppingCart className="w-20 h-20 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Orders Yet</h3>
              <p className="text-slate-600">Orders from this customer will appear here.</p>
            </div>
          )}

          {/* ════════════ BILLING TAB ════════════ */}
          {activeTab === 'billing' && (
            <div className="space-y-6">
              {/* Billing Stats */}
              <div className="grid grid-cols-4 gap-4">
                {(() => {
                  const open = billingInvoices.filter(i => i.status === 'Open');
                  const pastDue = billingInvoices.filter(i => i.status === 'Past Due');
                  const paid = billingInvoices.filter(i => i.status === 'Paid');
                  const openTotal = open.reduce((s: number, i: any) => s + (i.amount || 0), 0);
                  const pastDueTotal = pastDue.reduce((s: number, i: any) => s + (i.amount || 0), 0);
                  const paidTotal = paid.reduce((s: number, i: any) => s + (i.amount || 0), 0);
                  return [
                    { label: 'Total Invoices', value: billingInvoices.length, icon: Receipt, color: 'bg-blue-100 text-blue-600' },
                    { label: 'Open', value: `$${openTotal.toLocaleString()}`, icon: Clock, color: 'bg-amber-100 text-amber-600' },
                    { label: 'Past Due', value: `$${pastDueTotal.toLocaleString()}`, icon: AlertCircle, color: 'bg-red-100 text-red-600' },
                    { label: 'Paid', value: `$${paidTotal.toLocaleString()}`, icon: Check, color: 'bg-green-100 text-green-600' },
                  ].map((stat, idx) => (
                    <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                      <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center mb-2`}>
                        <stat.icon className="w-5 h-5" />
                      </div>
                      <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                      <div className="text-sm text-slate-500">{stat.label}</div>
                    </motion.div>
                  ));
                })()}
              </div>

              {/* Invoice Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900">Invoices</h2>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowAddInvoice(!showAddInvoice)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-700 transition-all">
                      <Plus className="w-4 h-4" /> New Invoice
                    </motion.button>
                  </div>
                </div>

                {/* Add Invoice Form */}
                <AnimatePresence>
                  {showAddInvoice && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-b border-slate-200">
                      <div className="p-6 bg-blue-50/50">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Invoice #</label>
                            <input type="text" value={invoiceForm.invoiceNumber} onChange={e => setInvoiceForm({ ...invoiceForm, invoiceNumber: e.target.value })} placeholder="INV-001" className="w-full px-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Amount ($)</label>
                            <input type="number" value={invoiceForm.amount} onChange={e => setInvoiceForm({ ...invoiceForm, amount: e.target.value })} placeholder="0.00" className="w-full px-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Due Date</label>
                            <DatePicker value={invoiceForm.dueDate} onChange={v => setInvoiceForm({ ...invoiceForm, dueDate: v })} />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Status</label>
                            <select value={invoiceForm.status} onChange={e => setInvoiceForm({ ...invoiceForm, status: e.target.value })} className="w-full px-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500">
                              <option value="Open">Open</option>
                              <option value="Past Due">Past Due</option>
                              <option value="Paid">Paid</option>
                            </select>
                          </div>
                        </div>
                        <div className="mb-4">
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Description</label>
                          <input type="text" value={invoiceForm.description} onChange={e => setInvoiceForm({ ...invoiceForm, description: e.target.value })} placeholder="Invoice description..." className="w-full px-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
                        </div>
                        <div className="flex gap-3 justify-end">
                          <button onClick={() => setShowAddInvoice(false)} className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200">Cancel</button>
                          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleCreateInvoice} className="px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700">Create Invoice</motion.button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {loadingBilling ? (
                  <div className="text-center py-16"><Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-3" /><p className="text-sm text-slate-500">Loading invoices...</p></div>
                ) : billingInvoices.length === 0 ? (
                  <div className="text-center py-20 px-8">
                    <Receipt className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-900 mb-2">No Invoices Yet</h3>
                    <p className="text-slate-600">Create your first invoice for this customer.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50">
                        <tr className="border-b border-slate-200">
                          <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 tracking-wider">Invoice #</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 tracking-wider">Description</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 tracking-wider">Issued</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 tracking-wider">Due Date</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 tracking-wider">Status</th>
                          <th className="px-6 py-3 text-center text-xs font-bold text-slate-600 tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {billingInvoices.map((inv, index) => {
                          const isPastDue = inv.status === 'Past Due' || (inv.status === 'Open' && inv.dueDate && new Date(inv.dueDate) < new Date());
                          const statusColor = inv.status === 'Paid' ? 'bg-green-100 text-green-700 border-green-200' : isPastDue ? 'bg-red-100 text-red-700 border-red-200' : 'bg-amber-100 text-amber-700 border-amber-200';
                          const displayStatus = isPastDue && inv.status !== 'Paid' ? 'Past Due' : inv.status;
                          return (
                            <motion.tr key={inv.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4"><span className="text-sm font-semibold text-slate-900 font-mono">{inv.invoiceNumber || inv.id}</span></td>
                              <td className="px-6 py-4"><span className="text-sm text-slate-700">{inv.description || '—'}</span></td>
                              <td className="px-6 py-4"><span className="text-sm font-semibold text-slate-900">${(inv.amount || 0).toLocaleString()}</span></td>
                              <td className="px-6 py-4"><span className="text-sm text-slate-700">{inv.issuedDate || '—'}</span></td>
                              <td className="px-6 py-4"><span className={`text-sm ${isPastDue && inv.status !== 'Paid' ? 'text-red-600 font-semibold' : 'text-slate-700'}`}>{inv.dueDate || '—'}</span></td>
                              <td className="px-6 py-4"><span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statusColor}`}>{displayStatus}</span></td>
                              <td className="px-6 py-4">
                                <div className="flex items-center justify-center gap-1">
                                  {inv.status !== 'Paid' && (
                                    <button onClick={() => handleUpdateInvoiceStatus(inv.id, 'Paid')} className="px-3 py-1.5 text-xs font-bold text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">Mark Paid</button>
                                  )}
                                  {inv.status === 'Open' && (
                                    <button onClick={() => handleUpdateInvoiceStatus(inv.id, 'Past Due')} className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">Mark Past Due</button>
                                  )}
                                  {inv.status === 'Paid' && (
                                    <button onClick={() => handleUpdateInvoiceStatus(inv.id, 'Open')} className="px-3 py-1.5 text-xs font-bold text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors">Reopen</button>
                                  )}
                                </div>
                              </td>
                            </motion.tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ════════════ CONTACTS TAB ════════════ */}
          {activeTab === 'contacts' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-900">Contact Persons</h2>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsAddContactDrawerOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-700 transition-all"
                  >
                    <Plus className="w-4 h-4" /> Add Contact
                  </motion.button>
                </div>
              </div>
              {contacts.length === 0 ? (
                <div className="text-center py-20 px-8">
                  <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-900 mb-2">No Contacts Yet</h3>
                  <p className="text-slate-600">Add contact persons for this customer.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr className="border-b border-slate-200">
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 tracking-wider">Phone</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 tracking-wider">Role</th>
                        <th className="px-6 py-3 text-center text-xs font-bold text-slate-600 tracking-wider">Actions</th>
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
                              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center overflow-hidden">
                                {contact.profileImage ? (
                                  <ImageWithFallback 
                                    src={contact.profileImage} 
                                    alt={`${contact.firstName} ${contact.lastName}`}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-white font-bold text-xs">
                                    {contact.firstName?.[0]?.toUpperCase() || ''}{contact.lastName?.[0]?.toUpperCase() || ''}
                                  </span>
                                )}
                              </div>
                              <span className="text-sm font-semibold text-slate-900">{contact.firstName} {contact.lastName}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <a href={`mailto:${contact.email}`} className="text-sm text-blue-600 hover:underline">{contact.email}</a>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-slate-700">{contact.phone || '—'}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-slate-700">{contact.role || '—'}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center">
                              <button
                                onClick={() => { setContactToDelete(contact); setIsDeleteContactModalOpen(true); }}
                                className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-600" />
                              </button>
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

          {/* ════════════ ADDRESSES TAB ════════════ */}
          {activeTab === 'addresses' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-900">Addresses</h2>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsAddAddressDrawerOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-700 transition-all"
                  >
                    <Plus className="w-4 h-4" /> Add Address
                  </motion.button>
                </div>
              </div>
              {addresses.length === 0 ? (
                <div className="text-center py-20 px-8">
                  <MapPin className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-900 mb-2">No Addresses Yet</h3>
                  <p className="text-slate-600">Add shipping or billing addresses for this customer.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr className="border-b border-slate-200">
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 tracking-wider">Address</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 tracking-wider">City</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 tracking-wider">State</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 tracking-wider">ZIP</th>
                        <th className="px-6 py-3 text-center text-xs font-bold text-slate-600 tracking-wider">Primary</th>
                        <th className="px-6 py-3 text-center text-xs font-bold text-slate-600 tracking-wider">Actions</th>
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
                              address.type === 'Shipping' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-purple-100 text-purple-700 border-purple-200'
                            }`}>
                              {address.type === 'Shipping' ? <MapPin className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
                              {address.type}
                            </span>
                          </td>
                          <td className="px-6 py-4"><span className="text-sm text-slate-900">{address.street}</span></td>
                          <td className="px-6 py-4"><span className="text-sm text-slate-700">{address.city}</span></td>
                          <td className="px-6 py-4"><span className="text-sm text-slate-700">{address.state}</span></td>
                          <td className="px-6 py-4"><span className="text-sm text-slate-700">{address.zip}</span></td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center">
                              {address.isPrimary ? (
                                <span className="flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold border border-amber-200">
                                  <Star className="w-3 h-3 fill-amber-500" /> Primary
                                </span>
                              ) : (
                                <button onClick={() => handleSetPrimaryAddress(address.id)} className="text-xs text-slate-500 hover:text-amber-600 font-medium">Set Primary</button>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center">
                              <button
                                onClick={() => { setAddressToDelete(address); setIsDeleteAddressModalOpen(true); }}
                                className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-600" />
                              </button>
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

          {/* ════════════ NOTES TAB ════════════ */}
          {activeTab === 'notes' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden max-w-2xl">
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center"><FileText className="w-5 h-5 text-white" /></div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Internal Notes</h3>
                      <p className="text-sm text-slate-500">{persistedNotes.length} note{persistedNotes.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a note..."
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all resize-none"
                    rows={3}
                  />
                  <div className="flex justify-end mt-2">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleAddNote} disabled={!newNote.trim()} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white font-bold rounded-lg text-sm hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                      <Plus className="w-3.5 h-3.5" /> Add Note
                    </motion.button>
                  </div>
                </div>
                {loadingNotes ? (
                  <div className="text-center py-10"><Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-3" /><p className="text-sm text-slate-500">Loading notes...</p></div>
                ) : persistedNotes.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3"><FileText className="w-8 h-8 text-slate-300" /></div>
                    <h4 className="font-bold text-slate-900 mb-1">No notes yet</h4>
                    <p className="text-sm text-slate-500">Add your first note above.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {persistedNotes.map((note) => (
                      <div key={note.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200 group">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center"><User className="w-3.5 h-3.5 text-white" /></div>
                            <div>
                              <p className="text-xs font-bold text-slate-900">{note.author}</p>
                              <p className="text-xs text-slate-500">{new Date(note.createdAt).toLocaleString()}</p>
                            </div>
                          </div>
                          <button onClick={() => handleDeleteNote(note.id)} className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded-lg transition-all"><Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-red-600" /></button>
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed">{note.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ════════════ ACTIVITY TAB ════════════ */}
          {activeTab === 'activity' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden max-w-2xl">
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-900">Activity Timeline</h3>
                <p className="text-sm text-slate-500">Full transaction history</p>
              </div>
              <div className="p-6">
                {loadingActivity ? (
                  <div className="text-center py-10"><Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-3" /><p className="text-sm text-slate-500">Loading activity...</p></div>
                ) : activities.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3"><Calendar className="w-8 h-8 text-slate-300" /></div>
                    <h4 className="font-bold text-slate-900 mb-1">No activity yet</h4>
                    <p className="text-sm text-slate-500">Activity will be logged automatically as you work with this customer.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activities.map((activity, index) => (
                      <div key={activity.id} className="flex gap-3">
                        <div className="flex flex-col items-center shrink-0">
                          <div className={`w-8 h-8 min-w-[2rem] min-h-[2rem] shrink-0 rounded-lg flex items-center justify-center ${
                            activity.type === 'Invoice' ? 'bg-green-100 text-green-600' :
                            activity.type === 'Note' ? 'bg-indigo-100 text-indigo-600' :
                            activity.type === 'Contact' ? 'bg-violet-100 text-violet-600' :
                            activity.type === 'Document' ? 'bg-orange-100 text-orange-600' :
                            activity.type === 'Payment' ? 'bg-purple-100 text-purple-600' :
                            'bg-amber-100 text-amber-600'
                          }`}>
                            {activity.type === 'Invoice' || activity.type === 'Payment' ? <DollarSign className="w-4 h-4" /> :
                             activity.type === 'Note' ? <FileText className="w-4 h-4" /> :
                             activity.type === 'Contact' ? <User className="w-4 h-4" /> :
                             activity.type === 'Document' ? <FileText className="w-4 h-4" /> :
                             <Calendar className="w-4 h-4" />}
                          </div>
                          {index < activities.length - 1 && <div className="w-0.5 flex-1 bg-slate-200 mt-2" />}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-slate-500">{activity.type}</span>
                            <span className="text-xs text-slate-400">{activity.date}</span>
                          </div>
                          <p className="text-sm text-slate-900 mb-1">{activity.description}</p>
                          {activity.amount && <p className="text-xs font-semibold text-green-600">${activity.amount.toLocaleString()}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ════════════ FILES TAB ════════════ */}
          {activeTab === 'files' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-900">Files</h2>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsAddFileDrawerOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-700 transition-all"
                  >
                    <Upload className="w-4 h-4" /> Upload File
                  </motion.button>
                </div>
              </div>
              {documents.length === 0 ? (
                <div className="text-center py-20">
                  <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-900 mb-2">No Files Yet</h3>
                  <p className="text-slate-600">Upload files related to this customer.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr className="border-b border-slate-200">
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 tracking-wider">Size</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 tracking-wider">Uploaded</th>
                        <th className="px-6 py-3 text-center text-xs font-bold text-slate-600 tracking-wider">Actions</th>
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
                              <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                                <FileText className="w-4 h-4 text-blue-600" />
                              </div>
                              <span className="text-sm font-semibold text-slate-900">{doc.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4"><span className="text-sm text-slate-700">{doc.type}</span></td>
                          <td className="px-6 py-4"><span className="text-sm text-slate-700">{doc.size}</span></td>
                          <td className="px-6 py-4"><span className="text-sm text-slate-700">{new Date(doc.uploadedOn).toLocaleDateString()}</span></td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => { setFileToDelete(doc); setIsDeleteFileModalOpen(true); }}
                                className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-600" />
                              </button>
                              <button className="p-2 hover:bg-blue-50 rounded-lg transition-colors">
                                <Download className="w-4 h-4 text-slate-400 hover:text-blue-600" />
                              </button>
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

      {/* Add Contact Drawer */}
      <AddContactDrawer
        isOpen={isAddContactDrawerOpen}
        onClose={() => setIsAddContactDrawerOpen(false)}
        onSuccess={handleAddContact}
        customerId={customerId}
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
          if (contactToDelete) handleDeleteContact(contactToDelete.id);
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
          if (addressToDelete) handleDeleteAddress(addressToDelete.id);
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
          if (fileToDelete) handleDeleteFile(fileToDelete.id);
          setIsDeleteFileModalOpen(false);
        }}
        title="Delete File"
        message="Are you sure you want to delete this file?"
        itemName={fileToDelete ? fileToDelete.name : ''}
      />
    </div>
  );
}
