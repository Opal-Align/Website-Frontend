import Navbar from "./Navbar/Navbar";
import HomePage from "./HomePage";
import Services from "./Info/Services";
import Footer from "./Footer";
import LogoStream from "./LogoStream/LogoStream";
import gosInActionServices from "../Content/gosInAction.jsx";
import whoWeServeServices from "../Content/whoWeServe.jsx";

export default function HomePageLayout() {
  return (
    <div className="overflow-x-hidden w-full">
      <div className="h-screen overflow-hidden">
        <HomePage />
        <Navbar />
      </div>
      <div>
        <Services
          services={gosInActionServices}
          title="OPAL gOS in Action"
          sectionId="gos-in-action"
        />
      </div>
      <div>
        <LogoStream />
      </div>
      <div>
        <Services
          services={whoWeServeServices}
          title="Who We Guide"
          sectionId="faq"
        />
      </div>
      <div>
        <Footer />
      </div>
    </div>
  );
}

