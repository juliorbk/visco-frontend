import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer"
import type { PurchaseOrderResponse } from "@/lib/types"
import {
  COLORS,
  PDFLogo,
  Separator,
  formatDateShort,
  formatCurrency,
  translatePaymentMethod,
  translateOrderType,
} from "./pdf-utils"

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: COLORS.text,
  },

  // ── Header ──
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerCenter: {
    alignItems: "center",
    flex: 1,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  title: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    color: COLORS.primary,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  headerInfoText: {
    fontSize: 8,
    color: COLORS.text,
    marginBottom: 2,
  },
  headerInfoLabel: {
    fontSize: 6,
    color: COLORS.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  // ── Supplier / Ship To boxes ──
  partyRow: {
    flexDirection: "row",
    gap: 0,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 3,
    overflow: "hidden",
    marginTop: 12,
  },
  partyColumn: {
    flex: 1,
  },
  partyHeaderBar: {
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  partyHeaderText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  partyContent: {
    padding: 10,
  },
  partyValue: {
    fontSize: 9,
    color: COLORS.text,
    marginBottom: 2,
    lineHeight: 1.4,
  },
  partyDivider: {
    width: 1,
    backgroundColor: COLORS.primary,
  },

  // ── Terms row ──
  termsRow: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 3,
    overflow: "hidden",
    marginTop: 12,
  },
  termsCol: {
    flex: 1,
  },
  termsHeader: {
    backgroundColor: COLORS.primary,
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  termsHeaderText: {
    color: "#FFFFFF",
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  termsContent: {
    padding: 8,
    minHeight: 28,
    justifyContent: "center",
  },
  termsValue: {
    fontSize: 8,
    color: COLORS.text,
  },
  termsDivider: {
    width: 1,
    backgroundColor: COLORS.primary,
  },

  // ── Items Table ──
  table: {
    width: "100%",
    marginTop: 12,
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
  thArticle: { width: "10%" },
  thDesc: { width: "42%" },
  thQty: { width: "12%", textAlign: "center" },
  thPrice: { width: "18%", textAlign: "right" },
  thTotal: { width: "18%", textAlign: "right" },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  tableRowEven: {
    backgroundColor: "#F9FAFB",
  },
  td: {
    fontSize: 8,
    color: COLORS.text,
  },
  tdArticle: { width: "10%" },
  tdDesc: { width: "42%" },
  tdQty: { width: "12%", textAlign: "center" },
  tdPrice: { width: "18%", textAlign: "right" },
  tdTotal: { width: "18%", textAlign: "right" },

  // Empty rows
  emptyRow: {
    flexDirection: "row",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    height: 18,
  },

  // ── Totals ──
  totalsSection: {
    marginTop: 8,
    alignItems: "flex-end",
  },
  totalRow: {
    flexDirection: "row",
    paddingVertical: 2,
    paddingHorizontal: 8,
    width: "45%",
  },
  totalLabel: {
    flex: 1,
    fontSize: 8,
    color: COLORS.text,
    textTransform: "uppercase",
  },
  totalValue: {
    fontSize: 8,
    color: COLORS.text,
    textAlign: "right",
  },
  totalFinal: {
    borderTopWidth: 2,
    borderTopColor: COLORS.primary,
    marginTop: 4,
    paddingTop: 4,
    backgroundColor: "#FEF2F2",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  totalFinalLabel: {
    color: COLORS.primary,
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
  },
  totalFinalValue: {
    color: COLORS.primary,
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
  },

  // ── Comments ──
  commentsSection: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 3,
    overflow: "hidden",
  },
  commentsHeader: {
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  commentsHeaderText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  commentsContent: {
    padding: 10,
    minHeight: 50,
  },
  commentsText: {
    fontSize: 9,
    color: COLORS.text,
    lineHeight: 1.6,
  },
})

const EMPTY_ROWS_COUNT = 5

export function PurchaseOrderPDF({ order }: { order: PurchaseOrderResponse }) {
  const supplier = order.supplier
  const warehouse = order.destinationWarehouse
  const subtotal = order.items.reduce((s, i) => s + i.subtotal, 0)
  const tax = order.taxAmount ?? 0
  const shipping = order.shippingCost ?? 0
  const other = order.otherCost ?? 0
  const grandTotal = subtotal + tax + shipping + other

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <PDFLogo />
          <View style={styles.headerCenter}>
            <Text style={styles.title}>Orden de Compra</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.headerInfoLabel}>Fecha</Text>
            <Text style={styles.headerInfoText}>{formatDateShort(order.createdAt)}</Text>
            <Text style={[styles.headerInfoLabel, { marginTop: 4 }]}>OC #</Text>
            <Text style={styles.headerInfoText}>{order.orderNumber}</Text>
            <Text style={[styles.headerInfoLabel, { marginTop: 4 }]}>Tipo</Text>
            <Text style={styles.headerInfoText}>{translateOrderType(order.type)}</Text>
            <Text style={[styles.headerInfoLabel, { marginTop: 4 }]}>Pago</Text>
            <Text style={styles.headerInfoText}>{translatePaymentMethod(order.paymentMethod)}</Text>
          </View>
        </View>

        <Separator />

        {/* ── Supplier & Ship To ── */}
        <View style={styles.partyRow}>
          <View style={styles.partyColumn}>
            <View style={styles.partyHeaderBar}>
              <Text style={styles.partyHeaderText}>Proveedor</Text>
            </View>
            <View style={styles.partyContent}>
              <Text style={styles.partyValue}>{supplier?.name ?? order.supplierName}</Text>
              <Text style={styles.partyValue}>{supplier?.address ?? "—"}</Text>
              {supplier?.email && <Text style={styles.partyValue}>{supplier.email}</Text>}
              {supplier?.phoneNumbers?.length ? (
                <Text style={styles.partyValue}>Tel: {supplier.phoneNumbers.join(", ")}</Text>
              ) : null}
            </View>
          </View>
          <View style={styles.partyDivider} />
          <View style={styles.partyColumn}>
            <View style={styles.partyHeaderBar}>
              <Text style={styles.partyHeaderText}>Envíe a</Text>
            </View>
            <View style={styles.partyContent}>
              <Text style={styles.partyValue}>
                {warehouse?.name ?? order.destinationWarehouseName ?? "—"}
              </Text>
              <Text style={styles.partyValue}>{warehouse?.physicalAddress ?? "—"}</Text>
              {warehouse?.description && (
                <Text style={styles.partyValue}>{warehouse.description}</Text>
              )}
            </View>
          </View>
        </View>

        {/* ── Terms ── */}
        <View style={styles.termsRow}>
          <View style={styles.termsCol}>
            <View style={styles.termsHeader}>
              <Text style={styles.termsHeaderText}>Requisar</Text>
            </View>
            <View style={styles.termsContent}>
              <Text style={styles.termsValue}>{order.createdBy}</Text>
            </View>
          </View>
          <View style={styles.termsDivider} />
          <View style={styles.termsCol}>
            <View style={styles.termsHeader}>
              <Text style={styles.termsHeaderText}>Embarcar Vía</Text>
            </View>
            <View style={styles.termsContent}>
              <Text style={styles.termsValue}>
                {order.leadTime ? `${order.leadTime} días` : "—"}
              </Text>
            </View>
          </View>
          <View style={styles.termsDivider} />
          <View style={styles.termsCol}>
            <View style={styles.termsHeader}>
              <Text style={styles.termsHeaderText}>F.O.B.</Text>
            </View>
            <View style={styles.termsContent}>
              <Text style={styles.termsValue}>—</Text>
            </View>
          </View>
          <View style={styles.termsDivider} />
          <View style={styles.termsCol}>
            <View style={styles.termsHeader}>
              <Text style={styles.termsHeaderText}>Condiciones de Envío</Text>
            </View>
            <View style={styles.termsContent}>
              <Text style={styles.termsValue}>{order.paymentTerms ?? "—"}</Text>
            </View>
          </View>
        </View>

        {/* ── Items Table ── */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, styles.thArticle]}>#</Text>
            <Text style={[styles.th, styles.thDesc]}>Descripción</Text>
            <Text style={[styles.th, styles.thQty]}>Cant</Text>
            <Text style={[styles.th, styles.thPrice]}>P/U</Text>
            <Text style={[styles.th, styles.thTotal]}>Total</Text>
          </View>

          {order.items.map((item, i) => (
            <View
              key={item.productId}
              style={[styles.tableRow, i % 2 === 1 ? styles.tableRowEven : undefined]}
            >
              <Text style={[styles.td, styles.tdArticle]}>{i + 1}</Text>
              <View style={[styles.td, styles.tdDesc]}>
                <Text style={{ fontSize: 8 }}>{item.productName}</Text>
                <Text style={{ fontSize: 7, color: COLORS.textLight }}>{item.productSku}</Text>
              </View>
              <Text style={[styles.td, styles.tdQty]}>{item.quantity}</Text>
              <Text style={[styles.td, styles.tdPrice]}>{formatCurrency(item.unitPrice)}</Text>
              <Text style={[styles.td, styles.tdTotal]}>{formatCurrency(item.subtotal)}</Text>
            </View>
          ))}

          {Array.from({ length: Math.max(0, EMPTY_ROWS_COUNT - order.items.length) }).map(
            (_, i) => (
              <View key={`empty-${i}`} style={styles.emptyRow}>
                <Text style={[styles.td, styles.tdArticle]} />
                <Text style={[styles.td, styles.tdDesc]} />
                <Text style={[styles.td, styles.tdQty]} />
                <Text style={[styles.td, styles.tdPrice]} />
                <Text style={[styles.td, styles.tdTotal]} />
              </View>
            ),
          )}
        </View>

        {/* ── Totals ── */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{formatCurrency(subtotal)}</Text>
          </View>
          {(tax > 0 || order.taxAmount != null) && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Impuesto</Text>
              <Text style={styles.totalValue}>{formatCurrency(tax)}</Text>
            </View>
          )}
          {(shipping > 0 || order.shippingCost != null) && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Envío</Text>
              <Text style={styles.totalValue}>{formatCurrency(shipping)}</Text>
            </View>
          )}
          {(other > 0 || order.otherCost != null) && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Otro</Text>
              <Text style={styles.totalValue}>{formatCurrency(other)}</Text>
            </View>
          )}
          <View style={styles.totalFinal}>
            <View style={{ flexDirection: "row", width: "100%" }}>
              <Text style={[styles.totalLabel, styles.totalFinalLabel]}>Total</Text>
              <Text style={[styles.totalValue, styles.totalFinalValue]}>
                {formatCurrency(grandTotal)}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Comments ── */}
        <View style={styles.commentsSection}>
          <View style={styles.commentsHeader}>
            <Text style={styles.commentsHeaderText}>Comentarios o instrucciones especiales</Text>
          </View>
          <View style={styles.commentsContent}>
            <Text style={styles.commentsText}>
              {order.specialConditions || order.description || "—"}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}
