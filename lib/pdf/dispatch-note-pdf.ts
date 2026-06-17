import { jsPDF } from "jspdf"
import type { DispatchResponse } from "@/lib/types"
import {
  COLORS,
  addLogoPlaceholder,
  addSeparator,
  addTable,
  addPageNumbers,
  ensureSpace,
  formatDateLong,
} from "./pdf-utils"

export async function generateDispatchNotePDF(
  dispatch: DispatchResponse,
  costCenterManagement?: string | null,
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
  doc.setTextColor(...COLORS.accent)
  doc.text("NOTA DE DESPACHO", pageW / 2, y + 10, { align: "center" })

  doc.setFontSize(11)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...COLORS.primary)
  doc.text(`N° ${dispatch.dispatchNumber}`, pageW / 2, y + 19, { align: "center" })

  y += 30
  addSeparator(doc, x0, y, contentW)
  y += 8

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

  const wh = dispatch.warehouse
  if (wh && (wh.physicalAddress || wh.sapCenterCode || wh.responsibleUserName)) {
    doc.setFont("helvetica", "bold")
    doc.setFontSize(7)
    doc.setTextColor(...COLORS.textMuted)
    doc.text("DIRECCIÓN ALMACÉN", x0, y)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.setTextColor(...COLORS.text)
    doc.text(wh.physicalAddress || "—", x0, y + 5)
    const extras = [
      wh.sapCenterCode ? `SAP: ${wh.sapCenterCode}` : "",
      wh.responsibleUserName ? `Resp: ${wh.responsibleUserName}` : "",
    ].filter(Boolean).join("  |  ")
    if (extras) {
      doc.setFontSize(7.5)
      doc.setTextColor(...COLORS.textMuted)
      doc.text(extras, x0, y + 10)
      y += 16
    } else {
      y += 12
    }
  }

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
  if (costCenterManagement) {
    doc.setFontSize(7.5)
    doc.setTextColor(...COLORS.textMuted)
    doc.text(`Gerencia: ${costCenterManagement}`, x0, y + 10)
  }

  y += costCenterManagement ? 18 : 14

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

  const totalItems = dispatch.items.reduce((s, i) => s + i.quantity, 0)

  const colWidths = [24, 24, contentW - 24 - 24 - 18 - 14 - 22, 18, 14, 22]
  const head = ["C.INT", "C.SAP", "PRODUCTO", "SKU", "UM", "CANTIDAD"]
  const bodyRows = dispatch.items.map((item) => [
    item.productInternalCode ?? "—",
    item.productSapCode ?? "—",
    item.productName,
    item.productSku,
    item.uom ?? "—",
    String(item.quantity),
  ])

  y = addTable(doc, x0, y, contentW, head, bodyRows, {
    colWidths,
    continuationLabel: `Items del Despacho (${dispatch.items.length})`,
  })
  y += 6

  y = ensureSpace(doc, y, 12)
  doc.setFontSize(8)
  doc.setTextColor(...COLORS.text)
  const sumX = pageW - margin - 70

  doc.setFont("helvetica", "bold")
  doc.text("Total ítems:", sumX, y)
  doc.text(`${totalItems} uds.`, sumX + 68, y, { align: "right" })
  y += 12

  if (dispatch.notes) {
    const notesH = 40
    y = ensureSpace(doc, y, notesH)
    doc.setDrawColor(...COLORS.border)
    doc.setFillColor(...COLORS.bgLight)
    doc.roundedRect(x0, y, contentW, notesH, 2, 2, "FD")
    doc.setFont("helvetica", "bold")
    doc.setFontSize(7)
    doc.setTextColor(...COLORS.primary)
    doc.text("NOTAS", x0 + 4, y + 5)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    doc.setTextColor(...COLORS.text)
    const noteLines = doc.splitTextToSize(dispatch.notes, contentW - 8)
    doc.text(noteLines, x0 + 4, y + 14)
    y += notesH + 8
  }

  const footBoxW = (contentW - 8) / 2
  const footBoxH = 40
  y = ensureSpace(doc, y, footBoxH)

  doc.setDrawColor(...COLORS.border)
  doc.setFillColor(...COLORS.bgLight)
  doc.roundedRect(x0, y, footBoxW, footBoxH, 2, 2, "FD")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(7)
  doc.setTextColor(...COLORS.primary)
  doc.text("RECIBIDO POR", x0 + 4, y + 5)
  doc.setDrawColor(...COLORS.border)
  doc.line(x0 + 4, y + 28, x0 + footBoxW - 4, y + 28)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(7)
  doc.setTextColor(...COLORS.textMuted)
  doc.text("Nombre y Firma", x0 + footBoxW / 2, y + 34, { align: "center" })

  const obsX = x0 + footBoxW + 8
  doc.roundedRect(obsX, y, footBoxW, footBoxH, 2, 2, "FD")
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

  addPageNumbers(doc)

  return doc
}
