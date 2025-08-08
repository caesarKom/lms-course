import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";

export async function checkIfCourseBought(courseId: string): Promise<boolean> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return false;

  const enrollment = await db.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: session.user.id,
        courseId: courseId,
      },
    },
    select: {
      status: true,
    },
  });

  return enrollment?.status === "Active" ? true : false;
}
