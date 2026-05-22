import type { Metadata } from "next"
import { Inter, Lora } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Visco Orinoco — Enterprise Tier",
  description:
    "Procurement, inventory and supplier management platform for enterprise operations.",
  generator: "v0.app",
  icons: {
    icon: "/favicon.ico",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${lora.variable} bg-background`}>
      <body className="font-sans antialiased text-foreground">
        {children}
        <Toaster position="top-right" richColors />
        <Analytics/>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
