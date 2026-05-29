"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { transferStock, fetchWarehouses, fetchProductsOnStock } from "@/lib/services/warehouse"
import { getCachedUser } from "@/lib/auth-client"
import type { ProductOnStock, WarehouseResponse } from "@/lib/types"
import { ArrowPathIcon, ArrowsRightLeftIcon } from "@heroicons/react/24/outline"
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
  const [productId, setProductId] = useState<number>(0)
  const [fromWarehouseId, setFromWarehouseId] = useState<number>(0)
  const [toWarehouseId, setToWarehouseId] = useState<number>(0)
  const [quantity, setQuantity] = useState("1")
  const [unitCost, setUnitCost] = useState("")
  const [reason, setReason] = useState("")
  const [saving, setSaving] = useState(false)
  const [loadingData, setLoadingData] = useState(false)

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
          if (fromId) return fetchProductsOnStock(fromId)
          return { content: [] } as any
        })
        .then((page) => {
          const prods = page.content ?? []
          setProducts(prods)
          if (prods.length > 0) setProductId(prods[0].id)
        })
        .catch(() => toast.error("Error al cargar datos"))
        .finally(() => setLoadingData(false))
    }
  }, [open])

  const close = () => {
    onOpenChange(false)
    setQuantity("1")
    setUnitCost("")
    setReason("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const user = getCachedUser()
    if (!user) { toast.error("Debes iniciar sesión"); return }
    const qty = Number(quantity)
    if (qty <= 0) { toast.error("La cantidad debe ser mayor a cero"); return }
    if (fromWarehouseId === toWarehouseId) { toast.error("Origen y destino deben ser diferentes"); return }
    if (!productId) { toast.error("Selecciona un producto"); return }

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

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) close(); else onOpenChange(true) }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif">Transferir Stock</DialogTitle>
          <DialogDescription>
            Transfiere existencias entre almacenes.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {loadingData ? (
            <div className="flex items-center justify-center py-8">
              <ArrowPathIcon className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label>Producto</Label>
                <Select value={String(productId)} onValueChange={(v) => setProductId(Number(v))}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar producto" /></SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.name} ({p.sku})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Origen</Label>
                  <Select value={String(fromWarehouseId)} onValueChange={(v) => setFromWarehouseId(Number(v))}>
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
                  <Select value={String(toWarehouseId)} onValueChange={(v) => setToWarehouseId(Number(v))}>
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
                <Input type="number" min="1" required value={quantity} onChange={(e) => setQuantity(e.target.value)} disabled={saving} />
              </div>

              <div className="space-y-1.5">
                <Label>Costo unitario (opcional)</Label>
                <Input type="number" step="0.01" value={unitCost} onChange={(e) => setUnitCost(e.target.value)} placeholder="0.00" disabled={saving} />
              </div>

              <div className="space-y-1.5">
                <Label>Motivo (opcional)</Label>
                <Textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Razón de la transferencia…" disabled={saving} />
              </div>
            </>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={close} disabled={saving}>Cancelar</Button>
            <Button type="submit" className="bg-[#7b1a1a] hover:bg-[#5c1212] text-white" disabled={saving || loadingData}>
              {saving ? <><ArrowPathIcon className="size-4 animate-spin" /> Transfiriendo…</> : <><ArrowsRightLeftIcon className="size-4 mr-1" /> Transferir</>}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
