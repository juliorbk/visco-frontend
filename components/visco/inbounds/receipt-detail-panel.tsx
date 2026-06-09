"use client"

import { DocumentDuplicateIcon, ArrowTopRightOnSquareIcon, XMarkIcon, ExclamationTriangleIcon, CheckCircleIcon } from "@heroicons/react/24/outline"
import { ExportPDFButton } from "@/components/ui/export-pdf-button"
import type { GoodReceiptResponse, PurchaseOrderReceiptSummary } from "@/lib/types"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { downloadPDF } from "@/lib/pdf/download-pdf"
import { fetchReceiptSummary } from "@/lib/services/warehouse"

export function ReceiptDetailPanel({
  receipt,
  onClose,
}: {
  receipt: GoodReceiptResponse | null
  onClose: () => void
}) {
  const [copied, setCopied] = useState(false)
  const [summary, setSummary] = useState<PurchaseOrderReceiptSummary | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timer)
  }, [copied])


  useEffect(() => {
    if (receipt?.updatedStatus === "PARTIALLY_DELIVERED") {
      setSummaryLoading(true)
      fetchReceiptSummary(receipt.purchaseOrderId)
        .then(setSummary)
        .catch(() => setSummary(null))
        .finally(() => setSummaryLoading(false))
    } else {
      setSummary(null)
    }
  }, [receipt])

  if (!receipt) return null

  const handleCopy = () => {
    navigator.clipboard.writeText(receipt.receiptNumber)
    setCopied(true)
  }

  return (
    <div className="w-full bg-white rounded-lg border border-[#f3f4f6] p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
      <div className="flex items-center justify-between mb-6 gap-2">
        <h3 className="text-lg font-semibold text-[#111827] truncate min-w-0">Detalles de Recepcion</h3>
        <button onClick={onClose} className="p-1 hover:bg-[#f5f5f7] rounded-lg transition-colors shrink-0">
          <XMarkIcon className="w-5 h-5 text-[#6b7280]" />
        </button>
      </div>

      <div className="mb-6 pb-6 border-b border-[#f3f4f6]">
        <div className="flex items-center gap-2 mb-4 min-w-0">
          <span className="text-3xl font-bold font-mono text-[#7b1a1a] break-all min-w-0">
            {receipt.receiptNumber}
          </span>
          <button
            onClick={handleCopy}
            className="p-2 hover:bg-[#f5f5f7] rounded-lg transition-colors shrink-0"
            title="Copiar numero"
          >
            <DocumentDuplicateIcon className="w-4 h-4 text-[#6b7280]" />
          </button>
        </div>

        {copied && <p className="text-xs text-green-600">Copiado al portapapeles</p>}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="min-w-0">
            <p className="text-[#6b7280] font-medium">Orden</p>
            <p className="text-[#7b1a1a] font-semibold mt-1 truncate">#{receipt.orderNumber}</p>
          </div>
          <div className="min-w-0">
            <p className="text-[#6b7280] font-medium">Estado</p>
            <div className="mt-1">
              <span
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium",
                  receipt.updatedStatus === "DELIVERED"
                    ? "bg-green-100 text-green-700"
                    : "bg-orange-100 text-orange-700",
                )}
              >
                {receipt.updatedStatus === "DELIVERED" ? "COMPLETADA" : "PARCIAL"}
              </span>
            </div>
          </div>
          <div className="col-span-2 min-w-0">
            <p className="text-[#6b7280] font-medium">Fecha de recepcion</p>
            <p className="text-[#111827] mt-1">
              {new Date(receipt.receivedAt).toLocaleDateString("es-VE", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="font-semibold text-[#111827] mb-4">Items recibidos</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#f3f4f6]">
                <th className="text-left py-2 px-0 font-semibold text-[#6b7280]">PRODUCTO</th>
                <th className="text-left py-2 px-0 font-semibold text-[#6b7280]">SKU</th>
                <th className="text-left py-2 px-0 font-semibold text-[#6b7280]">UBICACION</th>
                <th className="text-right py-2 px-0 font-semibold text-[#6b7280] whitespace-nowrap">ESPERADO</th>
                <th className="text-right py-2 px-0 font-semibold text-[#6b7280] whitespace-nowrap">RECIBIDO</th>
                <th className="text-right py-2 px-0 font-semibold text-[#6b7280] whitespace-nowrap">DIFERENCIA</th>
              </tr>
            </thead>
            <tbody>
              {receipt.items.map((item) => {
                const diff = item.expectedQuantity - item.receivedQuantity
                const isComplete = diff === 0
                const isMissing = diff > 0
                const isExtra = diff < 0

                return (
                  <tr key={item.productId} className="border-b border-[#f3f4f6] hover:bg-[#f5f5f7]">
                    <td className="py-3 px-0 text-[#111827] break-words max-w-[180px]">{item.productName}</td>
                    <td className="py-3 px-0 text-[#6b7280] font-mono whitespace-nowrap">{item.productSku}</td>
                    <td className="py-3 px-0 text-[#7b1a1a] font-mono text-xs whitespace-nowrap">
                      {item.locationCode ?? "-"}
                    </td>
                    <td className="py-3 px-0 text-right text-[#111827] whitespace-nowrap">{item.expectedQuantity}</td>
                    <td className="py-3 px-0 text-right text-[#111827] whitespace-nowrap">{item.receivedQuantity}</td>
                    <td className="py-3 px-0 text-right font-semibold whitespace-nowrap">
                      {isComplete && (
                        <span className="text-green-700 flex items-center justify-end gap-1">✓ 0</span>
                      )}
                      {isMissing && (
                        <span className="text-red-700 flex items-center justify-end gap-1">⚠ {diff}</span>
                      )}
                      {isExtra && (
                        <span className="text-blue-700 flex items-center justify-end gap-1">{diff}</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {summary && (
        <div className="mb-6 pb-6 border-b border-[#f3f4f6]">
          <h4 className="font-semibold text-[#111827] mb-4 flex items-center gap-2">
            <ExclamationTriangleIcon className="w-4 h-4 text-orange-500 shrink-0" />
            <span className="truncate">Estado acumulado de la OC ({summary.totalReceipts} recepciones)</span>
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#f3f4f6]">
                  <th className="text-left py-2 px-0 font-semibold text-[#6b7280]">PRODUCTO</th>
                  <th className="text-right py-2 px-0 font-semibold text-[#6b7280] whitespace-nowrap">ORDENADO</th>
                  <th className="text-right py-2 px-0 font-semibold text-[#6b7280] whitespace-nowrap">RECIBIDO</th>
                  <th className="text-right py-2 px-0 font-semibold text-[#6b7280] whitespace-nowrap">PENDIENTE</th>
                  <th className="text-right py-2 px-0 font-semibold text-[#6b7280] whitespace-nowrap">ESTADO</th>
                </tr>
              </thead>
              <tbody>
                {summary.items.map((item) => (
                  <tr key={item.productId} className="border-b border-[#f3f4f6] hover:bg-[#f5f5f7]">
                    <td className="py-3 px-0 text-[#111827] break-words max-w-[180px]">{item.productName}</td>
                    <td className="py-3 px-0 text-right text-[#111827] whitespace-nowrap">{item.orderedQuantity}</td>
                    <td className="py-3 px-0 text-right text-[#111827] whitespace-nowrap">{item.receivedQuantity}</td>
                    <td className="py-3 px-0 text-right text-[#111827] whitespace-nowrap">{item.pendingQuantity}</td>
                    <td className="py-3 px-0 text-right whitespace-nowrap">
                      {item.fullyReceived ? (
                        <span className="text-green-700 flex items-center justify-end gap-1">
                          <CheckCircleIcon className="w-4 h-4" /> Completo
                        </span>
                      ) : (
                        <span className="text-orange-600 flex items-center justify-end gap-1">
                          <ExclamationTriangleIcon className="w-4 h-4" /> Pendiente
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-[#6b7280] mt-3">
            Esta OC tiene {summary.totalReceipts} recepcion{summary.totalReceipts !== 1 ? "es" : ""}.
            Los valores mostrados son el total acumulado de todas las recepciones.
          </p>
        </div>
      )}

      {receipt.notes && (
        <div className="mb-6 pb-6 border-b border-[#f3f4f6]">
          <h4 className="font-semibold text-[#111827] mb-3">Notas</h4>
          <div className="bg-[#f5f5f7] rounded-lg p-4 text-sm text-[#6b7280] break-words">
            {receipt.notes}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <button className="w-full px-4 py-2.5 border border-[#f3f4f6] rounded-lg text-sm font-medium text-[#111827] hover:bg-[#f5f5f7] transition-colors flex items-center justify-center gap-2">
          <ArrowTopRightOnSquareIcon className="w-4 h-4" />
          Ver Orden de Compra
        </button>
        <ExportPDFButton
          onExport={async () => {
            const { generateReceiptPDF } = await import("@/lib/pdf/receipt-pdf")
            const doc = await generateReceiptPDF(receipt, summary)
            downloadPDF(doc, `DELIVERY_NOTE_${receipt.receiptNumber}_${new Date().toISOString().split("T")[0]}.pdf`)
          }}
        />
      </div>
    </div>
  )
}