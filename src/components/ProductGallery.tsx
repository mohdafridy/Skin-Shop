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
      <SmartImage
        src={images[active]}
        alt={productName}
        label={productName}
        priority
        className="aspect-square rounded-2xl"
        sizes="(min-width: 1024px) 55vw, 100vw"
      />
      {images.length > 1 && (
        <div className="mt-4 flex gap-3">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show image ${i + 1} of ${productName}`}
              aria-pressed={active === i}
              className={`overflow-hidden rounded-xl transition ${
                active === i ? "ring-2 ring-burgundy" : "opacity-70 hover:opacity-100"
              }`}
            >
              <SmartImage
                src={src}
                alt=""
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
