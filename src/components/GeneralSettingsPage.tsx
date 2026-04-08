import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, Settings as SettingsIcon, ChevronRight, ChevronDown, Package, ShoppingCart, Users, Database, Home, BarChart3, Boxes, Factory, TrendingUp, Palette, Plus, Edit, Trash2, X, GripVertical } from 'lucide-react';
import { useState, useRef, useCallback, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DraggableOption } from './DraggableOption';
import { TaxRateItem } from './TaxRateItem';

interface Module {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  settingsCount: number;
  items: SettingItem[];
}

interface SettingItem {
  id: string;
  name: string;
  itemCount: number;
  options: (string | OptionItem)[];  // Support both formats
}

interface OptionItem {
  value: string;
  localRates?: LocalTaxRate[];
  isState?: boolean;  // Flag to identify state-level entries
}

interface LocalTaxRate {
  id: string;
  location: string; // e.g., "Jefferson County" or "Zip: 35004"
  additionalRate: string; // e.g., "2.5%" 
  totalRate: string; // e.g., "6.5%"
}

const modules: Module[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    icon: Home,
    settingsCount: 5,
    items: [
      { 
        id: 'widgets', 
        name: 'Widget Configuration', 
        itemCount: 12,
        options: ['Sales Overview', 'Revenue Chart', 'Recent Orders', 'Top Products', 'Customer Activity', 'Inventory Alerts', 'Task List', 'Calendar View', 'Performance Metrics', 'Analytics Summary', 'Quick Actions', 'Notifications Panel']
      },
      { 
        id: 'kpis', 
        name: 'KPI Settings', 
        itemCount: 8,
        options: ['Total Revenue', 'Monthly Sales', 'Customer Acquisition', 'Order Fulfillment Rate', 'Inventory Turnover', 'Average Order Value', 'Customer Retention', 'Profit Margin']
      },
      { 
        id: 'layout', 
        name: 'Layout Options', 
        itemCount: 5,
        options: ['Grid View', 'List View', 'Card View', 'Compact View', 'Detailed View']
      },
      { 
        id: 'refresh', 
        name: 'Refresh Intervals', 
        itemCount: 3,
        options: ['Real-time (Live)', 'Every 5 minutes', 'Every 30 minutes']
      },
      { 
        id: 'notifications', 
        name: 'Dashboard Notifications', 
        itemCount: 6,
        options: ['Low Stock Alert', 'Order Received', 'Payment Confirmed', 'Shipment Dispatched', 'Customer Inquiry', 'System Update']
      },
    ],
  },
  {
    id: 'analytics',
    name: 'Analytics',
    icon: BarChart3,
    settingsCount: 6,
    items: [
      { 
        id: 'reports', 
        name: 'Report Templates', 
        itemCount: 15,
        options: ['Sales Report', 'Inventory Report', 'Customer Report', 'Product Performance', 'Revenue Analysis', 'Expense Report', 'Profit & Loss', 'Cash Flow', 'Growth Metrics', 'Regional Analysis', 'Seasonal Trends', 'Vendor Performance', 'Order Analytics', 'Return Analysis', 'Customer Lifetime Value']
      },
      { 
        id: 'metrics', 
        name: 'Custom Metrics', 
        itemCount: 10,
        options: ['Conversion Rate', 'Cart Abandonment', 'Customer Satisfaction', 'Net Promoter Score', 'Churn Rate', 'Engagement Rate', 'Click-through Rate', 'Bounce Rate', 'Average Session Duration', 'Return on Investment']
      },
      { 
        id: 'dashboards', 
        name: 'Analytics Dashboards', 
        itemCount: 8,
        options: ['Executive Dashboard', 'Sales Dashboard', 'Marketing Dashboard', 'Operations Dashboard', 'Finance Dashboard', 'Customer Dashboard', 'Product Dashboard', 'Inventory Dashboard']
      },
      { 
        id: 'exports', 
        name: 'Export Formats', 
        itemCount: 5,
        options: ['PDF', 'Excel (XLSX)', 'CSV', 'JSON', 'XML']
      },
      { 
        id: 'schedules', 
        name: 'Scheduled Reports', 
        itemCount: 7,
        options: ['Daily Summary', 'Weekly Report', 'Monthly Report', 'Quarterly Report', 'Annual Report', 'Custom Schedule', 'On-Demand']
      },
      { 
        id: 'alerts', 
        name: 'Analytics Alerts', 
        itemCount: 9,
        options: ['Revenue Threshold', 'Sales Drop Alert', 'Inventory Warning', 'Traffic Spike', 'Conversion Drop', 'Customer Churn', 'Budget Exceeded', 'Goal Achievement', 'Anomaly Detection']
      },
    ],
  },
  {
    id: 'products',
    name: 'Products',
    icon: Package,
    settingsCount: 8,
    items: [
      { 
        id: 'statuses', 
        name: 'Product Statuses', 
        itemCount: 4,
        options: ['Active', 'Draft', 'Archived', 'Out of Stock']
      },
      { 
        id: 'categories', 
        name: 'Product Categories', 
        itemCount: 15,
        options: ['Apparel', 'Drinkware', 'Tech Accessories', 'Office Supplies', 'Bags & Totes', 'Writing Instruments', 'Outdoor & Sports', 'Health & Wellness', 'Awards & Recognition', 'Trade Show Items', 'Home & Living', 'Eco-Friendly', 'Custom Branded', 'Seasonal Items', 'Premium Gifts']
      },
      { 
        id: 'types', 
        name: 'Product Types', 
        itemCount: 8,
        options: ['T-Shirts', 'Mugs', 'USB Drives', 'Notebooks', 'Pens', 'Keychains', 'Water Bottles', 'Hats']
      },
      { 
        id: 'priorities', 
        name: 'Priority Levels', 
        itemCount: 3,
        options: ['High', 'Medium', 'Low']
      },
      { 
        id: 'fields', 
        name: 'Custom Fields', 
        itemCount: 12,
        options: ['SKU', 'Vendor Code', 'Cost Price', 'Retail Price', 'Weight', 'Dimensions', 'Color Options', 'Size Options', 'Material', 'Minimum Order Qty', 'Lead Time', 'Country of Origin']
      },
      { 
        id: 'workflows', 
        name: 'Approval Workflows', 
        itemCount: 5,
        options: ['Manager Approval', 'Finance Review', 'Quality Check', 'Legal Compliance', 'Final Approval']
      },
      { 
        id: 'templates', 
        name: 'Product Templates', 
        itemCount: 7,
        options: ['Basic Product', 'Apparel Item', 'Tech Product', 'Drinkware', 'Gift Set', 'Custom Product', 'Service Item']
      },
      { 
        id: 'labels', 
        name: 'Labels & Tags', 
        itemCount: 20,
        options: ['Best Seller', 'New Arrival', 'Sale', 'Limited Edition', 'Eco-Friendly', 'Made in USA', 'Custom', 'Bulk Discount', 'Fast Ship', 'Premium', 'Clearance', 'Seasonal', 'Trending', 'Popular', 'Recommended', 'Featured', 'Exclusive', 'Back in Stock', 'Pre-Order', 'Discontinued']
      },
    ],
  },
  {
    id: 'pipeline',
    name: 'Product Pipeline',
    icon: TrendingUp,
    settingsCount: 5,
    items: [
      {
        id: 'vendors-checklist',
        name: 'Vendors Checklist',
        itemCount: 4,
        options: ['Primary Vendor Linked', 'Pricing Confirmed', 'Shipping Terms Agreed', 'Lead Time Confirmed'],
      },
      {
        id: 'specifications-checklist',
        name: 'Specifications Checklist',
        itemCount: 4,
        options: ['Product Dimensions', 'Material Specifications', 'Weight & Shipping Info', 'Compliance Documents'],
      },
      {
        id: 'packaging-checklist',
        name: 'Packaging Checklist',
        itemCount: 4,
        options: ['Packaging Mockup', 'Packaging Template', 'Dieline/CAD Files', 'Packaging Spec Sheet'],
      },
      {
        id: 'samples-checklist',
        name: 'Samples Checklist',
        itemCount: 4,
        options: ['Sample Request Submitted', 'Sample Received', 'Quality Review Completed', 'Sample Documentation'],
      },
      {
        id: 'files-checklist',
        name: 'Files Checklist',
        itemCount: 4,
        options: ['Product Images Uploaded', 'Spec Sheets Uploaded', 'Vendor Quotes Filed', 'Compliance Docs Filed'],
      },
    ],
  },
  {
    id: 'orders',
    name: 'Orders',
    icon: ShoppingCart,
    settingsCount: 9,
    items: [
      { 
        id: 'order-types', 
        name: 'Order Types', 
        itemCount: 6,
        options: ['Standard', 'Rush', 'Sample', 'Bulk', 'Custom', 'Subscription']
      },
      { 
        id: 'payment-terms', 
        name: 'Payment Terms', 
        itemCount: 8,
        options: ['Net 30', 'Net 60', 'Net 90', 'Due on Receipt', '50% Deposit', 'Credit Card', 'Wire Transfer', 'PayPal']
      },
      { 
        id: 'shipping-methods', 
        name: 'Shipping Methods', 
        itemCount: 10,
        options: ['Standard Ground', 'Expedited', 'Overnight', 'International', '2-Day Air', 'USPS Priority', 'FedEx', 'UPS', 'DHL', 'Freight']
      },
      { 
        id: 'order-statuses', 
        name: 'Order Statuses', 
        itemCount: 7,
        options: ['Pending', 'Processing', 'On Hold', 'Shipped', 'Delivered', 'Cancelled', 'Refunded']
      },
      { 
        id: 'fulfillment', 
        name: 'Fulfillment Rules', 
        itemCount: 5,
        options: ['First In First Out', 'Priority Based', 'Location Based', 'Customer Tier', 'Deadline Based']
      },
      { 
        id: 'returns', 
        name: 'Return Policies', 
        itemCount: 4,
        options: ['30-Day Return', '60-Day Return', 'Exchange Only', 'No Returns']
      },
      { 
        id: 'discounts', 
        name: 'Discount Types', 
        itemCount: 12,
        options: ['Percentage Off', 'Fixed Amount', 'Buy One Get One', 'Volume Discount', 'Early Bird', 'Loyalty Discount', 'Referral Discount', 'Seasonal Sale', 'Clearance', 'Bundle Deal', 'First Order', 'Student Discount']
      },
      { 
        id: 'tax-rates', 
        name: 'Tax Rates', 
        itemCount: 15,
        options: ['Florida Sales Tax', 'California Sales Tax', 'Texas Sales Tax', 'New York Sales Tax', 'Illinois Sales Tax', 'Georgia Sales Tax', 'Pennsylvania Sales Tax', 'Ohio Sales Tax', 'North Carolina Sales Tax', 'Michigan Sales Tax', 'VAT - UK', 'VAT - EU', 'GST - Canada', 'GST - Australia', 'Tax Exempt']
      },
      { 
        id: 'invoicing', 
        name: 'Invoice Settings', 
        itemCount: 9,
        options: ['Standard Invoice', 'Pro Forma Invoice', 'Commercial Invoice', 'Credit Note', 'Debit Note', 'Receipt', 'Quote', 'Purchase Order', 'Packing Slip']
      },
    ],
  },
  {
    id: 'customers',
    name: 'Customers',
    icon: Users,
    settingsCount: 4,
    items: [
      { 
        id: 'segments', 
        name: 'Customer Segments', 
        itemCount: 8,
        options: ['VIP', 'Wholesale', 'Retail', 'Corporate', 'Small Business', 'Individual', 'Non-Profit', 'Educational']
      },
      { 
        id: 'types', 
        name: 'Customer Types', 
        itemCount: 5,
        options: ['B2B', 'B2C', 'Distributor', 'Reseller', 'End User']
      },
      { 
        id: 'tiers', 
        name: 'Customer Tiers', 
        itemCount: 4,
        options: ['Platinum', 'Gold', 'Silver', 'Bronze']
      },
      { 
        id: 'communication', 
        name: 'Communication Preferences', 
        itemCount: 10,
        options: ['Email', 'Phone', 'SMS', 'WhatsApp', 'Slack', 'In-App', 'Newsletter', 'Promotional', 'Transactional', 'Support Tickets']
      },
    ],
  },
  {
    id: 'vendors',
    name: 'Vendors',
    icon: Database,
    settingsCount: 6,
    items: [
      { 
        id: 'vendor-types', 
        name: 'Vendor Types', 
        itemCount: 5,
        options: ['Manufacturer', 'Wholesaler', 'Distributor', 'Importer', 'Dropshipper']
      },
      { 
        id: 'platforms', 
        name: 'Sourcing Platforms', 
        itemCount: 7,
        options: ['Alibaba', 'Global Sources', 'Made-in-China', 'ThomasNet', 'Direct Import', 'Local Supplier', 'Other']
      },
      { 
        id: 'payment-terms', 
        name: 'Payment Terms', 
        itemCount: 6,
        options: ['Net 30', 'Net 60', 'Prepayment', '50% Deposit', 'Letter of Credit', 'Cash on Delivery']
      },
      { 
        id: 'performance', 
        name: 'Performance Metrics', 
        itemCount: 9,
        options: ['On-Time Delivery', 'Quality Score', 'Response Time', 'Price Competitiveness', 'Communication', 'Flexibility', 'Capacity', 'Compliance', 'Overall Rating']
      },
      { 
        id: 'certifications', 
        name: 'Certifications Required', 
        itemCount: 8,
        options: ['ISO 9001', 'ISO 14001', 'BSCI', 'SEDEX', 'Fair Trade', 'Organic', 'FSC', 'RoHS']
      },
      { 
        id: 'contracts', 
        name: 'Contract Templates', 
        itemCount: 4,
        options: ['Standard Agreement', 'NDA', 'Exclusive Partnership', 'Short-term Contract']
      },
    ],
  },
  {
    id: 'inventory',
    name: 'Inventory',
    icon: Boxes,
    settingsCount: 7,
    items: [
      { 
        id: 'warehouses', 
        name: 'Warehouse Locations', 
        itemCount: 6,
        options: ['Miami Main Warehouse', 'Los Angeles Hub', 'New York Facility', 'Chicago Distribution', 'Dallas Center', 'Seattle Depot']
      },
      { 
        id: 'stock-levels', 
        name: 'Stock Level Alerts', 
        itemCount: 8,
        options: ['Critical Low (10%)', 'Low Stock (25%)', 'Reorder Point (50%)', 'Optimal Level', 'Overstock Warning', 'Expiry Alert', 'Slow Moving', 'Fast Moving']
      },
      { 
        id: 'tracking', 
        name: 'Inventory Tracking', 
        itemCount: 10,
        options: ['SKU', 'Barcode', 'QR Code', 'RFID', 'Lot Number', 'Serial Number', 'Expiration Date', 'Location Bin', 'Batch Tracking', 'Real-time Count']
      },
      { 
        id: 'adjustments', 
        name: 'Adjustment Types', 
        itemCount: 5,
        options: ['Damaged', 'Lost', 'Found', 'Return to Stock', 'Manual Correction']
      },
      { 
        id: 'transfers', 
        name: 'Transfer Settings', 
        itemCount: 4,
        options: ['Inter-warehouse Transfer', 'Store Transfer', 'Customer Direct', 'Vendor Return']
      },
      { 
        id: 'valuation', 
        name: 'Valuation Methods', 
        itemCount: 3,
        options: ['FIFO (First In, First Out)', 'LIFO (Last In, First Out)', 'Weighted Average']
      },
      { 
        id: 'reporting', 
        name: 'Inventory Reports', 
        itemCount: 11,
        options: ['Stock Level Report', 'Movement Report', 'Aging Report', 'Valuation Report', 'Turnover Report', 'Reorder Report', 'Dead Stock Report', 'ABC Analysis', 'Variance Report', 'Forecast Report', 'Audit Report']
      },
    ],
  },
  {
    id: 'production',
    name: 'Production',
    icon: Factory,
    settingsCount: 5,
    items: [
      { 
        id: 'work-orders', 
        name: 'Work Order Types', 
        itemCount: 7,
        options: ['Standard Production', 'Rush Order', 'Rework', 'Quality Control', 'Maintenance', 'Testing', 'Custom Job']
      },
      { 
        id: 'stations', 
        name: 'Production Stations', 
        itemCount: 12,
        options: ['Cutting', 'Printing', 'Embroidery', 'Heat Press', 'Assembly', 'Quality Check', 'Packaging', 'Labeling', 'Finishing', 'Inspection', 'Shipping Prep', 'Storage']
      },
      { 
        id: 'schedules', 
        name: 'Scheduling Rules', 
        itemCount: 9,
        options: ['First Come First Serve', 'Priority Based', 'Deadline Driven', 'Resource Optimization', 'Capacity Based', 'Customer Tier', 'Order Value', 'Production Time', 'Material Availability']
      },
      { 
        id: 'quality', 
        name: 'Quality Control', 
        itemCount: 8,
        options: ['Initial Inspection', 'In-Process Check', 'Final Inspection', 'Random Sampling', 'Defect Tracking', 'Rework Process', 'Approval Sign-off', 'Customer QC']
      },
      { 
        id: 'capacity', 
        name: 'Capacity Planning', 
        itemCount: 6,
        options: ['Daily Capacity', 'Weekly Capacity', 'Machine Hours', 'Labor Hours', 'Shift Planning', 'Overtime Allocation']
      },
    ],
  },
  {
    id: 'design-lab',
    name: 'Design Lab',
    icon: Palette,
    settingsCount: 4,
    items: [
      { 
        id: 'templates', 
        name: 'Design Templates', 
        itemCount: 20,
        options: ['T-Shirt Design', 'Mug Wrap', 'Business Card', 'Flyer', 'Banner', 'Poster', 'Brochure', 'Logo', 'Social Media Post', 'Email Header', 'Label', 'Sticker', 'Packaging', 'Menu', 'Certificate', 'Invitation', 'Ticket', 'Badge', 'Bookmark', 'Calendar']
      },
      { 
        id: 'assets', 
        name: 'Asset Library', 
        itemCount: 150,
        options: ['Company Logos', 'Product Photos', 'Background Images', 'Icons', 'Patterns', 'Textures', 'Illustrations', 'Stock Photos', 'Mockups', 'Templates']
      },
      { 
        id: 'fonts', 
        name: 'Font Collections', 
        itemCount: 35,
        options: ['Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Oswald', 'Raleway', 'Poppins', 'Nunito', 'Ubuntu', 'Playfair Display', 'Merriweather', 'Bebas Neue', 'Lobster', 'Pacifico', 'Dancing Script', 'Brush Script', 'Impact', 'Comic Sans MS', 'Courier New', 'Futura', 'Garamond', 'Bodoni', 'Rockwell', 'Century Gothic', 'Avant Garde', 'Optima', 'Copperplate', 'Franklin Gothic', 'Gill Sans', 'Custom Fonts']
      },
      { 
        id: 'colors', 
        name: 'Color Palettes', 
        itemCount: 25,
        options: ['Brand Primary', 'Brand Secondary', 'Neutral Tones', 'Vibrant Colors', 'Pastel Shades', 'Earth Tones', 'Ocean Blues', 'Sunset Warm', 'Forest Greens', 'Royal Purple', 'Coral Reef', 'Monochrome', 'Black & White', 'Red Spectrum', 'Blue Spectrum', 'Green Spectrum', 'Yellow Spectrum', 'Purple Spectrum', 'Orange Spectrum', 'Pink Spectrum', 'Metallic', 'Neon', 'Vintage', 'Modern Minimal', 'Corporate']
      },
    ],
  },
  {
    id: 'purchasing',
    name: 'Purchasing',
    icon: ShoppingCart,
    settingsCount: 1,
    items: [
      { 
        id: 'sales-tax-rates', 
        name: 'Sales Tax Rates', 
        itemCount: 50,
        options: [
          { value: 'Alabama', isState: true, localRates: [
            { id: '1', location: 'Jefferson County', additionalRate: '+2.5%', totalRate: '6.5%' },
            { id: '2', location: 'Mobile County', additionalRate: '+1%', totalRate: '5%' },
            { id: '3', location: 'Zip 35004', additionalRate: '+3%', totalRate: '7%' },
          ] },
          { value: 'Alaska', isState: true, localRates: [] },
          { value: 'Arizona', isState: true, localRates: [] },
          { value: 'Arkansas', isState: true, localRates: [] },
          { value: 'California', isState: true, localRates: [
            { id: '4', location: 'Los Angeles County', additionalRate: '+2.25%', totalRate: '9.5%' },
            { id: '5', location: 'San Francisco', additionalRate: '+1.5%', totalRate: '8.75%' },
          ] },
          { value: 'Colorado', isState: true, localRates: [] },
          { value: 'Connecticut', isState: true, localRates: [] },
          { value: 'Delaware', isState: true, localRates: [] },
          { value: 'Florida', isState: true, localRates: [
            { id: '6', location: 'Miami-Dade County', additionalRate: '+1%', totalRate: '7%' },
          ] },
          { value: 'Georgia', isState: true, localRates: [] },
          { value: 'Hawaii', isState: true, localRates: [] },
          { value: 'Idaho', isState: true, localRates: [] },
          { value: 'Illinois', isState: true, localRates: [] },
          { value: 'Indiana', isState: true, localRates: [] },
          { value: 'Iowa', isState: true, localRates: [] },
          { value: 'Kansas', isState: true, localRates: [] },
          { value: 'Kentucky', isState: true, localRates: [] },
          { value: 'Louisiana', isState: true, localRates: [] },
          { value: 'Maine', isState: true, localRates: [] },
          { value: 'Maryland', isState: true, localRates: [] },
          { value: 'Massachusetts', isState: true, localRates: [] },
          { value: 'Michigan', isState: true, localRates: [] },
          { value: 'Minnesota', isState: true, localRates: [] },
          { value: 'Mississippi', isState: true, localRates: [] },
          { value: 'Missouri', isState: true, localRates: [] },
          { value: 'Montana', isState: true, localRates: [] },
          { value: 'Nebraska', isState: true, localRates: [] },
          { value: 'Nevada', isState: true, localRates: [] },
          { value: 'New Hampshire', isState: true, localRates: [] },
          { value: 'New Jersey', isState: true, localRates: [] },
          { value: 'New Mexico', isState: true, localRates: [] },
          { value: 'New York', isState: true, localRates: [
            { id: '7', location: 'New York City', additionalRate: '+4.5%', totalRate: '8.5%' },
          ] },
          { value: 'North Carolina', isState: true, localRates: [] },
          { value: 'North Dakota', isState: true, localRates: [] },
          { value: 'Ohio', isState: true, localRates: [] },
          { value: 'Oklahoma', isState: true, localRates: [] },
          { value: 'Oregon', isState: true, localRates: [] },
          { value: 'Pennsylvania', isState: true, localRates: [] },
          { value: 'Rhode Island', isState: true, localRates: [] },
          { value: 'South Carolina', isState: true, localRates: [] },
          { value: 'South Dakota', isState: true, localRates: [] },
          { value: 'Tennessee', isState: true, localRates: [] },
          { value: 'Texas', isState: true, localRates: [
            { id: '8', location: 'Harris County (Houston)', additionalRate: '+2%', totalRate: '8.25%' },
          ] },
          { value: 'Utah', isState: true, localRates: [] },
          { value: 'Vermont', isState: true, localRates: [] },
          { value: 'Virginia', isState: true, localRates: [] },
          { value: 'Washington', isState: true, localRates: [] },
          { value: 'West Virginia', isState: true, localRates: [] },
          { value: 'Wisconsin', isState: true, localRates: [] },
          { value: 'Wyoming', isState: true, localRates: [] },
        ]
      },
    ],
  },
];

export function GeneralSettingsPage() {
  const [selectedModule, setSelectedModule] = useState<string | null>('dashboard');
  const [expandedSetting, setExpandedSetting] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingOption, setEditingOption] = useState<{ settingId: string; optionValue: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [newOption, setNewOption] = useState<{ settingId: string; value: string } | null>(null);
  const [localModules, setLocalModules] = useState(modules);
  const [pipelineSettingsLoaded, setPipelineSettingsLoaded] = useState(false);
  const prevPipelineRef = useRef<string>('');

  // ── Load pipeline checklist settings from API on mount ──
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/pipeline/settings/get');
        if (!res.ok) return;
        const data = await res.json();
        if (data.checklists) {
          setLocalModules(prev => prev.map(mod => {
            if (mod.id !== 'pipeline') return mod;
            return {
              ...mod,
              items: mod.items.map(item => {
                const tabKey = item.id.replace('-checklist', '');
                if (data.checklists[tabKey]) {
                  return { ...item, options: data.checklists[tabKey], itemCount: data.checklists[tabKey].length };
                }
                return item;
              }),
            };
          }));
        }
      } catch {}
      finally { setPipelineSettingsLoaded(true); }
    };
    load();
  }, []);

  // ── Auto-save pipeline checklist settings when they change ──
  useEffect(() => {
    if (!pipelineSettingsLoaded) return;
    const pipelineMod = localModules.find(m => m.id === 'pipeline');
    if (!pipelineMod) return;
    const serialized = JSON.stringify(pipelineMod.items.map(i => ({ id: i.id, options: i.options })));
    if (prevPipelineRef.current && prevPipelineRef.current !== serialized) {
      const checklists: Record<string, string[]> = {};
      pipelineMod.items.forEach(item => {
        const tabKey = item.id.replace('-checklist', '');
        checklists[tabKey] = item.options.map(o => typeof o === 'string' ? o : (o as any).value);
      });
      fetch('/api/pipeline/settings/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checklists }),
      }).catch(() => {});
    }
    prevPipelineRef.current = serialized;
  }, [localModules, pipelineSettingsLoaded]);

  const selectedModuleData = localModules.find(m => m.id === selectedModule);
  const totalSettings = localModules.reduce((sum, m) => sum + m.settingsCount, 0);

  const filteredModules = localModules.filter(module =>
    module.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleSetting = (settingId: string) => {
    setExpandedSetting(expandedSetting === settingId ? null : settingId);
    setNewOption(null);
    setEditingOption(null);
  };

  const handleAddOption = (settingId: string) => {
    if (!newOption?.value.trim() || !selectedModule) return;
    
    setLocalModules(prevModules => 
      prevModules.map(mod => {
        if (mod.id === selectedModule) {
          return {
            ...mod,
            items: mod.items.map(item => {
              if (item.id === settingId) {
                return {
                  ...item,
                  options: [...item.options, newOption.value.trim()],
                  itemCount: item.options.length + 1
                };
              }
              return item;
            })
          };
        }
        return mod;
      })
    );
    
    setNewOption(null);
  };

  const handleEditOption = (settingId: string, option: string) => {
    setEditingOption({ settingId, optionValue: option });
    setEditValue(option);
    setNewOption(null);
  };

  const handleSaveEdit = (settingId: string, oldValue: string) => {
    if (!editValue.trim() || !selectedModule) return;
    
    setLocalModules(prevModules =>
      prevModules.map(mod => {
        if (mod.id === selectedModule) {
          return {
            ...mod,
            items: mod.items.map(item => {
              if (item.id === settingId) {
                return {
                  ...item,
                  options: item.options.map(opt => {
                    const optValue = typeof opt === 'string' ? opt : opt.value;
                    return optValue === oldValue ? editValue.trim() : opt;
                  })
                };
              }
              return item;
            })
          };
        }
        return mod;
      })
    );
    
    setEditingOption(null);
    setEditValue('');
  };

  const handleDeleteOption = (settingId: string, option: string) => {
    if (!selectedModule) return;
    
    setLocalModules(prevModules =>
      prevModules.map(mod => {
        if (mod.id === selectedModule) {
          return {
            ...mod,
            items: mod.items.map(item => {
              if (item.id === settingId) {
                return {
                  ...item,
                  options: item.options.filter(opt => {
                    const optValue = typeof opt === 'string' ? opt : opt.value;
                    return optValue !== option;
                  }),
                  itemCount: item.options.length - 1
                };
              }
              return item;
            })
          };
        }
        return mod;
      })
    );
  };

  const handleMoveOption = useCallback((settingId: string, dragIndex: number, hoverIndex: number) => {
    if (!selectedModule) return;
    
    setLocalModules(prevModules =>
      prevModules.map(mod => {
        if (mod.id === selectedModule) {
          return {
            ...mod,
            items: mod.items.map(item => {
              if (item.id === settingId) {
                const newOptions = [...item.options];
                const [removed] = newOptions.splice(dragIndex, 1);
                newOptions.splice(hoverIndex, 0, removed);
                return {
                  ...item,
                  options: newOptions
                };
              }
              return item;
            })
          };
        }
        return mod;
      })
    );
  }, [selectedModule]);

  return (
    <DndProvider backend={HTML5Backend}>
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
      {/* Blue Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <SettingsIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">General Settings</h2>
              <p className="text-blue-100 mt-1">
                Manage dropdown options and system-wide settings across all modules
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
          >
            Save Changes
          </motion.button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-8 py-6 bg-white border-b border-slate-200">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search settings by module or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 mt-3 text-sm text-slate-600">
          <Filter className="w-4 h-4" />
          <span>{filteredModules.length} modules • {totalSettings} settings</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Modules List */}
        <div className="w-80 bg-white border-r border-slate-200 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </div>
              <h3 className="font-bold text-slate-900">Modules</h3>
            </div>

            <div className="space-y-2">
              {filteredModules.map((module) => {
                const Icon = module.icon;
                const isSelected = selectedModule === module.id;

                return (
                  <motion.button
                    key={module.id}
                    onClick={() => {
                      setSelectedModule(module.id);
                      setExpandedSetting(null);
                      setNewOption(null);
                      setEditingOption(null);
                    }}
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
                        <div className={`font-semibold text-sm ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                          {module.name}
                        </div>
                        <div className={`text-xs ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                          {module.settingsCount} settings
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

        {/* Right Panel - Settings with Inline Options */}
        <div className="flex-1 bg-slate-50 overflow-y-auto">
          {selectedModuleData ? (
            <div className="p-8">
              <div className="max-w-4xl space-y-4">
                {selectedModuleData.items.map((item, index) => {
                  const isExpanded = expandedSetting === item.id;
                  const isAddingNew = newOption?.settingId === item.id;

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm"
                    >
                      {/* Setting Header */}
                      <motion.button
                        onClick={() => handleToggleSetting(item.id)}
                        className="w-full p-6 hover:bg-slate-50 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div className="text-left">
                              <h4 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                                {item.name}
                              </h4>
                              <p className="text-sm text-slate-500">{item.itemCount} items</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="px-4 py-2 bg-blue-50 rounded-lg">
                              <span className="text-blue-600 font-bold text-lg">{item.itemCount}</span>
                            </div>
                            <motion.div
                              animate={{ rotate: isExpanded ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                            </motion.div>
                          </div>
                        </div>
                      </motion.button>

                      {/* Expanded Options */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="border-t border-slate-200 bg-slate-50"
                          >
                            <div className="p-6 space-y-3">
                              {/* Add New Button/Form */}
                              {!isAddingNew ? (
                                <motion.button
                                  whileHover={{ scale: 1.01 }}
                                  whileTap={{ scale: 0.99 }}
                                  onClick={() => setNewOption({ settingId: item.id, value: '' })}
                                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                                >
                                  <Plus className="w-5 h-5" />
                                  Add New Option
                                </motion.button>
                              ) : (
                                <div className="bg-white rounded-xl border-2 border-blue-200 p-4 shadow-lg">
                                  <div className="flex items-center gap-3">
                                    <input
                                      type="text"
                                      value={newOption.value}
                                      onChange={(e) => setNewOption({ settingId: item.id, value: e.target.value })}
                                      placeholder="Enter new option name..."
                                      className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                      autoFocus
                                      onKeyPress={(e) => e.key === 'Enter' && handleAddOption(item.id)}
                                    />
                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() => handleAddOption(item.id)}
                                      disabled={!newOption.value.trim()}
                                      className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      Add
                                    </motion.button>
                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() => setNewOption(null)}
                                      className="px-4 py-2 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition-colors"
                                    >
                                      Cancel
                                    </motion.button>
                                  </div>
                                </div>
                              )}

                              {/* Options List */}
                              {item.id === 'sales-tax-rates' ? (
                                // Special rendering for Sales Tax Rates with hierarchical structure
                                item.options.map((option, optIndex) => {
                                  if (typeof option !== 'string' && option.isState) {
                                    return (
                                      <TaxRateItem
                                        key={`${option.value}-${optIndex}`}
                                        stateName={option.value}
                                        index={optIndex}
                                        localRates={option.localRates}
                                        onEdit={(stateName) => handleEditOption(item.id, stateName)}
                                        onDelete={(stateName) => handleDeleteOption(item.id, stateName)}
                                        onAddLocalRate={(stateName) => {
                                          // TODO: Implement add local rate
                                          console.log('Add local rate for', stateName);
                                        }}
                                        onEditLocalRate={(stateName, rateId) => {
                                          // TODO: Implement edit local rate
                                          console.log('Edit local rate', rateId, 'for', stateName);
                                        }}
                                        onDeleteLocalRate={(stateName, rateId) => {
                                          // TODO: Implement delete local rate
                                          console.log('Delete local rate', rateId, 'for', stateName);
                                        }}
                                      />
                                    );
                                  }
                                  return null;
                                })
                              ) : (
                                // Regular rendering for other settings
                                item.options.map((option, optIndex) => {
                                  const optionValue = typeof option === 'string' ? option : option.value;
                                  const isEditing = editingOption?.settingId === item.id && editingOption?.optionValue === optionValue;

                                  return (
                                    <DraggableOption
                                      key={`${optionValue}-${optIndex}`}
                                      option={optionValue}
                                      index={optIndex}
                                      settingId={item.id}
                                      isEditing={isEditing}
                                      editValue={editValue}
                                      onEdit={handleEditOption}
                                      onDelete={handleDeleteOption}
                                      onSaveEdit={handleSaveEdit}
                                      onCancelEdit={() => {
                                        setEditingOption(null);
                                        setEditValue('');
                                      }}
                                      onEditValueChange={setEditValue}
                                      onMoveOption={(dragIndex, hoverIndex) => handleMoveOption(item.id, dragIndex, hoverIndex)}
                                    />
                                  );
                                })
                              )}

                              {item.options.length === 0 && !isAddingNew && (
                                <div className="text-center py-8">
                                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Package className="w-8 h-8 text-slate-400" />
                                  </div>
                                  <p className="text-slate-600 font-medium">No options yet</p>
                                  <p className="text-slate-500 text-sm mt-1">Click "Add New Option" to get started</p>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </div>
                <p className="text-slate-600 font-medium">Select a module to view settings</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </DndProvider>
  );
}