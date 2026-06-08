import { api } from "@/lib/api"
import type { CreateInviteRequest, InviteTokenDTO } from "@/lib/types"

export async function createInvite(body: CreateInviteRequest): Promise<InviteTokenDTO> {
  return api.post<InviteTokenDTO>("/api/invites", body)
}

export async function listInvites(): Promise<InviteTokenDTO[]> {
  return api.get<InviteTokenDTO[]>("/api/invites")
}

export async function revokeInvite(id: string): Promise<InviteTokenDTO> {
  return api.delete<InviteTokenDTO>(`/api/invites/${id}`)
}

export async function resolveInvite(token: string): Promise<InviteTokenDTO> {
  return api.get<InviteTokenDTO>(`/api/invites/by-token/${token}`, undefined, true)
}
