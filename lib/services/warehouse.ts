import { api } from "@/lib/api"
import type {
  WarehouseResponse,
  WarehouseStockSummary,
  ProductStockBreakdown,
  GoodReceiptResponse,
  ReceiveGoodsRequest,
  Page,
} from "@/lib/types"

export async function fetchWarehouses(): Promise<WarehouseResponse[]> {
  return api.get<WarehouseResponse[]>("/api/warehouse")
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

export async function fetchReceipts(page = 0, size = 20): Promise<Page<GoodReceiptResponse>> {
  return api.get<Page<GoodReceiptResponse>>(`/api/warehouse/receipts?page=${page}&size=${size}`)
}

export async function fetchReceiptsByOrder(orderId: number): Promise<GoodReceiptResponse[]> {
  return api.get<GoodReceiptResponse[]>(`/api/warehouse/orders/${orderId}/receipts`)
}

export async function fetchReceipt(id: number): Promise<GoodReceiptResponse> {
  return api.get<GoodReceiptResponse>(`/api/warehouse/receipts/${id}`)
}
