"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Route error boundary caught:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4">
      <div className="size-14 rounded-full bg-red-50 flex items-center justify-center">
        <ExclamationTriangleIcon className="size-7 text-red-600" />
      </div>
      <div className="text-center max-w-md">
        <h2 className="text-lg font-semibold text-foreground">Algo salió mal</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {error.message || "Ocurrió un error inesperado. Intenta nuevamente."}
        </p>
      </div>
      <Button
        onClick={reset}
        variant="outline"
        className="mt-2"
      >
        Reintentar
      </Button>
    </div>
  )
}
