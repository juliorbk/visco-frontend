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

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [category, setCategory] = useState("all")
  const [compliance, setCompliance] = useState("all")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Supplier | null>(null)

  const fetchSuppliers = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (category !== "all") params.set("category", category)
      if (compliance !== "all") params.set("compliance", compliance)
      const data = await api.get<Supplier[]>(`/api/suppliers?${params}`)
      setSuppliers(data)
      if (data.length > 0 && !selectedId) {
        setSelectedId(data[0].id)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al cargar proveedores")
    } finally {
      setLoading(false)
    }
  }, [category, compliance, selectedId])

  useEffect(() => {
    fetchSuppliers()
  }, [fetchSuppliers])

  const filtered = useMemo(() => {
    return suppliers.filter((s) => {
      const matchCat = category === "all" || s.category === category
      const matchComp = compliance === "all" || s.compliance === compliance
      return matchCat && matchComp
    })
  }, [suppliers, category, compliance])

  const selected = suppliers.find((s) => s.id === selectedId) ?? null

  const handleSave = async (data: Partial<Supplier>, id?: string) => {
    try {
      setSaving(true)
      if (id) {
        const updated = await api.put<Supplier>(`/api/suppliers/${id}`, data)
        setSuppliers((prev) => prev.map((s) => (s.id === id ? updated : s)))
        toast.success("Proveedor actualizado")
      } else {
        const created = await api.post<Supplier>("/api/suppliers", data)
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
      toast.success(`${s.name} desactivado`)
      if (selectedId === s.id) setSelectedId(null)
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
            onClick={() => {
              setEditing(null)
              setModalOpen(true)
            }}
          >
            <Plus className="size-4" /> Nuevo Proveedor
          </Button>
        }
      />

      <div className="mb-4">
        <SupplierPerformanceChart />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-56 bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las Categorías</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={compliance} onValueChange={setCompliance}>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3 content-start">
          {loading ? (
            <div className="md:col-span-2 rounded-xl border border-dashed border-border bg-card/60 p-12 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
              <Loader2 className="size-5 animate-spin" />
              Cargando proveedores…
            </div>
          ) : filtered.length === 0 ? (
            <div className="md:col-span-2 rounded-xl border border-dashed border-border bg-card/60 p-8 text-center text-sm text-muted-foreground">
              No hay proveedores que coincidan con los filtros.
            </div>
          ) : (
            filtered.map((s) => (
              <SupplierCard
                key={s.id}
                supplier={s}
                selected={selectedId === s.id}
                onSelect={(sup) => setSelectedId(sup.id)}
              />
            ))
          )}
        </div>

        <div className="lg:col-span-1">
          <SupplierDetail
            supplier={selected}
            onEdit={(s) => {
              setEditing(s)
              setModalOpen(true)
            }}
            onDeactivate={handleDeactivate}
          />
        </div>
      </div>

      <SupplierModal
        open={modalOpen}
        onOpenChange={(o) => {
          setModalOpen(o)
          if (!o) setEditing(null)
        }}
        editing={editing}
        onSave={handleSave}
        saving={saving}
      />
    </div>
  )
}
