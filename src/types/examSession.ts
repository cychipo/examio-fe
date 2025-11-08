export enum EXAM_SESSION_STATUS {
  UPCOMING = 0,
  ONGOING = 1,
  ENDED = 2,
}

export interface ExamSession {
  id: string;
  examRoomId: string;
  status: EXAM_SESSION_STATUS;
  startTime: string;
  endTime?: string;
  autoJoinByLink: boolean;
}
