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
  translateOrderStatus,
  statusColor,
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
  const cellPadding = 2
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
    doc.text(h, cx + cellPadding, y + headH / 2 + 2)
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
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    doc.setTextColor(...text)

    let maxLines = 1
    let rx = x
    const cellTexts: string[][] = []

    row.forEach((cell, ci) => {
      const lines = doc.splitTextToSize(cell, colWidths[ci] - cellPadding * 2)
      cellTexts.push(lines)
      if (lines.length > maxLines) maxLines = lines.length
    })

    const rowHeight = Math.max(rowH, maxLines * 4.5 + cellPadding * 2)

    if (ri % 2 === 1) {
      doc.setFillColor(249, 250, 251)
      doc.rect(x, cy, w, rowHeight, "F")
    }

    rx = x
    row.forEach((_, ci) => {
      const lines = cellTexts[ci]
      const textY = cy + (rowHeight - lines.length * 4.5) / 2 + 3.5
      lines.forEach((line, li) => {
        doc.text(line, rx + cellPadding, textY + li * 4.5)
      })
      rx += colWidths[ci]
      if (ci < row.length - 1) {
        doc.line(rx, cy, rx, cy + rowHeight)
      }
    })

    cy += rowHeight
    doc.line(x, cy, x + w, cy)
  })

  return cy
}

export async function generatePurchaseOrderPDF(order: PurchaseOrderResponse): Promise<jsPDF> {
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

  const supplier = order.supplier
  const warehouse = order.destinationWarehouse
  const warehouseName = warehouse?.name ?? order.destinationWarehouseName ?? "—"
  const warehouseAddress = warehouse?.physicalAddress ?? "—"

  // ── Logo + Title + Info ──
  await addLogoPlaceholder(doc, x0, y, 40, 20)

  doc.setFontSize(20)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...COLORS.primary)
  doc.text("PURCHASE ORDER", pageW / 2, y + 8, { align: "center" })

  // Status badge under title
  const statusLabel = translateOrderStatus(order.status).toUpperCase()
  const statusRgb = statusColor(order.status)
  doc.setFontSize(8)
  doc.setFont("helvetica", "bold")
  const statusW = doc.getTextWidth(statusLabel) + 6
  const statusX = pageW / 2 - statusW / 2
  const statusY = y + 12
  doc.setFillColor(...statusRgb)
  doc.roundedRect(statusX, statusY, statusW, 5.5, 1.5, 1.5, "F")
  doc.setTextColor(...COLORS.white)
  doc.text(statusLabel, pageW / 2, statusY + 3.8, { align: "center" })

  const infoX = 135
  const infoLines: [string, string][] = [
    ["DATE:", formatDateShort(order.createdAt)],
    ["PO #:", order.orderNumber],
    ["TYPE:", translateOrderType(order.type)],
    ["PAYMENT:", translatePaymentMethod(order.paymentMethod)],
  ]
  if (order.requisitionId != null) {
    infoLines.push(["REQ. ID:", `#${order.requisitionId}`])
  }
  doc.setFontSize(7)
  doc.setFont("helvetica", "bold")
  infoLines.forEach(([label, value], i) => {
    doc.setTextColor(...COLORS.textMuted)
    doc.text(label, infoX, y + 14 + i * 5)
    doc.setTextColor(...COLORS.text)
    doc.setFont("helvetica", "normal")
    doc.text(value, infoX + 25, y + 14 + i * 5)
    doc.setFont("helvetica", "bold")
  })

  y += 36 + (infoLines.length > 4 ? 5 : 0)
  addSeparator(doc, x0, y, contentW)
  y += 8

  // ── Supplier / Ship To boxes ──
  const boxW = (contentW - 6) / 2
  const boxH = 38

  // Supplier box
  doc.setDrawColor(...COLORS.border)
  doc.setFillColor(...COLORS.bgLight)
  doc.roundedRect(x0, y, boxW, boxH, 2, 2, "FD")
  addSectionTitle(doc, x0, y, boxW, "SUPPLIER")
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(...COLORS.text)
  let by = y + 14
  doc.text(supplier?.name ?? order.supplierName, x0 + 4, by)
  by += 5
  doc.text(supplier?.address ?? "—", x0 + 4, by)
  by += 5
  if (supplier?.email) { doc.text(supplier.email, x0 + 4, by); by += 5 }
  if (supplier?.phoneNumbers?.length) {
    doc.text("Tel: " + supplier.phoneNumbers.join(", "), x0 + 4, by)
  }

  // Ship To box
  const x1 = x0 + boxW + 6
  doc.roundedRect(x1, y, boxW, boxH, 2, 2, "FD")
  addSectionTitle(doc, x1, y, boxW, "SHIP TO")
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(...COLORS.text)
  by = y + 14
  doc.text(warehouseName, x1 + 4, by)
  by += 5
  doc.text(warehouseAddress, x1 + 4, by)
  by += 5
  doc.setFontSize(7.5)
  doc.setTextColor(...COLORS.textMuted)
  const sapText = warehouse?.sapCenterCode ? `SAP: ${warehouse.sapCenterCode}` : ""
  const respText = warehouse?.responsibleUserName ? `Resp: ${warehouse.responsibleUserName}` : ""
  const extraInfo = [sapText, respText].filter(Boolean).join("  |  ")
  if (extraInfo) doc.text(extraInfo, x1 + 4, by)
  by += 5
  doc.setFontSize(9)
  doc.setTextColor(...COLORS.text)
  if (warehouse?.description) { doc.text(warehouse.description, x1 + 4, by) }

  y += boxH + 6

  // ─ Terms Row ──
  const terms = [
    ["PURCHASER", order.createdBy],
    ["LEAD TIME", order.leadTime ? `${order.leadTime} days` : "—"],
    ["F.O.B.", "—"],
    ["SHIP CONDITIONS", order.paymentTerms ?? "—"],
  ]
  const colW = contentW / 4
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
  y += 22

  // ── Items Table ──
  const subtotal = order.subtotal ?? order.items.reduce((s, i) => s + i.subtotal, 0)
  const total = subtotal + (order.taxAmount ?? 0) + (order.shippingCost ?? 0) + (order.otherCost ?? 0)

  const colWidths = [12, contentW - 12 - 18 - 28 - 28, 18, 28, 28]
  const head = ["#", "DESCRIPTION", "QTY", "UNIT PRICE", "TOTAL"]
  const bodyRows = order.items.map((item, i) => [
    String(i + 1),
    `${item.productName}  ${item.productSku}`,
    String(item.quantity),
    formatCurrency(item.unitPrice),
    formatCurrency(item.subtotal),
  ])
  const emptyCount = Math.max(0, 5 - order.items.length)
  for (let e = 0; e < emptyCount; e++) bodyRows.push(["", "", "", "", ""])

  y = addTable(doc, x0, y, contentW, head, bodyRows, colWidths)
  y += 6

  // ── Totals ──
  const totalX = pageW - margin - 70
  const totalW = 70
  const totals = [["SUBTOTAL", formatCurrency(subtotal)]]
  if (order.taxAmount != null) totals.push(["TAX", formatCurrency(order.taxAmount)])
  if (order.shippingCost != null) totals.push(["SHIPPING", formatCurrency(order.shippingCost)])
  if (order.otherCost != null) totals.push(["OTHER", formatCurrency(order.otherCost)])

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

  // ── Approval / Rejection info ──
  if (order.approvedBy || order.approvalNotes || order.rejectionReason) {
    const isRejected = !!order.rejectionReason
    const sectionLabel = isRejected ? "Rejection Info" : "Approval Info"
    addSectionTitle(doc, x0, y, contentW, sectionLabel)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    doc.setTextColor(...COLORS.text)
    let ay = y + 16
    if (order.approvedBy) {
      doc.setFont("helvetica", "bold")
      doc.setTextColor(...COLORS.textMuted)
      doc.text("Aprobado por:", x0 + 4, ay)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(...COLORS.text)
      doc.text(order.approvedBy, x0 + 35, ay)
      ay += 5
    }
    if (order.approvedAt) {
      doc.setFont("helvetica", "bold")
      doc.setTextColor(...COLORS.textMuted)
      doc.text("Fecha:", x0 + 4, ay)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(...COLORS.text)
      doc.text(formatDateShort(order.approvedAt), x0 + 35, ay)
      ay += 5
    }
    const noteText = order.rejectionReason || order.approvalNotes
    if (noteText) {
      doc.setFont("helvetica", "bold")
      doc.setTextColor(...COLORS.textMuted)
      doc.text("Notas:", x0 + 4, ay)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(...COLORS.text)
      const wrapped = doc.splitTextToSize(noteText, contentW - 40)
      doc.text(wrapped, x0 + 35, ay)
      ay += 5 * wrapped.length
    }
    y = ay + 6
  }

  // ── Comments ──
  const commentsText = order.specialConditions || order.description || "—"
  addSectionTitle(doc, x0, y, contentW, "Comments or Special Instructions")
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(...COLORS.text)
  const lines = doc.splitTextToSize(commentsText, contentW - 8)
  doc.text(lines, x0 + 4, y + 16)

  return doc
}
