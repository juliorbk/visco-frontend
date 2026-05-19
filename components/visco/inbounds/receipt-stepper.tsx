import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PurchaseOrderStatus } from "@/lib/types"

const STEPS = ["Aprobado", "En Tránsito", "Parcial", "Recibido"] as const

const STATUS_TO_STEP: Record<string, number> = {
  APPROVED: 0,
  IN_TRANSIT: 1,
  PARTIALLY_DELIVERED: 2,
  DELIVERED: 3,
  COMPLETED: 3,
  CANCELLED: -1,
  REJECTED: -1,
}

export function ReceiptStepper({ status }: { status?: PurchaseOrderStatus | string }) {
  const current = status ? STATUS_TO_STEP[status] ?? 0 : 0

  if (current === -1) return null

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
      <div className="flex items-center justify-between">
        {STEPS.map((label, i) => {
          const isDone = i < current
          const isCurrent = i === current
          return (
            <div key={label} className="flex-1 flex items-center last:flex-none">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    "size-9 rounded-full grid place-items-center text-xs font-semibold ring-2 transition-colors",
                    isDone && "bg-[#1f1f1f] text-white ring-[#1f1f1f]",
                    isCurrent && "bg-[#7b1a1a] text-white ring-[#7b1a1a]",
                    !isDone && !isCurrent && "bg-card text-muted-foreground ring-border",
                  )}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isDone ? <Check className="size-4" /> : i + 1}
                </div>
                <span
                  className={cn(
                    "text-[11px] font-medium uppercase tracking-wider",
                    (isDone || isCurrent) ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-px mx-2 -mt-5",
                    i < current ? "bg-[#1f1f1f]" : "bg-border",
                  )}
                  aria-hidden
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
