/**
 * KrishakMitra Logo Component
 * Uses the official brand asset. No substitutes or altered variants.
 *
 * Variants:
 *  - "full"   : full logo with text, for desktop navbar / sidebar / login
 *  - "emblem" : crops to just the circular emblem (top ~60% of image), for mobile header
 */
import logoImg from "../assets/logo.png";

export default function Logo({ variant = "full", className = "" }) {
  if (variant === "emblem") {
    return (
      <div
        className={`overflow-hidden rounded-full ${className}`}
        style={{ aspectRatio: "1 / 1" }}
        aria-label="KrishakMitra emblem"
      >
        {/*
         * The logo PNG is ~1:1 square. The emblem circle occupies
         * roughly the top 65% of the image height. We scale the
         * image to 154% height so the circle fills the container,
         * then shift it up slightly.
         */}
        <img
          src={logoImg}
          alt="KrishakMitra"
          draggable={false}
          style={{
            width: "154%",
            height: "154%",
            marginLeft: "-27%",
            marginTop: "-4%",
            objectFit: "cover",
            objectPosition: "top center",
          }}
        />
      </div>
    );
  }

  // "full" variant — full logo, preserve proportions with mix-blend-multiply
  // on light backgrounds (the PNG has a white bg, blend removes it visually).
  return (
    <img
      src={logoImg}
      alt="KrishakMitra"
      draggable={false}
      className={`object-contain select-none ${className}`}
    />
  );
}
