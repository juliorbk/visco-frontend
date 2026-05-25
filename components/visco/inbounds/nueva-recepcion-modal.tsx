"use client"

import { useEffect, useState } from "react"
import { X, Plus, ChevronRight } from "lucide-react"
import type { PurchaseOrderResponse, WarehouseResponse, PurchaseOrderReceiptSummary } from "@/lib/types"
import { receiveGoods, fetchWarehouses, fetchReceiptSummary } from "@/lib/services/warehouse"
import { toast } from "sonner"

interface NuevaRecepcionModalProps {
  isOpen: boolean
  onClose: () => void
  purchaseOrders: PurchaseOrderResponse[]
  onSubmit?: () => Promise<void>
}

export function NuevaRecepcionModal({
  isOpen,
  onClose,
  purchaseOrders,
  onSubmit,
}: NuevaRecepcionModalProps) {
  const [step, setStep] = useState(1)
  const [selectedPO, setSelectedPO] = useState<PurchaseOrderResponse | null>(null)
  const [receivedQuantities, setReceivedQuantities] = useState<{ [key: number]: number }>({})
  const [receiptSummary, setReceiptSummary] = useState<PurchaseOrderReceiptSummary | null>(null)
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)
  const [warehouses, setWarehouses] = useState<WarehouseResponse[]>([])
  const [destinationWarehouseId, setDestinationWarehouseId] = useState<number | null>(null)

  const reset = () => {
    setStep(1)
    setSelectedPO(null)
    setReceivedQuantities({})
    setReceiptSummary(null)
    setNotes("")
    setDestinationWarehouseId(null)
  }

  useEffect(() => {
    if (isOpen) {
      reset()
      fetchWarehouses().then(setWarehouses).catch(() => {})
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSelectPO = async (po: PurchaseOrderResponse) => {
    setSelectedPO(po)
    setReceivedQuantities({})
    setReceiptSummary(null)
    try {
      const summary = await fetchReceiptSummary(po.id)
      setReceiptSummary(summary)
    } catch {
      // fallback: no summary available
    }
  }

  const handleQuantityChange = (productId: number, value: number) => {
    setReceivedQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(0, value),
    }))
  }

  const handleNext = () => {
    if (step === 1 && selectedPO) setStep(2)
    else if (step === 2) setStep(3)
  }

  const handleBack = () => {
    if (step === 2) { setStep(1); setSelectedPO(null); setReceivedQuantities({}) }
    else if (step === 3) setStep(2)
  }

  const handleSubmit = async () => {
    if (!selectedPO) return
    if (!destinationWarehouseId) {
      toast.error("Selecciona un almacén destino")
      return
    }
    setSaving(true)
    try {
      await receiveGoods(selectedPO.id, {
        items: selectedPO.items.map((item) => ({
          productId: item.productId,
          receivedQuantity: receivedQuantities[item.productId] ?? 0,
        })),
        notes,
        destinationWarehouseId,
      })
      toast.success("Recepción registrada correctamente")
      await onSubmit?.()
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al registrar recepción")
    } finally {
      setSaving(false)
    }
  }

  const totalItems = selectedPO?.items.length || 0
  const completedItemsCount =
    selectedPO?.items.filter((item) => {
      const rcv = receivedQuantities[item.productId] || 0
      const summaryItem = receiptSummary?.items.find((s) => s.productId === item.productId)
      const basePending = summaryItem?.pendingQuantity ?? item.quantity
      return rcv >= basePending && rcv > 0
    }).length || 0

  const approvableOrders = purchaseOrders.filter(
    (po) => po.status === "APPROVED" || po.status === "IN_TRANSIT" || po.status === "PARTIALLY_DELIVERED",
  )

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-8 border-b border-[#f3f4f6]">
          <h2 className="text-2xl font-bold text-[#111827]">Registrar Recepción de Mercancía</h2>
          <button onClick={onClose} className="p-2 hover:bg-[#f5f5f7] rounded-lg transition-colors">
            <X className="w-6 h-6 text-[#6b7280]" />
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
                Seleccionar Orden de Compra
              </h3>
              {approvableOrders.length === 0 ? (
                <p className="text-sm text-[#6b7280]">No hay órdenes aprobadas, en tránsito o con recepción parcial disponibles.</p>
              ) : (
                <div className="space-y-3">
                  {approvableOrders.map((po) => (
                    <button
                      key={po.id}
                      onClick={() => handleSelectPO(po)}
                      className={`w-full p-4 rounded-lg border-2 transition-colors text-left ${
                        selectedPO?.id === po.id
                          ? "border-[#7b1a1a] bg-[#fde8e8]"
                          : "border-[#f3f4f6] hover:border-[#7b1a1a]"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-[#111827]">{po.orderNumber}</p>
                          <p className="text-sm text-[#6b7280]">{po.supplierName}</p>
                          <p className="text-xs text-[#9ca3af] mt-1">
                            {po.items.length} ítem{po.items.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 2 && selectedPO && (
            <div>
              <h3 className="text-lg font-semibold text-[#111827] mb-2">
                {selectedPO.orderNumber} — {selectedPO.supplierName}
              </h3>
              <p className="text-sm text-[#6b7280] mb-6">Registrar cantidades recibidas</p>

              <div className="space-y-4 mb-6">
                {selectedPO.items.map((item) => {
                  const received = receivedQuantities[item.productId] || 0
                  const summaryItem = receiptSummary?.items.find((s) => s.productId === item.productId)
                  const ordered = summaryItem?.orderedQuantity ?? item.quantity
                  const basePending = summaryItem?.pendingQuantity ?? ordered
                  const pending = Math.max(0, basePending - received)
                  const isPartial = pending > 0
                  const isComplete = pending === 0 && received > 0

                  return (
                    <div key={item.productId} className="border border-[#f3f4f6] rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-[#111827]">{item.productName}</p>
                          <p className="text-xs text-[#6b7280] font-mono">SKU: {item.productSku}</p>
                        </div>
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
                        <input
                          type="number"
                          value={received}
                          onChange={(e) =>
                            handleQuantityChange(item.productId, parseInt(e.target.value) || 0)
                          }
                          className="w-full max-w-24 justify-self-center text-center px-3 py-2 border border-[#f3f4f6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1a1a]/30"
                          min="0"
                          disabled={saving}
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
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-[#111827] mb-2">Almacén destino</label>
                <select
                  value={destinationWarehouseId ?? ""}
                  onChange={(e) => setDestinationWarehouseId(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-[#f3f4f6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1a1a]/30 bg-white"
                  disabled={saving}
                >
                  <option value="" disabled>Seleccionar almacén...</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-[#111827] mb-2">Notas adicionales</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Observaciones sobre el despacho..."
                  className="w-full px-4 py-2 border border-[#f3f4f6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1a1a]/30"
                  rows={3}
                  disabled={saving}
                />
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-[#6b7280]">
                    {completedItemsCount} de {totalItems} productos completos
                  </p>
                </div>
                <div className="w-full h-2 bg-[#f3f4f6] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#7b1a1a] transition-all"
                    style={{ width: `${(completedItemsCount / totalItems) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && selectedPO && (
            <div className="text-center">
              <h3 className="text-2xl font-bold text-[#111827] mb-2">Confirmar Recepción</h3>
              <p className="text-[#6b7280] mb-6">
                ¿Estás seguro de registrar esta recepción?
              </p>
              <div className="bg-[#f5f5f7] rounded-lg p-6 mb-6 space-y-3 text-left">
                <div>
                  <p className="text-xs text-[#6b7280]">Orden</p>
                  <p className="text-sm font-semibold text-[#111827]">{selectedPO.orderNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6b7280]">Proveedor</p>
                  <p className="text-sm font-semibold text-[#111827]">{selectedPO.supplierName}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6b7280]">Artículos</p>
                  <p className="text-sm font-semibold text-[#111827]">
                    {completedItemsCount} de {totalItems} completos
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
                  disabled={step === 1 && !selectedPO}
                  className="px-6 py-2 bg-[#7b1a1a] text-white rounded-lg font-medium hover:bg-[#5c1212] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  Continuar <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="px-6 py-2 bg-[#7b1a1a] text-white rounded-lg font-medium hover:bg-[#5c1212] transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? "Registrando..." : "Confirmar Recepción"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
