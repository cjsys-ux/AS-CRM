import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, XCircle, Clock, Package, User, Calendar, FileImage, Eye, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner@2.0.3';

interface ApprovalRequest {
  id: string;
  taskId: string;
  orderId: string;
  customer: string;
  productName: string;
  approver: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected';
  artPreview?: string | null;
  mockupPreview?: string | null;
  approvedBy?: string;
  rejectedBy?: string;
}

export function ManagerApprovalInterface() {
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [managerName, setManagerName] = useState('');
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [viewingArt, setViewingArt] = useState(false);

  const loadRequests = () => {
    const stored = localStorage.getItem('design-approval-requests');
    if (stored) {
      const allRequests: ApprovalRequest[] = JSON.parse(stored);
      // Show pending requests first, then recently approved/rejected (last 24 hours)
      const cutoff = Date.now() - 24 * 60 * 60 * 1000;
      const filtered = allRequests.filter(r => 
        r.status === 'pending' || new Date(r.timestamp).getTime() > cutoff
      );
      setRequests(filtered);
    }
  };

  useEffect(() => {
    loadRequests();
    // Auto-refresh every 3 seconds
    const interval = setInterval(loadRequests, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleApprove = (request: ApprovalRequest) => {
    setSelectedRequest(request);
    setShowNamePrompt(true);
  };

  const confirmApprove = () => {
    if (!managerName.trim() || !selectedRequest) {
      toast.error('Please enter your name');
      return;
    }

    const stored = localStorage.getItem('design-approval-requests');
    if (stored) {
      const allRequests: ApprovalRequest[] = JSON.parse(stored);
      const updated = allRequests.map(r => 
        r.id === selectedRequest.id 
          ? { ...r, status: 'approved' as const, approvedBy: managerName, approvedAt: new Date().toISOString() }
          : r
      );
      localStorage.setItem('design-approval-requests', JSON.stringify(updated));
      toast.success(`Design approved for Order ${selectedRequest.orderId}`);
      loadRequests();
      setShowNamePrompt(false);
      setManagerName('');
      setSelectedRequest(null);
    }
  };

  const handleReject = (request: ApprovalRequest) => {
    const stored = localStorage.getItem('design-approval-requests');
    if (stored) {
      const allRequests: ApprovalRequest[] = JSON.parse(stored);
      const updated = allRequests.map(r => 
        r.id === request.id 
          ? { ...r, status: 'rejected' as const, rejectedBy: 'Manager', rejectedAt: new Date().toISOString() }
          : r
      );
      localStorage.setItem('design-approval-requests', JSON.stringify(updated));
      toast.error(`Design rejected for Order ${request.orderId}`);
      loadRequests();
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const completedRequests = requests.filter(r => r.status !== 'pending');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <CheckCircle className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Manager Approval Center</h1>
                <p className="text-sm text-slate-500">Review and approve design requests</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2">
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Pending</p>
                <p className="text-2xl font-bold text-blue-900">{pendingRequests.length}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={loadRequests}
                className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                <RefreshCw className="w-5 h-5 text-slate-600" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              Pending Approvals
            </h2>
            <div className="space-y-3">
              {pendingRequests.map(request => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-md border-2 border-amber-200 p-5 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-900">Order {request.orderId}</h3>
                          <p className="text-sm text-slate-500">{request.customer}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="bg-slate-50 rounded-lg p-3">
                          <p className="text-xs font-semibold text-slate-500 mb-1">Product</p>
                          <p className="text-sm font-medium text-slate-900">{request.productName}</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-3">
                          <p className="text-xs font-semibold text-slate-500 mb-1">Requested By</p>
                          <p className="text-sm font-medium text-slate-900">{request.approver}</p>
                        </div>
                      </div>

                      {(request.artPreview || request.mockupPreview) && (
                        <div className="flex gap-2 mb-3">
                          {request.artPreview && (
                            <div className="w-20 h-20 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                              <img src={request.artPreview} alt="Art" className="w-full h-full object-contain" />
                            </div>
                          )}
                          {request.mockupPreview && (
                            <div className="w-20 h-20 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                              <img src={request.mockupPreview} alt="Mockup" className="w-full h-full object-contain" />
                            </div>
                          )}
                        </div>
                      )}

                      <p className="text-xs text-slate-400">
                        Requested {new Date(request.timestamp).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleApprove(request)}
                        className="px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg flex items-center gap-2 whitespace-nowrap"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleReject(request)}
                        className="px-4 py-2.5 bg-red-100 text-red-700 font-bold rounded-xl hover:bg-red-200 transition-all border border-red-300 flex items-center gap-2 whitespace-nowrap"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {pendingRequests.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">All Clear!</h3>
            <p className="text-slate-500">No pending approval requests at this time</p>
          </div>
        )}

        {/* Recent Activity */}
        {completedRequests.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-bold text-slate-700 mb-3">Recent Activity</h2>
            <div className="space-y-2">
              {completedRequests.slice(0, 5).map(request => (
                <div key={request.id} className="bg-white rounded-lg border border-slate-200 p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      request.status === 'approved' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {request.status === 'approved' ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Order {request.orderId}</p>
                      <p className="text-xs text-slate-500">{request.customer}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-bold uppercase tracking-wider ${
                      request.status === 'approved' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {request.status}
                    </p>
                    <p className="text-xs text-slate-400">
                      {request.approvedBy || request.rejectedBy}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Manager Name Prompt Modal */}
      <AnimatePresence>
        {showNamePrompt && selectedRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowNamePrompt(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">Confirm Approval</h3>
                <p className="text-sm text-slate-500">Order {selectedRequest.orderId} - {selectedRequest.customer}</p>
              </div>

              <div className="mb-4">
                <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                  Your Name (Manager)
                </label>
                <input
                  type="text"
                  value={managerName}
                  onChange={e => setManagerName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400"
                  onKeyDown={e => e.key === 'Enter' && confirmApprove()}
                  autoFocus
                />
              </div>

              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowNamePrompt(false);
                    setManagerName('');
                    setSelectedRequest(null);
                  }}
                  className="flex-1 px-5 py-3 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition-all"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={confirmApprove}
                  disabled={!managerName.trim()}
                  className="flex-1 px-5 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg disabled:opacity-50"
                >
                  Confirm Approval
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
