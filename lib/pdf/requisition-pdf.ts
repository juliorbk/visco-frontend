import { jsPDF } from "jspdf"
import type { RequisitionResponse } from "@/lib/types"
import {
  COLORS,
  addLogoPlaceholder,
  addSeparator,
  addSectionTitle,
  addWrappedText,
  formatDateLong,
  translateRequisitionStatus,
  statusColor,
} from "./pdf-utils"

function addTable(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  head: string[],
  body: string[][],
  colWidths: number[],
) {
  const rowH = 6
  const headH = 7
  const cellPadding = 2
  const border = COLORS.border
  const primary = COLORS.primary
  const white = COLORS.white
  const text = COLORS.text

  doc.setFillColor(...primary)
  doc.rect(x, y, w, headH, "F")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(7)
  doc.setTextColor(...white)

  let cx = x
  head.forEach((h, i) => {
    doc.text(h, cx + cellPadding, y + headH / 2 + 2)
    cx += colWidths[i]
    if (i < head.length - 1) {
      doc.setDrawColor(...white)
      doc.setLineWidth(0.2)
      doc.line(cx, y, cx, y + headH)
    }
  })

  doc.setDrawColor(...border)
  doc.setLineWidth(0.3)
  doc.line(x, y + headH, x + w, y + headH)

  let cy = y + headH
  body.forEach((row, ri) => {
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    doc.setTextColor(...text)

    let maxLines = 1
    let rx = x
    const cellTexts: string[][] = []

    row.forEach((cell, ci) => {
      const lines = doc.splitTextToSize(cell, colWidths[ci] - cellPadding * 2)
      cellTexts.push(lines)
      if (lines.length > maxLines) maxLines = lines.length
    })

    const rowHeight = Math.max(rowH, maxLines * 4.5 + cellPadding * 2)

    if (ri % 2 === 1) {
      doc.setFillColor(249, 250, 251)
      doc.rect(x, cy, w, rowHeight, "F")
    }

    rx = x
    row.forEach((_, ci) => {
      const lines = cellTexts[ci]
      const textY = cy + (rowHeight - lines.length * 4.5) / 2 + 3.5
      lines.forEach((line, li) => {
        doc.text(line, rx + cellPadding, textY + li * 4.5)
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

  await addLogoPlaceholder(doc, x0, y, 40, 22)

  doc.setFontSize(22)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...COLORS.primary)
  doc.text("REQUISICIÓN", pageW / 2, y + 10, { align: "center" })

  const statusLabel = translateRequisitionStatus(req.status).toUpperCase()
  const statusRgb = statusColor(req.status)
  doc.setFontSize(8)
  doc.setFont("helvetica", "bold")
  const statusW = doc.getTextWidth(statusLabel) + 6
  const statusX = pageW / 2 - statusW / 2
  const statusY = y + 14
  doc.setFillColor(...statusRgb)
  doc.roundedRect(statusX, statusY, statusW, 5.5, 1.5, 1.5, "F")
  doc.setTextColor(...COLORS.white)
  doc.text(statusLabel, pageW / 2, statusY + 3.8, { align: "center" })

  const infoX = 135
  const infoLines: [string, string][] = [
    ["FECHA:", formatDateLong(req.createdAt)],
    ["REQ #:", req.requisitionNumber],
    ["SOLICITA:", req.requestedBy],
  ]
  doc.setFontSize(7)
  doc.setFont("helvetica", "bold")
  infoLines.forEach(([label, value], i) => {
    doc.setTextColor(...COLORS.textMuted)
    doc.text(label, infoX, y + 22 + i * 5)
    doc.setTextColor(...COLORS.text)
    doc.setFont("helvetica", "normal")
    doc.text(value, infoX + 25, y + 22 + i * 5)
    doc.setFont("helvetica", "bold")
  })

  y += 42
  addSeparator(doc, x0, y, contentW)
  y += 8

  const boxW = (contentW - 6) / 2
  const boxH = 36

  doc.setDrawColor(...COLORS.border)
  doc.setFillColor(...COLORS.bgLight)
  doc.roundedRect(x0, y, boxW, boxH, 2, 2, "FD")
  addSectionTitle(doc, x0, y, boxW, "CENTRO DE COSTO")
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(...COLORS.text)
  let by = y + 15
  if (costCenterDisplay) {
    by += addWrappedText(doc, costCenterDisplay, x0 + 4, by, boxW - 8, 4.5, 3)
  } else {
    by += addWrappedText(doc, req.areaName || "—", x0 + 4, by, boxW - 8, 4.5, 3)
  }

  const x1 = x0 + boxW + 6
  doc.roundedRect(x1, y, boxW, boxH, 2, 2, "FD")
  addSectionTitle(doc, x1, y, boxW, "DESCRIPCIÓN")
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(...COLORS.text)
  by = y + 15
  if (req.description) {
    by += addWrappedText(doc, req.description, x1 + 4, by, boxW - 8, 4.5, 3)
  } else {
    doc.setTextColor(...COLORS.textMuted)
    doc.text("Sin descripción", x1 + 4, by)
  }

  y += boxH + 8

  if (req.rejectionReason || req.approvalNotes || req.approvedBy) {
    const sectionLabel = req.rejectionReason
      ? "Info de Rechazo"
      : "Info de Aprobación"
    addSectionTitle(doc, x0, y, contentW, sectionLabel)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    doc.setTextColor(...COLORS.text)
    let ay = y + 16
    if (req.approvedBy) {
      doc.setFont("helvetica", "bold")
      doc.setTextColor(...COLORS.textMuted)
      doc.text("Aprobado por:", x0 + 4, ay)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(...COLORS.text)
      doc.text(req.approvedBy, x0 + 35, ay)
      ay += 5
    }
    if (req.approvedAt) {
      doc.setFont("helvetica", "bold")
      doc.setTextColor(...COLORS.textMuted)
      doc.text("Fecha:", x0 + 4, ay)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(...COLORS.text)
      doc.text(formatDateLong(req.approvedAt), x0 + 35, ay)
      ay += 5
    }
    const noteText = req.rejectionReason || req.approvalNotes
    if (noteText) {
      doc.setFont("helvetica", "bold")
      doc.setTextColor(...COLORS.textMuted)
      doc.text("Notas:", x0 + 4, ay)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(...COLORS.text)
      const wrapped = doc.splitTextToSize(noteText, contentW - 40)
      doc.text(wrapped, x0 + 35, ay)
      ay += 5 * wrapped.length
    }
    y = ay + 6
  }

  addSectionTitle(doc, x0, y, contentW, `Items Solicitados (${req.items.length})`)
  y += 12

  const colWidths = [10, contentW - 10 - 28 - 14 - 18 - 30, 28, 14, 18, 30]
  const head = ["#", "DESCRIPCION", "SKU", "UM", "CANT.", "NOTAS"]
  const bodyRows = req.items.map((item, i) => [
    String(i + 1),
    item.productName,
    item.productSku,
    item.uom ?? "—",
    String(item.quantity),
    item.notes ?? "—",
  ])
  const emptyCount = Math.max(0, 5 - req.items.length)
  for (let e = 0; e < emptyCount; e++) {
    bodyRows.push(["", "", "", "", "", ""])
  }

  y = addTable(doc, x0, y, contentW, head, bodyRows, colWidths)
  y += 8

  const totalQty = req.items.reduce((s, i) => s + i.quantity, 0)
  doc.setFontSize(8)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...COLORS.textMuted)
  doc.text("Total ítems:", x0, y)
  doc.setTextColor(...COLORS.text)
  doc.text(String(req.items.length), x0 + 25, y)
  doc.setTextColor(...COLORS.textMuted)
  doc.text("Total unidades:", x0 + 60, y)
  doc.setTextColor(...COLORS.text)
  doc.text(String(totalQty), x0 + 95, y)
  y += 18

  const sigBoxW = (contentW - 8) / 2
  const sigBoxH = 38

  doc.setDrawColor(...COLORS.border)
  doc.setFillColor(...COLORS.bgLight)
  doc.roundedRect(x0, y, sigBoxW, sigBoxH, 2, 2, "FD")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(7)
  doc.setTextColor(...COLORS.primary)
  doc.text("SOLICITADO POR", x0 + 4, y + 5)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(...COLORS.text)
  doc.text(req.requestedBy, x0 + 4, y + 13)
  doc.setDrawColor(...COLORS.border)
  doc.line(x0 + 4, y + 26, x0 + sigBoxW - 4, y + 26)
  doc.setFontSize(7)
  doc.setTextColor(...COLORS.textMuted)
  doc.text("Nombre y firma", x0 + sigBoxW / 2, y + 32, { align: "center" })

  const sigX = x0 + sigBoxW + 8
  doc.roundedRect(sigX, y, sigBoxW, sigBoxH, 2, 2, "FD")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(7)
  doc.setTextColor(...COLORS.primary)
  doc.text("APROBADO POR", sigX + 4, y + 5)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(...COLORS.text)
  doc.text(req.approvedBy ?? "—", sigX + 4, y + 13)
  doc.setDrawColor(...COLORS.border)
  doc.line(sigX + 4, y + 26, sigX + sigBoxW - 4, y + 26)
  doc.setFontSize(7)
  doc.setTextColor(...COLORS.textMuted)
  doc.text("Nombre y firma", sigX + sigBoxW / 2, y + 32, { align: "center" })

  return doc
}
