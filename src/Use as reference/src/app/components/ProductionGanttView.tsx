import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ZoomIn, ZoomOut, Calendar, Download, Filter, Settings, Maximize2, Users, Clock, CheckCircle, AlertCircle, TrendingUp, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

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
}

const tasks: Task[] = [
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

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return { bg: 'bg-green-500', text: 'text-green-700', light: 'bg-green-100' };
    case 'in-progress': return { bg: 'bg-blue-500', text: 'text-blue-700', light: 'bg-blue-100' };
    case 'delayed': return { bg: 'bg-red-500', text: 'text-red-700', light: 'bg-red-100' };
    case 'pending': return { bg: 'bg-slate-300', text: 'text-slate-700', light: 'bg-slate-100' };
    default: return { bg: 'bg-slate-300', text: 'text-slate-700', light: 'bg-slate-100' };
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

export function ProductionGanttView({ order, onClose }: ProductionGanttViewProps) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showCriticalPath, setShowCriticalPath] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [hoveredTask, setHoveredTask] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const ganttRef = useRef<HTMLDivElement>(null);

  const totalDays = 20;
  const dayWidth = 50 * zoomLevel;
  const today = 10; // Current day in the timeline

  const filteredTasks = selectedCategory === 'all' 
    ? tasks 
    : tasks.filter(t => t.category === selectedCategory);

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
  const totalProgress = tasks.reduce((sum, t) => sum + t.progress, 0) / tasks.length;
  const criticalPathTasks = tasks.filter(t => t.critical);

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col overflow-hidden">
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
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 bg-white text-orange-600 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <Settings className="w-4 h-4" />
              Settings
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

          <div className="flex items-center gap-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-3 border-2 border-orange-200">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-orange-700">In Progress</p>
              <p className="text-xl font-black text-orange-900">{inProgressTasks}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 border-2 border-purple-200">
            <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-purple-700">Critical Tasks</p>
              <p className="text-xl font-black text-purple-900">{criticalPathTasks.length}</p>
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

          <div className="flex items-center gap-3 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-3 border-2 border-slate-200">
            <div className="w-10 h-10 bg-slate-500 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700">Duration</p>
              <p className="text-xl font-black text-slate-900">{totalDays}d</p>
            </div>
          </div>
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="bg-white border-b-2 border-slate-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-slate-700">Zoom Level:</span>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}
              className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all"
            >
              <ZoomOut className="w-4 h-4 text-slate-700" />
            </motion.button>
            <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-500 to-red-600 transition-all" 
                style={{ width: `${((zoomLevel - 0.5) / 1.5) * 100}%` }}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.25))}
              className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all"
            >
              <ZoomIn className="w-4 h-4 text-slate-700" />
            </motion.button>
            <span className="text-sm font-bold text-slate-700 ml-2">{(zoomLevel * 100).toFixed(0)}%</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1 bg-green-100 border-2 border-green-200 rounded-lg">
            <div className="w-3 h-3 bg-green-500 rounded" />
            <span className="text-xs font-bold text-green-700">Completed</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 border-2 border-blue-200 rounded-lg">
            <div className="w-3 h-3 bg-blue-500 rounded" />
            <span className="text-xs font-bold text-blue-700">In Progress</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 border-2 border-slate-200 rounded-lg">
            <div className="w-3 h-3 bg-slate-300 rounded" />
            <span className="text-xs font-bold text-slate-700">Pending</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-red-100 border-2 border-red-200 rounded-lg">
            <div className="w-3 h-3 bg-red-500 rounded" />
            <span className="text-xs font-bold text-red-700">Critical Path</span>
          </div>
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="flex-1 overflow-auto bg-slate-50" ref={ganttRef}>
        <div className="min-w-max">
          {/* Timeline Header */}
          <div className="sticky top-0 z-30 bg-white border-b-2 border-slate-300 shadow-lg">
            <div className="flex">
              {/* Task Name Column Header */}
              <div className="w-80 flex-shrink-0 border-r-2 border-slate-300 bg-gradient-to-r from-slate-100 to-slate-50 px-4 py-4">
                <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">Task Name</h3>
              </div>
              
              {/* Timeline Days */}
              <div className="flex">
                {Array.from({ length: totalDays }, (_, i) => (
                  <div
                    key={i}
                    style={{ width: `${dayWidth}px` }}
                    className={`border-r border-slate-200 px-2 py-4 text-center ${
                      i === today ? 'bg-orange-100 border-orange-300 border-r-2' : 'bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-black text-slate-700">Day {i}</div>
                    {i === today && (
                      <div className="text-xs font-bold text-orange-600 mt-1">TODAY</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tasks */}
          <div className="relative">
            {/* Today Marker Line */}
            <div 
              className="absolute top-0 bottom-0 w-1 bg-orange-500 z-20 pointer-events-none"
              style={{ left: `${320 + (today * dayWidth)}px` }}
            >
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-orange-500 rounded-full shadow-lg" />
            </div>

            {filteredTasks.map((task, index) => {
              const colors = getStatusColor(task.status);
              const isCritical = showCriticalPath && task.critical;
              
              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={`flex border-b border-slate-200 hover:bg-slate-100 transition-all ${
                    hoveredTask === task.id ? 'bg-blue-50' : 'bg-white'
                  }`}
                  onMouseEnter={() => setHoveredTask(task.id)}
                  onMouseLeave={() => setHoveredTask(null)}
                >
                  {/* Task Info */}
                  <div className="w-80 flex-shrink-0 border-r-2 border-slate-200 px-4 py-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2 h-2 rounded-full ${getCategoryColor(task.category)}`} />
                      <h4 className="font-bold text-slate-900 text-sm">{task.name}</h4>
                      {isCritical && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-black rounded">CRITICAL</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-600">
                      <span className={`px-2 py-0.5 rounded ${colors.light} ${colors.text} font-bold`}>
                        {task.status.toUpperCase()}
                      </span>
                      <span className="font-semibold">{task.category}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <Users className="w-3 h-3 text-slate-500" />
                      <span className="text-slate-600 font-medium">{task.assignedTo}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-600 font-bold">{task.resources} resources</span>
                    </div>
                  </div>

                  {/* Timeline Bar */}
                  <div className="relative flex-1">
                    <div className="absolute inset-0 flex">
                      {Array.from({ length: totalDays }, (_, i) => (
                        <div
                          key={i}
                          style={{ width: `${dayWidth}px` }}
                          className={`border-r border-slate-100 ${i === today ? 'bg-orange-50' : ''}`}
                        />
                      ))}
                    </div>

                    {/* Task Bar */}
                    <div className="relative h-full py-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${task.duration * dayWidth}px` }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                        style={{
                          left: `${task.startDay * dayWidth}px`,
                        }}
                        className={`absolute h-10 rounded-xl shadow-lg cursor-pointer overflow-hidden ${
                          isCritical ? 'ring-4 ring-red-300' : ''
                        }`}
                      >
                        {/* Base bar */}
                        <div className={`h-full ${colors.bg} relative`}>
                          {/* Progress overlay */}
                          {task.progress < 100 && (
                            <div 
                              className="absolute inset-0 bg-white/30"
                              style={{ width: `${100 - task.progress}%`, right: 0, left: 'auto' }}
                            />
                          )}
                          
                          {/* Task label */}
                          <div className="absolute inset-0 flex items-center justify-center px-3">
                            <span className="text-white font-black text-xs truncate">
                              {task.progress}% • {task.duration}d
                            </span>
                          </div>

                          {/* Progress bar at bottom */}
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${task.progress}%` }}
                              transition={{ duration: 1, delay: index * 0.1 }}
                              className="h-full bg-white/60"
                            />
                          </div>
                        </div>

                        {/* Hover tooltip */}
                        {hoveredTask === task.id && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 bg-slate-900 text-white rounded-xl p-4 shadow-2xl z-40 pointer-events-none"
                          >
                            <div className="text-sm font-bold mb-2">{task.name}</div>
                            <div className="space-y-1 text-xs">
                              <div className="flex justify-between">
                                <span className="text-slate-300">Duration:</span>
                                <span className="font-bold">{task.duration} days</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-300">Progress:</span>
                                <span className="font-bold">{task.progress}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-300">Resources:</span>
                                <span className="font-bold">{task.resources}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-300">Assigned:</span>
                                <span className="font-bold">{task.assignedTo}</span>
                              </div>
                            </div>
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-900 rotate-45" />
                          </motion.div>
                        )}
                      </motion.div>

                      {/* Dependencies Lines */}
                      {task.dependencies.map(depId => {
                        const depTask = tasks.find(t => t.id === depId);
                        if (!depTask) return null;
                        
                        const depEndX = (depTask.startDay + depTask.duration) * dayWidth;
                        const taskStartX = task.startDay * dayWidth;
                        
                        return (
                          <svg
                            key={depId}
                            className="absolute top-0 left-0 pointer-events-none"
                            style={{ width: '100%', height: '100%' }}
                          >
                            <line
                              x1={depEndX}
                              y1={20}
                              x2={taskStartX}
                              y2={20}
                              stroke={isCritical ? '#ef4444' : '#cbd5e1'}
                              strokeWidth={isCritical ? 3 : 2}
                              strokeDasharray={isCritical ? '0' : '4 4'}
                              markerEnd="url(#arrowhead)"
                            />
                          </svg>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* SVG Defs for arrow markers */}
            <svg width="0" height="0">
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="10"
                  refX="9"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3, 0 6" fill="#cbd5e1" />
                </marker>
              </defs>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
