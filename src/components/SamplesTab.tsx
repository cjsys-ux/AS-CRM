import { motion } from 'motion/react';
import { Plus, Upload, Package, FileText, Image as ImageIcon, ShoppingCart, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { ChecklistWidget } from './ChecklistWidget';
import { AddSampleDrawer } from './AddSampleDrawer';
import { OrderSampleDrawer } from './OrderSampleDrawer';

export function SamplesTab() {
  const [samples] = useState<any[]>([]);
  const [isAddSampleDrawerOpen, setIsAddSampleDrawerOpen] = useState(false);
  const [isOrderSampleDrawerOpen, setIsOrderSampleDrawerOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Sample Tracking - NEW SECTION */}
      <div className="bg-white rounded-xl border-2 border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-slate-700" />
            <h3 className="font-bold text-slate-900">Sample Tracking</h3>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsOrderSampleDrawerOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Order Sample
          </motion.button>
        </div>

        {/* Empty State */}
        <div className="px-6 py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-2xl flex items-center justify-center">
              <Package className="w-8 h-8 text-slate-400" />
            </div>
            <h4 className="font-bold text-slate-900 mb-2">No Samples Yet</h4>
            <p className="text-sm text-slate-600">
              Start tracking samples from competitors and factories to monitor quality improvements
            </p>
          </div>
        </div>
      </div>

      {/* Sample Feedback - RENAMED FROM Sample Tracking */}
      <div className="bg-white rounded-xl border-2 border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-slate-700" />
            <h3 className="font-bold text-slate-900">Sample Feedback</h3>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsAddSampleDrawerOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Sample
          </motion.button>
        </div>

        {/* Empty State */}
        {samples.length === 0 && (
          <div className="px-6 py-16">
            <div className="max-w-md mx-auto text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-2xl flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-slate-400" />
              </div>
              <h4 className="font-bold text-slate-900 mb-2">No Feedback Yet</h4>
              <p className="text-sm text-slate-600">
                Start collecting feedback on samples to improve product quality
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Sample Documents */}
      <div className="bg-white rounded-xl border-2 border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-slate-900">Sample Documents</h3>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Upload Document
          </motion.button>
        </div>

        {/* Empty State */}
        <div className="px-6 py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-2xl flex items-center justify-center">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <h4 className="font-bold text-slate-900 mb-2">No sample documents uploaded</h4>
            <p className="text-sm text-slate-600">
              Upload specs, compliance docs, or sample certificates
            </p>
          </div>
        </div>
      </div>

      {/* Sample Images */}
      <div className="bg-white rounded-xl border-2 border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ImageIcon className="w-5 h-5 text-pink-600" />
            <h3 className="font-bold text-slate-900">Sample Images</h3>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Upload Image
          </motion.button>
        </div>

        {/* Empty State */}
        <div className="px-6 py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-2xl flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-slate-400" />
            </div>
            <h4 className="font-bold text-slate-900 mb-2">No sample images uploaded</h4>
            <p className="text-sm text-slate-600">
              Upload photos of sample products for visual reference
            </p>
          </div>
        </div>
      </div>

      {/* Checklist - Moved to Bottom */}
      <ChecklistWidget
        items={[
          { id: '1', label: 'Sample Request Submitted', completed: false },
          { id: '2', label: 'Sample Received', completed: false },
          { id: '3', label: 'Quality Review Completed', completed: false },
          { id: '4', label: 'Sample Documentation', completed: false }
        ]}
      />

      {/* Add Sample Drawer */}
      <AddSampleDrawer
        isOpen={isAddSampleDrawerOpen}
        onClose={() => setIsAddSampleDrawerOpen(false)}
        onSuccess={() => {
          // Refresh samples list here if needed
        }}
      />

      {/* Order Sample Drawer */}
      <OrderSampleDrawer
        isOpen={isOrderSampleDrawerOpen}
        onClose={() => setIsOrderSampleDrawerOpen(false)}
        onSuccess={() => {
          // Refresh samples list here if needed
        }}
      />
    </div>
  );
}