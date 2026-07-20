import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const submitSchema = z.object({
  rating: z.number().int().min(1).max(5),
  displayName: z.string().trim().max(80).optional().nullable(),
  headline: z.string().trim().max(120).optional().nullable(),
  story: z.string().trim().min(10, "Please share a few more words.").max(2000),
  permissionToPublish: z.boolean(),
});

export const submitTestimonial = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => submitSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error, data: row } = await supabase
      .from("testimonials")
      .insert({
        user_id: userId,
        rating: data.rating,
        display_name: data.displayName ?? null,
        headline: data.headline ?? null,
        story: data.story,
        permission_to_publish: data.permissionToPublish,
        status: "pending",
      })
      .select("id, status, created_at")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id, status: row.status, createdAt: row.created_at };
  });
