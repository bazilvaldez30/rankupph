import { Lock } from "lucide-react";
import { Logo } from "@/components/shared/logo";

export default function OrdersFlowLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-dvh">
      <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-gold/[0.06] blur-[130px]" />
      <header className="relative z-10 flex items-center justify-between border-b border-white/[0.06] px-6 py-5 sm:px-10">
        <Logo />
        <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
          <Lock className="size-3.5 text-gold" />
          Encrypted &amp; audited
        </span>
      </header>
      <main className="relative z-10 px-6 py-12">{children}</main>
    </div>
  );
}
