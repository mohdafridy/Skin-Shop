import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Next 16 only allows re-encoding to qualities listed here (default:
    // [75] — a security allowlist, not a quality preference). Product
    // photography needs more headroom than 75 before compression artifacts
    // (banding, blockiness) become visible on glass/cream textures.
    qualities: [75, 90],
  },
};

export default nextConfig;
