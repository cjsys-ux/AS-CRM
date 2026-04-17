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

  const fetchTimeline = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/pipeline/timeline/list?productId=${encodeURIComponent(productId)}`);
      if (!res.ok) throw new Error('Failed to fetch timeline');
      const data = await res.json();
      setTimeline(data.timeline ?? []);
    } catch {
      setTimeline([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Timeline Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border-2 border-slate-200 px-3 py-2.5 sm:px-4 sm:py-3"
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs font-medium text-slate-600">Comments</p>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {timeline.filter(e => e.type === 'comment').length}
              </h3>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-xl border-2 border-slate-200 px-3 py-2.5 sm:px-4 sm:py-3"
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs font-medium text-slate-600">Uploads</p>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {timeline.filter(e => e.type === 'file_upload').length}
              </h3>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl border-2 border-slate-200 px-3 py-2.5 sm:px-4 sm:py-3"
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs font-medium text-slate-600">Status Changes</p>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {timeline.filter(e => e.type === 'status_change').length}
              </h3>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-xl border-2 border-slate-200 px-3 py-2.5 sm:px-4 sm:py-3"
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs font-medium text-slate-600">Edits</p>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {timeline.filter(e => e.type === 'edit').length}
              </h3>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Timeline with Scrollable Container */}
      <div className="bg-white rounded-xl border-2 border-slate-200 overflow-hidden">
        <div className="px-6 py-3 border-b border-slate-200 flex items-center gap-3">
          <Clock className="w-5 h-5 text-slate-600" />
          <h3 className="font-bold text-slate-900">Activity Timeline</h3>
        </div>

        {/* Scrollable Timeline Content */}
        <div className="p-5 max-h-[500px] overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-10 h-10 mx-auto mb-3 border-4 border-slate-200 border-t-blue-500 rounded-full"
              />
              <p className="text-sm text-slate-600">Loading timeline...</p>
            </div>
          ) : timeline.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-14 h-14 mx-auto mb-4 bg-slate-100 rounded-2xl flex items-center justify-center">
                <Clock className="w-7 h-7 text-slate-400" />
              </div>
              <h4 className="font-bold text-slate-900 mb-1">No activity yet</h4>
              <p className="text-sm text-slate-500">
                Timeline events will appear here as actions are taken
              </p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-[18px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-slate-200 via-slate-300 to-slate-200"></div>

              {/* Timeline Events */}
              <div className="space-y-3">
                {timeline.map((event, index) => {
                  const Icon = getIcon(event.icon);
                  const colors = getColorClasses(event.color);

                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="relative pl-12"
                    >
                      {/* Icon */}
                      <div
                        className={`absolute left-0 w-9 h-9 ${colors.bg} border ${colors.border} rounded-lg flex items-center justify-center z-10`}
                      >
                        <Icon className={`w-4 h-4 ${colors.text}`} />
                      </div>

                      {/* Content */}
                      <div className="bg-slate-50 rounded-lg border border-slate-200 px-4 py-3 hover:bg-slate-100 transition-colors">
                        <h4 className="font-semibold text-slate-900 text-sm">{event.title}</h4>
                        {event.description && (
                          <p className="text-xs text-slate-600 mt-0.5">{event.description}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2">
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center">
                              <User className="w-3 h-3 text-blue-600" />
                            </div>
                            <span className="text-xs font-medium text-slate-700">{event.user}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span className="text-xs text-slate-500 break-all">
                              {event.timestamp ? new Date(event.timestamp).toLocaleString() : ''}
                            </span>
                          </div>
                        </div>
                      </div>
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
