"use client"

import { OrderStatusBadge } from "@/components/visco/status-badge"
import { Button } from "@/components/ui/button"
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline"
import { downloadPDF } from "@/lib/pdf/download-pdf"
import type { PurchaseOrderResponse } from "@/lib/types"
import { cn } from "@/lib/utils"

// PENDING      → can only be submitted for approval
// AWAITING_APPROVAL → can be approved or rejected
// IN_TRANSIT / APPROVED → can receive goods
const SUBMITTABLE  = ["PENDING"]
const APPROVABLE   = ["AWAITING_APPROVAL"]
const CANCELLABLE  = ["PENDING", "IN_TRANSIT", "AWAITING_APPROVAL"]
const RECEIVABLE   = ["IN_TRANSIT", "APPROVED", "PARTIALLY_DELIVERED"]

export function OrderDetail({
  order,
  onSubmit,
  onApprove,
  onCancel,
  onReceive,
}: {
  order: PurchaseOrderResponse | null
  onSubmit?:  (o: PurchaseOrderResponse) => void
  onApprove?: (o: PurchaseOrderResponse) => void
  onCancel?:  (o: PurchaseOrderResponse) => void
  onReceive?: (o: PurchaseOrderResponse) => void
}) {
  if (!order) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/60 p-6 text-center text-sm text-muted-foreground h-full grid place-items-center">
        Select an order to view its details.
      </div>
    )
  }

  const total = order.items.reduce((s, i) => s + i.subtotal, 0)

  const isSubmittable = SUBMITTABLE.includes(order.status)
  const isApprovable  = APPROVABLE.includes(order.status)
  const isCancellable = CANCELLABLE.includes(order.status)
  const isReceivable  = RECEIVABLE.includes(order.status)
  const hasActions    = isSubmittable || isApprovable || isReceivable || isCancellable

  return (
    <div className="rounded-xl border border-border bg-card shadow-xs h-full flex flex-col">
      {/* ── Header ── */}
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-800 ring-1 ring-amber-200 px-3 py-1 text-xs font-semibold min-w-0 max-w-full truncate">
            {order.orderNumber}
          </span>
          <div className="shrink-0">
            <OrderStatusBadge status={order.status} />
          </div>
        </div>
        <h3 className="mt-3 font-serif text-xl font-semibold text-foreground break-words">
          {order.supplierName}
        </h3>
        {order.description && (
          <p className="mt-1 text-xs text-muted-foreground break-words">{order.description}</p>
        )}
      </div>

      {/* ── Stats ── */}
      <div className="px-5 py-4 grid grid-cols-2 gap-3 border-b border-border">
        <Stat label="Total"       value={`$${total.toLocaleString()}`} />
        <Stat label="Requester" value={order.createdBy} />
        <Stat label="Type"        value={order.type} />
        <Stat label="Items"   value={`${order.items.length}`} />
        <Stat label="Destination warehouse" value={order.destinationWarehouseName ?? "-"} className="sm:col-span-2" />
      </div>

      {/* ── Items ── */}
      <div className="px-5 py-4 flex-1 overflow-y-auto">
        <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
          Order lines
        </h4>
        <ul className="space-y-2">
          {order.items.map((it, i) => (
            <li
              key={i}
              className="flex items-center justify-between gap-2 rounded-md border border-border bg-[#fafafa] px-3 py-2 text-sm"
            >
              <div className="min-w-0 flex-1">
                <div className="font-medium text-foreground truncate">{it.productName}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {it.quantity} × ${it.unitPrice.toFixed(2)}
                </div>
              </div>
              <span className="font-medium tabular-nums shrink-0">
                ${it.subtotal.toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* ── Export PDF ── */}
      <div className="px-5 py-3 border-t border-border">
        <Button
          variant="outline"
          className="w-full bg-card text-xs"
          onClick={async () => {
            const { generatePurchaseOrderPDF } = await import("@/lib/pdf/purchase-order-pdf")
            const doc = generatePurchaseOrderPDF(order)
            downloadPDF(doc, `PURCHASE_ORDER_${order.orderNumber}_${new Date().toISOString().split("T")[0]}.pdf`)
          }}
        >
          <ArrowDownTrayIcon className="size-4 mr-2" />
          Export PDF
        </Button>
      </div>

      {/* ── Actions ── */}
      <div className="px-5 py-4 border-t border-border flex flex-col sm:flex-row gap-2">

        {/* PENDING: submit for approval + cancel */}
        {isSubmittable && (
          <>
            {isCancellable && (
              <Button
                variant="outline"
                className="flex-1 bg-card"
                onClick={() => onCancel?.(order)}
              >
                Cancel
              </Button>
            )}
            <Button
              className="flex-1 bg-[#7b1a1a] hover:bg-[#5c1212] text-white"
              onClick={() => onSubmit?.(order)}
            >
              Submit for approval
            </Button>
          </>
        )}

        {/* AWAITING_APPROVAL: reject + approve */}
        {isApprovable && (
          <>
            <Button
              variant="outline"
              className="flex-1 bg-card"
              onClick={() => onCancel?.(order)}
            >
              Reject
            </Button>
            <Button
              className="flex-1 bg-[#7b1a1a] hover:bg-[#5c1212] text-white"
              onClick={() => onApprove?.(order)}
            >
              Approve
            </Button>
          </>
        )}

        {/* APPROVED / IN_TRANSIT: receive goods */}
        {isReceivable && (
          <Button
            className="flex-1 bg-[#7b1a1a] hover:bg-[#5c1212] text-white"
            onClick={() => onReceive?.(order)}
          >
            Receive goods
          </Button>
        )}

        {/* Standalone cancel: status is cancellable but no other action is available */}
        {isCancellable && !isSubmittable && !isApprovable && !isReceivable && (
          <Button
            variant="outline"
            className="flex-1 bg-card"
            onClick={() => onCancel?.(order)}
          >
            Cancel order
          </Button>
        )}

        {/* No actions available */}
        {!hasActions && (
          <Button variant="outline" className="flex-1 bg-card" disabled>
            No actions available
          </Button>
        )}
      </div>
    </div>
  )
}

function Stat({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={cn("rounded-md border border-border bg-[#fafafa] px-3 py-2.5 min-w-0", className)}>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm font-medium text-foreground truncate">{value}</div>
    </div>
  )
}