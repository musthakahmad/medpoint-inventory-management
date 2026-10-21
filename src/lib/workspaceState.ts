import { AuditEvent, DailyClosing, ExpenseEntry, InventoryLog, Medicine, Order, PharmacyBranch, PurchaseOrder, Salesman, ShiftHandover, Supplier } from '../types';
import { isObjectValue, isRecordArray } from '../utils/storage';

export interface WorkspaceData {
  schemaVersion: 1;
  medicines: Medicine[];
  salesmen: Salesman[];
  orders: Order[];
  logs: InventoryLog[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  closings: DailyClosing[];
  expenses: ExpenseEntry[];
  handovers: ShiftHandover[];
  auditEvents: AuditEvent[];
  currentBranch: PharmacyBranch;
}

export interface WorkspaceMembership {
  id: string;
  name: string;
  inviteCode: string;
  role: string;
}

export const isWorkspaceData = (value: unknown): value is WorkspaceData =>
  isObjectValue(value) && value.schemaVersion === 1 &&
  isRecordArray<Medicine>(value.medicines) && isRecordArray<Salesman>(value.salesmen) &&
  isRecordArray<Order>(value.orders) && isRecordArray<InventoryLog>(value.logs) &&
  isRecordArray<Supplier>(value.suppliers) && isRecordArray<PurchaseOrder>(value.purchaseOrders) &&
  isRecordArray<DailyClosing>(value.closings) && isRecordArray<ExpenseEntry>(value.expenses) &&
  isRecordArray<ShiftHandover>(value.handovers) && isRecordArray<AuditEvent>(value.auditEvents) &&
  isObjectValue(value.currentBranch) && typeof value.currentBranch.id === 'string' &&
  typeof value.currentBranch.name === 'string';

export const createEmptyWorkspaceData = (workspaceId: string, workspaceName: string): WorkspaceData => ({
  schemaVersion: 1,
  medicines: [],
  salesmen: [],
  orders: [],
  logs: [],
  suppliers: [],
  purchaseOrders: [],
  closings: [],
  expenses: [],
  handovers: [],
  auditEvents: [],
  currentBranch: {
    id: workspaceId,
    name: workspaceName || 'My Pharmacy',
    city: '',
    district: '',
    address: '',
    phone: '',
    licenseNumber: '',
    isMain: true,
  },
});
