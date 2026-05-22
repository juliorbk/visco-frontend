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
import { transferStock, adjustStock, fetchWarehouses } from "@/lib/services/warehouse"
import { getCachedUser } from "@/lib/auth-client"
import type { ProductDTO, WarehouseResponse } from "@/lib/types"
import { Loader2, ArrowRightLeft, Equal, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

type Mode = "transfer" | "adjust"

export function StockActionModal({
  product,
  open,
  onOpenChange,
  onDone,
}: {
  product: ProductDTO | null
  open: boolean
  onOpenChange: (o: boolean) => void
  onDone: () => void
}) {
  const [mode, setMode] = useState<Mode>("transfer")
  const [warehouses, setWarehouses] = useState<WarehouseResponse[]>([])
  const [fromWarehouseId, setFromWarehouseId] = useState<number>(1)
  const [toWarehouseId, setToWarehouseId] = useState<number>(2)
  const [quantity, setQuantity] = useState("1")
  const [newStock, setNewStock] = useState("0")
  const [reason, setReason] = useState("")
  const [unitCost, setUnitCost] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      fetchWarehouses().then((wh) => {
        setWarehouses(wh)
        if (wh.length >= 2) {
          setFromWarehouseId(wh[0].id)
          setToWarehouseId(wh[1].id)
        }
      }).catch(() => {})
    }
  }, [open])

  const close = () => {
    onOpenChange(false)
    setMode("transfer")
    setQuantity("1")
    setNewStock("0")
    setReason("")
    setUnitCost("")
  }

  const handleTransfer = async () => {
    const user = getCachedUser()
    if (!user || !product) return
    const qty = Number(quantity)
    if (qty <= 0) { toast.error("La cantidad debe ser mayor a cero"); return }
    if (fromWarehouseId === toWarehouseId) { toast.error("Origen y destino deben ser diferentes"); return }
    setSaving(true)
    try {
      await transferStock({
        productId: product.id,
        fromWarehouseId,
        toWarehouseId,
        quantity: qty,
        createdById: user.id,
        unitCost: unitCost ? Number(unitCost) : null,
      })
      toast.success(`${qty} unidades transferidas`)
      if (product.totalStock - qty <= product.reorderPoint) {
        toast.warning(
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4" />
            <span>Stock bajo después de la transferencia. Punto de reorden: {product.reorderPoint}</span>
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

  const handleAdjust = async () => {
    const user = getCachedUser()
    if (!user || !product) return
    const ns = Number(newStock)
    if (ns < 0) { toast.error("El stock no puede ser negativo"); return }
    setSaving(true)
    try {
      await adjustStock({
        productId: product.id,
        warehouseId: fromWarehouseId,
        newStock: ns,
        reason,
        createdById: user.id,
        unitCost: unitCost ? Number(unitCost) : null,
      })
      toast.success(`Stock ajustado a ${ns}`)
      if (ns <= product.reorderPoint) {
        toast.warning(
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4" />
            <span>Stock por debajo del punto de reorden ({product.reorderPoint})</span>
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

  if (!product) return null

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif">Stock Action — {product.name}</DialogTitle>
          <DialogDescription>
            Stock actual: {product.totalStock} {product.uom}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <Button
            variant={mode === "transfer" ? "default" : "outline"}
            size="sm"
            className={cn(mode === "transfer" ? "bg-[#7b1a1a] hover:bg-[#5c1212] text-white" : "")}
            onClick={() => setMode("transfer")}
          >
            <ArrowRightLeft className="size-4 mr-1" /> Transferir
          </Button>
          <Button
            variant={mode === "adjust" ? "default" : "outline"}
            size="sm"
            className={cn(mode === "adjust" ? "bg-[#7b1a1a] hover:bg-[#5c1212] text-white" : "")}
            onClick={() => setMode("adjust")}
          >
            <Equal className="size-4 mr-1" /> Ajustar
          </Button>
        </div>

        {mode === "transfer" ? (
          <div className="space-y-4">
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
            <div className="space-y-1.5">
              <Label>Cantidad</Label>
              <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Costo unitario (opcional)</Label>
              <Input type="number" step="0.01" value={unitCost} onChange={(e) => setUnitCost(e.target.value)} placeholder="0.00" />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={close} disabled={saving}>Cancelar</Button>
              <Button className="bg-[#7b1a1a] hover:bg-[#5c1212] text-white" onClick={handleTransfer} disabled={saving}>
                {saving ? <><Loader2 className="size-4 animate-spin" /> Transfiriendo…</> : "Transferir"}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Almacén</Label>
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
              <Label>Nuevo stock</Label>
              <Input type="number" value={newStock} onChange={(e) => setNewStock(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Motivo</Label>
              <Textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Razón del ajuste…" />
            </div>
            <div className="space-y-1.5">
              <Label>Costo unitario (opcional)</Label>
              <Input type="number" step="0.01" value={unitCost} onChange={(e) => setUnitCost(e.target.value)} placeholder="0.00" />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={close} disabled={saving}>Cancelar</Button>
              <Button className="bg-[#7b1a1a] hover:bg-[#5c1212] text-white" onClick={handleAdjust} disabled={saving}>
                {saving ? <><Loader2 className="size-4 animate-spin" /> Ajustando…</> : "Ajustar"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
