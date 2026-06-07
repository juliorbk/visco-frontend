"use client"

import { ChevronLeftIcon, ChevronRightIcon, MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline"
import type { DispatchResponse } from "@/lib/types"
import { cn } from "@/lib/utils"

interface DispatchesTableProps {
  dispatches: DispatchResponse[]
  onSelectDispatch: (dispatch: DispatchResponse) => void
  selectedDispatchId?: number
  searchQuery: string
  onSearchChange: (value: string) => void
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function DispatchesTable({
  dispatches,
  onSelectDispatch,
  selectedDispatchId,
  searchQuery,
  onSearchChange,
  currentPage,
  totalPages,
  onPageChange,
}: DispatchesTableProps) {
  return (
    <div className="flex-1">
      <div className="bg-white rounded-lg border border-[#f3f4f6] p-3 md:p-4 mb-4 space-y-3 md:space-y-4">
        <div className="flex flex-col md:flex-row gap-2 md:gap-3">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#9ca3af]" />
            <input
              type="text"
              placeholder="Buscar por # despacho..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[#f3f4f6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7b1a1a]/30"
            />
          </div>
        </div>

        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="text-sm text-[#7b1a1a] hover:text-[#5c1212] font-medium flex items-center gap-1"
          >
            <XMarkIcon className="w-4 h-4" />
            Limpiar filtros
          </button>
        )}
      </div>

      {dispatches.length > 0 ? (
        <div className="bg-white rounded-lg border border-[#f3f4f6] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#f5f5f7] border-b border-[#f3f4f6]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6b7280]"># DESPACHO</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6b7280]">ALMACÉN</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6b7280]">FECHA</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6b7280]">ÍTEMS</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6b7280]">CREADO POR</th>
                </tr>
              </thead>
              <tbody>
                {dispatches.map((dispatch) => {
                  const isSelected = selectedDispatchId === dispatch.id
                  return (
                    <tr
                      key={dispatch.id}
                      onClick={() => onSelectDispatch(dispatch)}
                      className={cn(
                        "border-b border-[#f3f4f6] cursor-pointer transition-colors",
                        isSelected
                          ? "bg-[#fde8e8] border-l-4 border-l-[#7b1a1a]"
                          : "hover:bg-[#f5f5f7]",
                      )}
                    >
                      <td className="px-6 py-4 text-sm font-mono text-[#7b1a1a]">
                        {dispatch.dispatchNumber}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#111827]">
                        {dispatch.warehouseName}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#6b7280]">
                        {new Date(dispatch.createdAt).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#111827]">
                        {dispatch.items.length} ítem{dispatch.items.length !== 1 ? "s" : ""}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#6b7280]">
                        {dispatch.createdByName}
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
          <p className="text-[#6b7280] text-sm">No se encontraron despachos</p>
        </div>
      )}
    </div>
  )
}
