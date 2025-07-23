
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import SmartMatchingSection from "@/components/SmartMatchingSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import FeaturesSection from "@/components/FeaturesSection";
import PricingSection from "@/components/PricingSection";
import ContactSection from "@/components/ContactSection";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <SmartMatchingSection />
        <HowItWorksSection />
        <FeaturesSection />
        <PricingSection />
        <ContactSection />
      </main>
    </div>
  );
};

export default Index;
