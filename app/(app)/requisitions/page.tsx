"use client"

import { useCallback, useEffect, useState } from "react"
import { PageHeader } from "@/components/visco/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { OrderStatusBadge } from "@/components/visco/status-badge"
import { CreateRequisitionModal } from "@/components/visco/requisitions/create-requisition-modal"
import { RequisitionDetail } from "@/components/visco/requisitions/requisition-detail"
import { RequisitionStepper } from "@/components/visco/requisitions/requisition-stepper"
import { CreatePOModal } from "@/components/visco/procurement/create-po-modal"
import { fetchRequisitions } from "@/lib/services/requisitions"
import type { RequisitionResponse, Page } from "@/lib/types"
import { PlusIcon, ArrowPathIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const STATUS_FILTERS = [
  { value: "all", label: "Todos" },
  { value: "PENDING", label: "Pendientes" },
  { value: "AWAITING_APPROVAL", label: "Esperando Aprobación" },
  { value: "APPROVED", label: "Aprobadas" },
  { value: "REJECTED", label: "Rechazadas" },
  { value: "CONVERTED", label: "Convertidas" },
  { value: "CANCELLED", label: "Canceladas" },
]

export default function RequisitionsPage() {
  const [pageData, setPageData] = useState<Page<RequisitionResponse> | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [page, setPage] = useState(0)
  const [statusFilter, setStatusFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [convertRequisition, setConvertRequisition] = useState<RequisitionResponse | null>(null)
  const [poModalOpen, setPoModalOpen] = useState(false)

  const requisitions = pageData?.content ?? []

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true)
      const res = await fetchRequisitions(page, 30, statusFilter !== "all" ? statusFilter : undefined, signal)
      if (!signal?.aborted) {
        setPageData(res)
        setSelectedId((prev) =>
          prev && res.content.find((r) => r.id === prev) ? prev : res.content[0]?.id ?? null,
        )
      }
    } catch (err) {
      if (!signal?.aborted) {
        toast.error(err instanceof Error ? err.message : "Error al cargar requisiciones")
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false)
      }
    }
  }, [page, statusFilter])

  useEffect(() => {
    const controller = new AbortController()
    load(controller.signal)
    return () => controller.abort()
  }, [load])

  useEffect(() => {
    setPage(0)
  }, [statusFilter])

  const filtered = search
    ? requisitions.filter(
        (r) =>
          r.requisitionNumber.toLowerCase().includes(search.toLowerCase()) ||
          r.description.toLowerCase().includes(search.toLowerCase()) ||
          r.requestedBy.toLowerCase().includes(search.toLowerCase()),
      )
    : requisitions

  const selected = requisitions.find((r) => r.id === selectedId) ?? null

  const handleConvert = (req: RequisitionResponse) => {
    setConvertRequisition(req)
    setPoModalOpen(true)
  }

  const handlePoCreated = () => {
    setPoModalOpen(false)
    setConvertRequisition(null)
    load()
  }

  return (
    <div>
      <PageHeader
        title="Requisiciones"
        subtitle="Crea, aprueba y monitorea las solicitudes de compra de materiales y servicios."
        actions={
          <Button
            size="sm"
            className="bg-[#7b1a1a] hover:bg-[#5c1212] text-white"
            onClick={() => setCreateOpen(true)}
          >
            <PlusIcon className="size-4" /> Nueva Requisición
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por número, descripción o solicitante…"
            className="pl-9 bg-card"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map((sf) => (
              <SelectItem key={sf.value} value={sf.value}>
                {sf.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mb-4">
        <RequisitionStepper status={selected?.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-semibold">Listado de Requisiciones</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {pageData?.page.totalElements ?? 0} requisiciones en el sistema
                </p>
              </div>
            </div>
            <div className="overflow-x-auto min-h-[300px]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wider text-muted-foreground bg-[#fafafa]">
                    <th className="text-left font-medium px-5 py-3">Número</th>
                    <th className="text-left font-medium px-5 py-3">Solicitante</th>
                    <th className="text-left font-medium px-5 py-3">Centro de Costo</th>
                    <th className="text-left font-medium px-5 py-3">Estado</th>
                    <th className="text-left font-medium px-5 py-3">Creada</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-10 text-center">
                        <ArrowPathIcon className="size-5 animate-spin mx-auto" />
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-10 text-center text-sm text-muted-foreground">
                        No se encontraron requisiciones.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((r) => (
                      <tr
                        key={r.id}
                        onClick={() => setSelectedId(r.id)}
                        className={cn(
                          "border-t border-border cursor-pointer",
                          selectedId === r.id ? "bg-[#fde8e8]/40" : "hover:bg-[#fafafa]",
                        )}
                      >
                        <td className="px-5 py-3">
                          <span className="font-medium text-[#7b1a1a]">{r.requisitionNumber}</span>
                        </td>
                        <td className="px-5 py-3 text-foreground">{r.requestedBy}</td>
                        <td className="px-5 py-3 text-muted-foreground">{r.areaName}</td>
                        <td className="px-5 py-3">
                          <OrderStatusBadge status={r.status} />
                        </td>
                        <td className="px-5 py-3 text-muted-foreground">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {pageData && pageData.page.totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-border text-sm">
                <button
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                >
                  Anterior
                </button>
                <span className="text-xs text-muted-foreground">
                  Página {pageData.page.number + 1} de {pageData.page.totalPages}
                </span>
                <button
                  disabled={page >= pageData.page.totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                >
                  Siguiente
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <RequisitionDetail
            requisition={selected}
            onUpdate={load}
            onConvert={handleConvert}
          />
        </div>
      </div>

      <CreateRequisitionModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={load}
      />

      <CreatePOModal
        open={poModalOpen}
        onOpenChange={(o) => {
          setPoModalOpen(o)
          if (!o) setConvertRequisition(null)
        }}
        onCreated={handlePoCreated}
        prefillFromRequisition={convertRequisition}
      />
    </div>
  )
}
