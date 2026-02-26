import { motion } from 'motion/react';
import { Clock, CheckCircle, AlertCircle, User, Package, FileText, Upload, MessageSquare, Edit } from 'lucide-react';
import { useState, useEffect } from 'react';


interface TimelineEvent {
  id: string;
  type: 'status_change' | 'file_upload' | 'comment' | 'edit' | 'milestone';
  title: string;
  description: string;
  user: string;
  timestamp: string;
  icon: 'check' | 'alert' | 'package' | 'file' | 'upload' | 'comment' | 'edit';
  color: string;
}

interface TimelineTabProps {
  productId?: string;
}

const getIcon = (iconType: string) => {
  switch (iconType) {
    case 'check':
      return CheckCircle;
    case 'alert':
      return AlertCircle;
    case 'package':
      return Package;
    case 'file':
      return FileText;
    case 'upload':
      return Upload;
    case 'comment':
      return MessageSquare;
    case 'edit':
      return Edit;
    default:
      return Clock;
  }
};

const getColorClasses = (color: string) => {
  switch (color) {
    case 'green':
      return {
        bg: 'bg-green-100',
        border: 'border-green-200',
        text: 'text-green-600',
        ring: 'ring-green-500/20',
      };
    case 'blue':
      return {
        bg: 'bg-blue-100',
        border: 'border-blue-200',
        text: 'text-blue-600',
        ring: 'ring-blue-500/20',
      };
    case 'purple':
      return {
        bg: 'bg-purple-100',
        border: 'border-purple-200',
        text: 'text-purple-600',
        ring: 'ring-purple-500/20',
      };
    case 'orange':
      return {
        bg: 'bg-orange-100',
        border: 'border-orange-200',
        text: 'text-orange-600',
        ring: 'ring-orange-500/20',
      };
    case 'indigo':
      return {
        bg: 'bg-indigo-100',
        border: 'border-indigo-200',
        text: 'text-indigo-600',
        ring: 'ring-indigo-500/20',
      };
    case 'red':
      return {
        bg: 'bg-red-100',
        border: 'border-red-200',
        text: 'text-red-600',
        ring: 'ring-red-500/20',
      };
    default:
      return {
        bg: 'bg-slate-100',
        border: 'border-slate-200',
        text: 'text-slate-600',
        ring: 'ring-slate-500/20',
      };
  }
};

export function TimelineTab({ productId = 'PRD-001' }: TimelineTabProps) {
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTimeline();
  }, [productId]);

  const fetchTimeline = () => {
    setTimeline([]);
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Timeline Stats - Moved to Top */}
      <div className="grid grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border-2 border-slate-200 p-6 hover:shadow-lg transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Comments</p>
              <h3 className="text-2xl font-bold text-slate-900">
                {timeline.filter(e => e.type === 'comment').length}
              </h3>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-xl border-2 border-slate-200 p-6 hover:shadow-lg transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Upload className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Uploads</p>
              <h3 className="text-2xl font-bold text-slate-900">
                {timeline.filter(e => e.type === 'file_upload').length}
              </h3>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl border-2 border-slate-200 p-6 hover:shadow-lg transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Status Changes</p>
              <h3 className="text-2xl font-bold text-slate-900">
                {timeline.filter(e => e.type === 'status_change').length}
              </h3>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-xl border-2 border-slate-200 p-6 hover:shadow-lg transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Edit className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Edits</p>
              <h3 className="text-2xl font-bold text-slate-900">
                {timeline.filter(e => e.type === 'edit').length}
              </h3>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Timeline with Scrollable Container */}
      <div className="bg-white rounded-xl border-2 border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-3">
          <Clock className="w-6 h-6 text-slate-600" />
          <h3 className="font-bold text-slate-900 text-lg">Activity Timeline</h3>
        </div>

        {/* Scrollable Timeline Content */}
        <div className="p-8 max-h-[600px] overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-12 h-12 mx-auto mb-4 border-4 border-slate-200 border-t-blue-500 rounded-full"
              />
              <p className="text-sm text-slate-600">Loading timeline...</p>
            </div>
          ) : timeline.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-2xl flex items-center justify-center">
                <Clock className="w-8 h-8 text-slate-400" />
              </div>
              <h4 className="font-bold text-slate-900 mb-2">No activity yet</h4>
              <p className="text-sm text-slate-600">
                Timeline events will appear here as actions are taken
              </p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-slate-200 via-slate-300 to-slate-200"></div>

              {/* Timeline Events */}
              <div className="space-y-6">
                {timeline.map((event, index) => {
                  const Icon = getIcon(event.icon);
                  const colors = getColorClasses(event.color);

                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="relative pl-16"
                    >
                      {/* Icon */}
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className={`absolute left-0 w-12 h-12 ${colors.bg} border-2 ${colors.border} rounded-xl flex items-center justify-center shadow-lg z-10`}
                      >
                        <Icon className={`w-6 h-6 ${colors.text}`} />
                      </motion.div>

                      {/* Content */}
                      <motion.div
                        whileHover={{ x: 4 }}
                        className={`bg-slate-50 rounded-xl border-2 border-slate-200 p-5 hover:shadow-lg transition-all`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-bold text-slate-900 mb-1">{event.title}</h4>
                            <p className="text-sm text-slate-600">{event.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <User className="w-4 h-4 text-blue-600" />
                            </div>
                            <span className="text-sm font-medium text-slate-700">{event.user}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <span className="text-sm text-slate-500">{event.timestamp}</span>
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
