import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Apple,
  Pill,
  Dumbbell,
  Droplet,
  Brain,
  Lock,
  Check,
  ArrowRight as ArrowRightIcon,
  Sparkles,
  Target,
  Heart,
  Users,
} from "lucide-react";
import suzziAsset from "@/assets/suzzi.png.asset.json";


export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "The Feel Good Challenge, 55 Days to Feel Good, For Good" },
      {
        name: "description",
        content:
          "Join The Feel Good Society's 55-day challenge. Build the Feel Good Five daily habits, track your transformation, and compete for the $5,000 Transformation Prize.",
      },
      { property: "og:title", content: "The Feel Good Challenge, 55 Days" },
      {
        property: "og:description",
        content:
          "55 days to build habits you'll keep for life. Track the Feel Good Five and transform your health.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <Hero />
      <WhyJoin />
      <BeforeAfter />
      <HowItWorks />
      <FeelGoodFive />
      <TransformationJourney />
      <DashboardPreview />
      <Community />
      <Prize />
      <FAQ />
      <MeetSuzzi />
      <SuccessStories />
      <FinalCTA />
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full bg-primary" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            The Feel Good Society
          </span>
        </div>
        <Link
          to="/auth"
          className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
        >
          Sign in
        </Link>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-background">
      <div className="pointer-events-none absolute -top-40 -left-24 -z-10 size-[26rem] rounded-full bg-[color:var(--lime)]/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-24 -z-10 size-[26rem] rounded-full bg-accent/20 blur-3xl" />
      <div className="mx-auto max-w-4xl px-6 pt-24 pb-24 text-center animate-entrance">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/70">
          The Feel Good Challenge
        </p>
        <h1 className="mt-6 font-display text-6xl leading-[1.02] tracking-tight md:text-8xl text-foreground">
          Become Someone Who <em className="not-italic bg-[color:var(--lime)] text-[color:var(--lime-foreground)] px-3 py-1 rounded-2xl">Feels Good.</em>
        </h1>
        <p className="mx-auto mt-8 max-w-xl text-base leading-relaxed text-foreground/80 md:text-lg">
          This isn't about completing a challenge.
          <br />
          It's about becoming the kind of person who naturally lives a healthy life.
        </p>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-foreground/80 md:text-lg">
          Build the Feel Good Five over 55 days, track your progress, receive
          personalised support, and compete for the $5,000 Transformation Prize.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/auth"
            className="rounded-full bg-[color:var(--destructive)] px-8 py-4 text-sm font-semibold uppercase tracking-widest text-white shadow-lg shadow-[color:var(--destructive)]/30 transition hover:brightness-95"
          >
            Secure Your Spot
          </Link>
          <a
            href="#the-five"
            className="rounded-full bg-accent px-7 py-3.5 text-sm font-semibold uppercase tracking-widest text-foreground transition hover:brightness-95"
          >
            Learn The Feel Good Five
          </a>
        </div>

        <div className="mt-6">
          <Link
            to="/preview"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-xs font-semibold uppercase tracking-widest text-foreground shadow-sm transition hover:bg-accent/10"
          >
            Open public app preview
            <ArrowRightIcon className="size-3.5" />
          </Link>
          <p className="mt-2 text-[10px] uppercase tracking-widest text-muted-foreground">
            Share this preview link with anyone
          </p>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
          {["55 Days", "5 Daily Habits", "$5,000 Prize", "Personalised Support"].map((t) => (
            <span
              key={t}
              className="rounded-full bg-card px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-foreground ring-1 ring-black/5"
            >
              {t}
            </span>
          ))}
        </div>

      </div>
    </section>
  );
}



// Restrained base palette: mostly neutral cream/shell to reduce visual noise.
// Color comes from cards, glows, and accents, not the section background.
const SECTION_TONES = {
  cream: "bg-background",
  shell: "bg-[color:var(--card)]",
  blush: "bg-background",
  rose: "bg-[color:var(--card)]",
  lime: "bg-background",
  mustard: "bg-[color:var(--card)]",
} as const;

function Section({
  eyebrow,
  title,
  children,
  className = "",
  tone = "cream",
  glow,
  id,
}: {
  eyebrow?: string;
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  tone?: keyof typeof SECTION_TONES;
  glow?: "lime" | "rose" | "mustard" | "blush";
  id?: string;
}) {
  const glowMap = {
    lime: "bg-[color:var(--lime)]/40",
    rose: "bg-[color:var(--destructive)]/50",
    mustard: "bg-accent/50",
    blush: "bg-secondary/70",
  } as const;
  return (
    <section id={id} className={`relative overflow-hidden ${SECTION_TONES[tone]} ${className}`}>
      {glow && (
        <div
          className={`pointer-events-none absolute -top-32 left-1/2 -z-0 size-[26rem] -translate-x-1/2 rounded-full blur-3xl ${glowMap[glow]}`}
        />
      )}
      <div className="relative mx-auto max-w-6xl px-6 py-24">
        {eyebrow && (
          <p className="text-center font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/60">
            {eyebrow}
          </p>
        )}
        {title && (
          <h2 className="mx-auto mt-4 max-w-3xl text-center font-display text-4xl leading-tight tracking-tight md:text-5xl">
            {title}
          </h2>
        )}
        <div className="mt-14">{children}</div>
      </div>
    </section>
  );
}

function WhyJoin() {
  const cards = [
    {
      t: "Build Lasting Habits",
      d: "Create routines you'll continue long after Day 55. Our method focuses on sustainable shifts that fit your real life.",
      Icon: Target,
      phase: "Phase 01",
      phaseColor: "text-[color:var(--destructive)]",
      blob: "bg-[color:var(--secondary)]",
      chip: "bg-[color:var(--secondary)]",
      shape: "rounded-2xl rotate-3",
      iconRotate: "-rotate-3",
      offset: "md:mt-0",
    },
    {
      t: "Transform Your Health",
      d: "Improve your energy, confidence, nutrition and overall wellbeing through holistic, evidence-based practices.",
      Icon: Heart,
      phase: "Phase 02",
      phaseColor: "text-[color:var(--accent)]",
      blob: "bg-[color:var(--accent)]",
      chip: "bg-[color:var(--accent)]",
      shape: "rounded-full -rotate-6",
      iconRotate: "rotate-6",
      offset: "md:mt-12",
    },
    {
      t: "Stay Accountable",
      d: "Daily tracking and a supportive community keep you motivated. You're never walking this path alone.",
      Icon: Users,
      phase: "Phase 03",
      phaseColor: "text-[color:var(--lime)]",
      blob: "bg-[color:var(--lime)]",
      chip: "bg-[color:var(--lime)]",
      shape: "rounded-[1.25rem] rotate-12",
      iconRotate: "-rotate-12",
      offset: "md:mt-4",
    },
  ];
  return (
    <Section
      tone="shell"
      eyebrow="Why Join"
      title={<>More Than a Challenge. <em className="text-accent">It's a Lifestyle.</em></>}
    >
      <div className="grid gap-10 md:grid-cols-3 md:gap-6">
        {cards.map((c) => (
          <div
            key={c.t}
            className={`relative flex flex-col rounded-[3rem] bg-card p-10 transition-transform duration-300 hover:-translate-y-2 ${c.offset}`}
          >
            <span
              className={`absolute right-8 top-8 font-body text-xs font-medium uppercase tracking-widest opacity-70 ${c.phaseColor}`}
            >
              {c.phase}
            </span>

            <div className="relative mb-8">
              <div className={`absolute -inset-4 rounded-full opacity-25 blur-xl ${c.blob}`} />
              <div
                className={`relative flex size-14 items-center justify-center ${c.chip} ${c.shape}`}
              >
                <c.Icon className={`size-7 text-foreground ${c.iconRotate}`} strokeWidth={1.5} />
              </div>
            </div>

            <h3 className="mb-4 font-display text-3xl font-bold leading-tight text-foreground">
              {c.t}
            </h3>
            <p className="font-body leading-relaxed text-foreground/70">
              {c.d}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}


function BeforeAfter() {
  const pairs = [
    { before: "Overwhelmed", after: "Energised" },
    { before: "Tired", after: "Confident" },
    { before: "Unmotivated", after: "Disciplined" },
    { before: "Stuck", after: "Strong" },
    { before: "Inconsistent", after: "Consistent" },
    { before: "Self-Doubting", after: "Empowered" },
    { before: "Surviving", after: "Thriving" },
  ];
  return (
    <section className="relative overflow-hidden bg-background py-24 md:py-32">
      <div className="relative mx-auto max-w-5xl px-6">
        <div className="mb-14 text-center md:mb-18">
          <span className="mb-4 block font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/60">
            The Transformation
          </span>
          <h2 className="font-display text-4xl leading-tight text-foreground md:text-6xl lg:text-7xl">
            Imagine Who You'll Be
            <br />
            in <em className="not-italic text-accent">55 Days.</em>
          </h2>
        </div>

        <div className="relative rounded-[2.5rem] bg-card p-2 ring-1 ring-black/5">
          <div className="overflow-hidden rounded-[2rem] bg-gradient-to-b from-[color:var(--secondary)]/20 via-card to-card p-8 md:p-12 lg:p-14">
            {/* Header row */}
            <div className="mb-10 grid grid-cols-[1fr_auto_1fr] items-center gap-4 border-b border-black/5 pb-6 md:mb-12">
              <p className="text-center font-mono text-[10px] uppercase tracking-[0.25em] text-foreground/40">
                The Current State
              </p>
              <div className="flex size-12 items-center justify-center rounded-full bg-background shadow-sm ring-1 ring-black/5 md:size-14">
                <ArrowRightIcon className="size-4 text-accent md:size-5" />
              </div>
              <p className="text-center font-mono text-[10px] uppercase tracking-[0.25em] text-foreground/40">
                The Evolution
              </p>
            </div>

            {/* Word pairs */}
            <div className="space-y-4 md:space-y-5">
              {pairs.map((pair, i) => (
                <div
                  key={pair.before}
                  className="group grid grid-cols-[1fr_auto_1fr] items-center gap-3 md:gap-6"
                >
                  <span className="text-right text-lg font-medium text-foreground/50 md:text-2xl">
                    {pair.before}
                  </span>
                  <span className="flex size-6 items-center justify-center rounded-full bg-background ring-1 ring-black/5 md:size-7">
                    <span className="block size-1.5 rounded-full bg-accent/60 transition group-hover:bg-accent" />
                  </span>
                  <span className="text-left text-lg font-medium text-foreground md:text-2xl">
                    {pair.after}
                  </span>
                </div>
              ))}
            </div>

            {/* Bottom badge */}
            <div className="mt-10 flex justify-center md:mt-12">
              <div className="inline-flex items-center gap-3 rounded-full bg-background px-5 py-2.5 shadow-sm ring-1 ring-black/5">
                <span className="font-display text-2xl text-foreground">55</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Days
                </span>
              </div>
            </div>
          </div>
        </div>

        <p className="mx-auto mt-14 max-w-lg text-center text-sm leading-relaxed text-foreground/50 md:mt-18">
          A journey of 55 days designed to bridge the gap between where you are and where you deserve to be.
        </p>
      </div>
    </section>
  );
}


function Column({
  label,
  items,
  tone,
}: {
  label: string;
  items: string[];
  tone: "muted" | "accent";
}) {
  const isAccent = tone === "accent";
  return (
    <div
      className={`rounded-3xl p-8 ring-1 ${
        isAccent
          ? "bg-[color:var(--secondary)] text-foreground ring-black/5"
          : "bg-card ring-black/5"
      }`}
    >
      <p
        className={`font-mono text-[10px] uppercase tracking-[0.3em] ${
          isAccent ? "text-foreground/60" : "text-muted-foreground"
        }`}
      >
        {label}
      </p>
      <ul className="mt-6 space-y-3">
        {items.map((it) => (
          <li key={it} className="flex items-center gap-3 text-base">
            <span
              className={`size-1.5 rounded-full ${
                isAccent ? "bg-accent" : "bg-muted-foreground/40"
              }`}
            />
            {it}
          </li>
        ))}
      </ul>

    </div>
  );
}

function ArrowRight() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M5 12h14M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", t: "Join", d: "Receive your personalised challenge." },
    { n: "02", t: "Complete", d: "Finish the Feel Good Five every day." },
    {
      n: "03",
      t: "Transform",
      d: "Watch your health and habits improve over 55 days.",
    },
  ];
  return (
    <Section tone="blush" glow="blush" eyebrow="How It Works" title="Three Steps. Fifty-Five Days.">
      <div className="grid gap-5 md:grid-cols-3">
        {steps.map((s) => (
          <div key={s.n} className="rounded-3xl bg-card p-8 ring-1 ring-black/5">
            <span className="font-mono text-xs text-accent">{s.n}</span>
            <h3 className="mt-4 font-display text-3xl italic">{s.t}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {s.d}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function FeelGoodFive() {
  const five = [
    { t: "Nourish", d: "Follow your personalised nutrition plan.", Icon: Apple },
    { t: "Fuel", d: "Take your personalised pods and powders.", Icon: Pill },
    { t: "Move", d: "Complete 30–45 minutes of intentional movement.", Icon: Dumbbell },
    { t: "Hydrate", d: "Reach your personalised daily water target.", Icon: Droplet },
    { t: "Mindset", d: "Spend 5–10 minutes building a healthier mindset.", Icon: Brain },
  ];
  return (
    <Section
      tone="lime"
      eyebrow="The Feel Good Five"
      title={<>Five Daily Habits. <em className="text-accent">One Lifestyle.</em></>}
    >

      <div id="the-five" className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        {five.map(({ t, d, Icon }) => (
          <div
            key={t}
            className="rounded-3xl bg-card p-6 ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon size={20} strokeWidth={1.5} />
            </div>
            <h3 className="mt-5 font-display text-xl italic">{t}</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {d}
            </p>
          </div>
        ))}
      </div>

      <div className="relative mt-10 overflow-hidden rounded-3xl p-10 ring-1 ring-black/5 md:p-14 bg-gradient-to-br from-[color:var(--lime)]/40 via-card to-[color:var(--destructive)]/35">
        <div className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-accent/40 blur-3xl" />
        <div className="relative">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/60">
            The Non-Negotiable
          </p>
          <h3 className="mt-4 font-display text-4xl md:text-5xl">Track Every Day</h3>
          <p className="mt-6 max-w-xl font-display text-xl italic text-foreground/85">
            "If it isn't tracked, it doesn't count."
          </p>
          <p className="mt-4 max-w-xl text-sm text-foreground/70">
            Users must complete their daily check-in to remain eligible for the
            challenge.
          </p>
        </div>
      </div>
    </Section>
  );
}

type Milestone = {
  key: string;
  label: string;
  short: string;
  title: string;
  theme: string;
  badge: string;
  focus: string;
  mission?: string[];
  bonus?: string;
  motivation: string;
  extras?: { label: string; items: string[] }[];
  quote?: string;
};

const MILESTONES: Milestone[] = [
  {
    key: "day1",
    label: "Day 1",
    short: "D1",
    title: "Commit",
    theme: "Set your intention",
    badge: "🏅 Commitment Badge",
    focus:
      "Set your goals, upload your starting photos, complete your first Feel Good Five and commit to your transformation.",
    extras: [
      {
        label: "Your Day 1 Ritual",
        items: [
          "Goal Setting",
          "Starting Measurements",
          "Before Photos",
          "Personal Commitment",
        ],
      },
    ],
    motivation: "Today is Day 1 of the version of you you've always wanted to meet.",
  },
  {
    key: "w1",
    label: "Week 1",
    short: "W1",
    title: "Foundation",
    theme: "Build your daily routine",
    badge: "🏅 Foundation Badge",
    focus: "Build your daily routine and establish consistency.",
    mission: [
      "Complete the Feel Good Five every day",
      "Track every day",
      "Build your routine",
    ],
    bonus: "Complete every habit before 8pm, all 7 days.",
    motivation: "Consistency is the quiet superpower behind every transformation.",
  },
  {
    key: "w2",
    label: "Week 2",
    short: "W2",
    title: "Nourish",
    theme: "Fuel your body well",
    badge: "🥗 Nutrition Badge",
    focus: "Improve your nutrition, hydration and fuelling habits.",
    mission: [
      "Follow your nutrition plan",
      "Hit your hydration goal",
      "Fuel consistently",
    ],
    bonus: "Prep three meals in advance this week.",
    motivation: "The way you fuel yourself is the way you speak to yourself.",
  },
  {
    key: "w3",
    label: "Week 3",
    short: "W3",
    title: "Move",
    theme: "Build strength & confidence",
    badge: "💪 Strength Badge",
    focus: "Build strength, movement and confidence.",
    mission: [
      "Complete daily movement",
      "Complete strength sessions",
      "Beat last week's movement total",
    ],
    bonus: "Try a new form of movement you've never done before.",
    motivation: "You are not tired. You are undertrained and underestimated.",
  },
  {
    key: "w4",
    label: "Week 4",
    short: "W4",
    title: "Mindset",
    theme: "Anchor your inner practice",
    badge: "🧠 Mindset Badge",
    focus: "Strengthen resilience through daily mindset practices.",
    mission: [
      "Complete mindset every day",
      "Practise gratitude",
      "Journal",
      "Complete breathwork",
    ],
    bonus: "Try a 10-minute silent morning before touching your phone.",
    motivation: "Your mindset is the room every habit is built inside.",
  },
  {
    key: "w5",
    label: "Week 5",
    short: "W5",
    title: "Resilience",
    theme: "Push through the middle",
    badge: "🔥 Resilience Badge",
    focus: "Push through challenges and maintain consistency.",
    extras: [
      {
        label: "Your Progress So Far",
        items: [
          "Days completed",
          "Habit completion",
          "Current streak",
          "Water consumed",
          "Minutes moved",
        ],
      },
    ],
    bonus: "Recover a missed habit within 24 hours, every time.",
    motivation: "This is the week most people quit. It's also the week most people become.",
  },
  {
    key: "w6",
    label: "Week 6",
    short: "W6",
    title: "Consistency",
    theme: "Habits become identity",
    badge: "🌿 Consistency Badge",
    focus: "Turn healthy actions into lifelong habits.",
    quote:
      "You're no longer building habits. You're becoming someone who lives them.",
    bonus: "Teach one habit to someone you love.",
    motivation: "Repetition writes identity. You are already becoming.",
  },
  {
    key: "w7",
    label: "Week 7",
    short: "W7",
    title: "Momentum",
    theme: "Finish stronger than you started",
    badge: "🚀 Momentum Badge",
    focus:
      "Finish strong by challenging yourself and supporting the community.",
    mission: [
      "Complete bonus challenges",
      "Encourage another participant",
      "Maintain your streak",
    ],
    bonus: "Share your story with the community.",
    motivation: "Momentum is a gift you give the version of you starting tomorrow.",
  },
  {
    key: "day55",
    label: "Day 55",
    short: "D55",
    title: "Transformation Complete",
    theme: "Celebrate who you've become",
    badge: "🏆 Feel Good Graduate Badge",
    focus: "Celebrate the completion of the challenge.",
    extras: [
      {
        label: "Your Transformation",
        items: [
          "Before & After Photos",
          "Measurements Comparison",
          "Progress Summary",
          "Completion Percentage",
          "Final Reflection",
          "Graduation Certificate",
          "Eligible for the $5,000 Transformation Prize",
        ],
      },
    ],
    motivation: "You did not just finish a challenge. You built a life you love waking up to.",
  },
];

// Mock live progress, replace with real user data when wired up
const LIVE_PROGRESS = {
  currentDay: 23,
  streak: 12,
  daysRemaining: 32,
  completion: 42,
  badgesEarned: 3,
  currentIndex: 4, // Week 4 highlighted
};

function TransformationJourney() {
  const current = LIVE_PROGRESS.currentIndex;
  const [selected, setSelected] = useState<number>(current);
  const milestone = MILESTONES[selected];

  const statusFor = (i: number): "completed" | "current" | "locked" => {
    if (i < current) return "completed";
    if (i === current) return "current";
    return "locked";
  };

  return (
    <section className="relative overflow-hidden bg-background">
      <div className="pointer-events-none absolute -top-24 -right-24 -z-0 size-[26rem] rounded-full bg-[color:var(--lime)]/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 -z-0 size-[26rem] rounded-full bg-[color:var(--destructive)]/30 blur-3xl" />
      <div className="relative mx-auto max-w-6xl px-6 py-24">
      <p className="text-center font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        The Journey
      </p>
      <h2 className="mx-auto mt-4 max-w-3xl text-center font-display text-4xl leading-tight tracking-tight md:text-5xl">
        Your 55-Day <em className="text-accent">Transformation Journey.</em>
      </h2>
      <p className="mx-auto mt-6 max-w-2xl text-center text-base leading-relaxed text-muted-foreground">
        Every week builds on the last. Unlock new milestones, complete weekly
        missions, earn rewards, celebrate achievements and watch your
        transformation unfold over 55 days.
      </p>

      {/* Horizontal timeline */}
      <div className="mt-14 -mx-6 overflow-x-auto px-6 pb-4 [scrollbar-width:thin]">
        <div className="relative flex min-w-max items-start gap-2 pt-2">
          {/* connecting line */}
          <div className="pointer-events-none absolute left-8 right-8 top-9 h-px bg-border" />
          <div
            className="pointer-events-none absolute left-8 top-9 h-px bg-primary transition-all duration-700"
            style={{
              width: `calc((100% - 4rem) * ${current / (MILESTONES.length - 1)})`,
            }}
          />
          {MILESTONES.map((m, i) => {
            const status = statusFor(i);
            const isSelected = i === selected;
            return (
              <button
                key={m.key}
                onClick={() => setSelected(i)}
                className="group relative z-10 flex w-24 flex-col items-center gap-3 sm:w-28"
              >
                <div
                  className={`relative flex size-14 items-center justify-center rounded-full font-mono text-[10px] uppercase tracking-widest transition-all duration-300 ${
                    status === "completed"
                      ? "bg-primary text-primary-foreground"
                      : status === "current"
                        ? "bg-accent text-accent-foreground shadow-lg shadow-accent/30 ring-4 ring-accent/20"
                        : "bg-card text-muted-foreground ring-1 ring-border"
                  } ${isSelected && status !== "current" ? "scale-110 ring-2 ring-primary/40" : ""}`}
                >
                  {status === "completed" ? (
                    <Check size={18} strokeWidth={2.5} />
                  ) : status === "locked" ? (
                    <Lock size={14} strokeWidth={1.5} />
                  ) : (
                    <Sparkles size={16} strokeWidth={1.75} />
                  )}
                </div>
                <div className="flex flex-col items-center">
                  <span
                    className={`font-mono text-[9px] uppercase tracking-widest ${
                      isSelected ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {m.label}
                  </span>
                  <span
                    className={`mt-1 max-w-[6rem] text-center font-display text-sm leading-tight ${
                      status === "locked" ? "text-muted-foreground/70" : ""
                    }`}
                  >
                    {m.title}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected milestone panel */}
      <div
        key={milestone.key}
        className="mt-10 overflow-hidden rounded-3xl bg-card ring-1 ring-black/5 animate-entrance"
      >
        <div className="grid gap-0 md:grid-cols-[1.1fr_1fr]">
          <div className="border-b border-border p-8 md:border-b-0 md:border-r md:p-12">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">
                {milestone.label}
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                {statusFor(selected)}
              </span>
            </div>
            <h3 className="mt-4 font-display text-4xl leading-tight md:text-5xl">
              {milestone.title}
            </h3>
            <p className="mt-2 font-display text-lg italic text-muted-foreground">
              {milestone.theme}
            </p>
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
              {milestone.focus}
            </p>

            {milestone.quote && (
              <blockquote className="mt-6 border-l-2 border-accent pl-4 font-display text-lg italic">
                "{milestone.quote}"
              </blockquote>
            )}

            <div className="mt-8 inline-flex items-center gap-3 rounded-full bg-primary/10 px-4 py-2">
              <span className="text-lg">{milestone.badge.split(" ")[0]}</span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-primary">
                {milestone.badge.split(" ").slice(1).join(" ")}
              </span>
            </div>
          </div>

          <div className="p-8 md:p-12">
            {milestone.mission && (
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  Weekly Mission
                </p>
                <ul className="mt-4 space-y-3">
                  {milestone.mission.map((m) => (
                    <li key={m} className="flex items-start gap-3 text-sm">
                      <span className="mt-1 flex size-4 shrink-0 items-center justify-center rounded-full border border-primary/40">
                        <span className="size-1.5 rounded-full bg-primary" />
                      </span>
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {milestone.extras?.map((e) => (
              <div key={e.label} className={milestone.mission ? "mt-8" : ""}>
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  {e.label}
                </p>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {e.items.map((it) => (
                    <li
                      key={it}
                      className="rounded-xl bg-secondary/60 px-3 py-2 text-sm"
                    >
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {milestone.bonus && (
              <div className="mt-8 rounded-2xl border border-dashed border-accent/40 bg-accent/5 p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">
                  Bonus Challenge
                </p>
                <p className="mt-2 text-sm">{milestone.bonus}</p>
              </div>
            )}

            <div className="mt-8 rounded-2xl p-5 bg-gradient-to-br from-secondary/70 via-card to-[color:var(--lime)]/30 ring-1 ring-black/5">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/60">
                Motivation
              </p>
              <p className="mt-2 font-display text-lg italic leading-snug">
                "{milestone.motivation}"
              </p>
            </div>
          </div>
        </div>

        {/* Navigate between milestones */}
        <div className="flex items-center justify-between border-t border-border px-8 py-5">
          <button
            onClick={() => setSelected((s) => Math.max(0, s - 1))}
            disabled={selected === 0}
            className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition hover:text-foreground disabled:opacity-30"
          >
            ← Previous
          </button>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {selected + 1} of {MILESTONES.length}
          </span>
          <button
            onClick={() =>
              setSelected((s) => Math.min(MILESTONES.length - 1, s + 1))
            }
            disabled={selected === MILESTONES.length - 1}
            className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition hover:text-foreground disabled:opacity-30"
          >
            Next <ArrowRightIcon size={12} />
          </button>
        </div>
      </div>

      {/* Live progress */}
      <div className="mt-10 rounded-3xl bg-secondary/50 p-8 ring-1 ring-black/5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Live Progress
            </p>
            <h3 className="mt-2 font-display text-2xl">
              Day {LIVE_PROGRESS.currentDay} of 55
            </h3>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-accent">
            {LIVE_PROGRESS.completion}% Complete
          </span>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[color:var(--destructive)] via-[color:var(--lime)] to-accent transition-all duration-700"
            style={{ width: `${LIVE_PROGRESS.completion}%` }}
          />
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            ["Current Day", LIVE_PROGRESS.currentDay],
            ["Current Streak", `${LIVE_PROGRESS.streak} 🔥`],
            ["Days Remaining", LIVE_PROGRESS.daysRemaining],
            ["Completion", `${LIVE_PROGRESS.completion}%`],
            ["Badges Earned", LIVE_PROGRESS.badgesEarned],
          ].map(([l, v]) => (
            <div key={l as string} className="rounded-2xl bg-card p-4 ring-1 ring-black/5">
              <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                {l}
              </p>
              <p className="mt-1 font-display text-2xl">{v}</p>
            </div>
          ))}
        </div>
      </div>
      </div>
    </section>
  );
}

function DashboardPreview() {
  return (
    <Section
      tone="shell"
      eyebrow="The App"
      title={<>Your Challenge, <em className="text-[color:var(--destructive)]">In Your Pocket.</em></>}
    >

      <div className="mx-auto flex max-w-md justify-center">
        <div className="relative rounded-[3rem] bg-gradient-to-br from-secondary via-[color:var(--card)] to-[color:var(--lime)]/25 p-3 ring-1 ring-black/5 shadow-2xl shadow-[color:var(--destructive)]/20">
          <div className="w-[300px] rounded-[2.4rem] bg-[color:var(--card)] p-5">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-widest text-foreground/60">
                  Sunday, Jul 12
                </p>
                <h4 className="mt-1 font-display italic text-2xl leading-none">
                  Day 12 <span className="not-italic text-foreground/60 text-lg">of 55</span>
                </h4>
              </div>
              <div className="flex size-9 items-center justify-center rounded-full bg-secondary font-mono text-[10px] text-foreground/70">
                SB
              </div>
            </div>

            {/* Reminder card */}
            <div className="mt-4 relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-[color:var(--lime)]/25 via-background to-[color:var(--destructive)]/25 ring-1 ring-black/5">
              <p className="font-mono text-[9px] uppercase tracking-widest text-foreground/60">
                Today's reminder
              </p>
              <p className="mt-2 font-display italic text-sm leading-snug">
                "Discipline is a form of self-love."
              </p>
            </div>

            {/* Streak + Journey */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-2xl p-3 bg-gradient-to-br from-[color:var(--destructive)]/25 via-secondary/60 to-background ring-1 ring-black/5">
                <p className="font-mono text-[8px] uppercase tracking-widest text-foreground/60">🔥 Streak</p>
                <p className="mt-1 font-display italic text-2xl leading-none">7<span className="text-xs not-italic text-foreground/60"> days</span></p>
              </div>
              <div className="rounded-2xl p-3 bg-gradient-to-br from-[color:var(--lime)]/30 via-background to-accent/20 ring-1 ring-black/5">
                <p className="font-mono text-[8px] uppercase tracking-widest text-foreground/60">Journey</p>
                <p className="mt-1 font-display italic text-2xl leading-none">18<span className="text-xs not-italic text-foreground/60">%</span></p>
                <div className="mt-2 h-1 rounded-full bg-foreground/10">
                  <div className="h-full w-[18%] rounded-full bg-[color:var(--lime)]" />
                </div>
              </div>
            </div>

            {/* Score ring card */}
            <div className="mt-3 relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-background via-[color:var(--card)] to-[color:var(--lime)]/25 ring-1 ring-black/5">
              <span className="absolute top-2 right-3 font-display italic text-4xl text-foreground/10">55</span>
              <div className="flex justify-center">
                <svg viewBox="0 0 120 120" className="size-32">
                  <defs>
                    <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#CCDA18" />
                      <stop offset="60%" stopColor="#E1C340" />
                      <stop offset="100%" stopColor="#DD9B9B" />
                    </linearGradient>
                  </defs>
                  <circle cx="60" cy="60" r="48" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="10" />
                  <circle cx="60" cy="60" r="48" fill="none" stroke="url(#ringGrad)" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 48 * 0.68} ${2 * Math.PI * 48}`} transform="rotate(-90 60 60)" />
                  <text x="60" y="56" textAnchor="middle" className="fill-foreground/60 font-mono" fontSize="7" letterSpacing="1">DAILY SCORE</text>
                  <text x="60" y="76" textAnchor="middle" className="fill-foreground font-display italic" fontSize="22">68</text>
                </svg>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                <div><p className="font-mono text-[8px] uppercase tracking-widest text-foreground/60">Habits</p><p className="mt-1 font-display italic text-lg">3<span className="text-xs not-italic text-foreground/60"> / 5</span></p></div>
                <div className="border-x border-foreground/10"><p className="font-mono text-[8px] uppercase tracking-widest text-foreground/60">Check-in</p><p className="mt-1 font-display italic text-sm text-[color:var(--destructive)]">Required</p></div>
                <div><p className="font-mono text-[8px] uppercase tracking-widest text-foreground/60">Left</p><p className="mt-1 font-display italic text-lg text-accent">43</p></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

function Community() {
  const posts = [
    { n: "Amelia", h: "Day 14", m: "Just closed all five rings, feeling unstoppable.", likes: 47, comments: 12 },
    { n: "Jordan", h: "Week 3", m: "Mindset practice is genuinely changing my mornings.", likes: 31, comments: 8 },
    { n: "Priya", h: "Day 30", m: "Halfway. Down 4kg but up so much more energy.", likes: 89, comments: 23 },
  ];
  return (
    <Section
      tone="cream"
      eyebrow="Community"
      title={<>You're <em className="text-accent">Never</em> Doing It Alone.</>}
    >
      <div className="grid gap-4 md:grid-cols-3">
        {posts.map((p) => (
          <div key={p.n} className="rounded-3xl bg-card p-6 ring-1 ring-black/5">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 font-display text-primary">
                {p.n[0]}
              </div>
              <div>
                <p className="text-sm font-semibold">{p.n}</p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {p.h}
                </p>
              </div>
            </div>
            <p className="mt-5 text-sm leading-relaxed">{p.m}</p>
            <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
              <span>♡ {p.likes}</span>
              <span>·</span>
              <span>💬 {p.comments}</span>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Prize() {
  const judged = [
    "Physical transformation",
    "Habit consistency",
    "Nutrition adherence",
    "Mindset growth",
    "Personal transformation story",
    "Community participation",
  ];
  return (
    <section className="relative overflow-hidden bg-[color:var(--card)]">
      <div className="pointer-events-none absolute -top-32 left-1/2 -z-0 size-[28rem] -translate-x-1/2 rounded-full bg-accent/40 blur-3xl" />
      <div className="relative mx-auto max-w-6xl px-6 py-24">
      <div className="relative overflow-hidden rounded-[2rem] p-10 md:p-16 ring-1 ring-black/5 bg-gradient-to-br from-accent/40 via-[color:var(--card)] to-[color:var(--destructive)]/30 shadow-2xl shadow-accent/20">
        <div className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-[color:var(--lime)]/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 size-72 rounded-full bg-[color:var(--destructive)]/40 blur-3xl" />
        <div className="relative">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/60">
          The Prize
        </p>
        <h2 className="mt-4 max-w-2xl font-display text-4xl leading-tight md:text-6xl">
          Transform Your Health. <em>Win $5,000.</em>
        </h2>
        <p className="mt-6 max-w-xl text-foreground/75">
          Winners are judged on overall transformation, not simply weight loss.
        </p>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {judged.map((j, i) => (
            <div
              key={j}
              className="rounded-2xl bg-background/70 p-4 ring-1 ring-black/5 backdrop-blur"
            >
              <span className="font-mono text-[10px] text-foreground/50">
                0{i + 1}
              </span>
              <p className="mt-2 text-sm">{j}</p>
            </div>
          ))}
        </div>
        </div>
      </div>
      </div>
    </section>
  );
}

function FAQ() {
  const faqs = [
    { q: "Who can join?", a: "Anyone ready to build habits they'll keep for life, all levels welcome." },
    { q: "Do I need to lose weight?", a: "No. The challenge measures overall transformation, not the scale." },
    { q: "What if I miss a day?", a: "Miss a day and you lose eligibility for that day's score, but you keep going." },
    { q: "Can beginners participate?", a: "Absolutely. Programs are personalised to your starting point." },
    { q: "Do I need gym equipment?", a: "No. Movement can be walking, yoga, home workouts or anything you love." },
    { q: "How are winners selected?", a: "A panel judges physical, habit, nutrition and mindset transformation together." },
    { q: "Why do I need to track every day?", a: "Because consistency is the whole point. If it isn't tracked, it doesn't count." },
  ];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <Section tone="cream" eyebrow="FAQ" title="Frequently Asked Questions">
      <div className="mx-auto max-w-3xl divide-y divide-border rounded-3xl bg-card ring-1 ring-black/5">
        {faqs.map((f, i) => {
          const isOpen = open === i;
          return (
            <button
              key={f.q}
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full px-6 py-5 text-left transition"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="font-display text-lg">{f.q}</span>
                <span
                  className={`font-mono text-lg text-accent transition-transform ${
                    isOpen ? "rotate-45" : ""
                  }`}
                >
                  +
                </span>
              </div>
              {isOpen && (
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground animate-entrance">
                  {f.a}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </Section>
  );
}

function MeetSuzzi() {
  return (
    <Section tone="shell" glow="blush" eyebrow="Meet the Founder" title="Meet Suzzi">
      <div className="mx-auto grid max-w-4xl items-center gap-10 md:grid-cols-[1fr_1.2fr]">
        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl ring-1 ring-black/5">
          <img
            src={suzziAsset.url}
            alt="Suzzi Hartery, founder of The Feel Good Society"
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
        <div>
          <p className="font-display text-2xl italic leading-relaxed">
            "I built the Feel Good Challenge because I was tired of quick fixes.
            Real change doesn't come from a 7-day cleanse, it comes from small,
            sustainable habits repeated daily."
          </p>
          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
            The Feel Good Society is on a mission to help thousands of people
            build a lifestyle they'll love long after Day 55. This is more than
            a challenge. It's a community, a philosophy, and a permanent shift
            in how you show up for yourself.
          </p>
          <p className="mt-6 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
           Suzzi, Founder
          </p>
        </div>
      </div>
    </Section>
  );
}

function SuccessStories() {
  const quotes = [
    { n: "Emma", d: "Lost 6kg, gained a running habit and mornings I love.", w: "Day 55" },
    { n: "Marcus", d: "My energy tripled. I haven't skipped a workout in 12 weeks.", w: "Day 55" },
    { n: "Lila", d: "The mindset practice changed everything for me.", w: "Day 55" },
    { n: "Priya", d: "I finally stopped starting over every Monday. The habits just stuck.", w: "Day 55" },
    { n: "James", d: "Sleeping deeper, thinking clearer, showing up better for my family.", w: "Day 55" },
    { n: "Sophie", d: "I feel like the version of me I've been chasing for years.", w: "Day 55" },
  ];
  return (
    <section className="relative overflow-hidden bg-[color:var(--card)]">
      <div className="relative mx-auto max-w-6xl px-6 py-24">
      <p className="text-center font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/60">
        Success Stories
      </p>
      <h2 className="mx-auto mt-4 max-w-6xl text-center font-display text-4xl leading-tight tracking-tight md:whitespace-nowrap md:text-5xl">
        Real People. <em className="text-accent">Real Change.</em>
      </h2>
      <div className="mt-14 grid gap-5 md:grid-cols-3">
        {quotes.map((s) => (
          <figure
            key={s.n}
            className="flex h-full flex-col justify-between rounded-3xl bg-card p-8 ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-xl"
          >
            <blockquote className="font-display text-xl italic leading-relaxed text-foreground">
              "{s.d}"
            </blockquote>
            <figcaption className="mt-8">
              <p className="font-display text-lg">{s.n}</p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-accent">
                {s.w}
              </p>
            </figcaption>
          </figure>
        ))}
      </div>
      </div>
    </section>
  );
}


function FinalCTA() {
  const support = [
    { t: "Personalised Nutrition Plan", d: "Built around your goals, body and lifestyle." },
    { t: "Personalised Support Products", d: "Pods and powders matched to your needs." },
    { t: "Daily Habit Tracking", d: "The Feel Good Five, tracked simply every day." },
    { t: "Weekly Progress Photos", d: "See the transformation you're building." },
    { t: "Mindset & Movement Guidance", d: "Practices to strengthen body and mind." },
    { t: "Community & Coaching", d: "A team behind you for the full 55 days." },
  ];
  return (
    <section className="relative overflow-hidden bg-background">
      <div className="relative mx-auto max-w-5xl px-6 py-24">
        <p className="text-center font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/60">
          Support Includes
        </p>
        <h2 className="mx-auto mt-4 max-w-2xl text-center font-display text-4xl leading-tight tracking-tight md:text-5xl">
          Everything You Need to <em className="not-italic text-accent">Succeed.</em>
        </h2>
        <div className="mt-14 grid gap-6 md:grid-cols-2 md:gap-8">
          {support.map((s, i) => {
            const isBlush = [1, 2, 5].includes(i);
            return (
              <div
                key={s.t}
                className={`group flex flex-col gap-5 rounded-3xl p-8 transition-all duration-500 hover:shadow-xl ${
                  isBlush
                    ? "bg-secondary/25 border border-secondary/50 hover:border-[color:var(--destructive)]/40 hover:shadow-[color:var(--destructive)]/10"
                    : "bg-card border border-border hover:border-[color:var(--accent)]/30 hover:shadow-[color:var(--accent)]/10"
                }`}
              >
                <div
                  className={`flex size-10 items-center justify-center rounded-full border ${
                    isBlush
                      ? "bg-card border-secondary/50 text-[color:var(--destructive)]"
                      : "bg-secondary/40 border-secondary/50 text-foreground/70"
                  }`}
                >
                  <Check size={18} strokeWidth={2.5} />
                </div>
                <div className="space-y-2">
                  <h3 className="font-display text-2xl tracking-tight text-foreground">
                    {s.t}
                  </h3>
                  <p className="leading-relaxed text-muted-foreground">{s.d}</p>
                </div>
              </div>
            );
          })}
        </div>

      <div className="relative mt-16 overflow-hidden rounded-[2rem] px-8 py-20 text-center md:px-16 md:py-28 ring-1 ring-black/5 bg-gradient-to-br from-[color:var(--lime)]/40 via-[color:var(--card)] to-[color:var(--destructive)]/35 shadow-2xl shadow-[color:var(--destructive)]/20">
        <div className="pointer-events-none absolute -top-24 -left-24 size-96 rounded-full bg-accent/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 size-96 rounded-full bg-[color:var(--destructive)]/50 blur-3xl" />
        <div className="relative">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/60">
            The Feel Good Challenge
          </p>
          <h2 className="mt-6 font-display text-5xl leading-tight md:text-7xl">
            Build the Health
            <br />
            You'll Keep for <em className="not-italic bg-accent px-3 py-1 rounded-2xl text-foreground">Life.</em>
          </h2>
          <p className="mx-auto mt-8 max-w-lg text-foreground/75">
            Because lasting health isn't built overnight, it's built every day.
          </p>
          <Link
            to="/auth"
            className="mt-10 inline-flex rounded-full bg-primary px-8 py-4 text-sm font-semibold uppercase tracking-widest text-primary-foreground shadow-xl shadow-primary/20 transition hover:opacity-90"
          >
            Secure Your Spot
          </Link>
        </div>
      </div>
      </div>
    </section>
  );
}


function Footer() {
  return (
    <footer className="border-t border-border py-10 text-center">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        © {new Date().getFullYear()} The Feel Good Society
      </p>
      <nav className="mt-3 flex items-center justify-center gap-6 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
        <Link to="/terms" className="hover:text-foreground">Terms</Link>
      </nav>
    </footer>
  );
}

