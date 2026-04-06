import { Plus, Minus, Weight } from 'lucide-react';
import { useState } from 'react';

interface Package {
  id: string;
  length: string;
  width: string;
  height: string;
  weight: string;
}

interface Pallet {
  id: string;
  palletSize: string;
  palletWeight: string;
  palletHeight: string;
  isStackable: boolean;
}

interface Carton {
  id: string;
  cbm: string;
  grossWeight: string;
  netWeight: string;
  cartonCount: string;
  description: string;
}

interface DynamicPackageDetailsProps {
  shipmentType: string;
}

export function DynamicPackageDetails({ shipmentType }: DynamicPackageDetailsProps) {
  const [allSameSize, setAllSameSize] = useState(true);

  // Small Package state
  const [packages, setPackages] = useState<Package[]>([
    { id: '1', length: '', width: '', height: '', weight: '' }
  ]);

  // Pallet state (LTL/FTL)
  const [pallets, setPallets] = useState<Pallet[]>([
    { id: '1', palletSize: '48x40', palletWeight: '', palletHeight: '', isStackable: true }
  ]);

  // Carton state (Ocean Freight / Air Cargo)
  const [cartons, setCartons] = useState<Carton[]>([
    { id: '1', cbm: '', grossWeight: '', netWeight: '', cartonCount: '', description: '' }
  ]);

  // Add new package
  const addPackage = () => {
    const newPackage: Package = {
      id: Date.now().toString(),
      length: allSameSize && packages.length > 0 ? packages[0].length : '',
      width: allSameSize && packages.length > 0 ? packages[0].width : '',
      height: allSameSize && packages.length > 0 ? packages[0].height : '',
      weight: allSameSize && packages.length > 0 ? packages[0].weight : '',
    };
    setPackages([...packages, newPackage]);
  };

  const removePackage = (id: string) => {
    if (packages.length > 1) {
      setPackages(packages.filter(p => p.id !== id));
    }
  };

  const updatePackage = (id: string, field: keyof Package, value: string) => {
    setPackages(packages.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  // Add new pallet
  const addPallet = () => {
    const newPallet: Pallet = {
      id: Date.now().toString(),
      palletSize: allSameSize && pallets.length > 0 ? pallets[0].palletSize : '48x40',
      palletWeight: allSameSize && pallets.length > 0 ? pallets[0].palletWeight : '',
      palletHeight: allSameSize && pallets.length > 0 ? pallets[0].palletHeight : '',
      isStackable: allSameSize && pallets.length > 0 ? pallets[0].isStackable : true,
    };
    setPallets([...pallets, newPallet]);
  };

  const removePallet = (id: string) => {
    if (pallets.length > 1) {
      setPallets(pallets.filter(p => p.id !== id));
    }
  };

  const updatePallet = (id: string, field: keyof Pallet, value: string | boolean) => {
    setPallets(pallets.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  // Add new carton
  const addCarton = () => {
    const newCarton: Carton = {
      id: Date.now().toString(),
      cbm: allSameSize && cartons.length > 0 ? cartons[0].cbm : '',
      grossWeight: allSameSize && cartons.length > 0 ? cartons[0].grossWeight : '',
      netWeight: allSameSize && cartons.length > 0 ? cartons[0].netWeight : '',
      cartonCount: allSameSize && cartons.length > 0 ? cartons[0].cartonCount : '',
      description: allSameSize && cartons.length > 0 ? cartons[0].description : '',
    };
    setCartons([...cartons, newCarton]);
  };

  const removeCarton = (id: string) => {
    if (cartons.length > 1) {
      setCartons(cartons.filter(c => c.id !== id));
    }
  };

  const updateCarton = (id: string, field: keyof Carton, value: string) => {
    setCartons(cartons.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  // Render Small Package fields
  const renderSmallPackageFields = () => (
    <div className="space-y-4">
      {/* Same Size Toggle */}
      <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <input
          type="checkbox"
          id="sameSizePackage"
          checked={allSameSize}
          onChange={(e) => setAllSameSize(e.target.checked)}
          className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="sameSizePackage" className="text-sm font-semibold text-slate-700 cursor-pointer">
          All packages are the same size
        </label>
      </div>

      {/* Package List */}
      {packages.map((pkg, index) => (
        <div key={pkg.id} className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-bold text-slate-900">Package {index + 1}</h4>
            {packages.length > 1 && (
              <button
                type="button"
                onClick={() => removePackage(pkg.id)}
                className="p-1 hover:bg-red-100 rounded-lg transition-colors"
              >
                <Minus className="w-4 h-4 text-red-600" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Length (in) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                value={pkg.length}
                onChange={(e) => updatePackage(pkg.id, 'length', e.target.value)}
                placeholder="12"
                required
                disabled={allSameSize && index > 0}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Width (in) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                value={pkg.width}
                onChange={(e) => updatePackage(pkg.id, 'width', e.target.value)}
                placeholder="8"
                required
                disabled={allSameSize && index > 0}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Height (in) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                value={pkg.height}
                onChange={(e) => updatePackage(pkg.id, 'height', e.target.value)}
                placeholder="6"
                required
                disabled={allSameSize && index > 0}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Weight (lbs) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                value={pkg.weight}
                onChange={(e) => updatePackage(pkg.id, 'weight', e.target.value)}
                placeholder="25"
                required
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>
        </div>
      ))}

      {/* Add Package Button */}
      <button
        type="button"
        onClick={addPackage}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 border-2 border-dashed border-emerald-300 rounded-lg text-emerald-700 font-semibold hover:bg-emerald-100 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Another Package
      </button>
    </div>
  );

  // Render Pallet fields (LTL/FTL)
  const renderPalletFields = () => (
    <div className="space-y-4">
      {/* Same Size Toggle */}
      <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <input
          type="checkbox"
          id="sameSizePallet"
          checked={allSameSize}
          onChange={(e) => setAllSameSize(e.target.checked)}
          className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="sameSizePallet" className="text-sm font-semibold text-slate-700 cursor-pointer">
          All pallets are the same size
        </label>
      </div>

      {/* Pallet List */}
      {pallets.map((pallet, index) => (
        <div key={pallet.id} className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-bold text-slate-900">Pallet {index + 1}</h4>
            {pallets.length > 1 && (
              <button
                type="button"
                onClick={() => removePallet(pallet.id)}
                className="p-1 hover:bg-red-100 rounded-lg transition-colors"
              >
                <Minus className="w-4 h-4 text-red-600" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Pallet Size <span className="text-red-500">*</span>
              </label>
              <select
                value={pallet.palletSize}
                onChange={(e) => updatePallet(pallet.id, 'palletSize', e.target.value)}
                required
                disabled={allSameSize && index > 0}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:bg-slate-100 disabled:text-slate-500"
              >
                <option value="48x40">48" x 40" (Standard)</option>
                <option value="42x42">42" x 42" (Telecom)</option>
                <option value="48x48">48" x 48" (Drum)</option>
                <option value="40x48">40" x 48" (Euro)</option>
                <option value="48x42">48" x 42" (Industrial)</option>
                <option value="custom">Custom Size</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Pallet Weight (lbs) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                value={pallet.palletWeight}
                onChange={(e) => updatePallet(pallet.id, 'palletWeight', e.target.value)}
                placeholder="500"
                required
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Pallet Height (in) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                value={pallet.palletHeight}
                onChange={(e) => updatePallet(pallet.id, 'palletHeight', e.target.value)}
                placeholder="48"
                required
                disabled={allSameSize && index > 0}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 p-3 bg-white border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 w-full">
                <input
                  type="checkbox"
                  checked={pallet.isStackable}
                  onChange={(e) => updatePallet(pallet.id, 'isStackable', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="text-xs font-semibold text-slate-700">Stackable</span>
              </label>
            </div>
          </div>
        </div>
      ))}

      {/* Add Pallet Button */}
      <button
        type="button"
        onClick={addPallet}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 border-2 border-dashed border-emerald-300 rounded-lg text-emerald-700 font-semibold hover:bg-emerald-100 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Another Pallet
      </button>
    </div>
  );

  // Render Ocean/Air Cargo fields
  const renderCartonFields = () => (
    <div className="space-y-4">
      {/* Same Size Toggle */}
      <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <input
          type="checkbox"
          id="sameSizeCarton"
          checked={allSameSize}
          onChange={(e) => setAllSameSize(e.target.checked)}
          className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="sameSizeCarton" className="text-sm font-semibold text-slate-700 cursor-pointer">
          All cartons are the same
        </label>
      </div>

      {/* Carton List */}
      {cartons.map((carton, index) => (
        <div key={carton.id} className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-bold text-slate-900">Carton Line {index + 1}</h4>
            {cartons.length > 1 && (
              <button
                type="button"
                onClick={() => removeCarton(carton.id)}
                className="p-1 hover:bg-red-100 rounded-lg transition-colors"
              >
                <Minus className="w-4 h-4 text-red-600" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Number of Cartons <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={carton.cartonCount}
                onChange={(e) => updateCarton(carton.id, 'cartonCount', e.target.value)}
                placeholder="100"
                required
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                CBM (m³) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.001"
                value={carton.cbm}
                onChange={(e) => updateCarton(carton.id, 'cbm', e.target.value)}
                placeholder="2.5"
                required
                disabled={allSameSize && index > 0}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Gross Weight (kg) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                value={carton.grossWeight}
                onChange={(e) => updateCarton(carton.id, 'grossWeight', e.target.value)}
                placeholder="150"
                required
                disabled={allSameSize && index > 0}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Net Weight (kg) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                value={carton.netWeight}
                onChange={(e) => updateCarton(carton.id, 'netWeight', e.target.value)}
                placeholder="140"
                required
                disabled={allSameSize && index > 0}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Description
            </label>
            <input
              type="text"
              value={carton.description}
              onChange={(e) => updateCarton(carton.id, 'description', e.target.value)}
              placeholder="T-shirts, mixed colors and sizes"
              disabled={allSameSize && index > 0}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:bg-slate-100 disabled:text-slate-500"
            />
          </div>
        </div>
      ))}

      {/* Add Carton Button */}
      <button
        type="button"
        onClick={addCarton}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 border-2 border-dashed border-emerald-300 rounded-lg text-emerald-700 font-semibold hover:bg-emerald-100 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Another Carton Line
      </button>
    </div>
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
        <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center">
          <Weight className="w-5 h-5 text-white" />
        </div>
        Package Details
      </h3>

      {shipmentType === 'Small Package' && renderSmallPackageFields()}
      {(shipmentType === 'LTL' || shipmentType === 'FTL') && renderPalletFields()}
      {(shipmentType === 'Ocean Freight' || shipmentType === 'Air Cargo') && renderCartonFields()}
    </div>
  );
}
