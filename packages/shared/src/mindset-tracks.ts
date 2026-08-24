export type MindsetCategory =
  | "Fitness, Health & Vitality"
  | "Safety"
  | "Stress Reduction";

export type MindsetTrack = {
  id: number;
  day: number;
  title: string;
  affirmation: string;
  category: MindsetCategory;
  week: 1 | 2 | 3;
  duration: string;
  audioUrl: string | null;
};

export function getMindsetAudioUrl(day: number, baseUrl?: string | null): string | null {
  if (!baseUrl?.trim()) return null;
  return `${baseUrl.replace(/\/$/, "")}/day-${String(day).padStart(2, "0")}.mp3`;
}

const build = (
  day: number,
  category: MindsetCategory,
  week: 1 | 2 | 3,
  title: string,
  affirmation: string,
  duration = "10 min",
  audioBaseUrl?: string | null,
): MindsetTrack => ({
  id: day,
  day,
  title,
  affirmation,
  category,
  week,
  duration,
  audioUrl: getMindsetAudioUrl(day, audioBaseUrl),
});

export const MINDSET_TRACKS: MindsetTrack[] = [
  // Week 1: Fitness, Health & Vitality
  build(1, "Fitness, Health & Vitality", 1, "Health", "I care for my body / I choose habits that support how I want to feel"),
  build(2, "Fitness, Health & Vitality", 1, "Absorbing Nutrients", "I nourish my body / I choose foods that support me"),
  build(3, "Fitness, Health & Vitality", 1, "Digestive Flow", "I give my body time and care / I eat with awareness"),
  build(4, "Fitness, Health & Vitality", 1, "Live Body, Live Food", "I choose nourishing foods / I treat my body with respect"),
  build(5, "Fitness, Health & Vitality", 1, "Sending Love", "I offer kindness to my body / I practise daily care"),
  build(6, "Fitness, Health & Vitality", 1, "Steady Energy", "I cultivate calm energy / I support my vitality with steady habits"),
  build(7, "Fitness, Health & Vitality", 1, "Ideal Body", "I move toward how I want to feel / I honour my body today"),

  // Week 2: Safety
  build(8, "Safety", 2, "I Am Safe", "I am safe / I can release what no longer serves me"),
  build(9, "Safety", 2, "Feeling Protected", "I am protected / It is safe to let go of old patterns"),
  build(10, "Safety", 2, "Strong and Secure", "I am strong, secure and grounded / I choose steady change"),
  build(11, "Safety", 2, "Power", "I have power / power to shape habits that support my life"),
  build(12, "Safety", 2, "Releasing Fear", "I let go / I release fear that holds me back"),
  build(13, "Safety", 2, "Forgiveness", "I forgive, love, and accept my body and my life"),
  build(14, "Safety", 2, "Feeling Free", "I am free / free to choose supportive habits"),

  // Week 3: Stress Reduction
  build(15, "Stress Reduction", 3, "Peace", "I am at peace / I release tension with care"),
  build(16, "Stress Reduction", 3, "Calm Light", "I am calm / I meet each day with calm attention"),
  build(17, "Stress Reduction", 3, "Inner Wisdom", "I am guided / Guided toward habits that support my life"),
  build(18, "Stress Reduction", 3, "Success", "I allow progress / Progress in my habits, progress in my life"),
  build(19, "Stress Reduction", 3, "Worthy", "I Am Worthy, I Am Deserving / Deserving of care and consistency"),
  build(20, "Stress Reduction", 3, "Trust", "I trust / I am guided toward habits that support my life"),
  build(21, "Stress Reduction", 3, "Abundance", "I allow abundance into my life / Abundance of care and opportunity"),
];

export const MINDSET_CATEGORIES: MindsetCategory[] = [
  "Fitness, Health & Vitality",
  "Safety",
  "Stress Reduction",
];
