import type { Metadata } from "next"
import { Rethink_Sans, Lora } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"
import { Analytics } from "@vercel/analytics/next"

const rethinkSans = Rethink_Sans({
  subsets: ["latin"],
  variable: "--font-rethink-sans",
  display: "swap",
})

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
})

export const metadata: Metadata = {
  title: "OriFlow | Visco Orinoco",
  description:
    "Procurement, inventory and supplier management platform for enterprise operations.",
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
    <html lang="es" className={`${rethinkSans.variable} ${lora.variable} bg-background`}>
      <body className="font-sans antialiased text-foreground">
        {children}
        <Toaster position="top-right" richColors />
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
