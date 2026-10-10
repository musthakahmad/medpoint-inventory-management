import React from 'react';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Check,
  ShoppingBag,
  CreditCard,
  QrCode,
  Banknote,
  Layers,
  Box,
  User,
  Phone,
  Wallet,
} from 'lucide-react';
import { Medicine, CartItem, PaymentMethod, PharmacyBranch, Salesman } from '../types';

interface POSProps {
  medicines: Medicine[];
  salesmen: Salesman[];
  currentBranch: PharmacyBranch;
  cart: CartItem[];
  customerName: string;
  setCustomerName: (name: string) => void;
  customerPhone: string;
  setCustomerPhone: (phone: string) => void;
  discountPercent: number;
  setDiscountPercent: (pct: number) => void;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (pm: PaymentMethod) => void;
  selectedSalesmanId: string;
  setSelectedSalesmanId: (id: string) => void;
  onAddToCart: (medicine: Medicine) => void;
  onUpdateQuantity: (index: number, delta: number) => void;
  onUpdateDosageNotes: (index: number, notes: string) => void;
  onRemoveFromCart: (index: number) => void;
  onClearCart: () => void;
  onCompleteOrder: () => void;
}

export const POS: React.FC<POSProps> = ({
  medicines,
  salesmen,
  currentBranch,
  cart,
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  discountPercent,
  setDiscountPercent,
  paymentMethod,
  setPaymentMethod,
  selectedSalesmanId,
  setSelectedSalesmanId,
  onAddToCart,
  onUpdateQuantity,
  onUpdateDosageNotes,
  onRemoveFromCart,
  onClearCart,
  onCompleteOrder,
}) => {
  const [selectedCategory, setSelectedCategory] = React.useState<string>('All');
  const [searchQuery, setSearchQuery] = React.useState<string>('');

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
  ];

  // Filter medicines
  const filteredMedicines = medicines.filter((m) => {
    const matchesCat = selectedCategory === 'All' || m.category === selectedCategory;
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.boxNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.medicine.price * item.quantity, 0);
  const costTotal = cart.reduce((sum, item) => sum + item.medicine.costPrice * item.quantity, 0);
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const taxableSubtotal = Math.max(0, subtotal - discountAmount);
  const taxAmount = Math.round(taxableSubtotal * 0.05 * 100) / 100; // 5% Healthcare Tax
  const grandTotal = Math.round((taxableSubtotal + taxAmount) * 100) / 100;
  const estimatedProfit = Math.max(0, grandTotal - costTotal);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-100px)] animate-in fade-in duration-300">
      {/* Left Catalog Section (7 Cols) */}
      <div className="lg:col-span-7 flex flex-col h-full overflow-hidden">
        {/* Top Controls: Search & Category pills */}
        <div className="space-y-3 mb-4 shrink-0">
          <div className="relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-teal-600" />
            <input
              type="text"
              placeholder="Search medicine name, generic chemical, code, or box number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-teal-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 shrink-0 ${
                    isSelected
                      ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                      : 'bg-white hover:bg-teal-50 text-slate-700 border border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Medicine Grid */}
        <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 auto-rows-[220px] gap-3">
          {filteredMedicines.length === 0 ? (
            <div className="col-span-full py-16 text-center text-xs text-slate-400 bg-white rounded-3xl border border-dashed border-teal-200">
              No medicines found matching your search query.
            </div>
          ) : (
            filteredMedicines.map((med) => {
              const isLowStock = med.stock <= med.minStockThreshold && med.stock > 0;
              const isOutOfStock = med.stock <= 0;
              const inCartItem = cart.find((item) => item.medicine.id === med.id);

              return (
                <div
                  key={med.id}
                  className={`min-h-[220px] bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
                    isOutOfStock ? 'opacity-60 border-slate-200 bg-slate-50' : 'border-teal-100 hover:border-teal-400'
                  }`}
                >
                  {/* Card Header & Badges */}
                  <div className="p-3 bg-gradient-to-r from-slate-50 to-teal-50/50 border-b border-slate-100 flex items-start justify-between">
                    <div>
                      <span className="text-[9px] font-mono font-bold bg-slate-900 text-teal-300 px-1.5 py-0.5 rounded">
                        {med.code}
                      </span>
                      {med.requiresPrescription && (
                        <span className="ml-1 text-[9px] font-extrabold bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded">
                          Rx
                        </span>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-extrabold text-slate-900">₹{med.price.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Body Content & Store Location Callout */}
                  <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-900 line-clamp-1">{med.name}</h4>
                      <div className="text-[10px] text-slate-500 italic truncate">Generic: {med.genericName}</div>
                      <div className="text-[10px] text-teal-700 font-semibold mt-0.5">{med.form} ({med.dosage})</div>
                    </div>

                    {/* LOCATION CALLOUT */}
                    <div className="bg-teal-50 p-2 rounded-xl border border-teal-200/80 text-[10px] font-bold text-teal-900 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Layers size={11} className="text-teal-600" /> {med.rackNumber}
                      </div>
                      <div className="flex items-center gap-1 font-extrabold text-amber-800">
                        <Box size={11} className="text-amber-500" /> {med.boxNumber}
                      </div>
                    </div>

                    <div className="pt-1 border-t border-slate-100 flex items-center justify-between">
                      <span className={`text-[10px] font-bold ${isOutOfStock ? 'text-rose-600' : isLowStock ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {med.stock} Packs Left
                      </span>

                      <button
                        disabled={isOutOfStock}
                        onClick={() => onAddToCart(med)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-sm ${
                          isOutOfStock
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : inCartItem
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                            : 'bg-teal-600 hover:bg-teal-700 text-white shadow-xs'
                        }`}
                      >
                        <Plus size={16} strokeWidth={3} />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Counter Order Cart (5 Cols) */}
      <div className="lg:col-span-5 bg-white rounded-3xl border border-teal-200 shadow-lg flex flex-col h-full overflow-hidden">
        {/* Cart Header */}
        <div className="p-4 border-b border-teal-100 bg-teal-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-600 text-white shadow-xs">
              <ShoppingBag size={18} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Counter Dispensing Cart</h3>
              <p className="text-[11px] text-slate-500">{cart.length} medicine items in cart</p>
            </div>
          </div>

          {cart.length > 0 && (
            <button
              onClick={onClearCart}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold hover:bg-rose-50 px-2.5 py-1 rounded-xl"
            >
              Clear Cart
            </button>
          )}
        </div>

        {/* SALESMAN SELECTION DROPDOWN */}
        <div className="p-3 bg-slate-900 text-white flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-teal-300">
            <User size={15} /> Dispensed By Salesman:
          </div>
          <select
            value={selectedSalesmanId}
            onChange={(e) => setSelectedSalesmanId(e.target.value)}
            className="bg-slate-800 text-teal-200 font-bold text-xs border border-teal-500/50 rounded-xl px-3 py-1.5 focus:outline-none"
          >
            {salesmen.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.role})
              </option>
            ))}
          </select>
        </div>

        {/* CUSTOMER DETAILS FORM - ASKS FOR NAME AND PHONE NUMBER ONLY (AS REQUESTED) */}
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 space-y-2 text-xs">
          <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            <User size={13} className="text-teal-600" /> Customer Information
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <User size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Customer Name *"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full pl-8 pr-2.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="relative">
              <Phone size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Phone Number *"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full pl-8 pr-2.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Cart Items Scroll Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center text-teal-400 mb-3">
                <ShoppingBag size={32} />
              </div>
              <h4 className="font-extrabold text-slate-700 text-sm">Cart is Currently Empty</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Click "+ Add" on any medicine from the left catalog or the Shelf Finder to add it to this cart.
              </p>
            </div>
          ) : (
            cart.map((item, index) => (
              <div
                key={`${item.medicine.id}-${index}`}
                className="p-3 rounded-2xl bg-teal-50/50 border border-teal-100 flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h5 className="font-extrabold text-xs text-slate-900 truncate">{item.medicine.name}</h5>
                      {item.medicine.requiresPrescription && (
                        <span className="text-[9px] font-bold bg-rose-100 text-rose-700 px-1 py-0.2 rounded">Rx</span>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                      <span className="cart-rate-badge">Rate ₹{item.medicine.price.toFixed(2)} / unit</span>
                      <span className="text-slate-500">× {item.quantity} =</span>
                      <strong className="text-slate-900">₹{(item.medicine.price * item.quantity).toFixed(2)}</strong>
                    </div>
                    {/* Store location hint */}
                    <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <span>📍 Fetch from: <strong className="text-teal-900">{item.medicine.rackNumber}</strong> - <strong className="text-amber-700">{item.medicine.boxNumber}</strong></span>
                    </div>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-1 bg-white border border-teal-200 rounded-xl px-1.5 py-1 shadow-2xs">
                    <button
                      onClick={() => onUpdateQuantity(index, -1)}
                      className="p-0.5 text-slate-600 hover:text-teal-700 hover:bg-teal-50 rounded"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="w-5 text-center text-xs font-extrabold text-slate-800">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(index, 1)}
                      className="p-0.5 text-slate-600 hover:text-teal-700 hover:bg-teal-50 rounded"
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  <button
                    onClick={() => onRemoveFromCart(index)}
                    className="text-slate-400 hover:text-rose-500 p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Dosage Note input */}
                <input
                  type="text"
                  placeholder="Dosage instructions (e.g. 1 capsule 3x daily after food)..."
                  value={item.dosageInstructions || ''}
                  onChange={(e) => onUpdateDosageNotes(index, e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-[11px] text-slate-800 placeholder:text-slate-400"
                />
              </div>
            ))
          )}
        </div>

        {/* Payment & Checkout Footer */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-teal-100 bg-white space-y-3 shrink-0">
            {/* Discount selector */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Apply Discount:</span>
              <div className="flex gap-1">
                {[0, 5, 10, 15, 20].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => setDiscountPercent(pct)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                      discountPercent === pct
                        ? 'bg-teal-700 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {pct === 0 ? 'None' : `${pct}%`}
                  </button>
                ))}
              </div>
            </div>

            {/* Financial summary */}
            <div className="space-y-1 border-t border-slate-100 pt-2 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount ({discountPercent}%)</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span>Medical GST (5%)</span>
                <span>+₹{taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-teal-700 font-bold bg-teal-50 px-2 py-1 rounded-lg">
                <span>Estimated Net Profit</span>
                <span>+₹{estimatedProfit.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-extrabold text-slate-900 pt-1 border-t border-dashed border-teal-200">
                <span>Grand Total</span>
                <span className="text-teal-700">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <div className="text-[10px] font-extrabold uppercase text-slate-400 mb-1">
                Select Payment Mode
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'Card' as PaymentMethod, label: 'Card', icon: CreditCard },
                  { id: 'Cash' as PaymentMethod, label: 'Cash', icon: Banknote },
                  { id: 'UPI / QR' as PaymentMethod, label: 'UPI / QR', icon: QrCode },
                  { id: 'Insurance Claim' as PaymentMethod, label: 'Insurance', icon: Wallet },
                ].map((pm) => {
                  const Icon = pm.icon;
                  const isSel = paymentMethod === pm.id;
                  return (
                    <button
                      key={pm.id}
                      onClick={() => setPaymentMethod(pm.id)}
                      className={`p-2 rounded-xl border text-[11px] font-bold flex flex-col items-center gap-1 transition-all ${
                        isSel
                          ? 'border-teal-600 bg-teal-50 text-teal-800 shadow-2xs'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Icon size={14} />
                      <span className="truncate">{pm.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={onCompleteOrder}
              className="w-full min-h-12 py-3 rounded-xl med-gradient-btn text-white font-semibold text-sm shadow-md shadow-teal-600/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            >
              <Check size={18} /> Complete sale · ₹{grandTotal.toFixed(2)}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
