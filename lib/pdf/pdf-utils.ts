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

export function addLogoPlaceholder(doc: jsPDF, x: number, y: number, w: number, h: number) {
  doc.setDrawColor(...COLORS.border)
  doc.setFillColor(...COLORS.bgLight)
  doc.roundedRect(x, y, w, h, 3, 3, "FD")
  doc.setFontSize(10)
  doc.setTextColor(...COLORS.textMuted)
doc.addImage("visco-logo.png", "PNG", x + w / 4, y + h / 4, w / 2, h / 2);
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
