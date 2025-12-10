import { api } from "./api";
import { ExamRoom, ExamSessionBasic } from "@/types/examRoom";

export type CredentialsCreateExamRoom = {
  title: string;
  description?: string;
  quizSetId: string;
};

export type CredentialsUpdateExamRoom = {
  title?: string;
  description?: string;
  quizSetId?: string;
};

export type CredentialsGetExamRooms = {
  page: number;
  limit: number;
  search?: string;
  quizSetId?: string;
};

export type ResponseListExamRooms = {
  examRooms: ExamRoom[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type ResponseCreateExamRoom = {
  examRoom: ExamRoom;
};

export type ResponseUpdateExamRoom = {
  examRoom: ExamRoom;
};

export type ResponseDeleteExamRoom = {
  message: string;
};

export type ResponseListExamSessions = {
  sessions: ExamSessionBasic[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export async function createExamRoomApi(
  credentials: CredentialsCreateExamRoom
): Promise<ResponseCreateExamRoom> {
  const response = await api.post("/examrooms", credentials);
  return response.data;
}

export async function getExamRoomsApi(
  credentials: CredentialsGetExamRooms
): Promise<ResponseListExamRooms> {
  const response = await api.get("/examrooms/list", {
    params: credentials,
  });
  return response.data;
}

export async function getExamRoomByIdApi(id: string): Promise<ExamRoom> {
  const response = await api.get(`/examrooms/detail/${id}`);
  return response.data;
}

export async function updateExamRoomApi(
  id: string,
  credentials: CredentialsUpdateExamRoom
): Promise<ResponseUpdateExamRoom> {
  const response = await api.put(`/examrooms/${id}`, credentials);
  return response.data;
}

export async function deleteExamRoomApi(
  id: string
): Promise<ResponseDeleteExamRoom> {
  const response = await api.delete(`/examrooms/${id}`);
  return response.data;
}

export async function getPublicExamRoomByIdApi(id: string): Promise<ExamRoom> {
  const response = await api.get(`/examrooms/get-public/${id}`);
  return response.data;
}

export type ResponseListAllExamRooms = {
  examRooms: ExamRoom[];
};

export async function getAllExamRoomsApi(): Promise<ResponseListAllExamRooms> {
  const response = await api.get("/examrooms/list-all");
  return response.data;
}

export async function getExamRoomSessionsApi(
  examRoomId: string,
  page = 1,
  limit = 10
): Promise<ResponseListExamSessions> {
  const response = await api.get(`/examrooms/${examRoomId}/sessions`, {
    params: { page, limit },
  });
  return response.data;
}
