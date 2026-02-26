import { motion } from 'motion/react';
import { ArrowLeft, Star, Upload, Plus, X, ExternalLink, FileText, Package, Box, Ruler, Weight, Archive, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface ProductDetailViewProps {
  product: any;
  onBack: () => void;
  onSave?: () => void;
}

export function ProductDetailView({ product, onBack, onSave }: ProductDetailViewProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [decorationMethods, setDecorationMethods] = useState<string[]>(['Screen Print', 'Embroidery']);
  const [imprintLocations, setImprintLocations] = useState<string[]>(['Front']);
  const [customLocation, setCustomLocation] = useState('');
  const [catalogDisplays, setCatalogDisplays] = useState({
    bulkSwag: true,
    buildABox: false,
  });

  // Mock data for demonstration
  const productImages = [
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500',
  ];

  const decorationMethodsList = [
    'Screen Print', 'Pad Print', 'Full Color', 
    'Laser Engrave', 'Embroidery', 'Heat Transfer',
    'Sublimation', 'Deboss', 'UV Print', 'DTF'
  ];

  const imprintLocationsList = [
    'Front', 'Back', 'Bottom', 'Top', 
    'Screen', 'Back Panel', 'Side'
  ];

  const variants = [
    { id: 1, preview: productImages[0], sku: 'TS-PREM-001-BLK', price: '12.50', color: 'Black' },
    { id: 2, preview: productImages[0], sku: 'TS-PREM-001-GRY', price: '12.50', color: 'Gray' },
    { id: 3, preview: productImages[0], sku: 'TS-PREM-001-RED', price: '12.50', color: 'Red' },
  ];

  const pricingStructure = [
    { qty: '7+', blankCost: 12.50, decorationCost: 2.99, totalCost: 15.49, margin: 50, sellingPrice: 24.99 },
    { qty: '15+', blankCost: 12.50, decorationCost: 2.99, totalCost: 15.49, margin: 50, sellingPrice: 24.99 },
    { qty: '30+', blankCost: 12.50, decorationCost: 2.99, totalCost: 15.49, margin: 50, sellingPrice: 24.99 },
    { qty: '75+', blankCost: 11.99, decorationCost: 2.79, totalCost: 14.78, margin: 51, sellingPrice: 23.99 },
    { qty: '150+', blankCost: 11.50, decorationCost: 2.59, totalCost: 14.09, margin: 52, sellingPrice: 22.99 },
    { qty: '300+', blankCost: 10.99, decorationCost: 2.49, totalCost: 13.48, margin: 54, sellingPrice: 21.99 },
    { qty: '600+', blankCost: 10.50, decorationCost: 2.39, totalCost: 12.89, margin: 55, sellingPrice: 20.99 },
    { qty: '1000+', blankCost: 9.99, decorationCost: 2.29, totalCost: 12.28, margin: 57, sellingPrice: 19.99 },
  ];

  const documents = [
    { id: 1, name: 'Product Spec Sheet - Premium Cotton T-Shirt', date: '1/28/2026' },
    { id: 2, name: 'Safety Certification Document', date: '1/15/2026' },
  ];

  const toggleDecorationMethod = (method: string) => {
    setDecorationMethods(prev => 
      prev.includes(method) 
        ? prev.filter(m => m !== method)
        : [...prev, method]
    );
  };

  const toggleImprintLocation = (location: string) => {
    setImprintLocations(prev => 
      prev.includes(location) 
        ? prev.filter(l => l !== location)
        : [...prev, location]
    );
  };

  const addCustomLocation = () => {
    if (customLocation.trim()) {
      setImprintLocations(prev => [...prev, customLocation.trim()]);
      setCustomLocation('');
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm">
        <motion.button
          whileHover={{ x: -4 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="flex items-center gap-2 text-slate-700 hover:text-slate-900 font-semibold transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Products
        </motion.button>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onBack}
            className="px-6 py-2.5 border-2 border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all"
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSave}
            className="px-6 py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-all shadow-lg"
          >
            Save Changes
          </motion.button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-8 py-6 bg-white border-b border-slate-200">
        <div className="max-w-[1800px] mx-auto grid grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 border-2 border-blue-200"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-blue-700">Total Variants</div>
                <div className="text-2xl font-black text-blue-900">{variants.length}</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-5 border-2 border-purple-200"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                <Box className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-purple-700">Color Options</div>
                <div className="text-2xl font-black text-purple-900">3</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 border-2 border-green-200"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">$</span>
              </div>
              <div>
                <div className="text-sm font-semibold text-green-700">Avg Price</div>
                <div className="text-2xl font-black text-green-900">$12.50</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-5 border-2 border-orange-200"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-orange-700">Starting At</div>
                <div className="text-2xl font-black text-orange-900">$12.50</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1800px] mx-auto p-8">
          <div className="grid grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Product Gallery */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-6 shadow-lg border border-slate-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-black text-slate-900">Product Gallery</h3>
                  <span className="px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full">Featured</span>
                </div>
                
                {/* Main Image */}
                <div className="relative bg-slate-100 rounded-2xl overflow-hidden mb-4 aspect-square flex items-center justify-center">
                  <img 
                    src={productImages[selectedImage]} 
                    alt="Product" 
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Thumbnails */}
                <div className="flex gap-2 mb-4">
                  {productImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`w-20 h-20 rounded-xl overflow-hidden border-3 transition-all ${
                        selectedImage === idx 
                          ? 'border-cyan-500 shadow-lg scale-105' 
                          : 'border-slate-200 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`Variant ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                  <button className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center hover:border-cyan-500 hover:bg-cyan-50 transition-all">
                    <Plus className="w-6 h-6 text-slate-400" />
                  </button>
                </div>

                <button className="w-full py-3 border-2 border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Image
                </button>
                <p className="text-xs text-slate-500 text-center mt-2">
                  Drag & drop or click to add up to 10 images
                </p>
              </motion.div>

              {/* Documents & Spec Sheets */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-3xl p-6 shadow-lg border border-slate-200"
              >
                <h3 className="text-lg font-black text-slate-900 mb-4">Documents & Spec Sheets</h3>
                
                <div className="space-y-2 mb-4">
                  {documents.map(doc => (
                    <div key={doc.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-slate-900 truncate">{doc.name}</div>
                        <div className="text-xs text-slate-500">{doc.date}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <button className="w-full py-3 border-2 border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Document
                </button>
                <p className="text-xs text-slate-500 text-center mt-2">
                  Upload spec sheets, certifications, and documents
                </p>
              </motion.div>
            </div>

            {/* Middle Column */}
            <div className="space-y-6">
              {/* General Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-6 shadow-lg border border-slate-200"
              >
                <h3 className="text-lg font-black text-slate-900 mb-4">General Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2">Product Name</label>
                    <input 
                      type="text" 
                      defaultValue={product.name}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-2">Base SKU</label>
                      <input 
                        type="text" 
                        defaultValue={product.sku}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-2">Brand</label>
                      <input 
                        type="text" 
                        defaultValue="Premium Apparel"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2">Product Link</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        defaultValue="www.example.com"
                        className="w-full px-4 py-2.5 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                      />
                      <ExternalLink className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2">Description</label>
                    <textarea 
                      defaultValue={product.description}
                      rows={4}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all resize-none"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Categorization */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-white rounded-3xl p-6 shadow-lg border border-slate-200"
              >
                <h3 className="text-lg font-black text-slate-900 mb-4">Categorization</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-2">Category</label>
                      <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all appearance-none">
                        <option value="Apparel">Apparel</option>
                        <option value="Drinkware">Drinkware</option>
                        <option value="Tech">Tech Accessories</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-2">Subcategory</label>
                      <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all appearance-none">
                        <option value="T-Shirts">T-Shirts</option>
                        <option value="Hoodies">Hoodies</option>
                        <option value="Polos">Polos</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2">Status</label>
                    <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all appearance-none">
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Discontinued">Discontinued</option>
                    </select>
                  </div>
                </div>
              </motion.div>

              {/* Catalog Display Settings */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-3xl p-6 shadow-lg border border-slate-200"
              >
                <h3 className="text-lg font-black text-slate-900 mb-4">Catalog Display Settings</h3>
                
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-3">Where should this product display?</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-all">
                      <input 
                        type="checkbox" 
                        checked={catalogDisplays.bulkSwag}
                        onChange={(e) => setCatalogDisplays({...catalogDisplays, bulkSwag: e.target.checked})}
                        className="w-5 h-5 rounded border-2 border-slate-300 text-cyan-600 focus:ring-2 focus:ring-cyan-500/20"
                      />
                      <span className="text-sm font-semibold text-slate-900">Bulk Swag Catalog</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-all">
                      <input 
                        type="checkbox" 
                        checked={catalogDisplays.buildABox}
                        onChange={(e) => setCatalogDisplays({...catalogDisplays, buildABox: e.target.checked})}
                        className="w-5 h-5 rounded border-2 border-slate-300 text-cyan-600 focus:ring-2 focus:ring-cyan-500/20"
                      />
                      <span className="text-sm font-semibold text-slate-900">Build a Box Catalog</span>
                    </label>
                  </div>
                </div>
              </motion.div>

              {/* Decoration Methods */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white rounded-3xl p-6 shadow-lg border border-slate-200"
              >
                <h3 className="text-lg font-black text-slate-900 mb-4">Decoration Methods</h3>
                
                <div className="grid grid-cols-3 gap-2">
                  {decorationMethodsList.map(method => (
                    <button
                      key={method}
                      onClick={() => toggleDecorationMethod(method)}
                      className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                        decorationMethods.includes(method)
                          ? 'bg-cyan-600 text-white shadow-lg'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Imprint Locations */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-3xl p-6 shadow-lg border border-slate-200"
              >
                <h3 className="text-lg font-black text-slate-900 mb-4">Imprint Locations</h3>
                
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {imprintLocationsList.map(location => (
                    <button
                      key={location}
                      onClick={() => toggleImprintLocation(location)}
                      className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                        imprintLocations.includes(location)
                          ? 'bg-slate-900 text-white shadow-lg'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {location}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">Custom Location</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={customLocation}
                      onChange={(e) => setCustomLocation(e.target.value)}
                      placeholder="e.g., Left Hip, Tag"
                      className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                    />
                    <button 
                      onClick={addCustomLocation}
                      className="px-4 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {imprintLocations.length > 0 && (
                  <div className="mt-4">
                    <div className="text-xs font-bold text-slate-600 mb-2">Selected ({imprintLocations.length})</div>
                    <div className="flex flex-wrap gap-2">
                      {imprintLocations.map(location => (
                        <span 
                          key={location}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white text-sm font-semibold rounded-lg"
                        >
                          {location}
                          <button 
                            onClick={() => toggleImprintLocation(location)}
                            className="hover:bg-white/20 rounded-full p-0.5 transition-all"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Production */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-6 shadow-lg border border-slate-200"
              >
                <h3 className="text-lg font-black text-slate-900 mb-4">Production</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2">Vendor Type</label>
                    <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all appearance-none">
                      <option value="Supplier">Supplier</option>
                      <option value="Manufacturer">Manufacturer</option>
                      <option value="Distributor">Distributor</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2">Production Time</label>
                    <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all appearance-none">
                      <option value="3 Days">3 Days</option>
                      <option value="5 Days">5 Days</option>
                      <option value="7 Days">7 Days</option>
                      <option value="14 Days">14 Days</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2">Origin</label>
                    <input 
                      type="text" 
                      defaultValue="United States"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Packaging Specs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-white rounded-3xl p-6 shadow-lg border border-slate-200"
              >
                <h3 className="text-lg font-black text-slate-900 mb-4">Packaging Specs</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2">Dimensions</label>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="relative">
                        <input 
                          type="number" 
                          placeholder="25"
                          className="w-full px-3 py-2.5 pr-8 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-semibold">in</span>
                      </div>
                      <div className="relative">
                        <input 
                          type="number" 
                          placeholder="10"
                          className="w-full px-3 py-2.5 pr-8 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-semibold">in</span>
                      </div>
                      <div className="relative">
                        <input 
                          type="number" 
                          placeholder="10"
                          className="w-full px-3 py-2.5 pr-8 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-semibold">in</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2">Case Weight</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        placeholder="30"
                        className="w-full px-4 py-2.5 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500 font-semibold">lb</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2">Storage Size</label>
                    <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all appearance-none">
                      <option value="Small">Small</option>
                      <option value="Medium">Medium</option>
                      <option value="Large">Large</option>
                      <option value="X-Large">X-Large</option>
                    </select>
                  </div>
                </div>
              </motion.div>

              {/* Product Options & Variants */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-3xl p-6 shadow-lg border border-slate-200"
              >
                <h3 className="text-lg font-black text-slate-900 mb-4">Product Options & Variants</h3>
                
                <div className="mb-4">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="e.g., Color, Size"
                      className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                    />
                    <button className="px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all">
                      Add
                    </button>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <div className="bg-slate-50 px-4 py-3 flex items-center justify-between border-b border-slate-200">
                    <div className="text-sm font-bold text-slate-900">SKU Variants ({variants.length})</div>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {variants.map(variant => (
                      <div key={variant.id} className="px-4 py-3 flex items-center gap-4 hover:bg-slate-50 transition-all">
                        <img 
                          src={variant.preview} 
                          alt={variant.sku} 
                          className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-slate-900">{variant.sku}</div>
                          <div className="text-xs text-slate-500">{variant.color}</div>
                        </div>
                        <div className="text-sm font-bold text-slate-900">${variant.price}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Pricing Structure - Full Width */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 bg-white rounded-3xl p-6 shadow-lg border border-slate-200"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-slate-900">Pricing Structure</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-600">Default Margin:</span>
                <span className="text-lg font-black text-slate-900">50%</span>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Quantity</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Blank Cost</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Decoration Cost</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Total Cost</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Margin %</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase">Selling Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pricingStructure.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-all">
                      <td className="px-4 py-3 text-sm font-semibold text-slate-900">{row.qty}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">${row.blankCost.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">${row.decorationCost.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-900">${row.totalCost.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{row.margin}%</td>
                      <td className="px-4 py-3 text-sm font-bold text-green-600">${row.sellingPrice.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
