"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ExportPDFButton } from "@/components/ui/export-pdf-button"
import type { RequisitionResponse, CostCenter } from "@/lib/types"
import { OrderStatusBadge } from "@/components/visco/status-badge"
import { getCachedUser } from "@/lib/auth-client"
import { canApproveRequisitions } from "@/lib/permissions"
import {
  submitRequisitionForApproval,
  approveRequisition,
  rejectRequisition,
  cancelRequisition,
} from "@/lib/services/requisitions"
import { downloadPDF } from "@/lib/pdf/download-pdf"
import {
  ArrowPathIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  XCircleIcon,
  ShoppingCartIcon,
  NoSymbolIcon,
  TruckIcon,
} from "@heroicons/react/24/outline"
import { toast } from "sonner"
import { cn, getCostCenterDisplay } from "@/lib/utils"

const statusMap: Record<string, string> = {
  DRAFT: "Borrador",
  PENDING: "Pendiente",
  AWAITING_APPROVAL: "Esperando Aprobacion",
  APPROVED: "Aprobada",
  REJECTED: "Rechazada",
  CANCELLED: "Cancelada",
  CONVERTED: "Convertida a OC",
}

export function RequisitionDetail({
  requisition,
  onUpdate,
  onConvert,
  ccByArea,
}: {
  requisition: RequisitionResponse | null
  onUpdate: () => void
  onConvert: (req: RequisitionResponse) => void
  ccByArea?: Map<string, CostCenter>
}) {
  const [loading, setLoading] = useState(false)

  if (!requisition) {
    return (
      <div className="bg-white rounded-lg border border-border p-8 text-center">
        <p className="text-muted-foreground text-sm">
          Selecciona una requisicion de la tabla para ver sus detalles
        </p>
      </div>
    )
  }

  const user = getCachedUser()
  const isApprover = canApproveRequisitions(user)

  const handleAction = async (
    action: () => Promise<unknown>,
    successMsg: string
  ) => {
    setLoading(true)
    try {
      await action()
      toast.success(successMsg)
      onUpdate()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error en la operación")
    } finally {
      setLoading(false)
    }
  }

  const canSubmit = requisition.status === "DRAFT" || requisition.status === "PENDING"
  const canApprove = requisition.status === "AWAITING_APPROVAL" && isApprover
  const canReject = requisition.status === "AWAITING_APPROVAL" && isApprover
  // A requisition can be partially awarded to one or more POs, so the
  // "Convert to PO" action stays available while there's still quantity
  // pending on at least one line.
  const hasPendingItems = requisition.items.some(
    (it) => it.pendingQuantity == null || it.pendingQuantity > 0,
  )
  const canConvertToPO =
    (requisition.status === "APPROVED" || requisition.status === "PARTIALLY_CONVERTED") &&
    hasPendingItems
  const canCancel =
    requisition.status !== "CANCELLED" &&
    requisition.status !== "CONVERTED" &&
    requisition.status !== "REJECTED"

  const totalItems = requisition.items.length

  const ccForPdf = (() => {
    const cc = ccByArea?.get(requisition.areaName) ?? null
    if (!cc) return null
    const d = getCostCenterDisplay(cc)
    return d.secondary ? `${d.primary} (${d.secondary})` : d.primary
  })()

  return (
    <div className="rounded-xl border border-border bg-card shadow-xs">
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-serif text-lg font-semibold">
              {requisition.requisitionNumber}
            </h3>
            <OrderStatusBadge status={requisition.status} />
          </div>
          <ExportPDFButton
            variant="icon"
            label="Exportar Requisición"
            onExport={async () => {
              const { generateRequisitionPDF } = await import(
                "@/lib/pdf/requisition-pdf"
              )
              const doc = await generateRequisitionPDF(requisition, ccForPdf)
              downloadPDF(
                doc,
                `REQUISITION_${requisition.requisitionNumber}_${new Date()
                  .toISOString()
                  .split("T")[0]}.pdf`,
              )
            }}
          />
        </div>
      </div>

      <div className="px-5 py-4 space-y-3 text-sm">
        <DetailRow label="Solicitante" value={requisition.requestedBy} />
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">Centro de Costo</span>
          <span className="text-foreground text-right">
            {(() => {
              const cc = ccByArea?.get(requisition.areaName) ?? null
              const d = getCostCenterDisplay(cc)
              return d.secondary ? `${d.primary} (${d.secondary})` : d.primary
            })()}
          </span>
        </div>
        <DetailRow label="Creado" value={new Date(requisition.createdAt).toLocaleDateString()} />
        {requisition.approvedBy && (
          <DetailRow label="Aprobado por" value={requisition.approvedBy} />
        )}
        {requisition.approvedAt && (
          <DetailRow
            label="Fecha de aprobacion"
            value={new Date(requisition.approvedAt).toLocaleDateString()}
          />
        )}
        {requisition.rejectionReason && (
          <div className="rounded-md bg-red-50 border border-red-200 p-3 text-xs text-red-700">
            <div className="font-semibold mb-1">Motivo de rechazo</div>
            {requisition.rejectionReason}
          </div>
        )}
        {requisition.approvalNotes && (
          <div className="rounded-md bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-700">
            <div className="font-semibold mb-1">Notas de aprobacion</div>
            {requisition.approvalNotes}
          </div>
        )}
      </div>

      {requisition.description && (
        <div className="px-5 py-3 border-t border-border">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
            Descripcion
          </div>
          <p className="text-sm text-foreground break-words">{requisition.description}</p>
        </div>
      )}

      <div className="px-5 py-3 border-t border-border">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
          Items ({totalItems})
        </div>
        <div className="space-y-2">
          {requisition.items.map((item, idx) => {
            const awarded = item.awardedQuantity ?? 0
            const pending = item.pendingQuantity ?? item.quantity
            const hasProgress = item.awardedQuantity != null
            const progressPct =
              item.quantity > 0
                ? Math.min(100, Math.round((awarded / item.quantity) * 100))
                : 0
            return (
              <div
                key={item.id ?? idx}
                className="rounded-md border border-border px-3 py-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-foreground truncate">
                      {item.productName}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono truncate">
                      {item.productSku}
                    </div>
                  </div>
                  <span className="text-sm font-semibold tabular-nums shrink-0">
                    x{item.quantity}
                  </span>
                </div>
                {hasProgress && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground tabular-nums">
                      <span>Adjudicado {awarded} / {item.quantity}</span>
                      <span>{progressPct}%</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          item.fullyAwarded
                            ? "bg-emerald-500"
                            : awarded > 0
                              ? "bg-sky-500"
                              : "bg-transparent",
                        )}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    {pending > 0 && (
                      <div className="mt-1 text-[11px] text-muted-foreground tabular-nums">
                        Pendiente: {pending}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {requisition.purchaseOrders && requisition.purchaseOrders.length > 0 && (
        <div className="px-5 py-3 border-t border-border">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
            <TruckIcon className="size-3.5" />
            Órdenes de Compra adjudicadas ({requisition.purchaseOrders.length})
          </div>
          <ul className="space-y-1.5">
            {requisition.purchaseOrders.map((po) => (
              <li
                key={po.id}
                className="flex items-center justify-between gap-2 rounded-md border border-border bg-[#fafafa] px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-foreground truncate">
                    {po.orderNumber}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {po.supplierName}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <OrderStatusBadge status={po.status} />
                  {po.totalAmount != null && (
                    <span className="text-xs tabular-nums text-muted-foreground">
                      ${Number(po.totalAmount).toLocaleString()}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="px-5 py-4 border-t border-border space-y-2">
        {canSubmit && (
          <Button
            className="w-full bg-[#7b1a1a] hover:bg-[#5c1212] text-white"
            disabled={loading}
            onClick={() =>
              handleAction(
                () => submitRequisitionForApproval(requisition.id),
                "Requisicion enviada para aprobacion"
              )
            }
          >
            {loading ? (
              <ArrowPathIcon className="size-4 animate-spin mr-2" />
            ) : (
              <PaperAirplaneIcon className="size-4 mr-2" />
            )}
            Enviar para Aprobacion
          </Button>
        )}
        {canApprove && (
          <Button
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            disabled={loading}
            onClick={() =>
              handleAction(
                () => approveRequisition(requisition.id, user!.id),
                "Requisicion aprobada"
              )
            }
          >
            <CheckCircleIcon className="size-4 mr-2" />
            Aprobar
          </Button>
        )}
        {canReject && (
          <Button
            variant="outline"
            className="w-full border-red-300 text-red-600 hover:bg-red-50"
            disabled={loading}
            onClick={() => {
              const reason = prompt("Motivo de rechazo:")
              if (!reason) return
              handleAction(
                () => rejectRequisition(requisition.id, user!.id, reason),
                "Requisicion rechazada"
              )
            }}
          >
            <XCircleIcon className="size-4 mr-2" />
            Rechazar
          </Button>
        )}
        {canConvertToPO && (
          <Button
            className="w-full bg-[#7b1a1a] hover:bg-[#5c1212] text-white"
            onClick={() => onConvert(requisition)}
          >
            <ShoppingCartIcon className="size-4 mr-2" />
            {requisition.status === "PARTIALLY_CONVERTED"
              ? "Adjudicar más cantidad a un proveedor"
              : "Convertir a Orden de Compra"}
          </Button>
        )}
        {canCancel && (
          <Button
            variant="ghost"
            className="w-full text-muted-foreground hover:text-red-600"
            disabled={loading}
            onClick={() =>
              handleAction(
                () => cancelRequisition(requisition.id),
                "Requisicion cancelada"
              )
            }
          >
            <NoSymbolIcon className="size-4 mr-2" />
            Cancelar Requisicion
          </Button>
        )}
      </div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 min-w-0">
      <span className="text-muted-foreground text-xs shrink-0">{label}</span>
      <span className="text-foreground font-medium text-sm truncate min-w-0 text-right">{value}</span>
    </div>
  )
}
