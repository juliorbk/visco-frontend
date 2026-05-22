"use client"

import { useCallback, useEffect, useState } from "react"
import { PageHeader } from "@/components/visco/page-header"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { WarehouseCard } from "@/components/visco/warehouses/warehouse-card"
import { WarehouseDetail, WarehouseDetailSkeleton } from "@/components/visco/warehouses/warehouse-detail"
import { MovementsTable } from "@/components/visco/warehouses/movements-table"
import { TransferModal } from "@/components/visco/warehouses/transfer-modal"
import { AdjustModal } from "@/components/visco/warehouses/adjust-modal"
import { CreateWarehouseModal } from "@/components/visco/inbounds/create-warehouse-modal"
import { fetchStockSummary, fetchWarehouses, fetchWarehouseById, fetchMovements } from "@/lib/services/warehouse"
import type { WarehouseResponse, WarehouseStockSummary, WarehouseDetailResponse, InventoryMovementResponse } from "@/lib/types"
import { Plus, ArrowRightLeft, Equal, Warehouse, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "sonner"

const PAGE_SIZE = 20

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<WarehouseResponse[]>([])
  const [stockSummary, setStockSummary] = useState<WarehouseStockSummary[]>([])
  const [loadingSummary, setLoadingSummary] = useState(true)
  const [selectedWhId, setSelectedWhId] = useState<number | null>(null)
  const [warehouseDetail, setWarehouseDetail] = useState<WarehouseDetailResponse | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  const [movements, setMovements] = useState<InventoryMovementResponse[]>([])
  const [loadingMovements, setLoadingMovements] = useState(true)
  const [movementsPage, setMovementsPage] = useState(0)
  const [movementsTotalPages, setMovementsTotalPages] = useState(0)
  const [movementTypeFilter, setMovementTypeFilter] = useState("all")

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [transferModalOpen, setTransferModalOpen] = useState(false)
  const [adjustModalOpen, setAdjustModalOpen] = useState(false)

  const loadSummary = useCallback(async () => {
    try {
      setLoadingSummary(true)
      const [whData, summaryData] = await Promise.all([
        fetchWarehouses(),
        fetchStockSummary(),
      ])
      setWarehouses(whData)
      setStockSummary(summaryData)
      if (whData.length > 0 && selectedWhId === null) {
        setSelectedWhId(whData[0].id)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al cargar resumen")
    } finally {
      setLoadingSummary(false)
    }
  }, [selectedWhId])

  const loadDetail = useCallback(async () => {
    if (selectedWhId === null) return
    try {
      setLoadingDetail(true)
      const data = await fetchWarehouseById(selectedWhId)
      const summary = stockSummary.find((s) => s.warehouseId === selectedWhId)
      setWarehouseDetail({
        ...data,
        totalStock: data.totalStock ?? summary?.totalStock ?? 0,
        totalProducts: data.totalProducts ?? 0,
      })
    } catch {
      setWarehouseDetail(null)
    } finally {
      setLoadingDetail(false)
    }
  }, [selectedWhId])

  const loadMovements = useCallback(async () => {
    try {
      setLoadingMovements(true)
      const type = movementTypeFilter === "all" ? undefined : movementTypeFilter
      const res = await fetchMovements(movementsPage, PAGE_SIZE, selectedWhId ?? undefined, type)
      setMovements(res.content ?? [])
      setMovementsTotalPages(res.page.totalPages)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al cargar movimientos")
    } finally {
      setLoadingMovements(false)
    }
  }, [movementsPage, movementTypeFilter, selectedWhId])

  useEffect(() => { loadSummary() }, [loadSummary])
  useEffect(() => { loadDetail() }, [loadDetail])
  useEffect(() => { loadMovements() }, [loadMovements])

  const selectedSummary = stockSummary.find((s) => s.warehouseId === selectedWhId) ?? null

  const warehousesWithStock = warehouses.map((w) => {
    const summary = stockSummary.find((s) => s.warehouseId === w.id)
    return {
      ...w,
      totalStock: summary?.totalStock ?? 0,
      totalPendingStock: summary?.totalPendingStock ?? 0,
    }
  })

  return (
    <div>
      <PageHeader
        title="Gestión de Almacenes"
        subtitle="Administra almacenes, consulta existencias y registra movimientos de inventario."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setTransferModalOpen(true)}
            >
              <ArrowRightLeft className="size-4 mr-1.5" /> Transferir
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setAdjustModalOpen(true)}
            >
              <Equal className="size-4 mr-1.5" /> Ajustar
            </Button>
            <Button
              size="sm"
              className="bg-[#7b1a1a] hover:bg-[#5c1212] text-white"
              onClick={() => setCreateModalOpen(true)}
            >
              <Plus className="size-4 mr-1.5" /> Nuevo Almacén
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="warehouses">
        <TabsList>
          <TabsTrigger value="warehouses">
            <Warehouse className="size-4 mr-1.5" /> Almacenes
          </TabsTrigger>
          <TabsTrigger value="movements">
            <ArrowRightLeft className="size-4 mr-1.5" /> Movimientos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="warehouses" className="mt-2">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              {loadingSummary ? (
                <div className="rounded-xl border border-dashed border-border bg-card/60 p-12 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                  <Loader2 className="size-5 animate-spin" />
                  Cargando almacenes…
                </div>
              ) : warehousesWithStock.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-card/60 p-8 text-center text-sm text-muted-foreground">
                  No hay almacenes registrados.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {warehousesWithStock.map((w) => (
                    <WarehouseCard
                      key={w.id}
                      warehouse={w}
                      selected={selectedWhId === w.id}
                      onSelect={(wh) => { setSelectedWhId(wh.id); setMovementsPage(0) }}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="lg:col-span-1">
              {loadingDetail ? <WarehouseDetailSkeleton /> : (
                <WarehouseDetail warehouse={warehouseDetail} />
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="movements" className="mt-2">
          <MovementsTable
            data={movements}
            loading={loadingMovements}
            totalPages={movementsTotalPages}
            page={movementsPage}
            onPageChange={setMovementsPage}
            typeFilter={movementTypeFilter}
            onTypeFilterChange={(t) => { setMovementTypeFilter(t); setMovementsPage(0) }}
            warehouseName={selectedSummary?.warehouseName ?? null}
            warehouseId={selectedWhId}
          />
        </TabsContent>
      </Tabs>

      <CreateWarehouseModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onCreated={loadSummary}
      />

      <TransferModal
        open={transferModalOpen}
        onOpenChange={setTransferModalOpen}
        onDone={() => { loadSummary(); loadMovements() }}
      />

      <AdjustModal
        open={adjustModalOpen}
        onOpenChange={setAdjustModalOpen}
        onDone={() => { loadSummary(); loadMovements() }}
      />
    </div>
  )
}
