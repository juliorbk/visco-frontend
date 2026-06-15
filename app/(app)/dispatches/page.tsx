"use client"

import { useEffect, useState } from "react"
import { PlusIcon, ArrowPathIcon } from "@heroicons/react/24/outline"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/visco/page-header"
import { DispatchesTable } from "@/components/visco/dispatches/dispatches-table"
import { DispatchDetailPanel } from "@/components/visco/dispatches/dispatch-detail-panel"
import { NuevoDespachoModal } from "@/components/visco/dispatches/nuevo-despacho-modal"
import { useQuery } from "@/hooks/use-query"
import { api } from "@/lib/api"
import { fetchCostCenters } from "@/lib/services/requisitions"
import { useDebounce } from "@/hooks/use-debounce"
import type { CostCenter, DispatchResponse, Page } from "@/lib/types"
import { toast } from "sonner"

const PAGE_SIZE = 6

export default function DispatchesPage() {
  const [selectedDispatch, setSelectedDispatch] = useState<DispatchResponse | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 300)

  const { data: costCenters = [] } = useQuery<CostCenter[]>(
    () => fetchCostCenters(),
    []
  )

  const {
    data: dispatchesData,
    isLoading: loading,
    error,
    refetch,
  } = useQuery<Page<DispatchResponse>>(
    (signal) => api.get(`/api/warehouse/dispatches?page=${page}&size=${PAGE_SIZE}&search=${debouncedSearch}`, signal),
    [page, debouncedSearch]
  )

  const dispatches = dispatchesData?.content ?? []
  const totalPages = dispatchesData?.page.totalPages ?? 1

  useEffect(() => {
    if (error) toast.error("Error al cargar despachos")
  }, [error])

  useEffect(() => {
    setPage(0)
  }, [debouncedSearch])

  useEffect(() => {
    if (page === 0) setSelectedDispatch(null)
  }, [page])

  const handleNewDispatch = async () => {
    refetch()
    setIsModalOpen(false)
  }

  return (
    <div>
      <PageHeader
        title="Despachos"
        subtitle="Registra y consulta las notas de despacho (salida de mercancía del almacén)."
        actions={
          <Button size="sm" onClick={() => setIsModalOpen(true)}>
            <PlusIcon className="size-4" /> Nuevo Despacho
          </Button>
        }
      />

      {loading ? (
        <div className="flex justify-center py-20">
          <ArrowPathIcon className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <DispatchesTable
              dispatches={dispatches}
              onSelectDispatch={setSelectedDispatch}
              selectedDispatchId={selectedDispatch?.id}
              searchQuery={search}
              onSearchChange={setSearch}
              currentPage={page + 1}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p - 1)}
            />
          </div>
          <div className="lg:col-span-1">
            {selectedDispatch ? (
              <DispatchDetailPanel
                dispatch={selectedDispatch}
                onClose={() => setSelectedDispatch(null)}
                costCenters={costCenters}
              />
            ) : (
              <div className="bg-white rounded-lg border border-[#f3f4f6] p-8 text-center">
                <p className="text-[#6b7280] text-sm">
                  Selecciona un despacho de la tabla para ver los detalles
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <NuevoDespachoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleNewDispatch}
      />
    </div>
  )
}
