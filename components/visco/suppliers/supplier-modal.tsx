"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CATEGORIES, CURRENCIES, type Supplier } from "@/lib/mock-data"
import { Loader2, Plus, X } from "lucide-react"

export function SupplierModal({
  open,
  onOpenChange,
  editing,
  onSave,
  saving,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  editing: Supplier | null
  onSave: (data: Partial<Supplier>, id?: string) => void
  saving?: boolean
}) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [address, setAddress] = useState("")
  const [description, setDescription] = useState("")
  const [currency, setCurrency] = useState("USD")
  const [sapCode, setSapCode] = useState("")
  const [category, setCategory] = useState(CATEGORIES[0])
  const [phones, setPhones] = useState<string[]>([])
  const [phoneInput, setPhoneInput] = useState("")
  const [reps, setReps] = useState<string[]>([])
  const [repInput, setRepInput] = useState("")

  useEffect(() => {
    if (editing) {
      setName(editing.name)
      setEmail(editing.email)
      setAddress(editing.address)
      setDescription(editing.description)
      setCurrency(editing.currency)
      setSapCode(editing.sapCode)
      setCategory(editing.category)
      setPhones([editing.phone])
      setReps(editing.legalRepresentatives)
    } else {
      setName("")
      setEmail("")
      setAddress("")
      setDescription("")
      setCurrency("USD")
      setSapCode("")
      setCategory(CATEGORIES[0])
      setPhones([])
      setReps([])
    }
    setPhoneInput("")
    setRepInput("")
  }, [editing, open])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (saving) return
    onSave(
      {
        name,
        email,
        address,
        description,
        currency,
        sapCode,
        category,
        phone: phones[0] ?? "",
        legalRepresentatives: reps,
      },
      editing?.id,
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-serif">
            {editing ? "Editar Proveedor" : "Nuevo Proveedor"}
          </DialogTitle>
          <DialogDescription>
            {editing
              ? "Actualiza la información comercial y legal del proveedor."
              : "Registra un nuevo proveedor en tu catálogo."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="sname">Nombre comercial</Label>
            <Input id="sname" required value={name} onChange={(e) => setName(e.target.value)} disabled={saving} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="semail">Email</Label>
            <Input
              id="semail"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={saving}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ssap">SAP Code</Label>
            <Input id="ssap" value={sapCode} onChange={(e) => setSapCode(e.target.value)} disabled={saving} />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="saddr">Dirección</Label>
            <Input id="saddr" value={address} onChange={(e) => setAddress(e.target.value)} disabled={saving} />
          </div>

          <div className="space-y-1.5">
            <Label>Categoría</Label>
            <Select value={category} onValueChange={setCategory} disabled={saving}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Moneda</Label>
            <Select value={currency} onValueChange={setCurrency} disabled={saving}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="sdesc">Descripción</Label>
            <Textarea
              id="sdesc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={saving}
            />
          </div>

          <TagList
            label="Teléfonos"
            value={phones}
            setValue={setPhones}
            input={phoneInput}
            setInput={setPhoneInput}
            placeholder="+58 212 555 0000"
            disabled={saving}
          />

          <TagList
            label="Representantes legales"
            value={reps}
            setValue={setReps}
            input={repInput}
            setInput={setRepInput}
            placeholder="Nombre completo"
            disabled={saving}
          />

          <DialogFooter className="sm:col-span-2 mt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-[#7b1a1a] hover:bg-[#5c1212] text-white" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Guardando…
                </>
              ) : editing ? (
                "Guardar cambios"
              ) : (
                "Crear proveedor"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function TagList({
  label,
  value,
  setValue,
  input,
  setInput,
  placeholder,
  disabled,
}: {
  label: string
  value: string[]
  setValue: (v: string[]) => void
  input: string
  setInput: (v: string) => void
  placeholder: string
  disabled?: boolean
}) {
  const add = () => {
    const v = input.trim()
    if (!v) return
    setValue([...value, v])
    setInput("")
  }
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              add()
            }
          }}
        />
        <Button type="button" size="icon" variant="outline" onClick={add} disabled={disabled}>
          <Plus className="size-4" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-1">
        {value.map((v, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 rounded-full bg-secondary text-secondary-foreground px-2.5 py-0.5 text-xs"
          >
            {v}
            <button
              type="button"
              aria-label={`Eliminar ${v}`}
              onClick={() => setValue(value.filter((_, idx) => idx !== i))}
              className="hover:text-red-600"
              disabled={disabled}
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  )
}
