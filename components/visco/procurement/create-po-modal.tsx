"use client"

import { ORDER_TYPES, PAYMENT_METHODS } from "@/lib/constants"
import { useEffect, useMemo, useRef, useState } from "react"
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
import { createOrder } from "@/lib/services/procurement"
import { fetchWarehouses } from "@/lib/services/warehouse"
import type { CreatePurchaseOrderRequest, ProductDTO, RequisitionResponse, SupplierDTO } from "@/lib/types"
import { fetchSuppliers, createSupplier } from "@/lib/services/suppliers"
import { fetchProducts } from "@/lib/services/inventory"
import { fetchRequisitions } from "@/lib/services/requisitions"
import { getCachedUser } from "@/lib/auth-client"
import { canCreateSupplierFromPo } from "@/lib/permissions"
import { CheckIcon, ArrowPathIcon, PlusIcon, TrashIcon, MagnifyingGlassIcon, XMarkIcon, BuildingOffice2Icon } from "@heroicons/react/24/outline"
import { SupplierModal } from "@/components/visco/suppliers/supplier-modal"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface LineItem {
  id: number
  productId: number
  productName: string
  quantity: number
  unitPrice: number
  sku: string
}

const STEPS = ["Información", "Productos", "Revisión"] as const

export function CreatePOModal({
  open,
  onOpenChange,
  onCreated,
  prefillFromRequisition,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  onCreated: () => void
  prefillFromRequisition?: RequisitionResponse | null
}) {
  const [step, setStep] = useState(0)
  const nextLineIdRef = useRef(1)
  const [description, setDescription] = useState("")
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[1])
  const [type, setType] = useState(ORDER_TYPES[1])
  const [supplierId, setSupplierId] = useState<number | null>(null)
  const [lines, setLines] = useState<LineItem[]>([])
  const [pickProduct, setPickProduct] = useState<ProductDTO | null>(null)
  const [pickQty, setPickQty] = useState("1")
  const [pickPrice, setPickPrice] = useState("0")
  const [destinationWarehouseId, setDestinationWarehouseId] = useState<number | null>(null)
  const [leadTime, setLeadTime] = useState("")
  const [warehouses, setWarehouses] = useState<{ id: number; name: string }[]>([])
  const [suppliers, setSuppliers] = useState<{ id: number; name: string }[]>([])
  const [products, setProducts] = useState<ProductDTO[]>([])
  const [saving, setSaving] = useState(false)
  const [requisitions, setRequisitions] = useState<RequisitionResponse[]>([])
  const [supplierModalOpen, setSupplierModalOpen] = useState(false)
  const [creatingSupplier, setCreatingSupplier] = useState(false)
  const user = getCachedUser()
  const canCreateSupplier = canCreateSupplierFromPo(user)
  const [selectedRequisitionId, setSelectedRequisitionId] = useState<number | null>(null)

  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => clearTimeout(closeTimerRef.current ?? undefined)
  }, [])

  // Product finder state
  const [finderOpen, setFinderOpen] = useState(false)
  const [finderQuery, setFinderQuery] = useState("")
  const [debouncedFinderQuery, setDebouncedFinderQuery] = useState("")
  const [loadingProducts, setLoadingProducts] = useState(false)
  const finderRef = useRef<HTMLDivElement>(null)

  const prefillIdRef = useRef<number | null>(null)

  // Carga los catálogos (suppliers, products, warehouses, requisitions)
  // cada vez que el modal se abre desde cerrado. Solo depende de `open`
  // para que el padre re-renderizando con un nuevo prefillFromRequisition
  // no skipee el fetch.
  useEffect(() => {
    if (!open) return

    Promise.all([
      fetchSuppliers(0, 200).then((supRes) => {
        setSuppliers((supRes.content ?? []).map((s) => ({ id: s.id, name: s.name })))
      }),
      fetchProducts(0, 9999, "", undefined, undefined, undefined, undefined).then((prodRes) => {
        setProducts(prodRes.content ?? [])
      }),
      fetchWarehouses().then((wh) => {
        setWarehouses(wh)
        setDestinationWarehouseId((prev) => prev ?? wh[0]?.id ?? null)
      }),
      fetchRequisitions(0, 200, "APPROVED").then((reqRes) => {
        setRequisitions(reqRes.content ?? [])
      }),
    ]).catch(() => {
      // Errors are non-fatal; individual fetches already swallow them.
    })
  }, [open])

  // Aplica el prefill cuando llega una requisition específica.
  // Usa prefillIdRef para evitar re-seed si el padre re-crea la referencia
  // del objeto prefill con el mismo id.
  useEffect(() => {
    if (!open || !prefillFromRequisition) return
    if (prefillIdRef.current === prefillFromRequisition.id) return
    prefillIdRef.current = prefillFromRequisition.id
    setSelectedRequisitionId(prefillFromRequisition.id)
    setDescription(prefillFromRequisition.description)
    setLines(
      prefillFromRequisition.items.map((item) => {
        const id = nextLineIdRef.current++
        return {
          id,
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: 0,
          sku: item.productSku,
        }
      }),
    )
  }, [open, prefillFromRequisition?.id])

  // Reset del prefillId cuando el modal se cierra para que al reabrir
  // con la misma requisition se vuelva a sembrar.
  useEffect(() => {
    if (!open) {
      prefillIdRef.current = null
    }
  }, [open])

  useEffect(() => {
    if (!finderOpen) setFinderQuery("")
  }, [finderOpen])

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedFinderQuery(finderQuery), 300)
    return () => clearTimeout(timer)
  }, [finderQuery])

  // Close finder on outside click
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
    if (!finderOpen) return
    const controller = new AbortController()
    const fetchData = async () => {
      setLoadingProducts(true)
      try {
        const res = await fetchProducts(0, 9999, debouncedFinderQuery || undefined, undefined, undefined, undefined, undefined, controller.signal)
        if (!controller.signal.aborted) {
          setProducts(res.content ?? [])
        }
      } catch {
        // ignore
      } finally {
        if (!controller.signal.aborted) {
          setLoadingProducts(false)
        }
      }
    }
    fetchData()
    return () => controller.abort()
  }, [debouncedFinderQuery, finderOpen])

  const total = useMemo(() => lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0), [lines])

  const reset = () => {
    setStep(0)
    setLines([])
    setDescription("")
    setSupplierId(null)
    setPickProduct(null)
    setFinderQuery("")
    setFinderOpen(false)
    setSelectedRequisitionId(null)
    nextLineIdRef.current = 1
  }

  const close = () => {
    onOpenChange(false)
    clearTimeout(closeTimerRef.current ?? undefined)
    closeTimerRef.current = setTimeout(reset, 200)
  }

  const handleRequisitionChange = (idStr: string) => {
    const id = idStr ? Number(idStr) : null
    setSelectedRequisitionId(id)
    if (id) {
      const req = requisitions.find((r) => r.id === id)
      if (req) {
        setDescription(req.description)
        setLines(
          req.items.map((item) => {
            const id = nextLineIdRef.current++
            return {
              id,
              productId: item.productId,
              productName: item.productName,
              quantity: item.quantity,
              unitPrice: 0,
              sku: item.productSku,
            }
          }),
        )
      }
    }
  }

  const handleCreateSupplier = async (data: Partial<SupplierDTO>) => {
    try {
      setCreatingSupplier(true)
      const created = await createSupplier(data)
      setSuppliers((prev) => [...prev, { id: created.id, name: created.name }])
      setSupplierId(created.id)
      setSupplierModalOpen(false)
      toast.success("Proveedor creado")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al crear proveedor")
    } finally {
      setCreatingSupplier(false)
    }
  }

  const addLine = () => {
    if (!pickProduct) {
      toast.error("Selecciona un producto")
      return
    }
    const qty = Number(pickQty)
    const price = Number(pickPrice)
    if (qty <= 0 || price <= 0) {
      toast.error("Cantidad y precio deben ser mayores a cero")
      return
    }
    if (lines.some((l) => l.productId === pickProduct.id)) {
      toast.error("Este producto ya está en la lista")
      return
    }
    setLines((prev) => [
      ...prev,
      { id: nextLineIdRef.current++, productId: pickProduct.id, productName: pickProduct.name, quantity: qty, unitPrice: price, sku: pickProduct.sku },
    ])
    setPickProduct(null)
    setPickQty("1")
    setPickPrice("0")
    setFinderOpen(false)
  }

  const submit = async () => {
    if (!description.trim()) {
      toast.error("La descripción es requerida")
      return
    }
    if (!supplierId) {
      toast.error("El proveedor es requerido")
      return
    }
    if (!destinationWarehouseId) {
      toast.error("El almacén destino es requerido")
      return
    }
    if (lines.length === 0) {
      toast.error("Agrega al menos un producto")
      return
    }
    const user = getCachedUser()
    if (!user) {
      toast.error("Debes iniciar sesión para crear pedidos")
      return
    }
    setSaving(true)
    try {
      const body: CreatePurchaseOrderRequest = {
        description,
        supplierId,
        destinationWarehouseId,
        paymentMethod: paymentMethod as CreatePurchaseOrderRequest["paymentMethod"],
        type: type as CreatePurchaseOrderRequest["type"],
        createdById: user.id,
        items: lines.map((l) => ({ productId: l.productId, quantity: l.quantity, unitPrice: l.unitPrice })),
      }
      if (leadTime) body.leadTime = Number(leadTime)
      if (prefillFromRequisition) {
        body.requisitionId = prefillFromRequisition.id
      } else if (selectedRequisitionId) {
        body.requisitionId = selectedRequisitionId
      }
      const created = await createOrder(body)

      toast.success(`Pedido ${created.orderNumber} creado`)
      onCreated()
      close()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al crear pedido")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(true) : close())}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif">Crear Pedido de Compra</DialogTitle>
          <DialogDescription>
            Completa la información, agrega productos y revisa antes de enviar.
          </DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
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
              <Label>Número de Pedido</Label>
              <div className="flex h-9 items-center px-3 rounded-md border border-input bg-muted/50 text-sm text-muted-foreground">
                Se asignará automáticamente
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Proveedor</Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Select value={String(supplierId ?? "")} onValueChange={(v) => setSupplierId(Number(v))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar…" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((s) => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {canCreateSupplier && (
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={() => setSupplierModalOpen(true)}
                    title="Crear nuevo proveedor"
                  >
                    <BuildingOffice2Icon className="size-4" />
                  </Button>
                )}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Almacén destino</Label>
              <Select value={String(destinationWarehouseId ?? "")} onValueChange={(v) => setDestinationWarehouseId(Number(v))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar…" />
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
            <div className="space-y-1.5">
              <Label htmlFor="lt">Tiempo de Entrega (dias) *</Label>
              <Input id="lt" type="number" min="0" placeholder="Obligatorio" value={leadTime} onChange={(e) => setLeadTime(e.target.value)} />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <Label>Requisición (opcional)</Label>
              <Select
                value={String(selectedRequisitionId ?? "")}
                onValueChange={handleRequisitionChange}
                disabled={!!prefillFromRequisition}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar requisición aprobada…" />
                </SelectTrigger>
                <SelectContent>
                  {requisitions.map((r) => (
                    <SelectItem key={r.id} value={String(r.id)}>
                      {r.requisitionNumber} — {r.description}
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

        {/* Step 1: Products */}
        {step === 1 && (
          <div className="space-y-4">
            {/* Product finder */}
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
                    placeholder="Cant."
                    className="w-20"
                    value={pickQty}
                    onChange={(e) => setPickQty(e.target.value)}
                  />
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Precio"
                    className="w-28"
                    value={pickPrice}
                    onChange={(e) => setPickPrice(e.target.value)}
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

                {/* Finder dropdown */}
                {finderOpen && loadingProducts && (
                  <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-card shadow-lg p-3 text-sm text-muted-foreground text-center">
                    <ArrowPathIcon className="size-4 animate-spin inline mr-2" />
                    Buscando…
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
                          {p.sku} · {p.internalCode} · {p.sapCode} · {p.uom}
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

            {/* Lines list */}
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
                      className="flex items-center gap-3 px-3 py-2.5 border-b last:border-b-0 border-border text-sm"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground truncate">{l.productName}</div>
                        <div className="text-xs text-muted-foreground font-mono">{l.sku}</div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <input
                          type="number"
                          min="1"
                          placeholder="0"
                          className="w-16 rounded-md border border-border bg-card px-2 py-1 text-center text-xs tabular-nums"
                          value={l.quantity || ""}
                          onChange={(e) => {
                            if (e.target.value === "") {
                              setLines((prev) =>
                                prev.map((line) =>
                                  line.id === l.id ? { ...line, quantity: 0 } : line,
                                ),
                              )
                              return
                            }
                            const v = parseInt(e.target.value, 10)
                            if (!isNaN(v) && v >= 0) {
                              setLines((prev) =>
                                prev.map((line) =>
                                  line.id === l.id ? { ...line, quantity: v } : line,
                                ),
                              )
                            }
                          }}
                        />
                        <span className="text-xs text-muted-foreground">×</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          className="w-24 rounded-md border border-border bg-card px-2 py-1 text-right text-xs tabular-nums"
                          value={l.unitPrice || ""}
                          onChange={(e) => {
                            if (e.target.value === "") {
                              setLines((prev) =>
                                prev.map((line) =>
                                  line.id === l.id ? { ...line, unitPrice: 0 } : line,
                                ),
                              )
                              return
                            }
                            const v = parseFloat(e.target.value)
                            if (!isNaN(v)) {
                              setLines((prev) =>
                                prev.map((line) =>
                                  line.id === l.id ? { ...line, unitPrice: v } : line,
                                ),
                              )
                            }
                          }}
                        />
                        <span className="tabular-nums font-medium w-24 text-right text-xs">
                          ${(l.quantity * l.unitPrice).toLocaleString()}
                        </span>
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
                <span className="text-sm font-medium text-foreground">Total</span>
                <span className="font-serif text-lg font-semibold tabular-nums">
                  ${total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Review */}
        {step === 2 && (
          <div className="space-y-3 text-sm">
            <ReviewRow label="Proveedor" value={suppliers.find((s) => s.id === supplierId)?.name ?? "-"} />
            <ReviewRow
              label="Requisición"
              value={
                selectedRequisitionId
                  ? requisitions.find((r) => r.id === selectedRequisitionId)?.requisitionNumber ?? "-"
                  : "-"
              }
            />
            <ReviewRow label="Almacén destino" value={warehouses.find((w) => w.id === destinationWarehouseId)?.name ?? "-"} />
            <ReviewRow label="Método de pago" value={paymentMethod} />
            <ReviewRow label="Tipo" value={type} />
            <ReviewRow label="Tiempo de Entrega" value={leadTime ? `${leadTime} dias` : "-"} />
            <ReviewRow label="Artículos" value={`${lines.length}`} />
            <ReviewRow label="Total" value={`$${total.toLocaleString()}`} bold />
            <div className="rounded-md border border-border bg-[#fafafa] p-3 text-sm">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
                Descripción
              </div>
              {description}
            </div>
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
              {saving ? <><ArrowPathIcon className="size-4 animate-spin" /> Creando…</> : "Crear Pedido"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>

      <SupplierModal
        open={supplierModalOpen}
        onOpenChange={(o) => {
          setSupplierModalOpen(o)
        }}
        editing={null}
        onSave={handleCreateSupplier}
        saving={creatingSupplier}
      />
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
