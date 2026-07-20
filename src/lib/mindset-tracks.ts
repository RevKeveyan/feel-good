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
  duration: string; // display only
  audioUrl: string | null;
};

const build = (
  day: number,
  category: MindsetCategory,
  week: 1 | 2 | 3,
  title: string,
  affirmation: string,
  duration = "10 min",
): MindsetTrack => ({
  id: day,
  day,
  title,
  affirmation,
  category,
  week,
  duration,
  audioUrl: null,
});

export const MINDSET_TRACKS: MindsetTrack[] = [
  // Week 1: Fitness, Health & Vitality
  build(1, "Fitness, Health & Vitality", 1, "Health", "I radiate health and vitality / I naturally release excess weight"),
  build(2, "Fitness, Health & Vitality", 1, "Absorbing Nutrients", "I nourish my body / I effortlessly absorb nutrients"),
  build(3, "Fitness, Health & Vitality", 1, "Digestive Flow", "I digest easily and effortlessly"),
  build(4, "Fitness, Health & Vitality", 1, "Live Body, Live Food", "I eat life force foods / I am vitality life force"),
  build(5, "Fitness, Health & Vitality", 1, "Sending Love", "I radiate health and vitality / I naturally release excess weight"),
  build(6, "Fitness, Health & Vitality", 1, "Healing Energy", "I radiate healing light / I am life force vitality"),
  build(7, "Fitness, Health & Vitality", 1, "Ideal Body", "I am effortlessly fit / I am my ideal body"),

  // Week 2: Safety
  build(8, "Safety", 2, "I Am Safe", "I am Safe / Safe to release excess weight"),
  build(9, "Safety", 2, "Feeling Protected", "I am protected / It's safe to let go of the weight"),
  build(10, "Safety", 2, "Strong and Secure", "I am strong, secure and grounded / I easily release the excess weight"),
  build(11, "Safety", 2, "Power", "I have power / power to create my ideal body, ideal life"),
  build(12, "Safety", 2, "Releasing Fear", "I let go / let go of excess weight"),
  build(13, "Safety", 2, "Forgiveness", "I forgive, love, accept my body, my life"),
  build(14, "Safety", 2, "Feeling Free", "I am free / free to let go of excess weight"),

  // Week 3: Stress Reduction
  build(15, "Stress Reduction", 3, "Peace", "I am at peace / I peacefully release excess weight"),
  build(16, "Stress Reduction", 3, "Calm Light", "I am calm / I calmly release excess weight"),
  build(17, "Stress Reduction", 3, "Inner Wisdom", "I am guided / Guided to my ideal body, ideal life"),
  build(18, "Stress Reduction", 3, "Success", "I allow success / Success in weight loss, success in life"),
  build(19, "Stress Reduction", 3, "Worthy", "I Am Worthy, I Am Deserving / Deserving of my ideal body, ideal life"),
  build(20, "Stress Reduction", 3, "Trust", "I trust / I am guided to my ideal body, ideal life"),
  build(21, "Stress Reduction", 3, "Abundance", "I allow abundance into my life / Abundance effortlessly flows to me"),
];

export const MINDSET_CATEGORIES: MindsetCategory[] = [
  "Fitness, Health & Vitality",
  "Safety",
  "Stress Reduction",
];
