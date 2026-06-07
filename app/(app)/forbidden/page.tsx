"use client"

import Link from "next/link"
import { ShieldExclamationIcon } from "@heroicons/react/24/outline"
import { Button } from "@/components/ui/button"

export function ForbiddenPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="size-16 rounded-full bg-red-100 grid place-items-center mb-4">
        <ShieldExclamationIcon className="size-8 text-red-600" />
      </div>
      <h2 className="text-xl font-serif font-semibold text-foreground mb-2">
        Access denied
      </h2>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        You do not have permission to access this page. Contact an administrator if you believe this is a mistake.
      </p>
      <Button asChild className="bg-[#7b1a1a] hover:bg-[#5c1212] text-white">
        <Link href="/dashboard">Go to dashboard</Link>
      </Button>
    </div>
  )
}

export default ForbiddenPage
