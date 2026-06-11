"use client"

import { useState } from "react"
import { ChevronLeftIcon, ChevronRightIcon, MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline"
import type { GoodReceiptResponse } from "@/lib/types"
import { cn } from "@/lib/utils"

interface ReceiptsTableProps {
  receipts: GoodReceiptResponse[]
  onSelectReceipt: (receipt: GoodReceiptResponse) => void
  selectedReceiptId?: number
  searchQuery: string
  onSearchChange: (value: string) => void
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function ReceiptsTable({
  receipts,
  onSelectReceipt,
  selectedReceiptId,
  searchQuery,
  onSearchChange,
  currentPage,
  totalPages,
  onPageChange,
}: ReceiptsTableProps) {
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredReceipts =
    statusFilter === "all"
      ? receipts
      : receipts.filter((r) => r.updatedStatus === statusFilter)

  return (
    <div className="flex-1">
      <div className="bg-white rounded-lg border border-[#f3f4f6] p-3 md:p-4 mb-4 space-y-3 md:space-y-4">
        <div className="flex flex-col md:flex-row gap-2 md:gap-3">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#9ca3af]" />
            <input
              type="text"
              placeholder="Buscar por # recepción, orden..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[#f3f4f6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1a1a]/30"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              onPageChange(1)
            }}
            className="px-3 md:px-4 py-2 border border-[#f3f4f6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1a1a]/30 bg-white"
          >
            <option value="all">Todos los estados</option>
            <option value="DELIVERED">Completada</option>
            <option value="PARTIALLY_DELIVERED">Parcial</option>
          </select>
        </div>

        {(searchQuery || statusFilter !== "all") && (
          <button
            onClick={() => {
              onSearchChange("")
              setStatusFilter("all")
              onPageChange(1)
            }}
            className="text-sm text-[#7b1a1a] hover:text-[#5c1212] font-medium flex items-center gap-1"
          >
            <XMarkIcon className="w-4 h-4" />
            Limpiar filtros
          </button>
        )}
      </div>

      {filteredReceipts.length > 0 ? (
        <div className="bg-white rounded-lg border border-[#f3f4f6] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#f5f5f7] border-b border-[#f3f4f6]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6b7280]"># RECEPCION</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6b7280]">ORDEN DE COMPRA</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6b7280]">FECHA</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6b7280]">RECIBIDO POR</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6b7280]">ITEMS</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6b7280]">ESTADO</th>
                </tr>
              </thead>
              <tbody>
                {filteredReceipts.map((receipt) => {
                  const isSelected = selectedReceiptId === receipt.id
                  return (
                    <tr
                      key={receipt.id}
                      onClick={() => onSelectReceipt(receipt)}
                      className={cn(
                        "border-b border-[#f3f4f6] cursor-pointer transition-colors",
                        isSelected
                          ? "bg-[#fde8e8] border-l-4 border-l-[#7b1a1a]"
                          : "hover:bg-[#f5f5f7]",
                      )}
                    >
                      <td className="px-6 py-4 text-sm font-mono text-[#7b1a1a]">
                        {receipt.receiptNumber}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#111827]">
                        {receipt.orderNumber}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#6b7280]">
                        {new Date(receipt.receivedAt).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#111827]">
                        {receipt.receivedBy ?? "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#111827]">
                        {receipt.items.length} ítem{receipt.items.length !== 1 ? "s" : ""}
                      </td>
                      <td className="px-6 py-4 text-sm">
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
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-[#f3f4f6] bg-[#f5f5f7]">
              <span className="text-sm text-[#6b7280]">
                Página {currentPage} de {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-[#f3f4f6] hover:bg-[#f5f5f7] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-[#f3f4f6] hover:bg-[#f5f5f7] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-[#f3f4f6] p-12 text-center">
          <p className="text-[#6b7280] text-sm">No se encontraron recepciones</p>
        </div>
      )}
    </div>
  )
}
