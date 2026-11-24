import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { Flame, CheckCircle2, Lock, Heart, Camera, Sparkles, ArrowRight, ImagePlus, Download, Share2, Copy, Clock, Mail } from "lucide-react";
import { RadarChart } from "@/components/RadarChart";
import { WHEEL_DIMENSIONS, GOAL_OPTIONS, emptyWheel, type WheelScores, type WheelKey } from "@/lib/onboarding";
import { quoteForDate } from "@/lib/quotes";
import { todayISO, type DailyEntry } from "@/lib/challenge";
import { submitTestimonial } from "@/lib/testimonials.functions";
import { MindsetLibrary } from "@/components/MindsetLibrary";
import { AllDaysView } from "@/components/AllDaysView";
import { ClinicView } from "@/components/ClinicView";
import { AppAreaChooser } from "@/components/AppAreaChooser";

type ScaleValue = number | null;

export const Route = createFileRoute("/preview")({
  head: () => ({
    meta: [
      { title: "App Preview, The Feel Good Society" },
      { name: "description", content: "Preview the app access, Challenge and Clinic Clients areas." },
      { property: "og:title", content: "App Preview, The Feel Good Society" },
      { property: "og:description", content: "Preview the app access, Challenge and Clinic Clients areas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PreviewPage,
});

const TABS = [
  "App access",
  "Onboarding, Welcome",
  "Onboarding, Why",
  "Onboarding, Goals",
  "Onboarding, Commitment",
  "Onboarding, Wheel",
  "Onboarding, Vision",
  "Onboarding, Letter",
  "Onboarding, Done",
  "Today, Dashboard",
  "21-Day Mindset Rewire",
  "Check-in History",
  "Day 55, Rewheel",
  "Challenge Complete",
  "All days",
  "Clinic",
] as const;

function PreviewPage() {
  const [tab, setTab] = useState(-1);

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            ← Home
          </Link>
          <p className="font-mono text-[10px] uppercase tracking-widest text-primary">
            Preview mode · no login required
          </p>
        </div>
        <div className="max-w-5xl mx-auto px-6 pb-3 flex gap-2 overflow-x-auto">
          {TABS.map((t, index) => { const i = index - 1; return (
            <button
              key={t}
              onClick={() => setTab(i)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold whitespace-nowrap transition ${
                tab === i ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground ring-1 ring-foreground/5"
              }`}
            >
              {t}
            </button>
          ); })}
        </div>
      </header>

      <main className="max-w-md mx-auto p-6">
        {tab === -1 ? <div className="-mx-6 bg-background"><AppAreaChooser access={{ challenge: "approved", clinic: "pending" }} onEnter={() => setTab(8)} onRequest={() => toast.message("Preview mode, request not saved.")} onRefresh={() => undefined} /></div> : <>
        <div className="bg-background rounded-3xl shadow-sm ring-1 ring-foreground/5 overflow-hidden">
          {tab === 0 && <StepWelcome />}
          {tab === 1 && <StepWhy />}
          {tab === 2 && <StepGoals />}
          {tab === 3 && <StepCommitment />}
          {tab === 4 && <StepWheel />}
          {tab === 5 && <StepVision />}
          {tab === 6 && <StepLetter />}
          {tab === 7 && <StepDone />}
          {tab === 8 && <TodayDashboard />}
          {tab === 9 && <MindsetLibrary compact />}
          {tab === 10 && <CheckInHistoryPreview />}
          {tab === 11 && <Day55RewheelPreview />}
          {tab === 12 && <ChallengeCompletePreview />}
          {tab === 13 && (
            <AllDaysPreview onOpenToday={() => setTab(8)} onOpenFinalCheckIn={() => setTab(11)} />
          )}
          {tab === 14 && <ClinicView />}
        </div>
        <p className="text-center text-[11px] text-muted-foreground mt-4">
          This is a visual preview with mock data. Signed-in users get live saving, uploads, and progress tracking.
        </p>
        </>}
      </main>
    </div>
  );
}

/* ---------------- Onboarding shells ---------------- */

function OnboardingFrame({ progress, children }: { progress: number; children: React.ReactNode }) {
  return (
    <div className="p-8">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
        The Feel Good Challenge · Onboarding
      </p>
      <div className="flex gap-1.5 mb-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full ${i <= progress ? "bg-primary" : "bg-primary/15"}`} />
        ))}
      </div>
      {children}
    </div>
  );
}

function Eyebrow({ text }: { text: string }) {
  return <p className="font-mono text-[10px] uppercase tracking-widest text-primary mb-3">{text}</p>;
}

function NextBtn({ label = "Continue" }: { label?: string }) {
  return (
    <div className="mt-10 flex justify-end">
      <button className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-semibold">
        {label} <ArrowRight className="size-4" />
      </button>
    </div>
  );
}

function StepWelcome() {
  return (
    <OnboardingFrame progress={0}>
      <Eyebrow text="Welcome" />
      <h1 className="font-display italic text-4xl leading-tight tracking-tight mb-4">This isn't another challenge.</h1>
      <p className="text-muted-foreground text-base leading-relaxed mb-8">
        It's your commitment to becoming the healthiest version of yourself. Over the next 55 days, we'll build habits you'll keep for life, one day at a time.
      </p>
      <div className="rounded-3xl bg-card p-6 ring-1 ring-foreground/5">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Before Day 1, we'll spend a few minutes on the emotional foundation, why you're here, what you want to feel, and what success actually looks like for you. This is the part most challenges skip. It's what makes yours stick.
        </p>
      </div>
      <NextBtn label="Begin" />
    </OnboardingFrame>
  );
}

function StepWhy() {
  const prompts = [
    "What's happening in your life that brought you here today?",
    "What part of your life would you most love to improve over the next 55 days?",
    "What do you hope this journey helps you rediscover about yourself?",
    "If this challenge exceeded your expectations, what would that look and feel like?",
  ];
  return (
    <OnboardingFrame progress={1}>
      <Eyebrow text="Step 1 of 7" />
      <h1 className="font-display italic text-4xl leading-tight tracking-tight mb-4">Why are you here?</h1>
      <p className="text-muted-foreground text-base leading-relaxed mb-8">Short answers. First instinct is usually the truest.</p>
      <div className="space-y-5">
        {prompts.map((p) => (
          <div key={p}>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">{p}</label>
            <div className="w-full rounded-2xl bg-card px-4 py-3 text-sm ring-1 ring-foreground/5 h-16" />
          </div>
        ))}
      </div>
      <NextBtn />
    </OnboardingFrame>
  );
}

function StepGoals() {
  const [on, setOn] = useState<Set<string>>(new Set(["Improve energy", "Reduce stress", "Better sleep", "Other"]));
  const [otherText, setOtherText] = useState("Feel more like myself again");
  function toggle(g: string) {
    setOn((prev) => {
      const next = new Set(prev);
      if (next.has(g)) next.delete(g);
      else next.add(g);
      return next;
    });
  }
  return (
    <OnboardingFrame progress={2}>
      <Eyebrow text="Step 2 of 7" />
      <h1 className="font-display italic text-4xl leading-tight tracking-tight mb-4">Choose your goals.</h1>
      <p className="text-muted-foreground text-base leading-relaxed mb-8">Pick as many as feel true. We'll come back to these on Day 55.</p>
      <div className="grid grid-cols-2 gap-2">
        {GOAL_OPTIONS.map((g) => {
          const isOn = on.has(g);
          return (
            <button
              key={g}
              type="button"
              onClick={() => toggle(g)}
              className={`flex items-center justify-between gap-2 rounded-2xl p-4 text-left text-sm font-medium ring-1 transition active:scale-[0.98] ${
                isOn
                  ? "bg-primary text-primary-foreground ring-primary shadow-md"
                  : "bg-card text-foreground ring-foreground/10 hover:ring-foreground/20"
              }`}
            >
              <span>{g}</span>
              <span
                className={`flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] transition ${
                  isOn ? "bg-card text-primary" : "bg-muted ring-1 ring-foreground/10 text-transparent"
                }`}
              >
                ✓
              </span>
            </button>
          );
        })}
      </div>
      {on.has("Other") && (
        <div className="mt-4">
          <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
            Tell us what "Other" means to you
          </label>
          <input
            type="text"
            value={otherText}
            onChange={(e) => setOtherText(e.target.value)}
            placeholder="In a few words…"
            className="w-full rounded-2xl bg-card px-4 py-3 text-sm ring-1 ring-foreground/5 focus:ring-primary/30 focus:outline-none"
          />
        </div>
      )}
      <NextBtn />
    </OnboardingFrame>
  );
}

function StepCommitment() {
  return (
    <OnboardingFrame progress={3}>
      <Eyebrow text="Step 3 of 7" />
      <h1 className="font-display italic text-4xl leading-tight tracking-tight mb-4">Your commitment.</h1>
      <div className="rounded-3xl bg-card p-8 ring-1 ring-foreground/5">
        <p className="font-display italic text-2xl leading-snug mb-6">
          "I commit to showing up for myself for the next 55 days."
        </p>
        <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
          Type your name to sign
        </label>
        <div className="w-full border-b-2 border-primary px-4 py-3 text-lg font-display italic">Sarah Bennett</div>
        <button className="mt-6 w-full rounded-full bg-primary text-primary-foreground py-3 text-sm font-semibold">
          Signed, Sarah Bennett
        </button>
      </div>
      <NextBtn />
    </OnboardingFrame>
  );
}

function StepWheel() {
  const wheel = { energy: 4, confidence: 5, mood: 6, stress: 3, digestion: 5, fitness: 4, motivation: 7, consistency: 3, overall_health: 5 };
  return (
    <OnboardingFrame progress={4}>
      <Eyebrow text="Step 4 of 7" />
      <h1 className="font-display italic text-4xl leading-tight tracking-tight mb-4">Your Transformation Wheel.</h1>
      <p className="text-muted-foreground text-base leading-relaxed mb-8">
        Rate where you are today across nine areas. You'll rate again on Day 55, this is your before.
      </p>
      <div className="rounded-3xl bg-card p-6 ring-1 ring-foreground/5">
        <RadarChart axes={[...WHEEL_DIMENSIONS]} values={wheel} />
      </div>
      <div className="mt-6 space-y-4">
        {WHEEL_DIMENSIONS.map((d) => (
          <div key={d.key}>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-semibold">{d.label}</span>
              <span className="font-mono text-xs text-muted-foreground">{wheel[d.key as keyof typeof wheel]}/10</span>
            </div>
            <div className="grid grid-cols-10 gap-1">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className={`h-7 rounded-md ${i < wheel[d.key as keyof typeof wheel] ? "bg-primary" : "bg-muted"}`} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <NextBtn />
    </OnboardingFrame>
  );
}

function StepVision() {
  return (
    <OnboardingFrame progress={5}>
      <Eyebrow text="Step 6 of 7" />
      <h1 className="font-display italic text-4xl leading-tight tracking-tight mb-4">Your vision board.</h1>
      <p className="text-muted-foreground text-base leading-relaxed mb-8">
        Upload up to 8 images that show what you're moving toward. Family, holiday, a dress, the version of you you're becoming. Private to you.
      </p>
      <div className="grid grid-cols-2 gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="relative overflow-hidden rounded-2xl aspect-square bg-linear-to-br from-[color:var(--lime)]/25 via-card to-[color:var(--destructive)]/25 ring-1 ring-foreground/5 flex items-center justify-center">
            <div className="pointer-events-none absolute -top-8 -right-8 size-24 rounded-full bg-[color:var(--accent)]/40 blur-2xl" />
            <Sparkles className="size-6 text-primary/60 relative" />
          </div>
        ))}
        <div className="rounded-2xl border-2 border-dashed border-primary/40 aspect-square flex flex-col items-center justify-center gap-2 bg-card/60">
          <ImagePlus className="size-8 text-primary/70" />
          <span className="text-xs text-muted-foreground">Add image</span>
        </div>
      </div>
      <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <Lock className="size-3.5" /> Only you can see these images.
      </p>
      <NextBtn />
    </OnboardingFrame>
  );
}

function StepLetter() {
  return (
    <OnboardingFrame progress={6}>
      <Eyebrow text="Step 7 of 7" />
      <h1 className="font-display italic text-4xl leading-tight tracking-tight mb-4">A letter to future you.</h1>
      <p className="text-muted-foreground text-base leading-relaxed mb-8">
        Write to the person you'll be on Day 55. What do you want them to know? What are you promising them? This letter will be sealed until then.
      </p>
      <div className="w-full rounded-3xl bg-card p-5 text-base leading-relaxed font-display italic ring-1 ring-foreground/5 h-56 text-muted-foreground">
        Dear future me, I'm proud of you for staying with this…
      </div>
      <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        <Lock className="size-3.5" /> Sealed until Day 55.
      </p>
      <NextBtn label="Finish" />
    </OnboardingFrame>
  );
}

function StepDone() {
  return (
    <OnboardingFrame progress={7}>
      <Eyebrow text="You're ready" />
      <h1 className="font-display italic text-4xl leading-tight tracking-tight mb-4">The foundation is set.</h1>
      <div className="rounded-3xl bg-primary text-primary-foreground p-8">
        <Sparkles className="size-6 mb-4 opacity-90" />
        <p className="font-display italic text-2xl leading-snug mb-4">
          Tomorrow is Day 1. Today, you chose yourself.
        </p>
        <p className="text-sm opacity-90 leading-relaxed">
          Your goals, your wheel, your why, your vision and your letter are saved. We'll bring them back to you at the moments that matter.
        </p>
      </div>
      <button className="mt-8 w-full rounded-full bg-foreground text-background py-4 text-sm font-semibold">
        Enter the challenge
      </button>
    </OnboardingFrame>
  );
}

/* ---------------- Today dashboard ---------------- */

function TodayDashboard() {
  const score = 68;
  const dash = `${score}, 100`;
  const [showCheckIn, setShowCheckIn] = useState(false);
  return (
    <div className="pb-10">
      <header className="px-6 pt-10 pb-6 flex justify-between items-end">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
            Sunday, Jul 12
          </p>
          <h1 className="font-display text-3xl italic tracking-tight">
            Day 12 <span className="text-lg font-sans not-italic font-normal text-muted-foreground">of 55</span>
          </h1>
        </div>
        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
          <span className="text-xs font-semibold text-primary">SB</span>
        </div>
      </header>

      <section className="px-6 mb-4">
        <div className="rounded-2xl bg-accent/10 ring-1 ring-accent/30 p-4 flex gap-3">
          <Heart className="size-5 text-accent shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold">You missed yesterday.</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Your streak is paused, not lost. Complete today's challenge to continue your transformation.
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 mb-6">
        <div className="rounded-3xl bg-linear-to-br from-[color:var(--lime)]/25 via-card to-[color:var(--destructive)]/25 ring-1 ring-foreground/5 p-6 relative overflow-hidden">
          <div className="pointer-events-none absolute -top-10 -right-10 size-40 rounded-full bg-[color:var(--accent)]/40 blur-3xl" />
          <p className="font-mono text-[10px] uppercase tracking-widest text-primary mb-3 relative">Today's reminder</p>
          <p className="font-display italic text-lg leading-snug relative">"{quoteForDate(todayISO()).text}"</p>
          {quoteForDate(todayISO()).author && (
            <p className="mt-3 text-xs text-muted-foreground relative">- {quoteForDate(todayISO()).author}</p>
          )}
        </div>
      </section>

      <section className="px-6 mb-6 grid grid-cols-2 gap-3">
        <div className="rounded-2xl p-4 ring-1 ring-[color:var(--destructive)]/30 bg-linear-to-br from-[color:var(--destructive)]/25 to-[color:var(--accent)]/25">
          <div className="flex items-center gap-2 mb-1">
            <Flame className="size-4 text-[color:var(--destructive)]" />
            <p className="font-mono text-[10px] uppercase tracking-widest text-foreground/70">Streak</p>
          </div>
          <p className="text-2xl font-display italic">
            7<span className="text-xs font-sans not-italic text-muted-foreground ml-1">days</span>
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">Keep it going</p>
        </div>
        <div className="rounded-2xl p-4 ring-1 ring-[color:var(--lime)]/50 bg-linear-to-br from-[color:var(--lime)]/30 to-card">
          <p className="font-mono text-[10px] uppercase tracking-widest text-foreground/70 mb-1">Journey</p>
          <p className="text-2xl font-display italic">
            18<span className="text-xs font-sans not-italic text-muted-foreground ml-0.5">%</span>
          </p>
          <div className="mt-2 h-1.5 w-full bg-foreground/10 rounded-full overflow-hidden">
            <div className="h-full bg-linear-to-r from-[color:var(--lime)] to-[color:var(--accent)]" style={{ width: `18%` }} />
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">10 of 55 days complete</p>
        </div>
      </section>

      <section className="px-6 mb-8">
        <div className="rounded-3xl p-8 ring-1 ring-foreground/5 flex flex-col items-center relative overflow-hidden bg-linear-to-br from-card via-[color:var(--lime)]/10 to-[color:var(--destructive)]/15">
          <div className="pointer-events-none absolute -bottom-16 -left-16 size-48 rounded-full bg-[color:var(--accent)]/25 blur-3xl" />
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <h2 className="font-display italic text-6xl">55</h2>
          </div>
          <div className="relative size-48 flex items-center justify-center">
            <svg className="size-full -rotate-90" viewBox="0 0 36 36">
              <defs>
                <linearGradient id="score-arc-preview" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0%" stopColor="var(--brand-red)" />
                  <stop offset="100%" stopColor="var(--brand-pink)" />
                </linearGradient>
              </defs>
              <path stroke="var(--foreground)" strokeOpacity={0.1} strokeWidth="2.5" fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path stroke="url(#score-arc-preview)" strokeWidth="3" strokeDasharray={dash} strokeLinecap="round" fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Daily Score</span>
              <span className="text-5xl font-display italic mt-1">{score}</span>
            </div>
          </div>
          <div className="mt-6 flex gap-8">
            <div className="text-center">
              <p className="font-mono text-[10px] uppercase text-muted-foreground">Habits</p>
              <p className="text-lg font-semibold">3 / 5</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <p className="font-mono text-[10px] uppercase text-muted-foreground">Check-in</p>
              <p className="text-lg font-semibold text-muted-foreground">Required</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <p className="font-mono text-[10px] uppercase text-muted-foreground">Remaining</p>
              <p className="text-lg font-semibold text-accent">43 days</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 mb-8">
        <div className="flex justify-between items-baseline mb-4">
          <h3 className="font-display text-xl italic">The Feel Good Five</h3>
          <span className="font-mono text-[10px] text-muted-foreground">3 of 5 done</span>
        </div>
        <div className="space-y-3">
          {[
            { title: "Nourish", sub: "Personalised plan followed", done: true },
            { title: "Fuel", sub: "Pods & powders taken", done: true },
            { title: "Move", sub: "Move for 30 mins + 5,000 steps", done: true },
            { title: "Mindset", sub: "5-10 mins of mindset practice", done: false },
          ].map((h) => (
            <div key={h.title}
              className={`bg-card rounded-2xl p-4 ring-1 ${h.done ? "ring-foreground/5" : "ring-primary/30"} flex items-center gap-4`}>
              <div className={`size-6 rounded-full border-2 flex items-center justify-center ${h.done ? "border-primary bg-primary" : "border-primary/30"}`}>
                {h.done && <div className="size-1.5 rounded-full bg-primary-foreground" />}
              </div>
              <div className="flex-1">
                <h4 className={`text-sm font-semibold ${h.done ? "text-muted-foreground/60 line-through" : ""}`}>{h.title}</h4>
                <p className="text-xs text-muted-foreground">{h.sub}</p>
              </div>
              <span className="font-mono text-[10px] text-primary">{h.done ? "+16 pts" : "16 pts"}</span>
            </div>
          ))}
          <div className="bg-card rounded-2xl p-4 ring-1 ring-foreground/5">
            <div className="flex items-center gap-4 mb-4">
              <div className="size-6 rounded-full border-2 border-primary/30" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold">Hydrate</h4>
                <p className="text-xs text-muted-foreground">1.5L of 2.5L</p>
              </div>
              <div className="flex gap-2">
                <div className="size-8 rounded-full bg-muted flex items-center justify-center text-sm">−</div>
                <div className="size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">+</div>
              </div>
            </div>
            <div className="h-1.5 bg-primary/10 rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: "60%" }} />
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 mb-8">
        <button
          onClick={() => setShowCheckIn(true)}
          className="w-full text-left rounded-3xl p-6 bg-primary text-primary-foreground ring-1 ring-primary"
        >
          <div className="flex items-center gap-2 mb-1">
            <Lock className="size-3.5 opacity-80" />
            <span className="font-mono text-[10px] uppercase tracking-widest opacity-80">Required to complete today</span>
          </div>
          <h4 className="font-display text-2xl italic mt-1 mb-2">How are you today?</h4>
          <p className="text-sm leading-relaxed opacity-80">
            Energy, mood, stress, motivation, the daily check-in is what marks Day 12 as complete and keeps your streak alive.
          </p>
        </button>
      </section>

      {showCheckIn && (
        <CheckInModalPreview onClose={() => setShowCheckIn(false)} />
      )}

      <section className="px-6">
        <div className="bg-card rounded-3xl p-6 ring-1 ring-foreground/5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Week 2 of 8</p>
              <h4 className="font-display text-xl italic mt-1">Weekly progress photo</h4>
            </div>
            <Camera className="size-5 text-primary" />
          </div>
          <div className="w-full rounded-2xl border-2 border-dashed border-primary/30 aspect-[4/5] flex flex-col items-center justify-center text-center gap-2 mb-4">
            <Camera className="size-8 text-primary/60" />
            <p className="text-sm font-semibold">Add your Week 2 photo</p>
            <p className="text-xs text-muted-foreground max-w-[220px]">Same pose, same light. Future you will thank you.</p>
          </div>
          <button className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground">Upload photo</button>
        </div>
      </section>

      <p className="text-center text-xs text-muted-foreground mt-6 px-6">
        <CheckCircle2 className="inline size-3 mr-1" /> Complete all five habits + the check-in to finish the day.
      </p>
    </div>
  );
}

function CheckInModalPreview({ onClose }: { onClose: () => void }) {
  const [energy, setEnergy] = useState<ScaleValue>(null);
  const [mood, setMood] = useState<ScaleValue>(null);
  const [stress, setStress] = useState<ScaleValue>(null);
  const [motivation, setMotivation] = useState<ScaleValue>(null);
  const [sleep, setSleep] = useState<ScaleValue>(null);
  const [notes, setNotes] = useState("");
  const required = energy != null && mood != null && stress != null && motivation != null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/40 p-0 sm:p-6">
      <div className="w-full max-w-md bg-background rounded-t-3xl sm:rounded-3xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-display text-xl italic">Daily check-in</h3>
          <button onClick={onClose} className="size-8 rounded-full bg-muted text-sm">✕</button>
        </div>
        <p className="text-xs text-muted-foreground -mt-2 mb-5">
          Energy, mood, stress and motivation are required to complete the day.
        </p>
        <div className="space-y-5">
          <Scale label="Energy" value={energy} onChange={setEnergy} />
          <Scale label="Mood" value={mood} onChange={setMood} />
          <Scale label="Stress" value={stress} onChange={setStress} />
          <Scale label="Motivation" value={motivation} onChange={setMotivation} />
          <Scale label="Sleep quality (optional)" value={sleep} onChange={setSleep} />
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
              Reflection
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="One thing you noticed today…"
              className="w-full rounded-2xl bg-card px-4 py-3 text-sm ring-1 ring-foreground/5"
            />
          </div>
        </div>
        <button
          disabled={!required}
          onClick={onClose}
          className="mt-6 w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          Submit now
        </button>
      </div>
    </div>
  );
}

function Scale({ label, value, onChange }: { label: string; value: ScaleValue; onChange: (v: ScaleValue) => void }) {
  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="text-sm font-semibold">{label}</span>
        <span className="font-mono text-xs text-muted-foreground">{value ?? "-"}/10</span>
      </div>
      <div className="grid grid-cols-10 gap-1">
        {Array.from({ length: 10 }).map((_, n) => {
          const active = value != null && n < value;
          return (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n + 1)}
              className={`h-8 rounded-md ${active ? "bg-primary" : "bg-muted"}`}
              aria-label={`${label} ${n + 1}`}
            />
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Check-in history ---------------- */

function CheckInHistoryPreview() {
  const days = [
    { day: 12, date: "Wed 23 Jul", energy: 8, mood: 7, stress: 3, motivation: 9, sleep: 8, note: "Morning walk felt easier. Slept a full 8h." },
    { day: 11, date: "Tue 22 Jul", energy: 6, mood: 6, stress: 5, motivation: 7, sleep: 6, note: "Big work day, still hit all five." },
    { day: 10, date: "Mon 21 Jul", energy: 7, mood: 8, stress: 4, motivation: 8, sleep: 7, note: "Feeling steady. Cravings almost gone." },
    { day: 9, date: "Sun 20 Jul", energy: 5, mood: 6, stress: 6, motivation: 6, sleep: 5, note: "Off day. Kept promises anyway." },
    { day: 8, date: "Sat 19 Jul", energy: 8, mood: 9, stress: 2, motivation: 9, sleep: 8, note: "Best I've felt in months." },
  ];
  const avg = (k: keyof typeof days[number]) =>
    (days.reduce((s, d) => s + (d[k] as number), 0) / days.length).toFixed(1);
  return (
    <div className="bg-background">
      <header className="px-6 pt-8 pb-6">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Your reflections</p>
        <h2 className="font-display text-3xl italic">Check-in history</h2>
        <p className="text-sm text-muted-foreground mt-2">Last 12 check-ins. Trends update as you go.</p>
      </header>

      <section className="px-6 mb-6">
        <div className="rounded-3xl bg-card p-6 ring-1 ring-foreground/5">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">7-day average</p>
          <div className="grid grid-cols-4 gap-3">
            {[
              { k: "energy", label: "Energy" },
              { k: "mood", label: "Mood" },
              { k: "stress", label: "Stress" },
              { k: "motivation", label: "Motivation" },
            ].map((m) => (
              <div key={m.k} className="text-center">
                <p className="font-mono text-[10px] uppercase text-muted-foreground">{m.label}</p>
                <p className="font-display italic text-2xl mt-1">{avg(m.k as keyof typeof days[number])}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-8">
        <div className="space-y-3">
          {days.map((d) => (
            <div key={d.day} className="rounded-2xl bg-card p-5 ring-1 ring-foreground/5">
              <div className="flex items-baseline justify-between mb-3">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Day {d.day}</p>
                  <h4 className="font-display italic text-lg">{d.date}</h4>
                </div>
                <span className="font-mono text-[10px] text-primary">Complete</span>
              </div>
              <div className="grid grid-cols-5 gap-2 mb-3">
                {[
                  { k: "energy", label: "Energy" },
                  { k: "mood", label: "Mood" },
                  { k: "stress", label: "Stress" },
                  { k: "motivation", label: "Motivation" },
                  { k: "sleep", label: "Sleep" },
                ].map((m) => (
                  <div key={m.k} className="text-center">
                    <p className="font-mono text-[9px] uppercase text-muted-foreground">{m.label}</p>
                    <p className="text-sm font-semibold mt-0.5">{d[m.k as keyof typeof d] as number}<span className="text-muted-foreground text-xs">/10</span></p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed italic">"{d.note}"</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ---------------- Challenge complete ---------------- */

function ChallengeCompletePreview() {
  const before = { energy: 4, confidence: 5, mood: 5, stress: 7, digestion: 4, fitness: 4, motivation: 5, consistency: 3, overall_health: 4 };
  const after = { energy: 8, confidence: 8, mood: 8, stress: 3, digestion: 8, fitness: 7, motivation: 9, consistency: 8, overall_health: 8 };
  return (
    <div className="bg-background">
      <header className="px-6 pt-8 pb-6 text-center bg-linear-to-br from-primary/10 via-card to-accent/10">
        <p className="font-mono text-[10px] uppercase tracking-widest text-primary mb-2">Day 55 · Complete</p>
        <h2 className="font-display italic text-4xl leading-tight">You did it, Sarah.</h2>
        <p className="text-sm text-muted-foreground mt-3 max-w-xs mx-auto">
          55 days. 47 full completions. A different you.
        </p>
      </header>

      <section className="px-6 pt-6 pb-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-card p-4 ring-1 ring-foreground/5 text-center">
            <p className="font-mono text-[10px] uppercase text-muted-foreground">Full days</p>
            <p className="font-display italic text-3xl mt-1">47</p>
          </div>
          <div className="rounded-2xl bg-card p-4 ring-1 ring-foreground/5 text-center">
            <p className="font-mono text-[10px] uppercase text-muted-foreground">Longest streak</p>
            <p className="font-display italic text-3xl mt-1">19</p>
          </div>
          <div className="rounded-2xl bg-card p-4 ring-1 ring-foreground/5 text-center">
            <p className="font-mono text-[10px] uppercase text-muted-foreground">Check-ins</p>
            <p className="font-display italic text-3xl mt-1">52</p>
          </div>
        </div>
      </section>

      <section className="px-6 py-6">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Before vs after</p>
        <div className="rounded-3xl bg-card p-6 ring-1 ring-foreground/5">
          <RadarChart axes={[...WHEEL_DIMENSIONS]} values={after} compareValues={before} />
          <div className="mt-4 flex items-center justify-center gap-6 text-xs">
            <span className="flex items-center gap-2"><span className="size-2 rounded-full bg-secondary" /> Day 1</span>
            <span className="flex items-center gap-2"><span className="size-2 rounded-full bg-primary" /> Day 55</span>
          </div>
        </div>
      </section>

      <section className="px-6 pb-6">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Biggest shifts</p>
        <div className="space-y-2">
          {[
            { label: "Energy", from: 4, to: 8 },
            { label: "Digestion", from: 4, to: 8 },
            { label: "Consistency", from: 3, to: 8 },
            { label: "Stress", from: 7, to: 3 },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl bg-card p-4 ring-1 ring-foreground/5 flex items-center justify-between">
              <span className="text-sm font-semibold">{s.label}</span>
              <span className="font-mono text-xs text-muted-foreground">{s.from}/10 → <span className="text-primary font-semibold">{s.to}/10</span></span>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 pb-6">
        <div className="rounded-3xl bg-card p-6 ring-1 ring-foreground/5">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Your letter, delivered</p>
          <p className="font-display italic text-base leading-relaxed text-muted-foreground">
            "Dear future me, I hope you kept going even on the hard days. I hope you feel lighter, stronger, and proud of yourself…"
          </p>
          <button className="mt-4 w-full rounded-full bg-primary text-primary-foreground py-3 text-sm font-semibold">Read the full letter</button>
        </div>
      </section>

      <section className="px-6 pb-6">
        <div className="rounded-3xl bg-primary text-primary-foreground p-6">
          <h4 className="font-display italic text-2xl mb-2">What's next?</h4>
          <p className="text-sm opacity-90 mb-4">Keep the habits going, or start a new 55 with fresh goals.</p>
          <div className="flex gap-3">
            <button className="flex-1 rounded-full bg-primary-foreground text-primary py-3 text-sm font-semibold">Continue habits</button>
            <button className="flex-1 rounded-full ring-1 ring-primary-foreground/40 py-3 text-sm font-semibold">Start Round 2</button>
          </div>
        </div>
      </section>

      <section className="px-6 pb-6">
        <ShareTransformation />
      </section>

      <section className="px-6 pb-10">
        <TestimonialForm />
      </section>
    </div>
  );
}

function ShareTransformation() {
  const [open, setOpen] = useState(false);
  const summary =
    "I just completed The Feel Good Society 55-Day Challenge 🌿\n" +
    "• 47 full days\n" +
    "• 19-day longest streak\n" +
    "• Energy 4 → 8, Consistency 3 → 8, Stress 7 → 3\n" +
    "A different me. #FeelGoodSociety";

  async function nativeShare() {
    try {
      if (navigator.share) {
        await navigator.share({ title: "My Feel Good Society 55 days", text: summary });
        setOpen(false);
      } else {
        toast.error("Sharing isn't supported on this device — try Copy instead.");
      }
    } catch {
      // user cancelled
    }
  }

  async function copyText() {
    try {
      await navigator.clipboard.writeText(summary);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Couldn't copy");
    }
  }

  function downloadImage() {
    const c = document.createElement("canvas");
    c.width = 1080; c.height = 1350;
    const ctx = c.getContext("2d")!;
    const g = ctx.createLinearGradient(0, 0, 0, c.height);
    g.addColorStop(0, "#EAE8E2"); g.addColorStop(1, "#F2BDC2");
    ctx.fillStyle = g; ctx.fillRect(0, 0, c.width, c.height);
    ctx.fillStyle = "#000000";
    ctx.textAlign = "center";
    ctx.font = "italic 64px Georgia, serif";
    ctx.fillText("You did it.", c.width / 2, 240);
    ctx.font = "italic 96px Georgia, serif";
    ctx.fillText("55 days.", c.width / 2, 380);
    ctx.font = "32px system-ui, sans-serif";
    ctx.fillStyle = "#E00B10";
    const lines = ["47 full days", "19-day longest streak", "Energy  4 → 8", "Consistency  3 → 8", "Stress  7 → 3"];
    lines.forEach((l, i) => ctx.fillText(l, c.width / 2, 620 + i * 70));
    ctx.font = "italic 40px Georgia, serif";
    ctx.fillStyle = "#000000";
    ctx.fillText("A different me.", c.width / 2, 1120);
    c.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "my-55-days.png"; a.click();
      URL.revokeObjectURL(url);
      toast.success("Image downloaded");
    }, "image/png");
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-full ring-1 ring-foreground/10 py-3 text-sm font-semibold flex items-center justify-center gap-2"
      >
        <Sparkles className="size-4" /> Share your transformation
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-foreground/50 flex items-end sm:items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-sm rounded-3xl bg-card p-6 ring-1 ring-foreground/5" onClick={(e) => e.stopPropagation()}>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Share</p>
            <h4 className="font-display italic text-2xl mb-4">Your 55 days</h4>
            <pre className="whitespace-pre-wrap text-sm text-muted-foreground bg-muted/40 rounded-2xl p-4 mb-4 font-sans">{summary}</pre>
            <div className="space-y-2">
              <button onClick={nativeShare} className="w-full rounded-full bg-primary text-primary-foreground py-3 text-sm font-semibold flex items-center justify-center gap-2">
                <Share2 className="size-4" /> Share via…
              </button>
              <button onClick={downloadImage} className="w-full rounded-full ring-1 ring-foreground/10 py-3 text-sm font-semibold flex items-center justify-center gap-2">
                <Download className="size-4" /> Download image
              </button>
              <button onClick={copyText} className="w-full rounded-full ring-1 ring-foreground/10 py-3 text-sm font-semibold flex items-center justify-center gap-2">
                <Copy className="size-4" /> Copy text
              </button>
              <button onClick={() => setOpen(false)} className="w-full rounded-full py-3 text-sm text-muted-foreground">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function TestimonialForm() {
  const submit = useServerFn(submitTestimonial);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [name, setName] = useState("");
  const [headline, setHeadline] = useState("");
  const [story, setStory] = useState("");
  const [permission, setPermission] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<null | { id: string; permission: boolean }>(null);

  async function onSubmit() {
    if (!rating) return toast.error("Choose a rating from 1 to 5 stars.");
    if (story.trim().length < 10) return toast.error("Please share a few more words about your experience.");
    setSubmitting(true);
    try {
      const res = await submit({
        data: {
          rating,
          displayName: name.trim() || null,
          headline: headline.trim() || null,
          story: story.trim(),
          permissionToPublish: permission,
        },
      });
      setSubmitted({ id: res.id, permission });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong. Please try again.";
      // Preview isn't authenticated — fall back to a local success so designers can see the flow.
      if (msg.toLowerCase().includes("unauthorized") || msg.includes("No authorization")) {
        setSubmitted({ id: "preview", permission });
        toast.message("Preview mode, review not saved. Signed-in users will submit for real.");
      } else {
        toast.error(msg);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-3xl bg-card p-6 ring-1 ring-foreground/5">
        <div className="flex flex-col items-center text-center mb-5">
          <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <CheckCircle2 className="size-7 text-primary" />
          </div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Review received</p>
          <h4 className="font-display italic text-3xl mb-2">Thank you.</h4>
          <p className="text-sm text-muted-foreground max-w-xs">
            Your words help the next person start their 55. Here's what happens next.
          </p>
        </div>
        <ol className="space-y-3">
          <li className="flex gap-3 rounded-2xl bg-muted/40 p-4">
            <Clock className="size-5 shrink-0 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-semibold">1. Under review</p>
              <p className="text-xs text-muted-foreground">Our team reads every story within 1–3 business days.</p>
            </div>
          </li>
          <li className="flex gap-3 rounded-2xl bg-muted/40 p-4">
            <Mail className="size-5 shrink-0 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-semibold">2. We'll be in touch</p>
              <p className="text-xs text-muted-foreground">
                If we'd love to feature you, we'll email first to confirm the wording and how you'd like to be credited.
              </p>
            </div>
          </li>
          <li className="flex gap-3 rounded-2xl bg-muted/40 p-4">
            <Sparkles className="size-5 shrink-0 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-semibold">3. Published (only with permission)</p>
              <p className="text-xs text-muted-foreground">
                {submitted.permission
                  ? "You gave permission to share, so approved reviews may appear on our site and socials, first name only."
                  : "You kept your review private, we'll use it internally to improve the experience only."}
              </p>
            </div>
          </li>
        </ol>
        <p className="text-[11px] text-muted-foreground text-center mt-5">
          Reference #{submitted.id.slice(0, 8)}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-card p-6 ring-1 ring-foreground/5">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Leave a review</p>
      <h4 className="font-display italic text-2xl mb-1">Share your story.</h4>
      <p className="text-sm text-muted-foreground mb-5">
        Reviews are read by our team, then, with your permission, may be featured to inspire the next member.
      </p>

      <div className="flex gap-1 mb-5" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)}
            className="p-1"
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
          >
            <Sparkles
              className={`size-7 ${(hover || rating) >= n ? "fill-primary text-primary" : "text-muted-foreground/40"}`}
            />
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={80}
          placeholder="Your name (or initials)"
          className="w-full rounded-2xl bg-muted/40 px-4 py-3 text-sm outline-none ring-1 ring-transparent focus:ring-primary/40"
        />
        <input
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          maxLength={120}
          placeholder="Headline, e.g. 'I feel like myself again'"
          className="w-full rounded-2xl bg-muted/40 px-4 py-3 text-sm outline-none ring-1 ring-transparent focus:ring-primary/40"
        />
        <textarea
          value={story}
          onChange={(e) => setStory(e.target.value)}
          maxLength={2000}
          placeholder="What changed over your 55 days? What would you tell someone thinking about starting?"
          rows={5}
          className="w-full rounded-2xl bg-muted/40 px-4 py-3 text-sm outline-none ring-1 ring-transparent focus:ring-primary/40 resize-none"
        />
        <label className="flex items-start gap-3 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={permission}
            onChange={(e) => setPermission(e.target.checked)}
            className="mt-0.5 size-4 accent-primary"
          />
          <span>I give The Feel Good Society permission to feature my review publicly (first name only, after approval).</span>
        </label>
      </div>

      <button
        onClick={onSubmit}
        disabled={submitting}
        className="mt-5 w-full rounded-full bg-primary text-primary-foreground py-3 text-sm font-semibold disabled:opacity-60"
      >
        {submitting ? "Submitting…" : "Submit review"}
      </button>
    </div>
  );
}

/* ---------------- Day 55 rewheel ---------------- */

function Day55RewheelPreview() {
  const [wheel, setWheel] = useState<WheelScores>(() => ({ ...emptyWheel(), energy: 7, confidence: 7, fitness: 6, stress: 4, digestion: 7, consistency: 8, motivation: 8, mood: 7, overall_health: 7 }));
  return (
    <div className="p-8">
      <p className="font-mono text-[10px] uppercase tracking-widest text-primary mb-3">Day 55 · Rewheel</p>
      <h2 className="font-display italic text-3xl leading-tight mb-3">Rate yourself again.</h2>
      <p className="text-muted-foreground text-base leading-relaxed mb-6">
        Move each area to where you are now. Your Day 1 scores stay hidden — you'll see the full before-and-after on the next screen.
      </p>

      <div className="rounded-3xl bg-card p-6 ring-1 ring-foreground/5">
        <RadarChart axes={[...WHEEL_DIMENSIONS]} values={wheel} />
      </div>

      <div className="mt-6 space-y-4">
        {WHEEL_DIMENSIONS.map((d) => {
          const key = d.key as WheelKey;
          return (
            <div key={d.key}>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-semibold">{d.label}</span>
                <span className="font-mono text-xs text-muted-foreground">{wheel[key]}/10</span>
              </div>
              <div className="grid grid-cols-10 gap-1">
                {Array.from({ length: 10 }).map((_, i) => {
                  const n = i + 1;
                  const active = n <= wheel[key];
                  return (
                    <button
                      key={n}
                      onClick={() => setWheel({ ...wheel, [key]: n })}
                      className={`h-7 rounded-md transition ${active ? "bg-primary" : "bg-muted hover:bg-muted-foreground/20"}`}
                      aria-label={`${d.label} ${n}`}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <button className="mt-8 w-full rounded-full bg-primary text-primary-foreground py-3.5 text-sm font-semibold flex items-center justify-center gap-2">
        See your transformation <ArrowRight className="size-4" />
      </button>
      <p className="text-xs text-muted-foreground text-center mt-3">
        You'll unlock your Future You letter, before-and-after wheel, and biggest shifts next.
      </p>
    </div>
  );
}


function previewISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function mockEntry(day: number, startDate: string): DailyEntry {
  const d = new Date(startDate + "T00:00:00");
  d.setDate(d.getDate() + day - 1);
  return {
    id: `mock-${day}`,
    user_id: "mock",
    entry_date: previewISO(d),
    nourish: true,
    fuel: true,
    move_done: true,
    move_type: "Walk",
    move_minutes: 30,
    mindset: true,
    mindset_type: "Affirmation",
    water_ml: 2500,
    energy: 7,
    mood: 8,
    stress: 4,
    motivation: 8,
    sleep_quality: 7,
    notes: null,
  };
}

function AllDaysPreview({
  onOpenToday,
  onOpenFinalCheckIn,
}: {
  onOpenToday: () => void;
  onOpenFinalCheckIn: () => void;
}) {
  const today = todayISO();
  const start = new Date(today + "T00:00:00");
  start.setDate(start.getDate() - 11);
  const startDate = previewISO(start);
  const completeDays = [1, 2, 3, 4, 6, 7, 8, 10, 11, 12];
  const entries = completeDays.map((d) => mockEntry(d, startDate));
  return (
    <AllDaysView
      startDate={startDate}
      entries={entries}
      today={today}
      waterTarget={2500}
      streak={7}
      completed={10}
      currentDayNum={12}
      onOpenToday={onOpenToday}
      finalCheckInDone={false}
      onOpenFinalCheckIn={onOpenFinalCheckIn}
    />
  );
}
