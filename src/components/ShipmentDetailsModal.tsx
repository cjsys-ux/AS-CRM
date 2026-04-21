import { motion, AnimatePresence } from 'motion/react';
import { X, Package, MapPin, Truck, DollarSign, Weight, Ruler, FileText, Clock, Tag, ArrowLeft, ChevronRight, CheckCircle, Circle, AlertCircle, Boxes } from 'lucide-react';
import { useState } from 'react';

interface ShipmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shipment: any;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Delivered': return 'bg-green-100 text-green-700 border-green-200';
    case 'In Transit': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'Out For Delivery': return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'Processing': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'Delayed': return 'bg-red-100 text-red-700 border-red-200';
    case 'Cancelled': return 'bg-slate-100 text-slate-700 border-slate-200';
    default: return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

const getTimelineIcon = (step: string, isActive: boolean, isComplete: boolean) => {
  if (isComplete) return <CheckCircle className="w-5 h-5 text-emerald-500" />;
  if (isActive) return <div className="w-5 h-5 rounded-full border-2 border-emerald-500 bg-emerald-100 flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-emerald-500" /></div>;
  return <Circle className="w-5 h-5 text-slate-300" />;
};

// Build a timeline from the shipment status
function buildTimeline(shipment: any) {
  const statusOrder = ['Processing', 'In Transit', 'Out For Delivery', 'Delivered'];
  const currentIdx = statusOrder.indexOf(shipment.status);

  const steps = [
    { label: 'Order Processed', sublabel: 'Shipment created and label generated', status: 'Processing', date: shipment.createdAt || shipment.shipDate || '' },
    { label: 'Picked Up / In Transit', sublabel: 'Package picked up by carrier', status: 'In Transit', date: shipment.shipDate || '' },
    { label: 'Out for Delivery', sublabel: 'Package is on the delivery vehicle', status: 'Out For Delivery', date: '' },
    { label: 'Delivered', sublabel: 'Package delivered to recipient', status: 'Delivered', date: shipment.deliveredDate || '' },
  ];

  return steps.map((step, idx) => ({
    ...step,
    isComplete: idx < currentIdx,
    isActive: idx === currentIdx,
    isFuture: idx > currentIdx,
  }));
}

type TabId = 'details' | 'tracking' | 'financial';

export function ShipmentDetailsModal({ isOpen, onClose, shipment }: ShipmentDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>('details');

  if (!shipment) return null;

  const timeline = buildTimeline(shipment);

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'details', label: 'Details', icon: <Package className="w-4 h-4" /> },
    { id: 'tracking', label: 'Tracking Timeline', icon: <Truck className="w-4 h-4" /> },
    { id: 'financial', label: 'Financial', icon: <DollarSign className="w-4 h-4" /> },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-y-0 right-0 left-0 lg:left-72 bg-white z-30 flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="bg-emerald-600 px-8 py-5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Shipment Details</h2>
                <p className="text-emerald-100 text-sm flex items-center gap-2">
                  {shipment.masterTracking || shipment.trackingNumber}
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${getStatusColor(shipment.status)}`}>
                    {shipment.status}
                  </span>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-lg hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Bar */}
          <div className="bg-white border-b border-slate-200 px-8 shrink-0">
            <div className="flex items-center gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
                    activeTab === tab.id
                      ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto bg-slate-50 p-8">
            <div className="max-w-[1400px] mx-auto">
              <AnimatePresence mode="wait">
                {/* ═══ Details Tab ═══ */}
                {activeTab === 'details' && (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {/* Basic Information */}
                    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                      <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                          <Package className="w-4 h-4 text-white" />
                        </div>
                        Identification
                      </h4>
                      <div className="space-y-3">
                        <InfoRow label="Tracking Number" value={shipment.masterTracking || shipment.trackingNumber} />
                        {shipment.poNumber && <InfoRow label="PO Number" value={shipment.poNumber} />}
                        {shipment.orderNumber && <InfoRow label="Order Number" value={shipment.orderNumber} />}
                        {shipment.referenceNumber && <InfoRow label="Reference #" value={shipment.referenceNumber} />}
                        {shipment.shipmentType && <InfoRow label="Shipment Type" value={shipment.shipmentType} />}
                      </div>
                    </div>

                    {/* Customer & Project */}
                    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                      <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                          <FileText className="w-4 h-4 text-white" />
                        </div>
                        Customer & Project
                      </h4>
                      <div className="space-y-3">
                        <InfoRow label="Customer" value={shipment.customer} />
                        <InfoRow label="Project" value={shipment.project || shipment.projectName} />
                        {(shipment.projectNumber || shipment.projectSubtext) && (
                          <InfoRow label="Project #" value={shipment.projectNumber || shipment.projectSubtext} />
                        )}
                        <InfoRow label="Item Name" value={shipment.itemName} />
                        <InfoRow label="Quantity" value={shipment.quantity ? `${shipment.quantity} units` : '—'} />
                      </div>
                    </div>

                    {/* Carrier Information */}
                    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                      <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                          <Truck className="w-4 h-4 text-white" />
                        </div>
                        Carrier & Service
                      </h4>
                      <div className="space-y-3">
                        <InfoRow label="Carrier" value={shipment.carrier} />
                        <InfoRow label="Service Level" value={shipment.serviceLevel} />
                        <div>
                          <p className="text-xs font-semibold text-slate-500 mb-1">Status</p>
                          <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold border ${getStatusColor(shipment.status)}`}>
                            {shipment.status}
                          </span>
                        </div>
                        <InfoRow label="Ship Date" value={shipment.shipDate} />
                        <InfoRow label="Est. Delivery" value={shipment.estDelivery || shipment.estimatedDelivery} />
                      </div>
                    </div>

                    {/* Origin & Destination */}
                    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm md:col-span-2">
                      <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-white" />
                        </div>
                        Origin & Destination
                      </h4>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">From</p>
                          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                            <p className="text-sm font-medium text-slate-900">{shipment.originAddress || shipment.origin || '—'}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">To</p>
                          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                            <p className="text-sm font-medium text-slate-900">{shipment.destination || '—'}</p>
                            {shipment.destinationAddress && (
                              <p className="text-sm text-slate-600 mt-1">{shipment.destinationAddress}</p>
                            )}
                            {(shipment.destinationCity || shipment.destinationState) && (
                              <p className="text-sm text-slate-600">
                                {[shipment.destinationCity, shipment.destinationState, shipment.destinationZip].filter(Boolean).join(', ')}
                              </p>
                            )}
                            {shipment.contact && (
                              <p className="text-xs text-blue-600 font-medium mt-2">Contact: {shipment.contact}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Package Details */}
                    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                      <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center">
                          <Boxes className="w-4 h-4 text-white" />
                        </div>
                        Package
                      </h4>
                      <div className="space-y-3">
                        <InfoRow label="Package Type" value={shipment.packageType} />
                        <InfoRow label="Weight" value={shipment.weight} icon={<Weight className="w-3 h-3" />} />
                        <InfoRow label="Dimensions" value={shipment.dimensions} icon={<Ruler className="w-3 h-3" />} />
                        {shipment.numberOfCases && <InfoRow label="Number of Cases" value={String(shipment.numberOfCases)} />}
                      </div>
                    </div>

                    {/* Child Trackings */}
                    {shipment.childTrackings && shipment.childTrackings.length > 0 && (
                      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm md:col-span-2 lg:col-span-3">
                        <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                            <Tag className="w-4 h-4 text-white" />
                          </div>
                          Package Tracking ({shipment.childTrackings.length} packages)
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {shipment.childTrackings.map((child: any, index: number) => (
                            <div key={index} className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex items-center gap-3">
                              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                                <span className="text-sm font-bold text-indigo-600">#{index + 1}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-900 truncate">{child.trackingNumber}</p>
                                <p className="text-xs text-slate-500">Ship: {child.shipDate || '—'} &middot; ETA: {child.estDelivery || '—'}</p>
                              </div>
                              <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${getStatusColor(child.status)}`}>
                                {child.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Special Instructions */}
                    {shipment.specialInstructions && (
                      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm lg:col-span-3">
                        <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                            <FileText className="w-4 h-4 text-white" />
                          </div>
                          Special Instructions
                        </h4>
                        <p className="text-sm text-slate-700 leading-relaxed bg-amber-50 rounded-lg p-4 border border-amber-100">
                          {shipment.specialInstructions}
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* ═══ Tracking Timeline Tab ═══ */}
                {activeTab === 'tracking' && (
                  <motion.div
                    key="tracking"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <div className="max-w-2xl mx-auto">
                      {/* Status Summary */}
                      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm mb-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-bold text-slate-900">Package Journey</h4>
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-bold border ${getStatusColor(shipment.status)}`}>
                            {shipment.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <span><strong>Carrier:</strong> {shipment.carrier}</span>
                          {shipment.serviceLevel && <span><strong>Service:</strong> {shipment.serviceLevel}</span>}
                          {shipment.shipDate && <span><strong>Shipped:</strong> {shipment.shipDate}</span>}
                          {(shipment.estDelivery || shipment.estimatedDelivery) && (
                            <span><strong>ETA:</strong> {shipment.estDelivery || shipment.estimatedDelivery}</span>
                          )}
                        </div>
                      </div>

                      {/* Timeline */}
                      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm mb-6">
                        <h4 className="text-base font-bold text-slate-900 mb-6">Tracking Timeline</h4>
                        <div className="space-y-0">
                          {timeline.map((step, idx) => (
                            <div key={idx} className="flex gap-4">
                              <div className="flex flex-col items-center">
                                {getTimelineIcon(step.status, step.isActive, step.isComplete)}
                                {idx < timeline.length - 1 && (
                                  <div className={`w-0.5 flex-1 my-1 ${step.isComplete ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                                )}
                              </div>
                              <div className={`pb-6 flex-1 ${step.isFuture ? 'opacity-40' : ''}`}>
                                <p className={`text-sm font-bold ${step.isActive ? 'text-emerald-700' : step.isComplete ? 'text-slate-900' : 'text-slate-400'}`}>
                                  {step.label}
                                </p>
                                <p className="text-xs text-slate-500 mt-0.5">{step.sublabel}</p>
                                {step.date && (
                                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {step.date}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* EDI / Carrier Integration Placeholder */}
                      <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <Truck className="w-8 h-8 text-slate-400" />
                        </div>
                        <h4 className="text-base font-bold text-slate-700 mb-2">EDI Carrier Feed</h4>
                        <p className="text-sm text-slate-500 max-w-md mx-auto">
                          Once EDI integration is configured with the carrier, real-time tracking milestones, scan events, 
                          and exception alerts will appear here automatically.
                        </p>
                        <div className="mt-4 flex items-center justify-center gap-2">
                          <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                          <span className="text-xs font-medium text-amber-600">Awaiting EDI connection</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ═══ Financial Tab ═══ */}
                {activeTab === 'financial' && (
                  <motion.div
                    key="financial"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <div className="max-w-3xl mx-auto">
                      {/* Summary Cards */}
                      <div className="grid grid-cols-3 gap-6 mb-6">
                        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Shipping Cost</p>
                          <p className="text-2xl font-bold text-slate-900">{shipment.shippingCost || '—'}</p>
                          <p className="text-xs text-slate-500 mt-1">Carrier charge</p>
                        </div>
                        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Declared Value</p>
                          <p className="text-2xl font-bold text-slate-900">{shipment.declaredValue || '—'}</p>
                          <p className="text-xs text-slate-500 mt-1">Goods value for customs</p>
                        </div>
                        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Insurance</p>
                          <p className="text-2xl font-bold text-slate-900">{shipment.insuranceAmount || '—'}</p>
                          <p className="text-xs text-slate-500 mt-1">Coverage amount</p>
                        </div>
                      </div>

                      {/* Cost Breakdown */}
                      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                          <h4 className="text-base font-bold text-slate-900">Cost Breakdown</h4>
                        </div>
                        <div className="p-6">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-slate-100">
                                <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider py-3">Description</th>
                                <th className="text-right text-xs font-bold text-slate-500 uppercase tracking-wider py-3">Amount</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-b border-slate-50">
                                <td className="py-3 text-sm text-slate-700">Base Shipping Rate ({shipment.carrier} {shipment.serviceLevel})</td>
                                <td className="py-3 text-sm font-semibold text-slate-900 text-right">{shipment.shippingCost || '$0.00'}</td>
                              </tr>
                              <tr className="border-b border-slate-50">
                                <td className="py-3 text-sm text-slate-700">Fuel Surcharge</td>
                                <td className="py-3 text-sm text-slate-400 text-right">—</td>
                              </tr>
                              <tr className="border-b border-slate-50">
                                <td className="py-3 text-sm text-slate-700">Insurance Premium</td>
                                <td className="py-3 text-sm font-semibold text-slate-900 text-right">{shipment.insuranceAmount || '$0.00'}</td>
                              </tr>
                              <tr className="border-b border-slate-50">
                                <td className="py-3 text-sm text-slate-700">Residential Surcharge</td>
                                <td className="py-3 text-sm text-slate-400 text-right">—</td>
                              </tr>
                              <tr className="border-b border-slate-50">
                                <td className="py-3 text-sm text-slate-700">Accessorial Charges</td>
                                <td className="py-3 text-sm text-slate-400 text-right">—</td>
                              </tr>
                            </tbody>
                            <tfoot>
                              <tr className="border-t-2 border-slate-200">
                                <td className="py-4 text-sm font-bold text-slate-900">Total</td>
                                <td className="py-4 text-lg font-bold text-emerald-600 text-right">{shipment.shippingCost || '$0.00'}</td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>

                      {/* Note about editable financial */}
                      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-blue-900">Financial data is editable from the Edit Shipment drawer</p>
                          <p className="text-xs text-blue-700 mt-0.5">
                            Click the pencil icon on the shipment row to update shipping costs, declared values, and insurance amounts. 
                            Fuel surcharges and accessorial charges will be populated automatically once carrier EDI billing is connected.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Reusable info row
function InfoRow({ label, value, icon }: { label: string; value?: string | null; icon?: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-500 mb-0.5 flex items-center gap-1">
        {icon}
        {label}
      </p>
      <p className="text-sm font-medium text-slate-900">{value || '—'}</p>
    </div>
  );
}