export interface TheorySection {
  id: string;
  heading?: string;
  content: string[];
  bulletPoints?: string[];
  illustration?: "command-line" | "variables" | "functions" | "general";
  codeExample?: {
    title?: string;
    input: string;
    output: string;
    explanation?: string;
  };
}

export interface TheoryExercise {
  id: string;
  courseId: string;
  courseTitle: string;
  chapterNumber: string;
  title: string;
  exerciseIndex: number;
  totalExercises: number;
  xp: number;
  category: string;
  activeGrindersCount: number;
  sections: TheorySection[];
  prevLessonId?: string;
  nextLessonId?: string;
  codeExamples?: {
    title: string;
    input: string;
    output: string;
    explanation: string;
  }[];
  practiceQuestion?: {
    title: string;
    description: string;
    input: string;
    output: string;
    explanation: string;
  };
  mcqs?: {
    id: string;
    question: string;
    codeSnippet?: string;
    options: string[];
    correctAnswerIndex: number;
    explanation: string;
  }[];
}
