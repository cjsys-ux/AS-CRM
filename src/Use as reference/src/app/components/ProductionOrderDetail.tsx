import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, Clock, AlertCircle, Factory, Calendar, User } from 'lucide-react';
import { useState } from 'react';

interface ProductionOrderDetailProps {
  isOpen: boolean;
  onClose: () => void;
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
}

const productionSteps = [
  { id: 1, name: 'Design Approval', duration: 2, status: 'completed', startDay: 0 },
  { id: 2, name: 'Material Procurement', duration: 3, status: 'completed', startDay: 2 },
  { id: 3, name: 'Pre-Production Setup', duration: 1, status: 'completed', startDay: 5 },
  { id: 4, name: 'Manufacturing', duration: 5, status: 'in-progress', startDay: 6, progress: 60 },
  { id: 5, name: 'Quality Control', duration: 2, status: 'pending', startDay: 11 },
  { id: 6, name: 'Packaging', duration: 1, status: 'pending', startDay: 13 },
  { id: 7, name: 'Shipping Preparation', duration: 1, status: 'pending', startDay: 14 },
];

const getStepColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-500';
    case 'in-progress':
      return 'bg-blue-500';
    case 'pending':
      return 'bg-slate-300';
    default:
      return 'bg-slate-200';
  }
};

const getStepIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-4 h-4 text-white" />;
    case 'in-progress':
      return <Clock className="w-4 h-4 text-white animate-spin" />;
    case 'pending':
      return <AlertCircle className="w-4 h-4 text-slate-500" />;
    default:
      return <AlertCircle className="w-4 h-4 text-slate-500" />;
  }
};

export function ProductionOrderDetail({ isOpen, onClose, order }: ProductionOrderDetailProps) {
  const totalDuration = 15; // Total project duration in days
  const progress = (order.completed / order.quantity) * 100;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="relative bg-slate-800 px-8 py-6 overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-red-400/20 rounded-full blur-3xl" />
                
                <div className="relative flex items-start justify-between">
                  <div className="flex items-center gap-5">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.2, type: 'spring' }}
                      className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center shadow-2xl"
                    >
                      <Factory className="w-8 h-8 text-white" />
                    </motion.div>
                    <div>
                      <motion.h2
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-3xl font-black text-white mb-1"
                      >
                        {order.orderName}
                      </motion.h2>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="flex items-center gap-3"
                      >
                        <span className="text-orange-100 font-semibold">{order.id}</span>
                        <span className="text-orange-200">•</span>
                        <span className="text-orange-100">{order.client}</span>
                      </motion.div>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="p-3 hover:bg-white/20 rounded-2xl transition-all"
                  >
                    <X className="w-7 h-7 text-white" />
                  </motion.button>
                </div>
              </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 border-2 border-blue-200"
                  >
                    <p className="text-sm font-bold text-blue-700 mb-1">Status</p>
                    <p className="text-2xl font-black text-blue-900">{order.status}</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 border-2 border-green-200"
                  >
                    <p className="text-sm font-bold text-green-700 mb-1">Progress</p>
                    <p className="text-2xl font-black text-green-900">{progress.toFixed(0)}%</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-5 border-2 border-purple-200"
                  >
                    <p className="text-sm font-bold text-purple-700 mb-1">Quality Score</p>
                    <p className="text-2xl font-black text-purple-900">{order.quality > 0 ? `${order.quality}%` : 'N/A'}</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-5 border-2 border-orange-200"
                  >
                    <p className="text-sm font-bold text-orange-700 mb-1">Quantity</p>
                    <p className="text-2xl font-black text-orange-900">{order.completed}/{order.quantity}</p>
                  </motion.div>
                </div>

                {/* Production Timeline - Gantt Chart Style */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white rounded-3xl border-2 border-slate-200 p-8 mb-6 shadow-xl"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900">Production Timeline</h3>
                  </div>

                  {/* Timeline Header */}
                  <div className="mb-6 pb-4 border-b-2 border-slate-200">
                    <div className="flex items-center gap-8">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        <span className="text-sm font-bold text-slate-700">Start: {order.startDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        <span className="text-sm font-bold text-slate-700">Due: {order.dueDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-500" />
                        <span className="text-sm font-bold text-slate-700">{order.assignedTo}</span>
                      </div>
                    </div>
                  </div>

                  {/* Gantt Chart */}
                  <div className="space-y-4">
                    {productionSteps.map((step, index) => {
                      const barWidth = (step.duration / totalDuration) * 100;
                      const barLeft = (step.startDay / totalDuration) * 100;
                      
                      return (
                        <motion.div
                          key={step.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 + index * 0.1 }}
                          className="group"
                        >
                          <div className="flex items-center gap-4 mb-2">
                            <div className="w-48 flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-xl ${getStepColor(step.status)} flex items-center justify-center shadow-md`}>
                                {getStepIcon(step.status)}
                              </div>
                              <span className="font-bold text-slate-900 text-sm">{step.name}</span>
                            </div>
                            <div className="flex-1 relative h-10 bg-slate-100 rounded-xl overflow-hidden border-2 border-slate-200">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${barWidth}%`, x: `${(barLeft / barWidth) * 100}%` }}
                                transition={{ duration: 0.8, delay: 0.8 + index * 0.1 }}
                                className={`absolute top-0 h-full ${getStepColor(step.status)} rounded-lg shadow-lg flex items-center justify-center`}
                              >
                                {step.status === 'in-progress' && step.progress && (
                                  <div className="absolute inset-0 bg-white/20 rounded-lg" style={{ width: `${step.progress}%` }} />
                                )}
                                <span className="relative text-xs font-bold text-white z-10">
                                  {step.duration}d
                                  {step.status === 'in-progress' && step.progress && ` • ${step.progress}%`}
                                </span>
                              </motion.div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Timeline Footer - Day Markers */}
                  <div className="mt-6 pt-4 border-t-2 border-slate-200">
                    <div className="flex items-center gap-4">
                      <div className="w-48" />
                      <div className="flex-1 flex justify-between text-xs font-bold text-slate-500">
                        <span>Day 0</span>
                        <span>Day 5</span>
                        <span>Day 10</span>
                        <span>Day 15</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Legend */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="bg-slate-50 rounded-2xl border-2 border-slate-200 p-6"
                >
                  <h4 className="font-bold text-slate-900 mb-4">Status Legend</h4>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-500 rounded" />
                      <span className="text-sm font-medium text-slate-700">Completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-500 rounded" />
                      <span className="text-sm font-medium text-slate-700">In Progress</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-slate-300 rounded" />
                      <span className="text-sm font-medium text-slate-700">Pending</span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Footer */}
              <div className="border-t-2 border-slate-200 p-6 bg-slate-50 flex items-center justify-end gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="px-8 py-3 bg-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-300 transition-all"
                >
                  Close
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-2xl shadow-xl transition-all"
                >
                  Update Status
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
