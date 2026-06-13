"use client"

import { useEffect, useMemo, useState } from "react"
import { PageHeader } from "@/components/visco/page-header"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { WarehouseCard } from "@/components/visco/warehouses/warehouse-card"
import { WarehouseDetail, WarehouseDetailSkeleton } from "@/components/visco/warehouses/warehouse-detail"
import { MovementsTable } from "@/components/visco/warehouses/movements-table"
import { WarehouseInventoryTable } from "@/components/visco/warehouses/warehouse-inventory"
import { TransferModal } from "@/components/visco/warehouses/transfer-modal"
import { AdjustModal } from "@/components/visco/warehouses/adjust-modal"
import { EditWarehouseModal } from "@/components/visco/warehouses/edit-warehouse-modal"
import { CreateWarehouseModal } from "@/components/visco/inbounds/create-warehouse-modal"
import { fetchStockSummary, fetchWarehouses, fetchWarehouseById, fetchMovements } from "@/lib/services/warehouse"
import type { WarehouseResponse, WarehouseStockSummary, WarehouseDetailResponse, InventoryMovementResponse } from "@/lib/types"
import { useQuery } from "@/hooks/use-query"
import { PlusIcon, ArrowsRightLeftIcon, EqualsIcon, BuildingStorefrontIcon, ArrowPathIcon, ChevronLeftIcon, ChevronRightIcon, CubeIcon } from "@heroicons/react/24/outline"
import { toast } from "sonner"

const PAGE_SIZE = 20

export default function WarehousesPage() {
  const [selectedWhId, setSelectedWhId] = useState<number | null>(null)

  const [movementsPage, setMovementsPage] = useState(0)
  const [movementTypeFilter, setMovementTypeFilter] = useState("all")

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [transferModalOpen, setTransferModalOpen] = useState(false)
  const [adjustModalOpen, setAdjustModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)

  const { data: summaryData, isLoading: loadingSummary, error: summaryError, refetch: refetchSummary } = useQuery(
    async (_signal) => {
      const [whData, sumData] = await Promise.all([
        fetchWarehouses(),
        fetchStockSummary(),
      ])
      return { warehouses: whData, summary: sumData }
    },
    []
  )

  useEffect(() => {
    if (summaryError) {
      toast.error(summaryError.message)
    }
  }, [summaryError])

  const warehouses = summaryData?.warehouses ?? []
  const stockSummary = summaryData?.summary ?? []

  useEffect(() => {
    if (warehouses.length > 0 && selectedWhId === null) {
      setSelectedWhId(warehouses[0].id)
    }
  }, [warehouses])

  const { data: detail, isLoading: loadingDetail, refetch: refetchDetail } = useQuery(
    async (_signal) => {
      if (selectedWhId === null) return null
      return fetchWarehouseById(selectedWhId)
    },
    [selectedWhId]
  )

  const warehouseDetail = useMemo(() => {
    if (!detail) return null
    const summary = stockSummary.find((s) => s.warehouseId === selectedWhId)
    return {
      ...detail,
      totalStock: detail.totalStock ?? summary?.totalStock ?? 0,
      totalProducts: detail.totalProducts ?? summary?.productCount ?? 0,
    } as WarehouseDetailResponse
  }, [detail, stockSummary, selectedWhId])

  const { data: movementsData, isLoading: loadingMovements, error: movementsError, refetch: refetchMovements } = useQuery(
    async (_signal) => {
      const type = movementTypeFilter === "all" ? undefined : movementTypeFilter
      const res = await fetchMovements(movementsPage, PAGE_SIZE, selectedWhId ?? undefined, type)
      return {
        movements: (res.content ?? []) as InventoryMovementResponse[],
        totalPages: res.page.totalPages,
      }
    },
    [movementsPage, movementTypeFilter, selectedWhId]
  )

  useEffect(() => {
    if (movementsError) {
      toast.error(movementsError.message)
    }
  }, [movementsError])

  const movements = movementsData?.movements ?? []
  const movementsTotalPages = movementsData?.totalPages ?? 0

  const selectedSummary = stockSummary.find((s) => s.warehouseId === selectedWhId) ?? null

  const warehousesWithStock = warehouses.map((w) => {
    const summary = stockSummary.find((s) => s.warehouseId === w.id)
    return {
      ...w,
      productCount: summary?.productCount ?? 0,
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
              <ArrowsRightLeftIcon className="size-4 mr-1.5" /> Transferir
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setAdjustModalOpen(true)}
            >
              <EqualsIcon className="size-4 mr-1.5" /> Ajustar
            </Button>
            <Button
              size="sm"
              className="bg-[#7b1a1a] hover:bg-[#5c1212] text-white"
              onClick={() => setCreateModalOpen(true)}
            >
              <PlusIcon className="size-4 mr-1.5" /> Nuevo Almacén
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="warehouses">
        <TabsList>
          <TabsTrigger value="warehouses">
            <BuildingStorefrontIcon className="size-4 mr-1.5" /> Almacenes
          </TabsTrigger>
          <TabsTrigger value="inventory">
            <CubeIcon className="size-4 mr-1.5" /> Inventario
          </TabsTrigger>
          <TabsTrigger value="movements">
            <ArrowsRightLeftIcon className="size-4 mr-1.5" /> Movimientos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="warehouses" className="mt-2">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              {loadingSummary ? (
                <div className="rounded-xl border border-dashed border-border bg-card/60 p-12 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                  <ArrowPathIcon className="size-5 animate-spin" />
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
                <WarehouseDetail
                  warehouse={warehouseDetail}
                  onEdit={() => setEditModalOpen(true)}
                />
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="mt-2">
          {selectedWhId === null ? (
            <div className="rounded-xl border border-dashed border-border bg-card/60 p-8 text-center text-sm text-muted-foreground">
              Selecciona un almacén para ver su inventario
            </div>
          ) : (
            <WarehouseInventoryTable
              warehouseId={selectedWhId}
              warehouseName={selectedSummary?.warehouseName ?? ""}
            />
          )}
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
        onCreated={refetchSummary}
      />

      <TransferModal
        open={transferModalOpen}
        onOpenChange={setTransferModalOpen}
        onDone={() => { refetchSummary(); refetchMovements() }}
      />

      <AdjustModal
        open={adjustModalOpen}
        onOpenChange={setAdjustModalOpen}
        onDone={() => { refetchSummary(); refetchMovements() }}
      />

      <EditWarehouseModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        warehouse={warehouseDetail}
        onUpdated={() => { refetchSummary(); refetchDetail() }}
      />
    </div>
  )
}
