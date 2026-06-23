import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  href = "/",
}: {
  className?: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-2.5 font-display text-lg font-bold tracking-tight",
        className,
      )}
    >
      <span className="relative flex size-8 items-center justify-center rounded-lg bg-gold-gradient text-ink-900 shadow-gold">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="size-4"
          aria-hidden="true"
        >
          <path
            d="M12 2L4 8l8 5 8-5-8-6Z"
            fill="currentColor"
            opacity="0.9"
          />
          <path
            d="M4 14l8 5 8-5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="text-white">
        RankUp<span className="text-gold">PH</span>
      </span>
    </Link>
  );
}
