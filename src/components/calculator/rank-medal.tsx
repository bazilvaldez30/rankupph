import Image from "next/image";
import { cn } from "@/lib/utils";

/** Per-medal accent colors for the SVG emblem fallback. */
const MEDAL_COLORS: Record<string, { from: string; to: string; ring: string }> = {
  Herald: { from: "#8b8f96", to: "#5b5f66", ring: "#6b7280" },
  Guardian: { from: "#c8a06a", to: "#8a6a3f", ring: "#a17a4a" },
  Crusader: { from: "#cbd5e1", to: "#94a3b8", ring: "#aab6c6" },
  Archon: { from: "#7fd3d8", to: "#3f898f", ring: "#5b9aa0" },
  Legend: { from: "#b794f6", to: "#7c4ddb", ring: "#9b6cf0" },
  Ancient: { from: "#5ad6ee", to: "#0e98b8", ring: "#22b8d6" },
  Divine: { from: "#7db1ff", to: "#2f6fe0", ring: "#4b86f0" },
  Immortal: { from: "#ffd66e", to: "#e0432f", ring: "#f0a23a" },
};

const SIZES = { sm: 40, md: 64, lg: 88 } as const;

interface RankMedalProps {
  name: string;
  iconUrl?: string;
  size?: keyof typeof SIZES;
  className?: string;
}

/**
 * Premium rank emblem. Renders an official medal image when `iconUrl` is set,
 * otherwise a luxury SVG emblem colored per medal — no external assets needed.
 */
export function RankMedal({ name, iconUrl, size = "md", className }: RankMedalProps) {
  const px = SIZES[size];
  const c = MEDAL_COLORS[name] ?? MEDAL_COLORS.Archon!;
  const id = `medal-${name.toLowerCase()}`;

  if (iconUrl) {
    return (
      <Image
        src={iconUrl}
        alt={`${name} medal`}
        width={px}
        height={px}
        className={cn("object-contain", className)}
      />
    );
  }

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 64 64"
      fill="none"
      className={cn("shrink-0 drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)]", className)}
      aria-label={`${name} medal`}
      role="img"
    >
      <defs>
        <radialGradient id={`${id}-bg`} cx="50%" cy="38%" r="70%">
          <stop offset="0%" stopColor={c.from} />
          <stop offset="100%" stopColor={c.to} />
        </radialGradient>
      </defs>
      {/* outer ring */}
      <circle cx="32" cy="32" r="29" fill="#0a0a0a" stroke={c.ring} strokeWidth="2" />
      <circle cx="32" cy="32" r="24" fill={`url(#${id}-bg)`} opacity="0.9" />
      {/* inner bevel */}
      <circle cx="32" cy="32" r="24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
      {/* star */}
      <path
        d="M32 16l4.7 9.5 10.5 1.5-7.6 7.4 1.8 10.4L32 49.4l-9.4 4.9 1.8-10.4-7.6-7.4 10.5-1.5L32 16z"
        fill="#0a0a0a"
        opacity="0.35"
      />
      <path
        d="M32 18l4.1 8.3 9.2 1.3-6.6 6.5 1.6 9.1L32 46.2l-8.3 4.3 1.6-9.1-6.6-6.5 9.2-1.3L32 18z"
        fill="rgba(255,255,255,0.92)"
      />
    </svg>
  );
}
