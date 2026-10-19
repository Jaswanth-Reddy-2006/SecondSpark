import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { ProjectPreview } from "@/components/landing/ProjectPreview";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { FeatureHighlights } from "@/components/landing/FeatureHighlights";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#1F2328] selection:bg-[#DDF4FF] selection:text-[#0969DA]">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <ProjectPreview />
        <HowItWorks />
        <FeatureHighlights />
      </main>
      <Footer />
    </div>
  );
}
