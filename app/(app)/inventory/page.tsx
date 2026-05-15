"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { PageHeader } from "@/components/visco/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Download, Filter, Plus, Search, Loader2 } from "lucide-react"
import { fetchProducts } from "@/lib/services/inventory"
import type { ProductDTO } from "@/lib/types"
import { InventoryStatusBadge } from "@/components/visco/status-badge"
import { ItemDetailPanel } from "@/components/visco/inventory/item-detail-panel"
import { AddItemModal } from "@/components/visco/inventory/add-item-modal"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export default function InventoryPage() {
  const [products, setProducts] = useState<ProductDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<string>("all")
  const [selected, setSelected] = useState<ProductDTO | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [editing, setEditing] = useState<ProductDTO | null>(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetchProducts()
      setProducts(res.content ?? [])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al cargar productos")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase())
      const matchesCat = category === "all" || (p.categoryName?.toLowerCase() === category.toLowerCase())
      return matchesSearch && matchesCat
    })
  }, [products, search, category])

  const computeStatus = (p: ProductDTO) => {
    if (p.totalStock <= 0) return "Sin stock"
    if (p.totalStock < p.reorderPoint) return "Bajo stock"
    return "En stock"
  }

  return (
    <div>
      <PageHeader
        title="Inventory Management"
        subtitle="Gestiona productos, niveles de stock y puntos de reorden en todos los almacenes."
        actions={
          <>
            <Button variant="outline" size="sm" className="bg-card">
              <Filter className="size-4" /> Filters
            </Button>
            <Button variant="outline" size="sm" className="bg-card">
              <Download className="size-4" /> Export
            </Button>
            <Button
              size="sm"
              className="bg-[#7b1a1a] hover:bg-[#5c1212] text-white"
              onClick={() => {
                setEditing(null)
                setAddOpen(true)
              }}
            >
              <Plus className="size-4" /> Add Item
            </Button>
          </>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o SKU…"
            className="pl-9 bg-card"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[11px] uppercase tracking-wider text-muted-foreground bg-[#fafafa]">
              <th className="text-left font-medium px-5 py-3">Código</th>
              <th className="text-left font-medium px-5 py-3">Item Name</th>
              <th className="text-left font-medium px-5 py-3">Category</th>
              <th className="text-left font-medium px-5 py-3">SKU</th>
              <th className="text-left font-medium px-5 py-3">Stock</th>
              <th className="text-left font-medium px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-sm text-muted-foreground">
                  <Loader2 className="size-5 animate-spin mx-auto" />
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-sm text-muted-foreground">
                  No hay productos que coincidan con tu búsqueda.
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => setSelected(p)}
                  className={cn(
                    "border-t border-border cursor-pointer transition-colors",
                    selected?.id === p.id ? "bg-[#fde8e8]/40" : "hover:bg-[#fafafa]",
                  )}
                >
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{p.internalCode}</td>
                  <td className="px-5 py-3 font-medium text-foreground">{p.name}</td>
                  <td className="px-5 py-3 text-muted-foreground">{p.categoryName ?? "-"}</td>
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{p.sku}</td>
                  <td className="px-5 py-3 tabular-nums">
                    {p.totalStock}{" "}
                    <span className="text-xs text-muted-foreground">{p.uom.toLowerCase()}</span>
                  </td>
                  <td className="px-5 py-3">
                    <InventoryStatusBadge status={computeStatus(p)} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>

      <ItemDetailPanel
        product={selected}
        onClose={() => setSelected(null)}
        onEdit={(p) => {
          setEditing(p)
          setAddOpen(true)
        }}
      />

      <AddItemModal
        open={addOpen}
        onOpenChange={(o) => {
          setAddOpen(o)
          if (!o) setEditing(null)
        }}
        editing={editing}
        onSave={() => load()}
      />
    </div>
  )
}
