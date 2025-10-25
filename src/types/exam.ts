export interface Quizz {
  question: string;
  options: string[];
  answer: string;
}

export interface Flashcard {
  question: string;
  answer: string;
}

export enum TypeResultGenerateExam {
  QUIZZ = 1,
  FLASHCARD = 2,
}
