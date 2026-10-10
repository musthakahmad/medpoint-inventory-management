import React, { useState } from 'react';
import {
  Package,
  AlertTriangle,
  Clock,
  TrendingUp,
  Search,
  CheckCircle,
  LayoutDashboard,
  ShieldCheck,
  ShoppingBag,
  MapPin,
  Box,
  Layers,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Medicine, Order, InventoryLog } from '../../types';

interface DashboardPreviewSectionProps {
  medicines: Medicine[];
  orders: Order[];
  logs: InventoryLog[];
  onOpenLiveApp: () => void;
}

export const DashboardPreviewSection: React.FC<DashboardPreviewSectionProps> = ({
  medicines,
  orders,
  logs,
  onOpenLiveApp,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'stock' | 'expiry' | 'recent'>('overview');

  const lowStockMedicines = medicines.filter((m) => m.stock <= m.minStockThreshold);

  const expiringMedicines = medicines.filter((m) => {
    const exp = new Date(m.expiryDate).getTime();
    const now = Date.now();
    const diffDays = (exp - now) / (1000 * 3600 * 24);
    return diffDays >= 0 && diffDays <= 60;
  });

  const totalStockUnits = medicines.reduce((sum, m) => sum + m.stock, 0);

  return (
    <section id="dashboard-preview" className="py-24 bg-slate-900 text-slate-100 relative overflow-hidden">
      {/* Glow Backdrops */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 bg-teal-950 text-teal-300 border border-teal-800/80 px-4 py-1.5 rounded-full text-xs font-bold font-mono">
            <Sparkles size={14} className="text-teal-400" />
            <span>Interactive SaaS Interface</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Your Pharmacy. One Smart Dashboard.
          </h2>

          <p className="text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Experience complete control with real-time stock matrixes, automated low-stock warnings, FEFO expiry trackers, and quick shelf locator tools.
          </p>
        </div>

        {/* Browser Mockup Showcase Box */}
        <div className="bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl p-6 lg:p-8 space-y-6">
          {/* Top Browser Title Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-rose-500 inline-block"></span>
                <span className="w-3.5 h-3.5 rounded-full bg-amber-500 inline-block"></span>
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 inline-block"></span>
              </div>
              <div className="h-4 w-px bg-slate-800 mx-1"></div>
              <div className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1 rounded-xl border border-slate-800 flex items-center gap-2">
                <ShieldCheck size={14} className="text-teal-400" />
                <span>medpoint.app/dashboard</span>
              </div>
            </div>

            {/* Interactive Preview Switcher Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-2xl border border-slate-800 text-xs font-medium">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  activeTab === 'overview' ? 'bg-teal-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Overview Metrics
              </button>
              <button
                onClick={() => setActiveTab('stock')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  activeTab === 'stock' ? 'bg-teal-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Low Stock ({lowStockMedicines.length})
              </button>
              <button
                onClick={() => setActiveTab('expiry')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  activeTab === 'expiry' ? 'bg-teal-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Expiring ({expiringMedicines.length})
              </button>
              <button
                onClick={() => setActiveTab('recent')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  activeTab === 'recent' ? 'bg-teal-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Activity Log
              </button>
            </div>
          </div>

          {/* KPI Statistics Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Total Medicines</div>
              <div className="text-2xl font-black text-white font-mono">{medicines.length} Types</div>
              <div className="text-[10px] text-teal-400 font-mono">Cataloged & Tracked</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Available Stock</div>
              <div className="text-2xl font-black text-emerald-400 font-mono">{totalStockUnits.toLocaleString()} Units</div>
              <div className="text-[10px] text-emerald-300 font-mono">Across All Storage Racks</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
              <div className="text-[11px] font-mono text-rose-400 uppercase tracking-wider">Low Stock Alerts</div>
              <div className="text-2xl font-black text-rose-400 font-mono">{lowStockMedicines.length} Medicines</div>
              <div className="text-[10px] text-rose-300 font-mono">Below Threshold</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
              <div className="text-[11px] font-mono text-amber-400 uppercase tracking-wider">Expiring Medicines</div>
              <div className="text-2xl font-black text-amber-400 font-mono">{expiringMedicines.length} Batches</div>
              <div className="text-[10px] text-amber-300 font-mono">Within 60 Days</div>
            </div>
          </div>

          {/* Interactive Content Area Based on Active Tab */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 min-h-[260px] flex flex-col justify-between">
            {activeTab === 'overview' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono border-b border-slate-800 pb-2">
                  <span>MEDICINE NAME</span>
                  <span>CATEGORY</span>
                  <span>LOCATION</span>
                  <span>STOCK STATUS</span>
                </div>
                {medicines.slice(0, 4).map((med) => (
                  <div key={med.id} className="flex flex-col sm:flex-row sm:items-center justify-between text-xs py-2 border-b border-slate-800/50 gap-2">
                    <div>
                      <span className="font-bold text-white">{med.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono ml-2">({med.dosage})</span>
                    </div>
                    <span className="text-slate-400">{med.category}</span>
                    <span className="text-teal-400 font-mono">{med.rackNumber} · {med.boxNumber}</span>
                    <span className="font-bold font-mono text-emerald-400">{med.stock} Packs</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'stock' && (
              <div className="space-y-3">
                <div className="text-xs font-mono text-rose-400 font-bold mb-2">Medicines below minimum threshold:</div>
                {lowStockMedicines.map((med) => (
                  <div key={med.id} className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white">{med.name}</div>
                      <div className="text-[10px] text-rose-300">Box: {med.boxNumber}</div>
                    </div>
                    <span className="font-mono font-bold text-rose-400 bg-rose-950 px-2.5 py-1 rounded-lg border border-rose-800">
                      {med.stock} Left (Min: {med.minStockThreshold})
                    </span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'expiry' && (
              <div className="space-y-3">
                <div className="text-xs font-mono text-amber-400 font-bold mb-2">Expiring within 60 days:</div>
                {expiringMedicines.map((med) => (
                  <div key={med.id} className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/50 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white">{med.name}</div>
                      <div className="text-[10px] text-amber-300">Batch: {med.batchNumber}</div>
                    </div>
                    <span className="font-mono font-bold text-amber-400 bg-amber-950 px-2.5 py-1 rounded-lg border border-amber-800">
                      Expiry: {med.expiryDate}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'recent' && (
              <div className="space-y-3">
                <div className="text-xs font-mono text-teal-300 font-bold mb-2">Recent Inventory Audit Log:</div>
                {logs.slice(0, 4).map((log) => (
                  <div key={log.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white">{log.medicineName}</div>
                      <div className="text-[10px] text-slate-400">{log.reason || 'Stock Update'}</div>
                    </div>
                    <span className="font-mono font-bold text-teal-400">
                      {log.quantityChange > 0 ? `+${log.quantityChange}` : log.quantityChange} Units
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Launch Console CTA Bar */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-slate-400">
                Want to test real billing, POS cart, shelf finder, and stock edits?
              </span>
              <button
                onClick={onOpenLiveApp}
                className="w-full sm:w-auto med-gradient hover:opacity-95 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all"
              >
                <LayoutDashboard size={16} />
                <span>Launch Full System Console Now</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
