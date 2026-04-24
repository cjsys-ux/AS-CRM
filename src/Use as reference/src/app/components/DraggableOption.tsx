import { motion } from 'motion/react';
import { Edit, Trash2, GripVertical } from 'lucide-react';
import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';

interface DraggableOptionProps {
  option: string;
  index: number;
  settingId: string;
  isEditing: boolean;
  editValue: string;
  onEdit: (settingId: string, option: string) => void;
  onDelete: (settingId: string, option: string) => void;
  onSaveEdit: (settingId: string, oldValue: string) => void;
  onCancelEdit: () => void;
  onEditValueChange: (value: string) => void;
  onMoveOption: (dragIndex: number, hoverIndex: number) => void;
}

const ITEM_TYPE = 'OPTION';

export function DraggableOption({
  option,
  index,
  settingId,
  isEditing,
  editValue,
  onEdit,
  onDelete,
  onSaveEdit,
  onCancelEdit,
  onEditValueChange,
  onMoveOption,
}: DraggableOptionProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop({
    accept: ITEM_TYPE,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: any, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      onMoveOption(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: ITEM_TYPE,
    item: () => {
      return { index, option };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: isDragging ? 0.5 : 1, x: 0 }}
      transition={{ delay: index * 0.02 }}
      className={`bg-white rounded-lg border border-slate-200 px-3 py-2 hover:shadow-sm hover:border-blue-200 transition-all group ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
      data-handler-id={handlerId}
    >
      {isEditing ? (
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-slate-300" />
          <input
            type="text"
            value={editValue}
            onChange={(e) => onEditValueChange(e.target.value)}
            className="flex-1 px-2.5 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            autoFocus
            onKeyPress={(e) => e.key === 'Enter' && onSaveEdit(settingId, option)}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSaveEdit(settingId, option)}
            className="px-2.5 py-1.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-xs"
          >
            Save
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCancelEdit}
            className="px-2.5 py-1.5 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition-colors text-xs"
          >
            Cancel
          </motion.button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 flex-1">
            <GripVertical className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors cursor-grab" />
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
            <span className="font-medium text-sm text-slate-900">{option}</span>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onEdit(settingId, option)}
              className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit className="w-3.5 h-3.5 text-blue-600" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onDelete(settingId, option)}
              className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-600" />
            </motion.button>
          </div>
        </div>
      )}
    </motion.div>
  );
}