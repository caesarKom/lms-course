import "server-only";
import { requiredUser } from "../users/required-user";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";

export async function getCourseSidebar(slug: string) {
  const user = await requiredUser();

  const course = await db.course.findUnique({
    where: {
      slug: slug,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      fileKey: true,
      level: true,
      duration: true,
      category: true,
      chapter: {
        orderBy: {
          position: "asc",
        },
        select: {
          id: true,
          title: true,
          position: true,
          lesson: {
            orderBy: {
              position: "asc",
            },
            select: {
              id: true,
              title: true,
              position: true,
              description: true,
            },
          },
        },
      },
    },
  });

  if (!course) {
    return notFound();
  }

  const enrollment = await db.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: user.id,
        courseId: course.id,
      },
    },
    select: {
      status: true,
    },
  });

  if (!enrollment || enrollment.status !== "Active") {
    return notFound();
  }

  return { course };
}

export type CourseSidebarType = Awaited<ReturnType<typeof getCourseSidebar>>;
