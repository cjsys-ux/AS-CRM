import { motion } from 'motion/react';
import { Shield, AlertTriangle, CheckCircle, Upload } from 'lucide-react';
import { ChecklistWidget } from './ChecklistWidget';

export function QualityTab() {
  return (
    <div className="space-y-6">
      {/* Quality Overview */}
      <div className="bg-white rounded-xl border-2 border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-green-600" />
            <h3 className="font-bold text-slate-900">Quality Inspection Status</h3>
          </div>
        </div>

        {/* Empty State */}
        <div className="px-6 py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-2xl flex items-center justify-center">
              <Shield className="w-8 h-8 text-slate-400" />
            </div>
            <h4 className="font-bold text-slate-900 mb-2">No Quality Reports</h4>
            <p className="text-sm text-slate-600 mb-6">
              Upload inspection reports and quality certificates for this product
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Upload className="w-5 h-5" />
              Upload Quality Report
            </motion.button>
          </div>
        </div>
      </div>

      {/* Quality Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border-2 border-green-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-slate-600">Passed Inspections</div>
              <div className="text-2xl font-bold text-green-600">0</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border-2 border-yellow-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <div className="text-sm text-slate-600">Pending Review</div>
              <div className="text-2xl font-bold text-yellow-600">0</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border-2 border-red-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <div className="text-sm text-slate-600">Failed Inspections</div>
              <div className="text-2xl font-bold text-red-600">0</div>
            </div>
          </div>
        </div>
      </div>

      {/* Checklist - Moved to Bottom */}
      <ChecklistWidget
        items={[
          { id: '1', label: 'Quality Standards Defined', completed: false },
          { id: '2', label: 'Initial Quality Check', completed: false },
          { id: '3', label: 'Compliance Certificates', completed: false },
          { id: '4', label: 'Final Inspection Report', completed: false }
        ]}
      />
    </div>
  );
}