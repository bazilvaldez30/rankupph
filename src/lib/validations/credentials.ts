import { z } from "zod";

export const steamGuardValues = ["DISABLED", "EMAIL", "MOBILE", "NONE"] as const;

export const credentialSchema = z
  .object({
    steamUsername: z.string().min(2, "Enter your Steam username.").max(120),
    steamPassword: z.string().min(1, "Enter your Steam password.").max(200),
    steamGuard: z.enum(steamGuardValues),
    // Raw textarea — one backup code per line.
    backupCodes: z.string().max(4000).optional().default(""),
    notes: z.string().max(2000).optional().default(""),
  })
  .superRefine((data, ctx) => {
    const codes = data.backupCodes
      .split(/\r?\n/)
      .map((c) => c.trim())
      .filter(Boolean);
    // Mobile authenticator requires backup codes so the booster can log in.
    if (data.steamGuard === "MOBILE" && codes.length < 5) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["backupCodes"],
        message:
          "Mobile authenticator requires at least 5 backup codes (one per line).",
      });
    }
    if (codes.length > 0 && codes.length < 5) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["backupCodes"],
        message: "Provide at least 5 backup codes, or leave the field empty.",
      });
    }
  });

export type CredentialInput = z.infer<typeof credentialSchema>;

/** Normalize the textarea into a clean newline-joined list. */
export function normalizeBackupCodes(raw: string): string {
  return raw
    .split(/\r?\n/)
    .map((c) => c.trim())
    .filter(Boolean)
    .join("\n");
}
