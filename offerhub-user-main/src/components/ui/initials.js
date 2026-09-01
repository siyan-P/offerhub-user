/**
 * Shared initials + tint helpers for placeholder marks (people, categories).
 *
 * A generic "no image" glyph repeated down a row tells the shopper nothing.
 * Initials on a stable tint stay distinguishable and look deliberate.
 */

// Tints that each clear AA against their paired ink, chosen to sit beside the
// brand orange without competing with it.
const TINTS = [
  { bg: "#fff0e6", ink: "#9a2f06" },
  { bg: "#e8f1fd", ink: "#175cd3" },
  { bg: "#e9f7ef", ink: "#027a48" },
  { bg: "#f3edfd", ink: "#5925dc" },
  { bg: "#fdeef4", ink: "#c11574" },
  { bg: "#fdf3e6", ink: "#b54708" },
];

/** Stable per-name tint, so the same label keeps its colour across the app. */
export function tintFor(name) {
  const key = name || "";
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return TINTS[hash % TINTS.length];
}

/**
 * "Muhammed Siyan P" → "MS", "Fashion & Apparel" → "FA", "priya" → "P".
 * Returns null when there's nothing usable to draw.
 */
export function initialsFor(name) {
  const words = (name || "")
    .trim()
    .split(/\s+/)
    // Drop connectors like "&" so "Fashion & Apparel" reads FA, not F&.
    .filter((word) => /[\p{L}\p{N}]/u.test(word));

  if (words.length === 0) return null;

  const first = words[0];
  const last = words.length > 1 ? words[words.length - 1] : "";

  return (first.charAt(0) + last.charAt(0)).toUpperCase();
}
