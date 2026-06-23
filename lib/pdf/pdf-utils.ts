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

export function translateRequisitionStatus(status: string): string {
  const map: Record<string, string> = {
    DRAFT: "Borrador",
    PENDING: "Pendiente",
    AWAITING_APPROVAL: "Por Aprobar",
    APPROVED: "Aprobada",
    REJECTED: "Rechazada",
    CANCELLED: "Cancelada",
    CONVERTED: "Convertida a OC",
  }
  return map[status] ?? translateOrderStatus(status) ?? status
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
    DRAFT: [107, 114, 128],
    CONVERTED: [37, 99, 235],
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
  doc.rect(x, y, w, 8, "F")
  doc.setTextColor(...COLORS.white)
  doc.setFontSize(7)
  doc.setFont("helvetica", "bold")
  doc.text(text.toUpperCase(), x + 4, y + 6)
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
  lineHeight: number = 4,
  maxLines?: number,
): number {
  const lines = doc.splitTextToSize(text, maxWidth)
  const finalLines = maxLines ? lines.slice(0, maxLines) : lines
  finalLines.forEach((line: string, i: number) => {
    doc.text(line, x, y + i * lineHeight)
  })
  return finalLines.length * lineHeight
}

export const PAGE_HEIGHT = 297
export const PAGE_WIDTH = 210
export const DEFAULT_MARGIN = 20
export const DEFAULT_MAX_Y = PAGE_HEIGHT - DEFAULT_MARGIN
export const DEFAULT_TOP_Y = DEFAULT_MARGIN

export function ensureSpace(
  doc: jsPDF,
  y: number,
  needed: number,
  options: {
    topY?: number
    maxY?: number
    drawContinuation?: (newY: number) => number
  } = {},
): number {
  const maxY = options.maxY ?? DEFAULT_MAX_Y
  const topY = options.topY ?? DEFAULT_TOP_Y
  if (y + needed <= maxY) return y
  doc.addPage()
  return options.drawContinuation ? options.drawContinuation(topY) : topY
}

export function addContinuationBanner(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  title: string,
  subtitle?: string,
): number {
  const h = 7
  doc.setFillColor(...COLORS.bgLight)
  doc.setDrawColor(...COLORS.primary)
  doc.setLineWidth(0.4)
  doc.rect(x, y, w, h, "FD")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(6.5)
  doc.setTextColor(...COLORS.primary)
  doc.text(title, x + 4, y + 4.8)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(6)
  doc.setTextColor(...COLORS.textMuted)
  doc.text(subtitle ?? "(continuación)", x + w - 4, y + 4.8, { align: "right" })
  return y + h + 2
}

export function addPageNumbers(
  doc: jsPDF,
  options: {
    x?: number
    y?: number
    align?: "left" | "center" | "right"
    prefix?: string
  } = {},
) {
  const total = doc.getNumberOfPages()
  const align = options.align ?? "center"
  const x =
    options.x ??
    (align === "center" ? PAGE_WIDTH / 2 : align === "right" ? PAGE_WIDTH - DEFAULT_MARGIN : DEFAULT_MARGIN)
  const y = options.y ?? PAGE_HEIGHT - 10
  for (let i = 1; i <= total; i++) {
    doc.setPage(i)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(6)
    doc.setTextColor(...COLORS.textMuted)
    doc.text(`${options.prefix ?? "Página"} ${i} / ${total}`, x, y, { align })
  }
}

export interface TableOptions {
  colWidths: number[]
  rowH?: number
  headH?: number
  cellPadding?: number
  topY?: number
  maxY?: number
  continuationLabel?: string
  repeatHeader?: boolean
}

export function addTable(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  head: string[],
  body: string[][],
  options: TableOptions,
): number {
  const colWidths = options.colWidths
  const rowH = options.rowH ?? 5
  const headH = options.headH ?? 6
  const cellPadding = options.cellPadding ?? 1.5
  const topY = options.topY ?? DEFAULT_TOP_Y
  const maxY = options.maxY ?? DEFAULT_MAX_Y
  const repeatHeader = options.repeatHeader !== false

  const border = COLORS.border
  const primary = COLORS.primary
  const white = COLORS.white
  const text = COLORS.text

  const drawHead = (yy: number) => {
    doc.setFillColor(...primary)
    doc.rect(x, yy, w, headH, "F")
    doc.setFont("helvetica", "bold")
    doc.setFontSize(6)
    doc.setTextColor(...white)
    let cx = x
    head.forEach((h, i) => {
      doc.text(h, cx + cellPadding, yy + headH / 2 + 2)
      cx += colWidths[i]
      if (i < head.length - 1) {
        doc.setDrawColor(...white)
        doc.setLineWidth(0.2)
        doc.line(cx, yy, cx, yy + headH)
      }
    })
    doc.setDrawColor(...border)
    doc.setLineWidth(0.3)
    doc.line(x, yy + headH, x + w, yy + headH)
  }

  drawHead(y)
  let cy = y + headH

  body.forEach((row, ri) => {
    doc.setFont("helvetica", "normal")
    doc.setFontSize(6.5)
    doc.setTextColor(...text)

    let maxLines = 1
    const cellTexts: string[][] = []
    row.forEach((cell, ci) => {
      const lines = doc.splitTextToSize(cell, colWidths[ci] - cellPadding * 2)
      cellTexts.push(lines)
      if (lines.length > maxLines) maxLines = lines.length
    })

    const rowHeight = Math.max(rowH, maxLines * 3.8 + cellPadding * 2)

    if (cy + rowHeight > maxY) {
      doc.addPage()
      let contY = topY
      if (options.continuationLabel) {
        contY = addContinuationBanner(doc, x, contY, w, options.continuationLabel, head.join("  •  "))
      }
      if (repeatHeader) {
        drawHead(contY)
        cy = contY + headH
      } else {
        cy = contY
      }
    }

    if (ri % 2 === 1) {
      doc.setFillColor(249, 250, 251)
      doc.rect(x, cy, w, rowHeight, "F")
    }

    let rx = x
    row.forEach((_, ci) => {
      const lines = cellTexts[ci]
      const textY = cy + (rowHeight - lines.length * 3.8) / 2 + 3
      lines.forEach((line, li) => {
        doc.text(line, rx + cellPadding, textY + li * 3.8)
      })
      rx += colWidths[ci]
      if (ci < row.length - 1) {
        doc.line(rx, cy, rx, cy + rowHeight)
      }
    })

    cy += rowHeight
    doc.line(x, cy, x + w, cy)
  })

  return cy
}
