import { motion } from 'motion/react';
import { Warehouse, LayoutDashboard, MapPin, PackageCheck, ClipboardList, Truck } from 'lucide-react';
import { useState } from 'react';
import { WMSOverviewTab } from './WMSOverviewTab';
import { WMSWarehousesTab } from './WMSWarehousesTab';
import { WMSReceivingTab } from './WMSReceivingTab';
import { WMSPickingTab } from './WMSPickingTab';
import { WMSShippingTab } from './WMSShippingTab';
import { InventoryModule } from './InventoryModule';

const WMS_TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'warehouses', label: 'Warehouses', icon: Warehouse },
  { id: 'inventory', label: 'Inventory', icon: MapPin },
  { id: 'receiving', label: 'Receiving', icon: PackageCheck },
  { id: 'picking', label: 'Picking', icon: ClipboardList },
  { id: 'shipping', label: 'Shipping', icon: Truck },
] as const;

type WMSTabId = typeof WMS_TABS[number]['id'];

export function WMSModule({ initialTab, onNavigate }: { initialTab?: string; onNavigate?: (page: string) => void }) {
  const [activeTab, setActiveTab] = useState<WMSTabId>(() => {
    const valid = WMS_TABS.find(t => t.id === initialTab);
    return valid ? valid.id : 'overview';
  });

  const renderTab = () => {
    switch (activeTab) {
      case 'overview': return <WMSOverviewTab onNavigate={(tab: string) => setActiveTab(tab as WMSTabId)} />;
      case 'warehouses': return <WMSWarehousesTab />;
      case 'inventory': return <InventoryModule />;
      case 'receiving': return <WMSReceivingTab onNavigate={onNavigate} />;
      case 'picking': return <WMSPickingTab />;
      case 'shipping': return <WMSShippingTab />;
      default: return <WMSOverviewTab onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50/50 overflow-hidden">
      {/* WMS Header with Tab Navigation */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1800px] mx-auto px-6 pt-4 pb-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center">
              <Warehouse className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 mb-0.5">Warehouse Management</h1>
              <p className="text-xs text-slate-500">AI-powered WMS &middot; Real-time inventory tracking &middot; Smart fulfillment</p>
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {WMS_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="relative flex items-center gap-2 px-5 py-3 text-sm font-semibold whitespace-nowrap transition-colors rounded-t-xl"
                >
                  {isActive && (
                    <motion.div
                      layoutId="wms-tab-indicator"
                      className="absolute inset-0 bg-slate-50 rounded-t-xl border border-slate-200 border-b-0"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className={`relative z-10 flex items-center gap-2 ${isActive ? 'text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}>
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {renderTab()}
      </div>
    </div>
  );
}