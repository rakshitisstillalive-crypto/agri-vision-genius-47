import { Link } from "@tanstack/react-router";

import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "gradient-primary inline-flex items-center justify-center rounded-full shadow-elegant ring-1 ring-primary/25",
        className ?? "size-9",
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 32 32" className="size-[62%]" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M16 28V14"
          stroke="currentColor"
          className="text-primary-foreground"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M16 17c0-5 3.6-9 9-9 0 5-3.8 9-9 9Z"
          className="fill-primary-foreground"
          opacity="0.95"
        />
        <path
          d="M15.4 21c-4.4 0-7.9-2.9-7.9-7.2 4.4 0 7.9 2.9 7.9 7.2Z"
          className="fill-primary-foreground"
          opacity="0.7"
        />
      </svg>
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
