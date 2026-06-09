"use client"

import { useEffect, useState } from "react"
import { PageHeader } from "@/components/visco/page-header"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  DocumentTextIcon,
  ClockIcon,
  CalendarIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline"
import { toast } from "sonner"

import GenerateReportTab from "@/components/visco/reports/generate-tab"
import ReportHistoryTab from "@/components/visco/reports/history-tab"
import ScheduledReportsTab from "@/components/visco/reports/scheduled-tab"
import { fetchReportAnalytics } from "@/lib/services/reports"
import { ReportKpis } from "@/components/visco/reports/report-kpis"
import { ReportsTrend } from "@/components/visco/reports/reports-trend"
import { ReportsByType } from "@/components/visco/reports/reports-by-type"
import { ReportsStatusPie } from "@/components/visco/reports/reports-status-pie"
import type { ReportAnalyticsDTO } from "@/lib/types"

export default function ReportsPage() {
  const [tab, setTab] = useState("generate")
  const [refreshHistory, setRefreshHistory] = useState(0)

  const handleReportGenerated = () => {
    setRefreshHistory((prev) => prev + 1)
    setTab("history")
  }

  return (
    <div>
      <PageHeader
        title="Reportes y Analiticas"
        subtitle="Genera, descarga y programa reportes del sistema."
      />

      <Tabs value={tab} onValueChange={setTab} className="mt-4">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="dashboard" className="gap-2">
            <ChartBarIcon className="size-4" /> Dashboard
          </TabsTrigger>
          <TabsTrigger value="generate" className="gap-2">
            <DocumentTextIcon className="size-4" /> Generar Reporte
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <ClockIcon className="size-4" /> Historial
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="gap-2">
            <CalendarIcon className="size-4" /> Programados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-4">
          <ReportsDashboardTab />
        </TabsContent>

        <TabsContent value="generate" className="mt-4">
          <GenerateReportTab onGenerated={handleReportGenerated} />
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <ReportHistoryTab refreshTrigger={refreshHistory} />
        </TabsContent>

        <TabsContent value="scheduled" className="mt-4">
          <ScheduledReportsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ReportsDashboardTab() {
  const [data, setData] = useState<ReportAnalyticsDTO | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReportAnalytics()
      .then(setData)
      .catch(() => toast.error("Error al cargar analiticas"))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-5">
      <ReportKpis data={data} loading={loading} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ReportsTrend data={data} loading={loading} />
        <ReportsByType data={data} loading={loading} />
      </div>

      <ReportsStatusPie data={data} loading={loading} />
    </div>
  )
}
