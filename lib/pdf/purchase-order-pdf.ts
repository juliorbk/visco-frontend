import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
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

export function generatePurchaseOrderPDF(order: PurchaseOrderResponse): jsPDF {
  const doc = new jsPDF("p", "mm", "a4")
  const pageW = 210
  const margin = 20
  const x0 = margin
  let y = margin

  const supplier = order.supplier
  const warehouse = order.destinationWarehouse

  // ── Logo + Title + Info ──
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

  // ── Supplier / Ship To ──
  const boxW = (pageW - 2 * margin - 6) / 2

  // Supplier box
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

  // Ship To box
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

  // ── Terms Row ──
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

  // ── Items Table ──
  const subtotal = order.items.reduce((s, i) => s + i.subtotal, 0)
  const total = subtotal + (order.taxAmount ?? 0) + (order.shippingCost ?? 0) + (order.otherCost ?? 0)

  const bodyRows = order.items.map((item, i) => [
    String(i + 1),
    `${item.productName}\n${item.productSku}`,
    String(item.quantity),
    formatCurrency(item.unitPrice),
    formatCurrency(item.subtotal),
  ])

  // Empty rows to fill space
  const emptyRowsCount = Math.max(0, 5 - order.items.length)
  for (let e = 0; e < emptyRowsCount; e++) {
    bodyRows.push(["", "", "", "", ""])
  }

  autoTable(doc, {
    startY: y,
    head: [["#", "DESCRIPCIÓN", "CANT", "P/U", "TOTAL"]],
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
      halign: "center",
    },
    columnStyles: {
      0: { cellWidth: 12, halign: "center" },
      1: { cellWidth: "auto" },
      2: { cellWidth: 18, halign: "center" },
      3: { cellWidth: 28, halign: "right" },
      4: { cellWidth: 28, halign: "right" },
    },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 0) {
        data.cell.styles.halign = "center"
      }
    },
  })

  y = (doc as any).lastAutoTable.finalY + 6

  // ── Totals ──
  const totalX = pageW - margin - 70
  const totalW = 70
  const totals = [
    ["SUBTOTAL", formatCurrency(subtotal)],
  ]
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

  // ── Comments ──
  const commentsText = order.specialConditions || order.description || "—"
  addSectionTitle(doc, x0, y, pageW - 2 * margin, "Comentarios o instrucciones especiales")
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(...COLORS.text)
  const lines = doc.splitTextToSize(commentsText, pageW - 2 * margin - 16)
  doc.text(lines, x0 + 4, y + 18)

  return doc
}
