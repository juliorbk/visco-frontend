import { api } from "@/lib/api"
import type { SupplierDTO, SupplierPerformanceMonthlyDTO, Page } from "@/lib/types"

export async function fetchSuppliers(page = 0, size = 50): Promise<Page<SupplierDTO>> {
  return api.get<Page<SupplierDTO>>(`/api/suppliers?page=${page}&size=${size}`)
}

export async function fetchSupplier(id: number): Promise<SupplierDTO> {
  return api.get<SupplierDTO>(`/api/suppliers/${id}`)
}

export async function createSupplier(body: Partial<SupplierDTO>): Promise<SupplierDTO> {
  const { contactEmail, ...rest } = body
  return api.post<SupplierDTO>("/api/suppliers", { ...rest, email: contactEmail })
}

export async function updateSupplier(id: number, body: Partial<SupplierDTO>): Promise<SupplierDTO> {
  const { contactEmail, ...rest } = body
  return api.put<SupplierDTO>(`/api/suppliers/${id}`, { ...rest, email: contactEmail })
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
