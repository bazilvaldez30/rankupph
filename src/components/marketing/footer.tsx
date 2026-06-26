import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { SITE } from "@/lib/constants";
import { CinematicBackdrop } from "@/components/cinematic/cinematic-backdrop";

const COLUMNS = [
  {
    title: "Services",
    links: [
      { href: "/services/mmr-boosting", label: "MMR Boosting" },
      { href: "/services/duo-queue", label: "Duo Queue" },
      { href: "/services/coaching", label: "Coaching" },
      { href: "/pricing-calculator", label: "Pricing Calculator" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/#why", label: "Why RankUpPH" },
      { href: "/#reviews", label: "Reviews" },
      { href: "/#faq", label: "FAQ" },
      { href: "/track-order", label: "Track Order" },
      { href: "/become-a-booster", label: "Become a Booster" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/login", label: "Sign in" },
      { href: "/register", label: "Create account" },
      { href: "/dashboard", label: "Dashboard" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/[0.06] bg-ink-800/40">
      <CinematicBackdrop image="/ancient-ruines.png" opacity={0.06} glow="none" objectPosition="bottom" />
      <div className="container relative py-16">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_2fr]">
          <div className="space-y-4">
            <Logo />
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              {SITE.description}
            </p>
            <p className="text-xs text-muted-foreground/70">
              Not affiliated with or endorsed by Valve Corporation. Dota 2 is a
              trademark of Valve.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h4 className="mb-4 text-sm font-semibold text-foreground">
                  {col.title}
                </h4>
                <ul className="space-y-3">
                  {col.links.map((l) => (
                    <li key={l.href + l.label}>
                      <Link
                        href={l.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-gold"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {SITE.legalName}. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Serving Dota 2 players worldwide · Secure payments via Stripe &amp; GCash
          </p>
        </div>
      </div>
    </footer>
  );
}
