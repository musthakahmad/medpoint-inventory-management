import React, { useState } from 'react';
import { ClipboardList, LayoutDashboard, PackageCheck, ShoppingBag, TrendingUp, Users, Search, ExternalLink, MoreHorizontal, X, ClipboardCheck } from 'lucide-react';

export type TabType = 'dashboard' | 'shelf-finder' | 'inventory' | 'pos' | 'sales' | 'customer-orders' | 'salesmen' | 'operations';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  lowStockCount: number;
  expiringCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, lowStockCount, expiringCount }) => {
  const [moreOpen, setMoreOpen] = useState(false);
  const alertCount = lowStockCount + expiringCount;
  const navItems = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'shelf-finder' as TabType, label: 'Find medicine', icon: Search },
    { id: 'inventory' as TabType, label: 'Inventory', icon: PackageCheck, alert: alertCount },
    { id: 'pos' as TabType, label: 'Billing', icon: ShoppingBag },
    { id: 'sales' as TabType, label: 'Sales history', icon: TrendingUp },
    { id: 'customer-orders' as TabType, label: 'Customer orders', icon: ClipboardCheck },
    { id: 'salesmen' as TabType, label: 'Staff', icon: Users },
    { id: 'operations' as TabType, label: 'Operations', icon: ClipboardList },
  ];

  return (
    <aside className="app-sidebar flex w-60 shrink-0 flex-col border-r border-slate-200/80 bg-white px-3 py-5">
      <div className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Workspace</div>
      <nav className="space-y-1">
        {navItems.map(({ id, label, icon: Icon, alert }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              data-nav-id={id}
              onClick={() => setActiveTab(id)}
              title={label}
              aria-label={label}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
                active ? 'nav-active text-teal-800' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon size={18} />
              <span className="flex-1">{label}</span>
              {!!alert && <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700">{alert}</span>}
            </button>
          );
        })}
        <div className="my-3 border-t border-slate-200" />
        <button
          data-nav-id="customer-shop"
          onClick={() => {
            window.location.assign('/');
          }}
          title="Open customer shop"
          aria-label="Open customer shop"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
        >
          <ExternalLink size={18} />
          <span className="flex-1">Customer shop</span>
        </button>
        <button
          type="button"
          className="mobile-more-button"
          aria-expanded={moreOpen}
          aria-label={moreOpen ? 'Close more navigation options' : 'More navigation options'}
          onClick={() => setMoreOpen((open) => !open)}
        >
          {moreOpen ? <X size={18} /> : <MoreHorizontal size={18} />}
          <span>More</span>
        </button>
      </nav>
      {moreOpen && <div className="mobile-more-menu" role="group" aria-label="More workspace pages">
        <button onClick={() => { setActiveTab('shelf-finder'); setMoreOpen(false); }}><Search size={17} />Find medicine</button>
        <button onClick={() => { setActiveTab('salesmen'); setMoreOpen(false); }}><Users size={17} />Staff</button>
        <button onClick={() => { setActiveTab('customer-orders'); setMoreOpen(false); }}><ClipboardCheck size={17} />Customer orders</button>
        <button onClick={() => { setActiveTab('operations'); setMoreOpen(false); }}><ClipboardList size={17} />Operations</button>
        <button onClick={() => { window.location.assign('/'); }}><ExternalLink size={17} />Customer shop</button>
      </div>}
    </aside>
  );
};
