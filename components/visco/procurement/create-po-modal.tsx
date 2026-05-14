"use client"

import { useMemo, useState } from "react"
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
import {
  PAYMENT_METHODS,
  ORDER_TYPES,
  suppliers,
  products,
  type PurchaseOrder,
} from "@/lib/mock-data"
import { Check, Plus, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface LineItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
}

const STEPS = ["Información", "Productos", "Revisión"] as const

export function CreatePOModal({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  onCreate: (order: PurchaseOrder) => void
}) {
  const [step, setStep] = useState(0)
  const [orderNumber, setOrderNumber] = useState(`PO-${4093 + Math.floor(Math.random() * 100)}`)
  const [description, setDescription] = useState("")
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[1])
  const [type, setType] = useState(ORDER_TYPES[1])
  const [supplierId, setSupplierId] = useState(suppliers[0].id)
  const [lines, setLines] = useState<LineItem[]>([])
  const [pickProduct, setPickProduct] = useState(products[0].id)
  const [pickQty, setPickQty] = useState("1")
  const [pickPrice, setPickPrice] = useState(String(products[0].unitPrice))

  const total = useMemo(() => lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0), [lines])
  const supplier = suppliers.find((s) => s.id === supplierId)!

  const reset = () => {
    setStep(0)
    setLines([])
    setDescription("")
  }

  const close = () => {
    onOpenChange(false)
    setTimeout(reset, 200)
  }

  const addLine = () => {
    const p = products.find((x) => x.id === pickProduct)
    if (!p) return
    const qty = Number(pickQty)
    const price = Number(pickPrice)
    if (qty <= 0 || price <= 0) {
      toast.error("Cantidad y precio deben ser mayores a cero")
      return
    }
    setLines((prev) => [
      ...prev,
      { productId: p.id, productName: p.name, quantity: qty, unitPrice: price },
    ])
    setPickQty("1")
  }

  const submit = () => {
    if (lines.length === 0) {
      toast.error("Agrega al menos un producto")
      return
    }
    const newOrder: PurchaseOrder = {
      id: orderNumber,
      orderNumber,
      date: new Date().toISOString().slice(0, 10),
      supplierId: supplier.id,
      supplierName: supplier.name,
      total,
      status: "PENDIENTE",
      requester: "Ana Rodríguez",
      costCenter: "CC-PRC-001",
      paymentMethod,
      type,
      items: lines,
      description,
    }
    onCreate(newOrder)
    toast.success(`Pedido ${orderNumber} creado`)
    close()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(true) : close())}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif">Crear Pedido de Compra</DialogTitle>
          <DialogDescription>
            Completa la información, agrega productos y revisa antes de enviar.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between mb-4">
          {STEPS.map((s, i) => (
            <div key={s} className="flex-1 flex items-center last:flex-none">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "size-7 rounded-full grid place-items-center text-xs font-semibold ring-1",
                    i < step && "bg-[#1f1f1f] text-white ring-[#1f1f1f]",
                    i === step && "bg-[#7b1a1a] text-white ring-[#7b1a1a]",
                    i > step && "bg-card text-muted-foreground ring-border",
                  )}
                >
                  {i < step ? <Check className="size-3.5" /> : i + 1}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium",
                    i <= step ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {s}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn("flex-1 h-px mx-3", i < step ? "bg-[#1f1f1f]" : "bg-border")} />
              )}
            </div>
          ))}
        </div>

        {step === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="ord">Order Number</Label>
              <Input id="ord" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Proveedor</Label>
              <Select value={supplierId} onValueChange={setSupplierId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Método de pago</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_TYPES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="desc">Descripción</Label>
              <Textarea
                id="desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Notas internas, justificación o referencia."
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-6">
                <Label className="text-xs">Producto</Label>
                <Select
                  value={pickProduct}
                  onValueChange={(v) => {
                    setPickProduct(v)
                    const p = products.find((x) => x.id === v)
                    if (p) setPickPrice(String(p.unitPrice))
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label className="text-xs">Cantidad</Label>
                <Input type="number" value={pickQty} onChange={(e) => setPickQty(e.target.value)} />
              </div>
              <div className="col-span-3">
                <Label className="text-xs">Precio Unit.</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={pickPrice}
                  onChange={(e) => setPickPrice(e.target.value)}
                />
              </div>
              <div className="col-span-1 flex items-end">
                <Button
                  type="button"
                  size="icon"
                  className="bg-[#7b1a1a] hover:bg-[#5c1212] text-white"
                  onClick={addLine}
                >
                  <Plus className="size-4" />
                </Button>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-[#fafafa]">
              {lines.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  Sin productos agregados aún.
                </div>
              ) : (
                <ul>
                  {lines.map((l, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between gap-3 px-3 py-2.5 border-b last:border-b-0 border-border text-sm"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground truncate">{l.productName}</div>
                        <div className="text-xs text-muted-foreground">
                          {l.quantity} × ${l.unitPrice.toFixed(2)}
                        </div>
                      </div>
                      <span className="tabular-nums font-medium">
                        ${(l.quantity * l.unitPrice).toLocaleString()}
                      </span>
                      <button
                        onClick={() => setLines((prev) => prev.filter((_, idx) => idx !== i))}
                        className="text-muted-foreground hover:text-red-600"
                        aria-label="Eliminar línea"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex items-center justify-between px-3 py-3 border-t border-border bg-card rounded-b-lg">
                <span className="text-sm font-medium text-foreground">Total</span>
                <span className="font-serif text-lg font-semibold tabular-nums">
                  ${total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3 text-sm">
            <ReviewRow label="Order #" value={orderNumber} />
            <ReviewRow label="Proveedor" value={supplier.name} />
            <ReviewRow label="Método de pago" value={paymentMethod} />
            <ReviewRow label="Tipo" value={type} />
            <ReviewRow label="Artículos" value={`${lines.length}`} />
            <ReviewRow label="Total" value={`$${total.toLocaleString()}`} bold />
            {description && (
              <div className="rounded-md border border-border bg-[#fafafa] p-3 text-sm">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
                  Descripción
                </div>
                {description}
              </div>
            )}
          </div>
        )}

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => (step === 0 ? close() : setStep((s) => s - 1))}>
            {step === 0 ? "Cancelar" : "Atrás"}
          </Button>
          {step < STEPS.length - 1 ? (
            <Button
              className="bg-[#7b1a1a] hover:bg-[#5c1212] text-white"
              onClick={() => setStep((s) => s + 1)}
            >
              Siguiente
            </Button>
          ) : (
            <Button className="bg-[#7b1a1a] hover:bg-[#5c1212] text-white" onClick={submit}>
              Crear Pedido
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ReviewRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-2 last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("text-foreground", bold && "font-semibold font-serif text-lg")}>
        {value}
      </span>
    </div>
  )
}
