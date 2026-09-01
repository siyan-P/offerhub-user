import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App.jsx";
import { Toaster } from "sonner";
import store, { persistor } from "./redux/store";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Serve cached data while revalidating in the background, so navigating
      // back to a screen shows content immediately instead of a fresh loader.
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
        <Toaster
          position="bottom-center"
          richColors
          closeButton
          duration={3500}
          toastOptions={{
            style: {
              fontFamily: "var(--font-sans)",
              borderRadius: "var(--radius-md)",
            },
          }}
        />
      </PersistGate>
    </Provider>
  </QueryClientProvider>
);
