import { api } from "@/lib/api"
import type { Category, Page } from "@/lib/types"

export async function fetchCategories(page = 0, size = 50): Promise<Page<Category>> {
  return api.get<Page<Category>>(`/api/inventory/categories?page=${page}&size=${size}`)
}

export async function fetchCategory(id: number): Promise<Category> {
  return api.get<Category>(`/api/inventory/categories/${id}`)
}

export async function createCategory(data: Partial<Category>): Promise<Category> {
  return api.post<Category>("/api/inventory/categories", data)
}

export async function updateCategory(id: number, data: Partial<Category>): Promise<Category> {
  return api.put<Category>(`/api/inventory/categories/${id}`, data)
}

export async function deleteCategory(id: number): Promise<void> {
  await api.delete(`/api/inventory/categories/${id}`)
}
