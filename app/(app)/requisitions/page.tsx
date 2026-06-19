"use client"

import { useEffect, useState } from "react"
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
import { fetchRequisition, fetchRequisitions } from "@/lib/services/requisitions"
import { fetchCostCenters } from "@/lib/services/requisitions"
import type { RequisitionResponse, Page, CostCenter } from "@/lib/types"
import { PlusIcon, ArrowPathIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline"
import { cn, getCostCenterDisplay } from "@/lib/utils"
import { useDebounce } from "@/hooks/use-debounce"
import { useQuery } from "@/hooks/use-query"
import { toast } from "sonner"

const STATUS_FILTERS = [
  { value: "all", label: "Todos" },
  { value: "PENDING", label: "Pendientes" },
  { value: "AWAITING_APPROVAL", label: "Esperando Aprobación" },
  { value: "APPROVED", label: "Aprobadas" },
  { value: "PARTIALLY_CONVERTED", label: "Adjudicación Parcial" },
  { value: "REJECTED", label: "Rechazadas" },
  { value: "CONVERTED", label: "Convertidas" },
  { value: "CANCELLED", label: "Canceladas" },
]

export default function RequisitionsPage() {
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [page, setPage] = useState(0)
  const [statusFilter, setStatusFilter] = useState("all")
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 300)
  const [convertRequisition, setConvertRequisition] = useState<RequisitionResponse | null>(null)
  const [poModalOpen, setPoModalOpen] = useState(false)
  const [costCenters, setCostCenters] = useState<CostCenter[]>([])

  useEffect(() => {
    fetchCostCenters().then(setCostCenters).catch(() => {})
  }, [])

  const { data: pageData, isLoading, error, refetch } = useQuery<Page<RequisitionResponse>>(
    (signal) =>
      fetchRequisitions(
        page,
        30,
        statusFilter !== "all" ? statusFilter : undefined,
        signal,
        debouncedSearch,
      ),
    [page, statusFilter, debouncedSearch],
  )

  const requisitions = pageData?.content ?? []

  useEffect(() => {
    if (!pageData) return
    setSelectedId((prev) =>
      prev && pageData.content.find((r) => r.id === prev) ? prev : pageData.content[0]?.id ?? null,
    )
  }, [pageData])

  useEffect(() => {
    if (error) {
      toast.error(error.message)
    }
  }, [error])

  useEffect(() => {
    setPage(0)
  }, [statusFilter, debouncedSearch])

  const selected = requisitions.find((r) => r.id === selectedId) ?? null

  const ccByArea = new Map(costCenters.map((cc) => [cc.fullDescription, cc]))

  const handleConvert = async (req: RequisitionResponse) => {
    // Refetch the single requisition so the modal gets the enriched
    // view with per-line awarded/pending quantities (the list endpoint
    // is paged and doesn't include them).
    try {
      const detail = await fetchRequisition(req.id)
      setConvertRequisition(detail)
    } catch {
      // Fallback to the list-view row if the refetch fails — the modal
      // will still work, it just won't show the per-line progress.
      setConvertRequisition(req)
    }
    setPoModalOpen(true)
  }

  const handlePoCreated = () => {
    setPoModalOpen(false)
    setConvertRequisition(null)
    refetch()
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
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-10 text-center">
                        <ArrowPathIcon className="size-5 animate-spin mx-auto" />
                      </td>
                    </tr>
                  ) : requisitions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-10 text-center text-sm text-muted-foreground">
                        No se encontraron requisiciones.
                      </td>
                    </tr>
                  ) : (
                    requisitions.map((r) => (
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
                        <td className="px-5 py-3 text-muted-foreground">
                          {(() => {
                            const cc = ccByArea.get(r.areaName) ?? null
                            const display = getCostCenterDisplay(cc)
                            return (
                              <div>
                                <div>{display.primary}</div>
                                {display.secondary && (
                                  <div className="text-xs text-muted-foreground/70">{display.secondary}</div>
                                )}
                              </div>
                            )
                          })()}
                        </td>
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
            onUpdate={refetch}
            onConvert={handleConvert}
            ccByArea={ccByArea}
          />
        </div>
      </div>

      <CreateRequisitionModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={refetch}
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
