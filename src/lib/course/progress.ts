import { createClient } from "@/lib/supabase/server";

/** Set of lesson ids the current user has completed. */
export async function getCompletedLessons(): Promise<Set<string>> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("course_progress").select("lesson_id");
  if (error || !data) return new Set();
  return new Set(data.map((row) => row.lesson_id));
}

async function authedUserId() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims?.sub) throw new Error("Authentication required.");
  return { supabase, userId: data.claims.sub };
}

export async function markLessonComplete(lessonId: string) {
  const { supabase, userId } = await authedUserId();
  const { error } = await supabase
    .from("course_progress")
    .upsert({ user_id: userId, lesson_id: lessonId }, { onConflict: "user_id,lesson_id" });
  if (error) throw new Error(error.message);
}

export async function markLessonIncomplete(lessonId: string) {
  const { supabase, userId } = await authedUserId();
  const { error } = await supabase
    .from("course_progress")
    .delete()
    .eq("user_id", userId)
    .eq("lesson_id", lessonId);
  if (error) throw new Error(error.message);
}
