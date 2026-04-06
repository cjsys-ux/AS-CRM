import { motion, AnimatePresence } from 'motion/react';
import { Truck, Plus, Search, Filter, MapPin, Package, Clock, CheckCircle, AlertCircle, ChevronLeft, ChevronRight, Eye, Trash2, X, ChevronDown, ChevronRight as ChevronRightIcon, Table as TableIcon, Map, Calendar, TriangleAlert, Download, Edit, RefreshCw } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { AddShipmentDrawer } from './AddShipmentDrawer';
import { EditShipmentDrawer } from './EditShipmentDrawer';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { ShipmentDetailsModal } from './ShipmentDetailsModal';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';
import { ColumnVisibilityDropdown, ColumnDef } from './ColumnVisibilityDropdown';
import React from 'react';

type ChildTracking = {
  trackingNumber: string;
  status: string;
  shipDate: string;
  estDelivery: string;
};

type Shipment = {
  id: string;
  masterTracking: string;
  childTrackings?: ChildTracking[];
  poNumber: string;
  orderNumber: string;
  orderLabel?: string;
  customer: string;
  quantity: number;
  itemName: string;
  project: string;
  projectNumber?: string;
  projectSubtext?: string;
  projectSubtext2?: string;
  carrier: string;
  serviceLevel: string;
  status: string;
  shipDate: string;
  estDelivery: string;
  hasIssue: boolean;
  // Additional details for modal
  weight: string;
  dimensions: string;
  packageType: string;
  declaredValue: string;
  shippingCost: string;
  insuranceAmount: string;
  originAddress: string;
  destinationAddress: string;
  destinationCity: string;
  destinationState: string;
  destinationZip: string;
  referenceNumber: string;
  specialInstructions: string;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Delivered':
      return 'bg-green-100 text-green-700';
    case 'In Transit':
      return 'bg-blue-100 text-blue-700';
    case 'Out For Delivery':
      return 'bg-purple-100 text-purple-700';
    case 'Processing':
      return 'bg-yellow-100 text-yellow-700';
    case 'Delayed':
      return 'bg-red-100 text-red-700';
    case 'Cancelled':
      return 'bg-slate-100 text-slate-700';
    default:
      return 'bg-slate-100 text-slate-700';
  }
};

const SHIPMENT_STATUSES = ['Processing', 'In Transit', 'Out For Delivery', 'Delivered', 'Delayed', 'Cancelled'];

// Filter dropdown matching the Orders module pattern
function ShipmentFilterDropdown({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (val: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const allLabel = options[0];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
          value !== allLabel
            ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
        }`}
      >
        <span className="text-slate-500 font-medium">{label}:</span>
        <span>{value}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-xl z-30 overflow-hidden"
          >
            <div className="py-1.5">
              {options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => { onChange(opt); setOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                    value === opt
                      ? 'bg-emerald-50 text-emerald-700 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {opt}
                  {value === opt && (
                    <span className="float-right text-emerald-500 font-bold">&#10003;</span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ShipmentsModule() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [selectedShipments, setSelectedShipments] = useState<string[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [shipmentToDelete, setShipmentToDelete] = useState<Shipment | null>(null);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [shipmentDetails, setShipmentDetails] = useState<Shipment | null>(null);

  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  // Column visibility
  const shipmentColumns: ColumnDef[] = [
    { key: 'checkbox', label: 'Select' },
    { key: 'expand', label: 'Expand' },
    { key: 'masterTracking', label: 'Master Tracking #' },
    { key: 'poNumber', label: 'PO Number' },
    { key: 'order', label: 'Order' },
    { key: 'customer', label: 'Customer' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'itemName', label: 'Item Name' },
    { key: 'project', label: 'Project' },
    { key: 'projectNumber', label: 'Project #' },
    { key: 'carrier', label: 'Carrier' },
    { key: 'serviceLevel', label: 'Service Level' },
    { key: 'status', label: 'Status' },
    { key: 'shipDate', label: 'Ship Date' },
    { key: 'estDelivery', label: 'Est. Delivery' },
    { key: 'actions', label: 'Actions' },
  ];
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    shipmentColumns.forEach(c => { init[c.key] = true; });
    return init;
  });
  const isColVisible = (key: string) => columnVisibility[key] !== false;
  const visibleColCount = shipmentColumns.filter(c => isColVisible(c.key)).length;

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-c0840c88/shipments`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setShipments(data.shipments || []);
      } else {
        console.error('Failed to fetch shipments:', data.error);
        setShipments([]);
      }
    } catch (error) {
      console.error('Error fetching shipments:', error);
      setShipments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  const filteredShipments = shipments.filter((shipment) => {
    const s = searchTerm.toLowerCase();
    const matchesSearch = (
      (shipment.masterTracking || '').toLowerCase().includes(s) ||
      (shipment.project || '').toLowerCase().includes(s) ||
      (shipment.customer || '').toLowerCase().includes(s) ||
      (shipment.poNumber || '').toLowerCase().includes(s) ||
      (shipment.orderNumber || '').toLowerCase().includes(s) ||
      (shipment.itemName || '').toLowerCase().includes(s) ||
      (shipment.projectNumber || '').toLowerCase().includes(s) ||
      (shipment.carrier || '').toLowerCase().includes(s)
    );
    const matchesStatus = selectedStatus === 'all' || shipment.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const activeFilterCount = (selectedStatus !== 'all' ? 1 : 0);

  const totalShipments = shipments.length;
  const inTransitCount = shipments.filter(s => s.status === 'In Transit' || s.status === 'Out For Delivery').length;
  const deliveredCount = shipments.filter(s => s.status === 'Delivered').length;
  const shipmentsWithIssues = shipments.filter(s => s.hasIssue).length;
  const onTimeShipments = shipments.filter(s => s.status === 'Delivered' && !s.hasIssue).length;
  const delayedCount = shipments.filter(s => s.status === 'Delayed').length;

  const totalPages = Math.ceil(filteredShipments.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedShipments = filteredShipments.slice(startIndex, endIndex);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleRowsPerPageChange = (value: number) => {
    setRowsPerPage(value);
    setCurrentPage(1);
  };

  const toggleRowExpansion = (id: string) => {
    setExpandedRows(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedShipments(paginatedShipments.map(s => s.id));
    } else {
      setSelectedShipments([]);
    }
  };

  const handleSelectShipment = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedShipments(prev => [...prev, id]);
    } else {
      setSelectedShipments(prev => prev.filter(shipId => shipId !== id));
    }
  };

  const handleDeleteClick = (shipment: Shipment) => {
    setShipmentToDelete(shipment);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!shipmentToDelete) return;
    
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-c0840c88/shipments/${shipmentToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      
      const data = await response.json();
      if (data.success) {
        // Refresh the shipments list
        await fetchShipments();
        console.log('Shipment deleted successfully');
      } else {
        console.error('Failed to delete shipment:', data.error);
      }
    } catch (error) {
      console.error('Error deleting shipment:', error);
    }
    
    setDeleteModalOpen(false);
    setShipmentToDelete(null);
  };

  const handleEditClick = (shipment: Shipment) => {
    setEditingShipment(shipment);
    setIsEditDrawerOpen(true);
  };

  const handleViewDetailsClick = (shipment: Shipment) => {
    setShipmentDetails(shipment);
    setDetailsModalOpen(true);
  };

  const handleBulkDelete = async () => {
    setBulkDeleting(true);
    let successCount = 0;
    let failCount = 0;
    for (const id of selectedShipments) {
      try {
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-c0840c88/shipments/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${publicAnonKey}` },
        });
        const data = await response.json();
        if (data.success) {
          successCount++;
        } else {
          failCount++;
          console.error(`Failed to delete shipment ${id}:`, data.error);
        }
      } catch (error) {
        failCount++;
        console.error(`Error deleting shipment ${id}:`, error);
      }
    }
    if (successCount > 0) {
      toast.success(`${successCount} shipment${successCount !== 1 ? 's' : ''} deleted successfully`);
    }
    if (failCount > 0) {
      toast.error(`Failed to delete ${failCount} shipment${failCount !== 1 ? 's' : ''}`);
    }
    setSelectedShipments([]);
    setBulkDeleteModalOpen(false);
    setBulkDeleting(false);
    await fetchShipments();
  };

  const isAllSelected = paginatedShipments.length > 0 && selectedShipments.length === paginatedShipments.length;
  const isSomeSelected = selectedShipments.length > 0 && selectedShipments.length < paginatedShipments.length;

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
      {/* Simple Flat Header */}
      <div className="bg-emerald-600 px-8 py-6">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Shipments Management</h1>
                <p className="text-emerald-100 text-sm">Track and manage all shipments</p>
              </div>
            </div>
            <button
              onClick={() => setIsAddDrawerOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-emerald-600 font-semibold rounded-lg hover:bg-emerald-50 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Shipment
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="px-8 -mt-4 mb-6">
        <div className="max-w-[1800px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-xs font-medium text-slate-600 mb-1">Total Shipments</p>
              <h3 className="text-2xl font-bold text-slate-900">{totalShipments}</h3>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                  <Truck className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-xs font-medium text-slate-600 mb-1">In Transit</p>
              <h3 className="text-2xl font-bold text-slate-900">{inTransitCount}</h3>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-xs font-medium text-slate-600 mb-1">Delivered</p>
              <h3 className="text-2xl font-bold text-slate-900">{deliveredCount}</h3>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                  <TriangleAlert className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-xs font-medium text-slate-600 mb-1">Shipments with Issues</p>
              <h3 className="text-2xl font-bold text-slate-900">{shipmentsWithIssues}</h3>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-xs font-medium text-slate-600 mb-1">On-Time Shipments</p>
              <h3 className="text-2xl font-bold text-slate-900">{onTimeShipments}</h3>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-xs font-medium text-slate-600 mb-1">Delayed Shipments</p>
              <h3 className="text-2xl font-bold text-slate-900">{delayedCount}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters - Matching Orders module pattern */}
      <div className="px-8 pb-0 shrink-0 mb-6">
        <div className="max-w-[1800px] mx-auto">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search shipments, tracking numbers, customers, or POs..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchShipments}
                className="p-3 bg-slate-50 border-2 border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
                title="Refresh"
              >
                <RefreshCw className={`w-5 h-5 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
              </motion.button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 mt-4">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <Filter className="w-4 h-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 bg-emerald-600 text-white rounded-full text-xs flex items-center justify-center font-bold">{activeFilterCount}</span>
                )}
              </div>

              <ShipmentFilterDropdown
                label="Status"
                value={selectedStatus === 'all' ? 'All Status' : selectedStatus}
                options={['All Status', ...SHIPMENT_STATUSES]}
                onChange={(val) => { setSelectedStatus(val === 'All Status' ? 'all' : val); setCurrentPage(1); }}
              />

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-all text-sm ml-auto"
              >
                <Download className="w-4 h-4" />
                Export
              </motion.button>

              {activeFilterCount > 0 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedStatus('all')}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-red-600 bg-red-50 border-2 border-red-200 rounded-xl hover:bg-red-100 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear
                </motion.button>
              )}

              <div className="ml-auto">
                <ColumnVisibilityDropdown
                  columns={shipmentColumns}
                  visibleColumns={columnVisibility}
                  onChange={setColumnVisibility}
                  accentColor="emerald"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedShipments.length > 0 && (
        <div className="px-8 pb-4">
          <div className="max-w-[1800px] mx-auto">
            <div className="bg-emerald-600 text-white rounded-xl px-6 py-3 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3">
                <span className="font-semibold">{selectedShipments.length} shipment{selectedShipments.length !== 1 ? 's' : ''} selected</span>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-4 py-2 bg-white text-emerald-600 rounded-lg text-sm font-semibold hover:bg-emerald-50 transition-colors">
                  Update Status
                </button>
                <button
                  onClick={() => setBulkDeleteModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
                <button
                  onClick={() => setSelectedShipments([])}
                  className="p-2 hover:bg-emerald-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Area - Clean Table */}
      <div className="flex-1 px-8 pb-8 overflow-hidden">
        <div className="max-w-[1800px] mx-auto h-full">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-lg h-full flex flex-col">
            <div className="overflow-x-auto flex-1">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {isColVisible('checkbox') && (
                      <th className="px-3 py-3 text-left w-10">
                        <input
                          type="checkbox"
                          checked={isAllSelected}
                          ref={(input) => {
                            if (input) {
                              input.indeterminate = isSomeSelected;
                            }
                          }}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                      </th>
                    )}
                    {isColVisible('expand') && (
                      <th className="px-2 py-3 text-left w-8"></th>
                    )}
                    {isColVisible('masterTracking') && (
                      <th className="px-3 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Master Tracking #</th>
                    )}
                    {isColVisible('poNumber') && (
                      <th className="px-3 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">PO Number</th>
                    )}
                    {isColVisible('order') && (
                      <th className="px-3 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Order</th>
                    )}
                    {isColVisible('customer') && (
                      <th className="px-3 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Customer</th>
                    )}
                    {isColVisible('quantity') && (
                      <th className="px-3 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Quantity</th>
                    )}
                    {isColVisible('itemName') && (
                      <th className="px-3 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Item Name</th>
                    )}
                    {isColVisible('project') && (
                      <th className="px-3 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Project</th>
                    )}
                    {isColVisible('projectNumber') && (
                      <th className="px-3 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Project #</th>
                    )}
                    {isColVisible('carrier') && (
                      <th className="px-3 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Carrier</th>
                    )}
                    {isColVisible('serviceLevel') && (
                      <th className="px-3 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Service Level</th>
                    )}
                    {isColVisible('status') && (
                      <th className="px-3 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                    )}
                    {isColVisible('shipDate') && (
                      <th className="px-3 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Ship Date</th>
                    )}
                    {isColVisible('estDelivery') && (
                      <th className="px-3 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Est. Delivery</th>
                    )}
                    {isColVisible('actions') && (
                      <th className="px-3 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
                    )}
                  </tr>
                </thead>
                {paginatedShipments.map((shipment) => (
                    <tbody key={shipment.id} className="divide-y divide-slate-100">
                      <tr className="hover:bg-slate-50 transition-colors">
                        {isColVisible('checkbox') && (
                          <td className="px-3 py-2.5">
                            <input
                              type="checkbox"
                              checked={selectedShipments.includes(shipment.id)}
                              onChange={(e) => handleSelectShipment(shipment.id, e.target.checked)}
                              className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                            />
                          </td>
                        )}
                        {isColVisible('expand') && (
                          <td className="px-2 py-2.5">
                            {shipment.childTrackings && shipment.childTrackings.length > 0 && (
                              <button
                                onClick={() => toggleRowExpansion(shipment.id)}
                                className="p-1 hover:bg-slate-200 rounded transition-colors"
                              >
                                {expandedRows.includes(shipment.id) ? (
                                  <ChevronDown className="w-4 h-4 text-slate-600" />
                                ) : (
                                  <ChevronRightIcon className="w-4 h-4 text-slate-600" />
                                )}
                              </button>
                            )}
                          </td>
                        )}
                        {isColVisible('masterTracking') && (
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-slate-900">{shipment.masterTracking}</span>
                              {shipment.childTrackings && shipment.childTrackings.length > 0 && (
                                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                  +{shipment.childTrackings.length}
                                </span>
                              )}
                            </div>
                          </td>
                        )}
                        {isColVisible('poNumber') && (
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            {shipment.poNumber ? (
                              <span className="text-sm text-slate-900">{shipment.poNumber}</span>
                            ) : (
                              <span className="text-sm text-slate-400">—</span>
                            )}
                          </td>
                        )}
                        {isColVisible('order') && (
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            {shipment.orderNumber ? (
                              <span className="text-sm text-slate-900">{shipment.orderNumber}</span>
                            ) : (
                              <span className="text-sm text-slate-400">—</span>
                            )}
                          </td>
                        )}
                        {isColVisible('customer') && (
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            <span className="text-sm text-slate-900">{shipment.customer}</span>
                          </td>
                        )}
                        {isColVisible('quantity') && (
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            <span className="text-sm text-slate-900">{shipment.quantity}</span>
                          </td>
                        )}
                        {isColVisible('itemName') && (
                          <td className="px-3 py-2.5">
                            <span className="text-sm text-slate-900 block max-w-[220px] truncate" title={shipment.itemName}>{shipment.itemName}</span>
                          </td>
                        )}
                        {isColVisible('project') && (
                          <td className="px-3 py-2.5">
                            <div className="flex flex-col max-w-[180px]">
                              <span className="text-sm text-slate-900 truncate" title={shipment.project}>{shipment.project}</span>
                              {shipment.projectSubtext && (
                                <span className="text-xs text-slate-500 truncate">{shipment.projectSubtext}</span>
                              )}
                            </div>
                          </td>
                        )}
                        {isColVisible('projectNumber') && (
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            <span className="text-sm text-slate-700">{shipment.projectNumber}</span>
                          </td>
                        )}
                        {isColVisible('carrier') && (
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            <span className="text-sm text-slate-700">{shipment.carrier}</span>
                          </td>
                        )}
                        {isColVisible('serviceLevel') && (
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            <span className="text-sm text-slate-700">{shipment.serviceLevel}</span>
                          </td>
                        )}
                        {isColVisible('status') && (
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${getStatusColor(shipment.status)}`}>
                              {shipment.status}
                            </span>
                          </td>
                        )}
                        {isColVisible('shipDate') && (
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            <span className="text-sm text-slate-700">{shipment.shipDate}</span>
                          </td>
                        )}
                        {isColVisible('estDelivery') && (
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            <span className="text-sm text-slate-700">{shipment.estDelivery}</span>
                          </td>
                        )}
                        {isColVisible('actions') && (
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            <div className="flex items-center gap-0.5">
                              <button
                                onClick={() => handleEditClick(shipment)}
                                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                                title="Edit shipment"
                              >
                                <Edit className="w-4 h-4 text-slate-600" />
                              </button>
                              <button
                                onClick={() => handleViewDetailsClick(shipment)}
                                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                                title="View details"
                              >
                                <Eye className="w-4 h-4 text-slate-600" />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(shipment)}
                                className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete shipment"
                              >
                                <Trash2 className="w-4 h-4 text-slate-600 hover:text-red-600" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                      {/* Child Tracking Rows */}
                      {expandedRows.includes(shipment.id) && shipment.childTrackings && shipment.childTrackings.length > 0 && (
                        <tr className="bg-slate-50">
                          <td colSpan={16} className="px-6 py-4">
                            <div className="space-y-2">
                              {shipment.childTrackings.map((child, index) => (
                                <div key={`${shipment.id}-child-${index}`} className="bg-white rounded-lg p-4 border border-slate-200 flex items-center justify-between hover:shadow-sm transition-shadow">
                                  <div className="flex items-center gap-4 flex-1">
                                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                      <span className="text-sm font-bold text-slate-700">#{index + 1}</span>
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-slate-900">{child.trackingNumber}</p>
                                      <p className="text-xs text-slate-600">Ship: {child.shipDate} • Delivery: {child.estDelivery}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium ${getStatusColor(child.status)}`}>
                                      {child.status}
                                    </span>
                                    <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                                      <Eye className="w-4 h-4 text-slate-600" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  ))}
              </table>
            </div>

            {/* Pagination */}
            <div className="border-t border-slate-200 px-6 py-4 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-700">Rows per page:</span>
                  <select
                    value={rowsPerPage}
                    onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <span className="text-sm text-slate-600">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredShipments.length)} of {filteredShipments.length} shipments
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || filteredShipments.length === 0}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Drawers and Modals */}
      <AddShipmentDrawer 
        isOpen={isAddDrawerOpen} 
        onClose={() => setIsAddDrawerOpen(false)}
        onSave={fetchShipments}
      />
      <EditShipmentDrawer 
        isOpen={isEditDrawerOpen} 
        onClose={() => {
          setIsEditDrawerOpen(false);
          setEditingShipment(null);
        }}
        shipment={editingShipment}
        onSave={fetchShipments}
      />
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setShipmentToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        itemName={shipmentToDelete?.masterTracking || ''}
        itemType="shipment"
      />
      <ShipmentDetailsModal
        isOpen={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setShipmentDetails(null);
        }}
        shipment={shipmentDetails}
      />

      {/* Bulk Delete Confirmation Modal */}
      <AnimatePresence>
        {bulkDeleteModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !bulkDeleting && setBulkDeleteModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <Trash2 className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Delete Shipments</h3>
                    <p className="text-sm text-slate-500">This action cannot be undone</p>
                  </div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                  <p className="text-sm text-red-800">
                    Are you sure you want to delete <span className="font-bold">{selectedShipments.length} shipment{selectedShipments.length !== 1 ? 's' : ''}</span>? This will permanently remove the selected shipment records and their tracking data.
                  </p>
                </div>
                <div className="max-h-[200px] overflow-y-auto mb-4 space-y-1">
                  {selectedShipments.map(id => {
                    const s = shipments.find(sh => sh.id === id);
                    return (
                      <div key={id} className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg text-sm">
                        <Package className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium text-slate-700">{s?.poNumber || s?.id || id}</span>
                        {s?.masterTracking && (
                          <span className="text-xs text-slate-400 ml-auto font-mono">{s.masterTracking}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="bg-slate-50 px-6 py-4 flex items-center gap-3 border-t border-slate-200">
                <button
                  onClick={() => setBulkDeleteModalOpen(false)}
                  disabled={bulkDeleting}
                  className="flex-1 px-4 py-2.5 bg-white border-2 border-slate-300 rounded-xl text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={bulkDeleting}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {bulkDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete {selectedShipments.length} Shipment{selectedShipments.length !== 1 ? 's' : ''}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}