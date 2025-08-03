import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import ServicesSection from "@/components/sections/ServicesSection";
import DoctorsSection from "@/components/sections/DoctorsSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        <HeroSection />
        <ServicesSection />
        <DoctorsSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
