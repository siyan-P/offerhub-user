import React, { useId } from "react";
import { FiAlertCircle } from "react-icons/fi";

/**
 * Text input with label, helper text and error state wired to the right ARIA
 * attributes, so validation messages are announced rather than just coloured.
 */
const Input = React.forwardRef(function Input(
  {
    label,
    hint,
    error,
    required = false,
    affix = null,
    id,
    className = "",
    fieldClassName = "",
    ...rest
  },
  ref
) {
  const autoId = useId();
  const inputId = id || autoId;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;

  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div className={`ui-field ${fieldClassName}`.trim()}>
      {label && (
        <label className="ui-field__label" htmlFor={inputId}>
          {label}
          {required && (
            <span className="required" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <div className="ui-field__control">
        <input
          ref={ref}
          id={inputId}
          className={`ui-input ${affix ? "ui-input--has-affix" : ""} ${className}`.trim()}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={describedBy}
          aria-required={required || undefined}
          {...rest}
        />
        {affix}
      </div>

      {error ? (
        <p className="ui-field__error" id={errorId} role="alert">
          <FiAlertCircle size={13} aria-hidden="true" />
          {error}
        </p>
      ) : (
        hint && (
          <p className="ui-field__hint" id={hintId}>
            {hint}
          </p>
        )
      )}
    </div>
  );
});

export default Input;
