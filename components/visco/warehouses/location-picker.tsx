"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Check, ChevronsUpDown, Loader2, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { fetchLocationsByWarehouse } from "@/lib/services/warehouse"
import type { LocationDTO } from "@/lib/types"

interface LocationPickerProps {
  warehouseId: number | null
  value: number | null
  onChange: (locationId: number) => void
  disabled?: boolean
}

export function LocationPicker({ warehouseId, value, onChange, disabled }: LocationPickerProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [locations, setLocations] = useState<LocationDTO[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const selected = locations.find((l) => l.id === value)

  const loadLocations = useCallback(async (pageNum: number, append: boolean) => {
    if (!warehouseId) return
    setLoading(true)
    try {
      const result = await fetchLocationsByWarehouse(warehouseId, search || undefined, pageNum, 20)
      if (append) {
        setLocations((prev) => [...prev, ...result.content])
      } else {
        setLocations(result.content)
      }
      setTotalPages(result.page.totalPages)
    } catch {
      if (!append) setLocations([])
    } finally {
      setLoading(false)
    }
  }, [warehouseId, search])

  useEffect(() => {
    if (open && warehouseId) {
      setPage(0)
      setLocations([])
      setSearch("")
      loadLocations(0, false)
    }
  }, [open, warehouseId, loadLocations])

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current)
    if (!open) return
    searchTimer.current = setTimeout(() => {
      setPage(0)
      setLocations([])
      if (warehouseId) loadLocations(0, false)
    }, 300)
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current)
    }
  }, [search, open, warehouseId, loadLocations])

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    loadLocations(nextPage, true)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal bg-background"
          disabled={disabled || !warehouseId}
        >
          {selected
            ? selected.code
            : warehouseId
              ? "Seleccionar ubicación..."
              : "Selecciona un almacén primero"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <div className="p-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar ubicación..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="max-h-60 overflow-y-auto">
          {loading && locations.length === 0 ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : locations.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No se encontraron ubicaciones.
            </p>
          ) : (
            <>
              {locations.map((loc) => (
                <button
                  key={loc.id}
                  className={cn(
                    "w-full px-3 py-2 text-sm text-left flex items-center gap-2 hover:bg-accent transition-colors",
                    value === loc.id && "bg-accent font-medium"
                  )}
                  onClick={() => {
                    onChange(loc.id)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "h-4 w-4 shrink-0",
                      value === loc.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span>{loc.code}</span>
                </button>
              ))}
              {page + 1 < totalPages && (
                <button
                  className="w-full px-3 py-2 text-sm text-center text-[#7b1a1a] hover:bg-accent transition-colors font-medium"
                  onClick={handleLoadMore}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin inline mr-1" />
                  ) : null}
                  Cargar más...
                </button>
              )}
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
