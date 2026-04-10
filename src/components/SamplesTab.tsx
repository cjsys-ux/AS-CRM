import { motion } from 'motion/react';
import { Plus, Upload, Package, FileText, Image as ImageIcon, ShoppingCart, MessageSquare, Trash2, Download } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { ChecklistWidget } from './ChecklistWidget';
import { AddSampleDrawer } from './AddSampleDrawer';
import { OrderSampleDrawer } from './OrderSampleDrawer';
import { downloadSavedFile } from '../lib/downloadFile';

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: string;
  key: string;
  fileUrl: string;
  uploadedDate: string;
}

interface SamplesTabProps {
  productId?: string;
}

function formatSize(bytes: number): string {
  if (bytes > 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

function mapUploads(data: any): UploadedFile[] {
  return (data.uploads ?? []).map((u: any) => ({
    id: u.id ?? u._id,
    name: u.fileName ?? 'Unknown',
    type: u.fileType ?? '',
    size: formatSize(typeof u.size === 'number' ? u.size : 0),
    key: u.key ?? '',
    fileUrl: u.key ? `/api/files/image?key=${encodeURIComponent(u.key)}` : u.fileUrl ?? '',
    uploadedDate: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '',
  }));
}

export function SamplesTab({ productId = '' }: SamplesTabProps) {
  const [samples, setSamples] = useState<any[]>([]);
  const [isAddSampleDrawerOpen, setIsAddSampleDrawerOpen] = useState(false);
  const [isOrderSampleDrawerOpen, setIsOrderSampleDrawerOpen] = useState(false);
  const [documents, setDocuments] = useState<UploadedFile[]>([]);
  const [images, setImages] = useState<UploadedFile[]>([]);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    if (productId) {
      fetchSamples();
      fetchDocuments();
      fetchImages();
    }
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

  const fetchDocuments = async () => {
    try {
      const res = await fetch(`/api/files/list?entityType=pipeline-sample-document&entityId=${encodeURIComponent(productId)}`);
      if (!res.ok) throw new Error('Failed to fetch documents');
      setDocuments(mapUploads(await res.json()));
    } catch {
      setDocuments([]);
    }
  };

  const fetchImages = async () => {
    try {
      const res = await fetch(`/api/files/list?entityType=pipeline-sample-image&entityId=${encodeURIComponent(productId)}`);
      if (!res.ok) throw new Error('Failed to fetch images');
      setImages(mapUploads(await res.json()));
    } catch {
      setImages([]);
    }
  };

  const handleUpload = async (files: FileList | null, entityType: string, setUploading: (v: boolean) => void, onDone: () => Promise<void>) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const presignRes = await fetch('/api/files/presign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName: file.name, fileType: file.type, entityType, entityId: productId }),
        });
        if (!presignRes.ok) throw new Error('Failed to get upload URL');
        const { uploadUrl, key } = await presignRes.json();

        await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });

        await fetch('/api/files/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, fileName: file.name, fileType: file.type, size: file.size, entityType, entityId: productId, uploadedBy: 'User' }),
        });
      }
      toast.success(`${files.length} file${files.length > 1 ? 's' : ''} uploaded`);
      await onDone();
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, onDone: () => Promise<void>) => {
    try {
      const res = await fetch('/api/files/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('File deleted');
      await onDone();
    } catch {
      toast.error('Failed to delete file');
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
      {/* Sample Tracking */}
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

      {/* Sample Feedback */}
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
          <label htmlFor="sample-doc-upload">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer ${isUploadingDoc ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Upload className="w-4 h-4" />
              {isUploadingDoc ? 'Uploading...' : 'Upload Document'}
            </motion.div>
          </label>
          <input
            id="sample-doc-upload"
            type="file"
            multiple
            onChange={(e) => { handleUpload(e.target.files, 'pipeline-sample-document', setIsUploadingDoc, fetchDocuments); e.target.value = ''; }}
            className="hidden"
            disabled={isUploadingDoc}
          />
        </div>

        {documents.length === 0 ? (
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
        ) : (
          <div className="divide-y divide-slate-100">
            {documents.map((doc) => (
              <div key={doc.id} className="px-6 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-900">{doc.name}</p>
                    <p className="text-xs text-slate-500">{doc.size} · {doc.uploadedDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={async () => {
                      try {
                        await downloadSavedFile({ key: doc.key, fileUrl: doc.fileUrl, fileName: doc.name });
                      } catch {
                        toast.error('Failed to download file');
                      }
                    }}
                    className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4 text-slate-400 hover:text-blue-600" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDelete(doc.id, fetchDocuments)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-600" />
                  </motion.button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sample Images */}
      <div className="bg-white rounded-xl border-2 border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ImageIcon className="w-5 h-5 text-pink-600" />
            <h3 className="font-bold text-slate-900">Sample Images</h3>
          </div>
          <label htmlFor="sample-image-upload">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer ${isUploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Upload className="w-4 h-4" />
              {isUploadingImage ? 'Uploading...' : 'Upload Image'}
            </motion.div>
          </label>
          <input
            id="sample-image-upload"
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => { handleUpload(e.target.files, 'pipeline-sample-image', setIsUploadingImage, fetchImages); e.target.value = ''; }}
            className="hidden"
            disabled={isUploadingImage}
          />
        </div>

        {images.length === 0 ? (
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
        ) : (
          <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((img) => (
              <div key={img.id} className="group relative rounded-xl overflow-hidden border-2 border-slate-200 hover:border-pink-300 transition-colors">
                <img
                  src={img.fileUrl}
                  alt={img.name}
                  className="w-full h-32 object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.open(img.fileUrl, '_blank')}
                    className="p-2 bg-white rounded-lg shadow"
                  >
                    <Download className="w-4 h-4 text-slate-700" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDelete(img.id, fetchImages)}
                    className="p-2 bg-white rounded-lg shadow"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </motion.button>
                </div>
                <div className="px-2 py-1.5 bg-white">
                  <p className="text-xs text-slate-700 font-medium truncate">{img.name}</p>
                  <p className="text-[10px] text-slate-400">{img.size}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Checklist */}
      <ChecklistWidget
        productId={productId}
        tabId="samples"
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
