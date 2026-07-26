import { Nav } from "@/components/marketing/Nav";
import { Hero } from "@/components/marketing/Hero";
import { Problem } from "@/components/marketing/Problem";
import { WhatItIs } from "@/components/marketing/WhatItIs";
import { FunctionStrip } from "@/components/marketing/FunctionStrip";
import { Pillars } from "@/components/marketing/Pillars";
import { Benefits } from "@/components/marketing/Benefits";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { UseCases } from "@/components/marketing/UseCases";
import { ClosingCta } from "@/components/marketing/ClosingCta";
import { Footer } from "@/components/marketing/Footer";
import { atlasSans, atlasMono } from "@/components/atlas/fonts";
import "@/app/atlas.css";

export default function Home() {
  return (
    <div className={`atlas ${atlasSans.variable} ${atlasMono.variable}`}>
      <Nav />
      <main>
        <Hero />
        <Problem />
        <WhatItIs />
        <FunctionStrip />
        <Pillars />
        <Benefits />
        <HowItWorks />
        <UseCases />
        <ClosingCta />
      </main>
      <Footer />
    </div>
  );
}
