import { useState, useCallback } from "react"

interface UsePaginationOptions {
  initialPage?: number
  initialSize?: number
  defaultSize?: number
}

interface PaginationState {
  page: number
  size: number
  totalPages: number
  totalElements: number
}

export function usePagination(options: UsePaginationOptions = {}) {
  const { initialPage = 0, initialSize = 20, defaultSize = 20 } = options

  const [pagination, setPagination] = useState<PaginationState>({
    page: initialPage,
    size: initialSize,
    totalPages: 0,
    totalElements: 0,
  })

  const setPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }, [])

  const setSize = useCallback((size: number) => {
    setPagination((prev) => ({ ...prev, size, page: 0 }))
  }, [])

  const setTotalPages = useCallback((totalPages: number) => {
    setPagination((prev) => ({ ...prev, totalPages }))
  }, [])

  const setTotalElements = useCallback((totalElements: number) => {
    setPagination((prev) => ({ ...prev, totalElements }))
  }, [])

  const setPaginationMeta = useCallback(
    (totalPages: number, totalElements: number) => {
      setPagination((prev) => ({ ...prev, totalPages, totalElements }))
    },
    []
  )

  const reset = useCallback(() => {
    setPagination({
      page: initialPage,
      size: defaultSize,
      totalPages: 0,
      totalElements: 0,
    })
  }, [initialPage, defaultSize])

  return {
    ...pagination,
    setPage,
    setSize,
    setTotalPages,
    setTotalElements,
    setPaginationMeta,
    reset,
  }
}
