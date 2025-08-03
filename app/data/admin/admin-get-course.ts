import { db } from "@/lib/db";
import { requireAdmin } from "./reguire-admin";
import { notFound } from "next/navigation";

export async function adminGetCourse(id: string) {
  await requireAdmin();

  const data = await db.course.findUnique({
    where: { id: id },
    include: {
      chapter: {
        include: {
          lesson: true,
        },
      },
    },
  });

  if (!data) {
    return notFound();
  }

  return data;
}

export type AdminCourseSingleType = Awaited<ReturnType<typeof adminGetCourse>>;
