import { motion, AnimatePresence } from 'motion/react';
import { Code, Copy, X, CheckCircle2, Globe, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

const SOURCE_CATEGORIES = [
  { value: 'organic', label: 'Organic' },
  { value: 'paid', label: 'Paid Ads' },
  { value: 'referral', label: 'Referral' },
  { value: 'direct', label: 'Direct' },
  { value: 'email', label: 'Email' },
  { value: 'social', label: 'Social' },
  { value: 'outbound', label: 'Outbound' },
];

interface SnippetOptions {
  formId: string;
  captureUrl: string;
  sourceCategory: string;
  sourceDetail: string;
}

function buildHtmlSnippet({ formId, captureUrl, sourceCategory, sourceDetail }: SnippetOptions): string {
  return `<!-- AS-CRM Lead Capture Form (${formId}) -->
<form id="${formId}" style="display:flex;flex-direction:column;gap:12px;max-width:420px;font-family:system-ui,sans-serif;">
  <input name="contactFirstName" placeholder="First name" required style="padding:10px;border:1px solid #d1d5db;border-radius:8px;" />
  <input name="contactLastName" placeholder="Last name" required style="padding:10px;border:1px solid #d1d5db;border-radius:8px;" />
  <input name="contactEmail" type="email" placeholder="Work email" required style="padding:10px;border:1px solid #d1d5db;border-radius:8px;" />
  <input name="contactPhone" placeholder="Phone" style="padding:10px;border:1px solid #d1d5db;border-radius:8px;" />
  <input name="company" placeholder="Company" required style="padding:10px;border:1px solid #d1d5db;border-radius:8px;" />
  <textarea name="notes" placeholder="What are you looking for?" rows="3" style="padding:10px;border:1px solid #d1d5db;border-radius:8px;resize:vertical;"></textarea>
  <input name="_hp" type="text" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px;" />
  <button type="submit" style="padding:12px;background:#4f46e5;color:#fff;border:none;border-radius:8px;font-weight:600;cursor:pointer;">Send</button>
  <p id="${formId}-msg" style="color:#16a34a;display:none;">Thanks — we'll be in touch shortly.</p>
</form>
<script>
(function(){
  var form = document.getElementById(${JSON.stringify(formId)});
  var msg = document.getElementById(${JSON.stringify(formId + '-msg')});
  function getQS(k){ try { return new URLSearchParams(window.location.search).get(k) || null; } catch(e) { return null; } }
  form.addEventListener('submit', function(ev){
    ev.preventDefault();
    var data = {};
    new FormData(form).forEach(function(v,k){ data[k] = v; });
    data.captureFormId = ${JSON.stringify(formId)};
    data.sourceCategory = ${JSON.stringify(sourceCategory)};
    data.sourceDetail = ${JSON.stringify(sourceDetail)};
    data.referrer = document.referrer || null;
    data.landingPage = window.location.href;
    data.utm = {
      source: getQS('utm_source'),
      medium: getQS('utm_medium'),
      campaign: getQS('utm_campaign'),
      term: getQS('utm_term'),
      content: getQS('utm_content'),
    };
    data.gclid = getQS('gclid');
    data.fbclid = getQS('fbclid');
    fetch(${JSON.stringify(captureUrl)}, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(function(r){
      if (r.ok) { form.reset(); msg.style.display = 'block'; }
      else { msg.textContent = 'Something went wrong, please try again.'; msg.style.color = '#dc2626'; msg.style.display = 'block'; }
    }).catch(function(){
      msg.textContent = 'Network error.'; msg.style.color = '#dc2626'; msg.style.display = 'block';
    });
  });
})();
</script>`;
}

export function LeadCaptureFormSnippet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const defaultBase = typeof window !== 'undefined' ? window.location.origin : 'https://your-crm.example.com';
  const [formId, setFormId] = useState('contact-form-1');
  const [captureUrl, setCaptureUrl] = useState(`${defaultBase}/api/sales-leads/capture`);
  const [sourceCategory, setSourceCategory] = useState('organic');
  const [sourceDetail, setSourceDetail] = useState('');
  const [copied, setCopied] = useState(false);

  const snippet = useMemo(
    () => buildHtmlSnippet({ formId, captureUrl, sourceCategory, sourceDetail }),
    [formId, captureUrl, sourceCategory, sourceDetail],
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      toast.success('Snippet copied');
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error('Could not copy — select the text manually.');
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose} />
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 280 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[640px] bg-white shadow-2xl z-50 flex flex-col"
          >
            <div className="px-5 py-4 border-b border-slate-200 bg-gradient-to-r from-indigo-600 via-blue-600 to-violet-600 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/15 backdrop-blur rounded-lg flex items-center justify-center border border-white/20">
                  <Code className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Embed Lead Capture Form</h2>
                  <p className="text-xs text-white/75">Configure, then paste into any website.</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/15 rounded-lg transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Form ID</label>
                  <input
                    value={formId}
                    onChange={(e) => setFormId(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                    className="w-full px-3 py-2.5 bg-slate-50/80 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
                    placeholder="contact-form-1"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Used to identify which embed produced a lead. Pick something descriptive — `homepage-hero`, `pricing-page`, etc.</p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Capture endpoint URL</label>
                  <input
                    value={captureUrl}
                    onChange={(e) => setCaptureUrl(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50/80 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Source Category</label>
                    <select
                      value={sourceCategory}
                      onChange={(e) => setSourceCategory(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50/80 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    >
                      {SOURCE_CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Source Detail</label>
                    <input
                      value={sourceDetail}
                      onChange={(e) => setSourceDetail(e.target.value)}
                      placeholder="e.g. homepage"
                      className="w-full px-3 py-2.5 bg-slate-50/80 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">HTML + JS snippet</label>
                  <button
                    onClick={copy}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="bg-slate-900 text-slate-100 rounded-xl p-4 text-[11px] leading-relaxed font-mono overflow-x-auto max-h-[420px] overflow-y-auto">
                  <code>{snippet}</code>
                </pre>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-[12px] text-blue-900">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 mt-0.5 shrink-0" />
                  <div className="space-y-1.5">
                    <p className="font-semibold">What this snippet does automatically:</p>
                    <ul className="list-disc pl-4 space-y-0.5">
                      <li>Captures UTM params (source, medium, campaign, term, content) from the page URL.</li>
                      <li>Captures <code className="bg-blue-100 px-1 rounded">gclid</code> and <code className="bg-blue-100 px-1 rounded">fbclid</code> from the URL for ad attribution.</li>
                      <li>Records <code className="bg-blue-100 px-1 rounded">document.referrer</code> and the current page URL.</li>
                      <li>Includes a hidden honeypot (<code className="bg-blue-100 px-1 rounded">_hp</code>) — bots fail silently.</li>
                      <li>Tags the lead with <code className="bg-blue-100 px-1 rounded">captureFormId</code> for source attribution.</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-[12px] text-amber-900">
                <div className="flex items-start gap-2">
                  <Globe className="w-4 h-4 mt-0.5 shrink-0" />
                  <p>If embedding on a different domain, make sure the capture URL above uses your <strong>production</strong> origin (not localhost or preview deploys).</p>
                </div>
              </div>
            </div>

            <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50/50 flex justify-end">
              <button onClick={onClose} className="px-4 py-2 border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-white transition-colors">
                Close
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
