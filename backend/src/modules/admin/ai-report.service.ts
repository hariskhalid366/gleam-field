import { env } from "../../config/env.js";
import { ApiError } from "../../utils/ApiError.js";
import type { AdminService } from "./admin.service.js";

export type AiReportSummary = {
  overview: string;
  highlights: string[];
  risks: string[];
  recommendations: string[];
};

const schema = {
  type: "object",
  additionalProperties: false,
  required: ["overview", "highlights", "risks", "recommendations"],
  properties: {
    overview: { type: "string" },
    highlights: { type: "array", items: { type: "string" }, maxItems: 4 },
    risks: { type: "array", items: { type: "string" }, maxItems: 4 },
    recommendations: { type: "array", items: { type: "string" }, maxItems: 4 },
  },
};

/** Generate an admin-only narrative from aggregated, non-identifying metrics. */
export async function generateAiReportSummary(report: Awaited<ReturnType<typeof AdminService.getReportData>>): Promise<AiReportSummary> {
  const apiKey = env.GEMINI_API_KEY ?? env.GIMINAI_API;
  if (!apiKey) throw new ApiError(503, "AI reports are not configured. Add GEMINI_API_KEY to the backend environment.");
  const input = {
    period: { from: report.from.toISOString(), to: report.to.toISOString(), range: report.range },
    metrics: report.metrics,
    revenueSeries: report.revenueSeries,
    serviceDistribution: report.serviceDistribution,
  };
  let response: Response;
  try {
    response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(env.GEMINI_REPORT_MODEL)}:generateContent`, {
      method: "POST",
      headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Analyse this ServicePro operational report. Use only the supplied figures; do not invent causes, benchmarks, customers, or facts. Keep every list concise and actionable.\n\n${JSON.stringify(input)}` }] }],
        generationConfig: { responseMimeType: "application/json", responseJsonSchema: schema, temperature: 0.2 },
      }),
      signal: AbortSignal.timeout(30_000),
    });
  } catch {
    throw new ApiError(503, "AI report service is temporarily unavailable");
  }
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) throw new ApiError(503, "AI report credentials were rejected. Check GEMINI_API_KEY.");
    if (response.status === 429) throw new ApiError(429, "Gemini quota is exhausted. Check your Gemini API plan, billing, or rate limits and try again later.");
    if (response.status === 404) throw new ApiError(503, "The configured Gemini model is unavailable. Check GEMINI_REPORT_MODEL.");
    throw new ApiError(503, "AI report service is temporarily unavailable");
  }
  const payload = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  try {
    const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "";
    const result = JSON.parse(text) as AiReportSummary;
    if (!result.overview || !Array.isArray(result.highlights) || !Array.isArray(result.risks) || !Array.isArray(result.recommendations)) throw new Error("Unexpected AI response");
    return result;
  } catch {
    throw new ApiError(502, "AI report returned an invalid response. Please try again.");
  }
}
