// Utility functions for handling redirect paths

export const storeRedirectPath = (path) => {
  try {
    console.log("Attempting to store redirect path:", path);
    
    // Don't store login/signup paths
    if (path === "/login" || path === "/signup") {
      console.log("Skipping storage for login/signup page");
      return false;
    }
    
    // Store the path
    localStorage.setItem("redirectAfterLogin", path);
    
    // Verify storage
    const stored = localStorage.getItem("redirectAfterLogin");
    console.log("Verification - stored path:", stored);
    
    return stored === path;
  } catch (error) {
    console.error("Error storing redirect path:", error);
    return false;
  }
};

export const getRedirectPath = () => {
  try {
    const path = localStorage.getItem("redirectAfterLogin");
    console.log("Retrieved redirect path:", path);
    return path;
  } catch (error) {
    console.error("Error getting redirect path:", error);
    return null;
  }
};

export const clearRedirectPath = () => {
  try {
    const path = localStorage.getItem("redirectAfterLogin");
    console.log("Clearing redirect path:", path);
    localStorage.removeItem("redirectAfterLogin");
    return true;
  } catch (error) {
    console.error("Error clearing redirect path:", error);
    return false;
  }
};

export const handleRedirectAfterLogin = (navigate) => {
  const redirectPath = getRedirectPath();
  
  if (redirectPath && redirectPath !== "/login" && redirectPath !== "/signup") {
    console.log("Redirecting to stored path:", redirectPath);
    clearRedirectPath();
    navigate(redirectPath);
    return true;
  } else {
    console.log("No valid redirect path, going to home");
    navigate("/");
    return false;
  }
}; 