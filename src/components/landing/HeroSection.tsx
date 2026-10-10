import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Package,
  Activity,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  TrendingUp,
  Cross,
  Zap,
} from 'lucide-react';
import { Medicine } from '../../types';

interface HeroSectionProps {
  medicines: Medicine[];
  onGetStarted: () => void;
  onExploreFeatures: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  medicines,
  onGetStarted,
  onExploreFeatures,
}) => {
  const [activeSubtitle, setActiveSubtitle] = useState(0);

  const subtitles = [
    'Smart Medical & Pharmacy Inventory System',
    'Real-Time Medicine Locator & Expiry Tracker',
    'Automated Stock Matrix & Dispensary Console',
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSubtitle((prev) => (prev + 1) % subtitles.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [subtitles.length]);

  const lowStockCount = medicines.filter((m) => m.stock <= m.minStockThreshold).length;

  return (
    <section id="hero" className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden saas-gradient-bg">
      {/* Background Floating Animated Gradient Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-teal-200/30 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-subtle"></div>
      <div className="absolute -top-10 right-10 w-96 h-96 bg-cyan-100/40 rounded-full blur-3xl pointer-events-none -z-10"></div>

      {/* Floating Animated Particles */}
      <div className="absolute top-20 left-1/4 w-3 h-3 bg-teal-400/40 rounded-full animate-particle pointer-events-none"></div>
      <div className="absolute bottom-20 right-1/3 w-2.5 h-2.5 bg-blue-400/40 rounded-full animate-particle pointer-events-none" style={{ animationDelay: '1.5s' }}></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Hero Content Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Animated Category Pill Badge */}
            <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200/80 px-4 py-1.5 rounded-full text-xs font-bold text-teal-800 shadow-2xs animate-pulse-subtle">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-ping"></span>
              <Sparkles size={14} className="text-teal-600 animate-spin" style={{ animationDuration: '8s' }} />
              <span>Smart Pharmacy & Medical Solution</span>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
              Med<span className="med-gradient-text">Point</span>
            </h1>

            {/* Morphing Subheading Text Animation */}
            <div className="h-14 flex items-center justify-center lg:justify-start">
              <h2 className="text-xl sm:text-2xl font-bold text-teal-800 tracking-tight transition-all duration-500">
                {subtitles[activeSubtitle]}
              </h2>
            </div>

            {/* Professional Description */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal">
              MedPoint is a smart digital solution designed to simplify medical and pharmacy inventory management. Track medicines, monitor stock levels, manage expiry dates, and organize pharmacy operations efficiently from one place.
            </p>

            {/* Action Buttons with Hover Effects */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onGetStarted}
                className="relative overflow-hidden med-gradient text-white font-bold text-sm px-8 py-4 rounded-2xl shadow-xl shadow-teal-600/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2.5 group cursor-pointer"
              >
                {/* Shimmer sweep effect */}
                <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none"></div>
                <Zap size={16} className="text-teal-200" />
                <span>Get Started</span>
                <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform" />
              </button>

              <button
                onClick={onExploreFeatures}
                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 font-semibold text-sm px-6 py-4 rounded-2xl shadow-xs transition-all hover:border-teal-400 hover:shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Search size={16} className="text-teal-600" />
                <span>Explore Features</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="pt-6 border-t border-slate-200/60 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-teal-600" />
                <span>Real-Time Stock Sync</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-teal-600" />
                <span>Expiry Alert Engine</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-teal-600" />
                <span>Shelf & Box Locator</span>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Holographic Concentric Ring Orb & Interactive Product Visual */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Product UI Frame Mockup */}
              <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-200/90 space-y-4 relative z-10 saas-card-shadow">
                {/* Window Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-400 inline-block"></span>
                    <span className="w-3 h-3 rounded-full bg-amber-400 inline-block"></span>
                    <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block"></span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 bg-slate-50 px-3 py-0.5 rounded-full border border-slate-100 flex items-center gap-1">
                    <ShieldCheck size={12} className="text-teal-600" /> medpoint.app/console
                  </div>
                </div>

                {/* 🛸 3D Holographic Concentric Rotating Ring Orb Visual Centerpiece */}
                <div className="py-4 flex items-center justify-center relative bg-slate-950 rounded-2xl p-4 overflow-hidden border border-slate-800">
                  <div className="absolute inset-0 bg-teal-500/10 blur-xl pointer-events-none"></div>

                  <div className="relative w-40 h-40 flex items-center justify-center animate-float-orb">
                    {/* Outer Rotating Ring */}
                    <div className="absolute inset-0 rounded-full border-2 border-dashed border-teal-400/50 animate-ring-rotate"></div>
                    {/* Inner Reverse Rotating Ring */}
                    <div className="absolute inset-2 rounded-full border-2 border-dotted border-cyan-400/60 animate-ring-rotate-reverse"></div>

                    {/* Central Core Capsule */}
                    <div className="w-24 h-24 rounded-2xl med-gradient flex flex-col items-center justify-center text-white shadow-xl shadow-teal-500/30 border border-white/30 cursor-pointer group">
                      <Cross size={30} className="stroke-[2.5] group-hover:scale-110 transition-transform duration-300" />
                      <span className="text-[9px] font-mono font-black uppercase text-teal-100 mt-1">MEDPOINT</span>
                      <span className="text-[8px] font-mono text-teal-200">100% ONLINE</span>
                    </div>
                  </div>
                </div>

                {/* Dashboard Stats Quick Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-teal-50/80 border border-teal-100">
                    <div className="text-[11px] font-bold text-teal-800 uppercase tracking-wider">Total Medicines</div>
                    <div className="text-2xl font-black text-slate-900 mt-1">{medicines.length}</div>
                    <div className="text-[10px] text-teal-600 mt-0.5 font-medium">Categorized & Tracked</div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-rose-50/80 border border-rose-100">
                    <div className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">Low Stock Alerts</div>
                    <div className="text-2xl font-black text-rose-600 mt-1">{lowStockCount} Items</div>
                    <div className="text-[10px] text-rose-700 mt-0.5 font-medium">Requires Restock</div>
                  </div>
                </div>

                {/* Quick Action Button */}
                <button
                  onClick={onGetStarted}
                  className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Activity size={15} className="text-teal-400 animate-pulse" />
                  Launch Interactive Application Console
                </button>
              </div>

              {/* Floating Stat Badge 1 */}
              <div className="absolute -top-6 -right-6 bg-white p-3.5 rounded-2xl shadow-xl border border-slate-200/80 flex items-center gap-3 animate-float-slow z-20">
                <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900">99.8% Accuracy</div>
                  <div className="text-[10px] text-slate-500 font-medium">Real-Time Stock Audit</div>
                </div>
              </div>

              {/* Floating Stat Badge 2 */}
              <div className="absolute -bottom-6 -left-6 bg-white p-3.5 rounded-2xl shadow-xl border border-slate-200/80 flex items-center gap-3 animate-float-slow z-20" style={{ animationDelay: '2s' }}>
                <div className="p-2.5 rounded-xl bg-teal-100 text-teal-700">
                  <Clock size={18} />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900">Expiry Tracker</div>
                  <div className="text-[10px] text-slate-500 font-medium">60-Day Advance Warning</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
