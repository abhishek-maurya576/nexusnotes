export interface Source {
  id: string;
  name: string;
  type: 'pdf' | 'text' | 'image';
  content: string; // Base64 or raw text
  timestamp: number;
}

export interface Note {
  id: string;
  content: string;
  createdAt: number;
}

export interface Infographic {
  id: string;
  imageUrl: string; // Base64 data URI
  createdAt: number;
  prompt: string;
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface FlashcardSet {
  id: string;
  title: string;
  cards: Flashcard[];
  createdAt: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number; // 0-3
  explanation: string;
}

export interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
  createdAt: number;
}

export interface QuizResult {
  id: string;
  quizId: string;
  score: number;
  totalQuestions: number;
  date: number;
  userAnswers: number[]; // Array of indices selected by user
}

export interface Draft {
  id: string;
  title: string;
  type: 'cleanup' | 'essay' | 'study_guide' | 'summary' | 'email';
  content: string;
  createdAt: number;
}

export interface Notebook {
  id: string;
  title: string;
  sources: Source[];
  notes: Note[];
  infographics: Infographic[];
  flashcardSets?: FlashcardSet[];
  quizzes?: Quiz[];
  quizResults?: QuizResult[];
  drafts?: Draft[];
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  sources?: string[]; // Citations
  isLoading?: boolean;
}

export enum ModelType {
  FAST = 'gemini-flash-latest', // Gemini 2.5 Flash
  REASONING = 'gemini-3-pro-preview', // Gemini 3 Pro (High reasoning)
  IMAGE_GEN = 'gemini-3-pro-image-preview', // Image Generation
}