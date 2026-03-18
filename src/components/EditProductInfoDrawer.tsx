import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, Image as ImageIcon, ChevronDown, FileImage, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { statuses, productTypes } from '../utils/mockData';


interface EditProductInfoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  productInfo: {
    name: string;
    client: string;
    vendor: string;
    status: string;
    type: string;
    internalSKU: string;
    projectManager: string;
    image: string;
    competitorName?: string;
    competitorLink?: string;
    competitorPrice?: string;
    artTemplate?: string;
    artTemplateName?: string;
  };
  onSave: (updatedInfo: any) => void;
}

export function EditProductInfoDrawer({ isOpen, onClose, productInfo, onSave }: EditProductInfoDrawerProps) {
  const [formData, setFormData] = useState(productInfo);
  const [imagePreview, setImagePreview] = useState(productInfo.image);
  const [projectManagers, setProjectManagers] = useState<{id: string; name: string; role?: string}[]>([]);
  const [dbVendors, setDbVendors] = useState<any[]>([]);
  const [dbClients, setDbClients] = useState<any[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    setProjectManagers([]);
    setDbVendors([]);
    setDbClients([]);
  }, [isOpen]);

  // Sync formData when productInfo changes
  useEffect(() => {
    setFormData(productInfo);
    setImagePreview(productInfo.image);
  }, [productInfo]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSave(formData);
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
            <div className="flex-1 overflow-y-auto p-6 drawer-scroll">
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
                      {dbClients.map((client) => (
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
                      {dbVendors.map((vendor) => (
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

                {/* Art Template Section */}
                <div className="border-t border-slate-200 pt-6">
                  <h3 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wider">Art Template</h3>
                  <p className="text-xs text-slate-500 mb-4">Upload a design template that will be pushed to Design Lab for this product.</p>
                  
                  {formData.artTemplate ? (
                    <div className="space-y-3">
                      <div className="w-full h-36 bg-slate-50 rounded-xl overflow-hidden border-2 border-indigo-200 flex items-center justify-center">
                        {(formData.artTemplate.startsWith('data:image') || formData.artTemplate.startsWith('http')) ? (
                          <img src={formData.artTemplate} alt="Art template" className="w-full h-full object-contain" />
                        ) : (
                          <FileImage className="w-10 h-10 text-indigo-300" />
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileImage className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                          <span className="text-sm font-medium text-slate-700 truncate">{formData.artTemplateName || 'Template file'}</span>
                        </div>
                        <button
                          onClick={() => setFormData({ ...formData, artTemplate: '', artTemplateName: '' })}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="block">
                      <input
                        type="file"
                        accept="image/*,.ai,.eps,.pdf,.svg"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setFormData({ ...formData, artTemplate: reader.result as string, artTemplateName: file.name });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="cursor-pointer border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-indigo-400 hover:bg-indigo-50/30 transition-all"
                      >
                        <FileImage className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-slate-700">Upload Art Template</p>
                        <p className="text-xs text-slate-500 mt-1">PNG, JPG, AI, EPS, PDF, SVG</p>
                      </motion.div>
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 px-6 py-4 bg-slate-50 flex gap-3 flex-shrink-0">
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
                className="flex-1 px-6 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-all shadow-lg"
              >
                Save Changes
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}