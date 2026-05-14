"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react"
import { Receipt } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

interface ReceiptsTableProps {
  receipts: Receipt[]
  onSelectReceipt: (receipt: Receipt) => void
  selectedReceiptId?: string
}

export function ReceiptsTable({ receipts, onSelectReceipt, selectedReceiptId }: ReceiptsTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("month")
  const [currentPage, setCurrentPage] = useState(1)

  const itemsPerPage = 6
  const filteredReceipts = receipts.filter((receipt) => {
    const matchesSearch =
      receipt.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      receipt.purchaseOrderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      receipt.supplierName.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || receipt.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const totalPages = Math.ceil(filteredReceipts.length / itemsPerPage)
  const startIdx = (currentPage - 1) * itemsPerPage
  const displayedReceipts = filteredReceipts.slice(startIdx, startIdx + itemsPerPage)

  const handleClearFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setDateFilter("month")
    setCurrentPage(1)
  }

  return (
    <div className="flex-1">
      {/* Filter Bar */}
      <div className="bg-white rounded-lg border border-[#f3f4f6] p-3 md:p-4 mb-4 space-y-3 md:space-y-4">
        <div className="flex flex-col md:flex-row gap-2 md:gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#9ca3af]" />
            <input
              type="text"
              placeholder="Buscar por # recepción, orden, proveedor..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-10 pr-4 py-2 border border-[#f3f4f6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1a1a]/30"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="px-3 md:px-4 py-2 border border-[#f3f4f6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1a1a]/30 bg-white"
          >
            <option value="all">Todos los estados</option>
            <option value="COMPLETADA">Completada</option>
            <option value="PARCIAL">Parcial</option>
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 md:px-4 py-2 border border-[#f3f4f6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1a1a]/30 bg-white"
          >
            <option value="week">Última semana</option>
            <option value="month">Este mes</option>
            <option value="quarter">Últimos 3 meses</option>
            <option value="custom">Rango personalizado</option>
          </select>
        </div>

        {(searchQuery || statusFilter !== "all" || dateFilter !== "month") && (
          <button
            onClick={handleClearFilters}
            className="text-sm text-[#7b1a1a] hover:text-[#5c1212] font-medium flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Table */}
      {displayedReceipts.length > 0 ? (
        <div className="bg-white rounded-lg border border-[#f3f4f6] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#f5f5f7] border-b border-[#f3f4f6]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6b7280]">
                    # RECEPCIÓN
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6b7280]">
                    ORDEN DE COMPRA
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6b7280]">
                    PROVEEDOR
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6b7280]">
                    FECHA
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6b7280]">
                    ÍTEMS
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6b7280]">
                    ESTADO
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayedReceipts.map((receipt) => {
                  const isSelected = selectedReceiptId === receipt.id
                  return (
                    <tr
                      key={receipt.id}
                      onClick={() => onSelectReceipt(receipt)}
                      className={cn(
                        "border-b border-[#f3f4f6] cursor-pointer transition-colors",
                        isSelected
                          ? "bg-[#fde8e8] border-l-4 border-l-[#7b1a1a]"
                          : "hover:bg-[#f5f5f7]"
                      )}
                    >
                      <td className="px-6 py-4 text-sm font-mono text-[#7b1a1a]">
                        {receipt.receiptNumber}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#111827]">
                        {receipt.purchaseOrderNumber}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#111827]">
                        {receipt.supplierName}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#6b7280]">
                        {new Date(receipt.date).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#111827]">
                        {receipt.items.length} ítem{receipt.items.length !== 1 ? "s" : ""}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={cn(
                            "px-3 py-1 rounded-full text-xs font-medium",
                            receipt.status === "COMPLETADA"
                              ? "bg-green-100 text-green-700"
                              : "bg-orange-100 text-orange-700"
                          )}
                        >
                          {receipt.status === "COMPLETADA" ? "COMPLETADA" : "PARCIAL"}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#f3f4f6] bg-[#f5f5f7]">
            <span className="text-sm text-[#6b7280]">
              Página {currentPage} de {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-[#f3f4f6] hover:bg-[#f5f5f7] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-[#f3f4f6] hover:bg-[#f5f5f7] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-[#f3f4f6] p-12 text-center">
          <p className="text-[#6b7280] text-sm">No se encontraron recepciones</p>
        </div>
      )}
    </div>
  )
}
