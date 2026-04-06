import { motion, AnimatePresence } from 'motion/react';
import { X, Truck, Check, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface TransitOption {
  id: string;
  name: string;
  estimatedDays: string;
}

interface Carrier {
  id: string;
  name: string;
  transitOptions: TransitOption[];
}

interface ShippingMethodSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMethod: string;
  onSelectMethod: (method: { carrier: string; transitOption: string; name: string }) => void;
}

export function ShippingMethodSelector({ isOpen, onClose, selectedMethod, onSelectMethod }: ShippingMethodSelectorProps) {
  const [selectedCarrier, setSelectedCarrier] = useState<string | null>(null);

  const carriers: Carrier[] = [
    {
      id: 'ups',
      name: 'UPS',
      transitOptions: [
        { id: 'ups-ground', name: 'Ground', estimatedDays: '1-5 business days' },
        { id: 'ups-3day', name: '3 Day Select', estimatedDays: '3 business days' },
        { id: 'ups-2day', name: '2nd Day Air', estimatedDays: '2 business days' },
        { id: 'ups-2day-am', name: '2nd Day Air A.M.', estimatedDays: '2 business days by 10:30 AM' },
        { id: 'ups-next-day', name: 'Next Day Air', estimatedDays: '1 business day' },
        { id: 'ups-next-day-am', name: 'Next Day Air Early', estimatedDays: '1 business day by 8:30 AM' },
        { id: 'ups-saver', name: 'Next Day Air Saver', estimatedDays: '1 business day by 3:00 PM' },
      ]
    },
    {
      id: 'fedex',
      name: 'FedEx',
      transitOptions: [
        { id: 'fedex-ground', name: 'Ground', estimatedDays: '1-5 business days' },
        { id: 'fedex-home', name: 'Home Delivery', estimatedDays: '1-5 business days' },
        { id: 'fedex-express', name: 'Express Saver', estimatedDays: '3 business days' },
        { id: 'fedex-2day', name: '2Day', estimatedDays: '2 business days' },
        { id: 'fedex-2day-am', name: '2Day A.M.', estimatedDays: '2 business days by 10:30 AM' },
        { id: 'fedex-overnight', name: 'Standard Overnight', estimatedDays: '1 business day by 3:00 PM' },
        { id: 'fedex-priority', name: 'Priority Overnight', estimatedDays: '1 business day by 10:30 AM' },
        { id: 'fedex-first', name: 'First Overnight', estimatedDays: '1 business day by 8:00 AM' },
        { id: 'fedex-intl', name: 'International Priority', estimatedDays: '1-3 business days' },
      ]
    },
    {
      id: 'usps',
      name: 'USPS',
      transitOptions: [
        { id: 'usps-first', name: 'First Class Mail', estimatedDays: '1-3 business days' },
        { id: 'usps-priority', name: 'Priority Mail', estimatedDays: '1-3 business days' },
        { id: 'usps-priority-express', name: 'Priority Mail Express', estimatedDays: '1-2 business days' },
        { id: 'usps-media', name: 'Media Mail', estimatedDays: '2-8 business days' },
        { id: 'usps-parcel', name: 'Parcel Select Ground', estimatedDays: '2-8 business days' },
      ]
    },
    {
      id: 'dhl',
      name: 'DHL',
      transitOptions: [
        { id: 'dhl-express', name: 'Express Worldwide', estimatedDays: '1-3 business days' },
        { id: 'dhl-express-9', name: 'Express 9:00', estimatedDays: '1 business day by 9:00 AM' },
        { id: 'dhl-express-12', name: 'Express 12:00', estimatedDays: '1 business day by 12:00 PM' },
        { id: 'dhl-economy', name: 'Economy Select', estimatedDays: '2-5 business days' },
      ]
    },
  ];

  const handleSelectTransitOption = (carrier: Carrier, transitOption: TransitOption) => {
    const fullName = `${carrier.name} - ${transitOption.name}`;
    onSelectMethod({
      carrier: carrier.name,
      transitOption: transitOption.name,
      name: fullName
    });
    onClose();
    setSelectedCarrier(null);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Truck className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">
                  {selectedCarrier ? `Select ${carriers.find(c => c.id === selectedCarrier)?.name} Transit Option` : 'Select Carrier'}
                </h3>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </motion.button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {!selectedCarrier ? (
              // Carrier Selection
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {carriers.map((carrier) => (
                  <motion.button
                    key={carrier.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedCarrier(carrier.id)}
                    className="p-6 rounded-xl bg-slate-50 hover:bg-purple-50 border-2 border-slate-200 hover:border-purple-300 transition-all text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xl font-bold text-slate-900 mb-1">{carrier.name}</p>
                        <p className="text-sm text-slate-600">{carrier.transitOptions.length} transit options</p>
                      </div>
                      <ChevronRight className="w-6 h-6 text-slate-400 group-hover:text-purple-600 transition-colors" />
                    </div>
                  </motion.button>
                ))}
              </div>
            ) : (
              // Transit Option Selection
              <div>
                <button
                  onClick={() => setSelectedCarrier(null)}
                  className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-4 font-medium"
                >
                  ← Back to carriers
                </button>
                <div className="grid grid-cols-1 gap-3">
                  {carriers
                    .find(c => c.id === selectedCarrier)
                    ?.transitOptions.map((option) => {
                      const isSelected = selectedMethod === `${carriers.find(c => c.id === selectedCarrier)?.name} - ${option.name}`;
                      
                      return (
                        <motion.button
                          key={option.id}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => handleSelectTransitOption(carriers.find(c => c.id === selectedCarrier)!, option)}
                          className={`p-4 rounded-xl transition-all text-left ${
                            isSelected
                              ? 'bg-purple-50 border-2 border-purple-300 shadow-lg'
                              : 'bg-slate-50 hover:bg-purple-50 border-2 border-slate-200 hover:border-purple-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className={`font-semibold ${isSelected ? 'text-purple-900' : 'text-slate-900'}`}>
                                  {option.name}
                                </p>
                                {isSelected && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                  >
                                    <Check className="w-5 h-5 text-purple-600" />
                                  </motion.div>
                                )}
                              </div>
                              <p className="text-sm text-slate-600">{option.estimatedDays}</p>
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
