"use client"

import { useCallback, useEffect, useState } from "react"
import { PageHeader } from "@/components/visco/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  DocumentTextIcon,
  ArrowDownTrayIcon,
  ClockIcon,
  TrashIcon,
  PlayIcon,
  PlusIcon,
  EllipsisVerticalIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline"

import {
  fetchReports,
  generateReport,
  deleteReport,
  getReportDownloadUrl,
  fetchScheduledReports,
  createScheduledReport,
  updateScheduledReport,
  deleteScheduledReport,
  executeScheduledReport,
  fetchReportAnalytics,
} from "@/lib/services/reports"
import {
  fetchWarehouses,
} from "@/lib/services/warehouse"
import { fetchCategories } from "@/lib/services/categories"
import type {
  ReportAnalyticsDTO,
  ReportDTO,
  ScheduledReportDTO,
  ReportType,
  ReportFormat,
  ReportStatus,
  ReportFrequency,
  CreateReportRequest,
  WarehouseResponse,
  Category,
} from "@/lib/types"
import { REPORT_TYPE_LABELS, REPORT_STATUS_COLORS } from "@/lib/types"

import { ReportKpis } from "@/components/visco/reports/report-kpis"
import { ReportsTrend } from "@/components/visco/reports/reports-trend"
import { ReportsByType } from "@/components/visco/reports/reports-by-type"
import { ReportsStatusPie } from "@/components/visco/reports/reports-status-pie"

export default function ReportsPage() {
  const [tab, setTab] = useState("dashboard")
  const [loading, setLoading] = useState(false)

  return (
    <div>
      <PageHeader
        title="Reports & Analytics"
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
          <GenerateReportTab />
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <ReportHistoryTab />
        </TabsContent>

        <TabsContent value="scheduled" className="mt-4">
          <ScheduledReportsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ─── Reports Dashboard Tab ────────────────────────────────────

function ReportsDashboardTab() {
  const [data, setData] = useState<ReportAnalyticsDTO | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReportAnalytics()
      .then(setData)
      .catch(() => toast.error("Error al cargar analíticas"))
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

// ─── Generate Report Tab ──────────────────────────────────────

function GenerateReportTab() {
  const [name, setName] = useState("")
  const [type, setType] = useState<ReportType>("STOCK_INVENTORY")
  const [format, setFormat] = useState<ReportFormat>("EXCEL")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [warehouseId, setWarehouseId] = useState("")
  const [search, setSearch] = useState("")
  const [generating, setGenerating] = useState(false)

  const [warehouses, setWarehouses] = useState<WarehouseResponse[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    fetchWarehouses().then(setWarehouses).catch(() => {})
    fetchCategories(0, 200).then((r) => setCategories(r.content ?? [])).catch(() => {})
  }, [])

  const handleGenerate = async () => {
    if (!name.trim()) {
      toast.error("El nombre del reporte es requerido")
      return
    }
    if (!startDate || !endDate) {
      toast.error("Las fechas de inicio y fin son requeridas")
      return
    }

    setGenerating(true)
    try {
      const body: CreateReportRequest = {
        name: name.trim(),
        type,
        format,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        search: search || undefined,
        categoryId: categoryId ? Number(categoryId) : undefined,
        warehouseId: warehouseId ? Number(warehouseId) : undefined,
      }
      const report = await generateReport(body)
      toast.success(`Reporte "${report.name}" generado exitosamente`)
      setName("")
      setSearch("")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al generar reporte")
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 p-6">
        <h3 className="font-serif text-lg font-semibold mb-4">Configuración del Reporte</h3>
        <div className="space-y-4">
          <div>
            <Label>Nombre del Reporte</Label>
            <Input
              placeholder="Ej: Reporte mensual de stock"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Tipo de Reporte</Label>
              <Select value={type} onValueChange={(v) => setType(v as ReportType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(REPORT_TYPE_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Formato</Label>
              <Select value={format} onValueChange={(v) => setFormat(v as ReportFormat)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PDF">PDF</SelectItem>
                  <SelectItem value="EXCEL">Excel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Fecha Inicio</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <Label>Fecha Fin</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Almacén (opcional)</Label>
              <Select value={warehouseId} onValueChange={setWarehouseId}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  {warehouses.map((w) => (
                    <SelectItem key={w.id} value={String(w.id)}>{w.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Categoría (opcional)</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Búsqueda (opcional)</Label>
            <Input
              placeholder="Filtrar por nombre o SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={generating}
            className="bg-[#7b1a1a] hover:bg-[#5c1212] text-white w-full"
          >
            {generating ? (
              <><ArrowPathIcon className="size-4 mr-2 animate-spin" /> Generando...</>
            ) : (
              <><DocumentTextIcon className="size-4 mr-2" /> Generar Reporte</>
            )}
          </Button>
        </div>
      </Card>

      <Card className="p-6 bg-[#1f2937] text-white">
        <div className="flex items-center gap-2 text-white/80 text-xs mb-3">
          <ChartBarIcon className="size-4" />
          <span className="uppercase tracking-wider">Tipos de Reporte</span>
        </div>
        <div className="space-y-3 text-sm text-white/80">
          <div>
            <strong className="text-white">Stock:</strong> Snapshot completo del inventario con niveles por producto y almacén.
          </div>
          <div>
            <strong className="text-white">Movimientos:</strong> Historial de entradas, salidas y ajustes de stock.
          </div>
          <div>
            <strong className="text-white">Alertas:</strong> Productos con stock crítico, bajo punto de reorden o en exceso.
          </div>
          <div>
            <strong className="text-white">Análisis x Almacén:</strong> Capacidad, utilización y distribución por almacén.
          </div>
        </div>
      </Card>
    </div>
  )
}

// ─── Report History Tab ───────────────────────────────────────

function ReportHistoryTab() {
  const [reports, setReports] = useState<ReportDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [typeFilter, setTypeFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [refreshing, setRefreshing] = useState(0)

  const loadReports = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetchReports(page, 20, typeFilter || undefined, statusFilter || undefined)
      setReports(res.content ?? [])
      setTotalPages(res.page.totalPages)
      setTotalElements(res.page.totalElements)
    } catch (err) {
      if (!(err instanceof DOMException && err.name === "AbortError")) {
        toast.error("Error al cargar reportes")
      }
    } finally {
      setLoading(false)
    }
  }, [page, typeFilter, statusFilter, refreshing])

  useEffect(() => {
    loadReports()
  }, [loadReports])

  const handleDelete = async (id: number) => {
    try {
      await deleteReport(id)
      toast.success("Reporte eliminado")
      setRefreshing((p) => p + 1)
    } catch {
      toast.error("Error al eliminar reporte")
    }
  }

  const handleDownload = (id: number) => {
    window.open(getReportDownloadUrl(id), "_blank")
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(0) }}>
          <SelectTrigger className="w-44 bg-card">
            <SelectValue placeholder="Todos los tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos los tipos</SelectItem>
            {Object.entries(REPORT_TYPE_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0) }}>
          <SelectTrigger className="w-40 bg-card">
            <SelectValue placeholder="Todos los estados" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos los estados</SelectItem>
            <SelectItem value="COMPLETED">Completado</SelectItem>
            <SelectItem value="PENDING">Pendiente</SelectItem>
            <SelectItem value="PROCESSING">Procesando</SelectItem>
            <SelectItem value="FAILED">Error</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" className="bg-card" onClick={() => setRefreshing((p) => p + 1)}>
          <ArrowPathIcon className="size-4 mr-2" /> Actualizar
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Formato</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Registros</TableHead>
                <TableHead>Generado</TableHead>
                <TableHead className="w-24">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    <ArrowPathIcon className="size-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : reports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No hay reportes generados aún.
                  </TableCell>
                </TableRow>
              ) : (
                reports.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell>{REPORT_TYPE_LABELS[r.type]}</TableCell>
                    <TableCell>{r.format}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("font-normal", REPORT_STATUS_COLORS[r.status])}>
                        {r.status === "COMPLETED" && <CheckCircleIcon className="size-3 mr-1" />}
                        {r.status === "FAILED" && <XCircleIcon className="size-3 mr-1" />}
                        {r.status === "PROCESSING" && <ArrowPathIcon className="size-3 mr-1 animate-spin" />}
                        {r.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="tabular-nums">{r.recordCount ?? "-"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {r.generatedAt ? new Date(r.generatedAt).toLocaleDateString() : "-"}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <EllipsisVerticalIcon className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {r.status === "COMPLETED" && (
                            <DropdownMenuItem onClick={() => handleDownload(r.id)}>
                              <ArrowDownTrayIcon className="size-4 mr-2" /> Descargar
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleDelete(r.id)}
                            className="text-red-600"
                          >
                            <TrashIcon className="size-4 mr-2" /> Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-muted/30">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeftIcon className="size-4 mr-1" /> Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {page + 1} de {totalPages} · {totalElements} reportes
            </span>
            <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
              Siguiente <ChevronRightIcon className="size-4 ml-1" />
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}

// ─── Scheduled Reports Tab ────────────────────────────────────

function ScheduledReportsTab() {
  const [scheduled, setScheduled] = useState<ScheduledReportDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [refreshing, setRefreshing] = useState(0)

  // Form state
  const [formName, setFormName] = useState("")
  const [formType, setFormType] = useState<ReportType>("STOCK_INVENTORY")
  const [formFreq, setFormFreq] = useState<ReportFrequency>("WEEKLY")
  const [formFormat, setFormFormat] = useState<ReportFormat>("EXCEL")
  const [formTime, setFormTime] = useState("08:00")
  const [formDayOfWeek, setFormDayOfWeek] = useState("1")
  const [formDayOfMonth, setFormDayOfMonth] = useState("1")
  const [formEmails, setFormEmails] = useState("")
  const [formSaving, setFormSaving] = useState(false)

  const loadScheduled = useCallback(async () => {
    try {
      setLoading(true)
      const data = await fetchScheduledReports()
      setScheduled(data)
    } catch {
      toast.error("Error al cargar reportes programados")
    } finally {
      setLoading(false)
    }
  }, [refreshing])

  useEffect(() => {
    loadScheduled()
  }, [loadScheduled])

  const resetForm = () => {
    setFormName("")
    setFormType("STOCK_INVENTORY")
    setFormFreq("WEEKLY")
    setFormFormat("EXCEL")
    setFormTime("08:00")
    setFormDayOfWeek("1")
    setFormDayOfMonth("1")
    setFormEmails("")
  }

  const handleCreate = async () => {
    if (!formName.trim()) {
      toast.error("El nombre es requerido")
      return
    }

    setFormSaving(true)
    try {
      await createScheduledReport({
        name: formName.trim(),
        reportType: formType,
        frequency: formFreq,
        format: formFormat,
        scheduleTime: formTime + ":00",
        scheduleDayOfWeek: formFreq === "WEEKLY" ? Number(formDayOfWeek) : undefined,
        scheduleDay: formFreq === "MONTHLY" ? Number(formDayOfMonth) : undefined,
        recipientEmails: formEmails || undefined,
      })
      toast.success("Reporte programado creado exitosamente")
      setDialogOpen(false)
      resetForm()
      setRefreshing((p) => p + 1)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al crear")
    } finally {
      setFormSaving(false)
    }
  }

  const handleToggle = async (sr: ScheduledReportDTO) => {
    try {
      await updateScheduledReport(sr.id, { enabled: !sr.enabled })
      setRefreshing((p) => p + 1)
    } catch {
      toast.error("Error al actualizar")
    }
  }

  const handleDeleteScheduled = async (id: number) => {
    try {
      await deleteScheduledReport(id)
      toast.success("Reporte programado eliminado")
      setRefreshing((p) => p + 1)
    } catch {
      toast.error("Error al eliminar")
    }
  }

  const handleExecute = async (id: number) => {
    try {
      await executeScheduledReport(id)
      toast.success("Reporte ejecutado, revisa el historial")
      setRefreshing((p) => p + 1)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al ejecutar")
    }
  }

  const freqLabel = (f: ReportFrequency) =>
    f === "DAILY" ? "Diario" : f === "WEEKLY" ? "Semanal" : "Mensual"

  const dayOfWeekLabel = (d: number) =>
    ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"][d] ?? ""

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            className="bg-card"
            onClick={() => setRefreshing((p) => p + 1)}
          >
            <ArrowPathIcon className="size-4 mr-2" /> Actualizar
          </Button>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#7b1a1a] hover:bg-[#5c1212] text-white">
              <PlusIcon className="size-4 mr-2" /> Nuevo Programado
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Crear Reporte Programado</DialogTitle>
              <DialogDescription>
                Configura un reporte para que se genere automáticamente.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label>Nombre</Label>
                <Input value={formName} onChange={(e) => setFormName(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tipo</Label>
                  <Select value={formType} onValueChange={(v) => setFormType(v as ReportType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(REPORT_TYPE_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Formato</Label>
                  <Select value={formFormat} onValueChange={(v) => setFormFormat(v as ReportFormat)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PDF">PDF</SelectItem>
                      <SelectItem value="EXCEL">Excel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Frecuencia</Label>
                  <Select value={formFreq} onValueChange={(v) => setFormFreq(v as ReportFrequency)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DAILY">Diario</SelectItem>
                      <SelectItem value="WEEKLY">Semanal</SelectItem>
                      <SelectItem value="MONTHLY">Mensual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Hora</Label>
                  <Input type="time" value={formTime} onChange={(e) => setFormTime(e.target.value)} />
                </div>
              </div>
              {formFreq === "WEEKLY" && (
                <div>
                  <Label>Día de la Semana</Label>
                  <Select value={formDayOfWeek} onValueChange={setFormDayOfWeek}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Lunes</SelectItem>
                      <SelectItem value="2">Martes</SelectItem>
                      <SelectItem value="3">Miércoles</SelectItem>
                      <SelectItem value="4">Jueves</SelectItem>
                      <SelectItem value="5">Viernes</SelectItem>
                      <SelectItem value="6">Sábado</SelectItem>
                      <SelectItem value="7">Domingo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              {formFreq === "MONTHLY" && (
                <div>
                  <Label>Día del Mes</Label>
                  <Input type="number" min={1} max={31} value={formDayOfMonth}
                    onChange={(e) => setFormDayOfMonth(e.target.value)} />
                </div>
              )}
              <div>
                <Label>Correos (separados por coma)</Label>
                <Input
                  value={formEmails}
                  onChange={(e) => setFormEmails(e.target.value)}
                  placeholder="admin@ejemplo.com, manager@ejemplo.com"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleCreate} disabled={formSaving}
                className="bg-[#7b1a1a] hover:bg-[#5c1212] text-white">
                {formSaving ? "Guardando..." : "Crear Programado"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Frecuencia</TableHead>
                <TableHead>Formato</TableHead>
                <TableHead>Próxima Ejec.</TableHead>
                <TableHead>Activo</TableHead>
                <TableHead className="w-28">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    <ArrowPathIcon className="size-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : scheduled.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No hay reportes programados. Crea uno nuevo.
                  </TableCell>
                </TableRow>
              ) : (
                scheduled.map((sr) => (
                  <TableRow key={sr.id}>
                    <TableCell className="font-medium">{sr.name}</TableCell>
                    <TableCell>{REPORT_TYPE_LABELS[sr.reportType]}</TableCell>
                    <TableCell>{freqLabel(sr.frequency)}</TableCell>
                    <TableCell>{sr.format}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {sr.nextExecutionAt
                        ? new Date(sr.nextExecutionAt).toLocaleString()
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={sr.enabled}
                        onCheckedChange={() => handleToggle(sr)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleExecute(sr.id)}>
                          <PlayIcon className="size-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteScheduled(sr.id)}>
                          <TrashIcon className="size-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
