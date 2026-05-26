import { api } from "@/lib/api"
import type {
  UserDTO,
  UpdateUserRequest,
  Page,
  CostCenter,
  ManagementDTO,
  GeneralManagementDTO,
} from "@/lib/types"

export async function fetchUsers(page = 0, size = 50): Promise<Page<UserDTO>> {
  return api.get<Page<UserDTO>>(`/api/users?page=${page}&size=${size}`)
}
export async function fetchAllCostCenters(page = 0, size = 50): Promise<Page<CostCenter>> {
  return api.get<Page<CostCenter>>(`/api/cost-centers?page=${page}&size=${size}`)
}

export async function fetchUser(id: string): Promise<UserDTO> {
  return api.get<UserDTO>(`/api/users/${id}`)
}

export async function updateUser(id: string, data: UpdateUserRequest): Promise<UserDTO> {
  return api.put<UserDTO>(`/api/users/${id}`, data)
}

export async function deactivateUser(id: string): Promise<void> {
  await api.patch(`/api/users/${id}/deactivate`)
}

export async function activateUser(id: string): Promise<void> {
  await api.patch(`/api/users/${id}/activate`)
}

export async function fetchAllManagements(): Promise<ManagementDTO[]> {
  return api.get<ManagementDTO[]>("/api/management")
}

export async function fetchAllGeneralManagements(): Promise<GeneralManagementDTO[]> {
  return api.get<GeneralManagementDTO[]>("/api/general-management")
}
