import { motion, AnimatePresence } from 'motion/react';
import { Shield, Check, X, ChevronRight, Home, BarChart3, Package, ShoppingCart, Users, Database, TrendingUp, Boxes, Palette, Factory } from 'lucide-react';
import { useState } from 'react';

interface Module {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface Permission {
  module: string;
  admin: boolean;
  editor: boolean;
  viewer: boolean;
}

const modules: Module[] = [
  { id: 'dashboard', name: 'Dashboard', icon: Home },
  { id: 'analytics', name: 'Analytics', icon: BarChart3 },
  { id: 'products', name: 'Products', icon: Package },
  { id: 'pipeline', name: 'Product Pipeline', icon: TrendingUp },
  { id: 'orders', name: 'Orders', icon: ShoppingCart },
  { id: 'customers', name: 'Customers', icon: Users },
  { id: 'vendors', name: 'Vendors', icon: Database },
  { id: 'inventory', name: 'Inventory', icon: Boxes },
  { id: 'production', name: 'Production', icon: Factory },
  { id: 'design-lab', name: 'Design Lab', icon: Palette },
];

const initialPermissions: Permission[] = [
  { module: 'dashboard', admin: true, editor: true, viewer: true },
  { module: 'analytics', admin: true, editor: true, viewer: true },
  { module: 'products', admin: true, editor: true, viewer: true },
  { module: 'pipeline', admin: true, editor: true, viewer: true },
  { module: 'orders', admin: true, editor: true, viewer: true },
  { module: 'customers', admin: true, editor: true, viewer: true },
  { module: 'vendors', admin: true, editor: true, viewer: false },
  { module: 'inventory', admin: true, editor: true, viewer: false },
  { module: 'production', admin: true, editor: true, viewer: false },
  { module: 'design-lab', admin: true, editor: false, viewer: false },
];

export function Permissions() {
  const [selectedModule, setSelectedModule] = useState<string>('dashboard');
  const [permissions, setPermissions] = useState<Permission[]>(initialPermissions);

  const togglePermission = (moduleId: string, role: 'admin' | 'editor' | 'viewer') => {
    const updatedPermissions = permissions.map(p =>
      p.module === moduleId ? { ...p, [role]: !p[role] } : p
    );
    setPermissions(updatedPermissions);
  };

  const selectedPermission = permissions.find(p => p.module === selectedModule);
  const selectedModuleData = modules.find(m => m.id === selectedModule);

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
      {/* Purple Header Section */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">Role Permissions</h2>
              <p className="text-purple-100 mt-1">Configure access control for different user roles</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 bg-white text-purple-600 font-semibold rounded-xl hover:bg-purple-50 transition-colors shadow-lg"
          >
            Save Changes
          </motion.button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Modules List */}
        <div className="w-80 bg-white border-r border-slate-200 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </div>
              <h3 className="font-bold text-slate-900">Modules</h3>
            </div>

            <div className="space-y-2">
              {modules.map((module) => {
                const Icon = module.icon;
                const isSelected = selectedModule === module.id;

                return (
                  <motion.button
                    key={module.id}
                    onClick={() => setSelectedModule(module.id)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isSelected ? 'bg-white/20' : 'bg-slate-100'
                      }`}>
                        <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-slate-600'}`} />
                      </div>
                      <div className="text-left">
                        <div className={`font-medium text-sm ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                          {module.name}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Panel - Permissions Table */}
        <div className="flex-1 bg-slate-50 overflow-y-auto">
          <AnimatePresence mode="wait">
            {selectedPermission && selectedModuleData ? (
              <motion.div
                key={selectedModule}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="p-8"
              >
                <div className="max-w-4xl">
                  {/* Permissions Card */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
                    {/* Header Row */}
                    <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-8 py-6 border-b border-slate-200">
                      <div className="grid grid-cols-4 gap-6 items-center">
                        <div className="col-span-1">
                          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Module
                          </div>
                        </div>
                        <div className="col-span-1 flex justify-center">
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                              <span className="text-xl">🔥</span>
                            </div>
                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Admin</span>
                          </div>
                        </div>
                        <div className="col-span-1 flex justify-center">
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                              <span className="text-xl">✏️</span>
                            </div>
                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Editor</span>
                          </div>
                        </div>
                        <div className="col-span-1 flex justify-center">
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                              <span className="text-xl">👁️</span>
                            </div>
                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Viewer</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Permission Row */}
                    <div className="px-8 py-8">
                      <div className="grid grid-cols-4 gap-6 items-center">
                        <div className="col-span-1">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="font-semibold text-slate-900 text-base">
                              {selectedModuleData.name}
                            </span>
                          </div>
                        </div>

                        {/* Admin Toggle */}
                        <div className="col-span-1 flex justify-center">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => togglePermission(selectedModule, 'admin')}
                            className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all shadow-md ${
                              selectedPermission.admin
                                ? 'bg-green-500 hover:bg-green-600 shadow-green-500/30'
                                : 'bg-slate-200 hover:bg-slate-300'
                            }`}
                          >
                            {selectedPermission.admin ? (
                              <Check className="w-7 h-7 text-white stroke-[3]" />
                            ) : (
                              <X className="w-7 h-7 text-slate-400 stroke-[3]" />
                            )}
                          </motion.button>
                        </div>

                        {/* Editor Toggle */}
                        <div className="col-span-1 flex justify-center">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => togglePermission(selectedModule, 'editor')}
                            className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all shadow-md ${
                              selectedPermission.editor
                                ? 'bg-green-500 hover:bg-green-600 shadow-green-500/30'
                                : 'bg-slate-200 hover:bg-slate-300'
                            }`}
                          >
                            {selectedPermission.editor ? (
                              <Check className="w-7 h-7 text-white stroke-[3]" />
                            ) : (
                              <X className="w-7 h-7 text-slate-400 stroke-[3]" />
                            )}
                          </motion.button>
                        </div>

                        {/* Viewer Toggle */}
                        <div className="col-span-1 flex justify-center">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => togglePermission(selectedModule, 'viewer')}
                            className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all shadow-md ${
                              selectedPermission.viewer
                                ? 'bg-green-500 hover:bg-green-600 shadow-green-500/30'
                                : 'bg-slate-200 hover:bg-slate-300'
                            }`}
                          >
                            {selectedPermission.viewer ? (
                              <Check className="w-7 h-7 text-white stroke-[3]" />
                            ) : (
                              <X className="w-7 h-7 text-slate-400 stroke-[3]" />
                            )}
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Permission Levels Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mt-6">
                    <h3 className="text-sm font-bold text-blue-900 mb-4">Permission Levels</h3>
                    <div className="grid grid-cols-3 gap-6">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <span className="text-xl">🔥</span>
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 mb-1">Admin</div>
                          <div className="text-sm text-slate-600">Full access to all features including user management and settings</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <span className="text-xl">✏️</span>
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 mb-1">Editor</div>
                          <div className="text-sm text-slate-600">Can create, edit, and manage content but cannot access system settings</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <span className="text-xl">👁️</span>
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 mb-1">Viewer</div>
                          <div className="text-sm text-slate-600">Read-only access to view data without making any changes</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-10 h-10 text-slate-400" />
                  </div>
                  <p className="text-slate-600 font-medium">Select a module to configure permissions</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
