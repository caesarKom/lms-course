import { getCourseSidebar } from "@/app/data/course/get-course-sidebar";
import { CourseSidebar } from "../_components/course-sidebar";

interface Props {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}

export default async function DashboardSlugLayout({ children, params }: Props) {
  const { slug } = await params;
  const course = await getCourseSidebar(slug);

  return (
    <div className="flex flex-1">
      {/* Sidebar 30% */}
      <div className="w-80 border-r border-border shrink-0">
        <CourseSidebar course={course.course} />
      </div>

      {/* Main content 70% */}
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
