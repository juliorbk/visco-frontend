"use client"

import { Fragment, useCallback, useEffect, useMemo, useState } from "react"
import {
  ArrowPathIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  EnvelopeIcon,
  NoSymbolIcon,
  PlusIcon,
  XMarkIcon,
  ClockIcon,
  KeyIcon,
  TrashIcon,
} from "@heroicons/react/24/outline"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  createInvite,
  listInvites,
  revokeInvite,
} from "@/lib/services/invites"
import {
  fetchAllCostCenters,
  fetchAllManagements,
  fetchAllGeneralManagements,
} from "@/lib/services/admin"
import type {
  CostCenter,
  CreateInviteRequest,
  InviteTokenDTO,
  ManagementDTO,
  GeneralManagementDTO,
  UserRole,
} from "@/lib/types"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { ROLE_LABELS, ROLE_BADGE } from "@/lib/config/roles"

const ROLES: { value: UserRole; label: string }[] = [
  { value: "WAREHOUSEMAN", label: ROLE_LABELS.WAREHOUSEMAN },
  { value: "PROCUREMENT", label: ROLE_LABELS.PROCUREMENT },
  { value: "MANAGER", label: ROLE_LABELS.MANAGER },
  { value: "ADMIN", label: ROLE_LABELS.ADMIN },
]

const NO_CC = "__none__"
const NO_GG = "__none__"
const NO_MGMT = "__none__"

type Status = "active" | "used" | "expired" | "revoked"

function statusOf(inv: InviteTokenDTO): Status {
  if (inv.revoked) return "revoked"
  if (inv.usedAt) return "used"
  if (new Date(inv.expiresAt).getTime() < Date.now()) return "expired"
  return "active"
}

const STATUS_BADGE: Record<Status, { label: string; className: string }> = {
  active: {
    label: "Activo",
    className: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  },
  used: {
    label: "Usado",
    className: "bg-blue-100 text-blue-700 ring-blue-200",
  },
  expired: {
    label: "Expirado",
    className: "bg-gray-200 text-gray-600 ring-gray-200",
  },
  revoked: {
    label: "Revocado",
    className: "bg-red-100 text-red-700 ring-red-200",
  },
}

export function InviteManager() {
  const [invites, setInvites] = useState<InviteTokenDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [revokingId, setRevokingId] = useState<string | null>(null)
  const [copiedToken, setCopiedToken] = useState<string | null>(null)
  const [filter, setFilter] = useState<"all" | Status>("all")
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Create form state
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<UserRole>("WAREHOUSEMAN")
  const [selectedGgId, setSelectedGgId] = useState<number | null>(null)
  const [selectedMgmtId, setSelectedMgmtId] = useState<number | null>(null)
  const [costCenterId, setCostCenterId] = useState<number | null>(null)
  const [validityDays, setValidityDays] = useState(3)

  // Catalog state
  const [costCenters, setCostCenters] = useState<CostCenter[]>([])
  const [managements, setManagements] = useState<ManagementDTO[]>([])
  const [generalManagements, setGeneralManagements] = useState<GeneralManagementDTO[]>(
    [],
  )

  const loadInvites = useCallback(async () => {
    try {
      setLoading(true)
      const list = await listInvites()
      setInvites(
        [...list].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
      )
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Error al cargar invitaciones",
      )
    } finally {
      setLoading(false)
    }
  }, [])

  const loadCatalogs = useCallback(async () => {
    try {
      const [ccPage, mgmts, ggs] = await Promise.all([
        fetchAllCostCenters(0, 200),
        fetchAllManagements(),
        fetchAllGeneralManagements(),
      ])
      setCostCenters(ccPage.content ?? [])
      setManagements(mgmts)
      setGeneralManagements(ggs)
    } catch {
      // Non-fatal: the form will just show empty selects
    }
  }, [])

  useEffect(() => {
    loadInvites()
    loadCatalogs()
  }, [loadInvites, loadCatalogs])

  const filteredManagements = useMemo(
    () => managements.filter((m) => !selectedGgId || m.generalManagementId === selectedGgId),
    [managements, selectedGgId],
  )

  const filteredCostCenters = useMemo(
    () => costCenters.filter((cc) => !selectedMgmtId || cc.managementId === selectedMgmtId),
    [costCenters, selectedMgmtId],
  )

  const filteredInvites = useMemo(
    () => (filter === "all" ? invites : invites.filter((i) => statusOf(i) === filter)),
    [invites, filter],
  )

  const counts = useMemo(() => {
    const c: Record<"all" | Status, number> = {
      all: invites.length,
      active: 0,
      used: 0,
      expired: 0,
      revoked: 0,
    }
    for (const i of invites) c[statusOf(i)]++
    return c
  }, [invites])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error("Ingresa un correo")
      return
    }
    setSaving(true)
    try {
      const expiresAt = new Date(
        Date.now() + validityDays * 24 * 60 * 60 * 1000,
      ).toISOString()
      const body: CreateInviteRequest = {
        email: email.toLowerCase().trim(),
        role,
        costCenterId,
        expiresAt,
      }
      const created = await createInvite(body)
      toast.success(`Invitación creada para ${created.email}`)
      setEmail("")
      setRole("WAREHOUSEMAN")
      setSelectedGgId(null)
      setSelectedMgmtId(null)
      setCostCenterId(null)
      setValidityDays(3)
      setExpandedId(created.id)
      await loadInvites()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Error al crear invitación",
      )
    } finally {
      setSaving(false)
    }
  }

  const handleRevoke = async (inv: InviteTokenDTO) => {
    if (!confirm(`¿Revocar la invitación para ${inv.email}?`)) return
    setRevokingId(inv.id)
    try {
      await revokeInvite(inv.id)
      toast.success("Invitación revocada")
      await loadInvites()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Error al revocar",
      )
    } finally {
      setRevokingId(null)
    }
  }

  const buildLink = (token: string) => {
    if (typeof window === "undefined") return token
    return `${window.location.origin}/?invite=${token}`
  }

  const handleCopy = async (token: string) => {
    const link = buildLink(token)
    try {
      await navigator.clipboard.writeText(link)
      setCopiedToken(token)
      toast.success("Link copiado al portapapeles")
      setTimeout(() => setCopiedToken(null), 2000)
    } catch {
      // Fallback for older browsers
      const ta = document.createElement("textarea")
      ta.value = link
      document.body.appendChild(ta)
      ta.select()
      try {
        document.execCommand("copy")
        setCopiedToken(token)
        toast.success("Link copiado al portapapeles")
        setTimeout(() => setCopiedToken(null), 2000)
      } catch {
        toast.error("No se pudo copiar. Cópialo manualmente: " + link)
      } finally {
        document.body.removeChild(ta)
      }
    }
  }

  return (
    <div className="space-y-4">
      {/* ── Create form ─────────────────────────────────────────────── */}
      <form
        onSubmit={handleCreate}
        className="rounded-xl border border-border bg-card shadow-xs p-5 space-y-4"
      >
        <div className="flex items-center gap-2">
          <EnvelopeIcon className="size-4 text-[#7b1a1a]" />
          <h3 className="font-serif text-base font-semibold">
            Nueva invitación
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="invite-email">Correo del invitado</Label>
            <Input
              id="invite-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={saving}
              placeholder="usuario@visco.com"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Rol que se le asignará</Label>
            <Select
              value={role}
              onValueChange={(v) => setRole(v as UserRole)}
              disabled={saving}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Centro de costo <span className="text-muted-foreground text-xs">(opcional)</span></Label>
            <div className="space-y-2">
              <Select
                value={selectedGgId ? String(selectedGgId) : NO_GG}
                onValueChange={(v) => {
                  setSelectedGgId(v === NO_GG ? null : Number(v))
                  setSelectedMgmtId(null)
                  setCostCenterId(null)
                }}
                disabled={saving}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Gerencia General…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_GG}>Sin asignar</SelectItem>
                  {generalManagements.map((gg) => (
                    <SelectItem key={gg.id} value={String(gg.id)}>
                      {gg.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedMgmtId ? String(selectedMgmtId) : NO_MGMT}
                onValueChange={(v) => {
                  setSelectedMgmtId(v === NO_MGMT ? null : Number(v))
                  setCostCenterId(null)
                }}
                disabled={saving || !selectedGgId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Gerencia…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_MGMT}>Sin asignar</SelectItem>
                  {filteredManagements.map((m) => (
                    <SelectItem key={m.id} value={String(m.id)}>
                      {m.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={costCenterId ? String(costCenterId) : NO_CC}
                onValueChange={(v) =>
                  setCostCenterId(v === NO_CC ? null : Number(v))
                }
                disabled={saving || !selectedMgmtId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Centro de Costo…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_CC}>Sin asignar</SelectItem>
                  {filteredCostCenters.map((cc) => (
                    <SelectItem key={cc.id} value={String(cc.id)}>
                      {cc.fullDescription}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="invite-validity">Vigencia (días)</Label>
            <Select
              value={String(validityDays)}
              onValueChange={(v) => setValidityDays(Number(v))}
              disabled={saving}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 día</SelectItem>
                <SelectItem value="3">3 días</SelectItem>
                <SelectItem value="7">7 días</SelectItem>
                <SelectItem value="14">14 días</SelectItem>
                <SelectItem value="30">30 días</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            className="bg-[#7b1a1a] hover:bg-[#5c1212] text-white"
            disabled={saving}
          >
            {saving ? (
              <>
                <ArrowPathIcon className="size-4 animate-spin" /> Creando…
              </>
            ) : (
              <>
                <PlusIcon className="size-4" /> Crear invitación
              </>
            )}
          </Button>
        </div>
      </form>

      {/* ── Filter chips ────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap">
        {(
          [
            { key: "all", label: "Todas" },
            { key: "active", label: "Activas" },
            { key: "used", label: "Usadas" },
            { key: "expired", label: "Expiradas" },
            { key: "revoked", label: "Revocadas" },
          ] as { key: "all" | Status; label: string }[]
        ).map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
              filter === f.key
                ? "bg-[#7b1a1a] text-white border-[#7b1a1a]"
                : "bg-card text-muted-foreground border-border hover:text-foreground",
            )}
          >
            {f.label} <span className="ml-1 opacity-70">({counts[f.key]})</span>
          </button>
        ))}
      </div>

      {/* ── List ────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="rounded-xl border border-dashed border-border bg-card/60 p-12 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
          <ArrowPathIcon className="size-5 animate-spin" />
          Cargando invitaciones…
        </div>
      ) : filteredInvites.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/60 p-8 text-center text-sm text-muted-foreground">
          {filter === "all"
            ? "No hay invitaciones todavía. Crea la primera arriba."
            : "No hay invitaciones con ese filtro."}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-muted-foreground bg-[#fafafa]">
                  <th className="text-left font-medium px-5 py-3">Email</th>
                  <th className="text-left font-medium px-5 py-3">Rol</th>
                  <th className="text-left font-medium px-5 py-3">Estado</th>
                  <th className="text-left font-medium px-5 py-3">Expira</th>
                  <th className="text-left font-medium px-5 py-3">Link</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvites.map((inv) => {
                  const s = statusOf(inv)
                  const sb = STATUS_BADGE[s]
                  const isExpanded = expandedId === inv.id
                  const isCopied = copiedToken === inv.token
                  return (
                    <Fragment key={inv.id}>
                      <tr
                        onClick={() =>
                          setExpandedId(isExpanded ? null : inv.id)
                        }
                        className={cn(
                          "border-t border-border cursor-pointer hover:bg-[#fafafa] transition-colors",
                          isExpanded && "bg-[#fafafa]",
                          s !== "active" && "opacity-70",
                        )}
                      >
                        <td className="px-5 py-3 font-medium text-foreground">
                          {inv.email}
                        </td>
                        <td className="px-5 py-3">
                          <Badge
                            className={ROLE_BADGE[inv.intendedRole] ?? "bg-gray-100 text-gray-700"}
                          >
                            {ROLE_LABELS[inv.intendedRole]}
                          </Badge>
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1",
                              sb.className,
                            )}
                          >
                            {sb.label}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-muted-foreground text-xs whitespace-nowrap">
                          <ClockIcon className="inline size-3 mr-1" />
                          {new Date(inv.expiresAt).toLocaleDateString("es-ES", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-5 py-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCopy(inv.token)
                            }}
                            disabled={s !== "active"}
                          >
                            {isCopied ? (
                              <>
                                <CheckIcon className="size-3.5" /> Copiado
                              </>
                            ) : (
                              <>
                                <ClipboardDocumentIcon className="size-3.5" /> Copiar link
                              </>
                            )}
                          </Button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="border-t border-border bg-[#fafafa]">
                          <td colSpan={5} className="px-5 py-4">
                            <div className="space-y-2 text-xs">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <KeyIcon className="size-3.5" />
                                <span className="font-mono break-all">
                                  {buildLink(inv.token)}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-muted-foreground">
                                <span>
                                  Creada:{" "}
                                  {new Date(inv.createdAt).toLocaleString("es-ES")}
                                </span>
                                {inv.usedAt && (
                                  <span>
                                    Usada:{" "}
                                    {new Date(inv.usedAt).toLocaleString("es-ES")}
                                  </span>
                                )}
                              </div>
                              {s === "active" && (
                                <div className="flex justify-end pt-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-xs text-red-600 hover:text-red-700"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleRevoke(inv)
                                    }}
                                    disabled={revokingId === inv.id}
                                  >
                                    {revokingId === inv.id ? (
                                      <ArrowPathIcon className="size-3.5 animate-spin" />
                                    ) : (
                                      <TrashIcon className="size-3.5" />
                                    )}
                                    Revocar invitación
                                  </Button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
