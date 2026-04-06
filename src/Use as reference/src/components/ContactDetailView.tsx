import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Mail, Phone, Building2, Globe, MapPin, FileText, DollarSign, ShoppingCart, Package, Calendar, Trash2, MessageSquare, Video, Send, Upload, File, X, Download, AlertTriangle, Plus, Loader2, Check, Save, User, Pencil, Hash, Briefcase, Ticket, ChevronDown, ChevronRight, Clock } from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-c0840c88`;

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

interface ContactAddress {
  id: string;
  label: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isPrimary?: boolean;
}

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  type: string;
  country: string;
  lastContact: string;
  status: string;
  // Extended fields
  website?: string;
  linkedIn?: string;
  notes?: string;
  addresses?: ContactAddress[];
  owner?: string;
  createdAt?: string;
}

interface ContactDetailViewProps {
  contact: Contact;
  onBack: () => void;
  onDelete: () => void;
  onContactUpdated?: (contact: Contact) => void;
}

const CONTACT_STATUSES = ['Active', 'Inactive', 'Prospect', 'Cold'];
const CONTACT_TYPES = ['Customer', 'Vendor', 'Lead', 'Partner'];
const ADDRESS_TYPES = ['Billing', 'Shipping', 'Office', 'Headquarters', 'Warehouse', 'Home', 'Other'];

const EMPTY_ADDRESS: ContactAddress = {
  id: '',
  label: 'Billing',
  street1: '',
  street2: '',
  city: '',
  state: '',
  zip: '',
  country: 'United States',
  isPrimary: false,
};

export function ContactDetailView({ contact, onBack, onDelete, onContactUpdated }: ContactDetailViewProps) {
  // ─── Contact data ───
  const [contactData, setContactData] = useState<Contact>(contact);

  // ─── Inline editing ───
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // ─── Address state ───
  const [addresses, setAddresses] = useState<ContactAddress[]>(contact.addresses || []);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<ContactAddress | null>(null);
  const [addressForm, setAddressForm] = useState<ContactAddress>({ ...EMPTY_ADDRESS });
  const [deleteAddressItem, setDeleteAddressItem] = useState<ContactAddress | null>(null);

  // ─── Documents ───
  const [uploadedFiles, setUploadedFiles] = useState<Array<{
    id: string; name: string; size: string; uploadedDate: string; uploadedBy: string;
  }>>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [deleteDoc, setDeleteDoc] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loadingDocs, setLoadingDocs] = useState(false);

  // ─── Activity ───
  const [activityData, setActivityData] = useState<Array<{
    id: string; date: string; type: string; description: string; user: string;
  }>>([]);
  const [loadingActivity, setLoadingActivity] = useState(false);

  // ─── Quotes & Invoices (empty until user creates them) ───
  const quotes: Array<{ id: string; date: string; amount: number; status: string; items: number }> = [];
  const invoices: Array<{ id: string; date: string; amount: number; status: string; dueDate: string }> = [];

  // ─── Emails ───
  const [emailsData, setEmailsData] = useState<any[]>([]);
  const [loadingEmails, setLoadingEmails] = useState(false);
  const [showComposeEmail, setShowComposeEmail] = useState(false);
  const [emailForm, setEmailForm] = useState({ subject: '', body: '', from: '' });
  const [sendingEmail, setSendingEmail] = useState(false);
  const [expandedEmails, setExpandedEmails] = useState<Record<string, boolean>>({});

  // ─── Tickets ───
  const [ticketsData, setTicketsData] = useState<any[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const [ticketForm, setTicketForm] = useState({ subject: '', description: '', priority: 'Medium', category: 'General', assignedTo: '' });
  const [creatingTicket, setCreatingTicket] = useState(false);

  // ─── Active tab ───
  const [activeTab, setActiveTab] = useState('overview');

  // ─── Delete confirmation ───
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // ─── Fetch full contact ───
  const fetchContact = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/contacts/${contact.id}`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` },
      });
      const data = await res.json();
      if (data.success && data.contact) {
        setContactData(data.contact);
        setAddresses(data.contact.addresses || []);
      }
    } catch (error) {
      console.error('Error fetching contact:', error);
    }
  }, [contact.id]);

  // ─── Fetch contact documents ───
  const fetchDocuments = useCallback(async () => {
    setLoadingDocs(true);
    try {
      const res = await fetch(`${API_URL}/contacts/${contact.id}/documents`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` },
      });
      const data = await res.json();
      if (data.success) {
        setUploadedFiles(data.documents || []);
      }
    } catch (error) {
      console.error('Error fetching contact documents:', error);
    } finally {
      setLoadingDocs(false);
    }
  }, [contact.id]);

  // ─── Fetch contact activity ───
  const fetchActivity = useCallback(async () => {
    setLoadingActivity(true);
    try {
      const res = await fetch(`${API_URL}/contacts/${contact.id}/activity`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` },
      });
      const data = await res.json();
      if (data.success) {
        setActivityData(data.activities || []);
      }
    } catch (error) {
      console.error('Error fetching contact activity:', error);
    } finally {
      setLoadingActivity(false);
    }
  }, [contact.id]);

  // ─── Fetch contact emails ───
  const fetchEmails = useCallback(async () => {
    setLoadingEmails(true);
    try {
      const res = await fetch(`${API_URL}/contacts/${contact.id}/emails`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` },
      });
      const data = await res.json();
      if (data.success) setEmailsData(data.emails || []);
    } catch (error) {
      console.error('Error fetching contact emails:', error);
    } finally {
      setLoadingEmails(false);
    }
  }, [contact.id]);

  // ─── Fetch contact tickets ───
  const fetchTickets = useCallback(async () => {
    setLoadingTickets(true);
    try {
      const res = await fetch(`${API_URL}/contacts/${contact.id}/tickets`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` },
      });
      const data = await res.json();
      if (data.success) setTicketsData(data.tickets || []);
    } catch (error) {
      console.error('Error fetching contact tickets:', error);
    } finally {
      setLoadingTickets(false);
    }
  }, [contact.id]);

  // ─── Send email ───
  const handleSendEmail = async () => {
    if (!emailForm.subject.trim()) return;
    setSendingEmail(true);
    try {
      const res = await fetch(`${API_URL}/contacts/${contact.id}/emails`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` },
        body: JSON.stringify({ ...emailForm, to: contactData.email }),
      });
      const data = await res.json();
      if (data.success) {
        setShowComposeEmail(false);
        setEmailForm({ subject: '', body: '', from: '' });
        fetchEmails();
        fetchActivity();
      }
    } catch (error) {
      console.error('Error sending email:', error);
    } finally {
      setSendingEmail(false);
    }
  };

  // ─── Create ticket ───
  const handleCreateTicket = async () => {
    if (!ticketForm.subject.trim()) return;
    setCreatingTicket(true);
    try {
      const res = await fetch(`${API_URL}/contacts/${contact.id}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` },
        body: JSON.stringify(ticketForm),
      });
      const data = await res.json();
      if (data.success) {
        setShowCreateTicket(false);
        setTicketForm({ subject: '', description: '', priority: 'Medium', category: 'General', assignedTo: '' });
        fetchTickets();
        fetchActivity();
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
    } finally {
      setCreatingTicket(false);
    }
  };

  // ─── Update ticket status ───
  const handleUpdateTicketStatus = async (ticketId: string, newStatus: string) => {
    try {
      await fetch(`${API_URL}/contacts/${contact.id}/tickets/${ticketId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchTickets();
    } catch (error) {
      console.error('Error updating ticket:', error);
    }
  };

  useEffect(() => {
    fetchContact();
    fetchDocuments();
    fetchActivity();
    fetchEmails();
    fetchTickets();
  }, [fetchContact, fetchDocuments, fetchActivity, fetchEmails, fetchTickets]);

  // ─── Save contact updates ───
  const saveContactField = async (updates: Record<string, any>) => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/contacts/${contact.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` },
        body: JSON.stringify({ ...contactData, ...updates, id: contact.id }),
      });
      const data = await res.json();
      if (data.success) {
        const updated = { ...contactData, ...updates };
        setContactData(updated);
        if (updates.addresses) setAddresses(updates.addresses);
        onContactUpdated?.(updated);
        setSaveSuccess(editingSection);
        setTimeout(() => setSaveSuccess(null), 2000);
      } else {
        console.error('Error saving contact:', data.error);
      }
    } catch (error) {
      console.error('Error saving contact:', error);
    } finally {
      setSaving(false);
      setEditingSection(null);
    }
  };

  // ─── Edit info section ───
  const startEditing = (section: string) => {
    if (section === 'info') {
      setEditForm({
        name: contactData.name || '',
        email: contactData.email || '',
        phone: contactData.phone || '',
        company: contactData.company || '',
        position: contactData.position || '',
        type: contactData.type || 'Customer',
        status: contactData.status || 'Active',
        country: contactData.country || '',
        website: contactData.website || '',
        linkedIn: contactData.linkedIn || '',
        notes: contactData.notes || '',
        owner: contactData.owner || '',
      });
    }
    setEditingSection(section);
  };

  const cancelEditing = () => { setEditingSection(null); setEditForm({}); };

  const saveInfoEdits = () => {
    saveContactField({
      name: editForm.name,
      email: editForm.email,
      phone: editForm.phone,
      company: editForm.company,
      position: editForm.position,
      type: editForm.type,
      status: editForm.status,
      country: editForm.country,
      website: editForm.website,
      linkedIn: editForm.linkedIn,
      notes: editForm.notes,
      owner: editForm.owner,
    });
  };

  // ─── Address CRUD ───
  const openAddAddress = () => {
    setEditingAddress(null);
    setAddressForm({ ...EMPTY_ADDRESS, id: `addr-${Date.now()}` });
    setShowAddressModal(true);
  };

  const openEditAddress = (addr: ContactAddress) => {
    setEditingAddress(addr);
    setAddressForm({ ...addr });
    setShowAddressModal(true);
  };

  const saveAddress = async () => {
    setSaving(true);
    let newAddresses: ContactAddress[];
    if (editingAddress) {
      newAddresses = addresses.map(a => a.id === editingAddress.id ? { ...addressForm } : a);
    } else {
      newAddresses = [...addresses, { ...addressForm }];
    }
    if (addressForm.isPrimary) {
      newAddresses = newAddresses.map(a => ({ ...a, isPrimary: a.id === addressForm.id }));
    }
    try {
      const res = await fetch(`${API_URL}/contacts/${contact.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` },
        body: JSON.stringify({ ...contactData, addresses: newAddresses, id: contact.id }),
      });
      const data = await res.json();
      if (data.success) {
        setAddresses(newAddresses);
        setContactData({ ...contactData, addresses: newAddresses });
        setShowAddressModal(false);
        setEditingAddress(null);
        setSaveSuccess('addresses');
        setTimeout(() => setSaveSuccess(null), 2000);
      }
    } catch (error) {
      console.error('Error saving address:', error);
    } finally {
      setSaving(false);
    }
  };

  const confirmDeleteAddress = async () => {
    if (!deleteAddressItem) return;
    setSaving(true);
    const newAddresses = addresses.filter(a => a.id !== deleteAddressItem.id);
    try {
      await fetch(`${API_URL}/contacts/${contact.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` },
        body: JSON.stringify({ ...contactData, addresses: newAddresses, id: contact.id }),
      });
      setAddresses(newAddresses);
      setDeleteAddressItem(null);
    } catch (error) {
      console.error('Error deleting address:', error);
    } finally {
      setSaving(false);
    }
  };

  // ─── File handlers ───
  const handleFileUpload = async () => {
    if (uploadFiles.length === 0) return;
    for (const file of uploadFiles) {
      try {
        const size = file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : `${(file.size / 1024).toFixed(0)} KB`;
        const res = await fetch(`${API_URL}/contacts/${contact.id}/documents`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` },
          body: JSON.stringify({ name: file.name, size, uploadedBy: 'Current User' }),
        });
        const data = await res.json();
        if (!data.success) console.error('Error uploading document:', data.error);
      } catch (error) {
        console.error('Error uploading document:', error);
      }
    }
    setShowUploadModal(false);
    setUploadFiles([]);
    fetchDocuments();
    fetchActivity();
  };

  const confirmDeleteDoc = async () => {
    if (deleteDoc) {
      try {
        await fetch(`${API_URL}/contacts/${contact.id}/documents/${deleteDoc.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${publicAnonKey}` },
        });
      } catch (error) {
        console.error('Error deleting document:', error);
      }
      setDeleteDoc(null);
      fetchDocuments();
      fetchActivity();
    }
  };

  // ─── Helpers ───
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': case 'Paid': case 'Completed': case 'Accepted': return 'bg-green-100 text-green-700 border-green-200';
      case 'Sent': case 'In Production': case 'Shipped': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Pending': case 'Prospect': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Overdue': case 'Cold': case 'Inactive': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Vendor': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Customer': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Lead': return 'bg-green-100 text-green-700 border-green-200';
      case 'Partner': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getAddressTypeColor = (label: string) => {
    switch (label) {
      case 'Billing': return 'bg-green-100 text-green-700';
      case 'Shipping': return 'bg-cyan-100 text-cyan-700';
      case 'Office': return 'bg-purple-100 text-purple-700';
      case 'Headquarters': return 'bg-indigo-100 text-indigo-700';
      case 'Warehouse': return 'bg-amber-100 text-amber-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'Email': return <Mail className="w-4 h-4" />;
      case 'Call': return <Phone className="w-4 h-4" />;
      case 'Meeting': return <Video className="w-4 h-4" />;
      case 'Document': return <FileText className="w-4 h-4" />;
      case 'Note': return <MessageSquare className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const formatAddress = (addr: ContactAddress) => {
    return [addr.street1, addr.street2, [addr.city, addr.state].filter(Boolean).join(', '), addr.zip, addr.country].filter(Boolean);
  };

  const c = contactData;

  const InfoField = ({ icon: Icon, label, value, color = 'slate' }: { icon: any; label: string; value: string; color?: string }) => (
    <div className="flex items-start gap-3 py-2">
      <div className={`w-9 h-9 bg-${color}-100 rounded-xl flex items-center justify-center shrink-0 mt-0.5`}>
        <Icon className={`w-4 h-4 text-${color}-600`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium text-slate-900 break-words">{value || '—'}</p>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'emails', label: `Emails (${emailsData.length})` },
    { id: 'tickets', label: `Tickets (${ticketsData.length})` },
    { id: 'addresses', label: `Addresses (${addresses.length})` },
    { id: 'quotes', label: 'Quotes' },
    { id: 'invoices', label: 'Invoices' },
    { id: 'documents', label: `Documents (${uploadedFiles.length})` },
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
              Back to Contacts
            </motion.button>
          </div>
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl">
              <span className="text-xl font-black text-indigo-600">
                {c.name?.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{c.name}</h1>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${getTypeColor(c.type)} bg-white`}>
                  {c.type}
                </span>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${getStatusColor(c.status)} bg-white`}>
                  {c.status}
                </span>
                {c.company && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-white/20 text-white border border-white/30">
                    {c.company}
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
                    ? 'bg-slate-50 text-indigo-700 shadow-sm'
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
              {/* Quick Actions */}
              <div className="flex items-center gap-3">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all">
                  <Send className="w-4 h-4" /> Send Email
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors">
                  <Phone className="w-4 h-4" /> Call
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors">
                  <Video className="w-4 h-4" /> Schedule Meeting
                </motion.button>
              </div>

              <div className="grid grid-cols-3 gap-6">
                {/* ─── Left: Contact Information (editable) ─── */}
                <div className="col-span-2 space-y-6">
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-slate-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-slate-900">Contact Information</h3>
                            <p className="text-sm text-slate-500">Personal details & communication</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {saveSuccess === 'info' && (
                            <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">
                              <Check className="w-3.5 h-3.5 inline mr-1" /> Saved
                            </motion.span>
                          )}
                          {editingSection === 'info' ? (
                            <div className="flex items-center gap-2">
                              <button onClick={cancelEditing} className="px-3 py-1.5 text-sm font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">Cancel</button>
                              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={saveInfoEdits} disabled={saving} className="px-4 py-1.5 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-1.5">
                                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save
                              </motion.button>
                            </div>
                          ) : (
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => startEditing('info')} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                              <Pencil className="w-3.5 h-3.5" /> Edit
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      {editingSection === 'info' ? (
                        <div className="space-y-5">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Full Name</label>
                              <input type="text" value={editForm.name || ''} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all" />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Position / Title</label>
                              <input type="text" value={editForm.position || ''} onChange={e => setEditForm({ ...editForm, position: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all" />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Email</label>
                              <input type="email" value={editForm.email || ''} onChange={e => setEditForm({ ...editForm, email: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all" />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Phone</label>
                              <input type="text" value={editForm.phone || ''} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all" />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Company</label>
                              <input type="text" value={editForm.company || ''} onChange={e => setEditForm({ ...editForm, company: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all" />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Country</label>
                              <input type="text" value={editForm.country || ''} onChange={e => setEditForm({ ...editForm, country: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all" />
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Type</label>
                              <select value={editForm.type || 'Customer'} onChange={e => setEditForm({ ...editForm, type: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all">
                                {CONTACT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Status</label>
                              <select value={editForm.status || 'Active'} onChange={e => setEditForm({ ...editForm, status: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all">
                                {CONTACT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Website</label>
                              <input type="text" value={editForm.website || ''} onChange={e => setEditForm({ ...editForm, website: e.target.value })} placeholder="www.example.com" className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all" />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Notes</label>
                            <textarea rows={3} value={editForm.notes || ''} onChange={e => setEditForm({ ...editForm, notes: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all resize-none" />
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                          <InfoField icon={Briefcase} label="Position" value={c.position || ''} color="purple" />
                          <InfoField icon={Mail} label="Email" value={c.email || ''} color="blue" />
                          <InfoField icon={Phone} label="Phone" value={c.phone || ''} color="green" />
                          <InfoField icon={Building2} label="Company" value={c.company || ''} color="indigo" />
                          <InfoField icon={Globe} label="Country" value={c.country || ''} color="amber" />
                          <InfoField icon={Globe} label="Website" value={c.website || ''} color="cyan" />
                          <InfoField icon={Calendar} label="Last Contact" value={c.lastContact || ''} color="red" />
                          <InfoField icon={Hash} label="Contact ID" value={c.id || ''} color="slate" />
                          {c.notes && (
                            <div className="col-span-2 mt-2">
                              <InfoField icon={FileText} label="Notes" value={c.notes} color="slate" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* ─── Addresses Preview ─── */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4 border-b border-slate-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-slate-900">Addresses</h3>
                            <p className="text-sm text-slate-500">{addresses.length} location{addresses.length !== 1 ? 's' : ''} on file</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {saveSuccess === 'addresses' && (
                            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg"><Check className="w-3.5 h-3.5 inline mr-1" /> Saved</motion.span>
                          )}
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={openAddAddress} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold text-amber-700 bg-amber-100 rounded-lg hover:bg-amber-200 transition-colors">
                            <Plus className="w-3.5 h-3.5" /> Add Address
                          </motion.button>
                          {addresses.length > 4 && (
                            <button onClick={() => setActiveTab('addresses')} className="text-xs font-bold text-indigo-600 hover:underline ml-1">View All</button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      {addresses.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                            <MapPin className="w-7 h-7 text-amber-300" />
                          </div>
                          <p className="text-sm font-semibold text-slate-700 mb-1">No addresses added yet</p>
                          <p className="text-xs text-slate-400 mb-4">Add billing, shipping, and office addresses</p>
                          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={openAddAddress} className="px-4 py-2 bg-amber-500 text-white rounded-xl font-bold text-sm hover:bg-amber-600 transition-colors inline-flex items-center gap-1.5">
                            <Plus className="w-4 h-4" /> Add First Address
                          </motion.button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-4">
                          {addresses.slice(0, 4).map(addr => (
                            <div key={addr.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:border-amber-300 transition-colors group relative">
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${getAddressTypeColor(addr.label)}`}>{addr.label}</span>
                                {addr.isPrimary && <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-indigo-100 text-indigo-700">Primary</span>}
                              </div>
                              <div className="text-sm text-slate-700 space-y-0.5">
                                {formatAddress(addr).map((line, i) => <p key={i} className={i === 0 ? 'font-medium' : ''}>{line}</p>)}
                              </div>
                              <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openEditAddress(addr)} className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors" title="Edit"><Pencil className="w-3.5 h-3.5 text-slate-500" /></button>
                                <button onClick={() => setDeleteAddressItem(addr)} className="p-1.5 hover:bg-red-100 rounded-lg transition-colors" title="Delete"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>

                {/* ─── Right: Activity Timeline ─── */}
                <div className="space-y-6">
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
                      <h3 className="text-lg font-bold text-slate-900">Recent Activity</h3>
                      <p className="text-sm text-slate-500">Communication history</p>
                    </div>
                    <div className="p-6">
                      {loadingActivity ? (
                        <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 text-slate-400 animate-spin" /></div>
                      ) : activityData.length === 0 ? (
                        <div className="text-center py-8">
                          <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                          <p className="text-sm font-medium text-slate-500">No activity yet</p>
                          <p className="text-xs text-slate-400 mt-1">Activity will appear here as you interact with this contact</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {activityData.slice(0, 5).map((activity, index) => (
                            <div key={activity.id || index} className="flex gap-3">
                              <div className="flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                  activity.type === 'Email' ? 'bg-blue-100 text-blue-600' :
                                  activity.type === 'Call' ? 'bg-green-100 text-green-600' :
                                  activity.type === 'Document' ? 'bg-indigo-100 text-indigo-600' :
                                  'bg-purple-100 text-purple-600'
                                }`}>
                                  {getActivityIcon(activity.type)}
                                </div>
                                {index < Math.min(activityData.length, 5) - 1 && <div className="w-0.5 h-full bg-slate-200 mt-2" />}
                              </div>
                              <div className="flex-1 pb-4">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-semibold text-slate-500">{activity.type}</span>
                                  <span className="text-xs text-slate-400">{activity.date}</span>
                                </div>
                                <p className="text-sm text-slate-900 mb-1">{activity.description}</p>
                                <p className="text-xs text-slate-500">by {activity.user}</p>
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

          {/* ════════════ EMAILS TAB ════════════ */}
          {activeTab === 'emails' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Compose Email Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
                <div className="bg-slate-50 px-8 py-5 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Email History</h3>
                    <p className="text-sm text-slate-500 mt-0.5">Communication log with {c.name}</p>
                  </div>
                  <button
                    onClick={() => setShowComposeEmail(!showComposeEmail)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    Compose Email
                  </button>
                </div>

                {/* Compose Form */}
                <AnimatePresence>
                  {showComposeEmail && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-b border-slate-200"
                    >
                      <div className="p-6 bg-blue-50/50 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">From</label>
                            <input type="text" placeholder="Your Name" value={emailForm.from} onChange={e => setEmailForm({ ...emailForm, from: e.target.value })} className="w-full px-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">To</label>
                            <input type="text" value={contactData.email} disabled className="w-full px-4 py-2.5 bg-slate-100 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-500" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Subject</label>
                          <input type="text" placeholder="Email subject..." value={emailForm.subject} onChange={e => setEmailForm({ ...emailForm, subject: e.target.value })} className="w-full px-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Body</label>
                          <textarea rows={5} placeholder="Write your email..." value={emailForm.body} onChange={e => setEmailForm({ ...emailForm, body: e.target.value })} className="w-full px-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-none" />
                        </div>
                        <div className="flex items-center gap-3 justify-end">
                          <button onClick={() => setShowComposeEmail(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800">Cancel</button>
                          <button onClick={handleSendEmail} disabled={sendingEmail || !emailForm.subject.trim()} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors">
                            {sendingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            Send Email
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email List */}
                <div className="p-6">
                  {loadingEmails ? (
                    <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 text-slate-400 animate-spin" /></div>
                  ) : emailsData.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4"><Mail className="w-10 h-10 text-blue-300" /></div>
                      <h4 className="text-lg font-bold text-slate-900 mb-2">No emails yet</h4>
                      <p className="text-sm text-slate-500 max-w-md mx-auto">Send the first email to {c.name} using the Compose button above.</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {(() => {
                        const grouped: Record<string, any[]> = {};
                        emailsData.forEach(email => {
                          const d = new Date(email.sentAt);
                          const key = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                          if (!grouped[key]) grouped[key] = [];
                          grouped[key].push(email);
                        });
                        return Object.entries(grouped).map(([monthLabel, emails]) => (
                          <div key={monthLabel}>
                            <h4 className="text-base font-semibold text-slate-700 mb-3 mt-4 first:mt-0">{monthLabel}</h4>
                            <div className="space-y-3">
                              {emails.map(email => {
                                const isExpanded = expandedEmails[email.id];
                                const sentDate = new Date(email.sentAt);
                                return (
                                  <div key={email.id} className="border border-slate-200 rounded-xl overflow-hidden hover:border-slate-300 transition-colors">
                                    <div className="flex items-start gap-3 p-4 cursor-pointer" onClick={() => setExpandedEmails(prev => ({ ...prev, [email.id]: !prev[email.id] }))}>
                                      <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5"><Mail className="w-4 h-4 text-blue-600" /></div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                          <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                          <span className="font-bold text-slate-900 text-sm">{email.subject}</span>
                                          <span className="text-slate-500 text-sm">from {email.from || 'Unknown'}</span>
                                        </div>
                                        <div className="text-sm text-slate-500 ml-6">to <span className="text-blue-600 font-medium">{c.name}</span></div>
                                        {isExpanded && (
                                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 ml-6 space-y-2">
                                            <div className="flex items-center gap-2">
                                              <span className="w-2 h-2 bg-teal-400 rounded-full" />
                                              <span className="text-teal-600 text-sm font-semibold">{email.status}</span>
                                            </div>
                                            <p className="text-sm text-slate-700 whitespace-pre-wrap">{email.body}</p>
                                          </motion.div>
                                        )}
                                      </div>
                                      <div className="text-right shrink-0">
                                        <div className="flex items-center gap-2 text-xs text-slate-400">
                                          <Mail className="w-3.5 h-3.5" />
                                          <span>{sentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {sentDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZoneName: 'short' })}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ════════════ TICKETS TAB ════════════ */}
          {activeTab === 'tickets' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
                <div className="bg-slate-50 px-8 py-5 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Support Tickets</h3>
                    <p className="text-sm text-slate-500 mt-0.5">Track and manage issues for {c.name}</p>
                  </div>
                  <button onClick={() => setShowCreateTicket(!showCreateTicket)} className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 text-white text-sm font-semibold rounded-xl hover:bg-orange-700 transition-colors">
                    <Plus className="w-4 h-4" />
                    New Ticket
                  </button>
                </div>

                {/* Create Ticket Form */}
                <AnimatePresence>
                  {showCreateTicket && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-b border-slate-200">
                      <div className="p-6 bg-orange-50/50 space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Subject</label>
                          <input type="text" placeholder="Brief description of the issue..." value={ticketForm.subject} onChange={e => setTicketForm({ ...ticketForm, subject: e.target.value })} className="w-full px-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Description</label>
                          <textarea rows={4} placeholder="Detailed description..." value={ticketForm.description} onChange={e => setTicketForm({ ...ticketForm, description: e.target.value })} className="w-full px-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 resize-none" />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Priority</label>
                            <select value={ticketForm.priority} onChange={e => setTicketForm({ ...ticketForm, priority: e.target.value })} className="w-full px-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500">
                              <option value="Low">Low</option>
                              <option value="Medium">Medium</option>
                              <option value="High">High</option>
                              <option value="Urgent">Urgent</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Category</label>
                            <select value={ticketForm.category} onChange={e => setTicketForm({ ...ticketForm, category: e.target.value })} className="w-full px-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500">
                              <option value="General">General</option>
                              <option value="Billing">Billing</option>
                              <option value="Shipping">Shipping</option>
                              <option value="Product">Product</option>
                              <option value="Design">Design</option>
                              <option value="Technical">Technical</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Assigned To</label>
                            <input type="text" placeholder="Team member..." value={ticketForm.assignedTo} onChange={e => setTicketForm({ ...ticketForm, assignedTo: e.target.value })} className="w-full px-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500" />
                          </div>
                        </div>
                        <div className="flex items-center gap-3 justify-end">
                          <button onClick={() => setShowCreateTicket(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800">Cancel</button>
                          <button onClick={handleCreateTicket} disabled={creatingTicket || !ticketForm.subject.trim()} className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 text-white text-sm font-semibold rounded-xl hover:bg-orange-700 disabled:opacity-50 transition-colors">
                            {creatingTicket ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ticket className="w-4 h-4" />}
                            Create Ticket
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Tickets List */}
                <div className="p-6">
                  {loadingTickets ? (
                    <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 text-slate-400 animate-spin" /></div>
                  ) : ticketsData.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4"><Ticket className="w-10 h-10 text-orange-300" /></div>
                      <h4 className="text-lg font-bold text-slate-900 mb-2">No tickets yet</h4>
                      <p className="text-sm text-slate-500 max-w-md mx-auto">Create a support ticket when {c.name} reports an issue.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {ticketsData.map(ticket => {
                        const priorityColors: Record<string, string> = {
                          Low: 'bg-slate-100 text-slate-600',
                          Medium: 'bg-yellow-100 text-yellow-700',
                          High: 'bg-orange-100 text-orange-700',
                          Urgent: 'bg-red-100 text-red-700',
                        };
                        const statusColors: Record<string, string> = {
                          Open: 'bg-blue-100 text-blue-700',
                          'In Progress': 'bg-amber-100 text-amber-700',
                          'Waiting on Customer': 'bg-purple-100 text-purple-700',
                          Resolved: 'bg-green-100 text-green-700',
                          Closed: 'bg-slate-100 text-slate-600',
                        };
                        const createdDate = new Date(ticket.createdAt);
                        return (
                          <div key={ticket.id} className="border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${ticket.status === 'Resolved' || ticket.status === 'Closed' ? 'bg-green-100' : 'bg-orange-100'}`}>
                                  <Ticket className={`w-4 h-4 ${ticket.status === 'Resolved' || ticket.status === 'Closed' ? 'text-green-600' : 'text-orange-600'}`} />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-400">{ticket.id}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${priorityColors[ticket.priority] || priorityColors.Medium}`}>{ticket.priority}</span>
                                  </div>
                                  <h4 className="text-sm font-bold text-slate-900 mt-0.5">{ticket.subject}</h4>
                                </div>
                              </div>
                              <select
                                value={ticket.status}
                                onChange={e => handleUpdateTicketStatus(ticket.id, e.target.value)}
                                className={`text-xs font-bold rounded-full px-3 py-1 border-0 cursor-pointer focus:outline-none ${statusColors[ticket.status] || statusColors.Open}`}
                              >
                                <option value="Open">Open</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Waiting on Customer">Waiting on Customer</option>
                                <option value="Resolved">Resolved</option>
                                <option value="Closed">Closed</option>
                              </select>
                            </div>
                            {ticket.description && <p className="text-sm text-slate-600 mb-3 ml-12">{ticket.description}</p>}
                            <div className="flex items-center gap-4 ml-12 text-xs text-slate-400">
                              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{createdDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                              {ticket.category && <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-500 font-medium">{ticket.category}</span>}
                              {ticket.assignedTo && <span className="flex items-center gap-1"><User className="w-3 h-3" />{ticket.assignedTo}</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ════════════ ADDRESSES TAB ════════════ */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">All Addresses</h2>
                  <p className="text-sm text-slate-500">{addresses.length} location{addresses.length !== 1 ? 's' : ''} configured</p>
                </div>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={openAddAddress} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg">
                  <Plus className="w-4 h-4" /> Add Address
                </motion.button>
              </div>
              {addresses.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-12 text-center">
                  <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-4"><MapPin className="w-10 h-10 text-amber-300" /></div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">No addresses yet</h3>
                  <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">Add billing, shipping, office addresses and more.</p>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={openAddAddress} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors inline-flex items-center gap-2">
                    <Plus className="w-5 h-5" /> Add First Address
                  </motion.button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-5">
                  {addresses.map(addr => (
                    <motion.div key={addr.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                      <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${getAddressTypeColor(addr.label)}`}>{addr.label}</span>
                          {addr.isPrimary && <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-indigo-100 text-indigo-700">Primary</span>}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEditAddress(addr)} className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors"><Pencil className="w-3.5 h-3.5 text-slate-500" /></button>
                          <button onClick={() => setDeleteAddressItem(addr)} className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="flex items-start gap-3">
                          <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                          <div className="text-sm text-slate-700 space-y-0.5">
                            {formatAddress(addr).map((line, i) => <p key={i} className={i === 0 ? 'font-semibold text-slate-900' : ''}>{line}</p>)}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={openAddAddress} className="border-2 border-dashed border-slate-300 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer">
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-3"><Plus className="w-6 h-6 text-slate-400" /></div>
                    <p className="text-sm font-bold text-slate-600">Add New Address</p>
                    <p className="text-xs text-slate-400 mt-1">Billing, Shipping, Office...</p>
                  </motion.button>
                </div>
              )}
            </div>
          )}

          {/* ════════════ QUOTES TAB ════════════ */}
          {activeTab === 'quotes' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center"><FileText className="w-5 h-5 text-white" /></div>
                  <div><h3 className="text-lg font-bold text-slate-900">Quotes</h3><p className="text-sm text-slate-500">{quotes.length} quote{quotes.length !== 1 ? 's' : ''}</p></div>
                </div>
              </div>
              {quotes.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><FileText className="w-8 h-8 text-blue-400" /></div>
                  <h4 className="font-bold text-slate-900 mb-1">No quotes yet</h4>
                  <p className="text-sm text-slate-500">Quotes will appear here when they are created for this contact</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Quote ID</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Items</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {quotes.map(q => (
                        <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4"><span className="font-semibold text-slate-900">{q.id}</span></td>
                          <td className="px-6 py-4 text-sm text-slate-600">{q.date}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{q.items} items</td>
                          <td className="px-6 py-4"><span className="font-semibold text-green-600">${q.amount.toLocaleString()}</span></td>
                          <td className="px-6 py-4"><span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${getStatusColor(q.status)}`}>{q.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {/* ════════════ INVOICES TAB ════════════ */}
          {activeTab === 'invoices' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center"><DollarSign className="w-5 h-5 text-white" /></div>
                  <div><h3 className="text-lg font-bold text-slate-900">Invoices</h3><p className="text-sm text-slate-500">{invoices.length} invoice{invoices.length !== 1 ? 's' : ''}</p></div>
                </div>
              </div>
              {invoices.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><DollarSign className="w-8 h-8 text-green-400" /></div>
                  <h4 className="font-bold text-slate-900 mb-1">No invoices yet</h4>
                  <p className="text-sm text-slate-500">Invoices will appear here when they are created for this contact</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Invoice ID</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Due Date</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {invoices.map(inv => (
                        <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4"><span className="font-semibold text-slate-900">{inv.id}</span></td>
                          <td className="px-6 py-4 text-sm text-slate-600">{inv.date}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{inv.dueDate}</td>
                          <td className="px-6 py-4"><span className="font-semibold text-green-600">${inv.amount.toLocaleString()}</span></td>
                          <td className="px-6 py-4"><span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${getStatusColor(inv.status)}`}>{inv.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {/* ════════════ DOCUMENTS TAB ════════════ */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div><h2 className="text-xl font-bold text-slate-900">Documents</h2><p className="text-sm text-slate-500">{uploadedFiles.length} files uploaded</p></div>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowUploadModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg">
                  <Upload className="w-4 h-4" /> Upload Document
                </motion.button>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
                <div className="p-6">
                  {loadingDocs ? (
                    <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 text-indigo-400 animate-spin" /></div>
                  ) : uploadedFiles.length === 0 ? (
                    <div className="text-center py-10">
                      <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-3"><FileText className="w-8 h-8 text-indigo-400" /></div>
                      <h4 className="font-bold text-slate-900 mb-1">No documents yet</h4>
                      <p className="text-sm text-slate-500 mb-4">Upload contracts, catalogs, and other files</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {uploadedFiles.map(doc => (
                        <div key={doc.id} className="flex items-center justify-between bg-slate-50 rounded-xl p-4 border border-slate-200 hover:border-indigo-300 transition-colors group">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-indigo-50 text-indigo-600"><File className="w-5 h-5" /></div>
                            <div>
                              <h4 className="font-semibold text-slate-900">{doc.name}</h4>
                              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                <span>{doc.size}</span><span>&middot;</span><span>{doc.uploadedDate}</span><span>&middot;</span><span>{doc.uploadedBy}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button className="p-2 hover:bg-slate-200 rounded-lg transition-colors"><Download className="w-5 h-5 text-slate-600" /></button>
                            <button onClick={() => setDeleteDoc(doc)} className="p-2 hover:bg-red-100 rounded-lg transition-colors"><Trash2 className="w-4 h-4 text-red-500" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ════════════ ACTIVITY TAB ════════════ */}
          {activeTab === 'activity' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
              <div className="bg-slate-50 px-8 py-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Activity Timeline</h3>
                    <p className="text-sm text-slate-500 mt-1">Full communication and interaction history</p>
                  </div>
                  <span className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600">{activityData.length} events</span>
                </div>
              </div>
              <div className="p-8">
                {loadingActivity ? (
                  <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-slate-400 animate-spin" /></div>
                ) : activityData.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-10 h-10 text-slate-300" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 mb-2">No activity yet</h4>
                    <p className="text-sm text-slate-500 max-w-md mx-auto">Activity will be logged automatically as you interact with this contact — emails, calls, document uploads, and more.</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {activityData.map((activity, index) => (
                      <div key={activity.id || index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            activity.type === 'Email' ? 'bg-blue-100 text-blue-600' :
                            activity.type === 'Call' ? 'bg-green-100 text-green-600' :
                            activity.type === 'Document' ? 'bg-indigo-100 text-indigo-600' :
                            'bg-purple-100 text-purple-600'
                          }`}>
                            {getActivityIcon(activity.type)}
                          </div>
                          {index < activityData.length - 1 && <div className="w-0.5 flex-1 bg-slate-200 mt-2" />}
                        </div>
                        <div className="flex-1 pb-6">
                          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                            <div className="flex items-center justify-between mb-2">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${
                                activity.type === 'Email' ? 'bg-blue-100 text-blue-700' :
                                activity.type === 'Call' ? 'bg-green-100 text-green-700' :
                                activity.type === 'Document' ? 'bg-indigo-100 text-indigo-700' :
                                'bg-purple-100 text-purple-700'
                              }`}>{activity.type}</span>
                              <span className="text-xs text-slate-400 font-medium">{activity.date}</span>
                            </div>
                            <p className="text-sm text-slate-900 font-medium mb-1">{activity.description}</p>
                            <p className="text-xs text-slate-500">by {activity.user}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* ═══════════ MODALS ═══════════ */}

      {/* ─── Address Drawer (slide-out) ─── */}
      <AnimatePresence>
        {showAddressModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddressModal(false)} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 35, stiffness: 350 }} className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col">
              <div className="bg-slate-800 px-6 py-5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center"><MapPin className="w-5 h-5 text-white" /></div>
                  <div><h3 className="text-lg font-bold text-white">{editingAddress ? 'Edit Address' : 'Add New Address'}</h3><p className="text-slate-400 text-sm">{c.name}</p></div>
                </div>
                <button onClick={() => setShowAddressModal(false)} className="p-2 hover:bg-white/20 rounded-xl transition-colors"><X className="w-5 h-5 text-white" /></button>
              </div>
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Address Type</label>
                  <div className="flex flex-wrap gap-2">
                    {ADDRESS_TYPES.map(t => (
                      <button key={t} onClick={() => setAddressForm({ ...addressForm, label: t })} className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${addressForm.label === t ? 'bg-amber-100 text-amber-700 border-amber-300' : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300'}`}>{t}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Street Address</label>
                  <input type="text" placeholder="123 Main Street" value={addressForm.street1} onChange={e => setAddressForm({ ...addressForm, street1: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Street Address Line 2</label>
                  <input type="text" placeholder="Suite 200, Building A" value={addressForm.street2 || ''} onChange={e => setAddressForm({ ...addressForm, street2: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">City</label>
                    <input type="text" placeholder="Los Angeles" value={addressForm.city} onChange={e => setAddressForm({ ...addressForm, city: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">State / Province</label>
                    <select value={addressForm.state} onChange={e => setAddressForm({ ...addressForm, state: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23475569%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3c%2Fpolyline%3E%3c%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat pr-12 cursor-pointer">
                      <option value="">Select state</option>
                      {US_STATES.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">ZIP / Postal Code</label>
                    <input type="text" placeholder="90001" value={addressForm.zip} onChange={e => setAddressForm({ ...addressForm, zip: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Country</label>
                    <input type="text" placeholder="United States" value={addressForm.country} onChange={e => setAddressForm({ ...addressForm, country: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all" />
                  </div>
                </div>
                <label className="flex items-center gap-3 py-2 cursor-pointer">
                  <div onClick={() => setAddressForm({ ...addressForm, isPrimary: !addressForm.isPrimary })} className={`w-10 h-6 rounded-full transition-colors relative ${addressForm.isPrimary ? 'bg-indigo-500' : 'bg-slate-300'}`}>
                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${addressForm.isPrimary ? 'left-[18px]' : 'left-0.5'}`} />
                  </div>
                  <span className="text-sm font-semibold text-slate-700">Set as primary address</span>
                </label>
              </div>
              <div className="px-6 py-4 border-t border-slate-200 flex items-center gap-3 shrink-0 bg-white">
                <button onClick={() => setShowAddressModal(false)} className="flex-1 px-5 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all">Cancel</button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={saveAddress} disabled={!addressForm.street1 || !addressForm.city || saving} className="flex-1 px-5 py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {editingAddress ? 'Update' : 'Add'} Address
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── Delete Address Confirmation ─── */}
      <AnimatePresence>
        {deleteAddressItem && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteAddressItem(null)} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-3xl shadow-2xl z-50 overflow-hidden">
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><AlertTriangle className="w-8 h-8 text-red-600" /></div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Address</h3>
                <p className="text-slate-600 mb-1">Remove this <strong>{deleteAddressItem.label}</strong> address?</p>
                <p className="text-sm text-slate-400 mb-6">{deleteAddressItem.street1}, {deleteAddressItem.city}</p>
                <div className="flex items-center gap-3">
                  <button onClick={() => setDeleteAddressItem(null)} className="flex-1 px-5 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all">Cancel</button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={confirmDeleteAddress} disabled={saving} className="flex-1 px-5 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── Upload Modal ─── */}
      <AnimatePresence>
        {showUploadModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setShowUploadModal(false); setUploadFiles([]); }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-3xl shadow-2xl z-50 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center"><Upload className="w-5 h-5 text-white" /></div>
                  <div><h3 className="text-lg font-bold text-white">Upload Document</h3><p className="text-indigo-200 text-sm">Add files to {c.name}</p></div>
                </div>
                <button onClick={() => { setShowUploadModal(false); setUploadFiles([]); }} className="p-2 hover:bg-white/20 rounded-xl transition-colors"><X className="w-5 h-5 text-white" /></button>
              </div>
              <div className="p-6">
                <input ref={fileInputRef} type="file" multiple onChange={e => { if (e.target.files) setUploadFiles(Array.from(e.target.files)); }} className="hidden" />
                <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-all">
                  {uploadFiles.length === 0 ? (
                    <>
                      <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3"><Plus className="w-7 h-7 text-slate-400" /></div>
                      <p className="text-sm font-semibold text-slate-700">Click to select files</p>
                      <p className="text-xs text-slate-400 mt-1">PDF, DOC, XLS, PNG, JPG, CSV, ZIP</p>
                    </>
                  ) : (
                    <div className="space-y-2">
                      {uploadFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-slate-200">
                          <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center"><File className="w-4 h-4 text-indigo-600" /></div>
                          <div className="flex-1 text-left min-w-0"><p className="text-sm font-semibold text-slate-900 truncate">{file.name}</p></div>
                          <button onClick={e => { e.stopPropagation(); setUploadFiles(prev => prev.filter((_, i) => i !== idx)); }} className="p-1 hover:bg-red-100 rounded-lg"><X className="w-4 h-4 text-red-500" /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="px-6 pb-6 flex items-center gap-3">
                <button onClick={() => { setShowUploadModal(false); setUploadFiles([]); }} className="flex-1 px-5 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all">Cancel</button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleFileUpload} disabled={uploadFiles.length === 0} className="flex-1 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  <Upload className="w-4 h-4" /> Upload ({uploadFiles.length})
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── Delete Document Confirmation ─── */}
      <AnimatePresence>
        {deleteDoc && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteDoc(null)} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-3xl shadow-2xl z-50 overflow-hidden">
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><AlertTriangle className="w-8 h-8 text-red-600" /></div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Document</h3>
                <p className="font-bold text-slate-900 mb-6">{deleteDoc.name}</p>
                <div className="flex items-center gap-3">
                  <button onClick={() => setDeleteDoc(null)} className="flex-1 px-5 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all">Cancel</button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={confirmDeleteDoc} className="flex-1 px-5 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all flex items-center justify-center gap-2">
                    <Trash2 className="w-4 h-4" /> Delete
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── Delete Contact Confirmation ─── */}
      <AnimatePresence>
        {showDeleteModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDeleteModal(false)} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-3xl shadow-2xl z-50 overflow-hidden">
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><AlertTriangle className="w-8 h-8 text-red-600" /></div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Contact</h3>
                <p className="text-slate-600 mb-6">Are you sure you want to delete <strong>{c.name}</strong>? This action cannot be undone.</p>
                <div className="flex items-center gap-3">
                  <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-5 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all">Cancel</button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { setShowDeleteModal(false); onDelete(); }} className="flex-1 px-5 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all flex items-center justify-center gap-2">
                    <Trash2 className="w-4 h-4" /> Delete
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
