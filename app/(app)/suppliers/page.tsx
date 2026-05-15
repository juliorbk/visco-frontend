"use client"

import { useCallback, useEffect, useState } from "react"
import { PageHeader } from "@/components/visco/page-header"
import { Button } from "@/components/ui/button"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { SupplierPerformanceChart } from "@/components/visco/suppliers/performance-chart"
import { SupplierCard } from "@/components/visco/suppliers/supplier-card"
import { SupplierDetail } from "@/components/visco/suppliers/supplier-detail"
import { SupplierModal } from "@/components/visco/suppliers/supplier-modal"
import { fetchSuppliers, createSupplier, updateSupplier, deactivateSupplier } from "@/lib/services/suppliers"
import type { SupplierDTO } from "@/lib/types"
import { Plus, Loader2 } from "lucide-react"
import { toast } from "sonner"

const PAGE_SIZE = 12

function renderPageNumbers(
  current: number,
  total: number,
  onPage: (p: number) => void,
) {
  const items: React.ReactNode[] = []
  const maxVisible = 5
  let start = Math.max(0, current - Math.floor(maxVisible / 2))
  let end = Math.min(total, start + maxVisible)
  if (end - start < maxVisible) start = Math.max(0, end - maxVisible)

  if (start > 0) {
    items.push(
      <PaginationItem key="first">
        <PaginationLink href="#" onClick={(e) => { e.preventDefault(); onPage(0); }}>1</PaginationLink>
      </PaginationItem>,
    )
    if (start > 1) items.push(<PaginationItem key="els"><PaginationEllipsis /></PaginationItem>)
  }

  for (let i = start; i < end; i++) {
    items.push(
      <PaginationItem key={i}>
        <PaginationLink
          href="#"
          isActive={current === i}
          onClick={(e) => { e.preventDefault(); onPage(i); }}
        >
          {i + 1}
        </PaginationLink>
      </PaginationItem>,
    )
  }

  if (end < total) {
    if (end < total - 1) items.push(<PaginationItem key="ele"><PaginationEllipsis /></PaginationItem>)
    items.push(
      <PaginationItem key="last">
        <PaginationLink href="#" onClick={(e) => { e.preventDefault(); onPage(total - 1); }}>{total}</PaginationLink>
      </PaginationItem>,
    )
  }

  return items
}

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
      setTotalPages(res.totalPages)
      setTotalElements(res.totalElements)
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
            <>
              {suppliers.map((s) => (
                <SupplierCard
                  key={s.id}
                  supplier={s}
                  selected={selectedId === s.id}
                  onSelect={(sup) => setSelectedId(sup.id)}
                />
              ))}
              {totalPages > 0 && (
                <div className="md:col-span-2 flex flex-col items-center gap-2 pt-2">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => { e.preventDefault(); setPage((p) => Math.max(0, p - 1)); }}
                          aria-disabled={page === 0}
                          className={page === 0 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      {renderPageNumbers(page, totalPages, setPage)}
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => { e.preventDefault(); setPage((p) => Math.min(totalPages - 1, p + 1)); }}
                          aria-disabled={page === totalPages - 1}
                          className={page === totalPages - 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                  <p className="text-xs text-muted-foreground">
                    Página {page + 1} de {totalPages} · {totalElements} proveedores
                  </p>
                </div>
              )}
            </>
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