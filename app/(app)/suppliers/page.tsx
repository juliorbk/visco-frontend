"use client"

import { useCallback, useEffect, useState } from "react"
import { PageHeader } from "@/components/visco/page-header"
import { Button } from "@/components/ui/button"
import { SupplierPerformanceChart } from "@/components/visco/suppliers/performance-chart"
import { SupplierCard } from "@/components/visco/suppliers/supplier-card"
import { SupplierDetail } from "@/components/visco/suppliers/supplier-detail"
import { SupplierModal } from "@/components/visco/suppliers/supplier-modal"
import { fetchSuppliers, createSupplier, updateSupplier, deactivateSupplier } from "@/lib/services/suppliers"
import type { SupplierDTO } from "@/lib/types"
import { getCachedUser } from "@/lib/auth-client"
import { canCreateSupplier } from "@/lib/permissions"
import { ChevronLeft, ChevronRight, Plus, Loader2 } from "lucide-react"
import { toast } from "sonner"

const PAGE_SIZE = 12

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<SupplierDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<SupplierDTO | null>(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetchSuppliers(page, PAGE_SIZE)
      const list = res.content ?? []
      setSuppliers(list)
      setTotalPages(res.page.totalPages)
      setTotalElements(res.page.totalElements)
      setSelectedId((prev) => (prev && list.find((s) => s.id === prev) ? prev : list[0]?.id ?? null))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al cargar proveedores")
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    load()
  }, [load])

  const user = getCachedUser()
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
        setPage(0)
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
          canCreateSupplier(user) ? (
            <Button
              size="sm"
              className="bg-[#7b1a1a] hover:bg-[#5c1212] text-white"
              onClick={() => {
                setEditing(null)
                setModalOpen(true)
              }}
            >
              <Plus className="size-4 mr-2" /> Nuevo Proveedor
            </Button>
          ) : undefined
        }
      />

      <div className="mb-4">
        <SupplierPerformanceChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 px-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0 || loading}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className={page === 0 ? "opacity-50 cursor-not-allowed" : ""}
              >
                <ChevronLeft className="size-4 mr-1" />
                Anterior
              </Button>

              <span className="text-sm text-muted-foreground">
                Página {page + 1} de {totalPages} · {totalElements} proveedores
              </span>

              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages - 1 || loading}
                onClick={() => setPage((p) => p + 1)}
                className={page >= totalPages - 1 ? "opacity-50 cursor-not-allowed" : ""}
              >
                Siguiente
                <ChevronRight className="size-4 ml-1" />
              </Button>
            </div>
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
