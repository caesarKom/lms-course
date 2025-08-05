"use server";

import { requireAdmin } from "@/app/data/admin/reguire-admin";
import { db } from "@/lib/db";
import { ApiResponse } from "@/lib/types";
import {
  chapterSchema,
  ChapterSchemaType,
  courseSchema,
  CourseSchemaType,
  lessonSchema,
  LessonSchemaType,
} from "@/lib/zod-schemas";
import arcjet, { detectBot, fixedWindow } from "@/lib/arcjet";
import { request } from "@arcjet/next";
import { revalidatePath } from "next/cache";

const aj = arcjet
  .withRule(
    detectBot({
      mode: "LIVE",
      allow: [],
    })
  )
  .withRule(
    fixedWindow({
      mode: "LIVE",
      window: "1m",
      max: 5,
    })
  );

export async function editCourse(
  data: CourseSchemaType,
  courseId: string
): Promise<ApiResponse> {
  const user = await requireAdmin();

  try {
    const req = await request();
    const decision = await aj.protect(req, {
      fingerprint: user.user.id,
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return {
          status: "error",
          message: "You have been blocked due to rate limiting",
        };
      } else {
        return {
          status: "error",
          message: "You are bot! if this is a mistake contact our support.",
        };
      }
    }

    const result = courseSchema.safeParse(data);

    if (!result.success) {
      return {
        status: "error",
        message: "Invalid data",
      };
    }

    await db.course.update({
      where: {
        id: courseId,
        userId: user.user.id,
      },
      data: {
        ...result.data,
      },
    });

    return {
      status: "success",
      message: "Course updated successfully",
    };
  } catch {
    return {
      status: "error",
      message: "Failed to update course",
    };
  }
}

export async function reorderLessons(
  chapterId: string,
  lessons: { id: string; position: number }[],
  courseId: string
): Promise<ApiResponse> {
  await requireAdmin();

  try {
    if (!lessons || lessons.length === 0) {
      return {
        status: "error",
        message: "No lessons provided for reordering.",
      };
    }

    const updates = lessons.map((lesson) =>
      db.lesson.update({
        where: {
          id: lesson.id,
          chapterId: chapterId,
        },
        data: {
          position: lesson.position,
        },
      })
    );

    await db.$transaction(updates);

    revalidatePath(`/admin/courses/${courseId}/edit`);

    return {
      status: "success",
      message: "Lessons reordered successfully!",
    };
  } catch {
    return {
      status: "error",
      message: "Failed to reorder lessons.",
    };
  }
}

export async function reorderChapters(
  courseId: string,
  chapters: { id: string; position: number }[]
): Promise<ApiResponse> {
  await requireAdmin();

  try {
    if (!chapters || chapters.length === 0) {
      return {
        status: "error",
        message: "No chapters provided for reordering.",
      };
    }

    const updates = chapters.map((chapter) =>
      db.chapter.update({
        where: {
          id: chapter.id,
          courseId: courseId,
        },
        data: {
          position: chapter.position,
        },
      })
    );

    await db.$transaction(updates);

    revalidatePath(`/admin/courses/${courseId}/edit`);

    return {
      status: "success",
      message: "Chapters reordered successfully!",
    };
  } catch {
    return {
      status: "error",
      message: "Failed to reorder chapter.",
    };
  }
}

export async function createChapter(
  values: ChapterSchemaType
): Promise<ApiResponse> {
  await requireAdmin();

  try {
    const result = chapterSchema.safeParse(values);
    if (!result.success) {
      return {
        status: "error",
        message: "Invalid data",
      };
    }

    await db.$transaction(async (tx) => {
      const maxPos = await tx.chapter.findFirst({
        where: {
          courseId: result.data.courseId,
        },
        select: { position: true },
        orderBy: { position: "desc" },
      });

      await tx.chapter.create({
        data: {
          title: result.data.name,
          courseId: result.data.courseId,
          position: (maxPos?.position ?? 0) + 1,
        },
      });
    });

    revalidatePath(`/admin/courses/${result.data.courseId}/edit`);

    return {
      status: "success",
      message: "Chapter create successfully!",
    };
  } catch {
    return {
      status: "error",
      message: "Failed to create chapter.",
    };
  }
}

export async function createLesson(
  values: LessonSchemaType
): Promise<ApiResponse> {
  await requireAdmin();

  try {
    const result = lessonSchema.safeParse(values);
    if (!result.success) {
      return {
        status: "error",
        message: "Invalid data",
      };
    }

    await db.$transaction(async (tx) => {
      const maxPos = await tx.lesson.findFirst({
        where: {
          chapterId: result.data.chapterId,
        },
        select: { position: true },
        orderBy: { position: "desc" },
      });

      await tx.lesson.create({
        data: {
          title: result.data.name,
          description: result.data.description,
          videoKey: result.data.videoKey,
          thumbnailKey: result.data.thumbnailKey,
          chapterId: result.data.chapterId,
          position: (maxPos?.position ?? 0) + 1,
        },
      });
    });

    revalidatePath(`/admin/courses/${result.data.courseId}/edit`);

    return {
      status: "success",
      message: "Lesson create successfully!",
    };
  } catch {
    return {
      status: "error",
      message: "Failed to create lesson.",
    };
  }
}

export async function deleteLesson({
  lessonId,
  courseId,
  chapterId,
}: {
  lessonId: string;
  courseId: string;
  chapterId: string;
}): Promise<ApiResponse> {
  await requireAdmin();

  try {
    const chapterWithLesson = await db.chapter.findUnique({
      where: { id: chapterId },
      select: {
        lesson: {
          orderBy: {
            position: "asc",
          },
          select: {
            id: true,
            position: true,
          },
        },
      },
    });

    if (!chapterWithLesson) {
      return {
        status: "error",
        message: "Chapter not found!",
      };
    }

    const lessons = chapterWithLesson.lesson;
    const lessonToDelete = lessons.find((lesson) => lesson.id === lessonId);

    if (!lessonToDelete) {
      return {
        status: "error",
        message: "Lesson not found in the chapter.",
      };
    }

    const remainingLessons = lessons.filter((lesson) => lesson.id !== lessonId);

    const updates = remainingLessons.map((lesson, index) => {
      return db.lesson.update({
        where: { id: lesson.id },
        data: { position: index + 1 },
      });
    });

    await db.$transaction([
      ...updates,
      db.lesson.delete({
        where: {
          id: lessonId,
          chapterId: chapterId,
        },
      }),
    ]);

    revalidatePath(`/admin/courses/${courseId}/edit`);

    return {
      status: "success",
      message: "Lesson deleted and positions reordered successfully!",
    };
  } catch {
    return {
      status: "error",
      message: "Failed to delete lesson.",
    };
  }
}

export async function deleteChapter({
  courseId,
  chapterId,
}: {
  courseId: string;
  chapterId: string;
}): Promise<ApiResponse> {
  await requireAdmin();

  try {
    const courseWithChapter = await db.course.findUnique({
      where: { id: courseId },
      select: {
        chapter: {
          orderBy: {
            position: "asc",
          },
          select: {
            id: true,
            position: true,
          },
        },
      },
    });

    if (!courseWithChapter) {
      return {
        status: "error",
        message: "Course not found!",
      };
    }

    const chapters = courseWithChapter.chapter;
    const chapterToDelete = chapters.find(
      (chapter) => chapter.id === chapterId
    );

    if (!chapterToDelete) {
      return {
        status: "error",
        message: "Chapter not found in the course.",
      };
    }

    const remainingChapter = chapters.filter(
      (chapter) => chapter.id !== chapterId
    );

    const updates = remainingChapter.map((chapter, index) => {
      return db.chapter.update({
        where: { id: chapter.id },
        data: { position: index + 1 },
      });
    });

    await db.$transaction([
      ...updates,
      db.chapter.delete({
        where: {
          id: chapterId,
        },
      }),
    ]);

    revalidatePath(`/admin/courses/${courseId}/edit`);

    return {
      status: "success",
      message: "Chapter deleted and positions reordered successfully!",
    };
  } catch {
    return {
      status: "error",
      message: "Failed to delete chapter.",
    };
  }
}
