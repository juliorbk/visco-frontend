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
  | "UNIDAD"
  | "CAJA"
  | "PAQUETE"
  | "LITRO"
  | "KILOGRAMO"
  | "GALON"
  | "METRO"
  | "PULGADA"
  | "CENTIMETRO"

// ── Auth ──

export interface LoginRequest {
  email: string
  password: string
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
  areaId: number | null
  areaName: string | null
  active?: boolean
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
  sapCode: string
  representatives: RepresentativeInfo[]
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
  destinationWarehouse: number
  paymentMethod: PaymentMethod
  type: PurchaseOrderType
  createdById: string
  items: { productId: number; quantity: number; unitPrice: number }[]
}

// ── Goods Receipt ──

export interface GoodReceiptResponse {
  id: number
  receiptNumber: string
  purchaseOrderId: number
  orderNumber: string
  updatedStatus: "DELIVERED" | "PARTIALLY_DELIVERED"
  receivedAt: string
  notes: string
  items: GoodReceiptItemResponse[]
}

export interface GoodReceiptItemResponse {
  productId: number
  productName: string
  productSku: string
  expectedQuantity: number
  receivedQuantity: number
  difference: number
}

export interface ReceiveGoodsRequest {
  items: { productId: number; receivedQuantity: number }[]
  notes: string
  destinationLocationId: number
}

// ── Warehouse ──

export interface WarehouseResponse {
  id: number
  name: string
  sapCenterCode: string
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
  fromLocationId: number
  toLocationId: number
  quantity: number
  createdById: string
}

export interface AdjustStockRequest {
  productId: number
  locationId: number
  newStock: number
  reason?: string
  createdById: string
}

// ── Category ──

export interface Category {
  id: number
  name: string
  parentCategory?: Category | null
}

// ── Requesting Area ──

export interface RequestingArea {
  id: number
  name: string
  description: string
  costCenter: string
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
  areaId?: number | null
}

// ── Spring Page wrapper ──

export interface Page<T> {
  content: T[]
  totalPages: number
  totalElements: number
  size: number
  number: number
  first: boolean
  last: boolean
  empty: boolean
}
