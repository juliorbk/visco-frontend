import { api } from "@/lib/api"
import type { PurchaseOrderResponse, CreatePurchaseOrderRequest, Page } from "@/lib/types"

export async function fetchOrders(page = 0, size = 50): Promise<Page<PurchaseOrderResponse>> {
  return api.get<Page<PurchaseOrderResponse>>(`/api/procurement/orders?page=${page}&size=${size}`)
}

export async function fetchOrder(id: number): Promise<PurchaseOrderResponse> {
  return api.get<PurchaseOrderResponse>(`/api/procurement/orders/${id}`)
}

export async function createOrder(data: CreatePurchaseOrderRequest): Promise<PurchaseOrderResponse> {
  return api.post<PurchaseOrderResponse>("/api/procurement/orders", data)
}

export async function approveOrder(id: number, userId: string, notes?: string): Promise<PurchaseOrderResponse> {
  return api.patch<PurchaseOrderResponse>(`/api/procurement/orders/${id}/approve`, { userId, notes })
}

export async function cancelOrder(id: number, reason?: string): Promise<PurchaseOrderResponse> {
  return api.patch<PurchaseOrderResponse>(`/api/procurement/orders/${id}/cancel`, { reason })
}
