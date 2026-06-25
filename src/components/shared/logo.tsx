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
      <img
        src="/rankup-logo.png"
        alt="RankUpPH"
        width={36}
        height={36}
        className="size-9 shrink-0 object-contain transition-transform group-hover:scale-105"
      />
      <span className="text-white">
        RankUp<span className="text-gold">PH</span>
      </span>
    </Link>
  );
}
