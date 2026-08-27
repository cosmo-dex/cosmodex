import { PYTHON_COURSE_CHAPTERS } from "@/data/courses/python";

export interface Exercise {
  id: string;
  numberLabel: string; // e.g. "Exercise 1" or "Bonus Article"
  title: string;
  isUnlocked: boolean;
  isCompleted?: boolean;
  isBonus?: boolean;
  instruction?: string;
  initialCode?: string;
  hints?: string[];
  difficulty?: "Basic" | "Easy" | "Medium" | "Hard";
  accuracy?: string;
  submissionsCount?: string;
  constraints?: string[];
  expectedComplexity?: { time: string; space: string };
  companyTags?: string[];
  exampleBoxes?: { input: string; output: string; explanation?: string }[];
}

export type PlanetType =
  | "green-crater"
  | "swirl"
  | "striped-banded"
  | "saturn-ring"
  | "grid-web"
  | "moon-crater";

export interface Chapter {
  id: string;
  number: number;
  stationNumber: string; // e.g. "STATION 01"
  title: string;
  description: string;
  xpValue: number;
  planetType: PlanetType;
  isMilestone?: boolean;
  isClubLocked?: boolean;
  isUnlocked: boolean;
  isCompleted?: boolean;
  isCurrent?: boolean;
  theoryLessonId?: string;
  documentation?: {
    title: string;
    sections: { heading?: string; content: string[] }[];
  };
  exercises: Exercise[];
}

export interface UserProgressData {
  username: string;
  level: number;
  avatarUrl: string;
  exercisesCompleted: number;
  totalExercises: number;
  projectsCompleted: number;
  totalProjects: number;
  xpEarned: number;
  totalXp: number;
  badgesUnlocked: number;
  totalBadges: number;
  cheatSheetsUnlocked: number;
  totalCheatSheets: number;
}

export const MOCK_PYTHON_CHAPTERS: Chapter[] = PYTHON_COURSE_CHAPTERS as Chapter[];

const TOTAL_PYTHON_EXERCISES = MOCK_PYTHON_CHAPTERS.reduce(
  (acc, ch) => acc + (ch.exercises ? ch.exercises.length : 0),
  0
) || 43;

const TOTAL_PYTHON_XP = MOCK_PYTHON_CHAPTERS.reduce(
  (acc, ch) => acc + (ch.xpValue || 0),
  0
) || 685;

export const MOCK_USER_PROGRESS: UserProgressData = {
  username: "Explorer",
  level: 1,
  avatarUrl: "/images/avatars/nebula.webp",
  exercisesCompleted: 0,
  totalExercises: TOTAL_PYTHON_EXERCISES,
  projectsCompleted: 0,
  totalProjects: 2,
  xpEarned: 0,
  totalXp: TOTAL_PYTHON_XP,
  badgesUnlocked: 0,
  totalBadges: 8,
  cheatSheetsUnlocked: 0,
  totalCheatSheets: 2,
};

