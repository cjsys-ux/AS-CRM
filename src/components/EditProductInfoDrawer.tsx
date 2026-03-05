import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, Image as ImageIcon, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { vendors, clients, statuses, productTypes, projectManagers } from '../utils/mockData';

interface EditProductInfoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  productId?: string;
  productInfo: {
    name: string;
    client: string;
    vendor: string;
    status: string;
    type: string;
    internalSKU: string;
    projectManager: string;
    image: string;
  };
  onSave: (updatedInfo: any) => void;
}

export function EditProductInfoDrawer({ isOpen, onClose, productId, productInfo, onSave }: EditProductInfoDrawerProps) {
  const [formData, setFormData] = useState(productInfo);
  const [imagePreview, setImagePreview] = useState(productInfo.image);
  const [uploadedImageKey, setUploadedImageKey] = useState<string | null>(null);
  const [resolvedImageUrl, setResolvedImageUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Sync form state every time the drawer opens so stale data doesn't persist
  useEffect(() => {
    if (isOpen) {
      setFormData(productInfo);
      setImagePreview(productInfo.image);
      setUploadedImageKey(null);
      setResolvedImageUrl(null);
      setSaveError(null);
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setSaveError(null);
    // Show local blob preview immediately while upload is in progress
    setImagePreview(URL.createObjectURL(file));

    try {
      // Convert file to base64 and upload via server-side API to avoid S3 CORS issues
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Strip the data URL prefix (e.g. "data:image/jpeg;base64,")
          resolve(result.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const uploadRes = await fetch('/api/files/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          entityType: 'project',
          entityId: productId ?? 'unknown',
          fileData: base64,
        }),
      });

      if (!uploadRes.ok) {
        const data = await uploadRes.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to upload image.');
      }

      const { key, fileUrl } = await uploadRes.json();
      setUploadedImageKey(key);
      setResolvedImageUrl(fileUrl);
      setImagePreview(fileUrl);
    } catch (err) {
      console.error('Image upload error:', err);
      setSaveError('Image upload failed. Other changes can still be saved.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSave = async () => {
    setSaveError(null);

    if (productId) {
      try {
        const payload: Record<string, unknown> = {
          id: productId,
          name: formData.name,
          client: formData.client,
          vendor: formData.vendor,
          status: formData.status,
          type: formData.type,
          internalSKU: formData.internalSKU,
          projectManager: formData.projectManager,
        };

        if (uploadedImageKey) {
          payload.imageKey = uploadedImageKey;
        }

        const res = await fetch('/api/projects/update', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to save changes.');
        }
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : 'Failed to save changes.');
        return;
      }
    }

    // Pass the resolved S3 proxy URL (or the existing image) back to the parent so the UI updates immediately
    const imageUrl = resolvedImageUrl ?? formData.image;
    onSave({
      ...formData,
      image: imageUrl,
      ...(uploadedImageKey ? { imageKey: uploadedImageKey } : {}),
    });
    onClose();
  };

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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-5 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-xl font-bold text-white">Edit Product Information</h2>
                <p className="text-sm text-slate-300 mt-1">Update product details and image</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Product Image</label>
                  <div className="flex gap-4">
                    <div className="relative w-48 h-48 bg-slate-100 rounded-xl overflow-hidden border-2 border-slate-200">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Product" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-12 h-12 text-slate-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <label className="block">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="cursor-pointer border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-500 hover:bg-blue-50/50 transition-all"
                        >
                          <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                          <p className="text-sm font-medium text-slate-700">Click to upload image</p>
                          <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 10MB</p>
                        </motion.div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Product Name */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Product Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter product name"
                  />
                </div>

                {/* Client Dropdown */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Client</label>
                  <div className="relative">
                    <select
                      value={formData.client}
                      onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white cursor-pointer"
                    >
                      <option value="">Select a client</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.name}>{client.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5">Linked to Customers module</p>
                </div>

                {/* Vendor Dropdown */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Vendor</label>
                  <div className="relative">
                    <select
                      value={formData.vendor}
                      onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white cursor-pointer"
                    >
                      <option value="">Select a vendor</option>
                      {vendors.map((vendor) => (
                        <option key={vendor.id} value={vendor.name}>{vendor.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5">Linked to Vendors module</p>
                </div>

                {/* Status Dropdown */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                  <div className="relative">
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white cursor-pointer"
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Type Dropdown */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Type</label>
                  <div className="relative">
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white cursor-pointer"
                    >
                      {productTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Internal SKU */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Internal SKU</label>
                  <input
                    type="text"
                    value={formData.internalSKU}
                    onChange={(e) => setFormData({ ...formData, internalSKU: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter SKU"
                  />
                </div>

                {/* Project Manager Dropdown */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Project Manager</label>
                  <div className="relative">
                    <select
                      value={formData.projectManager}
                      onChange={(e) => setFormData({ ...formData, projectManager: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white cursor-pointer"
                    >
                      {projectManagers.map((pm) => (
                        <option key={pm.id} value={pm.name}>{pm.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 px-6 py-4 bg-slate-50 flex-shrink-0">
              {saveError && (
                <p className="text-red-600 text-sm font-medium mb-3">{saveError}</p>
              )}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-100 transition-all"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  disabled={isUploadingImage}
                  className="flex-1 px-6 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploadingImage ? 'Uploading...' : 'Save Changes'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}