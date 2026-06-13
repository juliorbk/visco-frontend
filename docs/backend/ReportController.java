package com.visco.reports.controllers;

import com.visco.reports.dto.GenerateReportRequest;
import com.visco.reports.dto.ReportDTO;
import com.visco.reports.dto.ReportFormat;
import com.visco.reports.services.ReportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Locale;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;
    private final ReportRepository reportRepository;

    public ReportController(ReportService reportService, ReportRepository reportRepository) {
        this.reportService = reportService;
        this.reportRepository = reportRepository;
    }

    /**
     * Descarga el reporte directamente como stream.
     * Sin escribir a disco. El frontend hace fetch+blob+anchor.
     */
    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> download(@PathVariable Long id) {
        ReportDTO report = reportRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Reporte no encontrado: " + id));

        var req = new GenerateReportRequest(
            report.getName(),
            report.getType(),
            report.getFormat(),
            report.getStartDate(),
            report.getEndDate(),
            report.getCategoryId(),
            report.getWarehouseId(),
            report.getSearch(),
            report.getAdditionalFilters()
        );

        byte[] content = reportService.generateInMemory(req);

        String safeName = report.getName()
            .replaceAll("[^a-zA-Z0-9-_]+", "_");
        String extension = report.getFormat().name().toLowerCase(Locale.ROOT);
        String filename = "%s-%s.%s".formatted(
            safeName, LocalDate.now(), extension
        );

        MediaType mediaType = switch (report.getFormat()) {
            case PDF -> MediaType.APPLICATION_PDF;
            case EXCEL -> MediaType.parseMediaType(
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            case JSON -> MediaType.APPLICATION_JSON;
        };

        return ResponseEntity.ok()
            .contentType(mediaType)
            .header(HttpHeaders.CONTENT_DISPOSITION,
                    "attachment; filename=\"" + filename + "\"")
            .header(HttpHeaders.CACHE_CONTROL, "no-store")
            .contentLength(content.length)
            .body(content);
    }
}
