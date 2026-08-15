export interface TheorySection {
  id: string;
  heading?: string; // e.g. "A Brief History" (rendered with cyan # icon)
  content: string[]; // Paragraphs of text (supports **bold** terms and emojis)
  bulletPoints?: string[]; // Optional bulleted list items
  illustration?: "command-line" | "variables" | "functions" | "general";
}

export interface TheoryExercise {
  id: string;
  courseId: string;
  courseTitle: string;
  chapterNumber: string; // e.g. "01"
  title: string; // e.g. "In The Beginning..."
  exerciseIndex: number; // e.g. 1
  totalExercises: number; // e.g. 6
  xp: number; // e.g. 10
  category: string; // e.g. "Exercise"
  activeGrindersCount: number; // e.g. 4
  sections: TheorySection[];
  prevLessonId?: string;
  nextLessonId?: string;
}
