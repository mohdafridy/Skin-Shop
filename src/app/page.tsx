import type { Metadata } from "next";
import Hero from "@/components/Hero";
import BrandPillars from "@/components/BrandPillars";
import StartHere from "@/components/StartHere";
import StorySection from "@/components/StorySection";
import ShopByRitual from "@/components/ShopByRitual";
import IngredientStorytelling from "@/components/IngredientStorytelling";
import CuratedRituals from "@/components/CuratedRituals";
import CustomerExperience from "@/components/CustomerExperience";
import EditorialSection from "@/components/EditorialSection";
import Newsletter from "@/components/Newsletter";
import { canonical } from "@/lib/seo";

export const metadata: Metadata = {
  alternates: canonical("/"),
};

export default function HomePage() {
  return (
    <>
      <Hero />

      <BrandPillars />

      <StartHere />

      <CuratedRituals />

      <StorySection
        eyebrow="Our Story"
        title="Inspired by a Remarkable Place"
        paragraphs={[
          "Kashmir is more than where we make our products; it shapes how we think about beauty. From botanicals treasured for generations to a culture of craftsmanship and care, we translate that sense of place into skincare made to be used and loved every day.",
        ]}
        image="/images/kashmir/story-editorial.jpg"
        imageLabel="From Kashmir, with care"
        cta={{ label: "Our Story", href: "/our-story" }}
      />

      <ShopByRitual />

      <IngredientStorytelling />

      <CustomerExperience />

      <EditorialSection />

      <Newsletter />
    </>
  );
}
