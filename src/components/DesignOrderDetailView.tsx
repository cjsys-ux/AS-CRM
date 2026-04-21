import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Upload, CheckCircle, Clock, AlertTriangle, Image as ImageIcon, FileText, Eye, X, RotateCcw, ThumbsUp, ThumbsDown, Package, User, Calendar, Hash, MessageSquare, History, ChevronDown, Download, Trash2, FolderOpen, FileImage, Building2, Paperclip } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import type { DesignTask, RevisionEntry, DesignFile, ImprintLocation } from './DesignLabModule';

interface DesignOrderDetailViewProps {
  task: DesignTask;
  onBack: () => void;
  onTaskUpdated: () => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Design Approved':
    case 'Approved': return 'bg-green-100 text-green-700 border-green-200';
    case 'Design Ready':
    case 'In Review':
    case 'Art Uploaded': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'Pending Design':
    case 'Pending Art': return 'bg-slate-100 text-slate-600 border-slate-200';
    case 'Revision Requested':
    case 'Revision Needed': return 'bg-amber-100 text-amber-700 border-amber-200';
    default: return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Design Approved':
    case 'Approved': return <CheckCircle className="w-4 h-4" />;
    case 'Design Ready':
    case 'In Review':
    case 'Art Uploaded': return <Eye className="w-4 h-4" />;
    case 'Pending Design':
    case 'Pending Art': return <Clock className="w-4 h-4" />;
    case 'Revision Requested':
    case 'Revision Needed': return <AlertTriangle className="w-4 h-4" />;
    default: return <Clock className="w-4 h-4" />;
  }
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export function DesignOrderDetailView({ task: initialTask, onBack, onTaskUpdated }: DesignOrderDetailViewProps) {
  const [task, setTask] = useState<DesignTask>(initialTask);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'files' | 'history'>('upload');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showApprovalStatusPopup, setShowApprovalStatusPopup] = useState(false);
  const [revisionFeedback, setRevisionFeedback] = useState('');
  const [artPreview, setArtPreview] = useState<string | null>(task.artFile);
  const [mockupPreview, setMockupPreview] = useState<string | null>(task.mockupFile);
  const [artFileName, setArtFileName] = useState<string>(task.artFileName || '');
  const [mockupFileName, setMockupFileName] = useState<string>(task.mockupFileName || '');
  const [notes, setNotes] = useState(task.notes || '');
  const [assignedTo, setAssignedTo] = useState(task.assignedTo || '');
  const [files, setFiles] = useState<DesignFile[]>(task.files || []);
  const [availableImprintLocations, setAvailableImprintLocations] = useState<ImprintLocation[]>([]);
  const [selectedImprintLocations, setSelectedImprintLocations] = useState<string[]>(task.selectedImprintLocations || []);
  const [imprintMethod, setImprintMethod] = useState<string>(task.imprintMethod || '');
  const [imprintMethodDropdownOpen, setImprintMethodDropdownOpen] = useState(false);
  const [availableImprintMethods, setAvailableImprintMethods] = useState<string[]>([]);

  // Approval workflow state
  const [approvalType, setApprovalType] = useState<'customer' | 'internal' | null>(null);
  const [customerEmail, setCustomerEmail] = useState('');
  const [internalApprover, setInternalApprover] = useState('');
  const [managerApproval, setManagerApproval] = useState(false);
  const [managerPassword, setManagerPassword] = useState('');
  const [approvalStep, setApprovalStep] = useState<'select' | 'customer-email' | 'internal-approval' | 'manager-auth'>('select');
  const [pendingApprovalId, setPendingApprovalId] = useState<string | null>(initialTask.pendingApprovalId || null);

  // Per-location art file state
  type LocationArtFileState = { preview: string | null; fileName: string; pending: string | null };
  const [locationArtFiles, setLocationArtFiles] = useState<Record<string, LocationArtFileState>>(() => {
    const initial: Record<string, LocationArtFileState> = {};
    if (initialTask.locationArtFiles) {
      Object.entries(initialTask.locationArtFiles).forEach(([id, d]) => {
        initial[id] = { preview: d.fileData, fileName: d.fileName, pending: null };
      });
    }
    return initial;
  });
  const locationArtInputRef = useRef<HTMLInputElement>(null);
  const currentUploadLocationRef = useRef<string | null>(null);

  const artInputRef = useRef<HTMLInputElement>(null);
  const mockupInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch imprint locations from product database
  useEffect(() => {
    const loadImprintLocations = async () => {
      // Default imprint locations to use as fallback
      const defaultLocations: ImprintLocation[] = [
        { id: 'front-chest', name: 'Front Chest', printArea: '4" x 4"', decorationMethod: 'Screen Print', maxColors: 6 },
        { id: 'full-front', name: 'Full Front', printArea: '12" x 16"', decorationMethod: 'DTG', maxColors: 999 },
        { id: 'back', name: 'Back', printArea: '12" x 14"', decorationMethod: 'Screen Print', maxColors: 6 },
        { id: 'left-sleeve', name: 'Left Sleeve', printArea: '2.5" x 2.5"', decorationMethod: 'Embroidery' },
        { id: 'right-sleeve', name: 'Right Sleeve', printArea: '2.5" x 2.5"', decorationMethod: 'Embroidery' },
      ];

      console.log('[Imprint Locations] Starting load for SKU:', task.sku);

      try {
        // Fetch products from Supabase KV API
        const response = await fetch('/api/productdb/list');
        if (!response.ok) {
          setAvailableImprintLocations(defaultLocations);
          return;
        }
        const data = await response.json();

        if (!data.products) {
          setAvailableImprintLocations(defaultLocations);
          return;
        }

        // Products from /api/productdb/list are already JSON-shaped.
        const products = (data.products || []).map((entry: any) => {
          try {
            return entry;
          } catch { return null; }
        }).filter((p: any) => p && p.name);
        
        console.log('[Imprint Locations] Total products loaded:', products.length);
        console.log('[Imprint Locations] Looking for SKU:', task.sku?.trim());
        console.log('[Imprint Locations] Available SKUs:', products.map((p: any) => p.sku).filter(Boolean));
        
        const currentProduct = products.find((p: any) => p.sku?.trim() === task.sku?.trim());
        
        console.log('[Imprint Locations] Product found:', !!currentProduct);
        if (currentProduct) {
          console.log('[Imprint Locations] Product name:', currentProduct.name);
          console.log('[Imprint Locations] Has imprintLocations:', !!currentProduct.imprintLocations);
          console.log('[Imprint Locations] imprintLocations length:', currentProduct.imprintLocations?.length);
          console.log('[Imprint Locations] imprintLocations data:', currentProduct.imprintLocations);
          // Log each location individually to see structure
          if (currentProduct.imprintLocations && Array.isArray(currentProduct.imprintLocations)) {
            currentProduct.imprintLocations.forEach((loc: any, idx: number) => {
              console.log(`[Imprint Locations] Location ${idx}:`, loc);
              console.log(`[Imprint Locations] Location ${idx} keys:`, Object.keys(loc));
              console.log(`[Imprint Locations] Location ${idx} JSON:`, JSON.stringify(loc, null, 2));
            });
          }
        }
        
        if (currentProduct?.imprintLocations && Array.isArray(currentProduct.imprintLocations) && currentProduct.imprintLocations.length > 0) {
          // Check if locations are strings or objects
          const firstLoc = currentProduct.imprintLocations[0];
          const isStringArray = typeof firstLoc === 'string';
          
          console.log('[Imprint Locations] Is string array:', isStringArray);
          
          // Transform string locations into proper objects
          let processedLocations = currentProduct.imprintLocations;
          
          if (isStringArray) {
            // Map common location names to full location objects
            const locationMap: { [key: string]: ImprintLocation } = {
              'Front': { id: 'front', name: 'Front', printArea: '12" x 16"', decorationMethod: 'Screen Print', maxColors: 6 },
              'Front Chest': { id: 'front-chest', name: 'Front Chest', printArea: '4" x 4"', decorationMethod: 'Screen Print', maxColors: 6 },
              'Full Front': { id: 'full-front', name: 'Full Front', printArea: '12" x 16"', decorationMethod: 'DTG', maxColors: 999 },
              'Back': { id: 'back', name: 'Back', printArea: '12" x 14"', decorationMethod: 'Screen Print', maxColors: 6 },
              'Full Back': { id: 'full-back', name: 'Full Back', printArea: '12" x 14"', decorationMethod: 'DTG', maxColors: 999 },
              'Left Chest': { id: 'left-chest', name: 'Left Chest', printArea: '4" x 4"', decorationMethod: 'Embroidery' },
              'Right Chest': { id: 'right-chest', name: 'Right Chest', printArea: '4" x 4"', decorationMethod: 'Embroidery' },
              'Left Sleeve': { id: 'left-sleeve', name: 'Left Sleeve', printArea: '2.5" x 2.5"', decorationMethod: 'Embroidery' },
              'Right Sleeve': { id: 'right-sleeve', name: 'Right Sleeve', printArea: '2.5" x 2.5"', decorationMethod: 'Embroidery' },
              'Hood': { id: 'hood', name: 'Hood', printArea: '3" x 3"', decorationMethod: 'Screen Print', maxColors: 4 },
              'Pocket': { id: 'pocket', name: 'Pocket', printArea: '3" x 3"', decorationMethod: 'Screen Print', maxColors: 4 },
            };
            
            processedLocations = currentProduct.imprintLocations
              .map((locName: string) => {
                const trimmedName = locName?.trim();
                // Try exact match first
                if (locationMap[trimmedName]) {
                  return locationMap[trimmedName];
                }
                // Try case-insensitive match
                const matchKey = Object.keys(locationMap).find(k => k.toLowerCase() === trimmedName?.toLowerCase());
                if (matchKey) {
                  return locationMap[matchKey];
                }
                // Create a basic location object if no match
                return {
                  id: trimmedName?.toLowerCase().replace(/\s+/g, '-') || 'unknown',
                  name: trimmedName || 'Unnamed Location',
                  printArea: '4" x 4"',
                  decorationMethod: 'Screen Print',
                  maxColors: 6
                };
              })
              .filter(Boolean);
              
            console.log('[Imprint Locations] Processed string locations:', processedLocations);
          }
          
          // Filter to only show locations that are marked as selected/default for this product
          const selectedLocations = processedLocations.filter((loc: any) => {
            // If it's a transformed string location, include it by default
            if (isStringArray) return true;
            // Only show locations explicitly marked as selected or default
            // Also check they're not disabled
            return (loc.selected === true || loc.default === true) && loc.enabled !== false && loc.available !== false;
          });
          
          console.log('[Imprint Locations] Selected/default locations:', selectedLocations.length);
          
          // If no locations are marked as selected/default, fall back to showing all enabled locations
          const locationsToShow = selectedLocations.length > 0 ? selectedLocations : processedLocations.filter((loc: any) => {
            return loc.enabled !== false && loc.available !== false;
          });
          
          console.log('[Imprint Locations] Locations to show:', locationsToShow.length);
          console.log('[Imprint Locations] Location names:', locationsToShow.map((l: any) => l.name));
          
          setAvailableImprintLocations(locationsToShow);
          
          // Auto-select all locations for string arrays
          if (isStringArray && locationsToShow.length > 0) {
            const preSelectedIds = locationsToShow.map((loc: any) => loc.id);
            console.log('[Imprint Locations] Auto-selecting all locations:', preSelectedIds);
            setSelectedImprintLocations(preSelectedIds);
          } else if (selectedLocations.length > 0) {
            // Always auto-select the locations that are marked as selected/default from the product database
            const preSelectedIds = selectedLocations.map((loc: any) => loc.id);
            console.log('[Imprint Locations] Auto-selecting locations:', preSelectedIds);
            setSelectedImprintLocations(preSelectedIds);
          }
        } else {
          // Use default imprint locations if none defined in product
          console.log('[Imprint Locations] No imprint locations in product, using defaults');
          setAvailableImprintLocations(defaultLocations);
        }
      } catch (error) {
        console.error('[Imprint Locations] Error loading:', error);
        // Set default locations on error
        setAvailableImprintLocations(defaultLocations);
      }
    };
    
    loadImprintLocations();
  }, [task.sku, task.selectedImprintLocations]);

  // Sync selectedImprintLocations from task when it updates (after updateTask)
  useEffect(() => {
    if (task.selectedImprintLocations) {
      setSelectedImprintLocations(task.selectedImprintLocations);
    }
  }, [task.selectedImprintLocations]);

  // Sync files from task when it updates
  useEffect(() => {
    if (task.files) {
      setFiles(task.files);
    }
  }, [task.files]);

  // Load available imprint methods from product data
  useEffect(() => {
    const loadImprintMethods = async () => {
      const defaultMethods = ['Screen Print', 'Pad Print', 'Full Color', 'Laser Engrave', 'Embroidery', 'Heat Transfer', 'Sublimation', 'Deboss', 'UV Print', 'DTF'];
      
      try {
        const response = await fetch('/api/productdb/list');
        if (!response.ok) {
          setAvailableImprintMethods(defaultMethods);
          return;
        }
        const data = await response.json();

        if (!data.products) {
          setAvailableImprintMethods(defaultMethods);
          return;
        }

        const products = (data.products || []).map((entry: any) => {
          try {
            const val = entry;
            return val;
          } catch { return null; }
        }).filter((p: any) => p && p.name);
        
        console.log('[Imprint Methods] Looking for SKU:', task.sku);
        console.log('[Imprint Methods] Available products:', products.map((p: any) => ({ sku: p.sku, name: p.name })));
        
        const currentProduct = products.find((p: any) => p.sku?.trim() === task.sku?.trim());
        console.log('[Imprint Methods] Found product:', currentProduct ? { sku: currentProduct.sku, decorationMethods: currentProduct.decorationMethods } : 'NOT FOUND');
        
        if (currentProduct?.decorationMethods && Array.isArray(currentProduct.decorationMethods) && currentProduct.decorationMethods.length > 0) {
          console.log('[Imprint Methods] Setting methods from product:', currentProduct.decorationMethods);
          setAvailableImprintMethods(currentProduct.decorationMethods);
        } else {
          console.log('[Imprint Methods] No decoration methods on product, using defaults');
          setAvailableImprintMethods(defaultMethods);
        }
      } catch (error) {
        console.error('Error loading imprint methods:', error);
        setAvailableImprintMethods(defaultMethods);
      }
    };
    
    loadImprintMethods();
  }, [task.sku]);

  // Poll for manager approval
  useEffect(() => {
    if (!pendingApprovalId) return;

    const checkApproval = async () => {
      const requests = JSON.parse(localStorage.getItem('design-approval-requests') || '[]');
      const currentRequest = requests.find((r: any) => r.id === pendingApprovalId);
      
      if (currentRequest?.status === 'approved') {
        // Manager approved - update the task
        setSaving(true);
        try {
          const updated = await updateTask({ 
            status: 'Design Approved',
            approvalType: 'internal',
            internalApprover,
            managerApproved: true,
            approvedAt: new Date().toISOString(),
            approvedBy: currentRequest.approvedBy || 'Manager',
            pendingApprovalId: null,
          });
          if (updated) {
            toast.success(`Design approved by ${currentRequest.approvedBy || 'Manager'}`);
            setShowApprovalModal(false);
            setApprovalStep('select');
            setPendingApprovalId(null);
          }
        } catch (err) {
          toast.error('Failed to approve design');
        } finally {
          setSaving(false);
        }
      } else if (currentRequest?.status === 'rejected') {
        // Manager rejected
        toast.error(`Approval rejected by ${currentRequest.rejectedBy || 'Manager'}`);
        setPendingApprovalId(null);
        await updateTask({ pendingApprovalId: null });
        setApprovalStep('select');
      }
    };

    // Poll every 2 seconds
    const interval = setInterval(checkApproval, 2000);
    return () => clearInterval(interval);
  }, [pendingApprovalId, internalApprover]);

  const toggleImprintLocation = (locationId: string) => {
    setSelectedImprintLocations(prev => 
      prev.includes(locationId) 
        ? prev.filter(id => id !== locationId)
        : [...prev, locationId]
    );
  };

  const handleLocationArtUpload = (locationId: string) => {
    currentUploadLocationRef.current = locationId;
    locationArtInputRef.current?.click();
  };

  const handleLocationFileSelect = (file: File) => {
    const locationId = currentUploadLocationRef.current;
    if (!locationId) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setLocationArtFiles(prev => ({
        ...prev,
        [locationId]: { preview: dataUrl, fileName: file.name, pending: dataUrl },
      }));
      setFilesChanged(true);
    };
    reader.readAsDataURL(file);
  };

  const removeLocationArt = (locationId: string) => {
    setLocationArtFiles(prev => ({
      ...prev,
      [locationId]: { preview: null, fileName: '', pending: null },
    }));
  };

  const updateTask = async (updates: Partial<DesignTask>) => {
    setSaving(true);
    try {
      const res = await fetch('/api/design-tasks/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: task.id, ...updates }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(`Failed to update: ${data.error || 'unknown error'}`);
        return null;
      }
      const next = { ...task, ...updates } as DesignTask;
      setTask(next);
      onTaskUpdated();
      return next;
    } catch (err) {
      console.error('Error updating design task:', err);
      toast.error('Failed to update task');
    } finally {
      setSaving(false);
    }
    return null;
  };

  const [pendingArtData, setPendingArtData] = useState<string | null>(null);
  const [pendingMockupData, setPendingMockupData] = useState<string | null>(null);
  const [filesChanged, setFilesChanged] = useState(false);

  const handleFileSelect = (type: 'art' | 'mockup', file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (type === 'art') {
        setArtPreview(dataUrl);
        setArtFileName(file.name);
        setPendingArtData(dataUrl);
      } else {
        setMockupPreview(dataUrl);
        setMockupFileName(file.name);
        setPendingMockupData(dataUrl);
      }
      setFilesChanged(true);
    };
    reader.readAsDataURL(file);
  };

  const uploadFile = async (type: 'art' | 'mockup', base64Data: string, fileName: string): Promise<string | null> => {
    try {
      // Upload the bytes to S3 via the local presign/upload endpoint.
      const [header, dataPart] = base64Data.split(',');
      const fileType = header.match(/:(.*?);/)?.[1] ?? 'image/png';
      const uploadRes = await fetch('/api/files/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: fileName || `${type}-${Date.now()}.png`,
          fileType,
          entityType: 'design-task',
          entityId: task.id,
          fileData: dataPart,
        }),
      });
      if (!uploadRes.ok) {
        toast.error(`Upload failed`);
        return null;
      }
      const { key, fileUrl } = await uploadRes.json();
      const url = fileUrl || `/api/files/image?key=${encodeURIComponent(key)}`;

      // Append metadata to task.attachments and persist.
      const attachments = Array.isArray(task.attachments) ? [...task.attachments] : [];
      attachments.push({
        id: `att-${Date.now()}`,
        type,
        fileName: fileName || `${type}.png`,
        fileKey: key,
        fileUrl: url,
        uploadedAt: new Date().toISOString(),
      });
      const patchRes = await fetch('/api/design-tasks/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: task.id, attachments }),
      });
      if (patchRes.ok) {
        const next = { ...task, attachments } as DesignTask;
        setTask(next);
        onTaskUpdated();
        return url;
      } else {
        toast.error('Upload saved to S3 but metadata failed');
        return url;
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      toast.error('Failed to upload file');
      return null;
    }
  };

  const handleAddFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const newFile: DesignFile = {
        id: `file-${Date.now()}`,
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size,
        url: reader.result as string,
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'Designer',
      };
      const updatedFiles = [...files, newFile];
      setFiles(updatedFiles);
      await updateTask({ files: updatedFiles } as any);
      toast.success(`File "${file.name}" added`);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = async (fileId: string) => {
    const updatedFiles = files.filter(f => f.id !== fileId);
    setFiles(updatedFiles);
    await updateTask({ files: updatedFiles } as any);
    toast.success('File removed');
  };

  const handleSaveFiles = async () => {
    setSaving(true);
    try {
      if (pendingArtData && artFileName) {
        const url = await uploadFile('art', pendingArtData, artFileName);
        if (url) { setArtPreview(url); setPendingArtData(null); }
      }
      if (pendingMockupData && mockupFileName) {
        const url = await uploadFile('mockup', pendingMockupData, mockupFileName);
        if (url) { setMockupPreview(url); setPendingMockupData(null); }
      }
      // Build locationArtFiles save data
      const locationArtFilesData: Record<string, { fileData: string | null; fileName: string }> = {};
      Object.entries(locationArtFiles).forEach(([locId, data]) => {
        if (data.preview || data.fileName) {
          locationArtFilesData[locId] = { fileData: data.preview, fileName: data.fileName };
        }
      });

      const updates: Partial<DesignTask> = {
        notes, assignedTo, selectedImprintLocations, imprintMethod,
        locationArtFiles: locationArtFilesData,
      };
      const hasArt = !!(pendingArtData || task.artFile || artPreview) || Object.values(locationArtFiles).some(f => f.preview);
      if (hasArt && (task.status === 'Pending Design' || task.status === 'Pending Art' || task.status === 'Revision Requested' || task.status === 'Revision Needed')) {
        updates.status = 'Design Ready';
      }
      await updateTask(updates);
      toast.success('Files saved successfully');
      setFilesChanged(false);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!task.artFile && !artPreview && !pendingArtData) {
      toast.error('Please upload art file before submitting for review');
      return;
    }
    setSaving(true);
    try {
      if (pendingArtData && artFileName) {
        const url = await uploadFile('art', pendingArtData, artFileName);
        if (url) { setArtPreview(url); setPendingArtData(null); }
      }
      if (pendingMockupData && mockupFileName) {
        const url = await uploadFile('mockup', pendingMockupData, mockupFileName);
        if (url) { setMockupPreview(url); setPendingMockupData(null); }
      }
      const locationArtFilesData: Record<string, { fileData: string | null; fileName: string }> = {};
      Object.entries(locationArtFiles).forEach(([locId, data]) => {
        if (data.preview || data.fileName) {
          locationArtFilesData[locId] = { fileData: data.preview, fileName: data.fileName };
        }
      });
      const updates: Partial<DesignTask> = {
        status: 'Design Ready',
        selectedImprintLocations,
        imprintMethod,
        locationArtFiles: locationArtFilesData,
      };
      if (notes !== task.notes) updates.notes = notes;
      if (assignedTo !== task.assignedTo) updates.assignedTo = assignedTo;
      const updated = await updateTask(updates);
      if (updated) toast.success('Submitted — Design Ready');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenApprovalModal = () => {
    setShowApprovalModal(true);
    setApprovalStep('select');
    setApprovalType(null);
    // Auto-populate customer email from order if available
    const emailFromOrder = `${task.customer.toLowerCase().replace(/\s+/g, '.')}@example.com`;
    setCustomerEmail(emailFromOrder);
  };

  const handleShowApprovalStatus = () => {
    setShowApprovalStatusPopup(true);
  };

  const handleSelectApprovalType = (type: 'customer' | 'internal') => {
    setApprovalType(type);
    if (type === 'customer') {
      setApprovalStep('customer-email');
    } else {
      setApprovalStep('internal-approval');
    }
  };

  const handleSendToCustomer = async () => {
    if (!customerEmail.trim()) {
      toast.error('Please enter customer email');
      return;
    }
    setSaving(true);
    try {
      // Send email to customer with approval link
      const updated = await updateTask({ 
        status: 'Pending Customer Approval',
        customerApprovalEmail: customerEmail,
        approvalSentAt: new Date().toISOString(),
      });
      if (updated) {
        toast.success(`Approval request sent to ${customerEmail}`);
        setShowApprovalModal(false);
        setApprovalStep('select');
      }
    } catch (err) {
      toast.error('Failed to send approval request');
    } finally {
      setSaving(false);
    }
  };

  const handleInternalApprovalRequest = async () => {
    if (!internalApprover.trim()) {
      toast.error('Please enter your name');
      return;
    }
    
    // Create pending approval request
    const approvalId = `approval-${task.id}-${Date.now()}`;
    const approvalRequest = {
      id: approvalId,
      taskId: task.id,
      orderId: task.orderId,
      customer: task.customer,
      productName: task.itemName,
      approver: internalApprover,
      timestamp: new Date().toISOString(),
      status: 'pending',
      artPreview: artPreview || task.artFile,
      mockupPreview: mockupPreview || task.mockupFile,
    };
    
    // Store in localStorage for manager interface to access
    const existingRequests = JSON.parse(localStorage.getItem('design-approval-requests') || '[]');
    existingRequests.push(approvalRequest);
    localStorage.setItem('design-approval-requests', JSON.stringify(existingRequests));
    
    setPendingApprovalId(approvalId);
    
    // Save pendingApprovalId to task
    await updateTask({ pendingApprovalId: approvalId });
    
    setApprovalStep('manager-auth');
    
    toast.success('Approval request sent to manager');
  };

  const handleManagerApproval = async () => {
    if (!managerPassword.trim()) {
      toast.error('Manager password required');
      return;
    }
    // Simple manager password check (in production, use proper auth)
    if (managerPassword !== 'manager123') {
      toast.error('Invalid manager password');
      return;
    }
    setSaving(true);
    try {
      const updated = await updateTask({ 
        status: 'Design Approved',
        approvalType: 'internal',
        internalApprover,
        managerApproved: true,
        approvedAt: new Date().toISOString(),
      });
      if (updated) {
        toast.success(`Design approved internally by ${internalApprover}`);
        setShowApprovalModal(false);
        setApprovalStep('select');
        setManagerPassword('');
      }
    } catch (err) {
      toast.error('Failed to approve design');
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async () => {
    const updated = await updateTask({ status: 'Design Approved' });
    if (updated) {
      toast.success('Design approved!');
      setShowApprovalModal(false);
    }
  };

  const handleRequestRevision = async () => {
    if (!revisionFeedback.trim()) {
      toast.error('Please provide feedback for the revision');
      return;
    }
    const revisionEntry: RevisionEntry = {
      version: (task.currentRevision || 0) + 1,
      artFile: task.artFile,
      artFileName: task.artFileName,
      mockupFile: task.mockupFile,
      mockupFileName: task.mockupFileName,
      date: new Date().toISOString(),
      feedback: revisionFeedback,
      status: 'Revision Requested',
    };
    const updatedRevisions = [...(task.revisions || []), revisionEntry];
    const updated = await updateTask({
      status: 'Revision Requested',
      currentRevision: (task.currentRevision || 0) + 1,
      revisions: updatedRevisions,
    });
    if (updated) {
      toast.success('Revision requested');
      setShowApprovalModal(false);
      setRevisionFeedback('');
    }
  };

  const hasAnyLocationArt = Object.values(locationArtFiles).some(f => f.preview);
  const isFileUploaded = !!(task.artFile || artPreview) || hasAnyLocationArt;
  const canSubmitForReview = isFileUploaded && task.status !== 'Design Ready' && task.status !== 'Design Approved' && task.status !== 'In Review' && task.status !== 'Approved';

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <FileImage className="w-4 h-4 text-blue-500" />;
    return <FileText className="w-4 h-4 text-slate-500" />;
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-5">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex items-center justify-between mb-4">
            <motion.button
              whileHover={{ scale: 1.05, x: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Design Lab
            </motion.button>
            <div className="flex items-center gap-3">
              {task.currentRevision > 0 && (
                <span key="revision-badge" className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-sm font-semibold">
                  <RotateCcw className="w-3.5 h-3.5" />
                  Rev {task.currentRevision}
                </span>
              )}
              <span key="status-badge" className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border ${getStatusColor(task.status)}`}>
                {getStatusIcon(task.status)}
                {task.status}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-200">
              {task.imageUrl ? (
                <img src={task.imageUrl} alt={task.itemName} className="w-full h-full object-cover" />
              ) : (
                <Package className="w-7 h-7 text-slate-400" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold text-slate-900 truncate">{task.itemName || 'Unnamed Item'}</h1>
              <div className="flex items-center gap-4 text-slate-500 text-sm mt-0.5 flex-wrap">
                <span key="task-id" className="flex items-center gap-1 whitespace-nowrap"><Hash className="w-3.5 h-3.5" />{task.id}</span>
                <span key="order-id" className="flex items-center gap-1 whitespace-nowrap"><FileText className="w-3.5 h-3.5" />{task.orderId}</span>
                <span key="customer" className="flex items-center gap-1 whitespace-nowrap"><User className="w-3.5 h-3.5" />{task.customer}</span>
                {(task.vendor || task.supplier) && <span key="vendor" className="flex items-center gap-1 whitespace-nowrap"><Building2 className="w-3.5 h-3.5" />{task.vendor || task.supplier}</span>}
                {task.dueDate && <span key="due-date" className="flex items-center gap-1 whitespace-nowrap"><Calendar className="w-3.5 h-3.5" />{task.dueDate}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-[1600px] mx-auto">
          <div className="grid grid-cols-12 gap-6">
            {/* Left sidebar - Item Details, Designer, Notes */}
            <div className="col-span-3 space-y-4">
              {/* Item Details - Compact Grid */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                <h3 className="text-xs font-bold text-slate-900 mb-3 uppercase tracking-wider">Item Details</h3>
                <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
                  {[
                    { label: 'Product', value: task.itemName, span: true },
                    { label: 'SKU', value: task.sku || '—' },
                    { label: 'Quantity', value: task.quantity?.toString() || '—' },
                    { label: 'Variant', value: task.variant || '—' },
                    { label: 'Imprint', value: imprintMethod || '—' },
                    { label: 'Vendor', value: task.vendor || task.supplier || '—', span: true },
                    { label: 'Order', value: task.orderId, span: true },
                    { label: 'Customer', value: task.customer || '—', span: true },
                    { label: 'Due Date', value: task.dueDate || '—', span: true },
                  ].map(item => (
                    <div key={item.label} className={`${item.span ? 'col-span-2' : 'col-span-1'} pb-2 border-b border-slate-50`}>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">{item.label}</span>
                      <span className="text-xs font-semibold text-slate-900 truncate block">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Task Settings - Designer + Imprint Method */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                <h3 className="text-xs font-bold text-slate-900 mb-3 uppercase tracking-wider">Task Settings</h3>
                <div className="space-y-3">
                  {/* Assigned Designer */}
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                      Assigned Designer
                    </label>
                    <input
                      type="text"
                      value={assignedTo}
                      onChange={e => setAssignedTo(e.target.value)}
                      placeholder="Enter designer name..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400"
                    />
                  </div>

                  {/* Imprint Method */}
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                      Imprint Method
                    </label>
                    <div className="relative">
                      <button
                        onClick={() => setImprintMethodDropdownOpen(!imprintMethodDropdownOpen)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400 flex items-center justify-between"
                      >
                        <span className={imprintMethod ? 'text-slate-900' : 'text-slate-400'}>
                          {imprintMethod || 'Select method...'}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${imprintMethodDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {imprintMethodDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-20 max-h-60 overflow-y-auto">
                          {availableImprintMethods.length > 0 ? (
                            availableImprintMethods.map(method => (
                              <button
                                key={method}
                                onClick={async () => {
                                  setImprintMethod(method);
                                  setImprintMethodDropdownOpen(false);
                                  // Save the selection
                                  await updateTask({ imprintMethod: method });
                                }}
                                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-pink-50 hover:text-pink-700 transition-colors first:rounded-t-xl last:rounded-b-xl"
                              >
                                {method}
                              </button>
                            ))
                          ) : (
                            <div className="px-4 py-3 text-sm text-slate-400 text-center">
                              No imprint methods configured for this product
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>

              {/* Art Template - Compact */}
              {task.artTemplate && (
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                  <h3 className="text-xs font-bold text-slate-900 mb-2 uppercase tracking-wider">Art Template</h3>
                  <div className="space-y-2">
                    <div className="w-full h-24 bg-slate-50 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center">
                      {task.artTemplate.startsWith('data:image') || task.artTemplate.startsWith('http') ? (
                        <img src={task.artTemplate} alt="Art template" className="w-full h-full object-contain" />
                      ) : (
                        <FileImage className="w-8 h-8 text-slate-300" />
                      )}
                    </div>
                    <a
                      href={task.artTemplate}
                      download={task.artTemplateName || 'template'}
                      className="flex items-center justify-center gap-1.5 w-full py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      Download
                    </a>
                  </div>
                </div>
              )}

              {/* Latest Revision Feedback */}
              {task.revisions && task.revisions.length > 0 && (
                <div className="bg-amber-50 rounded-2xl border-2 border-amber-200 p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wider">Revision Feedback</h3>
                  </div>
                  <p className="text-xs text-amber-900 leading-relaxed">
                    {task.revisions[task.revisions.length - 1].feedback}
                  </p>
                  <div className="mt-2 text-[10px] text-amber-600 font-medium">
                    Rev {task.revisions[task.revisions.length - 1].version} · {new Date(task.revisions[task.revisions.length - 1].date).toLocaleDateString()}
                  </div>
                </div>
              )}

              {/* Notes - Compact */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                <h3 className="text-xs font-bold text-slate-900 mb-2 uppercase tracking-wider">Notes</h3>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Add notes about this design task..."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400 resize-none"
                />
              </div>
            </div>

            {/* Main content area */}
            <div className="col-span-9 space-y-5">
              {/* Tabs */}
              <div className="flex gap-1 bg-white rounded-xl border border-slate-200 p-1.5 shadow-sm">
                {(() => {
                  const totalFileCount = 
                    (artPreview ? 1 : 0) + 
                    (mockupPreview ? 1 : 0) + 
                    Object.values(locationArtFiles).filter(f => f?.preview).length + 
                    files.length;
                  
                  return [
                    { key: 'upload' as const, label: 'Art & Mockup', icon: <Upload className="w-4 h-4" /> },
                    { key: 'files' as const, label: `Files (${totalFileCount})`, icon: <FolderOpen className="w-4 h-4" /> },
                    { key: 'history' as const, label: `Revision History (${task.revisions?.length || 0})`, icon: <History className="w-4 h-4" /> },
                  ];
                })().map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                      activeTab === tab.key
                        ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label.split(' (')[0]}</span>
                    {tab.label.includes('(') && (
                      <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                        activeTab === tab.key
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {tab.label.match(/\((\d+)\)/)?.[1] || '0'}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Upload Tab */}
              {activeTab === 'upload' && (
                <div className="space-y-5">
                  {/* Hidden file inputs */}
                  <input ref={artInputRef} type="file" accept="image/*,.ai,.eps,.pdf,.svg" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileSelect('art', file); e.target.value = ''; }} />
                  <input ref={mockupInputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileSelect('mockup', file); e.target.value = ''; }} />
                  <input ref={locationArtInputRef} type="file" accept="image/*,.ai,.eps,.pdf,.svg" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleLocationFileSelect(file); e.target.value = ''; }} />

                  {(() => {
                    const isPendingApproval = pendingApprovalId || task.status === 'Pending Customer Approval';
                    const isEditingDisabled = isPendingApproval && task.status !== 'Needs Revision';

                    return (
                      <>
                        {/* Disabled overlay notification */}
                        {isEditingDisabled && (
                          <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 flex items-start gap-3">
                            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Clock className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-amber-900 mb-1">Editing Locked - Pending Approval</h4>
                              <p className="text-xs text-amber-700">
                                Location, art, and mockup files cannot be edited while approval is pending. 
                                Changes will be available if the design is declined for revision.
                              </p>
                            </div>
                          </div>
                        )}

                  {/* ── Imprint Location Selector ── */}
                  <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden ${isEditingDisabled ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">Imprint Locations</h3>
                          <p className="text-xs text-slate-500">Select decoration areas — each gets its own art upload</p>
                        </div>
                      </div>
                      {selectedImprintLocations.length > 0 && (
                        <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">
                          {selectedImprintLocations.length} selected
                        </span>
                      )}
                    </div>
                    <div className="p-4 grid grid-cols-3 gap-2.5">
                      {availableImprintLocations.length === 0 ? (
                        <div className="col-span-3 text-center py-8 text-slate-500 text-sm">
                          No imprint locations available for this product
                        </div>
                      ) : (
                        availableImprintLocations.map((location) => {
                          const isSelected = selectedImprintLocations.includes(location.id);
                          const hasArt = !!(locationArtFiles[location.id]?.preview);
                          return (
                            <motion.button
                              key={location.id}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => toggleImprintLocation(location.id)}
                              className={`relative rounded-xl border-2 p-3 transition-all text-left ${
                                isSelected
                                  ? hasArt
                                    ? 'border-green-500 bg-green-50 shadow-md ring-2 ring-green-500/20'
                                    : 'border-indigo-500 bg-indigo-50 shadow-md ring-2 ring-indigo-500/20'
                                  : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/30'
                              }`}
                            >
                              {/* Status indicator */}
                              <div className="absolute top-2.5 right-2.5">
                                {isSelected ? (
                                  hasArt ? (
                                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                                      <CheckCircle className="w-3.5 h-3.5 text-white" />
                                    </div>
                                  ) : (
                                    <div className="w-5 h-5 rounded-md bg-indigo-600 flex items-center justify-center">
                                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                      </svg>
                                    </div>
                                  )
                                ) : (
                                  <div className="w-5 h-5 rounded-md border-2 border-slate-300 bg-white" />
                                )}
                              </div>

                              <div className="pr-7">
                                <p className={`text-xs font-bold mb-0.5 ${isSelected ? (hasArt ? 'text-green-800' : 'text-indigo-800') : 'text-slate-800'}`}>
                                  {location.name || 'Unnamed Location'}
                                </p>
                                <p className="text-[10px] text-slate-500 leading-tight">{location.printArea || '—'}</p>
                                {location.decorationMethod && (
                                  <p className="text-[10px] text-slate-400 leading-tight truncate">{location.decorationMethod}</p>
                                )}
                                {isSelected && (
                                  <p className={`text-[10px] font-semibold mt-1 ${hasArt ? 'text-green-600' : 'text-indigo-500'}`}>
                                    {hasArt ? '✓ Art uploaded' : '↓ Needs art'}
                                  </p>
                                )}
                              </div>
                            </motion.button>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* ── Per-Location Art Uploads ── */}
                  {selectedImprintLocations.length > 0 ? (
                    <div className={`space-y-3 ${isEditingDisabled ? 'opacity-50 pointer-events-none' : ''}`}>
                      <div className="flex items-center gap-2 px-1">
                        <ImageIcon className="w-4 h-4 text-indigo-600" />
                        <h3 className="text-sm font-bold text-slate-900">Art Files by Location</h3>
                        <span className="text-xs text-slate-500 ml-1">
                          {Object.values(locationArtFiles).filter(f => f.preview).length} of {selectedImprintLocations.length} uploaded
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {selectedImprintLocations.map(locationId => {
                          const location = availableImprintLocations.find(l => l.id === locationId);
                          if (!location) return null;
                          const locFile = locationArtFiles[locationId];
                          const hasArt = !!(locFile?.preview);
                          return (
                            <motion.div
                              key={locationId}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`bg-white rounded-2xl border-2 shadow-sm overflow-hidden ${hasArt ? 'border-green-300' : 'border-indigo-200'}`}
                            >
                              {/* Location header */}
                              <div className={`px-4 py-3 flex items-center justify-between ${hasArt ? 'bg-green-50 border-b border-green-100' : 'bg-indigo-50 border-b border-indigo-100'}`}>
                                <div className="flex items-center gap-2.5">
                                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${hasArt ? 'bg-green-500' : 'bg-indigo-600'}`}>
                                    {hasArt ? (
                                      <CheckCircle className="w-4 h-4 text-white" />
                                    ) : (
                                      <Upload className="w-4 h-4 text-white" />
                                    )}
                                  </div>
                                  <div>
                                    <p className={`text-xs font-bold ${hasArt ? 'text-green-900' : 'text-indigo-900'}`}>{location.name}</p>
                                    <p className="text-[10px] text-slate-500">{location.printArea}{location.decorationMethod ? ` · ${location.decorationMethod}` : ''}</p>
                                  </div>
                                </div>
                                {hasArt && (
                                  <button
                                    onClick={() => removeLocationArt(locationId)}
                                    className="text-[10px] font-semibold text-red-500 hover:text-red-700 px-2 py-1 rounded-md hover:bg-red-50 transition-colors"
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>

                              {/* Upload area */}
                              <div className="p-4">
                                {hasArt ? (
                                  <div className="space-y-2.5">
                                    <div className="w-full h-36 bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                                      {locFile.preview!.startsWith('data:image') || locFile.preview!.startsWith('http') ? (
                                        <img src={locFile.preview!} alt={location.name} className="w-full h-full object-contain" />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                          <FileText className="w-10 h-10 text-indigo-400" />
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <FileText className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                                      <span className="text-xs font-medium text-slate-700 truncate">{locFile.fileName}</span>
                                    </div>
                                    <button
                                      onClick={() => handleLocationArtUpload(locationId)}
                                      className="w-full py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
                                    >
                                      Replace Art
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => handleLocationArtUpload(locationId)}
                                    className="w-full h-36 border-2 border-dashed border-indigo-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-indigo-400 hover:bg-indigo-50/40 transition-all cursor-pointer group"
                                  >
                                    <div className="w-10 h-10 bg-indigo-100 group-hover:bg-indigo-200 rounded-xl flex items-center justify-center transition-colors">
                                      <Upload className="w-5 h-5 text-indigo-500" />
                                    </div>
                                    <div className="text-center">
                                      <p className="text-xs font-semibold text-slate-700">Upload Art for {location.name}</p>
                                      <p className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, AI, EPS, PDF, SVG</p>
                                    </div>
                                  </button>
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    /* No locations selected — show prompt */
                    <div className="bg-indigo-50 border-2 border-dashed border-indigo-200 rounded-2xl p-8 text-center">
                      <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <Upload className="w-6 h-6 text-indigo-400" />
                      </div>
                      <p className="text-sm font-semibold text-indigo-800 mb-1">Select Imprint Locations Above</p>
                      <p className="text-xs text-indigo-600">Each selected location will get its own dedicated art upload field</p>
                    </div>
                  )}

                  {/* ── Mockup Upload (always shown) ─��� */}
                  <div className={`bg-white rounded-2xl border border-slate-200 p-5 shadow-sm ${isEditingDisabled ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-purple-500" />
                        Product Mockup
                        <span className="text-xs font-normal text-slate-400">(overall view)</span>
                      </h3>
                      {mockupPreview && (
                        <button onClick={() => { setMockupPreview(null); setMockupFileName(''); setPendingMockupData(null); }} className="text-xs text-red-500 hover:text-red-700 font-medium">
                          Remove
                        </button>
                      )}
                    </div>
                    {mockupPreview ? (
                      <div className="flex gap-4">
                        <div className="w-32 h-32 bg-slate-100 rounded-xl overflow-hidden border-2 border-purple-200 flex-shrink-0">
                          {mockupPreview.startsWith('data:image') || mockupPreview.startsWith('http') ? (
                            <img src={mockupPreview} alt="Mockup preview" className="w-full h-full object-contain" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><FileText className="w-8 h-8 text-purple-400" /></div>
                          )}
                        </div>
                        <div className="flex-1 flex flex-col justify-between py-1">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <FileText className="w-4 h-4 text-purple-500 flex-shrink-0" />
                              <span className="text-sm font-medium text-slate-700 truncate">{mockupFileName}</span>
                            </div>
                            <p className="text-xs text-slate-400">Overall product visualization mockup</p>
                          </div>
                          <button onClick={() => mockupInputRef.current?.click()} className="w-full py-2 text-sm font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 transition-colors">
                            Replace Mockup
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => mockupInputRef.current?.click()} className="w-full h-32 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center gap-4 hover:border-purple-400 hover:bg-purple-50/30 transition-all cursor-pointer group">
                        <div className="w-12 h-12 bg-purple-100 group-hover:bg-purple-200 rounded-xl flex items-center justify-center transition-colors">
                          <Upload className="w-6 h-6 text-purple-500" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-semibold text-slate-700">Upload Product Mockup</p>
                          <p className="text-xs text-slate-400 mt-0.5">PNG, JPG, PDF — overall product view</p>
                        </div>
                      </button>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-3">
                    {filesChanged && (
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSaveFiles} disabled={saving} className="px-6 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors shadow-lg disabled:opacity-50 flex items-center gap-2">
                        {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                        Save Files
                      </motion.button>
                    )}
                    {canSubmitForReview && (
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSubmitForReview} disabled={saving} className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg disabled:opacity-50 flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        Submit for Review
                      </motion.button>
                    )}
                    {(task.status === 'Design Ready' || task.status === 'In Review') && (
                      <motion.button 
                        whileHover={{ scale: 1.02 }} 
                        whileTap={{ scale: 0.98 }} 
                        onClick={pendingApprovalId || task.status === 'Pending Customer Approval' ? handleShowApprovalStatus : handleOpenApprovalModal} 
                        disabled={task.status === 'Design Approved' || task.status === 'Approved'}
                        className={`px-6 py-3 font-semibold rounded-xl transition-all shadow-lg flex items-center gap-2 ${
                          task.status === 'Design Approved' || task.status === 'Approved'
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white cursor-default'
                            : pendingApprovalId || task.status === 'Pending Customer Approval'
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                            : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700'
                        }`}
                      >
                        {task.status === 'Design Approved' || task.status === 'Approved' ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Design Approved
                          </>
                        ) : pendingApprovalId || task.status === 'Pending Customer Approval' ? (
                          <>
                            <Clock className="w-4 h-4 animate-pulse" />
                            Pending Approval
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Review & Approve
                          </>
                        )}
                      </motion.button>
                    )}
                  </div>

                  {/* Approval Info - Show for approved designs */}
                  {task.status === 'Design Approved' && (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50/30 rounded-2xl border-2 border-green-200 p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                            <CheckCircle className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-green-900">Design Approved</h3>
                            <p className="text-xs text-green-600">
                              {(task as any).approvalType === 'internal' 
                                ? `Approved by ${(task as any).internalApprover || 'Internal Team'} (Manager Authorized)`
                                : (task as any).customerApprovalEmail 
                                  ? `Customer approval sent to ${(task as any).customerApprovalEmail}`
                                  : 'Approved'}
                            </p>
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            toast.success('Art files attached to PO', {
                              description: `Order ${task.orderId} updated in Purchasing module`,
                              duration: 3000,
                            });
                          }}
                          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg flex items-center gap-2"
                        >
                          <Package className="w-4 h-4" />
                          Attach to PO
                        </motion.button>
                      </div>
                      {(task as any).approvedAt && (
                        <p className="text-xs text-green-600 mt-2">
                          Approved on {new Date((task as any).approvedAt).toLocaleDateString()} at {new Date((task as any).approvedAt).toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  )}

                  {/* 3PL Fulfillment Services - Only show for approved designs */}
                  {task.status === 'Design Approved' && (
                    <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-2xl border-2 border-slate-200 p-6 shadow-sm">
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-900">Send to Fulfillment</h3>
                          <p className="text-xs text-slate-500">Connect with 3PL services for production & shipping</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        {/* Printful */}
                        <motion.button
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            toast.success('Connecting to Printful...', {
                              description: 'Your design will be sent for production',
                              duration: 3000,
                            });
                          }}
                          className="bg-white rounded-xl border-2 border-slate-200 p-4 hover:border-red-400 hover:shadow-lg transition-all group"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                              <span className="text-white font-bold text-lg">P</span>
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-bold text-slate-900">Printful</p>
                              <p className="text-xs text-slate-500">Print on Demand</p>
                            </div>
                          </div>
                        </motion.button>

                        {/* Printify */}
                        <motion.button
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            toast.success('Connecting to Printify...', {
                              description: 'Your design will be sent for production',
                              duration: 3000,
                            });
                          }}
                          className="bg-white rounded-xl border-2 border-slate-200 p-4 hover:border-green-400 hover:shadow-lg transition-all group"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                              </svg>
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-bold text-slate-900">Printify</p>
                              <p className="text-xs text-slate-500">POD Network</p>
                            </div>
                          </div>
                        </motion.button>

                        {/* Gelato */}
                        <motion.button
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            toast.success('Connecting to Gelato...', {
                              description: 'Your design will be sent for production',
                              duration: 3000,
                            });
                          }}
                          className="bg-white rounded-xl border-2 border-slate-200 p-4 hover:border-purple-400 hover:shadow-lg transition-all group"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-bold text-slate-900">Gelato</p>
                              <p className="text-xs text-slate-500">Global Printing</p>
                            </div>
                          </div>
                        </motion.button>

                        {/* ShipStation */}
                        <motion.button
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            toast.success('Connecting to ShipStation...', {
                              description: 'Creating shipping label',
                              duration: 3000,
                            });
                          }}
                          className="bg-white rounded-xl border-2 border-slate-200 p-4 hover:border-blue-400 hover:shadow-lg transition-all group"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                              </svg>
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-bold text-slate-900">ShipStation</p>
                              <p className="text-xs text-slate-500">Shipping Platform</p>
                            </div>
                          </div>
                        </motion.button>

                        {/* ShipBob */}
                        <motion.button
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            toast.success('Connecting to ShipBob...', {
                              description: 'Sending to fulfillment center',
                              duration: 3000,
                            });
                          }}
                          className="bg-white rounded-xl border-2 border-slate-200 p-4 hover:border-orange-400 hover:shadow-lg transition-all group"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a2 2 0 104 0m-4 0a2 2 0 114 0m-8 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                              </svg>
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-bold text-slate-900">ShipBob</p>
                              <p className="text-xs text-slate-500">Fulfillment</p>
                            </div>
                          </div>
                        </motion.button>

                        {/* Custom 3PL */}
                        <motion.button
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            toast.info('Custom 3PL Integration', {
                              description: 'Configure your preferred fulfillment partner',
                              duration: 3000,
                            });
                          }}
                          className="bg-white rounded-xl border-2 border-dashed border-slate-300 p-4 hover:border-slate-400 hover:shadow-lg transition-all group"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 bg-gradient-to-br from-slate-400 to-slate-500 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-bold text-slate-900">Custom</p>
                              <p className="text-xs text-slate-500">Add Your 3PL</p>
                            </div>
                          </div>
                        </motion.button>
                      </div>

                      {/* Quick Info Banner */}
                      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-3">
                        <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="text-xs font-semibold text-blue-900">Design files will be automatically sent to your selected fulfillment partner</p>
                          <p className="text-xs text-blue-700 mt-0.5">Order details: {task.quantity} units • Customer: {task.customer}</p>
                        </div>
                      </div>
                    </div>
                  )}
                      </>
                    );
                  })()}
                </div>
              )}

              {/* Files Tab */}
              {activeTab === 'files' && (
                <div className="space-y-5">
                  {(() => {
                    const isPendingApproval = pendingApprovalId || task.status === 'Pending Customer Approval';
                    const isEditingDisabled = isPendingApproval && task.status !== 'Needs Revision';

                    return (
                      <>
                        {/* Disabled overlay notification */}
                        {isEditingDisabled && (
                          <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 flex items-start gap-3">
                            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Clock className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-amber-900 mb-1">Editing Locked - Pending Approval</h4>
                              <p className="text-xs text-amber-700">
                                Files cannot be added or removed while approval is pending. 
                                Downloads are still available for viewing.
                              </p>
                            </div>
                          </div>
                        )}

                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <FolderOpen className="w-5 h-5 text-slate-500" />
                        Project Files
                      </h3>
                      <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(e) => { if (e.target.files) Array.from(e.target.files).forEach(handleAddFile); e.target.value = ''; }} />
                      <motion.button 
                        whileHover={isEditingDisabled ? {} : { scale: 1.05 }} 
                        whileTap={isEditingDisabled ? {} : { scale: 0.95 }} 
                        onClick={() => !isEditingDisabled && fileInputRef.current?.click()} 
                        disabled={isEditingDisabled}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${
                          isEditingDisabled 
                            ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                            : 'bg-slate-900 text-white hover:bg-slate-800'
                        }`}
                      >
                        <Paperclip className="w-4 h-4" />
                        Add Files
                      </motion.button>
                    </div>

                    {files.length === 0 && !artPreview && !mockupPreview && Object.keys(locationArtFiles).filter(k => locationArtFiles[k]?.preview).length === 0 ? (
                      <div className="flex flex-col items-center py-12 text-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                          <FolderOpen className="w-8 h-8 text-slate-300" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mb-1">No Files Yet</h4>
                        <p className="text-xs text-slate-500 max-w-xs">Upload project files such as brand guidelines, reference images, or source files.</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {/* Art File */}
                        {artPreview && (
                          <div className="flex items-center gap-4 py-3 group">
                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                              <img src={artPreview} alt="Art file" className="w-full h-full object-cover rounded-xl" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-slate-900 truncate">{artFileName || 'Art File'}</p>
                              <p className="text-xs text-slate-400">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-md font-semibold">
                                  <ImageIcon className="w-3 h-3" />
                                  Art File
                                </span>
                              </p>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <a href={artPreview} download={artFileName || 'art-file'} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                                <Download className="w-4 h-4" />
                              </a>
                            </div>
                          </div>
                        )}
                        
                        {/* Mockup File */}
                        {mockupPreview && (
                          <div className="flex items-center gap-4 py-3 group">
                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                              <img src={mockupPreview} alt="Mockup file" className="w-full h-full object-cover rounded-xl" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-slate-900 truncate">{mockupFileName || 'Mockup File'}</p>
                              <p className="text-xs text-slate-400">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-md font-semibold">
                                  <Eye className="w-3 h-3" />
                                  Mockup
                                </span>
                              </p>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <a href={mockupPreview} download={mockupFileName || 'mockup-file'} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                                <Download className="w-4 h-4" />
                              </a>
                            </div>
                          </div>
                        )}

                        {/* Location Art Files */}
                        {Object.entries(locationArtFiles).map(([locId, locData]) => {
                          if (!locData?.preview) return null;
                          const location = availableImprintLocations.find(l => l.id === locId);
                          return (
                            <div key={locId} className="flex items-center gap-4 py-3 group">
                              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <img src={locData.preview} alt={`${location?.name || locId} art`} className="w-full h-full object-cover rounded-xl" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-slate-900 truncate">{locData.fileName || `${location?.name || locId} Art`}</p>
                                <p className="text-xs text-slate-400">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-md font-semibold">
                                    <CheckCircle className="w-3 h-3" />
                                    {location?.name || locId}
                                  </span>
                                </p>
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <a href={locData.preview} download={locData.fileName || `${location?.name || locId}-art`} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                                  <Download className="w-4 h-4" />
                                </a>
                              </div>
                            </div>
                          );
                        })}

                        {/* Project Files */}
                        {files.map(file => (
                          <div key={file.id} className="flex items-center gap-4 py-3 group">
                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                              {file.type.startsWith('image/') && file.url ? (
                                <img src={file.url} alt={file.name} className="w-full h-full object-cover rounded-xl" />
                              ) : (
                                getFileIcon(file.type)
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-slate-900 truncate">{file.name}</p>
                              <p className="text-xs text-slate-400">{formatFileSize(file.size)} · {new Date(file.uploadedAt).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {file.url && (
                                <a href={file.url} download={file.name} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                                  <Download className="w-4 h-4" />
                                </a>
                              )}
                              <button 
                                onClick={() => !isEditingDisabled && handleRemoveFile(file.id)} 
                                disabled={isEditingDisabled}
                                className={`p-2 rounded-lg transition-all ${
                                  isEditingDisabled 
                                    ? 'text-slate-300 cursor-not-allowed' 
                                    : 'text-slate-500 hover:text-red-600 hover:bg-red-50'
                                }`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                      </>
                    );
                  })()}
                </div>
              )}

              {/* History Tab */}
              {activeTab === 'history' && (
                <div className="space-y-4">
                  {(!task.revisions || task.revisions.length === 0) ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-12 shadow-sm text-center">
                      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <History className="w-8 h-8 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">No Revisions Yet</h3>
                      <p className="text-sm text-slate-500">Revision history will appear here when changes are requested.</p>
                    </div>
                  ) : (
                    [...task.revisions].reverse().map((rev, idx) => (
                      <motion.div
                        key={rev.version}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                              <RotateCcw className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">Revision {rev.version}</p>
                              <p className="text-xs text-slate-500">{new Date(rev.date).toLocaleDateString()} at {new Date(rev.date).toLocaleTimeString()}</p>
                            </div>
                          </div>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold border ${
                            rev.status === 'Approved' || rev.status === 'Design Approved' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-amber-100 text-amber-700 border-amber-200'
                          }`}>
                            {rev.status}
                          </span>
                        </div>
                        <div className="bg-amber-50 rounded-xl p-4 mb-4 border border-amber-100">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Feedback</span>
                          </div>
                          <p className="text-sm text-amber-900">{rev.feedback}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Art File (v{rev.version})</p>
                            {rev.artFile && (rev.artFile.startsWith('data:image') || rev.artFile.startsWith('http')) ? (
                              <div className="w-full h-32 bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                                <img src={rev.artFile} alt={`Art v${rev.version}`} className="w-full h-full object-contain" />
                              </div>
                            ) : rev.artFileName ? (
                              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
                                <FileText className="w-4 h-4 text-blue-500" />
                                <span className="text-xs text-slate-700 truncate">{rev.artFileName}</span>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 italic">No art file</span>
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Mockup (v{rev.version})</p>
                            {rev.mockupFile && (rev.mockupFile.startsWith('data:image') || rev.mockupFile.startsWith('http')) ? (
                              <div className="w-full h-32 bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                                <img src={rev.mockupFile} alt={`Mockup v${rev.version}`} className="w-full h-full object-contain" />
                              </div>
                            ) : rev.mockupFileName ? (
                              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
                                <FileText className="w-4 h-4 text-purple-500" />
                                <span className="text-xs text-slate-700 truncate">{rev.mockupFileName}</span>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 italic">No mockup</span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Approval Modal */}
      <AnimatePresence>
        {showApprovalModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowApprovalModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Review Design
                  </h3>
                  <button onClick={() => setShowApprovalModal(false)} className="text-white/70 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-green-100 text-sm mt-1">Approve the design or request revisions</p>
              </div>

              <div className="p-6 space-y-4">
                {/* Step 1: Select Approval Type */}
                {approvalStep === 'select' && (
                  <>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Art Files</p>
                      {Object.keys(locationArtFiles).filter(k => locationArtFiles[k]?.preview).length > 0 ? (
                        <div className="grid grid-cols-2 gap-3">
                          {Object.entries(locationArtFiles).map(([locId, locData]) => {
                            if (!locData?.preview) return null;
                            const location = availableImprintLocations.find(l => l.id === locId);
                            return (
                              <div key={locId} className="space-y-1">
                                <p className="text-xs font-semibold text-slate-600">{location?.name || locId}</p>
                                <div className="w-full h-24 bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                                  <img src={locData.preview} alt={`${location?.name || locId} art`} className="w-full h-full object-contain" />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (artPreview || task.artFile) ? (
                        <div className="w-full h-28 bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                          {(artPreview || task.artFile)?.startsWith('data:image') || (artPreview || task.artFile)?.startsWith('http') ? (
                            <img src={artPreview || task.artFile || ''} alt="Art" className="w-full h-full object-contain" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><FileText className="w-8 h-8 text-blue-400" /></div>
                          )}
                        </div>
                      ) : (
                        <div className="w-full h-28 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-200">
                          <span className="text-xs text-slate-400">No art</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Mockup</p>
                      {(mockupPreview || task.mockupFile) ? (
                        <div className="w-full h-28 bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                          {(mockupPreview || task.mockupFile)?.startsWith('data:image') || (mockupPreview || task.mockupFile)?.startsWith('http') ? (
                            <img src={mockupPreview || task.mockupFile || ''} alt="Mockup" className="w-full h-full object-contain" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><FileText className="w-8 h-8 text-purple-400" /></div>
                          )}
                        </div>
                      ) : (
                        <div className="w-full h-28 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-200">
                          <span className="text-xs text-slate-400">No mockup</span>
                        </div>
                      )}
                    </div>
                    <div className="pt-2 space-y-3">
                      <p className="text-sm font-bold text-slate-700">Select Approval Type:</p>
                      <div className="grid grid-cols-2 gap-3">
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleSelectApprovalType('customer')} className="flex flex-col items-center gap-2 p-4 border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all">
                          <User className="w-6 h-6 text-blue-600" />
                          <span className="text-sm font-semibold text-blue-900">Send to Customer</span>
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleSelectApprovalType('internal')} className="flex flex-col items-center gap-2 p-4 border-2 border-green-200 bg-green-50 hover:bg-green-100 rounded-xl transition-all">
                          <Building2 className="w-6 h-6 text-green-600" />
                          <span className="text-sm font-semibold text-green-900">Internal Approval</span>
                        </motion.button>
                      </div>
                    </div>
                  </>
                )}

                {/* Step 2: Customer Email */}
                {approvalStep === 'customer-email' && (
                  <>
                    <div className="text-center py-4">
                      <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <User className="w-8 h-8 text-blue-600" />
                      </div>
                      <h4 className="text-lg font-bold text-slate-900 mb-1">Send to Customer</h4>
                      <p className="text-sm text-slate-500">Customer: {task.customer}</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                        Customer Email Address
                      </label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={e => setCustomerEmail(e.target.value)}
                        placeholder="customer@company.com"
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                      />
                      <p className="text-xs text-slate-500 mt-1">An approval link will be sent to this email</p>
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setApprovalStep('select')} className="flex-1 px-5 py-3 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition-all">
                        Back
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSendToCustomer} disabled={saving || !customerEmail.trim()} className="flex-1 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg disabled:opacity-50">
                        Send Approval Request
                      </motion.button>
                    </div>
                  </>
                )}

                {/* Step 3: Internal Approval */}
                {approvalStep === 'internal-approval' && (
                  <>
                    <div className="text-center py-4">
                      <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <Building2 className="w-8 h-8 text-green-600" />
                      </div>
                      <h4 className="text-lg font-bold text-slate-900 mb-1">Internal Approval</h4>
                      <p className="text-sm text-slate-500">Requires manager authorization</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                        Your Name
                      </label>
                      <input
                        type="text"
                        value={internalApprover}
                        onChange={e => setInternalApprover(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400"
                      />
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setApprovalStep('select')} className="flex-1 px-5 py-3 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition-all">
                        Back
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleInternalApprovalRequest} disabled={!internalApprover.trim()} className="flex-1 px-5 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg disabled:opacity-50">
                        Continue
                      </motion.button>
                    </div>
                  </>
                )}

                {/* Step 4: Manager Authorization - Pending Approval */}
                {approvalStep === 'manager-auth' && (() => {
                  // Get the approval request details for timestamp
                  const requests = JSON.parse(localStorage.getItem('design-approval-requests') || '[]');
                  const currentRequest = requests.find((r: any) => r.id === pendingApprovalId);
                  const timestamp = currentRequest?.timestamp;
                  
                  // Calculate elapsed time
                  let elapsedText = '';
                  if (timestamp) {
                    const now = new Date();
                    const sentTime = new Date(timestamp);
                    const diffMs = now.getTime() - sentTime.getTime();
                    const diffMins = Math.floor(diffMs / 60000);
                    const diffHours = Math.floor(diffMins / 60);
                    const diffDays = Math.floor(diffHours / 24);
                    
                    if (diffDays > 0) {
                      elapsedText = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
                    } else if (diffHours > 0) {
                      elapsedText = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
                    } else if (diffMins > 0) {
                      elapsedText = `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
                    } else {
                      elapsedText = 'Just now';
                    }
                  }
                  
                  const isPending = currentRequest?.status === 'pending';
                  
                  return (
                    <>
                      <div className="text-center py-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4 relative">
                          <Clock className="w-10 h-10 text-amber-600" />
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full animate-pulse"></div>
                        </div>
                        <h4 className="text-lg font-bold text-slate-900 mb-2">Waiting for Manager Approval</h4>
                        <p className="text-sm text-slate-500 mb-1">Request submitted by: {internalApprover}</p>
                        {timestamp && (
                          <p className="text-xs text-amber-600 font-semibold mb-1">Sent {elapsedText}</p>
                        )}
                        <p className="text-xs text-slate-400">Manager will approve this from their interface</p>
                      </div>
                      
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50/30 rounded-xl border border-blue-200 p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Building2 className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-blue-900 mb-1">Approval Details</p>
                            <div className="space-y-1 text-xs text-blue-700">
                              <p><span className="font-medium">Order:</span> {task.orderId}</p>
                              <p><span className="font-medium">Customer:</span> {task.customer}</p>
                              <p><span className="font-medium">Product:</span> {task.itemName}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-center gap-2 py-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <span className="text-xs text-slate-500 ml-2">
                          {isPending ? 'Still awaiting approval...' : 'Checking for approval...'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        <motion.button 
                          whileHover={{ scale: 1.02 }} 
                          whileTap={{ scale: 0.98 }} 
                          onClick={async () => {
                            setPendingApprovalId(null);
                            await updateTask({ pendingApprovalId: null });
                            setApprovalStep('internal-approval');
                          }} 
                          className="flex-1 px-5 py-3 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition-all"
                        >
                          Cancel Request
                        </motion.button>
                      </div>
                    </>
                  );
                })()}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Approval Status Popup */}
        {showApprovalStatusPopup && (() => {
          const requests = JSON.parse(localStorage.getItem('design-approval-requests') || '[]');
          const currentRequest = requests.find((r: any) => r.id === pendingApprovalId);
          const timestamp = currentRequest?.timestamp;
          
          // Calculate elapsed time
          let elapsedText = '';
          if (timestamp) {
            const now = new Date();
            const sentTime = new Date(timestamp);
            const diffMs = now.getTime() - sentTime.getTime();
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMins / 60);
            const diffDays = Math.floor(diffHours / 24);
            
            if (diffDays > 0) {
              elapsedText = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
            } else if (diffHours > 0) {
              elapsedText = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
            } else if (diffMins > 0) {
              elapsedText = `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
            } else {
              elapsedText = 'Just now';
            }
          }
          
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowApprovalStatusPopup(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                onClick={e => e.stopPropagation()}
              >
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Approval Status
                    </h3>
                    <button onClick={() => setShowApprovalStatusPopup(false)} className="text-white/70 hover:text-white">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-amber-100 text-sm mt-1">Waiting for manager approval</p>
                </div>

                <div className="p-6 space-y-4">
                  <div className="text-center py-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4 relative">
                      <Clock className="w-10 h-10 text-amber-600" />
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full animate-pulse"></div>
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 mb-2">Waiting for Manager Approval</h4>
                    <p className="text-sm text-slate-500 mb-1">Request submitted by: {currentRequest?.approver || internalApprover}</p>
                    {timestamp && (
                      <p className="text-xs text-amber-600 font-semibold mb-1">Sent {elapsedText}</p>
                    )}
                    <p className="text-xs text-slate-400">Manager will approve this from their interface</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50/30 rounded-xl border border-blue-200 p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Building2 className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-blue-900 mb-1">Approval Details</p>
                        <div className="space-y-1 text-xs text-blue-700">
                          <p><span className="font-medium">Order:</span> {task.orderId}</p>
                          <p><span className="font-medium">Customer:</span> {task.customer}</p>
                          <p><span className="font-medium">Product:</span> {task.itemName}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-orange-50/30 rounded-xl border border-amber-200 p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-amber-900 mb-1">Status</p>
                        <p className="text-xs text-amber-700">
                          {currentRequest?.status === 'pending' ? 'Still awaiting approval...' : 'Checking for approval...'}
                        </p>
                        <p className="text-xs text-amber-600 mt-1">This page checks for approval every 2 seconds</p>
                      </div>
                    </div>
                  </div>

                  <motion.button 
                    whileHover={{ scale: 1.02 }} 
                    whileTap={{ scale: 0.98 }} 
                    onClick={() => setShowApprovalStatusPopup(false)} 
                    className="w-full px-5 py-3 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition-all"
                  >
                    Close
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
