export enum EXAM_SESSION_STATUS {
  UPCOMING = 0,
  ONGOING = 1,
  ENDED = 2,
}

export enum ASSESS_TYPE {
  PUBLIC = 0,
  PRIVATE = 1,
}

export interface ExamSession {
  id: string;
  examRoomId: string;
  status: EXAM_SESSION_STATUS;
  startTime: string;
  endTime?: string;
  autoJoinByLink: boolean;
  // Security and access control fields
  assessType: ASSESS_TYPE;
  allowRetake: boolean;
  maxAttempts: number;
  accessCode?: string;
  whitelist?: string[];
  showAnswersAfterSubmit?: boolean;
  passingScore?: number;
  createdAt?: string;
  updatedAt?: string;
  // Relations
  examRoom?: ExamRoomBasic;
  _count?: {
    examAttempts?: number;
  };
}

export interface ExamRoomBasic {
  id: string;
  title: string;
  description?: string;
  quizSet?: {
    id: string;
    title: string;
    thumbnail?: string;
    description?: string;
  };
  host?: {
    id: string;
    username: string;
    name?: string;
    avatar?: string;
    email?: string;
  };
}

export interface AccessCheckResult {
  hasAccess: boolean;
  accessType: "public" | "owner" | "whitelist" | "code_required" | "denied";
  requiresCode?: boolean;
}

export interface ExamSessionPublicInfo {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  status: number;
  isPublic: boolean;
  requiresCode: boolean;
  creator: {
    id: string;
    username: string;
    name: string | null;
    avatar: string | null;
  };
  examRoom: {
    id: string;
    title: string;
    description: string | null;
  };
}

export interface ExamSessionForStudy extends ExamSession {
  questions: {
    id: string;
    question: string;
    options: string[];
    answer?: string; // Only present for owners
  }[];
  creator: {
    id: string;
    username: string;
    name: string | null;
    avatar: string | null;
  };
  isOwner?: boolean;
}

export interface SharingSettings {
  id: string;
  isPublic: boolean;
  accessCode: string | null;
  whitelist: {
    id: string;
    username: string;
    name: string | null;
    avatar: string | null;
    email: string;
  }[];
}
