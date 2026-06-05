// ── Enums ──

export type UserRole =
  | "WAREHOUSEMAN"
  | "MANAGER"
  | "PROCUREMENT"
  | "ADMIN"
  | "SUPERADMIN"

export type PurchaseOrderStatus =
  | "PENDING"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "COMPLETED"
  | "PARTIALLY_DELIVERED"
  | "CANCELLED"
  | "AWAITING_APPROVAL"
  | "REJECTED"
  | "APPROVED"
  | "WAITING_PAYMENT"
  | "HELD_AT_CUSTOMS"

export type PaymentMethod = "CASH" | "BANK_TRANSFER" | "CHECK" | "USDT" | "PAYPAL" | "OTHER"

export type PurchaseOrderType = "SERVICES" | "MATERIALS" | "MRO" | "CAPITAL_EQUIPMENT"

export type Uom =
  | "UN" | "CA" | "KG" | "L" | "M" | "CM" | "G" | "LB" | "EA" | "M2" | "M3"
  | "LTS" | "GL" | "GLN" | "PAQ" | "CJ" | "ROL" | "KIT" | "CIL" | "YD"
  | "TON" | "TM" | "TO" | "BOT" | "BTO" | "CTO" | "PUL" | "CL" | "FC" | "TF"
  | "PAA" | "PI2" | "PI3" | "BOL" | "CEN" | "MIL" | "AM" | "LOT" | "MTL"
  | "BL" | "SB" | "CTE" | "PAI" | "TR"

// ── Auth ──

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  role: UserRole
  costCenterId?: number | null
  inviteToken: string
}

export interface InviteTokenDTO {
  id: string
  token: string
  email: string
  intendedRole: UserRole
  costCenterId: number | null
  createdById: string
  createdAt: string
  expiresAt: string
  usedAt: string | null
  usedByUserId: string | null
  revoked: boolean
}

export interface CreateInviteRequest {
  email: string
  role: UserRole
  costCenterId?: number | null
  expiresAt?: string | null
}

export interface AuthResponse {
  user: UserDTO
  token: string | null
}

export interface UserDTO {
  id: string
  name: string
  email: string
  role: UserRole
  active: boolean
  costCenterId: number | null
  costCenterName: string | null
}

// ── Supplier ──

export interface SupplierCategoryDTO {
  id: number
  name: string
  description: string
  active: boolean
  createdAt?: string
  updatedAt?: string
}

export interface SupplierDTO {
  id: number
  name: string
  description: string
  address: string
  currency: string
  contactEmail: string
  phoneNumbers: string[]
  active: boolean
  representatives: RepresentativeInfo[]
  rating?: number
  totalOrders?: number
  categoryId?: number | null
  categoryName?: string | null
}

export interface RepresentativeInfo {
  id: number
  fullName: string
}

// ── Product / Inventory ──

export interface ProductDTO {
  id: number
  internalCode: string
  sku: string
  name: string
  description: string
  sapCode: string
  uom: Uom
  reorderPoint: number
  maxStock: number | null
  totalStock: number
  totalPendingStock: number
  active: boolean
  supplierId: number | null
  supplierName: string | null
  categoryId: number | null
  categoryName: string | null
}

export interface ProductOnStock {
  id: number
  internalCode: string
  sku: string
  name: string
  sapCode: string
  uom: string
  currentStock: number
  pendingStock: number
  reorderPoint: number
  maxStock: number | null
  categoryName: string | null
}

export interface CreateProductRequest {
  name: string
  sku: string
  description?: string
  sapCode: string
  uom: Uom
  reorderPoint: number
  supplierId?: number | null
  categoryId?: number | null
}

// ── Location ──

export interface LocationDTO {
  id: number
  code: string
  active: boolean
  warehouseId: number | null
  warehouseName: string | null
}

// ── Purchase Order ──

export interface PurchaseOrderResponse {
  id: number
  orderNumber: string
  description: string
  status: PurchaseOrderStatus
  supplierName: string
  paymentMethod: PaymentMethod
  type: PurchaseOrderType
  createdBy: string
  createdAt: string
  approvalNotes: string | null
  rejectionReason: string | null
  approvedBy: string | null
  approvedAt: string | null
  requisitionId: number | null
  destinationWarehouseId: number | null
  destinationWarehouseName: string | null
  leadTime: number | null
  subtotal?: number | null
  paymentTerms?: string | null
  specialConditions?: string | null
  taxAmount?: number | null
  shippingCost?: number | null
  otherCost?: number | null
  supplier?: {
    name: string
    address: string
    email: string
    phoneNumbers: string[]
  } | null
  destinationWarehouse?: {
    name: string
    physicalAddress: string
    description: string
    sapCenterCode?: string
    responsibleUserName?: string
  } | null
  items: PurchaseOrderItemResponse[]
}

export interface PurchaseOrderItemResponse {
  productId: number
  productName: string
  productSku: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface CreatePurchaseOrderRequest {
  orderNumber: string
  description: string
  supplierId: number
  destinationWarehouseId: number
  paymentMethod: PaymentMethod
  type: PurchaseOrderType
  createdById: string
  requisitionId?: number
  leadTime?: number | null
  items: { productId: number; quantity: number; unitPrice: number }[]
}

// ── Goods Receipt ──

export interface GoodReceiptResponse {
  id: number
  receiptNumber: string
  purchaseOrderId: number
  orderNumber: string
  warehousePhysicalAddress: string | null
  updatedStatus: PurchaseOrderStatus
  receivedAt: string
  notes: string
  receivedBy: string | null
  items: GoodReceiptItemResponse[]
  purchaseOrder?: {
    supplier: {
      name: string
      address: string
      email: string
      phoneNumbers: string[]
    }
    destinationWarehouse: {
      name: string
      physicalAddress: string
      description: string
      sapCenterCode?: string
      responsibleUserName?: string
    }
    createdAt: string
  } | null
}

export interface GoodReceiptItemResponse {
  productId: number
  productName: string
  productSku: string
  expectedQuantity: number
  receivedQuantity: number
  difference: number
  unitPrice?: number | null
  totalPrice?: number | null
  locationId?: number | null
  locationCode?: string | null
}

export interface ReceiveGoodsRequest {
  items: { productId: number; receivedQuantity: number }[]
  notes: string
  destinationWarehouseId: number
  locationId: number
}

// ── Warehouse ──

export interface WarehouseResponse {
  id: number
  name: string
  sapCenterCode: string
  description: string
  physicalAddress: string
  active: boolean
  responsibleUserId: string | null
  responsibleUserName: string | null
}

export interface CreateWarehouseRequest {
  name: string
  physicalAddress: string
  description: string
  responsibleUserId: string
  sapCenterCode: string
}

export interface WarehouseStockSummary {
  warehouseId: number
  warehouseName: string
  totalStock: number
  totalPendingStock: number
}

export interface ProductStockBreakdown {
  productId: number
  totalStock: number
  totalPendingStock: number
  warehouses: {
    warehouseId: number
    warehouseName: string
    currentStock: number
    pendingStock: number
  }[]
}

export interface TransferStockRequest {
  productId: number
  fromWarehouseId: number
  toWarehouseId: number
  quantity: number
  createdById: string
  unitCost?: number | null
  reason?: string | null
}

export interface AdjustStockRequest {
  productId: number
  warehouseId: number
  newStock: number
  reason?: string
  createdById: string
  unitCost?: number | null
}

// ── Category ──

export interface Category {
  id: number
  name: string
  parentId: number | null
  parentCategory?: Category | null
}

export interface CostCenter {
  id: number
  code: string
  fullDescription: string
  divisionDescription: string | null
  managementDescription: string | null
  isActive: boolean
  managementId: number | null
  managementCode: string | null
  generalManagementId: number | null
  generalManagementCode: string | null
  generalManagementDescription: string | null
}

export interface ManagementDTO {
  id: number
  code: string
  description: string
  generalManagementId: number
}

export interface GeneralManagementDTO {
  id: number
  code: string
  description: string
}

// ── Dashboard ──

export interface KpiStatsDTO {
  totalOrders: number
  totalInventoryUnits: number
  monthlySpend: number
  fulfillmentRate: number
}

export interface RecentOrderDTO {
  id: number
  orderNumber: string
  createdAt: string
  supplierName: string
  status: PurchaseOrderStatus
}

export interface SpendingStatsDTO {
  totalMonthly: number
  monthlyBreakdown: { month: string; actual: number; projected: number }[]
  byCategory: Record<string, number>
  byCategoryPercent: Record<string, number>
}

export interface CriticalInventoryItemDTO {
  productId: number
  productName: string
  sku: string
  currentStock: number
  reorderPoint: number
  maxStock: number | null
  severity: "CRITICAL" | "WARNING" | "OVERSTOCK"
}

// ── Supplier Performance ──

export interface SupplierPerformanceMonthlyDTO {
  month: string
  a: number
  b: number
}

// ── Employee ──

export interface EmployeeDTO {
  id: number
  fullName: string
  documentNumber: string
  phone: string | null
  costCenterId: number | null
  costCenterDescription: string | null
  isActive: boolean
}

export interface EmployeeRequest {
  fullName: string
  documentNumber: string
  phone?: string | null
  costCenterId?: number | null
  isActive?: boolean | null
}

// ── Admin / User Management ──

export interface UpdateUserRequest {
  role: UserRole
  costCenterId?: number | null
}

// ── Requisition ──

export type RequisitionStatus =
  | "DRAFT"
  | "PENDING"
  | "AWAITING_APPROVAL"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "CONVERTED"

export interface RequisitionResponse {
  id: number
  requisitionNumber: string
  description: string
  requestedBy: string
  areaName: string
  status: RequisitionStatus
  rejectionReason: string | null
  approvalNotes: string | null
  approvedBy: string | null
  approvedAt: string | null
  createdAt: string
  items: RequisitionItemResponse[]
}

export interface RequisitionItemResponse {
  productId: number
  productName: string
  productSku: string
  quantity: number
  notes: string | null
}

export interface CreateRequisitionRequest {
  requisitionNumber: string
  description: string
  requestedById: string
  costCenterId: number
  items: { productId: number; quantity: number; notes?: string }[]
}

// ── Dispatch ──

export interface DispatchItemRequest {
  productId: number
  quantity: number
  exitUnitPrice: number
}

export interface DispatchRequest {
  items: DispatchItemRequest[]
  notes: string
  warehouseId: number
  employeeId: number
}

export interface DispatchItemResponse {
  productId: number
  productName: string
  productSku: string
  quantity: number
  exitUnitPrice: number | null
}

export interface DispatchResponse {
  id: number
  dispatchNumber: string
  warehouseName: string
  employeeName: string
  employeeDocument: string | null
  costCenterCode: string | null
  costCenterDescription: string | null
  createdAt: string
  createdByName: string
  notes: string
  items: DispatchItemResponse[]
  warehouse?: {
    name: string
    physicalAddress: string
    description?: string
    sapCenterCode?: string
    responsibleUserName?: string
  } | null
}

// ── Inventory Movements ──

export type MovementType = "TRANSFER" | "ADJUSTMENT" | "INPUT" | "DISPATCH" | "OUTPUT"

export interface InventoryMovementResponse {
  id: number
  type: MovementType
  productId: number
  productName: string
  productSku: string
  fromWarehouseId: number | null
  fromWarehouseName: string | null
  toWarehouseId: number | null
  toWarehouseName: string | null
  quantity: number
  entryUnitPrice: number | null
  exitUnitPrice: number | null
  stockBefore: number | null
  stockAfter: number | null
  reason: string | null
  createdByName: string
  runningBalance: number | null
  createdAt: string
}

export interface WarehouseDetailResponse extends WarehouseResponse {
  totalProducts: number
  totalStock: number
}

export interface PurchaseOrderReceiptSummary {
  orderId: number
  orderNumber: string
  orderStatus: PurchaseOrderStatus
  totalReceipts: number
  items: ItemSummary[]
}

export interface ItemSummary {
  productId: number
  productName: string
  productSku: string
  orderedQuantity: number
  receivedQuantity: number
  pendingQuantity: number
  fullyReceived: boolean
}

// ── Reports ──

export type ReportType = "STOCK_INVENTORY" | "STOCK_MOVEMENTS" | "CRITICAL_ALERTS" | "WAREHOUSE_ANALYSIS"
export type ReportStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED"
export type ReportFormat = "PDF" | "EXCEL" | "JSON"
export type ReportFrequency = "DAILY" | "WEEKLY" | "MONTHLY"

export interface ReportDTO {
  id: number
  name: string
  description?: string
  type: ReportType
  status: ReportStatus
  format: ReportFormat
  generatedAt?: string
  startDate?: string
  endDate?: string
  recordCount?: number
  fileSize?: number
  filePath?: string
  createdBy?: string
  createdAt?: string
}

export interface CreateReportRequest {
  name: string
  type: ReportType
  format: ReportFormat
  startDate: string
  endDate: string
  categoryId?: number
  warehouseId?: number
  search?: string
  additionalFilters?: Record<string, unknown>
}

export interface ScheduledReportDTO {
  id: number
  name: string
  reportType: ReportType
  frequency: ReportFrequency
  recipientEmails?: string
  filterConfig?: string
  format: ReportFormat
  scheduleTime?: string
  scheduleDayOfWeek?: number
  scheduleDay?: number
  lastExecutedAt?: string
  nextExecutionAt?: string
  enabled: boolean
  createdAt?: string
}

export interface CreateScheduledReportRequest {
  name: string
  reportType: ReportType
  frequency: ReportFrequency
  recipientEmails?: string
  filterConfig?: string
  format: ReportFormat
  scheduleTime: string
  scheduleDayOfWeek?: number
  scheduleDay?: number
}

export interface UpdateScheduledReportRequest extends Partial<CreateScheduledReportRequest> {
  enabled?: boolean
}

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  STOCK_INVENTORY: "Stock",
  STOCK_MOVEMENTS: "Movimientos",
  CRITICAL_ALERTS: "Alertas",
  WAREHOUSE_ANALYSIS: "Análisis x Almacén",
}

export const REPORT_STATUS_COLORS: Record<ReportStatus, string> = {
  PENDING: "text-yellow-600 bg-yellow-50",
  PROCESSING: "text-blue-600 bg-blue-50",
  COMPLETED: "text-emerald-600 bg-emerald-50",
  FAILED: "text-red-600 bg-red-50",
}

// ── Spring Page wrapper ──

export interface Page<T> {
  content: T[]
  page: {
    size: number
    number: number
    totalElements: number
    totalPages: number
  }
}
