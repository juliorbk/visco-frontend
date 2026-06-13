# Migración: Reportes → streaming en memoria

## 1. Resumen
Eliminar toda persistencia a disco (`/var/app/reports` o equivalente) y devolver el
reporte como `ResponseEntity<byte[]>` desde el controller.

## 2. Cambios necesarios en el backend

### 2.1 Eliminar lógica de disco
Buscar y eliminar del `ReportService` actual:
- Inyecciones de `app.reports.dir` o paths hardcodeados (`/var/app/reports`, etc.)
- `Files.createDirectories(...)`
- `FileOutputStream` / `new File(...)` / `Paths.get(...).resolve(...)`
- El campo `filePath` en la entidad `Report` ya no necesita escribirse.
  Mantenerlo en la tabla si hay datos legacy, pero dejar de poblarlo.

### 2.2 Reemplazar generación
- Reemplazar el método `generateReport(GenerateReportRequest)` para que devuelva
  `byte[]` en vez de escribir a un archivo.
- Reusar las queries / fetchers existentes (`ReportDataService` o equivalente) que
  ya cargan los datos desde la DB.

### 2.3 Reemplazar endpoint de descarga
- El `GET /api/reports/{id}/download` actual probablemente hace:
  ```java
  Path file = Paths.get("/var/app/reports", report.getFilePath());
  Resource resource = new FileSystemResource(file);
  return ResponseEntity.ok().body(resource);
  ```
- Reemplazarlo por el `ReportController.download` propuesto: regenera el reporte
  en memoria y lo devuelve con `Content-Disposition: attachment`.

### 2.4 Limpiar scheduled reports
Si los reportes programados (`/api/reports/scheduled/execute`) también escriben a
disco, refactorizarlos de la misma forma. Si en vez de descargar solo guardan el
metadata, no hace falta tocarlos.

## 3. Datos legacy en DB
La columna `file_path` puede quedar con valores de reportes antiguos. No molestan
mientras el nuevo `download` los ignore. Si quieres limpiar:

```sql
UPDATE reports SET file_path = NULL WHERE file_path IS NOT NULL;
```

(solo después de confirmar que ningún otro código los lee)

## 4. Verificación end-to-end
1. Backend: `mvn clean install` y reiniciar.
2. Frontend: ya está listo (commit `a02321b`).
3. Generar un reporte nuevo desde la UI → debería crearse `PENDING → PROCESSING → COMPLETED`.
4. Click en "Descargar" → debería bajar el archivo con nombre `<nombre>-<fecha>.<ext>`.

## 5. Rollback
Si algo falla, el endpoint viejo `/api/reports/{id}/download` con lectura de disco
se puede restaurar trivialmente. El cambio es 100% aditivo en el controller.
