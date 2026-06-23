import { jsPDF } from "jspdf"
import type { RequisitionResponse } from "@/lib/types"
import {
  COLORS,
  addLogoPlaceholder,
  addSeparator,
  addSectionTitle,
  addTable,
  addWrappedText,
  addPageNumbers,
  ensureSpace,
  formatDateLong,
  translateRequisitionStatus,
  statusColor,
} from "./pdf-utils"

export async function generateRequisitionPDF(
  req: RequisitionResponse,
  costCenterDisplay?: string | null,
): Promise<jsPDF> {
  const doc = new jsPDF({
    orientation: "p",
    unit: "mm",
    format: "a4",
    compress: true,
    putOnlyUsedFonts: true,
  })
  const pageW = 210
  const margin = 20
  const contentW = pageW - 2 * margin
  const x0 = margin
  let y = margin

  await addLogoPlaceholder(doc, x0, y, 36, 20)

  doc.setFontSize(15)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...COLORS.primary)
  doc.text("REQUISICIÓN", pageW / 2, y + 8, { align: "center" })

  const statusLabel = translateRequisitionStatus(req.status).toUpperCase()
  const statusRgb = statusColor(req.status)
  doc.setFontSize(7)
  doc.setFont("helvetica", "bold")
  const statusW = doc.getTextWidth(statusLabel) + 5
  const statusX = pageW / 2 - statusW / 2
  const statusY = y + 13
  doc.setFillColor(...statusRgb)
  doc.roundedRect(statusX, statusY, statusW, 5, 1.5, 1.5, "F")
  doc.setTextColor(...COLORS.white)
  doc.text(statusLabel, pageW / 2, statusY + 3.5, { align: "center" })

  const infoX = 132
  const infoLines: [string, string][] = [
    ["FECHA:", formatDateLong(req.createdAt)],
    ["REQ #:", req.requisitionNumber],
    ["SOLICITA:", req.requestedBy],
  ]
  const infoBoxW = pageW - margin - infoX
  const infoBoxH = 8 + infoLines.length * 4.5 + 3
  doc.setDrawColor(...COLORS.border)
  doc.setFillColor(...COLORS.bgLight)
  doc.roundedRect(infoX - 2, y + 18, infoBoxW + 2, infoBoxH, 2, 2, "FD")
  doc.setFontSize(6.5)
  doc.setFont("helvetica", "bold")
  infoLines.forEach(([label, value], i) => {
    doc.setTextColor(...COLORS.textMuted)
    doc.text(label, infoX, y + 23 + i * 4.5)
    doc.setTextColor(...COLORS.text)
    doc.setFont("helvetica", "normal")
    doc.text(value, infoX + 22, y + 23 + i * 4.5)
    doc.setFont("helvetica", "bold")
  })

  const infoBoxTopPad = 18
  y += infoBoxTopPad + infoBoxH + 4
  addSeparator(doc, x0, y, contentW)
  y += 6

  const boxW = (contentW - 6) / 2
  const boxH = 32

  doc.setDrawColor(...COLORS.border)
  doc.setFillColor(...COLORS.bgLight)
  doc.roundedRect(x0, y, boxW, boxH, 2, 2, "FD")
  addSectionTitle(doc, x0, y, boxW, "CENTRO DE COSTO")
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.setTextColor(...COLORS.text)
  let by = y + 12
  if (costCenterDisplay) {
    by += addWrappedText(doc, costCenterDisplay, x0 + 3, by, boxW - 6, 4, 3)
  } else {
    by += addWrappedText(doc, req.areaName || "—", x0 + 3, by, boxW - 6, 4, 3)
  }

  const x1 = x0 + boxW + 6
  doc.roundedRect(x1, y, boxW, boxH, 2, 2, "FD")
  addSectionTitle(doc, x1, y, boxW, "SOLICITANTE")
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.setTextColor(...COLORS.white)
  by = y + 12
  by += addWrappedText(doc, req.requestedBy || "—", x1 + 3, by, boxW - 6, 4, 3)

  y += boxH + 6

  if (req.description) {
    const descLines = doc.splitTextToSize(req.description, contentW - 6)
    const lineH = 4
    const descH = Math.max(16, 8 + descLines.length * lineH + 4)
    doc.setDrawColor(...COLORS.border)
    doc.setFillColor(...COLORS.bgLight)
    doc.roundedRect(x0, y, contentW, descH, 2, 2, "FD")
    addSectionTitle(doc, x0, y, contentW, "DESCRIPCIÓN")
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    doc.setTextColor(...COLORS.text)
    doc.text(descLines, x0 + 3, y + 12)
    y += descH + 6
  }

  if (req.rejectionReason || req.approvalNotes || req.approvedBy) {
    const sectionLabel = req.rejectionReason
      ? "Info de Rechazo"
      : "Info de Aprobación"
    addSectionTitle(doc, x0, y, contentW, sectionLabel)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(7)
    doc.setTextColor(...COLORS.text)
    let ay = y + 12
    if (req.approvedBy) {
      doc.setFont("helvetica", "bold")
      doc.setTextColor(...COLORS.textMuted)
      doc.text("Aprobado por:", x0 + 3, ay)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(...COLORS.text)
      doc.text(req.approvedBy, x0 + 30, ay)
      ay += 4
    }
    if (req.approvedAt) {
      doc.setFont("helvetica", "bold")
      doc.setTextColor(...COLORS.textMuted)
      doc.text("Fecha:", x0 + 3, ay)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(...COLORS.text)
      doc.text(formatDateLong(req.approvedAt), x0 + 30, ay)
      ay += 4
    }
    const noteText = req.rejectionReason || req.approvalNotes
    if (noteText) {
      doc.setFont("helvetica", "bold")
      doc.setTextColor(...COLORS.textMuted)
      doc.text("Notas:", x0 + 3, ay)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(...COLORS.text)
      const wrapped = doc.splitTextToSize(noteText, contentW - 35)
      doc.text(wrapped, x0 + 30, ay)
      ay += 4 * wrapped.length
    }
    y = ay + 5
  }

  addSectionTitle(doc, x0, y, contentW, `Items Solicitados (${req.items.length})`)
  y += 10

  const colWidths = [7, 18, 18, contentW - 7 - 18 - 18 - 16 - 10 - 16 - 22, 16, 10, 16, 22]
  const head = ["#", "C.INT", "C.SAP", "DESCRIPCIÓN", "SKU", "UM", "CANT.", "NOTAS"]
  const bodyRows = req.items.map((item, i) => [
    String(i + 1),
    item.productInternalCode ?? "—",
    item.productSapCode ?? "—",
    item.productName,
    item.productSku,
    item.uom ?? "—",
    String(item.quantity),
    item.notes ?? "—",
  ])

  y = addTable(doc, x0, y, contentW, head, bodyRows, {
    colWidths,
    continuationLabel: `Items Solicitados (${req.items.length})`,
  })
  y += 6

  const totalQty = req.items.reduce((s, i) => s + i.quantity, 0)
  const totalsBlockH = 14
  y = ensureSpace(doc, y, totalsBlockH + 6)
  doc.setFontSize(7)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...COLORS.textMuted)
  doc.text("Total ítems:", x0, y)
  doc.setTextColor(...COLORS.text)
  doc.text(String(req.items.length), x0 + 22, y)
  doc.setTextColor(...COLORS.textMuted)
  doc.text("Total unidades:", x0 + 55, y)
  doc.setTextColor(...COLORS.text)
  doc.text(String(totalQty), x0 + 85, y)
  y += 14

  const sigBoxW = (contentW - 8) / 2
  const sigBoxH = 34
  y = ensureSpace(doc, y, sigBoxH)

  doc.setDrawColor(...COLORS.border)
  doc.setFillColor(...COLORS.bgLight)
  doc.roundedRect(x0, y, sigBoxW, sigBoxH, 2, 2, "FD")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(6.5)
  doc.setTextColor(...COLORS.primary)
  doc.text("SOLICITADO POR", x0 + 3, y + 4.5)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.setTextColor(...COLORS.text)
  doc.text(req.requestedBy, x0 + 3, y + 11)
  doc.setDrawColor(...COLORS.border)
  doc.line(x0 + 3, y + 23, x0 + sigBoxW - 3, y + 23)
  doc.setFontSize(6.5)
  doc.setTextColor(...COLORS.textMuted)
  doc.text("Nombre y firma", x0 + sigBoxW / 2, y + 28, { align: "center" })

  const sigX = x0 + sigBoxW + 8
  doc.roundedRect(sigX, y, sigBoxW, sigBoxH, 2, 2, "FD")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(6.5)
  doc.setTextColor(...COLORS.primary)
  doc.text("APROBADO POR", sigX + 3, y + 4.5)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.setTextColor(...COLORS.text)
  doc.text(req.approvedBy ?? "—", sigX + 3, y + 11)
  doc.setDrawColor(...COLORS.border)
  doc.line(sigX + 3, y + 23, sigX + sigBoxW - 3, y + 23)
  doc.setFontSize(6.5)
  doc.setTextColor(...COLORS.textMuted)
  doc.text("Nombre y firma", sigX + sigBoxW / 2, y + 28, { align: "center" })

  addPageNumbers(doc, { prefix: "Hoja" })

  return doc
}