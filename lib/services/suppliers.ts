import { api } from "@/lib/api"
import type { SupplierDTO, SupplierPerformanceMonthlyDTO, Page } from "@/lib/types"

export async function fetchSuppliers(page = 0, size = 50): Promise<Page<SupplierDTO>> {
  return api.get<Page<SupplierDTO>>(`/api/suppliers?page=${page}&size=${size}`)
}

export async function fetchSupplier(id: number): Promise<SupplierDTO> {
  return api.get<SupplierDTO>(`/api/suppliers/${id}`)
}

export async function createSupplier(data: Partial<SupplierDTO>): Promise<SupplierDTO> {
  return api.post<SupplierDTO>("/api/suppliers", data)
}

export async function updateSupplier(id: number, data: Partial<SupplierDTO>): Promise<SupplierDTO> {
  return api.put<SupplierDTO>(`/api/suppliers/${id}`, data)
}

export async function deactivateSupplier(id: number): Promise<void> {
  await api.delete(`/api/suppliers/${id}`)
}

export async function activateSupplier(id: number): Promise<void> {
  await api.patch(`/api/suppliers/${id}/activate`)
}

export async function fetchSupplierPerformance(months = 7): Promise<SupplierPerformanceMonthlyDTO[]> {
  return api.get<SupplierPerformanceMonthlyDTO[]>(`/api/suppliers/performance?months=${months}`)
}
