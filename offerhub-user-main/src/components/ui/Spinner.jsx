import React from "react";

/**
 * Inline spinner. Sizes itself from the surrounding font-size, so it fits
 * whatever it is dropped into (button label, chip, rail loader).
 */
function Spinner({ className = "", label }) {
  return (
    <>
      <span
        className={`ui-spinner ${className}`.trim()}
        role={label ? "status" : undefined}
        aria-hidden={label ? undefined : "true"}
      />
      {label && <span className="visually-hidden">{label}</span>}
    </>
  );
}

export default Spinner;
