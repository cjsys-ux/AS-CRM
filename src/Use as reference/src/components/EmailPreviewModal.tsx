import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, Smartphone, Monitor } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

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
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const currentIndex = template ? allTemplates.findIndex(t => t.id === template.id) : -1;
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < allTemplates.length - 1;

  const handlePrevious = () => { if (hasPrevious) onNavigate(allTemplates[currentIndex - 1]); };
  const handleNext = () => { if (hasNext) onNavigate(allTemplates[currentIndex + 1]); };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, hasPrevious, hasNext]);

  const getEmailContent = (): string => {
    if (!template) return '';
    if (template.htmlContent) return template.htmlContent;
    const name = template.name.toLowerCase().trim();
    if (name === 'shipped') return getShippedHTML();
    if (name === 'out for delivery') return getOutForDeliveryHTML();
    if (name === 'delivered') return getDeliveredHTML();
    if (name === 'order confirmation') return getOrderConfirmationHTML();
    if (name === 'order confirmed') return getOrderConfirmedHTML();
    if (name === 'in production') return getInProductionHTML();
    if (name === 'order completed') return getOrderCompletedHTML();
    if (name === 'delivery follow-up') return getDeliveryFollowUpHTML();
    if (name === 'design ready') return getDesignReadyHTML();
    if (name === 'design approved') return getDesignApprovedHTML();
    if (name === 'revision requested') return getRevisionRequestedHTML();
    if (name === 'welcome email') return getWelcomeEmailHTML();
    if (name === 'forgot password') return getForgotPasswordHTML();
    if (name === 'quote request received') return getQuoteRequestReceivedHTML();
    if (name === 'quote ready') return getQuoteReadyHTML();
    if (name === 'quote accepted') return getQuoteAcceptedHTML();
    if (name === 'quote expired') return getQuoteExpiredHTML();
    return getFallbackHTML(template.name, template.subject);
  };

  const processedContent = template ? getEmailContent()
    .replace(/\{\{firstName\}\}/g, 'John')
    .replace(/\{\{lastName\}\}/g, 'Doe')
    .replace(/\{\{email\}\}/g, 'john.doe@example.com')
    .replace(/\{\{companyName\}\}/g, 'ActivateSwag')
    .replace(/\{\{resetLink\}\}/g, '#reset-password')
    .replace(/\{\{activationLink\}\}/g, '#activate-account')
    .replace(/\{\{orderNumber\}\}/g, 'ORD-2026-04821')
    .replace(/\{\{quoteNumber\}\}/g, 'QTE-2026-00347')
    .replace(/\{\{trackingNumber\}\}/g, '1Z999AA10123456784')
    .replace(/\{\{carrier\}\}/g, 'UPS')
    .replace(/\{\{carrierTrackingUrl\}\}/g, 'https://www.ups.com/track?tracknum=1Z999AA10123456784')
    .replace(/\{\{estimatedDelivery\}\}/g, 'Thursday, March 6, 2026')
    .replace(/\{\{shipDate\}\}/g, 'Tuesday, March 4, 2026')
    .replace(/\{\{deliveredDate\}\}/g, 'Thursday, March 6, 2026 at 2:34 PM')
    .replace(/\{\{shippingMethod\}\}/g, 'UPS Ground')
    .replace(/\{\{shippingAddress\}\}/g, '742 Evergreen Terrace, Suite 200<br/>Springfield, IL 62704<br/>United States')
    .replace(/\{\{billingAddress\}\}/g, '742 Evergreen Terrace, Suite 200<br/>Springfield, IL 62704<br/>United States')
    .replace(/\{\{customerCompany\}\}/g, 'Acme Corporation')
    .replace(/\{\{projectName\}\}/g, 'Q1 Corporate Swag Campaign')
    .replace(/\{\{quoteExpiry\}\}/g, 'March 18, 2026')
    .replace(/\{\{salesRep\}\}/g, 'Sarah Mitchell')
    .replace(/\{\{salesRepEmail\}\}/g, 'sarah.mitchell@activateswag.com')
    .replace(/\{\{salesRepPhone\}\}/g, '(555) 234-5678')
    .replace(/\{\{currentYear\}\}/g, new Date().getFullYear().toString()) : '';

  // Write content into iframe for proper isolation and responsive sizing
  useEffect(() => {
    if (!template || !processedContent) return;
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(processedContent);
        doc.close();
      }
    }
  }, [processedContent, viewMode, template]);

  if (!template) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ type: 'spring', damping: 30, stiffness: 400 }} className="fixed inset-4 md:inset-8 lg:inset-16 bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-cyan-600 px-6 py-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-4">
                <button onClick={handlePrevious} disabled={!hasPrevious} className={`p-2 rounded-lg transition-all ${hasPrevious ? 'hover:bg-white/20 text-white' : 'opacity-30 cursor-not-allowed text-white'}`}>
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-xl font-bold text-white">{template.name}</h2>
                  <p className="text-sm text-teal-100">{template.subject}</p>
                </div>
                <button onClick={handleNext} disabled={!hasNext} className={`p-2 rounded-lg transition-all ${hasNext ? 'hover:bg-white/20 text-white' : 'opacity-30 cursor-not-allowed text-white'}`}>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex gap-1 bg-white/20 p-1 rounded-lg">
                  <button onClick={() => setViewMode('desktop')} className={`p-2 rounded transition-all ${viewMode === 'desktop' ? 'bg-white text-teal-700' : 'text-white hover:bg-white/10'}`} title="Desktop View">
                    <Monitor className="w-4 h-4" />
                  </button>
                  <button onClick={() => setViewMode('mobile')} className={`p-2 rounded transition-all ${viewMode === 'mobile' ? 'bg-white text-teal-700' : 'text-white hover:bg-white/10'}`} title="Mobile View">
                    <Smartphone className="w-4 h-4" />
                  </button>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Email Client Mockup */}
            <div className="flex-1 overflow-y-auto bg-slate-100 p-6 drawer-scroll">
              <div className={`mx-auto transition-all duration-300 ${viewMode === 'mobile' ? 'max-w-[375px]' : 'max-w-4xl'}`}>
                {/* Email Client Header */}
                <div className="bg-white rounded-t-2xl border-2 border-b-0 border-slate-200 p-5 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">AS</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-slate-900 text-sm">ActivateSwag</span>
                        <span className="text-slate-400 text-xs truncate">&lt;noreply@activateswag.com&gt;</span>
                      </div>
                      <div className="text-xs text-slate-500 mb-1.5">to me</div>
                      <div className="text-base font-bold text-slate-900 leading-tight">{
                        template.subject
                          .replace('#{trackingNumber}', '1Z999AA10123456784')
                          .replace('#{orderNumber}', 'ORD-2026-04821')
                          .replace('#{quoteNumber}', 'QTE-2026-00347')
                      }</div>
                      <div className="text-xs text-slate-400 mt-1">Just now</div>
                    </div>
                  </div>
                </div>

                {/* Email Body - rendered in iframe for proper isolation */}
                <div className="bg-white border-x-2 border-b-2 border-slate-200 rounded-b-2xl shadow-sm overflow-hidden">
                  <iframe
                    ref={iframeRef}
                    title="Email Preview"
                    className="w-full border-0"
                    style={{ minHeight: '800px', height: '100%' }}
                    sandbox="allow-same-origin"
                  />
                </div>

                {/* Action Buttons */}
                <div className="mt-5 flex items-center justify-center gap-3">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-5 py-2 bg-white border border-slate-200 text-slate-600 font-medium text-sm rounded-xl hover:bg-slate-50 transition-all shadow-sm">Reply</motion.button>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-5 py-2 bg-white border border-slate-200 text-slate-600 font-medium text-sm rounded-xl hover:bg-slate-50 transition-all shadow-sm">Forward</motion.button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
              <div className="text-sm text-slate-600">Template {currentIndex + 1} of {allTemplates.length}</div>
              <div className="text-xs text-slate-500">Use &larr; &rarr; arrow keys to navigate</div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Shared Constants & Helpers ───

const B = '#0d9488';
const BRAND_GRADIENT = 'linear-gradient(135deg, #0f766e 0%, #0d9488 50%, #14b8a6 100%)';

function emailShell(headerBg: string, headerTitle: string, headerSubtitle: string, bodyContent: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#f1f5f9;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:32px 16px;">
<tr><td align="center">

<!-- Logo Bar -->
<table cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;margin-bottom:0;">
<tr><td style="padding:20px 0;text-align:center;">
  <span style="font-size:22px;font-weight:800;color:${B};letter-spacing:-0.5px;">ActivateSwag</span>
</td></tr>
</table>

<!-- Main Card -->
<table cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

<!-- Header -->
<tr><td style="background:${headerBg};padding:44px 40px 38px;text-align:center;">
  <h1 style="color:#ffffff;margin:0;font-size:26px;font-weight:800;letter-spacing:-0.3px;line-height:1.3;">${headerTitle}</h1>
  <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;font-weight:500;">${headerSubtitle}</p>
</td></tr>

<!-- Body -->
<tr><td style="padding:36px 40px 40px;">
${bodyContent}
</td></tr>

<!-- Footer -->
<tr><td style="background-color:#f8fafc;padding:32px 40px;text-align:center;border-top:1px solid #e2e8f0;">
  <table width="100%" cellpadding="0" cellspacing="0">
  <tr><td align="center">
    <p style="color:#64748b;font-size:13px;font-weight:600;margin:0 0 4px;">ActivateSwag Command Center</p>
    <p style="color:#94a3b8;font-size:12px;margin:0 0 16px;">Your complete solution for branded merchandise &amp; promotional products</p>
    <div style="margin:12px 0;">
      <a href="#" style="color:${B};text-decoration:none;margin:0 8px;font-size:12px;font-weight:600;">Help Center</a>
      <span style="color:#cbd5e1;">&bull;</span>
      <a href="#" style="color:${B};text-decoration:none;margin:0 8px;font-size:12px;font-weight:600;">Contact Support</a>
      <span style="color:#cbd5e1;">&bull;</span>
      <a href="#" style="color:${B};text-decoration:none;margin:0 8px;font-size:12px;font-weight:600;">Privacy Policy</a>
    </div>
    <p style="color:#94a3b8;font-size:11px;margin:16px 0 0;">&copy; {{currentYear}} ActivateSwag. All rights reserved.</p>
  </td></tr>
  </table>
</td></tr>

</table>
</td></tr>
</table>
</body></html>`;
}

function orderInfoBar(label1: string, val1: string, label2: string, val2: string, label3: string, val3: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;border-radius:12px;overflow:hidden;margin-bottom:24px;border:1px solid #e2e8f0;">
<tr>
  <td style="padding:16px 12px;text-align:center;border-right:1px solid #e2e8f0;width:33%;">
    <p style="color:#94a3b8;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 4px;">${label1}</p>
    <p style="color:#1e293b;font-size:13px;font-weight:700;margin:0;">${val1}</p>
  </td>
  <td style="padding:16px 12px;text-align:center;border-right:1px solid #e2e8f0;width:33%;">
    <p style="color:#94a3b8;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 4px;">${label2}</p>
    <p style="color:#1e293b;font-size:13px;font-weight:700;margin:0;">${val2}</p>
  </td>
  <td style="padding:16px 12px;text-align:center;width:33%;">
    <p style="color:#94a3b8;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 4px;">${label3}</p>
    <p style="color:#1e293b;font-size:13px;font-weight:700;margin:0;">${val3}</p>
  </td>
</tr>
</table>`;
}

function productRow(name: string, sku: string, qty: number, color: string, price: string, bgColor: string, initials: string): string {
  return `<tr>
  <td style="padding:14px 0;border-bottom:1px solid #f1f5f9;">
    <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td width="48" valign="middle">
        <table cellpadding="0" cellspacing="0" style="width:44px;height:44px;border-radius:8px;overflow:hidden;background:${bgColor};">
        <tr><td align="center" valign="middle" style="color:#ffffff;font-size:14px;font-weight:700;width:44px;height:44px;">${initials}</td></tr>
        </table>
      </td>
      <td style="padding-left:12px;" valign="middle">
        <p style="color:#1e293b;font-size:13px;font-weight:700;margin:0 0 2px;">${name}</p>
        <p style="color:#94a3b8;font-size:11px;margin:0;">SKU: ${sku} &bull; Color: ${color}</p>
      </td>
      <td width="40" style="text-align:center;" valign="middle">
        <p style="color:#64748b;font-size:12px;font-weight:600;margin:0;">x${qty}</p>
      </td>
      <td width="80" style="text-align:right;" valign="middle">
        <p style="color:#1e293b;font-size:13px;font-weight:700;margin:0;">${price}</p>
      </td>
    </tr>
    </table>
  </td>
</tr>`;
}

function productTable(): string {
  return `<!-- Products -->
<p style="color:#475569;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 12px;">Items in this shipment</p>
<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
  ${productRow('Custom Branded T-Shirt', 'TSH-BLK-LG', 250, 'Black', '$2,487.50', '#1e293b', 'TS')}
  ${productRow('Embroidered Baseball Cap', 'CAP-NVY-OS', 150, 'Navy Blue', '$1,342.50', '#1e3a5f', 'BC')}
  ${productRow('Stainless Steel Water Bottle', 'BTL-SLV-20', 100, 'Silver', '$1,890.00', '#64748b', 'WB')}
<tr><td style="padding-top:14px;border-top:2px solid #e2e8f0;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td style="text-align:right;padding:3px 0;"><span style="color:#64748b;font-size:12px;">Subtotal</span></td>
      <td width="90" style="text-align:right;padding:3px 0;"><span style="color:#1e293b;font-size:12px;font-weight:600;">$5,720.00</span></td>
    </tr>
    <tr>
      <td style="text-align:right;padding:3px 0;"><span style="color:#64748b;font-size:12px;">Shipping</span></td>
      <td width="90" style="text-align:right;padding:3px 0;"><span style="color:#1e293b;font-size:12px;font-weight:600;">$189.00</span></td>
    </tr>
    <tr>
      <td style="text-align:right;padding:3px 0;"><span style="color:#64748b;font-size:12px;">Tax</span></td>
      <td width="90" style="text-align:right;padding:3px 0;"><span style="color:#1e293b;font-size:12px;font-weight:600;">$457.60</span></td>
    </tr>
    <tr>
      <td style="text-align:right;padding:8px 0 0;"><span style="color:#1e293b;font-size:14px;font-weight:800;">Total</span></td>
      <td width="90" style="text-align:right;padding:8px 0 0;"><span style="color:${B};font-size:14px;font-weight:800;">$6,366.60</span></td>
    </tr>
  </table>
</td></tr>
</table>`;
}

function quoteProductTable(): string {
  return `<!-- Products -->
<p style="color:#475569;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 12px;">Quoted Items</p>
<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
  ${productRow('Custom Branded T-Shirt', 'TSH-BLK-LG', 500, 'Black', '$4,975.00', '#1e293b', 'TS')}
  ${productRow('Embroidered Baseball Cap', 'CAP-NVY-OS', 300, 'Navy Blue', '$2,685.00', '#1e3a5f', 'BC')}
  ${productRow('Custom Tote Bag', 'TOT-WHT-OS', 200, 'White', '$1,580.00', '#059669', 'TB')}
<tr><td style="padding-top:14px;border-top:2px solid #e2e8f0;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td style="text-align:right;padding:3px 0;"><span style="color:#64748b;font-size:12px;">Subtotal</span></td>
      <td width="90" style="text-align:right;padding:3px 0;"><span style="color:#1e293b;font-size:12px;font-weight:600;">$9,240.00</span></td>
    </tr>
    <tr>
      <td style="text-align:right;padding:3px 0;"><span style="color:#64748b;font-size:12px;">Setup Fees</span></td>
      <td width="90" style="text-align:right;padding:3px 0;"><span style="color:#1e293b;font-size:12px;font-weight:600;">$350.00</span></td>
    </tr>
    <tr>
      <td style="text-align:right;padding:3px 0;"><span style="color:#64748b;font-size:12px;">Est. Shipping</span></td>
      <td width="90" style="text-align:right;padding:3px 0;"><span style="color:#1e293b;font-size:12px;font-weight:600;">$245.00</span></td>
    </tr>
    <tr>
      <td style="text-align:right;padding:8px 0 0;"><span style="color:#1e293b;font-size:14px;font-weight:800;">Estimated Total</span></td>
      <td width="90" style="text-align:right;padding:8px 0 0;"><span style="color:${B};font-size:14px;font-weight:800;">$9,835.00</span></td>
    </tr>
  </table>
</td></tr>
</table>`;
}

function addressBlock(label: string, address: string): string {
  return `<td style="width:50%;vertical-align:top;padding:16px 20px;">
  <p style="color:#94a3b8;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 6px;">${label}</p>
  <p style="color:#1e293b;font-size:12px;line-height:1.6;margin:0;font-weight:500;">{{customerCompany}}<br/>${address}</p>
</td>`;
}

function addressRow(): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;border-radius:12px;overflow:hidden;margin-bottom:24px;border:1px solid #e2e8f0;">
<tr>
  ${addressBlock('Ship To', '{{shippingAddress}}')}
  ${addressBlock('Bill To', '{{billingAddress}}')}
</tr>
</table>`;
}

function ctaButton(text: string, href: string, bg: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
<tr><td align="center">
  <a href="${href}" style="display:inline-block;background:${bg};color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:10px;font-weight:700;font-size:14px;box-shadow:0 6px 16px rgba(13,148,136,0.2);">${text}</a>
</td></tr>
</table>`;
}

function trackingSection(): string {
  return `<!-- Tracking Info -->
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0fdfa;border-radius:12px;overflow:hidden;margin-bottom:4px;border:1px solid #99f6e4;">
<tr><td style="padding:20px 24px;">
  <table width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td valign="top">
      <p style="color:${B};font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 4px;">Tracking Number</p>
      <p style="color:#1e293b;font-size:16px;font-weight:800;letter-spacing:0.5px;margin:0;font-family:'Courier New',Courier,monospace;">{{trackingNumber}}</p>
    </td>
    <td style="text-align:right;vertical-align:top;" width="160">
      <p style="color:#64748b;font-size:12px;margin:0 0 2px;">Carrier: <strong style="color:#1e293b;">{{carrier}}</strong></p>
      <p style="color:#64748b;font-size:12px;margin:0;">Method: <strong style="color:#1e293b;">{{shippingMethod}}</strong></p>
    </td>
  </tr>
  </table>
</td></tr>
</table>
${ctaButton('Track Your Package &rarr;', '{{carrierTrackingUrl}}', BRAND_GRADIENT)}`;
}

// Progress bar - two-row approach: dots on top row, labels on bottom for proper alignment
function progressBarClean(steps: string[], activeIndex: number): string {
  const totalSteps = steps.length;
  const stepWidth = Math.floor(80 / totalSteps);

  let dotsRow = '';
  let labelsRow = '';

  steps.forEach((step, i) => {
    const isCompleted = i <= activeIndex;
    const isCurrent = i === activeIndex;
    const dotBg = isCompleted ? B : '#e2e8f0';
    const textColor = isCompleted ? '#1e293b' : '#94a3b8';
    const textWeight = isCurrent ? '700' : '500';

    // Dot cell
    dotsRow += `<td align="center" style="padding:0;" width="${stepWidth}%">
      <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
      <tr><td align="center" valign="middle" style="width:28px;height:28px;border-radius:50%;background:${dotBg};">
        ${isCompleted
          ? `<span style="color:#ffffff;font-size:12px;font-weight:700;line-height:28px;">&#10003;</span>`
          : `<span style="color:#ffffff;font-size:14px;line-height:28px;">&bull;</span>`
        }
      </td></tr>
      </table>
    </td>`;

    labelsRow += `<td align="center" style="padding:6px 2px 0;" width="${stepWidth}%">
      <span style="color:${textColor};font-size:10px;font-weight:${textWeight};line-height:1.3;">${step}</span>
    </td>`;

    // Line between dots
    if (i < totalSteps - 1) {
      const lineBg = i < activeIndex ? B : '#e2e8f0';
      dotsRow += `<td style="padding:0;vertical-align:middle;">
        <div style="height:3px;background:${lineBg};border-radius:2px;"></div>
      </td>`;
      labelsRow += `<td style="padding:0;"></td>`;
    }
  });

  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
    <tr>${dotsRow}</tr>
    <tr>${labelsRow}</tr>
  </table>`;
}

function calloutBox(bgColor: string, borderColor: string, textColor: string, content: string): string {
  return `<div style="background-color:${bgColor};border-left:4px solid ${borderColor};padding:16px 20px;border-radius:0 8px 8px 0;margin:24px 0 0;">
  <p style="color:${textColor};font-size:13px;line-height:1.6;margin:0;">${content}</p>
</div>`;
}

// ═══════════════════════════════════════════════════════════
// SHIPPING TEMPLATES
// ═══════════════════════════════════════════════════════════

function getShippedHTML(): string {
  const steps = ['Confirmed', 'In Production', 'Shipped', 'Out for Delivery', 'Delivered'];
  return emailShell(
    'linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%)',
    'Your Order Has Shipped!',
    'Order {{orderNumber}} is on its way to you',
    `
    <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 24px;">Hi <strong>{{firstName}}</strong>, great news! Your order from the <strong>{{projectName}}</strong> project has been shipped and is heading your way.</p>

    ${progressBarClean(steps, 2)}
    ${orderInfoBar('Order Number', '{{orderNumber}}', 'Ship Date', '{{shipDate}}', 'Est. Delivery', '{{estimatedDelivery}}')}
    ${trackingSection()}
    ${productTable()}
    ${addressRow()}

    ${calloutBox('#f0fdf4', '#22c55e', '#166534', '<strong>Delivery Note:</strong> Someone may need to sign for this package. If you won\'t be available, consider leaving delivery instructions with your carrier.')}
    `
  );
}

function getOutForDeliveryHTML(): string {
  const steps = ['Confirmed', 'In Production', 'Shipped', 'Out for Delivery', 'Delivered'];
  return emailShell(
    'linear-gradient(135deg, #f59e0b 0%, #f97316 50%, #ef4444 100%)',
    'Out for Delivery Today!',
    'Order {{orderNumber}} arrives today',
    `
    <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 24px;">Hi <strong>{{firstName}}</strong>, your package is out for delivery and will arrive today! Make sure someone is available to receive it.</p>

    ${progressBarClean(steps, 3)}
    ${orderInfoBar('Order Number', '{{orderNumber}}', 'Carrier', '{{carrier}}', 'Arriving', 'Today')}
    ${trackingSection()}

    <!-- Delivery Address Highlight -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fffbeb;border-radius:12px;overflow:hidden;margin-bottom:24px;border:1px solid #fde68a;">
    <tr><td style="padding:20px 24px;">
      <p style="color:#92400e;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 6px;">Delivering To</p>
      <p style="color:#1e293b;font-size:13px;line-height:1.6;margin:0;font-weight:600;">{{customerCompany}}<br/>{{shippingAddress}}</p>
    </td></tr>
    </table>

    ${productTable()}

    ${calloutBox('#fefce8', '#eab308', '#854d0e', '<strong>Almost there!</strong> Your package has been loaded on the delivery truck and is on its way. You can continue tracking in real-time using the link above.')}
    `
  );
}

function getDeliveredHTML(): string {
  const steps = ['Confirmed', 'In Production', 'Shipped', 'Out for Delivery', 'Delivered'];
  return emailShell(
    'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
    'Your Order Has Been Delivered!',
    'Order {{orderNumber}} has arrived',
    `
    <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 24px;">Hi <strong>{{firstName}}</strong>, your order has been delivered! We hope you love your custom merchandise.</p>

    ${progressBarClean(steps, 4)}
    ${orderInfoBar('Order Number', '{{orderNumber}}', 'Delivered On', '{{deliveredDate}}', 'Carrier', '{{carrier}}')}

    <!-- Delivery Confirmation -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0fdf4;border-radius:12px;overflow:hidden;margin-bottom:24px;border:1px solid #bbf7d0;">
    <tr><td style="padding:24px;text-align:center;">
      <table cellpadding="0" cellspacing="0" style="margin:0 auto 12px;">
        <tr><td align="center" valign="middle" style="width:48px;height:48px;border-radius:50%;background:#10b981;">
          <span style="color:#ffffff;font-size:22px;font-weight:700;line-height:48px;">&#10003;</span>
        </td></tr>
      </table>
      <p style="color:#166534;font-size:16px;font-weight:700;margin:0 0 4px;">Successfully Delivered</p>
      <p style="color:#15803d;font-size:13px;margin:0;">{{deliveredDate}}</p>
      <p style="color:#64748b;font-size:12px;margin:8px 0 0;">Delivered to: <strong>{{shippingAddress}}</strong></p>
    </td></tr>
    </table>

    ${productTable()}

    <p style="color:#475569;font-size:14px;line-height:1.7;margin:0 0 8px;">If anything looks off or you have questions about your order, don't hesitate to reach out.</p>

    ${ctaButton('Rate Your Experience', '#', 'linear-gradient(135deg, #10b981, #059669)')}

    ${calloutBox('#f0fdf4', '#22c55e', '#166534', `<strong>Need help?</strong> If any items are damaged or missing, please contact us within 48 hours at <a href="mailto:support@activateswag.com" style="color:${B};font-weight:600;">support@activateswag.com</a>.`)}
    `
  );
}

// ═══════════════════════════════════════════════════════════
// ORDER TEMPLATES
// ═══════════════════════════════════════════════════════════

function getOrderConfirmationHTML(): string {
  return emailShell(
    BRAND_GRADIENT,
    'Order Received!',
    'We have received your order and it is being reviewed',
    `
    <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 24px;">Hi <strong>{{firstName}}</strong>, thank you for your order! We've received it and our team is reviewing it now. You'll receive another email once your order is confirmed.</p>

    ${orderInfoBar('Order Number', '{{orderNumber}}', 'Project', '{{projectName}}', 'Status', 'Under Review')}
    ${productTable()}
    ${addressRow()}

    ${ctaButton('View Order Details', '#', BRAND_GRADIENT)}

    ${calloutBox('#f0fdfa', B, '#134e4a', '<strong>What happens next?</strong> Our team will review your order and confirm it within 1-2 business days. Once confirmed, your order will move into production.')}
    `
  );
}

function getOrderConfirmedHTML(): string {
  const steps = ['Confirmed', 'In Production', 'Shipped', 'Out for Delivery', 'Delivered'];
  return emailShell(
    'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    'Order Confirmed &amp; Approved',
    'Order {{orderNumber}} has been approved by our team',
    `
    <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 24px;">Hi <strong>{{firstName}}</strong>, your order has been reviewed and <strong style="color:#059669;">approved</strong>! It will now be scheduled for production.</p>

    ${progressBarClean(steps, 0)}
    ${orderInfoBar('Order Number', '{{orderNumber}}', 'Confirmed On', '{{shipDate}}', 'Est. Production', '5-7 Business Days')}
    ${productTable()}
    ${addressRow()}

    ${ctaButton('View Order Status', '#', 'linear-gradient(135deg, #10b981, #059669)')}
    `
  );
}

function getInProductionHTML(): string {
  const steps = ['Confirmed', 'In Production', 'Shipped', 'Out for Delivery', 'Delivered'];
  return emailShell(
    'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    'Your Order Is In Production',
    'Order {{orderNumber}} is being manufactured',
    `
    <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 24px;">Hi <strong>{{firstName}}</strong>, exciting update! Your order for the <strong>{{projectName}}</strong> project has entered production. Our team is now crafting your custom merchandise.</p>

    ${progressBarClean(steps, 1)}
    ${orderInfoBar('Order Number', '{{orderNumber}}', 'Production Start', '{{shipDate}}', 'Est. Completion', '5-7 Business Days')}
    ${productTable()}

    ${calloutBox('#fffbeb', '#f59e0b', '#92400e', '<strong>Production update:</strong> We\'ll send you an email when production is complete and your order is ready to ship. Estimated production time is 5-7 business days.')}
    `
  );
}

function getOrderCompletedHTML(): string {
  const steps = ['Confirmed', 'In Production', 'Completed', 'Shipped', 'Delivered'];
  return emailShell(
    'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    'Order Complete &amp; Ready to Ship',
    'Order {{orderNumber}} production is finished',
    `
    <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 24px;">Hi <strong>{{firstName}}</strong>, your order has been completed and is ready to ship! We'll send tracking information once the package is in transit.</p>

    ${progressBarClean(steps, 2)}
    ${orderInfoBar('Order Number', '{{orderNumber}}', 'Completed On', '{{shipDate}}', 'Next Step', 'Shipping Soon')}
    ${productTable()}
    ${addressRow()}

    ${ctaButton('View Order Details', '#', 'linear-gradient(135deg, #06b6d4, #0891b2)')}
    `
  );
}

function getDeliveryFollowUpHTML(): string {
  return emailShell(
    'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
    'How Was Your Order?',
    'We\'d love to hear about your experience with order {{orderNumber}}',
    `
    <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 24px;">Hi <strong>{{firstName}}</strong>, your order from the <strong>{{projectName}}</strong> project was delivered recently and we wanted to check in. We hope everything arrived in great condition!</p>

    ${orderInfoBar('Order Number', '{{orderNumber}}', 'Delivered On', '{{deliveredDate}}', 'Project', '{{projectName}}')}

    <!-- Satisfaction Check -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0fdfa;border-radius:12px;overflow:hidden;margin-bottom:24px;border:1px solid #99f6e4;">
    <tr><td style="padding:28px;text-align:center;">
      <p style="color:#134e4a;font-size:16px;font-weight:700;margin:0 0 6px;">Did everything meet your expectations?</p>
      <p style="color:#0f766e;font-size:13px;margin:0 0 20px;">Your feedback helps us improve our products and service</p>
      <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
      <tr>
        <td style="padding:0 6px;"><a href="#" style="display:inline-block;background:linear-gradient(135deg,#10b981,#059669);color:#fff;text-decoration:none;padding:10px 24px;border-radius:8px;font-weight:700;font-size:13px;">Everything looks great</a></td>
        <td style="padding:0 6px;"><a href="#" style="display:inline-block;background:#f1f5f9;color:#475569;text-decoration:none;padding:10px 24px;border-radius:8px;font-weight:700;font-size:13px;border:1px solid #e2e8f0;">I have an issue</a></td>
      </tr>
      </table>
    </td></tr>
    </table>

    ${productTable()}

    <!-- Quick Actions -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;border-radius:12px;overflow:hidden;margin-bottom:24px;border:1px solid #e2e8f0;">
    <tr><td style="padding:24px;">
      <p style="color:#64748b;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 16px;">Quick Actions</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:6px 0;"><span style="color:#1e293b;font-size:13px;font-weight:600;">&#8594; <a href="#" style="color:${B};text-decoration:none;">Reorder the same products</a></span></td>
        </tr>
        <tr>
          <td style="padding:6px 0;border-top:1px solid #f1f5f9;"><span style="color:#1e293b;font-size:13px;font-weight:600;">&#8594; <a href="#" style="color:${B};text-decoration:none;">Report a product issue</a></span></td>
        </tr>
        <tr>
          <td style="padding:6px 0;border-top:1px solid #f1f5f9;"><span style="color:#1e293b;font-size:13px;font-weight:600;">&#8594; <a href="#" style="color:${B};text-decoration:none;">Contact your sales rep</a></span></td>
        </tr>
      </table>
    </td></tr>
    </table>

    <p style="color:#475569;font-size:14px;line-height:1.7;margin:0 0 8px;">Thank you for choosing ActivateSwag. We appreciate your business and look forward to working with you again!</p>

    ${calloutBox('#f0fdfa', B, '#134e4a', `<strong>Need assistance?</strong> If any items arrived damaged or don't meet your expectations, please reach out within 48 hours and we'll make it right. Contact <strong>{{salesRep}}</strong> at <a href="mailto:{{salesRepEmail}}" style="color:${B};font-weight:600;">{{salesRepEmail}}</a>.`)}
    `
  );
}

// ═══════════════════════════════════════════════════════════
// DESIGN TEMPLATES
// ═══════════════════════════════════════════════════════════

function getDesignReadyHTML(): string {
  return emailShell(
    'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
    'Your Design Is Ready for Review',
    'Take a look at your custom design mockup',
    `
    <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 24px;">Hi <strong>{{firstName}}</strong>, the design for your <strong>{{projectName}}</strong> project is ready! Please review it and let us know if you'd like any changes.</p>

    ${orderInfoBar('Order Number', '{{orderNumber}}', 'Project', '{{projectName}}', 'Status', 'Awaiting Approval')}

    <!-- Design Preview Placeholder -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
    <tr><td style="background-color:#fdf2f8;border-radius:12px;padding:36px;text-align:center;border:2px dashed #f9a8d4;">
      <table cellpadding="0" cellspacing="0" style="margin:0 auto 12px;">
        <tr><td align="center" valign="middle" style="width:56px;height:56px;border-radius:50%;background:#ec4899;">
          <span style="color:#ffffff;font-size:24px;font-weight:700;line-height:56px;">D</span>
        </td></tr>
      </table>
      <p style="color:#9d174d;font-size:15px;font-weight:700;margin:0 0 4px;">Design Mockup Preview</p>
      <p style="color:#be185d;font-size:12px;margin:0;">Click below to view the full design in your browser</p>
    </td></tr>
    </table>

    ${ctaButton('Review &amp; Approve Design &rarr;', '#', 'linear-gradient(135deg, #ec4899, #db2777)')}

    ${calloutBox('#fdf2f8', '#ec4899', '#9d174d', '<strong>What to look for:</strong> Please check logo placement, colors, text accuracy, and overall layout. Reply to this email with any revision requests.')}
    `
  );
}

function getDesignApprovedHTML(): string {
  return emailShell(
    'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    'Design Approved!',
    'Moving your order into production',
    `
    <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 24px;">Hi <strong>{{firstName}}</strong>, thanks for approving the design for <strong>{{projectName}}</strong>! Your order is now being moved into production.</p>

    ${orderInfoBar('Order Number', '{{orderNumber}}', 'Project', '{{projectName}}', 'Next Step', 'Production')}

    <!-- Timeline -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;border-radius:12px;overflow:hidden;margin-bottom:24px;border:1px solid #e2e8f0;">
    <tr><td style="padding:24px;">
      <p style="color:#64748b;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 16px;">Estimated Timeline</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:8px 0;"><span style="color:#10b981;font-size:13px;font-weight:700;">&#10003; Design Approved</span></td>
          <td style="text-align:right;padding:8px 0;"><span style="color:#64748b;font-size:12px;">Today</span></td>
        </tr>
        <tr>
          <td style="padding:8px 0;border-top:1px solid #f1f5f9;"><span style="color:#f59e0b;font-size:13px;font-weight:700;">&#9679; Production Starts</span></td>
          <td style="text-align:right;padding:8px 0;border-top:1px solid #f1f5f9;"><span style="color:#64748b;font-size:12px;">1-2 business days</span></td>
        </tr>
        <tr>
          <td style="padding:8px 0;border-top:1px solid #f1f5f9;"><span style="color:#94a3b8;font-size:13px;font-weight:600;">&#9675; Ready to Ship</span></td>
          <td style="text-align:right;padding:8px 0;border-top:1px solid #f1f5f9;"><span style="color:#64748b;font-size:12px;">7-10 business days</span></td>
        </tr>
        <tr>
          <td style="padding:8px 0;border-top:1px solid #f1f5f9;"><span style="color:#94a3b8;font-size:13px;font-weight:600;">&#9675; Estimated Delivery</span></td>
          <td style="text-align:right;padding:8px 0;border-top:1px solid #f1f5f9;"><span style="color:#64748b;font-size:12px;">10-14 business days</span></td>
        </tr>
      </table>
    </td></tr>
    </table>

    ${ctaButton('View Order Status', '#', 'linear-gradient(135deg, #10b981, #059669)')}
    `
  );
}

function getRevisionRequestedHTML(): string {
  return emailShell(
    'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    'Design Revision Requested',
    'Changes have been requested on your design for {{projectName}}',
    `
    <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 24px;">Hi <strong>{{firstName}}</strong>, we've received revision requests for the design on your <strong>{{projectName}}</strong> project. Our design team is already working on the updates.</p>

    ${orderInfoBar('Order Number', '{{orderNumber}}', 'Project', '{{projectName}}', 'Status', 'Revision In Progress')}

    <!-- Revision Details -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fffbeb;border-radius:12px;overflow:hidden;margin-bottom:24px;border:1px solid #fde68a;">
    <tr><td style="padding:24px;">
      <p style="color:#92400e;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 16px;">Requested Changes</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #fef3c7;">
            <table cellpadding="0" cellspacing="0"><tr>
              <td valign="top" style="padding-right:10px;"><span style="color:#d97706;font-size:13px;font-weight:700;">1.</span></td>
              <td><span style="color:#1e293b;font-size:13px;font-weight:500;">Adjust logo placement - move 0.5 inches to the left</span></td>
            </tr></table>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #fef3c7;">
            <table cellpadding="0" cellspacing="0"><tr>
              <td valign="top" style="padding-right:10px;"><span style="color:#d97706;font-size:13px;font-weight:700;">2.</span></td>
              <td><span style="color:#1e293b;font-size:13px;font-weight:500;">Update text color to match brand guidelines (hex #1A2B3C)</span></td>
            </tr></table>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;">
            <table cellpadding="0" cellspacing="0"><tr>
              <td valign="top" style="padding-right:10px;"><span style="color:#d97706;font-size:13px;font-weight:700;">3.</span></td>
              <td><span style="color:#1e293b;font-size:13px;font-weight:500;">Increase font size on back print from 12pt to 14pt</span></td>
            </tr></table>
          </td>
        </tr>
      </table>
    </td></tr>
    </table>

    <!-- Timeline -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;border-radius:12px;overflow:hidden;margin-bottom:24px;border:1px solid #e2e8f0;">
    <tr><td style="padding:24px;">
      <p style="color:#64748b;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 16px;">Revision Timeline</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:6px 0;"><span style="color:#f59e0b;font-size:13px;font-weight:700;">&#9679; Revision requested</span></td>
          <td style="text-align:right;"><span style="color:#64748b;font-size:12px;">Today</span></td>
        </tr>
        <tr>
          <td style="padding:6px 0;border-top:1px solid #f1f5f9;"><span style="color:#94a3b8;font-size:13px;font-weight:600;">&#9675; Updated design ready for review</span></td>
          <td style="text-align:right;border-top:1px solid #f1f5f9;"><span style="color:#64748b;font-size:12px;">1-2 business days</span></td>
        </tr>
      </table>
    </td></tr>
    </table>

    <p style="color:#475569;font-size:14px;line-height:1.7;margin:0 0 8px;">We'll send you an updated design proof as soon as the revisions are complete. No action is needed from you at this time.</p>

    ${ctaButton('View Current Design', '#', 'linear-gradient(135deg, #f59e0b, #d97706)')}

    ${calloutBox('#fffbeb', '#f59e0b', '#92400e', `<strong>Questions about your revisions?</strong> Contact <strong>{{salesRep}}</strong> at <a href="mailto:{{salesRepEmail}}" style="color:${B};font-weight:600;">{{salesRepEmail}}</a> or call <strong>{{salesRepPhone}}</strong>.`)}
    `
  );
}

// ═══════════════════════════════════════════════════════════
// QUOTE TEMPLATES
// ═══════════════════════════════════════════════════════════

function getQuoteRequestReceivedHTML(): string {
  return emailShell(
    BRAND_GRADIENT,
    'Quote Request Received',
    'We\'re preparing your custom quote',
    `
    <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 24px;">Hi <strong>{{firstName}}</strong>, thank you for your quote request! We've received it and our team is working on putting together a detailed quote for your <strong>{{projectName}}</strong> project.</p>

    ${orderInfoBar('Quote Number', '{{quoteNumber}}', 'Project', '{{projectName}}', 'Status', 'In Progress')}

    <!-- What We're Working On -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;border-radius:12px;overflow:hidden;margin-bottom:24px;border:1px solid #e2e8f0;">
    <tr><td style="padding:24px;">
      <p style="color:#64748b;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 16px;">What to expect</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;">
            <table cellpadding="0" cellspacing="0"><tr>
              <td valign="middle" style="padding-right:12px;">
                <table cellpadding="0" cellspacing="0"><tr><td align="center" valign="middle" style="width:28px;height:28px;border-radius:50%;background:#ccfbf1;"><span style="color:${B};font-size:13px;font-weight:700;">1</span></td></tr></table>
              </td>
              <td valign="middle"><span style="color:#1e293b;font-size:13px;font-weight:600;">Reviewing your product selections and quantities</span></td>
            </tr></table>
          </td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;">
            <table cellpadding="0" cellspacing="0"><tr>
              <td valign="middle" style="padding-right:12px;">
                <table cellpadding="0" cellspacing="0"><tr><td align="center" valign="middle" style="width:28px;height:28px;border-radius:50%;background:#ccfbf1;"><span style="color:${B};font-size:13px;font-weight:700;">2</span></td></tr></table>
              </td>
              <td valign="middle"><span style="color:#1e293b;font-size:13px;font-weight:600;">Calculating pricing with applicable volume discounts</span></td>
            </tr></table>
          </td>
        </tr>
        <tr>
          <td style="padding:10px 0;">
            <table cellpadding="0" cellspacing="0"><tr>
              <td valign="middle" style="padding-right:12px;">
                <table cellpadding="0" cellspacing="0"><tr><td align="center" valign="middle" style="width:28px;height:28px;border-radius:50%;background:#ccfbf1;"><span style="color:${B};font-size:13px;font-weight:700;">3</span></td></tr></table>
              </td>
              <td valign="middle"><span style="color:#1e293b;font-size:13px;font-weight:600;">Estimating production timelines and shipping costs</span></td>
            </tr></table>
          </td>
        </tr>
      </table>
    </td></tr>
    </table>

    <p style="color:#475569;font-size:14px;line-height:1.7;margin:0 0 8px;">Your dedicated sales representative <strong>{{salesRep}}</strong> will have your quote ready within 1-2 business days.</p>

    ${calloutBox('#f0fdfa', B, '#134e4a', `<strong>Questions in the meantime?</strong> Reach out to {{salesRep}} directly at <a href="mailto:{{salesRepEmail}}" style="color:${B};font-weight:600;">{{salesRepEmail}}</a> or call <strong>{{salesRepPhone}}</strong>.`)}
    `
  );
}

function getQuoteReadyHTML(): string {
  return emailShell(
    'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
    'Your Quote Is Ready!',
    'Quote {{quoteNumber}} for {{projectName}}',
    `
    <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 24px;">Hi <strong>{{firstName}}</strong>, your custom quote for the <strong>{{projectName}}</strong> project is ready for review. We've put together competitive pricing based on your specifications.</p>

    ${orderInfoBar('Quote Number', '{{quoteNumber}}', 'Valid Until', '{{quoteExpiry}}', 'Prepared By', '{{salesRep}}')}
    ${quoteProductTable()}

    <!-- Quote Highlights -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#eff6ff;border-radius:12px;overflow:hidden;margin-bottom:24px;border:1px solid #bfdbfe;">
    <tr><td style="padding:20px 24px;">
      <p style="color:#1e40af;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 12px;">Quote Highlights</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:4px 0;"><span style="color:#1e40af;font-size:13px;">&#10003; Volume discount applied (15% off)</span></td>
        </tr>
        <tr>
          <td style="padding:4px 0;"><span style="color:#1e40af;font-size:13px;">&#10003; Free setup on orders over $5,000</span></td>
        </tr>
        <tr>
          <td style="padding:4px 0;"><span style="color:#1e40af;font-size:13px;">&#10003; Estimated production: 7-10 business days</span></td>
        </tr>
        <tr>
          <td style="padding:4px 0;"><span style="color:#1e40af;font-size:13px;">&#10003; Price locked until {{quoteExpiry}}</span></td>
        </tr>
      </table>
    </td></tr>
    </table>

    ${ctaButton('Review &amp; Accept Quote &rarr;', '#', 'linear-gradient(135deg, #0ea5e9, #2563eb)')}

    <p style="color:#475569;font-size:13px;line-height:1.7;margin:0;text-align:center;">Want to discuss? Contact <strong>{{salesRep}}</strong> at <a href="mailto:{{salesRepEmail}}" style="color:${B};font-weight:600;">{{salesRepEmail}}</a></p>
    `
  );
}

function getQuoteAcceptedHTML(): string {
  return emailShell(
    'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    'Quote Accepted!',
    'Your quote has been converted to an order',
    `
    <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 24px;">Hi <strong>{{firstName}}</strong>, great news! Your quote <strong>{{quoteNumber}}</strong> has been accepted and converted into order <strong>{{orderNumber}}</strong>. We're getting started right away.</p>

    ${orderInfoBar('Quote Number', '{{quoteNumber}}', 'Order Number', '{{orderNumber}}', 'Status', 'Processing')}
    ${quoteProductTable()}

    <!-- Next Steps Timeline -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0fdf4;border-radius:12px;overflow:hidden;margin-bottom:24px;border:1px solid #bbf7d0;">
    <tr><td style="padding:24px;">
      <p style="color:#166534;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 16px;">What happens next</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:6px 0;"><span style="color:#166534;font-size:13px;font-weight:600;">&#10003; Order created from accepted quote</span></td>
          <td style="text-align:right;"><span style="color:#15803d;font-size:12px;">Done</span></td>
        </tr>
        <tr>
          <td style="padding:6px 0;border-top:1px solid #dcfce7;"><span style="color:#166534;font-size:13px;font-weight:600;">&#9679; Design mockup preparation</span></td>
          <td style="text-align:right;border-top:1px solid #dcfce7;"><span style="color:#64748b;font-size:12px;">1-2 days</span></td>
        </tr>
        <tr>
          <td style="padding:6px 0;border-top:1px solid #dcfce7;"><span style="color:#94a3b8;font-size:13px;">&#9675; Production begins after approval</span></td>
          <td style="text-align:right;border-top:1px solid #dcfce7;"><span style="color:#64748b;font-size:12px;">3-5 days</span></td>
        </tr>
        <tr>
          <td style="padding:6px 0;border-top:1px solid #dcfce7;"><span style="color:#94a3b8;font-size:13px;">&#9675; Estimated delivery</span></td>
          <td style="text-align:right;border-top:1px solid #dcfce7;"><span style="color:#64748b;font-size:12px;">12-16 days</span></td>
        </tr>
      </table>
    </td></tr>
    </table>

    ${ctaButton('View Your Order', '#', 'linear-gradient(135deg, #10b981, #059669)')}
    `
  );
}

function getQuoteExpiredHTML(): string {
  return emailShell(
    'linear-gradient(135deg, #64748b 0%, #475569 100%)',
    'Your Quote Has Expired',
    'Quote {{quoteNumber}} is no longer valid',
    `
    <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 24px;">Hi <strong>{{firstName}}</strong>, we wanted to let you know that your quote <strong>{{quoteNumber}}</strong> for the <strong>{{projectName}}</strong> project expired on <strong>{{quoteExpiry}}</strong>.</p>

    ${orderInfoBar('Quote Number', '{{quoteNumber}}', 'Project', '{{projectName}}', 'Status', 'Expired')}
    ${quoteProductTable()}

    <p style="color:#475569;font-size:14px;line-height:1.7;margin:0 0 8px;">Don't worry &mdash; we'd be happy to prepare an updated quote for you with the latest pricing and availability.</p>

    ${ctaButton('Request Updated Quote', '#', BRAND_GRADIENT)}

    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;border-radius:12px;overflow:hidden;margin-bottom:0;border:1px solid #e2e8f0;">
    <tr><td style="padding:20px 24px;">
      <p style="color:#64748b;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 8px;">Your Sales Representative</p>
      <p style="color:#1e293b;font-size:14px;font-weight:700;margin:0 0 4px;">{{salesRep}}</p>
      <p style="color:#64748b;font-size:12px;margin:0;">
        <a href="mailto:{{salesRepEmail}}" style="color:${B};text-decoration:none;font-weight:600;">{{salesRepEmail}}</a> &bull; {{salesRepPhone}}
      </p>
    </td></tr>
    </table>
    `
  );
}

// ═══════════════════════════════════════════════════════════
// AUTH TEMPLATES
// ═══════════════════════════════════════════════════════════

function getWelcomeEmailHTML(): string {
  return emailShell(
    BRAND_GRADIENT,
    'Welcome to ActivateSwag!',
    "We're excited to have you on board",
    `
    <h2 style="color:#1e293b;margin:0 0 16px;font-size:22px;font-weight:700;">Hi {{firstName}},</h2>
    <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 16px;">
      We're thrilled to have you join <strong>{{companyName}}</strong>! Your account has been successfully created and you're ready to get started.
    </p>
    <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 24px;">
      To complete your setup and secure your account, please create your password by clicking the button below:
    </p>

    ${ctaButton('Create Your Password', '{{activationLink}}', BRAND_GRADIENT)}

    ${calloutBox('#f0fdfa', B, '#134e4a', '<strong>Important:</strong> This link will expire in 48 hours for security reasons. If you didn\'t request this account, you can safely ignore this email.')}

    <p style="color:#475569;font-size:15px;line-height:1.7;margin:24px 0 0;">
      If you have any questions, our support team is here to help!
    </p>
    `
  );
}

function getForgotPasswordHTML(): string {
  return emailShell(
    'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
    'Password Reset',
    'Secure your account',
    `
    <h2 style="color:#1e293b;margin:0 0 16px;font-size:22px;font-weight:700;">Hi {{firstName}},</h2>
    <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 16px;">
      We received a request to reset your password for your <strong>ActivateSwag</strong> account. Don't worry, we're here to help!
    </p>
    <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 24px;">
      Click the button below to create a new password:
    </p>

    ${ctaButton('Reset My Password', '{{resetLink}}', 'linear-gradient(135deg, #dc2626, #ef4444)')}

    <div style="background-color:#fef2f2;border-left:4px solid #dc2626;padding:16px 20px;border-radius:0 8px 8px 0;margin:24px 0;">
      <p style="color:#991b1b;font-size:13px;line-height:1.6;margin:0 0 8px;"><strong>Security Notice:</strong></p>
      <ul style="color:#991b1b;font-size:13px;line-height:1.8;margin:0;padding-left:18px;">
        <li>This link will expire in <strong>24 hours</strong></li>
        <li>If you didn't request this, please ignore this email</li>
        <li>Your password won't change until you click the link above</li>
      </ul>
    </div>

    <div style="background-color:#f8fafc;padding:16px 20px;border-radius:8px;margin:24px 0;">
      <p style="color:#64748b;font-size:13px;line-height:1.6;margin:0 0 6px;"><strong style="color:#475569;">Can't click the button?</strong></p>
      <p style="color:#64748b;font-size:12px;margin:0;">Copy and paste this link into your browser:</p>
      <p style="color:${B};font-size:12px;word-break:break-all;margin:6px 0 0;">https://app.activateswag.com/reset-password?token=abc123xyz</p>
    </div>

    <p style="color:#475569;font-size:15px;line-height:1.7;margin:24px 0 0;">
      Need help? Contact our support team at <a href="mailto:support@activateswag.com" style="color:${B};text-decoration:none;font-weight:600;">support@activateswag.com</a>
    </p>
    `
  );
}

// ═══════════════════════════════════════════════════════════
// FALLBACK
// ═══════════════════════════════════════════════════════════

function getFallbackHTML(name: string, subject: string): string {
  return emailShell(
    BRAND_GRADIENT,
    name,
    subject,
    `
    <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 16px;">Hi <strong>{{firstName}}</strong>,</p>
    <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 24px;">
      This is a preview of the <strong>${name}</strong> email template. The actual content will be populated with real data when this email is sent.
    </p>

    ${calloutBox('#f0fdfa', B, '#134e4a', '<strong>Template Variables:</strong> This template supports dynamic variables like order numbers, tracking information, customer details, and more.')}
    `
  );
}
