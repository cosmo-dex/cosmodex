"use client";

import { Chapter, UserProgressData } from "./pythonData";
import StationCard from "./StationCard";

interface ProgressSidebarProps {
  selectedChapter: Chapter;
  userProgress?: UserProgressData;
  courseId?: string;
}

export default function ProgressSidebar({
  selectedChapter,
  courseId,
}: ProgressSidebarProps) {
  return (
    <aside className="w-full sticky top-24">
      <StationCard chapter={selectedChapter} courseId={courseId} />
    </aside>
  );
}
