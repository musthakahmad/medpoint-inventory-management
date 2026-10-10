import React from 'react';
import { Cross, ShieldCheck, Heart } from 'lucide-react';

interface FooterSectionProps {
  onLaunchApp: () => void;
}

export const FooterSection: React.FC<FooterSectionProps> = ({ onLaunchApp }) => {
  return (
    <footer className="bg-slate-950 text-slate-400 py-16 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start justify-between">
          {/* Brand Info */}
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-600/30">
                <Cross size={22} className="stroke-[2.5]" />
              </div>
              <div>
                <span className="font-sans text-2xl font-black text-white tracking-tight">
                  Med<span className="text-teal-400">Point</span>
                </span>
                <p className="text-xs text-slate-400 font-medium">Smart Medical & Pharmacy Inventory System</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Simplifying medical and pharmacy inventory management. Track stock levels, manage expiry dates, and optimize pharmacy operations efficiently.
            </p>
          </div>

          {/* Links Grid */}
          <div className="md:col-span-6 flex flex-wrap gap-8 justify-start md:justify-end text-xs font-medium text-slate-300">
            <div className="space-y-3">
              <div className="font-bold text-white uppercase text-[11px] font-mono text-teal-400 tracking-wider">Navigation</div>
              <ul className="space-y-2">
                <li><a href="#hero" className="hover:text-teal-300 transition-colors">Home</a></li>
                <li><a href="#about" className="hover:text-teal-300 transition-colors">About</a></li>
                <li><a href="#features" className="hover:text-teal-300 transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-teal-300 transition-colors">How It Works</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <div className="font-bold text-white uppercase text-[11px] font-mono text-teal-400 tracking-wider">System</div>
              <ul className="space-y-2">
                <li><a href="#dashboard-preview" className="hover:text-teal-300 transition-colors">Dashboard Preview</a></li>
                <li><a href="#benefits" className="hover:text-teal-300 transition-colors">Why Choose Us</a></li>
                <li><button onClick={onLaunchApp} className="hover:text-teal-300 transition-colors text-left">Open App Console</button></li>
                <li><a href="#cta" className="hover:text-teal-300 transition-colors">Get Started</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <div className="font-bold text-white uppercase text-[11px] font-mono text-teal-400 tracking-wider">Contact & Support</div>
              <ul className="space-y-2">
                <li className="text-slate-400">Support: support@medpoint.app</li>
                <li className="text-slate-400">Dispensary Desk: +1 (800) MED-POINT</li>
                <li className="text-slate-400">Rx License Verified</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 MedPoint. All rights reserved. Smart Medical & Pharmacy Inventory System.</p>
          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
            <span>Built with precision for healthcare professionals</span>
            <Heart size={12} className="text-rose-500 fill-rose-500" />
          </div>
        </div>
      </div>
    </footer>
  );
};
