"use client"

import { useCallback, useEffect, useState } from "react"
import { PageHeader } from "@/components/visco/page-header"
import { Button } from "@/components/ui/button"
import { OrderStatusBadge } from "@/components/visco/status-badge"
import { OrderStepper } from "@/components/visco/procurement/order-stepper"
import { OrderDetail } from "@/components/visco/procurement/order-detail"
import { CreatePOModal } from "@/components/visco/procurement/create-po-modal"
import { ReceiveGoodsModal } from "@/components/visco/procurement/receive-goods-modal"
import {
  fetchOrders,
  submitForApproval,
  approveOrder,
  cancelOrder,
} from "@/lib/services/procurement"
import type { PurchaseOrderResponse, Page } from "@/lib/types"
import { CheckBadgeIcon, DocumentTextIcon, PlusIcon, ArrowPathIcon } from "@heroicons/react/24/outline"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export default function ProcurementPage() {
  const [pageData, setPageData] = useState<Page<PurchaseOrderResponse> | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [receiveOpen, setReceiveOpen] = useState(false)
  const [page, setPage] = useState(0)

  const orders = pageData?.content ?? []

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetchOrders(page, 50)
      res.content.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      setPageData(res)
      setSelectedId((prev) =>
        prev && res.content.find((o) => o.id === prev) ? prev : res.content[0]?.id ?? null
      )
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al cargar pedidos")
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    load()
  }, [load])

  const selected = orders.find((o) => o.id === selectedId) ?? null

  // Patches local state for a single order without a full reload
  const patchOrder = (updated: PurchaseOrderResponse) => {
    setPageData((prev) =>
      prev
        ? { ...prev, content: prev.content.map((x) => (x.id === updated.id ? updated : x)) }
        : prev
    )
  }

  // PENDING → AWAITING_APPROVAL
  const handleSubmit = async (o: PurchaseOrderResponse) => {
    try {
      const updated = await submitForApproval(o.id)
      patchOrder(updated)
      toast.success(`${o.orderNumber} enviado a aprobación`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al enviar a aprobación")
    }
  }

  // AWAITING_APPROVAL → APPROVED
  // userId is resolved server-side from the JWT cookie, no need to pass it here
  const handleApprove = async (o: PurchaseOrderResponse) => {
    try {
      const updated = await approveOrder(o.id)
      patchOrder(updated)
      toast.success(`${o.orderNumber} aprobado`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al aprobar")
    }
  }

  const handleCancel = async (o: PurchaseOrderResponse) => {
    try {
      const updated = await cancelOrder(o.id)
      patchOrder(updated)
      toast.success(`${o.orderNumber} cancelado`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al cancelar")
    }
  }

  const handleReceive = (o: PurchaseOrderResponse) => {
    setSelectedId(o.id)
    setReceiveOpen(true)
  }

  return (
    <div>
      <PageHeader
        title="Gestión de Compras"
        subtitle="Crea, aprueba y monitorea el ciclo completo de pedidos de compra."
        actions={
          <>
            <Button variant="outline" size="sm" className="bg-card">
              <DocumentTextIcon className="size-4" /> Ver pedidos recientes
            </Button>
            <Button variant="outline" size="sm" className="bg-card">
              <CheckBadgeIcon className="size-4" /> Aprobar pedidos
            </Button>
            <Button
              size="sm"
              className="bg-[#7b1a1a] hover:bg-[#5c1212] text-white"
              onClick={() => setCreateOpen(true)}
            >
              <PlusIcon className="size-4" /> Crear nuevo pedido
            </Button>
          </>
        }
      />

      <div className="mb-4">
        <OrderStepper status={selected?.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-semibold">Pedidos Activos</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {pageData?.page.totalElements ?? 0} pedidos en el sistema
                </p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wider text-muted-foreground bg-[#fafafa]">
                    <th className="text-left font-medium px-5 py-3">ID</th>
                    <th className="text-left font-medium px-5 py-3">Fecha</th>
                    <th className="text-left font-medium px-5 py-3">Proveedor</th>
                    <th className="text-left font-medium px-5 py-3">Estado</th>
                    <th className="text-left font-medium px-5 py-3">Solicitante</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-10 text-center">
                        <ArrowPathIcon className="size-5 animate-spin mx-auto" />
                      </td>
                    </tr>
                  ) : (
                    orders.map((o) => (
                      <tr
                        key={o.id}
                        onClick={() => setSelectedId(o.id)}
                        className={cn(
                          "border-t border-border cursor-pointer",
                          selectedId === o.id ? "bg-[#fde8e8]/40" : "hover:bg-[#fafafa]",
                        )}
                      >
                        <td className="px-5 py-3">
                          <span className="font-medium text-[#7b1a1a]">{o.orderNumber}</span>
                        </td>
                        <td className="px-5 py-3 text-muted-foreground">
                          {new Date(o.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-3 text-foreground">{o.supplierName}</td>
                        <td className="px-5 py-3">
                          <OrderStatusBadge status={o.status} />
                        </td>
                        <td className="px-5 py-3 text-muted-foreground">{o.createdBy}</td>
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
          <OrderDetail
            order={selected}
            onSubmit={handleSubmit}
            onApprove={handleApprove}
            onCancel={handleCancel}
            onReceive={handleReceive}
          />
        </div>
      </div>

      <CreatePOModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={load}
      />

      <ReceiveGoodsModal
        order={selected}
        open={receiveOpen}
        onOpenChange={setReceiveOpen}
        onReceived={load}
      />
    </div>
  )
}