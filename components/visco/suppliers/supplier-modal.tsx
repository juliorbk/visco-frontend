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
import type { SupplierDTO, SupplierCategoryDTO } from "@/lib/types"
import { fetchActiveSupplierCategories } from "@/lib/services/suppliers"
import { ArrowPathIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/outline"

const CURRENCIES = ["USD", "EUR", "VES", "COP", "BRL"]

const NO_CATEGORY = "__none__"

export function SupplierModal({
  open,
  onOpenChange,
  editing,
  onSave,
  saving,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  editing: SupplierDTO | null
  onSave: (data: Partial<SupplierDTO>, id?: number) => void
  saving?: boolean
}) {
  const [name, setName] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [address, setAddress] = useState("")
  const [description, setDescription] = useState("")
  const [currency, setCurrency] = useState("USD")
  const [phones, setPhones] = useState<string[]>([])
  const [phoneInput, setPhoneInput] = useState("")
  const [reps, setReps] = useState<string[]>([])
  const [repInput, setRepInput] = useState("")
  const [categoryId, setCategoryId] = useState<string>(NO_CATEGORY)
  const [categories, setCategories] = useState<SupplierCategoryDTO[]>([])

  useEffect(() => {
    if (!open) return
    if (editing) {
      setName(editing.name)
      setContactEmail(editing.contactEmail)
      setAddress(editing.address)
      setDescription(editing.description)
      setCurrency(editing.currency)
      setPhones(editing.phoneNumbers)
      setReps(editing.representatives.map((r) => r.fullName))
      setCategoryId(
        editing.categoryId != null ? String(editing.categoryId) : NO_CATEGORY,
      )
    } else {
      setName("")
      setContactEmail("")
      setAddress("")
      setDescription("")
      setCurrency("USD")
      setPhones([])
      setReps([])
      setCategoryId(NO_CATEGORY)
    }
    setPhoneInput("")
    setRepInput("")
  }, [editing, open])

  useEffect(() => {
    if (!open) return
    fetchActiveSupplierCategories(0, 200)
      .then((res) => setCategories(res.content ?? []))
      .catch(() => setCategories([]))
  }, [open])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (saving) return
    onSave(
      {
        name,
        contactEmail,
        address,
        description,
        currency,
        phoneNumbers: phones,
        representatives: reps.map((fullName) => ({ id: 0, fullName })),
        active: true,
        categoryId: categoryId === NO_CATEGORY ? null : Number(categoryId),
      },
      editing?.id,
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-serif">
            {editing ? "Edit supplier" : "New supplier"}
          </DialogTitle>
          <DialogDescription>
            {editing
              ? "Update the supplier's commercial and legal information."
              : "Register a new supplier in your catalog."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="sname">Business name</Label>
            <Input id="sname" required value={name} onChange={(e) => setName(e.target.value)} disabled={saving} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="semail">Email</Label>
            <Input
              id="semail"
              type="email"
              required
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              disabled={saving}
            />
          </div>


          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="saddr">Address</Label>
            <Input id="saddr" value={address} onChange={(e) => setAddress(e.target.value)} disabled={saving} />
          </div>

          <div className="space-y-1.5">
            <Label>Currency</Label>
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

          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select
              value={categoryId}
              onValueChange={setCategoryId}
              disabled={saving}
            >
              <SelectTrigger>
                <SelectValue placeholder="Uncategorized" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_CATEGORY}>Uncategorized</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="sdesc">Description</Label>
            <Textarea
              id="sdesc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={saving}
            />
          </div>

          <TagList
            label="Phone numbers"
            value={phones}
            setValue={setPhones}
            input={phoneInput}
            setInput={setPhoneInput}
            placeholder="+58 0412 123 4567"
            disabled={saving}
          />

          <TagList
            label="Legal representatives"
            value={reps}
            setValue={setReps}
            input={repInput}
            setInput={setRepInput}
            placeholder="Full name"
            disabled={saving}
          />

          <DialogFooter className="sm:col-span-2 mt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#7b1a1a] hover:bg-[#5c1212] text-white" disabled={saving}>
              {saving ? (
                <>
                  <ArrowPathIcon className="size-4 animate-spin" /> Saving…
                </>
              ) : editing ? (
                "Save changes"
              ) : (
                "Create supplier"
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
          <PlusIcon className="size-4" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-1">
        {value.map((v) => (
          <span
            key={v}
            className="inline-flex items-center gap-1 rounded-full bg-secondary text-secondary-foreground px-2.5 py-0.5 text-xs"
          >
            {v}
            <button
              type="button"
              aria-label={`Eliminar ${v}`}
              onClick={() => setValue(value.filter((item) => item !== v))}
              className="hover:text-red-600"
              disabled={disabled}
            >
              <XMarkIcon className="size-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  )
}
