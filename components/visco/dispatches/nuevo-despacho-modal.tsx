"use client"

import { useEffect, useRef, useState } from "react"
import { XMarkIcon, MagnifyingGlassIcon, PlusIcon, TrashIcon, ArrowPathIcon } from "@heroicons/react/24/outline"
import type { EmployeeDTO, ProductOnStock, WarehouseResponse } from "@/lib/types"
import { createDispatch, fetchWarehouses, fetchProductsOnStock } from "@/lib/services/warehouse"
import { fetchEmployee } from "@/lib/services/employees"
import { toast } from "sonner"

interface LineItem {
  id: number
  productId: number
  productName: string
  sku: string
  quantity: number
}

interface NuevoDespachoModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit?: () => void
}

export function NuevoDespachoModal({ isOpen, onClose, onSubmit }: NuevoDespachoModalProps) {
  const [step, setStep] = useState(1)
  const nextLineIdRef = useRef(1)
  const [warehouses, setWarehouses] = useState<WarehouseResponse[]>([])
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | null>(null)
  const [lines, setLines] = useState<LineItem[]>([])
  const [employeeFicha, setEmployeeFicha] = useState("")
  const [employeeData, setEmployeeData] = useState<EmployeeDTO | null>(null)
  const [loadingEmployee, setLoadingEmployee] = useState(false)
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)

  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [searchResults, setSearchResults] = useState<ProductOnStock[]>([])
  const [loadingSearch, setLoadingSearch] = useState(false)
  const [pendingQtys, setPendingQtys] = useState<Record<number, string>>({})

  const reset = () => {
    setStep(1)
    setSelectedWarehouseId(null)
    setLines([])
    setEmployeeFicha("")
    setEmployeeData(null)
    setNotes("")
    setSearchQuery("")
    setDebouncedSearch("")
    setSearchResults([])
    setPendingQtys({})
    nextLineIdRef.current = 1
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
    if (!selectedWarehouseId || !debouncedSearch.trim()) {
      setSearchResults([])
      return
    }
    const controller = new AbortController()
    setLoadingSearch(true)
    fetchProductsOnStock(selectedWarehouseId, debouncedSearch, 0, 50, controller.signal)
      .then((res) => { if (!controller.signal.aborted) setSearchResults(res.content ?? []) })
      .catch(() => {})
      .finally(() => { if (!controller.signal.aborted) setLoadingSearch(false) })
    return () => controller.abort()
  }, [debouncedSearch, selectedWarehouseId])

  if (!isOpen) return null

  const lookupEmployee = async () => {
    const id = Number(employeeFicha)
    if (!id) {
      toast.error("Ingresa un número de ficha válido")
      return
    }
    setLoadingEmployee(true)
    setEmployeeData(null)
    try {
      const emp = await fetchEmployee(id)
      setEmployeeData(emp)
      toast.success(`Empleado encontrado: ${emp.fullName}`)
    } catch {
      toast.error("Empleado no encontrado")
    } finally {
      setLoadingEmployee(false)
    }
  }

  const handleNext = () => {
    if (step === 1 && selectedWarehouseId) setStep(2)
    else if (step === 2) {
      if (!employeeData) {
        toast.error("Busca y confirma el empleado que retira")
        return
      }
      setStep(3)
    }
  }

  const handleBack = () => {
    if (step === 2) setStep(1)
    else if (step === 3) setStep(2)
  }

  const addLine = (product: ProductOnStock) => {
    const qty = Number(pendingQtys[product.id] ?? "1")
    if (qty <= 0) {
      toast.error("Cantidad debe ser mayor a cero")
      return
    }
    if (qty > product.currentStock) {
      toast.error(`Stock insuficiente. Disponible: ${product.currentStock}`)
      return
    }
    if (lines.some((l) => l.productId === product.id)) {
      toast.error("Este producto ya está en la lista")
      return
    }
    setLines((prev) => [
      ...prev,
      {
        id: nextLineIdRef.current++,
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        quantity: qty,
      },
    ])
    setPendingQtys((prev) => { const n = { ...prev }; delete n[product.id]; return n })
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
        items: lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
        notes,
        employeeId: employeeData!.id,
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-[#f3f4f6] shrink-0">
          <h2 className="text-xl font-bold text-[#111827]">Registrar Despacho</h2>
          <button onClick={onClose} className="p-2 hover:bg-[#f5f5f7] rounded-lg transition-colors">
            <XMarkIcon className="w-5 h-5 text-[#6b7280]" />
          </button>
        </div>

        <div className="flex items-center justify-center px-6 pt-6 pb-4 shrink-0">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm ${
                  s <= step ? "bg-[#7b1a1a] text-white" : "bg-[#f3f4f6] text-[#6b7280]"
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div className={`h-1 w-16 mx-2 ${s < step ? "bg-[#7b1a1a]" : "bg-[#f3f4f6]"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="px-6 overflow-y-auto flex-1">
          {step === 1 && (
            <div className="pb-6">
              <h3 className="text-base font-semibold text-[#111827] mb-4">Seleccionar Almacén</h3>
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
            <div className="pb-6 space-y-4">
              <h3 className="text-base font-semibold text-[#111827]">Agregar Productos</h3>

              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af]" />
                <input
                  type="text"
                  placeholder="Buscar producto por nombre o SKU..."
                  className="w-full pl-10 pr-4 py-2.5 border border-[#f3f4f6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1a1a]/30"
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

              {!loadingSearch && !debouncedSearch && (
                <div className="py-4 text-sm text-[#6b7280] text-center">Busca un producto para ver resultados</div>
              )}

              {!loadingSearch && debouncedSearch && searchResults.length === 0 && (
                <div className="py-4 text-sm text-[#6b7280] text-center">No se encontraron productos</div>
              )}

              {!loadingSearch && searchResults.length > 0 && (
                <div className="space-y-2">
                  {searchResults.map((p) => {
                    const qty = pendingQtys[p.id] ?? "1"
                    return (
                      <div
                        key={p.id}
                        className="flex items-end gap-2 p-3 border border-[#f3f4f6] rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-[#111827] text-sm truncate">{p.name}</div>
                          <div className="text-xs text-[#6b7280]">
                            SKU: {p.sku} · SAP: {p.sapCode} · Stock: {p.currentStock} {p.uom}
                          </div>
                        </div>
                        <div className="w-20 shrink-0">
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

              <div>
                <label className="block text-sm font-medium text-[#111827] mb-2">Empleado que retira</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={employeeFicha}
                    onChange={(e) => { setEmployeeFicha(e.target.value); setEmployeeData(null) }}
                    placeholder="Número de ficha..."
                    className="flex-1 px-4 py-2.5 border border-[#f3f4f6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1a1a]/30"
                    onKeyDown={(e) => { if (e.key === "Enter") lookupEmployee() }}
                  />
                  <button
                    type="button"
                    onClick={lookupEmployee}
                    disabled={loadingEmployee || !employeeFicha}
                    className="px-4 py-2.5 bg-[#7b1a1a] text-white rounded-lg text-sm font-medium hover:bg-[#5c1212] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  >
                    {loadingEmployee ? "Buscando..." : "Buscar"}
                  </button>
                </div>
                {employeeData && (
                  <div className="mt-2 p-3 bg-[#f0fdf4] border border-[#86efac] rounded-lg">
                    <p className="text-sm font-medium text-[#166534]">{employeeData.fullName}</p>
                    <p className="text-xs text-[#166534]">Doc: {employeeData.documentNumber}</p>
                  </div>
                )}
              </div>

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
                              {l.sku} · Cant: {l.quantity}
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

              <div>
                <label className="block text-sm font-medium text-[#111827] mb-2">Notas</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Observaciones sobre el despacho..."
                  className="w-full px-4 py-2.5 border border-[#f3f4f6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1a1a]/30"
                  rows={3}
                  disabled={saving}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="pb-6 text-center">
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
                  <p className="text-xs text-[#6b7280]">Empleado que retira</p>
                  <p className="text-sm font-semibold text-[#111827]">
                    {employeeData?.fullName} - Ficha: {employeeFicha}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#6b7280]">Productos a despachar</p>
                  <div className="space-y-1 mt-1">
                    {lines.map((l) => (
                      <p key={l.id} className="text-sm text-[#111827]">
                        {l.productName} · Cant: {l.quantity}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 p-6 border-t border-[#f3f4f6] shrink-0 bg-white rounded-b-2xl">
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
  )
}
