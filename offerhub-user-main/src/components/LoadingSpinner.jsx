import React from "react";

/**
 * Section-level loading indicator.
 *
 * This used to render `position: fixed`, full-viewport, `z-index: 100000` with
 * an opaque background — so a single slow section (a homepage rail, a cart
 * quantity update) greyed out the entire app. It now fills only the box it is
 * placed in. Pass `fullscreen` for the rare case that genuinely blocks the page.
 *
 * Prefer a shaped skeleton from `ui/Skeleton` where the final layout is known.
 */
function LoadingSpinner({ height, fullscreen = false, label = "Loading" }) {
  return (
    <div
      className={`loading-spinner ${fullscreen ? "loading-spinner--fullscreen" : ""}`.trim()}
      style={height ? { minHeight: height } : undefined}
      role="status"
      aria-live="polite"
    >
      <span className="loading-spinner__dot" />
      <span className="loading-spinner__dot" />
      <span className="loading-spinner__dot" />
      <span className="visually-hidden">{label}</span>
    </div>
  );
}

export default LoadingSpinner;
