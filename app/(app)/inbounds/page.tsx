"use client"

import { useCallback, useEffect, useState } from "react"
import { Download, Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/visco/page-header"
import { InboundsKPICards } from "@/components/visco/inbounds/kpi-cards"
import { ReceiptsTable } from "@/components/visco/inbounds/receipts-table"
import { ReceiptDetailPanel } from "@/components/visco/inbounds/receipt-detail-panel"
import { NuevaRecepcionModal } from "@/components/visco/inbounds/nueva-recepcion-modal"
import { fetchReceipts } from "@/lib/services/warehouse"
import { fetchOrders as fetchPOs } from "@/lib/services/procurement"
import type { GoodReceiptResponse, PurchaseOrderResponse } from "@/lib/types"
import { toast } from "sonner"

export default function InboundsPage() {
  const [receipts, setReceipts] = useState<GoodReceiptResponse[]>([])
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReceipt, setSelectedReceipt] = useState<GoodReceiptResponse | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const [recRes, poRes] = await Promise.all([
        fetchReceipts(0, 50),
        fetchPOs(),
      ])
      setReceipts(recRes.content ?? [])
      setPurchaseOrders(poRes)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al cargar datos")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const todayCount = receipts.filter(
    (r) => new Date(r.receivedAt).toDateString() === new Date().toDateString()
  ).length

  const completedCount = receipts.filter((r) => r.updatedStatus === "DELIVERED").length
  const partialCount = receipts.filter((r) => r.updatedStatus === "PARTIALLY_DELIVERED").length
  const pendingCount = purchaseOrders.filter((p) => p.status === "APPROVED" || p.status === "IN_TRANSIT").length

  const handleNewReceipt = async () => {
    load()
    setIsModalOpen(false)
  }

  return (
    <div>
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

      <InboundsKPICards
        todayCount={todayCount}
        pendingCount={pendingCount}
        partialCount={partialCount}
        completedCount={completedCount}
      />

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ReceiptsTable
              receipts={receipts}
              onSelectReceipt={setSelectedReceipt}
              selectedReceiptId={selectedReceipt?.id}
            />
          </div>
          <div className="lg:col-span-1">
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
      )}

      <NuevaRecepcionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        purchaseOrders={purchaseOrders}
        onSubmit={handleNewReceipt}
      />
    </div>
  )
}
