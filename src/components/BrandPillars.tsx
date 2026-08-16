import type { ReactNode } from "react";
import Link from "next/link";

const pillars: {
  title: string;
  description: string;
  href: string;
  icon: ReactNode;
}[] = [
  {
    title: "Organic & Botanical",
    description: "Crafted with pure botanicals from nature.",
    href: "/shop",
    icon: (
      <path
        d="M12 21c0-9 4-14 9-16-1 7-4 12-9 16Zm0 0c0-6-3-10-7-12 1 5 3 9 7 12Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: "Cruelty-Free",
    description: "No animal testing, ever.",
    href: "/our-story",
    icon: (
      <path
        d="M12 20s-7-4.5-9.5-9C1 8 2 4.5 5.5 4 8 3.6 10 5 12 7.5 14 5 16 3.6 18.5 4 22 4.5 23 8 21.5 11 19 15.5 12 20 12 20Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: "Handcrafted in Kashmir",
    description: "Small-batch care rooted in tradition.",
    href: "/our-story",
    icon: (
      <path
        d="m3 18 6-10 4 6 2-3 6 7H3Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: "Ships Across India",
    description: "Delivered to your door, nationwide.",
    href: "/shipping",
    icon: (
      <path
        d="M3 7h11v10H3V7Zm11 3h4l3 3v4h-7v-7ZM6 20a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm11 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
];

export default function BrandPillars() {
  return (
    <div className="border-b border-gold/15 bg-sand/40 py-7 sm:py-8">
      <div className="mx-auto grid max-w-standard grid-cols-2 gap-x-6 gap-y-6 px-6 sm:px-8 lg:grid-cols-4 lg:divide-x lg:divide-gold/15">
        {pillars.map((pillar) => (
          <Link
            key={pillar.title}
            href={pillar.href}
            className="group flex items-center justify-center gap-3 text-center lg:px-6 lg:first:pl-0 lg:last:pr-0"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              className="h-6 w-6 flex-shrink-0 text-burgundy"
              aria-hidden="true"
            >
              {pillar.icon}
            </svg>
            <span className="text-sm font-medium tracking-wide text-ink transition-colors duration-[180ms] ease-premium group-hover:text-burgundy">
              {pillar.title}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
