"use client"

import { useCallback, useEffect, useState } from "react"
import { PageHeader } from "@/components/visco/page-header"
import { Button } from "@/components/ui/button"
import { OrderStatusBadge } from "@/components/visco/status-badge"
import { OrderStepper } from "@/components/visco/procurement/order-stepper"
import { OrderDetail } from "@/components/visco/procurement/order-detail"
import { CreatePOModal } from "@/components/visco/procurement/create-po-modal"
import { ReceiveGoodsModal } from "@/components/visco/procurement/receive-goods-modal"
import { fetchOrders, approveOrder, cancelOrder } from "@/lib/services/procurement"
import type { PurchaseOrderResponse } from "@/lib/types"
import { CheckCheck, FileClock, Plus, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export default function ProcurementPage() {
  const [orders, setOrders] = useState<PurchaseOrderResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [receiveOpen, setReceiveOpen] = useState(false)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const list = await fetchOrders()
      setOrders(list)
      setSelectedId((prev) => (prev && list.find((o) => o.id === prev) ? prev : list[0]?.id ?? null))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al cargar pedidos")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const selected = orders.find((o) => o.id === selectedId) ?? null

  const handleApprove = async (o: PurchaseOrderResponse) => {
    try {
      const updated = await approveOrder(o.id)
      setOrders((prev) => prev.map((x) => (x.id === o.id ? updated : x)))
      toast.success(`${o.orderNumber} aprobado`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al aprobar")
    }
  }

  const handleCancel = async (o: PurchaseOrderResponse) => {
    try {
      const updated = await cancelOrder(o.id)
      setOrders((prev) => prev.map((x) => (x.id === o.id ? updated : x)))
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
              <FileClock className="size-4" /> Ver pedidos recientes
            </Button>
            <Button variant="outline" size="sm" className="bg-card">
              <CheckCheck className="size-4" /> Aprobar pedidos
            </Button>
            <Button
              size="sm"
              className="bg-[#7b1a1a] hover:bg-[#5c1212] text-white"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="size-4" /> Crear nuevo pedido
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
                {orders.length} pedidos en el sistema
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
                      <Loader2 className="size-5 animate-spin mx-auto" />
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
        </div>
      </div>

        <div className="lg:col-span-1">
          <OrderDetail
            order={selected}
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
