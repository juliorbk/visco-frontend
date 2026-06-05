import type { jsPDF } from "jspdf"

export const COLORS = {
  primary: [123, 26, 26] as [number, number, number],
  primaryLight: [165, 42, 42] as [number, number, number],
  accent: [200, 84, 44] as [number, number, number],
  text: [31, 41, 55] as [number, number, number],
  textLight: [107, 114, 128] as [number, number, number],
  textMuted: [156, 163, 175] as [number, number, number],
  border: [209, 213, 219] as [number, number, number],
  bgLight: [249, 250, 251] as [number, number, number],
  bgEven: [249, 250, 251] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
}

const MONTHS_ES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
]

export function formatDateLong(dateStr: string): string {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return `${d.getDate()} de ${MONTHS_ES[d.getMonth()]} de ${d.getFullYear()}`
}

export function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`
}

export function formatCurrency(value: number): string {
  if (value == null || isNaN(value)) return "$0.00"
  return `$${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
}

export function translatePaymentMethod(method: string): string {
  const map: Record<string, string> = {
    CASH: "Efectivo",
    BANK_TRANSFER: "Transferencia Bancaria",
    CHECK: "Cheque",
    USDT: "USDT",
    PAYPAL: "PayPal",
    OTHER: "Otro",
  }
  return map[method] ?? method
}

export function translateOrderType(type: string): string {
  const map: Record<string, string> = {
    SERVICES: "Servicios",
    MATERIALS: "Materiales",
    MRO: "MRO",
    CAPITAL_EQUIPMENT: "Equipo de Capital",
  }
  return map[type] ?? type
}

export function translateOrderStatus(status: string): string {
  const map: Record<string, string> = {
    PENDING: "Pendiente",
    AWAITING_APPROVAL: "Por Aprobar",
    APPROVED: "Aprobada",
    REJECTED: "Rechazada",
    IN_TRANSIT: "En Tránsito",
    DELIVERED: "Entregada",
    COMPLETED: "Completada",
    PARTIALLY_DELIVERED: "Entrega Parcial",
    CANCELLED: "Cancelada",
    WAITING_PAYMENT: "Esperando Pago",
    HELD_AT_CUSTOMS: "Retenida en Aduana",
  }
  return map[status] ?? status
}

export function statusColor(status: string): [number, number, number] {
  const map: Record<string, [number, number, number]> = {
    PENDING: [234, 179, 8],
    AWAITING_APPROVAL: [234, 179, 8],
    APPROVED: [22, 163, 74],
    REJECTED: [220, 38, 38],
    IN_TRANSIT: [37, 99, 235],
    DELIVERED: [22, 163, 74],
    COMPLETED: [22, 163, 74],
    PARTIALLY_DELIVERED: [234, 88, 12],
    CANCELLED: [107, 114, 128],
    WAITING_PAYMENT: [202, 138, 4],
    HELD_AT_CUSTOMS: [220, 38, 38],
  }
  return map[status] ?? COLORS.textLight
}

let cachedLogoDataUrl: string | null = null

async function loadLogoDataUrl(): Promise<string | null> {
  if (cachedLogoDataUrl) return cachedLogoDataUrl
  try {
    const res = await fetch("/visco-logo.png")
    if (!res.ok) return null
    const blob = await res.blob()
    return await new Promise<string | null>((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        cachedLogoDataUrl = (reader.result as string) ?? null
        resolve(cachedLogoDataUrl)
      }
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

export async function addLogoPlaceholder(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const dataUrl = await loadLogoDataUrl()
  if (dataUrl) {
    try {
      const format = dataUrl.includes("data:image/jpeg") ? "JPEG" : "PNG"
      doc.addImage(dataUrl, format, x, y, w, h)
      return
    } catch {
      // fall through to text placeholder
    }
  }
  doc.setDrawColor(...COLORS.border)
  doc.setFillColor(...COLORS.bgLight)
  doc.roundedRect(x, y, w, h, 3, 3, "FD")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)
  doc.setTextColor(...COLORS.primary)
  doc.text("VISCO", x + w / 2, y + h / 2 + 2, { align: "center" })
  doc.setFont("helvetica", "normal")
  doc.setFontSize(7)
  doc.setTextColor(...COLORS.textMuted)
  doc.text("ORINOCO", x + w / 2, y + h / 2 + 7, { align: "center" })
}

export function addSectionTitle(doc: jsPDF, x: number, y: number, w: number, text: string) {
  doc.setFillColor(...COLORS.primary)
  doc.rect(x, y, w, 10, "F")
  doc.setTextColor(...COLORS.white)
  doc.setFontSize(8)
  doc.setFont("helvetica", "bold")
  doc.text(text.toUpperCase(), x + 4, y + 7)
}

export function addSeparator(doc: jsPDF, x: number, y: number, w: number, color?: [number, number, number]) {
  doc.setDrawColor(...(color ?? COLORS.primary))
  doc.setLineWidth(0.8)
  doc.line(x, y, x + w, y)
}

export function addWrappedText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number = 5,
  maxLines?: number,
): number {
  const lines = doc.splitTextToSize(text, maxWidth)
  const finalLines = maxLines ? lines.slice(0, maxLines) : lines
  finalLines.forEach((line: string, i: number) => {
    doc.text(line, x, y + i * lineHeight)
  })
  return finalLines.length * lineHeight
}
