import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Building2, Mail, Phone, MapPin, Globe, DollarSign, FileText, ShoppingCart, Calendar, Edit, Trash2, Package, TrendingUp, Download, Upload, File, X, AlertTriangle, Plus, Loader2, Check, Save, User, CreditCard, Hash, MessageSquare, Pencil, Navigation, Copy, MoreVertical, ChevronDown, Users, Star, Tag, Eye, Grid3X3, List, Search, ArrowUpDown, ArrowUp, ArrowDown, Printer, Truck, Shield, Zap, Target, Clock, ThumbsUp, ThumbsDown, BarChart3 } from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { ContractPricingTab } from './ContractPricingTab';
import { VendorScorecardTab } from './VendorScorecardTab';
import { PurchaseOrderDetailView } from './PurchaseOrderDetailView';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// Endpoints that aren't yet wired in the current backend return 404 and the
// UI renders empty-state panels. publicAnonKey kept as a no-op placeholder so
// the original Authorization headers still assemble without a TypeError.
const API_URL = '/api';
const publicAnonKey = '';

// Map a raw DB vendor record (vendorName/vendorType) to the UI shape (name/type)
function mapVendorFromApi(v: any): any {
  if (!v) return v;
  return {
    ...v,
    id: v.id ?? v._id,
    name: v.name ?? v.vendorName ?? '',
    type: v.type ?? v.vendorType ?? '',
    contact: v.contact ?? v.contactName ?? '',
    logo: v.logo ?? '',
    status: v.status ?? 'Active',
    location: v.location ?? null,
    products: v.products ?? (Array.isArray(v.productsSupplied) ? v.productsSupplied.join(', ') : ''),
    netTerms: v.netTerms ?? v.paymentTerms ?? '',
    totalSpend: v.totalSpend ?? '',
  };
}

// Map UI-shape edits back to DB field names before PATCH.
function mapVendorPatchToApi(patch: any): any {
  const out: any = { ...patch };
  if ('name' in out) { out.vendorName = out.name; delete out.name; }
  if ('type' in out) { out.vendorType = out.type; delete out.type; }
  return out;
}

interface VendorAddress {
  id: string;
  label: string;
  customLabel?: string;
  contactPerson?: string;
  name?: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isPrimary?: boolean;
}

interface Vendor {
  id: string;
  name: string;
  contact: string;
  logo: string;
  status: string;
  type: string;
  location: { city: string; region: string } | null;
  products: string;
  netTerms: string;
  totalSpend: string;
  contactName?: string;
  email?: string;
  phone?: string;
  wechatId?: string;
  website?: string;
  accountType?: string;
  paymentTerms?: string;
  accountNumber?: string;
  productsSupplied?: string[];
  notes?: string;
  addresses?: VendorAddress[];
  country?: string;
  fobCity?: string;
  fobState?: string;
  supportsDropShipping?: boolean;
}

interface VendorDoc {
  id: string;
  vendorId: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  createdAt?: string;
  preview?: string;
  uploadedBy?: string;
}

interface VendorPO {
  id: string;
  poNumber: string;
  poDate?: string;
  createdAt?: string;
  vendor: string;
  total: number;
  status: string;
  items?: any[];
  lineItems?: any[];
  project?: string;
  customer?: string;
  shipDate?: string | null;
  inHandsDate?: string;
  priority?: string;
  contact?: string;
  contacts?: any[];
  shipToAddresses?: any[];
  destinations?: any[];
  isSample?: boolean;
  sampleType?: string;
  variants?: any[];
  paymentTerms?: string;
  notes?: string;
  projectNumber?: string;
  orderNumber?: string;
  sourceOrderId?: string;
  additionalNotes?: string;
  competitorLink?: string;
  productId?: string;
  vendorId?: string;
  contactId?: string;
  shippingCost?: number;
  blindShip?: boolean;
  carrierAccount?: string;
  shippingMethod?: string;
}

interface VendorInvoice {
  id: string;
  vendorId: string;
  date: string;
  dueDate: string;
  amount: number;
  status: string;
  poId?: string;
}

interface VendorActivity {
  id: string;
  vendorId: string;
  date: string;
  type: string;
  description: string;
  amount?: number | null;
  createdAt?: string;
}

interface VendorContact {
  id: string;
  vendorId: string;
  name: string;
  firstName?: string;
  lastName?: string;
  title: string;
  email: string;
  phone: string;
  wechatId?: string;
  department: string;
  isPrimary: boolean;
  notes: string;
  createdAt?: string;
  updatedAt?: string;
}

interface VendorProduct {
  id: string;
  name: string;
  sku?: string;
  category?: string;
  subcategory?: string;
  vendor?: string;
  status?: string;
  basePrice?: number;
  image?: string;
  description?: string;
}

interface VendorDetailViewProps {
  vendor: Vendor;
  onBack: () => void;
  onDelete: () => void;
  onVendorUpdated?: (vendor: Vendor) => void;
}

const VENDOR_STATUSES = ['Active', 'Inactive', 'Pending'];
const VENDOR_TYPES = ['Product Distributor', 'Apparel Distributor', 'Decorator', 'Promo Supplier', 'Product Manufacturer'];
const ACCOUNT_TYPES = ['Standalone', 'Parent Company', 'Subsidiary'];
const PAYMENT_TERMS = ['Prepaid', 'Net 15', 'Net 30', 'Net 45', 'Net 60', 'Net 90', '30/70', '50/50'];
const ADDRESS_TYPES = ['Billing', 'FOB', 'Warehouse', 'Headquarters', 'Other'];
const DOCUMENT_TYPES = ['Contract', 'Catalog', 'Certificate', 'Insurance', 'Tax Document', 'Invoice', 'Compliance', 'Other'];
const COUNTRIES = ['United States', 'China', 'Vietnam', 'India'];

interface LocationConfig {
  regionLabel: string;
  regionPlaceholder: string;
  regions: string[];
  cityPlaceholder: string;
  zipLabel: string;
  zipPlaceholder: string;
}

function getLocationConfig(country: string): LocationConfig {
  switch (country) {
    case 'China':
      return {
        regionLabel: 'Province',
        regionPlaceholder: 'Select province',
        regions: ['Anhui', 'Beijing', 'Chongqing', 'Fujian', 'Gansu', 'Guangdong', 'Guangxi', 'Guizhou', 'Hainan', 'Hebei', 'Heilongjiang', 'Henan', 'Hubei', 'Hunan', 'Inner Mongolia', 'Jiangsu', 'Jiangxi', 'Jilin', 'Liaoning', 'Ningxia', 'Qinghai', 'Shaanxi', 'Shandong', 'Shanghai', 'Shanxi', 'Sichuan', 'Tianjin', 'Tibet', 'Xinjiang', 'Yunnan', 'Zhejiang'],
        cityPlaceholder: 'Shenzhen',
        zipLabel: 'Postal Code',
        zipPlaceholder: '518000',
      };
    case 'Vietnam':
      return {
        regionLabel: 'Province',
        regionPlaceholder: 'Select province',
        regions: ['An Giang', 'Ba Ria-Vung Tau', 'Bac Giang', 'Bac Kan', 'Bac Lieu', 'Bac Ninh', 'Ben Tre', 'Binh Dinh', 'Binh Duong', 'Binh Phuoc', 'Binh Thuan', 'Ca Mau', 'Can Tho', 'Cao Bang', 'Da Nang', 'Dak Lak', 'Dak Nong', 'Dien Bien', 'Dong Nai', 'Dong Thap', 'Gia Lai', 'Ha Giang', 'Ha Nam', 'Ha Noi', 'Ha Tinh', 'Hai Duong', 'Hai Phong', 'Hau Giang', 'Ho Chi Minh', 'Hoa Binh', 'Hung Yen', 'Khanh Hoa', 'Kien Giang', 'Kon Tum', 'Lai Chau', 'Lam Dong', 'Lang Son', 'Lao Cai', 'Long An', 'Nam Dinh', 'Nghe An', 'Ninh Binh', 'Ninh Thuan', 'Phu Tho', 'Phu Yen', 'Quang Binh', 'Quang Nam', 'Quang Ngai', 'Quang Ninh', 'Quang Tri', 'Soc Trang', 'Son La', 'Tay Ninh', 'Thai Binh', 'Thai Nguyen', 'Thanh Hoa', 'Thua Thien Hue', 'Tien Giang', 'Tra Vinh', 'Tuyen Quang', 'Vinh Long', 'Vinh Phuc', 'Yen Bai'],
        cityPlaceholder: 'Ho Chi Minh City',
        zipLabel: 'Postal Code',
        zipPlaceholder: '700000',
      };
    case 'India':
      return {
        regionLabel: 'State',
        regionPlaceholder: 'Select state',
        regions: ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'],
        cityPlaceholder: 'Mumbai',
        zipLabel: 'PIN Code',
        zipPlaceholder: '400001',
      };
    case 'United States':
    default:
      return {
        regionLabel: 'State',
        regionPlaceholder: 'Select state',
        regions: ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'],
        cityPlaceholder: 'Los Angeles',
        zipLabel: 'ZIP Code',
        zipPlaceholder: '90001',
      };
  }
}

const EMPTY_ADDRESS: VendorAddress = {
  id: '',
  label: 'Billing',
  customLabel: '',
  contactPerson: '',
  name: '',
  street1: '',
  street2: '',
  city: '',
  state: '',
  zip: '',
  country: 'United States',
  isPrimary: false,
};

// ─── Address Modal Body (extracted for reuse) ───
function AddressModalBody({ addressForm, setAddressForm }: { addressForm: VendorAddress; setAddressForm: (fn: any) => void }) {
  const locConfig = getLocationConfig(addressForm.country);
  const [stateDropdownOpen, setStateDropdownOpen] = useState(false);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const stateRef = useRef<HTMLDivElement>(null);
  const countryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (stateRef.current && !stateRef.current.contains(e.target as Node)) setStateDropdownOpen(false);
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) setCountryDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="p-6 space-y-4 overflow-y-auto flex-1">
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Address Type</label>
        <div className="flex flex-wrap gap-2">
          {ADDRESS_TYPES.map(t => (
            <button key={t} type="button" onClick={() => setAddressForm({ ...addressForm, label: t, ...(t !== 'Other' ? { customLabel: '' } : {}) })} className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${addressForm.label === t ? 'bg-amber-100 text-amber-700 border-amber-300' : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300'}`}>{t}</button>
          ))}
        </div>
        <AnimatePresence>
          {addressForm.label === 'Other' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.15 }}>
              <input type="text" placeholder="Enter custom address type" value={addressForm.customLabel || ''} onChange={e => setAddressForm({ ...addressForm, customLabel: e.target.value })} className="w-full mt-2 px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all" autoFocus />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Contact Person</label>
        <input type="text" placeholder="e.g. John Smith" value={addressForm.contactPerson || ''} onChange={e => setAddressForm({ ...addressForm, contactPerson: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all" />
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Address Name</label>
        <input type="text" placeholder="e.g. Main Office, Factory #2" value={addressForm.name || ''} onChange={e => setAddressForm({ ...addressForm, name: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all" />
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Street Address</label>
        <input type="text" placeholder="123 Main Street" value={addressForm.street1} onChange={e => setAddressForm({ ...addressForm, street1: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all" />
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Street Address Line 2</label>
        <input type="text" placeholder="Suite 200, Building A" value={addressForm.street2 || ''} onChange={e => setAddressForm({ ...addressForm, street2: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">City</label>
          <input type="text" placeholder={locConfig.cityPlaceholder} value={addressForm.city} onChange={e => setAddressForm({ ...addressForm, city: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all" />
        </div>
        <div className="relative" ref={stateRef}>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">{locConfig.regionLabel}</label>
          <button
            type="button"
            onClick={() => setStateDropdownOpen(!stateDropdownOpen)}
            className={`w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium transition-all ${stateDropdownOpen ? 'ring-2 ring-amber-500/30 border-amber-500' : ''}`}
          >
            <span className={addressForm.state ? 'text-slate-900' : 'text-slate-400'}>{addressForm.state || locConfig.regionPlaceholder}</span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${stateDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {stateDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.12 }}
                className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl border border-slate-200 shadow-2xl z-50 overflow-hidden max-h-48 overflow-y-auto"
              >
                <div className="py-1">
                  {locConfig.regions.map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => { setAddressForm({ ...addressForm, state: r }); setStateDropdownOpen(false); }}
                      className={`w-full flex items-center justify-between px-4 py-2 text-sm font-medium transition-colors ${addressForm.state === r ? 'bg-amber-50 text-amber-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'}`}
                    >
                      <span>{r}</span>
                      {addressForm.state === r && <Check className="w-4 h-4 text-amber-600" />}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">{locConfig.zipLabel}</label>
          <input type="text" placeholder={locConfig.zipPlaceholder} value={addressForm.zip} onChange={e => setAddressForm({ ...addressForm, zip: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all" />
        </div>
        <div className="relative" ref={countryRef}>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Country</label>
          <button
            type="button"
            onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
            className={`w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium transition-all ${countryDropdownOpen ? 'ring-2 ring-amber-500/30 border-amber-500' : ''}`}
          >
            <span className={addressForm.country ? 'text-slate-900' : 'text-slate-400'}>{addressForm.country || 'Select country'}</span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${countryDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {countryDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.12 }}
                className="absolute bottom-full left-0 right-0 mb-1.5 bg-white rounded-xl border border-slate-200 shadow-2xl z-50 overflow-hidden"
              >
                <div className="py-1">
                  {COUNTRIES.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => { setAddressForm({ ...addressForm, country: c, state: '' }); setCountryDropdownOpen(false); }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium transition-colors ${addressForm.country === c ? 'bg-amber-50 text-amber-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'}`}
                    >
                      <span>{c}</span>
                      {addressForm.country === c && <Check className="w-4 h-4 text-amber-600" />}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <label className="flex items-center gap-3 py-2 cursor-pointer">
        <div onClick={() => setAddressForm({ ...addressForm, isPrimary: !addressForm.isPrimary })} className={`w-10 h-6 rounded-full transition-colors relative ${addressForm.isPrimary ? 'bg-purple-500' : 'bg-slate-300'}`}>
          <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${addressForm.isPrimary ? 'left-[18px]' : 'left-0.5'}`} />
        </div>
        <span className="text-sm font-semibold text-slate-700">Set as primary address</span>
      </label>
    </div>
  );
}

export function VendorDetailView({ vendor, onBack, onDelete, onVendorUpdated }: VendorDetailViewProps) {
  // ─── Vendor data state ───
  const [vendorData, setVendorData] = useState<Vendor>(vendor);
  const [loadingVendor, setLoadingVendor] = useState(false);

  // ─── Inline editing state ───
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // ─── Address state ───
  const [addresses, setAddresses] = useState<VendorAddress[]>(vendor.addresses || []);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<VendorAddress | null>(null);
  const [addressForm, setAddressForm] = useState<VendorAddress>({ ...EMPTY_ADDRESS });
  const [deleteAddress, setDeleteAddress] = useState<VendorAddress | null>(null);

  // ─── Document state ───
  const [documents, setDocuments] = useState<VendorDoc[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadDocType, setUploadDocType] = useState('Other');
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadCustomType, setUploadCustomType] = useState('');
  const [uploadDocTitle, setUploadDocTitle] = useState('');
  const [deleteDoc, setDeleteDoc] = useState<VendorDoc | null>(null);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Purchase Orders state ───
  const [purchaseOrders, setPurchaseOrders] = useState<VendorPO[]>([]);
  const [loadingPOs, setLoadingPOs] = useState(false);
  const [selectedPO, setSelectedPO] = useState<VendorPO | null>(null);
  const [poSearch, setPoSearch] = useState('');
  const [poStatusFilter, setPoStatusFilter] = useState<string>('All');
  const [poSortField, setPoSortField] = useState<string>('poDate');
  const [poSortDir, setPoSortDir] = useState<'asc' | 'desc'>('desc');
  const [poStatusDropdownOpen, setPoStatusDropdownOpen] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState<string | null>(null);
  const poStatusDropdownRef = useRef<HTMLDivElement>(null);
  const poPdfRef = useRef<HTMLDivElement>(null);

  // ─── Invoices state ───
  const [invoices, setInvoices] = useState<VendorInvoice[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);

  // ─── Activity state ───
  const [recentActivity, setRecentActivity] = useState<VendorActivity[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(false);

  // ─── Contacts state ───
  const [vendorContacts, setVendorContacts] = useState<VendorContact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [editingContact, setEditingContact] = useState<VendorContact | null>(null);
  const [deleteContact, setDeleteContact] = useState<VendorContact | null>(null);
  const [savingContact, setSavingContact] = useState(false);
  const [contactForm, setContactForm] = useState({ firstName: '', lastName: '', title: '', email: '', phone: '', wechatId: '', department: '', isPrimary: false });

  // ─── Products state ───
  const [vendorProducts, setVendorProducts] = useState<VendorProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productViewMode, setProductViewMode] = useState<'grid' | 'list'>('grid');

  // ─── Active tab ───
  const [activeTab, setActiveTab] = useState('overview');

  // ─── Pagination state ─��─
  const [addrPage, setAddrPage] = useState(1);
  const [poPage, setPoPage] = useState(1);
  const [invPage, setInvPage] = useState(1);
  const [docPage, setDocPage] = useState(1);
  const [contactPage, setContactPage] = useState(1);
  const [productPage, setProductPage] = useState(1);
  const [contactRowsPerPage, setContactRowsPerPage] = useState(10);
  const [addrRowsPerPage, setAddrRowsPerPage] = useState(10);
  const ROWS_PER_PAGE = 10;

  // ─── Fetch full vendor from API ───
  const fetchVendor = useCallback(async () => {
    setLoadingVendor(true);
    try {
      const res = await fetch(`/api/vendors/get?id=${encodeURIComponent(vendor.id)}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      if (data.vendor) {
        const mapped = mapVendorFromApi(data.vendor);
        setVendorData(mapped);
        setAddresses(mapped.addresses || []);
        setVendorContacts(mapped.contacts || []);
        setDocuments(mapped.documents || []);
      }
    } catch (error) {
      console.error('Error fetching vendor:', error);
    } finally {
      setLoadingVendor(false);
    }
  }, [vendor.id]);

  useEffect(() => {
    fetchVendor();
  }, [fetchVendor]);

  // Documents live on vendor.documents — populated by fetchVendor. Expose a
  // refetch helper that simply re-pulls the vendor doc so the UI can refresh.
  const fetchDocuments = useCallback(async () => {
    setLoadingDocs(true);
    try {
      const res = await fetch(`/api/vendors/get?id=${encodeURIComponent(vendor.id)}`);
      if (res.ok) {
        const data = await res.json();
        setDocuments((data.vendor?.documents) || []);
      }
    } catch (error) {
      console.error('Error fetching vendor documents:', error);
    } finally {
      setLoadingDocs(false);
    }
  }, [vendor.id]);

  // ─── Fetch purchase orders ───
  const fetchPurchaseOrders = useCallback(async () => {
    setLoadingPOs(true);
    try {
      const res = await fetch(`${API_URL}/vendors/${vendor.id}/purchase-orders`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` },
      });
      const data = await res.json();
      if (data.success) {
        setPurchaseOrders(data.purchaseOrders || []);
      }
    } catch (error) {
      console.error('Error fetching vendor purchase orders:', error);
    } finally {
      setLoadingPOs(false);
    }
  }, [vendor.id]);

  useEffect(() => {
    fetchPurchaseOrders();
  }, [fetchPurchaseOrders]);

  // ─── Fetch invoices ───
  const fetchInvoices = useCallback(async () => {
    setLoadingInvoices(true);
    try {
      const res = await fetch(`${API_URL}/vendors/${vendor.id}/invoices`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` },
      });
      const data = await res.json();
      if (data.success) {
        setInvoices(data.invoices || []);
      }
    } catch (error) {
      console.error('Error fetching vendor invoices:', error);
    } finally {
      setLoadingInvoices(false);
    }
  }, [vendor.id]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  // ─── Fetch activity ───
  const fetchActivity = useCallback(async () => {
    setLoadingActivity(true);
    try {
      const res = await fetch(`${API_URL}/vendors/${vendor.id}/activity`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` },
      });
      const data = await res.json();
      if (data.success) {
        setRecentActivity(data.activities || []);
      }
    } catch (error) {
      console.error('Error fetching vendor activity:', error);
    } finally {
      setLoadingActivity(false);
    }
  }, [vendor.id]);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  // ─── Fetch vendor contacts ───
  // Contacts live on vendor.contacts — re-pull the vendor doc after a change.
  const fetchContacts = useCallback(async () => {
    setLoadingContacts(true);
    try {
      const res = await fetch(`/api/vendors/get?id=${encodeURIComponent(vendor.id)}`);
      if (res.ok) {
        const data = await res.json();
        setVendorContacts((data.vendor?.contacts) || []);
      }
    } catch (error) {
      console.error('Error fetching vendor contacts:', error);
    } finally {
      setLoadingContacts(false);
    }
  }, [vendor.id]);

  // ─── Fetch vendor products ───
  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const res = await fetch(`${API_URL}/vendors/${vendor.id}/products`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` },
      });
      const data = await res.json();
      if (data.success) {
        setVendorProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error fetching vendor products:', error);
    } finally {
      setLoadingProducts(false);
    }
  }, [vendor.id]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ─── Save vendor updates ───
  const saveVendorField = async (updates: Record<string, any>) => {
    setSaving(true);
    try {
      const res = await fetch('/api/vendors/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: vendor.id, ...mapVendorPatchToApi(updates) }),
      });
      if (!res.ok) throw new Error('Failed to save');
      const nextVendor = { ...vendorData, ...updates };
      setVendorData(nextVendor);
      if (updates.addresses) setAddresses(updates.addresses);
      onVendorUpdated?.(nextVendor);
      setSaveSuccess(editingSection);
      setTimeout(() => setSaveSuccess(null), 2000);
      toast.success('Vendor updated successfully');
    } catch (error) {
      console.error('Error saving vendor:', error);
      toast.error('Error saving vendor');
    } finally {
      setSaving(false);
      setEditingSection(null);
    }
  };

  // ─── Start editing a section ───
  const startEditing = (section: string) => {
    if (section === 'info') {
      setEditForm({
        name: vendorData.name || '',
        contactName: vendorData.contactName || vendorData.contact || '',
        email: vendorData.email || '',
        phone: vendorData.phone || '',
        wechatId: vendorData.wechatId || '',
        website: vendorData.website || '',
        status: vendorData.status || 'Active',
        type: vendorData.type || 'Distributor',
        accountType: vendorData.accountType || 'Standalone',
        paymentTerms: vendorData.paymentTerms || '',
        accountNumber: vendorData.accountNumber || '',
        notes: vendorData.notes || '',
        supportsDropShipping: vendorData.supportsDropShipping ?? true,
      });
    }
    setEditingSection(section);
  };

  const cancelEditing = () => {
    setEditingSection(null);
    setEditForm({});
  };

  const saveInfoEdits = () => {
    saveVendorField({
      name: editForm.name,
      contactName: editForm.contactName,
      contact: editForm.contactName,
      email: editForm.email,
      phone: editForm.phone,
      wechatId: editForm.wechatId,
      website: editForm.website,
      status: editForm.status,
      type: editForm.type,
      accountType: editForm.accountType,
      paymentTerms: editForm.paymentTerms,
      accountNumber: editForm.accountNumber,
      notes: editForm.notes,
      supportsDropShipping: editForm.supportsDropShipping,
    });
  };

  // ─── Address CRUD ───
  const openAddAddress = () => {
    setEditingAddress(null);
    setAddressForm({ ...EMPTY_ADDRESS, id: `addr-${Date.now()}` });
    setShowAddressModal(true);
  };

  const openEditAddress = (addr: VendorAddress) => {
    setEditingAddress(addr);
    setAddressForm({ ...addr });
    setShowAddressModal(true);
  };

  const saveAddress = async () => {
    setSaving(true);
    let newAddresses: VendorAddress[];
    if (editingAddress) {
      newAddresses = addresses.map(a => a.id === editingAddress.id ? { ...addressForm } : a);
    } else {
      newAddresses = [...addresses, { ...addressForm }];
    }
    if (addressForm.isPrimary) {
      newAddresses = newAddresses.map(a => ({ ...a, isPrimary: a.id === addressForm.id }));
    }
    try {
      const res = await fetch('/api/vendors/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: vendor.id, addresses: newAddresses }),
      });
      if (!res.ok) throw new Error('Failed to save address');
      setAddresses(newAddresses);
      setShowAddressModal(false);
      setEditingAddress(null);
      setSaveSuccess('addresses');
      setTimeout(() => setSaveSuccess(null), 2000);
      toast.success(editingAddress ? 'Address updated' : 'Address added');
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error('Error saving address');
    } finally {
      setSaving(false);
    }
  };

  const confirmDeleteAddress = async () => {
    if (!deleteAddress) return;
    setSaving(true);
    const newAddresses = addresses.filter(a => a.id !== deleteAddress.id);
    try {
      const res = await fetch('/api/vendors/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: vendor.id, addresses: newAddresses }),
      });
      if (!res.ok) throw new Error('Failed to delete address');
      setAddresses(newAddresses);
      setDeleteAddress(null);
      toast.success('Address deleted');
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error('Error deleting address');
    } finally {
      setSaving(false);
    }
  };

  // ─── Document handlers ───
  const handleUpload = async () => {
    if (uploadFiles.length === 0) return;
    setUploading(true);
    const resolvedType = uploadDocType === 'Other' && uploadCustomType.trim() ? uploadCustomType.trim() : uploadDocType;
    try {
      const newDocs: VendorDoc[] = [];
      for (const file of uploadFiles) {
        const sizeStr = file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${(file.size / 1024).toFixed(0)} KB`;

        // 1. Read file as base64.
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        const base64Data = dataUrl.split(',')[1] ?? '';
        const fileType = file.type || (dataUrl.match(/:(.*?);/)?.[1] ?? 'application/octet-stream');

        // 2. Upload bytes to S3.
        const uploadRes = await fetch('/api/files/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            fileType,
            entityType: 'vendor-document',
            entityId: vendor.id,
            fileData: base64Data,
          }),
        });
        if (!uploadRes.ok) throw new Error('File upload failed');
        const { key, fileUrl } = await uploadRes.json();

        const isImage = /\.(png|jpg|jpeg|gif|webp|svg|bmp)$/i.test(file.name);
        const docName = uploadDocTitle.trim() || file.name;
        newDocs.push({
          id: `DOC-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`,
          vendorId: vendor.id,
          name: docName,
          type: resolvedType,
          size: sizeStr,
          uploadDate: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString(),
          preview: isImage ? fileUrl : undefined,
          uploadedBy: 'Current User',
          fileKey: key,
          fileUrl,
          contentType: fileType,
        } as any);
      }

      // 3. Persist the combined documents array onto the vendor doc.
      const nextDocs = [...newDocs, ...documents];
      const patchRes = await fetch('/api/vendors/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: vendor.id, documents: nextDocs }),
      });
      if (!patchRes.ok) throw new Error('Failed to save document metadata');
      setDocuments(nextDocs);
      setShowUploadModal(false);
      setUploadFiles([]);
      setUploadDocType('Other');
      setUploadCustomType('');
      setUploadDocTitle('');
      toast.success('Document uploaded successfully');
    } catch (error) {
      console.error('Error uploading documents:', error);
      toast.error('Error uploading document');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDoc = async () => {
    if (!deleteDoc) return;
    setDeleting(true);
    try {
      const nextDocs = documents.filter(d => d.id !== deleteDoc.id);
      const res = await fetch('/api/vendors/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: vendor.id, documents: nextDocs }),
      });
      if (!res.ok) throw new Error('Failed to delete document');
      setDocuments(nextDocs);
      toast.success('Document deleted');
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Error deleting document');
    } finally {
      setDeleting(false);
      setDeleteDoc(null);
    }
  };

  const handleDownload = async (doc: VendorDoc) => {
    const fileKey = (doc as any).fileKey;
    const fileUrl = (doc as any).fileUrl || (fileKey ? `/api/files/image?key=${encodeURIComponent(fileKey)}` : null);
    if (!fileUrl) {
      toast.error('Document file is not available');
      return;
    }
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = doc.name;
    link.target = '_blank';
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ─── Helpers ───
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': case 'Delivered': case 'Paid': return 'bg-green-100 text-green-700 border-green-200';
      case 'In Production': case 'Shipped': case 'Pending': case 'Submitted': case 'Confirmed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Created': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'Issue': case 'Overdue': return 'bg-red-100 text-red-700 border-red-200';
      case 'Inactive': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getDocTypeColor = (type: string) => {
    switch (type) {
      case 'Contract': return 'text-blue-600 bg-blue-50';
      case 'Catalog': return 'text-purple-600 bg-purple-50';
      case 'Certificate': return 'text-green-600 bg-green-50';
      case 'Insurance': return 'text-amber-600 bg-amber-50';
      case 'Tax Document': return 'text-red-600 bg-red-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  const getAddressTypeColor = (label: string) => {
    switch (label) {
      case 'Billing': return 'bg-green-100 text-green-700';
      case 'FOB': return 'bg-blue-100 text-blue-700';
      case 'Warehouse': return 'bg-amber-100 text-amber-700';
      case 'Office': return 'bg-purple-100 text-purple-700';
      case 'Shipping': return 'bg-cyan-100 text-cyan-700';
      case 'Manufacturing': return 'bg-red-100 text-red-700';
      case 'Headquarters': return 'bg-indigo-100 text-indigo-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const formatAddress = (addr: VendorAddress) => {
    const parts = [];
    if (addr.name) parts.push(addr.name);
    if (addr.street1) parts.push(addr.street1);
    if (addr.street2) parts.push(addr.street2);
    const cityState = [addr.city, addr.state].filter(Boolean).join(', ');
    if (cityState) parts.push(cityState);
    if (addr.zip) parts.push(addr.zip);
    if (addr.country) parts.push(addr.country);
    return parts;
  };

  // ─── PO helpers ───
  // Close PO status filter dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (poStatusDropdownRef.current && !poStatusDropdownRef.current.contains(e.target as Node)) {
        setPoStatusDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const poStatuses = ['All', ...Array.from(new Set(purchaseOrders.map(po => po.status).filter(Boolean)))];

  const filteredPOs = purchaseOrders
    .filter(po => {
      if (poStatusFilter !== 'All' && po.status !== poStatusFilter) return false;
      if (poSearch) {
        const q = poSearch.toLowerCase();
        return (
          (po.poNumber || '').toLowerCase().includes(q) ||
          (po.project || '').toLowerCase().includes(q) ||
          (po.customer || '').toLowerCase().includes(q) ||
          (po.status || '').toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      let aVal: any, bVal: any;
      switch (poSortField) {
        case 'poNumber': aVal = a.poNumber || ''; bVal = b.poNumber || ''; break;
        case 'poDate': aVal = a.poDate || a.createdAt || ''; bVal = b.poDate || b.createdAt || ''; break;
        case 'total': aVal = a.total || 0; bVal = b.total || 0; break;
        case 'status': aVal = a.status || ''; bVal = b.status || ''; break;
        case 'customer': aVal = a.customer || ''; bVal = b.customer || ''; break;
        case 'project': aVal = a.project || ''; bVal = b.project || ''; break;
        default: aVal = a.poDate || a.createdAt || ''; bVal = b.poDate || b.createdAt || '';
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return poSortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }
      const cmp = String(aVal).localeCompare(String(bVal));
      return poSortDir === 'asc' ? cmp : -cmp;
    });

  const togglePoSort = (field: string) => {
    if (poSortField === field) {
      setPoSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setPoSortField(field);
      setPoSortDir('desc');
    }
  };

  const PoSortIcon = ({ field }: { field: string }) => {
    if (poSortField !== field) return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />;
    return poSortDir === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-blue-600" /> : <ArrowDown className="w-3.5 h-3.5 text-blue-600" />;
  };

  const handlePODownloadPDF = async (po: VendorPO) => {
    setGeneratingPDF(po.id);
    try {
      // Build a clean PDF using jsPDF directly
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      let y = 20;

      // Header
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PURCHASE ORDER', pageWidth / 2, y, { align: 'center' });
      y += 12;

      // PO details
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const leftCol = 14;
      const rightCol = pageWidth / 2 + 10;

      pdf.setFont('helvetica', 'bold');
      pdf.text('PO Number:', leftCol, y);
      pdf.setFont('helvetica', 'normal');
      pdf.text(po.poNumber || po.id, leftCol + 30, y);

      pdf.setFont('helvetica', 'bold');
      pdf.text('Date:', rightCol, y);
      pdf.setFont('helvetica', 'normal');
      pdf.text(po.poDate || (po.createdAt ? new Date(po.createdAt).toLocaleDateString() : 'N/A'), rightCol + 20, y);
      y += 7;

      pdf.setFont('helvetica', 'bold');
      pdf.text('Status:', leftCol, y);
      pdf.setFont('helvetica', 'normal');
      pdf.text(po.status || 'N/A', leftCol + 30, y);

      pdf.setFont('helvetica', 'bold');
      pdf.text('Priority:', rightCol, y);
      pdf.setFont('helvetica', 'normal');
      pdf.text(po.priority || 'Normal', rightCol + 20, y);
      y += 7;

      pdf.setFont('helvetica', 'bold');
      pdf.text('Vendor:', leftCol, y);
      pdf.setFont('helvetica', 'normal');
      pdf.text(po.vendor || vendorData.name || 'N/A', leftCol + 30, y);

      pdf.setFont('helvetica', 'bold');
      pdf.text('Customer:', rightCol, y);
      pdf.setFont('helvetica', 'normal');
      pdf.text(po.customer || 'N/A', rightCol + 25, y);
      y += 7;

      if (po.project) {
        pdf.setFont('helvetica', 'bold');
        pdf.text('Project:', leftCol, y);
        pdf.setFont('helvetica', 'normal');
        pdf.text(po.project, leftCol + 30, y);
        y += 7;
      }

      if (po.inHandsDate) {
        pdf.setFont('helvetica', 'bold');
        pdf.text('In-Hands Date:', leftCol, y);
        pdf.setFont('helvetica', 'normal');
        pdf.text(po.inHandsDate, leftCol + 35, y);
        y += 7;
      }

      // Separator
      y += 5;
      pdf.setDrawColor(200, 200, 200);
      pdf.line(leftCol, y, pageWidth - 14, y);
      y += 10;

      // Line items table header
      const lineItems = po.lineItems || po.items || po.variants || [];
      if (lineItems.length > 0) {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.text('Line Items', leftCol, y);
        y += 8;

        // Table header
        pdf.setFontSize(9);
        pdf.setFillColor(245, 245, 245);
        pdf.rect(leftCol, y - 4, pageWidth - 28, 8, 'F');
        pdf.text('SKU', leftCol + 2, y);
        pdf.text('Description', leftCol + 30, y);
        pdf.text('Size/Color', leftCol + 85, y);
        pdf.text('Qty', leftCol + 120, y);
        pdf.text('Unit Price', leftCol + 138, y);
        pdf.text('Total', leftCol + 162, y);
        y += 8;

        pdf.setFont('helvetica', 'normal');
        lineItems.forEach((item: any) => {
          if (y > 270) {
            pdf.addPage();
            y = 20;
          }
          const sku = item.sku || '—';
          const desc = item.description || item.productName || item.name || '—';
          const sizeColor = [item.size, item.color].filter(Boolean).join(' / ') || '—';
          const qty = item.quantity || item.qty || 0;
          const unitPrice = item.unitPrice || item.costPerUnit || 0;
          const total = qty * unitPrice;

          pdf.text(sku.substring(0, 15), leftCol + 2, y);
          pdf.text(desc.substring(0, 30), leftCol + 30, y);
          pdf.text(sizeColor.substring(0, 18), leftCol + 85, y);
          pdf.text(String(qty), leftCol + 120, y);
          pdf.text(`$${unitPrice.toFixed(2)}`, leftCol + 138, y);
          pdf.text(`$${total.toFixed(2)}`, leftCol + 162, y);
          y += 6;
        });

        // Total line
        y += 4;
        pdf.line(leftCol + 130, y - 2, pageWidth - 14, y - 2);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.text('Total:', leftCol + 132, y + 4);
        pdf.text(`$${(po.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, leftCol + 162, y + 4);
      } else {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.text(`Total: $${(po.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, leftCol, y);
      }

      // Ship-to addresses
      const shipTo = po.shipToAddresses || [];
      if (shipTo.length > 0) {
        y += 15;
        if (y > 250) { pdf.addPage(); y = 20; }
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Ship To', leftCol, y);
        y += 7;
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        shipTo.forEach((addr: any) => {
          if (y > 270) { pdf.addPage(); y = 20; }
          const line = [addr.name, addr.address, [addr.city, addr.state, addr.zip].filter(Boolean).join(', '), addr.country].filter(Boolean).join(' · ');
          pdf.text(line.substring(0, 90), leftCol, y);
          y += 5;
        });
      }

      // Notes
      if (po.notes) {
        y += 10;
        if (y > 260) { pdf.addPage(); y = 20; }
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Notes:', leftCol, y);
        y += 6;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        const noteLines = pdf.splitTextToSize(po.notes, pageWidth - 28);
        pdf.text(noteLines, leftCol, y);
      }

      pdf.save(`PO_${po.poNumber || po.id}.pdf`);
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setGeneratingPDF(null);
    }
  };

  // ─── Contact handlers ───
  // Phone formatting helper: (xxx) xxx - xxxx
  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    if (digits.length === 0) return '';
    if (digits.length <= 3) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)} - ${digits.slice(6)}`;
  };

  const openContactModal = (contact?: VendorContact) => {
    if (contact) {
      setEditingContact(contact);
      const nameParts = (contact.name || '').trim().split(/\s+/);
      setContactForm({
        firstName: contact.firstName || nameParts[0] || '',
        lastName: contact.lastName || nameParts.slice(1).join(' ') || '',
        title: contact.title,
        email: contact.email,
        phone: contact.phone,
        wechatId: contact.wechatId || '',
        department: contact.department,
        isPrimary: contact.isPrimary,
      });
    } else {
      setEditingContact(null);
      setContactForm({ firstName: '', lastName: '', title: '', email: '', phone: '', wechatId: '', department: '', isPrimary: false });
    }
    setShowContactModal(true);
  };

  const handleSaveContact = async () => {
    if (!contactForm.firstName.trim()) { toast.error('First name is required'); return; }
    setSavingContact(true);
    try {
      const fullName = [contactForm.firstName, contactForm.lastName].filter(Boolean).join(' ');
      const now = new Date().toISOString();
      const base: VendorContact = editingContact
        ? {
            ...editingContact,
            ...contactForm,
            name: fullName,
            updatedAt: now,
          }
        : {
            id: `VC-${Date.now().toString(36).toUpperCase()}`,
            vendorId: vendor.id,
            ...contactForm,
            name: fullName,
            notes: '',
            createdAt: now,
            updatedAt: now,
          };

      // If this contact is marked primary, clear primary on all others.
      let nextContacts = editingContact
        ? vendorContacts.map(c => c.id === editingContact.id ? base : c)
        : [...vendorContacts, base];
      if (base.isPrimary) {
        nextContacts = nextContacts.map(c => ({ ...c, isPrimary: c.id === base.id }));
      }

      const res = await fetch('/api/vendors/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: vendor.id, contacts: nextContacts }),
      });
      if (!res.ok) throw new Error('Failed to save contact');
      setVendorContacts(nextContacts);
      toast.success(editingContact ? 'Contact updated' : 'Contact added');
      setShowContactModal(false);
      if (base.isPrimary) fetchVendor();
    } catch (error) {
      console.error('Error saving contact:', error);
      toast.error('Failed to save contact');
    } finally {
      setSavingContact(false);
    }
  };

  const handleDeleteContact = async (contact: VendorContact) => {
    try {
      const nextContacts = vendorContacts.filter(c => c.id !== contact.id);
      const res = await fetch('/api/vendors/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: vendor.id, contacts: nextContacts }),
      });
      if (!res.ok) throw new Error('Failed to delete contact');
      setVendorContacts(nextContacts);
      toast.success('Contact removed');
      setDeleteContact(null);
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast.error('Failed to delete contact');
    }
  };

  const isDecorator = vendorData.type === 'Decorator';

  // Computed stats from real data
  const totalPOValue = purchaseOrders.reduce((sum, po) => sum + (po.total || 0), 0);
  const totalInvoiceValue = invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const paidInvoices = invoices.filter(inv => inv.status === 'Paid').length;

  const v = vendorData;

  // ─── Editable field helper ───
  const InfoField = ({ icon: Icon, label, value, color = 'slate' }: { icon: any; label: string; value: string; color?: string }) => (
    <div className="flex items-start gap-2.5 py-1.5">
      <div className={`w-7 h-7 bg-${color}-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5`}>
        <Icon className={`w-3.5 h-3.5 text-${color}-600`} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-xs font-medium text-slate-900 break-words">{value || '—'}</p>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'contacts', label: `Contacts${vendorContacts.length > 0 ? ` (${vendorContacts.length})` : ''}` },
    { id: 'addresses', label: `Addresses (${addresses.length})` },
    ...(!isDecorator ? [{ id: 'products', label: `Products${vendorProducts.length > 0 ? ` (${vendorProducts.length})` : ''}` }] : []),
    ...(isDecorator ? [{ id: 'contractpricing', label: 'Contract Pricing' }] : []),
    { id: 'orders', label: `Purchase Orders${purchaseOrders.length > 0 ? ` (${purchaseOrders.length})` : ''}` },
    { id: 'invoices', label: `Invoices${invoices.length > 0 ? ` (${invoices.length})` : ''}` },
    { id: 'documents', label: `Documents (${documents.length})` },
    { id: 'activity', label: 'Activity' },
    { id: 'scorecard', label: 'Scorecard' },
  ];

  const PaginationBar = ({ currentPage, totalItems, onPageChange, rowsPerPage: rpp, onRowsPerPageChange }: { currentPage: number; totalItems: number; onPageChange: (p: number) => void; rowsPerPage?: number; onRowsPerPageChange?: (n: number) => void }) => {
    const perPage = rpp || ROWS_PER_PAGE;
    const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
    return (
      <div className="px-4 py-2.5 border-t border-slate-200 flex items-center justify-between bg-white">
        <div className="text-xs text-slate-600">
          Page {currentPage} of {totalPages} · Showing {totalItems === 0 ? 0 : Math.min((currentPage - 1) * perPage + 1, totalItems)} to {Math.min(currentPage * perPage, totalItems)} of {totalItems}
        </div>
        <div className="flex items-center gap-2">
          {onRowsPerPageChange && (
            <>
              <span className="text-xs text-slate-600">Rows per page:</span>
              <select
                value={perPage}
                onChange={e => { onRowsPerPageChange(Number(e.target.value)); onPageChange(1); }}
                className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </>
          )}
          <div className="flex gap-1 ml-4">
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50" disabled={currentPage <= 1} onClick={() => onPageChange(Math.max(1, currentPage - 1))}>
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50" disabled={currentPage >= totalPages} onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}>
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
      {/* ─── Header ─── */}
      <div className="bg-slate-800 px-6 py-3">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center justify-between mb-2.5">
            <motion.button
              whileHover={{ scale: 1.05, x: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="flex items-center gap-1.5 text-white/90 hover:text-white font-medium transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Vendors
            </motion.button>
            {/* Delete handled from table view */}
          </div>
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-xl overflow-hidden">
              {v.logo && (v.logo.startsWith('data:') || v.logo.startsWith('http')) ? (
                <img src={v.logo} alt={v.name} className="max-w-full max-h-full object-contain p-1" />
              ) : (
                <span className="text-sm font-black text-purple-600">
                  {v.name?.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-base font-bold text-white">{v.name}</h1>
              <div className="flex items-center gap-1.5 mt-1">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${getStatusColor(v.status)} bg-white`}>
                  {v.status}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/20 text-white border border-white/30">
                  {v.type}
                </span>
                {v.accountType && v.accountType !== 'Standalone' && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/10 text-white/80 border border-white/20">
                    {v.accountType}
                  </span>
                )}
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${v.supportsDropShipping !== false ? 'bg-emerald-500/20 text-emerald-100 border-emerald-400/30' : 'bg-red-500/20 text-red-200 border-red-400/30'}`}>
                  <Truck className="w-3 h-3" />
                  {v.supportsDropShipping !== false ? 'Drop Ship' : 'No Drop Ship'}
                </span>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-0.5 mt-3 -mb-3">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-t-lg text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-slate-50 text-purple-700 shadow-sm'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Content ─── */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="max-w-[1400px] mx-auto">

          {/* ════════════ OVERVIEW TAB ════════════ */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Stats Row */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'Total PO Value', value: totalPOValue > 0 ? `$${totalPOValue.toLocaleString()}` : '$0', icon: ShoppingCart, bgColor: 'bg-blue-100', textColor: 'text-blue-600' },
                  { label: 'Invoices Paid', value: invoices.length > 0 ? `${paidInvoices}/${invoices.length}` : '0', icon: DollarSign, bgColor: 'bg-green-100', textColor: 'text-green-600' },
                  { label: 'Documents', value: String(documents.length), icon: FileText, bgColor: 'bg-purple-100', textColor: 'text-purple-600' },
                  { label: 'Addresses', value: String(addresses.length), icon: MapPin, bgColor: 'bg-amber-100', textColor: 'text-amber-600' },
                ].map((stat, idx) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm"
                  >
                    <div className={`w-8 h-8 ${stat.bgColor} rounded-lg flex items-center justify-center mb-1.5`}>
                      <stat.icon className={`w-4 h-4 ${stat.textColor}`} />
                    </div>
                    <div className="text-lg font-bold text-slate-900">{stat.value}</div>
                    <div className="text-xs text-slate-500">{stat.label}</div>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-4">
                {/* ─── Left: Vendor Information (editable) ─── */}
                <div className="col-span-2 space-y-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
                  >
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-4 py-3 border-b border-slate-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-slate-900">Vendor Information</h3>
                            <p className="text-xs text-slate-500">Contact details, terms & notes</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {saveSuccess === 'info' && (
                            <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                              <Check className="w-3 h-3 inline mr-0.5" /> Saved
                            </motion.span>
                          )}
                          {editingSection === 'info' ? (
                            <div className="flex items-center gap-1.5">
                              <button onClick={cancelEditing} className="px-2.5 py-1 text-xs font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">Cancel</button>
                              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={saveInfoEdits} disabled={saving} className="px-3 py-1 text-xs font-bold text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-1">
                                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Save
                              </motion.button>
                            </div>
                          ) : (
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => startEditing('info')} className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                              <Pencil className="w-3 h-3" /> Edit
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      {editingSection === 'info' ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Vendor Name</label>
                              <input type="text" value={editForm.name || ''} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all" />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Contact Name</label>
                              <input type="text" value={editForm.contactName || ''} onChange={e => setEditForm({ ...editForm, contactName: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all" />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Email</label>
                              <input type="email" value={editForm.email || ''} onChange={e => setEditForm({ ...editForm, email: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all" />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Phone</label>
                              <input type="text" value={editForm.phone || ''} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all" />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Website</label>
                              <input type="text" value={editForm.website || ''} onChange={e => setEditForm({ ...editForm, website: e.target.value })} placeholder="www.vendor.com" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all" />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">WeChat ID</label>
                              <input type="text" value={editForm.wechatId || ''} onChange={e => setEditForm({ ...editForm, wechatId: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all" />
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Status</label>
                              <select value={editForm.status || 'Active'} onChange={e => setEditForm({ ...editForm, status: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all">
                                {VENDOR_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Vendor Type</label>
                              <select value={editForm.type || 'Distributor'} onChange={e => setEditForm({ ...editForm, type: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all">
                                {VENDOR_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Account Type</label>
                              <select value={editForm.accountType || 'Standalone'} onChange={e => setEditForm({ ...editForm, accountType: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all">
                                {ACCOUNT_TYPES.map(a => <option key={a} value={a}>{a}</option>)}
                              </select>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Payment Terms</label>
                              <select value={editForm.paymentTerms || ''} onChange={e => setEditForm({ ...editForm, paymentTerms: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all">
                                <option value="">Select terms...</option>
                                {PAYMENT_TERMS.map(p => <option key={p} value={p}>{p}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Account Number</label>
                              <input type="text" value={editForm.accountNumber || ''} onChange={e => setEditForm({ ...editForm, accountNumber: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all" />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Notes</label>
                            <textarea rows={3} value={editForm.notes || ''} onChange={e => setEditForm({ ...editForm, notes: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all resize-none" />
                          </div>
                          {/* ─── Drop Shipping Toggle ─── */}
                          <div className="mt-2 p-4 rounded-xl border-2 border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50/30">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${editForm.supportsDropShipping ? 'bg-emerald-100' : 'bg-slate-200'}`}>
                                  <Truck className={`w-4.5 h-4.5 transition-colors ${editForm.supportsDropShipping ? 'text-emerald-600' : 'text-slate-400'}`} />
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-slate-900">Supports Drop Shipping</p>
                                  <p className="text-xs text-slate-500 mt-0.5">
                                    {editForm.supportsDropShipping
                                      ? 'Vendor ships directly to destinations — POs generate normally'
                                      : 'Vendor cannot drop ship — sample POs will auto-split by destination'}
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => setEditForm({ ...editForm, supportsDropShipping: !editForm.supportsDropShipping })}
                                className={`relative w-12 h-7 rounded-full transition-colors ${editForm.supportsDropShipping ? 'bg-emerald-500' : 'bg-slate-300'}`}
                              >
                                <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-all ${editForm.supportsDropShipping ? 'left-[22px]' : 'left-0.5'}`} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                          <InfoField icon={User} label="Contact Name" value={v.contactName || v.contact || ''} color="purple" />
                          <InfoField icon={Mail} label="Email" value={v.email || ''} color="blue" />
                          <InfoField icon={Phone} label="Phone" value={v.phone || ''} color="green" />
                          <InfoField icon={Globe} label="Website" value={v.website || ''} color="cyan" />
                          <InfoField icon={MessageSquare} label="WeChat ID" value={v.wechatId || ''} color="emerald" />
                          <InfoField icon={CreditCard} label="Payment Terms" value={v.paymentTerms || v.netTerms || ''} color="amber" />
                          <InfoField icon={Hash} label="Account Number" value={v.accountNumber || ''} color="red" />
                          <InfoField icon={Building2} label="Account Type" value={v.accountType || 'Standalone'} color="indigo" />
                          {/* Drop Shipping display */}
                          <div className="flex items-start gap-3 py-2">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${v.supportsDropShipping !== false ? 'bg-emerald-100' : 'bg-red-100'}`}>
                              <Truck className={`w-4 h-4 ${v.supportsDropShipping !== false ? 'text-emerald-600' : 'text-red-600'}`} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Drop Shipping</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold border ${v.supportsDropShipping !== false ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                  {v.supportsDropShipping !== false ? 'Supported' : 'Not Supported'}
                                </span>
                              </div>
                            </div>
                          </div>
                          {v.notes && (
                            <div className="col-span-2 mt-2">
                              <InfoField icon={FileText} label="Notes" value={v.notes} color="slate" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>

                {/* ─── Right Column: Activity ─── */}
                <div className="space-y-6">
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
                      <h3 className="text-lg font-bold text-slate-900">Recent Activity</h3>
                      <p className="text-sm text-slate-500">Transaction history</p>
                    </div>
                    <div className="p-6">
                      {loadingActivity ? (
                        <div className="text-center py-8">
                          <Loader2 className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-2" />
                          <p className="text-sm text-slate-500">Loading activity...</p>
                        </div>
                      ) : recentActivity.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                            <Calendar className="w-7 h-7 text-slate-300" />
                          </div>
                          <p className="text-sm font-semibold text-slate-700 mb-1">No activity yet</p>
                          <p className="text-xs text-slate-400">Activity will appear here as you create POs, invoices, and upload documents.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {recentActivity.slice(0, 5).map((activity, index) => (
                            <div key={activity.id} className="flex gap-3">
                              <div className="flex flex-col items-center shrink-0">
                                <div className={`w-8 h-8 min-w-[2rem] min-h-[2rem] shrink-0 rounded-lg flex items-center justify-center ${
                                  activity.type === 'Invoice' ? 'bg-green-100 text-green-600' :
                                  activity.type === 'Purchase Order' ? 'bg-blue-100 text-blue-600' :
                                  activity.type === 'Payment' ? 'bg-purple-100 text-purple-600' :
                                  activity.type === 'Document' ? 'bg-orange-100 text-orange-600' :
                                  activity.type === 'Contact' ? 'bg-violet-100 text-violet-600' :
                                  'bg-amber-100 text-amber-600'
                                }`}>
                                  {activity.type === 'Invoice' || activity.type === 'Payment' ? <DollarSign className="w-4 h-4" /> :
                                   activity.type === 'Purchase Order' ? <ShoppingCart className="w-4 h-4" /> :
                                   activity.type === 'Document' ? <FileText className="w-4 h-4" /> :
                                   activity.type === 'Contact' ? <Users className="w-4 h-4" /> :
                                   <Package className="w-4 h-4" />}
                                </div>
                                {index < Math.min(recentActivity.length, 5) - 1 && <div className="w-0.5 flex-1 bg-slate-200 mt-2" />}
                              </div>
                              <div className="flex-1 pb-4">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-semibold text-slate-500">{activity.type}</span>
                                  <span className="text-xs text-slate-400">{activity.date}</span>
                                </div>
                                <p className="text-sm text-slate-900 mb-1">{activity.description}</p>
                                {activity.amount && <p className="text-xs font-semibold text-green-600">${activity.amount.toLocaleString()}</p>}
                              </div>
                            </div>
                          ))}
                          {recentActivity.length > 5 && (
                            <button onClick={() => setActiveTab('activity')} className="text-xs font-bold text-purple-600 hover:underline">
                              View all {recentActivity.length} activities
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* ─── Addresses Preview (Full Width) ─── */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">Addresses</h3>
                        <p className="text-sm text-slate-500">{addresses.length} location{addresses.length !== 1 ? 's' : ''} on file</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {saveSuccess === 'addresses' && (
                        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">
                          <Check className="w-3.5 h-3.5 inline mr-1" /> Saved
                        </motion.span>
                      )}
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={openAddAddress} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold text-amber-700 bg-amber-100 rounded-lg hover:bg-amber-200 transition-colors">
                        <Plus className="w-3.5 h-3.5" /> Add Address
                      </motion.button>
                      {addresses.length > 4 && (
                        <button onClick={() => setActiveTab('addresses')} className="text-xs font-bold text-purple-600 hover:underline ml-1">View All</button>
                      )}
                    </div>
                  </div>
                </div>
                {addresses.length === 0 ? (
                  <div className="text-center py-8 px-6">
                    <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <MapPin className="w-7 h-7 text-amber-300" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700 mb-1">No addresses added yet</p>
                    <p className="text-xs text-slate-400 mb-4">Add billing, FOB, and warehouse addresses</p>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={openAddAddress} className="px-4 py-2 bg-amber-500 text-white rounded-xl font-bold text-sm hover:bg-amber-600 transition-colors inline-flex items-center gap-1.5">
                      <Plus className="w-4 h-4" /> Add First Address
                    </motion.button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Type</th>
                          <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Name</th>
                          <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Contact</th>
                          <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Street Address</th>
                          <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">City / State</th>
                          <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">ZIP</th>
                          <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Country</th>
                          <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {addresses.slice(0, 4).map(addr => (
                          <tr key={addr.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded-md text-xs font-bold whitespace-nowrap ${getAddressTypeColor(addr.label)}`}>{addr.label === 'Other' && addr.customLabel ? addr.customLabel : addr.label}</span>
                                {addr.isPrimary && <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-purple-100 text-purple-700 whitespace-nowrap">Primary</span>}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-slate-900 whitespace-nowrap">{addr.name || '—'}</td>
                            <td className="px-6 py-4 text-sm text-slate-700 whitespace-nowrap">{addr.contactPerson || '—'}</td>
                            <td className="px-6 py-4 text-sm text-slate-700">{[addr.street1, addr.street2].filter(Boolean).join(', ') || '—'}</td>
                            <td className="px-6 py-4 text-sm text-slate-700 whitespace-nowrap">{[addr.city, addr.state].filter(Boolean).join(', ') || '—'}</td>
                            <td className="px-6 py-4 text-sm text-slate-700 whitespace-nowrap">{addr.zip || '—'}</td>
                            <td className="px-6 py-4 text-sm text-slate-700 whitespace-nowrap">{addr.country || '—'}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1">
                                <button onClick={() => openEditAddress(addr)} className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors" title="Edit"><Pencil className="w-3.5 h-3.5 text-slate-500" /></button>
                                <button onClick={() => setDeleteAddress(addr)} className="p-1.5 hover:bg-red-100 rounded-lg transition-colors" title="Delete"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            </div>
          )}

          {/* ════════════ CONTACTS TAB ════════════ */}
          {activeTab === 'contacts' && (() => {
            const paginatedContacts = vendorContacts.slice((contactPage - 1) * contactRowsPerPage, contactPage * contactRowsPerPage);
            return (
              <div className="space-y-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-violet-50 to-purple-50 px-6 py-4 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-violet-500 rounded-xl flex items-center justify-center">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-slate-900">Contacts</h3>
                          <p className="text-xs text-slate-500">{vendorContacts.length} contact{vendorContacts.length !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => openContactModal()} className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-bold hover:bg-violet-700 transition-colors shadow-sm">
                        <Plus className="w-4 h-4" /> Add Contact
                      </motion.button>
                    </div>
                  </div>
                  {loadingContacts ? (
                    <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 text-violet-500 animate-spin" /></div>
                  ) : vendorContacts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                      <Users className="w-12 h-12 mb-3 opacity-40" />
                      <p className="text-sm font-bold">No contacts yet</p>
                      <p className="text-xs mt-1">Add contacts for this vendor</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50/80">
                            <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Name</th>
                            <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Title</th>
                            <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Email</th>
                            <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Phone</th>
                            <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">WeChat ID</th>
                            <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Department</th>
                            <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Primary</th>
                            <th className="text-right px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedContacts.map((ct, idx) => (
                            <tr key={ct.id} className={`border-b border-slate-100 hover:bg-slate-50/50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center shrink-0">
                                    <User className="w-4 h-4 text-violet-600" />
                                  </div>
                                  <span className="text-sm font-bold text-slate-900">{ct.name}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">{ct.title || '—'}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {ct.email ? <a href={`mailto:${ct.email}`} className="text-sm text-blue-600 hover:underline">{ct.email}</a> : <span className="text-sm text-slate-400">—</span>}
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">{ct.phone || '—'}</td>
                              <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">{ct.wechatId || '—'}</td>
                              <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">{ct.department || '—'}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {ct.isPrimary ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-lg text-xs font-bold border border-amber-200"><Star className="w-3 h-3" /> Primary</span>
                                ) : <span className="text-xs text-slate-400">—</span>}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-1 justify-end">
                                  <button onClick={() => openContactModal(ct)} className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors" title="Edit"><Pencil className="w-3.5 h-3.5 text-slate-500" /></button>
                                  <button onClick={() => setDeleteContact(ct)} className="p-1.5 hover:bg-red-100 rounded-lg transition-colors" title="Delete"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <PaginationBar currentPage={contactPage} totalItems={vendorContacts.length} onPageChange={setContactPage} rowsPerPage={contactRowsPerPage} onRowsPerPageChange={setContactRowsPerPage} />
                </motion.div>
              </div>
            );
          })()}

          {/* ════════════ ADDRESSES TAB ════════════ */}
          {activeTab === 'addresses' && (() => {
            const addrTotalPages = Math.max(1, Math.ceil(addresses.length / addrRowsPerPage));
            const paginatedAddresses = addresses.slice((addrPage - 1) * addrRowsPerPage, addrPage * addrRowsPerPage);
            return (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">All Addresses</h2>
                    <p className="text-sm text-slate-500">{addresses.length} location{addresses.length !== 1 ? 's' : ''} configured</p>
                  </div>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={openAddAddress} className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors shadow-lg">
                    <Plus className="w-4 h-4" /> Add Address
                  </motion.button>
                </div>
                {addresses.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-12 text-center">
                    <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                      <MapPin className="w-10 h-10 text-amber-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">No addresses yet</h3>
                    <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">Add billing addresses, FOB locations, warehouses, offices, and more.</p>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={openAddAddress} className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors inline-flex items-center gap-2">
                      <Plus className="w-5 h-5" /> Add First Address
                    </motion.button>
                  </div>
                ) : (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Type</th>
                            <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Name</th>
                            <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Contact</th>
                            <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Street Address</th>
                            <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">City / State</th>
                            <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">ZIP</th>
                            <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Country</th>
                            <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {paginatedAddresses.map(addr => (
                            <tr key={addr.id} className="hover:bg-slate-50/70 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap ${getAddressTypeColor(addr.label)}`}>{addr.label === 'Other' && addr.customLabel ? addr.customLabel : addr.label}</span>
                                  {addr.isPrimary && <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-purple-100 text-purple-700 whitespace-nowrap">Primary</span>}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm font-medium text-slate-900 whitespace-nowrap">{addr.name || '—'}</td>
                              <td className="px-6 py-4 text-sm text-slate-700 whitespace-nowrap">{addr.contactPerson || '—'}</td>
                              <td className="px-6 py-4 text-sm text-slate-700">{[addr.street1, addr.street2].filter(Boolean).join(', ') || '—'}</td>
                              <td className="px-6 py-4 text-sm text-slate-700 whitespace-nowrap">{[addr.city, addr.state].filter(Boolean).join(', ') || '—'}</td>
                              <td className="px-6 py-4 text-sm text-slate-700 whitespace-nowrap">{addr.zip || '—'}</td>
                              <td className="px-6 py-4 text-sm text-slate-700 whitespace-nowrap">{addr.country || '—'}</td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-1">
                                  <button onClick={() => openEditAddress(addr)} className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors" title="Edit"><Pencil className="w-3.5 h-3.5 text-slate-500" /></button>
                                  <button onClick={() => setDeleteAddress(addr)} className="p-1.5 hover:bg-red-100 rounded-lg transition-colors" title="Delete"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <PaginationBar currentPage={addrPage} totalItems={addresses.length} onPageChange={setAddrPage} rowsPerPage={addrRowsPerPage} onRowsPerPageChange={setAddrRowsPerPage} />
                  </motion.div>
                )}
              </div>
            );
          })()}

          {/* ════════════ PRODUCTS TAB ════════════ */}
          {activeTab === 'products' && !isDecorator && (() => {
            const paginatedProducts = vendorProducts.slice((productPage - 1) * ROWS_PER_PAGE, productPage * ROWS_PER_PAGE);
            return (
              <div className="space-y-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                          <Package className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-slate-900">Product Catalog</h3>
                          <p className="text-xs text-slate-500">{vendorProducts.length} product{vendorProducts.length !== 1 ? 's' : ''} from this vendor</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5">
                          <button onClick={() => setProductViewMode('grid')} className={`p-1.5 rounded-md transition-colors ${productViewMode === 'grid' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-400 hover:text-slate-600'}`} title="Grid view"><Grid3X3 className="w-4 h-4" /></button>
                          <button onClick={() => setProductViewMode('list')} className={`p-1.5 rounded-md transition-colors ${productViewMode === 'list' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-400 hover:text-slate-600'}`} title="List view"><List className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                  {loadingProducts ? (
                    <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 text-emerald-500 animate-spin" /></div>
                  ) : vendorProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                      <Package className="w-12 h-12 mb-3 opacity-40" />
                      <p className="text-sm font-bold">No products found</p>
                      <p className="text-xs mt-1">Products assigned to this vendor will appear here</p>
                    </div>
                  ) : productViewMode === 'grid' ? (
                    <div className="p-6">
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {paginatedProducts.map(product => (
                          <motion.div key={product.id} whileHover={{ y: -2 }} className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-all group">
                            <div className="aspect-square bg-slate-100 flex items-center justify-center relative overflow-hidden">
                              {product.image ? (
                                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                              ) : (
                                <Package className="w-10 h-10 text-slate-300" />
                              )}
                              {product.status && (
                                <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                  product.status === 'Active' ? 'bg-green-100 text-green-700 border-green-200' :
                                  product.status === 'Draft' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                  'bg-slate-100 text-slate-600 border-slate-200'
                                }`}>{product.status}</span>
                              )}
                            </div>
                            <div className="p-3">
                              <p className="text-sm font-bold text-slate-900 truncate">{product.name}</p>
                              {product.sku && <p className="text-xs text-slate-500 mt-0.5">SKU: {product.sku}</p>}
                              <div className="flex items-center justify-between mt-2">
                                {product.category && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-[10px] font-bold border border-emerald-100">
                                    <Tag className="w-2.5 h-2.5" />{product.category}
                                  </span>
                                )}
                                {product.basePrice != null && (
                                  <span className="text-sm font-black text-slate-900">${Number(product.basePrice).toFixed(2)}</span>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50/80">
                            <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Product</th>
                            <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">SKU</th>
                            <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                            <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="text-right px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Base Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedProducts.map((product, idx) => (
                            <tr key={product.id} className={`border-b border-slate-100 hover:bg-slate-50/50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                                    {product.image ? (
                                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                    ) : (
                                      <Package className="w-5 h-5 text-slate-300" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-slate-900">{product.name}</p>
                                    {product.description && <p className="text-xs text-slate-500 truncate max-w-[200px]">{product.description}</p>}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-600 font-mono">{product.sku || '—'}</td>
                              <td className="px-6 py-4">
                                {product.category ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-100">
                                    <Tag className="w-3 h-3" />{product.category}
                                  </span>
                                ) : <span className="text-sm text-slate-400">—</span>}
                              </td>
                              <td className="px-6 py-4">
                                {product.status ? (
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold border ${
                                    product.status === 'Active' ? 'bg-green-100 text-green-700 border-green-200' :
                                    product.status === 'Draft' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                    product.status === 'Discontinued' ? 'bg-red-100 text-red-700 border-red-200' :
                                    'bg-slate-100 text-slate-600 border-slate-200'
                                  }`}>{product.status}</span>
                                ) : <span className="text-sm text-slate-400">—</span>}
                              </td>
                              <td className="px-6 py-4 text-right text-sm font-bold text-slate-900">
                                {product.basePrice != null ? `$${Number(product.basePrice).toFixed(2)}` : '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <PaginationBar currentPage={productPage} totalItems={vendorProducts.length} onPageChange={setProductPage} />
                </motion.div>
              </div>
            );
          })()}

          {/* ════════════ CONTRACT PRICING TAB (Decorator only) ════════════ */}
          {activeTab === 'contractpricing' && isDecorator && (
            <ContractPricingTab vendorId={v.id} vendorName={v.name} />
          )}

          {/* ════════════ PURCHASE ORDERS TAB ════════════ */}
          {activeTab === 'orders' && (() => {
            // If a PO is selected, show the detail view
            if (selectedPO) {
              return (
                <PurchaseOrderDetailView
                  order={{
                    id: selectedPO.id,
                    poNumber: selectedPO.poNumber,
                    poDate: selectedPO.poDate || (selectedPO.createdAt ? new Date(selectedPO.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
                    project: selectedPO.project || '',
                    vendor: selectedPO.vendor || vendorData.name,
                    customer: selectedPO.customer || '',
                    status: selectedPO.status,
                    shipDate: selectedPO.shipDate || null,
                    inHandsDate: selectedPO.inHandsDate || '',
                    total: selectedPO.total || 0,
                    priority: selectedPO.priority || 'Normal',
                    contact: selectedPO.contact || '',
                    contacts: selectedPO.contacts,
                    shipToAddresses: selectedPO.shipToAddresses,
                    destinations: selectedPO.destinations,
                    isSample: selectedPO.isSample || false,
                    sampleType: selectedPO.sampleType,
                    lineItems: selectedPO.lineItems,
                    items: selectedPO.items,
                    variants: selectedPO.variants,
                    additionalNotes: selectedPO.additionalNotes,
                    competitorLink: selectedPO.competitorLink,
                    projectNumber: selectedPO.projectNumber,
                    productId: selectedPO.productId,
                    vendorId: selectedPO.vendorId,
                    contactId: selectedPO.contactId,
                    shippingCost: selectedPO.shippingCost,
                    blindShip: selectedPO.blindShip,
                    carrierAccount: selectedPO.carrierAccount,
                    paymentTerms: selectedPO.paymentTerms,
                    shippingMethod: selectedPO.shippingMethod,
                  }}
                  onBack={() => { setSelectedPO(null); fetchPurchaseOrders(); }}
                  onEdit={() => {}}
                  onStatusChange={(orderId, newStatus) => {
                    setPurchaseOrders(pos => pos.map(p => p.id === orderId ? { ...p, status: newStatus } : p));
                  }}
                  onOrderUpdate={fetchPurchaseOrders}
                />
              );
            }

            return (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                        <ShoppingCart className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">Purchase Orders</h3>
                        <p className="text-sm text-slate-500">{purchaseOrders.length} orders{totalPOValue > 0 ? ` · $${totalPOValue.toLocaleString()} total` : ''}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Search & Filter Bar */}
                {purchaseOrders.length > 0 && (
                  <div className="px-6 py-3 border-b border-slate-200 bg-slate-50/50 flex items-center gap-3 flex-wrap">
                    <div className="relative flex-1 min-w-[200px] max-w-sm">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search POs..."
                        value={poSearch}
                        onChange={e => { setPoSearch(e.target.value); setPoPage(1); }}
                        className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                      />
                      {poSearch && (
                        <button onClick={() => setPoSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-slate-100">
                          <X className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                      )}
                    </div>
                    <div className="relative" ref={poStatusDropdownRef}>
                      <button
                        onClick={() => setPoStatusDropdownOpen(!poStatusDropdownOpen)}
                        className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-medium transition-all ${poStatusFilter !== 'All' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'}`}
                      >
                        <span>Status: {poStatusFilter}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${poStatusDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {poStatusDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -6, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -6, scale: 0.97 }}
                            transition={{ duration: 0.12 }}
                            className="absolute top-full left-0 mt-1.5 bg-white rounded-xl border border-slate-200 shadow-2xl z-50 overflow-hidden min-w-[160px]"
                          >
                            <div className="py-1">
                              {poStatuses.map(s => (
                                <button
                                  key={s}
                                  onClick={() => { setPoStatusFilter(s); setPoStatusDropdownOpen(false); setPoPage(1); }}
                                  className={`w-full flex items-center justify-between px-4 py-2 text-sm font-medium transition-colors ${poStatusFilter === s ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'}`}
                                >
                                  <span className="flex items-center gap-2">
                                    {s !== 'All' && <span className={`w-2 h-2 rounded-full ${getStatusColor(s).includes('green') ? 'bg-green-500' : getStatusColor(s).includes('blue') ? 'bg-blue-500' : getStatusColor(s).includes('red') ? 'bg-red-500' : 'bg-slate-400'}`} />}
                                    {s}
                                  </span>
                                  {poStatusFilter === s && <Check className="w-4 h-4 text-blue-600" />}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <div className="ml-auto text-xs text-slate-500">
                      {filteredPOs.length} of {purchaseOrders.length} orders
                    </div>
                  </div>
                )}

                {loadingPOs ? (
                  <div className="text-center py-16">
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-3" />
                    <p className="text-sm text-slate-500">Loading purchase orders...</p>
                  </div>
                ) : purchaseOrders.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <ShoppingCart className="w-8 h-8 text-blue-300" />
                    </div>
                    <h4 className="font-bold text-slate-900 mb-1">No purchase orders yet</h4>
                    <p className="text-sm text-slate-500">Purchase orders created for this vendor will appear here.</p>
                  </div>
                ) : filteredPOs.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Search className="w-8 h-8 text-slate-300" />
                    </div>
                    <h4 className="font-bold text-slate-900 mb-1">No matching orders</h4>
                    <p className="text-sm text-slate-500">Try adjusting your search or filter criteria.</p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[1200px]">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider cursor-pointer select-none hover:text-slate-900 transition-colors whitespace-nowrap" onClick={() => togglePoSort('poNumber')}>
                              <span className="flex items-center gap-1.5">PO Number <PoSortIcon field="poNumber" /></span>
                            </th>
                            <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                              <span className="flex items-center gap-1.5">Project #</span>
                            </th>
                            <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                              <span className="flex items-center gap-1.5">Order #</span>
                            </th>
                            <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider cursor-pointer select-none hover:text-slate-900 transition-colors whitespace-nowrap" onClick={() => togglePoSort('poDate')}>
                              <span className="flex items-center gap-1.5">Date <PoSortIcon field="poDate" /></span>
                            </th>
                            <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider cursor-pointer select-none hover:text-slate-900 transition-colors whitespace-nowrap" onClick={() => togglePoSort('customer')}>
                              <span className="flex items-center gap-1.5">Customer <PoSortIcon field="customer" /></span>
                            </th>
                            <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider cursor-pointer select-none hover:text-slate-900 transition-colors whitespace-nowrap" onClick={() => togglePoSort('project')}>
                              <span className="flex items-center gap-1.5">Project <PoSortIcon field="project" /></span>
                            </th>
                            <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Items</th>
                            <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider cursor-pointer select-none hover:text-slate-900 transition-colors whitespace-nowrap" onClick={() => togglePoSort('total')}>
                              <span className="flex items-center gap-1.5">Amount <PoSortIcon field="total" /></span>
                            </th>
                            <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider cursor-pointer select-none hover:text-slate-900 transition-colors whitespace-nowrap" onClick={() => togglePoSort('status')}>
                              <span className="flex items-center gap-1.5">Status <PoSortIcon field="status" /></span>
                            </th>
                            <th className="text-right px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredPOs.slice((poPage - 1) * ROWS_PER_PAGE, poPage * ROWS_PER_PAGE).map(po => (
                            <tr
                              key={po.id}
                              onClick={() => setSelectedPO(po)}
                              className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="font-semibold text-blue-600 group-hover:text-blue-700 transition-colors">{po.poNumber || po.id}</span>
                                {po.isSample && (
                                  <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-600 border border-purple-200">SAMPLE</span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">{po.projectNumber || '—'}</td>
                              <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">{po.orderNumber || po.sourceOrderId || '—'}</td>
                              <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">{po.poDate || (po.createdAt ? new Date(po.createdAt).toLocaleDateString() : '—')}</td>
                              <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">{po.customer || '—'}</td>
                              <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">{po.project || '—'}</td>
                              <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">{(po.lineItems?.length || po.items?.length || po.variants?.length || 0)} items</td>
                              <td className="px-6 py-4 whitespace-nowrap"><span className="font-semibold text-green-600">${parseFloat(String(po.total || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${getStatusColor(po.status)}`}>{po.status}</span>
                              </td>
                              <td className="px-6 py-4 text-right whitespace-nowrap" onClick={e => e.stopPropagation()}>
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={() => setSelectedPO(po)}
                                    className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                                    title="View PO Details"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handlePODownloadPDF(po)}
                                    disabled={generatingPDF === po.id}
                                    className="p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all disabled:opacity-50"
                                    title="Download PDF"
                                  >
                                    {generatingPDF === po.id ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Download className="w-4 h-4" />
                                    )}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <PaginationBar currentPage={poPage} totalItems={filteredPOs.length} onPageChange={setPoPage} />
                  </>
                )}
              </motion.div>
            );
          })()}

          {/* ════════════ INVOICES TAB ════════════ */}
          {activeTab === 'invoices' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Invoices</h3>
                    <p className="text-sm text-slate-500">{invoices.length} invoices{paidInvoices > 0 ? ` · ${paidInvoices} paid` : ''}</p>
                  </div>
                </div>
              </div>
              {loadingInvoices ? (
                <div className="text-center py-16">
                  <Loader2 className="w-10 h-10 text-green-500 animate-spin mx-auto mb-3" />
                  <p className="text-sm text-slate-500">Loading invoices...</p>
                </div>
              ) : invoices.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <DollarSign className="w-8 h-8 text-green-300" />
                  </div>
                  <h4 className="font-bold text-slate-900 mb-1">No invoices yet</h4>
                  <p className="text-sm text-slate-500">Invoices for this vendor will appear here.</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Invoice ID</th>
                          <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Date</th>
                          <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Due Date</th>
                          <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Amount</th>
                          <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {invoices.slice((invPage - 1) * ROWS_PER_PAGE, invPage * ROWS_PER_PAGE).map(inv => (
                          <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4"><span className="font-semibold text-slate-900">{inv.id}</span></td>
                            <td className="px-6 py-4 text-sm text-slate-600">{inv.date}</td>
                            <td className="px-6 py-4 text-sm text-slate-600">{inv.dueDate}</td>
                            <td className="px-6 py-4"><span className="font-semibold text-green-600">${(inv.amount || 0).toLocaleString()}</span></td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${getStatusColor(inv.status)}`}>{inv.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <PaginationBar currentPage={invPage} totalItems={invoices.length} onPageChange={setInvPage} />
                </>
              )}
            </motion.div>
          )}

          {/* ════════════ DOCUMENTS TAB ════════════ */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Files & Documents</h2>
                  <p className="text-sm text-slate-500">{documents.length} documents on file</p>
                </div>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowUploadModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors shadow-lg">
                  <Upload className="w-4 h-4" /> Upload Document
                </motion.button>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
                {loadingDocs ? (
                  <div className="text-center py-10">
                    <Loader2 className="w-10 h-10 text-purple-500 animate-spin mx-auto mb-3" />
                    <p className="text-sm text-slate-500">Loading documents...</p>
                  </div>
                ) : documents.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <FileText className="w-8 h-8 text-purple-400" />
                    </div>
                    <h4 className="font-bold text-slate-900 mb-1">No documents yet</h4>
                    <p className="text-sm text-slate-500 mb-4">Upload contracts, catalogs, and other vendor documents</p>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowUploadModal(true)} className="px-5 py-2.5 bg-purple-600 text-white rounded-xl font-semibold text-sm hover:bg-purple-700 transition-all inline-flex items-center gap-2">
                      <Upload className="w-4 h-4" /> Upload Document
                    </motion.button>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Preview</th>
                            <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Document Name</th>
                            <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Type</th>
                            <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Size</th>
                            <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Uploaded</th>
                            <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Uploaded By</th>
                            <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {documents.slice((docPage - 1) * ROWS_PER_PAGE, docPage * ROWS_PER_PAGE).map(doc => {
                            const isImage = /\.(png|jpg|jpeg|gif|webp|svg|bmp)$/i.test(doc.name);
                            const isPdf = /\.pdf$/i.test(doc.name);
                            return (
                              <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                  {doc.preview ? (
                                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-white shrink-0">
                                      <img src={doc.preview} alt={doc.name} className="w-full h-full object-cover" />
                                    </div>
                                  ) : (
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isPdf ? 'bg-red-50 text-red-500' : getDocTypeColor(doc.type)}`}>
                                      {isPdf ? <FileText className="w-5 h-5" /> : <File className="w-5 h-5" />}
                                    </div>
                                  )}
                                </td>
                                <td className="px-6 py-4"><span className="font-semibold text-slate-900">{doc.name}</span></td>
                                <td className="px-6 py-4"><span className={`px-2 py-0.5 rounded text-xs font-semibold ${getDocTypeColor(doc.type)}`}>{doc.type}</span></td>
                                <td className="px-6 py-4 text-sm text-slate-600">{doc.size}</td>
                                <td className="px-6 py-4 text-sm text-slate-600">{doc.uploadDate}</td>
                                <td className="px-6 py-4 text-sm text-slate-600">{doc.uploadedBy || '—'}</td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-1">
                                    <button onClick={() => handleDownload(doc)} className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors" title="Download"><Download className="w-4 h-4 text-slate-600" /></button>
                                    <button onClick={() => setDeleteDoc(doc)} className="p-1.5 hover:bg-red-100 rounded-lg transition-colors" title="Delete"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <PaginationBar currentPage={docPage} totalItems={documents.length} onPageChange={setDocPage} />
                  </>
                )}
              </div>
            </div>
          )}

          {/* ════════════ ACTIVITY TAB ════════════ */}
          {activeTab === 'activity' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden max-w-2xl">
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-900">Activity Timeline</h3>
                <p className="text-sm text-slate-500">Full transaction history</p>
              </div>
              <div className="p-6">
                {loadingActivity ? (
                  <div className="text-center py-10">
                    <Loader2 className="w-10 h-10 text-purple-500 animate-spin mx-auto mb-3" />
                    <p className="text-sm text-slate-500">Loading activity...</p>
                  </div>
                ) : recentActivity.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Calendar className="w-8 h-8 text-slate-300" />
                    </div>
                    <h4 className="font-bold text-slate-900 mb-1">No activity yet</h4>
                    <p className="text-sm text-slate-500">Activity will be logged automatically as you work with this vendor.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={activity.id} className="flex gap-3">
                        <div className="flex flex-col items-center shrink-0">
                          <div className={`w-8 h-8 min-w-[2rem] min-h-[2rem] shrink-0 rounded-lg flex items-center justify-center ${
                            activity.type === 'Invoice' ? 'bg-green-100 text-green-600' :
                            activity.type === 'Purchase Order' ? 'bg-blue-100 text-blue-600' :
                            activity.type === 'Payment' ? 'bg-purple-100 text-purple-600' :
                            activity.type === 'Document' ? 'bg-orange-100 text-orange-600' :
                            activity.type === 'Contact' ? 'bg-violet-100 text-violet-600' :
                            'bg-amber-100 text-amber-600'
                          }`}>
                            {activity.type === 'Invoice' || activity.type === 'Payment' ? <DollarSign className="w-4 h-4" /> :
                             activity.type === 'Purchase Order' ? <ShoppingCart className="w-4 h-4" /> :
                             activity.type === 'Document' ? <FileText className="w-4 h-4" /> :
                             activity.type === 'Contact' ? <Users className="w-4 h-4" /> :
                             <Package className="w-4 h-4" />}
                          </div>
                          {index < recentActivity.length - 1 && <div className="w-0.5 flex-1 bg-slate-200 mt-2" />}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-slate-500">{activity.type}</span>
                            <span className="text-xs text-slate-400">{activity.date}</span>
                          </div>
                          <p className="text-sm text-slate-900 mb-1">{activity.description}</p>
                          {activity.amount && <p className="text-xs font-semibold text-green-600">${activity.amount.toLocaleString()}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ════════════ SCORECARD TAB ════════════ */}
          {activeTab === 'scorecard' && (
            <VendorScorecardTab vendorId={vendorData.id} vendorName={vendorData.name} purchaseOrders={purchaseOrders} />
          )}
        </div>
      </div>

      {/* ═══════════ MODALS ═══════════ */}

      {/* ─── Address Add/Edit Modal ─── */}
      <AnimatePresence>
        {showAddressModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddressModal(false)} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-3xl shadow-2xl z-50 overflow-hidden max-h-[90vh] flex flex-col">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center"><MapPin className="w-5 h-5 text-white" /></div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{editingAddress ? 'Edit Address' : 'Add New Address'}</h3>
                    <p className="text-amber-100 text-sm">{v.name}</p>
                  </div>
                </div>
                <button onClick={() => setShowAddressModal(false)} className="p-2 hover:bg-white/20 rounded-xl transition-colors"><X className="w-5 h-5 text-white" /></button>
              </div>
              <AddressModalBody addressForm={addressForm} setAddressForm={setAddressForm} />
              <div className="px-6 pb-6 flex items-center gap-3 shrink-0">
                <button onClick={() => setShowAddressModal(false)} className="flex-1 px-5 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all">Cancel</button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={saveAddress} disabled={!addressForm.street1 || !addressForm.city || saving} className="flex-1 px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {editingAddress ? 'Update Address' : 'Add Address'}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── Delete Address Confirmation ─── */}
      <AnimatePresence>
        {deleteAddress && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteAddress(null)} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-3xl shadow-2xl z-50 overflow-hidden">
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><AlertTriangle className="w-8 h-8 text-red-600" /></div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Address</h3>
                <p className="text-slate-600 mb-1">Remove this <strong>{deleteAddress.label}</strong> address?</p>
                <p className="text-sm text-slate-400 mb-6">{deleteAddress.street1}, {deleteAddress.city}</p>
                <div className="flex items-center gap-3">
                  <button onClick={() => setDeleteAddress(null)} className="flex-1 px-5 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all">Cancel</button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={confirmDeleteAddress} disabled={saving} className="flex-1 px-5 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── Upload Document Modal ─── */}
      <AnimatePresence>
        {showUploadModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setShowUploadModal(false); setUploadFiles([]); setUploadCustomType(''); setUploadDocTitle(''); }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-3xl shadow-2xl z-50 overflow-hidden max-h-[90vh] flex flex-col">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center"><Upload className="w-5 h-5 text-white" /></div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Upload Document</h3>
                    <p className="text-purple-200 text-sm">Add files to {v.name}</p>
                  </div>
                </div>
                <button onClick={() => { setShowUploadModal(false); setUploadFiles([]); setUploadCustomType(''); setUploadDocTitle(''); }} className="p-2 hover:bg-white/20 rounded-xl transition-colors"><X className="w-5 h-5 text-white" /></button>
              </div>
              <div className="p-6 space-y-5 overflow-y-auto max-h-[60vh]">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Document Type</label>
                  <div className="flex flex-wrap gap-2">
                    {DOCUMENT_TYPES.map(t => (
                      <button key={t} onClick={() => { setUploadDocType(t); if (t !== 'Other') setUploadCustomType(''); }} className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${uploadDocType === t ? 'bg-purple-100 text-purple-700 border-purple-300' : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300'}`}>{t}</button>
                    ))}
                  </div>
                  <AnimatePresence>
                    {uploadDocType === 'Other' && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <input
                          type="text"
                          placeholder="Enter custom document type..."
                          value={uploadCustomType}
                          onChange={e => setUploadCustomType(e.target.value)}
                          className="w-full mt-3 px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Document Title</label>
                  <input
                    type="text"
                    placeholder={uploadFiles.length > 0 ? uploadFiles[0].name : 'Enter document title (optional)'}
                    value={uploadDocTitle}
                    onChange={e => setUploadDocTitle(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all"
                  />
                  <p className="text-xs text-slate-400 mt-1">Leave empty to use the original file name</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Select Files</label>
                  <input ref={fileInputRef} type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.csv,.txt,.zip" onChange={e => { if (e.target.files) setUploadFiles(Array.from(e.target.files)); }} className="hidden" />
                  <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50/50 transition-all">
                    {uploadFiles.length === 0 ? (
                      <>
                        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3"><Plus className="w-7 h-7 text-slate-400" /></div>
                        <p className="text-sm font-semibold text-slate-700">Click to select files</p>
                        <p className="text-xs text-slate-400 mt-1">PDF, DOC, XLS, PNG, JPG, CSV, ZIP</p>
                      </>
                    ) : (
                      <div className="space-y-2">
                        {uploadFiles.map((file, idx) => {
                          const isImg = /\.(png|jpg|jpeg|gif|webp|svg|bmp)$/i.test(file.name);
                          return (
                            <div key={idx} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-slate-200">
                              {isImg ? (
                                <div className="w-9 h-9 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-white">
                                  <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover" />
                                </div>
                              ) : (
                                <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center shrink-0"><File className="w-4 h-4 text-purple-600" /></div>
                              )}
                              <div className="flex-1 text-left min-w-0">
                                <p className="text-sm font-semibold text-slate-900 truncate">{file.name}</p>
                                <p className="text-xs text-slate-400">{file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : `${(file.size / 1024).toFixed(0)} KB`}</p>
                              </div>
                              <button onClick={e => { e.stopPropagation(); setUploadFiles(prev => prev.filter((_, i) => i !== idx)); }} className="p-1 hover:bg-red-100 rounded-lg transition-colors"><X className="w-4 h-4 text-red-500" /></button>
                            </div>
                          );
                        })}
                        <p className="text-xs text-slate-400 mt-2">Click to add more files</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 rounded-xl px-4 py-3 border border-slate-200">
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Uploading as <strong className="text-slate-700">Current User</strong></span>
                </div>
              </div>
              <div className="px-6 pb-6 flex items-center gap-3 shrink-0">
                <button onClick={() => { setShowUploadModal(false); setUploadFiles([]); setUploadCustomType(''); setUploadDocTitle(''); }} className="flex-1 px-5 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all">Cancel</button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleUpload} disabled={uploadFiles.length === 0 || uploading} className="flex-1 px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</> : <><Upload className="w-4 h-4" /> Upload {uploadFiles.length > 0 ? `(${uploadFiles.length})` : ''}</>}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── Delete Document Confirmation ─── */}
      <AnimatePresence>
        {deleteDoc && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteDoc(null)} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-3xl shadow-2xl z-50 overflow-hidden">
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><AlertTriangle className="w-8 h-8 text-red-600" /></div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Document</h3>
                <p className="text-slate-600 mb-1">Are you sure you want to delete</p>
                <p className="font-bold text-slate-900 mb-6">{deleteDoc.name}?</p>
                <div className="flex items-center gap-3">
                  <button onClick={() => setDeleteDoc(null)} className="flex-1 px-5 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all">Cancel</button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleDeleteDoc} disabled={deleting} className="flex-1 px-5 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {deleting ? <><Loader2 className="w-4 h-4 animate-spin" /> Deleting...</> : <><Trash2 className="w-4 h-4" /> Delete</>}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── Contact Add/Edit Modal ─── */}
      <AnimatePresence>
        {showContactModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowContactModal(false)} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-3xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[90vh]">
              <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><User className="w-5 h-5 text-white" /></div>
                  <h3 className="text-lg font-bold text-white">{editingContact ? 'Edit Contact' : 'Add Contact'}</h3>
                </div>
                <button onClick={() => setShowContactModal(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><X className="w-5 h-5 text-white" /></button>
              </div>
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">First Name *</label>
                    <input type="text" value={contactForm.firstName} onChange={e => setContactForm({ ...contactForm, firstName: e.target.value })} placeholder="John" className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Last Name</label>
                    <input type="text" value={contactForm.lastName} onChange={e => setContactForm({ ...contactForm, lastName: e.target.value })} placeholder="Smith" className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Job Title</label>
                    <input type="text" value={contactForm.title} onChange={e => setContactForm({ ...contactForm, title: e.target.value })} placeholder="Sales Manager" className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Department</label>
                    <input type="text" value={contactForm.department} onChange={e => setContactForm({ ...contactForm, department: e.target.value })} placeholder="Sales" className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Email</label>
                    <input type="email" value={contactForm.email} onChange={e => setContactForm({ ...contactForm, email: e.target.value })} placeholder="john@example.com" className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Phone</label>
                    <input type="tel" value={contactForm.phone} onChange={e => setContactForm({ ...contactForm, phone: formatPhoneNumber(e.target.value) })} placeholder="(555) 123 - 4567" className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">WeChat ID</label>
                  <input type="text" value={contactForm.wechatId} onChange={e => setContactForm({ ...contactForm, wechatId: e.target.value })} placeholder="WeChat ID" className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all" />
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={contactForm.isPrimary} onChange={e => setContactForm({ ...contactForm, isPrimary: e.target.checked })} className="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500" />
                  <span className="text-sm font-bold text-slate-700">Set as primary contact</span>
                </label>
              </div>
              <div className="px-6 pb-6 flex items-center gap-3 shrink-0">
                <button onClick={() => setShowContactModal(false)} className="flex-1 px-5 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all">Cancel</button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSaveContact} disabled={savingContact} className="flex-1 px-5 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-bold hover:from-violet-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {savingContact ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> {editingContact ? 'Update' : 'Add'} Contact</>}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── Delete Contact Confirmation ─── */}
      <AnimatePresence>
        {deleteContact && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteContact(null)} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-3xl shadow-2xl z-50 overflow-hidden">
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><AlertTriangle className="w-8 h-8 text-red-600" /></div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Remove Contact</h3>
                <p className="text-slate-600 mb-1">Are you sure you want to remove</p>
                <p className="font-bold text-slate-900 mb-6">{deleteContact.name}?</p>
                <div className="flex items-center gap-3">
                  <button onClick={() => setDeleteContact(null)} className="flex-1 px-5 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all">Cancel</button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleDeleteContact(deleteContact)} className="flex-1 px-5 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all flex items-center justify-center gap-2">
                    <Trash2 className="w-4 h-4" /> Remove
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
