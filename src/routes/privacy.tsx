import { createFileRoute } from "@tanstack/react-router";
import { privacyPolicy } from "@feelgood/shared";
import { LegalDocumentPage } from "@/components/LegalDocumentPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — The Feel Good Challenge" },
      {
        name: "description",
        content:
          "How The Feel Good Society collects, uses, and protects your personal information during the 55-day challenge.",
      },
      { property: "og:title", content: "Privacy Policy — The Feel Good Challenge" },
      { property: "og:url", content: "/privacy" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/privacy" }],
  }),
  component: () => <LegalDocumentPage doc={privacyPolicy} />,
});
