import type { jsPDF } from "jspdf"

export function downloadPDF(doc: jsPDF, filename: string) {
  doc.save(filename)
}
