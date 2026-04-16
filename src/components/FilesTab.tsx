import { motion } from 'motion/react';
import { FileText, Download, Trash2, Upload, File, Image as ImageIcon, FileSpreadsheet, Video, Music, Archive, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { uploadFileViaApi, recordUpload } from '../utils/uploadViaApi';


interface FileItem {
  id: string;
  name: string;
  type: string;
  mime: string;
  size: string;
  uploadedBy: string;
  uploadedDate: string;
  section: string;
  fileUrl?: string;
  key?: string;
}

interface FilesTabProps {
  productId?: string;
}

// Every entityType persisted via /api/files/complete from any tab on a product
// pipeline. Keep in sync with the upload sites in SpecificationsTab, PackagingTab,
// SamplesTab, and FilesTab itself. (AddSampleDrawer and ChatTab currently only
// call /presign and never /complete, so their files never land in the uploads
// collection and are intentionally not listed here.)
const PRODUCT_FILE_ENTITY_TYPES = [
  'pipeline-file',
  'pipeline-compliance',
  'pipeline-packaging-mockup',
  'pipeline-packaging-dieline',
  'pipeline-packaging-spec',
  'pipeline-sample-document',
  'pipeline-sample-image',
] as const;

const ENTITY_TYPE_SECTION_LABELS: Record<string, string> = {
  'pipeline-file': 'Files',
  'pipeline-compliance': 'Compliance & Certifications',
  'pipeline-packaging-mockup': 'Packaging Mockups',
  'pipeline-packaging-dieline': 'Packaging Dielines',
  'pipeline-packaging-spec': 'Packaging Spec Sheets',
  'pipeline-sample-document': 'Sample Documents',
  'pipeline-sample-image': 'Sample Images',
};

const isImageType = (type: string) => {
  if (!type) return false;
  const t = type.toLowerCase();
  if (t.startsWith('image/')) return true;
  return t === 'image' || t === 'jpg' || t === 'jpeg' || t === 'png' || t === 'gif' || t === 'webp' || t === 'svg' || t === 'heic' || t === 'heif' || t === 'bmp' || t === 'avif';
};

const getFileIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'pdf':
      return <FileText className="w-5 h-5 text-red-600" />;
    case 'image':
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return <ImageIcon className="w-5 h-5 text-blue-600" />;
    case 'excel':
    case 'xlsx':
    case 'csv':
      return <FileSpreadsheet className="w-5 h-5 text-green-600" />;
    case 'video':
    case 'mp4':
    case 'mov':
      return <Video className="w-5 h-5 text-purple-600" />;
    case 'audio':
    case 'mp3':
    case 'wav':
      return <Music className="w-5 h-5 text-pink-600" />;
    case 'zip':
    case 'rar':
      return <Archive className="w-5 h-5 text-orange-600" />;
    default:
      return <File className="w-5 h-5 text-slate-600" />;
  }
};

const getSectionColor = (section: string) => {
  switch (section) {
    case 'Files':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    case 'Compliance & Certifications':
      return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'Packaging Mockups':
      return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'Packaging Dielines':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'Packaging Spec Sheets':
      return 'bg-indigo-100 text-indigo-700 border-indigo-200';
    case 'Sample Documents':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'Sample Images':
      return 'bg-pink-100 text-pink-700 border-pink-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

export function FilesTab({ productId = 'PRD-001' }: FilesTabProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedSection, setSelectedSection] = useState('all');
  const [isUploading, setIsUploading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<FileItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
          uploadedDate: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '',
          section: ENTITY_TYPE_SECTION_LABELS[u.entityType] ?? 'Other',
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
    } catch (err) {
      console.error('File upload error:', err);
      toast.error(err instanceof Error ? err.message : 'Upload failed');
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
      const res = await fetch('/api/files/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: fileToDelete.id }),
      });
      if (!res.ok) throw new Error('Failed to delete file');
      toast.success('File deleted');
      await fetchFiles();
    } catch {
      toast.error('Failed to delete file');
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setFileToDelete(null);
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

      {/* File Stats - Moved Above Table */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border-2 border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Total Files</p>
              <h3 className="text-2xl font-bold text-slate-900">{files.length}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border-2 border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Archive className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Sections</p>
              <h3 className="text-2xl font-bold text-slate-900">{sections.length - 1}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border-2 border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Upload className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Last Upload</p>
              <h3 className="text-sm font-bold text-slate-900">
                {files.length > 0 ? files[0].uploadedDate : 'N/A'}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Files List or Empty State */}
      {filteredFiles.length === 0 ? (
        <div className="bg-white rounded-xl border-2 border-slate-200 p-16">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-2xl flex items-center justify-center">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <h4 className="font-bold text-slate-900 mb-2">No Files Yet</h4>
            <p className="text-sm text-slate-600 mb-6">
              Start tracking files from competitors and factories to monitor quality improvements
            </p>
            <label htmlFor="file-upload-empty">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl cursor-pointer shadow-lg hover:shadow-xl transition-all ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Plus className="w-5 h-5" />
                {isUploading ? 'Uploading...' : 'Add First File'}
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
        </div>
      ) : (
        <div className="bg-white rounded-xl border-2 border-slate-200 overflow-hidden">
          {/* Table Header with Upload Button */}
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <h3 className="font-bold text-slate-900">Files</h3>
            <label htmlFor="file-upload">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg cursor-pointer transition-all ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Plus className="w-4 h-4" />
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

          {/* Files Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200">
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    File Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Section
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Uploaded By
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredFiles.map((file, index) => (
                  <motion.tr
                    key={file.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {(isImageType(file.type) || isImageType(file.mime)) && file.key ? (
                          <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200">
                            <img src={`/api/files/image?key=${encodeURIComponent(file.key)}`} alt={file.name} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            {getFileIcon(file.type)}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-slate-900">{file.name}</p>
                          <p className="text-xs text-slate-500">{file.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-semibold border ${getSectionColor(file.section)}`}>
                        {file.section}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-700">{file.size}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-700">{file.uploadedBy}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-700">{file.uploadedDate}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.15, backgroundColor: 'rgb(219 234 254)' }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            if (file.key) window.open(`/api/files/image?key=${encodeURIComponent(file.key)}`, '_blank');
                            else if (file.fileUrl) window.open(file.fileUrl, '_blank');
                          }}
                          className="p-2.5 hover:bg-blue-50 rounded-xl transition-colors group/btn border-2 border-transparent hover:border-blue-200"
                        >
                          <Download className="w-5 h-5 text-slate-400 group-hover/btn:text-blue-600" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.15, backgroundColor: 'rgb(254 226 226)' }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDeleteClick(file)}
                          className="p-2.5 hover:bg-red-50 rounded-xl transition-colors group/btn border-2 border-transparent hover:border-red-200"
                        >
                          <Trash2 className="w-5 h-5 text-slate-400 group-hover/btn:text-red-600" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setFileToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete File"
        message={`Are you sure you want to delete "${fileToDelete?.name}"? This action cannot be undone.`}
        isDeleting={isDeleting}
      />
    </div>
  );
}
