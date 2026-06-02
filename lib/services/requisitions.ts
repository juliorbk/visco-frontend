import { api } from "@/lib/api"
import type { RequisitionResponse, CreateRequisitionRequest, Page, CostCenter } from "@/lib/types"

export async function fetchRequisitions(
  page = 0,
  size = 20,
  status?: string,
  signal?: AbortSignal
): Promise<Page<RequisitionResponse>> {
  const params = new URLSearchParams({ page: String(page), size: String(size) })
  if (status) params.set("status", status)
  return api.get<Page<RequisitionResponse>>(`/api/requisitions?${params}`, signal)
}

export async function fetchRequisition(id: number): Promise<RequisitionResponse> {
  return api.get<RequisitionResponse>(`/api/requisitions/${id}`)
}

export async function createRequisition(
  data: CreateRequisitionRequest
): Promise<RequisitionResponse> {
  return api.post<RequisitionResponse>("/api/requisitions", data)
}

export async function submitRequisitionForApproval(
  id: number
): Promise<RequisitionResponse> {
  return api.patch<RequisitionResponse>(`/api/requisitions/${id}/submit`)
}

export async function approveRequisition(
  id: number,
  userId: string,
  notes?: string
): Promise<RequisitionResponse> {
  return api.patch<RequisitionResponse>(`/api/requisitions/${id}/approve`, { userId, notes })
}

export async function rejectRequisition(
  id: number,
  userId: string,
  reason?: string
): Promise<RequisitionResponse> {
  return api.patch<RequisitionResponse>(`/api/requisitions/${id}/reject`, { userId, reason })
}

export async function cancelRequisition(id: number): Promise<RequisitionResponse> {
  return api.patch<RequisitionResponse>(`/api/requisitions/${id}/cancel`)
}

export async function markRequisitionAsConverted(
  id: number
): Promise<RequisitionResponse> {
  return api.patch<RequisitionResponse>(`/api/requisitions/${id}/convert`)
}

export async function fetchCostCenters(): Promise<CostCenter[]> {
  return api.get<CostCenter[]>("/api/cost-centers/all")
}
