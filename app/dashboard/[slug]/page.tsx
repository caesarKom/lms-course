import { getCourseSidebar } from "@/app/data/course/get-course-sidebar";
import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function DashboardSlugPage({ params }: Props) {
  const { slug } = await params;
  const course = await getCourseSidebar(slug);

  const firstChapter = course.course.chapter[0];
  const firstLesson = firstChapter.lesson[0];

  if (firstLesson) {
    redirect(`/dashboard/${slug}/${firstLesson.id}`);
  }

  return (
    <div className="flex items-center justify-center h-full text-center">
      <h2 className="text-2xl font-bold mb-2">No Lessons available</h2>
      <p className="text-muted-foreground">
        This course does not have any lesson yet!
      </p>
    </div>
  );
}
