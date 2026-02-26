import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Circle, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  isCustom?: boolean; // Track if item is user-added
}

interface ChecklistWidgetProps {
  items?: ChecklistItem[];
  onUpdate?: (items: ChecklistItem[]) => void;
}

export function ChecklistWidget({ items: initialItems, onUpdate }: ChecklistWidgetProps) {
  const [items, setItems] = useState<ChecklistItem[]>(initialItems || [
    { id: '1', label: 'Packaging Mockup', completed: false },
    { id: '2', label: 'Packaging Template', completed: false },
    { id: '3', label: 'Dieline/CAD Files', completed: false },
    { id: '4', label: 'Packaging Spec Sheet', completed: false }
  ]);
  const [newItemText, setNewItemText] = useState('');
  const [isAddingItem, setIsAddingItem] = useState(false);

  const toggleItem = (id: string) => {
    const updatedItems = items.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setItems(updatedItems);
    onUpdate?.(updatedItems);
  };

  const addCustomItem = () => {
    if (newItemText.trim()) {
      const newItem: ChecklistItem = {
        id: Date.now().toString(),
        label: newItemText.trim(),
        completed: false,
        isCustom: true // Mark as custom item
      };
      const updatedItems = [...items, newItem];
      setItems(updatedItems);
      onUpdate?.(updatedItems);
      setNewItemText('');
      setIsAddingItem(false);
    }
  };

  const deleteItem = (id: string) => {
    const updatedItems = items.filter(item => item.id !== id);
    setItems(updatedItems);
    onUpdate?.(updatedItems);
  };

  const completedCount = items.filter(item => item.completed).length;
  const totalCount = items.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="bg-white rounded-xl border-2 border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <h3 className="font-bold text-slate-900">Checklist</h3>
        </div>
        <div className="text-sm font-medium text-slate-600">
          {completedCount}/{totalCount} Complete
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-6 py-3 bg-slate-50">
        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5 }}
            className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
          />
        </div>
      </div>

      {/* Checklist Items */}
      <div className="divide-y divide-slate-100">
        <AnimatePresence>
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: index * 0.05 }}
              className="px-6 py-3 hover:bg-slate-50 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div 
                  className="flex items-center gap-3 flex-1 cursor-pointer"
                  onClick={() => toggleItem(item.id)}
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {item.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300" />
                    )}
                  </motion.div>
                  <span className={`text-sm ${item.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                    {item.label}
                  </span>
                  {item.isCustom && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                      Custom
                    </span>
                  )}
                </div>
                {item.isCustom && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteItem(item.id);
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete custom item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add Custom Item */}
      <div className="px-6 py-3 border-t border-slate-200 bg-slate-50">
        {isAddingItem ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') addCustomItem();
                if (e.key === 'Escape') {
                  setIsAddingItem(false);
                  setNewItemText('');
                }
              }}
              placeholder="Add custom checklist item..."
              className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              autoFocus
            />
            <button
              onClick={addCustomItem}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
            >
              Add
            </button>
            <button
              onClick={() => {
                setIsAddingItem(false);
                setNewItemText('');
              }}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingItem(true)}
            className="w-full flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add custom checklist item...
          </button>
        )}
      </div>
    </div>
  );
}
