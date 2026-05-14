import Link from "next/link"
import { orders } from "@/lib/mock-data"
import { OrderStatusBadge } from "@/components/visco/status-badge"
import { ArrowUpRight } from "lucide-react"

export function RecentOrders() {
  const rows = orders.slice(0, 6)

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
                    {o.id}
                  </Link>
                </td>
                <td className="px-5 py-3 text-muted-foreground">{o.date}</td>
                <td className="px-5 py-3 text-foreground">{o.supplierName}</td>
                <td className="px-5 py-3">
                  <OrderStatusBadge status={o.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
