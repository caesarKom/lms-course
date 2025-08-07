import { db } from "@/lib/db";

export async function getAllCourses() {
  //await new Promise((resolve) => setTimeout(resolve, 10000));
  const data = await db.course.findMany({
    where: {
      status: "Published",
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
      price: true,
      smallDescription: true,
      slug: true,
      fileKey: true,
      level: true,
      duration: true,
      category: true,
    },
  });

  return data;
}

export type AllCoursesType = Awaited<ReturnType<typeof getAllCourses>>[0];
