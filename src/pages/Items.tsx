import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { DataTable, Column } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/StatusBadge';
import { Item, StockMovement, ItemCategory, UnitOfMeasure } from '../types';
import {
  PackagePlus,
  Download,
  Upload,
  Eye,
  Sliders,
  AlertTriangle,
  Layers,
  ArrowDownRight,
  ArrowUpLeft,
  Trash2,
  Box,
  Scale,
  Plus,
  Edit2,
  Check,
  X
} from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { AddItemModal } from '../components/modals/AddItemModal';
import { ItemDetailModal } from '../components/modals/ItemDetailModal';

interface ItemsProps {
  onNavigate: (route: string) => void;
}

export const Items: React.FC<ItemsProps> = ({ onNavigate }) => {
  const {
    items,
    stockMovements,
    deleteItem,
    formatCurrency,
    addToast,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    unitsOfMeasure,
    addUnitOfMeasure,
    updateUnitOfMeasure,
    deleteUnitOfMeasure
  } = useApp();

  const [activeTab, setActiveTab] = useState<'inventory' | 'movements' | 'categories' | 'units'>('inventory');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Modals
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'category' | 'uom' | 'item'; id: string; name: string } | null>(null);

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ItemCategory | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');

  // UOM Modal State
  const [isUomModalOpen, setIsUomModalOpen] = useState(false);
  const [editingUom, setEditingUom] = useState<UnitOfMeasure | null>(null);
  const [uomName, setUomName] = useState('');
  const [uomCode, setUomCode] = useState('');
  const [uomDescription, setUomDescription] = useState('');

  // Filtered items
  const filteredItems = useMemo(() => {
    if (categoryFilter === 'all') return items;
    return items.filter(it => it.category === categoryFilter);
  }, [items, categoryFilter]);

  // Low stock items count
  const lowStockCount = items.filter(it => it.currentStock <= it.minimumStock).length;

  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCategoryName('');
    setCategoryDescription('');
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: ItemCategory) => {
    setEditingCategory(cat);
    setCategoryName(cat.name);
    setCategoryDescription(cat.description || '');
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    if (editingCategory) {
      updateCategory(editingCategory.id, {
        name: categoryName.trim(),
        description: categoryDescription.trim()
      });
    } else {
      addCategory({
        name: categoryName.trim(),
        description: categoryDescription.trim()
      });
    }
    setIsCategoryModalOpen(false);
  };

  const handleOpenAddUom = () => {
    setEditingUom(null);
    setUomName('');
    setUomCode('');
    setUomDescription('');
    setIsUomModalOpen(true);
  };

  const handleOpenEditUom = (uom: UnitOfMeasure) => {
    setEditingUom(uom);
    setUomName(uom.name);
    setUomCode(uom.code);
    setUomDescription(uom.description || '');
    setIsUomModalOpen(true);
  };

  const handleSaveUom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uomName.trim() || !uomCode.trim()) return;

    if (editingUom) {
      updateUnitOfMeasure(editingUom.id, {
        name: uomName.trim(),
        code: uomCode.trim().toLowerCase(),
        description: uomDescription.trim()
      });
    } else {
      addUnitOfMeasure({
        name: uomName.trim(),
        code: uomCode.trim().toLowerCase(),
        description: uomDescription.trim()
      });
    }
    setIsUomModalOpen(false);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Item Name', 'SKU', 'Category', 'Unit', 'Purchase Price', 'Selling Price', 'Current Stock', 'Stock Value', 'Warehouse', 'Status'];
    const rows = filteredItems.map(it => [
      `"${it.name.replace(/"/g, '""')}"`,
      it.sku,
      `"${it.category}"`,
      it.unit,
      it.purchasePrice,
      it.sellingPrice,
      it.currentStock,
      it.currentStock * it.purchasePrice,
      `"${it.warehouse}"`,
      it.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `alfatechlink_items_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast({ type: 'success', title: 'Export Complete', message: `Exported ${filteredItems.length} products to CSV.` });
  };

  const inventoryColumns: Column<Item>[] = [
    {
      key: 'name',
      header: 'Item Name & SKU',
      sortable: true,
      render: (it) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 border border-slate-200">
            <Box className="w-4 h-4 stroke-[1.7]" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-slate-900 hover:text-[#16A085] transition-colors truncate">
              {it.name}
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-0.5">
              SKU: {it.sku} {it.brand ? `· ${it.brand}` : ''}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      render: (it) => (
        <span className="text-slate-600 text-xs font-medium">
          {it.category}
        </span>
      )
    },
    {
      key: 'unit',
      header: 'Unit',
      render: (it) => <span className="font-mono text-slate-500 uppercase text-[11px]">{it.unit}</span>
    },
    {
      key: 'purchasePrice',
      header: 'Cost Price',
      sortable: true,
      align: 'right',
      render: (it) => (
        <span className="font-mono tabular-nums text-slate-600">
          {formatCurrency(it.purchasePrice)}
        </span>
      )
    },
    {
      key: 'sellingPrice',
      header: 'Selling Price',
      sortable: true,
      align: 'right',
      render: (it) => (
        <span className="font-mono tabular-nums font-semibold text-slate-900">
          {formatCurrency(it.sellingPrice)}
        </span>
      )
    },
    {
      key: 'currentStock',
      header: 'In Stock',
      sortable: true,
      align: 'center',
      render: (it) => (
        <div className="flex flex-col items-center">
          <span
            className={`font-mono tabular-nums font-bold text-xs ${
              it.currentStock <= it.minimumStock
                ? 'text-rose-600'
                : 'text-slate-800'
            }`}
          >
            {it.currentStock} {it.unit}
          </span>
          {it.currentStock <= it.minimumStock && (
            <span className="text-[10px] text-rose-500 font-semibold flex items-center gap-0.5 mt-0.5">
              <AlertTriangle className="w-2.5 h-2.5" />
              <span>Low</span>
            </span>
          )}
        </div>
      )
    },
    {
      key: 'stockValue',
      header: 'Stock Valuation',
      align: 'right',
      render: (it) => (
        <span className="font-mono tabular-nums font-bold text-[#16A085]">
          {formatCurrency(it.currentStock * it.purchasePrice)}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (it) => <StatusBadge status={it.status} type="item" />
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (it) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => {
              setSelectedItem(it);
              setIsDetailOpen(true);
            }}
            className="p-1.5 text-slate-500 hover:text-slate-800 rounded-md hover:bg-slate-100 transition-colors"
            title="View product details & movements"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setConfirmDelete({ type: 'item', id: it.id, name: it.name });
            }}
            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-slate-100 transition-colors"
            title="Delete Item"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const movementColumns: Column<StockMovement>[] = [
    {
      key: 'date',
      header: 'Date',
      sortable: true,
      render: (m) => <span className="font-mono text-slate-500">{m.date}</span>
    },
    {
      key: 'itemName',
      header: 'Product',
      sortable: true,
      render: (m) => <span className="font-bold text-slate-900">{m.itemName}</span>
    },
    {
      key: 'type',
      header: 'Movement Type',
      sortable: true,
      render: (m) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
          m.type === 'purchase' || m.type === 'opening'
            ? 'bg-emerald-50 text-emerald-700'
            : m.type === 'sale'
            ? 'bg-blue-50 text-blue-700'
            : 'bg-amber-50 text-amber-700'
        }`}>
          {m.type}
        </span>
      )
    },
    {
      key: 'referenceNumber',
      header: 'Reference',
      render: (m) => <span className="font-mono text-slate-700">{m.referenceNumber || '—'}</span>
    },
    {
      key: 'quantity',
      header: 'Qty Change',
      sortable: true,
      align: 'right',
      render: (m) => (
        <span
          className={`font-mono tabular-nums font-bold ${
            m.quantity > 0 ? 'text-emerald-700' : 'text-rose-700'
          }`}
        >
          {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
        </span>
      )
    },
    {
      key: 'balanceAfter',
      header: 'Stock After',
      sortable: true,
      align: 'right',
      render: (m) => <span className="font-mono tabular-nums font-bold text-slate-800">{m.balanceAfter}</span>
    },
    {
      key: 'notes',
      header: 'Notes',
      render: (m) => <span className="text-slate-500 text-xs">{m.notes || '—'}</span>
    }
  ];

  return (
    <div className="space-y-5">
      {/* Top Banner & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-800">
            Items & Inventory Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time stock valuation, minimum threshold triggers, and automated intake deductions.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsAddItemOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#16A085] hover:bg-[#0E7C66] rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <PackagePlus className="w-3.5 h-3.5" />
            <span>Add Item</span>
          </button>

          <button
            onClick={handleOpenAddCategory}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
            title="Create new category classification"
          >
            <Layers className="w-3.5 h-3.5 text-[#16A085]" />
            <span>+ Add Category</span>
          </button>

          <button
            onClick={handleOpenAddUom}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
            title="Create new unit of measurement"
          >
            <Scale className="w-3.5 h-3.5 text-blue-600" />
            <span>+ Add Unit</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => onNavigate('import-data')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Import</span>
          </button>
        </div>
      </div>

      {/* Low stock warning notification banner */}
      {lowStockCount > 0 && (
        <div className="flex items-center justify-between p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-xl text-amber-900 text-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Inventory Warning:</strong> {lowStockCount} product(s) have fallen below their configured minimum stock threshold.
            </span>
          </div>
          <button
            onClick={() => onNavigate('purchases')}
            className="text-xs font-bold text-amber-900 hover:underline shrink-0"
          >
            Order Supplies →
          </button>
        </div>
      )}

      {/* Sub-Tabs: Inventory / Stock Movement / Categories */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'inventory'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Inventory List ({items.length})
          </button>

          <button
            onClick={() => setActiveTab('movements')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'movements'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Stock Movement Log ({stockMovements.length})
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'categories'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Categories ({categories.length})
          </button>

          <button
            onClick={() => setActiveTab('units')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'units'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Units of Measure ({unitsOfMeasure.length})
          </button>
        </div>

        {activeTab === 'inventory' && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#16A085]"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
        )}

        {activeTab === 'categories' && (
          <button
            onClick={handleOpenAddCategory}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#16A085] hover:bg-[#0E7C66] rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Category</span>
          </button>
        )}

        {activeTab === 'units' && (
          <button
            onClick={handleOpenAddUom}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#16A085] hover:bg-[#0E7C66] rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Unit of Measure</span>
          </button>
        )}
      </div>

      {/* Tab 1: Inventory Table */}
      {activeTab === 'inventory' && (
        <DataTable
          data={filteredItems}
          columns={inventoryColumns}
          keyExtractor={(it) => it.id}
          searchPlaceholder="Search by name, SKU, brand, category..."
          searchFields={['name', 'sku', 'brand', 'category', 'warehouse']}
          itemsPerPage={10}
          emptyTitle="No inventory products found"
          emptyMessage="Add items to track stock, pricing, and automated inventory intake/sales."
          emptyAction={{
            label: '+ Add First Product',
            onClick: () => setIsAddItemOpen(true)
          }}
          onRowClick={(it) => {
            setSelectedItem(it);
            setIsDetailOpen(true);
          }}
        />
      )}

      {/* Tab 2: Stock Movements */}
      {activeTab === 'movements' && (
        <DataTable
          data={stockMovements}
          columns={movementColumns}
          keyExtractor={(m) => m.id}
          searchPlaceholder="Search by product name, reference, notes..."
          searchFields={['itemName', 'referenceNumber', 'notes', 'type']}
          itemsPerPage={12}
          emptyTitle="No stock movements recorded"
          emptyMessage="Movements are automatically recorded on sales, purchases, and manual adjustments."
        />
      )}

      {/* Tab 3: Categories overview */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map(cat => {
              const count = items.filter(i => i.category.toLowerCase() === cat.name.toLowerCase()).length;
              const catVal = items
                .filter(i => i.category.toLowerCase() === cat.name.toLowerCase())
                .reduce((a, b) => a + (b.currentStock * b.purchasePrice), 0);

              return (
                <div key={cat.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-all">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#16A085]/10 text-[#16A085] flex items-center justify-center shrink-0">
                          <Layers className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-slate-900">{cat.name}</h3>
                          <span className="text-[10px] text-slate-500">{count} products</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditCategory(cat)}
                          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                          title="Edit Category"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setConfirmDelete({ type: 'category', id: cat.id, name: cat.name });
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {cat.description && (
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 mb-2">
                        {cat.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs mt-2">
                    <span className="text-slate-500">Valuation:</span>
                    <span className="font-mono font-bold text-slate-800">{formatCurrency(catVal)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: Units of Measure overview */}
      {activeTab === 'units' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {unitsOfMeasure.map(uom => {
              const count = items.filter(i => i.unit.toLowerCase() === uom.code.toLowerCase()).length;

              return (
                <div key={uom.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-all">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <Scale className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-slate-900">{uom.name}</h3>
                          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase bg-slate-100 px-1.5 py-0.5 rounded">
                            {uom.code}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditUom(uom)}
                          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                          title="Edit Unit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setConfirmDelete({ type: 'uom', id: uom.id, name: `${uom.name} (${uom.code})` });
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                          title="Delete Unit"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {uom.description && (
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 mb-2">
                        {uom.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs mt-2">
                    <span className="text-slate-500">Assigned Products:</span>
                    <span className="font-mono font-bold text-slate-800">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add / Edit Category Modal */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title={editingCategory ? 'Edit Product Category' : 'Add Product Category'}
        subtitle="Manage classification groups for inventory products"
        maxWidth="md"
      >
        <form onSubmit={handleSaveCategory} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Category Name *
            </label>
            <input
              type="text"
              required
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="e.g. Server Racks, Software Subscriptions"
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#16A085]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              value={categoryDescription}
              onChange={(e) => setCategoryDescription(e.target.value)}
              placeholder="Category description or procurement details"
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#16A085]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCategoryModalOpen(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-[#16A085] hover:bg-[#0E7C66] rounded-lg"
            >
              {editingCategory ? 'Save Changes' : 'Create Category'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add / Edit Unit of Measure Modal */}
      <Modal
        isOpen={isUomModalOpen}
        onClose={() => setIsUomModalOpen(false)}
        title={editingUom ? 'Edit Unit of Measure' : 'Add Unit of Measure'}
        subtitle="Define physical measurement standard for inventory items"
        maxWidth="md"
      >
        <form onSubmit={handleSaveUom} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Unit Name *
              </label>
              <input
                type="text"
                required
                value={uomName}
                onChange={(e) => setUomName(e.target.value)}
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
                value={uomCode}
                onChange={(e) => setUomCode(e.target.value)}
                placeholder="e.g. sqft, bbl, carton"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg font-mono lowercase focus:outline-none focus:ring-1 focus:ring-[#16A085]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              value={uomDescription}
              onChange={(e) => setUomDescription(e.target.value)}
              placeholder="Packaging specs or conversion details"
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#16A085]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsUomModalOpen(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-[#16A085] hover:bg-[#0E7C66] rounded-lg"
            >
              {editingUom ? 'Save Changes' : 'Create Unit'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modals */}
      <AddItemModal
        isOpen={isAddItemOpen}
        onClose={() => setIsAddItemOpen(false)}
      />

      <ItemDetailModal
        item={selectedItem}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />

      {/* Confirmation Dialog for Category, Unit, or Item deletion */}
      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (!confirmDelete) return;
          if (confirmDelete.type === 'category') {
            deleteCategory(confirmDelete.id);
            addToast({ type: 'success', title: 'Category Removed', message: `Category "${confirmDelete.name}" has been removed.` });
          } else if (confirmDelete.type === 'uom') {
            deleteUnitOfMeasure(confirmDelete.id);
            addToast({ type: 'success', title: 'Unit Removed', message: `Unit of measure "${confirmDelete.name}" has been removed.` });
          } else if (confirmDelete.type === 'item') {
            deleteItem(confirmDelete.id);
            addToast({ type: 'success', title: 'Item Deleted', message: `Item "${confirmDelete.name}" has been deleted.` });
          }
        }}
        title={`Delete ${confirmDelete?.type === 'category' ? 'Category' : confirmDelete?.type === 'uom' ? 'Unit of Measure' : 'Inventory Item'}`}
        message={`Are you sure you want to delete "${confirmDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        isDestructive={true}
      />
    </div>
  );
};
