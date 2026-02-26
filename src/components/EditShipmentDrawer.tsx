import { motion, AnimatePresence } from 'motion/react';
import { X, Truck, Package, MapPin, DollarSign, Weight, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';

interface EditShipmentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  shipment: any;
}

export function EditShipmentDrawer({ isOpen, onClose, shipment }: EditShipmentDrawerProps) {
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
    carrier: 'FedEx Express',
    serviceType: 'Ground',
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

  useEffect(() => {
    if (shipment) {
      setFormData({
        trackingNumber: shipment.masterTracking || '',
        orderId: shipment.poNumber || '',
        customer: shipment.customer || '',
        items: '5',
        origin: 'Warehouse A, Los Angeles',
        destinationAddress: '',
        destinationCity: '',
        destinationState: '',
        destinationZip: '',
        carrier: shipment.carrier || 'FedEx Express',
        serviceType: shipment.serviceLevel || 'Ground',
        status: shipment.status || 'Processing',
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
    }
  }, [shipment]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Updated Shipment:', formData);
    alert('Shipment updated successfully!');
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

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-xl bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="bg-emerald-600 px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Edit Shipment</h2>
                  <p className="text-emerald-100 text-sm">Update shipment information</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto bg-slate-50">
              <div className="p-6 space-y-4">
                {/* Basic Information */}
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-white" />
                    </div>
                    Basic Information
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                          Tracking Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.trackingNumber}
                          onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
                          placeholder="TRK-2024-001234"
                          required
                          className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                          Order ID <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.orderId}
                          onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                          placeholder="ORD-1001"
                          required
                          className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Customer Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.customer}
                        onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                        placeholder="Acme Corporation"
                        required
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                          Number of Items <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={formData.items}
                          onChange={(e) => setFormData({ ...formData, items: e.target.value })}
                          placeholder="5"
                          required
                          className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                          Package Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.packageType}
                          onChange={(e) => setFormData({ ...formData, packageType: e.target.value })}
                          required
                          className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
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
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    Shipping Details
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Origin <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.origin}
                        onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                        required
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      >
                        <option value="Warehouse A, Los Angeles">Warehouse A, Los Angeles</option>
                        <option value="Warehouse B, Dallas">Warehouse B, Dallas</option>
                        <option value="Warehouse C, Chicago">Warehouse C, Chicago</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Destination Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.destinationAddress}
                        onChange={(e) => setFormData({ ...formData, destinationAddress: e.target.value })}
                        placeholder="123 Main Street"
                        required
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2">
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                          City <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.destinationCity}
                          onChange={(e) => setFormData({ ...formData, destinationCity: e.target.value })}
                          placeholder="New York"
                          required
                          className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                          State <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.destinationState}
                          onChange={(e) => setFormData({ ...formData, destinationState: e.target.value })}
                          placeholder="NY"
                          required
                          className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        ZIP Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.destinationZip}
                        onChange={(e) => setFormData({ ...formData, destinationZip: e.target.value })}
                        placeholder="10001"
                        required
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Carrier & Service */}
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <div className="w-9 h-9 bg-purple-500 rounded-lg flex items-center justify-center">
                      <Truck className="w-5 h-5 text-white" />
                    </div>
                    Carrier Information
                  </h3>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                          Carrier <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.carrier}
                          onChange={(e) => setFormData({ ...formData, carrier: e.target.value })}
                          required
                          className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        >
                          <option value="FedEx Express">FedEx Express</option>
                          <option value="FedEx Ground">FedEx Ground</option>
                          <option value="UPS Express">UPS Express</option>
                          <option value="UPS Ground">UPS Ground</option>
                          <option value="USPS Priority">USPS Priority</option>
                          <option value="DHL Express">DHL Express</option>
                          <option value="DHL Ground">DHL Ground</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                          Service Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.serviceType}
                          onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                          required
                          className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        >
                          <option value="Ground">Ground</option>
                          <option value="Express">Express</option>
                          <option value="Overnight">Overnight</option>
                          <option value="2-Day">2-Day</option>
                          <option value="Standard">Standard</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Status <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        required
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
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
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                >
                  <Package className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
