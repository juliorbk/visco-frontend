import { jsPDF } from "jspdf"
import type { PurchaseOrderResponse } from "@/lib/types"
import {
  COLORS,
  addLogoPlaceholder,
  addSectionTitle,
  addSeparator,
  formatDateShort,
  formatCurrency,
  translatePaymentMethod,
  translateOrderType,
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

export function generatePurchaseOrderPDF(order: PurchaseOrderResponse): jsPDF {
  const doc = new jsPDF("p", "mm", "a4")
  const pageW = 210
  const margin = 20
  const x0 = margin
  let y = margin

  const supplier = order.supplier
  const warehouse = order.destinationWarehouse

  addLogoPlaceholder(doc, x0, y, 40, 20)

  doc.setFontSize(22)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...COLORS.primary)
  doc.text("ORDEN DE COMPRA", pageW / 2, y + 8, { align: "center" })

  const infoX = 138
  const infoLines = [
    ["FECHA:", formatDateShort(order.createdAt)],
    ["OC #:", order.orderNumber],
    ["TIPO:", translateOrderType(order.type)],
    ["PAGO:", translatePaymentMethod(order.paymentMethod)],
  ]
  doc.setFontSize(7)
  doc.setFont("helvetica", "bold")
  infoLines.forEach(([label, value], i) => {
    doc.setTextColor(...COLORS.textMuted)
    doc.text(label, infoX, y + 4 + i * 5)
    doc.setTextColor(...COLORS.text)
    doc.setFont("helvetica", "normal")
    doc.text(value, infoX + 22, y + 4 + i * 5)
    doc.setFont("helvetica", "bold")
  })

  y += 30
  addSeparator(doc, x0, y, pageW - 2 * margin)
  y += 10

  const boxW = (pageW - 2 * margin - 6) / 2

  addSectionTitle(doc, x0, y, boxW, "Proveedor")
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(...COLORS.text)
  let by = y + 16
  doc.text(supplier?.name ?? order.supplierName, x0 + 4, by)
  by += 5
  doc.text(supplier?.address ?? "—", x0 + 4, by)
  by += 5
  if (supplier?.email) { doc.text(supplier.email, x0 + 4, by); by += 5 }
  if (supplier?.phoneNumbers?.length) {
    doc.text("Tel: " + supplier.phoneNumbers.join(", "), x0 + 4, by)
    by += 5
  }

  const x1 = x0 + boxW + 6
  addSectionTitle(doc, x1, y, boxW, "Envíe a")
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(...COLORS.text)
  by = y + 16
  doc.text(warehouse?.name ?? order.destinationWarehouseName ?? "—", x1 + 4, by)
  by += 5
  doc.text(warehouse?.physicalAddress ?? "—", x1 + 4, by)
  by += 5
  if (warehouse?.description) { doc.text(warehouse.description, x1 + 4, by) }

  y += Math.max(by - y + 6, 36)
  addSeparator(doc, x0, y, pageW - 2 * margin, COLORS.border)
  y += 6

  const terms = [
    ["REQUISAR", order.createdBy],
    ["EMBARCAR VÍA", order.leadTime ? `${order.leadTime} días` : "—"],
    ["F.O.B.", "—"],
    ["COND. ENVÍO", order.paymentTerms ?? "—"],
  ]
  const colW = (pageW - 2 * margin) / 4
  terms.forEach(([title, value], i) => {
    const cx = x0 + i * colW
    doc.setFillColor(...COLORS.primary)
    doc.rect(cx, y, colW - 1, 8, "F")
    doc.setTextColor(...COLORS.white)
    doc.setFontSize(7)
    doc.setFont("helvetica", "bold")
    doc.text(title, cx + 2, y + 5.5)
    doc.setTextColor(...COLORS.text)
    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    doc.text(value, cx + 2, y + 15)
  })
  y += 24

  const subtotal = order.items.reduce((s, i) => s + i.subtotal, 0)
  const total = subtotal + (order.taxAmount ?? 0) + (order.shippingCost ?? 0) + (order.otherCost ?? 0)

  const tableW = pageW - 2 * margin
  const colWidths = [12, tableW - 12 - 18 - 28 - 28, 18, 28, 28]
  const head = ["#", "DESCRIPCIÓN", "CANT", "P/U", "TOTAL"]
  const bodyRows = order.items.map((item, i) => [
    String(i + 1),
    `${item.productName}  ${item.productSku}`,
    String(item.quantity),
    formatCurrency(item.unitPrice),
    formatCurrency(item.subtotal),
  ])
  const emptyCount = Math.max(0, 5 - order.items.length)
  for (let e = 0; e < emptyCount; e++) bodyRows.push(["", "", "", "", ""])

  y = addTable(doc, x0, y, tableW, head, bodyRows, colWidths)
  y += 6

  const totalX = pageW - margin - 70
  const totalW = 70
  const totals = [["SUBTOTAL", formatCurrency(subtotal)]]
  if (order.taxAmount != null) totals.push(["IMPUESTO", formatCurrency(order.taxAmount)])
  if (order.shippingCost != null) totals.push(["ENVÍO", formatCurrency(order.shippingCost)])
  if (order.otherCost != null) totals.push(["OTRO", formatCurrency(order.otherCost)])

  totals.forEach(([label, value], i) => {
    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(...COLORS.text)
    doc.text(label, totalX, y + i * 5)
    doc.text(value, totalX + totalW - 2, y + i * 5, { align: "right" })
  })

  const totalY = y + totals.length * 5 + 2
  doc.setDrawColor(...COLORS.primary)
  doc.setLineWidth(0.6)
  doc.line(totalX, totalY, totalX + totalW, totalY)
  doc.setFontSize(10)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...COLORS.primary)
  doc.text("TOTAL", totalX, totalY + 6)
  doc.text(formatCurrency(total), totalX + totalW - 2, totalY + 6, { align: "right" })

  y = totalY + 14

  const commentsText = order.specialConditions || order.description || "—"
  addSectionTitle(doc, x0, y, pageW - 2 * margin, "Comentarios o instrucciones especiales")
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(...COLORS.text)
  const lines = doc.splitTextToSize(commentsText, pageW - 2 * margin - 16)
  doc.text(lines, x0 + 4, y + 18)

  return doc
}
