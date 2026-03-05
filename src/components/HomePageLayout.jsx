import Navbar from "./Navbar/Navbar";
import HomePage from "./HomePage";
import Footer from "./Footer";
import LogoStream from "./LogoStream/LogoStream";
import HeroFlow from "./Info/HeroFlow";
import Processes from "./Info/Stats.jsx";
import TestimonialSection from "./Info/Testimonial";
export default function HomePageLayout() {
  return (
    <div className="overflow-x-hidden w-full">
      <div className="h-screen overflow-hidden">
        <HomePage />
        <Navbar />
      </div>
      
      <div>
        <HeroFlow />
      </div>
      
      <Processes />
      <div>
        <LogoStream />
      </div>
      <div>
        <TestimonialSection />
      </div>
      <div>
        <Footer />
      </div>
    </div>
  );
}

