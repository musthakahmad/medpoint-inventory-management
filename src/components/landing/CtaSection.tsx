import React from 'react';
import { ArrowRight, ShieldCheck, Sparkles, Cross } from 'lucide-react';

interface CtaSectionProps {
  onGetStarted: () => void;
}

export const CtaSection: React.FC<CtaSectionProps> = ({ onGetStarted }) => {
  return (
    <section id="cta" className="py-20 bg-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-[2.5rem] med-gradient p-10 lg:p-16 text-white text-center shadow-2xl overflow-hidden shadow-teal-700/30">
          {/* Medical Tech Ambient Backdrops */}
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-teal-100 border border-white/30">
              <Cross size={14} className="text-white" />
              <span>Smart Medical & Pharmacy Solution</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Manage Your Pharmacy Smarter with MedPoint
            </h2>

            <p className="text-base sm:text-lg text-teal-100 leading-relaxed max-w-2xl mx-auto font-normal">
              Take control of your medical inventory with a smarter, simpler, and more organized solution.
            </p>

            <div className="pt-4 flex justify-center">
              <button
                onClick={onGetStarted}
                className="bg-white hover:bg-teal-50 text-teal-900 font-bold text-sm px-8 py-4 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2.5 group"
              >
                <span>Get Started Now</span>
                <ArrowRight size={18} className="text-teal-700 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
