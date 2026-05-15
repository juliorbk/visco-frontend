"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { PageHeader } from "@/components/visco/page-header"
import { Button } from "@/components/ui/button"
import { SupplierPerformanceChart } from "@/components/visco/suppliers/performance-chart"
import { SupplierCard } from "@/components/visco/suppliers/supplier-card"
import { SupplierDetail } from "@/components/visco/suppliers/supplier-detail"
import { SupplierModal } from "@/components/visco/suppliers/supplier-modal"
import { fetchSuppliers, createSupplier, updateSupplier, deactivateSupplier } from "@/lib/services/suppliers"
import type { SupplierDTO } from "@/lib/types"
import { Filter, Plus, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<SupplierDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<SupplierDTO | null>(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetchSuppliers()
      const list = res.content ?? []
      setSuppliers(list)
      setSelectedId((prev) => (prev && list.find((s) => s.id === prev) ? prev : list[0]?.id ?? null))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al cargar proveedores")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const selected = suppliers.find((s) => s.id === selectedId) ?? null

  const handleSave = async (data: Partial<SupplierDTO>, id?: number) => {
    try {
      setSaving(true)
      if (id) {
        const updated = await updateSupplier(id, data)
        setSuppliers((prev) => prev.map((s) => (s.id === id ? updated : s)))
        toast.success("Proveedor actualizado")
      } else {
        const created = await createSupplier(data)
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

  const handleDeactivate = async (s: SupplierDTO) => {
    try {
      await deactivateSupplier(s.id)
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3 content-start">
          {loading ? (
            <div className="md:col-span-2 rounded-xl border border-dashed border-border bg-card/60 p-12 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
              <Loader2 className="size-5 animate-spin" />
              Cargando proveedores…
            </div>
          ) : suppliers.length === 0 ? (
            <div className="md:col-span-2 rounded-xl border border-dashed border-border bg-card/60 p-8 text-center text-sm text-muted-foreground">
              No hay proveedores disponibles.
            </div>
          ) : (
            suppliers.map((s) => (
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
