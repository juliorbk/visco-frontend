import { jsPDF } from "jspdf"
import type { GoodReceiptResponse } from "@/lib/types"
import {
  COLORS,
  addLogoPlaceholder,
  addSeparator,
  formatDateLong,
  formatCurrency,
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

export function generateReceiptPDF(receipt: GoodReceiptResponse): jsPDF {
  const doc = new jsPDF("p", "mm", "a4")
  const pageW = 210
  const margin = 20
  const contentW = pageW - 2 * margin
  const x0 = margin
  let y = margin

  const po = receipt.purchaseOrder
  const supplier = po?.supplier
  const warehouse = po?.destinationWarehouse
  const warehouseAddress = warehouse?.physicalAddress ?? "—"
  const supplierAddress = supplier?.address ?? "—"

  // ── Header ──
  addLogoPlaceholder(doc, x0, y, 40, 22)

  doc.setFontSize(22)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...COLORS.accent)
  doc.text("RECEIPT NOTE", pageW - margin, y + 10, { align: "right" })

  doc.setFontSize(11)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...COLORS.primary)
  doc.text(`N° ${receipt.receiptNumber}`, pageW - margin, y + 19, { align: "right" })

  y += 30
  addSeparator(doc, x0, y, contentW)
  y += 8

  // ── Document Info ──
  doc.setFont("helvetica", "bold")
  doc.setFontSize(7)
  doc.setTextColor(...COLORS.textMuted)
  doc.text("RECEIPT DATE", x0, y)
  doc.text("CITY", x0 + 70, y)
  doc.text("STATUS", x0 + 140, y)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(...COLORS.text)
  doc.text(formatDateLong(receipt.receivedAt), x0, y + 5)
  doc.text(warehouseAddress, x0 + 70, y + 5)

  doc.setFont("helvetica", "bold")
  doc.setTextColor(...COLORS.primary)
  doc.text(
    receipt.updatedStatus === "DELIVERED" ? "COMPLETED" : "PARCIAL",
    x0 + 140,
    y + 5,
  )

  y += 14

  // ── Supplier & Warehouse Info ──
  const boxW = (contentW - 8) / 2
  const boxH = 28

  // Supplier box
  doc.setDrawColor(...COLORS.border)
  doc.setFillColor(...COLORS.bgLight)
  doc.roundedRect(x0, y, boxW, boxH, 2, 2, "FD")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(7)
  doc.setTextColor(...COLORS.primary)
  doc.text("SUPPLIER", x0 + 4, y + 5)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(...COLORS.text)
  doc.text(supplier?.name ?? receipt.orderNumber, x0 + 4, y + 12)
  doc.text(supplierAddress, x0 + 4, y + 18)
  if (supplier?.email) doc.text(supplier.email, x0 + 4, y + 24)

  // Warehouse box
  const x1 = x0 + boxW + 8
  doc.roundedRect(x1, y, boxW, boxH, 2, 2, "FD")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(7)
  doc.setTextColor(...COLORS.primary)
  doc.text("DESTINATION WAREHOUSE", x1 + 4, y + 5)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(...COLORS.text)
  doc.text(warehouse?.name ?? "—", x1 + 4, y + 12)
  doc.text(warehouseAddress, x1 + 4, y + 18)
  if (warehouse?.description) doc.text(warehouse.description, x1 + 4, y + 24)

  y += boxH + 6

  // ── Items Table ──
  const hasUnitPrices = receipt.items.some((i) => i.unitPrice != null)
  const totalReceived = receipt.items.reduce((s, i) => s + i.receivedQuantity, 0)
  const totalExpected = receipt.items.reduce((s, i) => s + i.expectedQuantity, 0)
  const grandTotal = hasUnitPrices
    ? receipt.items.reduce((s, i) => s + (i.totalPrice ?? i.receivedQuantity * (i.unitPrice ?? 0)), 0)
    : 0

  const columns = hasUnitPrices
    ? ["QTY.", "PRODUCT", "REFERENCE", "U/P", "TOTAL"]
    : ["QTY.", "PRODUCT", "REFERENCE", "EXP. QTY", "DIF."]

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

  const colWidths = hasUnitPrices
    ? [18, contentW - 18 - 28 - 22 - 22, 28, 22, 22]
    : [18, contentW - 18 - 28 - 22 - 22, 28, 22, 22]

  y = addTable(doc, x0, y, contentW, columns, bodyRows, colWidths)
  y += 6

  // ── Summary Totals ──
  if (hasUnitPrices) {
    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(...COLORS.text)
    const sumX = pageW - margin - 70
    doc.text("Total Expected", sumX, y)
    doc.text(`${totalExpected} uds.`, sumX + 68, y, { align: "right" })
    y += 5
    doc.text("Total Received", sumX, y)
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
    doc.text("Total Expected", sumX, y)
    doc.text(`${totalExpected} uds.`, sumX + 68, y, { align: "right" })
    y += 5
    doc.text("Total Received", sumX, y)
    doc.text(`${totalReceived} uds.`, sumX + 68, y, { align: "right" })
    y += 10
  }

  // ── Signature & Observations ──
  const footBoxW = (contentW - 8) / 2

  // Signature box
  doc.setDrawColor(...COLORS.border)
  doc.setFillColor(...COLORS.bgLight)
  doc.roundedRect(x0, y, footBoxW, 40, 2, 2, "FD")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(7)
  doc.setTextColor(...COLORS.primary)
  doc.text("RECEIVED BY", x0 + 4, y + 5)
  doc.setDrawColor(...COLORS.border)
  doc.line(x0 + 4, y + 28, x0 + footBoxW - 4, y + 28)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(7)
  doc.setTextColor(...COLORS.textMuted)
  doc.text("Name & Signature", x0 + footBoxW / 2, y + 34, { align: "center" })

  // Observations box
  const obsX = x0 + footBoxW + 8
  doc.roundedRect(obsX, y, footBoxW, 40, 2, 2, "FD")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(7)
  doc.setTextColor(...COLORS.primary)
  doc.text("OBSERVATIONS", obsX + 4, y + 5)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.setTextColor(...COLORS.text)
  const obsText = receipt.notes || "Whitout observations."
  const obsLines = doc.splitTextToSize(obsText, footBoxW - 8)
  doc.text(obsLines, obsX + 4, y + 14)

  return doc
}
