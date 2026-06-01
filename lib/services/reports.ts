import { api } from "@/lib/api"
import type {
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

export async function fetchReportTemplates(): Promise<{ type: string; displayName: string }[]> {
  return api.get<{ type: string; displayName: string }[]>("/api/reports/templates")
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
