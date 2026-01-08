import { api } from "./api";

// ================== TYPES ==================

export interface SubjectCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  subjects?: Subject[];
}

export interface Subject {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category?: SubjectCategory;
}

export interface SubjectListResponse {
  categories: SubjectCategory[];
}

export interface SubjectDetailResponse {
  subject: Subject;
}

// ================== API ==================

export const subjectApi = {
  /**
   * Get all subject categories with their subjects
   */
  getCategories: async (): Promise<SubjectListResponse> => {
    const response = await api.get("/subjects/categories");
    return response.data;
  },

  /**
   * Get all subjects (flat list)
   */
  getSubjects: async (): Promise<{ subjects: Subject[] }> => {
    const response = await api.get("/subjects");
    return response.data;
  },

  /**
   * Get a single subject by ID
   */
  getSubject: async (id: string): Promise<SubjectDetailResponse> => {
    const response = await api.get(`/subjects/${id}`);
    return response.data;
  },

  /**
   * Get a single subject by slug
   */
  getSubjectBySlug: async (slug: string): Promise<SubjectDetailResponse> => {
    const response = await api.get(`/subjects/slug/${slug}`);
    return response.data;
  },
};
