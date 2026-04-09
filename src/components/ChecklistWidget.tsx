import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Circle, Plus, Trash2, PartyPopper } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';

export interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  isCustom?: boolean;
}

// Known checklist tab keys (items are loaded from General Settings, not hardcoded)
export const DEFAULT_CHECKLISTS: Record<string, ChecklistItem[]> = {
  vendors: [],
  specifications: [],
  packaging: [],
  samples: [],
  files: [],
};

interface ChecklistWidgetProps {
  productId?: string;
  tabId?: string;
  items?: ChecklistItem[];
  onUpdate?: (items: ChecklistItem[]) => void;
  onChecklistChanged?: (allChecklists: Record<string, ChecklistItem[]>) => void;
  onActivityDetected?: () => void;
}

export function ChecklistWidget({ productId, tabId, items: initialItems, onUpdate, onChecklistChanged, onActivityDetected }: ChecklistWidgetProps) {
  const [items, setItems] = useState<ChecklistItem[]>(
    initialItems || []
  );
  const [newItemText, setNewItemText] = useState('');
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Use a ref to always have the latest allChecklists available (avoids stale closure)
  const allChecklistsRef = useRef<Record<string, ChecklistItem[]>>({});

  // Helper: build default checklists from settings (no hardcoded fallback)
  const buildDefaults = useCallback(async (): Promise<Record<string, ChecklistItem[]>> => {
    try {
      const res = await fetch(`/api/settings/pipeline-checklists`);
      const data = await res.json();
      if (data.success && data.settings) {
        const settings = data.settings as Record<string, string[]>;
        const result: Record<string, ChecklistItem[]> = {};
        for (const [tabKey, labels] of Object.entries(settings)) {
          result[tabKey] = labels.map((label, idx) => ({
            id: `${tabKey.charAt(0)}${idx + 1}`,
            label,
            completed: false,
          }));
        }
        return result;
      }
    } catch (err) {
      console.error('Error loading pipeline checklist settings:', err);
    }
    // No settings saved — return empty checklists (user must configure in General Settings)
    return {};
  }, []);

  // Merge saved checklist items with the settings template:
  // - Keep items from settings template (preserving completed status if they existed in saved)
  // - Preserve custom items the user added to this specific product
  // - Remove items that were removed from settings (unless custom)
  const mergeWithTemplate = useCallback((savedItems: ChecklistItem[], templateItems: ChecklistItem[]): ChecklistItem[] => {
    const savedByLabel = new Map<string, ChecklistItem>();
    savedItems.forEach(item => savedByLabel.set(item.label, item));

    // Start with template items, preserving completion status from saved
    const merged: ChecklistItem[] = templateItems.map(templateItem => {
      const existing = savedByLabel.get(templateItem.label);
      if (existing) {
        return { ...templateItem, completed: existing.completed };
      }
      return { ...templateItem };
    });

    // Append any custom items the user added to this product
    savedItems.forEach(item => {
      if (item.isCustom) {
        merged.push(item);
      }
    });

    return merged;
  }, []);

  // Load checklist from backend on mount
  useEffect(() => {
    if (!productId) {
      setLoaded(true);
      return;
    }
    const loadChecklist = async () => {
      try {
        // Always fetch the settings template first
        const defaults = await buildDefaults();

        // Load from localStorage instead of API
        const localStorageKey = `product:${productId}:checklist`;
        const savedData = localStorage.getItem(localStorageKey);
        
        if (savedData) {
          try {
            const data = JSON.parse(savedData);
            // Merge each tab's saved checklist with the current settings template
            const mergedAll: Record<string, ChecklistItem[]> = {};
            for (const [tab, templateItems] of Object.entries(defaults)) {
              const savedTabItems = data[tab];
              if (savedTabItems && Array.isArray(savedTabItems)) {
                mergedAll[tab] = mergeWithTemplate(savedTabItems, templateItems as ChecklistItem[]);
              } else {
                mergedAll[tab] = templateItems as ChecklistItem[];
              }
            }
            // Also keep any tabs in saved that aren't in defaults (edge case)
            for (const [tab, items] of Object.entries(data)) {
              if (!mergedAll[tab]) {
                mergedAll[tab] = items as ChecklistItem[];
              }
            }

            allChecklistsRef.current = mergedAll;
            if (tabId && mergedAll[tabId]) {
              setItems(mergedAll[tabId]);
            }

            // Persist the merged result back to localStorage
            try {
              localStorage.setItem(localStorageKey, JSON.stringify(mergedAll));
            } catch (saveErr) {
              console.error('Error saving merged checklist to localStorage:', saveErr);
            }
          } catch (parseErr) {
            console.error('Error parsing checklist from localStorage:', parseErr);
            // Use defaults if parse fails
            allChecklistsRef.current = defaults;
            if (tabId) {
              setItems(defaults[tabId] || []);
            }
          }
        } else {
          // No product-specific checklist: use settings-defined defaults
          allChecklistsRef.current = defaults;
          if (tabId) {
            setItems(defaults[tabId] || []);
          }
        }
      } catch (err) {
        console.error('Error loading checklist:', err);
      } finally {
        setLoaded(true);
      }
    };
    loadChecklist();
  }, [productId, tabId, buildDefaults, mergeWithTemplate]);

  // Persist checklist to localStorage using the ref (no stale closure)
  const saveChecklist = useCallback(async (updatedItems: ChecklistItem[]) => {
    if (!productId || !tabId) return;

    // Always read from ref for latest data
    const updated = { ...allChecklistsRef.current, [tabId]: updatedItems };
    allChecklistsRef.current = updated;

    // Notify parent immediately
    onChecklistChanged?.(updated);

    try {
      // Save to localStorage instead of API
      const localStorageKey = `product:${productId}:checklist`;
      localStorage.setItem(localStorageKey, JSON.stringify(updated));
    } catch (err) {
      console.error('Error saving checklist to localStorage:', err);
    }
  }, [productId, tabId, onChecklistChanged]);

  const toggleItem = (id: string) => {
    if (!loaded) return; // Prevent saves before data loads
    const updatedItems = items.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setItems(updatedItems);
    onUpdate?.(updatedItems);
    saveChecklist(updatedItems);

    // Trigger auto-status if toggling ON
    const toggledItem = items.find(i => i.id === id);
    if (toggledItem && !toggledItem.completed) {
      onActivityDetected?.();
    }
  };

  const addCustomItem = () => {
    if (!loaded) return; // Prevent saves before data loads
    if (newItemText.trim()) {
      const newItem: ChecklistItem = {
        id: `custom-${Date.now()}`,
        label: newItemText.trim(),
        completed: false,
        isCustom: true,
      };
      const updatedItems = [...items, newItem];
      setItems(updatedItems);
      onUpdate?.(updatedItems);
      saveChecklist(updatedItems);
      setNewItemText('');
      setIsAddingItem(false);
    }
  };

  const deleteItem = (id: string) => {
    if (!loaded) return; // Prevent saves before data loads
    const updatedItems = items.filter(item => item.id !== id);
    setItems(updatedItems);
    onUpdate?.(updatedItems);
    saveChecklist(updatedItems);
  };

  const completedCount = items.filter(item => item.completed).length;
  const totalCount = items.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const prevProgressRef = useRef<number>(0);
  const [showCompleteBanner, setShowCompleteBanner] = useState(false);

  // Fire confetti when checklist hits 100%
  useEffect(() => {
    if (loaded && totalCount > 0 && progressPercent === 100 && prevProgressRef.current < 100) {
      // Fire confetti burst
      const duration = 2000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors: ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#3b82f6'],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors: ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#3b82f6'],
        });
        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();

      // Also fire a big center burst
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'],
      });

      setShowCompleteBanner(true);
      setTimeout(() => setShowCompleteBanner(false), 4000);
    }
    prevProgressRef.current = progressPercent;
  }, [progressPercent, loaded, totalCount]);

  return (
    <div className="bg-white rounded-xl border-2 border-slate-200 overflow-hidden">
      {/* Completion Banner */}
      <AnimatePresence>
        {showCompleteBanner && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 px-6 py-3 flex items-center justify-center gap-2 overflow-hidden"
          >
            <PartyPopper className="w-5 h-5 text-white" />
            <span className="text-white font-bold text-sm">
              🎉 {tabId ? `${tabId.charAt(0).toUpperCase() + tabId.slice(1)}` : ''} Checklist Complete!
            </span>
            <PartyPopper className="w-5 h-5 text-white" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <h3 className="font-bold text-slate-900">
            {tabId ? `${tabId.charAt(0).toUpperCase() + tabId.slice(1)} Checklist` : 'Checklist'}
          </h3>
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
            className={`h-full rounded-full ${
              progressPercent === 100
                ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                : progressPercent >= 70
                ? 'bg-gradient-to-r from-green-400 to-green-500'
                : progressPercent >= 40
                ? 'bg-gradient-to-r from-orange-400 to-amber-500'
                : 'bg-gradient-to-r from-red-400 to-red-500'
            }`}
          />
        </div>
      </div>

      {/* Checklist Items */}
      <div className="divide-y divide-slate-100">
        {loaded && items.length === 0 && (
          <div className="px-6 py-8 text-center">
            <Circle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No checklist items configured.</p>
            <p className="text-xs text-slate-400 mt-1">Set up checklists in General Settings, or add custom items below.</p>
          </div>
        )}
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