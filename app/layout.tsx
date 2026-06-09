import type { Metadata } from "next"
import { Questrial } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"
import { Analytics } from "@vercel/analytics/next"

const questrial = Questrial({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-questrial",
  display: "swap",
})

export const metadata: Metadata = {
  title: "OriFlow | Visco Orinoco",
  description:
    "Plataforma de compras, inventario y gestion de proveedores para operaciones empresariales.",
  icons: {
    icon: "/visco-logo.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${questrial.variable} bg-background`}>
      <body className="font-sans antialiased text-foreground">
        {children}
        <Toaster position="top-right" richColors />
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
