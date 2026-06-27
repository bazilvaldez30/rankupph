import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { SITE } from "@/lib/constants";
import { T } from "@/components/i18n/t";
import { CinematicBackdrop } from "@/components/cinematic/cinematic-backdrop";

const COLUMNS = [
  {
    title: "footer.col.services",
    links: [
      { href: "/services/mmr-boosting", key: "footer.link.mmr" },
      { href: "/services/duo-queue", key: "footer.link.duo" },
      { href: "/services/coaching", key: "footer.link.coaching" },
      { href: "/pricing-calculator", key: "footer.link.calc" },
    ],
  },
  {
    title: "footer.col.company",
    links: [
      { href: "/#why", key: "footer.link.why" },
      { href: "/#reviews", key: "footer.link.reviews" },
      { href: "/#faq", key: "footer.link.faq" },
      { href: "/track-order", key: "nav.track" },
      { href: "/become-a-booster", key: "footer.link.becomeBooster" },
    ],
  },
  {
    title: "footer.col.account",
    links: [
      { href: "/login", key: "nav.signin" },
      { href: "/register", key: "footer.link.createAccount" },
      { href: "/dashboard", key: "nav.dashboard" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/[0.06] bg-ink-800/40">
      <CinematicBackdrop image="/ancient-ruines.png" opacity={0.06} glow="none" objectPosition="bottom" />
      <div className="container relative py-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.5fr_2fr] lg:gap-12">
          <div className="space-y-4">
            <Logo />
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              {SITE.description}
            </p>
            <p className="text-xs text-muted-foreground/70">
              <T k="footer.disclaimer" />
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h4 className="mb-4 text-sm font-semibold text-foreground">
                  <T k={col.title} />
                </h4>
                <ul className="space-y-3">
                  {col.links.map((l) => (
                    <li key={l.href + l.key}>
                      <Link
                        href={l.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-gold"
                      >
                        <T k={l.key} />
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
            © {new Date().getFullYear()} {SITE.legalName}. <T k="footer.copyright" />
          </p>
          <p className="text-xs text-muted-foreground">
            <T k="footer.serving" />
          </p>
        </div>
      </div>
    </footer>
  );
}
