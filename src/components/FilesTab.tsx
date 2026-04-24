import { motion, AnimatePresence } from 'motion/react';
import { FileText, Download, Trash2, Upload, File, Image as ImageIcon, FileSpreadsheet, Video, Music, Archive } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { DeleteDocumentModal } from './DeleteDocumentModal';
import { ImagePopupModal } from './ImagePopupModal';
import { uploadFileViaApi, recordUpload } from '../utils/uploadViaApi';
import { CategoryTagDropdown, categoryColor } from './CategoryTagDropdown';


interface FileItem {
  id: string;
  name: string;
  type: string;
  mime: string;
  size: string;
  uploadedBy: string;
  uploadedDate: string;
  section: string;
  category?: string;
  fileUrl?: string;
  key?: string;
}

interface FilesTabProps {
  productId?: string;
  onActivityDetected?: () => void;
}

// Every entityType persisted via /api/files/complete from any tab on a product
// pipeline. Keep in sync with the upload sites in SpecificationsTab, PackagingTab,
// SamplesTab, and FilesTab itself. (AddSampleDrawer and ChatTab currently only
// call /presign and never /complete, so their files never land in the uploads
// collection and are intentionally not listed here.)
const PRODUCT_FILE_ENTITY_TYPES = [
  'pipeline-file',
  'pipeline-compliance',
  'pipeline-packaging',
  'pipeline-packaging-mockup',
  'pipeline-packaging-dieline',
  'pipeline-packaging-spec',
  'pipeline-sample-file',
  'pipeline-sample-document',
  'pipeline-sample-image',
] as const;

const ENTITY_TYPE_SECTION_LABELS: Record<string, string> = {
  'pipeline-file': 'Files',
  'pipeline-compliance': 'Compliance & Certifications',
  'pipeline-packaging': 'Packaging',
  'pipeline-packaging-mockup': 'Packaging Mockups',
  'pipeline-packaging-dieline': 'Packaging Dielines',
  'pipeline-packaging-spec': 'Packaging Spec Sheets',
  'pipeline-sample-file': 'Sample Files',
  'pipeline-sample-document': 'Sample Documents',
  'pipeline-sample-image': 'Sample Images',
};

const isImageType = (type: string) => {
  if (!type) return false;
  const t = type.toLowerCase();
  if (t.startsWith('image/')) return true;
  return ['image', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'heic', 'heif', 'bmp', 'avif'].includes(t);
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
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

const getSectionColor = (section: string) => {
  switch (section) {
    case 'Files':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    case 'Compliance & Certifications':
      return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'Packaging':
    case 'Packaging Mockups':
      return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'Packaging Dielines':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'Packaging Spec Sheets':
      return 'bg-indigo-100 text-indigo-700 border-indigo-200';
    case 'Sample Files':
    case 'Sample Documents':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'Sample Images':
      return 'bg-pink-100 text-pink-700 border-pink-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

export function FilesTab({ productId = 'PRD-001', onActivityDetected }: FilesTabProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedSection, setSelectedSection] = useState('all');
  const [isUploading, setIsUploading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<FileItem | null>(null);
  const [previewImage, setPreviewImage] = useState<FileItem | null>(null);

  useEffect(() => {
    fetchFiles();
  }, [productId]);

  const fetchFiles = async () => {
    try {
      const res = await fetch(
        `/api/files/list?entityTypes=${encodeURIComponent(PRODUCT_FILE_ENTITY_TYPES.join(','))}&entityId=${encodeURIComponent(productId)}`
      );
      if (!res.ok) throw new Error('Failed to fetch files');
      const data = await res.json();
      const mapped: FileItem[] = (data.uploads ?? []).map((u: any) => {
        const ext = (u.fileName ?? '').split('.').pop()?.toLowerCase() ?? '';
        const sizeBytes = typeof u.size === 'number' ? u.size : 0;
        const sizeStr = sizeBytes > 1024 * 1024
          ? `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`
          : `${(sizeBytes / 1024).toFixed(0)} KB`;
        return {
          id: u.id ?? u._id,
          name: u.fileName ?? 'Unknown',
          type: ext || (u.fileType ?? 'file'),
          mime: u.fileType ?? '',
          size: sizeStr,
          uploadedBy: u.uploadedBy ?? 'User',
          uploadedDate: u.createdAt ?? '',
          section: ENTITY_TYPE_SECTION_LABELS[u.entityType] ?? 'Other',
          category: typeof u.category === 'string' ? u.category : '',
          fileUrl: u.fileUrl ?? '',
          key: u.key ?? '',
        };
      });
      setFiles(mapped);
    } catch {
      setFiles([]);
    }
  };

  const filteredFiles = selectedSection === 'all'
    ? files
    : files.filter(file => file.section === selectedSection);

  const sections = ['all', ...Array.from(new Set(files.map(f => f.section)))];

  const handleFileUpload = async (uploadedFiles: FileList | null) => {
    if (!uploadedFiles || uploadedFiles.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of Array.from(uploadedFiles)) {
        const { key } = await uploadFileViaApi(file, 'pipeline-file', productId);
        await recordUpload({
          key,
          fileName: file.name,
          fileType: file.type,
          size: file.size,
          entityType: 'pipeline-file',
          entityId: productId,
        });
      }
      toast.success(`${uploadedFiles.length} file${uploadedFiles.length > 1 ? 's' : ''} uploaded`);
      await fetchFiles();
      onActivityDetected?.();
    } catch (err) {
      console.error('File upload error:', err);
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const updateCategory = async (file: FileItem, category: string) => {
    const previousFiles = files;
    setFiles(prev => prev.map(f => f.id === file.id ? { ...f, category } : f));
    try {
      const res = await fetch('/api/files/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: file.id, category }),
      });
      if (!res.ok) {
        setFiles(previousFiles);
        toast.error('Failed to update category');
        return;
      }
      toast.success(category ? `Category set to "${category}"` : 'Category removed', { duration: 2000 });
      onActivityDetected?.();
    } catch {
      setFiles(previousFiles);
      toast.error('Failed to update category');
    }
  };

  const handleDeleteClick = (file: FileItem) => {
    setFileToDelete(file);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!fileToDelete) return;
    try {
      const res = await fetch('/api/files/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: fileToDelete.id }),
      });
      if (!res.ok) throw new Error('Failed to delete file');
      toast.success('File deleted');
      await fetchFiles();
      onActivityDetected?.();
    } catch {
      toast.error('Failed to delete file');
    } finally {
      setDeleteModalOpen(false);
      setFileToDelete(null);
    }
  };

  const handleDownload = (file: FileItem) => {
    if (file.key) {
      window.open(`/api/files/image?key=${encodeURIComponent(file.key)}`, '_blank');
    } else if (file.fileUrl) {
      window.open(file.fileUrl, '_blank');
    } else {
      toast.error('No download URL available');
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Filter */}
      {sections.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {sections.map((section) => (
            <motion.button
              key={section}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedSection(section)}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                selectedSection === section
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {section === 'all' ? 'All Files' : section}
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
              <p className="text-[10px] sm:text-xs font-medium text-slate-600 truncate">Sections</p>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">{Math.max(0, sections.length - 1)}</h3>
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
                {files.length > 0 ? formatDate(files[0].uploadedDate) : 'N/A'}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Files List or Empty State */}
      {filteredFiles.length === 0 ? (
        <div className="bg-white rounded-xl border-2 border-slate-200 overflow-hidden">
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
              accept="*/*"
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
          {/* Header with Upload Button */}
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
              accept="*/*"
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
                    {(isImageType(file.type) || isImageType(file.mime)) && file.key ? (
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setPreviewImage(file)}
                        title="Click to preview"
                        className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200 cursor-pointer hover:ring-2 hover:ring-blue-400 hover:border-blue-400 transition-all"
                      >
                        <img src={`/api/files/image?key=${encodeURIComponent(file.key)}`} alt={file.name} className="w-full h-full object-cover" />
                      </motion.button>
                    ) : (
                      <div className="w-9 h-9 bg-white border border-slate-200 rounded-lg flex items-center justify-center shrink-0">
                        {getFileIcon(file.type)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <p className="text-xs text-slate-500">{file.size}</p>
                        {file.category && (
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${categoryColor(file.category)}`}>
                            {file.category}
                          </span>
                        )}
                        {file.section && (
                          <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getSectionColor(file.section)}`}>
                            {file.section}
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
                      value={file.category ?? ''}
                      onChange={(cat) => updateCategory(file, cat)}
                    />
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

      {/* Image Preview Modal */}
      <ImagePopupModal
        isOpen={!!previewImage}
        onClose={() => setPreviewImage(null)}
        imageUrl={previewImage?.key ? `/api/files/image?key=${encodeURIComponent(previewImage.key)}` : ''}
        productName={previewImage?.name || 'Image'}
      />
    </div>
  );
}
