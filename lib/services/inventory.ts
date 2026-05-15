import { api } from "@/lib/api"
import type { ProductDTO, Page } from "@/lib/types"

export async function fetchProducts(page = 0, size = 50): Promise<Page<ProductDTO>> {
  return api.get<Page<ProductDTO>>(`/api/inventory/products?page=${page}&size=${size}`)
}

export async function fetchProduct(id: number): Promise<ProductDTO> {
  return api.get<ProductDTO>(`/api/inventory/products/${id}`)
}

export async function createProduct(data: Partial<ProductDTO>): Promise<ProductDTO> {
  return api.post<ProductDTO>("/api/inventory/products", data)
}

export async function updateProduct(id: number, data: Partial<ProductDTO>): Promise<ProductDTO> {
  return api.put<ProductDTO>(`/api/inventory/products/${id}`, data)
}

export async function deleteProduct(id: number): Promise<void> {
  await api.delete(`/api/inventory/products/${id}`)
}
