import { supabase } from "./supabase";
import type { SubmitTestimonialInput } from "@feelgood/shared";
import { validateTestimonial } from "@feelgood/shared";

export async function submitTestimonial(input: SubmitTestimonialInput) {
  const validationError = validateTestimonial(input);
  if (validationError) throw new Error(validationError);

  const { data, error } = await supabase.functions.invoke("submit-testimonial", {
    body: {
      rating: input.rating,
      displayName: input.displayName ?? null,
      headline: input.headline ?? null,
      story: input.story,
      permissionToPublish: input.permissionToPublish,
    },
  });

  if (error) throw error;
  return data as { id: string; status: string; created_at: string };
}

export async function deleteAccount() {
  const { data, error } = await supabase.functions.invoke("delete-account");
  if (error) throw error;
  await supabase.auth.signOut();
  return data;
}
