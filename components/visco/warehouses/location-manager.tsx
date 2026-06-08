"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import {
  PlusIcon,
  TrashIcon,
  ArrowPathIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline"
import {
  fetchLocationsByWarehouse,
  createLocation,
  deleteLocation,
} from "@/lib/services/warehouse"
import type { LocationDTO } from "@/lib/types"

interface LocationManagerProps {
  warehouseId: number
  warehouseName: string
}

export function LocationManager({ warehouseId, warehouseName }: LocationManagerProps) {
  const [locations, setLocations] = useState<LocationDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [newCode, setNewCode] = useState("")
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetchLocationsByWarehouse(warehouseId, undefined, 0, 100)
      setLocations(res.content)
    } catch {
      toast.error("Error al cargar ubicaciones")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [warehouseId])

  const handleCreate = async () => {
    if (!newCode.trim()) {
      toast.error("El código de ubicación es requerido")
      return
    }
    setSaving(true)
    try {
      await createLocation({ code: newCode.trim(), warehouseId })
      toast.success(`Ubicación "${newCode.trim()}" creada`)
      setNewCode("")
      setAddOpen(false)
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al crear ubicación")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (loc: LocationDTO) => {
    try {
      await deleteLocation(loc.id)
      toast.success(`Ubicación "${loc.code}" eliminada`)
      load()
    } catch {
      toast.error("Error al eliminar ubicación")
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-foreground flex items-center gap-1.5">
          <MapPinIcon className="size-4" />
          Ubicaciones
        </h4>
        <Button size="sm" variant="outline" onClick={() => setAddOpen(true)}>
          <PlusIcon className="size-3.5 mr-1" /> Agregar
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-4">
          <ArrowPathIcon className="size-4 animate-spin text-muted-foreground" />
        </div>
      ) : locations.length === 0 ? (
        <p className="text-xs text-muted-foreground py-2">
          No hay ubicaciones registradas en {warehouseName}.
        </p>
      ) : (
        <ul className="space-y-1 max-h-48 overflow-y-auto">
          {locations.map((loc) => (
            <li
              key={loc.id}
              className="flex items-center justify-between rounded-md px-3 py-1.5 text-sm bg-muted/40"
            >
              <span>{loc.code}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 text-muted-foreground hover:text-red-600"
                onClick={() => handleDelete(loc)}
              >
                <TrashIcon className="size-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Nueva Ubicación</DialogTitle>
            <DialogDescription>
              Agrega una ubicación para {warehouseName}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label>Código</Label>
              <Input
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                placeholder="Ej: A-01-01"
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreate}
              disabled={saving}
              className="bg-[#7b1a1a] hover:bg-[#5c1212] text-white"
            >
              {saving ? "Creando..." : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
