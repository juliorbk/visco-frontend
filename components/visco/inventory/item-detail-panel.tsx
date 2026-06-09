"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import type { ProductDTO } from "@/lib/types"
import { InventoryStatusBadge } from "@/components/visco/status-badge"
import { StockActionModal } from "@/components/visco/inventory/stock-action-modal"
import { ProductMovementsHistory } from "@/components/visco/inventory/product-movements-history"
import { ProductStockBreakdownView } from "@/components/visco/warehouses/product-stock-breakdown"
import { PhotoIcon, PencilIcon, ShoppingCartIcon, ArrowsRightLeftIcon, EqualsIcon, ArrowPathIcon, ClockIcon } from "@heroicons/react/24/outline"

export function ItemDetailPanel({
  product,
  onClose,
  onEdit,
}: {
  product: ProductDTO | null
  onClose: () => void
  onEdit: (p: ProductDTO) => void
}) {
  const [stockActionOpen, setStockActionOpen] = useState(false)
  const computeStatus = (p: ProductDTO) => {
    if (p.totalStock <= 0) return "Sin stock"
    if (p.totalStock < p.reorderPoint) return "Bajo stock"
    if (p.maxStock != null && p.totalStock >= p.maxStock) return "Stock excedido"
    return "En stock"
  }

  return (
    <Sheet open={!!product} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-md p-0 overflow-y-auto">
        <SheetHeader className="border-b border-border px-5 py-4">
          <SheetTitle className="font-serif text-lg">Detalles del Item</SheetTitle>
        </SheetHeader>

        {product && (
          <div className="px-5 py-5 space-y-5">
            <div className="aspect-[5/3] rounded-lg bg-[#f5f5f7] border border-border grid place-items-center">
              <PhotoIcon className="size-10 text-muted-foreground/50" aria-hidden />
            </div>

            <div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                <span>SKU {product.sku}</span>
                <span aria-hidden>•</span>
                <span>{product.internalCode}</span>
              </div>
              <h3 className="mt-1 font-serif text-xl font-semibold text-foreground">
                {product.name}
              </h3>
              {product.description && (
                <p className="mt-1 text-xs text-muted-foreground">{product.description}</p>
              )}
              <div className="mt-2">
                <InventoryStatusBadge status={computeStatus(product)} />
              </div>
            </div>

            <Tabs defaultValue="info">
              <TabsList className="w-full">
                <TabsTrigger value="info" className="flex-1">Info</TabsTrigger>
                <TabsTrigger value="history" className="flex-1">
                  <ClockIcon className="size-3.5 mr-1" /> Historial
                </TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Stat label="Stock Total" value={`${product.totalStock} ${product.uom}`} />
                  <Stat label="Stock Pendiente" value={`${product.totalPendingStock}`} />
                  <Stat label="Punto de Reorden" value={`${product.reorderPoint}`} />
                  <Stat label="Stock Maximo" value={product.maxStock != null ? `${product.maxStock}` : "—"} />
                  <Stat label="Proveedor" value={product.supplierName ?? "-"} />
                  <Stat label="Categoria" value={product.categoryName ?? "-"} />
                  <Stat label="Codigo SAP" value={product.sapCode} />
                </div>

                <ProductStockBreakdownView productId={product.id} />

                <div className="flex flex-col gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="bg-card"
                    onClick={() => onEdit(product)}
                  >
                    <PencilIcon className="size-4" /> Editar Item
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-card"
                    onClick={() => setStockActionOpen(true)}
                  >
                    <ArrowPathIcon className="size-4" /> Acciones de Stock
                  </Button>
                  <Button className="bg-[#7b1a1a] hover:bg-[#5c1212] text-white">
                    <ShoppingCartIcon className="size-4" /> Crear OC
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="history" className="mt-4">
                <ProductMovementsHistory productId={product.id} />
              </TabsContent>
            </Tabs>
          </div>
        )}

        <StockActionModal
          product={product}
          open={stockActionOpen}
          onOpenChange={setStockActionOpen}
          onDone={onClose}
        />
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
