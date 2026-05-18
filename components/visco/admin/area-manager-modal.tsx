"use client"

import { useCallback, useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { fetchCostCenters } from "@/lib/services/requisitions"
import type { CostCenter } from "@/lib/types"
import { Loader2 } from "lucide-react"

export function AreaManagerModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const [costCenters, setCostCenters] = useState<CostCenter[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const data = await fetchCostCenters()
      setCostCenters(data)
    } catch (err) {
      setCostCenters([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (open) load()
  }, [open, load])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-serif">Centros de Costo</DialogTitle>
          <DialogDescription>
            Lista de centros de costo disponibles en el sistema.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1 max-h-72 overflow-y-auto">
          {loading ? (
            <div className="py-8 text-center"><Loader2 className="size-5 animate-spin mx-auto" /></div>
          ) : costCenters.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Sin centros de costo registrados.</p>
          ) : (
            costCenters.map((cc) => (
              <div key={cc.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium">{cc.fullDescription}</span>
                  <span className="text-xs text-muted-foreground ml-2">({cc.code})</span>
                </div>
              </div>
            ))
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
