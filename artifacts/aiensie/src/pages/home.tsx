import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { FourPillars } from "@/components/landing/four-pillars";
import { BehavioralMistakes } from "@/components/landing/behavioral-mistakes";
import { Features } from "@/components/landing/features";
import { DashboardPreview } from "@/components/landing/dashboard-preview";
import { ScoreCards } from "@/components/landing/score-cards";
import { Pricing } from "@/components/landing/pricing";
import { CTA } from "@/components/landing/cta";
import { Footer } from "@/components/landing/footer";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <FourPillars />
      <BehavioralMistakes />
      <Features />
      <DashboardPreview />
      <ScoreCards />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  );
}
