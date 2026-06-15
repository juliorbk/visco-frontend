"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowPathIcon, ChevronLeftIcon, ChevronRightIcon, DocumentTextIcon, ShoppingCartIcon } from "@heroicons/react/24/outline"
import { Button } from "@/components/ui/button"
import { fetchOrdersByProduct } from "@/lib/services/procurement"
import type { Page, ProductPurchaseOrderSummary } from "@/lib/types"

const PAGE_SIZE = 10

export function ProductPurchaseOrders({ productId }: { productId: number }) {
  const router = useRouter()
  const [orders, setOrders] = useState<ProductPurchaseOrderSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    fetchOrdersByProduct(productId, page, PAGE_SIZE, controller.signal)
      .then((res: Page<ProductPurchaseOrderSummary>) => {
        setOrders(res.content ?? [])
        setTotalPages(res.page?.totalPages ?? 0)
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setOrders([])
          setTotalPages(0)
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [productId, page])

  if (loading) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/60 p-8 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
        <ArrowPathIcon className="size-5 animate-spin" />
        Cargando órdenes de compra…
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/60 p-8 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
        <ShoppingCartIcon className="size-5" />
        Este producto aún no ha sido pedido.
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <DocumentTextIcon className="size-4 text-muted-foreground" />
        <span className="text-sm font-medium">Órdenes de compra</span>
      </div>

      <div className="rounded-xl border bg-card divide-y">
        {orders.map((po) => (
          <button
            key={po.orderId}
            type="button"
            onClick={() => router.push(`/procurement?orderId=${po.orderId}`)}
            className="w-full text-left p-3 hover:bg-muted/30 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-sm font-medium text-[#7b1a1a]">
                    {po.orderNumber}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(po.createdAt).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {po.supplierName}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-medium">
                  {po.quantityOrdered} <span className="text-xs text-muted-foreground">uds</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {po.unitPrice.toLocaleString("es-ES", {
                    style: "currency",
                    currency: "USD",
                    minimumFractionDigits: 2,
                  })} / ud
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-3 px-1">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0 || loading}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            <ChevronLeftIcon className="size-4 mr-1" /> Anterior
          </Button>
          <span className="text-xs text-muted-foreground">
            Página {page + 1} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages - 1 || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            Siguiente <ChevronRightIcon className="size-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  )
}
