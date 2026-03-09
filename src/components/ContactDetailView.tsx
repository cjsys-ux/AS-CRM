import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Mail, Phone, Building2, Globe, MapPin, FileText, DollarSign, ShoppingCart, Package, Calendar, Edit, Trash2, MessageSquare, Video, Send, Upload, File, X, Download, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';


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
}

interface ContactDetailViewProps {
  contact: Contact;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function ContactDetailView({ contact, onBack, onEdit, onDelete }: ContactDetailViewProps) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteFileModal, setShowDeleteFileModal] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [isDeletingFile, setIsDeletingFile] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{
    id: string;
    name: string;
    size: string;
    uploadedDate: string;
    uploadedBy: string;
    fileUrl?: string;
  }>>([]);

  // Fetch purchase orders for this contact
  useEffect(() => {
    setLoading(false);
    setOrders([]);
  }, [contact.company]);

  // Fetch uploaded files for this contact
  const fetchFiles = async () => {
    if (!contact.id) return;
    try {
      const res = await fetch(`/api/files/list?entityType=contact-file&entityId=${encodeURIComponent(contact.id)}`);
      if (!res.ok) return;
      const data = await res.json();
      const mapped = (data.uploads ?? []).map((u: any) => {
        const sizeBytes = typeof u.size === 'number' ? u.size : 0;
        const sizeStr = sizeBytes > 1024 * 1024
          ? `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.max(1, Math.round(sizeBytes / 1024))} KB`;
        return {
          id: u.id ?? u._id,
          name: u.fileName ?? 'Unknown',
          size: sizeStr,
          uploadedDate: u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : '',
          uploadedBy: u.uploadedBy ?? 'User',
          fileUrl: u.fileUrl ?? '',
        };
      });
      setUploadedFiles(mapped);
    } catch {
      // non-fatal
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [contact.id]);

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    setShowDeleteModal(false);
    onDelete();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !contact.id) return;

    const MAX_SIZE = 50 * 1024 * 1024; // 50 MB
    for (const file of Array.from(files)) {
      if (file.size > MAX_SIZE) {
        toast.error(`${file.name} exceeds the 50 MB size limit`);
        return;
      }
    }

    setIsUploadingFile(true);
    try {
      for (const file of Array.from(files)) {
        // 1. Get presigned URL
        const presignRes = await fetch('/api/files/presign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            entityType: 'contact-file',
            entityId: contact.id,
          }),
        });
        if (!presignRes.ok) throw new Error('Failed to get upload URL');
        const { uploadUrl, key } = await presignRes.json();

        // 2. Upload to S3
        const s3Res = await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type },
        });
        if (!s3Res.ok) throw new Error('Failed to upload file to storage');

        // 3. Record metadata in MongoDB
        const completeRes = await fetch('/api/files/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            key,
            fileName: file.name,
            fileType: file.type,
            size: file.size,
            entityType: 'contact-file',
            entityId: contact.id,
            uploadedBy: user?.sub ?? user?.name ?? 'User',
          }),
        });
        if (!completeRes.ok) throw new Error('Failed to record file metadata');
      }
      toast.success(`${files.length} file${files.length > 1 ? 's' : ''} uploaded`);
      await fetchFiles();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploadingFile(false);
      // Reset input
      event.target.value = '';
    }
  };

  const handleRemoveFile = (file: { id: string; name: string }) => {
    setFileToDelete(file);
    setShowDeleteFileModal(true);
  };

  const handleConfirmFileDelete = async () => {
    if (!fileToDelete) return;
    setIsDeletingFile(true);
    try {
      const res = await fetch('/api/files/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: fileToDelete.id }),
      });
      if (!res.ok) throw new Error('Failed to delete file');
      toast.success('File deleted');
      await fetchFiles();
    } catch {
      toast.error('Failed to delete file');
    } finally {
      setIsDeletingFile(false);
      setShowDeleteFileModal(false);
      setFileToDelete(null);
    }
  };

  // Sample data for associated records
  const quotes = [
    { id: 'QT-1024', date: '2026-02-15', amount: 5450.00, status: 'Sent', items: 3 },
    { id: 'QT-1019', date: '2026-02-10', amount: 3200.00, status: 'Accepted', items: 2 },
    { id: 'QT-1008', date: '2026-01-28', amount: 8750.00, status: 'Pending', items: 5 },
  ];

  const invoices = [
    { id: 'INV-2045', date: '2026-02-12', amount: 3200.00, status: 'Paid', dueDate: '2026-02-26' },
    { id: 'INV-2033', date: '2026-01-15', amount: 4500.00, status: 'Paid', dueDate: '2026-01-29' },
    { id: 'INV-2028', date: '2026-01-08', amount: 2800.00, status: 'Overdue', dueDate: '2026-01-22' },
  ];

  const projects = [
    { id: 'PRJ-342', name: 'Q1 Corporate Swag Campaign', status: 'Active', startDate: '2026-01-15', value: 45000 },
    { id: 'PRJ-328', name: 'Trade Show Merchandise', status: 'Completed', startDate: '2025-12-01', value: 32000 },
  ];

  const recentActivity = [
    { date: '2026-02-15', type: 'Email', description: 'Sent quote QT-1024 for review', user: 'Patrick Lowenthal' },
    { date: '2026-02-10', type: 'Call', description: 'Discussed pricing and timelines', user: 'Sarah Chen' },
    { date: '2026-02-08', type: 'Meeting', description: 'Product presentation and samples review', user: 'Patrick Lowenthal' },
    { date: '2026-01-28', type: 'Email', description: 'Follow-up on previous quote', user: 'Patrick Lowenthal' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
      case 'Paid':
      case 'Delivered':
      case 'Completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Sent':
      case 'In Production':
      case 'Shipped':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Pending':
      case 'Prospect':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Overdue':
      case 'Cold':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'Accepted':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Vendor':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Customer':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Lead':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'Email':
        return <Mail className="w-4 h-4" />;
      case 'Call':
        return <Phone className="w-4 h-4" />;
      case 'Meeting':
        return <Video className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 px-8 py-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
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
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onEdit}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit Contact
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDeleteClick}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-500/20 backdrop-blur-sm border border-red-300/30 text-white font-semibold rounded-xl hover:bg-red-500/30 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-8">
        <div className="max-w-[1400px] mx-auto space-y-6">
          {/* Contact Header Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg overflow-hidden"
          >
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-8 py-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-xl">
                    <span className="text-4xl font-bold text-indigo-600">
                      {contact.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{contact.name}</h1>
                    <p className="text-indigo-100 text-lg mb-3">{contact.position}</p>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold border-2 ${getTypeColor(contact.type)} bg-white`}>
                        {contact.type}
                      </span>
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold border-2 ${getStatusColor(contact.status)} bg-white`}>
                        {contact.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase">Email</p>
                      <p className="text-sm font-medium text-slate-900">{contact.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <Phone className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase">Phone</p>
                      <p className="text-sm font-medium text-slate-900">{contact.phone}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase">Company</p>
                      <p className="text-sm font-medium text-slate-900">{contact.company}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                      <Globe className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase">Country</p>
                      <p className="text-sm font-medium text-slate-900">{contact.country}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase">Last Contact</p>
                      <p className="text-sm font-medium text-slate-900">{contact.lastContact}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-6 pt-6 border-t border-slate-200">
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                  >
                    <Send className="w-4 h-4" />
                    Send Email
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    Call
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <Video className="w-4 h-4" />
                    Schedule Meeting
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-3 gap-6">
            {/* Left Column - Main Content */}
            <div className="col-span-2 space-y-6">
              {/* Orders */}
              {contact.type === 'Customer' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                          <Package className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">Orders</h3>
                          <p className="text-sm text-slate-500">Active and completed orders</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    {orders.length > 0 ? (
                      <div className="space-y-3">
                        {orders.map((order) => (
                          <div key={order.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:border-purple-300 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-slate-900">{order.id}</h4>
                              <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(order.status)}`}>
                                {order.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-slate-600">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {order.date || 'N/A'}
                              </span>
                              <span className="flex items-center gap-1 font-semibold text-green-600">
                                <DollarSign className="w-4 h-4" />
                                ${order.totalAmount?.toLocaleString() || order.amount?.toLocaleString() || '0'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                        <p>No orders found for this contact</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Quotes */}
              {(contact.type === 'Customer' || contact.type === 'Lead') && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">Quotes</h3>
                          <p className="text-sm text-slate-500">{quotes.length} quotes sent</p>
                        </div>
                      </div>
                    </div>
                  </div>
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
                        {quotes.map((quote) => (
                          <tr key={quote.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                              <span className="font-semibold text-slate-900">{quote.id}</span>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">{quote.date}</td>
                            <td className="px-6 py-4 text-sm text-slate-600">{quote.items} items</td>
                            <td className="px-6 py-4">
                              <span className="font-semibold text-green-600">${quote.amount.toLocaleString()}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${getStatusColor(quote.status)}`}>
                                {quote.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {/* Invoices */}
              {contact.type === 'Customer' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">Invoices</h3>
                          <p className="text-sm text-slate-500">{invoices.length} invoices generated</p>
                        </div>
                      </div>
                    </div>
                  </div>
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
                        {invoices.map((invoice) => (
                          <tr key={invoice.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                              <span className="font-semibold text-slate-900">{invoice.id}</span>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">{invoice.date}</td>
                            <td className="px-6 py-4 text-sm text-slate-600">{invoice.dueDate}</td>
                            <td className="px-6 py-4">
                              <span className="font-semibold text-green-600">${invoice.amount.toLocaleString()}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${getStatusColor(invoice.status)}`}>
                                {invoice.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {/* Purchase Orders (for Vendors) */}
              {contact.type === 'Vendor' && (
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
                          <ShoppingCart className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">Purchase Orders</h3>
                          <p className="text-sm text-slate-500">{orders.length} purchase orders</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">PO ID</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Vendor</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {orders.map((po) => (
                          <tr key={po.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                              <span className="font-semibold text-slate-900">{po.id}</span>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">{po.date}</td>
                            <td className="px-6 py-4 text-sm text-slate-600">{po.vendor}</td>
                            <td className="px-6 py-4">
                              <span className="font-semibold text-green-600">${po.amount.toLocaleString()}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${getStatusColor(po.status)}`}>
                                {po.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Right Column - Activity Timeline */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden"
              >
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
                  <h3 className="text-lg font-bold text-slate-900">Recent Activity</h3>
                  <p className="text-sm text-slate-500">Communication history</p>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            activity.type === 'Email' ? 'bg-blue-100 text-blue-600' :
                            activity.type === 'Call' ? 'bg-green-100 text-green-600' :
                            'bg-purple-100 text-purple-600'
                          }`}>
                            {getActivityIcon(activity.type)}
                          </div>
                          {index < recentActivity.length - 1 && (
                            <div className="w-0.5 h-full bg-slate-200 mt-2" />
                          )}
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
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden"
              >
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Documents</h3>
                      <p className="text-sm text-slate-500">Uploaded files</p>
                    </div>
                    <div>
                      <input
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                        disabled={isUploadingFile}
                      />
                      <label
                        htmlFor="file-upload"
                        className={`flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-300 transition-colors cursor-pointer ${isUploadingFile ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''}`}
                      >
                        {isUploadingFile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        {isUploadingFile ? 'Uploading...' : 'Upload File'}
                      </label>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {uploadedFiles.length === 0 && (
                      <p className="text-sm text-slate-500 text-center py-4">No documents uploaded yet.</p>
                    )}
                    {uploadedFiles.map((file) => (
                      <div key={file.id} className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3 flex-1">
                          <File className="w-5 h-5 text-slate-400" />
                          <div>
                            <p className="text-sm font-medium text-slate-900">{file.name}</p>
                            <p className="text-xs text-slate-500">{file.size} - {file.uploadedDate}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => { if (file.fileUrl) window.open(file.fileUrl, '_blank'); }}
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleRemoveFile({ id: file.id, name: file.name })}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed top-0 left-0 right-0 bottom-0 bg-black/50 flex items-center justify-center"
          >
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden w-96">
              <div className="bg-gradient-to-r from-red-50 to-red-100 px-6 py-4 border-b border-slate-200">
                <h3 className="text-lg font-bold text-red-900">Confirm Delete</h3>
                <p className="text-sm text-slate-500">Are you sure you want to delete this contact?</p>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-end gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowDeleteModal(false)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gray-500/20 backdrop-blur-sm border border-gray-300/30 text-gray-500 font-semibold rounded-xl hover:bg-gray-500/30 transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleConfirmDelete}
                    className="flex items-center gap-2 px-5 py-2.5 bg-red-500/20 backdrop-blur-sm border border-red-300/30 text-red-500 font-semibold rounded-xl hover:bg-red-500/30 transition-colors"
                  >
                    Delete
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete File Confirmation Modal */}
      <AnimatePresence>
        {showDeleteFileModal && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed top-0 left-0 right-0 bottom-0 bg-black/50 flex items-center justify-center"
          >
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden w-96">
              <div className="bg-gradient-to-r from-red-50 to-red-100 px-6 py-4 border-b border-slate-200">
                <h3 className="text-lg font-bold text-red-900">Confirm Delete</h3>
                <p className="text-sm text-slate-500">Are you sure you want to delete &quot;{fileToDelete?.name}&quot;?</p>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-end gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowDeleteFileModal(false)}
                    disabled={isDeletingFile}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gray-500/20 backdrop-blur-sm border border-gray-300/30 text-gray-500 font-semibold rounded-xl hover:bg-gray-500/30 transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: isDeletingFile ? 1 : 1.05 }}
                    whileTap={{ scale: isDeletingFile ? 1 : 0.95 }}
                    onClick={handleConfirmFileDelete}
                    disabled={isDeletingFile}
                    className={`flex items-center gap-2 px-5 py-2.5 bg-red-500/20 backdrop-blur-sm border border-red-300/30 text-red-500 font-semibold rounded-xl hover:bg-red-500/30 transition-colors ${isDeletingFile ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    {isDeletingFile && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isDeletingFile ? 'Deleting...' : 'Delete'}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}