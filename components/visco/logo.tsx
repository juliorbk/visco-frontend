import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  showSubtitle?: boolean
  size?: "sm" | "md" | "lg"
  // Si necesitas que la imagen sea blanca en modo oscuro, considera usar un SVG 
  // o pasar un prop de imagen diferente (ej. srcWhite / srcBrand).
}

/**
 * "VISCO ORINOCO" logo.
 * Utiliza el archivo visco-logo.png en lugar de texto.
 */
export function Logo({ className, showSubtitle = true, size = "md" }: LogoProps) {
  // Ajustamos el tamaño basándonos en el ancho (w) en lugar del tamaño de fuente
  const sizeClass =
    size === "sm" ? "w-24" : size === "lg" ? "w-48" : "w-32"

  return (
    <div className={cn("flex flex-col items-start tracking-tight", className)}>
      
      <img 
        src="/visco-logo.png" // Asegúrate de que la ruta apunte correctamente a tu imagen
        alt="Visco Orinoco Logo"
        className={cn("object-contain", sizeClass)}
      />

      {showSubtitle && (
        <span
          className={cn(
            "mt-1.5 font-sans uppercase tracking-[0.18em] not-italic text-sidebar-primary/70",
            size === "sm" ? "text-[9px]" : "text-[10px]"
          )}
        >
          NEXUS WMS
        </span>
      )}
    </div>
  )
}