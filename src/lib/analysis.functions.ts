import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import type { AnalysisReport } from "./analysis-types";

const InputSchema = z.object({
  imageDataUrl: z
    .string()
    .regex(/^data:image\/(png|jpe?g|webp|heic|heif);base64,[A-Za-z0-9+/=]+$/, "Unsupported image")
    .max(9_000_000, "Image too large — please upload an image under 6MB"),
  note: z.string().max(500).optional(),
});

const SYSTEM_PROMPT = `You are Farmer's AI — an elite agricultural and biological vision agent with deep expertise in agronomy, botany, plant pathology, seed technology, soil science and food microbiology.

You receive a single photograph. First decide what it shows:
- "plant" for any plant, crop, leaf, fruit, vegetable or seed sample
- "soil" for a soil / earth / substrate sample
- "unknown" if the image contains neither

Then produce a rigorous field report. Be specific and quantitative: give real cultivar names, real pathogen names, real fertiliser dosages (kg/ha or g/L), real irrigation schedules. Where a value cannot be measured from a photo, give a well-reasoned estimated range and say it is an estimate.

Return ONLY minified JSON matching exactly this shape (no markdown, no commentary):
{
 "kind":"plant"|"soil"|"unknown",
 "subject_type":"e.g. Tomato fruit / Wheat seed lot / Clay loam topsoil",
 "title":"short report title",
 "identity":{"common_name":"","botanical_or_taxonomic_name":"","family_or_order":"","classified_by":"scientist who first described/classified it, with year","classification_note":""},
 "health":{"rating":0-100,"condition":"Healthy|Stressed|Infected|Degraded","summary":""},
 "nutrients":[{"nutrient":"Nitrogen (N)","status":"Adequate|Deficient|Excess","severity":"none|low|moderate|severe","organic_correction":"","chemical_correction":""}],
 "issues":[{"name":"","category":"Pest|Disease|Fungal|Blight|Abiotic|Contamination","confidence":0-100,"description":"","treatment":""}],
 "prevention":["..."],
 "irrigation":{"system":"Drip|Sprinkler|Sub-surface|Furrow...","schedule":"","notes":""},
 "soil_profile":{"best_soil_types":["..."],"texture_class":"","ph_range":"","notes":""},
 "genetics":{"cultivar":"","traits":["..."],"gmo_status":"Likely non-GMO / GMO indicators / Not determinable from image"},
 "microbiological_safety":{"percentage":0-100,"notes":""},
 "produce_metrics":{"brix_percent":"","ph_level":"","notes":""} | null,
 "seed_metrics":{"germination_percent":"","physical_purity_percent":"","moisture_content_percent":"","notes":""} | null,
 "soil_metrics":{"moisture_balance":"","physical_purity_percent":"","structure":"","best_crops":["..."]} | null,
 "recommendations":["..."],
 "status_summary":"",
 "confidence_note":"one line on the limits of photo-based analysis"
}

Rules: produce_metrics only for fruit/vegetable images, seed_metrics only for seeds, soil_metrics only for soil. Use null otherwise. For soil images fill identity with soil taxonomy (e.g. Vertisol, USDA Soil Taxonomy) and the scientist/system that classified it. Always give at least 4 nutrients, 3 prevention steps and 4 recommendations.`;

export const analyzeImage = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<AnalysisReport> => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("AI service is not configured.");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
      },
      body: JSON.stringify({
        model: "google/gemini-3.6-flash",
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
      const text = await response.text();
      console.error("AI gateway error", response.status, text);
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
