"use client"

import { useMemo, useState } from "react"
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
import { suppliers as initialSuppliers, type Supplier, CATEGORIES } from "@/lib/mock-data"
import { Filter, Plus } from "lucide-react"
import { toast } from "sonner"

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers)
  const [category, setCategory] = useState("all")
  const [compliance, setCompliance] = useState("all")
  const [selectedId, setSelectedId] = useState<string | null>(suppliers[0]?.id ?? null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Supplier | null>(null)

  const filtered = useMemo(() => {
    return suppliers.filter((s) => {
      const matchCat = category === "all" || s.category === category
      const matchComp = compliance === "all" || s.compliance === compliance
      return matchCat && matchComp
    })
  }, [suppliers, category, compliance])

  const selected = suppliers.find((s) => s.id === selectedId) ?? null

  const handleSave = (data: Partial<Supplier>, id?: string) => {
    if (id) {
      setSuppliers((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)))
      toast.success("Proveedor actualizado")
    } else {
      const newS: Supplier = {
        id: `s-${Date.now()}`,
        name: data.name ?? "Nuevo Proveedor",
        category: data.category ?? CATEGORIES[0],
        type: "Personalizado",
        rating: 4.0,
        contactName: "—",
        email: data.email ?? "",
        phone: data.phone ?? "",
        address: data.address ?? "",
        description: data.description ?? "",
        currency: data.currency ?? "USD",
        sapCode: data.sapCode ?? "",
        compliance: "Total",
        tier: 2,
        since: new Date().getFullYear(),
        certifications: [],
        legalRepresentatives: data.legalRepresentatives ?? [],
        recentOrders: [],
      }
      setSuppliers((prev) => [newS, ...prev])
      toast.success("Proveedor creado")
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
          {filtered.map((s) => (
            <SupplierCard
              key={s.id}
              supplier={s}
              selected={selectedId === s.id}
              onSelect={(sup) => setSelectedId(sup.id)}
            />
          ))}
          {filtered.length === 0 && (
            <div className="md:col-span-2 rounded-xl border border-dashed border-border bg-card/60 p-8 text-center text-sm text-muted-foreground">
              No hay proveedores que coincidan con los filtros.
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
            onDeactivate={(s) => {
              setSuppliers((prev) => prev.filter((x) => x.id !== s.id))
              toast.success(`${s.name} desactivado`)
              if (selectedId === s.id) setSelectedId(null)
            }}
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
      />
    </div>
  )
}
