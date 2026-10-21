import React, { useState, useEffect } from 'react';
import { Cross, MapPin, Bell, RefreshCw, ChevronDown, CheckCircle2, AlertTriangle, Search, Download, Upload } from 'lucide-react';
import { PharmacyBranch, Medicine } from '../types';

interface HeaderProps {
  currentBranch: PharmacyBranch;
  branches: PharmacyBranch[];
  onSelectBranch: (branch: PharmacyBranch) => void;
  medicines: Medicine[];
  onResetDemoData: () => void;
  onNavigateToInventory: () => void;
  onNavigateToShelfFinder: () => void;
  onExportBackup: () => void;
  onImportBackup: (file: File) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentBranch,
  branches,
  onSelectBranch,
  medicines,
  onResetDemoData,
  onNavigateToInventory,
  onNavigateToShelfFinder,
  onExportBackup,
  onImportBackup,
}) => {
  const [isBranchOpen, setIsBranchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => setCurrentTime(new Date().toLocaleString([], {
      weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    }));
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const lowStock = medicines.filter((medicine) => medicine.stock <= medicine.minStockThreshold);
  const today = new Date(new Date().toDateString()).getTime();
  const batches = medicines.flatMap((medicine) => (medicine.batches?.length ? medicine.batches : [{ id: medicine.id, batchNumber: medicine.batchNumber, expiryDate: medicine.expiryDate, quantity: medicine.stock }]).filter((batch) => batch.quantity > 0).map((batch) => ({ ...batch, medicineName: medicine.name })));
  const expired = batches.filter((batch) => new Date(`${batch.expiryDate}T00:00:00`).getTime() < today);
  const expiringSoon = batches.filter((batch) => {
    const days = (new Date(`${batch.expiryDate}T00:00:00`).getTime() - today) / 86400000;
    return days >= 0 && days <= 60;
  });
  const alertCount = lowStock.length + expired.length + expiringSoon.length;

  return (
    <header className="app-header sticky top-0 z-30 flex min-h-[72px] items-center justify-between gap-4 border-b border-slate-200/80 bg-white/95 px-5 backdrop-blur-xl">
      <div className="flex min-w-0 items-center gap-5">
        <div className="flex shrink-0 items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-700 text-white shadow-sm shadow-teal-900/20"><Cross size={20} /></div>
          <div>
            <h1 className="text-lg font-bold leading-5 text-slate-900">MedPoint</h1>
            <p className="text-[11px] text-slate-500">Pharmacy management</p>
          </div>
        </div>

        <div className="relative hidden md:block">
          {branches.length === 1 ? (
            <div className="flex max-w-64 items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700" aria-label="Pharmacy location">
              <MapPin size={16} className="shrink-0 text-teal-700" />
              <span className="truncate">{currentBranch.name}</span>
            </div>
          ) : (
            <>
          <button
            onClick={() => setIsBranchOpen(!isBranchOpen)}
            className="flex max-w-64 items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <MapPin size={16} className="shrink-0 text-teal-700" />
            <span className="truncate">{currentBranch.name}</span>
            <ChevronDown size={15} className="shrink-0 text-slate-400" />
          </button>
          {isBranchOpen && (
            <div className="absolute left-0 top-full mt-2 w-72 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
              {branches.map((branch) => (
                <button
                  key={branch.id}
                  onClick={() => { onSelectBranch(branch); setIsBranchOpen(false); }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                >
                  <MapPin size={15} className="text-teal-700" />
                  <span className="flex-1">{branch.name}</span>
                  {branch.id === currentBranch.id && <CheckCircle2 size={15} className="text-teal-700" />}
                </button>
              ))}
            </div>
          )}
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button onClick={onExportBackup} className="flex items-center gap-2 rounded-lg border border-slate-200 p-2 text-sm text-slate-600 hover:bg-slate-50 sm:px-3 sm:py-2" title="Export a backup" aria-label="Export a backup">
          <Download size={16} /> <span className="hidden lg:inline">Backup</span>
        </button>
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 p-2 text-sm text-slate-600 hover:bg-slate-50 sm:px-3 sm:py-2" title="Restore from a backup" aria-label="Restore from a backup">
          <Upload size={16} /> <span className="hidden lg:inline">Restore</span>
          <input type="file" accept="application/json,.json" className="sr-only" onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onImportBackup(file);
            event.currentTarget.value = '';
          }} />
        </label>
        <button
          onClick={onNavigateToShelfFinder}
          className="hidden items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 lg:flex"
        >
          <Search size={16} className="text-teal-700" /> Find medicine
        </button>
        <span className="hidden text-xs text-slate-500 xl:block">{currentTime}</span>

        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
            title="Stock alerts"
          >
            <Bell size={18} />
            {alertCount > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-semibold text-white">{alertCount}</span>}
          </button>
          {isNotifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 rounded-lg border border-slate-200 bg-white p-4 shadow-lg">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900">Stock alerts</h2>
                <span className="text-xs text-slate-500">{alertCount} items</span>
              </div>
              {alertCount === 0 ? (
                <p className="py-4 text-center text-sm text-slate-500">No current alerts.</p>
              ) : (
                <div className="max-h-64 space-y-2 overflow-y-auto">
                  {expired.map((medicine) => (
                    <div key={`expired-${medicine.id}`} className="flex items-center justify-between rounded-md bg-rose-100 p-2.5 text-sm">
                      <span className="truncate font-medium text-slate-800">{medicine.medicineName} · {medicine.batchNumber}</span>
                      <span className="ml-2 shrink-0 text-xs font-semibold text-rose-800">Expired {medicine.expiryDate} · {medicine.quantity}</span>
                    </div>
                  ))}
                  {lowStock.map((medicine) => (
                    <div key={`low-${medicine.id}`} className="flex items-center justify-between rounded-md bg-rose-50 p-2.5 text-sm">
                      <span className="truncate text-slate-800">{medicine.name}</span>
                      <span className="ml-2 shrink-0 text-xs text-rose-700">{medicine.stock} left</span>
                    </div>
                  ))}
                  {expiringSoon.map((medicine) => (
                    <div key={`exp-${medicine.id}`} className="flex items-center justify-between rounded-md bg-amber-50 p-2.5 text-sm">
                      <span className="truncate text-slate-800">{medicine.medicineName} · {medicine.batchNumber}</span>
                      <span className="ml-2 shrink-0 text-xs text-amber-700">Expires {new Date(`${medicine.expiryDate}T00:00:00`).toLocaleDateString()} · {medicine.quantity}</span>
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={() => { setIsNotifOpen(false); onNavigateToInventory(); }}
                className="mt-3 w-full rounded-md bg-teal-700 px-3 py-2 text-sm font-medium text-white hover:bg-teal-800"
              >
                View inventory
              </button>
            </div>
          )}
        </div>

        <button
          onClick={onResetDemoData}
          className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
          title="Reset demo data"
          aria-label="Reset demo data"
        >
          <RefreshCw size={17} />
        </button>
      </div>
    </header>
  );
};
