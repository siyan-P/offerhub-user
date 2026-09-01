import React from "react";
import { FiAlertTriangle, FiRefreshCcw, FiWifiOff } from "react-icons/fi";
import Button from "./Button";

/**
 * Recoverable error state. Shows human copy plus a retry affordance instead of
 * dumping a raw exception on the customer; the technical message is kept as a
 * secondary line for support.
 */
function ErrorState({
  error,
  onRetry,
  title,
  description,
  retryLabel = "Try again",
  retrying = false,
  compact = false,
  className = "",
}) {
  const isOffline =
    typeof navigator !== "undefined" && navigator.onLine === false;
  const isNetwork = isOffline || error?.name === "NetworkError";

  const resolvedTitle =
    title || (isNetwork ? "You appear to be offline" : "Something went wrong");

  const resolvedDescription =
    description ||
    (isNetwork
      ? "Check your connection and try again — nothing has been lost."
      : "We couldn't load this section. Retrying usually fixes it.");

  const detail = error?.message;

  return (
    <div
      className={`state-block ${
        isNetwork ? "state-block--offline" : "state-block--error"
      } ${compact ? "state-block--compact" : ""} ${className}`.trim()}
      role="alert"
    >
      <span className="state-block__icon" aria-hidden="true">
        {isNetwork ? <FiWifiOff /> : <FiAlertTriangle />}
      </span>
      <h2 className="state-block__title">{resolvedTitle}</h2>
      <p className="state-block__description">{resolvedDescription}</p>
      {detail && detail !== resolvedDescription && (
        <p className="state-block__detail">{detail}</p>
      )}
      {onRetry && (
        <div className="state-block__actions">
          <Button
            variant="secondary"
            onClick={onRetry}
            loading={retrying}
            loadingText="Retrying"
            leadingIcon={<FiRefreshCcw aria-hidden="true" />}
          >
            {retryLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

export default ErrorState;
