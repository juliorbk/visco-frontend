"use client"

import { useState } from "react"
import { Download, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/visco/page-header"
import { InboundsKPICards } from "@/components/visco/inbounds/kpi-cards"
import { ReceiptsTable } from "@/components/visco/inbounds/receipts-table"
import { ReceiptDetailPanel } from "@/components/visco/inbounds/receipt-detail-panel"
import { NuevaRecepcionModal } from "@/components/visco/inbounds/nueva-recepcion-modal"
import { receipts, type PurchaseOrder } from "@/lib/mock-data"
import { Receipt } from "@/lib/mock-data"

// Mock purchase orders for new receipts
const mockPurchaseOrders: PurchaseOrder[] = [
  {
    id: "po-007",
    orderNumber: "PO-4082",
    date: "2025-10-10",
    supplierId: "s-001",
    supplierName: "TechCorp Ind.",
    total: 15000,
    status: "ACEPTADA",
    requester: "Mario López",
    costCenter: "CC-001",
    paymentMethod: "Crédito 30 días",
    type: "Importación",
    items: [
      { productId: "p-018", productName: "Polímero PA-500", quantity: 250, unitPrice: 45.0 },
      { productId: "p-019", productName: "Aditivo AD-100", quantity: 100, unitPrice: 120.0 },
    ],
  },
  {
    id: "po-008",
    orderNumber: "PO-4080",
    date: "2025-10-08",
    supplierId: "s-002",
    supplierName: "Global Supplies",
    total: 8500,
    status: "ACEPTADA",
    requester: "María García",
    costCenter: "CC-002",
    paymentMethod: "Contado",
    type: "Local",
    items: [
      { productId: "p-020", productName: "Etiqueta Industrial", quantity: 2000, unitPrice: 2.5 },
      { productId: "p-021", productName: "Cinta Adhesiva", quantity: 50, unitPrice: 15.0 },
    ],
  },
]

export default function InboundsPage() {
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const todayCount = receipts.filter(
    (r) => new Date(r.date).toDateString() === new Date().toDateString()
  ).length

  const completedCount = receipts.filter((r) => r.status === "COMPLETADA").length
  const partialCount = receipts.filter((r) => r.status === "PARCIAL").length
  const pendingCount = 14 // Mock pending

  const handleNewReceipt = (data: {
    purchaseOrderId: string
    items: { productId: string; receivedQuantity: number }[]
    notes: string
  }) => {
    console.log("[v0] New receipt submitted:", data)
    // In a real app, this would call the API
  }

  return (
    <div>
      {/* Page Header */}
      <PageHeader
        title="Recepciones de Mercancía"
        subtitle="Registra y consulta las notas de recepción contra órdenes de compra aprobadas."
        actions={
          <>
            <Button variant="outline" size="sm" className="bg-card">
              <Download className="size-4" /> Exportar
            </Button>
            <Button size="sm" onClick={() => setIsModalOpen(true)}>
              <Plus className="size-4" /> Nueva Recepción
            </Button>
          </>
        }
      />

      {/* KPI Strip */}
      <InboundsKPICards
        todayCount={todayCount}
        pendingCount={pendingCount}
        partialCount={partialCount}
        completedCount={completedCount}
      />

      {/* Two Column Layout */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <ReceiptsTable
            receipts={receipts}
            onSelectReceipt={setSelectedReceipt}
            selectedReceiptId={selectedReceipt?.id}
          />
        </div>
        <div className="col-span-1">
          {selectedReceipt ? (
            <ReceiptDetailPanel
              receipt={selectedReceipt}
              onClose={() => setSelectedReceipt(null)}
            />
          ) : (
            <div className="bg-white rounded-lg border border-[#f3f4f6] p-8 text-center">
              <p className="text-[#6b7280] text-sm">
                Selecciona una recepción de la tabla para ver los detalles
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Nueva Recepción Modal */}
      <NuevaRecepcionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        purchaseOrders={mockPurchaseOrders}
        onSubmit={handleNewReceipt}
      />
    </div>
  )
}
