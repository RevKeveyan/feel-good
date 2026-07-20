import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { MindsetLibrary } from "@/components/MindsetLibrary";

export const Route = createFileRoute("/_authenticated/mindset")({
  head: () => ({
    meta: [
      { title: "21-Day Mindset Rewire, The Feel Good Challenge" },
      {
        name: "description",
        content:
          "Guided tracks designed to strengthen confidence, nurture emotional wellbeing and cultivate calm.",
      },
    ],
  }),
  component: MindsetPage,
});

function MindsetPage() {
  return (
    <div className="min-h-screen bg-background pb-24 max-w-md mx-auto">
      <div className="px-6 pt-8">
        <Link
          to="/today"
          className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> Back to today
        </Link>
      </div>
      <MindsetLibrary />
    </div>
  );
}
