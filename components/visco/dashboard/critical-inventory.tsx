import { AlertTriangle, ShoppingCart } from "lucide-react"
import { products, computeStatus } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

export function CriticalInventory() {
  const items = products
    .filter((p) => computeStatus(p) !== "En stock")
    .slice(0, 3)
    .map((p) => ({
      name: p.name,
      stock: p.currentStock,
      min: p.reorderPoint,
      severity: p.currentStock === 0 ? ("critical" as const) : ("warning" as const),
    }))

  return (
    <div className="rounded-xl border border-border bg-card shadow-xs h-full">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
        <AlertTriangle className="size-4 text-amber-500" />
        <h3 className="font-serif text-lg font-semibold">Inventario Crítico</h3>
      </div>
      <ul className="p-3 space-y-2">
        {items.map((it) => (
          <li
            key={it.name}
            className={cn(
              "flex items-center gap-3 rounded-lg p-3 ring-1 ring-inset",
              it.severity === "critical"
                ? "bg-red-50 ring-red-200"
                : "bg-amber-50 ring-amber-200",
            )}
          >
            <div
              className={cn(
                "size-9 rounded-md grid place-items-center shrink-0",
                it.severity === "critical" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700",
              )}
            >
              <AlertTriangle className="size-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground truncate">{it.name}</div>
              <div className="text-xs text-muted-foreground">
                Stock restante: <span className="font-medium text-foreground">{it.stock}</span>{" "}
                <span className="opacity-70">unidades</span> · Mín. {it.min}
              </div>
            </div>
            <button
              aria-label={`Reordenar ${it.name}`}
              className="size-8 grid place-items-center rounded-md bg-white ring-1 ring-border text-[#7b1a1a] hover:bg-[#fde8e8]"
            >
              <ShoppingCart className="size-4" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
