"use server";

import { requireAdmin } from "@/app/data/admin/reguire-admin";
import { db } from "@/lib/db";
import { ApiResponse } from "@/lib/types";
import { revalidatePath } from "next/cache";

export async function deleteCourse(courseId: string): Promise<ApiResponse> {
  await requireAdmin();

  try {
    await db.course.delete({
      where: { id: courseId },
    });

    revalidatePath("/admin/courses");

    return {
      status: "success",
      message: "Course deleted successfully",
    };
  } catch {
    return {
      status: "error",
      message: "Error delete course",
    };
  }
}
