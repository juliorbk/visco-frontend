"use client"

import { useEffect, useRef, useState } from "react"
import {
  XMarkIcon,
  ArrowPathIcon,
  ArrowsRightLeftIcon,
  ChevronUpDownIcon,
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
import { transferStock, fetchWarehouses, fetchProductsOnStock } from "@/lib/services/warehouse"
import { getCachedUser } from "@/lib/auth-client"
import type { ProductOnStock, WarehouseResponse } from "@/lib/types"
import { useDebounce } from "@/hooks/use-debounce"
import { toast } from "sonner"

type SearchField = "name" | "sapCode" | "sku"

const SEARCH_FIELD_PLACEHOLDERS: Record<SearchField, string> = {
  name: "Buscar por nombre…",
  sapCode: "Buscar por código SAP…",
  sku: "Buscar por SKU…",
}

const PRODUCT_SEARCH_PAGE_SIZE = 50

export function TransferModal({
  open,
  onOpenChange,
  onDone,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  onDone: () => void
}) {
  const [warehouses, setWarehouses] = useState<WarehouseResponse[]>([])
  const [products, setProducts] = useState<ProductOnStock[]>([])
  const [productId, setProductId] = useState<number>(0)
  const [fromWarehouseId, setFromWarehouseId] = useState<number>(0)
  const [toWarehouseId, setToWarehouseId] = useState<number>(0)
  const [quantity, setQuantity] = useState("1")
  const [unitCost, setUnitCost] = useState("")
  const [reason, setReason] = useState("")
  const [saving, setSaving] = useState(false)
  const [loadingWarehouses, setLoadingWarehouses] = useState(false)

  const [searchField, setSearchField] = useState<SearchField>("name")
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  const [loadingSearch, setLoadingSearch] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  const selectedProduct = products.find((p) => p.id === productId)

  useEffect(() => {
    if (open) {
      setLoadingWarehouses(true)
      fetchWarehouses()
        .then((wh) => {
          setWarehouses(wh)
          const fromId = wh.length >= 2 ? wh[0].id : 0
          const toId = wh.length >= 2 ? wh[1].id : 0
          setFromWarehouseId(fromId)
          setToWarehouseId(toId)
        })
        .catch(() => toast.error("Error al cargar almacenes"))
        .finally(() => setLoadingWarehouses(false))
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    if (!fromWarehouseId) {
      setProducts([])
      return
    }
    const controller = new AbortController()
    const fetchData = async () => {
      setLoadingSearch(true)
      try {
        const trimmed = debouncedSearchTerm.trim()
        const search = trimmed || undefined
        const page = await fetchProductsOnStock(
          fromWarehouseId,
          search,
          0,
          PRODUCT_SEARCH_PAGE_SIZE,
          controller.signal,
        )
        if (!controller.signal.aborted) {
          setProducts(page.content ?? [])
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
  }, [debouncedSearchTerm, searchField, fromWarehouseId, open])

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
    setQuantity("1")
    setUnitCost("")
    setReason("")
    setProductId(0)
    setSearchTerm("")
    setSearchOpen(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const user = getCachedUser()
    if (!user) { toast.error("Debes iniciar sesión"); return }
    const qty = Number(quantity)
    if (qty <= 0) { toast.error("La cantidad debe ser mayor a cero"); return }
    if (fromWarehouseId === toWarehouseId) { toast.error("Origen y destino deben ser diferentes"); return }
    if (!productId) { toast.error("Selecciona un producto"); return }
    if (selectedProduct && qty > selectedProduct.currentStock) {
      toast.error(`Stock insuficiente. Disponible: ${selectedProduct.currentStock}`)
      return
    }

    setSaving(true)
    try {
      await transferStock({
        productId,
        fromWarehouseId,
        toWarehouseId,
        quantity: qty,
        createdById: user.id,
        unitCost: unitCost ? Number(unitCost) : null,
        reason: reason || null,
      })
      toast.success(`${qty} unidades transferidas`)
      onDone()
      close()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al transferir")
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-[#f3f4f6]">
          <div>
            <h2 className="text-xl font-bold text-[#111827]">Transferir Stock</h2>
            <p className="text-sm text-[#6b7280] mt-0.5">Transfiere existencias entre almacenes.</p>
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
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-5">
              <div className="space-y-1.5">
                <Label>Producto</Label>
                {selectedProduct ? (
                  <div className="flex items-center gap-2 h-9 px-3 rounded-md border border-input bg-card text-sm">
                    <span className="flex-1 truncate">
                      {selectedProduct.name} ({selectedProduct.sku})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setProductId(0)
                        setSearchTerm("")
                        setSearchOpen(true)
                      }}
                      className="text-muted-foreground hover:text-foreground"
                      aria-label="Cambiar producto"
                    >
                      <ChevronUpDownIcon className="size-4" />
                    </button>
                  </div>
                ) : (
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
                        ) : !fromWarehouseId ? (
                          <div className="p-3 text-sm text-muted-foreground text-center">
                            Selecciona un almacén de origen
                          </div>
                        ) : products.length === 0 ? (
                          <div className="p-3 text-sm text-muted-foreground text-center">
                            {debouncedSearchTerm.trim()
                              ? "No se encontraron productos"
                              : "No hay productos con stock en este almacén"}
                          </div>
                        ) : (
                          products.map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              className="w-full text-left px-3 py-2 text-sm hover:bg-secondary transition-colors border-b last:border-b-0 border-border/50"
                              onClick={() => {
                                setProductId(p.id)
                                setSearchOpen(false)
                                setSearchTerm("")
                              }}
                            >
                              <div className="font-medium text-foreground">{p.name}</div>
                              <div className="text-xs text-muted-foreground">
                                SKU: {p.sku} · SAP: {p.sapCode} · Stock: {p.currentStock} {p.uom}
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Origen</Label>
                  <Select
                    value={String(fromWarehouseId)}
                    onValueChange={(v) => {
                      const id = Number(v)
                      setFromWarehouseId(id)
                      setProductId(0)
                      setSearchTerm("")
                      if (id === toWarehouseId) {
                        const other = warehouses.find((w) => w.id !== id)
                        if (other) setToWarehouseId(other.id)
                      }
                    }}
                    disabled={saving}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {warehouses.map((w) => (
                        <SelectItem key={w.id} value={String(w.id)}>{w.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Destino</Label>
                  <Select value={String(toWarehouseId)} onValueChange={(v) => setToWarehouseId(Number(v))} disabled={saving}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {warehouses.map((w) => (
                        <SelectItem key={w.id} value={String(w.id)}>{w.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Cantidad</Label>
                {selectedProduct && (
                  <p className="text-xs text-muted-foreground">Stock disponible: {selectedProduct.currentStock}</p>
                )}
                <Input type="number" min="1" max={selectedProduct?.currentStock} required value={quantity} onChange={(e) => setQuantity(e.target.value)} disabled={saving} />
              </div>

              <div className="space-y-1.5">
                <Label>Costo unitario <span className="text-[#6b7280]">(opcional)</span></Label>
                <Input type="number" step="0.01" value={unitCost} onChange={(e) => setUnitCost(e.target.value)} placeholder="0.00" disabled={saving} />
              </div>

              <div className="space-y-1.5">
                <Label>Motivo <span className="text-[#6b7280]">(opcional)</span></Label>
                <Textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Razón de la transferencia…" disabled={saving} />
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
                type="submit"
                disabled={saving || loadingWarehouses}
                className="px-5 py-2 bg-[#7b1a1a] text-white rounded-lg font-medium hover:bg-[#5c1212] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {saving ? (
                  <><ArrowPathIcon className="size-4 animate-spin" /> Transfiriendo…</>
                ) : (
                  <><ArrowsRightLeftIcon className="size-4" /> Transferir</>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
