import { motion, AnimatePresence } from 'motion/react';
import { Columns3, X, Check, Eye, EyeOff, GripVertical } from 'lucide-react';
import { useState, useEffect } from 'react';

export interface ColumnDef {
  key: string;
  label: string;
}

interface ColumnVisibilityDropdownProps {
  columns: ColumnDef[];
  visibleColumns: Record<string, boolean>;
  onChange: (visibleColumns: Record<string, boolean>) => void;
  columnOrder?: string[];
  onOrderChange?: (newOrder: string[]) => void;
  accentColor?: 'green' | 'blue' | 'indigo' | 'purple' | 'emerald' | 'cyan' | 'orange' | 'rose';
}

const accentStyles: Record<string, { header: string; chip: string; chipText: string; apply: string; toggle: string; toggleBg: string }> = {
  green: {
    header: 'from-green-600 to-emerald-600',
    chip: 'bg-green-50 border-green-300 text-green-700',
    chipText: 'text-green-600',
    apply: 'from-green-600 to-emerald-600',
    toggle: 'bg-green-500',
    toggleBg: 'bg-green-100',
  },
  blue: {
    header: 'from-blue-600 to-indigo-600',
    chip: 'bg-blue-50 border-blue-300 text-blue-700',
    chipText: 'text-blue-600',
    apply: 'from-blue-600 to-indigo-600',
    toggle: 'bg-blue-500',
    toggleBg: 'bg-blue-100',
  },
  indigo: {
    header: 'from-indigo-600 to-purple-600',
    chip: 'bg-indigo-50 border-indigo-300 text-indigo-700',
    chipText: 'text-indigo-600',
    apply: 'from-indigo-600 to-purple-600',
    toggle: 'bg-indigo-500',
    toggleBg: 'bg-indigo-100',
  },
  purple: {
    header: 'from-purple-600 to-violet-600',
    chip: 'bg-purple-50 border-purple-300 text-purple-700',
    chipText: 'text-purple-600',
    apply: 'from-purple-600 to-violet-600',
    toggle: 'bg-purple-500',
    toggleBg: 'bg-purple-100',
  },
  emerald: {
    header: 'from-emerald-600 to-teal-600',
    chip: 'bg-emerald-50 border-emerald-300 text-emerald-700',
    chipText: 'text-emerald-600',
    apply: 'from-emerald-600 to-teal-600',
    toggle: 'bg-emerald-500',
    toggleBg: 'bg-emerald-100',
  },
  cyan: {
    header: 'from-cyan-600 to-blue-600',
    chip: 'bg-cyan-50 border-cyan-300 text-cyan-700',
    chipText: 'text-cyan-600',
    apply: 'from-cyan-600 to-blue-600',
    toggle: 'bg-cyan-500',
    toggleBg: 'bg-cyan-100',
  },
  orange: {
    header: 'from-orange-500 to-amber-600',
    chip: 'bg-orange-50 border-orange-300 text-orange-700',
    chipText: 'text-orange-600',
    apply: 'from-orange-500 to-amber-600',
    toggle: 'bg-orange-500',
    toggleBg: 'bg-orange-100',
  },
  rose: {
    header: 'from-rose-600 to-pink-600',
    chip: 'bg-rose-50 border-rose-300 text-rose-700',
    chipText: 'text-rose-600',
    apply: 'from-rose-600 to-pink-600',
    toggle: 'bg-rose-500',
    toggleBg: 'bg-rose-100',
  },
};

export function ColumnVisibilityDropdown({ columns, visibleColumns, onChange, columnOrder, onOrderChange, accentColor = 'green' }: ColumnVisibilityDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<Record<string, boolean>>({});
  const [draftOrder, setDraftOrder] = useState<string[]>([]);
  const [draggedKey, setDraggedKey] = useState<string | null>(null);
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);
  const styles = accentStyles[accentColor] || accentStyles.green;

  useEffect(() => {
    if (isOpen) {
      setDraft({ ...visibleColumns });
      const order = columnOrder || columns.map(c => c.key);
      setDraftOrder([...order]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKey);
    }
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  const orderedColumns = draftOrder
    .map(key => columns.find(c => c.key === key))
    .filter(Boolean) as ColumnDef[];

  const visibleCount = orderedColumns.filter(c => draft[c.key] !== false).length;
  const allSelected = visibleCount === orderedColumns.length;

  const toggleColumn = (key: string) => {
    setDraft(prev => ({ ...prev, [key]: prev[key] === false ? true : false }));
  };

  const handleSelectAll = () => {
    if (allSelected) {
      const newDraft: Record<string, boolean> = {};
      columns.forEach(c => { newDraft[c.key] = c.key === 'actions' ? true : false; });
      setDraft(newDraft);
    } else {
      const newDraft: Record<string, boolean> = {};
      columns.forEach(c => { newDraft[c.key] = true; });
      setDraft(newDraft);
    }
  };

  const handleApply = () => {
    onChange(draft);
    if (onOrderChange) {
      onOrderChange(draftOrder);
    }
    setIsOpen(false);
  };

  const handleDiscard = () => {
    setIsOpen(false);
  };

  const handleDragStart = (key: string) => {
    setDraggedKey(key);
  };

  const handleDragOver = (e: React.DragEvent, key: string) => {
    e.preventDefault();
    if (draggedKey && key !== draggedKey) {
      setDragOverKey(key);
    }
  };

  const handleDrop = (e: React.DragEvent, targetKey: string) => {
    e.preventDefault();
    if (!draggedKey || draggedKey === targetKey) {
      setDraggedKey(null);
      setDragOverKey(null);
      return;
    }

    setDraftOrder(prev => {
      const newOrder = [...prev];
      const fromIndex = newOrder.indexOf(draggedKey);
      const toIndex = newOrder.indexOf(targetKey);
      if (fromIndex === -1 || toIndex === -1) return prev;
      newOrder.splice(fromIndex, 1);
      newOrder.splice(toIndex, 0, draggedKey);
      return newOrder;
    });

    setDraggedKey(null);
    setDragOverKey(null);
  };

  const handleDragEnd = () => {
    setDraggedKey(null);
    setDragOverKey(null);
  };

  const sidebar = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[9998]"
            onClick={() => setIsOpen(false)}
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-[380px] max-w-[90vw] bg-white shadow-2xl z-[9999] flex flex-col"
          >
            <div className={`bg-gradient-to-r ${styles.header} px-6 py-5 flex items-center justify-between shrink-0`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Columns3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Column Visibility</h3>
                  <p className="text-xs text-white/80 mt-0.5">{visibleCount} of {orderedColumns.length} columns visible</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="px-6 pt-5 pb-3 flex items-center justify-between border-b border-slate-100 shrink-0">
              <span className="text-sm font-medium text-slate-500">Toggle columns</span>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors"
              >
                {allSelected ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 dropdown-scroll">
              <div className="space-y-1">
                {orderedColumns.map((col, idx) => {
                  const isVisible = draft[col.key] !== false;
                  const isDragging = draggedKey === col.key;
                  const isDragOver = dragOverKey === col.key;
                  return (
                    <motion.div
                      key={col.key}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: isDragging ? 0.5 : 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      draggable
                      onDragStart={() => handleDragStart(col.key)}
                      onDragOver={(e) => handleDragOver(e, col.key)}
                      onDrop={(e) => handleDrop(e, col.key)}
                      onDragEnd={handleDragEnd}
                      className={`flex items-center gap-2 px-3 py-3 rounded-xl text-sm font-medium transition-all cursor-grab active:cursor-grabbing ${
                        isDragOver ? 'ring-2 ring-offset-1 ring-indigo-400' : ''
                      } ${
                        isVisible
                          ? `${styles.toggleBg} ${styles.chipText}`
                          : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      <GripVertical className="w-4 h-4 text-slate-400 shrink-0 cursor-grab" />

                      <button
                        type="button"
                        onClick={() => toggleColumn(col.key)}
                        className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${isVisible ? styles.toggle : 'bg-slate-300'}`}
                      >
                        <motion.div
                          animate={{ x: isVisible ? 16 : 2 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-md"
                        />
                      </button>

                      {isVisible ? (
                        <Eye className="w-4 h-4 shrink-0" />
                      ) : (
                        <EyeOff className="w-4 h-4 shrink-0" />
                      )}

                      <span className={`flex-1 text-left ${isVisible ? 'text-slate-800 font-semibold' : 'text-slate-400'}`}>
                        {col.label}
                      </span>

                      {isVisible && (
                        <Check className={`w-4 h-4 ${styles.chipText} shrink-0`} />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-slate-200 px-6 py-4 flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={handleDiscard}
                className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={handleApply}
                className={`flex-1 px-4 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r ${styles.apply} hover:shadow-lg transition-all`}
              >
                Apply Changes
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all"
      >
        <Columns3 className="w-4 h-4" />
        Columns
      </button>

      {sidebar}
    </>
  );
}
