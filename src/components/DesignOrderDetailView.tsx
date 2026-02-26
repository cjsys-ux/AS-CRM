import { motion } from 'motion/react';
import { ArrowLeft, Palette, User, Calendar, FileText, Image as ImageIcon, MessageSquare, Download, Upload, Edit2, Trash2, CheckCircle, Clock, AlertCircle, Building2, Phone, Mail, MapPin, DollarSign, Package, Send, AtSign, Paperclip, Tag, Briefcase } from 'lucide-react';
import { useState } from 'react';

interface DesignProject {
  id: string;
  name: string;
  client: string;
  designer: string;
  status: string;
  type: string;
  createdDate: string;
  dueDate: string;
  revisions: number;
  thumbnail: string;
}

interface DesignOrderDetailViewProps {
  project: DesignProject;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function DesignOrderDetailView({ project, onBack, onEdit, onDelete }: DesignOrderDetailViewProps) {
  const [newComment, setNewComment] = useState('');
  const [showMentions, setShowMentions] = useState(false);

  // Product and vendor information
  const productInfo = {
    name: 'Custom Embroidered Polo Shirt',
    sku: 'POL-2045-NVY',
    image: 'https://images.unsplash.com/photo-1626497764746-6dc36546b388?w=600&h=600&fit=crop',
    color: 'Navy Blue',
    size: 'M, L, XL, 2XL',
    quantity: 250,
    decorationMethod: 'Embroidery',
    decorationLocation: 'Left Chest',
    decorationSize: '3.5" x 2.5"',
    unitPrice: '$12.50',
  };

  const vendorInfo = {
    name: 'SC Promo',
    contact: 'Robbin Chan',
    email: 'robbin@scpromo.com',
    phone: '+86 579 8526 4789',
    location: 'Yiwu, China',
    productType: 'Apparel Manufacturer',
    terms: 'Net 30',
    pricing: '$12.50/unit',
    leadTime: '15-20 business days',
    minOrder: '50 units',
  };

  const dealInfo = {
    customer: 'TechCorp Industries',
    projectNumber: 'PROJ-5892',
    salesRep: 'John Martinez',
    salesRepEmail: 'john.martinez@company.com',
    salesRepPhone: '(555) 123-4567',
    customerContact: 'Sarah Williams',
    customerEmail: 'sarah.williams@techcorp.com',
    customerPhone: '(555) 234-5678',
    orderValue: '$3,125.00',
    deadline: '2026-03-15',
    poNumber: 'PO-5678',
  };

  // Sample data for design-related records
  const designVersions = [
    { 
      id: 1, 
      version: 'v3', 
      date: '2026-02-18', 
      designer: 'Sarah Johnson', 
      status: 'Approved', 
      comments: 'Final version approved by client. Ready for production.', 
      thumbnail: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=200&h=200&fit=crop' 
    },
    { 
      id: 2, 
      version: 'v2', 
      date: '2026-02-15', 
      designer: 'Sarah Johnson', 
      status: 'Revision', 
      comments: 'Client requested logo to be 20% larger and colors adjusted.', 
      thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200&h=200&fit=crop' 
    },
    { 
      id: 3, 
      version: 'v1', 
      date: '2026-02-12', 
      designer: 'Sarah Johnson', 
      status: 'Ready', 
      comments: 'Initial concept submitted for client review.', 
      thumbnail: 'https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=200&h=200&fit=crop' 
    },
  ];

  const files = [
    { id: 'F-001', name: 'Final-Artwork-v3.ai', type: 'Adobe Illustrator', size: '24.5 MB', uploadDate: '2026-02-18', uploadedBy: 'Sarah Johnson' },
    { id: 'F-002', name: 'Product-Mockup.png', type: 'PNG Image', size: '8.2 MB', uploadDate: '2026-02-18', uploadedBy: 'Sarah Johnson' },
    { id: 'F-003', name: 'Client-Logo-Files.zip', type: 'ZIP Archive', size: '15.3 MB', uploadDate: '2026-02-12', uploadedBy: 'John Martinez' },
    { id: 'F-004', name: 'Brand-Guidelines.pdf', type: 'PDF Document', size: '3.8 MB', uploadDate: '2026-02-12', uploadedBy: 'John Martinez' },
    { id: 'F-005', name: 'PO-5678-Details.pdf', type: 'PDF Document', size: '456 KB', uploadDate: '2026-02-10', uploadedBy: 'System' },
  ];

  const comments = [
    { 
      id: 1, 
      author: 'Sarah Johnson', 
      role: 'Graphic Designer', 
      date: '2026-02-18 10:45 AM', 
      message: '@MikeChen Final version is ready for approval! I\'ve increased the logo size and adjusted the colors per client feedback.',
      avatar: 'SJ'
    },
    { 
      id: 2, 
      author: 'Mike Chen', 
      role: 'Creative Director', 
      date: '2026-02-15 2:30 PM', 
      message: '@SarahJohnson Great work on v2. Client loves the direction but wants the logo slightly larger. Can you adjust?',
      avatar: 'MC'
    },
    { 
      id: 3, 
      author: 'John Martinez', 
      role: 'Sales Rep', 
      date: '2026-02-12 11:20 AM', 
      message: 'Client is very excited about this order. They need it by March 15th for their annual conference.',
      avatar: 'JM'
    },
    { 
      id: 4, 
      author: 'Lisa Park', 
      role: 'Production Manager', 
      date: '2026-02-12 9:15 AM', 
      message: '@SarahJohnson Vendor confirmed they can meet the deadline. Please prioritize this design.',
      avatar: 'LP'
    },
  ];

  const activityTimeline = [
    { date: '2026-02-18', time: '10:45 AM', type: 'Approval', description: 'Design v3 approved and sent to production', user: 'Mike Chen', status: 'Approved' },
    { date: '2026-02-18', time: '9:30 AM', type: 'Upload', description: 'Final-Artwork-v3.ai uploaded', user: 'Sarah Johnson', status: null },
    { date: '2026-02-15', time: '2:30 PM', type: 'Revision', description: 'Revision requested - increase logo size', user: 'Mike Chen', status: 'Revision' },
    { date: '2026-02-15', time: '11:00 AM', type: 'Upload', description: 'Design-v2.ai uploaded', user: 'Sarah Johnson', status: null },
    { date: '2026-02-12', time: '3:45 PM', type: 'Comment', description: 'Client feedback received', user: 'John Martinez', status: null },
    { date: '2026-02-12', time: '9:00 AM', type: 'Creation', description: 'Design order created and assigned', user: 'System', status: 'Pending' },
  ];

  const teamMembers = [
    { name: 'Sarah Johnson', role: 'Graphic Designer', tag: '@SarahJohnson' },
    { name: 'Mike Chen', role: 'Creative Director', tag: '@MikeChen' },
    { name: 'John Martinez', role: 'Sales Rep', tag: '@JohnMartinez' },
    { name: 'Lisa Park', role: 'Production Manager', tag: '@LisaPark' },
  ];

  const handleSendComment = () => {
    if (newComment.trim()) {
      console.log('New comment:', newComment);
      setNewComment('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendComment();
    }
    if (e.key === '@') {
      setShowMentions(true);
    }
  };

  const handleMentionClick = (tag: string) => {
    setNewComment(newComment + tag + ' ');
    setShowMentions(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Ready':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Revision':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Pending':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'Ready':
        return <Clock className="w-4 h-4" />;
      case 'Revision':
        return <AlertCircle className="w-4 h-4" />;
      case 'Pending':
        return <Clock className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-600 px-8 py-6">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05, x: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={onBack}
                className="flex items-center gap-2 text-white/90 hover:text-white font-medium transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Design Lab
              </motion.button>
            </div>
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download Template
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onEdit}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onDelete}
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
        <div className="max-w-[1600px] mx-auto space-y-6">
          {/* Header Section */}
          <div className="grid grid-cols-3 gap-6">
            {/* Product Image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg overflow-hidden p-6"
            >
              <h3 className="text-lg font-bold text-slate-900 mb-4">Product Image</h3>
              <div className="relative group">
                <img 
                  src={productInfo.image} 
                  alt={productInfo.name}
                  className="w-full h-80 rounded-xl object-cover border-2 border-slate-200"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-3 bg-white rounded-full"
                  >
                    <ImageIcon className="w-6 h-6 text-slate-900" />
                  </motion.button>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <h4 className="font-bold text-slate-900">{productInfo.name}</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-slate-500">SKU:</span>
                    <p className="font-semibold text-slate-900">{productInfo.sku}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Color:</span>
                    <p className="font-semibold text-slate-900">{productInfo.color}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Sizes:</span>
                    <p className="font-semibold text-slate-900">{productInfo.size}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Quantity:</span>
                    <p className="font-semibold text-slate-900">{productInfo.quantity}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Decoration:</span>
                    <p className="font-semibold text-slate-900">{productInfo.decorationMethod}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Location:</span>
                    <p className="font-semibold text-slate-900">{productInfo.decorationLocation}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Vendor Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Vendor Details</h3>
                  <p className="text-sm text-slate-500">Supplier information</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase">Vendor Name</span>
                  <p className="text-sm font-bold text-slate-900">{vendorInfo.name}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase">Contact Person</span>
                  <p className="text-sm font-semibold text-slate-900">{vendorInfo.contact}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <p className="text-sm text-slate-700">{vendorInfo.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <p className="text-sm text-slate-700">{vendorInfo.phone}</p>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <p className="text-sm text-slate-700">{vendorInfo.location}</p>
                </div>
                <div className="pt-2 border-t border-slate-200">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-slate-500">Product Type:</span>
                      <p className="font-semibold text-slate-900">{vendorInfo.productType}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Payment Terms:</span>
                      <p className="font-semibold text-slate-900">{vendorInfo.terms}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Unit Price:</span>
                      <p className="font-semibold text-green-600">{vendorInfo.pricing}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Lead Time:</span>
                      <p className="font-semibold text-slate-900">{vendorInfo.leadTime}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Deal Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Deal Information</h3>
                  <p className="text-sm text-slate-500">Customer & order details</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase">Customer</span>
                  <p className="text-sm font-bold text-slate-900">{dealInfo.customer}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase">Project #</span>
                    <p className="text-sm font-semibold text-slate-900">{dealInfo.projectNumber}</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase">PO Number</span>
                    <p className="text-sm font-semibold text-slate-900">{dealInfo.poNumber}</p>
                  </div>
                </div>
                
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Sales Rep</span>
                  <p className="text-sm font-bold text-slate-900">{dealInfo.salesRep}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="w-3 h-3 text-slate-400" />
                    <p className="text-xs text-slate-600">{dealInfo.salesRepEmail}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <p className="text-xs text-slate-600">{dealInfo.salesRepPhone}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Customer Contact</span>
                  <p className="text-sm font-bold text-slate-900">{dealInfo.customerContact}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="w-3 h-3 text-slate-400" />
                    <p className="text-xs text-slate-600">{dealInfo.customerEmail}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <p className="text-xs text-slate-600">{dealInfo.customerPhone}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-xs font-semibold text-slate-500 uppercase">Order Value</span>
                      <p className="text-lg font-bold text-green-600">{dealInfo.orderValue}</p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-500 uppercase">Deadline</span>
                      <p className="text-sm font-bold text-red-600">{dealInfo.deadline}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Main Content Area */}
          <div className="grid grid-cols-3 gap-6">
            {/* Left Column - Design Versions & Files */}
            <div className="col-span-2 space-y-6">
              {/* Design Versions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden"
              >
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                        <Palette className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">Design Versions</h3>
                        <p className="text-sm text-slate-500">{designVersions.length} revisions</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {designVersions.map((version) => (
                      <div key={version.id} className="flex gap-4 bg-slate-50 rounded-xl p-4 border border-slate-200 hover:border-purple-300 transition-colors">
                        <img 
                          src={version.thumbnail} 
                          alt={`Version ${version.version}`}
                          className="w-28 h-28 rounded-lg object-cover border-2 border-slate-200"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <h4 className="font-bold text-slate-900">{version.version}</h4>
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold border ${getStatusColor(version.status)}`}>
                                {getStatusIcon(version.status)}
                                {version.status}
                              </span>
                            </div>
                            <span className="text-sm text-slate-500">{version.date}</span>
                          </div>
                          <p className="text-sm text-slate-600 mb-2">{version.comments}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <User className="w-3 h-3" />
                              <span>{version.designer}</span>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <Download className="w-3 h-3" />
                              Download
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Files Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden"
              >
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">Files & Documents</h3>
                        <p className="text-sm text-slate-500">{files.length} files</p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      Upload
                    </motion.button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {files.map((file) => (
                      <div key={file.id} className="flex items-center justify-between bg-slate-50 rounded-xl p-4 border border-slate-200 hover:border-blue-300 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-900">{file.name}</h4>
                            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                              <span>{file.type}</span>
                              <span>•</span>
                              <span>{file.size}</span>
                              <span>•</span>
                              <span>{file.uploadDate}</span>
                              <span>•</span>
                              <span>{file.uploadedBy}</span>
                            </div>
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                          <Download className="w-5 h-5 text-slate-600" />
                        </motion.button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Comments Section with Tagging */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden"
              >
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Team Discussion</h3>
                      <p className="text-sm text-slate-500">Internal comments with @mentions</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  {/* Comments List */}
                  <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {comment.avatar}
                        </div>
                        <div className="flex-1 bg-slate-50 rounded-xl p-4 border border-slate-200">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-slate-900">{comment.author}</h4>
                              <p className="text-xs text-slate-500">{comment.role}</p>
                            </div>
                            <span className="text-xs text-slate-400">{comment.date}</span>
                          </div>
                          <p className="text-sm text-slate-700">{comment.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* New Comment Input */}
                  <div className="border-t border-slate-200 pt-6">
                    <div className="relative">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your comment... Use @ to mention team members"
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all resize-none"
                        rows={3}
                      />
                      
                      {/* Mention Suggestions */}
                      {showMentions && (
                        <div className="absolute bottom-full mb-2 left-0 right-0 bg-white border-2 border-slate-200 rounded-xl shadow-xl overflow-hidden z-10">
                          {teamMembers.map((member, index) => (
                            <button
                              key={index}
                              onClick={() => handleMentionClick(member.tag)}
                              className="w-full px-4 py-3 hover:bg-slate-50 transition-colors text-left flex items-center gap-3"
                            >
                              <AtSign className="w-4 h-4 text-purple-600" />
                              <div>
                                <p className="font-semibold text-slate-900">{member.name}</p>
                                <p className="text-xs text-slate-500">{member.role}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setShowMentions(!showMentions)}
                          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Mention someone"
                        >
                          <AtSign className="w-5 h-5 text-slate-600" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Attach file"
                        >
                          <Paperclip className="w-5 h-5 text-slate-600" />
                        </motion.button>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSendComment}
                        disabled={!newComment.trim()}
                        className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="w-4 h-4" />
                        Send
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Timeline */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden"
              >
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
                  <h3 className="text-lg font-bold text-slate-900">Activity Timeline</h3>
                  <p className="text-sm text-slate-500">Project history & updates</p>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {activityTimeline.map((activity, index) => (
                      <div key={index} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            activity.type === 'Approval' ? 'bg-green-100 text-green-600' :
                            activity.type === 'Revision' ? 'bg-amber-100 text-amber-600' :
                            activity.type === 'Upload' ? 'bg-blue-100 text-blue-600' :
                            activity.type === 'Comment' ? 'bg-purple-100 text-purple-600' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {activity.type === 'Approval' ? <CheckCircle className="w-4 h-4" /> :
                             activity.type === 'Revision' ? <AlertCircle className="w-4 h-4" /> :
                             activity.type === 'Upload' ? <Upload className="w-4 h-4" /> :
                             activity.type === 'Comment' ? <MessageSquare className="w-4 h-4" /> :
                             <Calendar className="w-4 h-4" />}
                          </div>
                          {index < activityTimeline.length - 1 && (
                            <div className="w-0.5 h-full bg-slate-200 mt-2" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-slate-500">{activity.type}</span>
                            <span className="text-xs text-slate-400">• {activity.time}</span>
                          </div>
                          <p className="text-sm text-slate-900 mb-1">{activity.description}</p>
                          <p className="text-xs text-slate-500">{activity.user}</p>
                          {activity.status && (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold border ${getStatusColor(activity.status)} mt-2`}>
                              {getStatusIcon(activity.status)}
                              {activity.status}
                            </span>
                          )}
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
    </div>
  );
}
