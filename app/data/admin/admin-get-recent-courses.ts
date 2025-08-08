import { db } from "@/lib/db";
import { requireAdmin } from "./reguire-admin";

export async function adminGetRecentCourses() {
  await requireAdmin();

  const data = await db.course.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 2,
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
