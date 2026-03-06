import { motion } from 'motion/react';
import { Plus, Upload, Package, FileText, Image as ImageIcon, ShoppingCart, MessageSquare, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { ChecklistWidget } from './ChecklistWidget';
import { AddSampleDrawer } from './AddSampleDrawer';
import { OrderSampleDrawer } from './OrderSampleDrawer';

interface SamplesTabProps {
  productId?: string;
}

export function SamplesTab({ productId = '' }: SamplesTabProps) {
  const [samples, setSamples] = useState<any[]>([]);
  const [isAddSampleDrawerOpen, setIsAddSampleDrawerOpen] = useState(false);
  const [isOrderSampleDrawerOpen, setIsOrderSampleDrawerOpen] = useState(false);
  const [sampleDocuments, setSampleDocuments] = useState<File[]>([]);
  const [sampleImages, setSampleImages] = useState<File[]>([]);

  useEffect(() => {
    if (productId) fetchSamples();
  }, [productId]);

  const fetchSamples = async () => {
    try {
      const res = await fetch(`/api/pipeline/samples/list?productId=${encodeURIComponent(productId)}`);
      if (!res.ok) throw new Error('Failed to fetch samples');
      const data = await res.json();
      setSamples(data.samples ?? []);
    } catch {
      setSamples([]);
    }
  };

  const handleDeleteSample = async (id: string) => {
    try {
      const res = await fetch('/api/pipeline/samples/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Failed to delete sample');
      toast.success('Sample deleted');
      setSamples((prev) => prev.filter((s) => s.id !== id));
    } catch {
      toast.error('Failed to delete sample');
    }
  };

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

        {samples.length === 0 ? (
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
        ) : (
          <div className="divide-y divide-slate-100">
            {samples.map((sample) => (
              <div key={sample.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                    <Package className="w-5 h-5 text-slate-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{sample.sampleName}</p>
                    <p className="text-xs text-slate-500">
                      {sample.sampleType}
                      {sample.version ? ` · ${sample.version}` : ''}
                      {sample.vendorName ? ` · ${sample.vendorName}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {sample.receivedDate ? (
                    <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-lg">Received</span>
                  ) : (
                    <span className="px-2.5 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-lg">Pending</span>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDeleteSample(sample.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            ))}
          </div>
        )}
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
        productId={productId}
        onSuccess={fetchSamples}
      />

      {/* Order Sample Drawer */}
      <OrderSampleDrawer
        isOpen={isOrderSampleDrawerOpen}
        onClose={() => setIsOrderSampleDrawerOpen(false)}
        productId={productId}
        onSuccess={fetchSamples}
      />
    </div>
  );
}