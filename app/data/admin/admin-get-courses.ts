import { db } from "@/lib/db";
import { requireAdmin } from "./reguire-admin";

export async function adminGetCourses() {
  //await new Promise((resolve) => setTimeout(resolve, 10000));
  await requireAdmin();

  const data = await db.course.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      smallDescription: true,
      duration: true,
      level: true,
      status: true,
      price: true,
      fileKey: true,
      slug: true,
    },
  });

  return data;
}

export type AdminCoursesType = Awaited<ReturnType<typeof adminGetCourses>>[0];
