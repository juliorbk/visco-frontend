import { jsPDF } from "jspdf"
import type { GoodReceiptResponse, PurchaseOrderReceiptSummary } from "@/lib/types"
import {
  COLORS,
  addLogoPlaceholder,
  addSeparator,
  addTable,
  addWrappedText,
  addPageNumbers,
  ensureSpace,
  formatDateLong,
  formatCurrency,
} from "./pdf-utils"

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

  const boxW = (contentW - 8) / 2
  const boxH = 42

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
    ? ["C.INT", "C.SAP", "PRODUCTO", "SKU", "UM", "CANT.", "UBICACION", "P/U", "TOTAL"]
    : summary
      ? ["C.INT", "C.SAP", "RECIBIDO", "PRODUCTO", "SKU", "UM", "UBICACION", "ORDEN TOTAL", "REC. ANTERIOR", "PENDIENTE"]
      : ["C.INT", "C.SAP", "PRODUCTO", "SKU", "UM", "CANT.", "UBICACION", "ESPERADO", "DIF."]

  const bodyRows = receipt.items.map((item) => {
    const sm = summaryMap?.get(item.productId)
    const codeInt = item.productInternalCode ?? "—"
    const codeSap = item.productSapCode ?? "—"

    if (hasUnitPrices) {
      return [
        codeInt,
        codeSap,
        item.productName,
        item.productSku,
        item.uom ?? "—",
        String(item.receivedQuantity),
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
        codeInt,
        codeSap,
        String(item.receivedQuantity),
        item.productName,
        item.productSku,
        sm.uom ?? "—",
        item.locationCode ?? "—",
        String(sm.orderedQuantity),
        String(Math.max(0, recibidoAntes)),
        String(sm.pendingQuantity),
      ]
    }

    return [
      codeInt,
      codeSap,
      item.productName,
      item.productSku,
      item.uom ?? "—",
      String(item.receivedQuantity),
      item.locationCode ?? "—",
      String(item.expectedQuantity),
      String(item.expectedQuantity - item.receivedQuantity),
    ]
  })

  const colWidths = hasUnitPrices
    ? [20, 22, contentW - 20 - 22 - 18 - 12 - 14 - 18 - 18 - 18, 18, 12, 14, 18, 18, 18]
    : summary
      ? [18, 20, 12, contentW - 18 - 20 - 12 - 18 - 10 - 16 - 18 - 18 - 18, 18, 10, 16, 18, 18, 18]
      : [20, 22, contentW - 20 - 22 - 18 - 12 - 14 - 18 - 18 - 18, 18, 12, 14, 18, 18, 18]

  y = addTable(doc, x0, y, contentW, columns, bodyRows, {
    colWidths,
    continuationLabel: `Items Recibidos (${receipt.items.length})`,
  })
  y += 6

  const footBoxH = 40
  let totalsH = 0
  if (hasUnitPrices) {
    totalsH = 5 + 5 + 3 + 6 + 12
  } else if (summary) {
    totalsH = 5 + 5 + 5 + 10
  } else {
    totalsH = 5 + 5 + 10
  }
  y = ensureSpace(doc, y, totalsH + footBoxH + 6)

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

  const footBoxW = (contentW - 8) / 2

  doc.setDrawColor(...COLORS.border)
  doc.setFillColor(...COLORS.bgLight)
  doc.roundedRect(x0, y, footBoxW, footBoxH, 2, 2, "FD")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(7)
  doc.setTextColor(...COLORS.primary)
  doc.text("RECIBIDO POR", x0 + 4, y + 5)
  if (receipt.receivedBy) {
    doc.setFont("helvetica", "bold")
    doc.setFontSize(9)
    doc.setTextColor(...COLORS.text)
    doc.text(receipt.receivedBy, x0 + 4, y + 13)
  }
  doc.setDrawColor(...COLORS.border)
  doc.line(x0 + 4, y + 28, x0 + footBoxW - 4, y + 28)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(7)
  doc.setTextColor(...COLORS.textMuted)
  doc.text("Nombre y firma", x0 + footBoxW / 2, y + 34, { align: "center" })

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

  addPageNumbers(doc)

  return doc
}
