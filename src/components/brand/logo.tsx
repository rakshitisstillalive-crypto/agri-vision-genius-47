import { Link } from "@tanstack/react-router";

import logoAsset from "@/assets/farmers-ai-logo.jpg.asset.json";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center overflow-hidden rounded-full bg-background shadow-elegant ring-1 ring-primary/25",
        className ?? "size-9",
      )}
    >
      <img
        src={logoAsset.url}
        alt="Farmer's APP logo"
        className="size-full scale-[1.15] object-cover"
        loading="lazy"
      />
    </span>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn("group flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="font-display text-lg font-bold tracking-tight">
        Farmer&apos;s&nbsp;&nbsp;<span className="text-gradient">APP</span>
      </span>
    </Link>
  );
}
