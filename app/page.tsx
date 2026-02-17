import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import Solution from "@/components/Solution";
import Personas from "@/components/Personas";
import HowItWorks from "@/components/HowItWorks";
import Features from "@/components/Features";
import Pricing from "@/components/Pricing";
import SkillPacks from "@/components/SkillPacks";
import FAQ from "@/components/FAQ";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Problem />
      <Solution />
      <Personas />
      <HowItWorks />
      <Features />
      <Pricing />
      <SkillPacks />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  );
}
