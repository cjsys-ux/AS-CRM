import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, Smartphone, Monitor } from 'lucide-react';
import { useState } from 'react';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  category: string;
  description: string;
  lastModified: string;
  status: 'Active' | 'Draft';
  htmlContent?: string;
}

interface EmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: EmailTemplate | null;
  allTemplates: EmailTemplate[];
  onNavigate: (template: EmailTemplate) => void;
}

export function EmailPreviewModal({ isOpen, onClose, template, allTemplates, onNavigate }: EmailPreviewModalProps) {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

  if (!template) return null;

  const currentIndex = allTemplates.findIndex(t => t.id === template.id);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < allTemplates.length - 1;

  const handlePrevious = () => {
    if (hasPrevious) {
      onNavigate(allTemplates[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      onNavigate(allTemplates[currentIndex + 1]);
    }
  };

  const getEmailContent = () => {
    if (template.htmlContent) {
      return template.htmlContent;
    }

    // Generate default content based on template name
    if (template.name === 'Welcome Email') {
      return getWelcomeEmailHTML();
    } else if (template.name === 'Forgot Password') {
      return getForgotPasswordHTML();
    } else if (template.name === 'Order Confirmation') {
      return getOrderConfirmationHTML();
    } else if (template.name === 'Shipment Notification') {
      return getShipmentNotificationHTML();
    }
    
    return '<p>No preview available</p>';
  };

  const processedContent = getEmailContent()
    .replace(/\{\{firstName\}\}/g, 'John')
    .replace(/\{\{lastName\}\}/g, 'Doe')
    .replace(/\{\{email\}\}/g, 'john.doe@example.com')
    .replace(/\{\{companyName\}\}/g, 'ActivateSwag')
    .replace(/\{\{resetLink\}\}/g, '#reset-password')
    .replace(/\{\{activationLink\}\}/g, '#activate-account')
    .replace(/\{\{orderNumber\}\}/g, '#12345')
    .replace(/\{\{trackingNumber\}\}/g, 'TRACK123456789')
    .replace(/\{\{productName\}\}/g, 'Custom Branded T-Shirt')
    .replace(/\{\{currentYear\}\}/g, new Date().getFullYear().toString());

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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            className="fixed inset-4 md:inset-8 lg:inset-16 bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-fuchsia-500 px-6 py-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-4">
                <button
                  onClick={handlePrevious}
                  disabled={!hasPrevious}
                  className={`p-2 rounded-lg transition-all ${
                    hasPrevious
                      ? 'hover:bg-white/20 text-white'
                      : 'opacity-30 cursor-not-allowed text-white'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <div>
                  <h2 className="text-xl font-bold text-white">{template.name}</h2>
                  <p className="text-sm text-purple-100">{template.subject}</p>
                </div>

                <button
                  onClick={handleNext}
                  disabled={!hasNext}
                  className={`p-2 rounded-lg transition-all ${
                    hasNext
                      ? 'hover:bg-white/20 text-white'
                      : 'opacity-30 cursor-not-allowed text-white'
                  }`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-3">
                {/* View Mode Toggle */}
                <div className="flex gap-1 bg-white/20 p-1 rounded-lg">
                  <button
                    onClick={() => setViewMode('desktop')}
                    className={`p-2 rounded transition-all ${
                      viewMode === 'desktop'
                        ? 'bg-white text-purple-600'
                        : 'text-white hover:bg-white/10'
                    }`}
                    title="Desktop View"
                  >
                    <Monitor className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('mobile')}
                    className={`p-2 rounded transition-all ${
                      viewMode === 'mobile'
                        ? 'bg-white text-purple-600'
                        : 'text-white hover:bg-white/10'
                    }`}
                    title="Mobile View"
                  >
                    <Smartphone className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Email Client Mockup */}
            <div className="flex-1 overflow-y-auto bg-slate-100 p-6">
              <div className="max-w-7xl mx-auto">
                {/* Email Client Header */}
                <div className="bg-white rounded-t-2xl border-2 border-slate-200 p-6 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-lg">AS</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-900">ActivateSwag</span>
                        <span className="text-slate-500 text-sm">&lt;noreply@activateswag.com&gt;</span>
                      </div>
                      <div className="text-sm text-slate-600 mb-2">to me</div>
                      <div className="text-xl font-bold text-slate-900 mb-1">{template.subject}</div>
                      <div className="text-xs text-slate-500">Just now</div>
                    </div>
                  </div>
                </div>

                {/* Email Content */}
                <div className="bg-white border-x-2 border-b-2 border-slate-200 rounded-b-2xl shadow-sm overflow-hidden">
                  <div className={`transition-all ${
                    viewMode === 'mobile' ? 'max-w-sm mx-auto' : 'w-full'
                  }`}>
                    <div
                      className="email-preview-content"
                      dangerouslySetInnerHTML={{ __html: processedContent }}
                    />
                  </div>
                </div>

                {/* Email Actions Footer */}
                <div className="mt-6 flex items-center justify-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-2 bg-white border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all shadow-sm"
                  >
                    Reply
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-2 bg-white border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all shadow-sm"
                  >
                    Forward
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Footer Info */}
            <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
              <div className="text-sm text-slate-600">
                Template {currentIndex + 1} of {allTemplates.length}
              </div>
              <div className="text-xs text-slate-500">
                Use ← → arrow keys to navigate
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Template HTML generators
function getWelcomeEmailHTML(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #9333ea 0%, #a855f7 100%); padding: 50px 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 36px; font-weight: 800; letter-spacing: -0.5px;">Welcome to ActivateSwag!</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">We're excited to have you on board</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 50px 40px;">
              <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 24px; font-weight: 700;">Hi {{firstName}},</h2>
              <p style="color: #475569; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
                We're thrilled to have you join <strong>{{companyName}}</strong>! Your account has been successfully created and you're ready to get started on your journey with us.
              </p>
              <p style="color: #475569; font-size: 16px; line-height: 1.7; margin: 0 0 30px 0;">
                To complete your setup and secure your account, please create your password by clicking the button below:
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 40px 0;">
                <tr>
                  <td align="center">
                    <a href="{{activationLink}}" style="display: inline-block; background: linear-gradient(135deg, #9333ea 0%, #a855f7 100%); color: #ffffff; text-decoration: none; padding: 18px 50px; border-radius: 12px; font-weight: 700; font-size: 16px; box-shadow: 0 10px 25px rgba(147, 51, 234, 0.3);">Create Your Password</a>
                  </td>
                </tr>
              </table>
              
              <div style="background-color: #f8fafc; border-left: 4px solid #9333ea; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0;">
                  <strong style="color: #475569;">Important:</strong> This link will expire in 48 hours for security reasons. If you didn't request this account, you can safely ignore this email.
                </p>
              </div>

              <p style="color: #475569; font-size: 16px; line-height: 1.7; margin: 30px 0 0 0;">
                If you have any questions, our support team is here to help!
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 40px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #94a3b8; font-size: 14px; margin: 0 0 10px 0; font-weight: 600;">
                ActivateSwag Command Center
              </p>
              <p style="color: #cbd5e1; font-size: 12px; margin: 0 0 15px 0;">
                Your complete CRM solution for promotional products
              </p>
              <div style="margin: 20px 0;">
                <a href="#" style="color: #9333ea; text-decoration: none; margin: 0 10px; font-size: 12px; font-weight: 600;">Help Center</a>
                <span style="color: #cbd5e1;">•</span>
                <a href="#" style="color: #9333ea; text-decoration: none; margin: 0 10px; font-size: 12px; font-weight: 600;">Contact Support</a>
                <span style="color: #cbd5e1;">•</span>
                <a href="#" style="color: #9333ea; text-decoration: none; margin: 0 10px; font-size: 12px; font-weight: 600;">Privacy Policy</a>
              </div>
              <p style="color: #94a3b8; font-size: 12px; margin: 20px 0 0 0;">
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

function getForgotPasswordHTML(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); padding: 50px 40px; text-align: center;">
              <div style="width: 80px; height: 80px; background-color: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <div style="width: 50px; height: 50px; background-color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                  <span style="font-size: 32px; color: #dc2626;">🔐</span>
                </div>
              </div>
              <h1 style="color: #ffffff; margin: 0; font-size: 36px; font-weight: 800; letter-spacing: -0.5px;">Password Reset</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Secure your account</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 50px 40px;">
              <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 24px; font-weight: 700;">Hi {{firstName}},</h2>
              <p style="color: #475569; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
                We received a request to reset your password for your <strong>ActivateSwag</strong> account. Don't worry, we're here to help!
              </p>
              <p style="color: #475569; font-size: 16px; line-height: 1.7; margin: 0 0 30px 0;">
                Click the button below to create a new password:
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 40px 0;">
                <tr>
                  <td align="center">
                    <a href="{{resetLink}}" style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: #ffffff; text-decoration: none; padding: 18px 50px; border-radius: 12px; font-weight: 700; font-size: 16px; box-shadow: 0 10px 25px rgba(220, 38, 38, 0.3);">Reset My Password</a>
                  </td>
                </tr>
              </table>
              
              <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <p style="color: #991b1b; font-size: 14px; line-height: 1.6; margin: 0 0 10px 0;">
                  <strong>Security Notice:</strong>
                </p>
                <ul style="color: #991b1b; font-size: 14px; line-height: 1.6; margin: 0; padding-left: 20px;">
                  <li>This link will expire in <strong>24 hours</strong></li>
                  <li>If you didn't request this, please ignore this email</li>
                  <li>Your password won't change until you click the link above</li>
                </ul>
              </div>

              <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0 0 10px 0;">
                  <strong style="color: #475569;">Can't click the button?</strong>
                </p>
                <p style="color: #64748b; font-size: 12px; line-height: 1.6; margin: 0;">
                  Copy and paste this link into your browser:
                </p>
                <p style="color: #9333ea; font-size: 12px; word-break: break-all; margin: 10px 0 0 0;">
                  https://app.activateswag.com/reset-password?token=abc123xyz
                </p>
              </div>

              <p style="color: #475569; font-size: 16px; line-height: 1.7; margin: 30px 0 0 0;">
                Need help? Contact our support team at <a href="mailto:support@activateswag.com" style="color: #9333ea; text-decoration: none; font-weight: 600;">support@activateswag.com</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 40px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #94a3b8; font-size: 14px; margin: 0 0 10px 0; font-weight: 600;">
                ActivateSwag Command Center
              </p>
              <p style="color: #cbd5e1; font-size: 12px; margin: 0 0 15px 0;">
                Your complete CRM solution for promotional products
              </p>
              <div style="margin: 20px 0;">
                <a href="#" style="color: #9333ea; text-decoration: none; margin: 0 10px; font-size: 12px; font-weight: 600;">Help Center</a>
                <span style="color: #cbd5e1;">•</span>
                <a href="#" style="color: #9333ea; text-decoration: none; margin: 0 10px; font-size: 12px; font-weight: 600;">Contact Support</a>
                <span style="color: #cbd5e1;">•</span>
                <a href="#" style="color: #9333ea; text-decoration: none; margin: 0 10px; font-size: 12px; font-weight: 600;">Privacy Policy</a>
              </div>
              <p style="color: #94a3b8; font-size: 12px; margin: 20px 0 0 0;">
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

function getOrderConfirmationHTML(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #34d399 100%); padding: 50px 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 36px; font-weight: 800;">Order Confirmed!</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Thank you for your order</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 50px 40px;">
              <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 24px; font-weight: 700;">Hi {{firstName}},</h2>
              <p style="color: #475569; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
                Your order has been confirmed and is being processed. Order number: <strong>{{orderNumber}}</strong>
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

function getShipmentNotificationHTML(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%); padding: 50px 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 36px; font-weight: 800;">Your Order Has Shipped!</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">On its way to you</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 50px 40px;">
              <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 24px; font-weight: 700;">Hi {{firstName}},</h2>
              <p style="color: #475569; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
                Great news! Your order has shipped. Track your package: <strong>{{trackingNumber}}</strong>
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
