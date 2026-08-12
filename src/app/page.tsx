import Hero from "@/components/Hero";
import BrandPillars from "@/components/BrandPillars";
import FeaturedProducts from "@/components/FeaturedProducts";
import StorySection from "@/components/StorySection";
import ShopByRitual from "@/components/ShopByRitual";
import IngredientStorytelling from "@/components/IngredientStorytelling";
import CuratedRituals from "@/components/CuratedRituals";
import CustomerExperience from "@/components/CustomerExperience";
import EditorialSection from "@/components/EditorialSection";
import Newsletter from "@/components/Newsletter";
import { HUSN_E_YUSUF } from "@/lib/proper-nouns";

export default function HomePage() {
  return (
    <>
      <Hero />

      <BrandPillars />

      <FeaturedProducts />

      <StorySection
        eyebrow="Our Story"
        title="From Kashmir, With Care"
        paragraphs={[
          "Some beauty products simply occupy a place on the shelf. Others become the products you reach for every morning, pack when you travel and recommend to somebody you love.",
          `The Skin Shop brings familiar botanical ingredients into contemporary everyday care. Rose, saffron, rosemary, moringa, argan, jojoba, shea, coffee, Vitamin C and ${HUSN_E_YUSUF} meet modern formats including serums, gels, masks, cleansers and creams.`,
          "The result is a collection where heritage meets the modern dressing table — and an everyday routine begins to feel like a ritual.",
        ]}
        image="/images/kashmir/story-editorial.jpg"
        imageLabel="From Kashmir, with care"
        cta={{ label: "Discover Our Story", href: "/our-story" }}
      />

      <ShopByRitual />

      <IngredientStorytelling />

      <CuratedRituals />

      <CustomerExperience />

      <EditorialSection />

      <Newsletter />
    </>
  );
}
