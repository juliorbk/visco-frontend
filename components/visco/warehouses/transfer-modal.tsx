"use client"

import { useEffect, useState } from "react"
import { XMarkIcon, ArrowPathIcon, ArrowsRightLeftIcon, CheckIcon, ChevronUpDownIcon } from "@heroicons/react/24/outline"
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
import { transferStock, fetchWarehouses, fetchProductsOnStock } from "@/lib/services/warehouse"
import { getCachedUser } from "@/lib/auth-client"
import type { ProductOnStock, WarehouseResponse } from "@/lib/types"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

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
  const [openProduct, setOpenProduct] = useState(false)
  const [productId, setProductId] = useState<number>(0)
  const [fromWarehouseId, setFromWarehouseId] = useState<number>(0)
  const [toWarehouseId, setToWarehouseId] = useState<number>(0)
  const [quantity, setQuantity] = useState("1")
  const [unitCost, setUnitCost] = useState("")
  const [reason, setReason] = useState("")
  const [saving, setSaving] = useState(false)
  const [loadingData, setLoadingData] = useState(false)

  const selectedProduct = products.find((p) => p.id === productId)

  const loadProducts = (warehouseId: number) => {
    if (!warehouseId) return
    fetchProductsOnStock(warehouseId)
      .then((page) => {
        const prods = page.content ?? []
        setProducts(prods)
        if (prods.length > 0 && !prods.find((p) => p.id === productId)) {
          setProductId(prods[0].id)
        }
      })
      .catch(() => toast.error("Error al cargar productos"))
  }

  useEffect(() => {
    if (open) {
      setLoadingData(true)
      fetchWarehouses()
        .then((wh) => {
          setWarehouses(wh)
          const fromId = wh.length >= 2 ? wh[0].id : 0
          const toId = wh.length >= 2 ? wh[1].id : 0
          setFromWarehouseId(fromId)
          setToWarehouseId(toId)
          return fromId
        })
        .then((fromId) => loadProducts(fromId))
        .catch(() => toast.error("Error al cargar datos"))
        .finally(() => setLoadingData(false))
    }
  }, [open])

  const close = () => {
    onOpenChange(false)
    setQuantity("1")
    setUnitCost("")
    setReason("")
    setProductId(0)
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
                                <span className="text-xs text-[#6b7280]">SKU: {p.sku} · SAP: {p.sapCode} &middot; Stock: {p.currentStock}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Origen</Label>
                  <Select
                    value={String(fromWarehouseId)}
                    onValueChange={(v) => {
                      const id = Number(v)
                      setFromWarehouseId(id)
                      loadProducts(id)
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
                disabled={saving || loadingData}
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
