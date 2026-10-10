import React, { useState } from 'react';
import { Search, MapPin, Box, Layers, AlertCircle, ShoppingCart, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Medicine } from '../types';

interface ShelfFinderProps {
  medicines: Medicine[];
  onAddToCart?: (medicine: Medicine) => void;
  onNavigateToPOS: () => void;
  cartItemCount?: number;
}

export const ShelfFinder: React.FC<ShelfFinderProps> = ({
  medicines,
  onAddToCart,
  onNavigateToPOS,
  cartItemCount = 0,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRack, setSelectedRack] = useState<string>('ALL');
  const [selectedBox, setSelectedBox] = useState<string | null>(null);
  const [addedItemName, setAddedItemName] = useState<string | null>(null);

  // Filter medicines
  const filteredMedicines = medicines.filter((med) => {
    const matchesSearch =
      med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.boxNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.rackNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRack = selectedRack === 'ALL' || med.rackNumber.toUpperCase().includes(selectedRack.toUpperCase());
    const matchesBox = !selectedBox || med.boxNumber.toLowerCase() === selectedBox.toLowerCase();

    return matchesSearch && matchesRack && matchesBox;
  });

  const handleAddClick = (med: Medicine) => {
    if (onAddToCart) {
      onAddToCart(med);
      setAddedItemName(med.name);
      setTimeout(() => setAddedItemName(null), 3000);
    }
  };

  // Extract unique racks
  const racks = ['ALL', 'Rack A', 'Rack B', 'Rack C', 'Rack D'];

  // Extract boxes for current rack
  const availableBoxes = Array.from(
    new Set(
      medicines
        .filter((m) => selectedRack === 'ALL' || m.rackNumber.toUpperCase().includes(selectedRack.toUpperCase()))
        .map((m) => m.boxNumber)
    )
  ).sort();

  return (
    <div className="space-y-6">
      {/* Top Added Toast Notification */}
      {addedItemName && (
        <div className="fixed top-16 right-8 z-50 bg-emerald-700 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 border border-emerald-500">
          <CheckCircle2 size={20} className="text-emerald-300" />
          <div>
            <div className="text-xs font-extrabold">{addedItemName} Added to Cart!</div>
            <div className="text-[10px] text-emerald-200">Item is ready in your counter dispensing bill</div>
          </div>
          <button
            onClick={onNavigateToPOS}
            className="ml-3 bg-white text-emerald-900 px-3 py-1 rounded-xl text-xs font-bold hover:bg-emerald-50"
          >
            Go to Cart ({cartItemCount}) →
          </button>
        </div>
      )}

      {/* Top Banner */}
      <div className="med-gradient p-6 rounded-3xl text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold mb-3 border border-white/30">
            <MapPin size={14} className="text-teal-200" /> Counter Assistance Tool
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Medicine & Shelf Locator
          </h2>
          <p className="text-teal-100 text-xs md:text-sm mt-1 leading-relaxed">
            When a customer asks for a medicine, type the name or code here to instantly find its exact <span className="font-bold underline decoration-teal-300">Rack Number</span> and <span className="font-bold underline decoration-teal-300">Box Location</span> in your store!
          </p>
        </div>

        {/* Search Bar inside Hero */}
        <div className="relative z-10 w-full md:w-96 bg-slate-900/80 backdrop-blur-md p-2 rounded-2xl shadow-lg border border-teal-200">
          <div className="relative">
            <Search size={18} className="absolute left-3.5 top-3.5 text-teal-600" />
            <input
              type="text"
              placeholder="Search by Medicine, Code (e.g. MED-1001), or Box #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
              autoFocus
            />
          </div>
          {searchQuery && (
            <div className="mt-2 text-[11px] text-teal-700 font-medium px-2 flex justify-between items-center">
              <span>Found {filteredMedicines.length} medicine matches</span>
              <button
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600 underline"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
      </div>

      {/* Rack Selector & Visual Shelf Map Header */}
      <div className="glass-card p-5 rounded-2xl shadow-sm border border-teal-100 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Layers size={18} className="text-teal-600" /> Store Racks & Aisles Overview
            </h3>
            <p className="text-xs text-slate-500">Filter by physical storage rack to view allocated boxes</p>
          </div>

          {/* Rack Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {racks.map((rack) => {
              const isActive = selectedRack === rack;
              return (
                <button
                  key={rack}
                  onClick={() => {
                    setSelectedRack(rack);
                    setSelectedBox(null);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-teal-700 text-white shadow-md shadow-teal-700/20'
                      : 'bg-slate-100 text-slate-600 hover:bg-teal-50 hover:text-teal-700 border border-slate-200'
                  }`}
                >
                  {rack === 'ALL' ? 'All Racks' : rack}
                </button>
              );
            })}
          </div>
        </div>

        {/* Box Selector Pills */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap">Filter Box:</span>
          <button
            onClick={() => setSelectedBox(null)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors ${
              selectedBox === null
                ? 'bg-slate-800 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Boxes
          </button>
          {availableBoxes.map((box) => (
            <button
              key={box}
              onClick={() => setSelectedBox(selectedBox === box ? null : box)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
                selectedBox === box
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-teal-50/70 text-teal-800 border border-teal-200/80 hover:bg-teal-100'
              }`}
            >
              <Box size={12} /> {box}
            </button>
          ))}
        </div>
      </div>

      {/* Results Section */}
      {filteredMedicines.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs max-w-lg mx-auto">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-500 mb-4">
            <AlertCircle size={32} />
          </div>
          <h4 className="text-base font-bold text-slate-800">No Medicine Found</h4>
          <p className="text-xs text-slate-500 mt-1">
            No medicine matching "<span className="font-semibold">{searchQuery}</span>" was found in {selectedRack === 'ALL' ? 'the store' : selectedRack}.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMedicines.map((med) => {
            const isLowStock = med.stock <= med.minStockThreshold;
            const isOutOfStock = med.stock === 0;

            const expDate = new Date(med.expiryDate);
            const daysToExpiry = Math.ceil((expDate.getTime() - Date.now()) / (1000 * 3600 * 24));
            const isExpiringSoon = daysToExpiry >= 0 && daysToExpiry <= 60;

            return (
              <div
                key={med.id}
                className="bg-white rounded-2xl border border-teal-100 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group relative"
              >
                {/* Header Tag Bar */}
                <div className="p-4 pb-3 border-b border-slate-100 bg-slate-800">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold bg-slate-900 text-teal-300 px-2 py-0.5 rounded">
                          {med.code}
                        </span>
                        {med.requiresPrescription ? (
                          <span className="text-[10px] font-extrabold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full border border-rose-200">
                            Rx Required
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                            OTC
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-slate-900 text-base mt-1.5 group-hover:text-sky-300 transition-colors">
                        {med.name}
                      </h3>
                      <p className="text-xs text-slate-500 italic mt-0.5">
                        Generic: {med.genericName} ({med.dosage})
                      </p>
                    </div>

                    <div className="medicine-rate-card shrink-0 rounded-xl border px-3 py-2 text-right">
                      <div className="text-[11px] font-bold uppercase tracking-wide">Selling rate</div>
                      <div className="medicine-rate text-lg font-extrabold">₹{med.price.toFixed(2)}</div>
                      <div className="text-[11px] font-medium text-slate-400">Cost: ₹{med.costPrice.toFixed(2)}</div>
                    </div>
                  </div>
                </div>

                {/* HIGHLIGHTED STORE LOCATION CALLOUT */}
                <div className="p-4 bg-teal-50/70 border-y border-teal-100 my-1 space-y-2">
                  <div className="text-[10px] font-extrabold text-teal-800 uppercase tracking-wider flex items-center gap-1">
                    <MapPin size={12} className="text-teal-600" /> Physical Store Location
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white p-2.5 rounded-xl border border-teal-200/80 shadow-2xs">
                      <div className="text-[10px] text-slate-400 font-semibold">STORAGE RACK</div>
                      <div className="text-sm font-extrabold text-teal-900 flex items-center gap-1.5">
                        <Layers size={14} className="text-teal-600" /> {med.rackNumber}
                      </div>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-teal-200/80 shadow-2xs">
                      <div className="text-[10px] text-slate-400 font-semibold">BOX NUMBER</div>
                      <div className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                        <Box size={14} className="text-amber-500" /> {med.boxNumber}
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-600 flex items-center justify-between pt-1">
                    <span><strong>Shelf Level:</strong> {med.shelfLevel}</span>
                    <span className="text-teal-700 font-semibold">{med.section}</span>
                  </div>
                </div>

                {/* Medicine Stock & Expiry Footer */}
                <div className="p-4 pt-2 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-medium">Stock:</span>
                      <span
                        className={`font-extrabold px-2 py-0.5 rounded-md text-xs ${
                          isOutOfStock
                            ? 'bg-rose-100 text-rose-700'
                            : isLowStock
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {med.stock} Packs
                      </span>
                    </div>

                    <div className="text-right">
                      {isExpiringSoon ? (
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Exp: {med.expiryDate} (Soon)
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500">Exp: {med.expiryDate}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleAddClick(med)}
                      disabled={isOutOfStock}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        isOutOfStock
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20'
                      }`}
                    >
                      <ShoppingCart size={14} /> Add to POS Cart
                    </button>
                    <button
                      onClick={onNavigateToPOS}
                      className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      View Cart ({cartItemCount}) <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
