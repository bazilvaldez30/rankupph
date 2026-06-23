import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";
import { fail, handle, ok } from "@/lib/api";

export const runtime = "nodejs";

export async function POST(req: Request) {
  return handle(async () => {
    const body = await req.json();
    const { name, email, password } = registerSchema.parse(body);
    const normalizedEmail = email.toLowerCase();

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing) {
      return fail("An account with that email already exists.", 409);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash,
        role: "CUSTOMER",
      },
      select: { id: true, email: true, name: true, role: true },
    });

    return ok({ user }, { status: 201 });
  });
}
