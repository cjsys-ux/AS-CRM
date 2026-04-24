import { motion, AnimatePresence } from 'motion/react';
import { DatePicker } from './DatePicker';
import { X, Truck, Package, MapPin, DollarSign, Weight, FileText, Plus, Minus } from 'lucide-react';
import { useState } from 'react';
import { DynamicPackageDetails } from './DynamicPackageDetails';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';
import { QuantityStepper } from './QuantityStepper';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-c0840c88`;

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
  'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
  'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
  'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
  'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
  'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
  'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
  'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
  'West Virginia', 'Wisconsin', 'Wyoming',
];

interface AddShipmentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
}

export function AddShipmentDrawer({ isOpen, onClose, onSave }: AddShipmentDrawerProps) {
  const [formData, setFormData] = useState({
    trackingNumber: '',
    orderId: '',
    customer: '',
    items: '',
    origin: 'Warehouse A, Los Angeles',
    destinationAddress: '',
    destinationCity: '',
    destinationState: '',
    destinationZip: '',
    shipmentType: 'Small Package',
    carrier: 'FedEx',
    serviceType: '2-Day',
    status: 'Processing',
    shipDate: '',
    estimatedDelivery: '',
    weight: '',
    dimensions: '',
    declaredValue: '',
    shippingCost: '',
    insuranceAmount: '',
    specialInstructions: '',
    packageType: 'Box',
    referenceNumber: '',
  });

  // Dynamic carrier options based on shipment type
  const carrierOptions = {
    'Small Package': ['FedEx', 'UPS', 'DHL', 'USPS'],
    'Ocean Freight': ['Maersk', 'MSC', 'CMA CGM', 'Hapag-Lloyd', 'ONE', 'Evergreen', 'COSCO'],
    'Air Cargo': ['Emirates SkyCargo', 'Lufthansa Cargo', 'Cathay Pacific Cargo', 'FedEx Cargo', 'UPS Airlines', 'DHL Aviation'],
    'LTL': ['T-Force', 'Estes', 'Old Dominion', 'XPO Logistics', 'YRC Freight', 'Saia'],
    'FTL': ['T-Force', 'Estes', 'Knight-Swift', 'Schneider', 'J.B. Hunt', 'Werner'],
  };

  // Dynamic service type options based on carrier
  const serviceTypeOptions: Record<string, string[]> = {
    'FedEx': ['FedEx Ground', 'FedEx Express Saver', 'FedEx 2-Day', 'FedEx Standard Overnight', 'FedEx Priority Overnight', 'FedEx First Overnight'],
    'UPS': ['UPS Ground', 'UPS 3 Day Select', 'UPS 2nd Day Air', 'UPS Next Day Air Saver', 'UPS Next Day Air', 'UPS Next Day Air Early'],
    'DHL': ['DHL Ground', 'DHL Express 12:00', 'DHL Express Worldwide', 'DHL Express 9:00', 'DHL Express Before 10:30'],
    'USPS': ['USPS Ground Advantage', 'USPS Priority Mail', 'USPS Priority Mail Express', 'USPS First-Class Mail'],
    'Maersk': ['Standard Service', 'Express Service', 'Maersk Spot', 'Cold Chain Service'],
    'MSC': ['Standard Ocean', 'Express Ocean', 'Reefer Service', 'Project Cargo'],
    'CMA CGM': ['Standard Service', 'Fast Service', 'Cold Chain', 'Special Equipment'],
    'Hapag-Lloyd': ['Standard Service', 'Express Service', 'Reefer Container', 'Special Cargo'],
    'ONE': ['Standard Sailing', 'Express Sailing', 'Reefer Service'],
    'Evergreen': ['Regular Service', 'Express Service', 'Reefer Service'],
    'COSCO': ['Standard Service', 'Fast Service', 'Cold Chain Service'],
    'Emirates SkyCargo': ['General Cargo', 'Express Service', 'Cold Chain', 'Dangerous Goods'],
    'Lufthansa Cargo': ['Standard Air', 'Express Air', 'Temperature Controlled', 'Priority Service'],
    'Cathay Pacific Cargo': ['General Cargo', 'Priority Service', 'Fresh Service', 'Dangerous Goods'],
    'FedEx Cargo': ['Priority Air', 'Economy Air', 'International Priority', 'International Economy'],
    'UPS Airlines': ['Worldwide Express', 'Worldwide Saver', 'Worldwide Expedited'],
    'DHL Aviation': ['Express Worldwide', 'Express 12:00', 'Express 9:00'],
    'T-Force': ['Standard LTL', 'Expedited LTL', 'Volume LTL', 'Guaranteed LTL', 'Full Truckload'],
    'Estes': ['Standard LTL', 'Volume & Truckload', 'Expedited Service', 'Guaranteed Service', 'Time Critical'],
    'Old Dominion': ['Standard LTL', 'Expedited Service', 'Guaranteed Service'],
    'XPO Logistics': ['Standard LTL', 'Expedited', 'Guaranteed', 'Volume & Truckload'],
    'YRC Freight': ['Standard Service', 'Time Critical', 'Guaranteed Service'],
    'Saia': ['Standard LTL', 'Expedited Service', 'Guaranteed Service'],
    'Knight-Swift': ['Standard FTL', 'Expedited FTL', 'Temperature Controlled', 'Dedicated Service'],
    'Schneider': ['Dry Van', 'Refrigerated', 'Intermodal', 'Dedicated'],
    'J.B. Hunt': ['Truckload', 'Intermodal', 'Dedicated', 'Final Mile'],
    'Werner': ['Van Truckload', 'Dedicated', 'Temperature Controlled', 'Expedited'],
  };

  // Handle shipment type change
  const handleShipmentTypeChange = (type: string) => {
    const carriers = carrierOptions[type as keyof typeof carrierOptions] || [];
    const defaultCarrier = carriers[0] || '';
    const services = serviceTypeOptions[defaultCarrier] || [];
    
    setFormData({
      ...formData,
      shipmentType: type,
      carrier: defaultCarrier,
      serviceType: services[0] || '',
    });
  };

  // Handle carrier change
  const handleCarrierChange = (carrier: string) => {
    const services = serviceTypeOptions[carrier] || [];
    setFormData({
      ...formData,
      carrier,
      serviceType: services[0] || '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const shipmentPayload = {
        masterTracking: formData.trackingNumber,
        poNumber: formData.referenceNumber || '',
        orderNumber: formData.orderId,
        orderLabel: formData.orderId,
        customer: formData.customer,
        quantity: parseInt(formData.items) || 0,
        itemName: formData.customer + ' Shipment',
        project: formData.customer,
        carrier: formData.carrier,
        serviceLevel: formData.serviceType,
        status: formData.status,
        shipDate: formData.shipDate,
        estDelivery: formData.estimatedDelivery,
        hasIssue: false,
        weight: formData.weight || '',
        dimensions: formData.dimensions || '',
        packageType: formData.packageType,
        declaredValue: formData.declaredValue,
        shippingCost: formData.shippingCost,
        insuranceAmount: formData.insuranceAmount,
        originAddress: formData.origin,
        destinationAddress: formData.destinationAddress,
        destinationCity: formData.destinationCity,
        destinationState: formData.destinationState,
        destinationZip: formData.destinationZip,
        referenceNumber: formData.referenceNumber,
        specialInstructions: formData.specialInstructions,
      };
      const response = await fetch(`${API_URL}/shipments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(shipmentPayload),
      });
      const result = await response.json();
      if (!result.success) {
        toast.error(`Failed to create shipment: ${result.error || 'Unknown error'}`);
      } else {
        toast.success('Shipment created successfully!');
        onSave?.();
      }
    } catch (error) {
      console.error('Error creating shipment:', error);
      toast.error(`Error creating shipment: ${error}`);
    }
    onClose();
  };

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
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Simple Flat Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-xl bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-emerald-500 to-teal-600">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <Truck className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Add New Shipment</h2>
                  <p className="text-xs text-emerald-100">Submit a new shipment to the system</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto bg-slate-50 drawer-scroll">
              <div className="p-6 space-y-5">
                {/* Basic Information */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                  <h3 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">Basic Information</h3>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Tracking Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.trackingNumber}
                          onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
                          placeholder="TRK-2024-001234"
                          required
                          className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Order ID <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.orderId}
                          onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                          placeholder="ORD-1001"
                          required
                          className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Customer Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.customer}
                        onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                        placeholder="Acme Corporation"
                        required
                        className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Number of Items <span className="text-red-500">*</span>
                        </label>
                        <QuantityStepper
                          value={parseInt(formData.items) || 0}
                          onChange={(val) => setFormData({ ...formData, items: String(val) })}
                          min={1}
                          wide
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Package Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.packageType}
                          onChange={(e) => setFormData({ ...formData, packageType: e.target.value })}
                          required
                          className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        >
                          <option value="Box">Box</option>
                          <option value="Envelope">Envelope</option>
                          <option value="Pallet">Pallet</option>
                          <option value="Crate">Crate</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shipping Details */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                  <h3 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">Shipping Details</h3>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Origin <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.origin}
                        onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                        required
                        className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      >
                        <option value="Warehouse A, Los Angeles">Warehouse A, Los Angeles</option>
                        <option value="Warehouse B, Dallas">Warehouse B, Dallas</option>
                        <option value="Warehouse C, Chicago">Warehouse C, Chicago</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Destination Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.destinationAddress}
                        onChange={(e) => setFormData({ ...formData, destinationAddress: e.target.value })}
                        placeholder="123 Main Street"
                        required
                        className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          City <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.destinationCity}
                          onChange={(e) => setFormData({ ...formData, destinationCity: e.target.value })}
                          placeholder="New York"
                          required
                          className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          State <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.destinationState}
                          onChange={(e) => setFormData({ ...formData, destinationState: e.target.value })}
                          required
                          className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        >
                          {US_STATES.map(state => (
                            <option key={state} value={state}>{state}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        ZIP Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.destinationZip}
                        onChange={(e) => setFormData({ ...formData, destinationZip: e.target.value })}
                        placeholder="10001"
                        required
                        className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Carrier & Service */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                  <h3 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">Carrier Information</h3>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Shipment Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.shipmentType}
                          onChange={(e) => handleShipmentTypeChange(e.target.value)}
                          required
                          className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        >
                          <option value="Small Package">Small Package</option>
                          <option value="Ocean Freight">Ocean Freight</option>
                          <option value="Air Cargo">Air Cargo</option>
                          <option value="LTL">LTL</option>
                          <option value="FTL">FTL</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Carrier <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.carrier}
                          onChange={(e) => handleCarrierChange(e.target.value)}
                          required
                          className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        >
                          {carrierOptions[formData.shipmentType as keyof typeof carrierOptions]?.map(carrier => (
                            <option key={carrier} value={carrier}>{carrier}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Service Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.serviceType}
                        onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                        required
                        className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      >
                        {serviceTypeOptions[formData.carrier]?.map(service => (
                          <option key={service} value={service}>{service}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Status <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        required
                        className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      >
                        <option value="Processing">Processing</option>
                        <option value="In Transit">In Transit</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Delayed">Delayed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Ship Date <span className="text-red-500">*</span>
                        </label>
                        <DatePicker
                          value={formData.shipDate}
                          onChange={(date) => setFormData({ ...formData, shipDate: date })}
                          required
                          className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Est. Delivery <span className="text-red-500">*</span>
                        </label>
                        <DatePicker
                          value={formData.estimatedDelivery}
                          onChange={(date) => setFormData({ ...formData, estimatedDelivery: date })}
                          required
                          className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Package Details */}
                <DynamicPackageDetails shipmentType={formData.shipmentType} />

                {/* Financial Information */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                  <h3 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">Financial Information</h3>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Declared Value</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.declaredValue}
                        onChange={(e) => setFormData({ ...formData, declaredValue: e.target.value })}
                        placeholder="500.00"
                        className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Shipping Cost</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.shippingCost}
                        onChange={(e) => setFormData({ ...formData, shippingCost: e.target.value })}
                        placeholder="125.50"
                        className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Insurance Amount</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.insuranceAmount}
                        onChange={(e) => setFormData({ ...formData, insuranceAmount: e.target.value })}
                        placeholder="50.00"
                        className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                  <h3 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">Additional Information</h3>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Reference Number</label>
                      <input
                        type="text"
                        value={formData.referenceNumber}
                        onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                        placeholder="REF-12345"
                        className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Special Instructions</label>
                      <textarea
                        value={formData.specialInstructions}
                        onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
                        placeholder="Add any special handling or delivery instructions..."
                        rows={3}
                        className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
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
                  className="flex-1 px-5 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all flex items-center justify-center gap-2"
                >
                  <Package className="w-4 h-4" />
                  Add Shipment
                </motion.button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}