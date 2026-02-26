import { motion, AnimatePresence } from 'motion/react';
import { X, Package, Plus, Upload } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner@2.0.3';
import { DatePicker } from './DatePicker';
import { FilterDropdown } from './FilterDropdown';

interface AddSampleDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface IssueToFix {
  id: string;
  text: string;
}

export function AddSampleDrawer({ isOpen, onClose, onSuccess }: AddSampleDrawerProps) {
  const [sampleName, setSampleName] = useState('');
  const [sampleType, setSampleType] = useState('Factory Sample');
  const [version, setVersion] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [requestDate, setRequestDate] = useState('');
  const [receivedDate, setReceivedDate] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('');
  const [comparisonToPrevious, setComparisonToPrevious] = useState('N/A (First Sample)');
  const [imageAngle, setImageAngle] = useState('Front');
  const [imagesToUpload, setImagesToUpload] = useState<File[]>([]);
  const [issuesToFix, setIssuesToFix] = useState<IssueToFix[]>([]);
  const [newIssueText, setNewIssueText] = useState('');
  const [notes, setNotes] = useState('');

  const sampleTypes = [
    { value: 'Factory Sample', label: 'Factory Sample' },
    { value: 'Competitor Sample', label: 'Competitor Sample' },
    { value: 'Pre-Production Sample', label: 'Pre-Production Sample' },
    { value: 'Production Sample', label: 'Production Sample' }
  ];

  const carriers = [
    { value: '', label: 'None' },
    { value: 'FedEx', label: 'FedEx' },
    { value: 'UPS', label: 'UPS' },
    { value: 'DHL', label: 'DHL' },
    { value: 'USPS', label: 'USPS' },
    { value: 'Other', label: 'Other' }
  ];

  const comparisonOptions = [
    { value: 'N/A (First Sample)', label: 'N/A (First Sample)' },
    { value: 'Better than Previous', label: 'Better than Previous' },
    { value: 'Same as Previous', label: 'Same as Previous' },
    { value: 'Worse than Previous', label: 'Worse than Previous' }
  ];

  const imageAngles = [
    { value: 'Front', label: 'Front' },
    { value: 'Back', label: 'Back' },
    { value: 'Left Side', label: 'Left Side' },
    { value: 'Right Side', label: 'Right Side' },
    { value: 'Top', label: 'Top' },
    { value: 'Bottom', label: 'Bottom' },
    { value: 'Detail', label: 'Detail' },
    { value: 'Other', label: 'Other' }
  ];

  const handleAddIssue = () => {
    if (newIssueText.trim()) {
      setIssuesToFix([...issuesToFix, { id: Date.now().toString(), text: newIssueText.trim() }]);
      setNewIssueText('');
    }
  };

  const handleRemoveIssue = (id: string) => {
    setIssuesToFix(issuesToFix.filter(issue => issue.id !== id));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setImagesToUpload([...imagesToUpload, ...Array.from(files)]);
      toast.success(`${files.length} image${files.length > 1 ? 's' : ''} added`, {
        description: 'Sample images have been added.',
        duration: 2000,
      });
    }
  };

  const handleSubmit = () => {
    if (!sampleName.trim()) {
      toast.error('Sample name is required');
      return;
    }

    // Here you would typically send this data to your backend
    console.log('Sample data:', {
      sampleName,
      sampleType,
      version,
      vendorName,
      requestDate,
      receivedDate,
      trackingNumber,
      carrier,
      comparisonToPrevious,
      imagesToUpload,
      issuesToFix,
      notes,
    });

    toast.success('Sample added successfully', {
      description: 'Your sample has been added to the tracking system.',
      duration: 3000,
    });

    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed right-0 top-0 bottom-0 w-[500px] bg-white shadow-2xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 flex-shrink-0">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Add Sample</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Create a new sample with images and quality notes</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </motion.button>
              </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
                {/* Sample Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Sample Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={sampleName}
                    onChange={(e) => setSampleName(e.target.value)}
                    placeholder="e.g., Factory Sample V1, Competitor Sample"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                {/* Sample Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Sample Type <span className="text-red-500">*</span>
                  </label>
                  <FilterDropdown
                    value={sampleType}
                    onChange={setSampleType}
                    options={sampleTypes}
                    fullWidth
                  />
                </div>

                {/* Version */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">Version</label>
                  <input
                    type="text"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    placeholder="e.g., V1, V2, V3"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                {/* Vendor Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">Vendor Name</label>
                  <input
                    type="text"
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    placeholder="None"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                {/* Request Date */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">Request Date</label>
                  <DatePicker
                    value={requestDate}
                    onChange={setRequestDate}
                  />
                </div>

                {/* Received Date */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">Received Date</label>
                  <DatePicker
                    value={receivedDate}
                    onChange={setReceivedDate}
                  />
                </div>

                {/* Tracking Number */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">Tracking Number</label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="e.g., 1Z999AA10123456784"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                {/* Carrier */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">Carrier</label>
                  <FilterDropdown
                    value={carrier}
                    onChange={setCarrier}
                    options={carriers}
                    fullWidth
                  />
                </div>

                {/* Comparison to Previous Version */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">Comparison to Previous Version</label>
                  <FilterDropdown
                    value={comparisonToPrevious}
                    onChange={setComparisonToPrevious}
                    options={comparisonOptions}
                    fullWidth
                  />
                </div>

                {/* Sample Images */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">Sample Images</label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <FilterDropdown
                        value={imageAngle}
                        onChange={setImageAngle}
                        options={imageAngles}
                        fullWidth
                      />
                    </div>
                    <label htmlFor="sample-image-upload" className="flex-shrink-0">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg cursor-pointer transition-colors inline-flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Choose File
                      </motion.div>
                    </label>
                    <input
                      id="sample-image-upload"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                  {imagesToUpload.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {imagesToUpload.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-sm"
                        >
                          <span className="text-slate-700 truncate">{file.name}</span>
                          <button
                            onClick={() => setImagesToUpload(imagesToUpload.filter((_, i) => i !== index))}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Issues to Fix */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">Issues to Fix</label>
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="text"
                      value={newIssueText}
                      onChange={(e) => setNewIssueText(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddIssue();
                        }
                      }}
                      placeholder="Add an issue to track"
                      className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleAddIssue}
                      className="w-10 h-10 bg-slate-900 hover:bg-slate-800 text-white rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
                    >
                      <Plus className="w-5 h-5" />
                    </motion.button>
                  </div>
                  {issuesToFix.length > 0 && (
                    <div className="space-y-2">
                      {issuesToFix.map((issue) => (
                        <div
                          key={issue.id}
                          className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
                        >
                          <span className="text-sm text-slate-900">{issue.text}</span>
                          <button
                            onClick={() => handleRemoveIssue(issue.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about this sample..."
                    rows={4}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                  />
                </div>
              </div>

              {/* Footer - Fixed at Bottom */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50 flex-shrink-0">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm"
                >
                  Add Sample
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
