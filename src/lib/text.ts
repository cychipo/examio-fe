const MOJIBAKE_PATTERN = /[ÃÂÄÐ]/;

export function repairVietnameseText(value?: string | null) {
  if (!value) {
    return "";
  }

  const normalizedMap: Record<string, string> = {
    "Mac dinh": "Mặc định",
    "Khong kha dung": "Không khả dụng",
    "Loai": "Loại",
    "Model local can bang giua toc do va chat luong.":
      "Model local cân bằng giữa tốc độ và chất lượng.",
    "Model local manh hon cho bai toan can chat luong cao.":
      "Model local mạnh hơn cho bài toán cần chất lượng cao.",
    "Embedding model dung chung cho toan bo he thong.":
      "Embedding model dùng chung cho toàn bộ hệ thống.",
    "VRAM goi y": "VRAM gợi ý",
    "Tham so": "Tham số",
    "Manh": "Mạnh",
  };

  if (normalizedMap[value]) {
    return normalizedMap[value];
  }

  if (!MOJIBAKE_PATTERN.test(value)) {
    return value;
  }

  try {
    const bytes = Uint8Array.from(value, (char) => char.charCodeAt(0));
    const decoded = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
    return decoded || value;
  } catch {
    return value;
  }
}
