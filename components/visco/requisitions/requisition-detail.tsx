"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import type { RequisitionResponse } from "@/lib/types"
import { OrderStatusBadge } from "@/components/visco/status-badge"
import { getCachedUser } from "@/lib/auth-client"
import {
  submitRequisitionForApproval,
  approveRequisition,
  rejectRequisition,
  cancelRequisition,
  markRequisitionAsConverted,
} from "@/lib/services/requisitions"
import {
  Loader2,
  Send,
  CheckCircle,
  XCircle,
  ShoppingCart,
  Ban,
  Undo2,
} from "lucide-react"
import { toast } from "sonner"

const statusMap: Record<string, string> = {
  DRAFT: "Borrador",
  PENDING: "Pendiente",
  AWAITING_APPROVAL: "Esperando Aprobación",
  APPROVED: "Aprobado",
  REJECTED: "Rechazado",
  CANCELLED: "Cancelado",
  CONVERTED: "Convertido a PO",
}

export function RequisitionDetail({
  requisition,
  onUpdate,
  onConvert,
}: {
  requisition: RequisitionResponse | null
  onUpdate: () => void
  onConvert: (req: RequisitionResponse) => void
}) {
  const [loading, setLoading] = useState(false)

  if (!requisition) {
    return (
      <div className="bg-white rounded-lg border border-border p-8 text-center">
        <p className="text-muted-foreground text-sm">
          Selecciona una requisición de la tabla para ver los detalles
        </p>
      </div>
    )
  }

  const user = getCachedUser()
  const isApprover = user?.role === "MANAGER" || user?.role === "ADMIN"

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

  const canSubmit = requisition.status === "PENDING" || requisition.status === "DRAFT"
  const canApprove = requisition.status === "AWAITING_APPROVAL" && isApprover
  const canReject = requisition.status === "AWAITING_APPROVAL" && isApprover
  const canConvertToPO = requisition.status === "APPROVED"
  const canCancel =
    requisition.status !== "CANCELLED" &&
    requisition.status !== "CONVERTED" &&
    requisition.status !== "REJECTED"

  const totalItems = requisition.items.length

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
        </div>
      </div>

      <div className="px-5 py-4 space-y-3 text-sm">
        <DetailRow label="Solicitante" value={requisition.requestedBy} />
        <DetailRow label="Centro de Costo" value={requisition.areaName} />
        <DetailRow label="Creada" value={new Date(requisition.createdAt).toLocaleDateString()} />
        {requisition.approvedBy && (
          <DetailRow label="Aprobada por" value={requisition.approvedBy} />
        )}
        {requisition.approvedAt && (
          <DetailRow
            label="Fecha de aprobación"
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
            <div className="font-semibold mb-1">Notas de aprobación</div>
            {requisition.approvalNotes}
          </div>
        )}
      </div>

      {requisition.description && (
        <div className="px-5 py-3 border-t border-border">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
            Descripción
          </div>
          <p className="text-sm text-foreground">{requisition.description}</p>
        </div>
      )}

      <div className="px-5 py-3 border-t border-border">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
          Artículos ({totalItems})
        </div>
        <div className="space-y-2">
          {requisition.items.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-md border border-border px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-foreground truncate">
                  {item.productName}
                </div>
                <div className="text-xs text-muted-foreground font-mono">{item.productSku}</div>
              </div>
              <span className="text-sm font-semibold tabular-nums ml-2">
                x{item.quantity}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 py-4 border-t border-border space-y-2">
        {canSubmit && (
          <Button
            className="w-full bg-[#7b1a1a] hover:bg-[#5c1212] text-white"
            disabled={loading}
            onClick={() =>
              handleAction(
                () => submitRequisitionForApproval(requisition.id),
                "Requisición enviada para aprobación"
              )
            }
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin mr-2" />
            ) : (
              <Send className="size-4 mr-2" />
            )}
            Enviar para Aprobación
          </Button>
        )}
        {canApprove && (
          <Button
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            disabled={loading}
            onClick={() =>
              handleAction(
                () => approveRequisition(requisition.id, user!.id),
                "Requisición aprobada"
              )
            }
          >
            <CheckCircle className="size-4 mr-2" />
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
                "Requisición rechazada"
              )
            }}
          >
            <XCircle className="size-4 mr-2" />
            Rechazar
          </Button>
        )}
        {canConvertToPO && (
          <Button
            className="w-full bg-[#7b1a1a] hover:bg-[#5c1212] text-white"
            onClick={() => onConvert(requisition)}
          >
            <ShoppingCart className="size-4 mr-2" />
            Convertir a Pedido de Compra
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
                "Requisición cancelada"
              )
            }
          >
            <Ban className="size-4 mr-2" />
            Cancelar Requisición
          </Button>
        )}
      </div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="text-foreground font-medium text-sm">{value}</span>
    </div>
  )
}
