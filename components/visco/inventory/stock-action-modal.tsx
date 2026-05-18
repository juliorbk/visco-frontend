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
import { Loader2, ArrowRightLeft, Equal } from "lucide-react"
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
  const [fromLocationId, setFromLocationId] = useState<number>(1)
  const [toLocationId, setToLocationId] = useState<number>(2)
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
          setFromLocationId(wh[0].id)
          setToLocationId(wh[1].id)
        }
      }).catch(() => {})
    }
  }, [open])

  const close = () => {
    onOpenChange(false)
    setUnitCost("")
  }

  const handleTransfer = async () => {
    const user = getCachedUser()
    if (!user || !product) return
    const qty = Number(quantity)
    if (qty <= 0) { toast.error("La cantidad debe ser mayor a cero"); return }
    if (fromLocationId === toLocationId) { toast.error("Origen y destino deben ser diferentes"); return }
    setSaving(true)
    try {
      await transferStock({
        productId: product.id,
        fromLocationId,
        toLocationId,
        quantity: qty,
        createdById: user.id,
        unitCost: unitCost ? Number(unitCost) : null,
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

  const handleAdjust = async () => {
    const user = getCachedUser()
    if (!user || !product) return
    const ns = Number(newStock)
    if (ns < 0) { toast.error("El stock no puede ser negativo"); return }
    setSaving(true)
    try {
      await adjustStock({
        productId: product.id,
        locationId: fromLocationId,
        newStock: ns,
        reason,
        createdById: user.id,
        unitCost: unitCost ? Number(unitCost) : null,
      })
      toast.success(`Stock ajustado a ${ns}`)
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
            Stock actual: {product.totalStock} {product.uom.toLowerCase()}
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
              <Select value={String(fromLocationId)} onValueChange={(v) => setFromLocationId(Number(v))}>
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
              <Select value={String(toLocationId)} onValueChange={(v) => setToLocationId(Number(v))}>
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
              <Select value={String(fromLocationId)} onValueChange={(v) => setFromLocationId(Number(v))}>
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
