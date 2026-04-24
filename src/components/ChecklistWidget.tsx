import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Circle, Plus, Trash2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

export interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  isCustom?: boolean;
}

interface ChecklistWidgetProps {
  productId?: string;
  tabId?: string;
  onUpdate?: (items: ChecklistItem[]) => void;
  onChecklistChanged?: (all: Record<string, ChecklistItem[]>) => void;
  onActivityDetected?: () => void;
  items?: ChecklistItem[];
}

const DEFAULT_ITEMS: Record<string, string[]> = {
  vendors:        ['Primary Vendor Linked', 'Pricing Confirmed', 'Shipping Terms Agreed', 'Lead Time Confirmed'],
  specifications: ['Product Dimensions', 'Material Specifications', 'Weight & Shipping Info', 'Compliance Documents'],
  packaging:      ['Packaging Mockup', 'Packaging Template', 'Dieline/CAD Files', 'Packaging Spec Sheet'],
  samples:        ['Sample Request Submitted', 'Sample Received', 'Quality Review Completed', 'Sample Documentation'],
  files:          ['Product Images Uploaded', 'Spec Sheets Uploaded', 'Vendor Quotes Filed', 'Compliance Docs Filed'],
};

export function ChecklistWidget({ productId, tabId, onUpdate, onChecklistChanged, onActivityDetected, items: externalItems }: ChecklistWidgetProps) {
  const [items, setItems] = useState<ChecklistItem[]>(externalItems || []);
  const [newItemText, setNewItemText] = useState('');
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [loading, setLoading] = useState(false);

  const isPipelineMode = Boolean(productId && tabId);

  // Read the merged cross-tab checklist out of localStorage so every widget
  // knows what every other tab currently has — this is what lets tab badges
  // in ProductDetails reflect progress on tabs the user hasn't opened.
  const readAllChecklists = useCallback((): Record<string, ChecklistItem[]> => {
    if (!productId) return {};
    try {
      const raw = localStorage.getItem(`product:${productId}:checklist`);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }, [productId]);

  const emitChecklistChanged = useCallback((updatedItems: ChecklistItem[]) => {
    if (!tabId || !onChecklistChanged) return;
    const all = readAllChecklists();
    all[tabId] = updatedItems;
    onChecklistChanged(all);
  }, [tabId, onChecklistChanged, readAllChecklists]);

  const loadChecklist = useCallback(async () => {
    if (!isPipelineMode) return;
    setLoading(true);
    try {
      const [settingsRes, stateRes] = await Promise.all([
        fetch('/api/pipeline/settings/get'),
        fetch(`/api/pipeline/checklist/get?productId=${encodeURIComponent(productId!)}&tabId=${encodeURIComponent(tabId!)}`),
      ]);

      let labelItems: string[] = DEFAULT_ITEMS[tabId!] ?? [];
      if (settingsRes.ok) {
        const sd = await settingsRes.json();
        if (sd.checklists?.[tabId!]) labelItems = sd.checklists[tabId!];
      }

      let completionMap: Record<string, boolean> = {};
      let customItems: ChecklistItem[] = [];
      if (stateRes.ok) {
        const sd = await stateRes.json();
        const saved: ChecklistItem[] = sd.checklists?.[tabId!] ?? [];
        for (const item of saved) {
          completionMap[item.label] = item.completed;
          if (item.isCustom) customItems.push(item);
        }
      }

      const merged: ChecklistItem[] = [
        ...labelItems.map((label, i) => ({
          id: `setting-${tabId}-${i}`,
          label,
          completed: completionMap[label] ?? false,
          isCustom: false as boolean,
        })),
        ...customItems,
      ];
      setItems(merged);
      onUpdate?.(merged);
      emitChecklistChanged(merged);
    } catch {
      const defaults = (DEFAULT_ITEMS[tabId!] ?? []).map((label, i) => ({
        id: `default-${i}`,
        label,
        completed: false,
        isCustom: false as boolean,
      }));
      setItems(defaults);
      onUpdate?.(defaults);
      emitChecklistChanged(defaults);
    } finally {
      setLoading(false);
    }
  }, [productId, tabId, emitChecklistChanged]);

  useEffect(() => {
    if (isPipelineMode) {
      loadChecklist();
    } else if (externalItems) {
      setItems(externalItems);
    }
  }, [productId, tabId]);

  const saveState = useCallback(async (updatedItems: ChecklistItem[]) => {
    if (!isPipelineMode) return;
    try {
      await fetch('/api/pipeline/checklist/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, tabId, items: updatedItems }),
      });
    } catch {}
    try {
      const key = `product:${productId}:checklist`;
      const saved = JSON.parse(localStorage.getItem(key) || '{}');
      saved[tabId!] = updatedItems;
      localStorage.setItem(key, JSON.stringify(saved));
    } catch {}
  }, [productId, tabId]);

  const toggleItem = (id: string) => {
    const updated = items.map(item => item.id === id ? { ...item, completed: !item.completed } : item);
    setItems(updated);
    onUpdate?.(updated);
    saveState(updated);
    emitChecklistChanged(updated);
    onActivityDetected?.();
  };

  const addCustomItem = () => {
    if (!newItemText.trim()) return;
    const newItem: ChecklistItem = {
      id: `custom-${Date.now()}`,
      label: newItemText.trim(),
      completed: false,
      isCustom: true,
    };
    const updated = [...items, newItem];
    setItems(updated);
    onUpdate?.(updated);
    saveState(updated);
    emitChecklistChanged(updated);
    onActivityDetected?.();
    setNewItemText('');
    setIsAddingItem(false);
  };

  const deleteItem = (id: string) => {
    const updated = items.filter(item => item.id !== id);
    setItems(updated);
    onUpdate?.(updated);
    saveState(updated);
    emitChecklistChanged(updated);
  };

  const completedCount = items.filter(i => i.completed).length;
  const totalCount = items.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const tabLabel = tabId ? tabId.charAt(0).toUpperCase() + tabId.slice(1) : 'Checklist';

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${completedCount === totalCount && totalCount > 0 ? 'bg-green-100' : 'bg-slate-100'}`}>
            <CheckCircle2 className={`w-4 h-4 ${completedCount === totalCount && totalCount > 0 ? 'text-green-600' : 'text-slate-400'}`} />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">{tabLabel} Checklist</h3>
        </div>
        <div className="text-sm font-medium text-slate-500">{completedCount}/{totalCount} Complete</div>
      </div>

      <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-100">
        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5 }}
            className={`h-full rounded-full ${progressPercent === 100 ? 'bg-green-500' : progressPercent >= 50 ? 'bg-blue-500' : 'bg-orange-400'}`}
          />
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        <AnimatePresence>
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: index * 0.03 }}
              className="px-5 py-3 hover:bg-slate-50 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => toggleItem(item.id)}>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    {item.completed
                      ? <CheckCircle2 className="w-[18px] h-[18px] text-green-500" />
                      : <Circle className="w-[18px] h-[18px] text-slate-300" />
                    }
                  </motion.div>
                  <span className={`text-sm ${item.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                    {item.label}
                  </span>
                  {item.isCustom && (
                    <span className="px-1.5 py-0.5 bg-blue-100 text-blue-600 text-[10px] font-semibold rounded">Custom</span>
                  )}
                </div>
                {item.isCustom && (
                  <motion.button
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={() => deleteItem(item.id)}
                    className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </motion.button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="px-5 py-3 border-t border-slate-200 bg-slate-50">
        {isAddingItem ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') addCustomItem();
                if (e.key === 'Escape') { setIsAddingItem(false); setNewItemText(''); }
              }}
              placeholder="Add checklist item..."
              className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              autoFocus
            />
            <button onClick={addCustomItem} className="px-3 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">Add</button>
            <button onClick={() => { setIsAddingItem(false); setNewItemText(''); }} className="px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">Cancel</button>
          </div>
        ) : (
          <button onClick={() => setIsAddingItem(true)} className="w-full flex items-center gap-2 text-slate-400 hover:text-slate-600 text-sm transition-colors">
            <Plus className="w-4 h-4" />
            Add custom item...
          </button>
        )}
      </div>
    </div>
  );
}
