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
  PurchaseOrderReceiptSummary,
  ProductOnStock,
  DispatchRequest,
  DispatchResponse,
  LocationDTO,
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
  productId?: number,
): Promise<Page<InventoryMovementResponse>> {
  let url = `/api/warehouse/movements?page=${page}&size=${size}`
  if (warehouseId) url += `&warehouseId=${warehouseId}`
  if (type) url += `&type=${type}`
  if (productId) url += `&productId=${productId}`
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

export async function fetchReceiptSummary(orderId: number): Promise<PurchaseOrderReceiptSummary> {
  return api.get<PurchaseOrderReceiptSummary>(`/api/warehouse/orders/${orderId}/receipt-summary`)
}

export async function fetchWarehouseProducts(
  warehouseId: number,
  search?: string,
  page = 0,
  size = 20,
): Promise<Page<ProductOnStock>> {
  let url = `/api/warehouse/${warehouseId}/products?page=${page}&size=${size}`
  if (search) url += `&search=${encodeURIComponent(search)}`
  return api.get<Page<ProductOnStock>>(url)
}

export async function fetchProductsOnStock(
  warehouseId: number,
  search?: string,
  page = 0,
  size = 200,
): Promise<Page<ProductOnStock>> {
  let url = `/api/warehouse/stock/on-stock?warehouseId=${warehouseId}&page=${page}&size=${size}`
  if (search) url += `&search=${encodeURIComponent(search)}`
  return api.get<Page<ProductOnStock>>(url)
}

export async function exportMovements(
  warehouseId?: number,
  type?: string,
  productId?: number,
): Promise<void> {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL 
  let url = `${BASE_URL}/api/warehouse/movements/export?`
  if (warehouseId) url += `warehouseId=${warehouseId}&`
  if (type) url += `type=${type}&`
  if (productId) url += `productId=${productId}&`

  const res = await fetch(url, { credentials: "include" })
  if (!res.ok) throw new Error("Error al exportar movimientos")

  const blob = await res.blob()
  const downloadUrl = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = downloadUrl
  a.download = `stock-movements-${new Date().toISOString().split("T")[0]}.csv`
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.URL.revokeObjectURL(downloadUrl)
}

export async function createDispatch(data: DispatchRequest): Promise<DispatchResponse> {
  return api.post<DispatchResponse>("/api/warehouse/dispatch", data)
}

export async function fetchDispatches(page = 0, size = 20): Promise<Page<DispatchResponse>> {
  return api.get<Page<DispatchResponse>>(`/api/warehouse/dispatches?page=${page}&size=${size}`)
}

export async function fetchDispatchById(id: number): Promise<DispatchResponse> {
  return api.get<DispatchResponse>(`/api/warehouse/dispatches/${id}`)
}

export async function fetchLocationsByWarehouse(
  warehouseId: number,
  search?: string,
  page = 0,
  size = 20,
): Promise<Page<LocationDTO>> {
  let url = `/api/warehouse/locations/warehouse/${warehouseId}?page=${page}&size=${size}`
  if (search) url += `&search=${encodeURIComponent(search)}`
  return api.get<Page<LocationDTO>>(url)
}
