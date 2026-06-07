import { api } from "@/lib/api"
import type { SupplierDTO, SupplierPerformanceMonthlyDTO, SupplierCategoryDTO, Page } from "@/lib/types"

export async function fetchSuppliers(
  page = 0,
  size = 50,
  search?: string,
): Promise<Page<SupplierDTO>> {
  const params = new URLSearchParams({ page: String(page), size: String(size) })
  if (search && search.trim()) params.set("search", search.trim())
  return api.get<Page<SupplierDTO>>(`/api/suppliers?${params.toString()}`)
}

export async function fetchSupplier(id: number): Promise<SupplierDTO> {
  return api.get<SupplierDTO>(`/api/suppliers/${id}`)
}

export async function fetchSuppliersByCategory(
  categoryId: number,
  page = 0,
  size = 50,
  search?: string,
): Promise<Page<SupplierDTO>> {
  const params = new URLSearchParams({ page: String(page), size: String(size) })
  if (search && search.trim()) params.set("search", search.trim())
  return api.get<Page<SupplierDTO>>(
    `/api/suppliers/category/${categoryId}?${params.toString()}`,
  )
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

// ── Supplier categories ──

export async function fetchSupplierCategories(
  page = 0,
  size = 200,
): Promise<Page<SupplierCategoryDTO>> {
  return api.get<Page<SupplierCategoryDTO>>(
    `/api/supplier-categories?page=${page}&size=${size}`,
  )
}

export async function fetchActiveSupplierCategories(
  page = 0,
  size = 200,
): Promise<Page<SupplierCategoryDTO>> {
  return api.get<Page<SupplierCategoryDTO>>(
    `/api/supplier-categories/active?page=${page}&size=${size}`,
  )
}

export async function createSupplierCategory(
  body: { name: string; description?: string; icon?: string; color?: string },
): Promise<SupplierCategoryDTO> {
  return api.post<SupplierCategoryDTO>("/api/supplier-categories", body)
}

export async function updateSupplierCategory(
  id: number,
  body: Partial<Pick<SupplierCategoryDTO, "name" | "description" | "active" | "icon" | "color">>,
): Promise<SupplierCategoryDTO> {
  return api.put<SupplierCategoryDTO>(`/api/supplier-categories/${id}`, body)
}

export async function deactivateSupplierCategory(id: number): Promise<void> {
  await api.delete(`/api/supplier-categories/${id}`)
}

export async function activateSupplierCategory(id: number): Promise<void> {
  await api.patch(`/api/supplier-categories/${id}/activate`)
}
