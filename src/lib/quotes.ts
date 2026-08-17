import type { DailyQuote } from "@feelgood/shared";

export type { DailyQuote } from "@feelgood/shared";

export const DAILY_QUOTES: DailyQuote[] = [
  { text: "You do not rise to the level of your goals. You fall to the level of your systems.", author: "James Clear" },
  { text: "The body achieves what the mind believes." },
  { text: "Take care of your body. It's the only place you have to live.", author: "Jim Rohn" },
  { text: "Discipline is choosing between what you want now and what you want most." },
  { text: "Wellness is not a destination. It's a way of moving through the world." },
  { text: "Small habits, repeated daily, become the identity you're building." },
  { text: "The version of you at Day 55 needs you to keep going today." },
  { text: "Progress is not linear. This day still counts." },
  { text: "You are allowed to have a hard day and still be on track." },
  { text: "Motivation gets you started. Habit keeps you going.", author: "Jim Rohn" },
  { text: "One day, or day one. You decide." },
  { text: "Feelings pass. Your commitment doesn't." },
  { text: "You've done harder things than this." },
  { text: "The streak is not the point. The person you're building is." },
  { text: "Show up for yourself the way you'd show up for someone you love." },
  { text: "Every action you take is a vote for the person you wish to become.", author: "James Clear" },
  { text: "Rest is part of the work. So is starting again." },
  { text: "You don't need motivation. You need one small action." },
  { text: "Consistency is louder than intensity." },
  { text: "The gap between where you are and who you're becoming is habit by habit." },
  { text: "How you do today is how you do the challenge." },
  { text: "Trust the process. It's slower than you'd like and faster than you think." },
  { text: "Comparison is the thief of joy.", author: "Theodore Roosevelt" },
  { text: "The pain of discipline is far less than the pain of regret." },
  { text: "You are what you repeatedly do.", author: "Will Durant" },
  { text: "Nothing changes if nothing changes." },
  { text: "You are one decision away from a completely different day." },
  { text: "Water. Move. Breathe. Repeat." },
  { text: "Your future is created by what you do today, not tomorrow." },
  { text: "The best time to start was yesterday. The next best time is now." },
  { text: "Fall in love with the process and the results will come." },
  { text: "You don't have to be perfect. You just have to show up." },
  { text: "Small doesn't mean insignificant. Small compounds." },
  { text: "Your body hears everything your mind says.", author: "Naomi Judd" },
  { text: "Health is the greatest wealth.", author: "Virgil" },
  { text: "Energy creates energy. Move first, feel after." },
  { text: "You started this for a reason. Come back to it." },
  { text: "This feeling is temporary. Your transformation is not." },
  { text: "Choose the harder easy over the easier hard." },
  { text: "Habits are the compound interest of self-improvement.", author: "James Clear" },
  { text: "Discipline is a form of self-love." },
  { text: "Don't count the days. Make the days count.", author: "Muhammad Ali" },
  { text: "The person you become is the sum of your daily habits." },
  { text: "You will never regret a workout you did. Only the ones you skipped." },
  { text: "Slow is smooth. Smooth is steady. Steady wins." },
  { text: "Be patient with yourself. Nothing in nature blooms all year." },
  { text: "The way you speak to yourself matters." },
  { text: "You are the author of your own transformation." },
  { text: "Doing something imperfectly beats doing nothing perfectly." },
  { text: "Trust yourself. You've kept every promise that matters so far by being here." },
  { text: "One habit today is a win. Choose the easiest one." },
  { text: "The magic is in the mundane. Show up." },
  { text: "You are becoming. Keep going." },
  { text: "Grace over guilt. Then get back to it." },
  { text: "This is Day 55 in the making." },
];

/**
 * Deterministic daily quote, same quote all day, changes at midnight local.
 * Uses ISO date string so it's stable across renders and timezones on the client.
 */
export function quoteForDate(iso: string): DailyQuote {
  // Simple hash of YYYY-MM-DD → index
  let h = 0;
  for (let i = 0; i < iso.length; i++) h = (h * 31 + iso.charCodeAt(i)) >>> 0;
  return DAILY_QUOTES[h % DAILY_QUOTES.length];
}
