"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { RegionSelector } from "@/components/i18n/region-modal";
import { useT } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/services", key: "nav.services" },
  { href: "/pricing-calculator", key: "nav.pricing" },
  { href: "/track-order", key: "nav.track" },
];

export function Navbar() {
  const { data: session } = useSession();
  const t = useT();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu on navigation.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const dashHref =
    session?.user?.role === "ADMIN"
      ? "/admin"
      : session?.user?.role === "PROVIDER"
        ? "/provider"
        : "/dashboard";

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-white/[0.06] bg-ink-900/80 backdrop-blur-xl"
          : "border-b border-transparent",
      )}
    >
      <nav className="container flex h-16 items-center justify-between">
        <Logo />

        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {t(l.key)}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <RegionSelector />
          {session ? (
            <Button asChild size="sm">
              <Link href={dashHref}>{t("nav.dashboard")}</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">{t("nav.signin")}</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/pricing-calculator">{t("nav.getStarted")}</Link>
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          className="-mr-2 flex size-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-white/5 md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-white/[0.06] bg-ink-900/95 backdrop-blur-xl md:hidden"
          >
            <div className="container flex flex-col gap-1 py-4">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-3 text-base font-medium text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                >
                  {t(l.key)}
                </Link>
              ))}
              <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/[0.06] pt-4">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                  {t("region.title")}
                </span>
                <RegionSelector />
              </div>
              <div className="mt-3 flex flex-col gap-2.5">
                {session ? (
                  <Button asChild size="lg" className="w-full">
                    <Link href={dashHref}>{t("nav.dashboard")}</Link>
                  </Button>
                ) : (
                  <>
                    <Button asChild variant="secondary" size="lg" className="w-full">
                      <Link href="/login">{t("nav.signin")}</Link>
                    </Button>
                    <Button asChild size="lg" className="w-full">
                      <Link href="/pricing-calculator">{t("nav.getStarted")}</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
