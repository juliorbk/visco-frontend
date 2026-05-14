import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

const STEPS = ["Borrador", "Pendiente", "Aprobado", "Enviado", "Recibido"] as const

const STATUS_TO_STEP: Record<string, number> = {
  BORRADOR: 0,
  PENDIENTE: 1,
  APROBADO: 2,
  EN_TRANSITO: 3,
  RECIBIDO: 4,
  CANCELADO: -1,
}

export function OrderStepper({ status }: { status?: string }) {
  const current = status ? STATUS_TO_STEP[status] ?? 0 : 1

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
                    isDone &&
                      "bg-[#1f1f1f] text-white ring-[#1f1f1f]",
                    isCurrent &&
                      "bg-[#7b1a1a] text-white ring-[#7b1a1a]",
                    !isDone && !isCurrent &&
                      "bg-card text-muted-foreground ring-border",
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
