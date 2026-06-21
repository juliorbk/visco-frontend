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

  await addLogoPlaceholder(doc, x0, y, 40, 22)

  doc.setFontSize(22)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...COLORS.accent)
  doc.text("NOTA DE TRANSFERENCIA", pageW / 2, y + 10, { align: "center" })

  doc.setFontSize(11)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...COLORS.primary)
  doc.text(`N° ${movement.id}`, pageW / 2, y + 19, { align: "center" })

  y += 30
  addSeparator(doc, x0, y, contentW)
  y += 8

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

  for (const row of rows) {
    doc.setFont("helvetica", "bold")
    doc.setFontSize(7)
    doc.setTextColor(...COLORS.textMuted)
    doc.text(row.label, x0, y)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.setTextColor(...COLORS.text)
    doc.text(row.value, x0, y + 5)
    y += 12
  }

  addPageNumbers(doc)

  return doc
}
