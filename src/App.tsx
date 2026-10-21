import React, { useState, useEffect } from 'react';
import { Medicine, MedicineBatch, AuditEvent, Order, InventoryLog, PharmacyBranch, CartItem, PaymentMethod, Salesman, Supplier, PurchaseOrder, DailyClosing, ExpenseEntry, ShiftHandover } from './types';
import { ADDITIONAL_STOCK_PRODUCTS, INITIAL_BRANCHES, INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_LOGS, INITIAL_SALESMEN, INITIAL_SUPPLIERS } from './data/mockData';

// App Console Components
import { Header } from './components/Header';
import { Sidebar, TabType } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ShelfFinder } from './components/ShelfFinder';
import { Inventory } from './components/Inventory';
import { POS } from './components/POS';
import { SalesHistory } from './components/SalesHistory';
import { SalesmenManagement } from './components/SalesmenManagement';
import { ReceiptModal } from './components/ReceiptModal';
import { Operations } from './components/Operations';
import { isObjectValue, isRecordArray, readStoredValue, removeStoredValue, writeStoredValue } from './utils/storage';
import { supabase } from './lib/supabase';
import { WorkspaceData } from './lib/workspaceState';

const LOCAL_STORAGE_KEY_MEDICINES = 'medpoint_medicines_v2';
const LOCAL_STORAGE_KEY_ORDERS = 'medpoint_orders_v2';
const LOCAL_STORAGE_KEY_LOGS = 'medpoint_logs_v2';
const LOCAL_STORAGE_KEY_SALESMEN = 'medpoint_salesmen_v2';
const LOCAL_STORAGE_KEY_BRANCH = 'medpoint_current_branch_v2';
const LOCAL_STORAGE_KEY_SUPPLIERS = 'medpoint_suppliers_v1';
const LOCAL_STORAGE_KEY_PURCHASE_ORDERS = 'medpoint_purchase_orders_v1';
const LOCAL_STORAGE_KEY_CLOSINGS = 'medpoint_daily_closings_v1';
const LOCAL_STORAGE_KEY_EXPENSES = 'medpoint_expenses_v1';
const LOCAL_STORAGE_KEY_HANDOVERS = 'medpoint_shift_handovers_v1';
const LOCAL_STORAGE_KEY_AUDIT = 'medpoint_audit_events_v1';

const ensureMedicineBatches = (medicine: Medicine): Medicine => ({
  ...medicine,
  batches: medicine.batches?.length ? medicine.batches : [{
    id: `legacy-${medicine.id}`, batchNumber: medicine.batchNumber, expiryDate: medicine.expiryDate,
    quantity: medicine.stock, costPrice: medicine.costPrice, receivedAt: new Date().toISOString(),
  }],
});
const addMissingStockProducts = (medicines: Medicine[]) => {
  const existingIds = new Set(medicines.map((medicine) => medicine.id));
  return [
    ...medicines,
    ...ADDITIONAL_STOCK_PRODUCTS.filter((medicine) => !existingIds.has(medicine.id)).map(ensureMedicineBatches),
  ];
};
const usableBatches = (medicine: Medicine) => ensureMedicineBatches(medicine).batches!.filter((batch) => {
  const expiry = new Date(`${batch.expiryDate}T00:00:00`);
  return batch.quantity > 0 && !Number.isNaN(expiry.getTime()) && expiry.getTime() >= new Date(new Date().toDateString()).getTime();
});
const usableStock = (medicine: Medicine) => usableBatches(medicine).reduce((total, batch) => total + batch.quantity, 0);

export interface AppWorkspaceContext {
  id: string;
  userId: string;
  name: string;
}

export function loadLocalWorkspaceData(): WorkspaceData {
  const currentBranch = readStoredValue(LOCAL_STORAGE_KEY_BRANCH, INITIAL_BRANCHES[0], (value): value is PharmacyBranch =>
    isObjectValue(value) && typeof value.id === 'string' && INITIAL_BRANCHES.some((branch) => branch.id === value.id),
  );
  return {
    schemaVersion: 1,
    medicines: addMissingStockProducts(readStoredValue(LOCAL_STORAGE_KEY_MEDICINES, INITIAL_PRODUCTS, isRecordArray<Medicine>)).map(ensureMedicineBatches),
    salesmen: readStoredValue(LOCAL_STORAGE_KEY_SALESMEN, INITIAL_SALESMEN, isRecordArray<Salesman>),
    orders: readStoredValue(LOCAL_STORAGE_KEY_ORDERS, INITIAL_ORDERS, isRecordArray<Order>),
    logs: readStoredValue(LOCAL_STORAGE_KEY_LOGS, INITIAL_LOGS, isRecordArray<InventoryLog>),
    suppliers: readStoredValue(LOCAL_STORAGE_KEY_SUPPLIERS, INITIAL_SUPPLIERS, isRecordArray<Supplier>),
    purchaseOrders: readStoredValue(LOCAL_STORAGE_KEY_PURCHASE_ORDERS, [], isRecordArray<PurchaseOrder>),
    closings: readStoredValue(LOCAL_STORAGE_KEY_CLOSINGS, [], isRecordArray<DailyClosing>),
    expenses: readStoredValue(LOCAL_STORAGE_KEY_EXPENSES, [], isRecordArray<ExpenseEntry>),
    handovers: readStoredValue(LOCAL_STORAGE_KEY_HANDOVERS, [], isRecordArray<ShiftHandover>),
    auditEvents: readStoredValue(LOCAL_STORAGE_KEY_AUDIT, [], isRecordArray<AuditEvent>),
    currentBranch,
  };
}

interface AppProps {
  initialWorkspaceData?: WorkspaceData;
  workspace?: AppWorkspaceContext;
}

export default function App({ initialWorkspaceData, workspace }: AppProps) {
  const [syncStatus, setSyncStatus] = useState<'saving' | 'saved' | 'error'>('saved');

  // Initialize State with LocalStorage Persistence
  const [medicines, setMedicines] = useState<Medicine[]>(() => {
    if (initialWorkspaceData) return initialWorkspaceData.medicines.map(ensureMedicineBatches);
    return addMissingStockProducts(readStoredValue(LOCAL_STORAGE_KEY_MEDICINES, INITIAL_PRODUCTS, isRecordArray<Medicine>)).map(ensureMedicineBatches);
  });

  const [salesmen, setSalesmen] = useState<Salesman[]>(() => {
    if (initialWorkspaceData) return initialWorkspaceData.salesmen;
    return readStoredValue(LOCAL_STORAGE_KEY_SALESMEN, INITIAL_SALESMEN, isRecordArray<Salesman>);
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    if (initialWorkspaceData) return initialWorkspaceData.orders;
    return readStoredValue(LOCAL_STORAGE_KEY_ORDERS, INITIAL_ORDERS, isRecordArray<Order>);
  });

  const [logs, setLogs] = useState<InventoryLog[]>(() => {
    if (initialWorkspaceData) return initialWorkspaceData.logs;
    return readStoredValue(LOCAL_STORAGE_KEY_LOGS, INITIAL_LOGS, isRecordArray<InventoryLog>);
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    if (initialWorkspaceData) return initialWorkspaceData.suppliers;
    return readStoredValue(LOCAL_STORAGE_KEY_SUPPLIERS, INITIAL_SUPPLIERS, isRecordArray<Supplier>);
  });
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => initialWorkspaceData?.purchaseOrders ?? readStoredValue(LOCAL_STORAGE_KEY_PURCHASE_ORDERS, [], isRecordArray<PurchaseOrder>));
  const [closings, setClosings] = useState<DailyClosing[]>(() => initialWorkspaceData?.closings ?? readStoredValue(LOCAL_STORAGE_KEY_CLOSINGS, [], isRecordArray<DailyClosing>));
  const [expenses, setExpenses] = useState<ExpenseEntry[]>(() => initialWorkspaceData?.expenses ?? readStoredValue(LOCAL_STORAGE_KEY_EXPENSES, [], isRecordArray<ExpenseEntry>));
  const [handovers, setHandovers] = useState<ShiftHandover[]>(() => initialWorkspaceData?.handovers ?? readStoredValue(LOCAL_STORAGE_KEY_HANDOVERS, [], isRecordArray<ShiftHandover>));
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>(() => initialWorkspaceData?.auditEvents ?? readStoredValue(LOCAL_STORAGE_KEY_AUDIT, [], isRecordArray<AuditEvent>));

  const [branches] = useState<PharmacyBranch[]>(() => initialWorkspaceData ? [initialWorkspaceData.currentBranch] : INITIAL_BRANCHES);
  const [currentBranch, setCurrentBranch] = useState<PharmacyBranch>(() => {
    if (initialWorkspaceData) return initialWorkspaceData.currentBranch;
    return readStoredValue(LOCAL_STORAGE_KEY_BRANCH, INITIAL_BRANCHES[0], (value): value is PharmacyBranch =>
      isObjectValue(value) && typeof value.id === 'string' && INITIAL_BRANCHES.some((branch) => branch.id === value.id),
    );
  });

  // Shared Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Card');
  const [selectedSalesmanId, setSelectedSalesmanId] = useState<string>(() => salesmen[0]?.id || '');

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<Order | null>(null);

  // Sync to localStorage
  useEffect(() => {
    if (!workspace) writeStoredValue(LOCAL_STORAGE_KEY_MEDICINES, medicines);
  }, [medicines, workspace]);

  useEffect(() => {
    if (!workspace) writeStoredValue(LOCAL_STORAGE_KEY_SALESMEN, salesmen);
  }, [salesmen, workspace]);

  useEffect(() => {
    if (!workspace) writeStoredValue(LOCAL_STORAGE_KEY_ORDERS, orders);
  }, [orders, workspace]);

  useEffect(() => {
    if (!workspace) writeStoredValue(LOCAL_STORAGE_KEY_LOGS, logs);
  }, [logs, workspace]);

  useEffect(() => { if (!workspace) writeStoredValue(LOCAL_STORAGE_KEY_SUPPLIERS, suppliers); }, [suppliers, workspace]);
  useEffect(() => { if (!workspace) writeStoredValue(LOCAL_STORAGE_KEY_PURCHASE_ORDERS, purchaseOrders); }, [purchaseOrders, workspace]);
  useEffect(() => { if (!workspace) writeStoredValue(LOCAL_STORAGE_KEY_CLOSINGS, closings); }, [closings, workspace]);
  useEffect(() => { if (!workspace) writeStoredValue(LOCAL_STORAGE_KEY_EXPENSES, expenses); }, [expenses, workspace]);
  useEffect(() => { if (!workspace) writeStoredValue(LOCAL_STORAGE_KEY_HANDOVERS, handovers); }, [handovers, workspace]);
  useEffect(() => { if (!workspace) writeStoredValue(LOCAL_STORAGE_KEY_AUDIT, auditEvents); }, [auditEvents, workspace]);

  const recordAudit = (action: string, entityType: string, entityId: string, entityLabel: string, details: string, actor?: string) => {
    setAuditEvents((previous) => [{ id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, timestamp: new Date().toISOString(), actor: actor || salesmen.find((person) => person.id === selectedSalesmanId)?.name || 'Demo user', action, entityType, entityId, entityLabel, details }, ...previous]);
  };

  useEffect(() => {
    if (!workspace) writeStoredValue(LOCAL_STORAGE_KEY_BRANCH, currentBranch);
  }, [currentBranch, workspace]);

  useEffect(() => {
    const client = supabase;
    if (!workspace || !client) return;
    const payload: WorkspaceData = {
      schemaVersion: 1, medicines, salesmen, orders, logs, suppliers, purchaseOrders,
      closings, expenses, handovers, auditEvents, currentBranch,
    };
    const timer = window.setTimeout(async () => {
      setSyncStatus('saving');
      const { error } = await client.from('workspace_state').upsert({
        workspace_id: workspace.id,
        payload,
        updated_by: workspace.userId,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'workspace_id' });
      setSyncStatus(error ? 'error' : 'saved');
    }, 700);
    return () => window.clearTimeout(timer);
  }, [workspace, medicines, salesmen, orders, logs, suppliers, purchaseOrders, closings, expenses, handovers, auditEvents, currentBranch]);

  // Cart Operations
  const handleAddToCart = (medicine: Medicine) => {
    if (usableStock(medicine) <= 0) {
      alert(`${medicine.name} has no unexpired stock available for sale.`);
      return;
    }

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.medicine.id === medicine.id);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        if (updated[existingIndex].quantity < usableStock(medicine)) {
          updated[existingIndex].quantity += 1;
        }
        return updated;
      } else {
        return [...prevCart, { medicine, quantity: 1, dosageInstructions: '' }];
      }
    });
  };

  const handleUpdateCartQty = (index: number, delta: number) => {
    setCart((prevCart) => {
      const updated = [...prevCart];
      const newQty = updated[index].quantity + delta;
      if (newQty <= 0) {
        return updated.filter((_, i) => i !== index);
      }
      if (newQty > usableStock(updated[index].medicine)) {
        return updated;
      }
      updated[index].quantity = newQty;
      return updated;
    });
  };

  const handleUpdateCartDosage = (index: number, notes: string) => {
    setCart((prevCart) => {
      const updated = [...prevCart];
      updated[index].dosageInstructions = notes;
      return updated;
    });
  };

  const handleRemoveFromCart = (index: number) => {
    setCart((prevCart) => prevCart.filter((_, i) => i !== index));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Complete Order (POS Sale)
  const handleCompleteOrder = (cashReceived?: number) => {
    if (cart.length === 0) return;

    if (!customerName.trim() || !customerPhone.trim()) {
      alert('Please enter Customer Name and Phone Number before completing the sale.');
      return;
    }

    const activeSalesman = salesmen.find((s) => s.id === selectedSalesmanId) || salesmen[0];
    if (!activeSalesman) {
      alert('Add a staff member before completing a sale.');
      return;
    }

    const unavailableItem = cart.find((item) => {
      const currentMedicine = medicines.find((medicine) => medicine.id === item.medicine.id);
      return !currentMedicine || usableStock(currentMedicine) < item.quantity;
    });
    if (unavailableItem) {
      alert(`${unavailableItem.medicine.name} is out of stock, expired, or has an invalid expiry date. Please update the cart.`);
      return;
    }

    const allocatedCart = cart.map((item) => {
      let remaining = item.quantity;
      const batchAllocations = usableBatches(medicines.find((medicine) => medicine.id === item.medicine.id) || item.medicine)
        .sort((a, b) => a.expiryDate.localeCompare(b.expiryDate))
        .flatMap((batch) => {
          const quantity = Math.min(remaining, batch.quantity);
          remaining -= quantity;
          return quantity > 0 ? [{ batchId: batch.id, batchNumber: batch.batchNumber, quantity, costPrice: batch.costPrice }] : [];
        });
      return { ...item, batchAllocations };
    });
    const subtotal = allocatedCart.reduce((sum, item) => sum + item.medicine.price * item.quantity, 0);
    const costTotal = allocatedCart.reduce((sum, item) => sum + (item.batchAllocations || []).reduce((cost, allocation) => cost + allocation.quantity * allocation.costPrice, 0), 0);
    const discountAmount = Math.round((subtotal * discountPercent) / 100);
    const taxableSubtotal = Math.max(0, subtotal - discountAmount);
    const tax = Math.round(taxableSubtotal * 0.05 * 100) / 100;
    const total = Math.round((taxableSubtotal + tax) * 100) / 100;
    const profit = total - costTotal;

    const orderNumber = `MP-${10040 + orders.length + 1}`;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      timestamp: new Date().toISOString(),
      items: allocatedCart,
      subtotal,
      tax,
      discount: discountAmount,
      total,
      costTotal,
      profit,
      paymentMethod,
      ...(paymentMethod === 'Cash' && cashReceived !== undefined ? { cashReceived, changeDue: Math.round((cashReceived - total) * 100) / 100 } : {}),
      branchId: currentBranch.id,
      status: 'Completed',
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      salesmanId: activeSalesman.id,
      salesmanName: activeSalesman.name,
    };

    // Deduct stock from medicines & log entries
    const updatedMedicines = [...medicines];
    const newLogs: InventoryLog[] = [];

    allocatedCart.forEach((cartItem) => {
      const medIndex = updatedMedicines.findIndex((m) => m.id === cartItem.medicine.id);
      if (medIndex > -1) {
        const curMed = updatedMedicines[medIndex];
        const allocations = cartItem.batchAllocations || [];
        const batches = ensureMedicineBatches(curMed).batches!.map((batch) => {
          const allocated = allocations.find((allocation) => allocation.batchId === batch.id);
          return allocated ? { ...batch, quantity: Math.max(0, batch.quantity - allocated.quantity) } : batch;
        }).filter((batch) => batch.quantity > 0);
        const newStockLevel = batches.reduce((sum, batch) => sum + batch.quantity, 0);
        updatedMedicines[medIndex] = { ...curMed, stock: newStockLevel, batches };

        newLogs.push({
          id: `log-${Date.now()}-${cartItem.medicine.id}`,
          medicineId: cartItem.medicine.id,
          medicineName: cartItem.medicine.name,
          type: 'sale',
          quantityChange: -cartItem.quantity,
          newStock: newStockLevel,
          timestamp: new Date().toISOString(),
          reason: `Dispensary Checkout #${orderNumber}`,
          performedBy: activeSalesman.name,
          batchNumber: allocations.map((allocation) => allocation.batchNumber).join(', '),
        });
      }
    });
    recordAudit('Sale completed', 'Sale', newOrder.id, orderNumber, `Sale created; ${allocatedCart.length} medicine line(s) consumed from expiring-soonest available batches.`, activeSalesman.name);

    // Update Salesman metrics
    const updatedSalesmen = salesmen.map((s) => {
      if (s.id === activeSalesman.id) {
        return {
          ...s,
          totalSalesCount: s.totalSalesCount + 1,
          totalRevenue: Math.round((s.totalRevenue + total) * 100) / 100,
          totalProfit: Math.round((s.totalProfit + profit) * 100) / 100,
        };
      }
      return s;
    });

    setMedicines(updatedMedicines);
    setLogs([...newLogs, ...logs]);
    setSalesmen(updatedSalesmen);
    setOrders([newOrder, ...orders]);

    // Show thermal receipt modal automatically
    setSelectedReceiptOrder(newOrder);

    // Reset Cart
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setDiscountPercent(0);
  };

  // Medicine CRUD
  const handleAddMedicine = (newMed: Omit<Medicine, 'id'>) => {
    const medicine = ensureMedicineBatches({
      ...newMed,
      id: `med-${Date.now()}`,
    });
    setMedicines([medicine, ...medicines]);

    setLogs([
      {
        id: `log-${Date.now()}`,
        medicineId: medicine.id,
        medicineName: medicine.name,
        type: 'restock',
        quantityChange: medicine.stock,
        newStock: medicine.stock,
        timestamp: new Date().toISOString(),
        reason: 'New Medicine Batch Onboarding',
        performedBy: 'Pharmacy Manager',
      },
      ...logs,
    ]);
    recordAudit('Created', 'Medicine', medicine.id, medicine.name, `Added ${medicine.stock} units as batch ${medicine.batchNumber}.`);
  };

  const handleUpdateMedicine = (updatedMed: Medicine) => {
    setMedicines(medicines.map((m) => (m.id === updatedMed.id ? updatedMed : m)));
    recordAudit('Updated', 'Medicine', updatedMed.id, updatedMed.name, 'Edited medicine details.');
  };

  const handleDeleteMedicine = (id: string) => {
    if (confirm('Are you sure you want to remove this medicine from inventory?')) {
      const medicine = medicines.find((item) => item.id === id);
      setMedicines(medicines.filter((m) => m.id !== id));
      if (medicine) recordAudit('Deleted', 'Medicine', id, medicine.name, 'Removed medicine from inventory.');
    }
  };

  const handleAdjustStock = (id: string, delta: number, reason: string, batchNumber: string, expiryDate: string, costPrice: number) => {
    const med = medicines.find((m) => m.id === id);
    if (!med || !Number.isFinite(delta) || delta === 0) return;

    const newStock = Math.max(0, med.stock + delta);
    const actualChange = newStock - med.stock;
    if (actualChange === 0) return;
    const batches = [...(med.batches || ensureMedicineBatches(med).batches!)].map((batch) => ({ ...batch }));
    let affectedBatch = batchNumber;
    if (actualChange > 0) {
      const normalizedExpiry = new Date(`${expiryDate}T00:00:00`);
      if (!batchNumber.trim() || !expiryDate || Number.isNaN(normalizedExpiry.getTime()) || normalizedExpiry.getTime() < new Date(new Date().toDateString()).getTime() || !Number.isFinite(costPrice) || costPrice < 0) {
        alert('Enter a valid batch number, a non-expired expiry date, and a valid unit cost.');
        return;
      }
      const matchingBatch = batches.find((batch) => batch.batchNumber === batchNumber.trim() && batch.expiryDate === expiryDate);
      if (matchingBatch) matchingBatch.quantity += actualChange;
      else batches.push({ id: `batch-${Date.now()}`, batchNumber: batchNumber.trim(), expiryDate, quantity: actualChange, costPrice, receivedAt: new Date().toISOString() });
    } else {
      let remaining = Math.abs(actualChange);
      for (const batch of [...batches].sort((a, b) => a.expiryDate.localeCompare(b.expiryDate))) {
        const taken = Math.min(batch.quantity, remaining);
        batch.quantity -= taken;
        remaining -= taken;
        if (taken) affectedBatch = batch.batchNumber;
        if (!remaining) break;
      }
    }
    setMedicines(medicines.map((m) => (m.id === id ? { ...m, stock: newStock, batches: batches.filter((batch) => batch.quantity > 0) } : m)));

    setLogs([
      {
        id: `log-${Date.now()}`,
        medicineId: id,
        medicineName: med.name,
        type: actualChange > 0 ? 'restock' : 'adjustment',
        quantityChange: actualChange,
        newStock,
        timestamp: new Date().toISOString(),
        reason: reason || 'Manual Stock Audit Adjustment',
        performedBy: 'Senior Pharmacist',
        batchNumber: affectedBatch,
      },
      ...logs,
    ]);
    recordAudit(actualChange > 0 ? 'Restocked' : 'Adjusted stock', 'Medicine', id, med.name, `${actualChange > 0 ? '+' : ''}${actualChange} units · batch ${affectedBatch} · ${reason || 'No reason given'}.`, 'Senior Pharmacist');
  };

  // Sales Order Operations
  const handleRefundOrder = (orderId: string) => {
    if (!confirm('Are you sure you want to process a refund for this order?')) return;

    const orderToRefund = orders.find((o) => o.id === orderId);
    if (!orderToRefund || orderToRefund.status === 'Refunded') return;

    const updatedOrders = orders.map((o) => (o.id === orderId ? { ...o, status: 'Refunded' as const } : o));
    const updatedSalesmen = salesmen.map((salesman) => salesman.id === orderToRefund.salesmanId
      ? {
          ...salesman,
          totalSalesCount: Math.max(0, salesman.totalSalesCount - 1),
          totalRevenue: Math.round(Math.max(0, salesman.totalRevenue - orderToRefund.total) * 100) / 100,
          totalProfit: Math.round((salesman.totalProfit - orderToRefund.profit) * 100) / 100,
        }
      : salesman,
    );

    const updatedMedicines = [...medicines];
    const newLogs: InventoryLog[] = [];

    orderToRefund.items.forEach((item) => {
      const idx = updatedMedicines.findIndex((m) => m.id === item.medicine.id);
      if (idx > -1) {
        const curMed = updatedMedicines[idx];
        const batches = ensureMedicineBatches(curMed).batches!.map((batch) => ({ ...batch }));
        for (const allocation of item.batchAllocations || []) {
          const existing = batches.find((batch) => batch.id === allocation.batchId);
          if (existing) existing.quantity += allocation.quantity;
          else batches.push({ id: allocation.batchId, batchNumber: allocation.batchNumber, expiryDate: item.medicine.expiryDate, quantity: allocation.quantity, costPrice: allocation.costPrice, receivedAt: new Date().toISOString() });
        }
        if (!item.batchAllocations?.length) {
          const fallback = batches.find((batch) => batch.batchNumber === item.medicine.batchNumber) || batches[0];
          if (fallback) fallback.quantity += item.quantity;
        }
        const newStockLevel = batches.reduce((sum, batch) => sum + batch.quantity, 0);
        updatedMedicines[idx] = { ...curMed, stock: newStockLevel, batches };

        newLogs.push({
          id: `log-${Date.now()}-${item.medicine.id}`,
          medicineId: item.medicine.id,
          medicineName: item.medicine.name,
          type: 'adjustment',
          quantityChange: item.quantity,
          newStock: newStockLevel,
          timestamp: new Date().toISOString(),
          reason: `Customer Refund Order #${orderToRefund.orderNumber}`,
          performedBy: 'Pharmacy Manager',
          batchNumber: (item.batchAllocations || []).map((allocation) => allocation.batchNumber).join(', '),
        });
      }
    });

    setOrders(updatedOrders);
    setMedicines(updatedMedicines);
    setLogs([...newLogs, ...logs]);
    setSalesmen(updatedSalesmen);
    recordAudit('Refunded', 'Sale', orderToRefund.id, orderToRefund.orderNumber, `Refunded ₹${orderToRefund.total.toFixed(2)} and restored stock to the original batches.`, 'Pharmacy Manager');
  };

  // Salesmen Operations
  const handleUpdateSalesmanStatus = (id: string, status: Salesman['status']) => {
    setSalesmen(salesmen.map((s) => (s.id === id ? { ...s, status } : s)));
  };

  const handleAddSalesman = (salesmanData: Omit<Salesman, 'id' | 'totalSalesCount' | 'totalRevenue' | 'totalProfit'>) => {
    const newId = `s-${100 + salesmen.length + 1}`;
    const newSalesman: Salesman = {
      ...salesmanData,
      id: newId,
      totalSalesCount: 0,
      totalRevenue: 0,
      totalProfit: 0,
    };
    setSalesmen([...salesmen, newSalesman]);
  };

  const handleAddSupplier = (supplierData: Omit<Supplier, 'id'>) => {
    setSuppliers((previous) => [{ ...supplierData, id: `sup-${Date.now()}` }, ...previous]);
  };

  const handleCreatePurchaseOrder = (orderData: Omit<PurchaseOrder, 'id'>) => {
    setPurchaseOrders((previous) => [{ ...orderData, id: `po-${Date.now()}` }, ...previous]);
  };

  const handleReceivePurchaseOrder = (purchaseOrder: PurchaseOrder) => {
    if (purchaseOrder.status !== 'Ordered') return;
    const receiptLogs: InventoryLog[] = [];
    setMedicines((previous) => previous.map((medicine) => {
      const line = purchaseOrder.items.find((item) => item.medicineId === medicine.id);
      if (!line) return medicine;
      const newStock = medicine.stock + line.quantity;
      const batchNumber = line.batchNumber || purchaseOrder.orderNumber;
      const expiryDate = line.expiryDate || medicine.expiryDate;
      const batches = ensureMedicineBatches(medicine).batches!.map((batch) => ({ ...batch }));
      const matchingBatch = batches.find((batch) => batch.batchNumber === batchNumber && batch.expiryDate === expiryDate);
      if (matchingBatch) matchingBatch.quantity += line.quantity;
      else batches.push({ id: `batch-${Date.now()}-${medicine.id}`, batchNumber, expiryDate, quantity: line.quantity, costPrice: line.unitCost, receivedAt: new Date().toISOString() });
      receiptLogs.push({
        id: `log-${Date.now()}-${medicine.id}`, medicineId: medicine.id, medicineName: medicine.name,
        type: 'restock', quantityChange: line.quantity, newStock, timestamp: new Date().toISOString(),
        reason: `Purchase order ${purchaseOrder.orderNumber} received`, performedBy: 'Pharmacy Manager', batchNumber,
      });
      return { ...medicine, stock: newStock, batches };
    }));
    if (receiptLogs.length) setLogs((previous) => [...receiptLogs, ...previous]);
    setPurchaseOrders((previous) => previous.map((order) => order.id === purchaseOrder.id ? { ...order, status: 'Received' } : order));
    recordAudit('Purchase order received', 'Purchase order', purchaseOrder.id, purchaseOrder.orderNumber, `Received from ${purchaseOrder.supplierName}; ${purchaseOrder.items.length} line(s) added as tracked batches.`, 'Pharmacy Manager');
  };

  const handleCreateClosing = (closingData: Omit<DailyClosing, 'id'>) => {
    setClosings((previous) => [{ ...closingData, id: `close-${Date.now()}` }, ...previous]);
  };

  const handleAddExpense = (expense: Omit<ExpenseEntry, 'id'>) => {
    const newExpense = { ...expense, id: `expense-${Date.now()}` };
    setExpenses((previous) => [newExpense, ...previous]);
    recordAudit('Expense recorded', 'Expense', newExpense.id, expense.category, `${expense.description}: ₹${expense.amount.toFixed(2)}`, expense.recordedBy);
  };

  const handleCreateHandover = (handoverData: Omit<ShiftHandover, 'id'>) => {
    setHandovers((previous) => [{ ...handoverData, id: `handover-${Date.now()}` }, ...previous]);
  };

  // Reset Demo Data
  const handleResetDemoData = () => {
    if (confirm('Reset to fresh MedPoint pharmacy catalog, stock levels, salesmen roster, and sample orders?')) {
      if (!workspace) {
        removeStoredValue(LOCAL_STORAGE_KEY_MEDICINES);
        removeStoredValue(LOCAL_STORAGE_KEY_ORDERS);
        removeStoredValue(LOCAL_STORAGE_KEY_LOGS);
        removeStoredValue(LOCAL_STORAGE_KEY_SALESMEN);
        removeStoredValue(LOCAL_STORAGE_KEY_BRANCH);
        removeStoredValue(LOCAL_STORAGE_KEY_SUPPLIERS);
        removeStoredValue(LOCAL_STORAGE_KEY_PURCHASE_ORDERS);
        removeStoredValue(LOCAL_STORAGE_KEY_CLOSINGS);
        removeStoredValue(LOCAL_STORAGE_KEY_HANDOVERS);
      }
      setMedicines(INITIAL_PRODUCTS.map(ensureMedicineBatches));
      setSalesmen(INITIAL_SALESMEN);
      setOrders(INITIAL_ORDERS);
      setLogs(INITIAL_LOGS);
      setSuppliers(INITIAL_SUPPLIERS);
      setPurchaseOrders([]);
      setClosings([]);
      setExpenses([]);
      setHandovers([]);
      setAuditEvents([]);
      setCurrentBranch(INITIAL_BRANCHES[0]);
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      setDiscountPercent(0);
      setPaymentMethod('Card');
      setSelectedSalesmanId(INITIAL_SALESMEN[0]?.id || '');
      setActiveTab('dashboard');
    }
  };

  const handleExportBackup = () => {
    const backup = {
      app: 'MedPoint',
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      data: { medicines, orders, logs, salesmen, currentBranch, suppliers, purchaseOrders, closings, expenses, handovers, auditEvents },
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `medpoint-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = async (file: File) => {
    try {
      const parsed: unknown = JSON.parse(await file.text());
      if (!isObjectValue(parsed) || parsed.app !== 'MedPoint' || parsed.schemaVersion !== 1 || !isObjectValue(parsed.data)) {
        throw new Error('This is not a supported MedPoint backup.');
      }
      const data = parsed.data;
      const backupBranchId = isObjectValue(data.currentBranch) && typeof data.currentBranch.id === 'string'
        ? data.currentBranch.id
        : null;
      if (!isRecordArray<Medicine>(data.medicines) || !isRecordArray<Order>(data.orders) ||
          !isRecordArray<InventoryLog>(data.logs) || !isRecordArray<Salesman>(data.salesmen) ||
          !isRecordArray<Supplier>(data.suppliers) || !isRecordArray<PurchaseOrder>(data.purchaseOrders) ||
          !isRecordArray<DailyClosing>(data.closings) || !isRecordArray<ShiftHandover>(data.handovers) ||
          backupBranchId === null || !INITIAL_BRANCHES.some((branch) => branch.id === backupBranchId)) {
        throw new Error('The backup is missing required MedPoint records or contains an unknown branch.');
      }
      if (!window.confirm(`Restore ${data.medicines.length} medicines and ${data.orders.length} sales from this backup? Current browser data will be replaced.`)) return;
      setMedicines(data.medicines.map(ensureMedicineBatches));
      setOrders(data.orders);
      setLogs(data.logs);
      setSalesmen(data.salesmen);
      setCurrentBranch(INITIAL_BRANCHES.find((branch) => branch.id === backupBranchId)!);
      setSuppliers(data.suppliers);
      setPurchaseOrders(data.purchaseOrders);
      setClosings(data.closings);
      setExpenses(isRecordArray<ExpenseEntry>(data.expenses) ? data.expenses : []);
      setHandovers(data.handovers);
      setAuditEvents(isRecordArray<AuditEvent>(data.auditEvents) ? data.auditEvents : []);
      setCart([]);
      alert('Backup restored successfully.');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to read this backup file.');
    }
  };

  const lowStockCount = medicines.filter((m) => m.stock <= m.minStockThreshold).length;
  const expiringCount = medicines.reduce((count, medicine) => count + (medicine.batches || [{ expiryDate: medicine.expiryDate, quantity: medicine.stock }]).filter((batch) => {
    const diffDays = (new Date(`${batch.expiryDate}T00:00:00`).getTime() - new Date(new Date().toDateString()).getTime()) / 86400000;
    return batch.quantity > 0 && diffDays >= 0 && diffDays <= 60;
  }).length, 0);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="app-shell min-h-screen flex flex-col font-sans text-slate-800">
      {workspace && <div className="flex flex-wrap items-center justify-between gap-2 bg-teal-50 px-5 py-2 text-xs text-teal-950" role="status">
        <span><strong>Shared workspace connected.</strong> Changes save automatically to Supabase.</span>
        <span>{syncStatus === 'saving' ? 'Saving…' : syncStatus === 'error' ? 'Could not sync. Check your connection and refresh before continuing.' : 'Saved'}</span>
      </div>}
      {/* Application Header */}
      <Header
        currentBranch={currentBranch}
        branches={branches}
        onSelectBranch={setCurrentBranch}
        medicines={medicines}
        onResetDemoData={handleResetDemoData}
        onNavigateToInventory={() => setActiveTab('inventory')}
        onNavigateToShelfFinder={() => setActiveTab('shelf-finder')}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
      />

      {/* Main App Layout */}
      <div className="app-layout flex-1 flex min-h-0 overflow-hidden">
        {/* App Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          lowStockCount={lowStockCount}
          expiringCount={expiringCount}
        />

        {/* Tab View Container */}
        <main className="app-main min-w-0 flex-1 overflow-y-auto p-5 sm:p-7">
          {!workspace && <div className="mx-auto mb-5 flex max-w-7xl flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-900" role="status">
            <strong>Prototype using browser-local data.</strong>
            <span>Sample records are included. Back up this browser’s data regularly; it is not shared across devices.</span>
          </div>}
          {activeTab === 'dashboard' && (
            <Dashboard
              medicines={medicines}
              orders={orders}
              logs={logs}
              salesmen={salesmen}
              branches={branches}
              currentBranch={currentBranch}
              onNavigateToPOS={() => setActiveTab('pos')}
              onNavigateToInventory={() => setActiveTab('inventory')}
              onNavigateToShelfFinder={() => setActiveTab('shelf-finder')}
              onNavigateToSalesmen={() => setActiveTab('salesmen')}
              onAddToCart={handleAddToCart}
            />
          )}

          {activeTab === 'shelf-finder' && (
            <ShelfFinder
              medicines={medicines}
              onAddToCart={handleAddToCart}
              onNavigateToPOS={() => setActiveTab('pos')}
              cartItemCount={totalCartCount}
            />
          )}

          {activeTab === 'inventory' && (
            <Inventory
              medicines={medicines}
              onAddMedicine={handleAddMedicine}
              onUpdateMedicine={handleUpdateMedicine}
              onDeleteMedicine={handleDeleteMedicine}
              onAdjustStock={handleAdjustStock}
            />
          )}

          {activeTab === 'pos' && (
            <POS
              medicines={medicines}
              salesmen={salesmen}
              currentBranch={currentBranch}
              cart={cart}
              customerName={customerName}
              setCustomerName={setCustomerName}
              customerPhone={customerPhone}
              setCustomerPhone={setCustomerPhone}
              discountPercent={discountPercent}
              setDiscountPercent={setDiscountPercent}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              selectedSalesmanId={selectedSalesmanId}
              setSelectedSalesmanId={setSelectedSalesmanId}
              onAddToCart={handleAddToCart}
              onUpdateQuantity={handleUpdateCartQty}
              onUpdateDosageNotes={handleUpdateCartDosage}
              onRemoveFromCart={handleRemoveFromCart}
              onClearCart={handleClearCart}
              onCompleteOrder={handleCompleteOrder}
            />
          )}

          {activeTab === 'sales' && (
            <SalesHistory
              orders={orders}
              onSelectOrderForReceipt={setSelectedReceiptOrder}
              onRefundOrder={handleRefundOrder}
            />
          )}

          {activeTab === 'salesmen' && (
            <SalesmenManagement
              salesmen={salesmen}
              orders={orders}
              onUpdateSalesmanStatus={handleUpdateSalesmanStatus}
              onAddSalesman={handleAddSalesman}
            />
          )}

          {activeTab === 'operations' && (
            <Operations
              medicines={medicines}
              logs={logs}
              auditEvents={auditEvents}
              orders={orders}
              salesmen={salesmen}
              currentBranch={currentBranch}
              suppliers={suppliers}
              purchaseOrders={purchaseOrders}
              closings={closings}
              expenses={expenses}
              handovers={handovers}
              onAddSupplier={handleAddSupplier}
              onCreatePurchaseOrder={handleCreatePurchaseOrder}
              onReceivePurchaseOrder={handleReceivePurchaseOrder}
              onCreateClosing={handleCreateClosing}
              onAddExpense={handleAddExpense}
              onCreateHandover={handleCreateHandover}
            />
          )}
        </main>
      </div>

      {/* Thermal Receipt Modal */}
      <ReceiptModal
        order={selectedReceiptOrder}
        branch={currentBranch}
        onClose={() => setSelectedReceiptOrder(null)}
      />
    </div>
  );
}
