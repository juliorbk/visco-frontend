import type React from "react"
import { Sidebar } from "@/components/visco/sidebar"
import { Topbar } from "@/components/visco/topbar"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:pl-[180px]">
        <Topbar />
        <main className="px-4 md:px-8 py-6">{children}</main>
      </div>
    </div>
  )
}
