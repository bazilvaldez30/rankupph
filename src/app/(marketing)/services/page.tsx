import type { Metadata } from "next";
import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal } from "@/components/shared/reveal";
import { ServiceCard } from "@/components/marketing/service-card";
import { getServices } from "@/lib/queries";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema, serviceListSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Dota 2 Services Worldwide — Boosting, Calibration, Ranked Wins",
  description:
    "Explore RankUpPH's premium Dota 2 services: MMR boosting, calibration, ranked wins, Battle Cup, and low-priority removal by verified Immortal players. Available worldwide.",
  alternates: { canonical: "/services" },
  openGraph: { type: "website", url: "/services", title: "Dota 2 Services Worldwide · RankUpPH" },
};

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <div className="relative py-16 sm:py-24">
      <JsonLd
        data={[
          serviceListSchema(services),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Services", path: "/services" },
          ]),
        ]}
      />
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
