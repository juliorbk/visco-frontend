"use client"

import { useCallback, useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { fetchWarehouseProducts } from "@/lib/services/warehouse"
import { fetchProduct } from "@/lib/services/inventory"
import type { ProductOnStock, ProductDTO } from "@/lib/types"
import { InventoryStatusBadge } from "@/components/visco/status-badge"
import { ItemDetailPanel } from "@/components/visco/inventory/item-detail-panel"
import { MagnifyingGlassIcon, ArrowPathIcon, ChevronLeftIcon, ChevronRightIcon, CubeIcon } from "@heroicons/react/24/outline"
import { toast } from "sonner"

const PAGE_SIZE = 20

export function WarehouseInventoryTable({
  warehouseId,
  warehouseName,
}: {
  warehouseId: number
  warehouseName: string
}) {
  const [products, setProducts] = useState<ProductOnStock[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const [selectedProduct, setSelectedProduct] = useState<ProductDTO | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    setPage(0)
  }, [debouncedSearch])

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetchWarehouseProducts(warehouseId, debouncedSearch || undefined, page, PAGE_SIZE)
      setProducts(res.content ?? [])
      setTotalPages(res.page.totalPages)
      setTotalElements(res.page.totalElements)
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [warehouseId, debouncedSearch, page])

  useEffect(() => { loadProducts() }, [loadProducts])

  const handleRowClick = async (p: ProductOnStock) => {
    setLoadingDetail(true)
    try {
      const detail = await fetchProduct(p.id)
      setSelectedProduct(detail)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al cargar detalle del producto")
    } finally {
      setLoadingDetail(false)
    }
  }

  const computeStatus = (p: ProductOnStock) => {
    if (p.currentStock <= 0) return "Sin stock"
    if (p.currentStock < p.reorderPoint) return "Bajo stock"
    if (p.maxStock != null && p.currentStock >= p.maxStock) return "Stock excedido"
    return "En stock"
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar producto por nombre o SKU…"
            className="pl-9 bg-card"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {warehouseName && (
          <span className="text-sm text-muted-foreground hidden sm:inline">
            <CubeIcon className="size-3.5 inline mr-1" />
            {warehouseName}
          </span>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-muted-foreground bg-[#fafafa]">
                <th className="text-left font-medium px-5 py-3">Codigo</th>
                <th className="text-left font-medium px-5 py-3">Codigo SAP</th>
                <th className="text-left font-medium px-5 py-3">Producto</th>
                <th className="text-left font-medium px-5 py-3">Categoria</th>
                <th className="text-left font-medium px-5 py-3">SKU</th>
                <th className="text-left font-medium px-5 py-3">UOM</th>
                <th className="text-left font-medium px-5 py-3">Stock</th>
                <th className="text-left font-medium px-5 py-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-sm text-muted-foreground">
                    <ArrowPathIcon className="size-6 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-sm text-muted-foreground">
                    No hay productos en este almacén.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => handleRowClick(p)}
                    className="border-t border-border hover:bg-[#fafafa] transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{p.internalCode}</td>
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{p.sapCode}</td>
                    <td className="px-5 py-3 font-medium text-foreground">{p.name}</td>
                    <td className="px-5 py-3 text-muted-foreground">{p.categoryName ?? "-"}</td>
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{p.sku}</td>
                    <td className="px-5 py-3 text-muted-foreground">{p.uom}</td>
                    <td className="px-5 py-3 tabular-nums">{p.currentStock}</td>
                    <td className="px-5 py-3">
                      <InventoryStatusBadge status={computeStatus(p)} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-border bg-[#fafafa]">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0 || loading}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="text-muted-foreground"
            >
              <ChevronLeftIcon className="size-4 mr-1" /> Anterior
            </Button>

            <span className="text-sm font-medium text-muted-foreground">
              Página {page + 1} de {totalPages} · {totalElements} productos
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1 || loading}
              onClick={() => setPage((p) => p + 1)}
              className="text-muted-foreground"
            >
              Siguiente <ChevronRightIcon className="size-4 ml-1" />
            </Button>
          </div>
        )}
      </div>

      {loadingDetail && (
        <div className="fixed inset-0 bg-black/20 z-40 flex items-center justify-center">
          <ArrowPathIcon className="size-8 animate-spin text-white" />
        </div>
      )}

      <ItemDetailPanel
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onEdit={(p) => {
          setSelectedProduct(null)
          toast.info("Edita el producto desde la sección Inventario General")
        }}
      />
    </div>
  )
}
