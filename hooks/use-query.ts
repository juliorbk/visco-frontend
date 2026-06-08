import { useCallback, useEffect, useRef, useState } from "react"

interface UseQueryState<T> {
  data: T | null
  isLoading: boolean
  error: Error | null
}

export function useQuery<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  deps: unknown[] = []
): UseQueryState<T> & { refetch: () => void } {
  const [state, setState] = useState<UseQueryState<T>>({
    data: null,
    isLoading: true,
    error: null,
  })
  const abortRef = useRef<AbortController | null>(null)
  const mountedRef = useRef(true)

  const execute = useCallback(() => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    fetcher(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted && mountedRef.current) {
          setState({ data, isLoading: false, error: null })
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted && mountedRef.current) {
          setState({
            data: null,
            isLoading: false,
            error: err instanceof Error ? err : new Error("Error desconocido"),
          })
        }
      })

    return () => {
      controller.abort()
    }
  }, deps)

  useEffect(() => {
    mountedRef.current = true
    const cleanup = execute()
    return () => {
      mountedRef.current = false
      cleanup?.()
    }
  }, [execute])

  return { ...state, refetch: execute }
}
