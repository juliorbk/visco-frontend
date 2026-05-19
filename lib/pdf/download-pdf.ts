import { pdf } from "@react-pdf/renderer"
import type { ReactElement } from "react"

export async function downloadPDF(document: ReactElement, filename: string): Promise<void> {
  const blob = await pdf(document).toBlob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
