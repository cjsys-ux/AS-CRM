import { motion, AnimatePresence } from 'motion/react';
import { Shield, ChevronRight, ChevronDown, Home, BarChart3, Package, ShoppingCart, Users, Database, TrendingUp, Boxes, Palette, Factory, Truck, Warehouse, Mail, DollarSign, Search, Filter, Contact, ClipboardList, Eye, Edit3, Trash2, Download, Upload, Send, Settings, Lock, Plus, FileText, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

// Small branded checkbox
function PermCheckbox({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onChange}
      disabled={disabled}
      className={`w-[18px] h-[18px] rounded flex items-center justify-center transition-all border ${
        checked
          ? 'bg-blue-600 border-blue-600'
          : 'bg-white border-slate-300 hover:border-blue-400'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {checked && (
        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
    </button>
  );
}

interface SubPermission {
  id: string;
  label: string;
}

interface ModuleConfig {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  permissions: SubPermission[];
}

const moduleConfigs: ModuleConfig[] = [
  {
    id: 'dashboard', name: 'Dashboard', icon: Home,
    permissions: [
      { id: 'view', label: 'View Dashboard' },
      { id: 'sales-overview', label: 'Sales Overview Widget' },
      { id: 'revenue-chart', label: 'Revenue Chart' },
      { id: 'pipeline-summary', label: 'Pipeline Summary' },
      { id: 'recent-orders', label: 'Recent Orders Widget' },
      { id: 'team-activity', label: 'Team Activity Feed' },
      { id: 'kpi-cards', label: 'KPI Cards' },
    ],
  },
  {
    id: 'analytics', name: 'Analytics', icon: BarChart3,
    permissions: [
      { id: 'view', label: 'View Reports' },
      { id: 'export', label: 'Export Data' },
      { id: 'create-reports', label: 'Create Custom Reports' },
      { id: 'share-reports', label: 'Share Reports' },
    ],
  },
  {
    id: 'sales-leads', name: 'Sales Leads', icon: TrendingUp,
    permissions: [
      { id: 'view', label: 'View Leads' },
      { id: 'create', label: 'Create Leads' },
      { id: 'edit', label: 'Edit Leads' },
      { id: 'delete', label: 'Delete Leads' },
      { id: 'assign', label: 'Assign Leads' },
      { id: 'import', label: 'Import Leads' },
      { id: 'export', label: 'Export Leads' },
    ],
  },
  {
    id: 'customers', name: 'Customers', icon: Users,
    permissions: [
      { id: 'view', label: 'View Customers' },
      { id: 'create', label: 'Create Customers' },
      { id: 'edit', label: 'Edit Customers' },
      { id: 'delete', label: 'Delete Customers' },
      { id: 'view-financials', label: 'View Financial Info' },
      { id: 'export', label: 'Export Customers' },
    ],
  },
  {
    id: 'vendors', name: 'Vendors', icon: Database,
    permissions: [
      { id: 'view', label: 'View Vendors' },
      { id: 'create', label: 'Create Vendors' },
      { id: 'edit', label: 'Edit Vendors' },
      { id: 'delete', label: 'Delete Vendors' },
      { id: 'view-pricing', label: 'View Vendor Pricing' },
      { id: 'manage-contracts', label: 'Manage Contracts' },
    ],
  },
  {
    id: 'contacts', name: 'Contacts', icon: Contact,
    permissions: [
      { id: 'view', label: 'View Contacts' },
      { id: 'create', label: 'Create Contacts' },
      { id: 'edit', label: 'Edit Contacts' },
      { id: 'delete', label: 'Delete Contacts' },
      { id: 'send-email', label: 'Send Emails' },
    ],
  },
  {
    id: 'orders', name: 'Orders', icon: ShoppingCart,
    permissions: [
      { id: 'view', label: 'View Orders' },
      { id: 'create', label: 'Create Orders' },
      { id: 'edit', label: 'Edit Orders' },
      { id: 'delete', label: 'Delete Orders' },
      { id: 'approve', label: 'Approve Orders' },
      { id: 'cancel', label: 'Cancel Orders' },
      { id: 'view-pricing', label: 'View Pricing / Margins' },
      { id: 'process-payments', label: 'Process Payments' },
    ],
  },
  {
    id: 'product-database', name: 'Product Database', icon: Package,
    permissions: [
      { id: 'view', label: 'View Products' },
      { id: 'create', label: 'Create Products' },
      { id: 'edit', label: 'Edit Products' },
      { id: 'delete', label: 'Delete Products' },
      { id: 'manage-pricing', label: 'Manage Pricing' },
      { id: 'manage-files', label: 'Manage Files' },
      { id: 'import', label: 'Bulk Import' },
    ],
  },
  {
    id: 'pipeline', name: 'Pipeline', icon: ClipboardList,
    permissions: [
      { id: 'view', label: 'View Pipeline' },
      { id: 'create', label: 'Create Opportunities' },
      { id: 'edit', label: 'Edit Opportunities' },
      { id: 'delete', label: 'Delete Opportunities' },
      { id: 'move-stages', label: 'Move Stages' },
      { id: 'view-forecasts', label: 'View Forecasts' },
    ],
  },
  {
    id: 'design-lab', name: 'Design Lab', icon: Palette,
    permissions: [
      { id: 'view', label: 'View Designs' },
      { id: 'create', label: 'Create Designs' },
      { id: 'edit', label: 'Edit Designs' },
      { id: 'delete', label: 'Delete Designs' },
      { id: 'approve', label: 'Approve Designs' },
      { id: 'download', label: 'Download Files' },
    ],
  },
  {
    id: 'purchasing', name: 'Purchasing', icon: DollarSign,
    permissions: [
      { id: 'view', label: 'View Purchase Orders' },
      { id: 'create', label: 'Create POs' },
      { id: 'edit', label: 'Edit POs' },
      { id: 'approve', label: 'Approve POs' },
      { id: 'delete', label: 'Delete POs' },
      { id: 'view-costs', label: 'View Costs' },
    ],
  },
  {
    id: 'production', name: 'Production', icon: Factory,
    permissions: [
      { id: 'view', label: 'View Production' },
      { id: 'create', label: 'Create Jobs' },
      { id: 'edit', label: 'Edit Jobs' },
      { id: 'update-status', label: 'Update Status' },
      { id: 'manage-schedule', label: 'Manage Schedule' },
    ],
  },
  {
    id: 'shipments', name: 'Shipments', icon: Truck,
    permissions: [
      { id: 'view', label: 'View Shipments' },
      { id: 'create', label: 'Create Shipments' },
      { id: 'edit', label: 'Edit Shipments' },
      { id: 'generate-labels', label: 'Generate Labels' },
      { id: 'track', label: 'Track Shipments' },
    ],
  },
  {
    id: 'warehouse', name: 'Warehouse / WMS', icon: Warehouse,
    permissions: [
      { id: 'view', label: 'View Warehouse' },
      { id: 'receive', label: 'Receive Inventory' },
      { id: 'pick-pack', label: 'Pick & Pack' },
      { id: 'transfer', label: 'Transfer Stock' },
      { id: 'adjust', label: 'Adjust Inventory' },
    ],
  },
  {
    id: 'inventory', name: 'Inventory', icon: Boxes,
    permissions: [
      { id: 'view', label: 'View Inventory' },
      { id: 'adjust', label: 'Adjust Quantities' },
      { id: 'transfer', label: 'Transfer Stock' },
      { id: 'export', label: 'Export Inventory' },
      { id: 'manage-locations', label: 'Manage Locations' },
    ],
  },
  {
    id: 'amazon', name: 'Amazon Distribution', icon: ShoppingCart,
    permissions: [
      { id: 'view', label: 'View Amazon Data' },
      { id: 'sync', label: 'Sync Listings' },
      { id: 'manage-listings', label: 'Manage Listings' },
      { id: 'manage-fba', label: 'Manage FBA Shipments' },
      { id: 'view-analytics', label: 'View Analytics' },
    ],
  },
  {
    id: 'billing', name: 'Billing & Collections', icon: DollarSign,
    permissions: [
      { id: 'view', label: 'View Invoices' },
      { id: 'create', label: 'Create Invoices' },
      { id: 'edit', label: 'Edit Invoices' },
      { id: 'send', label: 'Send Invoices' },
      { id: 'record-payments', label: 'Record Payments' },
      { id: 'write-off', label: 'Write Off Balances' },
      { id: 'view-aging', label: 'View Aging Reports' },
    ],
  },
  {
    id: 'email-templates', name: 'Email Templates', icon: Mail,
    permissions: [
      { id: 'view', label: 'View Templates' },
      { id: 'create', label: 'Create Templates' },
      { id: 'edit', label: 'Edit Templates' },
      { id: 'delete', label: 'Delete Templates' },
      { id: 'send', label: 'Send Emails' },
    ],
  },
];

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status?: string;
  phone?: string;
}

// Build default permissions based on user role
function buildDefaultPerms(role: string): Record<string, Record<string, boolean>> {
  const result: Record<string, Record<string, boolean>> = {};
  const roleLower = (role || '').toLowerCase();
  moduleConfigs.forEach(mod => {
    result[mod.id] = {};
    mod.permissions.forEach(p => {
      if (roleLower.includes('admin') || roleLower.includes('owner')) {
        result[mod.id][p.id] = true;
      } else if (roleLower.includes('manager')) {
        result[mod.id][p.id] = !p.id.includes('delete') && !p.id.includes('write-off');
      } else if (roleLower.includes('designer')) {
        result[mod.id][p.id] = p.id === 'view' || mod.id === 'design-lab';
      } else if (roleLower.includes('warehouse') || roleLower.includes('logistics')) {
        result[mod.id][p.id] = p.id === 'view' || ['warehouse', 'inventory', 'shipments'].includes(mod.id);
      } else if (roleLower.includes('sales')) {
        result[mod.id][p.id] = p.id === 'view' || (['sales-leads', 'customers', 'contacts', 'pipeline', 'orders'].includes(mod.id) && ['create', 'edit', 'assign'].includes(p.id));
      } else {
        // Default: view only
        result[mod.id][p.id] = p.id === 'view';
      }
    });
  });
  return result;
}

export function Permissions() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [allPerms, setAllPerms] = useState<Record<string, Record<string, Record<string, boolean>>>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch users from User Management + stored permissions
  useEffect(() => {
    const fetchAll = async () => {
      try {
        setIsLoading(true);
        const [usersRes, permsRes] = await Promise.all([
          fetch('/api/users/list'),
          fetch('/api/settings/permissions/get'),
        ]);
        const usersData = await usersRes.json();
        const permsData = await permsRes.json().catch(() => ({ permissions: {} }));
        const storedPerms: Record<string, Record<string, Record<string, boolean>>> =
          (permsData && permsData.permissions) || {};

        if (Array.isArray(usersData.users) && usersData.users.length > 0) {
          setUsers(usersData.users);
          setSelectedUser(usersData.users[0].id);
          const perms: Record<string, Record<string, Record<string, boolean>>> = {};
          usersData.users.forEach((u: User) => {
            perms[u.id] = storedPerms[u.id] ?? buildDefaultPerms(u.role);
          });
          setAllPerms(perms);
        }
      } catch (error) {
        console.error('Error fetching users for permissions:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, []);

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentUser = users.find(u => u.id === selectedUser);
  const userPerms = allPerms[selectedUser] || {};

  const toggleExpand = (modId: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      next.has(modId) ? next.delete(modId) : next.add(modId);
      return next;
    });
  };

  const togglePerm = (modId: string, permId: string) => {
    setAllPerms(prev => ({
      ...prev,
      [selectedUser]: {
        ...prev[selectedUser],
        [modId]: {
          ...prev[selectedUser]?.[modId],
          [permId]: !prev[selectedUser]?.[modId]?.[permId],
        },
      },
    }));
    setHasChanges(true);
  };

  const toggleAllForModule = (modId: string) => {
    const mod = moduleConfigs.find(m => m.id === modId);
    if (!mod) return;
    const modPerms = userPerms[modId] || {};
    const allChecked = mod.permissions.every(p => modPerms[p.id]);
    setAllPerms(prev => {
      const updated: Record<string, boolean> = {};
      mod.permissions.forEach(p => { updated[p.id] = !allChecked; });
      return {
        ...prev,
        [selectedUser]: { ...prev[selectedUser], [modId]: updated },
      };
    });
    setHasChanges(true);
  };

  const toggleAllModules = () => {
    const allEnabled = moduleConfigs.every(mod => {
      const modPerms = userPerms[mod.id] || {};
      return mod.permissions.every(p => modPerms[p.id]);
    });
    setAllPerms(prev => {
      const updated: Record<string, Record<string, boolean>> = {};
      moduleConfigs.forEach(mod => {
        updated[mod.id] = {};
        mod.permissions.forEach(p => { updated[mod.id][p.id] = !allEnabled; });
      });
      return { ...prev, [selectedUser]: updated };
    });
    setHasChanges(true);
  };

  const isAllModulesEnabled = moduleConfigs.every(mod => {
    const modPerms = userPerms[mod.id] || {};
    return mod.permissions.every(p => modPerms[p.id]);
  });

  const totalEnabled = moduleConfigs.reduce((sum, mod) => {
    const modPerms = userPerms[mod.id] || {};
    return sum + mod.permissions.filter(p => modPerms[p.id]).length;
  }, 0);

  const totalPerms = moduleConfigs.reduce((sum, mod) => sum + mod.permissions.length, 0);

  const getModulePermCount = (modId: string) => {
    const mod = moduleConfigs.find(m => m.id === modId);
    if (!mod) return { enabled: 0, total: 0 };
    const modPerms = userPerms[modId] || {};
    const enabled = mod.permissions.filter(p => modPerms[p.id]).length;
    return { enabled, total: mod.permissions.length };
  };

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

  const getRoleBadgeColor = (role: string) => {
    if (role.includes('Admin')) return 'bg-orange-100 text-orange-700';
    if (role.includes('Manager')) return 'bg-blue-100 text-blue-700';
    if (role.includes('Designer')) return 'bg-purple-100 text-purple-700';
    if (role.includes('Warehouse')) return 'bg-emerald-100 text-emerald-700';
    return 'bg-slate-100 text-slate-600';
  };

  const savePermissions = async () => {
    if (!hasChanges) return;
    setIsSaving(true);
    try {
      const response = await fetch('/api/settings/permissions/save', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions: allPerms }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        toast.success('Permissions saved successfully!');
        setHasChanges(false);
      } else {
        toast.error('Failed to save permissions. Please try again.');
      }
    } catch (error) {
      console.error('Error saving permissions:', error);
      toast.error('An error occurred while saving permissions. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50" style={{ height: '100%', maxHeight: '100vh', overflow: 'hidden' }}>
      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Left Sidebar - Users */}
        <div className="w-72 bg-white border-r border-slate-200 flex flex-col min-h-0 flex-shrink-0">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100 flex-shrink-0">
            <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-sm text-slate-900">Users</h3>
          </div>

          <div className="px-3 py-3 border-b border-slate-100 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-slate-400">
              <Filter className="w-3 h-3" />
              <span>{filteredUsers.length} users</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                <div className="w-6 h-6 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin mb-2" />
                <span className="text-xs">Loading users...</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">No users found</div>
            ) : (
            filteredUsers.map((user) => {
              const isSelected = selectedUser === user.id;
              return (
                <motion.button
                  key={user.id}
                  onClick={() => setSelectedUser(user.id)}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'hover:bg-slate-50 text-slate-700 border border-transparent hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {getInitials(user.name)}
                    </div>
                    <div className="text-left min-w-0">
                      <div className={`font-semibold text-sm truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                        {user.name}
                      </div>
                      <div className={`text-xs truncate ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                        {user.role}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                </motion.button>
              );
            })
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 bg-slate-50 overflow-y-auto">
          {currentUser ? (
            <div className="p-4">
              <div className="max-w-3xl">
                {/* User Info */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                      {getInitials(currentUser.name)}
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-slate-900">{currentUser.name}</div>
                      <div className="text-xs text-slate-400">{currentUser.email}</div>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${getRoleBadgeColor(currentUser.role)}`}>
                    {currentUser.role}
                  </span>
                </div>

                {/* Module Permissions */}
                <div className="space-y-1.5">
                  {/* Select All Row */}
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="flex items-center gap-2 px-3.5 py-2.5">
                      <div className="w-[18px]" /> {/* spacer for chevron alignment */}
                      <PermCheckbox
                        checked={isAllModulesEnabled}
                        onChange={toggleAllModules}
                      />
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="w-6 h-6 rounded-md bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <Shield className="w-3.5 h-3.5 text-blue-600" />
                        </div>
                        <span className="text-sm font-semibold text-slate-900">Select All Modules</span>
                      </div>
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
                        isAllModulesEnabled
                          ? 'bg-green-100 text-green-700'
                          : totalEnabled > 0
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-500'
                      }`}>
                        {totalEnabled}/{totalPerms}
                      </span>
                    </div>
                  </div>

                  {moduleConfigs.map((mod) => {
                    const Icon = mod.icon;
                    const isExpanded = expandedModules.has(mod.id);
                    const { enabled, total } = getModulePermCount(mod.id);
                    const allChecked = enabled === total;
                    const someChecked = enabled > 0 && !allChecked;

                    return (
                      <div key={mod.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        {/* Module Row */}
                        <div className="flex items-center gap-2 px-3.5 py-2.5">
                          {/* Expand toggle */}
                          <button
                            onClick={() => toggleExpand(mod.id)}
                            className="p-0.5 hover:bg-slate-100 rounded transition-colors"
                          >
                            <motion.div
                              animate={{ rotate: isExpanded ? 180 : 0 }}
                              transition={{ duration: 0.15 }}
                            >
                              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                            </motion.div>
                          </button>

                          {/* Module master checkbox */}
                          <PermCheckbox
                            checked={allChecked}
                            onChange={() => toggleAllForModule(mod.id)}
                          />

                          {/* Module info */}
                          <button
                            onClick={() => toggleExpand(mod.id)}
                            className="flex items-center gap-2 flex-1 min-w-0"
                          >
                            <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center flex-shrink-0">
                              <Icon className="w-3.5 h-3.5 text-slate-500" />
                            </div>
                            <span className="text-sm font-medium text-slate-900 truncate">{mod.name}</span>
                          </button>

                          {/* Permission count badge */}
                          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
                            allChecked
                              ? 'bg-green-100 text-green-700'
                              : someChecked
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-slate-100 text-slate-500'
                          }`}>
                            {enabled}/{total}
                          </span>
                        </div>

                        {/* Expanded Sub-permissions */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.15 }}
                              className="border-t border-slate-100 bg-slate-50/50"
                            >
                              <div className="px-4 py-2 space-y-0.5">
                                {mod.permissions.map((perm) => {
                                  const isChecked = userPerms[mod.id]?.[perm.id] || false;
                                  return (
                                    <div
                                      key={perm.id}
                                      className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg hover:bg-white/80 transition-colors cursor-pointer"
                                      onClick={() => togglePerm(mod.id, perm.id)}
                                    >
                                      <PermCheckbox checked={isChecked} onChange={() => togglePerm(mod.id, perm.id)} />
                                      <span className="text-[13px] text-slate-700">{perm.label}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>


              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-sm text-slate-600 font-medium">Select a user to configure permissions</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Save Bar */}
      <AnimatePresence>
        {hasChanges && (
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-between shadow-lg z-10"
          >
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>You have unsaved changes</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setAllPerms(prev => ({ ...prev })); setHasChanges(false); }}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Discard
              </button>
              <button
                onClick={savePermissions}
                disabled={isSaving}
                className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-sm flex items-center gap-2 disabled:opacity-60"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}