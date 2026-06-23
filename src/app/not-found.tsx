import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";

export default function NotFound() {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-80 w-80 -translate-x-1/2 rounded-full bg-gold/10 blur-[130px]" />
      <div className="relative">
        <Logo className="mx-auto" />
        <h1 className="mt-10 font-display text-7xl font-bold text-white sm:text-8xl">
          4<span className="gold-text">0</span>4
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          This page wandered off the map.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/">Back to home</Link>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <Link href="/services">Explore services</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
