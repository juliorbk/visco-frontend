package com.visco.reports.dto;

import java.time.LocalDate;
import java.util.Map;

public record GenerateReportRequest(
    String name,
    ReportType type,
    ReportFormat format,
    LocalDate startDate,
    LocalDate endDate,
    Long categoryId,
    Long warehouseId,
    String search,
    Map<String, Object> additionalFilters
) {}
