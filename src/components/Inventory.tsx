import React, { useState } from 'react';
import {
  PackageCheck,
  Search,
  Plus,
  Edit3,
  Trash2,
  AlertTriangle,
  X,
  RefreshCw,
  MapPin,
  Box,
  Layers,
  ShieldAlert,
  Calendar,
  Tag,
  DollarSign,
} from 'lucide-react';
import { Medicine, MedicineCategory, DosageForm } from '../types';

interface InventoryProps {
  medicines: Medicine[];
  onAddMedicine: (medicine: Omit<Medicine, 'id'>) => void;
  onUpdateMedicine: (medicine: Medicine) => void;
  onDeleteMedicine: (medicineId: string) => void;
  onAdjustStock: (medicineId: string, amount: number, reason: string, batchNumber: string, expiryDate: string, costPrice: number) => void;
}

export const Inventory: React.FC<InventoryProps> = ({
  medicines,
  onAddMedicine,
  onUpdateMedicine,
  onDeleteMedicine,
  onAdjustStock,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [stockFilter, setStockFilter] = useState<'All' | 'Low Stock' | 'Expiring Soon' | 'Rx Required'>('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);

  // Form Fields
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [category, setCategory] = useState<MedicineCategory>('Antibiotics & Anti-infectives');
  const [form, setForm] = useState<DosageForm>('Tablet');
  const [dosage, setDosage] = useState('500mg');
  const [costPrice, setCostPrice] = useState<number>(10);
  const [price, setPrice] = useState<number>(22);
  const [stock, setStock] = useState<number>(100);
  const [minStockThreshold, setMinStockThreshold] = useState<number>(20);
  const [requiresPrescription, setRequiresPrescription] = useState(false);
  const [rackNumber, setRackNumber] = useState('Rack A');
  const [boxNumber, setBoxNumber] = useState('Box #A-01');
  const [shelfLevel, setShelfLevel] = useState('Level 1 (Top Shelf)');
  const [section, setSection] = useState('Section A1 - General');
  const [expiryDate, setExpiryDate] = useState('2027-06-30');
  const [batchNumber, setBatchNumber] = useState('BATCH-2024-01');
  const [manufacturer, setManufacturer] = useState('Sun Pharma');
  const [description, setDescription] = useState('');
  const [sideEffects, setSideEffects] = useState('');

  // Quick Restock modal
  const [restockMedicineId, setRestockMedicineId] = useState<string | null>(null);
  const [restockAmount, setRestockAmount] = useState<number>(50);
  const [restockReason, setRestockReason] = useState<string>('Supplier Delivery Batch');
  const [restockBatchNumber, setRestockBatchNumber] = useState('');
  const [restockExpiryDate, setRestockExpiryDate] = useState('');
  const [restockCostPrice, setRestockCostPrice] = useState(0);

  const categories: string[] = [
    'All',
    'Antibiotics & Anti-infectives',
    'Pain Relievers & Analgesics',
    'Cardiovascular & BP',
    'Diabetes & Endocrine Care',
    'Vitamins & Supplements',
    'Respiratory & Cold Care',
    'Dermatology & Topicals',
    'Gastrointestinal Care',
    'Eye & Ear Care',
    'Medical Supplies',
  ];

  // Filter medicines
  const filteredMedicines = medicines.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.boxNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.rackNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCat = selectedCategory === 'All' || m.category === selectedCategory;

    let matchesFilter = true;
    if (stockFilter === 'Low Stock') {
      matchesFilter = m.stock <= m.minStockThreshold;
    } else if (stockFilter === 'Expiring Soon') {
      matchesFilter = (m.batches || [{ expiryDate: m.expiryDate, quantity: m.stock }]).some((batch) => {
        const expDays = (new Date(`${batch.expiryDate}T00:00:00`).getTime() - new Date(new Date().toDateString()).getTime()) / 86400000;
        return batch.quantity > 0 && expDays >= 0 && expDays <= 60;
      });
    } else if (stockFilter === 'Rx Required') {
      matchesFilter = m.requiresPrescription;
    }

    return matchesSearch && matchesCat && matchesFilter;
  });

  const lowStockCount = medicines.filter((m) => m.stock <= m.minStockThreshold).length;
  const expiringCount = medicines.reduce((count, medicine) => count + (medicine.batches || [{ expiryDate: medicine.expiryDate, quantity: medicine.stock }]).filter((batch) => {
    const expDays = (new Date(`${batch.expiryDate}T00:00:00`).getTime() - new Date(new Date().toDateString()).getTime()) / 86400000;
    return batch.quantity > 0 && expDays >= 0 && expDays <= 60;
  }).length, 0);

  const handleOpenAddModal = () => {
    setEditingMedicine(null);
    setCode(`MED-${1000 + medicines.length + 1}`);
    setName('');
    setGenericName('');
    setCategory('Antibiotics & Anti-infectives');
    setForm('Tablet');
    setDosage('500mg');
    setCostPrice(8);
    setPrice(18);
    setStock(100);
    setMinStockThreshold(20);
    setRequiresPrescription(false);
    setRackNumber('Rack A');
    setBoxNumber('Box #A-05');
    setShelfLevel('Level 2 (Middle Shelf)');
    setSection('Section A1 - Fast Moving');
    setExpiryDate('2027-12-31');
    setBatchNumber(`B24-${Math.floor(1000 + Math.random() * 9000)}`);
    setManufacturer('Cipla Healthcare');
    setDescription('');
    setSideEffects('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (med: Medicine) => {
    setEditingMedicine(med);
    setCode(med.code);
    setName(med.name);
    setGenericName(med.genericName);
    setCategory(med.category);
    setForm(med.form);
    setDosage(med.dosage);
    setCostPrice(med.costPrice);
    setPrice(med.price);
    setStock(med.stock);
    setMinStockThreshold(med.minStockThreshold);
    setRequiresPrescription(med.requiresPrescription);
    setRackNumber(med.rackNumber);
    setBoxNumber(med.boxNumber);
    setShelfLevel(med.shelfLevel);
    setSection(med.section);
    setExpiryDate(med.expiryDate);
    setBatchNumber(med.batchNumber);
    setManufacturer(med.manufacturer);
    setDescription(med.description || '');
    setSideEffects(med.sideEffects || '');
    setIsModalOpen(true);
  };

  const handleSaveMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (!editingMedicine && new Date(`${expiryDate}T00:00:00`).getTime() < new Date(new Date().toDateString()).getTime()) {
      alert('The starting batch expiry date cannot be in the past.');
      return;
    }

    if (editingMedicine) {
      onUpdateMedicine({
        ...editingMedicine,
        code,
        name,
        genericName,
        category,
        form,
        dosage,
        costPrice: Number(costPrice),
        price: Number(price),
        stock: Number(stock),
        minStockThreshold: Number(minStockThreshold),
        requiresPrescription,
        rackNumber,
        boxNumber,
        shelfLevel,
        section,
        expiryDate,
        batchNumber,
        manufacturer,
        description,
        sideEffects,
      });
    } else {
      onAddMedicine({
        code,
        name,
        genericName,
        category,
        form,
        dosage,
        costPrice: Number(costPrice),
        price: Number(price),
        stock: Number(stock),
        minStockThreshold: Number(minStockThreshold),
        requiresPrescription,
        rackNumber,
        boxNumber,
        shelfLevel,
        section,
        expiryDate,
        batchNumber,
        manufacturer,
        description,
        sideEffects,
      });
    }
    setIsModalOpen(false);
  };

  const submitRestock = () => {
    if (restockMedicineId && restockAmount !== 0) {
      onAdjustStock(restockMedicineId, Number(restockAmount), restockReason, restockBatchNumber, restockExpiryDate, restockCostPrice);
      setRestockMedicineId(null);
    }
  };

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-teal-100 shadow-sm">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-extrabold leading-tight text-slate-900">Medicine & Stock Inventory Ledger</h2>
            <span className="shrink-0 whitespace-nowrap text-xs bg-teal-100 text-teal-800 font-bold px-2.5 py-0.5 rounded-full border border-teal-200">
              {medicines.length} Medicines Mapped
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Store location rack/box tracking, expiry date monitoring, batch numbers, and stock level controls.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2.5 rounded-2xl text-xs shadow-md shadow-teal-600/20 transition-all flex items-center gap-2 shrink-0 self-start sm:self-auto"
        >
          <Plus size={16} /> Add New Medicine
        </button>
      </div>

      {/* Search & Status Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Medicine, Generic name, Box #, or Code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-teal-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-xs"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setStockFilter('All')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              stockFilter === 'All'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 hover:bg-teal-50 border border-slate-200'
            }`}
          >
            All Medicines ({medicines.length})
          </button>
          <button
            onClick={() => setStockFilter('Low Stock')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              stockFilter === 'Low Stock'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
            }`}
          >
            <AlertTriangle size={14} /> Low Stock ({lowStockCount})
          </button>
          <button
            onClick={() => setStockFilter('Expiring Soon')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              stockFilter === 'Expiring Soon'
                ? 'bg-amber-500 text-white'
                : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <Calendar size={14} /> Expiring Soon ({expiringCount})
          </button>
          <button
            onClick={() => setStockFilter('Rx Required')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              stockFilter === 'Rx Required'
                ? 'bg-teal-600 text-white'
                : 'bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100'
            }`}
          >
            <ShieldAlert size={14} /> Rx Prescription Only
          </button>
        </div>
      </div>

      {/* Main Inventory Table */}
      <div className="bg-white rounded-3xl border border-teal-100 shadow-sm overflow-hidden">
        <div className="hidden overflow-x-auto md:block">
          <table className="inventory-table w-full min-w-[1180px] text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-teal-100 text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">
                <th className="py-3.5 px-4">Code / Medicine Name</th>
                <th className="py-3.5 px-4">Store Location (Rack / Box)</th>
                <th className="py-3.5 px-4">Form & Category</th>
                <th className="py-3.5 px-4">Price (Retail / Cost)</th>
                <th className="py-3.5 px-4">Current Stock</th>
                <th className="py-3.5 px-4">Batch & Expiry</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredMedicines.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No medicines matched your inventory filter.
                  </td>
                </tr>
              ) : (
                filteredMedicines.map((med) => {
                  const medicineBatches = (med.batches || []).filter((batch) => batch.quantity > 0);
                  const isLow = med.stock <= med.minStockThreshold;
                  const expDate = new Date(med.expiryDate);
                  const daysToExpiry = Math.ceil((expDate.getTime() - Date.now()) / (1000 * 3600 * 24));
                  const isExpiringSoon = daysToExpiry >= 0 && daysToExpiry <= 60;
                  const margin = med.price - med.costPrice;

                  return (
                    <tr
                      key={med.id}
                      className={`hover:bg-teal-50/40 transition-colors ${
                        isLow ? 'bg-rose-50/20' : isExpiringSoon ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      {/* Name & Code */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono font-bold bg-slate-900 text-teal-300 px-2 py-0.5 rounded">
                                {med.code}
                              </span>
                              {med.requiresPrescription && (
                                <span className="text-[9px] font-extrabold bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded">
                                  Rx
                                </span>
                              )}
                            </div>
                            <div className="font-bold text-slate-900 text-sm mt-0.5">{med.name}</div>
                            <div className="text-[11px] text-slate-500 italic">Generic: {med.genericName}</div>
                          </div>
                        </div>
                      </td>

                      {/* STORE RACK & BOX LOCATION (User Requested Feature!) */}
                      <td className="py-3.5 px-4">
                        <div className="bg-teal-50/80 p-2 rounded-xl border border-teal-200/80 text-teal-900 font-bold text-xs inline-block shadow-2xs">
                          <div className="flex items-center gap-1.5 text-teal-700 font-extrabold">
                            <Layers size={13} /> {med.rackNumber}
                            <span className="text-slate-300">|</span>
                            <Box size={13} className="text-amber-500" /> {med.boxNumber}
                          </div>
                          <div className="text-[10px] font-normal text-slate-500 mt-0.5">
                            {med.shelfLevel}
                          </div>
                        </div>
                      </td>

                      {/* Form & Category */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{med.form} ({med.dosage})</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{med.category}</div>
                      </td>

                      {/* Prices & Profit */}
                      <td className="py-3.5 px-4">
                        <div className="medicine-rate text-base font-extrabold">₹{med.price.toFixed(2)}</div>
                        <div className="text-[10px] text-slate-400">Cost: ₹{med.costPrice.toFixed(2)}</div>
                        <div className="text-[10px] text-emerald-600 font-bold">+₹{margin.toFixed(2)} profit</div>
                      </td>

                      {/* Stock Count */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-extrabold px-2.5 py-1 rounded-xl text-xs ${
                              isLow ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {med.stock} Packs
                          </span>
                          <span className="text-[10px] text-slate-400">Min: {med.minStockThreshold}</span>
                        </div>
                      </td>

                      {/* Batch & Expiry */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">{medicineBatches.slice(0, 2).map((batch) => <div key={batch.id} className="text-[10px]"><span className="font-mono text-slate-700">{batch.batchNumber}</span><span className="ml-1 text-slate-400">×{batch.quantity}</span><div className={`font-semibold ${new Date(`${batch.expiryDate}T00:00:00`).getTime() < new Date(new Date().toDateString()).getTime() ? 'text-rose-600' : 'text-slate-500'}`}>Exp: {batch.expiryDate}</div></div>)}{medicineBatches.length > 2 && <div className="text-[10px] text-teal-700">+{medicineBatches.length - 2} more batches</div>}</div>
                        <div className="text-[10px] text-slate-400">{med.manufacturer}</div>
                      </td>

                      {/* Quick Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setRestockMedicineId(med.id);
                              setRestockAmount(50);
                              setRestockReason('Supplier Delivery Batch');
                              setRestockBatchNumber(`BATCH-${Date.now().toString().slice(-6)}`);
                              setRestockExpiryDate('2027-12-31');
                              setRestockCostPrice(med.costPrice);
                            }}
                            className="bg-teal-50 hover:bg-teal-600 hover:text-white text-teal-700 font-bold px-2.5 py-1 rounded-xl text-[11px] transition-all flex items-center gap-1 border border-teal-200"
                          >
                            <RefreshCw size={12} /> Restock
                          </button>

                          <button
                            onClick={() => handleOpenEditModal(med)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl"
                            title="Edit Medicine"
                          >
                            <Edit3 size={15} />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Delete medicine record "${med.name}"?`)) {
                                onDeleteMedicine(med.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                            title="Delete Medicine"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="space-y-3 p-3 md:hidden">
          {filteredMedicines.length === 0 ? (
            <p className="rounded-xl border border-slate-200 p-6 text-center text-sm text-slate-400">
              No medicines matched your inventory filter.
            </p>
          ) : filteredMedicines.map((med) => {
            const isLow = med.stock <= med.minStockThreshold;
            const daysToExpiry = Math.ceil((new Date(med.expiryDate).getTime() - Date.now()) / 86400000);
            const isExpiringSoon = daysToExpiry >= 0 && daysToExpiry <= 60;
            return (
              <article key={med.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="rounded bg-slate-900 px-2 py-0.5 font-mono text-[10px] font-bold text-teal-300">{med.code}</span>
                      {med.requiresPrescription && <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-700">Rx</span>}
                    </div>
                    <h3 className="mt-2 break-words text-sm font-bold leading-snug text-slate-900">{med.name}</h3>
                    <p className="mt-0.5 text-xs text-slate-500">{med.genericName}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${isLow ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'}`}>
                    {med.stock} packs
                  </span>
                </div>
                <div className="my-3 h-px bg-slate-200" />
                <div className="grid grid-cols-2 gap-x-3 gap-y-3 text-xs">
                  <div><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Storage</p><p className="mt-1 font-semibold text-slate-800">{med.rackNumber} · {med.boxNumber}</p><p className="mt-0.5 text-slate-500">{med.shelfLevel}</p></div>
                  <div><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Selling rate</p><p className="medicine-rate mt-1 text-base font-bold">₹{med.price.toFixed(2)}</p><p className="mt-0.5 text-slate-500">Cost ₹{med.costPrice.toFixed(2)} · Min {med.minStockThreshold}</p></div>
                  <div><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Form & category</p><p className="mt-1 font-semibold text-slate-800">{med.form} · {med.dosage}</p><p className="mt-0.5 text-slate-500">{med.category}</p></div>
                  <div><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Batches & expiry</p>{(med.batches || []).filter((batch) => batch.quantity > 0).slice(0, 3).map((batch) => <p key={batch.id} className="mt-1 font-mono text-xs text-slate-700">{batch.batchNumber} · {batch.quantity} · exp {batch.expiryDate}</p>)}</div>
                </div>
                <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-200 pt-3">
                  <span className="min-w-0 truncate text-xs text-slate-500">{med.manufacturer}</span>
                  <div className="flex shrink-0 items-center gap-2">
                    <button onClick={() => { setRestockMedicineId(med.id); setRestockAmount(50); setRestockReason('Supplier Delivery Batch'); setRestockBatchNumber(`BATCH-${Date.now().toString().slice(-6)}`); setRestockExpiryDate('2027-12-31'); setRestockCostPrice(med.costPrice); }} className="rounded-lg border border-teal-200 bg-teal-50 px-2.5 py-2 text-xs font-bold text-teal-700">Restock</button>
                    <button onClick={() => handleOpenEditModal(med)} className="rounded-lg border border-slate-200 p-2 text-slate-400" title="Edit Medicine"><Edit3 size={15}/></button>
                    <button onClick={() => { if (confirm(`Delete medicine record "${med.name}"?`)) onDeleteMedicine(med.id); }} className="rounded-lg border border-slate-200 p-2 text-rose-400" title="Delete Medicine"><Trash2 size={15}/></button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Modal to Add / Edit Medicine */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-teal-100 shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-lg text-slate-900">
                {editingMedicine ? 'Edit Medicine Details' : 'Register New Medicine to Inventory'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-full">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveMedicine} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Medicine Code / SKU</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Medicine Commercial Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amoxicillin 500mg"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Generic Chemical Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amoxicillin Trihydrate"
                    value={genericName}
                    onChange={(e) => setGenericName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as MedicineCategory)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                  >
                    {categories.filter((c) => c !== 'All').map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* STORE LOCATION INPUTS (User Requested Feature!) */}
              <div className="bg-teal-50/70 p-4 rounded-2xl border border-teal-200 space-y-3">
                <div className="font-extrabold text-teal-900 text-xs flex items-center gap-1.5">
                  <MapPin size={15} className="text-teal-600" /> Physical Store Storage Allocation
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Storage Rack / Aisle</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rack A, Rack B-2"
                      value={rackNumber}
                      onChange={(e) => setRackNumber(e.target.value)}
                      className="w-full bg-white border border-teal-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Box / Container Number</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Box #A-04, Box #12"
                      value={boxNumber}
                      onChange={(e) => setBoxNumber(e.target.value)}
                      className="w-full bg-white border border-teal-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Shelf Level</label>
                    <input
                      type="text"
                      placeholder="e.g. Level 1 (Top), Level 2 (Middle)"
                      value={shelfLevel}
                      onChange={(e) => setShelfLevel(e.target.value)}
                      className="w-full bg-white border border-teal-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Section / Bay Description</label>
                    <input
                      type="text"
                      placeholder="e.g. Section A1 - Fast Moving"
                      value={section}
                      onChange={(e) => setSection(e.target.value)}
                      className="w-full bg-white border border-teal-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Form</label>
                  <select
                    value={form}
                    onChange={(e) => setForm(e.target.value as DosageForm)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                  >
                    {['Tablet', 'Capsule', 'Syrup', 'Injection', 'Ointment', 'Eye Drops', 'Inhaler', 'Sachet', 'Cream', 'Serum', 'Body Wash', 'Soap', 'Gel', 'Bar', 'Drink', 'Medical Device', 'Bandage', 'Tape'].map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Dosage Strengh</label>
                  <input
                    type="text"
                    placeholder="e.g. 500mg, 10ml"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={requiresPrescription}
                      onChange={(e) => setRequiresPrescription(e.target.checked)}
                      className="w-4 h-4 text-teal-600 rounded"
                    />
                    <span>Requires Rx Prescription</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Unit Cost (₹)</label>
                  <input
                    type="number"
                    step="0.1"
                    min={0}
                    value={costPrice}
                    onChange={(e) => setCostPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    step="0.1"
                    min={0}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Initial Qty</label>
                  <input
                    type="number"
                    min={0}
                    disabled={!!editingMedicine}
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                  />
                  {editingMedicine && <p className="mt-1 text-[10px] text-slate-400">Use Restock to change quantities and record new lots.</p>}
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Low Alert Qty</label>
                  <input
                    type="number"
                    min={1}
                    value={minStockThreshold}
                    onChange={(e) => setMinStockThreshold(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Expiry Date</label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().slice(0, 10)}
                    disabled={!!editingMedicine}
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Batch Number</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingMedicine}
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Manufacturer</label>
                  <input
                    type="text"
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-600/20"
                >
                  {editingMedicine ? 'Save Changes' : 'Save Medicine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Restock Batch Modal */}
      {restockMedicineId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-teal-100 shadow-2xl max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="font-bold text-sm text-slate-900">Restock Medicine Batch</h4>
              <button onClick={() => setRestockMedicineId(null)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Add Stock Quantity (+)</label>
                <input
                  type="number"
                  min="1"
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(Number(e.target.value))}
                  className="w-full bg-teal-50 border border-teal-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="font-bold text-slate-700">New batch number<input required className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2" value={restockBatchNumber} onChange={(event) => setRestockBatchNumber(event.target.value)} /></label>
                <label className="font-bold text-slate-700">Expiry date<input required type="date" min={new Date().toISOString().slice(0, 10)} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2" value={restockExpiryDate} onChange={(event) => setRestockExpiryDate(event.target.value)} /></label>
              </div>
              <label className="block font-bold text-slate-700">Unit cost (₹)<input required type="number" min="0" step="0.01" className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2" value={restockCostPrice} onChange={(event) => setRestockCostPrice(Number(event.target.value))} /></label>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Restock Reason / Invoice #</label>
                <input
                  type="text"
                  value={restockReason}
                  onChange={(e) => setRestockReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRestockMedicineId(null)}
                className="px-3 py-1.5 text-xs font-bold text-slate-500 bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={submitRestock}
                className="px-4 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs"
              >
                Confirm Restock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
