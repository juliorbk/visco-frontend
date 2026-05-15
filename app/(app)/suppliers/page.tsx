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
import { Plus, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { AnimatePresence, motion } from "framer-motion"

const PAGE_SIZE = 10

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<SupplierDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<SupplierDTO | null>(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetchSuppliers(page, PAGE_SIZE)
      setTotalPages(res.totalPages ?? 1)
      setTotalElements(res.totalElements ?? res.content.length)
      const list = res.content ?? []
      setSuppliers(list)
      setSelectedId((prev) =>
        prev && list.find((s) => s.id === prev) ? prev : list[0]?.id ?? null,
      )
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al cargar proveedores")
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    load()
  }, [load])

  const visibleSuppliers = useMemo(() => suppliers, [suppliers])
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
            ) : visibleSuppliers.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="md:col-span-2 rounded-xl border border-dashed border-border bg-card/60 p-8 text-center text-sm text-muted-foreground"
              >
                No hay proveedores disponibles.
              </motion.div>
            ) : (
              <AnimatePresence mode="popLayout">
                {visibleSuppliers.map((s, i) => (
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
                  ? Anterior
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
                  Siguiente ?
                </Button>
              </div>
            </div>
          )}
        </div>

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
