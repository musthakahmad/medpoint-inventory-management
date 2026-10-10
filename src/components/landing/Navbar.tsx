import React, { useState, useEffect } from 'react';
import { Cross, ShieldCheck, Menu, X, ArrowRight, Activity, LayoutDashboard } from 'lucide-react';

interface NavbarProps {
  onLaunchApp: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onLaunchApp }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#hero' },
    { name: 'About', href: '#about' },
    { name: 'Features', href: '#features' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Dashboard', href: '#dashboard-preview' },
    { name: 'Benefits', href: '#benefits' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-teal-100 py-3.5'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <a href="#hero" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-600/25 group-hover:scale-105 transition-transform">
            <Cross size={22} className="stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-sans text-2xl font-extrabold text-slate-900 tracking-tight">
                Med<span className="text-teal-600">Point</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full border border-teal-200">
                <ShieldCheck size={11} className="text-teal-600" /> Rx Smart
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium hidden sm:block">Medical & Pharmacy System</p>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-600">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="hover:text-teal-600 transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-teal-600 after:scale-x-0 hover:after:scale-x-100 after:transition-transform"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Right Desktop CTA Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={onLaunchApp}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm"
          >
            <LayoutDashboard size={15} className="text-teal-400" />
            <span>Open System Console</span>
          </button>

          <a
            href="#dashboard-preview"
            className="flex items-center gap-2 med-gradient text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-teal-600/20 hover:shadow-lg hover:shadow-teal-600/30 transition-all hover:scale-[1.02] active:scale-95"
          >
            <span>Get Started</span>
            <ArrowRight size={14} />
          </a>
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="flex items-center gap-2 sm:hidden">
          <button
            onClick={onLaunchApp}
            className="p-2 bg-slate-900 text-teal-400 rounded-xl text-xs font-semibold flex items-center gap-1"
          >
            <LayoutDashboard size={16} />
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2.5 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden bg-white border-b border-slate-200 px-6 py-5 space-y-4 shadow-xl animate-in fade-in slide-in-from-top-4">
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-base font-semibold text-slate-700 hover:text-teal-600 py-1.5 border-b border-slate-100"
              >
                {link.name}
              </a>
            ))}
          </nav>
          <div className="pt-2 flex flex-col gap-2.5">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onLaunchApp();
              }}
              className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2"
            >
              <LayoutDashboard size={18} className="text-teal-400" />
              Open Live Application Console
            </button>
            <a
              href="#dashboard-preview"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full py-3 med-gradient text-white font-bold rounded-xl text-sm text-center shadow-md"
            >
              Get Started Now
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
