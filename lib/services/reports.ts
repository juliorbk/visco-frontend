import { api } from "@/lib/api"
import type {
  ReportAnalyticsDTO,
  ReportDTO,
  ScheduledReportDTO,
  CreateReportRequest,
  CreateScheduledReportRequest,
  UpdateScheduledReportRequest,
  Page,
} from "@/lib/types"

export async function fetchReports(
  page = 0,
  size = 20,
  type?: string,
  status?: string,
  signal?: AbortSignal
): Promise<Page<ReportDTO>> {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    sortBy: "createdAt",
    sortDir: "desc",
  })
  if (type) params.append("type", type)
  if (status) params.append("status", status)

  return api.get<Page<ReportDTO>>(`/api/reports?${params.toString()}`, signal)
}

export async function fetchReport(id: number): Promise<ReportDTO> {
  return api.get<ReportDTO>(`/api/reports/${id}`)
}

export async function generateReport(data: CreateReportRequest): Promise<ReportDTO> {
  return api.post<ReportDTO>("/api/reports/generate", data)
}

export async function deleteReport(id: number): Promise<void> {
  await api.delete(`/api/reports/${id}`)
}

export function getReportDownloadUrl(id: number): string {
  return `${process.env.NEXT_PUBLIC_API_URL}/api/reports/${id}/download`
}

function inferReportExtension(format?: string, contentType?: string): string {
  const fmt = (format ?? "").toUpperCase()
  const ct = (contentType ?? "").toLowerCase()
  if (fmt === "PDF" || ct.includes("pdf")) return "pdf"
  if (
    fmt === "EXCEL" ||
    ct.includes("spreadsheet") ||
    ct.includes("excel") ||
    ct.includes("openxmlformats-officedocument")
  ) {
    return "xlsx"
  }
  if (fmt === "JSON" || ct.includes("json")) return "json"
  if (ct.includes("csv")) return "csv"
  return "bin"
}

export async function downloadReport(
  id: number,
  reportName?: string,
  format?: string,
): Promise<void> {
  const url = getReportDownloadUrl(id)
  const res = await fetch(url, { credentials: "include" })
  if (!res.ok) {
    let message = "Error al descargar reporte"
    try {
      const err = await res.json()
      if (err?.error) message = String(err.error)
      else if (err?.detail) message = String(err.detail)
    } catch {}
    throw new Error(message)
  }

  const blob = await res.blob()
  const contentType = res.headers.get("Content-Type") ?? ""
  const ext = inferReportExtension(format, contentType)
  const safeName = (reportName ?? `reporte-${id}`).replace(/[^a-zA-Z0-9-_]+/g, "_")
  const datePart = new Date().toISOString().split("T")[0]
  const filename = `${safeName}-${datePart}.${ext}`

  const downloadUrl = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = downloadUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.URL.revokeObjectURL(downloadUrl)
}

export async function fetchReportTemplates(): Promise<{ type: string; displayName: string }[]> {
  return api.get<{ type: string; displayName: string }[]>("/api/reports/templates")
}

export async function fetchReportAnalytics(): Promise<ReportAnalyticsDTO> {
  return api.get<ReportAnalyticsDTO>("/api/reports/analytics")
}

// Scheduled reports
export async function fetchScheduledReports(): Promise<ScheduledReportDTO[]> {
  return api.get<ScheduledReportDTO[]>("/api/reports/scheduled")
}

export async function createScheduledReport(
  data: CreateScheduledReportRequest
): Promise<ScheduledReportDTO> {
  return api.post<ScheduledReportDTO>("/api/reports/scheduled", data)
}

export async function updateScheduledReport(
  id: number,
  data: UpdateScheduledReportRequest
): Promise<ScheduledReportDTO> {
  return api.put<ScheduledReportDTO>(`/api/reports/scheduled/${id}`, data)
}

export async function deleteScheduledReport(id: number): Promise<void> {
  await api.delete(`/api/reports/scheduled/${id}`)
}

export async function executeScheduledReport(id: number): Promise<ReportDTO> {
  return api.post<ReportDTO>(`/api/reports/scheduled/${id}/execute`)
}
