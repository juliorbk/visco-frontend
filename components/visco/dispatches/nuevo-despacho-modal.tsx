"use client"

import { useEffect, useState } from "react"
import { XMarkIcon, MagnifyingGlassIcon, PlusIcon, TrashIcon, ArrowPathIcon } from "@heroicons/react/24/outline"
import type { ProductOnStock, WarehouseResponse } from "@/lib/types"
import { createDispatch, fetchWarehouses, fetchProductsOnStock } from "@/lib/services/warehouse"
import { toast } from "sonner"

interface LineItem {
  id: number
  productId: number
  productName: string
  sku: string
  quantity: number
  outputPrice: number
}

interface NuevoDespachoModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit?: () => void
}

let nextLineId = 1

export function NuevoDespachoModal({ isOpen, onClose, onSubmit }: NuevoDespachoModalProps) {
  const [step, setStep] = useState(1)
  const [warehouses, setWarehouses] = useState<WarehouseResponse[]>([])
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | null>(null)
  const [lines, setLines] = useState<LineItem[]>([])
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)

  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [searchResults, setSearchResults] = useState<ProductOnStock[]>([])
  const [loadingSearch, setLoadingSearch] = useState(false)
  const [pendingQtys, setPendingQtys] = useState<Record<number, string>>({})
  const [pendingPrices, setPendingPrices] = useState<Record<number, string>>({})

  const reset = () => {
    setStep(1)
    setSelectedWarehouseId(null)
    setLines([])
    setNotes("")
    setSearchQuery("")
    setSearchResults([])
    setPendingQtys({})
    setPendingPrices({})
  }

  useEffect(() => {
    if (isOpen) {
      reset()
      fetchWarehouses().then(setWarehouses).catch(() => {})
    }
  }, [isOpen])

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    if (!debouncedSearch || !selectedWarehouseId) {
      setSearchResults([])
      return
    }
    let cancelled = false
    setLoadingSearch(true)
    fetchProductsOnStock(selectedWarehouseId, debouncedSearch)
      .then((res) => { if (!cancelled) setSearchResults(res.content ?? []) })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoadingSearch(false) })
    return () => { cancelled = true }
  }, [debouncedSearch, selectedWarehouseId])

  if (!isOpen) return null

  const handleNext = () => {
    if (step === 1 && selectedWarehouseId) setStep(2)
    else if (step === 2) setStep(3)
  }

  const handleBack = () => {
    if (step === 2) { setStep(1) }
    else if (step === 3) setStep(2)
  }

  const addLine = (product: ProductOnStock) => {
    const qty = Number(pendingQtys[product.id] ?? "1")
    const price = Number(pendingPrices[product.id])
    if (qty <= 0) {
      toast.error("Cantidad debe ser mayor a cero")
      return
    }
    if (!price || price <= 0) {
      toast.error(`Ingresa un precio de salida para ${product.name}`)
      return
    }
    if (lines.some((l) => l.productId === product.id)) {
      toast.error("Este producto ya está en la lista")
      return
    }
    setLines((prev) => [
      ...prev,
      {
        id: nextLineId++,
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        quantity: qty,
        outputPrice: price,
      },
    ])
    setPendingQtys((prev) => { const n = { ...prev }; delete n[product.id]; return n })
    setPendingPrices((prev) => { const n = { ...prev }; delete n[product.id]; return n })
  }

  const handleSubmit = async () => {
    if (!selectedWarehouseId) return
    if (lines.length === 0) {
      toast.error("Agrega al menos un producto")
      return
    }

    setSaving(true)
    try {
      await createDispatch({
        warehouseId: selectedWarehouseId,
        items: lines.map((l) => ({ productId: l.productId, quantity: l.quantity, outputPrice: l.outputPrice })),
        notes,
      })
      toast.success("Despacho registrado correctamente")
      await onSubmit?.()
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al registrar despacho")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-8 border-b border-[#f3f4f6]">
          <h2 className="text-2xl font-bold text-[#111827]">Registrar Despacho</h2>
          <button onClick={onClose} className="p-2 hover:bg-[#f5f5f7] rounded-lg transition-colors">
            <XMarkIcon className="w-6 h-6 text-[#6b7280]" />
          </button>
        </div>

        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${
                    s <= step ? "bg-[#7b1a1a] text-white" : "bg-[#f3f4f6] text-[#6b7280]"
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div className={`h-1 flex-1 mx-2 ${s < step ? "bg-[#7b1a1a]" : "bg-[#f3f4f6]"}`} />
                )}
              </div>
            ))}
          </div>

          {step === 1 && (
            <div>
              <h3 className="text-lg font-semibold text-[#111827] mb-4">Seleccionar Almacén</h3>
              <div className="space-y-3">
                {warehouses.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => setSelectedWarehouseId(w.id)}
                    className={`w-full p-4 rounded-lg border-2 transition-colors text-left ${
                      selectedWarehouseId === w.id
                        ? "border-[#7b1a1a] bg-[#fde8e8]"
                        : "border-[#f3f4f6] hover:border-[#7b1a1a]"
                    }`}
                  >
                    <p className="font-semibold text-[#111827]">{w.name}</p>
                    <p className="text-sm text-[#6b7280]">{w.physicalAddress}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && selectedWarehouseId && (
            <div>
              <h3 className="text-lg font-semibold text-[#111827] mb-2">Agregar Productos</h3>

              <div className="relative mb-4">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af]" />
                <input
                  type="text"
                  placeholder="Buscar producto por nombre o SKU..."
                  className="w-full pl-10 pr-4 py-2 border border-[#f3f4f6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1a1a]/30"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {loadingSearch && (
                <div className="flex items-center justify-center py-4 text-sm text-[#6b7280]">
                  <ArrowPathIcon className="w-4 h-4 animate-spin mr-2" />
                  Buscando productos...
                </div>
              )}

              {!loadingSearch && searchQuery && searchResults.length === 0 && (
                <div className="py-4 text-sm text-[#6b7280] text-center">No se encontraron productos</div>
              )}

              {!loadingSearch && searchResults.length > 0 && (
                <div className="space-y-2 mb-4">
                  {searchResults.map((p) => {
                    const qty = pendingQtys[p.id] ?? "1"
                    const price = pendingPrices[p.id] ?? ""
                    return (
                      <div
                        key={p.id}
                        className="flex items-end gap-2 p-3 border border-[#f3f4f6] rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-[#111827] text-sm truncate">{p.name}</div>
                          <div className="text-xs text-[#6b7280]">
                            SKU: {p.sku} · Stock: {p.currentStock} {p.uom}
                          </div>
                        </div>
                        <div className="w-24 shrink-0">
                          <label className="block text-[10px] font-medium text-[#6b7280] mb-0.5">Cant</label>
                          <input
                            type="number"
                            value={qty}
                            onChange={(e) => setPendingQtys((prev) => ({ ...prev, [p.id]: e.target.value }))}
                            className="w-full px-2 py-1.5 border border-[#f3f4f6] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1a1a]/30"
                            min="1"
                            max={p.currentStock}
                          />
                        </div>
                        <div className="w-28 shrink-0">
                          <label className="block text-[10px] font-medium text-[#6b7280] mb-0.5">PU ($)</label>
                          <input
                            type="number"
                            value={price}
                            onChange={(e) => setPendingPrices((prev) => ({ ...prev, [p.id]: e.target.value }))}
                            className="w-full px-2 py-1.5 border border-[#f3f4f6] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1a1a]/30"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => addLine(p)}
                          className="shrink-0 px-3 py-1.5 bg-[#7b1a1a] text-white rounded-lg text-sm font-medium hover:bg-[#5c1212] transition-colors"
                        >
                          <PlusIcon className="w-4 h-4" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}

              <div className="border border-[#f3f4f6] rounded-lg">
                {lines.length === 0 ? (
                  <div className="p-6 text-center text-sm text-[#6b7280]">
                    Sin productos agregados aún.
                  </div>
                ) : (
                  <>
                    <ul>
                      {lines.map((l) => (
                        <li
                          key={l.id}
                          className="flex items-center justify-between gap-3 px-4 py-3 border-b last:border-b-0 border-[#f3f4f6] text-sm"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-[#111827] truncate">{l.productName}</div>
                            <div className="text-xs text-[#6b7280]">
                              {l.sku} · Cant: {l.quantity} · PU: ${l.outputPrice.toFixed(2)} · Subtotal: ${(l.quantity * l.outputPrice).toFixed(2)}
                            </div>
                          </div>
                          <button
                            onClick={() => setLines((prev) => prev.filter((line) => line.id !== l.id))}
                            className="text-[#6b7280] hover:text-red-600 shrink-0"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-center justify-between px-4 py-3 border-t border-[#f3f4f6] bg-[#fafafa] rounded-b-lg">
                      <span className="text-sm font-medium text-[#111827]">Total productos</span>
                      <span className="font-semibold text-lg">{lines.length}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-[#111827] mb-2">Notas</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Observaciones sobre el despacho..."
                  className="w-full px-4 py-2 border border-[#f3f4f6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1a1a]/30"
                  rows={3}
                  disabled={saving}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center">
              <h3 className="text-2xl font-bold text-[#111827] mb-2">Confirmar Despacho</h3>
              <p className="text-[#6b7280] mb-6">¿Estás seguro de registrar este despacho?</p>
              <div className="bg-[#f5f5f7] rounded-lg p-6 mb-6 space-y-3 text-left">
                <div>
                  <p className="text-xs text-[#6b7280]">Almacén</p>
                  <p className="text-sm font-semibold text-[#111827]">
                    {warehouses.find((w) => w.id === selectedWarehouseId)?.name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#6b7280]">Productos a despachar</p>
                  <div className="space-y-1 mt-1">
                    {lines.map((l) => (
                      <p key={l.id} className="text-sm text-[#111827]">
                        {l.productName} · Cant: {l.quantity} · PU: ${l.outputPrice.toFixed(2)} · Subtotal: ${(l.quantity * l.outputPrice).toFixed(2)}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-between mt-8">
            <div>
              {step > 1 && (
                <button
                  onClick={handleBack}
                  className="px-4 py-2 text-sm font-medium text-[#6b7280] hover:text-[#111827] transition-colors"
                >
                  ← Volver
                </button>
              )}
            </div>
            <div className="flex gap-3">
              {step < 3 ? (
                <button
                  onClick={handleNext}
                  disabled={step === 1 && !selectedWarehouseId}
                  className="px-6 py-2 bg-[#7b1a1a] text-white rounded-lg font-medium hover:bg-[#5c1212] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Continuar
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="px-6 py-2 bg-[#7b1a1a] text-white rounded-lg font-medium hover:bg-[#5c1212] transition-colors disabled:opacity-50"
                >
                  {saving ? "Registrando..." : "Confirmar Despacho"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
