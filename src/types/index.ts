export type MedicineCategory = 
  | 'Antibiotics & Anti-infectives'
  | 'Pain Relievers & Analgesics'
  | 'Cardiovascular & BP'
  | 'Diabetes & Endocrine Care'
  | 'Vitamins & Supplements'
  | 'Respiratory & Cold Care'
  | 'Dermatology & Topicals'
  | 'Gastrointestinal Care'
  | 'Eye & Ear Care';

export type DosageForm = 
  | 'Tablet' 
  | 'Capsule' 
  | 'Syrup' 
  | 'Injection' 
  | 'Ointment' 
  | 'Eye Drops' 
  | 'Inhaler' 
  | 'Sachet';

export interface Medicine {
  id: string;
  code: string; // e.g. "MED-1001" or "890123"
  name: string;
  genericName: string; // e.g. "Paracetamol", "Amoxicillin Trihydrate"
  category: MedicineCategory;
  form: DosageForm;
  dosage: string; // e.g., "500mg", "10ml"
  costPrice: number; // Unit Cost Price
  price: number; // Retail Selling Price
  stock: number; // Packs / Units available
  minStockThreshold: number;
  requiresPrescription: boolean; // Rx Badge
  
  // Storage Location attributes (Shelf, Box, Level)
  rackNumber: string; // e.g., "Rack A", "Rack B", "Rack C"
  boxNumber: string; // e.g., "Box #A-04", "Box #B-12"
  shelfLevel: string; // e.g., "Level 1 (Top)", "Level 2 (Middle)", "Level 3 (Bottom)"
  section: string; // e.g., "Section A1 - Fast Moving Antibiotics"

  expiryDate: string; // YYYY-MM-DD
  batchNumber: string; // e.g., "B24-889"
  manufacturer: string; // e.g., "Sun Pharma", "Cipla", "Pfizer", "Novartis"
  description?: string;
  sideEffects?: string;
  image?: string;
}

export interface Salesman {
  id: string;
  code: string; // e.g. "EMP-101"
  name: string;
  role: 'Senior Pharmacist' | 'Assistant Pharmacist' | 'Counter Sales Executive' | 'Pharmacy Manager';
  phone: string;
  email: string;
  avatar: string;
  totalSalesCount: number;
  totalRevenue: number;
  totalProfit: number;
  status: 'On Duty' | 'Off Duty' | 'On Break';
  rating: number; // e.g. 4.9
  joinDate: string;
}

export interface CartItem {
  medicine: Medicine;
  quantity: number;
  dosageInstructions?: string;
}

export type PaymentMethod = 'Cash' | 'Card' | 'UPI / QR' | 'Insurance Claim' | 'Digital Wallet';

export interface Order {
  id: string;
  orderNumber: string;
  timestamp: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  costTotal: number;
  profit: number; // total - costTotal
  paymentMethod: PaymentMethod;
  branchId: string;
  status: 'Completed' | 'Refunded';
  customerName?: string;
  customerPhone?: string;
  doctorName?: string;
  prescriptionNumber?: string;
  salesmanId: string;
  salesmanName: string;
}

export interface InventoryLog {
  id: string;
  medicineId: string;
  medicineName: string;
  type: 'restock' | 'sale' | 'adjustment' | 'expired_disposed';
  quantityChange: number;
  newStock: number;
  timestamp: string;
  reason?: string;
  performedBy?: string;
}

export interface PharmacyBranch {
  id: string;
  name: string;
  city: string;
  district: string;
  address: string;
  phone: string;
  licenseNumber: string;
  isMain?: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  leadTimeDays: number;
}

export interface PurchaseOrderLine {
  medicineId: string;
  medicineName: string;
  quantity: number;
  unitCost: number;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplierName: string;
  createdAt: string;
  expectedAt: string;
  status: 'Ordered' | 'Received';
  items: PurchaseOrderLine[];
  total: number;
}

export interface DailyClosing {
  id: string;
  date: string;
  branchId: string;
  branchName: string;
  closedAt: string;
  closedBy: string;
  orderCount: number;
  revenue: number;
  cashTotal: number;
  cardTotal: number;
  digitalTotal: number;
  notes: string;
}

export interface ShiftHandover {
  id: string;
  createdAt: string;
  branchId: string;
  fromName: string;
  toName: string;
  notes: string;
  pendingTasks: string;
}
