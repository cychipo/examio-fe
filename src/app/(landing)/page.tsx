"use client";
import { HeroSection } from "@/components/organisms/HeroSection";
import FeaturesSection from "@/components/organisms/FeaturesSectionHome";
import StackSection from "@/components/organisms/StackSection";
import PricingSection from "@/components/organisms/PricingSection";
import FeedbackSection from "@/components/organisms/FeedbackSection";

export default function Home() {
  return (
    <div className="overflow-x-hidden">
      <HeroSection />
      <FeaturesSection />
      <FeedbackSection />
      <PricingSection />
      <StackSection />
    </div>
  );
}
