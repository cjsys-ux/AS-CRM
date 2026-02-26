import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, FileText } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner@2.0.3';

interface AddFileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (file: File, fileName: string, fileType: string) => void;
}

const FILE_TYPES = [
  'Resale Certification',
  'Artwork',
  'Logo',
  'Brand Guidelines',
  'Contract',
  'Invoice',
  'Purchase Order',
  'Quote',
  'Proof',
  'Other',
];

export function AddFileDrawer({ isOpen, onClose, onSuccess }: AddFileDrawerProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('');
  const [customFileType, setCustomFileType] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    // Set default file name without extension
    const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    setFileName(nameWithoutExt);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    if (!fileName.trim()) {
      toast.error('Please enter a file name');
      return;
    }

    if (!fileType) {
      toast.error('Please select a file type');
      return;
    }

    if (fileType === 'Other' && !customFileType.trim()) {
      toast.error('Please enter a custom file type');
      return;
    }

    const finalFileType = fileType === 'Other' ? customFileType : fileType;
    onSuccess(selectedFile, fileName, finalFileType);
    handleClose();
  };

  const handleClose = () => {
    setSelectedFile(null);
    setFileName('');
    setFileType('');
    setCustomFileType('');
    setIsDragging(false);
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
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full md:w-[600px] bg-white shadow-2xl z-[101] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-6 border-b-2 border-blue-700 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Upload File</h2>
                  <p className="text-blue-100 text-sm">Add a new file to this customer</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleClose}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </motion.button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8">
              <div className="space-y-6">
                {/* File Upload Area */}
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-3">
                    Select File *
                  </label>
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`relative border-2 border-dashed rounded-2xl p-8 transition-all ${
                      isDragging
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50'
                    }`}
                  >
                    <input
                      type="file"
                      onChange={(e) => {
                        const files = e.target.files;
                        if (files && files.length > 0) {
                          handleFileSelect(files[0]);
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept="*/*"
                    />
                    <div className="text-center pointer-events-none">
                      {selectedFile ? (
                        <>
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <FileText className="w-8 h-8 text-white" />
                          </div>
                          <p className="text-sm font-semibold text-slate-900 mb-1">
                            {selectedFile.name}
                          </p>
                          <p className="text-xs text-slate-600">
                            {(selectedFile.size / 1024).toFixed(2)} KB
                          </p>
                          <p className="text-xs text-blue-600 mt-2">Click or drag to replace</p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                          <p className="text-sm font-semibold text-slate-900 mb-1">
                            Drop your file here or click to browse
                          </p>
                          <p className="text-xs text-slate-600">Any file type is supported</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* File Name */}
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-3">
                    File Name *
                  </label>
                  <input
                    type="text"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    placeholder="Enter file name"
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                    required
                  />
                </div>

                {/* File Type */}
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-3">
                    File Type *
                  </label>
                  <select
                    value={fileType}
                    onChange={(e) => {
                      setFileType(e.target.value);
                      if (e.target.value !== 'Other') {
                        setCustomFileType('');
                      }
                    }}
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23475569%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3c%2Fpolyline%3E%3c%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat pr-12 cursor-pointer"
                    required
                  >
                    <option value="">Select file type</option>
                    {FILE_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Custom File Type (shown when "Other" is selected) */}
                {fileType === 'Other' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <label className="block text-sm font-bold text-slate-900 mb-3">
                      Custom File Type *
                    </label>
                    <input
                      type="text"
                      value={customFileType}
                      onChange={(e) => setCustomFileType(e.target.value)}
                      placeholder="Enter custom file type"
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                      required
                    />
                  </motion.div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-4 mt-8 pt-6 border-t-2 border-slate-200">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleClose}
                  className="flex-1 px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all"
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all"
                >
                  Upload File
                </motion.button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}