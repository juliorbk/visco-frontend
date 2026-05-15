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
import { receiveGoods, fetchWarehouses } from "@/lib/services/warehouse"
import type { PurchaseOrderResponse, WarehouseResponse } from "@/lib/types"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

export function ReceiveGoodsModal({
  order,
  open,
  onOpenChange,
  onReceived,
}: {
  order: PurchaseOrderResponse | null
  open: boolean
  onOpenChange: (o: boolean) => void
  onReceived: () => void
}) {
  const [received, setReceived] = useState<Record<number, number>>({})
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)
  const [warehouses, setWarehouses] = useState<WarehouseResponse[]>([])
  const [destinationLocationId, setDestinationLocationId] = useState<number>(1)

  useEffect(() => {
    if (order) {
      const init: Record<number, number> = {}
      order.items.forEach((it) => (init[it.productId] = it.quantity))
      setReceived(init)
      setNotes("")
    }
    if (open) {
      fetchWarehouses().then(setWarehouses).catch(() => {})
    }
  }, [order, open])

  if (!order) return null

  const submit = async () => {
    setSaving(true)
    try {
      await receiveGoods(order.id, {
        items: order.items.map((it) => ({
          productId: it.productId,
          receivedQuantity: received[it.productId] ?? 0,
        })),
        notes,
        destinationLocationId,
      })
      toast.success("Recepción registrada correctamente")
      onReceived()
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al recibir mercancía")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif">Recibir Mercancía — {order.orderNumber}</DialogTitle>
          <DialogDescription>
            Confirma las cantidades recibidas para cada producto del pedido.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Ubicación destino</Label>
            <Select value={String(destinationLocationId)} onValueChange={(v) => setDestinationLocationId(Number(v))}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar almacén…" />
              </SelectTrigger>
              <SelectContent>
                {warehouses.map((w) => (
                  <SelectItem key={w.id} value={String(w.id)}>
                    {w.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {order.items.map((it) => (
            <div
              key={it.productId}
              className="rounded-md border border-border bg-[#fafafa] p-3 flex items-center justify-between gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground truncate">{it.productName}</div>
                <div className="text-xs text-muted-foreground">
                  SKU: {it.productSku} · Esperado: <span className="font-medium text-foreground">{it.quantity}</span>
                </div>
              </div>
              <div className="w-28">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Recibido
                </Label>
                <Input
                  type="number"
                  value={received[it.productId] ?? 0}
                  onChange={(e) =>
                    setReceived((prev) => ({
                      ...prev,
                      [it.productId]: Number(e.target.value) || 0,
                    }))
                  }
                  disabled={saving}
                />
              </div>
            </div>
          ))}

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observaciones de la recepción"
              disabled={saving}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button className="bg-[#7b1a1a] hover:bg-[#5c1212] text-white" onClick={submit} disabled={saving}>
            {saving ? <><Loader2 className="size-4 animate-spin" /> Guardando…</> : "Confirmar Recepción"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
