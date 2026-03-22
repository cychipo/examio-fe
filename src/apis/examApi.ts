import { api } from "./api";
import { TypeResultGenerateExam } from "@/types/exam";

export interface CredentialsGenerateExam {
  file: File;
  quantityQuizz?: number;
  quantityFlashcard?: number;
  typeResult: TypeResultGenerateExam;
  isNarrowSearch: boolean;
  keyword?: string; // valuable when valuable isNarrowSearch is true
  modelType?: string; // model id tu registry
}

export interface ResponseGenerateExam {
  jobId: string;
  status: string;
  message: string;
  newBalance?: number;
}

export async function generateExamApi(
  credentials: CredentialsGenerateExam
): Promise<ResponseGenerateExam> {
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
  if (credentials.modelType) {
    formData.append("modelType", credentials.modelType);
  }

  const response = await api.post("/ai/generate-from-file", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}
