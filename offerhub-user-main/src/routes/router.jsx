import { createBrowserRouter } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "../components/error/ErrorFallback";
import Userlayout from "../Layout/Userlayout";
import Homepage from "../pages/Homepage/Homepage";
import AllProducts from "../pages/productpage/Allproducts";
import ProductDetails from "../pages/productpage/ProductDetails";
import Profile from "../pages/profile/Profile";
import Cartpage from "../pages/cartpage/Cartpage";
import Login from "../pages/Loginpage/Login";
import Signup from "../pages/Signuppage/Signup";
import ProtectedRoute from "../components/route/ProtectedRoute";
import PaymentSuccess from "../pages/payment/PaymentSuccess";
import NotFound from "../pages/NotFound";

// Wraps a route so a render error in one screen shows a recoverable fallback
// instead of blanking the whole app.
const WithErrorBoundary = ({ children }) => (
  <ErrorBoundary
    FallbackComponent={ErrorFallback}
    onReset={() => {
      window.location.reload();
    }}
    onError={(error, info) => {
      console.error("Error caught by boundary:", error, info);
    }}
  >
    {children}
  </ErrorBoundary>
);

const routes = [
  { path: "/", element: <Homepage /> },
  { path: "/products", element: <AllProducts /> },
  { path: "/products/:id", element: <ProductDetails /> },
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
  },
  {
    path: "/cart",
    element: (
      <ProtectedRoute>
        <Cartpage />
      </ProtectedRoute>
    ),
  },
  { path: "/payment-success", element: <PaymentSuccess /> },
  // Anything unrecognised gets the dedicated 404 rather than the crash screen.
  { path: "*", element: <NotFound /> },
];

const router = createBrowserRouter([
  {
    path: "/",
    element: <Userlayout />,
    errorElement: <ErrorFallback error={new Error("Page not found", { cause: 404 })} />,
    children: routes.map(({ path, element }) => ({
      path,
      element: <WithErrorBoundary>{element}</WithErrorBoundary>,
    })),
  },
]);

export default router;
