import React, { useState, useEffect } from 'react';
import { Medicine, Order, InventoryLog, PharmacyBranch, CartItem, PaymentMethod, Salesman, Supplier, PurchaseOrder, DailyClosing, ShiftHandover } from './types';
import { INITIAL_BRANCHES, INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_LOGS, INITIAL_SALESMEN, INITIAL_SUPPLIERS } from './data/mockData';

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

const LOCAL_STORAGE_KEY_MEDICINES = 'medpoint_medicines_v2';
const LOCAL_STORAGE_KEY_ORDERS = 'medpoint_orders_v2';
const LOCAL_STORAGE_KEY_LOGS = 'medpoint_logs_v2';
const LOCAL_STORAGE_KEY_SALESMEN = 'medpoint_salesmen_v2';
const LOCAL_STORAGE_KEY_BRANCH = 'medpoint_current_branch_v2';
const LOCAL_STORAGE_KEY_SUPPLIERS = 'medpoint_suppliers_v1';
const LOCAL_STORAGE_KEY_PURCHASE_ORDERS = 'medpoint_purchase_orders_v1';
const LOCAL_STORAGE_KEY_CLOSINGS = 'medpoint_daily_closings_v1';
const LOCAL_STORAGE_KEY_HANDOVERS = 'medpoint_shift_handovers_v1';

export default function App() {

  // Initialize State with LocalStorage Persistence
  const [medicines, setMedicines] = useState<Medicine[]>(() => {
    return readStoredValue(LOCAL_STORAGE_KEY_MEDICINES, INITIAL_PRODUCTS, isRecordArray<Medicine>);
  });

  const [salesmen, setSalesmen] = useState<Salesman[]>(() => {
    return readStoredValue(LOCAL_STORAGE_KEY_SALESMEN, INITIAL_SALESMEN, isRecordArray<Salesman>);
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    return readStoredValue(LOCAL_STORAGE_KEY_ORDERS, INITIAL_ORDERS, isRecordArray<Order>);
  });

  const [logs, setLogs] = useState<InventoryLog[]>(() => {
    return readStoredValue(LOCAL_STORAGE_KEY_LOGS, INITIAL_LOGS, isRecordArray<InventoryLog>);
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    return readStoredValue(LOCAL_STORAGE_KEY_SUPPLIERS, INITIAL_SUPPLIERS, isRecordArray<Supplier>);
  });
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => readStoredValue(LOCAL_STORAGE_KEY_PURCHASE_ORDERS, [], isRecordArray<PurchaseOrder>));
  const [closings, setClosings] = useState<DailyClosing[]>(() => readStoredValue(LOCAL_STORAGE_KEY_CLOSINGS, [], isRecordArray<DailyClosing>));
  const [handovers, setHandovers] = useState<ShiftHandover[]>(() => readStoredValue(LOCAL_STORAGE_KEY_HANDOVERS, [], isRecordArray<ShiftHandover>));

  const [branches] = useState<PharmacyBranch[]>(INITIAL_BRANCHES);
  const [currentBranch, setCurrentBranch] = useState<PharmacyBranch>(() => {
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
    writeStoredValue(LOCAL_STORAGE_KEY_MEDICINES, medicines);
  }, [medicines]);

  useEffect(() => {
    writeStoredValue(LOCAL_STORAGE_KEY_SALESMEN, salesmen);
  }, [salesmen]);

  useEffect(() => {
    writeStoredValue(LOCAL_STORAGE_KEY_ORDERS, orders);
  }, [orders]);

  useEffect(() => {
    writeStoredValue(LOCAL_STORAGE_KEY_LOGS, logs);
  }, [logs]);

  useEffect(() => { writeStoredValue(LOCAL_STORAGE_KEY_SUPPLIERS, suppliers); }, [suppliers]);
  useEffect(() => { writeStoredValue(LOCAL_STORAGE_KEY_PURCHASE_ORDERS, purchaseOrders); }, [purchaseOrders]);
  useEffect(() => { writeStoredValue(LOCAL_STORAGE_KEY_CLOSINGS, closings); }, [closings]);
  useEffect(() => { writeStoredValue(LOCAL_STORAGE_KEY_HANDOVERS, handovers); }, [handovers]);

  useEffect(() => {
    writeStoredValue(LOCAL_STORAGE_KEY_BRANCH, currentBranch);
  }, [currentBranch]);

  // Cart Operations
  const handleAddToCart = (medicine: Medicine) => {
    if (medicine.stock <= 0) return;

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.medicine.id === medicine.id);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        if (updated[existingIndex].quantity < medicine.stock) {
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
      if (newQty > updated[index].medicine.stock) {
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
  const handleCompleteOrder = () => {
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
      return !currentMedicine || currentMedicine.stock < item.quantity;
    });
    if (unavailableItem) {
      alert(`${unavailableItem.medicine.name} no longer has enough stock. Please update the cart.`);
      return;
    }

    const subtotal = cart.reduce((sum, item) => sum + item.medicine.price * item.quantity, 0);
    const costTotal = cart.reduce((sum, item) => sum + item.medicine.costPrice * item.quantity, 0);
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
      items: cart,
      subtotal,
      tax,
      discount: discountAmount,
      total,
      costTotal,
      profit,
      paymentMethod,
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

    cart.forEach((cartItem) => {
      const medIndex = updatedMedicines.findIndex((m) => m.id === cartItem.medicine.id);
      if (medIndex > -1) {
        const curMed = updatedMedicines[medIndex];
        const newStockLevel = Math.max(0, curMed.stock - cartItem.quantity);
        updatedMedicines[medIndex] = { ...curMed, stock: newStockLevel };

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
        });
      }
    });

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
    const medicine: Medicine = {
      ...newMed,
      id: `med-${Date.now()}`,
    };
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
  };

  const handleUpdateMedicine = (updatedMed: Medicine) => {
    setMedicines(medicines.map((m) => (m.id === updatedMed.id ? updatedMed : m)));
  };

  const handleDeleteMedicine = (id: string) => {
    if (confirm('Are you sure you want to remove this medicine from inventory?')) {
      setMedicines(medicines.filter((m) => m.id !== id));
    }
  };

  const handleAdjustStock = (id: string, delta: number, reason: string) => {
    const med = medicines.find((m) => m.id === id);
    if (!med || !Number.isFinite(delta) || delta === 0) return;

    const newStock = Math.max(0, med.stock + delta);
    const actualChange = newStock - med.stock;
    if (actualChange === 0) return;
    setMedicines(medicines.map((m) => (m.id === id ? { ...m, stock: newStock } : m)));

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
      },
      ...logs,
    ]);
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
        const newStockLevel = curMed.stock + item.quantity;
        updatedMedicines[idx] = { ...curMed, stock: newStockLevel };

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
        });
      }
    });

    setOrders(updatedOrders);
    setMedicines(updatedMedicines);
    setLogs([...newLogs, ...logs]);
    setSalesmen(updatedSalesmen);
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
      receiptLogs.push({
        id: `log-${Date.now()}-${medicine.id}`, medicineId: medicine.id, medicineName: medicine.name,
        type: 'restock', quantityChange: line.quantity, newStock, timestamp: new Date().toISOString(),
        reason: `Purchase order ${purchaseOrder.orderNumber} received`, performedBy: 'Pharmacy Manager',
      });
      return { ...medicine, stock: newStock };
    }));
    if (receiptLogs.length) setLogs((previous) => [...receiptLogs, ...previous]);
    setPurchaseOrders((previous) => previous.map((order) => order.id === purchaseOrder.id ? { ...order, status: 'Received' } : order));
  };

  const handleCreateClosing = (closingData: Omit<DailyClosing, 'id'>) => {
    setClosings((previous) => [{ ...closingData, id: `close-${Date.now()}` }, ...previous]);
  };

  const handleCreateHandover = (handoverData: Omit<ShiftHandover, 'id'>) => {
    setHandovers((previous) => [{ ...handoverData, id: `handover-${Date.now()}` }, ...previous]);
  };

  // Reset Demo Data
  const handleResetDemoData = () => {
    if (confirm('Reset to fresh MedPoint pharmacy catalog, stock levels, salesmen roster, and sample orders?')) {
      removeStoredValue(LOCAL_STORAGE_KEY_MEDICINES);
      removeStoredValue(LOCAL_STORAGE_KEY_ORDERS);
      removeStoredValue(LOCAL_STORAGE_KEY_LOGS);
      removeStoredValue(LOCAL_STORAGE_KEY_SALESMEN);
      removeStoredValue(LOCAL_STORAGE_KEY_BRANCH);
      removeStoredValue(LOCAL_STORAGE_KEY_SUPPLIERS);
      removeStoredValue(LOCAL_STORAGE_KEY_PURCHASE_ORDERS);
      removeStoredValue(LOCAL_STORAGE_KEY_CLOSINGS);
      removeStoredValue(LOCAL_STORAGE_KEY_HANDOVERS);
      setMedicines(INITIAL_PRODUCTS);
      setSalesmen(INITIAL_SALESMEN);
      setOrders(INITIAL_ORDERS);
      setLogs(INITIAL_LOGS);
      setSuppliers(INITIAL_SUPPLIERS);
      setPurchaseOrders([]);
      setClosings([]);
      setHandovers([]);
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

  const lowStockCount = medicines.filter((m) => m.stock <= m.minStockThreshold).length;
  const expiringCount = medicines.filter((m) => {
    const diffDays = (new Date(m.expiryDate).getTime() - Date.now()) / (1000 * 3600 * 24);
    return diffDays >= 0 && diffDays <= 60;
  }).length;

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="app-shell min-h-screen flex flex-col font-sans text-slate-800">
      {/* Application Header */}
      <Header
        currentBranch={currentBranch}
        branches={branches}
        onSelectBranch={setCurrentBranch}
        medicines={medicines}
        onResetDemoData={handleResetDemoData}
        onNavigateToInventory={() => setActiveTab('inventory')}
        onNavigateToShelfFinder={() => setActiveTab('shelf-finder')}
      />

      {/* Main App Layout */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* App Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          lowStockCount={lowStockCount}
          expiringCount={expiringCount}
        />

        {/* Tab View Container */}
        <main className="app-main min-w-0 flex-1 overflow-y-auto p-5 sm:p-7">
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
              orders={orders}
              salesmen={salesmen}
              currentBranch={currentBranch}
              suppliers={suppliers}
              purchaseOrders={purchaseOrders}
              closings={closings}
              handovers={handovers}
              onAddSupplier={handleAddSupplier}
              onCreatePurchaseOrder={handleCreatePurchaseOrder}
              onReceivePurchaseOrder={handleReceivePurchaseOrder}
              onCreateClosing={handleCreateClosing}
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
