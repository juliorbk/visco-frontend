"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { fetchRecentOrders } from "@/lib/services/dashboard"
import type { RecentOrderDTO } from "@/lib/types"
import { OrderStatusBadge } from "@/components/visco/status-badge"
import { ArrowUpRight, Loader2 } from "lucide-react"

export function RecentOrders() {
  const [rows, setRows] = useState<RecentOrderDTO[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecentOrders()
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="rounded-xl border border-border bg-card shadow-xs h-full">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div>
          <h3 className="font-serif text-lg font-semibold">Pedidos Recientes</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Últimas órdenes registradas</p>
        </div>
        <Link
          href="/procurement"
          className="inline-flex items-center gap-1 text-xs font-medium text-[#7b1a1a] hover:underline"
        >
          Ver todos <ArrowUpRight className="size-3.5" />
        </Link>
      </div>
      {loading ? (
        <div className="p-10 text-center">
          <Loader2 className="size-5 animate-spin mx-auto text-muted-foreground" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-muted-foreground bg-[#fafafa]">
                <th className="text-left font-medium px-5 py-2.5">ID Pedido</th>
                <th className="text-left font-medium px-5 py-2.5">Fecha</th>
                <th className="text-left font-medium px-5 py-2.5">Proveedor</th>
                <th className="text-left font-medium px-5 py-2.5">Estado</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => (
                <tr key={o.id} className="border-t border-border hover:bg-[#fafafa]">
                  <td className="px-5 py-3">
                    <Link href="/procurement" className="font-medium text-[#7b1a1a] hover:underline">
                      {o.orderNumber}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3 text-foreground">{o.supplierName}</td>
                  <td className="px-5 py-3">
                    <OrderStatusBadge status={o.status} />
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-sm text-muted-foreground">
                    No hay pedidos recientes
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
