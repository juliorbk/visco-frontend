import { jsPDF } from "jspdf"
import type { GoodReceiptResponse, PurchaseOrderReceiptSummary } from "@/lib/types"
import {
  COLORS,
  addLogoPlaceholder,
  addSeparator,
  addWrappedText,
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

export async function generateReceiptPDF(receipt: GoodReceiptResponse, summary?: PurchaseOrderReceiptSummary | null): Promise<jsPDF> {
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

  const po = receipt.purchaseOrder
  const supplier = po?.supplier
  const warehouse = po?.destinationWarehouse
  const warehouseName = warehouse?.name ?? "—"
  const warehouseAddress = warehouse?.physicalAddress ?? "—"
  const supplierName = supplier?.name ?? "—"
  const supplierAddress = supplier?.address ?? "—"

  // ── Header ──
  await addLogoPlaceholder(doc, x0, y, 40, 22)

  doc.setFontSize(22)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...COLORS.accent)
  doc.text("NOTA DE RECEPCIÓN", pageW - margin, y + 10, { align: "right" })

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
  doc.text("FECHA RECEPCIÓN", x0, y)
  doc.text("ORDEN DE COMPRA", x0 + 70, y)
  doc.text("ESTADO", x0 + 140, y)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(...COLORS.text)
  doc.text(formatDateLong(receipt.receivedAt), x0, y + 5)
  doc.text(`#${receipt.orderNumber}`, x0 + 70, y + 5)

  doc.setFont("helvetica", "bold")
  doc.setTextColor(...COLORS.primary)
  doc.text(
    receipt.updatedStatus === "DELIVERED" ? "COMPLETADA" : "PARCIAL",
    x0 + 140,
    y + 5,
  )

  y += 14

  // ── Supplier & Warehouse Info ──
  const boxW = (contentW - 8) / 2
  const boxH = 42

  // Supplier box
  doc.setDrawColor(...COLORS.border)
  doc.setFillColor(...COLORS.bgLight)
  doc.roundedRect(x0, y, boxW, boxH, 2, 2, "FD")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(7)
  doc.setTextColor(...COLORS.primary)
  doc.text("PROVEEDOR", x0 + 4, y + 5)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(...COLORS.text)
  let by = y + 13
  by += addWrappedText(doc, supplierName, x0 + 4, by, boxW - 8, 4.5, 2)
  by += 1.5
  by += addWrappedText(doc, supplierAddress, x0 + 4, by, boxW - 8, 4.5, 2)
  by += 1.5
  if (supplier?.email) {
    by += addWrappedText(doc, supplier.email, x0 + 4, by, boxW - 8, 4.5, 1)
    by += 1.5
  }
  if (supplier?.phoneNumbers?.length) {
    doc.setFontSize(8)
    doc.setTextColor(...COLORS.textLight)
    addWrappedText(doc, "Tel: " + supplier.phoneNumbers.join(", "), x0 + 4, by, boxW - 8, 4, 1)
  }

  // Warehouse box
  const x1 = x0 + boxW + 8
  doc.roundedRect(x1, y, boxW, boxH, 2, 2, "FD")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(7)
  doc.setTextColor(...COLORS.primary)
  doc.text("ALMACÉN DESTINO", x1 + 4, y + 5)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(...COLORS.text)
  by = y + 13
  by += addWrappedText(doc, warehouseName, x1 + 4, by, boxW - 8, 4.5, 2)
  by += 1.5
  by += addWrappedText(doc, warehouseAddress, x1 + 4, by, boxW - 8, 4.5, 2)
  by += 1.5
  doc.setFontSize(7.5)
  doc.setTextColor(...COLORS.textMuted)
  const sapText = warehouse?.sapCenterCode ? `SAP: ${warehouse.sapCenterCode}` : ""
  const respText = warehouse?.responsibleUserName ? `Resp: ${warehouse.responsibleUserName}` : ""
  const extraInfo = [sapText, respText].filter(Boolean).join("  |  ")
  if (extraInfo) {
    by += addWrappedText(doc, extraInfo, x1 + 4, by, boxW - 8, 4, 1)
    by += 1.5
  }
  doc.setFontSize(9)
  doc.setTextColor(...COLORS.text)
  if (warehouse?.description) {
    addWrappedText(doc, warehouse.description, x1 + 4, by, boxW - 8, 4.5, 2)
  }

  y += boxH + 6

  // ── Items Table ──
  const hasUnitPrices = receipt.items.some((i) => i.unitPrice != null)
  const totalReceived = receipt.items.reduce((s, i) => s + i.receivedQuantity, 0)
  const totalExpected = receipt.items.reduce((s, i) => s + i.expectedQuantity, 0)
  const grandTotal = hasUnitPrices
    ? receipt.items.reduce((s, i) => s + (i.totalPrice ?? i.receivedQuantity * (i.unitPrice ?? 0)), 0)
    : 0

  const summaryMap = summary
    ? new Map(summary.items.map((s) => [s.productId, s]))
    : null

  const columns = hasUnitPrices
    ? ["CANT.", "PRODUCTO", "SKU", "UBICACION", "P/U", "TOTAL"]
    : summary
      ? ["RECIBIDO", "PRODUCTO", "SKU", "UBICACION", "ORDEN TOTAL", "REC. ANTERIOR", "PENDIENTE"]
      : ["CANT.", "PRODUCTO", "SKU", "UBICACION", "ESPERADO", "DIF."]

  const bodyRows = receipt.items.map((item) => {
    const sm = summaryMap?.get(item.productId)

    if (hasUnitPrices) {
      return [
        String(item.receivedQuantity),
        item.productName,
        item.productSku,
        item.locationCode ?? "—",
        item.unitPrice != null ? formatCurrency(item.unitPrice) : "—",
        item.totalPrice != null
          ? formatCurrency(item.totalPrice)
          : item.unitPrice != null
            ? formatCurrency(item.receivedQuantity * item.unitPrice)
            : "—",
      ]
    }

    if (sm) {
      const recibidoAntes = sm.receivedQuantity - item.receivedQuantity
      return [
        String(item.receivedQuantity),
        item.productName,
        item.productSku,
        item.locationCode ?? "—",
        String(sm.orderedQuantity),
        String(Math.max(0, recibidoAntes)),
        String(sm.pendingQuantity),
      ]
    }

    return [
      String(item.receivedQuantity),
      item.productName,
      item.productSku,
      item.locationCode ?? "—",
      String(item.expectedQuantity),
      String(item.expectedQuantity - item.receivedQuantity),
    ]
  })

  const colWidths = hasUnitPrices
    ? [18, contentW - 18 - 28 - 22 - 22 - 22, 28, 22, 22, 22]
    : summary
      ? [18, contentW - 18 - 28 - 22 - 22 - 22 - 22, 22, 22, 22, 22, 22]
      : [18, contentW - 18 - 28 - 22 - 22 - 22, 28, 22, 22, 22]

  y = addTable(doc, x0, y, contentW, columns, bodyRows, colWidths)
  y += 6

  // ── Summary Totals ──
  if (hasUnitPrices) {
    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(...COLORS.text)
    const sumX = pageW - margin - 70
    doc.text("Total esperado", sumX, y)
    doc.text(`${totalExpected} uds.`, sumX + 68, y, { align: "right" })
    y += 5
    doc.text("Total recibido", sumX, y)
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
  } else if (summary) {
    const sumTotalOrdered = summary.items.reduce((s, i) => s + i.orderedQuantity, 0)
    const sumTotalReceived = summary.items.reduce((s, i) => s + i.receivedQuantity, 0)
    const sumTotalPending = summary.items.reduce((s, i) => s + i.pendingQuantity, 0)
    const sumX = pageW - margin - 70
    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(...COLORS.text)
    doc.text("Total ordenado", sumX, y)
    doc.text(`${sumTotalOrdered} uds.`, sumX + 68, y, { align: "right" })
    y += 5
    doc.text("Total recibido", sumX, y)
    doc.text(`${sumTotalReceived} uds.`, sumX + 68, y, { align: "right" })
    y += 5
    doc.text("Pendiente", sumX, y)
    doc.text(`${sumTotalPending} uds.`, sumX + 68, y, { align: "right" })
    y += 10
  } else {
    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(...COLORS.text)
    const sumX = pageW - margin - 70
    doc.text("Total esperado", sumX, y)
    doc.text(`${totalExpected} uds.`, sumX + 68, y, { align: "right" })
    y += 5
    doc.text("Total recibido", sumX, y)
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
  doc.text("RECIBIDO POR", x0 + 4, y + 5)
  doc.setDrawColor(...COLORS.border)
  doc.line(x0 + 4, y + 28, x0 + footBoxW - 4, y + 28)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(7)
  doc.setTextColor(...COLORS.textMuted)
  doc.text("Nombre y firma", x0 + footBoxW / 2, y + 34, { align: "center" })

  // Observations box
  const obsX = x0 + footBoxW + 8
  const obsBoxH = 40
  doc.roundedRect(obsX, y, footBoxW, obsBoxH, 2, 2, "FD")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(7)
  doc.setTextColor(...COLORS.primary)
  doc.text("OBSERVACIONES", obsX + 4, y + 5)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.setTextColor(...COLORS.text)
  const obsText = receipt.notes || "Sin observaciones."
  const maxObsLines = Math.floor((obsBoxH - 14) / 4)
  addWrappedText(doc, obsText, obsX + 4, y + 13, footBoxW - 8, 4, maxObsLines)

  return doc
}
