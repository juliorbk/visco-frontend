"use client"

import { Copy, X } from "lucide-react"
import { useEffect, useState } from "react"
import type { DispatchResponse } from "@/lib/types"

export function DispatchDetailPanel({
  dispatch,
  onClose,
}: {
  dispatch: DispatchResponse | null
  onClose: () => void
}) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timer)
  }, [copied])

  if (!dispatch) return null

  const handleCopy = () => {
    navigator.clipboard.writeText(dispatch.dispatchNumber)
    setCopied(true)
  }

  return (
    <div className="w-full bg-white rounded-lg border border-[#f3f4f6] p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-[#111827]">Detalle de Despacho</h3>
        <button onClick={onClose} className="p-1 hover:bg-[#f5f5f7] rounded-lg transition-colors">
          <X className="w-5 h-5 text-[#6b7280]" />
        </button>
      </div>

      <div className="mb-6 pb-6 border-b border-[#f3f4f6]">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-3xl font-bold font-mono text-[#7b1a1a]">
            {dispatch.dispatchNumber}
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
            <p className="text-[#6b7280] font-medium">Almacén</p>
            <p className="text-[#111827] font-semibold mt-1">{dispatch.warehouseName}</p>
          </div>
          <div>
            <p className="text-[#6b7280] font-medium">Creado por</p>
            <p className="text-[#111827] font-semibold mt-1">{dispatch.createdByName}</p>
          </div>
          <div className="col-span-2">
            <p className="text-[#6b7280] font-medium">Fecha de creación</p>
            <p className="text-[#111827] mt-1">
              {new Date(dispatch.createdAt).toLocaleDateString("es-ES", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="font-semibold text-[#111827] mb-4">Ítems despachados</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#f3f4f6]">
                <th className="text-left py-2 px-0 font-semibold text-[#6b7280]">PRODUCTO</th>
                <th className="text-left py-2 px-0 font-semibold text-[#6b7280]">SKU</th>
                <th className="text-right py-2 px-0 font-semibold text-[#6b7280]">CANTIDAD</th>
              </tr>
            </thead>
            <tbody>
              {dispatch.items.map((item) => (
                <tr key={item.productId} className="border-b border-[#f3f4f6] hover:bg-[#f5f5f7]">
                  <td className="py-3 px-0 text-[#111827]">{item.productName}</td>
                  <td className="py-3 px-0 text-[#6b7280] font-mono">{item.productSku}</td>
                  <td className="py-3 px-0 text-right text-[#111827]">{item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {dispatch.notes && (
        <div>
          <h4 className="font-semibold text-[#111827] mb-3">Notas</h4>
          <div className="bg-[#f5f5f7] rounded-lg p-4 text-sm text-[#6b7280]">
            {dispatch.notes}
          </div>
        </div>
      )}
    </div>
  )
}
