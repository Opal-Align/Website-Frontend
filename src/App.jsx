import { lazy, Suspense } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePageLayout from "./components/HomePageLayout";

// Secondary routes are not needed by the homepage. Keeping them in separate
// chunks avoids parsing form/query/legal-page code during the animated landing
// experience while preserving the homepage's eager first paint.
const PrivacyPolicy = lazy(() => import("./components/PrivacyPolicy"));
const SMSOptIn = lazy(() => import("./components/SMSOptIn"));
const ContactUsRoute = lazy(() => import("./components/ContactUsRoute"));

function RouteFallback() {
  return <div aria-hidden className="min-h-screen bg-[#0a0a0a]" />;
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<HomePageLayout />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/sms-opt-in" element={<SMSOptIn />} />
          <Route path="/contact-us" element={<ContactUsRoute />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;

