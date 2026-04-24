import { motion, AnimatePresence } from 'motion/react';
import { FileText, Download, Trash2, Upload, File, Image as ImageIcon, FileSpreadsheet, Video, Music, Archive, Plus, Pencil } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { DeleteDocumentModal } from './DeleteDocumentModal';
import { CategoryTagDropdown, categoryColor } from './CategoryTagDropdown';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-c0840c88`;

interface FileItem {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedBy: string;
  uploadedDate: string;
  category: string;
}

interface FilesTabProps {
  productId?: string;
  onActivityDetected?: () => void;
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      // Try parsing "YYYY-MM-DD" format
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d2 = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return d2.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
      return dateStr;
    }
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
};

const getFileIcon = (type: string) => {
  const t = (type || '').toLowerCase();
  if (t.includes('pdf')) return <FileText className="w-5 h-5 text-red-600" />;
  if (['image', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].some(x => t.includes(x)))
    return <ImageIcon className="w-5 h-5 text-blue-600" />;
  if (['excel', 'xlsx', 'csv', 'spreadsheet'].some(x => t.includes(x)))
    return <FileSpreadsheet className="w-5 h-5 text-green-600" />;
  if (['video', 'mp4', 'mov', 'avi'].some(x => t.includes(x)))
    return <Video className="w-5 h-5 text-purple-600" />;
  if (['audio', 'mp3', 'wav'].some(x => t.includes(x)))
    return <Music className="w-5 h-5 text-pink-600" />;
  if (['zip', 'rar', '7z', 'tar'].some(x => t.includes(x)))
    return <Archive className="w-5 h-5 text-orange-600" />;
  if (['word', 'docx', 'doc'].some(x => t.includes(x)))
    return <FileText className="w-5 h-5 text-blue-700" />;
  return <File className="w-5 h-5 text-slate-600" />;
};

export function FilesTab({ productId = 'PRD-001', onActivityDetected }: FilesTabProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isUploading, setIsUploading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<FileItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchFiles();
  }, [productId]);

  const fetchFiles = async () => {
    try {
      const response = await fetch(`${API_URL}/products/${productId}/files`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` },
      });
      const data = await response.json();
      if (data.success) {
        setFiles(data.files || []);
      } else {
        setFiles([]);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      setFiles([]);
    }
  };

  const filteredFiles = selectedCategory === 'all'
    ? files
    : files.filter(file => file.category === selectedCategory);

  const categories = ['all', ...Array.from(new Set(files.map(f => f.category).filter(Boolean)))];

  // Reset selected category if it no longer exists
  useEffect(() => {
    if (selectedCategory !== 'all' && !categories.includes(selectedCategory)) {
      setSelectedCategory('all');
    }
  }, [categories, selectedCategory]);

  const handleFileUpload = async (uploadedFiles: FileList | null) => {
    if (!uploadedFiles || uploadedFiles.length === 0) return;

    setIsUploading(true);

    try {
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', 'General');

        const response = await fetch(`${API_URL}/products/${productId}/files`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${publicAnonKey}` },
          body: formData,
        });

        const data = await response.json();
        if (!data.success) {
          console.error('Error uploading file:', data.error);
        }
      }

      await fetchFiles();
      if (onActivityDetected) onActivityDetected();
      toast.success(`${uploadedFiles.length} file${uploadedFiles.length > 1 ? 's' : ''} uploaded`);
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Failed to upload files');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteClick = (file: FileItem) => {
    setFileToDelete(file);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!fileToDelete) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`${API_URL}/products/${productId}/files/${fileToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${publicAnonKey}` },
      });

      const data = await response.json();
      if (data.success) {
        await fetchFiles();
        setDeleteModalOpen(false);
        setFileToDelete(null);
        if (onActivityDetected) onActivityDetected();
        toast.success('File deleted');
      } else {
        console.error('Error deleting file:', data.error);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const startRename = (file: FileItem) => {
    const name = file.name;
    const lastDot = name.lastIndexOf('.');
    setRenameValue(lastDot > 0 ? name.substring(0, lastDot) : name);
    setRenamingId(file.id);
    setTimeout(() => renameInputRef.current?.focus(), 50);
  };

  const confirmRename = async (file: FileItem) => {
    if (renameValue.trim()) {
      const lastDot = file.name.lastIndexOf('.');
      const ext = lastDot > 0 ? file.name.substring(lastDot) : '';
      const newName = renameValue.trim() + ext;

      try {
        await fetch(`${API_URL}/products/${productId}/files/${file.id}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: newName }),
        });
        await fetchFiles();
        toast.success('File renamed', { description: `Renamed to "${newName}"`, duration: 2000 });
      } catch (error) {
        console.error('Error renaming file:', error);
      }
    }
    setRenamingId(null);
    setRenameValue('');
  };

  const updateCategory = async (file: FileItem, category: string) => {
    // Optimistically update local state immediately
    const previousFiles = [...files];
    setFiles(prev => prev.map(f => f.id === file.id ? { ...f, category } : f));
    
    try {
      console.log(`Updating category for file ${file.id} to "${category}"`);
      const response = await fetch(`${API_URL}/products/${productId}/files/${file.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category }),
      });
      
      const data = await response.json();
      console.log('Update category response:', data);
      
      if (!response.ok || !data.success) {
        // Server rejected — revert optimistic update
        console.error('Failed to update category:', data);
        setFiles(previousFiles);
        toast.error('Failed to update category');
        return;
      }
      
      // Update with server response to ensure consistency
      setFiles(prev => prev.map(f => f.id === file.id ? data.file : f));
      
      toast.success(category ? `Category set to "${category}"` : 'Category removed', { duration: 2000 });
    } catch (error) {
      console.error('Error updating category:', error);
      // Revert on network error
      setFiles(previousFiles);
      toast.error('Failed to update category');
    }
  };

  const handleDownload = async (file: FileItem) => {
    try {
      const response = await fetch(`${API_URL}/products/${productId}/files/${file.id}/download`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` },
      });
      
      if (!response.ok) {
        const data = await response.json();
        console.error('Download failed:', data);
        toast.error(data.error || 'Failed to download file');
        return;
      }
      
      const data = await response.json();
      if (data.success && data.url) {
        // Use window.open for better compatibility
        window.open(data.url, '_blank');
        toast.success('Download started');
      } else {
        toast.error('Failed to download file');
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file');
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      {categories.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <motion.button
              key={category}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {category === 'all' ? 'All Files' : category}
            </motion.button>
          ))}
        </div>
      )}

      {/* File Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border-2 border-slate-200 px-3 py-2.5 sm:px-4 sm:py-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs font-medium text-slate-600 truncate">Total Files</p>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">{files.length}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border-2 border-slate-200 px-3 py-2.5 sm:px-4 sm:py-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Archive className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs font-medium text-slate-600 truncate">Categories</p>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">{Math.max(0, categories.length - 1)}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border-2 border-slate-200 px-3 py-2.5 sm:px-4 sm:py-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs font-medium text-slate-600 truncate">Last Upload</p>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                {files.length > 0 ? formatDate(files[files.length - 1].uploadedDate) : 'N/A'}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Files List or Empty State */}
      {filteredFiles.length === 0 ? (
        <div className="bg-white rounded-xl border-2 border-slate-200 overflow-hidden">
          {/* Header with Upload Button */}
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-purple-600" />
              <h3 className="font-bold text-slate-900">Documents & Files</h3>
            </div>
            <label htmlFor="file-upload-empty">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer transition-all ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Upload className="w-4 h-4" />
                {isUploading ? 'Uploading...' : 'Upload File'}
              </motion.div>
            </label>
            <input
              id="file-upload-empty"
              type="file"
              multiple
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
              disabled={isUploading}
            />
          </div>
          <div className="py-16 text-center">
            <div className="w-14 h-14 mx-auto mb-4 bg-slate-100 rounded-2xl flex items-center justify-center">
              <FileText className="w-7 h-7 text-slate-400" />
            </div>
            <h4 className="font-bold text-slate-900 mb-1">No files uploaded</h4>
            <p className="text-sm text-slate-500">
              Upload documents, images, specs, or any files for this product
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border-2 border-slate-200 overflow-hidden">
          {/* Table Header with Upload Button */}
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-purple-600" />
              <h3 className="font-bold text-slate-900">Files</h3>
            </div>
            <label htmlFor="file-upload">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer transition-all ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Upload className="w-4 h-4" />
                {isUploading ? 'Uploading...' : 'Upload File'}
              </motion.div>
            </label>
            <input
              id="file-upload"
              type="file"
              multiple
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
              disabled={isUploading}
            />
          </div>

          {/* File Rows */}
          <div className="p-6 space-y-2">
            <AnimatePresence>
              {filteredFiles.map((file) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 bg-white border border-slate-200 rounded-lg flex items-center justify-center shrink-0">
                      {getFileIcon(file.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      {renamingId === file.id ? (
                        <input
                          ref={renameInputRef}
                          type="text"
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onBlur={() => confirmRename(file)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') confirmRename(file);
                            if (e.key === 'Escape') { setRenamingId(null); setRenameValue(''); }
                          }}
                          className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                      )}
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <p className="text-xs text-slate-500">{file.size}</p>
                        {file.category && (
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${categoryColor(file.category)}`}>
                            {file.category}
                          </span>
                        )}
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs text-slate-500">{file.uploadedBy || 'Unknown'}</span>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs text-slate-500">{formatDate(file.uploadedDate)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <CategoryTagDropdown
                      value={file.category}
                      onChange={(cat) => updateCategory(file, cat)}
                    />
                    <button
                      onClick={() => startRename(file)}
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                      title="Rename"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDownload(file)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(file)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteDocumentModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setFileToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        fileName={fileToDelete?.name || ''}
      />
    </div>
  );
}