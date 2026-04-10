import { motion, AnimatePresence } from 'motion/react';
import { Package, Upload, FileText, Image as ImageIcon, Download, Box, Trash2, Save, File } from 'lucide-react';
import { ChecklistWidget } from './ChecklistWidget';

const isImageFile = (fileName: string) => {
  const ext = fileName?.split('.').pop()?.toLowerCase() ?? '';
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext);
};
const getProxyUrl = (f: any) => f.key ? `/api/files/image?key=${encodeURIComponent(f.key)}` : f.fileUrl;
import { UnitDropdown } from './UnitDropdown';
import { FilterDropdown } from './FilterDropdown';
import { DeleteDocumentModal } from './DeleteDocumentModal';
import { downloadSavedFile } from '../lib/downloadFile';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

const handleDownloadSavedFile = async (f: any) => {
  try {
    await downloadSavedFile(f);
  } catch {
    toast.error('Failed to download file');
  }
};

interface PackagingTabProps {
  productId?: string;
}

export function PackagingTab({ productId = '' }: PackagingTabProps) {
  const [mockups, setMockups] = useState<File[]>([]);
  const [dielineFiles, setDielineFiles] = useState<File[]>([]);
  const [specSheets, setSpecSheets] = useState<File[]>([]);
  const [primaryPackaging, setPrimaryPackaging] = useState('');
  const [customPrimaryPackaging, setCustomPrimaryPackaging] = useState('');
  const [packagingMaterial, setPackagingMaterial] = useState('');
  const [customPackagingMaterial, setCustomPackagingMaterial] = useState('');
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<{ file: File; index: number; type: 'mockup' | 'dieline' | 'spec' } | null>(null);

  // Dimensions
  const [length, setLength] = useState('');
  const [lengthUnit, setLengthUnit] = useState('in');
  const [width, setWidth] = useState('');
  const [widthUnit, setWidthUnit] = useState('in');
  const [height, setHeight] = useState('');
  const [heightUnit, setHeightUnit] = useState('in');
  const [isSaving, setIsSaving] = useState(false);

  // Saved S3 files per category
  const [savedMockups, setSavedMockups] = useState<any[]>([]);
  const [savedDielines, setSavedDielines] = useState<any[]>([]);
  const [savedSpecSheets, setSavedSpecSheets] = useState<any[]>([]);

  useEffect(() => {
    if (productId) {
      fetchPackaging();
      fetchSavedFiles();
    }
  }, [productId]);

  const fetchPackaging = async () => {
    try {
      const res = await fetch(`/api/pipeline/packaging/get?productId=${encodeURIComponent(productId)}`);
      if (!res.ok) return;
      const { packaging } = await res.json();
      if (!packaging) return;
      setLength(packaging.length ?? '');
      setLengthUnit(packaging.lengthUnit ?? 'in');
      setWidth(packaging.width ?? '');
      setWidthUnit(packaging.widthUnit ?? 'in');
      setHeight(packaging.height ?? '');
      setHeightUnit(packaging.heightUnit ?? 'in');
      setPrimaryPackaging(packaging.primaryPackaging ?? '');
      setCustomPrimaryPackaging(packaging.customPrimaryPackaging ?? '');
      setPackagingMaterial(packaging.packagingMaterial ?? '');
      setCustomPackagingMaterial(packaging.customPackagingMaterial ?? '');
      setSpecialRequirements(packaging.specialRequirements ?? '');
    } catch {
      // silent
    }
  };

  const fetchSavedFiles = async () => {
    const fetchCategory = async (category: string) => {
      const res = await fetch(`/api/files/list?entityType=pipeline-packaging-${category}&entityId=${encodeURIComponent(productId)}`);
      if (!res.ok) return [];
      const { uploads } = await res.json();
      return uploads ?? [];
    };
    const [m, d, s] = await Promise.all([
      fetchCategory('mockup'),
      fetchCategory('dieline'),
      fetchCategory('spec'),
    ]);
    setSavedMockups(m);
    setSavedDielines(d);
    setSavedSpecSheets(s);
  };

  const handleSavePackaging = async () => {
    if (!productId) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/pipeline/packaging/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          length: length ? parseFloat(length) : null,
          lengthUnit,
          width: width ? parseFloat(width) : null,
          widthUnit,
          height: height ? parseFloat(height) : null,
          heightUnit,
          primaryPackaging,
          customPrimaryPackaging,
          packagingMaterial,
          customPackagingMaterial,
          specialRequirements,
        }),
      });
      if (!res.ok) throw new Error('Failed to save');
      toast.success('Packaging saved successfully');
    } catch {
      toast.error('Failed to save packaging');
    } finally {
      setIsSaving(false);
    }
  };

  const uploadFileToS3 = async (file: File, category: string): Promise<void> => {
    const contentType = file.type && file.type.trim() ? file.type : 'application/octet-stream';

    const presignRes = await fetch('/api/files/presign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName: file.name,
        fileType: contentType,
        entityType: `pipeline-packaging-${category}`,
        entityId: productId,
      }),
    });
    if (!presignRes.ok) {
      const text = await presignRes.text().catch(() => '');
      throw new Error(`presign ${presignRes.status}${text ? `: ${text}` : ''}`);
    }
    const { uploadUrl, key } = await presignRes.json();

    const putRes = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': contentType },
    });
    if (!putRes.ok) {
      throw new Error(`S3 upload ${putRes.status}`);
    }

    const completeRes = await fetch('/api/files/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key,
        fileName: file.name,
        fileType: contentType,
        size: file.size,
        entityType: `pipeline-packaging-${category}`,
        entityId: productId,
        uploadedBy: 'User',
      }),
    });
    if (!completeRes.ok) {
      throw new Error(`complete ${completeRes.status}`);
    }
  };

  const runPackagingUpload = async (
    files: File[],
    category: 'mockup' | 'dieline' | 'spec',
    label: string,
  ) => {
    const successes: string[] = [];
    const failures: { name: string; reason: string }[] = [];
    for (const f of files) {
      try {
        await uploadFileToS3(f, category);
        successes.push(f.name);
      } catch (err) {
        const reason = err instanceof Error ? err.message : 'unknown error';
        failures.push({ name: f.name, reason });
      }
    }
    await fetchSavedFiles();

    if (successes.length > 0 && failures.length === 0) {
      toast.success(`${successes.length} ${label}${successes.length > 1 ? 's' : ''} uploaded successfully`, { duration: 3000 });
    } else if (failures.length > 0 && successes.length === 0) {
      toast.error(`Failed to upload ${failures[0].name}`, {
        description: failures[0].reason,
        duration: 6000,
      });
    } else {
      toast.warning(`${successes.length} uploaded, ${failures.length} failed`, {
        description: `First failure: ${failures[0].name} — ${failures[0].reason}`,
        duration: 6000,
      });
    }
  };

  const handleDeleteSavedFile = async (fileId: string) => {
    try {
      const res = await fetch('/api/files/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: fileId }),
      });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('File deleted');
      await fetchSavedFiles();
    } catch {
      toast.error('Failed to delete file');
    }
  };

  const handleMockupUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const files = input.files;
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files);
    if (productId) {
      await runPackagingUpload(fileArray, 'mockup', 'mockup');
    } else {
      setMockups([...mockups, ...fileArray]);
      toast.success(`${fileArray.length} mockup${fileArray.length > 1 ? 's' : ''} uploaded successfully`, { duration: 3000 });
    }
    input.value = '';
  };

  const handleDielineUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const files = input.files;
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files);
    if (productId) {
      await runPackagingUpload(fileArray, 'dieline', 'dieline file');
    } else {
      setDielineFiles([...dielineFiles, ...fileArray]);
      toast.success(`${fileArray.length} dieline file${fileArray.length > 1 ? 's' : ''} uploaded successfully`, { duration: 3000 });
    }
    input.value = '';
  };

  const handleSpecUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const files = input.files;
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files);
    if (productId) {
      await runPackagingUpload(fileArray, 'spec', 'spec sheet');
    } else {
      setSpecSheets([...specSheets, ...fileArray]);
      toast.success(`${fileArray.length} spec sheet${fileArray.length > 1 ? 's' : ''} uploaded successfully`, { duration: 3000 });
    }
    input.value = '';
  };

  const handleDeleteFile = () => {
    if (fileToDelete) {
      switch (fileToDelete.type) {
        case 'mockup': setMockups(mockups.filter((_, i) => i !== fileToDelete.index)); break;
        case 'dieline': setDielineFiles(dielineFiles.filter((_, i) => i !== fileToDelete.index)); break;
        case 'spec': setSpecSheets(specSheets.filter((_, i) => i !== fileToDelete.index)); break;
      }
      setDeleteModalOpen(false);
      setFileToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Save Button */}
      <div className="flex justify-end">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSavePackaging}
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Save Packaging'}
        </motion.button>
      </div>

      {/* Packaging Dimensions */}
      <div className="bg-white rounded-xl border-2 border-slate-200 overflow-visible">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-3">
          <Box className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-slate-900">Packaging Dimensions</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Length</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="0.00"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <UnitDropdown options={['in', 'cm', 'mm']} defaultOption="in" value={lengthUnit} onChange={setLengthUnit} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Width</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="0.00"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <UnitDropdown options={['in', 'cm', 'mm']} defaultOption="in" value={widthUnit} onChange={setWidthUnit} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Height</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="0.00"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <UnitDropdown options={['in', 'cm', 'mm']} defaultOption="in" value={heightUnit} onChange={setHeightUnit} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Packaging Type */}
      <div className="bg-white rounded-xl border-2 border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-3">
          <Package className="w-5 h-5 text-green-600" />
          <h3 className="font-bold text-slate-900">Packaging Type</h3>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Primary Packaging</label>
            <FilterDropdown
              value={primaryPackaging}
              onChange={(v) => {
                setPrimaryPackaging(v);
                if (v !== 'Custom') setCustomPrimaryPackaging('');
              }}
              options={[
                { value: '', label: 'Select packaging type...' },
                { value: 'Poly Bag', label: 'Poly Bag' },
                { value: 'Box', label: 'Box' },
                { value: 'Blister Pack', label: 'Blister Pack' },
                { value: 'Clamshell', label: 'Clamshell' },
                { value: 'Custom', label: 'Custom' }
              ]}
              fullWidth
            />
            {primaryPackaging === 'Custom' && (
              <motion.input
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                type="text"
                value={customPrimaryPackaging}
                onChange={(e) => setCustomPrimaryPackaging(e.target.value)}
                placeholder="Enter custom packaging type..."
                className="mt-2 w-full px-4 py-2.5 bg-white border-2 border-green-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm"
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Material</label>
            <FilterDropdown
              value={packagingMaterial}
              onChange={(v) => {
                setPackagingMaterial(v);
                if (v !== 'Other') setCustomPackagingMaterial('');
              }}
              options={[
                { value: '', label: 'Select material...' },
                { value: 'Cardboard', label: 'Cardboard' },
                { value: 'Plastic', label: 'Plastic' },
                { value: 'Biodegradable', label: 'Biodegradable' },
                { value: 'Metal', label: 'Metal' },
                { value: 'Glass', label: 'Glass' },
                { value: 'Other', label: 'Other' }
              ]}
              fullWidth
            />
            {packagingMaterial === 'Other' && (
              <motion.input
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                type="text"
                value={customPackagingMaterial}
                onChange={(e) => setCustomPackagingMaterial(e.target.value)}
                placeholder="Enter custom material..."
                className="mt-2 w-full px-4 py-2.5 bg-white border-2 border-green-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm"
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Special Requirements</label>
            <textarea
              rows={3}
              placeholder="Enter any special packaging requirements..."
              value={specialRequirements}
              onChange={(e) => setSpecialRequirements(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
            />
          </div>
        </div>
      </div>

      {/* Packaging Mockups */}
      <div className="bg-white rounded-xl border-2 border-slate-200 overflow-visible">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ImageIcon className="w-5 h-5 text-pink-600" />
            <h3 className="font-bold text-slate-900">Packaging Mockups</h3>
          </div>
          <label htmlFor="mockup-upload">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              Upload Mockup
            </motion.div>
          </label>
          <input
            id="mockup-upload"
            type="file"
            multiple
            accept="*/*"
            onChange={handleMockupUpload}
            className="hidden"
          />
        </div>
        <div className="p-6">
          {savedMockups.length > 0 || mockups.length > 0 ? (
            <div className="space-y-2">
              <AnimatePresence>
                {savedMockups.map((f) => (
                  <motion.div
                    key={f.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg group hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {isImageFile(f.fileName) && f.key ? (
                        <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0 border border-slate-200">
                          <img src={getProxyUrl(f)} alt={f.fileName} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <FileText className="w-5 h-5 text-pink-600" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-slate-900">{f.fileName}</p>
                        <p className="text-xs text-slate-500">{f.size ? `${(f.size / 1024).toFixed(2)} KB` : ''}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {(f.key || f.fileUrl) && (
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleDownloadSavedFile(f)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Download">
                          <Download className="w-4 h-4" />
                        </motion.button>
                      )}
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleDeleteSavedFile(f.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
                {mockups.map((file, index) => (
                  <motion.div
                    key={`local-${index}`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg group hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-pink-600" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">{file.name}</p>
                        <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => { const url = URL.createObjectURL(file); const a = document.createElement('a'); a.href = url; a.download = file.name; a.click(); URL.revokeObjectURL(url); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Download">
                        <Download className="w-4 h-4" />
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => { setFileToDelete({ file, index, type: 'mockup' }); setDeleteModalOpen(true); }} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-2xl flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-slate-400" />
              </div>
              <h4 className="font-bold text-slate-900 mb-2">No packaging mockups uploaded</h4>
              <p className="text-sm text-slate-600 mb-4">
                Upload images of packaging designs or mockups
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Dieline & CAD Files */}
      <div className="bg-white rounded-xl border-2 border-slate-200 overflow-visible">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-slate-900">Dieline & CAD Files</h3>
          </div>
          <label htmlFor="dieline-upload">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              Upload Files
            </motion.div>
          </label>
          <input
            id="dieline-upload"
            type="file"
            multiple
            accept="*/*"
            onChange={handleDielineUpload}
            className="hidden"
          />
        </div>
        <div className="p-6">
          {savedDielines.length > 0 || dielineFiles.length > 0 ? (
            <div className="space-y-2">
              <AnimatePresence>
                {savedDielines.map((f) => (
                  <motion.div
                    key={f.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg group hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {isImageFile(f.fileName) && f.key ? (
                        <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0 border border-slate-200">
                          <img src={getProxyUrl(f)} alt={f.fileName} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <FileText className="w-5 h-5 text-purple-600" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-slate-900">{f.fileName}</p>
                        <p className="text-xs text-slate-500">{f.size ? `${(f.size / 1024).toFixed(2)} KB` : ''}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {(f.key || f.fileUrl) && (
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleDownloadSavedFile(f)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Download">
                          <Download className="w-4 h-4" />
                        </motion.button>
                      )}
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleDeleteSavedFile(f.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
                {dielineFiles.map((file, index) => (
                  <motion.div
                    key={`local-${index}`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg group hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">{file.name}</p>
                        <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => { const url = URL.createObjectURL(file); const a = document.createElement('a'); a.href = url; a.download = file.name; a.click(); URL.revokeObjectURL(url); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Download">
                        <Download className="w-4 h-4" />
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => { setFileToDelete({ file, index, type: 'dieline' }); setDeleteModalOpen(true); }} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-2xl flex items-center justify-center">
                <FileText className="w-8 h-8 text-slate-400" />
              </div>
              <h4 className="font-bold text-slate-900 mb-2">No dieline files uploaded</h4>
              <p className="text-sm text-slate-600 mb-4">
                Upload AI, PDF, or CAD files for packaging production
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Packaging Spec Sheet */}
      <div className="bg-white rounded-xl border-2 border-slate-200 overflow-visible">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Download className="w-5 h-5 text-orange-600" />
            <h3 className="font-bold text-slate-900">Packaging Spec Sheet</h3>
          </div>
          <label htmlFor="spec-upload">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              Upload Spec Sheet
            </motion.div>
          </label>
          <input
            id="spec-upload"
            type="file"
            multiple
            accept="*/*"
            onChange={handleSpecUpload}
            className="hidden"
          />
        </div>
        <div className="p-6">
          {savedSpecSheets.length > 0 || specSheets.length > 0 ? (
            <div className="space-y-2">
              <AnimatePresence>
                {savedSpecSheets.map((f) => (
                  <motion.div
                    key={f.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg group hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {isImageFile(f.fileName) && f.key ? (
                        <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0 border border-slate-200">
                          <img src={getProxyUrl(f)} alt={f.fileName} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <FileText className="w-5 h-5 text-orange-600" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-slate-900">{f.fileName}</p>
                        <p className="text-xs text-slate-500">{f.size ? `${(f.size / 1024).toFixed(2)} KB` : ''}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {(f.key || f.fileUrl) && (
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleDownloadSavedFile(f)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Download">
                          <Download className="w-4 h-4" />
                        </motion.button>
                      )}
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleDeleteSavedFile(f.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
                {specSheets.map((file, index) => (
                  <motion.div
                    key={`local-${index}`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg group hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-orange-600" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">{file.name}</p>
                        <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => { const url = URL.createObjectURL(file); const a = document.createElement('a'); a.href = url; a.download = file.name; a.click(); URL.revokeObjectURL(url); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Download">
                        <Download className="w-4 h-4" />
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => { setFileToDelete({ file, index, type: 'spec' }); setDeleteModalOpen(true); }} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-2xl flex items-center justify-center">
                <FileText className="w-8 h-8 text-slate-400" />
              </div>
              <h4 className="font-bold text-slate-900 mb-2">No spec sheet uploaded</h4>
              <p className="text-sm text-slate-600 mb-4">
                Upload detailed packaging specifications
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Checklist - Moved to Bottom */}
      <ChecklistWidget
        productId={productId}
        tabId="packaging"
      />

      {/* Delete Document Modal */}
      <DeleteDocumentModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteFile}
        fileName={fileToDelete?.file.name || ''}
      />
    </div>
  );
}