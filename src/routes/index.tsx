import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Camera,
  Droplets,
  FlaskConical,
  Leaf,
  ShieldCheck,
  Sprout,
  Wheat,
} from "lucide-react";

import { Analyzer } from "@/components/analysis/analyzer";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Farmer's AI — Instant Crop, Soil & Seed Diagnostics from a Photo" },
      {
        name: "description",
        content:
          "Upload a crop, fruit, seed or soil photo and get an instant agronomic report: disease detection, nutrient deficiencies, Brix, pH, germination and a downloadable PDF.",
      },
      { property: "og:title", content: "Farmer's AI — Agricultural Intelligence from a Photo" },
      {
        property: "og:description",
        content:
          "Elite biological vision AI for growers: crop health, soil diagnostics, seed quality and produce grading in seconds.",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "Farmer's AI",
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          description:
            "AI-powered crop health, soil diagnostics, seed quality and produce grading from photographs.",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }),
      },
    ],
  }),
  component: Home,
});

const features = [
  {
    icon: Leaf,
    title: "Crop Health Analyzer",
    body: "Species ID, disease and pest detection, nutrient deficiency mapping with organic and chemical corrections.",
    to: "/product/crop-health" as const,
  },
  {
    icon: Droplets,
    title: "Soil Diagnostics",
    body: "Texture class, pH, moisture balance, N-P-K breakdown, best crops and the ideal irrigation setup.",
    to: "/product/soil-diagnostics" as const,
  },
  {
    icon: Leaf,
    title: "Leaf Classification",
    body: "Identify plant species, leaf disorders, and stress patterns from a single photo with AI taxonomy and health scoring.",
    to: "/product/crop-health" as const,
  },
  {
    icon: Wheat,
    title: "Seed Quality Tester",
    body: "Germination percentage, physical purity, moisture content and GMO/cultivar trait indicators.",
    to: "/product/seed-quality" as const,
  },
];

const steps = [
  { icon: Camera, title: "Upload a photo", body: "Snap a leaf, fruit, seed lot or a patch of soil." },
  {
    icon: FlaskConical,
    title: "Biological vision runs",
    body: "The agent classifies the sample and cross-checks agronomy, pathology and soil science.",
  },
  {
    icon: ShieldCheck,
    title: "Get an actionable report",
    body: "Interactive dashboard plus a printable PDF field report you can share with your team.",
  },
];

function Home() {
  return (
    <>
      <section className="gradient-soft relative overflow-hidden border-b border-border">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-[1.05fr_1fr] lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
              <Sprout className="size-3.5" /> Biological vision for growers
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-[1.08] sm:text-6xl">
              Diagnose your field with a <span className="text-gradient">single photo</span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
              Farmer&apos;s AI reads crops, fruit, seeds and soil like an agronomist — identifying
              species, diseases, nutrient gaps, Brix, pH, germination and safety, then hands you a
              downloadable field report.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link to="/analyze">Analyze a photo free</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/manual">Read the manual</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              No signup for analysis · Login only needed to save history
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 self-center">
            {[
              { k: "Diagnostic points", v: "40+" },
              { k: "Analysis time", v: "~15s" },
              { k: "Crop families", v: "300+" },
              { k: "Report formats", v: "Web + PDF" },
            ].map((s) => (
              <div key={s.k} className="surface-card p-5">
                <p className="text-3xl font-bold text-gradient">{s.v}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.k}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="analyze" className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="text-2xl font-bold sm:text-3xl">Start an analysis</h2>
        <p className="mt-2 text-muted-foreground">
          Guest mode gives you the complete report — nothing held back.
        </p>
        <div className="mt-6">
          <Analyzer />
        </div>
      </section>

      <section className="bg-secondary/40 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold sm:text-3xl">One engine, four instruments</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <Link key={f.title} to={f.to} className="surface-card group p-5 transition-shadow hover:shadow-elegant">
                <span className="gradient-primary mb-4 flex size-10 items-center justify-center rounded-xl text-primary-foreground">
                  <f.icon className="size-5" />
                </span>
                <h3 className="text-base font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
                <span className="mt-3 inline-block text-sm font-medium text-primary">Learn more →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-bold sm:text-3xl">How it works</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.title} className="surface-card p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                Step {i + 1}
              </p>
              <s.icon className="mt-3 size-6 text-primary" />
              <h3 className="mt-3 text-base font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
