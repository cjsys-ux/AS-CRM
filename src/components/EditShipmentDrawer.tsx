import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { X, Truck, Package, MapPin, Calendar, FileText, Boxes, Lock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { DatePicker } from './DatePicker';
import { QuantityStepper } from './QuantityStepper';

// ─── Carrier → Service Level Mapping ───
const SERVICE_LEVELS_BY_CARRIER: Record<string, string[]> = {
  'UPS': ['UPS Ground', 'UPS 2nd Day Air', 'UPS 2nd Day Air A.M.', 'UPS 3 Day Select', 'UPS Next Day Air', 'UPS Next Day Air Saver', 'UPS Next Day Air Early', 'UPS SurePost', 'UPS Worldwide Express', 'UPS Worldwide Expedited'],
  'FedEx': ['FedEx Ground', 'FedEx Home Delivery', 'FedEx Express Saver', 'FedEx 2Day', 'FedEx 2Day A.M.', 'FedEx Standard Overnight', 'FedEx Priority Overnight', 'FedEx First Overnight', 'FedEx SmartPost', 'FedEx International Priority'],
  'FedEx Express': ['FedEx Express Saver', 'FedEx 2Day', 'FedEx 2Day A.M.', 'FedEx Standard Overnight', 'FedEx Priority Overnight', 'FedEx First Overnight', 'FedEx International Priority', 'FedEx International Economy'],
  'USPS': ['USPS Ground Advantage', 'USPS Priority Mail', 'USPS Priority Mail Express', 'USPS First-Class Mail', 'USPS Media Mail', 'USPS Parcel Select'],
  'DHL': ['DHL Express Worldwide', 'DHL Express 12:00', 'DHL Express 9:00', 'DHL Economy Select', 'DHL Europack', 'DHL Freight'],
  'DHL Express': ['DHL Express Worldwide', 'DHL Express 12:00', 'DHL Express 9:00', 'DHL Express Envelope', 'DHL Import Express'],
  'UPS Air': ['UPS Next Day Air', 'UPS Next Day Air Saver', 'UPS Next Day Air Early', 'UPS 2nd Day Air', 'UPS Worldwide Express', 'UPS Worldwide Express Plus'],
  'XPO Logistics': ['LTL Standard', 'LTL Guaranteed', 'LTL Express', 'LTL Economy'],
  'Estes Express': ['LTL Standard', 'LTL Guaranteed', 'LTL Time-Critical', 'LTL Economy'],
  'Old Dominion': ['OD Priority', 'OD Expedited', 'OD Economy', 'OD Global'],
  'SAIA': ['SAIA Standard', 'SAIA Guaranteed Select', 'SAIA Xtreme Guarantee', 'SAIA Regional'],
  'R+L Carriers': ['Standard LTL', 'Guaranteed LTL', 'Expedited', 'Volume'],
  'J.B. Hunt': ['Intermodal', 'Dedicated', 'Truckload', 'Final Mile'],
  'Schneider': ['Intermodal', 'Dedicated', 'Truckload', 'Expedited'],
};

const ALL_CARRIERS = [
  'UPS', 'FedEx', 'FedEx Express', 'USPS', 'DHL', 'DHL Express', 'UPS Air',
  'XPO Logistics', 'Estes Express', 'Old Dominion', 'SAIA', 'R+L Carriers',
  'J.B. Hunt', 'Schneider', 'Other',
];

interface EditShipmentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  shipment: any;
  onSave?: () => void;
}

export function EditShipmentDrawer({ isOpen, onClose, shipment, onSave }: EditShipmentDrawerProps) {
  const [formData, setFormData] = useState({
    masterTracking: '',
    poNumber: '',
    orderNumber: '',
    customer: '',
    quantity: '',
    itemName: '',
    project: '',
    projectNumber: '',
    carrier: '',
    serviceLevel: '',
    status: '',
    shipDate: '',
    estDelivery: '',
    originAddress: '',
    destination: '',
    destinationAddress: '',
    destinationCity: '',
    destinationState: '',
    destinationZip: '',
    contact: '',
    weight: '',
    dimensions: '',
    packageType: '',
    referenceNumber: '',
    specialInstructions: '',
    shippingCost: '',
    declaredValue: '',
    insuranceAmount: '',
  });
  const [saving, setSaving] = useState(false);

  // Populate form from the actual shipment data
  useEffect(() => {
    if (shipment) {
      setFormData({
        masterTracking: shipment.masterTracking || shipment.trackingNumber || '',
        poNumber: shipment.poNumber || '',
        orderNumber: shipment.orderNumber || '',
        customer: shipment.customer || '',
        quantity: String(shipment.quantity ?? shipment.items ?? ''),
        itemName: shipment.itemName || '',
        project: shipment.project || shipment.projectName || '',
        projectNumber: shipment.projectNumber || shipment.projectSubtext || '',
        carrier: shipment.carrier || '',
        serviceLevel: shipment.serviceLevel || '',
        status: shipment.status || 'Processing',
        shipDate: shipment.shipDate || '',
        estDelivery: shipment.estDelivery || shipment.estimatedDelivery || '',
        originAddress: shipment.originAddress || shipment.origin || '',
        destination: shipment.destination || '',
        destinationAddress: shipment.destinationAddress || '',
        destinationCity: shipment.destinationCity || '',
        destinationState: shipment.destinationState || '',
        destinationZip: shipment.destinationZip || '',
        contact: shipment.contact || '',
        weight: shipment.weight || '',
        dimensions: shipment.dimensions || '',
        packageType: shipment.packageType || '',
        referenceNumber: shipment.referenceNumber || '',
        specialInstructions: shipment.specialInstructions || '',
        shippingCost: shipment.shippingCost || '',
        declaredValue: shipment.declaredValue || '',
        insuranceAmount: shipment.insuranceAmount || '',
      });
    }
  }, [shipment]);

  // Get dynamic service levels based on selected carrier
  const availableServiceLevels = SERVICE_LEVELS_BY_CARRIER[formData.carrier] || [];

  const handleCarrierChange = (newCarrier: string) => {
    const newLevels = SERVICE_LEVELS_BY_CARRIER[newCarrier] || [];
    setFormData({
      ...formData,
      carrier: newCarrier,
      // Reset service level if current one isn't valid for new carrier
      serviceLevel: newLevels.includes(formData.serviceLevel) ? formData.serviceLevel : (newLevels[0] || ''),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shipment?.id) return;
    setSaving(true);
    try {
      const updatePayload: any = {
        masterTracking: formData.masterTracking,
        trackingNumber: formData.masterTracking,
        poNumber: formData.poNumber,
        orderNumber: formData.orderNumber,
        customer: formData.customer,
        quantity: parseInt(formData.quantity) || 0,
        itemName: formData.itemName,
        project: formData.project,
        projectName: formData.project,
        projectNumber: formData.projectNumber,
        projectSubtext: formData.projectNumber,
        carrier: formData.carrier,
        serviceLevel: formData.serviceLevel,
        status: formData.status,
        shipDate: formData.shipDate,
        estDelivery: formData.estDelivery,
        weight: formData.weight,
        dimensions: formData.dimensions,
        packageType: formData.packageType,
        referenceNumber: formData.referenceNumber,
        specialInstructions: formData.specialInstructions,
        shippingCost: formData.shippingCost,
        declaredValue: formData.declaredValue,
        insuranceAmount: formData.insuranceAmount,
      };
      const response = await fetch('/api/shipments/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: shipment.id, ...updatePayload }),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        toast.error(`Failed to update shipment: ${result.error || 'Unknown error'}`);
      } else {
        toast.success('Shipment updated successfully!');
        onSave?.();
      }
    } catch (error) {
      console.error('Error updating shipment:', error);
      toast.error(`Error updating shipment: ${error}`);
    }
    setSaving(false);
    onClose();
  };

  const inputClass = "w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all";
  const selectClass = "w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all";
  const readonlyClass = "w-full px-3.5 py-2 text-sm bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed";
  const labelClass = "block text-[11px] font-semibold text-slate-700 mb-1";

  // Build destination display string
  const destinationDisplay = [formData.destinationAddress, formData.destinationCity, formData.destinationState, formData.destinationZip]
    .filter(Boolean)
    .join(', ');

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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-xl bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-emerald-500 to-teal-600 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <Truck className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Edit Shipment</h2>
                  <p className="text-xs text-emerald-100">{shipment?.id || 'Update shipment details'}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto bg-slate-50 drawer-scroll">
              <div className="p-6 space-y-5">

                {/* Tracking & Identification */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                  <h3 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">Tracking & Identification</h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>
                          Master Tracking # <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.masterTracking}
                          onChange={(e) => setFormData({ ...formData, masterTracking: e.target.value })}
                          placeholder="1Z999AA10123456784"
                          required
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>PO Number</label>
                        <input
                          type="text"
                          value={formData.poNumber}
                          onChange={(e) => setFormData({ ...formData, poNumber: e.target.value })}
                          placeholder="PO-10001"
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>Order Number</label>
                        <input
                          type="text"
                          value={formData.orderNumber}
                          onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                          placeholder="ORD-1001"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Reference Number</label>
                        <input
                          type="text"
                          value={formData.referenceNumber}
                          onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                          placeholder="REF-001"
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Details */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                  <h3 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">Order Details</h3>
                  <div className="space-y-3">
                    <div>
                      <label className={labelClass}>Customer</label>
                      <input
                        type="text"
                        value={formData.customer}
                        onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                        placeholder="Customer name"
                        className={inputClass}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>Project Name</label>
                        <input
                          type="text"
                          value={formData.project}
                          onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                          placeholder="Project name"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Project #</label>
                        <input
                          type="text"
                          value={formData.projectNumber}
                          onChange={(e) => setFormData({ ...formData, projectNumber: e.target.value })}
                          placeholder="ADP-00001"
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Item Name</label>
                      <input
                        type="text"
                        value={formData.itemName}
                        onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                        placeholder="Item description"
                        className={inputClass}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>Quantity</label>
                        <QuantityStepper
                          value={parseInt(formData.quantity) || 0}
                          onChange={(val) => setFormData({ ...formData, quantity: String(val) })}
                          min={0}
                          wide
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Package Type</label>
                        <select
                          value={formData.packageType}
                          onChange={(e) => setFormData({ ...formData, packageType: e.target.value })}
                          className={selectClass}
                        >
                          <option value="">Not Set</option>
                          <option value="Box">Box</option>
                          <option value="Envelope">Envelope</option>
                          <option value="Pallet">Pallet</option>
                          <option value="Crate">Crate</option>
                          <option value="Tube">Tube</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Carrier & Service */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                  <h3 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">Carrier & Service</h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>
                          Carrier <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.carrier}
                          onChange={(e) => handleCarrierChange(e.target.value)}
                          required
                          className={selectClass}
                        >
                          <option value="">Select carrier...</option>
                          {ALL_CARRIERS.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Service Level</label>
                        {availableServiceLevels.length > 0 ? (
                          <select
                            value={formData.serviceLevel}
                            onChange={(e) => setFormData({ ...formData, serviceLevel: e.target.value })}
                            className={selectClass}
                          >
                            <option value="">Select service level...</option>
                            {availableServiceLevels.map((sl) => (
                              <option key={sl} value={sl}>{sl}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={formData.serviceLevel}
                            onChange={(e) => setFormData({ ...formData, serviceLevel: e.target.value })}
                            placeholder="e.g., Ground, Express"
                            className={inputClass}
                          />
                        )}
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>
                        Status <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        required
                        className={selectClass}
                      >
                        <option value="Processing">Processing</option>
                        <option value="In Transit">In Transit</option>
                        <option value="Out For Delivery">Out For Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Delayed">Delayed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                  <h3 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">Dates</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Ship Date</label>
                      <DatePicker
                        value={formData.shipDate}
                        onChange={(val) => setFormData({ ...formData, shipDate: val })}
                        placeholder="Select ship date"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Est. Delivery</label>
                      <DatePicker
                        value={formData.estDelivery}
                        onChange={(val) => setFormData({ ...formData, estDelivery: val })}
                        placeholder="Select delivery date"
                      />
                    </div>
                  </div>
                </div>

                {/* Shipping Address (Read-only) */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Shipping Address</h3>
                    <span className="flex items-center gap-1 text-xs font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
                      <Lock className="w-3 h-3" />
                      Read Only
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>Origin</label>
                        <input type="text" value={formData.originAddress || '—'} readOnly className={readonlyClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Destination</label>
                        <input type="text" value={formData.destination || '—'} readOnly className={readonlyClass} />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Destination Address</label>
                      <input type="text" value={destinationDisplay || '—'} readOnly className={readonlyClass} />
                    </div>
                    {formData.contact && (
                      <div>
                        <label className={labelClass}>Contact</label>
                        <input type="text" value={formData.contact} readOnly className={readonlyClass} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Financial */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                  <h3 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">Financial</h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className={labelClass}>Shipping Cost</label>
                        <input
                          type="text"
                          value={formData.shippingCost}
                          onChange={(e) => setFormData({ ...formData, shippingCost: e.target.value })}
                          placeholder="$0.00"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Declared Value</label>
                        <input
                          type="text"
                          value={formData.declaredValue}
                          onChange={(e) => setFormData({ ...formData, declaredValue: e.target.value })}
                          placeholder="$0.00"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Insurance</label>
                        <input
                          type="text"
                          value={formData.insuranceAmount}
                          onChange={(e) => setFormData({ ...formData, insuranceAmount: e.target.value })}
                          placeholder="$0.00"
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Package Details */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                  <h3 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">Package Details</h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>Weight</label>
                        <input
                          type="text"
                          value={formData.weight}
                          onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                          placeholder="e.g., 12.5 lbs"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Dimensions</label>
                        <input
                          type="text"
                          value={formData.dimensions}
                          onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                          placeholder='e.g., 12" x 10" x 8"'
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Special Instructions</label>
                      <textarea
                        value={formData.specialInstructions}
                        onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
                        placeholder="Any special handling instructions..."
                        rows={3}
                        className={`${inputClass} resize-none`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={saving}
                  className="flex-1 px-5 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-100 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <motion.button
                  type="submit"
                  disabled={saving}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Package className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}