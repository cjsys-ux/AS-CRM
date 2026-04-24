import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { MapPin, ChevronDown, Search, Building2, X, Layers } from 'lucide-react';

interface WarehouseLocation {
  id: string;
  warehouseId: string;
  name: string;
  type: string;
  barcode: string;
  status: 'Active' | 'Inactive' | 'Full' | 'Reserved';
  zone?: string;
  aisle?: string;
  rack?: string;
  shelf?: string;
  position?: string;
  capacity?: number;
  occupied?: number;
}

interface WarehouseData {
  id: string;
  name: string;
  code: string;
  status: 'Active' | 'Inactive';
}

interface LocationSearchDropdownProps {
  value: string;
  onChange: (value: string) => void;
  locations: WarehouseLocation[];
  warehouses: WarehouseData[];
  placeholder?: string;
  hasError?: boolean;
  errorMessage?: string;
  compact?: boolean;
  className?: string;
}

const typeIcons: Record<string, string> = {
  zone: '🏗️',
  aisle: '🛤️',
  rack: '🗄️',
  shelf: '📦',
  pallet: '🎯',
  bin: '📥',
};

export function LocationSearchDropdown({
  value,
  onChange,
  locations,
  warehouses,
  placeholder = 'Select location…',
  hasError = false,
  errorMessage,
  compact = false,
  className = '',
}: LocationSearchDropdownProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 272 });

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current && !containerRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        setOpen(false);
        setSearch('');
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Position dropdown relative to trigger
  useEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 4,
        left: compact ? rect.left - 16 : rect.left,
        width: Math.max(288, rect.width),
      });
    }
  }, [open, compact]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (open) setTimeout(() => searchInputRef.current?.focus(), 50);
  }, [open]);

  const warehouseMap = useCallback(() => {
    const map: Record<string, WarehouseData> = {};
    warehouses.forEach(w => { map[w.id] = w; });
    return map;
  }, [warehouses]);

  const wMap = warehouseMap();

  // Build location label: "Warehouse Code > Location Name"
  const getLocationLabel = (loc: WarehouseLocation) => {
    const wh = wMap[loc.warehouseId];
    const whPrefix = wh ? `${wh.code || wh.name}` : '';
    return whPrefix ? `${whPrefix} › ${loc.name}` : loc.name;
  };

  const getLocationSublabel = (loc: WarehouseLocation) => {
    const parts: string[] = [];
    if (loc.type) parts.push(loc.type.charAt(0).toUpperCase() + loc.type.slice(1));
    if (loc.zone) parts.push(`Zone: ${loc.zone}`);
    if (loc.aisle) parts.push(`Aisle: ${loc.aisle}`);
    if (loc.rack) parts.push(`Rack: ${loc.rack}`);
    if (loc.shelf) parts.push(`Shelf: ${loc.shelf}`);
    return parts.join(' · ');
  };

  // Filter active locations
  const activeLocations = locations.filter(l => l.status === 'Active');

  // Search filter
  const filtered = search.trim()
    ? activeLocations.filter(loc => {
        const q = search.toLowerCase();
        const label = getLocationLabel(loc).toLowerCase();
        const sub = getLocationSublabel(loc).toLowerCase();
        return label.includes(q) || sub.includes(q) || loc.barcode?.toLowerCase().includes(q);
      })
    : activeLocations;

  // Group by warehouse
  const grouped: Record<string, { warehouse: WarehouseData | null; locs: WarehouseLocation[] }> = {};
  filtered.forEach(loc => {
    const wh = wMap[loc.warehouseId];
    const key = loc.warehouseId || '_none';
    if (!grouped[key]) grouped[key] = { warehouse: wh || null, locs: [] };
    grouped[key].locs.push(loc);
  });

  // Find selected location object
  const selectedLoc = locations.find(l => l.name === value || getLocationLabel(l) === value);

  const handleSelect = (loc: WarehouseLocation) => {
    onChange(getLocationLabel(loc));
    setOpen(false);
    setSearch('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-1.5 text-left border rounded-lg focus:outline-none transition-all ${
          compact ? 'pl-7 pr-2 py-1.5 text-xs' : 'pl-8 pr-2 py-2 text-sm'
        } ${
          hasError
            ? 'border-red-300 ring-2 ring-red-200 focus:border-red-400 bg-white'
            : value
              ? 'border-blue-200 bg-blue-50/50 text-blue-700 focus:border-blue-400'
              : 'border-slate-200 focus:border-amber-400 bg-white'
        }`}
      >
        {!compact && (
          <MapPin className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${
            value ? 'text-blue-500' : hasError ? 'text-red-400' : 'text-slate-400'
          }`} />
        )}
        <span className={`flex-1 truncate font-mono ${value ? '' : 'text-slate-400'}`}>
          {value || placeholder}
        </span>
        {value && (
          <span onClick={handleClear} className="p-0.5 hover:bg-slate-200 rounded transition-colors cursor-pointer">
            <X className="w-3 h-3 text-slate-400" />
          </span>
        )}
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {open && createPortal(
        <div
          ref={dropdownRef}
          className="fixed z-[9999] bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden"
          style={{ top: dropdownPos.top, left: dropdownPos.left, width: dropdownPos.width }}
        >
          {/* Search Bar */}
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search locations…"
                className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-amber-400 bg-slate-50"
              />
            </div>
          </div>

          {/* Results */}
          <div className="max-h-60 overflow-y-auto">
            {Object.keys(grouped).length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-slate-400">
                <Layers className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                {search ? 'No matching locations' : 'No warehouse locations found'}
              </div>
            ) : (
              Object.entries(grouped).map(([key, group]) => (
                <div key={key}>
                  {/* Warehouse Group Header */}
                  <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-100 flex items-center gap-1.5 sticky top-0">
                    <Building2 className="w-3 h-3 text-slate-500" />
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      {group.warehouse ? group.warehouse.name : 'Unassigned'}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-auto">{group.locs.length} loc{group.locs.length !== 1 ? 's' : ''}</span>
                  </div>
                  {group.locs.map(loc => {
                    const isSelected = value === loc.name || value === getLocationLabel(loc);
                    return (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => handleSelect(loc)}
                        className={`w-full text-left px-3 py-2 flex items-start gap-2 transition-colors ${
                          isSelected
                            ? 'bg-blue-50 border-l-2 border-blue-500'
                            : 'hover:bg-amber-50/50 border-l-2 border-transparent'
                        }`}
                      >
                        <span className="text-sm mt-0.5 shrink-0">{typeIcons[loc.type] || '📍'}</span>
                        <div className="min-w-0 flex-1">
                          <div className={`text-sm font-mono font-semibold truncate ${isSelected ? 'text-blue-700' : 'text-slate-800'}`}>
                            {loc.name}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate mt-0.5">
                            {getLocationSublabel(loc)}
                          </div>
                        </div>
                        {loc.capacity != null && (
                          <div className="shrink-0 text-right">
                            <div className={`text-[10px] font-medium ${
                              (loc.occupied || 0) >= loc.capacity ? 'text-red-500' : 'text-slate-400'
                            }`}>
                              {loc.occupied || 0}/{loc.capacity}
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-3 py-2 border-t border-slate-100 bg-slate-50/50">
            <p className="text-[10px] text-slate-400 text-center">
              {activeLocations.length} active location{activeLocations.length !== 1 ? 's' : ''} across {warehouses.filter(w => w.status === 'Active').length} warehouse{warehouses.filter(w => w.status === 'Active').length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>,
        document.body
      )}

      {/* Error Message */}
      {hasError && errorMessage && (
        <div className="absolute -bottom-5 left-0 text-[10px] text-red-500 font-medium whitespace-nowrap">{errorMessage}</div>
      )}
    </div>
  );
}