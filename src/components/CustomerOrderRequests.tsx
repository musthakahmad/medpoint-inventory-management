import React, { useCallback, useEffect, useState } from 'react';
import { Check, Clock3, RefreshCw, ShoppingBag, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface OrderLine {
  product_id: string;
  name: string;
  quantity: number;
  unit_price: number;
}

interface CustomerOrderRequest {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  delivery_city: string;
  delivery_pincode: string;
  items: OrderLine[];
  estimated_total: number;
  status: 'pending' | 'confirmed' | 'rejected';
  pharmacy_note: string;
  created_at: string;
  updated_at: string;
}

interface CustomerOrderRequestsProps {
  workspaceId: string;
  role: string;
}

const friendlyError = (message: string) => message.includes('customer_store_enabled') || message.includes('customer_order_requests')
  ? 'Apply SUPABASE_CUSTOMER_ORDERS.sql in the Supabase SQL Editor, then refresh this page.'
  : message;

export const CustomerOrderRequests: React.FC<CustomerOrderRequestsProps> = ({ workspaceId, role }) => {
  const [requests, setRequests] = useState<CustomerOrderRequest[]>([]);
  const [storeEnabled, setStoreEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const canManageStore = role === 'owner' || role === 'manager';
  const canReviewOrders = canManageStore || role === 'pharmacist';

  const refresh = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    setMessage('');
    const [ordersResult, storeResult] = await Promise.all([
      supabase.from('customer_order_requests')
        .select('id, order_number, customer_name, customer_phone, delivery_address, delivery_city, delivery_pincode, items, estimated_total, status, pharmacy_note, created_at, updated_at')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false })
        .limit(100),
      supabase.from('workspaces').select('customer_store_enabled').eq('id', workspaceId).maybeSingle(),
    ]);
    if (ordersResult.error) setMessage(friendlyError(ordersResult.error.message));
    else setRequests((ordersResult.data || []) as CustomerOrderRequest[]);
    if (storeResult.error) setMessage(friendlyError(storeResult.error.message));
    else setStoreEnabled(Boolean(storeResult.data?.customer_store_enabled));
    setLoading(false);
  }, [workspaceId]);

  useEffect(() => { void refresh(); }, [refresh]);

  const toggleStore = async () => {
    if (!supabase || !canManageStore) return;
    setBusy(true);
    setMessage('');
    const { data, error } = await supabase.rpc('set_customer_store_enabled', {
      target_workspace: workspaceId,
      enabled_input: !storeEnabled,
    });
    if (error) setMessage(friendlyError(error.message));
    else {
      setStoreEnabled(Boolean(data));
      setMessage(data ? 'Customer order requests are enabled.' : 'Customer order requests are paused.');
    }
    setBusy(false);
  };

  const updateStatus = async (request: CustomerOrderRequest, status: 'confirmed' | 'rejected') => {
    if (!supabase || !canReviewOrders) return;
    const note = status === 'confirmed'
      ? window.prompt('Add an optional note for the customer (for example, expected delivery time):', '')
      : window.prompt('Tell the customer why the pharmacy cannot accept this request:', '');
    if (note === null) return;
    setBusy(true);
    setMessage('');
    const { error } = await supabase.rpc('update_customer_order_status', {
      order_id_input: request.id,
      status_input: status,
      pharmacy_note_input: note,
    });
    if (error) setMessage(error.message);
    else {
      setMessage(`${request.order_number} ${status}.`);
      await refresh();
    }
    setBusy(false);
  };

  return <section className="mx-auto max-w-6xl space-y-5">
    <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-900 p-5 text-white sm:p-6">
      <div className="flex items-center gap-3"><span className="rounded-xl bg-teal-600 p-2.5"><ShoppingBag size={21}/></span><div><h1 className="text-xl font-bold">Customer orders</h1><p className="mt-1 text-sm text-slate-300">Review requests from the MedPoint shop.</p></div></div>
      <div className="flex flex-wrap gap-2">
        <button onClick={() => void refresh()} disabled={loading || busy} className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-sm font-semibold hover:bg-white/10 disabled:opacity-60"><RefreshCw size={16}/>Refresh</button>
        {canManageStore && <button onClick={() => void toggleStore()} disabled={busy} className={`rounded-lg px-3 py-2 text-sm font-semibold disabled:opacity-60 ${storeEnabled ? 'bg-rose-600 hover:bg-rose-500' : 'bg-teal-500 text-slate-950 hover:bg-teal-400'}`}>{busy ? 'Saving…' : storeEnabled ? 'Pause online orders' : 'Enable online orders'}</button>}
      </div>
    </header>
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950"><strong>Review before confirming.</strong> Catalogue prices and quantities are estimates. Check live availability and the final price with the customer; confirming this request does not collect payment or reserve stock.</div>
    {message && <p role="status" className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">{message}</p>}
    {loading ? <div className="rounded-xl bg-white p-8 text-center text-sm text-slate-500">Loading customer requests…</div>
      : requests.length === 0 ? <div className="rounded-xl border border-slate-200 bg-white p-10 text-center"><Clock3 className="mx-auto text-slate-400" size={30}/><h2 className="mt-3 font-semibold text-slate-800">No customer requests yet</h2><p className="mt-1 text-sm text-slate-500">New requests will appear here after you enable online orders.</p></div>
        : <div className="space-y-4">{requests.map((request) => <article key={request.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><div className="flex flex-wrap items-center gap-2"><h2 className="font-bold text-slate-900">{request.order_number}</h2><span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${request.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' : request.status === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-900'}`}>{request.status === 'pending' ? 'Awaiting review' : request.status}</span></div><p className="mt-1 text-xs text-slate-500">{new Date(request.created_at).toLocaleString()}</p></div>
            <strong className="text-lg text-teal-800">Est. ₹{Number(request.estimated_total).toFixed(2)}</strong>
          </div>
          <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
            <div><h3 className="font-semibold text-slate-800">Customer</h3><p className="mt-1 text-slate-600">{request.customer_name} · {request.customer_phone}</p><p className="mt-1 text-slate-600">{request.delivery_address}, {request.delivery_city} – {request.delivery_pincode}</p></div>
            <div><h3 className="font-semibold text-slate-800">Requested items</h3><ul className="mt-1 space-y-1 text-slate-600">{(Array.isArray(request.items) ? request.items : []).map((item, index) => <li key={`${item.product_id}-${index}`}>{item.name} × {item.quantity} <span className="text-slate-400">(est. ₹{(Number(item.unit_price) * Number(item.quantity)).toFixed(2)})</span></li>)}</ul></div>
          </div>
          {request.pharmacy_note && <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700"><strong>Pharmacy note:</strong> {request.pharmacy_note}</p>}
          {request.status === 'pending' && canReviewOrders && <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4"><button disabled={busy} onClick={() => void updateStatus(request, 'confirmed')} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"><Check size={16}/>Confirm request</button><button disabled={busy} onClick={() => void updateStatus(request, 'rejected')} className="inline-flex items-center gap-2 rounded-lg border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-60"><X size={16}/>Decline</button></div>}
        </article>)}</div>}
  </section>;
};
