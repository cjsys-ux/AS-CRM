import { motion, AnimatePresence } from 'motion/react';
import { X, Package, MapPin, Truck, DollarSign, Weight, Ruler, FileText, Clock, AlertCircle, Tag } from 'lucide-react';

interface ShipmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shipment: any;
}

export function ShipmentDetailsModal({ isOpen, onClose, shipment }: ShipmentDetailsModalProps) {
  if (!shipment) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-700';
      case 'In Transit':
        return 'bg-blue-100 text-blue-700';
      case 'Out For Delivery':
        return 'bg-purple-100 text-purple-700';
      case 'Processing':
        return 'bg-yellow-100 text-yellow-700';
      case 'Delayed':
        return 'bg-red-100 text-red-700';
      case 'Cancelled':
        return 'bg-slate-100 text-slate-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="bg-emerald-600 px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Shipment Details</h3>
                    <p className="text-emerald-100 text-sm">{shipment.masterTracking}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-lg hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                    <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <Package className="w-4 h-4 text-white" />
                      </div>
                      Basic Information
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-slate-600 mb-1">Tracking Number</p>
                        <p className="text-sm font-medium text-slate-900">{shipment.masterTracking}</p>
                      </div>
                      {shipment.poNumber && (
                        <div>
                          <p className="text-xs font-semibold text-slate-600 mb-1">PO Number</p>
                          <p className="text-sm font-medium text-slate-900">{shipment.poNumber}</p>
                        </div>
                      )}
                      {shipment.referenceNumber && (
                        <div>
                          <p className="text-xs font-semibold text-slate-600 mb-1">Reference Number</p>
                          <p className="text-sm font-medium text-slate-900">{shipment.referenceNumber}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-semibold text-slate-600 mb-1">Customer</p>
                        <p className="text-sm font-medium text-slate-900">{shipment.customer}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-600 mb-1">Project</p>
                        <p className="text-sm font-medium text-slate-900">{shipment.project}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-600 mb-1">Status</p>
                        <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium ${getStatusColor(shipment.status)}`}>
                          {shipment.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Package Details */}
                  <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                    <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                        <Package className="w-4 h-4 text-white" />
                      </div>
                      Package Details
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-slate-600 mb-1">Item Name</p>
                        <p className="text-sm font-medium text-slate-900">{shipment.itemName}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-600 mb-1">Quantity</p>
                        <p className="text-sm font-medium text-slate-900">{shipment.quantity} units</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-600 mb-1">Package Type</p>
                        <p className="text-sm font-medium text-slate-900">{shipment.packageType}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                          <Weight className="w-3 h-3" />
                          Weight
                        </p>
                        <p className="text-sm font-medium text-slate-900">{shipment.weight}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                          <Ruler className="w-3 h-3" />
                          Dimensions
                        </p>
                        <p className="text-sm font-medium text-slate-900">{shipment.dimensions}</p>
                      </div>
                    </div>
                  </div>

                  {/* Origin & Destination */}
                  <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                    <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-white" />
                      </div>
                      Origin & Destination
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-semibold text-slate-600 mb-1">From</p>
                        <p className="text-sm font-medium text-slate-900">{shipment.originAddress}</p>
                      </div>
                      <div className="border-t border-slate-300 pt-4">
                        <p className="text-xs font-semibold text-slate-600 mb-1">To</p>
                        <p className="text-sm font-medium text-slate-900">{shipment.destinationAddress}</p>
                        <p className="text-sm text-slate-700">
                          {shipment.destinationCity}, {shipment.destinationState} {shipment.destinationZip}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Carrier Information */}
                  <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                    <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                        <Truck className="w-4 h-4 text-white" />
                      </div>
                      Carrier Information
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-slate-600 mb-1">Carrier</p>
                        <p className="text-sm font-medium text-slate-900">{shipment.carrier}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-600 mb-1">Service Level</p>
                        <p className="text-sm font-medium text-slate-900">{shipment.serviceLevel}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Ship Date
                        </p>
                        <p className="text-sm font-medium text-slate-900">{shipment.shipDate}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Estimated Delivery
                        </p>
                        <p className="text-sm font-medium text-slate-900">{shipment.estDelivery}</p>
                      </div>
                    </div>
                  </div>

                  {/* Financial Information */}
                  <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                    <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-white" />
                      </div>
                      Financial Information
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-slate-600 mb-1">Declared Value</p>
                        <p className="text-sm font-medium text-slate-900">{shipment.declaredValue}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-600 mb-1">Shipping Cost</p>
                        <p className="text-sm font-medium text-slate-900">{shipment.shippingCost}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-600 mb-1">Insurance Amount</p>
                        <p className="text-sm font-medium text-slate-900">{shipment.insuranceAmount}</p>
                      </div>
                    </div>
                  </div>

                  {/* Special Instructions */}
                  {shipment.specialInstructions && (
                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                      <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                          <FileText className="w-4 h-4 text-white" />
                        </div>
                        Special Instructions
                      </h4>
                      <p className="text-sm text-slate-700 leading-relaxed">{shipment.specialInstructions}</p>
                    </div>
                  )}

                  {/* Child Trackings */}
                  {shipment.childTrackings && shipment.childTrackings.length > 0 && (
                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 md:col-span-2">
                      <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                          <Tag className="w-4 h-4 text-white" />
                        </div>
                        Package Tracking Numbers ({shipment.childTrackings.length} packages)
                      </h4>
                      <div className="space-y-3">
                        {shipment.childTrackings.map((child: any, index: number) => (
                          <div key={index} className="bg-white rounded-lg p-3 border border-slate-200 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                                <span className="text-xs font-bold text-slate-700">#{index + 1}</span>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-900">{child.trackingNumber}</p>
                                <p className="text-xs text-slate-600">Ship: {child.shipDate} • Delivery: {child.estDelivery}</p>
                              </div>
                            </div>
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getStatusColor(child.status)}`}>
                              {child.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
