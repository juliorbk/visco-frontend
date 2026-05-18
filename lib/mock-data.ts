// Centralized mock data for the Visco Orinoco ERP frontend.
// In production these would be served by the backend at http://localhost:8080.

export type OrderStatus =
  | "BORRADOR"
  | "PENDIENTE"
  | "APROBADO"
  | "EN_TRANSITO"
  | "RECIBIDO"
  | "CANCELADO"

export type InventoryStatus = "En stock" | "Bajo stock" | "Sin stock"

export type ComplianceStatus = "Total" | "Revision" | "Critico"

export type ReceiptStatus = "COMPLETADA" | "PARCIAL"

export interface ReceiptItem {
  productId: string
  productName: string
  sku: string
  expectedQty: number
  receivedQty: number
  uom: string
}

export interface Receipt {
  id: string
  receiptNumber: string
  purchaseOrderId: string
  purchaseOrderNumber: string
  supplierId: string
  supplierName: string
  date: string
  status: ReceiptStatus
  items: ReceiptItem[]
  notes: string
}

export interface Product {
  id: string
  sku: string
  sapCode: string
  name: string
  category: string
  supplierId: string
  supplierName: string
  uom: string
  currentStock: number
  reorderPoint: number
  warehouse: string
  unitPrice: number
  history: { date: string; delta: number; description: string }[]
}

export interface PurchaseOrder {
  id: string
  orderNumber: string
  date: string
  supplierId: string
  supplierName: string
  total: number
  status: OrderStatus
  requester: string
  costCenter: string
  paymentMethod: string
  type: string
  items: { productId: string; productName: string; quantity: number; unitPrice: number }[]
  description?: string
}

export interface Supplier {
  id: string
  name: string
  category: string
  type: string
  rating: number
  contactName: string
  email: string
  phone: string
  address: string
  description: string
  currency: string
  sapCode: string
  compliance: ComplianceStatus
  tier: number
  since: number
  certifications: { name: string; status: "active" | "review" }[]
  legalRepresentatives: string[]
  recentOrders: { id: string; date: string; status: OrderStatus }[]
}

// ---------- INVENTORY ----------

export const products: Product[] = [
  {
    id: "p-001",
    sku: "MCH-A-001",
    sapCode: "SAP-100245",
    name: "Microchips Tipo A",
    category: "Componentes",
    supplierId: "s-001",
    supplierName: "TechCore Industries",
    uom: "UNIDAD",
    currentStock: 12,
    reorderPoint: 50,
    warehouse: "Almacén Central",
    unitPrice: 24.5,
    history: [
      { date: "2025-04-22", delta: -8, description: "Despacho PO-4087" },
      { date: "2025-04-15", delta: -12, description: "Despacho PO-4081" },
      { date: "2025-04-01", delta: 30, description: "Recepción PO-4055" },
    ],
  },
  {
    id: "p-002",
    sku: "SNS-OPT-014",
    sapCode: "SAP-100388",
    name: "Sensores Ópticos",
    category: "Componentes",
    supplierId: "s-002",
    supplierName: "Lumen Optics Co.",
    uom: "UNIDAD",
    currentStock: 32,
    reorderPoint: 40,
    warehouse: "Almacén Norte",
    unitPrice: 88.0,
    history: [
      { date: "2025-04-20", delta: -4, description: "Despacho PO-4090" },
      { date: "2025-04-10", delta: -6, description: "Despacho PO-4078" },
    ],
  },
  {
    id: "p-003",
    sku: "CBL-IND-220",
    sapCode: "SAP-100412",
    name: "Cableado Industrial",
    category: "Equipos",
    supplierId: "s-003",
    supplierName: "ElectroSur S.A.",
    uom: "METRO",
    currentStock: 0,
    reorderPoint: 200,
    warehouse: "Almacén Central",
    unitPrice: 3.2,
    history: [
      { date: "2025-04-25", delta: -120, description: "Despacho PO-4095" },
      { date: "2025-04-12", delta: -80, description: "Despacho PO-4079" },
    ],
  },
  {
    id: "p-004",
    sku: "BAT-LI-500",
    sapCode: "SAP-100501",
    name: "Baterías de Litio 500mAh",
    category: "Componentes",
    supplierId: "s-001",
    supplierName: "TechCore Industries",
    uom: "PAQUETE",
    currentStock: 184,
    reorderPoint: 80,
    warehouse: "Almacén Central",
    unitPrice: 14.75,
    history: [
      { date: "2025-04-18", delta: 100, description: "Recepción PO-4084" },
      { date: "2025-04-05", delta: -22, description: "Despacho PO-4070" },
    ],
  },
  {
    id: "p-005",
    sku: "CAJ-EMB-30",
    sapCode: "SAP-100620",
    name: "Cajas de Embalaje 30cm",
    category: "Logística",
    supplierId: "s-004",
    supplierName: "Empaques Andinos",
    uom: "CAJA",
    currentStock: 540,
    reorderPoint: 200,
    warehouse: "Almacén Sur",
    unitPrice: 1.15,
    history: [
      { date: "2025-04-21", delta: 200, description: "Recepción PO-4092" },
      { date: "2025-04-08", delta: -60, description: "Despacho PO-4073" },
    ],
  },
  {
    id: "p-006",
    sku: "ACE-IND-5L",
    sapCode: "SAP-100750",
    name: "Aceite Industrial 5L",
    category: "MRO",
    supplierId: "s-005",
    supplierName: "Químicos Caracas",
    uom: "LITRO",
    currentStock: 48,
    reorderPoint: 25,
    warehouse: "Almacén Norte",
    unitPrice: 32.0,
    history: [
      { date: "2025-04-19", delta: 20, description: "Recepción PO-4088" },
    ],
  },
  {
    id: "p-007",
    sku: "TRN-12V-DC",
    sapCode: "SAP-100805",
    name: "Transformadores 12V DC",
    category: "Equipos",
    supplierId: "s-003",
    supplierName: "ElectroSur S.A.",
    uom: "UNIDAD",
    currentStock: 7,
    reorderPoint: 15,
    warehouse: "Almacén Central",
    unitPrice: 145.0,
    history: [
      { date: "2025-04-17", delta: -3, description: "Despacho PO-4083" },
    ],
  },
  {
    id: "p-008",
    sku: "GLN-PINT-IND",
    sapCode: "SAP-100910",
    name: "Pintura Industrial Galón",
    category: "MRO",
    supplierId: "s-005",
    supplierName: "Químicos Caracas",
    uom: "GALON",
    currentStock: 96,
    reorderPoint: 30,
    warehouse: "Almacén Sur",
    unitPrice: 28.5,
    history: [
      { date: "2025-04-22", delta: 50, description: "Recepción PO-4091" },
    ],
  },
]

export function computeStatus(p: Product): InventoryStatus {
  if (p.currentStock === 0) return "Sin stock"
  if (p.currentStock < p.reorderPoint) return "Bajo stock"
  return "En stock"
}

// ---------- ORDERS ----------

export const orders: PurchaseOrder[] = [
  {
    id: "PO-4092",
    orderNumber: "PO-4092",
    date: "2025-04-25",
    supplierId: "s-004",
    supplierName: "Empaques Andinos",
    total: 4250.0,
    status: "PENDIENTE",
    requester: "María González",
    costCenter: "CC-LOG-002",
    paymentMethod: "BANK_TRANSFER",
    type: "MATERIALS",
    items: [
      { productId: "p-005", productName: "Cajas de Embalaje 30cm", quantity: 2000, unitPrice: 1.15 },
    ],
    description: "Reposición trimestral de embalajes",
  },
  {
    id: "PO-4091",
    orderNumber: "PO-4091",
    date: "2025-04-24",
    supplierId: "s-005",
    supplierName: "Químicos Caracas",
    total: 1425.0,
    status: "APROBADO",
    requester: "Luis Pérez",
    costCenter: "CC-MRO-001",
    paymentMethod: "BANK_TRANSFER",
    type: "MRO",
    items: [
      { productId: "p-008", productName: "Pintura Industrial Galón", quantity: 50, unitPrice: 28.5 },
    ],
    description: "Mantenimiento planta sur",
  },
  {
    id: "PO-4090",
    orderNumber: "PO-4090",
    date: "2025-04-22",
    supplierId: "s-002",
    supplierName: "Lumen Optics Co.",
    total: 7040.0,
    status: "EN_TRANSITO",
    requester: "Ana Martínez",
    costCenter: "CC-IT-004",
    paymentMethod: "USDT",
    type: "MATERIALS",
    items: [
      { productId: "p-002", productName: "Sensores Ópticos", quantity: 80, unitPrice: 88.0 },
    ],
    description: "Reposición sensores línea 3",
  },
  {
    id: "PO-4089",
    orderNumber: "PO-4089",
    date: "2025-04-20",
    supplierId: "s-001",
    supplierName: "TechCore Industries",
    total: 12250.0,
    status: "RECIBIDO",
    requester: "Carlos Rivas",
    costCenter: "CC-IT-001",
    paymentMethod: "BANK_TRANSFER",
    type: "CAPITAL_EQUIPMENT",
    items: [
      { productId: "p-001", productName: "Microchips Tipo A", quantity: 500, unitPrice: 24.5 },
    ],
    description: "Compra lote anual",
  },
  {
    id: "PO-4088",
    orderNumber: "PO-4088",
    date: "2025-04-19",
    supplierId: "s-005",
    supplierName: "Químicos Caracas",
    total: 640.0,
    status: "RECIBIDO",
    requester: "María González",
    costCenter: "CC-MRO-001",
    paymentMethod: "CASH",
    type: "MRO",
    items: [
      { productId: "p-006", productName: "Aceite Industrial 5L", quantity: 20, unitPrice: 32.0 },
    ],
  },
  {
    id: "PO-4087",
    orderNumber: "PO-4087",
    date: "2025-04-18",
    supplierId: "s-001",
    supplierName: "TechCore Industries",
    total: 196.0,
    status: "CANCELADO",
    requester: "Luis Pérez",
    costCenter: "CC-IT-001",
    paymentMethod: "BANK_TRANSFER",
    type: "MATERIALS",
    items: [
      { productId: "p-001", productName: "Microchips Tipo A", quantity: 8, unitPrice: 24.5 },
    ],
  },
  {
    id: "PO-4086",
    orderNumber: "PO-4086",
    date: "2025-04-15",
    supplierId: "s-003",
    supplierName: "ElectroSur S.A.",
    total: 2900.0,
    status: "BORRADOR",
    requester: "Ana Martínez",
    costCenter: "CC-OPS-003",
    paymentMethod: "CHECK",
    type: "SERVICES",
    items: [
      { productId: "p-007", productName: "Transformadores 12V DC", quantity: 20, unitPrice: 145.0 },
    ],
  },
]

// ---------- SUPPLIERS ----------

export const suppliers: Supplier[] = [
  {
    id: "s-001",
    name: "TechCore Industries",
    category: "Electrónica",
    type: "Componentes / Manufactura",
    rating: 4.8,
    contactName: "Roberto Silva",
    email: "ventas@techcore.com",
    phone: "+58 212 555 0101",
    address: "Av. Principal de Las Mercedes, Caracas",
    description: "Proveedor estratégico de componentes electrónicos y microchips.",
    currency: "USD",
    sapCode: "SUP-1001",
    compliance: "Total",
    tier: 1,
    since: 2018,
    certifications: [
      { name: "ISO 9001", status: "active" },
      { name: "ISO 14001", status: "active" },
      { name: "Auditoría Anual", status: "active" },
    ],
    legalRepresentatives: ["Roberto Silva", "Daniela Ortega"],
    recentOrders: [
      { id: "PO-4089", date: "2025-04-20", status: "RECIBIDO" },
      { id: "PO-4087", date: "2025-04-18", status: "CANCELADO" },
      { id: "PO-4072", date: "2025-03-30", status: "RECIBIDO" },
    ],
  },
  {
    id: "s-002",
    name: "Lumen Optics Co.",
    category: "Óptica",
    type: "Sensores / Instrumentación",
    rating: 4.6,
    contactName: "Patricia Núñez",
    email: "compras@lumenoptics.com",
    phone: "+58 261 555 0233",
    address: "Zona Industrial Maracaibo",
    description: "Especialistas en sensores ópticos de precisión industrial.",
    currency: "USD",
    sapCode: "SUP-1002",
    compliance: "Total",
    tier: 1,
    since: 2019,
    certifications: [
      { name: "ISO 9001", status: "active" },
      { name: "Auditoría Anual", status: "review" },
    ],
    legalRepresentatives: ["Patricia Núñez"],
    recentOrders: [
      { id: "PO-4090", date: "2025-04-22", status: "EN_TRANSITO" },
      { id: "PO-4060", date: "2025-03-12", status: "RECIBIDO" },
    ],
  },
  {
    id: "s-003",
    name: "ElectroSur S.A.",
    category: "Eléctrica",
    type: "Cableado / Transformadores",
    rating: 4.2,
    contactName: "Jorge Salazar",
    email: "contacto@electrosur.com.ve",
    phone: "+58 241 555 0844",
    address: "Av. Industrial, Valencia",
    description: "Proveedor regional de cableado, transformadores y soluciones eléctricas.",
    currency: "USD",
    sapCode: "SUP-1003",
    compliance: "Revision",
    tier: 2,
    since: 2020,
    certifications: [
      { name: "ISO 9001", status: "active" },
      { name: "Auditoría Anual", status: "review" },
    ],
    legalRepresentatives: ["Jorge Salazar", "Andrea Ríos"],
    recentOrders: [
      { id: "PO-4086", date: "2025-04-15", status: "BORRADOR" },
      { id: "PO-4050", date: "2025-03-04", status: "RECIBIDO" },
    ],
  },
  {
    id: "s-004",
    name: "Empaques Andinos",
    category: "Empaques",
    type: "Cartonería / Logística",
    rating: 4.5,
    contactName: "Sofía Herrera",
    email: "ventas@empaquesandinos.com",
    phone: "+58 274 555 0512",
    address: "Polígono Industrial Mérida",
    description: "Cartonería industrial y soluciones de empaque a medida.",
    currency: "USD",
    sapCode: "SUP-1004",
    compliance: "Total",
    tier: 2,
    since: 2021,
    certifications: [
      { name: "ISO 9001", status: "active" },
    ],
    legalRepresentatives: ["Sofía Herrera"],
    recentOrders: [
      { id: "PO-4092", date: "2025-04-25", status: "PENDIENTE" },
      { id: "PO-4040", date: "2025-02-20", status: "RECIBIDO" },
    ],
  },
  {
    id: "s-005",
    name: "Químicos Caracas",
    category: "Químicos",
    type: "MRO / Lubricantes",
    rating: 3.9,
    contactName: "Miguel Ángel Toro",
    email: "operaciones@quimicoscaracas.com",
    phone: "+58 212 555 0788",
    address: "Catia, Caracas",
    description: "Lubricantes industriales, pinturas y consumibles de mantenimiento.",
    currency: "USD",
    sapCode: "SUP-1005",
    compliance: "Critico",
    tier: 3,
    since: 2022,
    certifications: [
      { name: "Auditoría Anual", status: "review" },
    ],
    legalRepresentatives: ["Miguel Ángel Toro"],
    recentOrders: [
      { id: "PO-4091", date: "2025-04-24", status: "APROBADO" },
      { id: "PO-4088", date: "2025-04-19", status: "RECIBIDO" },
    ],
  },
  {
    id: "s-006",
    name: "Servicios Globales LTDA",
    category: "Servicios",
    type: "Mantenimiento / Outsourcing",
    rating: 4.4,
    contactName: "Verónica Espinoza",
    email: "contacto@servglobales.com",
    phone: "+58 212 555 0902",
    address: "Chacao, Caracas",
    description: "Servicios integrales de mantenimiento, limpieza y outsourcing.",
    currency: "USD",
    sapCode: "SUP-1006",
    compliance: "Total",
    tier: 2,
    since: 2020,
    certifications: [
      { name: "ISO 9001", status: "active" },
      { name: "ISO 14001", status: "active" },
    ],
    legalRepresentatives: ["Verónica Espinoza"],
    recentOrders: [
      { id: "PO-4075", date: "2025-04-02", status: "RECIBIDO" },
    ],
  },
]

// ---------- DASHBOARD METRICS ----------

export const expensesData = [
  { month: "Jul", real: 195000, proyectado: 200000 },
  { month: "Ago", real: 220000, proyectado: 215000 },
  { month: "Sep", real: 245000, proyectado: 230000 },
  { month: "Oct", real: 198000, proyectado: 240000 },
  { month: "Nov", real: 268000, proyectado: 255000 },
  { month: "Dic", real: 284500, proyectado: 270000 },
]

export const expensesBreakdown = [
  { name: "Componentes", value: 45, color: "#7b1a1a" },
  { name: "Equipos", value: 30, color: "#f4c0c0" },
  { name: "Logística", value: 25, color: "#111827" },
]

export const supplierPerformance = [
  { month: "Ene", a: 78, b: 60 },
  { month: "Feb", a: 82, b: 68 },
  { month: "Mar", a: 75, b: 72 },
  { month: "Abr", a: 88, b: 65 },
  { month: "May", a: 92, b: 78 },
  { month: "Jun", a: 85, b: 82 },
  { month: "Jul", a: 95, b: 88 },
]

export const reportTrendCurrent = [
  { day: "1", current: 42000, previous: 38000 },
  { day: "5", current: 58000, previous: 45000 },
  { day: "10", current: 71000, previous: 62000 },
  { day: "15", current: 89000, previous: 70000 },
  { day: "20", current: 110000, previous: 92000 },
  { day: "25", current: 138000, previous: 115000 },
  { day: "30", current: 162000, previous: 138000 },
]

export const categoryExpenses = [
  { cat: "IT", value: 85 },
  { cat: "Mktg", value: 52 },
  { cat: "Ops", value: 95 },
  { cat: "HR", value: 38 },
  { cat: "Fac", value: 64 },
]

// ---------- ENUMS ----------

export const UOM_OPTIONS = [
  "UN", "CA", "KG", "L", "M", "CM", "G", "LB", "EA", "M2", "M3",
  "LTS", "GL", "GLN", "PAQ", "CJ", "ROL", "KIT", "CIL", "YD",
  "TON", "TM", "TO", "BOT", "BTO", "CTO", "PUL", "CL", "FC",
  "PAA", "PI2", "PI3", "BOL", "CEN", "MIL", "AM", "LOT", "MTL",
  "BL", "SB", "CTE", "PAI",
]

export const PAYMENT_METHODS = ["CASH", "BANK_TRANSFER", "CHECK", "USDT", "PAYPAL", "OTHER"]
export const ORDER_TYPES = ["SERVICES", "MATERIALS", "MRO", "CAPITAL_EQUIPMENT"]
export const CURRENCIES = ["USD", "EUR", "VES", "COP", "BRL"]
export const CATEGORIES = ["Componentes", "Equipos", "Logística", "MRO", "Servicios"]

// ---------- RECEIPTS / INBOUNDS ----------

export const receipts: Receipt[] = [
  {
    id: "rcpt-001",
    receiptNumber: "VIS-1-1696723260",
    purchaseOrderId: "po-001",
    purchaseOrderNumber: "PO-4092",
    supplierId: "s-001",
    supplierName: "TechCorp Ind.",
    date: "2025-10-12",
    status: "COMPLETADA",
    items: [
      {
        productId: "p-001",
        productName: "Resina XR-1000",
        sku: "SKU-RX-001",
        expectedQty: 500,
        receivedQty: 500,
        uom: "kg",
      },
      {
        productId: "p-002",
        productName: "Catalizador C-200",
        sku: "SKU-CA-002",
        expectedQty: 200,
        receivedQty: 180,
        uom: "L",
      },
      {
        productId: "p-003",
        productName: "Solvente SV-300",
        sku: "SKU-SV-003",
        expectedQty: 100,
        receivedQty: 100,
        uom: "gal",
      },
    ],
    notes: "Todo en orden, despacho completo.",
  },
  {
    id: "rcpt-002",
    receiptNumber: "VIS-2-1696809660",
    purchaseOrderId: "po-002",
    purchaseOrderNumber: "PO-4091",
    supplierId: "s-002",
    supplierName: "Global Supplies",
    date: "2025-10-14",
    status: "PARCIAL",
    items: [
      {
        productId: "p-004",
        productName: "Empaque Premium",
        sku: "SKU-EMP-004",
        expectedQty: 1000,
        receivedQty: 500,
        uom: "UNIDAD",
      },
    ],
    notes: "Entrega parcial, pendiente de restock.",
  },
  {
    id: "rcpt-003",
    receiptNumber: "VIS-3-1696896060",
    purchaseOrderId: "po-003",
    purchaseOrderNumber: "PO-4090",
    supplierId: "s-003",
    supplierName: "ElectroParts S.A.",
    date: "2025-10-15",
    status: "COMPLETADA",
    items: [
      { productId: "p-005", productName: "Condensador 100µF", sku: "SKU-CON-005", expectedQty: 2000, receivedQty: 2000, uom: "UNIDAD" },
      { productId: "p-006", productName: "Resistor 1kΩ", sku: "SKU-RES-006", expectedQty: 5000, receivedQty: 5000, uom: "UNIDAD" },
      { productId: "p-007", productName: "LED Rojo", sku: "SKU-LED-007", expectedQty: 3000, receivedQty: 3000, uom: "UNIDAD" },
      { productId: "p-008", productName: "Transistor NPN", sku: "SKU-TRN-008", expectedQty: 1500, receivedQty: 1500, uom: "UNIDAD" },
      { productId: "p-009", productName: "Diodo Rectificador", sku: "SKU-DIO-009", expectedQty: 1000, receivedQty: 1000, uom: "UNIDAD" },
    ],
    notes: "Despacho completo y en excelentes condiciones.",
  },
  {
    id: "rcpt-004",
    receiptNumber: "VIS-4-1696982460",
    purchaseOrderId: "po-004",
    purchaseOrderNumber: "PO-4088",
    supplierId: "s-004",
    supplierName: "Acme Industrial",
    date: "2025-10-16",
    status: "PARCIAL",
    items: [
      { productId: "p-010", productName: "Tubo de acero 2in", sku: "SKU-TUB-010", expectedQty: 100, receivedQty: 80, uom: "UNIDAD" },
      { productId: "p-011", productName: "Tornillo M8x50", sku: "SKU-TOR-011", expectedQty: 5000, receivedQty: 5000, uom: "UNIDAD" },
    ],
    notes: "Falta llegar carga de tubos, se espera para mañana.",
  },
  {
    id: "rcpt-005",
    receiptNumber: "VIS-5-1697068860",
    purchaseOrderId: "po-005",
    purchaseOrderNumber: "PO-4085",
    supplierId: "s-005",
    supplierName: "Químicos Orinoco",
    date: "2025-10-17",
    status: "COMPLETADA",
    items: [
      { productId: "p-012", productName: "Ácido clorhídrico 37%", sku: "SKU-ACH-012", expectedQty: 500, receivedQty: 500, uom: "L" },
      { productId: "p-013", productName: "Hidróxido de sodio", sku: "SKU-HID-013", expectedQty: 300, receivedQty: 300, uom: "kg" },
      { productId: "p-014", productName: "Sulfato de cobre", sku: "SKU-SUL-014", expectedQty: 200, receivedQty: 200, uom: "kg" },
      { productId: "p-015", productName: "Nitrato de potasio", sku: "SKU-NIT-015", expectedQty: 150, receivedQty: 150, uom: "kg" },
    ],
    notes: "Todos los químicos recibidos con documentación correcta.",
  },
  {
    id: "rcpt-006",
    receiptNumber: "VIS-6-1697155260",
    purchaseOrderId: "po-006",
    purchaseOrderNumber: "PO-4083",
    supplierId: "s-006",
    supplierName: "MetalWorks Inc.",
    date: "2025-10-18",
    status: "COMPLETADA",
    items: [
      { productId: "p-016", productName: "Placa de aluminio", sku: "SKU-PLA-016", expectedQty: 50, receivedQty: 50, uom: "UNIDAD" },
      { productId: "p-017", productName: "Perfil de acero", sku: "SKU-PER-017", expectedQty: 30, receivedQty: 30, uom: "UNIDAD" },
    ],
    notes: "Entrega conforme, materiales en buenas condiciones.",
  },
]
