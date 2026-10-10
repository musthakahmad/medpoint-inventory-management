import React, { useState } from 'react';
import { Send, MessageSquare, Smartphone, Check, Copy, X, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Order, PharmacyBranch } from '../types';

interface WhatsAppSenderModalProps {
  order: Order | null;
  branch: PharmacyBranch;
  onClose: () => void;
}

export const WhatsAppSenderModal: React.FC<WhatsAppSenderModalProps> = ({ order, branch, onClose }) => {
  if (!order) return null;

  const [phone, setPhone] = useState(order.customerPhone || '');
  const [copied, setCopied] = useState(false);
  const [smsSent, setSmsSent] = useState(false);

  const formattedDate = new Date(order.timestamp).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const customerName = order.customerName || 'Valued Customer';

  // Format Itemized List
  const itemsText = order.items
    .map((item) => `• ${item.medicine.name} (${item.medicine.dosage}) x ${item.quantity} - ₹${(item.medicine.price * item.quantity).toFixed(2)}`)
    .join('\n');

  // WhatsApp formatted string with Markdown bolding (*)
  const whatsappMessage = `🏥 *${branch.name}*
----------------------------------------
Hello *${customerName}*, thank you for choosing MedPoint!

🧾 *Receipt #: ${order.orderNumber}*
📅 *Date:* ${formattedDate}

💊 *Medicines Dispensed:*
${itemsText}

----------------------------------------
💰 *Total Paid:* *₹${order.total.toFixed(2)}*
💳 *Payment Mode:* ${order.paymentMethod}
👨‍⚕️ *Dispensed By:* ${order.salesmanName}

📍 *Store:* ${branch.address}
📞 *Pharmacy Helpline:* ${branch.phone}
📜 *DL License:* ${branch.licenseNumber}

_Thank you for visiting MedPoint. Stay healthy!_ ✨`;

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(whatsappMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenWhatsApp = () => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const encodedMsg = encodeURIComponent(whatsappMessage);
    const waUrl = cleanPhone
      ? `https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone}?text=${encodedMsg}`
      : `https://wa.me/?text=${encodedMsg}`;
    window.open(waUrl, '_blank');
  };

  const handleSendSMS = () => {
    setSmsSent(true);
    setTimeout(() => {
      setSmsSent(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl border border-emerald-200 shadow-2xl max-w-md w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-500/20">
              <MessageSquare size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Send WhatsApp / SMS Receipt</h3>
              <p className="text-[11px] text-slate-500">Digital receipt dispatch to customer mobile</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-full">
            <X size={20} />
          </button>
        </div>

        {/* SMS Notification Banner */}
        {smsSent && (
          <div className="bg-emerald-500 text-white p-3.5 rounded-2xl flex items-center gap-3 animate-in fade-in">
            <CheckCircle2 size={20} className="text-emerald-100" />
            <div className="text-xs font-bold">
              SMS Receipt Dispatched to {phone || 'Customer'}!
            </div>
          </div>
        )}

        {/* Phone Input Field */}
        <div className="space-y-1.5 text-xs">
          <label className="font-bold text-slate-700 block">Customer Mobile Phone Number (WhatsApp / SMS)</label>
          <div className="flex items-center gap-2">
            <span className="bg-slate-100 border border-slate-200 px-3 py-2 rounded-xl text-xs font-mono font-bold text-slate-600">
              +91
            </span>
            <input
              type="text"
              placeholder="Enter 10-digit mobile number..."
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Message Preview Box */}
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="font-bold text-slate-700">Message Preview:</span>
            <button
              onClick={handleCopyMessage}
              className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1"
            >
              {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? 'Copied!' : 'Copy Text'}
            </button>
          </div>

          <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-2xl font-sans text-[11px] text-slate-800 whitespace-pre-line leading-relaxed max-h-52 overflow-y-auto">
            {whatsappMessage}
          </div>
        </div>

        {/* Dispatch Action Buttons */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <button
            onClick={handleOpenWhatsApp}
            className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2"
          >
            <MessageSquare size={16} /> Open WhatsApp Web / App directly
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleSendSMS}
              className="py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5"
            >
              <Smartphone size={15} /> Send Instant SMS
            </button>
            <button
              onClick={onClose}
              className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
