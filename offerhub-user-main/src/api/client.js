import axios from "axios";
import { NetworkError } from "../utils/errors.js";
import { storeRedirectPath } from "../utils/redirectUtils";

const apiClient = axios.create({
  // baseURL: import.meta.env.VITE_API_URL,
  baseURL: "https://offer-hub.onrender.com/api/v1",
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("user-auth-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// apiClient.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response.status === 401) {
//       localStorage.removeItem("token");
//       window.location.href = "/login";
//     }
//     return Promise.reject(error);
//   }
// );

// Add a response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      // Network error or server not responding
      throw new NetworkError(
        "Unable to connect to server. Please check your internet connection."
      );
    }
    if (error.response.status === 401) {
      console.log("401 error in API interceptor - storing redirect path before removing token");
      const currentPath = window.location.pathname + window.location.search;
      const protectedPaths = ["/cart", "/profile", "/checkout", "/orders"];
      const isProtectedRoute = protectedPaths.some(path => currentPath.startsWith(path));

      if (isProtectedRoute) {
        storeRedirectPath(currentPath);
      }

      localStorage.removeItem("user-auth-token");

      // Navigate to login if on a protected route
      if (isProtectedRoute) {
        window.location.href = "/login";
      }
    }
    throw error;
  }
);

export default apiClient;
