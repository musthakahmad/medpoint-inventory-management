import React from 'react';
import {
  CheckCircle,
  Shield,
  Clock,
  Layers,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Database,
  Search,
} from 'lucide-react';
import { Medicine } from '../../types';

interface AboutSectionProps {
  medicines: Medicine[];
  onLearnMore: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ medicines, onLearnMore }) => {
  const expiringCount = medicines.filter((m) => {
    const exp = new Date(m.expiryDate).getTime();
    const now = Date.now();
    const diffDays = (exp - now) / (1000 * 3600 * 24);
    return diffDays >= 0 && diffDays <= 60;
  }).length;

  return (
    <section id="about" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Narrative Content & Bullet Highlights */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 px-3.5 py-1 rounded-full text-xs font-bold text-teal-700">
              <Database size={13} className="text-teal-600" />
              <span>About MedPoint</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Everything You Need to Manage Your Pharmacy Smarter
            </h2>

            <p className="text-slate-600 leading-relaxed text-base">
              Managing a modern pharmacy or medical store requires precision, speed, and absolute clarity. MedPoint eliminates manual errors by centralizing medicine cataloging, shelf locations, low-stock threshold triggers, and expiry monitoring into one seamless interface.
            </p>

            {/* Benefit Bullets Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="p-2 rounded-xl bg-teal-100 text-teal-700 shrink-0">
                  <CheckCircle size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Reduce Manual Work</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Automated stock calculations and instant billing logs.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="p-2 rounded-xl bg-teal-100 text-teal-700 shrink-0">
                  <Clock size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Track Expiry Dates</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Automated advance notifications before batches expire.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="p-2 rounded-xl bg-teal-100 text-teal-700 shrink-0">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Identify Low Stock</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Smart reorder alerts before essential medicines run out.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="p-2 rounded-xl bg-teal-100 text-teal-700 shrink-0">
                  <Layers size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Shelf & Box Mapping</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Find exact physical storage rack and box locations in seconds.</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onLearnMore}
                className="med-gradient text-white font-bold text-xs px-6 py-3.5 rounded-xl shadow-md shadow-teal-600/20 hover:shadow-lg transition-all flex items-center gap-2"
              >
                <span>Explore Interactive Features</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>

          {/* Right Column: Dashboard UI Product Preview */}
          <div className="lg:col-span-6">
            <div className="bg-slate-900 rounded-3xl p-6 shadow-2xl text-slate-100 border border-slate-800 space-y-5 relative">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span className="text-xs font-bold text-slate-200">Dispensary Stock Health Preview</span>
                </div>
                <span className="text-[10px] font-mono bg-teal-950 text-teal-300 border border-teal-800 px-2 py-0.5 rounded">
                  LIVE AUDIT
                </span>
              </div>

              {/* Product Visual Card Mockup */}
              <div className="space-y-3">
                {medicines.slice(0, 3).map((med) => (
                  <div
                    key={med.id}
                    className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-white flex items-center gap-2">
                        <span>{med.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({med.dosage})</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        📍 Storage: <span className="text-teal-300 font-medium">{med.rackNumber} · {med.boxNumber}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-bold text-emerald-400">{med.stock} Packs</span>
                      <div className="text-[10px] text-slate-400 mt-0.5">Exp: {med.expiryDate}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Expiring Medicine Alert Bar */}
              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <AlertTriangle size={18} className="text-amber-400 shrink-0" />
                  <div>
                    <div className="font-bold text-amber-200">{expiringCount} Batches Expiring Soon</div>
                    <div className="text-[10px] text-amber-400/80">Scheduled for priority dispatch or supplier return</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-1 rounded-lg">
                  Action Required
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
