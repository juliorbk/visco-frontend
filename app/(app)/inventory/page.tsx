"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { PageHeader } from "@/components/visco/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TagIcon } from "@heroicons/react/24/outline"
import {
  ArrowDownTrayIcon,
  FunnelIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ArrowsUpDownIcon,
  CubeIcon,
} from "@heroicons/react/24/outline"
import { fetchProducts } from "@/lib/services/inventory"
import { fetchCategories } from "@/lib/services/categories"
import type { ProductDTO, Category } from "@/lib/types"
import { InventoryStatusBadge, computeInventoryStatus } from "@/components/visco/status-badge"
import { ItemDetailPanel } from "@/components/visco/inventory/item-detail-panel"
import { AddItemModal } from "@/components/visco/inventory/add-item-modal"
import { CategoryManagerModal } from "@/components/visco/inventory/category-manager-modal"
import { cn } from "@/lib/utils"
import { useDebounce } from "@/hooks/use-debounce"
import { toast } from "sonner"

export default function InventoryPage() {
  const searchParams = useSearchParams()
  const initialSearch = searchParams.get("search") ?? ""

  const [products, setProducts] = useState<ProductDTO[]>([])
  const [loading, setLoading] = useState(true)

  // Búsqueda con debounce
  const [search, setSearch] = useState(initialSearch)
  const debouncedSearch = useDebounce(search, 500)

  // Filtros y ordenamiento
  const [category, setCategory] = useState<string>("all")
  const [categories, setCategories] = useState<Category[]>([])
  const [stockSort, setStockSort] = useState<"none" | "asc" | "desc">("none")
  const [hasStockOnly, setHasStockOnly] = useState(false)

  // UI states
  const [selected, setSelected] = useState<ProductDTO | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [editing, setEditing] = useState<ProductDTO | null>(null)
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false)

  // Paginación y refresco
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [refreshTick, setRefreshTick] = useState(0)
  const [expandedParents, setExpandedParents] = useState<Set<number>>(new Set())

  const loadCategories = useCallback(() => {
    fetchCategories(0, 200)
      .then((res) => setCategories(res.content ?? []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  // Reinicia página al cambiar búsqueda
  useEffect(() => {
    setPage(0)
  }, [debouncedSearch])

  // Fetch unificado con AbortController:
  // - Cancela el request anterior si el usuario cambia filtros
  //   antes de que llegue la respuesta, evitando race conditions
  //   y setState sobre componente desmontado.
  useEffect(() => {
    const controller = new AbortController()

    const fetchData = async () => {
      try {
        setLoading(true)

        const apiCategory = category === "all" ? "" : category
        const apiSortBy = stockSort === "none" ? "" : "stock"
        const apiSortDir = stockSort === "none" ? "" : stockSort

        const res = await fetchProducts(
          page,
          20,
          debouncedSearch,
          apiCategory,
          apiSortBy,
          apiSortDir,
          hasStockOnly,
          controller.signal
        )

        if (!controller.signal.aborted) {
          setProducts(res.content ?? [])
          setTotalPages(res.page.totalPages)
          setTotalElements(res.page.totalElements)
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          toast.error(
            err instanceof Error ? err.message : "Error al cargar productos"
          )
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    fetchData()
    return () => controller.abort()
  }, [page, debouncedSearch, category, stockSort, hasStockOnly, refreshTick])

  const mainCategories = useMemo(
    () => categories.filter((c) => c.parentId === null),
    [categories]
  )

  const subCategoriesByParent = useMemo(() => {
    const map = new Map<number, Category[]>()
    categories.forEach((c) => {
      if (c.parentId !== null) {
        if (!map.has(c.parentId)) map.set(c.parentId, [])
        map.get(c.parentId)!.push(c)
      }
    })
    return map
  }, [categories])

  const toggleStockSort = () => {
    setStockSort((current) => {
      if (current === "none") return "desc"
      if (current === "desc") return "asc"
      return "none"
    })
    setPage(0)
  }

  return (
    <div>
      <PageHeader
        title="Gestion de Inventario"
        subtitle="Gestiona productos, niveles de stock y puntos de reorden en todos los almacenes."
        actions={
          <>
            <DropdownMenu onOpenChange={(open) => { if (open) loadCategories() }}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "bg-card",
                    category !== "all" && "border-primary text-primary"
                  )}
                >
                  <FunnelIcon className="size-4 mr-2" />
                  {category === "all" ? "Filtros" : "Categoria Activa"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 max-h-[350px] overflow-y-auto"
              >
                <DropdownMenuRadioGroup
                  value={category}
                  onValueChange={(v) => {
                    setCategory(v)
                    setPage(0)
                  }}
                >
                  <DropdownMenuRadioItem value="all">
                    Todas las categorías
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
                {mainCategories.map((main) => {
                  const subs = subCategoriesByParent.get(main.id) ?? []
                  const isExpanded = expandedParents.has(main.id)
                  return (
                    <div key={main.id}>
                      <DropdownMenuItem
                        onSelect={(e) => {
                          e.preventDefault()
                          setExpandedParents((prev) => {
                            const next = new Set(prev)
                            if (next.has(main.id)) next.delete(main.id)
                            else next.add(main.id)
                            return next
                          })
                        }}
                        className="font-medium flex items-center gap-1.5"
                      >
                        {isExpanded ? (
                          <ChevronDownIcon className="size-3.5 shrink-0" />
                        ) : (
                          <ChevronRightIcon className="size-3.5 shrink-0" />
                        )}
                        {main.name}
                      </DropdownMenuItem>
                      {isExpanded && (
                        <DropdownMenuRadioGroup
                          value={category}
                          onValueChange={(v) => {
                            setCategory(v)
                            setPage(0)
                          }}
                        >
                          <DropdownMenuRadioItem
                            value={String(main.id)}
                            className="pl-9"
                          >
                            {main.name}
                          </DropdownMenuRadioItem>
                          {subs.map((sub) => (
                            <DropdownMenuRadioItem
                              key={sub.id}
                              value={String(sub.id)}
                              className="pl-12 text-muted-foreground"
                            >
                              {sub.name}
                            </DropdownMenuRadioItem>
                          ))}
                        </DropdownMenuRadioGroup>
                      )}
                    </div>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="sm"
              onClick={toggleStockSort}
              className={cn(
                "bg-card",
                stockSort !== "none" && "border-primary text-primary"
              )}
            >
              <ArrowsUpDownIcon className="size-4 mr-2" />
              Ordenar por Stock{" "}
              {stockSort === "desc"
                ? "(Desc)"
                : stockSort === "asc"
                  ? "(Asc)"
                  : ""}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setHasStockOnly((prev) => !prev)
                setPage(0)
              }}
              className={cn(
                "bg-card",
                hasStockOnly && "border-primary text-primary"
              )}
            >
              <CubeIcon className="size-4 mr-2" />
              {hasStockOnly ? "Con stock" : "Sin stock"}
            </Button>

            <Button variant="outline" size="sm" className="bg-card">
              <ArrowDownTrayIcon className="size-4 mr-2" /> Exportar
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-card"
              onClick={() => setCategoryManagerOpen(true)}
            >
              <TagIcon className="size-4 mr-2" /> Categorias
            </Button>
            <Button
              size="sm"
              className="bg-[#7b1a1a] hover:bg-[#5c1212] text-white"
              onClick={() => {
                setEditing(null)
                setAddOpen(true)
              }}
            >
              <PlusIcon className="size-4 mr-2" /> Agregar Item
            </Button>
          </>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o SKU…"
            className="pl-9 bg-card"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-muted-foreground bg-[#fafafa]">
                <th className="text-left font-medium px-5 py-3">Codigo</th>
                <th className="text-left font-medium px-5 py-3">Codigo SAP</th>
                <th className="text-left font-medium px-5 py-3">Nombre</th>
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
                  <td
                    colSpan={8}
                    className="px-5 py-10 text-center text-sm text-muted-foreground"
                  >
                    <ArrowPathIcon className="size-6 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-10 text-center text-sm text-muted-foreground"
                  >
                    No hay productos que coincidan con tu búsqueda.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => setSelected(p)}
                    className={cn(
                      "border-t border-border cursor-pointer transition-colors",
                      selected?.id === p.id
                        ? "bg-[#fde8e8]/60"
                        : "hover:bg-[#fafafa]"
                    )}
                  >
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                      {p.internalCode}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                      {p.sapCode}
                    </td>
                    <td className="px-5 py-3 font-medium text-foreground">
                      {p.name}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {p.categoryName ?? "-"}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                      {p.sku}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {p.uom}
                    </td>
                    <td className="px-5 py-3 tabular-nums">
                      {p.totalStock}{" "}
                    </td>
                    <td className="px-5 py-3">
                      <InventoryStatusBadge status={computeInventoryStatus(p)} />
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
        onSave={() => {
          setPage(0)
          setRefreshTick((prev) => prev + 1)
        }}
      />

      <CategoryManagerModal
        open={categoryManagerOpen}
        onOpenChange={(o) => {
          setCategoryManagerOpen(o)
          if (!o) loadCategories()
        }}
        onCategoriesChanged={loadCategories}
      />
    </div>
  )
}