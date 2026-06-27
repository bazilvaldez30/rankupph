import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { NotificationBell } from "@/components/shared/notification-bell";
import { RegionSelector } from "@/components/i18n/region-modal";
import { Badge } from "@/components/ui/badge";

interface AccountShellProps {
  roleLabel: string;
  userName?: string | null;
  children: React.ReactNode;
}

export function AccountShell({
  roleLabel,
  userName,
  children,
}: AccountShellProps) {
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-ink-900/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo />
            <Badge tone="gold" className="hidden sm:inline-flex">
              {roleLabel}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            {userName && (
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {userName}
              </span>
            )}
            <div className="hidden sm:block">
              <RegionSelector />
            </div>
            <NotificationBell />
            <Link
              href="/"
              className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline"
            >
              Home
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="container py-8 sm:py-10">{children}</main>
    </div>
  );
}
