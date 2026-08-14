/**
 * Per-ritual hover atmosphere, shared by ComboCard and ComboDetail — an
 * overlay/scale treatment only, layered on top of the existing approved
 * photograph. Never edits or replaces the source image.
 */
export const ritualHoverTreatment: Record<string, { overlay: string; scale: string }> = {
  moonlight: {
    // Reads as candlelight gently opening — a warm overlay that thins on hover.
    overlay: "bg-[#2a150f] opacity-[0.14] group-hover:opacity-[0.04]",
    scale: "group-hover:scale-[1.03]",
  },
  snowglow: {
    // A touch more air/brightness, never a literal snow effect.
    overlay: "bg-white opacity-0 group-hover:opacity-[0.07]",
    scale: "group-hover:scale-[1.03]",
  },
  "radiance-ritual": {
    overlay: "",
    scale: "group-hover:scale-[1.035]",
  },
};

export const defaultRitualTreatment = { overlay: "", scale: "group-hover:scale-[1.03]" };
