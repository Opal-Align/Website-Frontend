import Navbar from "./Navbar/Navbar";
import Footer from "./Footer";
import LogoStream from "./LogoStream/LogoStream";
// import HeroFlow from "./Info/HeroFlow";
import Processes from "./Info/Stats.jsx";
import TestimonialSection from "./Info/Testimonial";
import ScrollHero from "./HomeHero/ScrollHero";
import MechanismSection from "./Info/Mechanism";
import GosStack from "./GosStack.tsx";
import ProblemWordMap from "./Info/ProblemWordMap.jsx"
import PlatformSection from "./Info/PlatformSection.jsx";
import FiveStepLoop from "./Info/FiveStepLoop.jsx";
export default function HomePageLayout() {
  return (
    <div
      className="w-full"
      style={{ overflowX: "clip", overflowY: "visible", position: "relative" }}
    >
    <Navbar />
      <ScrollHero />

      {/* Continuous shared background — the sections below scroll over this one
          unified backdrop (PlatformSection's palette), so it reads as a single
          surface with the content gliding on top. */}
      <div style={{ position: "relative" }}>
        {/* Backdrop layer: solid base spans the whole region (continuous color),
            with a sticky glow that stays pinned to the viewport while scrolling
            through these sections only — bounded so it never bleeds onto the
            sections above or below. */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            pointerEvents: "none",
            background: "#07080D",
          }}
        >
          <div
              style={{
              position: "sticky",
              top: 0,
              height: "100vh",
              background: `
                radial-gradient(ellipse at 15% 20%, rgba(96,165,250,0.07) 0%, transparent 45%),
                radial-gradient(ellipse at 82% 70%, rgba(34,211,238,0.06) 0%, transparent 42%)
              `,
            }}
          />
        </div>

        {/* Section content rides above the backdrop */}
        <div style={{ position: "relative", zIndex: 1 }}>
        <ProblemWordMap/>
        <FiveStepLoop/>
        
          
          <PlatformSection/>
          
          <Processes />
          <LogoStream />
          <TestimonialSection />
        </div>
      </div>

      <div>
        <Footer />
      </div>
    </div>
  );
}

