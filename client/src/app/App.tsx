import { RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../features/auth";
import { LogoProvider } from "../features/logo";
import { HomepageProvider } from "../features/homepage/HomepageContext";
import { ToastProvider } from "../components/ui";
import { Favicon } from "../components/common/Favicon";
import { router } from "../routes";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
          <LogoProvider>
            <HomepageProvider>
              <ToastProvider>
                <Favicon />
                <RouterProvider router={router} />
              </ToastProvider>
            </HomepageProvider>
          </LogoProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
