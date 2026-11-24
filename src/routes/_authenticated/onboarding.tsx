import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { ArrowLeft, ArrowRight, ImagePlus, Trash2, Lock, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  GOAL_OPTIONS,
  ONBOARDING_STEPS,
  WHEEL_DIMENSIONS,
  emptyWheel,
  type OnboardingStep,
  type WheelKey,
  type WheelScores,
} from "@/lib/onboarding";
import { RadarChart } from "@/components/RadarChart";
import { requireAreaApproval } from "@/lib/area-access.guard";

const searchSchema = z.object({
  step: fallback(z.string(), "welcome").default("welcome"),
});

export const Route = createFileRoute("/_authenticated/onboarding")({
  beforeLoad: () => requireAreaApproval("challenge"),
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Begin Your Challenge, The Feel Good Society" },
      { name: "description", content: "Set your goals, complete your Transformation Wheel, and prepare for your 55-day journey." },
      { property: "og:title", content: "Begin Your Challenge, The Feel Good Society" },
      { property: "og:description", content: "Set your goals, complete your Transformation Wheel, and prepare for your 55-day journey." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OnboardingPage,
});

type ResponsesRow = {
  goals: string[];
  why_joined: string | null;
  why_change: string | null;
  want_to_feel: string | null;
  success_looks_like: string | null;
  why_statement: string | null;
  future_letter: string | null;
  commitment_name: string | null;
  commitment_signed_at: string | null;
  completed_at: string | null;
};

type VisionItem = { id: string; storage_path: string; caption: string | null; url?: string };

function OnboardingPage() {
  const navigate = useNavigate();
  const { step: rawStep } = Route.useSearch();
  const step: OnboardingStep = (ONBOARDING_STEPS as readonly string[]).includes(rawStep)
    ? (rawStep as OnboardingStep)
    : "welcome";
  const stepIndex = ONBOARDING_STEPS.indexOf(step);

  const [uid, setUid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState<ResponsesRow>({
    goals: [],
    why_joined: "",
    why_change: "",
    want_to_feel: "",
    success_looks_like: "",
    why_statement: "",
    future_letter: "",
    commitment_name: "",
    commitment_signed_at: null,
    completed_at: null,
  });
  const [wheel, setWheel] = useState<WheelScores>(emptyWheel());
  const [visionItems, setVisionItems] = useState<VisionItem[]>([]);

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setLoading(false);
      return;
    }
    const id = userData.user.id;
    setUid(id);

    const [{ data: r }, { data: w }, { data: v }] = await Promise.all([
      supabase.from("onboarding_responses").select("*").eq("user_id", id).maybeSingle(),
      supabase.from("transformation_wheel").select("*").eq("user_id", id).eq("phase", "day_1").maybeSingle(),
      supabase.from("vision_board_items").select("*").eq("user_id", id).order("sort_order"),
    ]);
    if (r) {
      setResponses({
        goals: r.goals ?? [],
        why_joined: r.why_joined ?? "",
        why_change: r.why_change ?? "",
        want_to_feel: r.want_to_feel ?? "",
        success_looks_like: r.success_looks_like ?? "",
        why_statement: r.why_statement ?? "",
        future_letter: r.future_letter ?? "",
        commitment_name: r.commitment_name ?? "",
        commitment_signed_at: r.commitment_signed_at,
        completed_at: r.completed_at,
      });
    }
    if (w) {
      setWheel({
        energy: w.energy,
        confidence: w.confidence,
        mood: w.mood,
        stress: w.stress,
        digestion: w.digestion,
        fitness: w.fitness,
        motivation: w.motivation,
        consistency: w.consistency,
        overall_health: w.overall_health,
      });
    }
    if (v) {
      const items = await Promise.all(
        v.map(async (row) => {
          const { data: signed } = await supabase.storage
            .from("vision-board")
            .createSignedUrl(row.storage_path, 3600);
          return {
            id: row.id,
            storage_path: row.storage_path,
            caption: row.caption,
            url: signed?.signedUrl,
          };
        }),
      );
      setVisionItems(items);
    }
    setLoading(false);
  }

  async function saveResponses(patch: Partial<ResponsesRow>) {
    if (!uid) return;
    const next = { ...responses, ...patch };
    setResponses(next);
    await supabase.from("onboarding_responses").upsert(
      { user_id: uid, ...next },
      { onConflict: "user_id" },
    );
  }

  async function saveWheel(next: WheelScores) {
    if (!uid) return;
    setWheel(next);
    await supabase.from("transformation_wheel").upsert(
      { user_id: uid, phase: "day_1", ...next },
      { onConflict: "user_id,phase" },
    );
  }

  function goto(target: OnboardingStep) {
    navigate({ to: "/onboarding", search: { step: target } });
  }

  function next() {
    const nxt = ONBOARDING_STEPS[Math.min(stepIndex + 1, ONBOARDING_STEPS.length - 1)];
    goto(nxt);
  }
  function back() {
    const prv = ONBOARDING_STEPS[Math.max(stepIndex - 1, 0)];
    goto(prv);
  }

  async function complete() {
    if (!uid) return;
    const now = new Date().toISOString();
    await Promise.all([
      supabase.from("onboarding_responses").upsert(
        { user_id: uid, ...responses, completed_at: now },
        { onConflict: "user_id" },
      ),
      supabase.from("profiles").update({ onboarding_completed_at: now }).eq("id", uid),
    ]);
    toast.success("You're in. Let's begin.");
    navigate({ to: "/today", replace: true });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-card to-background">
        <p className="font-mono text-[10px] uppercase tracking-widest text-foreground/70">Loading…</p>
      </div>
    );
  }

  const progressCount = ONBOARDING_STEPS.length - 1; // exclude "done"
  const visibleIndex = Math.min(stepIndex, progressCount - 1);

  const STEP_TONES: Record<OnboardingStep, { bg: string; glowA: string; glowB: string }> = {
    welcome:         { bg: "from-card to-background",                               glowA: "bg-accent/40",                  glowB: "bg-primary/35" },
    why:             { bg: "from-primary/20 via-card to-secondary/30",            glowA: "bg-primary/40",               glowB: "bg-secondary/60" },
    goals:           { bg: "from-secondary/15 via-card to-secondary/20",           glowA: "bg-secondary/40",               glowB: "bg-primary/35" },
    commitment:      { bg: "from-secondary/30 via-card to-secondary/25",           glowA: "bg-primary/40",               glowB: "bg-accent/45" },
    wheel:           { bg: "from-card via-background to-secondary/15",              glowA: "bg-secondary/40",               glowB: "bg-primary/35" },
    "why-statement": { bg: "from-primary/15 via-card to-secondary/25",           glowA: "bg-secondary/60",               glowB: "bg-accent/40" },
    vision:          { bg: "from-secondary/25 via-card to-primary/20",           glowA: "bg-primary/40",               glowB: "bg-secondary/35" },
    letter:          { bg: "from-card via-background to-secondary/20",              glowA: "bg-secondary/60",               glowB: "bg-primary/35" },
    done:            { bg: "from-secondary/20 via-card to-primary/25",           glowA: "bg-accent/50",                  glowB: "bg-primary/45" },
  };
  const tone = STEP_TONES[step];

  return (
    <div className={`relative min-h-screen text-foreground overflow-hidden transition-all duration-700 bg-linear-to-br ${tone.bg}`}>
      <div className={`pointer-events-none absolute -top-40 -left-24 size-[28rem] rounded-full blur-3xl ${tone.glowA}`} />
      <div className={`pointer-events-none absolute -bottom-40 -right-24 size-[30rem] rounded-full blur-3xl ${tone.glowB}`} />
      <div className="relative max-w-xl mx-auto px-6 pt-10 pb-24">
        <header className="mb-8">
          <p className="font-mono text-[10px] uppercase tracking-widest text-foreground/70 mb-3">
            The Feel Good Challenge · Onboarding
          </p>
          <div className="flex gap-1.5">
            {Array.from({ length: progressCount }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full ${
                  i <= visibleIndex
                    ? "bg-linear-to-r from-primary via-secondary to-secondary"
                    : "bg-foreground/10"
                }`}
              />
            ))}
          </div>
        </header>

        {step === "welcome" && <StepWelcome onNext={next} />}

        {step === "why" && (
          <StepWhy
            values={responses}
            onChange={(patch) => saveResponses(patch)}
            onBack={back}
            onNext={next}
          />
        )}

        {step === "goals" && (
          <StepGoals
            selected={responses.goals}
            onChange={(goals) => saveResponses({ goals })}
            onBack={back}
            onNext={next}
          />
        )}

        {step === "commitment" && (
          <StepCommitment
            name={responses.commitment_name ?? ""}
            signedAt={responses.commitment_signed_at}
            onSign={(name) => saveResponses({ commitment_name: name, commitment_signed_at: new Date().toISOString() })}
            onBack={back}
            onNext={next}
          />
        )}

        {step === "wheel" && (
          <StepWheel wheel={wheel} onChange={saveWheel} onBack={back} onNext={next} />
        )}

        {step === "why-statement" && (
          <StepWhyStatement
            value={responses.why_statement ?? ""}
            onChange={(v) => saveResponses({ why_statement: v })}
            onBack={back}
            onNext={next}
          />
        )}

        {step === "vision" && uid && (
          <StepVision
            uid={uid}
            items={visionItems}
            reload={load}
            onBack={back}
            onNext={next}
          />
        )}

        {step === "letter" && (
          <StepLetter
            value={responses.future_letter ?? ""}
            onChange={(v) => saveResponses({ future_letter: v })}
            onBack={back}
            onNext={next}
          />
        )}

        {step === "done" && <StepDone onComplete={complete} />}
      </div>
    </div>
  );
}

/* ---------------- Step components ---------------- */

function StepShell({ eyebrow, title, subtitle, children }: { eyebrow: string; title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="animate-entrance">
      <p className="font-mono text-[10px] uppercase tracking-widest text-primary mb-3">{eyebrow}</p>
      <h1 className="font-display italic text-4xl md:text-5xl leading-tight tracking-tight mb-4">{title}</h1>
      {subtitle && <p className="text-muted-foreground text-base leading-relaxed mb-8">{subtitle}</p>}
      {children}
    </div>
  );
}
function NavRow({ onBack, onNext, nextLabel = "Continue", nextDisabled }: { onBack?: () => void; onNext: () => void; nextLabel?: string; nextDisabled?: boolean }) {
  return (
    <div className="mt-10 flex items-center justify-between gap-4">
      {onBack ? (
        <button onClick={onBack} className="inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm text-foreground/70 hover:bg-foreground/5 transition">
          <ArrowLeft className="size-4" /> Back
        </button>
      ) : <span />}
      <button
        onClick={onNext}
        disabled={nextDisabled}
        className="group inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-7 py-3.5 text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:bg-primary/90 transition disabled:opacity-40 disabled:shadow-none active:scale-[0.98]"
      >
        {nextLabel} <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );
}

function StepWelcome({ onNext }: { onNext: () => void }) {
  return (
    <StepShell
      eyebrow="Welcome"
      title="This isn't another challenge."
      subtitle="It's your commitment to becoming the healthiest version of yourself. Over the next 55 days, we'll build habits you'll keep for life, one day at a time."
    >
      <div className="rounded-3xl p-6 ring-1 ring-foreground/5 bg-linear-to-br from-secondary/30 via-card to-primary/30">
        <p className="text-sm text-foreground/80 leading-relaxed">
          Before Day 1, we'll spend a few minutes on the emotional foundation, why you're
          here, what you want to feel, and what success actually looks like for you. This
          is the part most challenges skip. It's what makes yours stick.
        </p>
      </div>
      <NavRow onNext={onNext} nextLabel="Begin" />
    </StepShell>
  );
}

function StepWhy({ values, onChange, onBack, onNext }: { values: ResponsesRow; onChange: (p: Partial<ResponsesRow>) => void; onBack: () => void; onNext: () => void }) {
  return (
    <StepShell eyebrow="Step 1 of 7" title="Why are you here?" subtitle="Short answers. First instinct is usually the truest.">
      <div className="space-y-5">
        <PromptField label="What's happening in your life that brought you here today?" value={values.why_joined ?? ""} onChange={(v) => onChange({ why_joined: v })} />
        <PromptField label="What part of your life would you most love to improve over the next 55 days?" value={values.why_change ?? ""} onChange={(v) => onChange({ why_change: v })} />
        <PromptField label="What do you hope this journey helps you rediscover about yourself?" value={values.want_to_feel ?? ""} onChange={(v) => onChange({ want_to_feel: v })} />
        <PromptField label="If this challenge exceeded your expectations, what would that look and feel like?" value={values.success_looks_like ?? ""} onChange={(v) => onChange({ success_looks_like: v })} />
      </div>
      <NavRow onBack={onBack} onNext={onNext} />
    </StepShell>
  );
}

function PromptField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const filled = value.trim().length > 0;
  return (
    <div
      className={`group rounded-2xl p-4 ring-1 transition bg-linear-to-br from-card via-background/60 to-secondary/40 focus-within:from-secondary/20 focus-within:via-card focus-within:to-primary/20 ${
        filled ? "ring-primary/60" : "ring-foreground/5 hover:ring-primary/30"
      }`}
    >
      <label className="block font-mono text-[10px] uppercase tracking-widest text-foreground/60 mb-2">{label}</label>
      <textarea
        rows={2}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type your answer…"
        className="w-full bg-transparent text-sm leading-relaxed placeholder:text-foreground/30 focus:outline-none resize-none"
      />
    </div>
  );
}

function StepGoals({ selected, onChange, onBack, onNext }: { selected: string[]; onChange: (g: string[]) => void; onBack: () => void; onNext: () => void }) {
  const otherEntry = selected.find((s) => s === "Other" || s.startsWith("Other:")) ?? null;
  const hasOther = otherEntry !== null;
  const otherText = otherEntry && otherEntry.startsWith("Other:") ? otherEntry.slice("Other:".length).trim() : "";

  function isOn(g: string) {
    return g === "Other" ? hasOther : selected.includes(g);
  }
  function toggle(g: string) {
    if (g === "Other") {
      if (hasOther) onChange(selected.filter((s) => s !== "Other" && !s.startsWith("Other:")));
      else onChange([...selected, "Other"]);
      return;
    }
    onChange(selected.includes(g) ? selected.filter((x) => x !== g) : [...selected, g]);
  }
  function setOtherText(text: string) {
    const trimmed = text.trim();
    const without = selected.filter((s) => s !== "Other" && !s.startsWith("Other:"));
    onChange([...without, trimmed ? `Other: ${trimmed}` : "Other"]);
  }
  return (
    <StepShell
      eyebrow="Step 2 of 7"
      title="Choose your goals."
      subtitle="Pick as many as feel true. We'll come back to these on Day 55."
    >
      <div className="grid grid-cols-2 gap-2">
        {GOAL_OPTIONS.map((g) => {
          const on = isOn(g);
          return (
            <button
              key={g}
              onClick={() => toggle(g)}
              className={`flex items-center justify-between gap-2 rounded-2xl p-4 text-left text-sm font-medium ring-1 transition active:scale-[0.98] ${
                on
                  ? "bg-primary text-primary-foreground ring-primary shadow-md"
                  : "bg-card text-foreground ring-foreground/10 hover:ring-foreground/20"
              }`}
            >
              <span>{g}</span>
              <span
                className={`flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] transition ${
                  on ? "bg-card text-primary" : "bg-background ring-1 ring-foreground/10 text-transparent"
                }`}
              >
                ✓
              </span>
            </button>
          );
        })}
      </div>
      {hasOther && (
        <div className="mt-4 rounded-2xl p-4 bg-linear-to-br from-card to-secondary/30 ring-1 ring-foreground/5">
          <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
            Tell us what "Other" means to you
          </label>
          <input
            type="text"
            value={otherText}
            onChange={(e) => setOtherText(e.target.value)}
            placeholder="In a few words…"
            className="w-full rounded-2xl bg-card/60 px-4 py-3 text-sm ring-1 ring-foreground/5 focus:ring-primary/40 focus:outline-none"
          />
        </div>
      )}
      <NavRow onBack={onBack} onNext={onNext} nextDisabled={selected.length === 0} />
    </StepShell>
  );
}

function StepCommitment({ name, signedAt, onSign, onBack, onNext }: { name: string; signedAt: string | null; onSign: (name: string) => void; onBack: () => void; onNext: () => void }) {
  const [typed, setTyped] = useState(name);
  const signed = !!signedAt && !!name;
  return (
    <StepShell eyebrow="Step 3 of 7" title="Your commitment.">
      <div className="rounded-3xl p-8 ring-1 ring-foreground/5 bg-linear-to-br from-secondary/30 via-card to-primary/25 relative overflow-hidden">
        <div className="pointer-events-none absolute -top-16 -right-16 size-40 rounded-full bg-secondary/40 blur-2xl" />
        <p className="font-display italic text-2xl leading-snug mb-6">
          "I commit to showing up for myself for the next 55 days."
        </p>
        <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
          Type your name to sign
        </label>
        <input
          type="text"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          className="w-full rounded-2xl bg-card/70 border-b-2 border-primary/40 focus:border-primary px-4 py-3 text-lg font-display italic outline-none"
          placeholder="Your name"
        />
        <button
          onClick={() => typed.trim() && onSign(typed.trim())}
          disabled={!typed.trim() || signed}
          className="mt-6 w-full rounded-full bg-primary text-primary-foreground py-3 text-sm font-semibold disabled:opacity-60 hover:bg-primary/90 transition"
        >
          {signed ? `Signed, ${name}` : "I agree"}
        </button>
        {signedAt && <p className="text-[11px] text-muted-foreground mt-3">Signed {new Date(signedAt).toLocaleString()}</p>}
      </div>
      <NavRow onBack={onBack} onNext={onNext} nextDisabled={!signed} />
    </StepShell>
  );
}

function StepWheel({ wheel, onChange, onBack, onNext }: { wheel: WheelScores; onChange: (w: WheelScores) => void; onBack: () => void; onNext: () => void }) {
  return (
    <StepShell
      eyebrow="Step 4 of 7"
      title="Your Transformation Wheel."
      subtitle="Rate where you are today across nine areas. You'll rate again on Day 55, this is your before."
    >
      <div className="rounded-3xl p-6 ring-1 ring-foreground/5 bg-linear-to-br from-card via-background to-secondary/20 relative overflow-hidden">
        <div className="pointer-events-none absolute -top-16 -right-16 size-56 rounded-full bg-primary/25 blur-3xl" />
        <RadarChart axes={[...WHEEL_DIMENSIONS]} values={wheel} />
      </div>
      <div className="mt-6 space-y-4">
        {WHEEL_DIMENSIONS.map((d) => (
          <WheelScale
            key={d.key}
            label={d.label}
            value={wheel[d.key as WheelKey]}
            onChange={(n) => onChange({ ...wheel, [d.key]: n })}
          />
        ))}
      </div>
      <NavRow onBack={onBack} onNext={onNext} />
    </StepShell>
  );
}

function WheelScale({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <div className="rounded-2xl p-4 bg-linear-to-br from-card to-background/60 ring-1 ring-foreground/5">
      <div className="flex justify-between mb-3">
        <span className="text-sm font-semibold">{label}</span>
        <span className="font-mono text-xs text-muted-foreground">{value}/10</span>
      </div>
      <div className="grid grid-cols-10 gap-1">
        {Array.from({ length: 10 }).map((_, i) => {
          const n = i + 1;
          const active = n <= value;
          return (
            <button
              key={n}
              onClick={() => onChange(n)}
              className={`h-8 rounded-md transition ${
                active
                  ? "bg-linear-to-b from-secondary via-secondary to-primary shadow-sm"
                  : "bg-background hover:bg-primary/20"
              }`}
              aria-label={`${label} ${n}`}
            />
          );
        })}
      </div>
    </div>
  );
}

function StepWhyStatement({ value, onChange, onBack, onNext }: { value: string; onChange: (v: string) => void; onBack: () => void; onNext: () => void }) {
  return (
    <StepShell
      eyebrow="Step 5 of 7"
      title="Why does this matter?"
      subtitle="Write it once. We'll show it back to you on Day 55."
    >
      <textarea
        rows={8}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="This matters to me because…"
        className="w-full rounded-3xl p-5 text-base leading-relaxed ring-1 ring-foreground/5 focus:ring-primary/50 focus:outline-none bg-linear-to-br from-secondary/50 via-card to-secondary/30"
      />
      <NavRow onBack={onBack} onNext={onNext} nextDisabled={value.trim().length < 10} />
    </StepShell>
  );
}

function StepVision({ uid, items, reload, onBack, onNext }: { uid: string; items: VisionItem[]; reload: () => Promise<void>; onBack: () => void; onNext: () => void }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  async function upload(file: File) {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${uid}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("vision-board")
        .upload(path, file, { contentType: file.type });
      if (upErr) throw upErr;
      const { error } = await supabase.from("vision_board_items").insert({
        user_id: uid,
        storage_path: path,
        sort_order: items.length,
      });
      if (error) throw error;
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function remove(item: VisionItem) {
    await supabase.storage.from("vision-board").remove([item.storage_path]);
    await supabase.from("vision_board_items").delete().eq("id", item.id);
    await reload();
  }

  const frameGradients = [
    "bg-linear-to-br from-secondary/40 to-secondary/30",
    "bg-linear-to-br from-primary/40 to-secondary/30",
    "bg-linear-to-br from-secondary/40 to-secondary/20",
    "bg-linear-to-br from-secondary/40 to-primary/20",
  ];

  return (
    <StepShell
      eyebrow="Step 6 of 7"
      title="Your vision board."
      subtitle="Upload up to 8 images that show what you're moving toward. Family, holiday, a dress, the version of you you're becoming. Private to you."
    >
      <div className="grid grid-cols-2 gap-3">
        {items.map((item, i) => {
          return (
            <div key={item.id} className={`relative rounded-2xl overflow-hidden aspect-square ${frameGradients[i % frameGradients.length]} ring-2 ring-white/60`}>
              {item.url && <img src={item.url} alt="vision" className="w-full h-full object-cover" />}
              <button
                onClick={() => remove(item)}
                className="absolute top-2 right-2 size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                aria-label="Remove"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          );
        })}
        {items.length < 8 && (
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="rounded-2xl border-2 border-dashed border-primary/50 aspect-square flex flex-col items-center justify-center gap-2 bg-linear-to-br from-secondary/20 via-card to-primary/20 hover:from-secondary/35 hover:via-card hover:to-primary/35 transition disabled:opacity-60"
          >
            <ImagePlus className="size-8 text-foreground/70" />
            <span className="text-xs text-muted-foreground">{uploading ? "Uploading…" : "Add image"}</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void upload(f);
          e.target.value = "";
        }}
      />
      <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <Lock className="size-3.5" /> Only you can see these images.
      </p>
      <NavRow onBack={onBack} onNext={onNext} />
    </StepShell>
  );
}

function StepLetter({ value, onChange, onBack, onNext }: { value: string; onChange: (v: string) => void; onBack: () => void; onNext: () => void }) {
  return (
    <StepShell
      eyebrow="Step 7 of 7"
      title="A letter to future you."
      subtitle="Write to the person you'll be on Day 55. What do you want them to know? What are you promising them? This letter will be sealed until then."
    >
      <textarea
        rows={12}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Dear future me,"
        className="w-full rounded-3xl p-5 text-base leading-relaxed font-display italic ring-1 ring-foreground/5 focus:ring-primary/40 focus:outline-none bg-linear-to-br from-card via-background to-secondary/40"
      />
      <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        <Lock className="size-3.5" /> Sealed until Day 55.
      </p>
      <NavRow onBack={onBack} onNext={onNext} nextDisabled={value.trim().length < 20} nextLabel="Finish" />
    </StepShell>
  );
}

function StepDone({ onComplete }: { onComplete: () => void }) {
  return (
    <StepShell eyebrow="You're ready" title="The foundation is set.">
      <div className="rounded-3xl p-8 relative overflow-hidden bg-linear-to-br from-secondary via-primary to-secondary text-foreground">
        <div className="pointer-events-none absolute -top-20 -right-20 size-56 rounded-full bg-card/30 blur-3xl" />
        <Sparkles className="size-6 mb-4" />
        <p className="font-display italic text-2xl leading-snug mb-4">
          Tomorrow is Day 1. Today, you chose yourself.
        </p>
        <p className="text-sm leading-relaxed text-foreground/85">
          Your goals, your wheel, your why, your vision and your letter are saved. We'll
          bring them back to you at the moments that matter.
        </p>
      </div>
      <button
        onClick={onComplete}
        className="mt-8 w-full rounded-full bg-primary text-primary-foreground py-4 text-sm font-semibold hover:bg-primary/90 transition"
      >
        Enter the challenge
      </button>
    </StepShell>
  );
}
