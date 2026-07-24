import { createFileRoute } from "@tanstack/react-router";
import { termsOfService } from "@feelgood/shared";
import { LegalDocumentPage } from "@/components/LegalDocumentPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — The Feel Good Challenge" },
      {
        name: "description",
        content:
          "The rules of participation, prize eligibility, and user conduct for The Feel Good Society's 55-day challenge.",
      },
      { property: "og:title", content: "Terms of Service — The Feel Good Challenge" },
      { property: "og:url", content: "/terms" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/terms" }],
  }),
  component: () => <LegalDocumentPage doc={termsOfService} />,
});
