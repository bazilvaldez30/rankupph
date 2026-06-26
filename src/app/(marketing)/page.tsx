import { Hero } from "@/components/marketing/sections/hero";
import { GlobalTrust } from "@/components/marketing/sections/global-trust";
import { ServicesSection } from "@/components/marketing/sections/services";
import { HowItWorks } from "@/components/marketing/sections/how-it-works";
import { CalculatorPreview } from "@/components/marketing/sections/calculator-preview";
import { ReviewsSection } from "@/components/marketing/sections/reviews";
import { WhyChooseUs } from "@/components/marketing/sections/why-choose-us";
import { Guarantees } from "@/components/marketing/sections/guarantees";
import { FAQSection, FAQ_ITEMS } from "@/components/marketing/sections/faq";
import { FinalCTA } from "@/components/marketing/sections/final-cta";
import { getPublishedReviews, getServices, getSiteRatingAggregate } from "@/lib/queries";
import { JsonLd } from "@/components/seo/json-ld";
import {
  faqSchema,
  organizationSchema,
  serviceListSchema,
  websiteSchema,
} from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [services, reviews, siteRating] = await Promise.all([
    getServices(),
    getPublishedReviews(6),
    getSiteRatingAggregate(),
  ]);

  return (
    <>
      <JsonLd
        data={[
          organizationSchema(siteRating),
          websiteSchema(),
          serviceListSchema(services),
          faqSchema(FAQ_ITEMS),
        ]}
      />
      <Hero />
      <GlobalTrust />
      <ServicesSection services={services} />
      <HowItWorks />
      <CalculatorPreview />
      <ReviewsSection reviews={reviews} />
      <WhyChooseUs />
      <Guarantees />
      <FAQSection />
      <FinalCTA />
    </>
  );
}
