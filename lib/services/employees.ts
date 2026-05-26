import { api } from "@/lib/api"
import type { EmployeeDTO, EmployeeRequest, Page } from "@/lib/types"

export async function fetchEmployees(page = 0, size = 50): Promise<Page<EmployeeDTO>> {
  return api.get<Page<EmployeeDTO>>(`/api/employees?page=${page}&size=${size}`)
}

export async function fetchEmployee(id: number): Promise<EmployeeDTO> {
  return api.get<EmployeeDTO>(`/api/employees/${id}`)
}

export async function createEmployee(data: EmployeeRequest): Promise<EmployeeDTO> {
  return api.post<EmployeeDTO>("/api/employees", data)
}

export async function updateEmployee(id: number, data: EmployeeRequest): Promise<EmployeeDTO> {
  return api.put<EmployeeDTO>(`/api/employees/${id}`, data)
}

export async function deactivateEmployee(id: number): Promise<void> {
  await api.patch(`/api/employees/${id}/deactivate`)
}

export async function activateEmployee(id: number): Promise<void> {
  await api.patch(`/api/employees/${id}/activate`)
}
