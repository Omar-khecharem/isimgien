import { RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../features/auth";
import { LogoProvider } from "../features/logo";
import { ToastProvider } from "../components/ui";
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
          <ToastProvider>
            <RouterProvider router={router} />
          </ToastProvider>
        </LogoProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
