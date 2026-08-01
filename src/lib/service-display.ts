import { services, type Service } from "@/data/servicepro";
import type { ApiService } from "@/lib/api";

/** Maps the API catalog contract to the visual fields used by public pages. */
export function toDisplayService(service: ApiService): Service {
  const fallback = services.find((item) => item.slug === service.slug);
  return {
    slug: service.slug,
    title: service.name,
    description: service.description ?? "Verified professionals, ready when you need them.",
    startingPrice: service.basePrice,
    eta: service.estimatedDuration,
    // Icons are local presentation assets, while service information is API-owned.
    icon: fallback?.icon ?? services[0]!.icon,
    category: service.category ?? fallback?.category ?? "General",
  };
}
