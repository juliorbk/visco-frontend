"use client"

import { useEffect, useState } from "react"
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
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import {
  DocumentTextIcon,
  ArrowPathIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline"

import { generateReport } from "@/lib/services/reports"
import { fetchWarehouses } from "@/lib/services/warehouse"
import { fetchCategories } from "@/lib/services/categories"
import type {
  ReportType,
  ReportFormat,
  CreateReportRequest,
  WarehouseResponse,
  Category,
} from "@/lib/types"
import { REPORT_TYPE_LABELS } from "@/lib/types"

export default function GenerateReportTab({ onGenerated }: { onGenerated: () => void }) {
  const [name, setName] = useState("")
  const [type, setType] = useState<ReportType>("STOCK_INVENTORY")
  const [format, setFormat] = useState<ReportFormat>("EXCEL")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [categoryId, setCategoryId] = useState("all")
  const [warehouseId, setWarehouseId] = useState("all")
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
    if (type === "DAILY_RECEIPTS" && warehouseId === "all") {
      toast.error("El almacén es obligatorio para Recepciones Diarias")
      return
    }
    if (type === "DAILY_RECEIPTS" && startDate !== endDate) {
      toast.error("Las Recepciones Diarias requieren un solo día (fecha inicio = fecha fin)")
      return
    }

    setGenerating(true)
    try {
      const body: CreateReportRequest = {
        name: name.trim(),
        type,
        format,
        startDate: `${startDate}T00:00:00`,
        endDate: `${endDate}T23:59:59`,
        search: search || undefined,
        categoryId: categoryId !== "all" ? Number(categoryId) : undefined,
        warehouseId: warehouseId !== "all" ? Number(warehouseId) : undefined,
      }
      const report = await generateReport(body)
      toast.success(`Reporte "${report.name}" generado exitosamente`)
      setName("")
      setSearch("")
      onGenerated()
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
              <Select value={type} onValueChange={(v) => {
              setType(v as ReportType)
              if (v === "DAILY_RECEIPTS") {
                if (warehouseId === "all" && warehouses.length > 0) setWarehouseId(String(warehouses[0].id))
                if (startDate) setEndDate(startDate)
              }
            }}>
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
                  <SelectItem value="JSON">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Fecha Inicio</Label>
              <Input type="date" value={startDate} onChange={(e) => {
                setStartDate(e.target.value)
                if (type === "DAILY_RECEIPTS") setEndDate(e.target.value)
              }} />
            </div>
            <div>
              <Label>Fecha Fin</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Almacén{type === "DAILY_RECEIPTS" ? " (obligatorio)" : " (opcional)"}</Label>
              <Select value={warehouseId} onValueChange={setWarehouseId}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  {type !== "DAILY_RECEIPTS" && <SelectItem value="all">Todos</SelectItem>}
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
                  <SelectItem value="all">Todas</SelectItem>
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
          <div>
            <strong className="text-white">Recepciones Diarias:</strong> Reporte de recepciones de un día específico para un almacén obligatorio.
          </div>
        </div>
      </Card>
    </div>
  )
}
