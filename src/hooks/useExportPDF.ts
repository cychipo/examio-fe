"use client";

import { useState } from "react";
import { toast } from "@/components/ui/toast";

/**
 * Hook để xuất dữ liệu ra file PDF
 * Sử dụng jsPDF library để generate PDF
 */
export function useExportPDF() {
  const [isExporting, setIsExporting] = useState(false);

  /**
   * Xuất quiz sets sang PDF
   * @param data - Mảng các quiz set cần xuất
   * @param filename - Tên file PDF (không cần extension)
   */
  const exportQuizSetsToPDF = async (
    data: any[],
    filename: string = "quiz-sets"
  ) => {
    setIsExporting(true);
    try {
      // Dynamic import để giảm bundle size
      const JsPDF = (await import("jspdf")).default;
      // Import autoTable plugin - side effect sẽ extend jsPDF prototype
      await import("jspdf-autotable");

      const doc = new JsPDF();

      // Tiêu đề
      doc.setFontSize(18);
      doc.text("Danh sách đề thi", 14, 20);

      // Thông tin export
      doc.setFontSize(10);
      doc.text(`Ngày xuất: ${new Date().toLocaleDateString("vi-VN")}`, 14, 30);
      doc.text(`Tổng số đề: ${data.length}`, 14, 36);

      // Chuẩn bị dữ liệu cho bảng
      const tableData = data.map((item, index) => [
        index + 1,
        item.title || "N/A",
        item.description || "Không có mô tả",
        item._count?.detailsQuizQuestions || 0,
        item.isPublic ? "Công khai" : "Riêng tư",
        new Date(item.createdAt).toLocaleDateString("vi-VN"),
      ]);

      // Vẽ bảng
      (doc as any).autoTable({
        startY: 45,
        head: [
          ["STT", "Tiêu đề", "Mô tả", "Số câu hỏi", "Trạng thái", "Ngày tạo"],
        ],
        body: tableData,
        styles: { fontSize: 9, font: "helvetica" },
        headStyles: { fillColor: [59, 130, 246], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        margin: { top: 45, left: 14, right: 14 },
      });

      // Lưu file
      doc.save(`${filename}.pdf`);
      toast.success("Xuất file PDF thành công");
    } catch (error) {
      console.error("Export PDF failed:", error);
      toast.error("Xuất file PDF thất bại", {
        description: (error as Error).message,
      });
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Xuất flashcard sets sang PDF
   * @param data - Mảng các flashcard set cần xuất
   * @param filename - Tên file PDF (không cần extension)
   */
  const exportFlashcardSetsToPDF = async (
    data: any[],
    filename: string = "flashcard-sets"
  ) => {
    setIsExporting(true);
    try {
      const JsPDF = (await import("jspdf")).default;
      // Import autoTable plugin - side effect sẽ extend jsPDF prototype
      await import("jspdf-autotable");

      const doc = new JsPDF();

      // Tiêu đề
      doc.setFontSize(18);
      doc.text("Danh sách Flashcard", 14, 20);

      // Thông tin export
      doc.setFontSize(10);
      doc.text(`Ngày xuất: ${new Date().toLocaleDateString("vi-VN")}`, 14, 30);
      doc.text(`Tổng số bộ: ${data.length}`, 14, 36);

      // Chuẩn bị dữ liệu cho bảng
      const tableData = data.map((item, index) => [
        index + 1,
        item.title || "N/A",
        item.description || "Không có mô tả",
        item._count?.detailsFlashCard || 0,
        item.isPublic ? "Công khai" : "Riêng tư",
        new Date(item.createdAt).toLocaleDateString("vi-VN"),
      ]);

      // Vẽ bảng
      (doc as any).autoTable({
        startY: 45,
        head: [["STT", "Tiêu đề", "Mô tả", "Số thẻ", "Trạng thái", "Ngày tạo"]],
        body: tableData,
        styles: { fontSize: 9, font: "helvetica" },
        headStyles: { fillColor: [59, 130, 246], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        margin: { top: 45, left: 14, right: 14 },
      });

      // Lưu file
      doc.save(`${filename}.pdf`);
      toast.success("Xuất file PDF thành công");
    } catch (error) {
      console.error("Export PDF failed:", error);
      toast.error("Xuất file PDF thất bại", {
        description: (error as Error).message,
      });
    } finally {
      setIsExporting(false);
    }
  };

  return {
    isExporting,
    exportQuizSetsToPDF,
    exportFlashcardSetsToPDF,
  };
}
