"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import type { RequisitionResponse } from "@/lib/types"
import { OrderStatusBadge } from "@/components/visco/status-badge"
import { getCachedUser } from "@/lib/auth-client"
import { canApproveRequisitions } from "@/lib/permissions"
import {
  submitRequisitionForApproval,
  approveRequisition,
  rejectRequisition,
  cancelRequisition,
  markRequisitionAsConverted,
} from "@/lib/services/requisitions"
import {
  ArrowPathIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  XCircleIcon,
  ShoppingCartIcon,
  NoSymbolIcon,
} from "@heroicons/react/24/outline"
import { toast } from "sonner"

const statusMap: Record<string, string> = {
  DRAFT: "Draft",
  PENDING: "Pending",
  AWAITING_APPROVAL: "Awaiting Approval",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
  CONVERTED: "Converted to PO",
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
          Select a requisition from the table to view its details
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
        <DetailRow label="Requester" value={requisition.requestedBy} />
        <DetailRow label="Cost Center" value={requisition.areaName} />
        <DetailRow label="Created" value={new Date(requisition.createdAt).toLocaleDateString()} />
        {requisition.approvedBy && (
          <DetailRow label="Approved by" value={requisition.approvedBy} />
        )}
        {requisition.approvedAt && (
          <DetailRow
            label="Approval date"
            value={new Date(requisition.approvedAt).toLocaleDateString()}
          />
        )}
        {requisition.rejectionReason && (
          <div className="rounded-md bg-red-50 border border-red-200 p-3 text-xs text-red-700">
            <div className="font-semibold mb-1">Rejection reason</div>
            {requisition.rejectionReason}
          </div>
        )}
        {requisition.approvalNotes && (
          <div className="rounded-md bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-700">
            <div className="font-semibold mb-1">Approval notes</div>
            {requisition.approvalNotes}
          </div>
        )}
      </div>

      {requisition.description && (
        <div className="px-5 py-3 border-t border-border">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
            Description
          </div>
          <p className="text-sm text-foreground break-words">{requisition.description}</p>
        </div>
      )}

      <div className="px-5 py-3 border-t border-border">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
          Items ({totalItems})
        </div>
        <div className="space-y-2">
          {requisition.items.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2"
            >
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
                "Requisition submitted for approval"
              )
            }
          >
            {loading ? (
              <ArrowPathIcon className="size-4 animate-spin mr-2" />
            ) : (
              <PaperAirplaneIcon className="size-4 mr-2" />
            )}
            Submit for Approval
          </Button>
        )}
        {canApprove && (
          <Button
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            disabled={loading}
            onClick={() =>
              handleAction(
                () => approveRequisition(requisition.id, user!.id),
                "Requisition approved"
              )
            }
          >
            <CheckCircleIcon className="size-4 mr-2" />
            Approve
          </Button>
        )}
        {canReject && (
          <Button
            variant="outline"
            className="w-full border-red-300 text-red-600 hover:bg-red-50"
            disabled={loading}
            onClick={() => {
              const reason = prompt("Rejection reason:")
              if (!reason) return
              handleAction(
                () => rejectRequisition(requisition.id, user!.id, reason),
                "Requisition rejected"
              )
            }}
          >
            <XCircleIcon className="size-4 mr-2" />
            Reject
          </Button>
        )}
        {canConvertToPO && (
          <Button
            className="w-full bg-[#7b1a1a] hover:bg-[#5c1212] text-white"
            onClick={() => onConvert(requisition)}
          >
            <ShoppingCartIcon className="size-4 mr-2" />
            Convert to Purchase Order
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
                "Requisition cancelled"
              )
            }
          >
            <NoSymbolIcon className="size-4 mr-2" />
            Cancel Requisition
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
