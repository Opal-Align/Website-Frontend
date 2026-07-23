import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ContactUs from "./ContactUs";

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

/** Keep React Query out of the homepage bundle; only contact uses it. */
export default function ContactUsRoute() {
  return (
    <QueryClientProvider client={queryClient}>
      <ContactUs />
    </QueryClientProvider>
  );
}
