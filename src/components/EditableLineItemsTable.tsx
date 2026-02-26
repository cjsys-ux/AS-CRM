import { motion, AnimatePresence } from 'motion/react';
import { Plus, X, Edit, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import React from 'react';

interface SubItem {
  id: string;
  type: 'setup' | 'run' | 'shipping' | 'other';
  description: string;
  amount: number;
}

interface LineItem {
  id: string;
  sku: string;
  vendor: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
  subItems?: SubItem[];
  expanded?: boolean;
}

interface CustomLineItem {
  id: string;
  name: string;
  amount: number;
}

interface EditableLineItemsTableProps {
  lineItems: LineItem[];
  customLineItems: CustomLineItem[];
  salesTaxRate: number;
  taxStatus?: 'standard' | 'oos' | 'exempt';
  isEditingItems: boolean;
  onLineItemsChange: (items: LineItem[]) => void;
  onCustomLineItemsChange: (items: CustomLineItem[]) => void;
  onSalesTaxRateChange: (rate: number) => void;
  onTaxStatusChange?: (status: 'standard' | 'oos' | 'exempt') => void;
  onEditToggle: (isEditing: boolean) => void;
}

export function EditableLineItemsTable({
  lineItems,
  customLineItems,
  salesTaxRate,
  taxStatus = 'standard',
  isEditingItems,
  onLineItemsChange,
  onCustomLineItemsChange,
  onSalesTaxRateChange,
  onTaxStatusChange,
  onEditToggle,
}: EditableLineItemsTableProps) {
  // Calculate totals
  const effectiveTaxRate = taxStatus === 'standard' ? salesTaxRate : 0;
  
  // Subtotal from line items + their sub-items
  const subtotal = lineItems.reduce((sum, item) => {
    const itemTotal = item.quantity * item.unitPrice;
    const subItemsTotal = (item.subItems || []).reduce((subSum, subItem) => subSum + subItem.amount, 0);
    return sum + itemTotal + subItemsTotal;
  }, 0);
  
  // Custom items total (excluding shipping which gets its own line)
  const customItemsTotal = customLineItems
    .filter(item => item.name !== 'Shipping Fee')
    .reduce((sum, item) => sum + item.amount, 0);
  
  // Calculate total shipping from sub-items and custom line items
  const shippingTotal = [
    ...lineItems.flatMap(item => (item.subItems || []).filter(sub => sub.type === 'shipping')),
    ...customLineItems.filter(item => item.name === 'Shipping Fee')
  ].reduce((sum, item) => sum + (item.amount || 0), 0);
  
  const subtotalWithCustom = subtotal + customItemsTotal;
  const salesTax = (subtotalWithCustom + shippingTotal) * effectiveTaxRate;
  const total = subtotalWithCustom + shippingTotal + salesTax;

  const handleAddLineItem = () => {
    onLineItemsChange([
      ...lineItems,
      {
        id: String(Date.now()),
        sku: '',
        vendor: '',
        size: '',
        color: '',
        quantity: 1,
        unitPrice: 0,
        subItems: [],
        expanded: false,
      },
    ]);
  };

  const handleRemoveLineItem = (index: number) => {
    onLineItemsChange(lineItems.filter((_, i) => i !== index));
  };

  const handleUpdateLineItem = (index: number, field: keyof LineItem, value: any) => {
    const newItems = [...lineItems];
    newItems[index] = { ...newItems[index], [field]: value };
    onLineItemsChange(newItems);
  };

  const handleToggleExpand = (index: number) => {
    const newItems = [...lineItems];
    newItems[index].expanded = !newItems[index].expanded;
    onLineItemsChange(newItems);
  };

  const handleAddSubItem = (lineItemIndex: number) => {
    const newItems = [...lineItems];
    const newSubItem: SubItem = {
      id: String(Date.now()),
      type: 'setup',
      description: 'Setup Fee',
      amount: 0,
    };
    if (!newItems[lineItemIndex].subItems) {
      newItems[lineItemIndex].subItems = [];
    }
    newItems[lineItemIndex].subItems!.push(newSubItem);
    newItems[lineItemIndex].expanded = true; // Auto-expand when adding
    onLineItemsChange(newItems);
  };

  const handleRemoveSubItem = (lineItemIndex: number, subItemIndex: number) => {
    const newItems = [...lineItems];
    if (newItems[lineItemIndex].subItems) {
      newItems[lineItemIndex].subItems = newItems[lineItemIndex].subItems!.filter((_, i) => i !== subItemIndex);
    }
    onLineItemsChange(newItems);
  };

  const handleUpdateSubItem = (lineItemIndex: number, subItemIndex: number, field: keyof SubItem, value: any) => {
    const newItems = [...lineItems];
    if (newItems[lineItemIndex].subItems) {
      const updatedSubItem = { ...newItems[lineItemIndex].subItems![subItemIndex], [field]: value };
      
      // Auto-update description based on type
      if (field === 'type') {
        const typeDescriptions = {
          setup: 'Setup Fee',
          run: 'Run Charge',
          shipping: 'Shipping Cost',
          other: 'Other Charge'
        };
        updatedSubItem.description = typeDescriptions[value as SubItem['type']];
      }
      
      newItems[lineItemIndex].subItems![subItemIndex] = updatedSubItem;
    }
    onLineItemsChange(newItems);
  };

  const handleAddCustomCharge = () => {
    onCustomLineItemsChange([
      ...customLineItems,
      {
        id: String(Date.now()),
        name: 'Setup Fee',
        amount: 0,
      },
    ]);
  };

  const handleRemoveCustomCharge = (index: number) => {
    onCustomLineItemsChange(customLineItems.filter((_, i) => i !== index));
  };

  const handleUpdateCustomCharge = (index: number, field: keyof CustomLineItem, value: any) => {
    const newItems = [...customLineItems];
    newItems[index] = { ...newItems[index], [field]: value };
    onCustomLineItemsChange(newItems);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-900">Line Items</h3>
        {!isEditingItems ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onEditToggle(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Edit className="w-4 h-4" />
            Edit Items
          </motion.button>
        ) : (
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onEditToggle(false)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition-colors text-sm"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onEditToggle(false)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              Save Changes
            </motion.button>
          </div>
        )}
      </div>

      {/* Line Items Table */}
      <div className="bg-slate-50 rounded-xl overflow-hidden border border-slate-200">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200">
              {lineItems.some(item => (item.subItems?.length || 0) > 0) && (
                <th className="px-3 py-3 text-left text-xs font-bold text-slate-700 uppercase w-8"></th>
              )}
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">SKU</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Vendor</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Size</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Color</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Unit Price</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Total</th>
              {isEditingItems && (
                <th className="px-6 py-3 text-center text-xs font-bold text-slate-700 uppercase">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {lineItems.flatMap((item, index) => {
              const rows = [];
              
              // Main line item row
              rows.push(
                <tr key={`main-${item.id}`} className="border-b border-slate-200 bg-white hover:bg-slate-50">
                  {lineItems.some(item => (item.subItems?.length || 0) > 0) && (
                    <td className="px-3 py-4">
                      {item.subItems && item.subItems.length > 0 && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleToggleExpand(index)}
                          className="p-1 hover:bg-slate-200 rounded transition-colors"
                        >
                          {item.expanded ? (
                            <ChevronDown className="w-4 h-4 text-slate-600" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-600" />
                          )}
                        </motion.button>
                      )}
                    </td>
                  )}
                  <td className="px-6 py-4">
                    {isEditingItems ? (
                      <input
                        type="text"
                        value={item.sku}
                        onChange={(e) => handleUpdateLineItem(index, 'sku', e.target.value)}
                        placeholder="Enter SKU"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <span className="text-sm font-medium text-slate-900">{item.sku}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {isEditingItems ? (
                      <input
                        type="text"
                        value={item.vendor}
                        onChange={(e) => handleUpdateLineItem(index, 'vendor', e.target.value)}
                        placeholder="Vendor"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <span className="text-sm text-slate-700">{item.vendor}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {isEditingItems ? (
                      <input
                        type="text"
                        value={item.size}
                        onChange={(e) => handleUpdateLineItem(index, 'size', e.target.value)}
                        placeholder="Size"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <span className="text-sm text-slate-700">{item.size}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {isEditingItems ? (
                      <input
                        type="text"
                        value={item.color}
                        onChange={(e) => handleUpdateLineItem(index, 'color', e.target.value)}
                        placeholder="Color"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <span className="text-sm text-slate-700">{item.color}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {isEditingItems ? (
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleUpdateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-20 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <span className="text-sm text-slate-700">{item.quantity}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {isEditingItems ? (
                      <div className="flex items-center">
                        <span className="text-sm text-slate-500 mr-1">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => handleUpdateLineItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-24 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    ) : (
                      <span className="text-sm text-slate-700">${item.unitPrice.toFixed(2)}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-slate-900">${(item.quantity * item.unitPrice).toFixed(2)}</span>
                  </td>
                  {isEditingItems && (
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleAddSubItem(index)}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors font-medium"
                          title="Add Setup Fee / Shipping / etc."
                        >
                          + Fee
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleRemoveLineItem(index)}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </motion.button>
                      </div>
                    </td>
                  )}
                </tr>
              );

              // Sub-items rows
              if (isEditingItems && item.expanded && item.subItems && item.subItems.length > 0) {
                item.subItems.forEach((subItem, subIndex) => {
                  rows.push(
                    <motion.tr
                      key={subItem.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-blue-50/50 border-b border-blue-100"
                    >
                      <td className="px-3 py-3"></td>
                      <td colSpan={5} className="px-6 py-3">
                        <div className="flex items-center gap-3 ml-6">
                          <span className="text-blue-600">↳</span>
                          <select
                            value={subItem.type}
                            onChange={(e) => handleUpdateSubItem(index, subIndex, 'type', e.target.value)}
                            className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="setup">Setup Fee</option>
                            <option value="run">Run Charge</option>
                            <option value="shipping">Shipping Cost</option>
                            <option value="other">Other Charge</option>
                          </select>
                          {subItem.type === 'other' && (
                            <input
                              type="text"
                              value={subItem.description}
                              onChange={(e) => handleUpdateSubItem(index, subIndex, 'description', e.target.value)}
                              placeholder="Description"
                              className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center">
                          <span className="text-sm text-slate-500 mr-1">$</span>
                          <input
                            type="number"
                            step="0.01"
                            value={subItem.amount}
                            onChange={(e) => handleUpdateSubItem(index, subIndex, 'amount', parseFloat(e.target.value) || 0)}
                            className="w-24 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <span className="text-sm font-semibold text-blue-700">${subItem.amount.toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-3 text-center">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleRemoveSubItem(index, subIndex)}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </motion.button>
                      </td>
                    </motion.tr>
                  );
                });
              } else if (!isEditingItems && item.expanded && item.subItems && item.subItems.length > 0) {
                item.subItems.forEach((subItem, subIndex) => {
                  rows.push(
                    <motion.tr
                      key={subItem.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-blue-50/50 border-b border-blue-100"
                    >
                      <td className="px-3 py-3"></td>
                      <td colSpan={5} className="px-6 py-3">
                        <div className="flex items-center gap-2 ml-6">
                          <span className="text-blue-600">↳</span>
                          <span className="text-sm text-slate-700">{subItem.description}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3" colSpan={2}>
                        <span className="text-sm font-semibold text-blue-700">${subItem.amount.toFixed(2)}</span>
                      </td>
                    </motion.tr>
                  );
                });
              }

              return rows;
            })}
          </tbody>
        </table>
      </div>

      {/* Add Line Item Button */}
      {isEditingItems && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAddLineItem}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 border-2 border-blue-200 border-dashed text-blue-700 font-semibold rounded-xl hover:bg-blue-100 transition-colors text-sm"
        >
          <Plus className="w-5 h-5" />
          Add Line Item
        </motion.button>
      )}

      {/* Custom Charges Section */}
      {(isEditingItems || customLineItems.length > 0) && (
        <div className="mt-6">
          <h4 className="text-md font-bold text-slate-900 mb-3">Additional Charges</h4>
          <div className="bg-slate-50 rounded-xl overflow-hidden border border-slate-200">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200">
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Amount</th>
                  {isEditingItems && (
                    <th className="px-6 py-3 text-center text-xs font-bold text-slate-700 uppercase">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {customLineItems.map((item, index) => (
                  <tr key={item.id} className="border-b border-slate-200 bg-white">
                    <td className="px-6 py-4">
                      {isEditingItems ? (
                        <select
                          value={item.name}
                          onChange={(e) => handleUpdateCustomCharge(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Setup Fee">Setup Fee</option>
                          <option value="Shipping Fee">Shipping Fee</option>
                          <option value="Misc Fee">Misc Fee</option>
                          <option value="Handling Fee">Handling Fee</option>
                          <option value="Rush Fee">Rush Fee</option>
                          <option value="Packaging Fee">Packaging Fee</option>
                        </select>
                      ) : (
                        <span className="text-sm font-medium text-slate-900">{item.name}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {isEditingItems ? (
                        <div className="flex items-center">
                          <span className="text-sm text-slate-500 mr-1">$</span>
                          <input
                            type="number"
                            step="0.01"
                            value={item.amount}
                            onChange={(e) => handleUpdateCustomCharge(index, 'amount', parseFloat(e.target.value) || 0)}
                            className="w-32 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      ) : (
                        <span className="text-sm font-bold text-slate-900">${item.amount.toFixed(2)}</span>
                      )}
                    </td>
                    {isEditingItems && (
                      <td className="px-6 py-4 text-center">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleRemoveCustomCharge(index)}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </motion.button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Custom Charge Button */}
      {isEditingItems && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAddCustomCharge}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-50 border-2 border-amber-200 border-dashed text-amber-700 font-semibold rounded-xl hover:bg-amber-100 transition-colors text-sm"
        >
          <Plus className="w-5 h-5" />
          Add Additional Charge (Setup Fee, Shipping, etc.)
        </motion.button>
      )}

      {/* Totals */}
      <div className="flex justify-end mt-6">
        <div className="w-80 space-y-3">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-sm font-semibold text-slate-700">Subtotal</span>
            <span className="text-lg font-bold text-slate-900">${subtotal.toFixed(2)}</span>
          </div>
          
          {/* Only show Additional Charges if there are non-shipping custom line items */}
          {customItemsTotal > 0 && (
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-sm font-semibold text-slate-700">Additional Charges</span>
              <span className="text-lg font-bold text-slate-900">${customItemsTotal.toFixed(2)}</span>
            </div>
          )}
          
          {/* Show Shipping as separate line if any shipping charges exist */}
          {shippingTotal > 0 && (
            <div className="flex items-center justify-between px-4 py-3 bg-blue-50 rounded-xl border border-blue-200">
              <span className="text-sm font-semibold text-blue-700">Shipping</span>
              <span className="text-lg font-bold text-blue-900">${shippingTotal.toFixed(2)}</span>
            </div>
          )}
          
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-700">Sales Tax</span>
              {isEditingItems && (
                <>
                  <select
                    value={taxStatus}
                    onChange={(e) => onTaxStatusChange?.(e.target.value as 'standard' | 'oos' | 'exempt')}
                    className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="standard">Standard</option>
                    <option value="oos">OOS</option>
                    <option value="exempt">Tax Exempt</option>
                  </select>
                  {taxStatus === 'standard' && (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="0.01"
                        value={(salesTaxRate * 100).toFixed(0)}
                        onChange={(e) => {
                          onSalesTaxRateChange(parseFloat(e.target.value) / 100 || 0);
                        }}
                        className="w-16 px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-600">%</span>
                    </div>
                  )}
                </>
              )}
              {!isEditingItems && (
                <span className="text-xs text-slate-500">
                  {taxStatus === 'standard' && `(${(salesTaxRate * 100).toFixed(0)}%)`}
                  {taxStatus === 'oos' && '(OOS - 0%)'}
                  {taxStatus === 'exempt' && '(Tax Exempt - 0%)'}
                </span>
              )}
            </div>
            <span className="text-lg font-bold text-slate-900">${salesTax.toFixed(2)}</span>
          </div>
          
          <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
            <span className="text-base font-bold text-green-700">Total Amount</span>
            <span className="text-2xl font-bold text-green-900">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}