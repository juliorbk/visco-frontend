"use client"

import { useCallback, useEffect, useState } from "react"
import { PlusIcon, ArrowPathIcon } from "@heroicons/react/24/outline"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/visco/page-header"
import { DispatchesTable } from "@/components/visco/dispatches/dispatches-table"
import { DispatchDetailPanel } from "@/components/visco/dispatches/dispatch-detail-panel"
import { NuevoDespachoModal } from "@/components/visco/dispatches/nuevo-despacho-modal"
import { fetchDispatches } from "@/lib/services/warehouse"
import type { DispatchResponse } from "@/lib/types"
import { useDebounce } from "@/hooks/use-debounce"
import { toast } from "sonner"

const PAGE_SIZE = 6

export default function DispatchesPage() {
  const [dispatches, setDispatches] = useState<DispatchResponse[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [selectedDispatch, setSelectedDispatch] = useState<DispatchResponse | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 300)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetchDispatches(page, PAGE_SIZE, debouncedSearch)
      const sorted = (res.content ?? []).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      setDispatches(sorted)
      setTotalPages(res.page.totalPages)
      if (page === 0) setSelectedDispatch(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al cargar despachos")
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    setPage(0)
  }, [debouncedSearch])

  const handleNewDispatch = async () => {
    load()
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
