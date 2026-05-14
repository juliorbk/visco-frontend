"use client"

import { useState } from "react"
import { PageHeader } from "@/components/visco/page-header"
import { Button } from "@/components/ui/button"
import { OrderStatusBadge } from "@/components/visco/status-badge"
import { OrderStepper } from "@/components/visco/procurement/order-stepper"
import { OrderDetail } from "@/components/visco/procurement/order-detail"
import { CreatePOModal } from "@/components/visco/procurement/create-po-modal"
import { ReceiveGoodsModal } from "@/components/visco/procurement/receive-goods-modal"
import { orders as initialOrders, type PurchaseOrder } from "@/lib/mock-data"
import { CheckCheck, FileClock, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export default function ProcurementPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>(initialOrders)
  const [selectedId, setSelectedId] = useState<string | null>(orders[0]?.id ?? null)
  const [createOpen, setCreateOpen] = useState(false)
  const [receiveOpen, setReceiveOpen] = useState(false)

  const selected = orders.find((o) => o.id === selectedId) ?? null

  const updateStatus = (id: string, status: PurchaseOrder["status"]) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)))
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
        <div className="lg:col-span-2 rounded-xl border border-border bg-card shadow-xs overflow-hidden">
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
                  <th className="text-left font-medium px-5 py-3">Total</th>
                  <th className="text-left font-medium px-5 py-3">Estado</th>
                  <th className="text-left font-medium px-5 py-3">Solicitante</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr
                    key={o.id}
                    onClick={() => setSelectedId(o.id)}
                    className={cn(
                      "border-t border-border cursor-pointer",
                      selectedId === o.id ? "bg-[#fde8e8]/40" : "hover:bg-[#fafafa]",
                    )}
                  >
                    <td className="px-5 py-3">
                      <span
                        className={cn(
                          "font-medium",
                          ["PENDIENTE", "APROBADO", "EN_TRANSITO"].includes(o.status)
                            ? "text-[#7b1a1a]"
                            : "text-foreground",
                        )}
                      >
                        {o.id}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{o.date}</td>
                    <td className="px-5 py-3 text-foreground">{o.supplierName}</td>
                    <td className="px-5 py-3 tabular-nums font-medium">
                      ${o.total.toLocaleString()}
                    </td>
                    <td className="px-5 py-3">
                      <OrderStatusBadge status={o.status} />
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{o.requester}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <OrderDetail
            order={selected}
            onApprove={(o) => {
              updateStatus(o.id, "APROBADO")
              toast.success(`${o.id} aprobado`)
            }}
            onCancel={(o) => {
              updateStatus(o.id, "CANCELADO")
              toast.success(`${o.id} cancelado`)
            }}
            onReceive={() => setReceiveOpen(true)}
          />
        </div>
      </div>

      <CreatePOModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={(o) => {
          setOrders((prev) => [o, ...prev])
          setSelectedId(o.id)
        }}
      />

      <ReceiveGoodsModal
        order={selected}
        open={receiveOpen}
        onOpenChange={setReceiveOpen}
        onReceive={(o) => updateStatus(o.id, "RECIBIDO")}
      />
    </div>
  )
}
