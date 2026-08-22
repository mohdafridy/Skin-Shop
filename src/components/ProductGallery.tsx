"use client";

import { useState } from "react";
import SmartImage from "./SmartImage";

export default function ProductGallery({
  images,
  productName,
}: {
  images: string[];
  productName: string;
}) {
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="overflow-hidden bg-sand/60">
        <SmartImage
          key={images[active]}
          src={images[active]}
          alt={productName}
          label={productName}
          priority
          className="aspect-square"
          sizes="(min-width: 1024px) 58vw, 100vw"
          imageClassName="product-photo product-photo--upper transition-transform duration-[900ms] ease-premium hover:scale-[1.018]"
        />
      </div>
      {images.length > 1 && (
        <div className="mt-4 flex gap-3">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show image ${i + 1} of ${productName}`}
              aria-pressed={active === i}
              className={`overflow-hidden border-b-2 pb-1 transition ${
                active === i ? "border-burgundy opacity-100" : "border-transparent opacity-55 hover:opacity-100"
              }`}
            >
              <SmartImage
                src={src}
                alt={`${productName} — view ${i + 1}`}
                label={`${i + 1}`}
                className="h-20 w-20"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
