import { api } from "@/lib/api"
import type { KpiStatsDTO, RecentOrderDTO, SpendingStatsDTO, CriticalInventoryItemDTO } from "@/lib/types"

export async function fetchKpis(): Promise<KpiStatsDTO> {
  return api.get<KpiStatsDTO>("/api/dashboard/kpis")
}

export async function fetchRecentOrders(limit = 6): Promise<RecentOrderDTO[]> {
  return api.get<RecentOrderDTO[]>(`/api/dashboard/recent-orders?limit=${limit}`)
}

export async function fetchSpending(): Promise<SpendingStatsDTO> {
  return api.get<SpendingStatsDTO>("/api/dashboard/spending")
}

export async function fetchCriticalInventory(): Promise<CriticalInventoryItemDTO[]> {
  return api.get<CriticalInventoryItemDTO[]>("/api/dashboard/critical-inventory")
}

export async function fetchOverstockInventory(): Promise<CriticalInventoryItemDTO[]> {
  return api.get<CriticalInventoryItemDTO[]>("/api/dashboard/overstock-inventory")
}
