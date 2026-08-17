import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import type { AnalysisReport } from "@/lib/analysis-types";
import { SYSTEM_PROMPT } from "@/lib/analysis-prompt";

const InputSchema = z.object({
  imageDataUrl: z.string().min(20),
  note: z.string().max(500).optional(),
});

export const analyzeImage = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<AnalysisReport> => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("AI gateway is not configured.");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3.1-pro-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: data.note
                  ? `Analyse this sample. Grower note: ${data.note}`
                  : "Analyse this sample and return the JSON report.",
              },
              { type: "image_url", image_url: { url: data.imageDataUrl } },
            ],
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (response.status === 429) throw new Error("Too many requests — please try again shortly.");
    if (response.status === 402)
      throw new Error("AI credits exhausted. Please top up your workspace credits.");
    if (!response.ok) {
      console.error("AI gateway error", response.status, await response.text());
      throw new Error("The analysis engine could not process this image.");
    }

    const payload = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const raw = payload.choices?.[0]?.message?.content ?? "";
    const cleaned = raw
      .trim()
      .replace(/^```(?:json)?/i, "")
      .replace(/```$/, "");

    try {
      return JSON.parse(cleaned) as AnalysisReport;
    } catch {
      const start = cleaned.indexOf("{");
      const end = cleaned.lastIndexOf("}");
      if (start >= 0 && end > start) {
        return JSON.parse(cleaned.slice(start, end + 1)) as AnalysisReport;
      }
      throw new Error("The analysis engine returned an unreadable report. Please retry.");
    }
  });
