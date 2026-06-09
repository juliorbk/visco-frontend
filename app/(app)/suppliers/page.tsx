"use client"

import { useCallback, useEffect, useState } from "react"
import { PageHeader } from "@/components/visco/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { SupplierCategoryManagerModal } from "@/components/visco/suppliers/supplier-category-manager-modal"
import {
  fetchSuppliers,
  fetchSuppliersByCategory,
  fetchActiveSupplierCategories,
  createSupplier,
  updateSupplier,
  deactivateSupplier,
} from "@/lib/services/suppliers"
import type { SupplierDTO, SupplierCategoryDTO } from "@/lib/types"
import { getCachedUser } from "@/lib/auth-client"
import { canCreateSupplier, canManageSupplierCategories } from "@/lib/permissions"
import { useDebounce } from "@/hooks/use-debounce"
import { useQuery } from "@/hooks/use-query"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  TagIcon,
} from "@heroicons/react/24/outline"
import { toast } from "sonner"

const PAGE_SIZE = 12
const ALL_CATEGORIES = "__all__"

export default function SuppliersPage() {
  const [saving, setSaving] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [page, setPage] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<SupplierDTO | null>(null)
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 300)
  const [categoryFilter, setCategoryFilter] = useState<string>(ALL_CATEGORIES)
  const [categories, setCategories] = useState<SupplierCategoryDTO[]>([])
  const [categoriesManagerOpen, setCategoriesManagerOpen] = useState(false)

  const fetchSuppliersData = useCallback(
    async (signal: AbortSignal) => {
      const res =
        categoryFilter === ALL_CATEGORIES
          ? await fetchSuppliers(page, PAGE_SIZE, debouncedSearch)
          : await fetchSuppliersByCategory(Number(categoryFilter), page, PAGE_SIZE, debouncedSearch)
      return res
    },
    [page, categoryFilter, debouncedSearch],
  )

  const { data, isLoading: loading, error, refetch } = useQuery(fetchSuppliersData, [page, categoryFilter, debouncedSearch])

  const suppliers = data?.content ?? []
  const totalPages = data?.page?.totalPages ?? 0
  const totalElements = data?.page?.totalElements ?? 0

  useEffect(() => {
    if (error) {
      toast.error(error.message)
    }
  }, [error])

  useEffect(() => {
    const list = suppliers
    setSelectedId((prev) =>
      prev && list.find((s) => s.id === prev) ? prev : list[0]?.id ?? null,
    )
  }, [suppliers])

  const loadCategories = useCallback(async () => {
    try {
      const res = await fetchActiveSupplierCategories(0, 200)
      setCategories(res.content ?? [])
    } catch {
      setCategories([])
    }
  }, [])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  const user = getCachedUser()
  const selected = suppliers.find((s) => s.id === selectedId) ?? null

  const handleCategoryFilterChange = useCallback((v: string) => {
    setCategoryFilter(v)
    setPage(0)
    setSelectedId(null)
  }, [])

  const handleSearchChange = useCallback((v: string) => {
    setSearch(v)
    setPage(0)
    setSelectedId(null)
  }, [])

  const handleSave = useCallback(async (data: Partial<SupplierDTO>, id?: number) => {
    try {
      setSaving(true)
      if (id) {
        await updateSupplier(id, data)
        toast.success("Proveedor actualizado")
        refetch()
      } else {
        const created = await createSupplier(data)
        toast.success("Proveedor creado")
        setSelectedId(created.id)
        setPage(0)
        refetch()
      }
      setModalOpen(false)
      setEditing(null)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Error al guardar proveedor",
      )
    } finally {
      setSaving(false)
    }
  }, [refetch])

  const handleDeactivate = useCallback(async (s: SupplierDTO) => {
    try {
      await deactivateSupplier(s.id)
      toast.success(`${s.name} desactivado`)
      if (selectedId === s.id) setSelectedId(null)
      refetch()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Error al desactivar proveedor",
      )
    }
  }, [refetch, selectedId])

  return (
    <div>
      <PageHeader
        title="Gestion de proveedores"
        subtitle="Catalogo completo, desempeno historico y seguimiento de cumplimiento."
        actions={
          <div className="flex items-center gap-2">
            {canManageSupplierCategories(user) && (
              <Button
                size="sm"
                variant="outline"
                className="bg-card"
                onClick={() => setCategoriesManagerOpen(true)}
              >
                <TagIcon className="size-4 mr-2" /> Gestionar categorias
              </Button>
            )}
            {canCreateSupplier(user) && (
              <Button
                size="sm"
                className="bg-[#7b1a1a] hover:bg-[#5c1212] text-white"
                onClick={() => {
                  setEditing(null)
                  setModalOpen(true)
                }}
              >
                <PlusIcon className="size-4 mr-2" /> Nuevo proveedor
              </Button>
            )}
          </div>
        }
      />

      <div className="mb-4">
        <SupplierPerformanceChart />
      </div>

      <div className="mb-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative max-w-xs w-full">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre…"
            className="pl-9 h-10"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={handleCategoryFilterChange}>
          <SelectTrigger className="h-10 w-full sm:w-[220px]">
            <SelectValue placeholder="Todas las categorias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_CATEGORIES}>Todas las categorias</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {loading ? (
              <div className="md:col-span-2 rounded-xl border border-dashed border-border bg-card/60 p-12 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                <ArrowPathIcon className="size-5 animate-spin" />
                 Cargando proveedores…
              </div>
            ) : suppliers.length === 0 ? (
              <div className="md:col-span-2 rounded-xl border border-dashed border-border bg-card/60 p-8 text-center text-sm text-muted-foreground">
                  {debouncedSearch
                    ? "Ningun proveedor coincide con la busqueda."
                    : categoryFilter !== ALL_CATEGORIES
                      ? "No hay proveedores en esta categoria."
                      : "No hay proveedores disponibles."}
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
                <ChevronLeftIcon className="size-4 mr-1" />
                 Anterior
              </Button>

              <span className="text-sm text-muted-foreground">
                Pagina {page + 1} de {totalPages} · {totalElements} proveedores
              </span>

              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages - 1 || loading}
                onClick={() => setPage((p) => p + 1)}
                className={page >= totalPages - 1 ? "opacity-50 cursor-not-allowed" : ""}
              >
                Siguiente
                 <ChevronRightIcon className="size-4 ml-1" />
              </Button>
            </div>
          )}
        </div>

        <div className="lg:col-span-1 lg:self-start">
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

      <SupplierCategoryManagerModal
        open={categoriesManagerOpen}
        onOpenChange={(o) => {
          setCategoriesManagerOpen(o)
          if (!o) loadCategories()
        }}
      />
    </div>
  )
}
