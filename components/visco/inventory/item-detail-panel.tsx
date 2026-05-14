"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { computeStatus, type Product } from "@/lib/mock-data"
import { InventoryStatusBadge } from "@/components/visco/status-badge"
import { Image as ImageIcon, Pencil, ShoppingCart } from "lucide-react"

export function ItemDetailPanel({
  product,
  onClose,
  onEdit,
}: {
  product: Product | null
  onClose: () => void
  onEdit: (p: Product) => void
}) {
  return (
    <Sheet open={!!product} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-md p-0 overflow-y-auto">
        <SheetHeader className="border-b border-border px-5 py-4">
          <SheetTitle className="font-serif text-lg">Item Details</SheetTitle>
        </SheetHeader>

        {product && (
          <div className="px-5 py-5 space-y-5">
            <div className="aspect-[5/3] rounded-lg bg-[#f5f5f7] border border-border grid place-items-center">
              <ImageIcon className="size-10 text-muted-foreground/50" aria-hidden />
            </div>

            <div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                <span>SKU {product.sku}</span>
                <span aria-hidden>•</span>
                <span>{product.sapCode}</span>
              </div>
              <h3 className="mt-1 font-serif text-xl font-semibold text-foreground">
                {product.name}
              </h3>
              <div className="mt-2">
                <InventoryStatusBadge status={computeStatus(product)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Stat label="Current Stock" value={`${product.currentStock} ${product.uom.toLowerCase()}`} />
              <Stat label="Reorder Point" value={`${product.reorderPoint}`} />
              <Stat label="Warehouse" value={product.warehouse} />
              <Stat label="Supplier" value={product.supplierName} />
            </div>

            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">Recent History</h4>
              <ul className="space-y-2">
                {product.history.length === 0 && (
                  <li className="text-xs text-muted-foreground">Sin movimientos registrados.</li>
                )}
                {product.history.map((h, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between rounded-md border border-border bg-[#fafafa] px-3 py-2 text-sm"
                  >
                    <div>
                      <div className="text-xs text-muted-foreground">{h.date}</div>
                      <div className="font-medium text-foreground">{h.description}</div>
                    </div>
                    <span
                      className={
                        h.delta < 0
                          ? "text-red-600 font-medium tabular-nums"
                          : "text-emerald-600 font-medium tabular-nums"
                      }
                    >
                      {h.delta > 0 ? "+" : ""}
                      {h.delta} units
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button
                variant="outline"
                className="bg-card"
                onClick={() => onEdit(product)}
              >
                <Pencil className="size-4" /> Edit Item
              </Button>
              <Button className="bg-[#7b1a1a] hover:bg-[#5c1212] text-white">
                <ShoppingCart className="size-4" /> Create PO
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
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
