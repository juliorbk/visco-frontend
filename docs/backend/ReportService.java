package com.visco.reports.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.visco.reports.dto.GenerateReportRequest;
import com.visco.reports.dto.ReportFormat;
import com.visco.reports.dto.ReportType;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class ReportService {

    private static final Logger log = LoggerFactory.getLogger(ReportService.class);

    private final ReportDataService dataService;
    private final ObjectMapper objectMapper;

    public ReportService(ReportDataService dataService, ObjectMapper objectMapper) {
        this.dataService = dataService;
        this.objectMapper = objectMapper;
    }

    /**
     * Genera el reporte directamente en memoria (sin escribir a disco).
     * Devuelve el contenido listo para ResponseEntity<byte[]>.
     */
    public byte[] generateInMemory(GenerateReportRequest req) {
        return switch (req.format()) {
            case PDF -> generatePdf(req);
            case EXCEL -> generateExcel(req);
            case JSON -> generateJson(req);
        };
    }

    private byte[] generatePdf(GenerateReportRequest req) {
        try (var out = new ByteArrayOutputStream()) {
            var document = new com.lowagie.text.Document(com.lowagie.text.PageSize.A4);
            com.lowagie.text.pdf.PdfWriter.getInstance(document, out);
            document.open();

            document.add(new com.lowagie.text.Paragraph(
                "VISCO ORINOCO - " + req.name(),
                new com.lowagie.text.Font(com.lowagie.text.Font.HELVETICA, 16, com.lowagie.text.Font.BOLD)
            ));
            document.add(new com.lowagie.text.Paragraph(
                "Período: %s — %s".formatted(req.startDate(), req.endDate())
            ));
            document.add(new com.lowagie.text.Paragraph(" "));

            List<Map<String, Object>> rows = fetchData(req);
            if (!rows.isEmpty()) {
                var table = new com.lowagie.text.pdf.PdfPTable(rows.get(0).size());
                rows.get(0).keySet().forEach(k ->
                    table.addCell(new com.lowagie.text.Phrase(k))
                );
                for (var row : rows) {
                    row.values().forEach(v ->
                        table.addCell(new com.lowagie.text.Phrase(String.valueOf(v)))
                    );
                }
                document.add(table);
            }

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            log.error("Error generating PDF report: {}", e.getMessage(), e);
            throw new RuntimeException("Error generating PDF report: " + e.getMessage(), e);
        }
    }

    private byte[] generateExcel(GenerateReportRequest req) {
        try (var wb = new XSSFWorkbook(); var out = new ByteArrayOutputStream()) {
            var sheet = wb.createSheet(req.type().name());

            var headerStyle = wb.createCellStyle();
            var headerFont = wb.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            List<Map<String, Object>> rows = fetchData(req);
            int rowIdx = 0;

            if (!rows.isEmpty()) {
                var headerRow = sheet.createRow(rowIdx++);
                var headers = rows.get(0).keySet().toArray(new String[0]);
                for (int i = 0; i < headers.length; i++) {
                    var cell = headerRow.createCell(i);
                    cell.setCellValue(headers[i]);
                    cell.setCellStyle(headerStyle);
                    sheet.setColumnWidth(i, 18 * 256);
                }

                for (var row : rows) {
                    var r = sheet.createRow(rowIdx++);
                    int col = 0;
                    for (var value : row.values()) {
                        var cell = r.createCell(col++);
                        if (value instanceof Number n) {
                            cell.setCellValue(n.doubleValue());
                        } else if (value != null) {
                            cell.setCellValue(String.valueOf(value));
                        }
                    }
                }
            }

            wb.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            log.error("Error generating Excel report: {}", e.getMessage(), e);
            throw new RuntimeException("Error generating Excel report: " + e.getMessage(), e);
        }
    }

    private byte[] generateJson(GenerateReportRequest req) {
        try {
            return objectMapper.writeValueAsBytes(Map.of(
                "name", req.name(),
                "type", req.type(),
                "format", req.format(),
                "generatedAt", LocalDateTime.now().toString(),
                "startDate", req.startDate().toString(),
                "endDate", req.endDate().toString(),
                "rows", fetchData(req)
            ));
        } catch (JsonProcessingException e) {
            log.error("Error generating JSON report: {}", e.getMessage(), e);
            throw new RuntimeException("Error generating JSON report: " + e.getMessage(), e);
        }
    }

    /**
     * Trae los datos del reporte desde tus repositorios/servicios.
     * Aquí va la lógica que ya tenías, pero en vez de escribir a archivo,
     * devuelve los datos en memoria.
     */
    private List<Map<String, Object>> fetchData(GenerateReportRequest req) {
        return switch (req.type()) {
            case STOCK_INVENTORY -> dataService.fetchStockInventory(req);
            case STOCK_MOVEMENTS -> dataService.fetchStockMovements(req);
            case CRITICAL_ALERTS -> dataService.fetchCriticalAlerts(req);
            case WAREHOUSE_ANALYSIS -> dataService.fetchWarehouseAnalysis(req);
        };
    }
}
