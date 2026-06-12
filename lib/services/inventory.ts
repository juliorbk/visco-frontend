import { api } from "@/lib/api"
import type { ProductDTO, Page } from "@/lib/types"

export interface ProductFilters {
  name?: string
  sapCode?: string
  sku?: string
  category?: string
  sortBy?: string
  sortDir?: string
  hasStock?: boolean
}

export async function fetchProducts(
  page = 0,
  size = 20,
  filters: ProductFilters = {},
  signal?: AbortSignal
): Promise<Page<ProductDTO>> {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  })

  if (filters.name) params.append("name", filters.name)
  if (filters.sapCode) params.append("sapCode", filters.sapCode)
  if (filters.sku) params.append("sku", filters.sku)
  if (filters.category && filters.category !== "all")
    params.append("category", filters.category)
  if (filters.sortBy && filters.sortBy !== "none") {
    params.append("sortBy", filters.sortBy)
    if (filters.sortDir) params.append("sortDir", filters.sortDir)
  }
  if (filters.hasStock) params.append("hasStock", "true")

  return api.get<Page<ProductDTO>>(
    `/api/inventory/products?${params.toString()}`,
    signal
  )
}

export async function fetchProduct(id: number): Promise<ProductDTO> {
  return api.get<ProductDTO>(`/api/inventory/products/${id}`)
}

export async function createProduct(
  data: Partial<ProductDTO>
): Promise<ProductDTO> {
  return api.post<ProductDTO>("/api/inventory/products", data)
}

export async function updateProduct(
  id: number,
  data: Partial<ProductDTO>
): Promise<ProductDTO> {
  return api.put<ProductDTO>(`/api/inventory/products/${id}`, data)
}

export async function deleteProduct(id: number): Promise<void> {
  await api.delete(`/api/inventory/products/${id}`)
}
