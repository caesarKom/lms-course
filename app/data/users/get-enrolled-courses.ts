import "server-only";
import { requiredUser } from "./required-user";
import { db } from "@/lib/db";

export async function getEnrolledCourses() {
  const user = await requiredUser();

  const data = await db.enrollment.findMany({
    where: {
      userId: user.id,
      status: "Active",
    },
    select: {
      Course: {
        select: {
          id: true,
          smallDescription: true,
          title: true,
          fileKey: true,
          level: true,
          slug: true,
          duration: true,
          chapter: {
            select: {
              id: true,
              lesson: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return data;
}
