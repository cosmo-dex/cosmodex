import { getExerciseFromMarkdown } from "@/lib/mdExercises";
import TheoryExerciseClientView from "@/components/learn/TheoryExerciseClientView";
import NoExercisesView from "@/components/learn/NoExercisesView";

interface TheoryPageProps {
  params: Promise<{
    courseId: string;
    lessonId: string;
  }>;
}

export default async function DynamicTheoryPage({ params }: TheoryPageProps) {
  const { courseId, lessonId } = await params;

  const exercise = getExerciseFromMarkdown(courseId, lessonId);

  if (!exercise) {
    return <NoExercisesView courseId={courseId} />;
  }

  return <TheoryExerciseClientView exercise={exercise} />;
}
