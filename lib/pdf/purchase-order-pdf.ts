import { jsPDF } from "jspdf"
import type { PurchaseOrderResponse } from "@/lib/types"
import { TAX_RATE, applyTax } from "@/lib/constants"
import {
  COLORS,
  addLogoPlaceholder,
  addSectionTitle,
  addSeparator,
  addTable,
  addWrappedText,
  addPageNumbers,
  ensureSpace,
  formatDateShort,
  formatCurrency,
  translatePaymentMethod,
  translateOrderType,
  translateOrderStatus,
  statusColor,
} from "./pdf-utils"

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

  await addLogoPlaceholder(doc, x0, y, 36, 20)

  doc.setFontSize(15)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...COLORS.primary)
  doc.text("ORDEN DE COMPRA", pageW / 2, y + 8, { align: "center" })

  const statusLabel = translateOrderStatus(order.status).toUpperCase()
  const statusRgb = statusColor(order.status)
  doc.setFontSize(7)
  doc.setFont("helvetica", "bold")
  const statusW = doc.getTextWidth(statusLabel) + 5
  const statusX = pageW / 2 - statusW / 2
  const statusY = y + 13
  doc.setFillColor(...statusRgb)
  doc.roundedRect(statusX, statusY, statusW, 5, 1.5, 1.5, "F")
  doc.setTextColor(...COLORS.white)
  doc.text(statusLabel, pageW / 2, statusY + 3.5, { align: "center" })

  const infoX = 132
  const infoLines: [string, string][] = [
    ["FECHA:", formatDateShort(order.createdAt)],
    ["OC #:", order.orderNumber],
    ["TIPO:", translateOrderType(order.type)],
    ["PAGO:", translatePaymentMethod(order.paymentMethod)],
  ]
  if (order.requisitionNumber) {
    infoLines.push(["REQ:", order.requisitionNumber])
  } else if (order.requisitionId != null) {
    infoLines.push(["REQ. ID:", `#${order.requisitionId}`])
  }

  const infoBoxW = pageW - margin - infoX
  const infoBoxH = 8 + infoLines.length * 4.5 + 3
  doc.setDrawColor(...COLORS.border)
  doc.setFillColor(...COLORS.bgLight)
  doc.roundedRect(infoX - 2, y + 20, infoBoxW + 2, infoBoxH, 2, 2, "FD")
  doc.setFontSize(6.5)
  doc.setFont("helvetica", "bold")
  infoLines.forEach(([label, value], i) => {
    doc.setTextColor(...COLORS.textMuted)
    doc.text(label, infoX, y + 25 + i * 4.5)
    doc.setTextColor(...COLORS.text)
    doc.setFont("helvetica", "normal")
    doc.text(value, infoX + 22, y + 25 + i * 4.5)
    doc.setFont("helvetica", "bold")
  })

  const infoBoxTopPad = 20
  y += infoBoxTopPad + infoBoxH + 4
  addSeparator(doc, x0, y, contentW)
  y += 6

  const boxW = (contentW - 6) / 2
  const HEADER_H = 7
  const PAD = 3

  const supplierLines: string[] = []
  supplierLines.push(supplier?.name ?? order.supplierName)
  if (order.supplierRif) supplierLines.push(`RIF: ${order.supplierRif}`)
  if (supplier?.address) supplierLines.push(supplier.address)
  if (supplier?.email) supplierLines.push(supplier.email)
  if (supplier?.phoneNumbers?.length) supplierLines.push("Tel: " + supplier.phoneNumbers.join(", "))

  let supplierH = HEADER_H + 4
  for (const line of supplierLines) {
    const wrapped = doc.splitTextToSize(line, boxW - PAD * 2)
    supplierH += wrapped.length * 4 + 1
  }
  supplierH = Math.max(supplierH, 36) + 2

  doc.setDrawColor(...COLORS.border)
  doc.setFillColor(...COLORS.bgLight)
  doc.roundedRect(x0, y, boxW, supplierH, 2, 2, "FD")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(7)
  doc.setTextColor(...COLORS.primary)
  doc.text("PROVEEDOR", x0 + PAD, y + HEADER_H - 1.5)
  doc.setDrawColor(...COLORS.primary)
  doc.setLineWidth(0.3)
  doc.line(x0 + PAD, y + HEADER_H + 0.5, x0 + boxW - PAD, y + HEADER_H + 0.5)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.setTextColor(...COLORS.text)
  let by = y + HEADER_H + 5
  for (const line of supplierLines) {
    by += addWrappedText(doc, line, x0 + PAD, by, boxW - PAD * 2, 4)
    by += 1.5
  }

  const x1 = x0 + boxW + 6
  const shipLines: { kind: "name" | "text" | "label" | "value"; text: string; value?: string }[] = []
  shipLines.push({ kind: "name", text: warehouseName })
  if (warehouseAddress && warehouseAddress !== "—") {
    shipLines.push({ kind: "text", text: warehouseAddress })
  }
  if (warehouse?.responsibleUserName || warehouse?.responsibleUserEmail) {
    shipLines.push({ kind: "label", text: "CONTACTO" })
    if (warehouse?.responsibleUserName) {
      shipLines.push({ kind: "text", text: warehouse.responsibleUserName })
    }
    if (warehouse?.responsibleUserEmail) {
      shipLines.push({ kind: "text", text: warehouse.responsibleUserEmail })
    }
  }
  if (warehouse?.sapCenterCode) {
    shipLines.push({ kind: "label", text: "SAP" })
    shipLines.push({ kind: "value", text: "", value: String(warehouse.sapCenterCode) })
  }
  if (warehouse?.description) {
    shipLines.push({ kind: "label", text: "NOTAS" })
    shipLines.push({ kind: "text", text: warehouse.description })
  }

  let shipH = HEADER_H + 4
  for (const ln of shipLines) {
    if (ln.kind === "label") {
      shipH += 3.5
    } else if (ln.kind === "value") {
      shipH += 3.5
    } else {
      const wrapped = doc.splitTextToSize(ln.text, boxW - PAD * 2)
      const lineH = ln.kind === "name" ? 4.5 : 3.5
      shipH += wrapped.length * lineH + 1
    }
  }
  shipH = Math.max(shipH, 36) + 2

  doc.setFillColor(...COLORS.primary)
  doc.setDrawColor(...COLORS.primary)
  doc.roundedRect(x1, y, boxW, shipH, 2, 2, "FD")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(7)
  doc.setTextColor(...COLORS.white)
  doc.text("ENVIAR A", x1 + PAD, y + HEADER_H - 1.5)
  doc.setDrawColor(...COLORS.white)
  doc.setLineWidth(0.3)
  doc.line(x1 + PAD, y + HEADER_H + 0.5, x1 + boxW - PAD, y + HEADER_H + 0.5)

  by = y + HEADER_H + 5
  for (const ln of shipLines) {
    if (ln.kind === "label") {
      doc.setFont("helvetica", "bold")
      doc.setFontSize(6.5)
      doc.setTextColor(...COLORS.white)
      doc.text(ln.text, x1 + PAD, by)
      by += 3.5
    } else if (ln.kind === "value") {
      doc.setFont("helvetica", "normal")
      doc.setFontSize(7)
      doc.setTextColor(...COLORS.white)
      doc.text(ln.value ?? "", x1 + PAD, by)
      by += 4
    } else {
      doc.setFont("helvetica", ln.kind === "name" ? "bold" : "normal")
      doc.setFontSize(ln.kind === "name" ? 8 : 7)
      doc.setTextColor(...COLORS.white)
      by += addWrappedText(doc, ln.text, x1 + PAD, by, boxW - PAD * 2,
        ln.kind === "name" ? 4.5 : 3.5)
      by += 1
    }
  }

  y += Math.max(supplierH, shipH) + 5

  const terms = [
    ["COMPRADOR", order.createdBy],
    ["TIEMPO ENTREGA", order.leadTime ? `${order.leadTime} días` : "—"],
    ["F.O.B.", "—"],
    ["COND. ENVIO", order.shipConditions ?? "—"],
  ]
  const colW = contentW / 4
  const termCellPad = 2
  const termValueLineH = 3.5
  let maxTermLines = 1
  const termWrapped: string[][] = terms.map(([, value]) =>
    doc.splitTextToSize(value, colW - termCellPad * 2),
  )
  termWrapped.forEach((lines) => {
    if (lines.length > maxTermLines) maxTermLines = lines.length
  })
  const termBoxH = 7
  const termValueH = maxTermLines * termValueLineH
  const termRowH = termBoxH + termValueH + 3

  terms.forEach(([title, value], i) => {
    const cx = x0 + i * colW
    doc.setFillColor(...COLORS.primary)
    doc.rect(cx, y, colW - 0.5, termBoxH, "F")
    doc.setTextColor(...COLORS.white)
    doc.setFontSize(6.5)
    doc.setFont("helvetica", "bold")
    doc.text(title, cx + termCellPad, y + 4.8)
    doc.setFillColor(...COLORS.bgLight)
    doc.rect(cx, y + termBoxH, colW - 0.5, termValueH + 3, "F")
    doc.setTextColor(...COLORS.text)
    doc.setFontSize(7)
    doc.setFont("helvetica", "normal")
    const valueY = y + termBoxH + 2.5
    doc.text(termWrapped[i], cx + termCellPad, valueY)
  })
  y += termRowH + 3

  const subtotal = order.subtotal ?? order.items.reduce((s, i) => s + i.subtotal, 0)
  const { taxAmount, total: taxBaseTotal } = applyTax(subtotal)
  const taxAmountFinal = order.taxAmount ?? taxAmount
  const total = taxBaseTotal + (order.shippingCost ?? 0) + (order.otherCost ?? 0)

  const colWidths = [7, 18, 18, contentW - 7 - 18 - 18 - 14 - 10 - 18 - 22, 14, 10, 18, 22]
  const head = ["#", "C.INT", "C.SAP", "DESCRIPCIÓN", "CANT.", "UM", "P/UNIT", "TOTAL"]
  const bodyRows = order.items.map((item, i) => [
    String(i + 1),
    item.productInternalCode ?? "—",
    item.productSapCode ?? "—",
    `${item.productName}  ${item.productSku}`,
    String(item.quantity),
    item.uom ?? "—",
    formatCurrency(item.unitPrice),
    formatCurrency(item.subtotal),
  ])

  y = addTable(doc, x0, y, contentW, head, bodyRows, {
    colWidths,
    continuationLabel: `Items de la Orden (${order.items.length})`,
  })
  y += 3

  const totalX = pageW - margin - 70
  const totalW = 70
  const taxPctLabel = `IVA (${Math.round(TAX_RATE * 100)}%)`
  const totals = [
    ["SUBTOTAL", formatCurrency(subtotal)],
    [taxPctLabel, formatCurrency(taxAmountFinal)],
  ]
  if (order.shippingCost != null) totals.push(["ENVIO", formatCurrency(order.shippingCost)])
  if (order.otherCost != null) totals.push(["OTROS", formatCurrency(order.otherCost)])
  const totalsBlockH = totals.length * 4.5 + 2 + 4 + 4

  y = ensureSpace(doc, y, totalsBlockH + 3)

  doc.setDrawColor(...COLORS.border)
  doc.setFillColor(...COLORS.bgLight)
  doc.roundedRect(totalX - 4, y - 1, totalW + 8, totalsBlockH, 2, 2, "FD")

  totals.forEach(([label, value], i) => {
    doc.setFontSize(7)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(...COLORS.text)
    doc.text(label, totalX, y + i * 4.5)
    doc.text(value, totalX + totalW, y + i * 4.5, { align: "right" })
  })

  const totalY = y + totals.length * 4.5 + 2
  doc.setDrawColor(...COLORS.primary)
  doc.setLineWidth(0.5)
  doc.line(totalX, totalY, totalX + totalW, totalY)
  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...COLORS.primary)
  doc.text("TOTAL", totalX, totalY + 4)
  doc.text(formatCurrency(total), totalX + totalW, totalY + 4, { align: "right" })

  y = totalY + 9

  if (order.approvedBy || order.approvalNotes || order.rejectionReason) {
    const isRejected = !!order.rejectionReason
    const sectionLabel = isRejected ? "Info de Rechazo" : "Info de Aprobación"
    addSectionTitle(doc, x0, y, contentW, sectionLabel)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(7)
    doc.setTextColor(...COLORS.text)
    let ay = y + 13
    if (order.approvedBy) {
      doc.setFont("helvetica", "bold")
      doc.setTextColor(...COLORS.textMuted)
      doc.text("Aprobado por:", x0 + 3, ay)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(...COLORS.text)
      doc.text(order.approvedBy, x0 + 30, ay)
      ay += 4
    }
    if (order.approvedAt) {
      doc.setFont("helvetica", "bold")
      doc.setTextColor(...COLORS.textMuted)
      doc.text("Fecha:", x0 + 3, ay)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(...COLORS.text)
      doc.text(formatDateShort(order.approvedAt), x0 + 30, ay)
      ay += 4
    }
    const noteText = order.rejectionReason || order.approvalNotes
    if (noteText) {
      doc.setFont("helvetica", "bold")
      doc.setTextColor(...COLORS.textMuted)
      doc.text("Notas:", x0 + 3, ay)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(...COLORS.text)
      const wrapped = doc.splitTextToSize(noteText, contentW - 35)
      doc.text(wrapped, x0 + 30, ay)
      ay += 4 * wrapped.length
    }
    y = ay + 5
  }

  const commentsText = order.specialConditions || order.description || "—"
  const commentsLines = doc.splitTextToSize(commentsText, contentW - 8)
  const commentsBlockH = 10 + commentsLines.length * 4 + 3
  y = ensureSpace(doc, y, commentsBlockH + 3)
  addSectionTitle(doc, x0, y, contentW, "Comentarios o Instrucciones Especiales")
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.setTextColor(...COLORS.text)
  doc.text(commentsLines, x0 + 4, y + 13)

  addPageNumbers(doc)

  return doc
}