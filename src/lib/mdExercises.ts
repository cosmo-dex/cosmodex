import fs from "fs";
import path from "path";
import { TheoryExercise, TheorySection } from "@/data/theoryExercisesData";
import { PYTHON_COURSE_CHAPTERS } from "@/data/courses/python";

// Helper function to parse frontmatter YAML without external dependencies
function parseFrontmatter(fileContent: string) {
  const match = fileContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    return { data: {}, content: fileContent };
  }

  const yamlBlock = match[1];
  const markdownBody = match[2];
  const data: Record<string, string | number> = {};

  yamlBlock.split(/\r?\n/).forEach((line) => {
    const colonIndex = line.indexOf(":");
    if (colonIndex !== -1) {
      const key = line.slice(0, colonIndex).trim();
      let value: string | number = line.slice(colonIndex + 1).trim();

      // Clean quotes & numbers
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      } else if (!isNaN(Number(value)) && value !== "") {
        value = Number(value);
      }
      data[key] = value;
    }
  });

  return { data, content: markdownBody };
}

// Helper to parse Markdown body into structured sections
function parseMarkdownToSections(body: string, defaultIllustration?: string): TheorySection[] {
  const lines = body.split(/\r?\n/);
  const sections: TheorySection[] = [];

  let currentHeading: string | undefined = undefined;
  let currentParagraphs: string[] = [];
  let currentBullets: string[] = [];
  let sectionCount = 0;

  const pushCurrentSection = () => {
    if (currentParagraphs.length > 0 || currentBullets.length > 0) {
      sectionCount++;
      sections.push({
        id: `sec-${sectionCount}`,
        heading: currentHeading,
        content: [...currentParagraphs],
        bulletPoints: currentBullets.length > 0 ? [...currentBullets] : undefined,
        illustration: (defaultIllustration as "command-line" | "variables" | "functions" | "general") || "command-line",
      });
      currentParagraphs = [];
      currentBullets = [];
    }
  };

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    if (trimmed.startsWith("# ")) {
      pushCurrentSection();
      currentHeading = trimmed.slice(2).trim();
    } else if (trimmed.startsWith("## ")) {
      pushCurrentSection();
      currentHeading = trimmed.slice(3).trim();
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      currentBullets.push(trimmed.slice(2).trim());
    } else {
      currentParagraphs.push(trimmed);
    }
  });

  pushCurrentSection();

  return sections;
}

import { Chapter } from "@/components/learn/pythonData";

export function getExerciseFromMarkdown(courseId: string, lessonId: string): TheoryExercise | null {
  try {
    // 1. First check if course is Python and lesson matches a chapter in our JSON course data
    if (courseId === "py-1" || courseId === "python") {
      const chapters = PYTHON_COURSE_CHAPTERS as unknown as Chapter[];
      const chapterIndex = chapters.findIndex(
        (ch) => ch.theoryLessonId === lessonId || ch.id === lessonId
      );

      if (chapterIndex !== -1) {
        const ch = chapters[chapterIndex];
        const prevChapter = chapters[chapterIndex - 1];
        const nextChapter = chapters[chapterIndex + 1];

        if (ch.documentation && ch.documentation.sections) {
          return {
            id: ch.theoryLessonId || ch.id,
            courseId: courseId,
            courseTitle: "Python",
            chapterNumber: String(ch.number).padStart(2, "0"),
            title: ch.documentation.title || ch.title,
            exerciseIndex: ch.number,
            totalExercises: chapters.length,
            xp: 10,
            category: "Exercise",
            activeGrindersCount: 4,
            prevLessonId: prevChapter ? (prevChapter.theoryLessonId || prevChapter.id) : undefined,
            nextLessonId: nextChapter ? (nextChapter.theoryLessonId || nextChapter.id) : undefined,
            sections: ch.documentation.sections.map((sec, i) => ({
              id: `sec-${i + 1}`,
              heading: sec.heading,
              content: sec.content,
              illustration: "command-line",
            })),
          };
        }
      }
    }

    // 2. Fallback to markdown content files if available
    const filePath = path.join(
      process.cwd(),
      "src",
      "content",
      "courses",
      courseId,
      `${lessonId}.md`
    );

    if (!fs.existsSync(filePath)) {
      return null;
    }

    const fileContent = fs.readFileSync(filePath, "utf8");
    const { data, content } = parseFrontmatter(fileContent);

    return {
      id: String(data.id || lessonId),
      courseId: String(data.courseId || courseId),
      courseTitle: String(data.courseTitle || "Python"),
      chapterNumber: String(data.chapterNumber || "01"),
      title: String(data.title || "In The Beginning..."),
      exerciseIndex: Number(data.exerciseIndex || 1),
      totalExercises: Number(data.totalExercises || 6),
      xp: Number(data.xp || 10),
      category: String(data.category || "Exercise"),
      activeGrindersCount: Number(data.activeGrindersCount || 4),
      prevLessonId: data.prevLessonId ? String(data.prevLessonId) : undefined,
      nextLessonId: data.nextLessonId ? String(data.nextLessonId) : undefined,
      sections: parseMarkdownToSections(content, data.illustration ? String(data.illustration) : undefined),
    };
  } catch (error) {
    console.error("Error reading exercise file:", error);
    return null;
  }
}
