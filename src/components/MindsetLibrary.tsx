import { useMemo, useRef, useState } from "react";
import { Headphones, Pause, Play, Lock } from "lucide-react";
import {
  MINDSET_CATEGORIES,
  MINDSET_TRACKS,
  getMindsetAudioUrl,
  type MindsetTrack,
  type MindsetCategory,
} from "@/lib/mindset-tracks";

const audioBase = (import.meta.env.VITE_MINDSET_AUDIO_BASE_URL as string | undefined) ?? null;

export function MindsetLibrary({ compact = false }: { compact?: boolean }) {
  const [activeCategory, setActiveCategory] = useState<MindsetCategory | "All">(
    "All",
  );
  const [playingId, setPlayingId] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const tracksWithAudio = useMemo(
    () =>
      MINDSET_TRACKS.map((t) => ({
        ...t,
        audioUrl: getMindsetAudioUrl(t.day, audioBase),
      })),
    [],
  );

  const filtered = useMemo(() => {
    if (activeCategory === "All") return tracksWithAudio;
    return tracksWithAudio.filter((t) => t.category === activeCategory);
  }, [activeCategory, tracksWithAudio]);

  const togglePlay = (track: MindsetTrack) => {
    if (!track.audioUrl) return;
    const audio = audioRef.current;
    if (!audio) return;
    if (playingId === track.id) {
      audio.pause();
      setPlayingId(null);
      return;
    }
    audio.src = track.audioUrl;
    audio.play().then(() => setPlayingId(track.id)).catch(() => setPlayingId(null));
  };

  return (
    <div className="pb-6">
      <audio
        ref={audioRef}
        onEnded={() => setPlayingId(null)}
        preload="none"
        className="hidden"
      />

      <header className={compact ? "px-6 pt-8 pb-4" : "px-6 pt-10 pb-6"}>
        <div className="flex items-start gap-3">
          <div
            className="mt-1 flex size-11 items-center justify-center rounded-2xl shrink-0"
            style={{ background: "#F2BDC2" }}
          >
            <Headphones className="size-5 text-foreground" />
          </div>
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              21-Day Mindset Rewire
            </p>
            <h2 className="font-display text-2xl italic leading-tight">
              One Session. One Moment.
            </h2>
            <p className="mt-1.5 text-sm text-left text-pretty text-muted-foreground">
              Guided tracks designed to strengthen confidence, nurture emotional wellbeing and cultivate calm - helping you feel good, for good.
            </p>
          </div>
        </div>
      </header>

      <div className="px-6">
        <div className="flex flex-wrap gap-2">
          {(["All", ...MINDSET_CATEGORIES] as const).map((cat) => {
            const active = cat === activeCategory;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium ring-1 transition ${
                  active
                    ? "bg-foreground text-background ring-foreground"
                    : "bg-card text-foreground ring-black/10 hover:ring-black/20"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      <section className="mt-5 space-y-6 px-6">
        {(activeCategory === "All"
          ? MINDSET_CATEGORIES
          : [activeCategory]
        ).map((cat) => {
          const tracks = filtered.filter((t) => t.category === cat);
          if (tracks.length === 0) return null;
          const week = tracks[0]?.week;
          return (
            <div key={cat}>
              <div className="mb-3 flex items-baseline justify-between">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Week {week} &middot; {cat}
                </p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {tracks.length} days
                </p>
              </div>
              <ul className="space-y-2">
                {tracks.map((track) => {
                  const isPlaying = playingId === track.id;
                  const locked = !track.audioUrl;
                  return (
                    <li
                      key={track.id}
                      className="flex items-center gap-4 rounded-2xl bg-card p-4 ring-1 ring-black/5"
                    >
                      <button
                        onClick={() => togglePlay(track)}
                        disabled={locked}
                        aria-label={
                          locked
                            ? "Track coming soon"
                            : isPlaying
                            ? "Pause"
                            : "Play"
                        }
                        className={`flex size-12 shrink-0 items-center justify-center rounded-full transition ${
                          locked
                            ? "bg-muted text-muted-foreground"
                            : isPlaying
                            ? "bg-foreground text-background"
                            : "text-foreground hover:opacity-90"
                        }`}
                        style={
                          !locked && !isPlaying
                            ? { background: "#E1C340" }
                            : undefined
                        }
                      >
                        {locked ? (
                          <Lock className="size-4" />
                        ) : isPlaying ? (
                          <Pause className="size-5" />
                        ) : (
                          <Play className="size-5 translate-x-0.5" />
                        )}
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                            Day {String(track.day).padStart(2, "0")}
                          </span>
                          <h3 className="truncate text-sm font-semibold text-foreground">
                            {track.title}
                          </h3>
                        </div>
                        <p className="mt-1 text-xs italic leading-snug text-muted-foreground">
                          &ldquo;{track.affirmation}&rdquo;
                        </p>
                      </div>
                      <span className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        {track.duration}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </section>

      <p className="mt-6 px-6 text-center text-[11px] text-muted-foreground">
        A track unlocks when its audio file is on the CDN (day-XX.mp3). It is not locked to the
        challenge calendar day.
      </p>
    </div>
  );
}
