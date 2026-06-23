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

  const rowH = 5.5
  const infoBoxH = 7 + rows.length * rowH + 4
  doc.setDrawColor(...COLORS.border)
  doc.setFillColor(...COLORS.bgLight)
  doc.roundedRect(x0, y, contentW, infoBoxH, 2, 2, "FD")

  for (const [i, row] of rows.entries()) {
    const ry = y + 5 + i * rowH
    doc.setFont("helvetica", "bold")
    doc.setFontSize(6.5)
    doc.setTextColor(...COLORS.textMuted)
    doc.text(row.label, x0 + 4, ry)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    doc.setTextColor(...COLORS.text)
    doc.text(row.value, x0 + 4 + 60, ry)
  }

  y += infoBoxH + 8

  addPageNumbers(doc)

  return doc
}
