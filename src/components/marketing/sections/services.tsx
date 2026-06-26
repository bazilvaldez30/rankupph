import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal } from "@/components/shared/reveal";
import { ServiceCard } from "@/components/marketing/service-card";
import { Carousel } from "@/components/shared/carousel";
import type { PublicService } from "@/lib/fallback-data";

export function ServicesSection({ services }: { services: PublicService[] }) {
  return (
    <section id="services" className="relative py-20 sm:py-28 lg:py-32">
      <div className="container">
        <SectionHeading
          eyebrow="Our Services"
          title={
            <>
              Three ways to <span className="gold-text">climb.</span>
            </>
          }
          description="Whatever your goal — a higher medal, safer progress, or sharper skills — we have a premium service built for it."
        />

        <Carousel
          className="mt-12 sm:mt-14"
          desktopClassName="md:grid-cols-2 lg:grid-cols-3"
        >
          {services.map((service, i) => (
            <Reveal key={service.id} delay={i} className="h-full">
              <ServiceCard service={service} />
            </Reveal>
          ))}
        </Carousel>
      </div>
    </section>
  );
}
