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

  await addLogoPlaceholder(doc, x0, y, 36, 20)

  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...COLORS.accent)
  doc.text("NOTA DE DESPACHO", pageW / 2, y + 8, { align: "center" })

  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...COLORS.primary)
  doc.text(`N° ${dispatch.dispatchNumber}`, pageW / 2, y + 15, { align: "center" })

  y += 26
  addSeparator(doc, x0, y, contentW)
  y += 6

  doc.setFont("helvetica", "bold")
  doc.setFontSize(6.5)
  doc.setTextColor(...COLORS.textMuted)
  doc.text("FECHA", x0, y)
  doc.text("ALMACÉN", x0 + 60, y)
  doc.text("RETIRADO POR", x0 + 120, y)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.setTextColor(...COLORS.text)
  doc.text(formatDateLong(dispatch.createdAt), x0, y + 4.5)
  doc.text(dispatch.warehouseName, x0 + 60, y + 4.5)
  doc.text(dispatch.employeeName || "—", x0 + 120, y + 4.5)

  y += 12

  const wh = dispatch.warehouse
  if (wh && (wh.physicalAddress || wh.sapCenterCode || wh.responsibleUserName)) {
    doc.setFont("helvetica", "bold")
    doc.setFontSize(6.5)
    doc.setTextColor(...COLORS.textMuted)
    doc.text("DIRECCIÓN ALMACÉN", x0, y)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    doc.setTextColor(...COLORS.text)
    doc.text(wh.physicalAddress || "—", x0, y + 4.5)
    const extras = [
      wh.sapCenterCode ? `SAP: ${wh.sapCenterCode}` : "",
      wh.responsibleUserName ? `Resp: ${wh.responsibleUserName}` : "",
    ].filter(Boolean).join("  |  ")
    if (extras) {
      doc.setFontSize(7)
      doc.setTextColor(...COLORS.textMuted)
      doc.text(extras, x0, y + 8.5)
      y += 14
    } else {
      y += 10
    }
  }

  doc.setFont("helvetica", "bold")
  doc.setFontSize(6.5)
  doc.setTextColor(...COLORS.textMuted)
  doc.text("CENTRO DE COSTO", x0, y)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.setTextColor(...COLORS.text)
  const costCenterText = dispatch.costCenterDescription
    ? `${dispatch.costCenterCode ?? ""}${dispatch.costCenterCode ? " — " : ""}${dispatch.costCenterDescription}`
    : "—"
  doc.text(costCenterText, x0, y + 4.5)
  if (costCenterManagement) {
    doc.setFontSize(7)
    doc.setTextColor(...COLORS.textMuted)
    doc.text(`Gerencia: ${costCenterManagement}`, x0, y + 8.5)
  }

  y += costCenterManagement ? 15 : 12

  doc.setFont("helvetica", "bold")
  doc.setFontSize(6.5)
  doc.setTextColor(...COLORS.textMuted)
  doc.text("CREADO POR", x0, y)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.setTextColor(...COLORS.text)
  doc.text(dispatch.createdByName, x0, y + 4.5)

  if (dispatch.employeeDocument) {
    doc.setFont("helvetica", "bold")
    doc.setFontSize(6.5)
    doc.setTextColor(...COLORS.textMuted)
    doc.text("DOC. EMPLEADO", x0 + 60, y)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    doc.setTextColor(...COLORS.text)
    doc.text(dispatch.employeeDocument, x0 + 60, y + 4.5)
  }

  y += 12
  addSeparator(doc, x0, y, contentW)
  y += 6

  const totalItems = dispatch.items.reduce((s, i) => s + i.quantity, 0)

  const colWidths = [20, 20, contentW - 20 - 20 - 16 - 12 - 20, 16, 12, 20]
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
  y += 5

  y = ensureSpace(doc, y, 10)
  doc.setFontSize(7)
  doc.setTextColor(...COLORS.text)
  const sumX = pageW - margin - 65

  doc.setFont("helvetica", "bold")
  doc.text("Total ítems:", sumX, y)
  doc.text(`${totalItems} uds.`, sumX + 63, y, { align: "right" })
  y += 10

  if (dispatch.notes) {
    const notesH = 36
    y = ensureSpace(doc, y, notesH)
    doc.setDrawColor(...COLORS.border)
    doc.setFillColor(...COLORS.bgLight)
    doc.roundedRect(x0, y, contentW, notesH, 2, 2, "FD")
    doc.setFont("helvetica", "bold")
    doc.setFontSize(6.5)
    doc.setTextColor(...COLORS.primary)
    doc.text("NOTAS", x0 + 3, y + 4.5)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(7)
    doc.setTextColor(...COLORS.text)
    const noteLines = doc.splitTextToSize(dispatch.notes, contentW - 6)
    doc.text(noteLines, x0 + 3, y + 12)
    y += notesH + 6
  }

  const footBoxW = (contentW - 8) / 2
  const footBoxH = 36
  y = ensureSpace(doc, y, footBoxH)

  doc.setDrawColor(...COLORS.border)
  doc.setFillColor(...COLORS.bgLight)
  doc.roundedRect(x0, y, footBoxW, footBoxH, 2, 2, "FD")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(6.5)
  doc.setTextColor(...COLORS.primary)
  doc.text("RECIBIDO POR", x0 + 3, y + 4.5)
  doc.setDrawColor(...COLORS.border)
  doc.line(x0 + 3, y + 25, x0 + footBoxW - 3, y + 25)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(6.5)
  doc.setTextColor(...COLORS.textMuted)
  doc.text("Nombre y Firma", x0 + footBoxW / 2, y + 30, { align: "center" })

  const obsX = x0 + footBoxW + 8
  doc.roundedRect(obsX, y, footBoxW, footBoxH, 2, 2, "FD")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(6.5)
  doc.setTextColor(...COLORS.primary)
  doc.text("ENTREGADO POR", obsX + 3, y + 4.5)
  doc.setDrawColor(...COLORS.border)
  doc.line(obsX + 3, y + 25, obsX + footBoxW - 3, y + 25)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(6.5)
  doc.setTextColor(...COLORS.textMuted)
  doc.text("Nombre y Firma", obsX + footBoxW / 2, y + 30, { align: "center" })

  addPageNumbers(doc)

  return doc
}