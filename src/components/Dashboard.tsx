import React, { useMemo, useState } from 'react';
import { AlertTriangle, ArrowRight, Dna, Package, Plus, Search, TrendingUp } from 'lucide-react';
import { Medicine, Order, InventoryLog, PharmacyBranch, Salesman } from '../types';

interface DashboardProps {
  medicines: Medicine[];
  orders: Order[];
  logs: InventoryLog[];
  salesmen: Salesman[];
  currentBranch: PharmacyBranch;
  branches: PharmacyBranch[];
  onNavigateToPOS: () => void;
  onNavigateToInventory: () => void;
  onNavigateToShelfFinder: () => void;
  onNavigateToSalesmen: () => void;
  onAddToCart?: (medicine: Medicine) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  medicines,
  orders,
  currentBranch,
  branches,
  salesmen,
  onNavigateToPOS,
  onNavigateToInventory,
  onAddToCart,
}) => {
  const [quickSearch, setQuickSearch] = useState('');
  const [range, setRange] = useState<'today' | '7' | '30' | 'all'>('7');
  const [branchFilter, setBranchFilter] = useState('all');
  const [salesmanFilter, setSalesmanFilter] = useState('all');
  const now = new Date();
  const completedOrders = orders.filter((order) => {
    if (order.status !== 'Completed') return false;
    if (branchFilter !== 'all' && order.branchId !== branchFilter) return false;
    if (salesmanFilter !== 'all' && order.salesmanId !== salesmanFilter) return false;
    if (range === 'all') return true;
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (range === 'today') return new Date(order.timestamp) >= dayStart;
    const start = new Date(dayStart);
    start.setDate(start.getDate() - (Number(range) - 1));
    return new Date(order.timestamp) >= start;
  });
  const totalRevenue = completedOrders.reduce((sum, order) => sum + order.total, 0);
  const totalProfit = completedOrders.reduce((sum, order) => sum + order.profit, 0);
  const lowStockCount = medicines.filter((medicine) => medicine.stock <= medicine.minStockThreshold).length;
  const expiringCount = medicines.reduce((count, medicine) => count + (medicine.batches || [{ expiryDate: medicine.expiryDate, quantity: medicine.stock }]).filter((batch) => {
    const daysLeft = (new Date(`${batch.expiryDate}T00:00:00`).getTime() - new Date(new Date().toDateString()).getTime()) / 86400000;
    return batch.quantity > 0 && daysLeft >= 0 && daysLeft <= 60;
  }).length, 0);
  const results = quickSearch.trim()
    ? medicines.filter((medicine) =>
        [medicine.name, medicine.genericName, medicine.code, medicine.boxNumber]
          .some((value) => value.toLowerCase().includes(quickSearch.toLowerCase()))
      ).slice(0, 5)
    : [];

  const metrics = [
    { label: 'Sales', value: `₹${totalRevenue.toLocaleString('en-IN')}`, note: `${completedOrders.length} completed orders`, icon: TrendingUp, color: 'teal' },
    { label: 'Profit', value: `₹${totalProfit.toLocaleString('en-IN')}`, note: 'From completed orders', icon: TrendingUp, color: 'emerald' },
    { label: 'Medicines', value: medicines.length.toLocaleString('en-IN'), note: 'In inventory', icon: Package, color: 'sky' },
    { label: 'Stock alerts', value: (lowStockCount + expiringCount).toLocaleString('en-IN'), note: `${lowStockCount} low stock · ${expiringCount} expiring`, icon: AlertTriangle, color: 'amber' },
  ];
  const revenueByDay = useMemo(() => Array.from({ length: 7 }, (_, index) => {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (6 - index));
    const revenue = completedOrders.filter((order) => {
      const date = new Date(order.timestamp);
      return date.getFullYear() === day.getFullYear() && date.getMonth() === day.getMonth() && date.getDate() === day.getDate();
    }).reduce((sum, order) => sum + order.total, 0);
    return { label: day.toLocaleDateString('en-IN', { weekday: 'short' }), revenue };
  }), [completedOrders]);
  const bestSellers = useMemo(() => {
    const totals = new Map<string, { name: string; quantity: number; revenue: number }>();
    completedOrders.forEach((order) => order.items.forEach((item) => {
      const current = totals.get(item.medicine.id) || { name: item.medicine.name, quantity: 0, revenue: 0 };
      current.quantity += item.quantity;
      current.revenue += item.quantity * item.medicine.price;
      totals.set(item.medicine.id, current);
    }));
    return [...totals.values()].sort((a, b) => b.quantity - a.quantity).slice(0, 5);
  }, [completedOrders]);
  const maxDailyRevenue = Math.max(...revenueByDay.map((day) => day.revenue), 1);

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-8">
      <div className="dashboard-entrance relative flex min-h-[190px] flex-wrap items-center justify-between gap-4 overflow-hidden rounded-2xl bg-gradient-to-br from-teal-800 to-teal-700 px-7 py-7 text-white shadow-md shadow-teal-900/10 lg:px-9">
        <div aria-hidden="true" className="dashboard-orbit pointer-events-none absolute hidden sm:block" />
        <div aria-hidden="true" className="pointer-events-none absolute right-44 top-1/2 hidden h-24 w-24 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/70 dashboard-float sm:flex">
          <Dna size={58} strokeWidth={1.25} />
        </div>
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-32 h-72 w-72 rounded-full bg-cyan-400/15 blur-2xl" />
        <div className="relative z-10">
          <h2 className="text-3xl font-semibold tracking-tight">Dashboard</h2>
          <p className="mt-2 text-sm text-teal-100">{currentBranch.name}</p>
        </div>
        <button
          onClick={onNavigateToPOS}
          className="group relative z-10 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-teal-900 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-teal-50"
        >
          New sale <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      <section className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <span className="mr-auto text-sm font-semibold text-slate-800">Sales insights</span>
        <label className="text-xs text-slate-500">Period<select className="ml-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700" value={range} onChange={(event) => setRange(event.target.value as typeof range)}><option value="today">Today</option><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="all">All time</option></select></label>
        {branches.length > 1 && <label className="text-xs text-slate-500">Branch<select className="ml-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700" value={branchFilter} onChange={(event) => setBranchFilter(event.target.value)}><option value="all">All branches</option>{branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select></label>}
        <label className="text-xs text-slate-500">Staff<select className="ml-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700" value={salesmanFilter} onChange={(event) => setSalesmanFilter(event.target.value)}><option value="all">All staff</option>{salesmen.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}</select></label>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, note, icon: Icon, color }) => (
          <div key={label} className={`dashboard-entrance dashboard-hover dashboard-stat-${color} rounded-xl border border-slate-200 bg-white p-5 shadow-sm`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">{label}</span>
              <span className="dashboard-stat-icon flex h-10 w-10 items-center justify-center rounded-xl"><Icon size={19} /></span>
            </div>
            <div className="mt-3 text-2xl font-semibold text-slate-900">{value}</div>
            <div className="mt-1 text-xs text-slate-500">{note}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_.8fr]">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between"><div><h3 className="font-semibold text-slate-900">Revenue trend</h3><p className="mt-1 text-sm text-slate-500">Daily sales over the last seven days</p></div><span className="text-xs text-slate-400">{branches.length === 1 ? currentBranch.city : branchFilter === 'all' ? 'All branches' : branches.find((branch) => branch.id === branchFilter)?.city}</span></div>
          <div className="mt-6 flex h-40 items-end gap-3 sm:gap-5">{revenueByDay.map((day) => <div key={day.label} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"><span className="max-w-full truncate text-[10px] text-slate-500" title={`₹${day.revenue.toLocaleString('en-IN')}`}>{day.revenue ? `₹${Math.round(day.revenue).toLocaleString('en-IN')}` : ''}</span><div className="flex w-full flex-1 items-end"><div className="w-full rounded-t-md bg-gradient-to-t from-teal-700 to-cyan-500" style={{ height: `${Math.max(day.revenue ? (day.revenue / maxDailyRevenue) * 100 : 0, day.revenue ? 9 : 2)}%` }}/></div><span className="text-xs text-slate-500">{day.label}</span></div>)}</div>
        </section>
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="font-semibold text-slate-900">Top medicines</h3><p className="mt-1 text-sm text-slate-500">Units sold in the selected period</p><div className="mt-4 divide-y divide-slate-100">{bestSellers.length === 0 ? <p className="py-6 text-center text-sm text-slate-500">No sales in this period.</p> : bestSellers.map((medicine, index) => <div key={medicine.name} className="flex items-center gap-3 py-3"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-50 text-xs font-semibold text-teal-800">{index + 1}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-slate-800">{medicine.name}</p><p className="text-xs text-slate-500">{medicine.quantity} units</p></div><span className="text-sm font-semibold text-slate-700">₹{medicine.revenue.toLocaleString('en-IN')}</span></div>)}</div></section>
      </div>

      <section className="dashboard-entrance dashboard-hover rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-slate-900">Find a medicine</h3>
          <p className="mt-1 text-sm text-slate-500">Search by name, generic name, code, or box number.</p>
        </div>
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search medicines"
            value={quickSearch}
            onChange={(event) => setQuickSearch(event.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
          />
        </div>
        {quickSearch.trim() && (
          <div className="mt-3 divide-y divide-slate-100">
            {results.length === 0 ? (
              <p className="py-4 text-sm text-slate-500">No medicines found.</p>
            ) : results.map((medicine) => (
              <div key={medicine.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">{medicine.name}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{medicine.genericName} · {medicine.rackNumber}, {medicine.boxNumber}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-slate-800">₹{medicine.price.toFixed(2)}</span>
                  {onAddToCart && (
                    <button
                      onClick={() => onAddToCart(medicine)}
                      disabled={medicine.stock <= 0}
                      className="inline-flex items-center gap-1 rounded-md border border-teal-700 px-3 py-1.5 text-sm font-medium text-teal-800 transition hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Plus size={15} /> Add
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-4 flex flex-wrap gap-3 border-t border-slate-100 pt-4">
          <button onClick={onNavigateToInventory} className="text-sm font-medium text-teal-800 hover:underline">View inventory</button>
          <button onClick={onNavigateToPOS} className="text-sm font-medium text-teal-800 hover:underline">Open billing</button>
        </div>
      </section>
    </div>
  );
};
