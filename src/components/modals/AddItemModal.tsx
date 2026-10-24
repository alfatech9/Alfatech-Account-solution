import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { Plus } from 'lucide-react';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (itemId: string) => void;
}

export const AddItemModal: React.FC<AddItemModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { addItem, taxSettings, categories, addCategory, unitsOfMeasure, addUnitOfMeasure, formatCurrency } = useApp();

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState(categories[0]?.name || 'General');
  const [brand, setBrand] = useState('');
  const [unit, setUnit] = useState(unitsOfMeasure[0]?.code || 'pcs');
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [wholesalePrice, setWholesalePrice] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(taxSettings.defaultTaxRate);
  const [openingStock, setOpeningStock] = useState<number>(0);
  const [minimumStock, setMinimumStock] = useState<number>(5);
  const [warehouse, setWarehouse] = useState('Main Warehouse');

  // Inline Quick Add state
  const [isQuickAddCategoryOpen, setIsQuickAddCategoryOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  const [isQuickAddUomOpen, setIsQuickAddUomOpen] = useState(false);
  const [newUomName, setNewUomName] = useState('');
  const [newUomCode, setNewUomCode] = useState('');

  // Keep category and unit synced with options if empty
  useEffect(() => {
    if (!category && categories.length > 0) {
      setCategory(categories[0].name);
    }
  }, [categories, category]);

  useEffect(() => {
    if (!unit && unitsOfMeasure.length > 0) {
      setUnit(unitsOfMeasure[0].code);
    }
  }, [unitsOfMeasure, unit]);

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const created = addCategory({ name: newCatName.trim(), description: newCatDesc.trim() });
    setCategory(created.name);
    setNewCatName('');
    setNewCatDesc('');
    setIsQuickAddCategoryOpen(false);
  };

  const handleCreateUom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUomName.trim() || !newUomCode.trim()) return;
    const created = addUnitOfMeasure({ name: newUomName.trim(), code: newUomCode.trim().toLowerCase() });
    setUnit(created.code);
    setNewUomName('');
    setNewUomCode('');
    setIsQuickAddUomOpen(false);
  };

  const calculatedStockValue = (Number(openingStock) || 0) * (Number(purchasePrice) || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const generatedSku = sku.trim() || `SKU-${Date.now().toString().slice(-6)}`;

    const created = addItem({
      name: name.trim(),
      sku: generatedSku,
      category: category.trim() || 'General',
      brand: brand.trim(),
      unit,
      purchasePrice: Number(purchasePrice) || 0,
      sellingPrice: Number(sellingPrice) || 0,
      wholesalePrice: Number(wholesalePrice) || Number(sellingPrice) || 0,
      taxRate: Number(taxRate) || 0,
      openingStock: Number(openingStock) || 0,
      minimumStock: Number(minimumStock) || 5,
      warehouse: warehouse.trim() || 'Main Warehouse',
      status: 'active'
    });

    // Reset
    setName('');
    setSku('');
    setBrand('');
    setPurchasePrice(0);
    setSellingPrice(0);
    setWholesalePrice(0);
    setOpeningStock(0);

    onClose();
    if (onSuccess) onSuccess(created.id);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Inventory Product"
      subtitle="Register stock items with purchasing, selling, and tracking parameters"
      maxWidth="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Item Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dell UltraSharp 27 Monitor"
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#16A085]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Item SKU / Code
            </label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="Auto-generated if empty"
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-[#16A085]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Category *
              </label>
              <button
                type="button"
                onClick={() => setIsQuickAddCategoryOpen(true)}
                className="text-[11px] text-[#16A085] hover:text-[#0E7C66] font-semibold flex items-center gap-0.5 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>New</span>
              </button>
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#16A085]"
            >
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Brand / Manufacturer
            </label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g. Dell, Logitech, HP"
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#16A085]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Unit of Measure *
              </label>
              <button
                type="button"
                onClick={() => setIsQuickAddUomOpen(true)}
                className="text-[11px] text-[#16A085] hover:text-[#0E7C66] font-semibold flex items-center gap-0.5 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>New</span>
              </button>
            </div>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#16A085]"
            >
              {unitsOfMeasure.map(u => (
                <option key={u.id} value={u.code}>
                  {u.name} ({u.code})
                </option>
              ))}
            </select>
          </div>

          {/* Pricing Grid */}
          <div className="sm:col-span-3 pt-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Pricing & Taxes
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50/70 p-3 rounded-lg border border-slate-200/60">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Purchase Price *
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={purchasePrice || ''}
                  onChange={(e) => setPurchasePrice(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-md font-mono focus:outline-none focus:ring-1 focus:ring-[#16A085]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Selling Price *
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={sellingPrice || ''}
                  onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-md font-mono focus:outline-none focus:ring-1 focus:ring-[#16A085]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Wholesale Price
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={wholesalePrice || ''}
                  onChange={(e) => setWholesalePrice(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-md font-mono focus:outline-none focus:ring-1 focus:ring-[#16A085]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tax / VAT (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="any"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  placeholder="10"
                  className="w-full text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-md font-mono focus:outline-none focus:ring-1 focus:ring-[#16A085]"
                />
              </div>
            </div>
          </div>

          {/* Stock Tracking */}
          <div className="sm:col-span-3 pt-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Stock & Warehouse Management
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50/70 p-3 rounded-lg border border-slate-200/60">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Opening Stock
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={openingStock || ''}
                  onChange={(e) => setOpeningStock(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-md font-mono focus:outline-none focus:ring-1 focus:ring-[#16A085]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Minimum Stock Alert
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={minimumStock}
                  onChange={(e) => setMinimumStock(parseFloat(e.target.value) || 0)}
                  placeholder="5"
                  className="w-full text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-md font-mono focus:outline-none focus:ring-1 focus:ring-[#16A085]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Warehouse Location
                </label>
                <input
                  type="text"
                  value={warehouse}
                  onChange={(e) => setWarehouse(e.target.value)}
                  placeholder="Main Warehouse"
                  className="w-full text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#16A085]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Stock Valuation
                </label>
                <div className="text-xs px-3 py-2 bg-slate-100 border border-slate-200 rounded-md font-mono font-bold text-slate-800 tabular-nums">
                  {formatCurrency(calculatedStockValue)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-semibold text-white bg-[#16A085] hover:bg-[#0E7C66] rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            Save Product
          </button>
        </div>
      </form>

      {/* Quick Add Category Modal */}
      <Modal
        isOpen={isQuickAddCategoryOpen}
        onClose={() => setIsQuickAddCategoryOpen(false)}
        title="Add New Category"
        subtitle="Create an inventory group for organizing stock items"
        maxWidth="md"
      >
        <form onSubmit={handleCreateCategory} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Category Name *
            </label>
            <input
              type="text"
              required
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="e.g. Telecommunications, Storage Devices"
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#16A085]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              value={newCatDesc}
              onChange={(e) => setNewCatDesc(e.target.value)}
              placeholder="Brief details about what belongs in this category"
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#16A085]"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsQuickAddCategoryOpen(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-[#16A085] hover:bg-[#0E7C66] rounded-lg"
            >
              Save Category
            </button>
          </div>
        </form>
      </Modal>

      {/* Quick Add UOM Modal */}
      <Modal
        isOpen={isQuickAddUomOpen}
        onClose={() => setIsQuickAddUomOpen(false)}
        title="Add Unit of Measure (UOM)"
        subtitle="Define physical measurement standard for inventory items"
        maxWidth="md"
      >
        <form onSubmit={handleCreateUom} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Unit Name *
              </label>
              <input
                type="text"
                required
                value={newUomName}
                onChange={(e) => setNewUomName(e.target.value)}
                placeholder="e.g. Square Feet, Barrels"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#16A085]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Unit Code / Abbr *
              </label>
              <input
                type="text"
                required
                value={newUomCode}
                onChange={(e) => setNewUomCode(e.target.value)}
                placeholder="e.g. sqft, bbl, carton"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg font-mono lowercase focus:outline-none focus:ring-1 focus:ring-[#16A085]"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsQuickAddUomOpen(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-[#16A085] hover:bg-[#0E7C66] rounded-lg"
            >
              Save Unit
            </button>
          </div>
        </form>
      </Modal>
    </Modal>
  );
};
