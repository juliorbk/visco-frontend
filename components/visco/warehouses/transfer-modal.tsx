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
import { transferStock, fetchWarehouses } from "@/lib/services/warehouse"
import { fetchProducts } from "@/lib/services/inventory"
import { getCachedUser } from "@/lib/auth-client"
import type { ProductDTO, WarehouseResponse } from "@/lib/types"
import { Loader2, ArrowRightLeft, AlertTriangle } from "lucide-react"
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
  const [products, setProducts] = useState<ProductDTO[]>([])
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
      Promise.all([
        fetchWarehouses(),
        fetchProducts(0, 200, undefined, undefined, undefined, undefined, true).then((r) => (r.content ?? []).filter((p) => p.totalStock > 0)),
      ])
        .then(([wh, prod]) => {
          setWarehouses(wh)
          setProducts(prod)
          if (wh.length >= 2) {
            setFromWarehouseId(wh[0].id)
            setToWarehouseId(wh[1].id)
          }
          if (prod.length > 0) setProductId(prod[0].id)
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
      if (selectedProduct && selectedProduct.totalStock - qty <= selectedProduct.reorderPoint) {
        toast.warning(
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4" />
            <span>Stock bajo después de la transferencia. Punto de reorden: {selectedProduct.reorderPoint}</span>
          </div>,
          { duration: 6000 }
        )
      }
      onDone()
      close()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al transferir")
    } finally {
      setSaving(false)
    }
  }

  const selectedProduct = products.find((p) => p.id === productId)

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
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
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

              {selectedProduct && (
                <p className="text-xs text-muted-foreground">
                  Stock actual: <span className="font-semibold text-foreground">{selectedProduct.totalStock}</span> · Pendiente: <span className="font-semibold text-foreground">{selectedProduct.totalPendingStock}</span>
                </p>
              )}

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
              {saving ? <><Loader2 className="size-4 animate-spin" /> Transfiriendo…</> : <><ArrowRightLeft className="size-4 mr-1" /> Transferir</>}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
