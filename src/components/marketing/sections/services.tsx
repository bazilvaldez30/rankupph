import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal } from "@/components/shared/reveal";
import { ServiceCard } from "@/components/marketing/service-card";
import { Carousel } from "@/components/shared/carousel";
import { T } from "@/components/i18n/t";
import type { PublicService } from "@/lib/fallback-data";

export function ServicesSection({ services }: { services: PublicService[] }) {
  return (
    <section id="services" className="relative py-20 sm:py-28 lg:py-32">
      <div className="container">
        <SectionHeading
          eyebrow={<T k="sec.services.eyebrow" />}
          title={
            <>
              <T k="sec.services.lead" />{" "}
              <span className="gold-text">
                <T k="sec.services.accent" />
              </span>
            </>
          }
          description={<T k="sec.services.desc" />}
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
