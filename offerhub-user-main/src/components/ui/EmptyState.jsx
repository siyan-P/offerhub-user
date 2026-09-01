import React from "react";

/**
 * Purposeful empty state: icon, explanation, and a way forward. Used anywhere a
 * successful request simply returned nothing.
 */
function EmptyState({
  icon = null,
  title,
  description,
  action = null,
  secondaryAction = null,
  compact = false,
  className = "",
}) {
  return (
    <div
      className={`state-block ${compact ? "state-block--compact" : ""} ${className}`.trim()}
    >
      {icon && (
        <span className="state-block__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <h2 className="state-block__title">{title}</h2>
      {description && <p className="state-block__description">{description}</p>}
      {(action || secondaryAction) && (
        <div className="state-block__actions">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}

export default EmptyState;
