"use client"

import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  ArrowDownTrayIcon,
  TrashIcon,
  EllipsisVerticalIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline"

import {
  fetchReports,
  deleteReport,
  downloadReport,
} from "@/lib/services/reports"
import type { ReportDTO } from "@/lib/types"
import { REPORT_TYPE_LABELS, REPORT_STATUS_COLORS } from "@/lib/types"

export default function ReportHistoryTab({ refreshTrigger }: { refreshTrigger: number }) {
  const [reports, setReports] = useState<ReportDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [manualRefresh, setManualRefresh] = useState(0)

  const loadReports = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetchReports(page, 20, typeFilter === "all" ? undefined : typeFilter, statusFilter === "all" ? undefined : statusFilter)
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
  }, [page, typeFilter, statusFilter, manualRefresh])

  useEffect(() => {
    loadReports()
  }, [loadReports, refreshTrigger])

  const handleDelete = async (id: number) => {
    try {
      await deleteReport(id)
      toast.success("Reporte eliminado")
      setManualRefresh((p) => p + 1)
    } catch {
      toast.error("Error al eliminar reporte")
    }
  }

  const [downloadingId, setDownloadingId] = useState<number | null>(null)

  const handleDownload = async (id: number, name: string, format: string) => {
    setDownloadingId(id)
    try {
      await downloadReport(id, name, format)
      toast.success("Descarga iniciada")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al descargar reporte")
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(0) }}>
          <SelectTrigger className="w-44 bg-card">
            <SelectValue placeholder="Todos los tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
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
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="COMPLETED">Completado</SelectItem>
            <SelectItem value="PENDING">Pendiente</SelectItem>
            <SelectItem value="PROCESSING">Procesando</SelectItem>
            <SelectItem value="FAILED">Error</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" className="bg-card" onClick={() => setManualRefresh((p) => p + 1)}>
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
                            <DropdownMenuItem
                              onClick={() => handleDownload(r.id, r.name, r.format)}
                              disabled={downloadingId === r.id}
                            >
                              {downloadingId === r.id ? (
                                <ArrowPathIcon className="size-4 mr-2 animate-spin" />
                              ) : (
                                <ArrowDownTrayIcon className="size-4 mr-2" />
                              )}
                              Descargar
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
