import React, { useState } from "react";
import { FiUser } from "react-icons/fi";
import { initialsFor, tintFor } from "./initials";

/**
 * Person avatar with a real fallback chain: photo → initials → generic icon.
 *
 * Most review authors have no photo, and the previous markup pointed those at a
 * remote stock "blank profile" URL — an external request that renders a broken
 * image the moment it fails. Initials are drawn locally and always resolve.
 */
function Avatar({ src, name, size = "2.5rem", className = "" }) {
  const [failed, setFailed] = useState(false);

  const initials = initialsFor(name);
  const showImage = src && !failed;
  const tint = tintFor(name);

  return (
    <span
      className={`avatar ${className}`.trim()}
      style={{
        width: size,
        height: size,
        ...(showImage ? null : { background: tint.bg, color: tint.ink }),
      }}
      // The author's name is printed next to every avatar that uses this, so
      // the mark itself carries no extra information.
      aria-hidden="true"
    >
      {showImage ? (
        <img src={src} alt="" loading="lazy" onError={() => setFailed(true)} />
      ) : initials ? (
        <span className="avatar__initials">{initials}</span>
      ) : (
        <FiUser className="avatar__icon" />
      )}
    </span>
  );
}

export default Avatar;
