import { api } from "./api";
import { TypeResultGenerateExam, Quizz, Flashcard } from "@/types/exam";

export interface CredentialsGenerateExam {
  file: File;
  quantityQuizz?: number;
  quantityFlashcard?: number;
  typeResult: TypeResultGenerateExam;
  isNarrowSearch: boolean;
  keyword?: string; // valuable when valuable isNarrowSearch is true
}

export async function generateExamApi(
  credentials: CredentialsGenerateExam
): Promise<Quizz[] | Flashcard[]> {
  const formData = new FormData();
  formData.append("file", credentials.file);
  formData.append("typeResult", credentials.typeResult.toString());
  formData.append("isNarrowSearch", credentials.isNarrowSearch.toString());
  if (credentials.quantityQuizz) {
    formData.append("quantityQuizz", credentials.quantityQuizz.toString());
  }
  if (credentials.quantityFlashcard) {
    formData.append(
      "quantityFlashcard",
      credentials.quantityFlashcard.toString()
    );
  }
  if (credentials.keyword) {
    formData.append("keyword", credentials.keyword);
  }

  const response = await api.post("/ai/generate-from-file", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}
