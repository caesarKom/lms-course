import { db } from "@/lib/db";
import { notFound } from "next/navigation";

export async function getCourse(slug: string) {
  const course = await db.course.findUnique({
    where: {
      slug: slug,
    },
    select: {
      id: true,
      title: true,
      price: true,
      smallDescription: true,
      description: true,
      slug: true,
      fileKey: true,
      level: true,
      duration: true,
      category: true,
      chapter: {
        select: {
          id: true,
          title: true,
          lesson: {
            select: {
              id: true,
              title: true,
            },
            orderBy: {
              position: "asc",
            },
          },
        },
        orderBy: {
          position: "asc",
        },
      },
    },
  });

  if (!course) return notFound();

  return course;
}

export type CourseType = Awaited<ReturnType<typeof getCourse>>;
