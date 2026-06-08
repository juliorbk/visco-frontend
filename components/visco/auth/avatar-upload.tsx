"use client"

import { useCallback, useState } from "react"
import { UserCircleIcon, XMarkIcon } from "@heroicons/react/24/outline"
import { cn } from "@/lib/utils"

interface AvatarUploadProps {
  value: string | null
  onChange: (dataUrl: string | null) => void
  disabled?: boolean
}

export function AvatarUpload({ value, onChange, disabled }: AvatarUploadProps) {
  const [dragOver, setDragOver] = useState(false)

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return
      const reader = new FileReader()
      reader.onload = () => {
        onChange(reader.result as string)
      }
      reader.readAsDataURL(file)
    },
    [onChange],
  )

  return (
    <div className="flex flex-col items-center gap-3">
      <label
        className={cn(
          "relative size-24 rounded-full overflow-hidden border-2 border-dashed cursor-pointer transition-colors flex items-center justify-center",
          dragOver
            ? "border-[#7b1a1a] bg-[#fde8e8]/30"
            : "border-muted-foreground/30 hover:border-[#7b1a1a]/50",
          disabled && "opacity-50 cursor-not-allowed",
        )}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          const file = e.dataTransfer.files[0]
          if (file) handleFile(file)
        }}
      >
        {value ? (
          <img
            src={value}
            alt="Foto de perfil"
            className="size-full object-cover"
          />
        ) : (
          <UserCircleIcon className="size-10 text-muted-foreground" />
        )}
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          disabled={disabled}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
          }}
        />
      </label>

      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">
          {value ? "Foto seleccionada" : "Subir foto de perfil"}
        </span>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
            disabled={disabled}
          >
            <XMarkIcon className="size-3" />
            Quitar
          </button>
        )}
      </div>
    </div>
  )
}
