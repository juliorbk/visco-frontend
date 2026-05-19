import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer"
import type { GoodReceiptResponse } from "@/lib/types"
import { COLORS, PDFLogo, Separator, formatDateLong, formatCurrency } from "./pdf-utils"

const styles = StyleSheet.create({
  page: {
    padding: 45,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: COLORS.text,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerRight: {
    alignItems: "flex-end",
  },
  title: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    color: COLORS.accent,
    textTransform: "uppercase",
  },
  docNumber: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: COLORS.primary,
    marginTop: 4,
  },

  // Document info row
  docInfoRow: {
    flexDirection: "row",
    gap: 20,
  },
  docInfoCol: {
    flex: 1,
  },
  label: {
    fontSize: 7,
    color: COLORS.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 10,
    color: COLORS.text,
  },

  // Party boxes
  partyRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 4,
  },
  partyBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 3,
    padding: 10,
  },
  partyTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: COLORS.primary,
    textTransform: "uppercase",
    marginBottom: 6,
    letterSpacing: 1,
  },
  partyValue: {
    fontSize: 9,
    color: COLORS.text,
    marginBottom: 2,
    lineHeight: 1.4,
  },

  // Table
  table: {
    width: "100%",
    marginTop: 8,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  th: {
    color: "#FFFFFF",
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  thQty: { width: "12%" },
  thProduct: { width: "34%" },
  thSku: { width: "18%" },
  thPrice: { width: "18%", textAlign: "right" },
  thTotal: { width: "18%", textAlign: "right" },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.tableBorder,
  },
  tableRowEven: {
    backgroundColor: "#F9FAFB",
  },
  td: {
    fontSize: 8,
    color: COLORS.text,
  },
  tdQty: { width: "12%" },
  tdProduct: { width: "34%" },
  tdSku: { width: "18%", fontFamily: "Helvetica-Oblique", color: COLORS.textLight },
  tdPrice: { width: "18%", textAlign: "right" },
  tdTotal: { width: "18%", textAlign: "right" },

  // Totals
  totalsSection: {
    marginTop: 8,
    alignItems: "flex-end",
  },
  totalRow: {
    flexDirection: "row",
    paddingVertical: 2,
    paddingHorizontal: 8,
    width: "40%",
  },
  totalLabel: {
    flex: 1,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: COLORS.text,
    textTransform: "uppercase",
  },
  totalValue: {
    fontSize: 8,
    color: COLORS.text,
    textAlign: "right",
  },
  finalTotal: {
    borderTopWidth: 2,
    borderTopColor: COLORS.primary,
    marginTop: 4,
    paddingTop: 4,
  },
  finalTotalLabel: {
    color: COLORS.primary,
    fontSize: 10,
  },
  finalTotalValue: {
    color: COLORS.primary,
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
  },

  // Status badge inline
  statusBadge: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: COLORS.primary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Signature & observations
  footerSection: {
    flexDirection: "row",
    gap: 16,
    marginTop: 28,
  },
  footerBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 3,
    padding: 12,
  },
  footerTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: COLORS.primary,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  signatureSpace: {
    height: 36,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 4,
  },
  signatureSubtext: {
    fontSize: 7,
    color: COLORS.textMuted,
    textAlign: "center",
  },
  observationsText: {
    fontSize: 9,
    color: COLORS.text,
    lineHeight: 1.6,
  },
})

export function ReceiptPDF({ receipt }: { receipt: GoodReceiptResponse }) {
  const po = receipt.purchaseOrder
  const supplier = po?.supplier
  const warehouse = po?.destinationWarehouse

  const supplierAddress = supplier?.address ?? "—"
  const warehouseName = warehouse?.name ?? receipt.orderNumber
  const warehouseAddress = warehouse?.physicalAddress ?? "—"

  const totalReceived = receipt.items.reduce((s, i) => s + i.receivedQuantity, 0)
  const totalExpected = receipt.items.reduce((s, i) => s + i.expectedQuantity, 0)
  const hasUnitPrices = receipt.items.some((i) => i.unitPrice != null)

  const grandTotal = hasUnitPrices
    ? receipt.items.reduce((s, i) => s + (i.totalPrice ?? i.receivedQuantity * (i.unitPrice ?? 0)), 0)
    : 0

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <PDFLogo />
          <View style={styles.headerRight}>
            <Text style={styles.title}>Nota de Entrega</Text>
            <Text style={styles.docNumber}>N° {receipt.receiptNumber}</Text>
          </View>
        </View>

        <Separator />

        {/* ── Document Info ── */}
        <View style={styles.docInfoRow}>
          <View style={styles.docInfoCol}>
            <Text style={styles.label}>Fecha de Recepción</Text>
            <Text style={styles.infoValue}>{formatDateLong(receipt.receivedAt)}</Text>
          </View>
          <View style={styles.docInfoCol}>
            <Text style={styles.label}>Lugar</Text>
            <Text style={styles.infoValue}>{warehouseAddress}</Text>
          </View>
          <View style={styles.docInfoCol}>
            <Text style={styles.label}>Estado</Text>
            <Text style={styles.statusBadge}>
              {receipt.updatedStatus === "DELIVERED" ? "COMPLETADA" : "PARCIAL"}
            </Text>
          </View>
        </View>

        {/* ── Supplier & Warehouse Info ── */}
        <View style={styles.partyRow}>
          <View style={styles.partyBox}>
            <Text style={styles.partyTitle}>Proveedor</Text>
            <Text style={styles.partyValue}>{supplier?.name ?? receipt.orderNumber}</Text>
            <Text style={styles.partyValue}>{supplierAddress}</Text>
            {supplier?.email && <Text style={styles.partyValue}>{supplier.email}</Text>}
            {supplier?.phoneNumbers?.length ? (
              <Text style={styles.partyValue}>{supplier.phoneNumbers.join(", ")}</Text>
            ) : null}
          </View>
          <View style={styles.partyBox}>
            <Text style={styles.partyTitle}>Almacén Destino</Text>
            <Text style={styles.partyValue}>{warehouseName}</Text>
            <Text style={styles.partyValue}>{warehouseAddress}</Text>
            {warehouse?.description && (
              <Text style={styles.partyValue}>{warehouse.description}</Text>
            )}
          </View>
        </View>

        {/* ── Items Table ── */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, styles.thQty]}>CANT.</Text>
            <Text style={[styles.th, styles.thProduct]}>PRODUCTO</Text>
            <Text style={[styles.th, styles.thSku]}>REFERENCIA</Text>
            <Text style={[styles.th, styles.thPrice]}>P/U</Text>
            <Text style={[styles.th, styles.thTotal]}>TOTAL</Text>
          </View>

          {receipt.items.map((item, i) => (
            <View
              key={item.productId}
              style={[styles.tableRow, i % 2 === 1 ? styles.tableRowEven : undefined]}
            >
              <Text style={[styles.td, styles.tdQty]}>{item.receivedQuantity}</Text>
              <Text style={[styles.td, styles.tdProduct]}>{item.productName}</Text>
              <Text style={[styles.td, styles.tdSku]}>{item.productSku}</Text>
              <Text style={[styles.td, styles.tdPrice]}>
                {item.unitPrice != null ? formatCurrency(item.unitPrice) : "—"}
              </Text>
              <Text style={[styles.td, styles.tdTotal]}>
                {item.totalPrice != null
                  ? formatCurrency(item.totalPrice)
                  : item.unitPrice != null
                    ? formatCurrency(item.receivedQuantity * item.unitPrice)
                    : "—"}
              </Text>
            </View>
          ))}
        </View>

        {/* ── Totals ── */}
        {hasUnitPrices && (
          <View style={styles.totalsSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Esperado</Text>
              <Text style={styles.totalValue}>{totalExpected} uds.</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Recibido</Text>
              <Text style={styles.totalValue}>{totalReceived} uds.</Text>
            </View>
            <View style={[styles.totalRow, styles.finalTotal]}>
              <Text style={styles.finalTotalLabel}>Total $</Text>
              <Text style={styles.finalTotalValue}>{formatCurrency(grandTotal)}</Text>
            </View>
          </View>
        )}

        {/* ── Signature & Observations ── */}
        <View style={styles.footerSection}>
          <View style={styles.footerBox}>
            <Text style={styles.footerTitle}>Firma del Cliente</Text>
            <View style={styles.signatureSpace} />
            <Text style={styles.signatureSubtext}>Nombre y firma</Text>
          </View>
          <View style={styles.footerBox}>
            <Text style={styles.footerTitle}>Observaciones</Text>
            <Text style={styles.observationsText}>
              {receipt.notes || "Sin observaciones."}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}
