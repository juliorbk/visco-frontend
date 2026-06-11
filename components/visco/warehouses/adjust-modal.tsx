"use client"

import { useEffect, useState } from "react"
import { XMarkIcon, ArrowPathIcon, EqualsIcon, ExclamationTriangleIcon, CheckIcon, ChevronUpDownIcon } from "@heroicons/react/24/outline"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { adjustStock, fetchWarehouses } from "@/lib/services/warehouse"
import { fetchProducts } from "@/lib/services/inventory"
import { getCachedUser } from "@/lib/auth-client"
import type { ProductDTO, WarehouseResponse } from "@/lib/types"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export function AdjustModal({
  open,
  onOpenChange,
  onDone,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  onDone: () => void
}) {
  const [warehouses, setWarehouses] = useState<WarehouseResponse[]>([])
  const [products, setProducts] = useState<ProductDTO[]>([])
  const [openProduct, setOpenProduct] = useState(false)
  const [productId, setProductId] = useState<number>(0)
  const [warehouseId, setWarehouseId] = useState<number>(0)
  const [newStock, setNewStock] = useState("0")
  const [reason, setReason] = useState("")
  const [unitCost, setUnitCost] = useState("")
  const [saving, setSaving] = useState(false)
  const [loadingData, setLoadingData] = useState(false)

  useEffect(() => {
    if (open) {
      setLoadingData(true)
      Promise.all([
        fetchWarehouses(),
        fetchProducts(0, 200, undefined, undefined, undefined, undefined, true).then((r) => (r.content ?? []).filter((p) => p.totalStock > 0)),
      ])
        .then(([wh, prod]) => {
          setWarehouses(wh)
          setProducts(prod)
          if (wh.length > 0) setWarehouseId(wh[0].id)
          if (prod.length > 0) setProductId(prod[0].id)
        })
        .catch(() => toast.error("Error al cargar datos"))
        .finally(() => setLoadingData(false))
    }
  }, [open])

  const close = () => {
    onOpenChange(false)
    setNewStock("0")
    setReason("")
    setUnitCost("")
    setProductId(0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const user = getCachedUser()
    if (!user) { toast.error("Debes iniciar sesión"); return }
    const ns = Number(newStock)
    if (ns < 0) { toast.error("El stock no puede ser negativo"); return }
    if (!productId) { toast.error("Selecciona un producto"); return }

    setSaving(true)
    try {
      await adjustStock({
        productId,
        warehouseId,
        newStock: ns,
        reason,
        createdById: user.id,
        unitCost: unitCost ? Number(unitCost) : null,
      })
      toast.success(`Stock ajustado a ${ns}`)
      if (selectedProduct && ns <= selectedProduct.reorderPoint) {
        toast.warning(
          <div className="flex items-center gap-2">
            <ExclamationTriangleIcon className="size-4" />
            <span>Stock por debajo del punto de reorden ({selectedProduct.reorderPoint})</span>
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

  const selectedProduct = products.find((p) => p.id === productId)

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-[#f3f4f6]">
          <div>
            <h2 className="text-xl font-bold text-[#111827]">Ajustar Stock</h2>
            <p className="text-sm text-[#6b7280] mt-0.5">Ajusta manualmente el stock de un producto en un almacén.</p>
          </div>
          <button onClick={close} className="p-2 hover:bg-[#f5f5f7] rounded-lg transition-colors">
            <XMarkIcon className="w-5 h-5 text-[#6b7280]" />
          </button>
        </div>

        {loadingData ? (
          <div className="flex items-center justify-center py-12">
            <ArrowPathIcon className="size-6 animate-spin text-[#6b7280]" />
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-5">
              <div className="space-y-1.5">
                <Label>Producto</Label>
                <Popover open={openProduct} onOpenChange={setOpenProduct}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openProduct}
                      className="w-full justify-between font-normal bg-background"
                      disabled={saving}
                    >
                      {selectedProduct
                        ? `${selectedProduct.name} (${selectedProduct.sku})`
                        : "Buscar producto..."}
                      <ChevronUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[var(--radix-popover-trigger-width)] p-0"
                    align="start"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                  >
                    <Command>
                      <CommandInput placeholder="Buscar por nombre o SKU..." />
                      <CommandList>
                        <CommandEmpty>No se encontraron productos.</CommandEmpty>
                        <CommandGroup>
                          {products.map((p) => (
                            <CommandItem
                              key={p.id}
                              value={`${p.name} ${p.sku}`}
                              onSelect={() => {
                                setProductId(p.id === productId ? 0 : p.id)
                                setOpenProduct(false)
                              }}
                            >
                              <CheckIcon
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  productId === p.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex flex-col">
                                <span>{p.name}</span>
                                <span className="text-xs text-[#6b7280]">SKU: {p.sku} · SAP: {p.sapCode} &middot; Stock: {p.totalStock}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {selectedProduct && (
                <div className="bg-[#f5f5f7] rounded-lg p-3 text-sm text-[#6b7280] flex items-center gap-2">
                  <span>Stock actual:</span>
                  <span className="font-semibold text-[#111827]">{selectedProduct.totalStock}</span>
                  <span className="text-[#9ca3af]">{selectedProduct.uom}</span>
                  {selectedProduct.reorderPoint > 0 && (
                    <>
                      <span className="text-[#d1d5db]">&middot;</span>
                      <span>Punto de reorden: {selectedProduct.reorderPoint}</span>
                    </>
                  )}
                </div>
              )}

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
                <Label>Nuevo stock</Label>
                <Input type="number" min="0" required value={newStock} onChange={(e) => setNewStock(e.target.value)} disabled={saving} />
              </div>

              <div className="space-y-1.5">
                <Label>Motivo</Label>
                <Textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Razón del ajuste…" disabled={saving} />
              </div>

              <div className="space-y-1.5">
                <Label>Costo unitario <span className="text-[#6b7280]">(opcional)</span></Label>
                <Input type="number" step="0.01" value={unitCost} onChange={(e) => setUnitCost(e.target.value)} placeholder="0.00" disabled={saving} />
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
                disabled={saving || loadingData}
                className="px-5 py-2 bg-[#7b1a1a] text-white rounded-lg font-medium hover:bg-[#5c1212] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {saving ? (
                  <><ArrowPathIcon className="size-4 animate-spin" /> Ajustando…</>
                ) : (
                  <><EqualsIcon className="size-4" /> Ajustar</>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
