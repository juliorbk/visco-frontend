"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { PageHeader } from "@/components/visco/page-header"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SupplierPerformanceChart } from "@/components/visco/suppliers/performance-chart"
import { SupplierCard } from "@/components/visco/suppliers/supplier-card"
import { SupplierDetail } from "@/components/visco/suppliers/supplier-detail"
import { SupplierModal } from "@/components/visco/suppliers/supplier-modal"
import { CATEGORIES } from "@/lib/mock-data"
import { api } from "@/lib/api"
import type { Supplier } from "@/lib/mock-data"
import { Filter, Plus, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { AnimatePresence, motion } from "framer-motion"

const PAGE_SIZE = 10

const mapDtoToSupplier = (dto: any): Supplier => ({
  id:                   String(dto.id),
  name:                 dto.name,
  category:             "General",
  type:                 dto.description ?? "Sin tipo",
  rating:               0,
  contactName:          dto.representatives?.[0]?.fullName ?? "Sin representante",
  email:                dto.contactEmail ?? "",
  phone:                dto.phoneNumbers?.[0] ?? "",
  address:              dto.address ?? "",
  description:          dto.description ?? "",
  currency:             dto.currency ?? "USD",
  sapCode:              dto.sapCode ?? "",
  compliance:           dto.active ? "Total" : "Critico",
  tier:                 1,
  since:                new Date().getFullYear(),
  certifications:       [],
  legalRepresentatives: dto.representatives?.map((r: any) => r.fullName) ?? [],
  recentOrders:         [],
})

export default function SuppliersPage() {
  const [suppliers, setSuppliers]       = useState<Supplier[]>([])
  const [loading, setLoading]           = useState(true)
  const [saving, setSaving]             = useState(false)
  const [category, setCategory]         = useState("all")
  const [compliance, setCompliance]     = useState("all")
  const [selectedId, setSelectedId]     = useState<string | null>(null)
  const [modalOpen, setModalOpen]       = useState(false)
  const [editing, setEditing]           = useState<Supplier | null>(null)
  const [page, setPage]                 = useState(0)
  const [totalPages, setTotalPages]     = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const fetchSuppliers = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.get<any>(`/api/suppliers?page=${page}&size=${PAGE_SIZE}`)

      const raw: any[]  = res?.content ?? []
      const meta        = res?.page ?? {}
      setTotalPages(meta.totalPages ?? 1)
      setTotalElements(meta.totalElements ?? raw.length)

      const list: Supplier[] = raw.map(mapDtoToSupplier)
      setSuppliers(list)
      setSelectedId((prev) =>
        prev && list.find((s) => s.id === prev) ? prev : list[0]?.id ?? null,
      )
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al cargar proveedores")
    } finally {
      setLoading(false)
    }
  }, [page, category, compliance])

  useEffect(() => { fetchSuppliers() }, [fetchSuppliers])

  // Filtro local mientras el backend no soporte filtros por category/compliance
  const filtered = useMemo(() => suppliers.filter((s) => {
    const matchCat  = category   === "all" || s.category  === category
    const matchComp = compliance === "all" || s.compliance === compliance
    return matchCat && matchComp
  }), [suppliers, category, compliance])

  const selected = suppliers.find((s) => s.id === selectedId) ?? null

  const handleCategoryChange = (val: string) => { setCategory(val); setPage(0) }
  const handleComplianceChange = (val: string) => { setCompliance(val); setPage(0) }

  const handleSave = async (data: Partial<Supplier>, id?: string) => {
    try {
      setSaving(true)
      if (id) {
        const dto     = await api.put<any>(`/api/suppliers/${id}`, data)
        const updated = mapDtoToSupplier(dto)
        setSuppliers((prev) => prev.map((s) => (s.id === id ? updated : s)))
        toast.success("Proveedor actualizado")
      } else {
        const dto     = await api.post<any>("/api/suppliers", data)
        const created = mapDtoToSupplier(dto)
        setSuppliers((prev) => [created, ...prev])
        setSelectedId(created.id)
        toast.success("Proveedor creado")
      }
      setModalOpen(false)
      setEditing(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar proveedor")
    } finally {
      setSaving(false)
    }
  }

  const handleDeactivate = async (s: Supplier) => {
    try {
      await api.delete(`/api/suppliers/${s.id}`)
      setSuppliers((prev) => prev.filter((x) => x.id !== s.id))
      if (selectedId === s.id) setSelectedId(null)
      toast.success(`${s.name} desactivado`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al desactivar proveedor")
    }
  }

  return (
    <div>
      <PageHeader
        title="Gestión de Proveedores"
        subtitle="Catálogo completo, desempeño histórico y cumplimiento normativo."
        actions={
          <Button
            size="sm"
            className="bg-[#7b1a1a] hover:bg-[#5c1212] text-white"
            onClick={() => { setEditing(null); setModalOpen(true) }}
          >
            <Plus className="size-4" /> Nuevo Proveedor
          </Button>
        }
      />

      <div className="mb-4">
        <SupplierPerformanceChart />
      </div>

      {/* ── Filtros ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <Select value={category} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-full sm:w-56 bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las Categorías</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={compliance} onValueChange={handleComplianceChange}>
          <SelectTrigger className="w-full sm:w-72 bg-card">
            <SelectValue placeholder="Estado de Cumplimiento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Cumplimiento: Todos</SelectItem>
            <SelectItem value="Total">Total</SelectItem>
            <SelectItem value="Revision">En Revisión</SelectItem>
            <SelectItem value="Critico">Crítico</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="default" className="bg-card sm:ml-auto">
          <Filter className="size-4" /> Filtros Avanzados
        </Button>
      </div>

      {/* ── Contenido principal ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Lista de cards + paginación */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 content-start">
  {loading ? (
    <motion.div
      key="loader"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="md:col-span-2 rounded-xl border border-dashed border-border bg-card/60 p-12 text-center text-sm text-muted-foreground flex flex-col items-center gap-2"
    >
      <Loader2 className="size-5 animate-spin" />
      Cargando proveedores…
    </motion.div>
  ) : filtered.length === 0 ? (
    <motion.div
      key="empty"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="md:col-span-2 rounded-xl border border-dashed border-border bg-card/60 p-8 text-center text-sm text-muted-foreground"
    >
      No hay proveedores que coincidan con los filtros.
    </motion.div>
  ) : (
    <AnimatePresence mode="popLayout">
      {filtered.map((s, i) => (
        <motion.div
          key={s.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.2, delay: i * 0.04 }}
        >
          <SupplierCard
            supplier={s}
            selected={selectedId === s.id}
            onSelect={(sup) => setSelectedId(sup.id)}
          />
        </motion.div>
      ))}
    </AnimatePresence>
  )}
</div>

          {/* ── Paginación ── */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between px-1">
              <p className="text-xs text-muted-foreground">
                Mostrando{" "}
                <span className="font-medium text-foreground">
                  {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, totalElements)}
                </span>{" "}
                de <span className="font-medium text-foreground">{totalElements}</span> proveedores
              </p>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline" size="sm"
                  className="bg-card h-8 px-3"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                >
                  ← Anterior
                </Button>

                {Array.from({ length: totalPages }, (_, i) => i)
                  .filter((i) => i === 0 || i === totalPages - 1 || Math.abs(i - page) <= 1)
                  .reduce<(number | "...")[]>((acc, i, idx, arr) => {
                    if (idx > 0 && i - (arr[idx - 1] as number) > 1) acc.push("...")
                    acc.push(i)
                    return acc
                  }, [])
                  .map((item, idx) =>
                    item === "..." ? (
                      <span key={`ellipsis-${idx}`} className="px-1 text-muted-foreground text-sm">…</span>
                    ) : (
                      <Button
                        key={item}
                        variant={page === item ? "default" : "outline"}
                        size="sm"
                        className={
                          page === item
                            ? "bg-[#7b1a1a] hover:bg-[#5c1212] text-white h-8 w-8 p-0"
                            : "bg-card h-8 w-8 p-0"
                        }
                        onClick={() => setPage(item as number)}
                      >
                        {(item as number) + 1}
                      </Button>
                    ),
                  )}

                <Button
                  variant="outline" size="sm"
                  className="bg-card h-8 px-3"
                  disabled={page === totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Siguiente →
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Panel de detalle */}
        <div className="lg:col-span-1">
          <SupplierDetail
            supplier={selected}
            onEdit={(s) => { setEditing(s); setModalOpen(true) }}
            onDeactivate={handleDeactivate}
          />
        </div>
      </div>

      <SupplierModal
        open={modalOpen}
        onOpenChange={(o) => { setModalOpen(o); if (!o) setEditing(null) }}
        editing={editing}
        onSave={handleSave}
        saving={saving}
      />
    </div>
  )
}