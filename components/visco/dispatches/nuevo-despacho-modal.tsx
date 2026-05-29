"use client"

import { useEffect, useState } from "react"
import { XMarkIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline"
import type { ProductOnStock, WarehouseResponse } from "@/lib/types"
import { createDispatch, fetchWarehouses, fetchProductsOnStock } from "@/lib/services/warehouse"
import { toast } from "sonner"

interface NuevoDespachoModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit?: () => void
}

export function NuevoDespachoModal({ isOpen, onClose, onSubmit }: NuevoDespachoModalProps) {
  const [step, setStep] = useState(1)
  const [warehouses, setWarehouses] = useState<WarehouseResponse[]>([])
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | null>(null)
  const [products, setProducts] = useState<ProductOnStock[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({})
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)
  const [loadingProducts, setLoadingProducts] = useState(false)

  const reset = () => {
    setStep(1)
    setSelectedWarehouseId(null)
    setProducts([])
    setSearchQuery("")
    setQuantities({})
    setNotes("")
  }

  useEffect(() => {
    if (isOpen) {
      reset()
      fetchWarehouses().then(setWarehouses).catch(() => {})
    }
  }, [isOpen])

  useEffect(() => {
    if (!selectedWarehouseId) return
    let cancelled = false
    setLoadingProducts(true)
    setProducts([])
    fetchProductsOnStock(selectedWarehouseId)
      .then((res) => { if (!cancelled) setProducts(res.content ?? []) })
      .catch((err) => { if (!cancelled) toast.error(err instanceof Error ? err.message : "Error al cargar productos") })
      .finally(() => { if (!cancelled) setLoadingProducts(false) })
    return () => { cancelled = true }
  }, [selectedWarehouseId])

  if (!isOpen) return null

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleQuantityChange = (productId: number, value: number) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(0, Math.min(value, products.find((p) => p.id === productId)?.currentStock ?? value)),
    }))
  }

  const handleNext = () => {
    if (step === 1 && selectedWarehouseId) setStep(2)
    else if (step === 2) setStep(3)
  }

  const handleBack = () => {
    if (step === 2) { setStep(1) }
    else if (step === 3) setStep(2)
  }

  const handleSubmit = async () => {
    if (!selectedWarehouseId) return
    const items = Object.entries(quantities)
      .filter(([_, qty]) => qty > 0)
      .map(([productId, quantity]) => ({ productId: Number(productId), quantity }))

    if (items.length === 0) {
      toast.error("Agrega al menos un producto con cantidad mayor a 0")
      return
    }

    setSaving(true)
    try {
      await createDispatch({
        warehouseId: selectedWarehouseId,
        items,
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
              <h3 className="text-lg font-semibold text-[#111827] mb-4">
                Seleccionar Almacén
              </h3>
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
              <h3 className="text-lg font-semibold text-[#111827] mb-2">
                Seleccionar Productos y Cantidades
              </h3>
              <p className="text-sm text-[#6b7280] mb-6">
                Ingresa las cantidades a despachar del almacén seleccionado
              </p>

              <div className="mb-6">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#9ca3af]" />
                  <input
                    type="text"
                    placeholder="Buscar producto..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-[#f3f4f6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1a1a]/30"
                  />
                </div>
              </div>

              {loadingProducts ? (
                <p className="text-sm text-[#6b7280]">Cargando productos...</p>
              ) : (
                <div className="space-y-4 mb-6">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="border border-[#f3f4f6] rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-[#111827]">{product.name}</p>
                          <p className="text-xs text-[#6b7280] font-mono">SKU: {product.sku}</p>
                        </div>
                        <span className="text-xs font-medium text-[#6b7280]">
                          Stock: {product.currentStock}
                        </span>
                      </div>
                      <div className="grid grid-cols-[1fr_auto] gap-3 items-center">
                        <input
                          type="number"
                          value={quantities[product.id] || 0}
                          onChange={(e) =>
                            handleQuantityChange(product.id, parseInt(e.target.value) || 0)
                          }
                          className="w-full max-w-24 justify-self-center text-center px-3 py-2 border border-[#f3f4f6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1a1a]/30"
                          min="0"
                          max={product.currentStock}
                          disabled={saving}
                        />
                        <span className="text-xs text-[#6b7280]">{product.uom}</span>
                      </div>
                    </div>
                  ))}
                  {filteredProducts.length === 0 && (
                    <p className="text-sm text-[#6b7280] text-center">No se encontraron productos</p>
                  )}
                </div>
              )}

              <div className="mb-6">
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
              <p className="text-[#6b7280] mb-6">
                ¿Estás seguro de registrar este despacho?
              </p>
              <div className="bg-[#f5f5f7] rounded-lg p-6 mb-6 space-y-3 text-left">
                <div>
                  <p className="text-xs text-[#6b7280]">Almacén</p>
                  <p className="text-sm font-semibold text-[#111827]">
                    {warehouses.find((w) => w.id === selectedWarehouseId)?.name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#6b7280]">Productos a despachar</p>
                  <p className="text-sm font-semibold text-[#111827]">
                    {Object.entries(quantities).filter(([_, q]) => q > 0).length} productos
                  </p>
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
