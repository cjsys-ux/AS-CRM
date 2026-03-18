import { motion } from 'motion/react';
import { Plus, Mail, Edit, Trash2, Eye, Copy, Search } from 'lucide-react';
import { useState } from 'react';
import { EmailTemplateEditor } from './EmailTemplateEditor';
import { EmailPreviewModal } from './EmailPreviewModal';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  category: string;
  description: string;
  lastModified: string;
  status: 'Active' | 'Draft';
}

const mockTemplates: EmailTemplate[] = [
  // Shipping Notification Emails
  {
    id: '1',
    name: 'Shipped',
    subject: 'Your Order Has Shipped - Tracking #{trackingNumber}',
    category: 'Shipping Notifications',
    description: 'Sent when order has been shipped with tracking information',
    lastModified: '2024-02-15',
    status: 'Active',
  },
  {
    id: '2',
    name: 'Out For Delivery',
    subject: 'Out For Delivery - Your Order Arrives Today',
    category: 'Shipping Notifications',
    description: 'Notification when package is out for delivery',
    lastModified: '2024-02-15',
    status: 'Active',
  },
  {
    id: '3',
    name: 'Delivered',
    subject: 'Delivered - Order #{orderNumber}',
    category: 'Shipping Notifications',
    description: 'Confirmation email when order has been delivered',
    lastModified: '2024-02-14',
    status: 'Active',
  },
  // Order Emails
  {
    id: '4',
    name: 'Order Confirmation',
    subject: 'Order Confirmation - #{orderNumber}',
    category: 'Order Emails',
    description: 'Initial confirmation email sent when order is placed',
    lastModified: '2024-02-14',
    status: 'Active',
  },
  {
    id: '5',
    name: 'Order Confirmed',
    subject: 'Order Confirmed & Approved - #{orderNumber}',
    category: 'Order Emails',
    description: 'Sent when order has been reviewed and confirmed by team',
    lastModified: '2024-02-13',
    status: 'Active',
  },
  {
    id: '6',
    name: 'In Production',
    subject: 'Your Order Is Now In Production - #{orderNumber}',
    category: 'Order Emails',
    description: 'Notification when order enters production phase',
    lastModified: '2024-02-12',
    status: 'Active',
  },
  {
    id: '7',
    name: 'Order Completed',
    subject: 'Order Completed - #{orderNumber}',
    category: 'Order Emails',
    description: 'Sent when entire order has been completed and is ready to ship',
    lastModified: '2024-02-11',
    status: 'Active',
  },
  {
    id: '8',
    name: 'Delivery Follow-Up',
    subject: 'How Was Your Order? - #{orderNumber}',
    category: 'Order Emails',
    description: 'Post-delivery follow-up to confirm product quality and satisfaction',
    lastModified: '2024-02-10',
    status: 'Active',
  },
  // Design Emails
  {
    id: '9',
    name: 'Design Ready',
    subject: 'Your Design Is Ready For Review',
    category: 'Design Emails',
    description: 'Notification when design mockup is ready for customer review',
    lastModified: '2024-02-10',
    status: 'Active',
  },
  {
    id: '10',
    name: 'Design Approved',
    subject: 'Design Approved - Moving To Production',
    category: 'Design Emails',
    description: 'Confirmation email when customer approves the design',
    lastModified: '2024-02-10',
    status: 'Active',
  },
  {
    id: '11',
    name: 'Revision Requested',
    subject: 'Design Revision Requested - #{orderNumber}',
    category: 'Design Emails',
    description: 'Sent when changes are requested on a design mockup',
    lastModified: '2024-02-09',
    status: 'Active',
  },
  // User & Authentication
  {
    id: '12',
    name: 'Welcome Email',
    subject: 'Welcome to ActivateSwag - Create Your Password',
    category: 'User Onboarding',
    description: 'Sent when a new user is created to set their password',
    lastModified: '2024-02-09',
    status: 'Active',
  },
  {
    id: '13',
    name: 'Forgot Password',
    subject: 'Reset Your Password - ActivateSwag',
    category: 'Authentication',
    description: 'Password reset email with secure token link',
    lastModified: '2024-02-08',
    status: 'Active',
  },
  // Quote Emails
  {
    id: '14',
    name: 'Quote Request Received',
    subject: 'Quote Request Received - #{quoteNumber}',
    category: 'Quote Emails',
    description: 'Confirmation sent when a customer submits a quote request',
    lastModified: '2024-02-15',
    status: 'Active',
  },
  {
    id: '15',
    name: 'Quote Ready',
    subject: 'Your Quote Is Ready - #{quoteNumber}',
    category: 'Quote Emails',
    description: 'Sent when a quote has been prepared and is ready for customer review',
    lastModified: '2024-02-14',
    status: 'Active',
  },
  {
    id: '16',
    name: 'Quote Accepted',
    subject: 'Quote Accepted - Converting to Order #{orderNumber}',
    category: 'Quote Emails',
    description: 'Confirmation when customer accepts a quote and it converts to an order',
    lastModified: '2024-02-13',
    status: 'Active',
  },
  {
    id: '17',
    name: 'Quote Expired',
    subject: 'Your Quote Has Expired - #{quoteNumber}',
    category: 'Quote Emails',
    description: 'Notification when a quote reaches its expiration date',
    lastModified: '2024-02-12',
    status: 'Active',
  },
];

export function EmailTemplatesModule() {
  const [templates, setTemplates] = useState<EmailTemplate[]>(mockTemplates);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const categories = ['All', 'Shipping Notifications', 'Order Emails', 'Quote Emails', 'Design Emails', 'User Onboarding', 'Authentication'];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateNew = () => {
    setSelectedTemplate(null);
    setIsEditorOpen(true);
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setIsEditorOpen(true);
  };

  const handleDeleteTemplate = (id: string) => {
    if (confirm('Are you sure you want to delete this email template?')) {
      setTemplates(templates.filter(t => t.id !== id));
    }
  };

  const handleSaveTemplate = (templateData: any) => {
    if (selectedTemplate) {
      setTemplates(templates.map(t => 
        t.id === selectedTemplate.id 
          ? { ...t, ...templateData, lastModified: new Date().toISOString().split('T')[0] }
          : t
      ));
    } else {
      const newTemplate: EmailTemplate = {
        id: Date.now().toString(),
        ...templateData,
        lastModified: new Date().toISOString().split('T')[0],
        status: 'Draft' as const,
      };
      setTemplates([...templates, newTemplate]);
    }
    setIsEditorOpen(false);
  };

  const handlePreviewTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setIsPreviewOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-50 via-white to-teal-50/30 overflow-hidden">
      {/* Sticky Header with KPIs */}
      <div className="bg-white border-b border-slate-200 px-8 py-6 flex-shrink-0 sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Email Templates</h1>
            <p className="text-slate-500">Create and manage email templates for automated communications</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-6 py-3 bg-white text-slate-700 font-semibold rounded-xl border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all"
          >
            <Plus className="w-5 h-5" />
            Create Template
          </motion.button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mt-5">
          <div className="bg-slate-100 rounded-xl p-4 border border-slate-200">
            <div className="text-sm text-slate-500 mb-1">Total Templates</div>
            <div className="text-3xl font-bold text-slate-900">{templates.length}</div>
          </div>
          <div className="bg-slate-100 rounded-xl p-4 border border-slate-200">
            <div className="text-sm text-slate-500 mb-1">Active</div>
            <div className="text-3xl font-bold text-slate-900">{templates.filter(t => t.status === 'Active').length}</div>
          </div>
          <div className="bg-slate-100 rounded-xl p-4 border border-slate-200">
            <div className="text-sm text-slate-500 mb-1">Drafts</div>
            <div className="text-3xl font-bold text-slate-900">{templates.filter(t => t.status === 'Draft').length}</div>
          </div>
          <div className="bg-slate-100 rounded-xl p-4 border border-slate-200">
            <div className="text-sm text-slate-500 mb-1">Categories</div>
            <div className="text-3xl font-bold text-slate-900">{categories.length - 1}</div>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
          {/* Filters */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {categories.map((category) => (
                  <motion.button
                    key={category}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedCategory === category
                        ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/30'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {category}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTemplates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl border-2 border-slate-200 hover:border-teal-300 p-6 shadow-sm hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900 mb-1">{template.name}</h3>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        template.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-100 text-amber-700 border border-amber-200'
                      }`}>
                        {template.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                    {template.category}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Subject Line</div>
                  <div className="text-sm font-medium text-slate-900 bg-slate-50 rounded-lg px-3 py-2 border border-slate-200">
                    {template.subject}
                  </div>
                </div>

                <p className="text-sm text-slate-600 mb-4 line-clamp-2">{template.description}</p>

                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <div className="text-xs text-slate-500">
                    Last modified: {new Date(template.lastModified).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handlePreviewTemplate(template)}
                      className="p-2 hover:bg-teal-50 text-teal-600 rounded-lg transition-colors"
                      title="Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
                      title="Duplicate"
                    >
                      <Copy className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleEditTemplate(template)}
                      className="p-2 hover:bg-teal-50 text-teal-600 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {filteredTemplates.length === 0 && (
            <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-12 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Mail className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No templates found</h3>
              <p className="text-slate-600 mb-6">
                {searchQuery || selectedCategory !== 'All'
                  ? 'Try adjusting your filters'
                  : 'Create your first email template to get started'}
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCreateNew}
                className="px-6 py-3 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition-all shadow-lg"
              >
                Create Template
              </motion.button>
            </div>
          )}
        </div>
      </div>

      {/* Editor Drawer */}
      <EmailTemplateEditor
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        template={selectedTemplate}
        onSave={handleSaveTemplate}
      />

      {/* Preview Modal */}
      <EmailPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        template={selectedTemplate}
        allTemplates={filteredTemplates}
        onNavigate={(template) => setSelectedTemplate(template)}
      />
    </div>
  );
}