import { getLessonContent } from "@/app/data/course/get-lesson";
import { CourseContent } from "./_components/course-content";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

type Params = Promise<{ lessonId: string }>;

export default async function LessonIdPage({ params }: { params: Params }) {
  const { lessonId } = await params;

  return (
    <Suspense fallback={<LessonSkeleton />}>
      <LessonContentLoader lessonId={lessonId} />
    </Suspense>
  );
}

async function LessonContentLoader({ lessonId }: { lessonId: string }) {
  const lesson = await getLessonContent(lessonId);

  return <CourseContent data={lesson} />;
}

function LessonSkeleton() {
  return (
    <div className="flex flex-col h-full pl-6">
      <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
        <Skeleton className="w-full h-full" />
      </div>

      <div className="flex-1 space-y-6 mt-1">
        <div className="space-y-2">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>

        <div className="space-y-3">
          <Skeleton className=" h-4 w-full" />
          <Skeleton className=" h-4 w-5/6" />
          <Skeleton className=" h-4 w-4/6" />
        </div>

        <div className="flex gap-3">
          <Skeleton className=" h-10 w-32" />
          <Skeleton className=" h-10 w-5/24" />
        </div>
      </div>
    </div>
  );
}
