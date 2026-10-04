"use client";

import { Chapter, UserProgressData } from "./pythonData";
import StationCard from "./StationCard";

interface ProgressSidebarProps {
  selectedChapter: Chapter;
  userProgress?: UserProgressData;
  courseId?: string;
  allChapters?: Chapter[];
}

export default function ProgressSidebar({
  selectedChapter,
  courseId,
  allChapters = [],
}: ProgressSidebarProps) {
  return (
    <aside className="w-full">
      <StationCard
        chapter={selectedChapter}
        courseId={courseId}
        allChapters={allChapters}
      />
    </aside>
  );
}
