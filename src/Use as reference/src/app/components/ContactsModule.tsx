import { motion, AnimatePresence } from 'motion/react';
import { Users, Plus, Search, Filter, Download, Mail, Phone, Building2, ChevronLeft, ChevronRight, Eye, Edit, Trash2, X, ChevronDown, RefreshCw, ArrowUpDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { ContactDrawer } from './ContactDrawer';
import { ContactDetailView } from './ContactDetailView';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';
import { ColumnVisibilityDropdown, ColumnDef } from './ColumnVisibilityDropdown';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-c0840c88`;

const CONTACT_TYPES = ['Vendor', 'Customer', 'Lead'];
const CONTACT_STATUSES = ['Active', 'Inactive', 'Prospect', 'Cold'];

// Custom dropdown component (matching VendorsPage)
function ContactFilterDropdown({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (val: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const allLabel = options[0];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
          value !== allLabel
            ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
        }`}
      >
        <span className="text-slate-500 font-medium">{label}:</span>
        <span>{value}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-xl z-30 overflow-hidden"
          >
            <div className="py-1.5">
              {options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => { onChange(opt); setOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                    value === opt
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {opt}
                  {value === opt && (
                    <span className="float-right text-indigo-500 font-bold">&#10003;</span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ContactsModule() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<any>(null);
  const [isContactDrawerOpen, setIsContactDrawerOpen] = useState(false);
  const [isContactDetailViewOpen, setIsContactDetailViewOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [contactsData, setContactsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Column visibility
  const contactColumns: ColumnDef[] = [
    { key: 'name', label: 'Name' },
    { key: 'company', label: 'Company' },
    { key: 'position', label: 'Position' },
    { key: 'contactInfo', label: 'Contact Info' },
    { key: 'type', label: 'Type' },
    { key: 'status', label: 'Status' },
    { key: 'owner', label: 'Owner' },
    { key: 'createdAt', label: 'Created' },
    { key: 'lastContact', label: 'Last Contact' },
    { key: 'actions', label: 'Actions' },
  ];
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    contactColumns.forEach(c => { init[c.key] = true; });
    return init;
  });
  const isColVisible = (key: string) => columnVisibility[key] !== false;
  const visibleColCount = contactColumns.filter(c => isColVisible(c.key)).length;

  // Fetch contacts from database
  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/contacts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setContactsData(data.contacts || []);
      } else {
        console.error('Error fetching contacts:', data.error);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  // Save contact (create or update)
  const handleSaveContact = async (contactData: any) => {
    try {
      const isEdit = !!contactData.id;
      const url = isEdit ? `${API_URL}/contacts/${contactData.id}` : `${API_URL}/contacts`;
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(contactData),
      });

      const data = await response.json();
      
      if (data.success) {
        // Refresh contacts list
        await fetchContacts();
        setIsContactDrawerOpen(false);
        setSelectedContact(null);
        console.log(`Contact ${isEdit ? 'updated' : 'created'} successfully`);
        toast.success(`Contact ${isEdit ? 'updated' : 'created'} successfully`);
      } else {
        console.error('Error saving contact:', data.error);
        toast.error(`Failed to ${isEdit ? 'update' : 'create'} contact: ${data.error}`);
      }
    } catch (error) {
      console.error('Error saving contact:', error);
      toast.error(`Error ${contactData.id ? 'updating' : 'creating'} contact`);
    }
  };

  // Delete contact
  const handleDeleteContact = async () => {
    if (!contactToDelete) return;
    
    try {
      const response = await fetch(`${API_URL}/contacts/${contactToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        // Refresh contacts list
        await fetchContacts();
        setDeleteModal(false);
        setContactToDelete(null);
        console.log('Contact deleted successfully');
        toast.success('Contact deleted successfully');
      } else {
        console.error('Error deleting contact:', data.error);
        toast.error(`Failed to delete contact: ${data.error}`);
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast.error('Error deleting contact');
    }
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const filteredContacts = contactsData.filter(contact => {
    const matchesSearch = (contact.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (contact.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (contact.company || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    // If no filters are active, show all
    if (typeFilter === 'All Types' && statusFilter === 'All Statuses') return matchesSearch;
    
    // Check if contact matches any of the active filters
    let matchesType = typeFilter === 'All Types' || typeFilter === contact.type;
    let matchesStatus = statusFilter === 'All Statuses' || statusFilter === contact.status;
    
    return matchesSearch && matchesType && matchesStatus;
  }).sort((a, b) => {
    if (!sortColumn) return 0;
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(filteredContacts.length / rowsPerPage);
  const paginatedContacts = filteredContacts.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
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

  const activeFilterCount = [typeFilter !== 'All Types', statusFilter !== 'All Statuses'].filter(Boolean).length;

  const handleExportExcel = () => {
    if (filteredContacts.length === 0) {
      toast.error('No contacts to export');
      return;
    }
    const headers = ['Name', 'Email', 'Phone', 'Company', 'Position', 'Type', 'Status', 'Owner', 'Country', 'Created', 'Last Contact'];
    const rows = filteredContacts.map(c => [
      c.name || '',
      c.email || '',
      c.phone || '',
      c.company || '',
      c.position || '',
      c.type || '',
      c.status || '',
      c.owner || 'No Owner',
      c.country || '',
      c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '',
      c.lastContact ? new Date(c.lastContact).toLocaleDateString() : '',
    ]);
    const escapeCell = (val: string) => {
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    };
    const csvContent = [headers.join(','), ...rows.map(r => r.map(escapeCell).join(','))].join('\n');
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contacts_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filteredContacts.length} contacts`);
  };

  useEffect(() => { setCurrentPage(1); }, [searchTerm, typeFilter, statusFilter]);

  return (
    <>
      {/* Contact Detail View - Full Screen */}
      {isContactDetailViewOpen && selectedContact ? (
        <ContactDetailView 
          contact={selectedContact}
          onBack={() => {
            setIsContactDetailViewOpen(false);
          }}
          onDelete={() => {
            setIsContactDetailViewOpen(false);
            setDeleteModal(true);
            setContactToDelete(selectedContact);
          }}
          onContactUpdated={(updatedContact) => {
            setSelectedContact(updatedContact);
            fetchContacts();
          }}
        />
      ) : (
    <div className="flex-1 flex flex-col bg-slate-50/50 overflow-hidden">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Contacts</h1>
                <p className="text-slate-500 text-sm">Vendor, Customer, and Lead Contacts</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleExportExcel}
                className="flex items-center gap-1.5 px-4 py-2 bg-white text-slate-700 text-sm font-semibold rounded-xl border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all"
              >
                <Download className="w-4 h-4" />
                Export
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsContactDrawerOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-white text-slate-700 text-sm font-semibold rounded-xl border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Contact
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-6 mt-4 mb-4">
        <div className="max-w-[1800px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="text-[11px] font-medium text-slate-500 mb-0.5">Total Contacts</div>
              <div className="text-xl font-bold text-slate-900">{contactsData.length}</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="text-[11px] font-medium text-slate-500 mb-0.5">Active Vendors</div>
              <div className="text-xl font-bold text-slate-900">
                {contactsData.filter(c => c.type === 'Vendor' && c.status === 'Active').length}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="text-[11px] font-medium text-slate-500 mb-0.5">Active Customers</div>
              <div className="text-xl font-bold text-slate-900">
                {contactsData.filter(c => c.type === 'Customer' && c.status === 'Active').length}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 bg-gradient-to-br from-slate-500 to-slate-600 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="text-[11px] font-medium text-slate-500 mb-0.5">Inactive Contacts</div>
              <div className="text-xl font-bold text-slate-900">
                {contactsData.filter(c => c.status === 'Inactive').length}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="px-6 pb-0 shrink-0 mb-4">
        <div className="max-w-[1800px] mx-auto">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search contacts by name, email, or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchContacts}
                className="p-2 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
              </motion.button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2.5 mt-3">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <Filter className="w-3.5 h-3.5" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 bg-indigo-600 text-white rounded-full text-xs flex items-center justify-center font-bold">{activeFilterCount}</span>
                )}
              </div>

              <ContactFilterDropdown
                label="Type"
                value={typeFilter}
                options={['All Types', ...CONTACT_TYPES]}
                onChange={setTypeFilter}
              />

              <ContactFilterDropdown
                label="Status"
                value={statusFilter}
                options={['All Statuses', ...CONTACT_STATUSES]}
                onChange={setStatusFilter}
              />

              {activeFilterCount > 0 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setTypeFilter('All Types'); setStatusFilter('All Statuses'); }}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear
                </motion.button>
              )}

              <div className="ml-auto">
                <ColumnVisibilityDropdown
                  columns={contactColumns}
                  visibleColumns={columnVisibility}
                  onChange={setColumnVisibility}
                  accentColor="indigo"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="max-w-[1800px] mx-auto">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {isColVisible('name') && <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      <button onClick={() => handleSort('name')} className="flex items-center gap-2 hover:text-indigo-600 transition-colors">
                        Name <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
                      </button>
                    </th>}
                    {isColVisible('company') && <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      <button onClick={() => handleSort('company')} className="flex items-center gap-2 hover:text-indigo-600 transition-colors">
                        Company <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
                      </button>
                    </th>}
                    {isColVisible('position') && <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      <button onClick={() => handleSort('position')} className="flex items-center gap-2 hover:text-indigo-600 transition-colors">
                        Position <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
                      </button>
                    </th>}
                    {isColVisible('contactInfo') && <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Contact Info</th>}
                    {isColVisible('type') && <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      <button onClick={() => handleSort('type')} className="flex items-center gap-2 hover:text-indigo-600 transition-colors">
                        Type <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
                      </button>
                    </th>}
                    {isColVisible('status') && <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      <button onClick={() => handleSort('status')} className="flex items-center gap-2 hover:text-indigo-600 transition-colors">
                        Status <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
                      </button>
                    </th>}
                    {isColVisible('owner') && <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      <button onClick={() => handleSort('owner')} className="flex items-center gap-2 hover:text-indigo-600 transition-colors">
                        Owner <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
                      </button>
                    </th>}
                    {isColVisible('createdAt') && <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      <button onClick={() => handleSort('createdAt')} className="flex items-center gap-2 hover:text-indigo-600 transition-colors">
                        Created <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
                      </button>
                    </th>}
                    {isColVisible('lastContact') && <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      <button onClick={() => handleSort('lastContact')} className="flex items-center gap-2 hover:text-indigo-600 transition-colors">
                        Last Contact <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
                      </button>
                    </th>}
                    {isColVisible('actions') && <th className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Actions</th>}
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
                      {isColVisible('name') && <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-semibold text-xs">
                              {(contact.name || '?').split(' ').map((n: string) => n[0]).join('')}
                            </span>
                          </div>
                          <div className="text-sm font-semibold text-slate-900 whitespace-nowrap">{contact.name}</div>
                        </div>
                      </td>}
                      {isColVisible('company') && <td className="px-4 py-3">
                        <div className="text-xs font-medium text-slate-900 whitespace-nowrap">{contact.company}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5 whitespace-nowrap">{contact.country}</div>
                      </td>}
                      {isColVisible('position') && <td className="px-4 py-3">
                        <div className="text-xs text-slate-700">{contact.position}</div>
                      </td>}
                      {isColVisible('contactInfo') && <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-0.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {contact.email}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {contact.phone}
                        </div>
                      </td>}
                      {isColVisible('type') && <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${getTypeBadgeColor(contact.type)}`}>
                          {contact.type}
                        </span>
                      </td>}
                      {isColVisible('status') && <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${getStatusBadgeColor(contact.status)}`}>
                          {contact.status}
                        </span>
                      </td>}
                      {isColVisible('owner') && <td className="px-4 py-3">
                        {contact.owner ? (
                          <div className="text-xs font-medium text-slate-700 whitespace-nowrap">{contact.owner}</div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">No Owner</span>
                        )}
                      </td>}
                      {isColVisible('createdAt') && <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-xs text-slate-600">{contact.createdAt ? (() => {
                          const d = new Date(contact.createdAt);
                          if (isNaN(d.getTime())) return contact.createdAt;
                          return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}-${d.getFullYear()}`;
                        })() : '—'}</span>
                      </td>}
                      {isColVisible('lastContact') && <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-xs text-slate-600">{contact.lastContact ? (() => {
                          const d = new Date(contact.lastContact);
                          if (isNaN(d.getTime())) return contact.lastContact;
                          return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}-${d.getFullYear()}`;
                        })() : '—'}</span>
                      </td>}
                      {isColVisible('actions') && <td className="px-4 py-3">
                        <div className="flex items-center gap-0.5">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setSelectedContact(contact);
                              setIsContactDetailViewOpen(true);
                            }}
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setSelectedContact(contact);
                              setIsContactDrawerOpen(true);
                            }}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
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
                            className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </td>}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination - inside table card */}
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Page {currentPage} of {Math.max(1, totalPages)} · Showing {Math.min((currentPage - 1) * rowsPerPage + 1, filteredContacts.length)} to {Math.min(currentPage * rowsPerPage, filteredContacts.length)} of {filteredContacts.length}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">Rows per page:</span>
                <select
                  value={rowsPerPage}
                  onChange={e => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <div className="flex gap-1 ml-4">
                  <button
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  >
                    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                    disabled={currentPage >= Math.max(1, totalPages)}
                    onClick={() => setCurrentPage(p => Math.min(Math.max(1, totalPages), p + 1))}
                  >
                    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
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
        isOpen={isContactDrawerOpen} 
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