import { api } from "@/lib/api"
import type {
  PurchaseOrderResponse,
  CreatePurchaseOrderRequest,
  ProductPurchaseOrderSummary,
  Page,
} from "@/lib/types"

export async function fetchOrders(page = 0, size = 50, signal?: AbortSignal): Promise<Page<PurchaseOrderResponse>> {
  return api.get<Page<PurchaseOrderResponse>>(`/api/procurement/orders?page=${page}&size=${size}`, signal)
}

export async function fetchOrdersByProduct(
  productId: number,
  page = 0,
  size = 10,
  signal?: AbortSignal
): Promise<Page<ProductPurchaseOrderSummary>> {
  return api.get<Page<ProductPurchaseOrderSummary>>(
    `/api/procurement/orders/by-product/${productId}?page=${page}&size=${size}`,
    signal
  )
}

export async function fetchOrder(id: number, signal?: AbortSignal): Promise<PurchaseOrderResponse> {
  return api.get<PurchaseOrderResponse>(`/api/procurement/orders/${id}`, signal)
}

export async function createOrder(data: CreatePurchaseOrderRequest): Promise<PurchaseOrderResponse> {
  return api.post<PurchaseOrderResponse>("/api/procurement/orders", data)
}

export async function submitForApproval(id: number): Promise<PurchaseOrderResponse> {
  return api.patch<PurchaseOrderResponse>(`/api/procurement/orders/${id}/submit-for-approval`)
}

export async function approveOrder(id: number, notes?: string): Promise<PurchaseOrderResponse> {
  return api.patch<PurchaseOrderResponse>(`/api/procurement/orders/${id}/approve`, { notes })
}

export async function cancelOrder(id: number, reason?: string): Promise<PurchaseOrderResponse> {
  return api.patch<PurchaseOrderResponse>(`/api/procurement/orders/${id}/cancel`, { reason })
}
