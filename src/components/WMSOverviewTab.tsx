import { motion } from 'motion/react';
import { Warehouse, MapPin, PackageCheck, ClipboardList, Truck, Boxes, AlertTriangle, TrendingUp, Activity, ArrowRight, BarChart3, Zap, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

interface WMSOverviewTabProps {
  onNavigate: (tab: string) => void;
}

export function WMSOverviewTab({ onNavigate }: WMSOverviewTabProps) {
  const [stats, setStats] = useState({
    warehouses: 0,
    locations: 0,
    inventoryItems: 0,
    pendingReceiving: 0,
    activePicks: 0,
    pendingShipments: 0,
    occupiedLocations: 0,
    lowStockAlerts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      // Fetch each endpoint individually with error handling
      const fetchSafe = async (url: string) => {
        try {
          const res = await fetch(url);
          if (res.ok) {
            return await res.json();
          }
          return null;
        } catch (e) {
          console.warn(`Failed to fetch ${url}:`, e);
          return null;
        }
      };

      const [whData, locData, invData, rcvData, pickData] = await Promise.all([
        fetchSafe('/api/warehouses/list'),
        fetchSafe('/api/warehouse-locations/list'),
        fetchSafe('/api/inventory/list'),
        fetchSafe('/api/receiving/list'),
        fetchSafe('/api/pick-lists/list'),
      ]);

      const items = invData?.items || [];
      const receipts = rcvData?.receiving || rcvData?.receipts || [];
      const picks = pickData?.pickLists || [];
      const locations = locData?.locations || [];
      const occupiedLocs = locations.filter((l: any) => l.assignedItems && l.assignedItems.length > 0).length;
      const lowStock = items.filter((i: any) => (i.quantity || 0) <= (i.reorderPoint || 5)).length;
      setStats({
        warehouses: (whData?.warehouses || []).length,
        locations: locations.length,
        inventoryItems: items.length,
        pendingReceiving: receipts.filter((r: any) => r.status === 'Pending' || r.status === 'In Transit').length,
        activePicks: picks.filter((p: any) => p.status === 'Pending' || p.status === 'In Progress').length,
        pendingShipments: picks.filter((p: any) => p.status === 'Packed').length,
        occupiedLocations: occupiedLocs,
        lowStockAlerts: lowStock,
      });
    } catch (err) {
      console.error('Error loading WMS stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Warehouses', value: stats.warehouses, icon: Warehouse, color: 'from-indigo-500 to-indigo-600', tab: 'warehouses' },
    { label: 'Total Locations', value: stats.locations, icon: MapPin, color: 'from-blue-500 to-blue-600', tab: 'warehouses' },
    { label: 'Inventory Items', value: stats.inventoryItems, icon: Boxes, color: 'from-emerald-500 to-emerald-600', tab: 'inventory' },
    { label: 'Pending Receiving', value: stats.pendingReceiving, icon: PackageCheck, color: 'from-amber-500 to-amber-600', tab: 'receiving' },
    { label: 'Active Picks', value: stats.activePicks, icon: ClipboardList, color: 'from-purple-500 to-purple-600', tab: 'picking' },
    { label: 'Ready to Ship', value: stats.pendingShipments, icon: Truck, color: 'from-cyan-500 to-cyan-600', tab: 'shipping' },
  ];

  const quickActions = [
    { label: 'Receive Shipment', description: 'Process inbound deliveries', icon: PackageCheck, color: 'bg-amber-50 text-amber-700 border-amber-200', tab: 'receiving' },
    { label: 'Create Pick List', description: 'Generate optimized pick routes', icon: ClipboardList, color: 'bg-purple-50 text-purple-700 border-purple-200', tab: 'picking' },
    { label: 'Pack & Ship', description: 'Print labels and packing lists', icon: Truck, color: 'bg-cyan-50 text-cyan-700 border-cyan-200', tab: 'shipping' },
    { label: 'Manage Locations', description: 'Configure racks, aisles, and bins', icon: MapPin, color: 'bg-indigo-50 text-indigo-700 border-indigo-200', tab: 'warehouses' },
  ];

  return (
    <div className="p-6">
      <div className="max-w-[1800px] mx-auto space-y-4">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {statCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => onNavigate(card.tab)}
                whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-lg cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-10 h-10 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300" />
                </div>
                <div className="text-[11px] font-medium text-slate-500 mb-0.5">{card.label}</div>
                <div className="text-xl font-bold text-slate-900">
                  {loading ? <div className="w-8 h-6 bg-slate-200 rounded animate-pulse" /> : card.value}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-amber-500" />
                <h2 className="text-sm font-bold text-slate-900">Quick Actions</h2>
              </div>
              <div className="space-y-2">
                {quickActions.map((action, i) => {
                  const Icon = action.icon;
                  return (
                    <motion.button
                      key={action.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.05 }}
                      onClick={() => onNavigate(action.tab)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border ${action.color} hover:shadow-md transition-all text-left`}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white shadow-sm">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-semibold">{action.label}</div>
                        <div className="text-[11px] opacity-70">{action.description}</div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 opacity-50" />
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* AI Insights & Activity Feed */}
          <div className="lg:col-span-2 space-y-4">
            {/* AI Insights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-xl border border-indigo-200 shadow-lg p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Activity className="w-3.5 h-3.5 text-white" />
                </div>
                <h2 className="text-sm font-bold text-slate-900">AI Insights</h2>
                <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">Smart</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-indigo-100">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-semibold text-slate-900">Space Optimization</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    {stats.locations > 0
                      ? `${stats.locations} locations configured. Consider zone-based slotting for faster picks.`
                      : 'Set up your first warehouse to get AI-driven space recommendations.'}
                  </p>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-indigo-100">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-semibold text-slate-900">Velocity Analysis</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    {stats.inventoryItems > 0
                      ? `${stats.inventoryItems} SKUs tracked. High-velocity items should be placed near packing stations.`
                      : 'Add inventory items to enable velocity-based slotting recommendations.'}
                  </p>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-indigo-100">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-semibold text-slate-900">Stock Alerts</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    {stats.lowStockAlerts > 0
                      ? `${stats.lowStockAlerts} items below reorder point. Review and generate purchase orders.`
                      : 'All stock levels are healthy. No replenishment needed.'}
                  </p>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-indigo-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-semibold text-slate-900">Fulfillment Speed</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    {stats.activePicks > 0
                      ? `${stats.activePicks} active pick lists. Wave picking can reduce travel time by 30%.`
                      : 'No active picks. System is ready for incoming orders.'}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Warehouse Health */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl border border-slate-200 shadow-lg p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <Warehouse className="w-4 h-4 text-indigo-600" />
                <h2 className="text-sm font-bold text-slate-900">Operations Pipeline</h2>
              </div>
              <div className="flex items-center gap-2">
                {[
                  { label: 'Inbound', count: stats.pendingReceiving, color: 'bg-amber-500' },
                  { label: 'Put Away', count: 0, color: 'bg-blue-500' },
                  { label: 'Storage', count: stats.inventoryItems, color: 'bg-emerald-500' },
                  { label: 'Picking', count: stats.activePicks, color: 'bg-purple-500' },
                  { label: 'Packing', count: 0, color: 'bg-orange-500' },
                  { label: 'Shipping', count: stats.pendingShipments, color: 'bg-cyan-500' },
                ].map((stage, i, arr) => (
                  <div key={stage.label} className="flex items-center flex-1">
                    <div className="flex-1 text-center">
                      <div className={`w-8 h-8 ${stage.color} rounded-lg flex items-center justify-center mx-auto mb-1`}>
                        <span className="text-white text-xs font-bold">{stage.count}</span>
                      </div>
                      <div className="text-xs text-slate-500 font-medium">{stage.label}</div>
                    </div>
                    {i < arr.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-slate-300 flex-shrink-0 mx-1" />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}