import { View, Text, StyleSheet } from "@react-pdf/renderer"

export const COLORS = {
  primary: "#7B1A1A",
  primaryLight: "#A52A2A",
  accent: "#C8542C",
  text: "#1F2937",
  textLight: "#6B7280",
  textMuted: "#9CA3AF",
  border: "#D1D5DB",
  background: "#FFFFFF",
  tableHeaderBg: "#7B1A1A",
  tableRowEven: "#F9FAFB",
  tableBorder: "#E5E7EB",
}

export const commonStyles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: COLORS.text,
  },
  logoPlaceholder: {
    width: 80,
    height: 60,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  logoText: {
    fontSize: 10,
    color: COLORS.textMuted,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
  },
  titleAccent: {
    color: COLORS.accent,
  },
  titlePrimary: {
    color: COLORS.primary,
  },
  separator: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
    marginVertical: 16,
  },
  separatorLight: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginVertical: 12,
  },
  label: {
    fontSize: 7,
    color: COLORS.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 2,
  },
  value: {
    fontSize: 10,
    color: COLORS.text,
  },
  gridRow: {
    flexDirection: "row",
    gap: 12,
  },
  gridCol: {
    flex: 1,
  },

  // Table styles
  table: {
    width: "100%",
    marginTop: 12,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: COLORS.tableHeaderBg,
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
  tableRow: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.tableBorder,
  },
  tableRowEven: {
    backgroundColor: COLORS.tableRowEven,
  },
  td: {
    fontSize: 8,
    color: COLORS.text,
  },

  // Party boxes
  partyRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  partyBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    padding: 10,
  },
  partyTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: COLORS.primary,
    textTransform: "uppercase",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  partyValue: {
    fontSize: 9,
    color: COLORS.text,
    marginBottom: 2,
    lineHeight: 1.4,
  },

  // Footer section
  footerSection: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  signatureBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    padding: 12,
  },
  signatureTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: COLORS.primary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 24,
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 4,
  },
  signatureSubtext: {
    fontSize: 7,
    color: COLORS.textMuted,
    textAlign: "center",
  },
})

export function PDFLogo() {
  return (
    <View style={commonStyles.logoPlaceholder}>
      <Text style={commonStyles.logoText}>[Logo]</Text>
    </View>
  )
}

export function Separator({ light }: { light?: boolean }) {
  return <View style={light ? commonStyles.separatorLight : commonStyles.separator} />
}

const MONTHS_ES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
]

export function formatDateLong(dateStr: string): string {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return `${d.getDate()} de ${MONTHS_ES[d.getMonth()]} de ${d.getFullYear()}`
}

export function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`
}

export function formatCurrency(value: number): string {
  return `$${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
}

export function translatePaymentMethod(method: string): string {
  const map: Record<string, string> = {
    CASH: "Efectivo",
    BANK_TRANSFER: "Transferencia Bancaria",
    CHECK: "Cheque",
    USDT: "USDT",
    PAYPAL: "PayPal",
    OTHER: "Otro",
  }
  return map[method] ?? method
}

export function translateOrderType(type: string): string {
  const map: Record<string, string> = {
    SERVICES: "Servicios",
    MATERIALS: "Materiales",
    MRO: "MRO",
    CAPITAL_EQUIPMENT: "Equipo de Capital",
  }
  return map[type] ?? type
}
