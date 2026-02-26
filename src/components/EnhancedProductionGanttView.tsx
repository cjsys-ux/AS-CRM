import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ZoomIn, ZoomOut, Calendar, Download, Filter, Settings, Maximize2, Users, Clock, CheckCircle, AlertCircle, TrendingUp, ChevronDown, Plus, Edit, Trash2, Save, X, GripVertical, Copy, FileText, MessageSquare, Paperclip } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

interface ProductionGanttViewProps {
  order: {
    id: string;
    orderName: string;
    client: string;
    status: string;
    priority: string;
    quantity: number;
    completed: number;
    startDate: string;
    dueDate: string;
    assignedTo: string;
    quality: number;
  };
  onClose: () => void;
}

interface Task {
  id: string;
  name: string;
  category: string;
  startDay: number;
  duration: number;
  progress: number;
  status: 'completed' | 'in-progress' | 'pending' | 'delayed';
  assignedTo: string;
  dependencies: string[];
  resources: number;
  critical: boolean;
  notes?: string;
}

const initialTasks: Task[] = [
  { id: 'T1', name: 'Design Approval', category: 'Planning', startDay: 0, duration: 2, progress: 100, status: 'completed', assignedTo: 'Design Team', dependencies: [], resources: 2, critical: true },
  { id: 'T2', name: 'Material Procurement', category: 'Procurement', startDay: 2, duration: 3, progress: 100, status: 'completed', assignedTo: 'Supply Chain', dependencies: ['T1'], resources: 3, critical: true },
  { id: 'T3', name: 'Equipment Setup', category: 'Setup', startDay: 2, duration: 2, progress: 100, status: 'completed', assignedTo: 'Production Line A', dependencies: ['T1'], resources: 4, critical: false },
  { id: 'T4', name: 'Pre-Production Sample', category: 'Quality', startDay: 5, duration: 1, progress: 100, status: 'completed', assignedTo: 'QA Team', dependencies: ['T2', 'T3'], resources: 2, critical: true },
  { id: 'T5', name: 'Manufacturing Phase 1', category: 'Production', startDay: 6, duration: 3, progress: 100, status: 'completed', assignedTo: 'Production Line A', dependencies: ['T4'], resources: 8, critical: true },
  { id: 'T6', name: 'Manufacturing Phase 2', category: 'Production', startDay: 9, duration: 3, progress: 60, status: 'in-progress', assignedTo: 'Production Line A', dependencies: ['T5'], resources: 8, critical: true },
  { id: 'T7', name: 'Interim Quality Check', category: 'Quality', startDay: 9, duration: 1, progress: 80, status: 'in-progress', assignedTo: 'QA Team', dependencies: ['T5'], resources: 3, critical: false },
  { id: 'T8', name: 'Manufacturing Phase 3', category: 'Production', startDay: 12, duration: 2, progress: 0, status: 'pending', assignedTo: 'Production Line A', dependencies: ['T6', 'T7'], resources: 8, critical: true },
  { id: 'T9', name: 'Final Quality Control', category: 'Quality', startDay: 14, duration: 2, progress: 0, status: 'pending', assignedTo: 'QA Team', dependencies: ['T8'], resources: 4, critical: true },
  { id: 'T10', name: 'Packaging', category: 'Finishing', startDay: 16, duration: 1, progress: 0, status: 'pending', assignedTo: 'Packaging Team', dependencies: ['T9'], resources: 5, critical: true },
  { id: 'T11', name: 'Labeling & Branding', category: 'Finishing', startDay: 16, duration: 1, progress: 0, status: 'pending', assignedTo: 'Branding Team', dependencies: ['T9'], resources: 3, critical: false },
  { id: 'T12', name: 'Final Inspection', category: 'Quality', startDay: 17, duration: 1, progress: 0, status: 'pending', assignedTo: 'QA Team', dependencies: ['T10', 'T11'], resources: 2, critical: true },
  { id: 'T13', name: 'Shipping Preparation', category: 'Logistics', startDay: 18, duration: 1, progress: 0, status: 'pending', assignedTo: 'Logistics', dependencies: ['T12'], resources: 4, critical: true },
];

const categories = ['Planning', 'Procurement', 'Setup', 'Quality', 'Production', 'Finishing', 'Logistics'];
const teams = ['Design Team', 'Supply Chain', 'Production Line A', 'Production Line B', 'QA Team', 'Packaging Team', 'Branding Team', 'Logistics'];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return { bg: 'bg-green-500', text: 'text-green-700', light: 'bg-green-100', border: 'border-green-300' };
    case 'in-progress': return { bg: 'bg-blue-500', text: 'text-blue-700', light: 'bg-blue-100', border: 'border-blue-300' };
    case 'delayed': return { bg: 'bg-red-500', text: 'text-red-700', light: 'bg-red-100', border: 'border-red-300' };
    case 'pending': return { bg: 'bg-slate-300', text: 'text-slate-700', light: 'bg-slate-100', border: 'border-slate-300' };
    default: return { bg: 'bg-slate-300', text: 'text-slate-700', light: 'bg-slate-100', border: 'border-slate-300' };
  }
};

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    'Planning': 'bg-purple-500',
    'Procurement': 'bg-orange-500',
    'Setup': 'bg-cyan-500',
    'Quality': 'bg-pink-500',
    'Production': 'bg-blue-500',
    'Finishing': 'bg-emerald-500',
    'Logistics': 'bg-amber-500',
  };
  return colors[category] || 'bg-slate-500';
};

export function EnhancedProductionGanttView({ order, onClose }: ProductionGanttViewProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showCriticalPath, setShowCriticalPath] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [hoveredTask, setHoveredTask] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [draggingTask, setDraggingTask] = useState<{ taskId: string; type: 'move' | 'resize-start' | 'resize-end' } | null>(null);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartValue, setDragStartValue] = useState(0);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const ganttRef = useRef<HTMLDivElement>(null);

  const totalDays = 25;
  const dayWidth = 50 * zoomLevel;
  const today = 10;

  const filteredTasks = selectedCategory === 'all' 
    ? tasks 
    : tasks.filter(t => t.category === selectedCategory);

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
  const totalProgress = tasks.reduce((sum, t) => sum + t.progress, 0) / tasks.length;

  // Add new task
  const handleAddTask = (newTask: Omit<Task, 'id'>) => {
    const id = `T${tasks.length + 1}`;
    setTasks([...tasks, { ...newTask, id }]);
    setShowAddTaskModal(false);
  };

  // Edit task
  const handleEditTask = (updatedTask: Task) => {
    setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
    setEditingTask(null);
    setSelectedTask(null);
  };

  // Delete task
  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
    setSelectedTask(null);
  };

  // Duplicate task - insert right below the original
  const handleDuplicateTask = (task: Task) => {
    const taskIndex = tasks.findIndex(t => t.id === task.id);
    const newTask = {
      ...task,
      id: `T${tasks.length + 1}`,
      name: `${task.name} (Copy)`,
      progress: 0,
      status: 'pending' as const
    };
    // Insert new task right after the original
    const newTasks = [...tasks];
    newTasks.splice(taskIndex + 1, 0, newTask);
    setTasks(newTasks);
  };

  // Handle mouse down on task bar (for dragging)
  const handleMouseDown = (e: React.MouseEvent, task: Task, type: 'move' | 'resize-start' | 'resize-end') => {
    e.preventDefault();
    setDraggingTask({ taskId: task.id, type });
    setDragStartX(e.clientX);
    if (type === 'move') {
      setDragStartValue(task.startDay);
    } else if (type === 'resize-end') {
      setDragStartValue(task.duration);
    } else {
      setDragStartValue(task.startDay);
    }
  };

  // Handle mouse move (dragging)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingTask) return;

      const deltaX = e.clientX - dragStartX;
      const deltaDays = Math.round(deltaX / dayWidth);

      const task = tasks.find(t => t.id === draggingTask.taskId);
      if (!task) return;

      if (draggingTask.type === 'move') {
        const newStartDay = Math.max(0, dragStartValue + deltaDays);
        setTasks(tasks.map(t => 
          t.id === draggingTask.taskId 
            ? { ...t, startDay: newStartDay }
            : t
        ));
      } else if (draggingTask.type === 'resize-end') {
        const newDuration = Math.max(1, dragStartValue + deltaDays);
        setTasks(tasks.map(t => 
          t.id === draggingTask.taskId 
            ? { ...t, duration: newDuration }
            : t
        ));
      } else if (draggingTask.type === 'resize-start') {
        const newStartDay = Math.max(0, dragStartValue + deltaDays);
        const durationChange = task.startDay - newStartDay;
        const newDuration = Math.max(1, task.duration + durationChange);
        setTasks(tasks.map(t => 
          t.id === draggingTask.taskId 
            ? { ...t, startDay: newStartDay, duration: newDuration }
            : t
        ));
      }
    };

    const handleMouseUp = () => {
      setDraggingTask(null);
    };

    if (draggingTask) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggingTask, dragStartX, dragStartValue, dayWidth, tasks]);

  return (
    <div className="flex-1 flex overflow-hidden bg-slate-50">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 px-6 py-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05, x: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-xl backdrop-blur-sm transition-all"
              >
                <ArrowLeft className="w-6 h-6 text-white" />
              </motion.button>
              <div>
                <h1 className="text-2xl font-black text-white">{order.orderName}</h1>
                <p className="text-sm text-orange-100 font-medium">{order.id} • {order.client}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddTaskModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white text-orange-600 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Task
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                  showFilters ? 'bg-white text-orange-600' : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filters
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-white font-semibold transition-all"
              >
                <Download className="w-4 h-4" />
                Export
              </motion.button>
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-white border-b-2 border-slate-200 overflow-hidden"
            >
              <div className="px-6 py-4">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-700">Category:</span>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-4 py-2 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="all">All Categories</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={showCriticalPath}
                      onChange={(e) => setShowCriticalPath(e.target.checked)}
                      className="w-5 h-5 rounded border-2 border-slate-300 text-orange-600 focus:ring-orange-500"
                      id="critical-path"
                    />
                    <label htmlFor="critical-path" className="text-sm font-bold text-slate-700 cursor-pointer">
                      Highlight Critical Path
                    </label>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Bar */}
        <div className="bg-white border-b-2 border-slate-200 px-6 py-4">
          <div className="grid grid-cols-6 gap-4">
            <div className="flex items-center gap-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border-2 border-blue-200">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-blue-700">Total Progress</p>
                <p className="text-xl font-black text-blue-900">{totalProgress.toFixed(0)}%</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 border-2 border-green-200">
              <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-green-700">Completed</p>
                <p className="text-xl font-black text-green-900">{completedTasks}/{tasks.length}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 border-2 border-purple-200">
              <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-purple-700">In Progress</p>
                <p className="text-xl font-black text-purple-900">{inProgressTasks}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-3 border-2 border-orange-200">
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-orange-700">Total Tasks</p>
                <p className="text-xl font-black text-orange-900">{tasks.length}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl p-3 border-2 border-cyan-200">
              <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-cyan-700">Critical Path</p>
                <p className="text-xl font-black text-cyan-900">{tasks.filter(t => t.critical).length}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-3 border-2 border-pink-200">
              <div className="w-10 h-10 bg-pink-500 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-pink-700">Resources</p>
                <p className="text-xl font-black text-pink-900">{tasks.reduce((sum, t) => sum + t.resources, 0)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-slate-700">Zoom:</span>
            <div className="flex items-center gap-2 bg-white rounded-xl p-1 border-2 border-slate-200">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ZoomOut className="w-4 h-4 text-slate-700" />
              </motion.button>
              <span className="px-3 text-sm font-bold text-slate-900">{(zoomLevel * 100).toFixed(0)}%</span>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.25))}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ZoomIn className="w-4 h-4 text-slate-700" />
              </motion.button>
            </div>
          </div>
          <div className="text-xs text-slate-500 italic">
            💡 Tip: Drag task bars to move them • Drag edges to resize • Click to edit
          </div>
        </div>

        {/* Gantt Chart */}
        <div className="flex-1 overflow-auto bg-white" ref={ganttRef}>
          <div className="flex">
            {/* Task Names Column */}
            <div className="sticky left-0 z-20 bg-white border-r-2 border-slate-300 w-80">
              {/* Header */}
              <div className="h-12 bg-gradient-to-r from-slate-100 to-slate-200 border-b-2 border-slate-300 px-4 flex items-center">
                <span className="text-sm font-black text-slate-700 uppercase">Task Name</span>
              </div>
              {/* Task Rows */}
              {filteredTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={`h-16 border-b border-slate-200 px-4 flex items-center justify-between group cursor-pointer hover:bg-slate-50 transition-colors ${
                    selectedTask?.id === task.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                  onClick={() => setSelectedTask(task)}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`w-3 h-3 rounded-full ${getCategoryColor(task.category)}`} />
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-slate-900">{task.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-500">{task.assignedTo}</span>
                        {task.critical && (
                          <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded">CRITICAL</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingTask(task);
                      }}
                      className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5 text-blue-600" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicateTask(task);
                      }}
                      className="p-1.5 hover:bg-green-100 rounded-lg transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5 text-green-600" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setTaskToDelete(task);
                        setShowDeleteModal(true);
                      }}
                      className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-600" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Timeline Column */}
            <div className="flex-1 relative">
              {/* Timeline Header */}
              <div className="h-12 bg-gradient-to-r from-slate-100 to-slate-200 border-b-2 border-slate-300 flex sticky top-0 z-10">
                {Array.from({ length: totalDays }, (_, i) => (
                  <div
                    key={i}
                    className="border-r border-slate-300 flex items-center justify-center"
                    style={{ width: dayWidth }}
                  >
                    <span className="text-xs font-bold text-slate-700">Day {i + 1}</span>
                  </div>
                ))}
              </div>

              {/* Task Bars */}
              <div className="relative">
                {/* Today Marker */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-red-500 z-10"
                  style={{ left: today * dayWidth }}
                >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded whitespace-nowrap">
                    TODAY
                  </div>
                </div>

                {/* Grid Lines */}
                {Array.from({ length: totalDays }, (_, i) => (
                  <div
                    key={i}
                    className="absolute top-0 bottom-0 border-r border-slate-200"
                    style={{ left: i * dayWidth }}
                  />
                ))}

                {/* Task Bars */}
                {filteredTasks.map((task, index) => {
                  const statusColor = getStatusColor(task.status);
                  const left = task.startDay * dayWidth;
                  const width = task.duration * dayWidth;
                  const top = index * 64; // 64px = h-16

                  return (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.03 }}
                      className="absolute h-12 cursor-move group/bar"
                      style={{
                        left,
                        width,
                        top: top + 8,
                      }}
                      onMouseDown={(e) => handleMouseDown(e, task, 'move')}
                      onMouseEnter={() => setHoveredTask(task.id)}
                      onMouseLeave={() => setHoveredTask(null)}
                    >
                      {/* Task Bar */}
                      <div
                        className={`h-full rounded-xl ${statusColor.light} border-2 ${statusColor.border} shadow-lg hover:shadow-xl transition-all relative overflow-hidden ${
                          showCriticalPath && task.critical ? 'ring-2 ring-red-400 ring-offset-2' : ''
                        } ${selectedTask?.id === task.id ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                      >
                        {/* Progress Bar */}
                        <div
                          className={`absolute inset-0 ${statusColor.bg} opacity-40`}
                          style={{ width: `${task.progress}%` }}
                        />

                        {/* Task Info */}
                        <div className="absolute inset-0 px-3 flex items-center justify-between">
                          <span className={`text-xs font-bold ${statusColor.text} truncate`}>
                            {task.name}
                          </span>
                          <span className={`text-xs font-bold ${statusColor.text}`}>
                            {task.duration}d
                          </span>
                        </div>

                        {/* Resize Handles */}
                        <div
                          className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize opacity-0 group-hover/bar:opacity-100 hover:bg-slate-900/20 transition-all"
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            handleMouseDown(e, task, 'resize-start');
                          }}
                        />
                        <div
                          className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize opacity-0 group-hover/bar:opacity-100 hover:bg-slate-900/20 transition-all"
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            handleMouseDown(e, task, 'resize-end');
                          }}
                        />
                      </div>

                      {/* Tooltip on Hover */}
                      {hoveredTask === task.id && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute top-full mt-2 left-0 bg-slate-900 text-white p-3 rounded-xl shadow-2xl z-30 min-w-64"
                        >
                          <p className="font-bold text-sm mb-2">{task.name}</p>
                          <div className="space-y-1 text-xs">
                            <p><strong>Category:</strong> {task.category}</p>
                            <p><strong>Duration:</strong> {task.duration} days</p>
                            <p><strong>Progress:</strong> {task.progress}%</p>
                            <p><strong>Assigned:</strong> {task.assignedTo}</p>
                            <p><strong>Resources:</strong> {task.resources} people</p>
                            {task.dependencies.length > 0 && (
                              <p><strong>Depends on:</strong> {task.dependencies.join(', ')}</p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Task Details */}
      <AnimatePresence>
        {selectedTask && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            className="w-96 bg-white border-l-2 border-slate-300 shadow-2xl overflow-y-auto"
          >
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 z-10">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-white">Task Details</h3>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedTask(null)}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </motion.button>
              </div>
              <p className="text-blue-100 text-sm">{selectedTask.id}</p>
            </div>

            <div className="p-6 space-y-4">
              {/* Task Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">Task Name</label>
                <p className="text-lg font-bold text-slate-900">{selectedTask.name}</p>
              </div>

              {/* Status Badge */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">Status</label>
                <span className={`inline-flex px-3 py-1.5 rounded-lg text-sm font-bold ${getStatusColor(selectedTask.status).light} ${getStatusColor(selectedTask.status).text} border-2 ${getStatusColor(selectedTask.status).border}`}>
                  {selectedTask.status.toUpperCase()}
                </span>
              </div>

              {/* Progress */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">Progress</label>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all"
                      style={{ width: `${selectedTask.progress}%` }}
                    />
                  </div>
                  <span className="text-lg font-bold text-slate-900">{selectedTask.progress}%</span>
                </div>
              </div>

              {/* Timeline */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">Start Day</label>
                  <p className="text-sm font-semibold text-slate-900">Day {selectedTask.startDay + 1}</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">Duration</label>
                  <p className="text-sm font-semibold text-slate-900">{selectedTask.duration} days</p>
                </div>
              </div>

              {/* Assignment */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">Assigned To</label>
                <div className="flex items-center gap-2 p-3 bg-blue-50 border-2 border-blue-200 rounded-xl">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-900">{selectedTask.assignedTo}</span>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">Category</label>
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full ${getCategoryColor(selectedTask.category)}`} />
                  <span className="text-sm font-semibold text-slate-900">{selectedTask.category}</span>
                </div>
              </div>

              {/* Resources */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">Resources</label>
                <p className="text-sm font-semibold text-slate-900">{selectedTask.resources} people</p>
              </div>

              {/* Critical Path */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">Critical Path</label>
                <span className={`inline-flex px-3 py-1.5 rounded-lg text-sm font-bold ${
                  selectedTask.critical 
                    ? 'bg-red-100 text-red-700 border-2 border-red-300' 
                    : 'bg-slate-100 text-slate-700 border-2 border-slate-300'
                }`}>
                  {selectedTask.critical ? 'YES' : 'NO'}
                </span>
              </div>

              {/* Dependencies */}
              {selectedTask.dependencies.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">Dependencies</label>
                  <div className="space-y-2">
                    {selectedTask.dependencies.map(depId => {
                      const depTask = tasks.find(t => t.id === depId);
                      return depTask ? (
                        <div key={depId} className="p-2 bg-slate-100 rounded-lg border border-slate-200">
                          <p className="text-sm font-semibold text-slate-900">{depTask.name}</p>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setEditingTask(selectedTask)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  <Edit className="w-4 h-4" />
                  Edit Task
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleDuplicateTask(selectedTask)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all"
                >
                  <Copy className="w-4 h-4" />
                  Duplicate Task
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setTaskToDelete(selectedTask);
                    setShowDeleteModal(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Task
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Task Modal */}
      <TaskEditorModal
        isOpen={showAddTaskModal || editingTask !== null}
        onClose={() => {
          setShowAddTaskModal(false);
          setEditingTask(null);
        }}
        task={editingTask}
        onSave={(task) => {
          if (editingTask) {
            handleEditTask(task as Task);
          } else {
            handleAddTask(task);
          }
        }}
        existingTasks={tasks}
      />

      {/* Delete Task Modal */}
      <AnimatePresence>
        {showDeleteModal && taskToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDeleteModal(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <Trash2 className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Delete Task</h3>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowDeleteModal(false)}
                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </motion.button>
                </div>
              </div>

              {/* Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleDeleteTask(taskToDelete.id);
                  setShowDeleteModal(false);
                }}
                className="p-6 space-y-4"
              >
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Task Name</label>
                  <p className="text-lg font-bold text-slate-900">{taskToDelete.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
                  <p className="text-sm font-semibold text-slate-900">{taskToDelete.category}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Assigned To</label>
                  <p className="text-sm font-semibold text-slate-900">{taskToDelete.assignedTo}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Duration (days)</label>
                  <p className="text-sm font-semibold text-slate-900">{taskToDelete.duration}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Resources (people)</label>
                  <p className="text-sm font-semibold text-slate-900">{taskToDelete.resources}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-4">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4 inline mr-2" />
                    Delete Task
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Task Editor Modal Component
interface TaskEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onSave: (task: Omit<Task, 'id'> | Task) => void;
  existingTasks: Task[];
}

function TaskEditorModal({ isOpen, onClose, task, onSave, existingTasks }: TaskEditorModalProps) {
  const [formData, setFormData] = useState<Omit<Task, 'id'>>({
    name: '',
    category: 'Planning',
    startDay: 0,
    duration: 1,
    progress: 0,
    status: 'pending',
    assignedTo: 'Production Line A',
    dependencies: [],
    resources: 1,
    critical: false,
  });

  useEffect(() => {
    if (task) {
      setFormData(task);
    } else {
      setFormData({
        name: '',
        category: 'Planning',
        startDay: 0,
        duration: 1,
        progress: 0,
        status: 'pending',
        assignedTo: 'Production Line A',
        dependencies: [],
        resources: 1,
        critical: false,
      });
    }
  }, [task, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (task) {
      onSave({ ...formData, id: task.id });
    } else {
      onSave(formData);
    }
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
          className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-red-600 px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  {task ? <Edit className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 text-white" />}
                </div>
                <h3 className="text-xl font-bold text-white">{task ? 'Edit Task' : 'Add New Task'}</h3>
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Task Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Task Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                placeholder="e.g., Design Approval"
                required
              />
            </div>

            {/* Category and Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Status *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Task['status'] })}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="delayed">Delayed</option>
                </select>
              </div>
            </div>

            {/* Start Day and Duration */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Start Day *</label>
                <input
                  type="number"
                  min="0"
                  value={formData.startDay}
                  onChange={(e) => setFormData({ ...formData, startDay: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Duration (days) *</label>
                <input
                  type="number"
                  min="1"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  required
                />
              </div>
            </div>

            {/* Assigned To and Resources */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Assigned To *</label>
                <select
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                >
                  {teams.map(team => (
                    <option key={team} value={team}>{team}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Resources (people) *</label>
                <input
                  type="number"
                  min="1"
                  value={formData.resources}
                  onChange={(e) => setFormData({ ...formData, resources: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  required
                />
              </div>
            </div>

            {/* Progress */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Progress: {formData.progress}%</label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={formData.progress}
                onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>

            {/* Critical Path */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.critical}
                onChange={(e) => setFormData({ ...formData, critical: e.target.checked })}
                className="w-5 h-5 rounded border-2 border-slate-300 text-red-600 focus:ring-red-500"
                id="critical"
              />
              <label htmlFor="critical" className="text-sm font-semibold text-slate-700 cursor-pointer">
                Mark as Critical Path Task
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-4">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                <Save className="w-4 h-4 inline mr-2" />
                {task ? 'Save Changes' : 'Add Task'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}