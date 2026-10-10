import React, { useMemo, useState } from 'react';
import { ClipboardCheck, ClipboardList, Clock3, PackagePlus, Plus, Truck } from 'lucide-react';
import { DailyClosing, InventoryLog, Medicine, PharmacyBranch, PurchaseOrder, ShiftHandover, Supplier } from '../types';

type OperationView = 'movement' | 'purchasing' | 'closing' | 'handover';

interface OperationsProps {
  medicines: Medicine[];
  logs: InventoryLog[];
  orders: import('../types').Order[];
  salesmen: import('../types').Salesman[];
  currentBranch: PharmacyBranch;
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  closings: DailyClosing[];
  handovers: ShiftHandover[];
  onAddSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  onCreatePurchaseOrder: (order: Omit<PurchaseOrder, 'id'>) => void;
  onReceivePurchaseOrder: (order: PurchaseOrder) => void;
  onCreateClosing: (closing: Omit<DailyClosing, 'id'>) => void;
  onCreateHandover: (handover: Omit<ShiftHandover, 'id'>) => void;
}

const todayKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};
const localDateKey = (value: string) => {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};
const money = (value: number) => `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
const inputClass = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100';
const buttonClass = 'inline-flex items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50';

export const Operations: React.FC<OperationsProps> = (props) => {
  const { medicines, logs, orders, salesmen, currentBranch, suppliers, purchaseOrders, closings, handovers } = props;
  const [view, setView] = useState<OperationView>('movement');
  const [supplierName, setSupplierName] = useState('');
  const [supplierContact, setSupplierContact] = useState('');
  const [supplierPhone, setSupplierPhone] = useState('');
  const [supplierEmail, setSupplierEmail] = useState('');
  const [leadTime, setLeadTime] = useState(3);
  const [poSupplierId, setPoSupplierId] = useState(suppliers[0]?.id || '');
  const [poMedicineId, setPoMedicineId] = useState(medicines[0]?.id || '');
  const [poQuantity, setPoQuantity] = useState(20);
  const [closeNotes, setCloseNotes] = useState('');
  const [handoverFrom, setHandoverFrom] = useState(salesmen[0]?.name || '');
  const [handoverTo, setHandoverTo] = useState(salesmen[1]?.name || salesmen[0]?.name || '');
  const [handoverNotes, setHandoverNotes] = useState('');
  const [pendingTasks, setPendingTasks] = useState('');
  const [movementSearch, setMovementSearch] = useState('');

  const today = todayKey();
  const todayOrders = orders.filter((order) => order.branchId === currentBranch.id && localDateKey(order.timestamp) === today && order.status === 'Completed');
  const cashTotal = todayOrders.filter((order) => order.paymentMethod === 'Cash').reduce((sum, order) => sum + order.total, 0);
  const cardTotal = todayOrders.filter((order) => order.paymentMethod === 'Card').reduce((sum, order) => sum + order.total, 0);
  const digitalTotal = todayOrders.filter((order) => !['Cash', 'Card'].includes(order.paymentMethod)).reduce((sum, order) => sum + order.total, 0);
  const closedToday = closings.find((closing) => closing.branchId === currentBranch.id && closing.date === today);
  const orderedValue = purchaseOrders.filter((order) => order.status === 'Ordered').reduce((sum, order) => sum + order.total, 0);

  const movements = useMemo(() => logs.filter((log) => `${log.medicineName} ${log.reason || ''} ${log.performedBy || ''}`.toLowerCase().includes(movementSearch.toLowerCase())), [logs, movementSearch]);

  const submitSupplier = (event: React.FormEvent) => {
    event.preventDefault();
    if (!supplierName.trim()) return;
    props.onAddSupplier({ name: supplierName.trim(), contactName: supplierContact.trim(), phone: supplierPhone.trim(), email: supplierEmail.trim(), leadTimeDays: Number(leadTime) || 0 });
    setSupplierName(''); setSupplierContact(''); setSupplierPhone(''); setSupplierEmail(''); setLeadTime(3);
  };

  const submitPurchaseOrder = (event: React.FormEvent) => {
    event.preventDefault();
    const supplier = suppliers.find((item) => item.id === poSupplierId);
    const medicine = medicines.find((item) => item.id === poMedicineId);
    if (!supplier || !medicine || poQuantity < 1) return;
    const now = new Date();
    const expected = new Date(now.getTime() + supplier.leadTimeDays * 86400000);
    props.onCreatePurchaseOrder({
      orderNumber: `PO-${String(Date.now()).slice(-6)}`, supplierId: supplier.id, supplierName: supplier.name,
      createdAt: now.toISOString(), expectedAt: expected.toISOString(), status: 'Ordered',
      items: [{ medicineId: medicine.id, medicineName: medicine.name, quantity: Number(poQuantity), unitCost: medicine.costPrice }],
      total: Number(poQuantity) * medicine.costPrice,
    });
    setPoQuantity(20);
  };

  const closeDay = () => {
    if (closedToday) return;
    props.onCreateClosing({ date: today, branchId: currentBranch.id, branchName: currentBranch.name, closedAt: new Date().toISOString(), closedBy: salesmen.find((person) => person.status === 'On Duty')?.name || 'Pharmacy Manager', orderCount: todayOrders.length, revenue: todayOrders.reduce((sum, order) => sum + order.total, 0), cashTotal, cardTotal, digitalTotal, notes: closeNotes.trim() });
    setCloseNotes('');
  };

  const saveHandover = (event: React.FormEvent) => {
    event.preventDefault();
    if (!handoverTo.trim()) return;
    props.onCreateHandover({ createdAt: new Date().toISOString(), branchId: currentBranch.id, fromName: handoverFrom.trim(), toName: handoverTo.trim(), notes: handoverNotes.trim(), pendingTasks: pendingTasks.trim() });
    setHandoverNotes(''); setPendingTasks('');
  };

  const tabs: { id: OperationView; label: string; icon: React.ElementType }[] = [
    { id: 'movement', label: 'Stock movement', icon: ClipboardList },
    { id: 'purchasing', label: 'Suppliers & orders', icon: Truck },
    { id: 'closing', label: 'Daily closing', icon: ClipboardCheck },
    { id: 'handover', label: 'Shift handover', icon: Clock3 },
  ];

  return <div className="mx-auto max-w-7xl space-y-6 pb-10">
    <div className="rounded-2xl bg-gradient-to-br from-teal-800 to-cyan-700 px-7 py-7 text-white shadow-md shadow-teal-900/10">
      <p className="text-xs font-semibold uppercase tracking-[.16em] text-teal-100">Pharmacy operations</p>
      <h2 className="mt-2 text-2xl font-semibold">Keep the day running smoothly</h2>
      <p className="mt-1 text-sm text-teal-50/90">Stock traceability, purchasing, cash-up and clear shift handovers.</p>
    </div>
    <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
      {tabs.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setView(id)} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium ${view === id ? 'bg-teal-700 text-white' : 'text-slate-600 hover:bg-slate-50'}`}><Icon size={16}/>{label}</button>)}
    </div>

    {view === 'movement' && <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5"><div><h3 className="font-semibold text-slate-900">Stock movement history</h3><p className="mt-1 text-sm text-slate-500">Every sale, restock and manual adjustment with its operator and resulting stock.</p></div><input aria-label="Search movements" className={`${inputClass} max-w-xs`} placeholder="Search medicine or staff" value={movementSearch} onChange={(event) => setMovementSearch(event.target.value)}/></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>{['Date & time','Medicine','Movement','Change','Stock after','Reason','Staff'].map((label) => <th key={label} className="px-4 py-3 font-semibold">{label}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{movements.length === 0 ? <tr><td colSpan={7} className="p-8 text-center text-slate-500">No stock movements match this search.</td></tr> : movements.map((log) => <tr key={log.id} className="hover:bg-teal-50/40"><td className="whitespace-nowrap px-4 py-3 text-slate-500">{new Date(log.timestamp).toLocaleString()}</td><td className="px-4 py-3 font-medium text-slate-900">{log.medicineName}</td><td className="px-4 py-3 capitalize text-slate-600">{log.type.replace('_', ' ')}</td><td className={`px-4 py-3 font-semibold ${log.quantityChange > 0 ? 'text-emerald-700' : 'text-rose-700'}`}>{log.quantityChange > 0 ? '+' : ''}{log.quantityChange}</td><td className="px-4 py-3 text-slate-700">{log.newStock}</td><td className="max-w-64 truncate px-4 py-3 text-slate-500">{log.reason || '—'}</td><td className="px-4 py-3 text-slate-600">{log.performedBy || '—'}</td></tr>)}</tbody></table></div>
    </section>}

    {view === 'purchasing' && <div className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-2">
        <form onSubmit={submitSupplier} className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-1"><h3 className="font-semibold text-slate-900">Add supplier</h3><p className="mt-1 text-sm text-slate-500">Save vendor details for future purchase orders.</p></div><input className={inputClass} placeholder="Supplier name *" value={supplierName} onChange={(event) => setSupplierName(event.target.value)} required/><div className="grid gap-3 sm:grid-cols-2"><input className={inputClass} placeholder="Contact person" value={supplierContact} onChange={(event) => setSupplierContact(event.target.value)}/><input className={inputClass} placeholder="Phone" value={supplierPhone} onChange={(event) => setSupplierPhone(event.target.value)}/></div><div className="grid gap-3 sm:grid-cols-2"><input className={inputClass} type="email" placeholder="Email" value={supplierEmail} onChange={(event) => setSupplierEmail(event.target.value)}/><label className="text-xs text-slate-500">Lead time (days)<input className={`${inputClass} mt-1`} type="number" min="0" value={leadTime} onChange={(event) => setLeadTime(Number(event.target.value))}/></label></div><button className={buttonClass}><Plus size={16}/>Save supplier</button></form>
        <form onSubmit={submitPurchaseOrder} className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-1"><h3 className="font-semibold text-slate-900">Create purchase order</h3><p className="mt-1 text-sm text-slate-500">Orders stay open until the delivery is received.</p></div><label className="block text-xs font-medium text-slate-600">Supplier<select className={`${inputClass} mt-1`} value={poSupplierId} onChange={(event) => setPoSupplierId(event.target.value)} required><option value="">Choose supplier</option>{suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}</select></label><label className="block text-xs font-medium text-slate-600">Medicine<select className={`${inputClass} mt-1`} value={poMedicineId} onChange={(event) => setPoMedicineId(event.target.value)}>{medicines.map((medicine) => <option key={medicine.id} value={medicine.id}>{medicine.name} · {money(medicine.costPrice)} / unit</option>)}</select></label><div className="flex items-end gap-3"><label className="flex-1 text-xs font-medium text-slate-600">Quantity<input className={`${inputClass} mt-1`} type="number" min="1" value={poQuantity} onChange={(event) => setPoQuantity(Number(event.target.value))}/></label><button className={buttonClass} disabled={!suppliers.length || !medicines.length}><PackagePlus size={16}/>Place order</button></div>{!suppliers.length && <p className="text-xs text-amber-700">Add a supplier before placing an order.</p>}</form>
      </div>
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="flex flex-wrap justify-between gap-2 border-b border-slate-100 p-5"><div><h3 className="font-semibold text-slate-900">Purchase orders</h3><p className="mt-1 text-sm text-slate-500">{money(orderedValue)} currently awaiting delivery</p></div><span className="text-sm text-slate-500">{purchaseOrders.length} total</span></div><div className="divide-y divide-slate-100">{purchaseOrders.length === 0 ? <p className="p-8 text-center text-sm text-slate-500">No purchase orders yet. Create one above.</p> : [...purchaseOrders].reverse().map((order) => <div key={order.id} className="flex flex-wrap items-center justify-between gap-4 p-4"><div><div className="flex items-center gap-2 font-semibold text-slate-900">{order.orderNumber}<span className={`rounded-full px-2 py-0.5 text-[11px] ${order.status === 'Received' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'}`}>{order.status}</span></div><p className="mt-1 text-sm text-slate-600">{order.supplierName} · {order.items.map((item) => `${item.medicineName} × ${item.quantity}`).join(', ')}</p><p className="mt-1 text-xs text-slate-400">Expected {new Date(order.expectedAt).toLocaleDateString()}</p></div><div className="flex items-center gap-4"><strong className="text-slate-900">{money(order.total)}</strong>{order.status === 'Ordered' && <button className={buttonClass} onClick={() => props.onReceivePurchaseOrder(order)}>Mark received</button>}</div></div>)}</div></section>
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="font-semibold text-slate-900">Supplier directory <span className="font-normal text-slate-400">({suppliers.length})</span></h3><div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{suppliers.map((supplier) => <div key={supplier.id} className="rounded-lg bg-slate-50 p-4"><p className="font-semibold text-slate-900">{supplier.name}</p><p className="mt-1 text-sm text-slate-600">{supplier.contactName || 'Contact not set'}</p><p className="text-sm text-slate-500">{supplier.phone || supplier.email || 'No contact details'}</p><p className="mt-2 text-xs text-teal-700">{supplier.leadTimeDays} day lead time</p></div>)}</div></section>
    </div>}

    {view === 'closing' && <div className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
      <section className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div><h3 className="font-semibold text-slate-900">Daily closing · {new Date().toLocaleDateString()}</h3><p className="mt-1 text-sm text-slate-500">Completed sales for {currentBranch.name} today.</p></div><div className="grid gap-3 sm:grid-cols-2"><div className="rounded-lg bg-teal-50 p-4"><p className="text-sm text-teal-800">Net revenue</p><p className="mt-1 text-2xl font-semibold text-slate-900">{money(todayOrders.reduce((sum, order) => sum + order.total, 0))}</p></div><div className="rounded-lg bg-slate-50 p-4"><p className="text-sm text-slate-600">Completed orders</p><p className="mt-1 text-2xl font-semibold text-slate-900">{todayOrders.length}</p></div></div><div className="divide-y divide-slate-100 rounded-lg border border-slate-100">{[['Cash', cashTotal], ['Card', cardTotal], ['Other digital', digitalTotal]].map(([label, value]) => <div key={label} className="flex justify-between px-4 py-3 text-sm"><span className="text-slate-600">{label}</span><strong className="text-slate-900">{money(Number(value))}</strong></div>)}</div><textarea className={inputClass} rows={3} placeholder="Closing notes or cash variance" value={closeNotes} onChange={(event) => setCloseNotes(event.target.value)} disabled={!!closedToday}/><button onClick={closeDay} disabled={!!closedToday} className={buttonClass}>{closedToday ? 'Day closed' : 'Close out today'}</button>{closedToday && <p className="text-sm text-emerald-700">Closed by {closedToday.closedBy} at {new Date(closedToday.closedAt).toLocaleTimeString()}.</p>}</section>
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="font-semibold text-slate-900">Previous closings</h3><div className="mt-4 space-y-3">{closings.length === 0 ? <p className="text-sm text-slate-500">No closing reports recorded yet.</p> : [...closings].reverse().slice(0, 8).map((closing) => <div key={closing.id} className="rounded-lg bg-slate-50 p-3"><div className="flex justify-between gap-2 text-sm font-medium text-slate-800"><span>{closing.date}</span><span>{money(closing.revenue)}</span></div><p className="mt-1 text-xs text-slate-500">{closing.branchName} · {closing.orderCount} orders · {closing.closedBy}</p>{closing.notes && <p className="mt-2 text-xs text-slate-600">{closing.notes}</p>}</div>)}</div></section>
    </div>}

    {view === 'handover' && <div className="grid gap-5 xl:grid-cols-[.9fr_1.1fr]"><form onSubmit={saveHandover} className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div><h3 className="font-semibold text-slate-900">Record a shift handover</h3><p className="mt-1 text-sm text-slate-500">Pass important context and unfinished work to the next person.</p></div><label className="block text-xs font-medium text-slate-600">Handing over from<select className={`${inputClass} mt-1`} value={handoverFrom} onChange={(event) => setHandoverFrom(event.target.value)}>{salesmen.map((person) => <option key={person.id}>{person.name}</option>)}</select></label><label className="block text-xs font-medium text-slate-600">Handing over to<select className={`${inputClass} mt-1`} value={handoverTo} onChange={(event) => setHandoverTo(event.target.value)}>{salesmen.map((person) => <option key={person.id}>{person.name}</option>)}</select></label><label className="block text-xs font-medium text-slate-600">Shift notes<textarea className={`${inputClass} mt-1`} rows={3} placeholder="Customer requests, equipment issues, cash notes…" value={handoverNotes} onChange={(event) => setHandoverNotes(event.target.value)}/></label><label className="block text-xs font-medium text-slate-600">Pending tasks<textarea className={`${inputClass} mt-1`} rows={3} placeholder="Tasks the next shift should complete" value={pendingTasks} onChange={(event) => setPendingTasks(event.target.value)}/></label><button className={buttonClass}><Plus size={16}/>Save handover</button></form><section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="font-semibold text-slate-900">Recent handovers</h3><div className="mt-4 space-y-3">{handovers.length === 0 ? <p className="text-sm text-slate-500">No shift handovers recorded yet.</p> : [...handovers].reverse().slice(0, 10).map((handover) => <article key={handover.id} className="rounded-lg border border-slate-100 p-4"><p className="text-xs text-slate-400">{new Date(handover.createdAt).toLocaleString()} · {currentBranch.name}</p><p className="mt-1 font-semibold text-slate-900">{handover.fromName} <span className="font-normal text-slate-400">to</span> {handover.toName}</p>{handover.notes && <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{handover.notes}</p>}{handover.pendingTasks && <div className="mt-3 rounded-md bg-amber-50 p-3"><p className="text-xs font-semibold text-amber-800">Pending tasks</p><p className="mt-1 whitespace-pre-wrap text-sm text-amber-900">{handover.pendingTasks}</p></div>}</article>)}</div></section></div>}
  </div>;
};
