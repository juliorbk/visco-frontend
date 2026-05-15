"use client"

import { OrderStatusBadge } from "@/components/visco/status-badge"
import { Button } from "@/components/ui/button"
import type { PurchaseOrderResponse } from "@/lib/types"

const APPROVABLE = ["PENDING", "AWAITING_APPROVAL"]
const CANCELLABLE = ["PENDING", "IN_TRANSIT", "AWAITING_APPROVAL"]
const RECEIVABLE = ["IN_TRANSIT", "APPROVED"]

export function OrderDetail({
  order,
  onApprove,
  onCancel,
  onReceive,
}: {
  order: PurchaseOrderResponse | null
  onApprove?: (o: PurchaseOrderResponse) => void
  onCancel?: (o: PurchaseOrderResponse) => void
  onReceive?: (o: PurchaseOrderResponse) => void
}) {
  if (!order) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/60 p-6 text-center text-sm text-muted-foreground h-full grid place-items-center">
        Selecciona un pedido para ver el detalle.
      </div>
    )
  }

  const total = order.items.reduce((s, i) => s + i.subtotal, 0)

  return (
    <div className="rounded-xl border border-border bg-card shadow-xs h-full flex flex-col">
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-800 ring-1 ring-amber-200 px-3 py-1 text-xs font-semibold">
            {order.orderNumber}
          </span>
          <OrderStatusBadge status={order.status} />
        </div>
        <h3 className="mt-3 font-serif text-xl font-semibold text-foreground">
          {order.supplierName}
        </h3>
        {order.description && (
          <p className="mt-1 text-xs text-muted-foreground">{order.description}</p>
        )}
      </div>

      <div className="px-5 py-4 grid grid-cols-2 gap-3 border-b border-border">
        <Stat label="Total" value={`$${total.toLocaleString()}`} />
        <Stat label="Solicitante" value={order.createdBy} />
        <Stat label="Tipo" value={order.type} />
        <Stat label="Artículos" value={`${order.items.length}`} />
      </div>

      <div className="px-5 py-4 flex-1 overflow-y-auto">
        <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
          Líneas del pedido
        </h4>
        <ul className="space-y-2">
          {order.items.map((it, i) => (
            <li
              key={i}
              className="flex items-center justify-between rounded-md border border-border bg-[#fafafa] px-3 py-2 text-sm"
            >
              <div>
                <div className="font-medium text-foreground">{it.productName}</div>
                <div className="text-xs text-muted-foreground">
                  {it.quantity} × ${it.unitPrice.toFixed(2)}
                </div>
              </div>
              <span className="font-medium tabular-nums">
                ${it.subtotal.toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="px-5 py-4 border-t border-border flex flex-col sm:flex-row gap-2">
        {APPROVABLE.includes(order.status) && (
          <>
            <Button
              variant="outline"
              className="flex-1 bg-card"
              onClick={() => onCancel?.(order)}
            >
              Rechazar
            </Button>
            <Button
              className="flex-1 bg-[#7b1a1a] hover:bg-[#5c1212] text-white"
              onClick={() => onApprove?.(order)}
            >
              Aprobar
            </Button>
          </>
        )}
        {RECEIVABLE.includes(order.status) && (
          <Button
            className="flex-1 bg-[#7b1a1a] hover:bg-[#5c1212] text-white"
            onClick={() => onReceive?.(order)}
          >
            Recibir Mercancía
          </Button>
        )}
        {!APPROVABLE.includes(order.status) && !RECEIVABLE.includes(order.status) && (
          <Button variant="outline" className="flex-1 bg-card" disabled>
            Sin acciones disponibles
          </Button>
        )}
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-[#fafafa] px-3 py-2.5">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm font-medium text-foreground truncate">{value}</div>
    </div>
  )
}
