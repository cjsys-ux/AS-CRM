import { motion } from 'motion/react';
import { FileText, Download, Trash2, Upload, File, Image as ImageIcon, FileSpreadsheet, Video, Music, Archive, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { DeleteConfirmModal } from './DeleteConfirmModal';


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
}

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

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Specifications':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'Design':
      return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'Quality':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'Images':
      return 'bg-pink-100 text-pink-700 border-pink-200';
    case 'Compliance':
      return 'bg-orange-100 text-orange-700 border-orange-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

export function FilesTab({ productId = 'PRD-001' }: FilesTabProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isUploading, setIsUploading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<FileItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, [productId]);

  const fetchFiles = () => {
    setFiles([]);
  };

  const filteredFiles = selectedCategory === 'all' 
    ? files 
    : files.filter(file => file.category === selectedCategory);

  const categories = ['all', ...Array.from(new Set(files.map(f => f.category)))];

  const handleFileUpload = (uploadedFiles: FileList | null) => {
    if (!uploadedFiles || uploadedFiles.length === 0) return;

    setIsUploading(false);
  };

  const handleDeleteClick = (file: FileItem) => {
    setFileToDelete(file);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!fileToDelete) return;

    fetchFiles();
    setDeleteModalOpen(false);
    setFileToDelete(null);
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
              <p className="text-sm font-medium text-slate-600">Categories</p>
              <h3 className="text-2xl font-bold text-slate-900">{categories.length - 1}</h3>
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
                    Category
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
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                          {getFileIcon(file.type)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{file.name}</p>
                          <p className="text-xs text-slate-500">{file.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-semibold border ${getCategoryColor(file.category)}`}>
                        {file.category}
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
                          onClick={() => console.log('Download:', file.id)}
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
