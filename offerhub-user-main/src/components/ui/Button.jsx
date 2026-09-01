import React from "react";
import Spinner from "./Spinner";

/**
 * The one button in the app.
 *
 * Loading and disabled are built in: while `loading` is true the label stays in
 * the flow (hidden) so the button keeps its width and rows don't jump, the
 * spinner is centred over it, and the control announces itself as busy.
 */
const Button = React.forwardRef(function Button(
  {
    as: Tag = "button",
    variant = "primary",
    size = "md",
    block = false,
    loading = false,
    loadingText,
    disabled = false,
    iconOnly = false,
    leadingIcon = null,
    trailingIcon = null,
    className = "",
    children,
    type,
    ...rest
  },
  ref
) {
  const classes = [
    "ui-btn",
    `ui-btn--${variant}`,
    size !== "md" && `ui-btn--${size}`,
    block && "ui-btn--block",
    iconOnly && "ui-btn--icon",
    loading && "is-loading",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const isInert = disabled || loading;

  return (
    <Tag
      ref={ref}
      className={classes}
      type={Tag === "button" ? type || "button" : type}
      disabled={Tag === "button" ? isInert : undefined}
      aria-disabled={Tag === "button" ? undefined : isInert || undefined}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && (
        <span className="ui-btn__loader">
          <Spinner />
          {loadingText && <span>{loadingText}</span>}
        </span>
      )}
      <span
        className={loading ? "ui-btn__label is-hidden" : "ui-btn__label"}
        aria-hidden={loading || undefined}
      >
        {leadingIcon}
        {children}
        {trailingIcon}
      </span>
    </Tag>
  );
});

export default Button;
