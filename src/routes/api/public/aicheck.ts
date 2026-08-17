import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/aicheck")({
  server: {
    handlers: {
      GET: async () => {
        const key = process.env["OPENAI_API_KEY"];
        if (!key) return new Response("no key", { status: 500 });
        const r = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [{ role: "user", content: "say ok" }],
            max_tokens: 5,
          }),
        });
        return new Response(`${r.status}`, { status: 200 });
      },
    },
  },
});
