import React, { useState } from 'react';
import {
  Receipt,
  Search,
  Printer,
  RotateCcw,
  CheckCircle,
  XCircle,
  QrCode,
  CreditCard,
  Banknote,
  X,
  Clock,
  DollarSign,
  TrendingUp,
  User,
  Wallet,
} from 'lucide-react';
import { Order } from '../types';

interface SalesHistoryProps {
  orders: Order[];
  onSelectOrderForReceipt: (order: Order) => void;
  onRefundOrder: (orderId: string) => void;
}

export const SalesHistory: React.FC<SalesHistoryProps> = ({
  orders,
  onSelectOrderForReceipt,
  onRefundOrder,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<string>('All');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);

  // Filter orders
  const filteredOrders = orders.filter((ord) => {
    const matchesSearch =
      ord.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ord.customerName && ord.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (ord.salesmanName && ord.salesmanName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (ord.doctorName && ord.doctorName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesPayment = paymentFilter === 'All' || ord.paymentMethod === paymentFilter;
    return matchesSearch && matchesPayment;
  });

  const completedOrders = orders.filter((o) => o.status === 'Completed');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
  const totalCost = completedOrders.reduce((sum, o) => sum + o.costTotal, 0);
  const totalProfit = completedOrders.reduce((sum, o) => sum + o.profit, 0);
  const averageMarginPct = totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0;

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-300">
      {/* KPI Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-teal-100 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500">Gross Sales Revenue</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">₹{totalRevenue.toFixed(2)}</div>
            <div className="text-[11px] text-teal-600 font-semibold">{completedOrders.length} Completed Orders</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            <TrendingUp size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-teal-100 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500">Total Net Profit</div>
            <div className="text-2xl font-extrabold text-teal-700 mt-1">₹{totalProfit.toFixed(2)}</div>
            <div className="text-[11px] text-slate-400">Total COGS: ₹{totalCost.toFixed(2)}</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <DollarSign size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-teal-100 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500">Average Profit Margin</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{averageMarginPct}%</div>
            <div className="text-[11px] text-emerald-600 font-bold">High profitability index</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Receipt size={24} />
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search order #, customer, doctor, or salesman name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-teal-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-xs"
          />
        </div>

        {/* Payment Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['All', 'Card', 'Cash', 'UPI / QR', 'Insurance Claim'].map((pm) => (
            <button
              key={pm}
              onClick={() => setPaymentFilter(pm)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                paymentFilter === pm
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-teal-50 border border-slate-200'
              }`}
            >
              {pm === 'All' ? 'All Payment Methods' : pm}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-3xl border border-teal-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-teal-100 text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">
                <th className="py-3.5 px-4">Order ID & Date</th>
                <th className="py-3.5 px-4">Customer & Doctor</th>
                <th className="py-3.5 px-4">Salesman / Pharmacist</th>
                <th className="py-3.5 px-4">Payment Method</th>
                <th className="py-3.5 px-4">Revenue / Cost</th>
                <th className="py-3.5 px-4">Net Profit</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No sales transactions matching your search.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const isCompleted = ord.status === 'Completed';
                  const dateStr = new Date(ord.timestamp).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr
                      key={ord.id}
                      className={`hover:bg-teal-50/40 transition-colors ${
                        !isCompleted ? 'bg-rose-50/20 opacity-75' : ''
                      }`}
                    >
                      {/* Order ID & Time */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{ord.orderNumber}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                          <Clock size={10} /> {dateStr}
                        </div>
                      </td>

                      {/* Customer & Doctor */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">{ord.customerName || 'Walk-in Patient'}</div>
                        {ord.doctorName && (
                          <div className="text-[10px] text-teal-700 italic">Doc: {ord.doctorName}</div>
                        )}
                      </td>

                      {/* Salesman */}
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        <span className="inline-flex items-center gap-1 text-[11px]">
                          <User size={12} className="text-teal-600" /> {ord.salesmanName}
                        </span>
                      </td>

                      {/* Payment method */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg text-[10px]">
                          {ord.paymentMethod === 'UPI / QR' && <QrCode size={12} className="text-emerald-600" />}
                          {ord.paymentMethod === 'Card' && <CreditCard size={12} className="text-indigo-600" />}
                          {ord.paymentMethod === 'Cash' && <Banknote size={12} className="text-amber-600" />}
                          {ord.paymentMethod === 'Insurance Claim' && <Wallet size={12} className="text-purple-600" />}
                          {ord.paymentMethod}
                        </span>
                      </td>

                      {/* Revenue / Cost */}
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-900 text-sm">₹{ord.total.toFixed(2)}</div>
                        <div className="text-[10px] text-slate-400">Cost: ₹{ord.costTotal.toFixed(2)}</div>
                      </td>

                      {/* Net Profit */}
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-teal-700 text-sm">+₹{ord.profit.toFixed(2)}</div>
                        <div className="text-[10px] text-slate-500 font-semibold">
                          {ord.total > 0 ? Math.round((ord.profit / ord.total) * 100) : 0}% Margin
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-bold text-[10px] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${
                            isCompleted
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {isCompleted ? <CheckCircle size={10} /> : <XCircle size={10} />}
                          {ord.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSelectOrderForReceipt(ord)}
                            className="bg-teal-50 hover:bg-teal-600 hover:text-white text-teal-700 font-bold px-2.5 py-1 rounded-xl text-[11px] transition-all flex items-center gap-1 border border-teal-200"
                            title="Print Customer Receipt"
                          >
                            <Printer size={12} /> Receipt
                          </button>

                          <button
                            onClick={() => setSelectedOrderDetails(ord)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl"
                            title="Inspect Order"
                          >
                            <Receipt size={15} />
                          </button>

                          {isCompleted && (
                            <button
                              onClick={() => {
                                if (confirm(`Refund Order #${ord.orderNumber}?`)) {
                                  onRefundOrder(ord.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                              title="Refund Order"
                            >
                              <RotateCcw size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Order Modal */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-teal-100 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">
                  Order #{selectedOrderDetails.orderNumber}
                </h3>
                <p className="text-xs text-slate-500">
                  {new Date(selectedOrderDetails.timestamp).toLocaleString()}
                </p>
              </div>
              <button onClick={() => setSelectedOrderDetails(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Customer:</span>
                <span className="font-bold text-slate-800">{selectedOrderDetails.customerName || 'Walk-in Patient'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Dispensed By Salesman:</span>
                <span className="font-bold text-teal-700">{selectedOrderDetails.salesmanName}</span>
              </div>
              {selectedOrderDetails.doctorName && (
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Doctor / Prescription #:</span>
                  <span className="font-semibold text-slate-800">{selectedOrderDetails.doctorName} ({selectedOrderDetails.prescriptionNumber || 'N/A'})</span>
                </div>
              )}

              <div>
                <div className="font-bold text-slate-700 mb-2">Dispensed Items:</div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedOrderDetails.items.map((item, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-teal-50/50 border border-teal-100 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-800">{item.medicine.name}</div>
                        <div className="text-[10px] text-slate-500">
                          Qty: {item.quantity} × ₹{item.medicine.price.toFixed(2)} | Rack: {item.medicine.rackNumber} - Box: {item.medicine.boxNumber}
                        </div>
                      </div>
                      <div className="font-extrabold text-slate-900">
                        ₹{(item.quantity * item.medicine.price).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-dashed border-teal-200 pt-3 space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span>₹{selectedOrderDetails.subtotal.toFixed(2)}</span>
                </div>
                {selectedOrderDetails.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount</span>
                    <span>-₹{selectedOrderDetails.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500">
                  <span>Tax (5%)</span>
                  <span>+₹{selectedOrderDetails.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-teal-700 font-bold bg-teal-50 p-2 rounded-xl">
                  <span>Order Net Profit</span>
                  <span>+₹{selectedOrderDetails.profit.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-extrabold text-slate-900 pt-1">
                  <span>Grand Total</span>
                  <span className="text-teal-700">₹{selectedOrderDetails.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  onSelectOrderForReceipt(selectedOrderDetails);
                  setSelectedOrderDetails(null);
                }}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 flex items-center justify-center gap-2"
              >
                <Printer size={16} /> Print Customer Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
