import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  showSubtitle?: boolean
  size?: "sm" | "md" | "lg"
  /**
   * `default` renders the logo with its original brand colors
   * (use on light/neutral backgrounds).
   * `white` inverts the logo so it stays visible on dark surfaces
   * (the `--primary` / `--sidebar` brand backgrounds) without
   * shipping a second PNG asset.
   */
  variant?: "default" | "white"
}

export function Logo({
  className,
  showSubtitle = true,
  size = "md",
  variant = "default",
}: LogoProps) {
  const sizeClass =
    size === "sm" ? "w-20" : size === "lg" ? "w-40" : "w-28"

  const isWhite = variant === "white"

  return (
    <div className={cn("flex flex-col items-start tracking-tight", className)}>
      <img
        src="/visco-logo.png"
        alt="Logo Visco Orinoco"
        className={cn(
          "object-contain",
          sizeClass,
          isWhite && "brightness-0 invert",
        )}
      />

      {showSubtitle && (
        <span
          className={cn(
            "mt-1.5 font-sans uppercase tracking-[0.18em] not-italic",
            isWhite ? "text-white/80" : "text-sidebar-primary/70",
            size === "sm" ? "text-[9px]" : "text-[10px]",
          )}
        >
          OriFlow | Visco Orinoco
        </span>
      )}
    </div>
  )
}