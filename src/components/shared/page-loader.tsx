import { Loader2 } from "lucide-react";

export function PageLoader() {
  return (
    <div className="flex min-h-[60dvh] items-center justify-center">
      <Loader2 className="size-7 animate-spin text-gold" />
    </div>
  );
}
