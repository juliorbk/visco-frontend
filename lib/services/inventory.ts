import { api } from "@/lib/api"
import type { ProductDTO, Page } from "@/lib/types"

export async function fetchProducts(
  page = 0,
  size = 20,
  search?: string,
  category?: string,
  sortBy?: string,
  sortDir?: string,
  hasStock?: boolean,
  signal?: AbortSignal
): Promise<Page<ProductDTO>> {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  })

  if (search) params.append("search", search)
  if (category && category !== "all") params.append("category", category)
  if (sortBy && sortBy !== "none") {
    params.append("sortBy", sortBy)
    if (sortDir) params.append("sortDir", sortDir)
  }
  if (hasStock) params.append("hasStock", "true")

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