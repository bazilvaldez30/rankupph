"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useT } from "@/hooks/use-translation";

const MESSAGE_KEYS = ["live.m1", "live.m2", "live.m3", "live.m4"];

/** Rotating "live" social-proof badge. Conversion nudge near CTAs. */
export function LiveActivity({ className }: { className?: string }) {
  const t = useT();
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setI((p) => (p + 1) % MESSAGE_KEYS.length), 3500);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className={`inline-flex items-center gap-2.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 backdrop-blur-xl ${className ?? ""}`}
    >
      <span className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400/70" />
        <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
      </span>
      <AnimatePresence mode="wait">
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3 }}
          className="text-xs font-medium text-foreground/80"
        >
          {t(MESSAGE_KEYS[i]!)}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
