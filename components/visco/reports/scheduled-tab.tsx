"use client"

import { useCallback, useEffect, useState } from "react"
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
import { Switch } from "@/components/ui/switch"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import {
  ArrowPathIcon,
  TrashIcon,
  PlayIcon,
  PlusIcon,
} from "@heroicons/react/24/outline"

import {
  fetchScheduledReports,
  createScheduledReport,
  updateScheduledReport,
  deleteScheduledReport,
  executeScheduledReport,
} from "@/lib/services/reports"
import type {
  ScheduledReportDTO,
  ReportType,
  ReportFormat,
  ReportFrequency,
} from "@/lib/types"
import { REPORT_TYPE_LABELS } from "@/lib/types"

export default function ScheduledReportsTab() {
  const [scheduled, setScheduled] = useState<ScheduledReportDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [refreshing, setRefreshing] = useState(0)

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
