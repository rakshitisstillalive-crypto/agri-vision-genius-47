export const analyzeImage = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<AnalysisReport> => {
    const apiKey = process.env["OPENAI_API_KEY"];
    if (!apiKey) throw new Error("OpenAI API key is not configured.");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",               // or "gpt-4o-mini" for cheaper/faster
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
              {
                type: "image_url",
                image_url: {
                  url: data.imageDataUrl,
                  detail: "high",      // or "low" to save tokens
                },
              },
            ],
          },
        ],
        response_format: { type: "json_object" },
        max_tokens: 4096,
      }),
    });

    if (response.status === 429)
      throw new Error("Too many requests — please try again shortly.");
    if (response.status === 401)
      throw new Error("Invalid OpenAI API key.");
    if (response.status === 402 || response.status === 403)
      throw new Error("OpenAI billing / quota issue. Check your account.");
    if (!response.ok) {
      const text = await response.text();
      console.error("OpenAI error", response.status, text);
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
