"use client"

import { Copy, ExternalLink, Printer, X } from "lucide-react"
import { Receipt } from "@/lib/mock-data"
import { useState } from "react"

interface ReceiptDetailPanelProps {
  receipt: Receipt | null
  onClose: () => void
}

export function ReceiptDetailPanel({ receipt, onClose }: ReceiptDetailPanelProps) {
  const [copied, setCopied] = useState(false)

  if (!receipt) return null

  const handleCopy = () => {
    navigator.clipboard.writeText(receipt.receiptNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="w-full bg-white rounded-lg border border-[#f3f4f6] p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-[#111827]">Detalle de Recepción</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-[#f5f5f7] rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-[#6b7280]" />
        </button>
      </div>

      {/* Receipt Number */}
      <div className="mb-6 pb-6 border-b border-[#f3f4f6]">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-3xl font-bold font-mono text-[#7b1a1a]">
            {receipt.receiptNumber}
          </span>
          <button
            onClick={handleCopy}
            className="p-2 hover:bg-[#f5f5f7] rounded-lg transition-colors"
            title="Copiar número"
          >
            <Copy className="w-4 h-4 text-[#6b7280]" />
          </button>
        </div>

        {copied && <p className="text-xs text-green-600">Copiado al portapapeles</p>}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-[#6b7280] font-medium">Orden</p>
            <p className="text-[#7b1a1a] font-semibold mt-1">
              #{receipt.purchaseOrderNumber}
            </p>
          </div>
          <div>
            <p className="text-[#6b7280] font-medium">Proveedor</p>
            <p className="text-[#111827] font-semibold mt-1">{receipt.supplierName}</p>
          </div>
          <div>
            <p className="text-[#6b7280] font-medium">Fecha recepción</p>
            <p className="text-[#111827] mt-1">
              {new Date(receipt.date).toLocaleDateString("es-ES", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })},09:41
            </p>
          </div>
          <div>
            <p className="text-[#6b7280] font-medium">Estado</p>
            <div className="mt-1">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  receipt.status === "COMPLETADA"
                    ? "bg-green-100 text-green-700"
                    : "bg-orange-100 text-orange-700"
                }`}
              >
                {receipt.status === "COMPLETADA" ? "COMPLETADA" : "PARCIAL"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Items Received */}
      <div className="mb-6">
        <h4 className="font-semibold text-[#111827] mb-4">Ítems recibidos</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#f3f4f6]">
                <th className="text-left py-2 px-0 font-semibold text-[#6b7280]">PRODUCTO</th>
                <th className="text-left py-2 px-0 font-semibold text-[#6b7280]">SKU</th>
                <th className="text-right py-2 px-0 font-semibold text-[#6b7280]">ESPERADO</th>
                <th className="text-right py-2 px-0 font-semibold text-[#6b7280]">RECIBIDO</th>
                <th className="text-right py-2 px-0 font-semibold text-[#6b7280]">DIFERENCIA</th>
              </tr>
            </thead>
            <tbody>
              {receipt.items.map((item) => {
                const difference = item.receivedQty - item.expectedQty
                const isComplete = difference === 0
                const isPartial = difference < 0
                const isOver = difference > 0

                return (
                  <tr key={item.productId} className="border-b border-[#f3f4f6] hover:bg-[#f5f5f7]">
                    <td className="py-3 px-0 text-[#111827]">{item.productName}</td>
                    <td className="py-3 px-0 text-[#6b7280] font-mono">{item.sku}</td>
                    <td className="py-3 px-0 text-right text-[#111827]">
                      {item.expectedQty} {item.uom}
                    </td>
                    <td className="py-3 px-0 text-right text-[#111827]">
                      {item.receivedQty} {item.uom}
                    </td>
                    <td className="py-3 px-0 text-right font-semibold">
                      {isComplete && (
                        <span className="text-green-700 flex items-center justify-end gap-1">
                          ✓ 0
                        </span>
                      )}
                      {isPartial && (
                        <span className="text-red-700 flex items-center justify-end gap-1">
                          ⚠ {difference}
                        </span>
                      )}
                      {isOver && <span className="text-blue-700">+{difference}</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notes */}
      <div className="mb-6 pb-6 border-b border-[#f3f4f6]">
        <h4 className="font-semibold text-[#111827] mb-3">Notas</h4>
        <div className="bg-[#f5f5f7] rounded-lg p-4 text-sm text-[#6b7280]">
          {receipt.notes}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button className="w-full px-4 py-2.5 border border-[#f3f4f6] rounded-lg text-sm font-medium text-[#111827] hover:bg-[#f5f5f7] transition-colors flex items-center justify-center gap-2">
          <ExternalLink className="w-4 h-4" />
          Ver Orden de Compra
        </button>
        <button className="w-full px-4 py-2.5 border border-[#f3f4f6] rounded-lg text-sm font-medium text-[#111827] hover:bg-[#f5f5f7] transition-colors flex items-center justify-center gap-2">
          <Printer className="w-4 h-4" />
          Imprimir Nota
        </button>
      </div>
    </div>
  )
}
