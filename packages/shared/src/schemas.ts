export type SubmitTestimonialInput = {
  rating: number;
  displayName?: string | null;
  headline?: string | null;
  story: string;
  permissionToPublish: boolean;
};

export function validateTestimonial(input: SubmitTestimonialInput): string | null {
  if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) {
    return "Rating must be between 1 and 5";
  }
  const story = input.story.trim();
  if (story.length < 10) return "Please share a few more words.";
  if (story.length > 2000) return "Story is too long.";
  return null;
}
