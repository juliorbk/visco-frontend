// ── Enums ──

export type UserRole = "WAREHOUSEMAN" | "MANAGER" | "PROCUREMENT" | "ADMIN"

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
  costCenterId: number | null
  costCenterName: string | null
}

// ── Supplier ──

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
  reorderPoint: number
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
  paymentTerms: string | null
  specialConditions: string | null
  taxAmount: number | null
  shippingCost: number | null
  otherCost: number | null
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
  updatedStatus: PurchaseOrderStatus
  receivedAt: string
  notes: string
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
}

export interface ReceiveGoodsRequest {
  items: { productId: number; receivedQuantity: number }[]
  notes: string
  destinationWarehouseId: number
}

// ── Warehouse ──

export interface WarehouseResponse {
  id: number
  name: string
  sapCenterCode: string
  description:string
  physicalAddress:string
  active: boolean
  responsibleUserId: string
  responsibleUserName: string
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
  internalCc: string | null
  active: boolean
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
  severity: "CRITICAL" | "WARNING"
}

// ── Supplier Performance ──

export interface SupplierPerformanceMonthlyDTO {
  month: string
  a: number
  b: number
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

// ── Inventory Movements ──

export type MovementType = "TRANSFER" | "ADJUSTMENT" | "RECEIPT"

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
  physicalAddress: string
  description: string
  responsibleUserId: string | null
  responsibleUserName: string | null
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
