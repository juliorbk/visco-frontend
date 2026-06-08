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
import { receiveGoods, fetchWarehouses, fetchReceiptSummary } from "@/lib/services/warehouse"
import type { PurchaseOrderResponse, WarehouseResponse, PurchaseOrderReceiptSummary } from "@/lib/types"
import { LocationPicker } from "@/components/visco/warehouses/location-picker"
import { ArrowPathIcon } from "@heroicons/react/24/outline"
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
  const [destinationWarehouseId, setDestinationWarehouseId] = useState<number | null>(null)
  const [locationId, setLocationId] = useState<number | null>(null)
  const [receiptSummary, setReceiptSummary] = useState<PurchaseOrderReceiptSummary | null>(null)

  useEffect(() => {
    if (order) {
      const init: Record<number, number> = {}
      order.items.forEach((it) => (init[it.productId] = 0))
      setReceived(init)
      setNotes("")
      setDestinationWarehouseId(null)
      setLocationId(null)
      setReceiptSummary(null)
      fetchReceiptSummary(order.id).then(setReceiptSummary).catch(() => {})
    }
  }, [order])

  useEffect(() => {
    if (open) {
      fetchWarehouses()
        .then((wh) => {
          setWarehouses(wh)
          if (wh.length > 0 && !destinationWarehouseId) setDestinationWarehouseId(wh[0].id)
        })
        .catch(() => {})
    }
  }, [open])

  if (!order) return null

  const submit = async () => {
    if (!destinationWarehouseId) {
      toast.error("Selecciona un almacén destino")
      return
    }
    if (!locationId) {
      toast.error("Selecciona una ubicación destino")
      return
    }
    if (order.items.every((it) => (received[it.productId] ?? 0) === 0)) {
      toast.error("Debes ingresar al menos una cantidad recibida")
      return
    }
    setSaving(true)
    try {
      await receiveGoods(order.id, {
        items: order.items.map((it) => ({
          productId: it.productId,
          receivedQuantity: received[it.productId] ?? 0,
        })),
        notes,
        destinationWarehouseId,
        locationId,
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
      <DialogContent className="sm:max-w-lg max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="font-serif">Recibir Mercancía — {order.orderNumber}</DialogTitle>
          <DialogDescription>
            Confirma las cantidades recibidas para cada producto del pedido.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 overflow-y-auto pr-1">
          <div className="space-y-1.5">
            <Label>Almacén destino</Label>
            <Select value={String(destinationWarehouseId ?? "")} onValueChange={(v) => setDestinationWarehouseId(Number(v))}>
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
          <div className="space-y-1.5">
            <Label>Ubicación destino</Label>
            <LocationPicker
              warehouseId={destinationWarehouseId}
              value={locationId}
              onChange={setLocationId}
              disabled={saving}
            />
          </div>
          {order.items.map((it) => {
            const rcv = received[it.productId] ?? 0
            const summaryItem = receiptSummary?.items.find((s) => s.productId === it.productId)
            const ordered = summaryItem?.orderedQuantity ?? it.quantity
            const basePending = summaryItem?.pendingQuantity ?? ordered
            const pending = Math.max(0, basePending - rcv)
            const isPartial = pending > 0
            const isComplete = pending === 0 && rcv > 0

            return (
              <div
                key={it.productId}
                className="rounded-md border border-border bg-[#fafafa] p-3"
              >
                <div className="min-w-0 mb-2">
                  <div className="font-medium text-foreground truncate">{it.productName}</div>
                  <div className="text-xs text-muted-foreground">SKU: {it.productSku}</div>
                </div>
                {summaryItem && summaryItem.receivedQuantity > 0 && (
                  <div className="mb-2 text-xs text-blue-700 font-medium">
                    Ya recibido anteriormente: {summaryItem.receivedQuantity} uds.
                  </div>
                )}
                <div className="grid grid-cols-[auto_1fr_auto] gap-3 items-center">
                  <span className="text-xs text-[#6b7280] font-medium whitespace-nowrap">
                    Esperado: {ordered}
                  </span>
                  <Input
                    type="number"
                    value={rcv}
                    onChange={(e) => {
                      const v = Math.min(Number(e.target.value) || 0, basePending)
                      setReceived((prev) => ({ ...prev, [it.productId]: v }))
                    }}
                    className="w-full max-w-24 justify-self-center text-center"
                    disabled={saving}
                    min={0}
                    max={basePending}
                  />
                  <span
                    className={`text-xs font-semibold whitespace-nowrap text-right ${
                      isComplete
                        ? "text-green-700"
                        : isPartial
                          ? "text-orange-600"
                          : "text-[#6b7280]"
                    }`}
                  >
                    {isComplete ? "✓ Completo" : `Pendiente: ${pending}`}
                  </span>
                </div>
              </div>
            )
          })}

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
            {saving ? <><ArrowPathIcon className="size-4 animate-spin" /> Guardando…</> : "Confirmar Recepción"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
