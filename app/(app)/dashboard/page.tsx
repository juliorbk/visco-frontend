import { PageHeader } from "@/components/visco/page-header"
import { KpiCards } from "@/components/visco/dashboard/kpi-cards"
import { ExpensesChart } from "@/components/visco/dashboard/expenses-chart"
import { ExpensesBreakdown } from "@/components/visco/dashboard/expenses-breakdown"
import { RecentOrders } from "@/components/visco/dashboard/recent-orders"
import { CriticalInventory } from "@/components/visco/dashboard/critical-inventory"
import { OverstockInventory } from "@/components/visco/dashboard/overstock-inventory"
import { Button } from "@/components/ui/button"
import { Download, Calendar } from "lucide-react"

export default function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="Resumen Ejecutivo"
        subtitle="Vista consolidada de procurement, inventario y proveedores."
        actions={
          <>
            <Button variant="outline" size="sm" className="bg-card max-sm:text-xs max-sm:px-2">
              <Calendar className="size-3 md:size-4" /> Últimos 30 días
            </Button>
            <Button variant="outline" size="sm" className="bg-card max-sm:text-xs max-sm:px-2">
              <Download className="size-3 md:size-4" /> Exportar
            </Button>
          </>
        }
      />

      <KpiCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <div className="lg:col-span-2">
          <ExpensesChart />
        </div>
        <div>
          <ExpensesBreakdown />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <div className="lg:col-span-2">
          <RecentOrders />
        </div>
        <div className="space-y-4">
          <CriticalInventory />
          <OverstockInventory />
        </div>
      </div>
    </div>
  )
}
