import { PDFDocument } from "pdf-lib";

/**
 * Count the number of pages in a PDF file
 * @param file - The PDF file
 * @returns The number of pages
 */
export async function getPdfPageCount(file: File): Promise<number> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    return pdfDoc.getPageCount();
  } catch (error) {
    console.error("Error counting PDF pages:", error);
    throw new Error("Không thể đọc file PDF");
  }
}

/**
 * Validate PDF page count
 * @param file - The PDF file
 * @param maxPages - Maximum allowed pages (default: 50)
 * @returns True if valid, false otherwise
 */
export async function validatePdfPageCount(
  file: File,
  maxPages: number = 9999
): Promise<{ valid: boolean; pageCount: number }> {
  const pageCount = await getPdfPageCount(file);
  return {
    valid: pageCount <= maxPages,
    pageCount,
  };
}
