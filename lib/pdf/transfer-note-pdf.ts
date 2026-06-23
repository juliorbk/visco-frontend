import { jsPDF } from "jspdf"
import type { InventoryMovementResponse } from "@/lib/types"
import {
  COLORS,
  addLogoPlaceholder,
  addSeparator,
  addPageNumbers,
  formatDateLong,
} from "./pdf-utils"

export async function generateTransferNotePDF(
  movement: InventoryMovementResponse,
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
  doc.text("NOTA DE TRANSFERENCIA", pageW / 2, y + 8, { align: "center" })

  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...COLORS.primary)
  doc.text(`N° ${movement.id}`, pageW / 2, y + 15, { align: "center" })

  y += 26
  addSeparator(doc, x0, y, contentW)
  y += 6

  const rows: { label: string; value: string }[] = [
    { label: "FECHA", value: formatDateLong(movement.createdAt) },
    { label: "ORIGEN", value: movement.fromWarehouseName ?? "—" },
    { label: "DESTINO", value: movement.toWarehouseName ?? "—" },
    { label: "PRODUCTO", value: movement.productName },
    { label: "SKU", value: movement.productSku },
    { label: "CANTIDAD", value: `${movement.quantity} uds.` },
    { label: "REALIZADO POR", value: movement.createdByName },
  ]

  if (movement.reason) {
    rows.push({ label: "MOTIVO", value: movement.reason })
  }

  const rowH = 7
  const infoBoxH = rows.length * rowH + 4
  doc.setDrawColor(...COLORS.border)
  doc.setFillColor(...COLORS.bgLight)
  doc.roundedRect(x0, y, contentW, infoBoxH, 2, 2, "FD")

  for (const [i, row] of rows.entries()) {
    const ry = y + 2 + i * rowH
    if (i % 2 === 0) {
      doc.setFillColor(241, 243, 246)
      doc.rect(x0 + 0.5, ry, contentW - 1, rowH, "F")
    }
    doc.setFont("helvetica", "bold")
    doc.setFontSize(6.5)
    doc.setTextColor(...COLORS.textMuted)
    doc.text(row.label, x0 + 5, ry + rowH * 0.68)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    doc.setTextColor(...COLORS.text)
    doc.text(row.value, x0 + 65, ry + rowH * 0.68)
    if (i < rows.length - 1) {
      doc.setDrawColor(...COLORS.border)
      doc.setLineWidth(0.2)
      doc.line(x0 + 1, ry + rowH, x0 + contentW - 1, ry + rowH)
    }
  }

  y += infoBoxH + 8

  addPageNumbers(doc)

  return doc
}