import { api } from "@/lib/api"
import type { RequestingArea, Page } from "@/lib/types"

export async function fetchAreas(page = 0, size = 50): Promise<Page<RequestingArea>> {
  return api.get<Page<RequestingArea>>(`/api/requesting-areas?page=${page}&size=${size}`)
}

export async function fetchArea(id: number): Promise<RequestingArea> {
  return api.get<RequestingArea>(`/api/requesting-areas/${id}`)
}

export async function createArea(data: Partial<RequestingArea>): Promise<RequestingArea> {
  return api.post<RequestingArea>("/api/requesting-areas", data)
}

export async function updateArea(id: number, data: Partial<RequestingArea>): Promise<RequestingArea> {
  return api.put<RequestingArea>(`/api/requesting-areas/${id}`, data)
}

export async function deactivateArea(id: number): Promise<void> {
  await api.delete(`/api/requesting-areas/${id}`)
}

export async function activateArea(id: number): Promise<void> {
  await api.patch(`/api/requesting-areas/${id}/activate`)
}
