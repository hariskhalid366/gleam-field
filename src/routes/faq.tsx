import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { faqs } from "@/data/servicepro";
import { api, apiConfigured, type PublicSiteContent } from "@/lib/api";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — ServicePro" },
      { name: "description", content: "Answers to the most common questions about booking, pricing, warranty, and technician verification at ServicePro." },
      { property: "og:title", content: "FAQ — ServicePro" },
      { property: "og:description", content: "Answers about booking, pricing, warranty, and technician verification." },
    ],
  }),
  component: FAQPage,
});

function FAQPage() {
  const { data } = useQuery({ queryKey: ["public-faqs"], enabled: apiConfigured, staleTime: 60_000, queryFn: () => api.content.publicSite().catch(() => ({ data: {} as PublicSiteContent })) });
  const items = data?.data.faqs?.length ? data.data.faqs : faqs;
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <p className="eyebrow">FAQ</p>
      <h1 className="mt-3 text-5xl font-light tracking-tight sm:text-6xl">
        Frequently <span className="font-semibold">asked.</span>
      </h1>
      <p className="mt-4 text-muted-foreground">Can't find what you're looking for? Contact support — we're here 24/7.</p>

      <Accordion type="single" collapsible className="mt-10 space-y-3">
        {items.map((f, i) => (
          <AccordionItem key={i} value={`i-${i}`} className="card-elevated overflow-hidden border-none px-5 [&[data-state=open]]:shadow-[var(--shadow-floating)]">
            <AccordionTrigger className="text-left text-base font-semibold hover:no-underline">{f.q}</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
