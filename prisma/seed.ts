/**
 * Seed: Dota 2 game, ranks, services + options, MMR ladder rules, modifiers,
 * admin + demo booster, and premium demo reviews. Catalog data is the shared
 * source of truth in `src/lib/catalog-data.ts` (also used by the offline
 * fallback), so the DB and fallback never drift.
 *
 * Run: npm run db:seed  (after `prisma migrate dev` / `prisma db push`).
 * Idempotent via upserts on natural keys.
 */
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  MODIFIERS_DATA,
  RANKS_DATA,
  REVIEWS_DATA,
  SERVICES_DATA,
} from "../src/lib/catalog-data";

const prisma = new PrismaClient();
const peso = (n: number) => Math.round(n * 100);

async function main() {
  console.log("🌱 Seeding RankUpPH…");

  const game = await prisma.game.upsert({
    where: { slug: "dota-2" },
    update: { name: "Dota 2", isActive: true },
    create: { slug: "dota-2", name: "Dota 2", isActive: true },
  });

  const rankByOrder = new Map<number, string>();
  for (const r of RANKS_DATA) {
    const rank = await prisma.rank.upsert({
      where: { gameId_order: { gameId: game.id, order: r.order } },
      update: { ...r, gameId: game.id },
      create: { gameId: game.id, ...r },
    });
    rankByOrder.set(r.order, rank.id);
  }

  // Services + options (options replaced each run for idempotency).
  for (const s of SERVICES_DATA) {
    const { options, ...data } = s;
    const service = await prisma.service.upsert({
      where: { slug: s.slug },
      update: { ...data, gameId: game.id, isActive: true },
      create: { ...data, gameId: game.id, isActive: true },
    });
    await prisma.serviceOption.deleteMany({ where: { serviceId: service.id } });
    if (options.length > 0) {
      await prisma.serviceOption.createMany({
        data: options.map((o) => ({ ...o, serviceId: service.id })),
      });
    }
  }

  // MMR pricing lives on each Rank band (minMmr/maxMmr/pricePer100) — seeded above.

  // Modifiers.
  for (const m of MODIFIERS_DATA) {
    await prisma.pricingModifier.upsert({
      where: { gameId_key: { gameId: game.id, key: m.key } },
      update: { ...m, isActive: true, gameId: game.id },
      create: { ...m, isActive: true, gameId: game.id },
    });
  }

  // Admin user
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@rankupph.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";
  const adminHash = await bcrypt.hash(adminPassword, 10);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: Role.ADMIN, passwordHash: adminHash },
    create: { email: adminEmail, name: "RankUpPH Admin", role: Role.ADMIN, passwordHash: adminHash },
  });

  // Demo booster (approved)
  const boosterHash = await bcrypt.hash("BoosterPass123!", 10);
  const booster = await prisma.user.upsert({
    where: { email: "booster@rankupph.com" },
    update: { role: Role.PROVIDER, passwordHash: boosterHash },
    create: { email: "booster@rankupph.com", name: "Pro Booster", role: Role.PROVIDER, passwordHash: boosterHash },
  });
  await prisma.boosterProfile.upsert({
    where: { userId: booster.id },
    update: { status: "APPROVED", displayName: "Phantom", rankAchieved: "Immortal · 8200 MMR", rating: 4.9, completedOrders: 240 },
    create: { userId: booster.id, status: "APPROVED", displayName: "Phantom", bio: "Top 500 Immortal. 6 years boosting.", rankAchieved: "Immortal · 8200 MMR", rating: 4.9, completedOrders: 240 },
  });

  // Premium demo reviews (no coach attribution).
  const mmr = await prisma.service.findUnique({ where: { slug: "mmr-boosting" } });
  if (mmr) {
    const demoCustomer = await prisma.user.upsert({
      where: { email: "demo.customer@rankupph.com" },
      update: {},
      create: { email: "demo.customer@rankupph.com", name: "Verified Customer", role: Role.CUSTOMER },
    });

    for (let i = 0; i < REVIEWS_DATA.length; i++) {
      const r = REVIEWS_DATA[i]!;
      const orderNumber = `RUP-DEMO${i + 1}`;
      const order = await prisma.order.upsert({
        where: { orderNumber },
        update: {},
        create: {
          orderNumber,
          gameId: game.id,
          serviceId: mmr.id,
          customerId: demoCustomer.id,
          boosterId: booster.id,
          status: "CLOSED",
          currentRankId: rankByOrder.get(4)!,
          currentStar: 2,
          targetRankId: rankByOrder.get(5)!,
          targetStar: 4,
          subtotal: peso(2400),
          amount: peso(2400),
        },
      });
      await prisma.review.upsert({
        where: { orderId: order.id },
        update: { rating: r.rating, comment: r.comment, tags: r.tags, country: r.country, isVerified: true },
        create: {
          orderId: order.id,
          customerId: demoCustomer.id,
          serviceId: mmr.id,
          boosterId: booster.id,
          rating: r.rating,
          comment: r.comment,
          tags: r.tags,
          country: r.country,
          isVerified: true,
        },
      });
    }
  }

  console.log("✅ Seed complete.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
