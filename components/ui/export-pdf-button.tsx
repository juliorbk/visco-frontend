"use client"

import { ArrowDownTrayIcon, ArrowPathIcon } from "@heroicons/react/24/outline"
import { useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"

type Variant = "default" | "compact" | "icon"

export interface ExportPDFButtonProps {
  onExport: () => Promise<void> | void
  label?: string
  variant?: Variant
  className?: string
}

export function ExportPDFButton({
  onExport,
  label = "Exportar PDF",
  variant = "default",
  className,
}: ExportPDFButtonProps) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    if (loading) return
    try {
      setLoading(true)
      await onExport()
    } finally {
      setTimeout(() => setLoading(false), 400)
    }
  }

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        title="Download PDF"
        className={cn(
          "group relative inline-flex items-center justify-center rounded-lg p-2",
          "text-[#6b7280] hover:text-[#7b1a1a] hover:bg-[#fde8e8]/60",
          "transition-all duration-200 ease-out",
          "hover:scale-110 active:scale-95",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7b1a1a]/40",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
          "cursor-pointer",
          className,
        )}
      >
        <span className="relative inline-flex">
          {loading ? (
            <ArrowPathIcon className="size-4 animate-spin" />
          ) : (
            <ArrowDownTrayIcon className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5" />
          )}
        </span>
      </button>
    )
  }

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={cn(
          "group inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium",
          "border border-[#f3f4f6] bg-white text-[#111827]",
          "transition-all duration-200 ease-out",
          "hover:border-[#7b1a1a]/40 hover:bg-[#fde8e8]/40 hover:text-[#7b1a1a]",
          "hover:shadow-sm hover:-translate-y-0.5",
          "active:translate-y-0 active:shadow-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7b1a1a]/40",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0",
          "cursor-pointer",
          className,
        )}
      >
        {loading ? (
          <ArrowPathIcon className="size-3.5 animate-spin" />
        ) : (
          <ArrowDownTrayIcon className="size-3.5 transition-transform duration-200 group-hover:translate-y-0.5" />
        )}
        <span>{loading ? "Generando…" : label}</span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={cn(
        "group relative w-full overflow-hidden",
        "inline-flex items-center justify-center gap-2",
        "rounded-md px-4 py-2.5 text-sm font-medium",
        "bg-gradient-to-b from-[#7b1a1a] to-[#5c1212] text-white",
        "border border-[#5c1212]",
        "shadow-sm hover:shadow-md",
        "transition-all duration-200 ease-out",
        "hover:from-[#8a1f1f] hover:to-[#6b1616] hover:-translate-y-0.5",
        "active:translate-y-0 active:shadow-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7b1a1a]/60 focus-visible:ring-offset-1",
        "disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0",
        "cursor-pointer",
        className,
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full"
      />
      {loading ? (
        <ArrowPathIcon className="size-4 animate-spin" />
      ) : (
        <ArrowDownTrayIcon className="size-4 transition-transform duration-200 group-hover:translate-y-0.5" />
      )}
      <span>{loading ? "Generando PDF…" : label}</span>
    </button>
  )
}