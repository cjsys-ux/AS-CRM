import { motion, AnimatePresence } from 'motion/react';
import { Truck, Plus, Search, Filter, MapPin, Package, Clock, CheckCircle, AlertCircle, ChevronLeft, ChevronRight, Eye, Trash2, X, ChevronDown, ChevronRight as ChevronRightIcon, Table as TableIcon, Map, Calendar, TriangleAlert, Download, Edit } from 'lucide-react';
import { useState, useEffect } from 'react';
import { AddShipmentDrawer } from './AddShipmentDrawer';
import { EditShipmentDrawer } from './EditShipmentDrawer';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { ShipmentDetailsModal } from './ShipmentDetailsModal';
import { projectId, publicAnonKey } from '../utils/supabase/info';

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

export function ShipmentsModule() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [selectedShipments, setSelectedShipments] = useState<string[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [shipmentToDelete, setShipmentToDelete] = useState<Shipment | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [shipmentDetails, setShipmentDetails] = useState<Shipment | null>(null);

  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

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

  const filteredShipments = shipments.filter((shipment) =>
    shipment.masterTracking.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shipment.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shipment.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shipment.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shipment.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

      {/* Search Bar - Matches Image */}
      <div className="px-8 pb-6">
        <div className="max-w-[1800px] mx-auto">
          <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search products, clients, or IDs..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
            
            <select className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
              <option>All Statuses</option>
              <option>In Transit</option>
              <option>Delivered</option>
              <option>Delayed</option>
            </select>

            <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
              <Filter className="w-4 h-4" />
              Filter
            </button>

            <button className="flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
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
                <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors">
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
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden h-full flex flex-col">
            <div className="overflow-x-auto flex-1">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left w-12">
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
                    <th className="px-6 py-4 text-left w-8"></th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Master Tracking #</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">PO Number</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Order</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Customer</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Quantity</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Item Name</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Project</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Carrier</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Service Level</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Ship Date</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Est. Delivery</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedShipments.map((shipment) => (
                    <>
                      <tr key={shipment.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedShipments.includes(shipment.id)}
                            onChange={(e) => handleSelectShipment(shipment.id, e.target.checked)}
                            className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          />
                        </td>
                        <td className="px-6 py-4">
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-900">{shipment.masterTracking}</span>
                            {shipment.childTrackings && shipment.childTrackings.length > 0 && (
                              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                +{shipment.childTrackings.length}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {shipment.poNumber ? (
                            <div className="flex flex-col gap-1">
                              <span className="text-sm text-slate-900">{shipment.poNumber}</span>
                              {shipment.orderLabel && (
                                <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded w-fit">
                                  {shipment.orderLabel}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {shipment.orderNumber ? (
                            <span className="text-sm text-slate-900">{shipment.orderNumber}</span>
                          ) : (
                            <span className="text-sm text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-slate-900">{shipment.customer}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-slate-900">{shipment.quantity}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-slate-900">{shipment.itemName}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-sm text-slate-900">{shipment.project}</span>
                            {shipment.projectSubtext && (
                              <span className="text-xs text-slate-500">{shipment.projectSubtext}</span>
                            )}
                            {shipment.projectSubtext2 && (
                              <span className="text-xs text-purple-600 font-medium">{shipment.projectSubtext2}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-slate-700">{shipment.carrier}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-slate-700">{shipment.serviceLevel}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium ${getStatusColor(shipment.status)}`}>
                            {shipment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-slate-700">{shipment.shipDate}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-slate-700">{shipment.estDelivery}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEditClick(shipment)}
                              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Edit shipment"
                            >
                              <Edit className="w-4 h-4 text-slate-600" />
                            </button>
                            <button
                              onClick={() => handleViewDetailsClick(shipment)}
                              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                              title="View details"
                            >
                              <Eye className="w-4 h-4 text-slate-600" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(shipment)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete shipment"
                            >
                              <Trash2 className="w-4 h-4 text-slate-600 hover:text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {/* Child Tracking Rows */}
                      {expandedRows.includes(shipment.id) && shipment.childTrackings && shipment.childTrackings.length > 0 && (
                        <tr className="bg-slate-50">
                          <td colSpan={15} className="px-6 py-4">
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
                    </>
                  ))}
                </tbody>
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
    </div>
  );
}