import { motion, AnimatePresence } from 'motion/react';
import { Columns3, X, Check, GripVertical } from 'lucide-react';
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
  accentColor?: string;
}

export function ColumnVisibilityDropdown({ columns, visibleColumns, onChange, columnOrder, onOrderChange }: ColumnVisibilityDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<Record<string, boolean>>({});
  const [draftOrder, setDraftOrder] = useState<string[]>([]);
  const [draggedKey, setDraggedKey] = useState<string | null>(null);
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);

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
    onChange({ ...draft });
    if (onOrderChange) {
      onOrderChange([...draftOrder]);
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
            className="fixed top-0 right-0 h-full w-[360px] max-w-[90vw] bg-white shadow-2xl z-[9999] flex flex-col"
          >
            {/* Header */}
            <div className="bg-slate-800 px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/15 rounded-lg flex items-center justify-center">
                  <Columns3 className="w-4.5 h-4.5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Toggle Columns</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{visibleCount} of {orderedColumns.length} visible</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/15 rounded-lg transition-colors"
              >
                <X className="w-4.5 h-4.5 text-white" />
              </button>
            </div>

            {/* Select All / Deselect All */}
            <div className="px-5 pt-4 pb-2 flex items-center justify-between border-b border-slate-100 shrink-0">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Columns</span>
              <button
                onClick={handleSelectAll}
                className="text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors"
              >
                {allSelected ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            {/* Column List */}
            <div className="flex-1 overflow-y-auto px-3 py-2">
              <div className="space-y-0.5">
                {orderedColumns.map((col, idx) => {
                  const isVisible = draft[col.key] !== false;
                  const isDragging = draggedKey === col.key;
                  const isDragOver = dragOverKey === col.key;
                  return (
                    <motion.div
                      key={col.key}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: isDragging ? 0.4 : 1, x: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      draggable
                      onDragStart={() => handleDragStart(col.key)}
                      onDragOver={(e) => handleDragOver(e, col.key)}
                      onDrop={(e) => handleDrop(e, col.key)}
                      onDragEnd={handleDragEnd}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all cursor-grab active:cursor-grabbing ${
                        isDragOver ? 'ring-2 ring-blue-300' : ''
                      } ${
                        isVisible
                          ? 'bg-slate-50 hover:bg-slate-100'
                          : 'bg-white hover:bg-slate-50'
                      }`}
                    >
                      <GripVertical className="w-3.5 h-3.5 text-slate-300 shrink-0 cursor-grab" />

                      {/* Toggle switch */}
                      <button
                        onClick={() => toggleColumn(col.key)}
                        className={`relative w-8 h-[18px] rounded-full transition-colors shrink-0 ${isVisible ? 'bg-slate-700' : 'bg-slate-200'}`}
                      >
                        <motion.div
                          animate={{ x: isVisible ? 14 : 2 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          className="absolute top-[2px] w-[14px] h-[14px] bg-white rounded-full shadow-sm"
                        />
                      </button>

                      {/* Label */}
                      <span className={`flex-1 text-left text-sm ${isVisible ? 'text-slate-800 font-medium' : 'text-slate-400'}`}>
                        {col.label}
                      </span>

                      {/* Check indicator */}
                      {isVisible && (
                        <Check className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 px-5 py-3 flex items-center gap-3 shrink-0">
              <button
                onClick={handleDiscard}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Discard
              </button>
              <button
                onClick={handleApply}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 transition-colors"
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
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all"
      >
        <Columns3 className="w-4 h-4" />
        Columns
      </button>

      {sidebar}
    </>
  );
}
