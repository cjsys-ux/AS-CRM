import { motion, AnimatePresence } from 'motion/react';
import { Edit, Trash2, GripVertical, ChevronDown, Plus } from 'lucide-react';
import { useState } from 'react';

interface LocalTaxRate {
  id: string;
  location: string;
  additionalRate: string;
  totalRate: string;
}

interface TaxRateItemProps {
  stateName: string;
  index: number;
  localRates?: LocalTaxRate[];
  onEdit: (stateName: string) => void;
  onDelete: (stateName: string) => void;
  onAddLocalRate?: (stateName: string) => void;
  onEditLocalRate?: (stateName: string, rateId: string) => void;
  onDeleteLocalRate?: (stateName: string, rateId: string) => void;
}

// State tax rates mapping
const STATE_TAX_RATES: Record<string, string> = {
  'Alabama': '4%',
  'Alaska': '0%',
  'Arizona': '5.6%',
  'Arkansas': '6.5%',
  'California': '7.25%',
  'Colorado': '2.9%',
  'Connecticut': '6.35%',
  'Delaware': '0%',
  'Florida': '6%',
  'Georgia': '4%',
  'Hawaii': '4%',
  'Idaho': '6%',
  'Illinois': '6.25%',
  'Indiana': '7%',
  'Iowa': '6%',
  'Kansas': '6.5%',
  'Kentucky': '6%',
  'Louisiana': '4.45%',
  'Maine': '5.5%',
  'Maryland': '6%',
  'Massachusetts': '6.25%',
  'Michigan': '6%',
  'Minnesota': '6.875%',
  'Mississippi': '7%',
  'Missouri': '4.225%',
  'Montana': '0%',
  'Nebraska': '5.5%',
  'Nevada': '6.85%',
  'New Hampshire': '0%',
  'New Jersey': '6.625%',
  'New Mexico': '5.125%',
  'New York': '4%',
  'North Carolina': '4.75%',
  'North Dakota': '5%',
  'Ohio': '5.75%',
  'Oklahoma': '4.5%',
  'Oregon': '0%',
  'Pennsylvania': '6%',
  'Rhode Island': '7%',
  'South Carolina': '6%',
  'South Dakota': '4.5%',
  'Tennessee': '7%',
  'Texas': '6.25%',
  'Utah': '6.1%',
  'Vermont': '6%',
  'Virginia': '5.3%',
  'Washington': '6.5%',
  'West Virginia': '6%',
  'Wisconsin': '5%',
  'Wyoming': '4%',
};

export function TaxRateItem({
  stateName,
  index,
  localRates = [],
  onEdit,
  onDelete,
  onAddLocalRate,
  onEditLocalRate,
  onDeleteLocalRate,
}: TaxRateItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasLocalRates = localRates && localRates.length > 0;
  const stateRate = STATE_TAX_RATES[stateName] || '0%';

  return (
    <>
      {/* State-level item */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.02 }}
        className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md hover:border-blue-200 transition-all group"
      >
        <div className="flex items-center p-4">
          {/* Expand/Collapse Icon (only if has local rates) */}
          {hasLocalRates ? (
            <motion.button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-slate-100 rounded transition-colors mr-2"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-4 h-4 text-slate-600" />
              </motion.div>
            </motion.button>
          ) : (
            <div className="w-6 mr-2"></div>
          )}

          {/* Drag handle */}
          <GripVertical className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors cursor-grab mr-3" />
          
          {/* Blue dot */}
          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
          
          {/* State name and rate */}
          <div className="flex-1">
            <span className="font-medium text-slate-900">{stateName} - Base Rate: {stateRate}</span>
            {hasLocalRates && (
              <span className="ml-2 text-xs text-slate-500">
                ({localRates.length} local {localRates.length === 1 ? 'rate' : 'rates'})
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {onAddLocalRate && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onAddLocalRate(stateName)}
                className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                title="Add local rate"
              >
                <Plus className="w-4 h-4 text-green-600" />
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onEdit(stateName)}
              className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4 text-blue-600" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onDelete(stateName)}
              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Local rates (indented, expandable) */}
      <AnimatePresence>
        {isExpanded && hasLocalRates && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="ml-12 space-y-2 overflow-hidden"
          >
            {localRates.map((localRate, idx) => (
              <motion.div
                key={localRate.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-slate-50 rounded-lg border border-slate-200 p-3 hover:bg-white hover:border-blue-200 transition-all group/local"
              >
                <div className="flex items-center">
                  <GripVertical className="w-4 h-4 text-slate-300 group-hover/local:text-slate-400 transition-colors cursor-grab mr-2" />
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mr-3"></div>
                  <div className="flex-1">
                    <span className="text-sm text-slate-700">{localRate.location}: </span>
                    <span className="text-sm font-medium text-slate-900">
                      {localRate.additionalRate} (Total: {localRate.totalRate})
                    </span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover/local:opacity-100 transition-opacity">
                    {onEditLocalRate && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onEditLocalRate(stateName, localRate.id)}
                        className="p-1.5 hover:bg-blue-50 rounded transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5 text-blue-600" />
                      </motion.button>
                    )}
                    {onDeleteLocalRate && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onDeleteLocalRate(stateName, localRate.id)}
                        className="p-1.5 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-600" />
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
