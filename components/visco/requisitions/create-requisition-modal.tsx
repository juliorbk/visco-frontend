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
import { createRequisition } from "@/lib/services/requisitions"
import { fetchAllCostCenters } from "@/lib/services/admin"
import { fetchProducts } from "@/lib/services/inventory"
import { getCachedUser } from "@/lib/auth-client"
import type { CostCenter, ProductDTO } from "@/lib/types"
import {
  CheckIcon,
  ArrowPathIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  XMarkIcon,
  ChevronUpDownIcon,
} from "@heroicons/react/24/outline"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
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
  const nextLineIdRef = useRef(1)
  const [requisitionNumber, setRequisitionNumber] = useState("")
  const [description, setDescription] = useState("")
  const [costCenterId, setCostCenterId] = useState<number | null>(null)
  const [lines, setLines] = useState<LineItem[]>([])
  const [pickProduct, setPickProduct] = useState<ProductDTO | null>(null)
  const [pickQty, setPickQty] = useState("1")
  const [pickNotes, setPickNotes] = useState("")
  const [costCenters, setCostCenters] = useState<CostCenter[]>([])
  const [openCc, setOpenCc] = useState(false)
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
      fetchAllCostCenters(0, 200).then((res) => setCostCenters(res.content ?? [])).catch(() => {})
    }
  }, [open])

  useEffect(() => {
    if (!finderOpen) {
      setFinderQuery("")
      setDebouncedFinderQuery("")
    }
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
  }, [debouncedFinderQuery])

  const reset = () => {
    setStep(0)
    setLines([])
    setDescription("")
    setRequisitionNumber("")
    setCostCenterId(null)
    setPickProduct(null)
    setFinderQuery("")
    setFinderOpen(false)
    setPickNotes("")
    nextLineIdRef.current = 1
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
      { id: nextLineIdRef.current++, productId: pickProduct.id, productName: pickProduct.name, quantity: qty, sku: pickProduct.sku, notes: pickNotes },
    ])
    setPickProduct(null)
    setPickQty("1")
    setPickNotes("")
    setFinderOpen(false)
  }

  const submit = async () => {
    if (!costCenterId || lines.length === 0 || !requisitionNumber.trim()) {
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
      const created = await createRequisition({
        requisitionNumber,
        description,
        requestedById: user.id,
        costCenterId,
        items: lines.map((l) => ({ productId: l.productId, quantity: l.quantity, notes: l.notes || undefined })),
      })
      toast.success(`Requisición ${created.requisitionNumber} creada`)
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
              <Label htmlFor="req-number">Número de Requisición</Label>
              <Input
                id="req-number"
                value={requisitionNumber}
                onChange={(e) => setRequisitionNumber(e.target.value)}
                placeholder="Ej: REQ-2026-001"
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Centro de Costo</Label>
              <Popover open={openCc} onOpenChange={setOpenCc}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCc}
                    className="w-full justify-between font-normal bg-background h-9"
                  >
                    {costCenterId
                      ? (() => {
                          const cc = costCenters.find((c) => c.id === costCenterId)
                          return cc
                            ? `${cc.code} — ${cc.fullDescription}${cc.managementDescription ? ` (${cc.managementDescription})` : ""}`
                            : "Seleccionar…"
                        })()
                      : "Seleccionar…"}
                    <ChevronUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[var(--radix-popover-trigger-width)] p-0"
                  align="start"
                  onOpenAutoFocus={(e) => e.preventDefault()}
                >
                  <Command>
                    <CommandInput placeholder="Buscar centro de costo…" />
                    <CommandList>
                      <CommandEmpty>No se encontraron centros de costo.</CommandEmpty>
                      <CommandGroup>
                        {costCenters.map((cc) => (
                          <CommandItem
                            key={cc.id}
                            value={`${cc.code} ${cc.fullDescription}`}
                            onSelect={() => {
                              setCostCenterId(cc.id)
                              setOpenCc(false)
                            }}
                          >
                            <CheckIcon
                              className={cn(
                                "mr-2 h-4 w-4",
                                costCenterId === cc.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col">
                              <span className="font-medium">{cc.code} — {cc.fullDescription}</span>
                              {cc.managementDescription && (
                                <span className="text-xs text-muted-foreground">
                                  Gerencia: {cc.managementDescription}
                                </span>
                              )}
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
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
                    placeholder="Cant."
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
                          {p.sku} · {p.internalCode} · {p.sapCode} · {p.uom}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {finderOpen && !loadingProducts && products.length === 0 && (
                  <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-card shadow-lg p-3 text-sm text-muted-foreground text-center">
                    {finderQuery ? "No se encontraron productos" : "No hay productos registrados"}
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
            <ReviewRow
              label="Centro de Costo"
              value={
                (() => {
                  const cc = costCenters.find((c) => c.id === costCenterId)
                  return cc
                    ? `${cc.code} — ${cc.fullDescription}${cc.managementDescription ? ` (${cc.managementDescription})` : ""}`
                    : "-"
                })()
              }
            />
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
