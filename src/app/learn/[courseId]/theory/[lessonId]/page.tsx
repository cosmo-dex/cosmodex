import { getTheoryExercise } from "@/lib/learningService";
import TheoryExerciseClientView from "@/components/learn/TheoryExerciseClientView";
import NoExercisesView from "@/components/learn/NoExercisesView";

export const dynamicParams = true;
export const revalidate = 3600;

interface TheoryPageProps {
  params: Promise<{
    courseId: string;
    lessonId: string;
  }>;
}

export default async function DynamicTheoryPage({ params }: TheoryPageProps) {
  const { courseId, lessonId } = await params;

  const exercise = await getTheoryExercise(courseId, lessonId);

  if (!exercise) {
    return <NoExercisesView courseId={courseId} />;
  }

  return <TheoryExerciseClientView exercise={exercise} />;
}
