import { api } from "@/lib/api"
import type {
  WarehouseResponse,
  WarehouseDetailResponse,
  WarehouseStockSummary,
  ProductStockBreakdown,
  GoodReceiptResponse,
  ReceiveGoodsRequest,
  CreateWarehouseRequest,
  TransferStockRequest,
  AdjustStockRequest,
  InventoryMovementResponse,
  Page,
} from "@/lib/types"

export async function fetchWarehouses(): Promise<WarehouseResponse[]> {
  const res = await api.get<WarehouseResponse[] | { content: WarehouseResponse[] }>("/api/warehouse")
  if (Array.isArray(res)) return res
  if (res && Array.isArray((res as { content: WarehouseResponse[] }).content)) return (res as { content: WarehouseResponse[] }).content
  return []
}

export async function fetchWarehouseById(id: number): Promise<WarehouseDetailResponse> {
  return api.get<WarehouseDetailResponse>(`/api/warehouse/${id}`)
}

export async function createWarehouse(data: CreateWarehouseRequest): Promise<WarehouseResponse> {
  return api.post<WarehouseResponse>("/api/warehouse", data)
}

export async function updateWarehouse(id: number, data: Partial<CreateWarehouseRequest>): Promise<WarehouseResponse> {
  return api.put<WarehouseResponse>(`/api/warehouse/${id}`, data)
}

export async function fetchStockSummary(): Promise<WarehouseStockSummary[]> {
  return api.get<WarehouseStockSummary[]>("/api/warehouse/stock-summary")
}

export async function fetchProductStockBreakdown(productId: number): Promise<ProductStockBreakdown> {
  return api.get<ProductStockBreakdown>(`/api/warehouse/products/${productId}/stock-breakdown`)
}

export async function receiveGoods(orderId: number, data: ReceiveGoodsRequest): Promise<GoodReceiptResponse> {
  return api.post<GoodReceiptResponse>(`/api/warehouse/orders/${orderId}/receive`, data)
}

export async function transferStock(data: TransferStockRequest): Promise<void> {
  await api.post("/api/warehouse/stock/transfer", data)
}

export async function adjustStock(data: AdjustStockRequest): Promise<void> {
  await api.post("/api/warehouse/stock/adjust", data)
}

export async function fetchMovements(
  page = 0,
  size = 20,
  warehouseId?: number,
  type?: string,
): Promise<Page<InventoryMovementResponse>> {
  let url = `/api/warehouse/movements?page=${page}&size=${size}`
  if (warehouseId) url += `&warehouseId=${warehouseId}`
  if (type) url += `&type=${type}`
  return api.get<Page<InventoryMovementResponse>>(url)
}

export async function fetchReceipts(page = 0, size = 20): Promise<Page<GoodReceiptResponse>> {
  return api.get<Page<GoodReceiptResponse>>(`/api/warehouse/receipts?page=${page}&size=${size}`)
}

export async function fetchReceiptsByOrder(orderId: number): Promise<GoodReceiptResponse[]> {
  return api.get<GoodReceiptResponse[]>(`/api/warehouse/orders/${orderId}/receipts`)
}

export async function fetchReceipt(id: number): Promise<GoodReceiptResponse> {
  return api.get<GoodReceiptResponse>(`/api/warehouse/receipts/${id}`)
}
