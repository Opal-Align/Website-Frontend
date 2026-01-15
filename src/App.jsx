import "./App.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePageLayout from "./components/HomePageLayout";
import PrivacyPolicy from "./components/PrivacyPolicy";
import SMSOptIn from "./components/SMSOptIn";
import ContactUs from "./components/ContactUs";
import BackToTop from "./components/BackToTop";
// Create a React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
    mutations: {
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePageLayout />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/sms-opt-in" element={<SMSOptIn />} />
          <Route path="/contact-us" element={<ContactUs />} />
        </Routes>
        <BackToTop />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

