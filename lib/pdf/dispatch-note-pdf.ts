import { jsPDF } from "jspdf"
import type { DispatchResponse } from "@/lib/types"
import {
  COLORS,
  addLogoPlaceholder,
  addSeparator,
  formatDateLong,
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
    doc.text(h, cx + 2, y + headH / 2 + 2)
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
    if (ri % 2 === 1) {
      doc.setFillColor(249, 250, 251)
      doc.rect(x, cy, w, rowH, "F")
    }
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    doc.setTextColor(...text)

    let rx = x
    row.forEach((cell, ci) => {
      const lines = doc.splitTextToSize(cell, colWidths[ci] - 4)
      doc.text(lines[0] ?? "", rx + 2, cy + rowH / 2 + 2)
      rx += colWidths[ci]
      if (ci < row.length - 1) {
        doc.line(rx, cy, rx, cy + rowH)
      }
    })

    cy += rowH
    doc.line(x, cy, x + w, cy)
  })

  return cy
}

export function generateDispatchNotePDF(dispatch: DispatchResponse): jsPDF {
  const doc = new jsPDF("p", "mm", "a4")
  const pageW = 210
  const margin = 20
  const contentW = pageW - 2 * margin
  const x0 = margin
  let y = margin

  // ── Header ──
  addLogoPlaceholder(doc, x0, y, 40, 22)

  doc.setFontSize(22)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...COLORS.accent)
  doc.text("NOTA DE DESPACHO", pageW / 2, y + 10, { align: "center" })

  doc.setFontSize(11)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...COLORS.primary)
  doc.text(`N° ${dispatch.dispatchNumber}`, pageW / 2, y + 20, { align: "center" })

  y += 30
  addSeparator(doc, x0, y, contentW)
  y += 8

  // ── Document Info ──
  doc.setFont("helvetica", "bold")
  doc.setFontSize(7)
  doc.setTextColor(...COLORS.textMuted)
  doc.text("FECHA", x0, y)
  doc.text("ALMACÉN", x0 + 60, y)
  doc.text("RETIRADO POR", x0 + 120, y)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(...COLORS.text)
  doc.text(formatDateLong(dispatch.createdAt), x0, y + 5)
  doc.text(dispatch.warehouseName, x0 + 60, y + 5)
  doc.text(dispatch.employeeName || "—", x0 + 120, y + 5)

  y += 14

  // Cost center
  doc.setFont("helvetica", "bold")
  doc.setFontSize(7)
  doc.setTextColor(...COLORS.textMuted)
  doc.text("CENTRO DE COSTO", x0, y)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(...COLORS.text)
  const costCenterText = dispatch.costCenterDescription
    ? `${dispatch.costCenterCode ?? ""}${dispatch.costCenterCode ? " — " : ""}${dispatch.costCenterDescription}`
    : "—"
  doc.text(costCenterText, x0, y + 5)

  y += 14

  // Created by
  doc.setFont("helvetica", "bold")
  doc.setFontSize(7)
  doc.setTextColor(...COLORS.textMuted)
  doc.text("CREADO POR", x0, y)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(...COLORS.text)
  doc.text(dispatch.createdByName, x0, y + 5)

  if (dispatch.employeeDocument) {
    doc.setFont("helvetica", "bold")
    doc.setFontSize(7)
    doc.setTextColor(...COLORS.textMuted)
    doc.text("DOC. EMPLEADO", x0 + 60, y)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.setTextColor(...COLORS.text)
    doc.text(dispatch.employeeDocument, x0 + 60, y + 5)
  }

  y += 14
  addSeparator(doc, x0, y, contentW)
  y += 8

  // ── Items Table ──
  const totalItems = dispatch.items.reduce((s, i) => s + i.quantity, 0)

  const colWidths = [contentW - 18 - 22, 18, 22]
  const head = ["PRODUCTO", "SKU", "CANTIDAD"]
  const bodyRows = dispatch.items.map((item) => [
    item.productName,
    item.productSku,
    String(item.quantity),
  ])

  y = addTable(doc, x0, y, contentW, head, bodyRows, colWidths)
  y += 6

  // ── Total items summary ──
  doc.setFontSize(8)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...COLORS.text)
  const sumX = pageW - margin - 70
  doc.text("Total ítems:", sumX, y)
  doc.text(`${totalItems} uds.`, sumX + 68, y, { align: "right" })
  y += 12

  // ── Notes ──
  if (dispatch.notes) {
    doc.setDrawColor(...COLORS.border)
    doc.setFillColor(...COLORS.bgLight)
    doc.roundedRect(x0, y, contentW, 40, 2, 2, "FD")
    doc.setFont("helvetica", "bold")
    doc.setFontSize(7)
    doc.setTextColor(...COLORS.primary)
    doc.text("NOTAS", x0 + 4, y + 5)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    doc.setTextColor(...COLORS.text)
    const noteLines = doc.splitTextToSize(dispatch.notes, contentW - 8)
    doc.text(noteLines, x0 + 4, y + 14)
    y += 48
  }

  // ── Signature ──
  const footBoxW = (contentW - 8) / 2

  doc.setDrawColor(...COLORS.border)
  doc.setFillColor(...COLORS.bgLight)
  doc.roundedRect(x0, y, footBoxW, 40, 2, 2, "FD")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(7)
  doc.setTextColor(...COLORS.primary)
  doc.text("RECIBIDO POR", x0 + 4, y + 5)
  doc.setDrawColor(...COLORS.border)
  doc.line(x0 + 4, y + 28, x0 + footBoxW - 4, y + 28)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(7)
  doc.setTextColor(...COLORS.textMuted)
  doc.text("Nombre & Firma", x0 + footBoxW / 2, y + 34, { align: "center" })

  const obsX = x0 + footBoxW + 8
  doc.roundedRect(obsX, y, footBoxW, 40, 2, 2, "FD")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(7)
  doc.setTextColor(...COLORS.primary)
  doc.text("ENTREGADO POR", obsX + 4, y + 5)
  doc.setDrawColor(...COLORS.border)
  doc.line(obsX + 4, y + 28, obsX + footBoxW - 4, y + 28)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(7)
  doc.setTextColor(...COLORS.textMuted)
  doc.text("Nombre & Firma", obsX + footBoxW / 2, y + 34, { align: "center" })

  return doc
}
