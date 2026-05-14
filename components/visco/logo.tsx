import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  showSubtitle?: boolean
  color?: "white" | "brand"
  size?: "sm" | "md" | "lg"
}

/**
 * "VISCO ORINOCO" logo. Stacked two lines, vertical separator splits
 * "V | SCO" on line 1 and "OR | NOCO" on line 2.
 */
export function Logo({ className, showSubtitle = true, color = "white", size = "md" }: LogoProps) {
  const colorClass = color === "white" ? "text-white" : "text-[#7b1a1a]"
  const sizeClass =
    size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-lg"
  const sepColor = color === "white" ? "bg-white/70" : "bg-[#7b1a1a]/60"

  return (
    <div className={cn("flex flex-col font-serif tracking-tight", colorClass, className)}>
      <div className={cn("flex items-center gap-1 font-bold leading-none", sizeClass)}>
        <span>V</span>
        <span className={cn("h-[0.85em] w-px", sepColor)} aria-hidden />
        <span>SCO</span>
      </div>
      <div className={cn("flex items-center gap-1 font-bold leading-none mt-1", sizeClass)}>
        <span>OR</span>
        <span className={cn("h-[0.85em] w-px", sepColor)} aria-hidden />
        <span>NOCO</span>
      </div>
      {showSubtitle && (
        <span
          className={cn(
            "mt-1.5 font-sans uppercase tracking-[0.18em] not-italic",
            size === "sm" ? "text-[9px]" : "text-[10px]",
            color === "white" ? "text-white/75" : "text-[#7b1a1a]/70",
          )}
        >
          Enterprise Tier
        </span>
      )}
    </div>
  )
}
