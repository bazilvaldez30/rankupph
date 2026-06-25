import { getPublishedReviews, getServices } from "@/lib/queries";
import { Hero } from "@/components/marketing/sections/hero";
import { GlobalTrust } from "@/components/marketing/sections/global-trust";
import { ServicesSection } from "@/components/marketing/sections/services";
import { HowItWorks } from "@/components/marketing/sections/how-it-works";
import { RegionCoverage } from "@/components/marketing/sections/region-coverage";
import { CalculatorPreview } from "@/components/marketing/sections/calculator-preview";
import { ReviewsSection } from "@/components/marketing/sections/reviews";
import { WhyChooseUs } from "@/components/marketing/sections/why-choose-us";
import { Guarantees } from "@/components/marketing/sections/guarantees";
import { FAQSection, FAQ_ITEMS } from "@/components/marketing/sections/faq";
import { FinalCTA } from "@/components/marketing/sections/final-cta";
import { env } from "@/lib/env";

export default async function HomePage() {
  const [services, reviews] = await Promise.all([
    getServices(),
    getPublishedReviews(6),
  ]);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  const servicesJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: services.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Service",
        name: s.title,
        description: s.shortDescription,
        url: `${env.appUrl}/services/${s.slug}`,
        offers: {
          "@type": "Offer",
          price: (s.basePrice / 100).toFixed(2),
          priceCurrency: "PHP",
        },
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesJsonLd) }}
      />
      <Hero />
      <GlobalTrust />
      <ServicesSection services={services} />
      <HowItWorks />
      <RegionCoverage />
      <CalculatorPreview />
      <ReviewsSection reviews={reviews} />
      <WhyChooseUs />
      <Guarantees />
      <FAQSection />
      <FinalCTA />
    </>
  );
}
