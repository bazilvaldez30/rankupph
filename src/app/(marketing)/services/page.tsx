import type { Metadata } from "next";
import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal } from "@/components/shared/reveal";
import { ServiceCard } from "@/components/marketing/service-card";
import { getServices } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Dota 2 Services",
  description:
    "Explore RankUpPH's premium Dota 2 services: MMR boosting, duo queue boosting, and 1-on-1 coaching by verified Immortal players.",
};

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <div className="relative py-16 sm:py-24">
      <div className="container">
        <SectionHeading
          eyebrow="Services"
          title={
            <>
              Premium Dota 2 services, <span className="gold-text">done right.</span>
            </>
          }
          description="Choose the path that fits your goal. Every service is delivered by verified Immortal players with full transparency and security."
        />

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <Reveal key={service.id} delay={i}>
              <ServiceCard service={service} />
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
