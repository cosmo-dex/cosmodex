export interface Exercise {
  id: string;
  numberLabel: string;
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
  stationNumber: string;
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

export const MOCK_PYTHON_CHAPTERS: Chapter[] = [];

export const MOCK_USER_PROGRESS: UserProgressData = {
  username: "Explorer",
  level: 1,
  avatarUrl: "/images/avatars/nebula.webp",
  exercisesCompleted: 0,
  totalExercises: 0,
  projectsCompleted: 0,
  totalProjects: 0,
  xpEarned: 0,
  totalXp: 0,
  badgesUnlocked: 0,
  totalBadges: 8,
  cheatSheetsUnlocked: 0,
  totalCheatSheets: 2,
};
