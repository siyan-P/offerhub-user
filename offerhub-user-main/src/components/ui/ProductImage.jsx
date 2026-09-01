import React, { useState } from "react";
import { FiImage } from "react-icons/fi";

/**
 * Consistent image handling for product media: fixed aspect ratio (no layout
 * shift), lazy loading below the fold, a shimmer while the bytes arrive, and a
 * graceful placeholder when the URL is missing, blank, or fails to decode.
 *
 * Pass `fallback` to replace the generic glyph with something meaningful —
 * category tiles use initials, for instance.
 */
function ProductImage({
  src,
  alt,
  ratio = "1 / 1",
  fit = "contain",
  eager = false,
  fallback = null,
  className = "",
  imgClassName = "",
  sizes,
}) {
  // A whitespace-only or empty src is "no image", not "an image to try".
  const hasSrc = typeof src === "string" && src.trim().length > 0;
  const [status, setStatus] = useState(hasSrc ? "loading" : "error");

  // Some endpoints hand back a 200 with a zero-byte or undecodable body: the
  // load event fires but there is nothing to paint, leaving an empty box.
  const handleLoad = (event) => {
    setStatus(event.currentTarget.naturalWidth > 0 ? "loaded" : "error");
  };

  return (
    <div
      className={`media ${className}`.trim()}
      style={{ aspectRatio: ratio }}
      data-status={status}
    >
      {status === "loading" && (
        <span className="media__placeholder skeleton" aria-hidden="true" />
      )}

      {status === "error" ? (
        <span className="media__fallback" aria-hidden="true">
          {fallback || <FiImage />}
        </span>
      ) : (
        <img
          src={src}
          alt={alt}
          sizes={sizes}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={eager ? "high" : undefined}
          className={`media__img ${imgClassName}`.trim()}
          style={{ objectFit: fit }}
          onLoad={handleLoad}
          onError={() => setStatus("error")}
        />
      )}
    </div>
  );
}

export default ProductImage;
