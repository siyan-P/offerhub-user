import React from "react";
import { FiAlertTriangle, FiHome, FiRefreshCcw, FiWifiOff } from "react-icons/fi";
import { Link } from "react-router-dom";

/**
 * Route- and boundary-level error screen. Distinguishes a lost connection from
 * a genuine crash, and always offers a way out rather than a dead end.
 */
function ErrorFallback({ error, resetErrorBoundary, showHomeButton = true }) {
  const isOffline =
    typeof navigator !== "undefined" && navigator.onLine === false;
  const isNetwork = isOffline || error?.name === "NetworkError";
  const isNotFound = error?.cause === 404 || error?.status === 404;

  const title = isNotFound
    ? "Page not found"
    : isNetwork
    ? "You appear to be offline"
    : "Something went wrong";

  const description = isNotFound
    ? "The page you were looking for doesn't exist or has moved."
    : isNetwork
    ? "Check your connection and try again — nothing has been lost."
    : "An unexpected error stopped this page from loading. Trying again usually fixes it.";

  return (
    <div className="error-container">
      <div className="error-content">
        <span className="error-icon" aria-hidden="true">
          {isNetwork ? <FiWifiOff /> : <FiAlertTriangle />}
        </span>

        <h1>{title}</h1>
        <p className="error-message">{description}</p>

        {error?.message && !isNotFound && (
          <p className="error-detail">{error.message}</p>
        )}

        <div className="error-actions">
          {resetErrorBoundary && (
            <button
              type="button"
              className="ui-btn ui-btn--primary"
              onClick={resetErrorBoundary}
            >
              <FiRefreshCcw aria-hidden="true" />
              Try again
            </button>
          )}

          {showHomeButton && (
            <Link to="/" className="ui-btn ui-btn--secondary">
              <FiHome aria-hidden="true" />
              Back to home
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default ErrorFallback;
