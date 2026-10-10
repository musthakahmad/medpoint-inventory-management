import React, { useState } from 'react';
import { Users, UserCheck, ShieldCheck, DollarSign, TrendingUp, Award, Phone, Mail, Plus, Star, CheckCircle, Clock, XCircle, Search } from 'lucide-react';
import { Salesman, Order } from '../types';

interface SalesmenManagementProps {
  salesmen: Salesman[];
  orders: Order[];
  onUpdateSalesmanStatus: (salesmanId: string, status: 'On Duty' | 'Off Duty' | 'On Break') => void;
  onAddSalesman: (salesmanData: Omit<Salesman, 'id' | 'totalSalesCount' | 'totalRevenue' | 'totalProfit'>) => void;
}

export const SalesmenManagement: React.FC<SalesmenManagementProps> = ({
  salesmen,
  orders,
  onUpdateSalesmanStatus,
  onAddSalesman,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSalesman, setNewSalesman] = useState({
    code: `EMP-${105 + salesmen.length}`,
    name: '',
    role: 'Counter Sales Executive' as Salesman['role'],
    phone: '',
    email: '',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    status: 'On Duty' as Salesman['status'],
    rating: 4.8,
    joinDate: new Date().toISOString().split('T')[0],
  });

  // Calculate totals
  const totalTeamSales = salesmen.reduce((acc, s) => acc + s.totalSalesCount, 0);
  const totalTeamRevenue = salesmen.reduce((acc, s) => acc + s.totalRevenue, 0);
  const totalTeamProfit = salesmen.reduce((acc, s) => acc + s.totalProfit, 0);
  const activeDutyCount = salesmen.filter((s) => s.status === 'On Duty').length;

  const filteredSalesmen = salesmen.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmitNewSalesman = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSalesman.name || !newSalesman.phone) return;
    onAddSalesman(newSalesman);
    setIsAddModalOpen(false);
    setNewSalesman({
      code: `EMP-${105 + salesmen.length + 1}`,
      name: '',
      role: 'Counter Sales Executive',
      phone: '',
      email: '',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      status: 'On Duty',
      rating: 4.8,
      joinDate: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 bg-teal-500/20 text-teal-300 px-3 py-1 rounded-full text-xs font-semibold mb-3 border border-teal-500/30">
            <Users size={14} /> Staff Performance & Salesmen Portal
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Salesmen & Pharmacist Roster
          </h2>
          <p className="text-slate-400 text-xs md:text-sm mt-1 leading-relaxed">
            Track individual salesman sales volume, profit margins generated, active shift status, and customer satisfaction ratings.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="relative z-10 bg-teal-600 hover:bg-teal-500 text-white px-5 py-3 rounded-2xl font-bold text-xs md:text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-600/30 transition-all self-start md:self-auto"
        >
          <Plus size={18} /> Register New Salesman
        </button>

        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-teal-600/10 rounded-full blur-3xl"></div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-2xl border border-teal-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            <UserCheck size={24} />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-semibold">Active On Duty</div>
            <div className="text-xl font-extrabold text-slate-900">{activeDutyCount} / {salesmen.length}</div>
            <div className="text-[10px] text-emerald-600 font-semibold">Staff available for billing</div>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-teal-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Award size={24} />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-semibold">Total Orders Processed</div>
            <div className="text-xl font-extrabold text-slate-900">{totalTeamSales} Orders</div>
            <div className="text-[10px] text-blue-600 font-semibold">Across all sales staff</div>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-teal-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <DollarSign size={24} />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-semibold">Team Sales Revenue</div>
            <div className="text-xl font-extrabold text-slate-900">₹{totalTeamRevenue.toLocaleString()}</div>
            <div className="text-[10px] text-emerald-600 font-semibold">Gross revenue generated</div>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-teal-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-500 text-white flex items-center justify-center font-bold shadow-md shadow-teal-500/20">
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-semibold">Total Net Profit Earned</div>
            <div className="text-xl font-extrabold text-teal-700">₹{totalTeamProfit.toLocaleString()}</div>
            <div className="text-[10px] text-teal-700 font-semibold">Net profit contribution</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-card p-4 rounded-2xl border border-teal-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search salesman name, EMP code, role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-800">{filteredSalesmen.length}</span> staff members
        </div>
      </div>

      {/* Salesmen Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
        {filteredSalesmen.map((salesman) => {
          const profitMargin = salesman.totalRevenue > 0
            ? Math.round((salesman.totalProfit / salesman.totalRevenue) * 100)
            : 0;

          return (
            <div
              key={salesman.id}
              className="bg-white rounded-3xl border border-teal-100 shadow-sm hover:shadow-md transition-all p-5 space-y-4"
            >
              {/* Header Profile Row */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <img
                    src={salesman.avatar}
                    alt={salesman.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-teal-200 shadow-sm"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold bg-slate-900 text-teal-300 px-2 py-0.5 rounded">
                        {salesman.code}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        <Star size={12} className="fill-amber-400 text-amber-400" /> {salesman.rating.toFixed(1)}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-base mt-1">{salesman.name}</h3>
                    <p className="text-xs text-teal-700 font-semibold">{salesman.role}</p>
                  </div>
                </div>

                {/* Duty Status Selector */}
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Duty Status</span>
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                    {(['On Duty', 'On Break', 'Off Duty'] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => onUpdateSalesmanStatus(salesman.id, st)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                          salesman.status === st
                            ? st === 'On Duty'
                              ? 'bg-emerald-500 text-white shadow-xs'
                              : st === 'On Break'
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'bg-slate-700 text-white'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Performance Stats */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold">SALES COUNT</div>
                  <div className="text-sm font-extrabold text-slate-800">{salesman.totalSalesCount}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold">REVENUE</div>
                  <div className="text-sm font-extrabold text-emerald-700">₹{salesman.totalRevenue.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold">PROFIT</div>
                  <div className="text-sm font-extrabold text-teal-700">₹{salesman.totalProfit.toLocaleString()} ({profitMargin}%)</div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <Phone size={13} className="text-teal-600" /> {salesman.phone}
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                  <Mail size={13} className="text-teal-600" /> {salesman.email}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal to Register New Salesman */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-teal-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                <Plus size={18} className="text-teal-600" /> Add Salesman / Pharmacist
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitNewSalesman} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Staff Code</label>
                <input
                  type="text"
                  value={newSalesman.code}
                  onChange={(e) => setNewSalesman({ ...newSalesman, code: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Rajesh Kumar"
                  value={newSalesman.name}
                  onChange={(e) => setNewSalesman({ ...newSalesman, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Role / Designation</label>
                <select
                  value={newSalesman.role}
                  onChange={(e) => setNewSalesman({ ...newSalesman, role: e.target.value as any })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                >
                  <option value="Senior Pharmacist">Senior Pharmacist</option>
                  <option value="Assistant Pharmacist">Assistant Pharmacist</option>
                  <option value="Counter Sales Executive">Counter Sales Executive</option>
                  <option value="Pharmacy Manager">Pharmacy Manager</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 98950 00000"
                    value={newSalesman.phone}
                    onChange={(e) => setNewSalesman({ ...newSalesman, phone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="staff@medpoint.com"
                    value={newSalesman.email}
                    onChange={(e) => setNewSalesman({ ...newSalesman, email: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 shadow-md shadow-teal-600/20"
                >
                  Save Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
