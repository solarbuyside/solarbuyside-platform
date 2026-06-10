"use server";

import { revalidatePath } from "next/cache";

import { markLessonComplete, markLessonIncomplete } from "@/lib/course/progress";

export async function toggleLessonAction(lessonId: string, completed: boolean) {
  if (completed) {
    await markLessonComplete(lessonId);
  } else {
    await markLessonIncomplete(lessonId);
  }
  revalidatePath("/curso");
  revalidatePath(`/curso/${lessonId}`);
}
