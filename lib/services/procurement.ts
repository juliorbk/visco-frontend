import { api } from "@/lib/api"
import type { PurchaseOrderResponse, CreatePurchaseOrderRequest } from "@/lib/types"

export async function fetchOrders(): Promise<PurchaseOrderResponse[]> {
  return api.get<PurchaseOrderResponse[]>("/api/procurement/orders")
}

export async function fetchOrder(id: number): Promise<PurchaseOrderResponse> {
  return api.get<PurchaseOrderResponse>(`/api/procurement/orders/${id}`)
}

export async function createOrder(data: CreatePurchaseOrderRequest): Promise<PurchaseOrderResponse> {
  return api.post<PurchaseOrderResponse>("/api/procurement/orders", data)
}

export async function approveOrder(id: number): Promise<PurchaseOrderResponse> {
  return api.patch<PurchaseOrderResponse>(`/api/procurement/orders/${id}/approve`)
}

export async function cancelOrder(id: number): Promise<PurchaseOrderResponse> {
  return api.patch<PurchaseOrderResponse>(`/api/procurement/orders/${id}/cancel`)
}
