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
import type { PurchaseOrder } from "@/lib/mock-data"
import { toast } from "sonner"

export function ReceiveGoodsModal({
  order,
  open,
  onOpenChange,
  onReceive,
}: {
  order: PurchaseOrder | null
  open: boolean
  onOpenChange: (o: boolean) => void
  onReceive: (order: PurchaseOrder) => void
}) {
  const [received, setReceived] = useState<Record<string, number>>({})
  const [notes, setNotes] = useState("")

  useEffect(() => {
    if (order) {
      const init: Record<string, number> = {}
      order.items.forEach((it) => (init[it.productId] = it.quantity))
      setReceived(init)
      setNotes("")
    }
  }, [order])

  if (!order) return null

  const submit = () => {
    const allComplete = order.items.every((it) => (received[it.productId] ?? 0) >= it.quantity)
    onReceive(order)
    toast.success(
      allComplete ? "Mercancía recibida completamente" : "Recepción parcial registrada",
    )
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif">Recibir Mercancía — {order.id}</DialogTitle>
          <DialogDescription>
            Confirma las cantidades recibidas para cada producto del pedido.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {order.items.map((it) => (
            <div
              key={it.productId}
              className="rounded-md border border-border bg-[#fafafa] p-3 flex items-center justify-between gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground truncate">{it.productName}</div>
                <div className="text-xs text-muted-foreground">
                  Esperado: <span className="font-medium text-foreground">{it.quantity}</span>
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
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button className="bg-[#7b1a1a] hover:bg-[#5c1212] text-white" onClick={submit}>
            Confirmar Recepción
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
