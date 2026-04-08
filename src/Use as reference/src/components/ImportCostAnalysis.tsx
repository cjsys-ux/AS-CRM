import { motion, AnimatePresence } from 'motion/react';
import { Ship, TrendingDown, TrendingUp, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, DollarSign, Anchor, ArrowRight } from 'lucide-react';
import { useState, useMemo } from 'react';

interface PricingTier {
  quantity: number | string;
  exwPrice: number | string;
  fobPrice: number | string;
  ddpPrice: number | string;
  ddpMethod: string;
  leadTime: number | string;
}

interface ImportCostAnalysisProps {
  pricingTiers: PricingTier[];
  htsBaseRate: string;
  htsSection301: boolean;
  vendorName: string;
}

export function ImportCostAnalysis({ pricingTiers, htsBaseRate, htsSection301, vendorName }: ImportCostAnalysisProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [shippingCosts, setShippingCosts] = useState<Record<number, string>>({});
  const [selectedBasis, setSelectedBasis] = useState<'fob' | 'exw'>('fob');

  const totalDutyRate = useMemo(() => {
    const base = parseFloat(htsBaseRate) || 0;
    return htsSection301 ? base + 25 : base;
  }, [htsBaseRate, htsSection301]);

  const hasDutyRate = !!htsBaseRate && parseFloat(htsBaseRate) > 0;

  const analysis = useMemo(() => {
    return pricingTiers.map((tier, index) => {
      const qty = Number(tier.quantity) || 0;
      const exw = Number(tier.exwPrice) || 0;
      const fob = Number(tier.fobPrice) || 0;
      const ddp = Number(tier.ddpPrice) || 0;
      const basisPrice = selectedBasis === 'fob' ? fob : exw;
      const shippingPerUnit = parseFloat(shippingCosts[index] || '0') || 0;
      const dutyPerUnit = basisPrice * (totalDutyRate / 100);
      const selfImportLanded = basisPrice + dutyPerUnit + shippingPerUnit;
      const savings = ddp - selfImportLanded;
      const savingsPercent = ddp > 0 ? (savings / ddp) * 100 : 0;
      const recommendation: 'self-import' | 'ddp' | 'no-data' =
        ddp <= 0 || basisPrice <= 0 ? 'no-data' :
        savings > 0 ? 'self-import' : 'ddp';

      return {
        qty,
        exw,
        fob,
        ddp,
        basisPrice,
        dutyPerUnit,
        shippingPerUnit,
        selfImportLanded,
        savings,
        savingsPercent,
        recommendation,
        method: tier.ddpMethod,
        leadTime: Number(tier.leadTime) || 0,
      };
    });
  }, [pricingTiers, totalDutyRate, shippingCosts, selectedBasis]);

  const validTiers = analysis.filter(a => a.basisPrice > 0 && a.ddp > 0);
  const bestSaving = validTiers.length > 0
    ? validTiers.reduce((best, curr) => curr.savings > best.savings ? curr : best, validTiers[0])
    : null;

  if (pricingTiers.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4"
    >
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-800 to-slate-700 text-white hover:from-slate-700 hover:to-slate-600 transition-all"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-white/15 rounded-lg flex items-center justify-center">
              <Anchor className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold">Import Cost Analysis</div>
              <div className="text-[10px] text-slate-300">Compare self-import vs vendor DDP landed cost</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {bestSaving && bestSaving.savings > 0 && (
              <span className="text-[10px] font-bold bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full">
                Save up to ${bestSaving.savings.toFixed(2)}/unit
              </span>
            )}
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="overflow-hidden"
            >
              <div className="p-4 space-y-3">
                {/* Duty Rate Summary & Controls */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 border border-slate-200">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase">Total Duty</span>
                    {hasDutyRate ? (
                      <span className="text-sm font-bold text-slate-900">{totalDutyRate.toFixed(1)}%</span>
                    ) : (
                      <span className="text-sm text-amber-600 font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Not set
                      </span>
                    )}
                  </div>
                  {htsSection301 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-[9px] font-bold bg-red-100 text-red-700 border border-red-200">
                      SECTION 301 (+25%)
                    </span>
                  )}
                  <div className="ml-auto flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
                    <button
                      onClick={() => setSelectedBasis('fob')}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                        selectedBasis === 'fob'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      FOB Basis
                    </button>
                    <button
                      onClick={() => setSelectedBasis('exw')}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                        selectedBasis === 'exw'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      EXW Basis
                    </button>
                  </div>
                </div>

                {/* Analysis Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="text-left px-2 py-2 text-[10px] font-bold text-slate-500 uppercase">Qty</th>
                        <th className="text-left px-2 py-2 text-[10px] font-bold text-slate-500 uppercase">{selectedBasis.toUpperCase()}</th>
                        <th className="text-left px-2 py-2 text-[10px] font-bold text-slate-500 uppercase">Duty/Unit</th>
                        <th className="text-left px-2 py-2 text-[10px] font-bold text-slate-500 uppercase w-[90px]">
                          <div className="flex flex-col">
                            <span>Ship/Unit</span>
                            <span className="text-[8px] font-normal text-slate-400 normal-case">editable</span>
                          </div>
                        </th>
                        <th className="text-left px-2 py-2 text-[10px] font-bold text-blue-600 uppercase bg-blue-50/50">Self-Import</th>
                        <th className="text-left px-2 py-2 text-[10px] font-bold text-slate-500 uppercase">Vendor DDP</th>
                        <th className="text-left px-2 py-2 text-[10px] font-bold text-slate-500 uppercase">Ship Method</th>
                        <th className="text-center px-2 py-2 text-[10px] font-bold text-slate-500 uppercase">Savings</th>
                        <th className="text-center px-2 py-2 text-[10px] font-bold text-slate-500 uppercase">Verdict</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.map((row, index) => (
                        <motion.tr
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.04 }}
                          className={`border-b border-slate-100 hover:bg-slate-50/50 transition-colors ${
                            row.recommendation === 'self-import' ? 'bg-green-50/30' : ''
                          }`}
                        >
                          <td className="px-2 py-2 text-sm font-medium text-slate-900">
                            {Number(row.qty).toLocaleString()}
                          </td>
                          <td className="px-2 py-2 text-sm font-medium text-slate-900">
                            ${row.basisPrice.toFixed(2)}
                          </td>
                          <td className="px-2 py-2 text-sm font-medium text-slate-700">
                            {hasDutyRate ? `$${row.dutyPerUnit.toFixed(2)}` : '—'}
                          </td>
                          <td className="px-2 py-2">
                            <div className="relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-slate-400">$</span>
                              <input
                                type="text"
                                inputMode="decimal"
                                value={shippingCosts[index] || ''}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/[^0-9.]/g, '');
                                  setShippingCosts(prev => ({ ...prev, [index]: val }));
                                }}
                                placeholder="0.00"
                                className="w-full pl-5 pr-1 py-1 rounded-md border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-sm text-slate-900 font-medium focus:outline-none transition-all bg-white"
                              />
                            </div>
                          </td>
                          <td className="px-2 py-2 bg-blue-50/30">
                            <span className="text-sm font-bold text-blue-700">
                              ${row.selfImportLanded.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-2 py-2 text-sm font-medium text-slate-900">
                            {row.ddp > 0 ? `$${row.ddp.toFixed(2)}` : '—'}
                          </td>
                          <td className="px-2 py-2 text-xs text-slate-600">
                            {row.method || '—'}
                          </td>
                          <td className="px-2 py-2 text-center">
                            {row.recommendation === 'no-data' ? (
                              <span className="text-xs text-slate-400">—</span>
                            ) : row.savings > 0 ? (
                              <span className="text-sm font-bold text-green-600">
                                +${row.savings.toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-sm font-bold text-red-500">
                                -${Math.abs(row.savings).toFixed(2)}
                              </span>
                            )}
                          </td>
                          <td className="px-2 py-2 text-center">
                            {row.recommendation === 'no-data' ? (
                              <span className="text-[10px] text-slate-400">N/A</span>
                            ) : row.recommendation === 'self-import' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 border border-green-200">
                                <CheckCircle className="w-3 h-3" />
                                Self-Import
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
                                <Ship className="w-3 h-3" />
                                Use DDP
                              </span>
                            )}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Summary Cards */}
                {validTiers.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                    {/* Best self-import opportunity */}
                    {bestSaving && bestSaving.savings > 0 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200"
                      >
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <TrendingDown className="w-3.5 h-3.5 text-green-600" />
                          <span className="text-[10px] font-bold text-green-700 uppercase">Best Savings</span>
                        </div>
                        <div className="text-lg font-bold text-green-700">${bestSaving.savings.toFixed(2)}<span className="text-xs font-medium text-green-600">/unit</span></div>
                        <div className="text-[10px] text-green-600 mt-0.5">
                          at {bestSaving.qty.toLocaleString()} units · {bestSaving.savingsPercent.toFixed(1)}% cheaper
                        </div>
                        <div className="text-[10px] text-green-600 mt-0.5">
                          Total savings: <span className="font-bold">${(bestSaving.savings * bestSaving.qty).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                      </motion.div>
                    )}

                    {/* Cost Breakdown for best tier */}
                    {bestSaving && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.05 }}
                        className="bg-slate-50 rounded-lg p-3 border border-slate-200"
                      >
                        <div className="text-[10px] font-bold text-slate-500 uppercase mb-1.5">Cost Breakdown ({bestSaving.qty.toLocaleString()} units)</div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500">{selectedBasis.toUpperCase()} Price</span>
                            <span className="font-semibold text-slate-900">${bestSaving.basisPrice.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Duty ({totalDutyRate.toFixed(1)}%)</span>
                            <span className="font-semibold text-slate-900">${bestSaving.dutyPerUnit.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Shipping</span>
                            <span className="font-semibold text-slate-900">${bestSaving.shippingPerUnit.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-xs border-t border-slate-200 pt-1">
                            <span className="font-semibold text-slate-700">Landed Cost</span>
                            <span className="font-bold text-blue-700">${bestSaving.selfImportLanded.toFixed(2)}</span>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Recommendation */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 }}
                      className="bg-slate-50 rounded-lg p-3 border border-slate-200"
                    >
                      <div className="text-[10px] font-bold text-slate-500 uppercase mb-1.5">Recommendation</div>
                      {bestSaving && bestSaving.savings > 0 ? (
                        <>
                          <div className="flex items-center gap-1.5 mb-1">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-bold text-green-700">Be Importer of Record</span>
                          </div>
                          <p className="text-[10px] text-slate-500 leading-relaxed">
                            Self-importing at {selectedBasis.toUpperCase()} is cheaper than {vendorName}'s DDP pricing. Activate Swag should act as importer of record.
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-1.5 mb-1">
                            <Ship className="w-4 h-4 text-amber-600" />
                            <span className="text-sm font-bold text-amber-700">Use Vendor DDP</span>
                          </div>
                          <p className="text-[10px] text-slate-500 leading-relaxed">
                            {vendorName}'s DDP pricing is currently more cost-effective. Enter shipping costs to refine the analysis.
                          </p>
                        </>
                      )}
                    </motion.div>
                  </div>
                )}

                {!hasDutyRate && (
                  <div className="flex items-center gap-2 bg-amber-50 rounded-lg px-3 py-2 border border-amber-200">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                    <p className="text-xs text-amber-700">
                      Set the HTS Duty Rate in the Internal Information section above for accurate import cost calculations.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
