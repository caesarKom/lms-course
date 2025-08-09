import { getLessonContent } from "@/app/data/course/get-lesson";
import { CourseContent } from "./_components/course-content";

type Params = Promise<{ lessonId: string }>;

export default async function LessonIdPage({ params }: { params: Params }) {
  const { lessonId } = await params;
  const lesson = await getLessonContent(lessonId);

  return <CourseContent data={lesson} />;
}
