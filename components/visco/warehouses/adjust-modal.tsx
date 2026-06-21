"use client"

import { useEffect, useRef, useState } from "react"
import {
  XMarkIcon,
  ArrowPathIcon,
  EqualsIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  TrashIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { adjustStockBatch, fetchWarehouses } from "@/lib/services/warehouse"
import { fetchProducts, type ProductFilters } from "@/lib/services/inventory"
import { getCachedUser } from "@/lib/auth-client"
import type { ProductDTO, WarehouseResponse } from "@/lib/types"
import { useDebounce } from "@/hooks/use-debounce"
import { toast } from "sonner"

type SearchField = "name" | "sapCode" | "sku"

const SEARCH_FIELD_PLACEHOLDERS: Record<SearchField, string> = {
  name: "Buscar por nombre…",
  sapCode: "Buscar por código SAP…",
  sku: "Buscar por SKU…",
}

const PRODUCT_SEARCH_PAGE_SIZE = 50

interface LineItem {
  id: number
  productId: number
  productName: string
  sku: string
  currentStock: number
  reorderPoint: number
  newStock: number
}

export function AdjustModal({
  open,
  onOpenChange,
  onDone,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  onDone: () => void
}) {
  const nextLineIdRef = useRef(1)
  const [warehouses, setWarehouses] = useState<WarehouseResponse[]>([])
  const [products, setProducts] = useState<ProductDTO[]>([])
  const [warehouseId, setWarehouseId] = useState<number>(0)
  const [lines, setLines] = useState<LineItem[]>([])
  const [reason, setReason] = useState("")
  const [saving, setSaving] = useState(false)
  const [loadingWarehouses, setLoadingWarehouses] = useState(false)

  const [searchField, setSearchField] = useState<SearchField>("name")
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  const [loadingSearch, setLoadingSearch] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      setLoadingWarehouses(true)
      fetchWarehouses()
        .then((wh) => {
          setWarehouses(wh)
          if (wh.length > 0) setWarehouseId(wh[0].id)
        })
        .catch(() => toast.error("Error al cargar almacenes"))
        .finally(() => setLoadingWarehouses(false))
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const controller = new AbortController()
    const fetchData = async () => {
      setLoadingSearch(true)
      try {
        const trimmed = debouncedSearchTerm.trim()
        const filters: ProductFilters = {}
        if (trimmed) filters[searchField] = trimmed
        const res = await fetchProducts(0, PRODUCT_SEARCH_PAGE_SIZE, filters, controller.signal)
        if (!controller.signal.aborted) {
          setProducts(res.content ?? [])
        }
      } catch {
      } finally {
        if (!controller.signal.aborted) {
          setLoadingSearch(false)
        }
      }
    }
    fetchData()
    return () => controller.abort()
  }, [debouncedSearchTerm, searchField, open])

  useEffect(() => {
    if (!searchOpen) return
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [searchOpen])

  const close = () => {
    onOpenChange(false)
    setLines([])
    setReason("")
    setSearchTerm("")
    setSearchOpen(false)
    nextLineIdRef.current = 1
  }

  const addLine = (product: ProductDTO) => {
    if (lines.some((l) => l.productId === product.id)) {
      toast.error("Este producto ya está en la lista")
      return
    }
    setLines((prev) => [
      ...prev,
      {
        id: nextLineIdRef.current++,
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        currentStock: product.totalStock,
        reorderPoint: product.reorderPoint,
        newStock: product.totalStock,
      },
    ])
    setSearchTerm("")
    setSearchOpen(false)
  }

  const handleSubmit = async () => {
    const user = getCachedUser()
    if (!user) { toast.error("Debes iniciar sesión"); return }
    if (lines.length === 0) { toast.error("Agrega al menos un producto"); return }
    if (!warehouseId) { toast.error("Selecciona un almacén"); return }

    for (const line of lines) {
      if (line.newStock < 0) {
        toast.error(`Stock inválido para ${line.productName}`)
        return
      }
    }

    setSaving(true)
    try {
      const movements = await adjustStockBatch({
        warehouseId,
        items: lines.map((l) => ({ productId: l.productId, newStock: l.newStock })),
        reason: reason || null,
        createdById: user.id,
      })
      toast.success(`${lines.length} producto(s) ajustado(s)`)

      const belowReorder = lines.filter((l) => l.newStock <= l.reorderPoint)
      if (belowReorder.length > 0) {
        const names = belowReorder.map((l) => l.productName).join(", ")
        toast.warning(
          <div className="flex items-center gap-2">
            <ExclamationTriangleIcon className="size-4" />
            <span>Productos por debajo del punto de reorden: {names}</span>
          </div>,
          { duration: 6000 }
        )
      }

      onDone()
      close()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al ajustar stock")
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  const totalQty = lines.reduce((s, l) => s + l.newStock, 0)

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-[#f3f4f6]">
          <div>
            <h2 className="text-xl font-bold text-[#111827]">Ajustar Stock</h2>
            <p className="text-sm text-[#6b7280] mt-0.5">
              Ajusta manualmente el stock de productos en un almacén.
            </p>
          </div>
          <button onClick={close} className="p-2 hover:bg-[#f5f5f7] rounded-lg transition-colors">
            <XMarkIcon className="w-5 h-5 text-[#6b7280]" />
          </button>
        </div>

        {loadingWarehouses ? (
          <div className="flex items-center justify-center py-12">
            <ArrowPathIcon className="size-6 animate-spin text-[#6b7280]" />
          </div>
        ) : (
          <div>
            <div className="p-6 space-y-5">
              <div className="space-y-1.5">
                <Label>Almacén</Label>
                <Select value={String(warehouseId)} onValueChange={(v) => setWarehouseId(Number(v))} disabled={saving}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {warehouses.map((w) => (
                      <SelectItem key={w.id} value={String(w.id)}>{w.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Agregar producto</Label>
                <div className="relative" ref={searchRef}>
                  <div className="flex gap-2">
                    <Select
                      value={searchField}
                      onValueChange={(v) => setSearchField(v as SearchField)}
                      disabled={saving}
                    >
                      <SelectTrigger className="w-[150px] bg-card">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Nombre</SelectItem>
                        <SelectItem value="sapCode">Cód. SAP</SelectItem>
                        <SelectItem value="sku">SKU</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="relative flex-1">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        placeholder={SEARCH_FIELD_PLACEHOLDERS[searchField]}
                        className="pl-9 bg-card"
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value)
                          setSearchOpen(true)
                        }}
                        onFocus={() => setSearchOpen(true)}
                        disabled={saving}
                      />
                    </div>
                  </div>

                  {searchOpen && (
                    <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-card shadow-lg max-h-60 overflow-y-auto">
                      {loadingSearch ? (
                        <div className="p-3 text-sm text-muted-foreground text-center">
                          <ArrowPathIcon className="size-4 animate-spin inline mr-2" />
                          Buscando…
                        </div>
                      ) : products.length === 0 ? (
                        <div className="p-3 text-sm text-muted-foreground text-center">
                          {debouncedSearchTerm.trim()
                            ? "No se encontraron productos"
                            : "No hay productos registrados"}
                        </div>
                      ) : (
                        products.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            className="w-full text-left px-3 py-2 text-sm hover:bg-secondary transition-colors border-b last:border-b-0 border-border/50 flex items-center justify-between"
                            onClick={() => addLine(p)}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-foreground">{p.name}</div>
                              <div className="text-xs text-muted-foreground">
                                SKU: {p.sku} · SAP: {p.sapCode} · Stock actual: {p.totalStock} {p.uom}
                              </div>
                            </div>
                            <PlusIcon className="size-4 shrink-0 text-muted-foreground ml-2" />
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-[#f3f4f6]">
                {lines.length === 0 ? (
                  <div className="p-6 text-center text-sm text-[#6b7280]">
                    Sin productos agregados aún.
                  </div>
                ) : (
                  <>
                    <ul>
                      {lines.map((l) => {
                        const belowReorder = l.newStock <= l.reorderPoint
                        return (
                          <li
                            key={l.id}
                            className="flex items-center justify-between gap-3 px-4 py-3 border-b last:border-b-0 border-[#f3f4f6] text-sm"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-[#111827] truncate">{l.productName}</div>
                              <div className="text-xs text-[#6b7280]">
                                {l.sku} · Actual: {l.currentStock}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <div className="w-20">
                                <Input
                                  type="number"
                                  min="0"
                                  className={`h-8 text-xs text-center ${belowReorder ? "border-amber-400" : ""}`}
                                  value={l.newStock ?? ""}
                                  onChange={(e) => {
                                    const v = Math.max(0, parseInt(e.target.value, 10) || 0)
                                    setLines((prev) =>
                                      prev.map((line) =>
                                        line.id === l.id ? { ...line, newStock: v } : line,
                                      ),
                                    )
                                  }}
                                  disabled={saving}
                                />
                              </div>
                              <button
                                onClick={() => setLines((prev) => prev.filter((line) => line.id !== l.id))}
                                className="text-[#6b7280] hover:text-red-600 shrink-0"
                                aria-label="Eliminar línea"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                    <div className="flex items-center justify-between px-4 py-3 border-t border-[#f3f4f6] bg-[#fafafa] rounded-b-lg">
                      <span className="text-sm font-medium text-[#111827]">Total productos</span>
                      <span className="font-semibold text-lg">{lines.length}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Motivo <span className="text-[#6b7280]">(opcional)</span></Label>
                <Textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Razón del ajuste…" disabled={saving} />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-[#f3f4f6]">
              <button
                type="button"
                onClick={close}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-[#6b7280] hover:text-[#111827] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving || loadingWarehouses || lines.length === 0}
                className="px-5 py-2 bg-[#7b1a1a] text-white rounded-lg font-medium hover:bg-[#5c1212] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {saving ? (
                  <><ArrowPathIcon className="size-4 animate-spin" /> Ajustando…</>
                ) : (
                  <><EqualsIcon className="size-4" /> Ajustar ({lines.length})</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
