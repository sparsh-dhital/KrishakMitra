/**
 * KrishakMitra Logo Component
 *
 * Variants:
 *  - "full"    : circular emblem + "KrishakMitra" text side by side
 *  - "emblem"  : circular emblem only (collapsed sidebar / mobile header)
 *  - "text"    : styled text logo only
 *  - "stacked" : emblem on top, text below (login page / landing hero)
 */
import emblemImg from "../assets/logo_emblem.png";
import textImg from "../assets/logo_text.png";
import textTransparentImg from "../assets/logo_text_transparent.png";

export default function Logo({ variant = "full", className = "", dark = false }) {
  const currentTextImg = dark ? textTransparentImg : textImg;
  if (variant === "emblem") {
    return (
      <img
        src={emblemImg}
        alt="KrishakMitra"
        draggable={false}
        className={`object-contain select-none ${className}`}
      />
    );
  }

  if (variant === "text") {
    return (
      <img
        src={currentTextImg}
        alt="KrishakMitra"
        draggable={false}
        className={`object-contain select-none ${className}`}
      />
    );
  }

  if (variant === "stacked") {
    return (
      <div className={`flex flex-col items-center gap-2 ${className}`}>
        <img
          src={emblemImg}
          alt="KrishakMitra emblem"
          draggable={false}
          className="h-20 w-20 object-contain select-none"
        />
        <img
          src={currentTextImg}
          alt="KrishakMitra"
          draggable={false}
          className="h-8 w-auto object-contain select-none"
        />
      </div>
    );
  }

  // "full"  emblem + text side by side
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <img
        src={emblemImg}
        alt="KrishakMitra emblem"
        draggable={false}
        className="h-10 w-10 object-contain select-none shrink-0"
      />
      <img
        src={currentTextImg}
        alt="KrishakMitra"
        draggable={false}
        className="h-7 w-auto object-contain select-none"
      />
    </div>
  );
}
