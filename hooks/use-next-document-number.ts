import { useEffect, useState } from "react"

interface DocItem {
  requisitionNumber?: string
  orderNumber?: string
}

function parseSequential(prefix: string, num: string | undefined, currentYear: number) {
  if (!num) return 0
  const regex = new RegExp(`^${prefix}-(\\d{4})/(\\d{4})$`)
  const match = num.match(regex)
  if (!match) return 0
  const year = parseInt(match[2], 10)
  if (year !== currentYear) return 0
  return parseInt(match[1], 10)
}

export function useNextDocumentNumber(
  open: boolean,
  prefix: string,
  fetchFn: () => Promise<DocItem[]>,
) {
  const [nextNumber, setNextNumber] = useState("")
  const [loading, setLoading] = useState(false)
  const year = new Date().getFullYear()

  useEffect(() => {
    if (!open) return
    let cancelled = false

    const compute = async () => {
      setLoading(true)
      try {
        const items = await fetchFn()
        if (cancelled) return
        let maxSeq = 0
        for (const item of items) {
          const num = item.requisitionNumber ?? item.orderNumber
          const seq = parseSequential(prefix, num, year)
          if (seq > maxSeq) maxSeq = seq
        }
        const next = String(maxSeq + 1).padStart(4, "0")
        setNextNumber(`${prefix}-${next}/${year}`)
      } catch {
        if (!cancelled) {
          const fallback = String(1).padStart(4, "0")
          setNextNumber(`${prefix}-${fallback}/${year}`)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    compute()
    return () => { cancelled = true }
  }, [open, prefix, year, fetchFn])

  return { nextNumber, loading }
}
