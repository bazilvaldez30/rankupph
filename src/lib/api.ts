import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { AuthError } from "./auth";

export type ApiError = { error: string; details?: unknown };

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function fail(message: string, status = 400, details?: unknown) {
  return NextResponse.json<ApiError>({ error: message, details }, { status });
}

/**
 * Wrap a route handler body. Translates known errors (Zod, Auth, Prisma) into
 * clean HTTP responses so individual handlers stay focused on the happy path.
 */
export async function handle<T>(fn: () => Promise<T>) {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof ZodError) {
      return fail("Validation failed.", 422, err.flatten());
    }
    if (err instanceof AuthError) {
      return err.code === "UNAUTHENTICATED"
        ? fail("You must be signed in.", 401)
        : fail("You don't have permission to do that.", 403);
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") return fail("That record already exists.", 409);
      if (err.code === "P2025") return fail("Record not found.", 404);
    }
    console.error("[api] Unhandled error:", err);
    return fail("Something went wrong. Please try again.", 500);
  }
}
