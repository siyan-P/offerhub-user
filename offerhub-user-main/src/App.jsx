import { RouterProvider } from "react-router-dom";
import router from "./routes/router";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "./components/error/ErrorFallback";

function App() {
  // AOS scroll-reveal was removed with the redesign: every section it animated
  // now uses short CSS transitions instead, and AOS's "invisible until
  // scrolled into view" behaviour hid content whenever its observer missed.
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        window.location.reload();
      }}
      onError={(error, info) => {
        console.error("Error caught by boundary:", error, info);
      }}
    >
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}

export default App;
