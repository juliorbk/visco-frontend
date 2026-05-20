import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import type { GoodReceiptResponse } from "@/lib/types"
import {
  COLORS,
  addLogoPlaceholder,
  addSeparator,
  formatDateLong,
  formatCurrency,
} from "./pdf-utils"

export function generateReceiptPDF(receipt: GoodReceiptResponse): jsPDF {
  const doc = new jsPDF("p", "mm", "a4")
  const pageW = 210
  const margin = 20
  const x0 = margin
  let y = margin

  const po = receipt.purchaseOrder
  const supplier = po?.supplier
  const warehouse = po?.destinationWarehouse
  const warehouseAddress = warehouse?.physicalAddress ?? "—"
  const supplierAddress = supplier?.address ?? "—"

  // ── Header ──
  addLogoPlaceholder(doc, x0, y, 40, 18)

  doc.setFontSize(24)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...COLORS.accent)
  doc.text("NOTA DE ENTREGA", pageW - margin, y + 7, { align: "right" })

  doc.setFontSize(11)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...COLORS.primary)
  doc.text(`N° ${receipt.receiptNumber}`, pageW - margin, y + 15, { align: "right" })

  y += 26
  addSeparator(doc, x0, y, pageW - 2 * margin)
  y += 10

  // ── Document Info ──
  doc.setFont("helvetica", "bold")
  doc.setFontSize(7)
  doc.setTextColor(...COLORS.textMuted)

  doc.text("FECHA DE RECEPCIÓN", x0, y)
  doc.text("LUGAR", x0 + 70, y)
  doc.text("ESTADO", x0 + 140, y)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.setTextColor(...COLORS.text)
  doc.text(formatDateLong(receipt.receivedAt), x0, y + 5)
  doc.text(warehouseAddress, x0 + 70, y + 5)

  doc.setFont("helvetica", "bold")
  doc.setTextColor(...COLORS.primary)
  doc.text(
    receipt.updatedStatus === "DELIVERED" ? "COMPLETADA" : "PARCIAL",
    x0 + 140,
    y + 5,
  )

  y += 18

  // ── Supplier & Warehouse Info ──
  const boxW = (pageW - 2 * margin - 8) / 2

  // Supplier box
  doc.setDrawColor(...COLORS.border)
  doc.setFillColor(...COLORS.bgLight)
  doc.roundedRect(x0, y, boxW, 28, 2, 2, "FD")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(7)
  doc.setTextColor(...COLORS.primary)
  doc.text("PROVEEDOR", x0 + 4, y + 5)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(...COLORS.text)
  doc.text(supplier?.name ?? receipt.orderNumber, x0 + 4, y + 12)
  doc.text(supplierAddress, x0 + 4, y + 18)
  if (supplier?.email) doc.text(supplier.email, x0 + 4, y + 24)

  // Warehouse box
  const x1 = x0 + boxW + 8
  doc.roundedRect(x1, y, boxW, 28, 2, 2, "FD")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(7)
  doc.setTextColor(...COLORS.primary)
  doc.text("ALMACÉN DESTINO", x1 + 4, y + 5)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(...COLORS.text)
  doc.text(warehouse?.name ?? "—", x1 + 4, y + 12)
  doc.text(warehouseAddress, x1 + 4, y + 18)
  if (warehouse?.description) doc.text(warehouse.description, x1 + 4, y + 24)

  y += 36

  // ── Items Table ──
  const hasUnitPrices = receipt.items.some((i) => i.unitPrice != null)
  const totalReceived = receipt.items.reduce((s, i) => s + i.receivedQuantity, 0)
  const totalExpected = receipt.items.reduce((s, i) => s + i.expectedQuantity, 0)
  const grandTotal = hasUnitPrices
    ? receipt.items.reduce((s, i) => s + (i.totalPrice ?? i.receivedQuantity * (i.unitPrice ?? 0)), 0)
    : 0

  const columns = hasUnitPrices
    ? ["CANT.", "PRODUCTO", "REFERENCIA", "P/U", "TOTAL"]
    : ["CANT.", "PRODUCTO", "REFERENCIA", "C. ESP.", "DIF."]

  const bodyRows = receipt.items.map((item) => {
    if (hasUnitPrices) {
      return [
        String(item.receivedQuantity),
        item.productName,
        item.productSku,
        item.unitPrice != null ? formatCurrency(item.unitPrice) : "—",
        item.totalPrice != null
          ? formatCurrency(item.totalPrice)
          : item.unitPrice != null
            ? formatCurrency(item.receivedQuantity * item.unitPrice)
            : "—",
      ]
    }
    return [
      String(item.receivedQuantity),
      item.productName,
      item.productSku,
      String(item.expectedQuantity),
      String(item.difference),
    ]
  })

  autoTable(doc, {
    startY: y,
    head: [columns],
    body: bodyRows,
    margin: { left: margin, right: margin },
    tableWidth: pageW - 2 * margin,
    styles: {
      fontSize: 8,
      cellPadding: 1.5,
      lineColor: COLORS.border,
      lineWidth: 0.3,
      textColor: COLORS.text,
    },
    headStyles: {
      fillColor: COLORS.primary,
      textColor: COLORS.white,
      fontStyle: "bold",
      fontSize: 7,
    },
    columnStyles: {
      0: { cellWidth: 18, halign: "center" },
      1: { cellWidth: "auto" },
      2: { cellWidth: 28 },
      3: { cellWidth: 22, halign: "right" },
      4: { cellWidth: 22, halign: "right" },
    },
  })

  y = (doc as any).lastAutoTable.finalY + 6

  // ── Summary Totals ──
  if (hasUnitPrices) {
    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(...COLORS.text)
    const sumX = pageW - margin - 70

    doc.text("Total Esperado", sumX, y)
    doc.text(`${totalExpected} uds.`, sumX + 68, y, { align: "right" })
    y += 5
    doc.text("Total Recibido", sumX, y)
    doc.text(`${totalReceived} uds.`, sumX + 68, y, { align: "right" })
    y += 3

    doc.setDrawColor(...COLORS.primary)
    doc.setLineWidth(0.6)
    doc.line(sumX, y, sumX + 70, y)
    y += 5

    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.setTextColor(...COLORS.primary)
    doc.text("Total $", sumX, y)
    doc.text(formatCurrency(grandTotal), sumX + 68, y, { align: "right" })
    y += 12
  } else {
    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(...COLORS.text)
    const sumX = pageW - margin - 70
    doc.text("Total Esperado", sumX, y)
    doc.text(`${totalExpected} uds.`, sumX + 68, y, { align: "right" })
    y += 5
    doc.text("Total Recibido", sumX, y)
    doc.text(`${totalReceived} uds.`, sumX + 68, y, { align: "right" })
    y += 10
  }

  // ── Signature & Observations ──
  const footBoxW = (pageW - 2 * margin - 8) / 2

  // Signature box
  doc.setDrawColor(...COLORS.border)
  doc.setFillColor(...COLORS.bgLight)
  doc.roundedRect(x0, y, footBoxW, 40, 2, 2, "FD")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(7)
  doc.setTextColor(...COLORS.primary)
  doc.text("FIRMA DEL CLIENTE", x0 + 4, y + 5)
  doc.setDrawColor(...COLORS.border)
  doc.line(x0 + 4, y + 28, x0 + footBoxW - 4, y + 28)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(7)
  doc.setTextColor(...COLORS.textMuted)
  doc.text("Nombre y firma", x0 + footBoxW / 2, y + 34, { align: "center" })

  // Observations box
  const obsX = x0 + footBoxW + 8
  doc.roundedRect(obsX, y, footBoxW, 40, 2, 2, "FD")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(7)
  doc.setTextColor(...COLORS.primary)
  doc.text("OBSERVACIONES", obsX + 4, y + 5)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.setTextColor(...COLORS.text)
  const obsText = receipt.notes || "Sin observaciones."
  const obsLines = doc.splitTextToSize(obsText, footBoxW - 8)
  doc.text(obsLines, obsX + 4, y + 14)

  return doc
}
