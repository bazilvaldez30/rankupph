import { cn } from "@/lib/utils";

interface CinematicBackdropProps {
  /** Background art in /public, e.g. "/battlefield.png". */
  image?: string;
  /** Image opacity (0.06–0.12). */
  opacity?: number;
  objectPosition?: string;
  /** Soft gold lighting placement (pure gradient — no blur). */
  glow?: "top" | "center" | "bottom" | "none";
  /** Fade the art into neighbouring sections at top/bottom. */
  fadeEdges?: boolean;
  vignette?: boolean;
  className?: string;
}

/**
 * Static, atmospheric section backdrop — no animation, no parallax, no blur.
 * Just art blended into the design via a dark overlay, soft gold lighting,
 * a gentle vignette, and gradient masks that fade it into adjacent sections.
 * Scoped to a `relative overflow-hidden` parent; sits behind `relative` content.
 */
export function CinematicBackdrop({
  image,
  opacity = 0.09,
  objectPosition = "center",
  glow = "top",
  fadeEdges = true,
  vignette = true,
  className,
}: CinematicBackdropProps) {
  const glowGradient =
    glow === "top"
      ? "radial-gradient(55% 45% at 50% 0%, rgba(212,175,55,0.07), transparent 70%)"
      : glow === "bottom"
        ? "radial-gradient(55% 45% at 50% 100%, rgba(212,175,55,0.07), transparent 70%)"
        : "radial-gradient(50% 50% at 50% 50%, rgba(212,175,55,0.06), transparent 70%)";

  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {/* Background art */}
      {image && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt=""
            className="absolute inset-0 size-full object-cover"
            style={{ objectPosition, opacity }}
          />
          {/* Dark overlay — keeps content perfectly readable */}
          <div className="absolute inset-0 bg-ink-900/30" />
        </>
      )}

      {/* Soft gold lighting (gradient, no blur) */}
      {glow !== "none" && (
        <div className="absolute inset-0" style={{ background: glowGradient }} />
      )}

      {/* Gentle vignette */}
      {vignette && (
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(85% 75% at 50% 50%, transparent 40%, rgba(5,5,5,0.55) 100%)",
          }}
        />
      )}

      {/* Gradient masks — blend the art into neighbouring sections */}
      {fadeEdges && (
        <>
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-ink-900 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-ink-900 to-transparent" />
        </>
      )}
    </div>
  );
}
