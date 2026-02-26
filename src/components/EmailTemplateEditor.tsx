import { motion, AnimatePresence } from 'motion/react';
import { X, Code, Eye, Save } from 'lucide-react';
import { useState, useEffect } from 'react';

interface EmailTemplateEditorProps {
  isOpen: boolean;
  onClose: () => void;
  template: any | null;
  onSave: (templateData: any) => void;
}

export function EmailTemplateEditor({ isOpen, onClose, template, onSave }: EmailTemplateEditorProps) {
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    category: 'Shipping Notifications',
    description: '',
    htmlContent: '',
    variables: [] as string[],
  });
  const [viewMode, setViewMode] = useState<'code' | 'preview'>('code');

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name || '',
        subject: template.subject || '',
        category: template.category || 'Shipping Notifications',
        description: template.description || '',
        htmlContent: template.htmlContent || getDefaultTemplate(template.name),
        variables: template.variables || [],
      });
    } else {
      setFormData({
        name: '',
        subject: '',
        category: 'Shipping Notifications',
        description: '',
        htmlContent: getDefaultTemplate('Welcome Email'),
        variables: [],
      });
    }
  }, [template, isOpen]);

  const categories = ['Shipping Notifications', 'Order Emails', 'Design Emails', 'User Onboarding', 'Authentication'];

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('html-content') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = formData.htmlContent;
      const before = text.substring(0, start);
      const after = text.substring(end);
      setFormData({
        ...formData,
        htmlContent: before + `{{${variable}}}` + after,
      });
    }
  };

  const commonVariables = [
    'firstName',
    'lastName',
    'email',
    'companyName',
    'resetLink',
    'activationLink',
    'orderNumber',
    'trackingNumber',
    'productName',
    'currentYear',
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-5xl bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-fuchsia-500 px-6 py-5 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {template ? 'Edit Email Template' : 'Create Email Template'}
                </h2>
                <p className="text-sm text-purple-100 mt-1">
                  Design beautiful, responsive email templates
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-12 gap-6 p-6">
                {/* Left Panel - Settings */}
                <div className="col-span-4 space-y-6">
                  <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Template Settings</h3>
                    
                    {/* Template Name */}
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Template Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder="e.g., Welcome Email"
                      />
                    </div>

                    {/* Category */}
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
                      <div className="relative">
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all appearance-none bg-white cursor-pointer"
                        >
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                        <svg className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* Subject Line */}
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Subject Line</label>
                      <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder="e.g., Welcome to {{companyName}}"
                      />
                      <p className="text-xs text-slate-500 mt-1.5">Use {'{{'} variableName {'}}'} for dynamic content</p>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                        placeholder="Describe when this template is used..."
                      />
                    </div>
                  </div>

                  {/* Variables Panel */}
                  <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Available Variables</h3>
                    <p className="text-sm text-slate-600 mb-4">Click to insert into template:</p>
                    <div className="space-y-2">
                      {commonVariables.map((variable) => (
                        <motion.button
                          key={variable}
                          whileHover={{ scale: 1.02, x: 4 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => insertVariable(variable)}
                          className="w-full px-3 py-2 bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-300 rounded-lg text-left text-sm font-mono text-slate-700 hover:text-purple-700 transition-all"
                        >
                          {'{{' + variable + '}}'}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Panel - Editor */}
                <div className="col-span-8 space-y-6">
                  {/* View Mode Toggle */}
                  <div className="flex gap-2 bg-slate-100 p-1 rounded-xl w-fit">
                    <button
                      onClick={() => setViewMode('code')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        viewMode === 'code'
                          ? 'bg-white text-purple-600 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Code className="w-4 h-4" />
                      HTML Code
                    </button>
                    <button
                      onClick={() => setViewMode('preview')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        viewMode === 'preview'
                          ? 'bg-white text-purple-600 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Eye className="w-4 h-4" />
                      Preview
                    </button>
                  </div>

                  {/* Editor Area */}
                  {viewMode === 'code' ? (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">HTML Template</label>
                      <textarea
                        id="html-content"
                        value={formData.htmlContent}
                        onChange={(e) => setFormData({ ...formData, htmlContent: e.target.value })}
                        className="w-full h-[600px] px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none font-mono text-sm bg-slate-900 text-green-400"
                        placeholder="Enter your HTML template here..."
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Email Preview</label>
                      <div className="bg-slate-100 rounded-xl border-2 border-slate-300 p-6 h-[600px] overflow-y-auto">
                        <div className="bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
                          <div
                            dangerouslySetInnerHTML={{
                              __html: formData.htmlContent
                                .replace(/\{\{firstName\}\}/g, 'John')
                                .replace(/\{\{lastName\}\}/g, 'Doe')
                                .replace(/\{\{email\}\}/g, 'john.doe@example.com')
                                .replace(/\{\{companyName\}\}/g, 'ActivateSwag')
                                .replace(/\{\{resetLink\}\}/g, '#reset-password')
                                .replace(/\{\{activationLink\}\}/g, '#activate-account')
                                .replace(/\{\{orderNumber\}\}/g, '#12345')
                                .replace(/\{\{trackingNumber\}\}/g, 'TRACK123456')
                                .replace(/\{\{productName\}\}/g, 'Sample Product')
                                .replace(/\{\{currentYear\}\}/g, new Date().getFullYear().toString())
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 px-6 py-4 bg-slate-50 flex gap-3 flex-shrink-0">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-100 transition-all"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                className="flex-1 px-6 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                Save Template
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Default templates for different email types
function getDefaultTemplate(templateName: string): string {
  if (templateName.toLowerCase().includes('welcome')) {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(to right, #9333ea, #a855f7); padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px;">Welcome to ActivateSwag!</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: #1e293b; margin-top: 0;">Hi {{firstName}},</h2>
              <p style="color: #475569; font-size: 16px; line-height: 1.6;">
                We're excited to have you join {{companyName}}! Your account has been created and you're ready to get started.
              </p>
              <p style="color: #475569; font-size: 16px; line-height: 1.6;">
                To complete your setup, please create your password by clicking the button below:
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="{{activationLink}}" style="display: inline-block; background: linear-gradient(to right, #9333ea, #a855f7); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">Create Password</a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #475569; font-size: 14px; line-height: 1.6;">
                If you didn't request this account, you can safely ignore this email.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 14px; margin: 0;">
                © {{currentYear}} ActivateSwag. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  } else if (templateName.toLowerCase().includes('password')) {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(to right, #dc2626, #ef4444); padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px;">Reset Your Password</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: #1e293b; margin-top: 0;">Hi {{firstName}},</h2>
              <p style="color: #475569; font-size: 16px; line-height: 1.6;">
                We received a request to reset your password for your ActivateSwag account.
              </p>
              <p style="color: #475569; font-size: 16px; line-height: 1.6;">
                Click the button below to create a new password:
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="{{resetLink}}" style="display: inline-block; background: linear-gradient(to right, #dc2626, #ef4444); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">Reset Password</a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #475569; font-size: 14px; line-height: 1.6;">
                This link will expire in 24 hours for security reasons.
              </p>
              <p style="color: #475569; font-size: 14px; line-height: 1.6;">
                If you didn't request this, please ignore this email.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 14px; margin: 0;">
                © {{currentYear}} ActivateSwag. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
          <tr>
            <td style="padding: 40px;">
              <h1 style="color: #1e293b; margin-top: 0;">Your Email Template</h1>
              <p style="color: #475569; font-size: 16px; line-height: 1.6;">
                Start designing your email template here...
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}