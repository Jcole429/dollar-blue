import React from "react";

/**
 * Flags as inline SVG rather than the regional-indicator emoji (🇦🇷 🇺🇸).
 *
 * Windows ships no flag glyphs at all, so the emoji route renders as the bare
 * letters "AR" and "US" in a box for a large share of visitors — on the one
 * control whose entire job is to be recognisable without reading it. These are a
 * few hundred bytes each, need no font, and look the same everywhere.
 *
 * Both share a 24×13 viewBox so the two line up in the menu even though the real
 * flags have different proportions. Purely decorative: every use sits beside a
 * text label, so they are hidden from assistive tech.
 */

/** Ray effect without 32 path points: a dashed ring reads as a sun at this size. */
const SUN_GOLD = "#f6b40e";

// Both flags are constant elements rather than components: nothing about them
// depends on a prop or on state, so building them once at module load beats
// rebuilding thirteen nodes every time the picker opens or the language changes.
// (React Compiler would hoist these automatically, but it is not enabled here.)
const ARGENTINA_FLAG = (
  <>
    <rect width="24" height="13" fill="#74acdf" />
    <rect y="4.33" width="24" height="4.34" fill="#fff" />
    <circle cx="12" cy="6.5" r="1.4" fill={SUN_GOLD} />
    <circle
      cx="12"
      cy="6.5"
      r="2.1"
      fill="none"
      stroke={SUN_GOLD}
      strokeWidth="0.5"
      strokeDasharray="0.5 0.6"
    />
  </>
);

/** Star positions: a 5×4 grid of dots, which at 24px wide reads as the canton. */
const STAR_X = [1.2, 3.1, 5.0, 6.9, 8.8];
const STAR_Y = [1.1, 2.7, 4.3, 5.9];

const UNITED_STATES_FLAG = (
  <>
    {/* Red field with white stripes cut out of it — 6 rects instead of 13. */}
    <rect width="24" height="13" fill="#b22234" />
    <rect y="1" width="24" height="1" fill="#fff" />
    <rect y="3" width="24" height="1" fill="#fff" />
    <rect y="5" width="24" height="1" fill="#fff" />
    <rect y="7" width="24" height="1" fill="#fff" />
    <rect y="9" width="24" height="1" fill="#fff" />
    <rect y="11" width="24" height="1" fill="#fff" />
    <rect width="10" height="7" fill="#3c3b6e" />
    {STAR_Y.map((y) =>
      STAR_X.map((x) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="0.45" fill="#fff" />
      ))
    )}
  </>
);

const Flag: React.FC<{ country: "AR" | "US"; className?: string }> = ({
  country,
  className,
}) => (
  <svg
    viewBox="0 0 24 13"
    width="24"
    height="13"
    className={className}
    aria-hidden="true"
    focusable="false"
  >
    {country === "AR" ? ARGENTINA_FLAG : UNITED_STATES_FLAG}
  </svg>
);

export default Flag;
