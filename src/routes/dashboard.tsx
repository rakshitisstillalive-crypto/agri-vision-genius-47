import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Download, Loader2, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ReportView } from "@/components/analysis/analyzer";
import { PageHero } from "@/components/site/page";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { AnalysisReport } from "@/lib/analysis-types";
import { downloadReportPdf } from "@/lib/report-pdf";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Your analysis history — Farmer's AI" },
      {
        name: "description",
        content: "Review, re-download and manage every crop, seed and soil report you have saved.",
      },
      { property: "og:title", content: "Your analysis history — Farmer's AI" },
      { property: "og:description", content: "Saved crop, seed and soil AI reports in one place." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

type Row = {
  id: string;
  title: string;
  kind: string;
  created_at: string;
  image_data_url: string | null;
  report: AnalysisReport;
};

function Dashboard() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) void navigate({ to: "/auth", search: { redirect: "/dashboard" } });
  }, [loading, user, navigate]);

  const { data, isLoading } = useQuery({
    queryKey: ["analyses", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("analyses")
        .select("id,title,kind,created_at,image_data_url,report")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as Row[];
    },
  });

  const remove = async (id: string) => {
    const { error } = await supabase.from("analyses").delete().eq("id", id);
    if (error) return toast.error("Could not delete this report.");
    toast.success("Report deleted.");
    void qc.invalidateQueries({ queryKey: ["analyses", user?.id] });
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  const open = data?.find((r) => r.id === openId) ?? null;

  return (
    <>
      <PageHero
        eyebrow="Dashboard"
        title={`Welcome back, ${user.user_metadata?.["full_name"] ?? user.email?.split("@")[0]}`}
        description="Every analysis you save lives here — reopen the interactive report or re-download the PDF at any time."
      >
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/analyze">New analysis</Link>
          </Button>
          <Button variant="outline" onClick={() => void signOut()}>
            Sign out
          </Button>
        </div>
      </PageHero>

      <div className="mx-auto max-w-6xl px-4 py-12">
        {isLoading ? (
          <Loader2 className="size-5 animate-spin text-primary" />
        ) : !data?.length ? (
          <div className="surface-card p-10 text-center">
            <p className="font-medium">No saved reports yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Run an analysis and hit “Save to history”.
            </p>
            <Button className="mt-5" asChild>
              <Link to="/analyze">Analyze a photo</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((row) => (
              <div key={row.id} className="surface-card overflow-hidden">
                {row.image_data_url ? (
                  <img
                    src={row.image_data_url}
                    alt={`Saved sample: ${row.title}`}
                    className="h-36 w-full object-cover"
                  />
                ) : null}
                <div className="p-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                    {row.kind}
                  </p>
                  <h3 className="mt-1 line-clamp-2 text-sm font-semibold">{row.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(row.created_at).toLocaleString()}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => setOpenId(row.id === openId ? null : row.id)}>
                      {row.id === openId ? "Close" : "View"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadReportPdf(row.report, row.image_data_url)}
                    >
                      <Download className="size-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => void remove(row.id)}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {open ? (
          <div className="mt-10">
            <ReportView report={open.report} imageDataUrl={open.image_data_url} />
          </div>
        ) : null}
      </div>
    </>
  );
}
