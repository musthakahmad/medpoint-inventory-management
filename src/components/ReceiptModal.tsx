import React, { useState } from 'react';
import { Printer, X, Cross, CheckCircle2, ShieldCheck, MessageSquare } from 'lucide-react';
import { Order, PharmacyBranch } from '../types';
import { WhatsAppSenderModal } from './WhatsAppSenderModal';

interface ReceiptModalProps {
  order: Order | null;
  branch: PharmacyBranch;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ order, branch, onClose }) => {
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(order.timestamp).toLocaleString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
        <div className="bg-white rounded-3xl border border-teal-100 shadow-2xl max-w-sm w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
          {/* Top Actions */}
          <div className="flex items-center justify-between no-print border-b border-slate-100 pb-3">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-600">
              <CheckCircle2 size={16} /> Dispense Completed
            </div>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-full">
              <X size={20} />
            </button>
          </div>

          {/* Printable Receipt Container */}
          <div
            id="printable-receipt"
            className="p-4 bg-teal-50/40 border border-teal-200/80 rounded-2xl font-mono text-xs text-slate-800 space-y-3"
          >
            {/* Header Branding */}
            <div className="text-center space-y-1 pb-3 border-b border-dashed border-teal-300">
              <div className="flex items-center justify-center gap-1.5 text-teal-800 font-extrabold text-xl">
                <Cross size={20} className="text-teal-600 fill-teal-600" /> MedPoint Pharmacy
              </div>
              <p className="text-[10px] font-sans text-slate-700 font-bold">{branch.name}</p>
              <p className="text-[9px] text-slate-500 font-sans">{branch.address}</p>
              <p className="text-[9px] text-slate-500 font-sans">Tel: {branch.phone}</p>
              <p className="text-[9px] text-teal-800 font-sans font-bold">DL License: {branch.licenseNumber}</p>
            </div>

            {/* Receipt Header Info */}
            <div className="text-[10px] space-y-1 text-slate-600 border-b border-slate-200 pb-2">
              <div className="flex justify-between">
                <span>Receipt #:</span>
                <span className="font-bold text-slate-900">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Date & Time:</span>
                <span>{formattedDate}</span>
              </div>
              <div className="flex justify-between">
                <span>Customer:</span>
                <span className="font-bold text-slate-900">{order.customerName || 'Walk-in Patient'}</span>
              </div>
              {order.customerPhone && (
                <div className="flex justify-between">
                  <span>Phone:</span>
                  <span className="font-mono text-slate-800">{order.customerPhone}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Dispensed By:</span>
                <span className="font-bold text-teal-800">{order.salesmanName}</span>
              </div>
            </div>

            {/* Items Table */}
            <div className="border-b border-dashed border-teal-300 py-2 space-y-2">
              <div className="flex justify-between font-bold text-[10px] uppercase text-slate-500">
                <span>Item & Location</span>
                <span>Qty × Price</span>
                <span>Amt</span>
              </div>

              {order.items.map((item, index) => (
                <div key={index} className="space-y-0.5">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span className="max-w-[130px] truncate">{item.medicine.name}</span>
                    <span>{item.quantity} × ₹{item.medicine.price.toFixed(2)}</span>
                    <span>₹{(item.quantity * item.medicine.price).toFixed(2)}</span>
                  </div>
                  <div className="text-[9px] text-slate-500 flex justify-between">
                    <span>Batch: {item.medicine.batchNumber}</span>
                    <span className="font-bold text-teal-800">Box: {item.medicine.boxNumber} ({item.medicine.rackNumber})</span>
                  </div>
                  {item.dosageInstructions && (
                    <div className="text-[9px] text-teal-900 italic bg-white p-1 rounded border border-teal-200">
                      Dosage: {item.dosageInstructions}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Calculation Summary */}
            <div className="space-y-1 text-[11px] pt-1">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{order.subtotal.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Discount:</span>
                  <span>-₹{order.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Tax (5%):</span>
                <span>+₹{order.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-slate-900 pt-1 border-t border-slate-300 font-sans">
                <span>TOTAL PAID:</span>
                <span className="text-teal-700">₹{order.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 pt-1">
                <span>Payment Mode:</span>
                <span className="font-bold text-slate-900">{order.paymentMethod}</span>
              </div>
            </div>

            {/* Footer Tagline */}
            <div className="text-center pt-3 border-t border-dashed border-teal-300 space-y-1">
              <p className="font-bold text-slate-800 text-xs flex items-center justify-center gap-1">
                <ShieldCheck size={14} className="text-teal-600" /> MedPoint Quality Assured
              </p>
              <p className="text-[9px] text-slate-500 font-sans">
                Please check medication & expiry date before leaving counter.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 no-print pt-2">
            <button
              onClick={() => setIsWhatsAppOpen(true)}
              className="w-full py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
            >
              <MessageSquare size={16} /> Send via WhatsApp / SMS
            </button>

            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Close
              </button>
              <button
                onClick={handlePrint}
                className="flex-1 py-2 rounded-xl text-xs font-bold text-white med-gradient-btn shadow-md shadow-teal-600/20 flex items-center justify-center gap-1.5"
              >
                <Printer size={15} /> Print bill
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp Modal subdialog */}
      {isWhatsAppOpen && (
        <WhatsAppSenderModal
          order={order}
          branch={branch}
          onClose={() => setIsWhatsAppOpen(false)}
        />
      )}
    </>
  );
};
