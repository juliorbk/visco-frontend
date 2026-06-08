"use client"

import { useEffect, useState } from "react"
import { ArrowDownTrayIcon, PlusIcon, ArrowPathIcon, BuildingStorefrontIcon } from "@heroicons/react/24/outline"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/visco/page-header"
import { InboundsKPICards } from "@/components/visco/inbounds/kpi-cards"
import { ReceiptsTable } from "@/components/visco/inbounds/receipts-table"
import { ReceiptDetailPanel } from "@/components/visco/inbounds/receipt-detail-panel"
import { ReceiptStepper } from "@/components/visco/inbounds/receipt-stepper"
import { NuevaRecepcionModal } from "@/components/visco/inbounds/nueva-recepcion-modal"
import { CreateWarehouseModal } from "@/components/visco/inbounds/create-warehouse-modal"
import { useQuery } from "@/hooks/use-query"
import { api } from "@/lib/api"
import { useDebounce } from "@/hooks/use-debounce"
import type { GoodReceiptResponse, PurchaseOrderResponse, Page } from "@/lib/types"
import { toast } from "sonner"

const PAGE_SIZE = 12

export default function InboundsPage() {
  const [selectedReceipt, setSelectedReceipt] = useState<GoodReceiptResponse | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [warehouseModalOpen, setWarehouseModalOpen] = useState(false)
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 300)

  const {
    data: receiptsPage,
    isLoading: loading,
    error,
    refetch,
  } = useQuery<Page<GoodReceiptResponse>>(
    (signal) => api.get<Page<GoodReceiptResponse>>(`/api/warehouse/receipts?page=${page}&size=${PAGE_SIZE}&search=${debouncedSearch}`, signal),
    [page, debouncedSearch]
  )

  const receipts = receiptsPage?.content ?? []
  const totalPages = receiptsPage?.page.totalPages ?? 1

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderResponse[]>([])

  const loadPOs = useQuery<Page<PurchaseOrderResponse>>(
    (signal) => api.get("/api/procurement/orders?page=0&size=200", signal),
    []
  )

  useEffect(() => {
    if (error) toast.error("Error al cargar datos")
  }, [error])

  useEffect(() => {
    setPage(0)
  }, [debouncedSearch])

  useEffect(() => {
    if (page === 0) setSelectedReceipt(null)
  }, [page])

  useEffect(() => {
    if (loadPOs.data?.content) setPurchaseOrders(loadPOs.data.content)
  }, [loadPOs.data])

  const todayCount = receipts.filter(
    (r) => new Date(r.receivedAt).toDateString() === new Date().toDateString()
  ).length

  const completedCount = receipts.filter((r) => r.updatedStatus === "DELIVERED").length
  const partialCount = receipts.filter((r) => r.updatedStatus === "PARTIALLY_DELIVERED").length
  const pendingCount = purchaseOrders.filter((p) => p.status === "APPROVED" || p.status === "IN_TRANSIT").length

  const handleNewReceipt = async () => {
    refetch()
    setIsModalOpen(false)
  }

  return (
    <div>
      <PageHeader
        title="Recepciones de Mercancía"
        subtitle="Registra y consulta las notas de recepción contra órdenes de compra aprobadas."
        actions={
          <>
            <Button variant="outline" size="sm" className="bg-card" onClick={() => setWarehouseModalOpen(true)}>
              <BuildingStorefrontIcon className="size-4" /> Almacenes
            </Button>
            <Button variant="outline" size="sm" className="bg-card">
              <ArrowDownTrayIcon className="size-4" /> Exportar
            </Button>
            <Button size="sm" onClick={() => setIsModalOpen(true)}>
              <PlusIcon className="size-4" /> Nueva Recepción
            </Button>
          </>
        }
      />

      <InboundsKPICards
        todayCount={todayCount}
        pendingCount={pendingCount}
        partialCount={partialCount}
        completedCount={completedCount}
      />

      {loading ? (
        <div className="flex justify-center py-20">
          <ArrowPathIcon className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="mb-4">
            <ReceiptStepper status={selectedReceipt?.updatedStatus} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ReceiptsTable
                receipts={receipts}
                onSelectReceipt={setSelectedReceipt}
                selectedReceiptId={selectedReceipt?.id}
                searchQuery={search}
                onSearchChange={setSearch}
                currentPage={page + 1}
                totalPages={totalPages}
                onPageChange={(p) => setPage(p - 1)}
              />
            </div>
            <div className="lg:col-span-1">
              {selectedReceipt ? (
                <ReceiptDetailPanel
                  receipt={selectedReceipt}
                  onClose={() => setSelectedReceipt(null)}
                />
              ) : (
                <div className="bg-white rounded-lg border border-[#f3f4f6] p-8 text-center">
                  <p className="text-[#6b7280] text-sm">
                    Selecciona una recepción de la tabla para ver los detalles
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <NuevaRecepcionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        purchaseOrders={purchaseOrders}
        onSubmit={handleNewReceipt}
      />

      <CreateWarehouseModal
        open={warehouseModalOpen}
        onOpenChange={setWarehouseModalOpen}
        onCreated={() => {}}
      />
    </div>
  )
}
