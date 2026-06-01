"use client"

import { useEffect, useRef, useState } from "react"
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
import { createRequisition, fetchCostCenters } from "@/lib/services/requisitions"
import { fetchProducts } from "@/lib/services/inventory"
import { getCachedUser } from "@/lib/auth-client"
import type { CostCenter, ProductDTO } from "@/lib/types"
import { CheckIcon, ArrowPathIcon, PlusIcon, MagnifyingGlassIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface LineItem {
  id: number
  productId: number
  productName: string
  quantity: number
  sku: string
  notes: string
}

let nextLineId = 1

const STEPS = ["Información", "Productos", "Revisión"] as const

export function CreateRequisitionModal({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  onCreated: () => void
}) {
  const [step, setStep] = useState(0)
  const [reqNumber, setReqNumber] = useState(`REQ-${Date.now().toString().slice(-4)}`)
  const [description, setDescription] = useState("")
  const [costCenterId, setCostCenterId] = useState<number | null>(null)
  const [lines, setLines] = useState<LineItem[]>([])
  const [pickProduct, setPickProduct] = useState<ProductDTO | null>(null)
  const [pickQty, setPickQty] = useState("1")
  const [pickNotes, setPickNotes] = useState("")
  const [costCenters, setCostCenters] = useState<CostCenter[]>([])
  const [products, setProducts] = useState<ProductDTO[]>([])
  const [saving, setSaving] = useState(false)

  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [finderOpen, setFinderOpen] = useState(false)
  const [finderQuery, setFinderQuery] = useState("")
  const [debouncedFinderQuery, setDebouncedFinderQuery] = useState("")
  const [loadingProducts, setLoadingProducts] = useState(false)
  const finderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    return () => clearTimeout(closeTimerRef.current ?? undefined)
  }, [])

  useEffect(() => {
    if (open) {
      fetchCostCenters().then(setCostCenters).catch(() => {})
    }
  }, [open])

  useEffect(() => {
    if (!finderOpen) setFinderQuery("")
  }, [finderOpen])

  useEffect(() => {
    if (!finderOpen) return
    const handler = (e: MouseEvent) => {
      if (finderRef.current && !finderRef.current.contains(e.target as Node)) {
        setFinderOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [finderOpen])

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedFinderQuery(finderQuery), 300)
    return () => clearTimeout(timer)
  }, [finderQuery])

  useEffect(() => {
    if (!finderOpen) return
    const fetchData = async () => {
      setLoadingProducts(true)
      try {
        const res = await fetchProducts(0, 50, debouncedFinderQuery || undefined)
        setProducts(res.content ?? [])
      } catch {
        // ignore
      } finally {
        setLoadingProducts(false)
      }
    }
    fetchData()
  }, [debouncedFinderQuery, finderOpen])

  const reset = () => {
    setStep(0)
    setLines([])
    setDescription("")
    setCostCenterId(null)
    setPickProduct(null)
    setFinderQuery("")
    setFinderOpen(false)
    setPickNotes("")
  }

  const close = () => {
    onOpenChange(false)
    clearTimeout(closeTimerRef.current ?? undefined)
    closeTimerRef.current = setTimeout(reset, 200)
  }

  const addLine = () => {
    if (!pickProduct) {
      toast.error("Selecciona un producto")
      return
    }
    const qty = Number(pickQty)
    if (qty <= 0) {
      toast.error("Cantidad debe ser mayor a cero")
      return
    }
    if (lines.some((l) => l.productId === pickProduct.id)) {
      toast.error("Este producto ya está en la lista")
      return
    }
    setLines((prev) => [
      ...prev,
      { id: nextLineId++, productId: pickProduct.id, productName: pickProduct.name, quantity: qty, sku: pickProduct.sku, notes: pickNotes },
    ])
    setPickProduct(null)
    setPickQty("1")
    setPickNotes("")
    setFinderOpen(false)
  }

  const submit = async () => {
    if (!costCenterId || lines.length === 0) {
      toast.error("Completa todos los campos requeridos")
      return
    }
    const user = getCachedUser()
    if (!user) {
      toast.error("Debes iniciar sesión para crear requisiciones")
      return
    }
    setSaving(true)
    try {
      await createRequisition({
        requisitionNumber: reqNumber,
        description,
        requestedById: user.id,
        costCenterId,
        items: lines.map((l) => ({ productId: l.productId, quantity: l.quantity, notes: l.notes || undefined })),
      })
      toast.success(`Requisición ${reqNumber} creada`)
      onCreated()
      close()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al crear requisición")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(true) : close())}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif">Crear Requisición</DialogTitle>
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
                  {i < step ? <CheckIcon className="size-3.5" /> : i + 1}
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

        {/* Step 0: Info */}
        {step === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="reqNum">Requisition Number</Label>
              <Input id="reqNum" value={reqNumber} onChange={(e) => setReqNumber(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Centro de Costo</Label>
              <Select
                value={String(costCenterId ?? "")}
                onValueChange={(v) => setCostCenterId(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar…" />
                </SelectTrigger>
                <SelectContent>
                  {costCenters.map((cc) => (
                    <SelectItem key={cc.id} value={String(cc.id)}>
                      {cc.fullDescription}
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
                placeholder="Describe el motivo de la requisición."
              />
            </div>
          </div>
        )}

        {/* Step 1: Products */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Buscar producto</Label>
              <div className="relative" ref={finderRef}>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      placeholder="Escribe nombre, SKU o código…"
                      value={pickProduct ? `${pickProduct.name} (${pickProduct.sku})` : finderQuery}
                      onChange={(e) => {
                        setFinderQuery(e.target.value)
                        setPickProduct(null)
                        setFinderOpen(true)
                      }}
                      onFocus={() => setFinderOpen(true)}
                    />
                    {pickProduct && (
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          setPickProduct(null)
                          setFinderQuery("")
                        }}
                      >
                        <XMarkIcon className="size-4" />
                      </button>
                    )}
                  </div>
                  <Input
                    type="number"
                    placeholder="Cant"
                    className="w-20"
                    value={pickQty}
                    onChange={(e) => setPickQty(e.target.value)}
                  />
                  <Input
                    placeholder="Notas"
                    className="w-28"
                    value={pickNotes}
                    onChange={(e) => setPickNotes(e.target.value)}
                  />
                  <Button
                    type="button"
                    size="icon"
                    className="bg-[#7b1a1a] hover:bg-[#5c1212] text-white shrink-0"
                    onClick={addLine}
                  >
                    <PlusIcon className="size-4" />
                  </Button>
                </div>

                {finderOpen && loadingProducts && (
                  <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-card shadow-lg p-3 text-sm text-muted-foreground text-center">
                    <ArrowPathIcon className="size-4 animate-spin mx-auto" />
                  </div>
                )}
                {finderOpen && !loadingProducts && products.length > 0 && (
                  <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-card shadow-lg max-h-48 overflow-y-auto">
                    {products.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm hover:bg-secondary transition-colors border-b last:border-b-0 border-border/50"
                        onClick={() => {
                          setPickProduct(p)
                          setFinderQuery("")
                          setFinderOpen(false)
                        }}
                      >
                        <div className="font-medium text-foreground">{p.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {p.sku} · {p.internalCode}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {finderOpen && !loadingProducts && finderQuery && products.length === 0 && (
                  <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-card shadow-lg p-3 text-sm text-muted-foreground text-center">
                    No se encontraron productos
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-[#fafafa]">
              {lines.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  Sin productos agregados aún.
                </div>
              ) : (
                <ul>
                    {lines.map((l) => (
                    <li
                      key={l.id}
                      className="flex items-center justify-between gap-3 px-3 py-2.5 border-b last:border-b-0 border-border text-sm"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground truncate">{l.productName}</div>
                        <div className="text-xs text-muted-foreground">
                          {l.sku} · Cant: {l.quantity}
                          {l.notes && <> · {l.notes}</>}
                        </div>
                      </div>
                      <button
                        onClick={() => setLines((prev) => prev.filter((line) => line.id !== l.id))}
                        className="text-muted-foreground hover:text-red-600 shrink-0"
                        aria-label="Eliminar línea"
                      >
                        <TrashIcon className="size-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex items-center justify-between px-3 py-3 border-t border-border bg-card rounded-b-lg">
                <span className="text-sm font-medium text-foreground">Total productos</span>
                <span className="font-serif text-lg font-semibold">{lines.length}</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Review */}
        {step === 2 && (
          <div className="space-y-3 text-sm">
            <ReviewRow label="Requisition #" value={reqNumber} />
            <ReviewRow label="Centro de Costo" value={costCenters.find((c) => c.id === costCenterId)?.fullDescription ?? "-"} />
            <ReviewRow label="Productos" value={`${lines.length}`} />
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
            <Button className="bg-[#7b1a1a] hover:bg-[#5c1212] text-white" onClick={submit} disabled={saving}>
              {saving ? <><ArrowPathIcon className="size-4 animate-spin" /> Creando…</> : "Crear Requisición"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground font-medium">{value}</span>
    </div>
  )
}
