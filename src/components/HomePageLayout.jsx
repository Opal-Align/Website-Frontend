import Navbar from "./Navbar/Navbar";
import HomePage from "./HomePage";
import Footer from "./Footer";
import LogoStream from "./LogoStream/LogoStream";
// import HeroFlow from "./Info/HeroFlow";
import Processes from "./Info/Stats.jsx";
import TestimonialSection from "./Info/Testimonial";
import ScrollHero from "./HomeHero/ScrollHero";
import ParticleField from "./Info/Problem";
import MechanismSection from "./Info/Mechanism";
import ModulesSection from "./Info/ModuleSection.jsx";
import SpaceRacer from "./Info/Gamefied.jsx";
export default function HomePageLayout() {
  return (
    <div
      className="w-full"
      style={{ overflowX: "clip", overflowY: "visible" }}
    >
    <Navbar />
      <ScrollHero />
      
      
      <MechanismSection/>
      <ModulesSection/>
      <Processes />
      
      {/* <div>
        <HeroFlow />
      </div> */}
      <div>
        <LogoStream />
      </div>
      {/* <div
        className="relative w-full flex items-center justify-center"
        style={{
          minHeight: "100svh",
          height: "100svh",
          overflow: "hidden",
          padding: "0",
        }}
      >
        <SpaceRacer />
      </div> */}
      <div>
        <TestimonialSection />
      </div>
      <div>
        <Footer />
      </div>
    </div>
  );
}

