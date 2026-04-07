import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Save, DollarSign, Clock, Package, Truck, Pencil, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface PricingTier {
  quantity: number | string;
  exwPrice: number | string;
  fobPrice: number | string;
  ddpPrice: number | string;
  ddpMethod: string;
  leadTime: number | string;
}

interface Vendor {
  id: string;
  name: string;
  country: string;
  contact?: {
    name: string;
    email: string;
    phone: string;
  };
  type: string;
  platform: string;
  priority: string;
  moq: number;
  pricingTiers?: PricingTier[];
  supportsDropShipping?: boolean;
}

interface VendorPricingPanelProps {
  vendor: Vendor;
  productId: string;
  onVendorUpdated: (vendor: Vendor) => void;
}

const DDP_METHODS = ['Air', 'Sea', 'Express', 'Rail', 'Truck'];

const formatCurrency = (val: number | string): string => {
  const num = Number(val);
  if (isNaN(num)) return '$0.00';
  return '$' + num.toFixed(2);
};

const formatQty = (val: number | string): string => {
  const num = Number(val);
  if (isNaN(num) || num === 0) return '0';
  return num.toLocaleString('en-US');
};

const parseCurrency = (val: string): string => val.replace(/[^0-9.]/g, '');
const parseQty = (val: string): string => val.replace(/[^0-9]/g, '');

export function VendorPricingPanel({ vendor, productId, onVendorUpdated }: VendorPricingPanelProps) {
  const [isDropship, setIsDropship] = useState(vendor.supportsDropShipping === true);
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>(vendor.pricingTiers || []);
  const [moq, setMoq] = useState<string>(String(vendor.moq || ''));
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setPricingTiers(vendor.pricingTiers || []);
    setMoq(String(vendor.moq || ''));
    setIsDropship(vendor.supportsDropShipping === true);
    setHasChanges(false);
    setIsEditing(false);
  }, [vendor.id]);

  const addTier = () => {
    const lastTier = pricingTiers[pricingTiers.length - 1];
    const newTier: PricingTier = {
      quantity: lastTier ? Number(lastTier.quantity) + 500 : moq ? parseInt(moq) : 100,
      exwPrice: lastTier ? lastTier.exwPrice : 0,
      fobPrice: lastTier ? lastTier.fobPrice : 0,
      ddpPrice: lastTier ? lastTier.ddpPrice : 0,
      ddpMethod: lastTier ? lastTier.ddpMethod : 'Sea',
      leadTime: lastTier ? lastTier.leadTime : isDropship ? 2 : 30,
    };
    setPricingTiers([...pricingTiers, newTier]);
    setHasChanges(true);
  };

  const removeTier = (index: number) => {
    setPricingTiers(pricingTiers.filter((_, i) => i !== index));
    setHasChanges(true);
  };

  const updateTier = (index: number, field: keyof PricingTier, value: string | number) => {
    setPricingTiers(pricingTiers.map((tier, i) => i !== index ? tier : { ...tier, [field]: value }));
    setHasChanges(true);
  };

  const savePricing = async () => {
    setIsSaving(true);
    try {
      const tiersToSave = pricingTiers.map(tier => ({
        quantity: Number(tier.quantity) || 0,
        exwPrice: Number(tier.exwPrice) || 0,
        fobPrice: Number(tier.fobPrice) || 0,
        ddpPrice: Number(tier.ddpPrice) || 0,
        ddpMethod: tier.ddpMethod,
        leadTime: Number(tier.leadTime) || 0,
      }));
      const moqValue = parseInt(moq) || 0;

      const res = await fetch('/api/pipeline/vendors/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: vendor.id,
          pricingTiers: tiersToSave,
          moq: moqValue,
          supportsDropShipping: isDropship,
        }),
      });

      if (!res.ok) throw new Error('Failed to save');
      toast.success('Pricing saved successfully');
      onVendorUpdated({ ...vendor, pricingTiers: tiersToSave, moq: moqValue, supportsDropShipping: isDropship });
      setHasChanges(false);
      setIsEditing(false);
    } catch {
      toast.error('Error saving pricing');
    } finally {
      setIsSaving(false);
    }
  };

  const bestFob = pricingTiers.length > 0
    ? Math.min(...pricingTiers.map(t => Number(t.fobPrice) || 0))
    : null;
  const bestLeadTime = pricingTiers.length > 0
    ? Math.min(...pricingTiers.map(t => Number(t.leadTime) || 0))
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden flex flex-col h-full"
    >
      {/* Header */}
      <div className="px-6 py-4 flex-shrink-0 bg-gradient-to-r from-slate-800 to-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">{vendor.name}</h3>
              {isDropship && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white border border-white/30">
                  <Truck className="w-3 h-3" />
                  Dropship
                </span>
              )}
            </div>
            <p className="text-sm text-slate-300">{vendor.country}{vendor.type ? ` · ${vendor.type}` : ''}</p>
          </div>
          <div className="flex items-center gap-2">
            {hasChanges && (
              <motion.button
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={savePricing}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-white font-semibold rounded-xl text-sm shadow-lg transition-all disabled:opacity-50 text-slate-700 hover:bg-slate-50"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save'}
              </motion.button>
            )}
            {!isEditing && !hasChanges && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-xl text-sm transition-all"
              >
                <Pencil className="w-4 h-4" />
                Edit
              </motion.button>
            )}
            {isEditing && !hasChanges && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setIsEditing(false);
                  setPricingTiers(vendor.pricingTiers || []);
                  setMoq(String(vendor.moq || ''));
                  setIsDropship(vendor.supportsDropShipping === true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-xl text-sm transition-all"
              >
                <X className="w-4 h-4" />
                Cancel
              </motion.button>
            )}
            {isEditing && hasChanges && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setIsEditing(false);
                  setHasChanges(false);
                  setPricingTiers(vendor.pricingTiers || []);
                  setMoq(String(vendor.moq || ''));
                  setIsDropship(vendor.supportsDropShipping === true);
                }}
                className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-xl text-sm transition-all"
              >
                <X className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5 overflow-y-auto flex-1">
        {/* Dropship Info Banner */}
        {isDropship && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-3">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Truck className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-800">Dropship Vendor</p>
              <p className="text-[11px] text-emerald-600 mt-0.5">Ships directly from US warehouse. No duties/DDP required. Pricing reflects direct-ship cost.</p>
            </div>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-50 rounded-xl p-3 text-center">
            <Package className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <div className="text-xs text-slate-500 mb-1">MOQ</div>
            {isEditing || hasChanges ? (
              <input
                type="text"
                value={moq}
                onChange={(e) => { setMoq(parseQty(e.target.value)); setHasChanges(true); }}
                className="w-full text-center text-sm font-bold text-slate-900 bg-white border border-slate-200 hover:border-blue-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-lg px-2 py-1.5"
                placeholder="Set MOQ"
              />
            ) : (
              <div className="text-sm font-bold text-slate-900">{moq ? formatQty(moq) : '—'}</div>
            )}
          </div>
          <div className="bg-slate-50 rounded-xl p-3 text-center">
            <DollarSign className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <div className="text-xs text-slate-500 mb-1">{isDropship ? 'Best Price' : 'Best FOB'}</div>
            <div className="text-sm font-bold text-slate-900">{bestFob !== null ? formatCurrency(bestFob) : '—'}</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 text-center">
            {isDropship
              ? <Truck className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
              : <Clock className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            }
            <div className="text-xs text-slate-500 mb-1">{isDropship ? 'Dropship Days' : 'Lead Time'}</div>
            <div className="text-sm font-bold text-slate-900">{bestLeadTime !== null ? `${bestLeadTime} days` : '—'}</div>
          </div>
        </div>

        {/* Contact Info */}
        {vendor.contact && (vendor.contact.name || vendor.contact.email || vendor.contact.phone) && (
          <div className="bg-slate-50 rounded-xl p-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Contact</h4>
            <div className="space-y-1.5">
              {vendor.contact.name && (
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="font-medium">{vendor.contact.name}</span>
                </div>
              )}
              {vendor.contact.email && (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {vendor.contact.email}
                </div>
              )}
              {vendor.contact.phone && (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {vendor.contact.phone}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pricing Table */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-slate-900">Pricing Tiers</h4>
            <div className="flex items-center gap-3">
              {/* Dropship Toggle */}
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium ${isDropship ? 'text-emerald-600' : 'text-slate-400'}`}>Dropship</span>
                <button
                  onClick={() => {
                    if (!isEditing && !hasChanges) return;
                    setIsDropship(!isDropship);
                    setHasChanges(true);
                  }}
                  disabled={!isEditing && !hasChanges}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                    !isEditing && !hasChanges ? 'opacity-60 cursor-not-allowed' : ''
                  } ${isDropship ? 'bg-emerald-500 focus:ring-emerald-300' : 'bg-slate-300 focus:ring-slate-300'}`}
                >
                  <motion.span
                    layout
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm ${isDropship ? 'translate-x-[18px]' : 'translate-x-[3px]'}`}
                  />
                </button>
              </div>
              <div className="w-px h-5 bg-slate-200" />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={addTier}
                disabled={!isEditing && !hasChanges}
                className={`flex items-center gap-1.5 px-3 py-1.5 font-semibold rounded-lg text-xs transition-colors ${
                  !isEditing && !hasChanges ? 'opacity-50 cursor-not-allowed' : ''
                } bg-slate-100 hover:bg-slate-200 text-slate-700`}
              >
                <Plus className="w-3.5 h-3.5" />
                Add Tier
              </motion.button>
            </div>
          </div>

          {isDropship && (
            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg mb-3">
              <Truck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <p className="text-xs text-emerald-700">
                <span className="font-semibold">Dropship vendor</span> — DDP and Ship Method columns are hidden. Lead times shown as Dropship Days.
              </p>
            </div>
          )}

          {pricingTiers.length === 0 ? (
            <div className="bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 p-8 text-center">
              <DollarSign className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-500 mb-1">No Pricing Tiers</p>
              <p className="text-xs text-slate-400 mb-3">Add quantity-based pricing tiers for this vendor</p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setIsEditing(true); addTier(); }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-white font-medium rounded-lg text-sm bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add First Tier
              </motion.button>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="overflow-y-auto max-h-[340px]">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className={`text-left px-3 py-2.5 text-[11px] font-bold text-slate-500 uppercase ${isDropship ? 'w-[20%]' : 'w-[12%]'}`}>Qty</th>
                      {!isDropship && (
                        <th className="text-left px-3 py-2.5 text-[11px] font-bold text-slate-500 uppercase w-[14%]">EXW ($)</th>
                      )}
                      <th className={`text-left px-3 py-2.5 text-[11px] font-bold text-slate-500 uppercase ${isDropship ? 'w-[30%]' : 'w-[14%]'}`}>
                        {isDropship ? 'Price ($)' : 'FOB ($)'}
                      </th>
                      {!isDropship && (
                        <>
                          <th className="text-left px-3 py-2.5 text-[11px] font-bold text-slate-500 uppercase w-[14%]">DDP ($)</th>
                          <th className="text-center px-3 py-2.5 text-[11px] font-bold text-slate-500 uppercase w-[16%]">Ship</th>
                        </>
                      )}
                      <th className={`text-left px-3 py-2.5 text-[11px] font-bold text-slate-500 uppercase ${isDropship ? 'w-[30%]' : 'w-[12%]'}`}>
                        {isDropship ? 'Dropship Days' : 'Days'}
                      </th>
                      <th className="px-2 py-2.5 w-[36px]"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {pricingTiers.map((tier, index) => (
                        <motion.tr
                          key={index}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0, height: 0 }}
                          className="border-b border-slate-100 last:border-0 group hover:bg-slate-50/50"
                        >
                          <td className="px-3 py-1.5">
                            {isEditing || hasChanges ? (
                              <input
                                type="text"
                                value={tier.quantity}
                                onChange={(e) => updateTier(index, 'quantity', parseQty(e.target.value))}
                                className="w-full px-2 py-1.5 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-md text-sm font-semibold text-slate-900 focus:outline-none transition-all"
                              />
                            ) : (
                              <span className="px-2 py-1.5 text-sm font-semibold text-slate-900">{formatQty(tier.quantity)}</span>
                            )}
                          </td>
                          {!isDropship && (
                            <td className="px-3 py-1.5">
                              {isEditing || hasChanges ? (
                                <input
                                  type="text"
                                  value={tier.exwPrice}
                                  onChange={(e) => updateTier(index, 'exwPrice', parseCurrency(e.target.value))}
                                  onBlur={() => { const n = Number(tier.exwPrice); if (!isNaN(n)) updateTier(index, 'exwPrice', n.toFixed(2)); }}
                                  className="w-full px-2 py-1.5 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-md text-sm text-slate-900 font-medium focus:outline-none transition-all"
                                />
                              ) : (
                                <span className="px-2 py-1.5 text-sm text-slate-900 font-medium">{formatCurrency(tier.exwPrice)}</span>
                              )}
                            </td>
                          )}
                          <td className="px-3 py-1.5">
                            {isEditing || hasChanges ? (
                              <input
                                type="text"
                                value={tier.fobPrice}
                                onChange={(e) => updateTier(index, 'fobPrice', parseCurrency(e.target.value))}
                                onBlur={() => { const n = Number(tier.fobPrice); if (!isNaN(n)) updateTier(index, 'fobPrice', n.toFixed(2)); }}
                                className="w-full px-2 py-1.5 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-md text-sm text-slate-900 font-medium focus:outline-none transition-all"
                              />
                            ) : (
                              <span className="px-2 py-1.5 text-sm text-slate-900 font-medium">{formatCurrency(tier.fobPrice)}</span>
                            )}
                          </td>
                          {!isDropship && (
                            <>
                              <td className="px-3 py-1.5">
                                {isEditing || hasChanges ? (
                                  <input
                                    type="text"
                                    value={tier.ddpPrice}
                                    onChange={(e) => updateTier(index, 'ddpPrice', parseCurrency(e.target.value))}
                                    onBlur={() => { const n = Number(tier.ddpPrice); if (!isNaN(n)) updateTier(index, 'ddpPrice', n.toFixed(2)); }}
                                    className="w-full px-2 py-1.5 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-md text-sm text-slate-900 font-medium focus:outline-none transition-all"
                                  />
                                ) : (
                                  <span className="px-2 py-1.5 text-sm text-slate-900 font-medium">{formatCurrency(tier.ddpPrice)}</span>
                                )}
                              </td>
                              <td className="px-3 py-1.5">
                                {isEditing || hasChanges ? (
                                  <select
                                    value={tier.ddpMethod}
                                    onChange={(e) => updateTier(index, 'ddpMethod', e.target.value)}
                                    className="w-full px-2 py-1.5 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-md text-sm text-slate-600 font-medium focus:outline-none transition-all text-center cursor-pointer"
                                  >
                                    {DDP_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                                  </select>
                                ) : (
                                  <span className="px-2 py-1.5 text-sm text-slate-600 font-medium flex justify-center">{tier.ddpMethod}</span>
                                )}
                              </td>
                            </>
                          )}
                          <td className="px-3 py-1.5">
                            {isEditing || hasChanges ? (
                              <input
                                type="text"
                                value={tier.leadTime}
                                onChange={(e) => updateTier(index, 'leadTime', parseQty(e.target.value))}
                                className={`w-full px-2 py-1.5 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-md text-sm font-medium focus:outline-none transition-all ${isDropship ? 'text-emerald-600' : 'text-slate-600'}`}
                              />
                            ) : (
                              <span className={`px-2 py-1.5 text-sm font-medium ${isDropship ? 'text-emerald-600' : 'text-slate-600'}`}>{tier.leadTime}</span>
                            )}
                          </td>
                          <td className="px-2 py-1.5">
                            {(isEditing || hasChanges) && (
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => removeTier(index)}
                                className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </motion.button>
                            )}
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
